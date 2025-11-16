import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { DynamicQuestion, QuestionOption } from "../types";
import { getModelFromConfig } from "../../utils";
import {
  DYNAMIC_QUESTION_GENERATION_PROMPT,
  OPTION_GENERATION_PROMPT,
  formatOptions,
} from "../prompts";
import {
  analyzeConversationContext,
  getMindsetDescription,
} from "../utils/contextAnalyzer";
import {
  checkCompleteness,
  isCompleteEnough,
  getMissingHighPriorityFields,
} from "../utils/completenessChecker";
import {
  getCurrentPhase,
  getPhaseStrategy,
  getPhaseFocusAreas,
  getRemainingQuestions,
  getProgressPercentage,
} from "../utils/phaseManager";

/**
 * Generate Question Node
 *
 * Dynamically generates the next question based on:
 * - Current PRD completeness
 * - Conversation context
 * - Question budget
 * - Current phase
 */
export async function generateQuestion(
  state: PRDQuestionnaireState,
  config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  const {
    prdData,
    answers,
    templateLevel,
    maxQuestions,
    currentQuestionCount,
    conversationContext,
  } = state;

  // Check if we should finish
  const completenessReport = checkCompleteness(prdData, templateLevel);
  const shouldFinish = isCompleteEnough(
    completenessReport,
    currentQuestionCount,
    maxQuestions
  );

  if (shouldFinish) {
    return {
      isComplete: true,
    };
  }

  // Update conversation context
  const updatedContext = analyzeConversationContext(answers, prdData);

  // Get current phase info
  const phase = getCurrentPhase(currentQuestionCount, maxQuestions);
  const phaseStrategy = getPhaseStrategy(phase);
  const focusAreas = getPhaseFocusAreas(phase);
  const remaining = getRemainingQuestions(currentQuestionCount, maxQuestions);
  const progress = getProgressPercentage(currentQuestionCount, maxQuestions);

  // Get missing fields
  const criticalGaps = getMissingHighPriorityFields(prdData, templateLevel);

  // Format section scores for prompt
  const sectionScoresText = completenessReport.sections
    .map((s) => `- ${s.name}: ${s.score}%`)
    .join("\n");

  const criticalGapsText =
    criticalGaps.length > 0
      ? criticalGaps.map((g) => `- ${g.section}: ${g.hint}`).join("\n")
      : "없음 (모든 high priority 필드 채워짐)";

  const conversationContextText = updatedContext.product
    ? `**제품**: ${updatedContext.product}\n` +
      `**문제**: ${updatedContext.problem || "미정의"}\n` +
      `**타겟**: ${updatedContext.target || "미정의"}\n` +
      `**핵심 가치**: ${updatedContext.values?.join(", ") || "미정의"}`
    : "아직 수집된 정보가 없습니다. 제품 개요부터 시작하세요.";

  const userMindset = updatedContext.userMindset || "balanced";
  const mindsetDescription = getMindsetDescription(userMindset);

  // Prepare prompt for question generation
  const questionPrompt = DYNAMIC_QUESTION_GENERATION_PROMPT.replace(
    "{currentQuestion}",
    currentQuestionCount.toString()
  )
    .replace("{maxQuestions}", maxQuestions.toString())
    .replace("{progress}", progress.toString())
    .replace("{remaining}", remaining.toString())
    .replace("{phase}", phase)
    .replace("{phaseStrategy}", phaseStrategy)
    .replace("{focusAreas}", focusAreas.join(", "))
    .replace("{completenessScore}", completenessReport.overallScore.toString())
    .replace("{sectionScores}", sectionScoresText)
    .replace("{criticalGaps}", criticalGapsText)
    .replace("{conversationContext}", conversationContextText)
    .replace("{userMindset}", userMindset)
    .replace("{mindsetDescription}", mindsetDescription);

  // Generate question using AI
  const model = await getModelFromConfig(config);

  const questionResponse = await model.invoke([
    {
      role: "system",
      content:
        "당신은 전문 제품 기획자입니다. 다음 질문을 JSON 형식으로만 출력하세요. 추가 설명은 하지 마세요.",
    },
    {
      role: "user",
      content: questionPrompt,
    },
  ]);

  // Parse question response
  let dynamicQuestion: DynamicQuestion;
  try {
    const questionContent =
      typeof questionResponse.content === "string"
        ? questionResponse.content
        : JSON.stringify(questionResponse.content);

    // Extract JSON from markdown code blocks if present
    const jsonMatch = questionContent.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : questionContent;

    dynamicQuestion = JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse question response:", error);
    // Fallback to a default question
    dynamicQuestion = {
      question: "제품의 핵심 가치는 무엇인가요?",
      type: "text",
      targetSection: "핵심 가치 제안",
      rationale: "Fallback question due to parsing error",
    };
  }

  // Generate options if it's a choice question
  let options: QuestionOption[] | undefined;

  if (
    dynamicQuestion.type === "single_choice" ||
    dynamicQuestion.type === "multiple_choice"
  ) {
    const optionPrompt = OPTION_GENERATION_PROMPT.replace(
      "{question}",
      dynamicQuestion.question
    )
      .replace("{targetSection}", dynamicQuestion.targetSection)
      .replace("{conversationContext}", conversationContextText)
      .replace("{userMindset}", userMindset)
      .replace("{mindsetDescription}", mindsetDescription);

    const optionResponse = await model.invoke([
      {
        role: "system",
        content:
          "당신은 전문 제품 기획자입니다. 선택지를 JSON 배열 형식으로만 출력하세요. 추가 설명은 하지 마세요.",
      },
      {
        role: "user",
        content: optionPrompt,
      },
    ]);

    // Parse options response
    try {
      const optionContent =
        typeof optionResponse.content === "string"
          ? optionResponse.content
          : JSON.stringify(optionResponse.content);

      // Extract JSON from markdown code blocks if present
      const jsonMatch = optionContent.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : optionContent;

      options = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse options response:", error);
      // Fallback to default options
      options = [
        { label: "네", value: "yes", description: "진행합니다" },
        { label: "아니오", value: "no", description: "다른 방향으로" },
      ];
    }
  }

  // Format question message
  let questionText = `**질문 ${currentQuestionCount + 1}/${maxQuestions}** (진행률: ${progress}%)\n\n${dynamicQuestion.question}`;

  if (options && options.length > 0) {
    questionText += "\n\n" + formatOptions(options);
  }

  const questionMessage = new AIMessage({
    content: questionText,
  });

  return {
    messages: [questionMessage],
    currentQuestionCount: currentQuestionCount + 1,
    conversationContext: updatedContext,
    completenessScore: completenessReport.overallScore,
    awaitingAnswer: true,
    // Store generated question and options in customQuestionText for processAnswer to use
    customQuestionText: JSON.stringify({
      question: dynamicQuestion,
      options,
    }),
  };
}
