import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { Answer, DynamicQuestion, QuestionOption } from "../types";
import { saveConversationHistory, trackAnalyticsEvent } from "../supabase";
import { getModelFromConfig } from "../../utils";
import { FOLLOWUP_SYSTEM_PROMPT } from "../prompts";
import { analyzeConversationContext } from "../utils/contextAnalyzer";

/**
 * Process Answer Node
 *
 * Processes user's answer and extracts PRD data dynamically
 */
export async function processAnswer(
  state: PRDQuestionnaireState,
  _config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // Verify latest message is from user
  if (!lastMessage || lastMessage._getType() !== "human") {
    throw new Error("Last message must be from human");
  }

  const userAnswer =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  // Extract the question info from customQuestionText
  let dynamicQuestion: DynamicQuestion | null = null;
  let options: QuestionOption[] | undefined;

  if (state.customQuestionText) {
    try {
      const questionData = JSON.parse(state.customQuestionText);
      dynamicQuestion = questionData.question;
      options = questionData.options;
    } catch (error) {
      console.error("Failed to parse customQuestionText:", error);
    }
  }

  // If we don't have the question data, we can't process properly
  if (!dynamicQuestion) {
    console.warn("No dynamic question found in state, skipping answer processing");
    return {
      awaitingAnswer: false,
    };
  }

  // Follow-up check for text questions
  if (
    dynamicQuestion.type === "text" &&
    needsFollowupForAnswer(userAnswer)
  ) {
    const followupText = await generateFollowupQuestion({
      question: dynamicQuestion.question,
      userAnswer,
      prdData: state.prdData,
      config: _config,
    });

    return {
      awaitingAnswer: true,
      needsFollowup: true,
      customQuestionText: JSON.stringify({
        question: dynamicQuestion,
        options,
      }),
    };
  }

  // Create answer object
  const questionId = `q${state.currentQuestionCount}_${dynamicQuestion.targetSection.replace(/\s+/g, "_")}`;
  const answer: Answer = {
    questionId,
    value: userAnswer,
    text: userAnswer,
  };

  // Extract PRD data based on target section and answer
  const prdDataUpdate = extractPRDDataDynamically(
    dynamicQuestion.targetSection,
    dynamicQuestion.question,
    userAnswer,
    options
  );

  // Update conversation context
  const updatedContext = analyzeConversationContext(
    [...state.answers, answer],
    { ...state.prdData, ...prdDataUpdate }
  );

  // Save to Supabase if projectId exists
  if (state.projectId && state.userId) {
    await saveConversationHistory(
      state.projectId,
      state.currentQuestionCount,
      dynamicQuestion.question,
      userAnswer,
      dynamicQuestion.targetSection
    );

    await trackAnalyticsEvent(
      state.userId,
      state.projectId,
      "question_answered",
      {
        questionNumber: state.currentQuestionCount,
        targetSection: dynamicQuestion.targetSection,
      }
    );
  }

  return {
    awaitingAnswer: false,
    needsFollowup: false,
    answers: [answer],
    prdData: prdDataUpdate,
    conversationContext: updatedContext,
    customQuestionText: undefined, // Clear for next question
  };
}

function needsFollowupForAnswer(answer: string): boolean {
  const normalized = answer.trim();
  if (normalized.length === 0) return true;

  // Very short answers or too few tokens often need more detail.
  if (normalized.length < 25 || normalized.split(/\s+/).length < 4) return true;

  // Common vague responses
  if (/(모르|글쎄|잘\s*모르|없음|없어|패스|pass|나중)/i.test(normalized)) return true;

  return false;
}

async function generateFollowupQuestion({
  question,
  userAnswer,
  prdData,
  config,
}: {
  question: string;
  userAnswer: string;
  prdData: PRDQuestionnaireState["prdData"];
  config: LangGraphRunnableConfig;
}): Promise<string> {
  const model = await getModelFromConfig(config, {
    temperature: 0.4,
    maxTokens: 120,
  });
  const prdContext = JSON.stringify(prdData || {}, null, 2);

  const resp = await model.invoke([
    { role: "system", content: FOLLOWUP_SYSTEM_PROMPT },
    {
      role: "user",
      content: `원래 질문: "${question}"
사용자 답변: "${userAnswer}"
PRD 데이터: ${prdContext}

위 답변을 더 구체적으로 받기 위해 한 문장으로 꼬리질문을 만들어주세요.
- 숫자/범위/사례/타겟 특징 등 구체 정보를 요구
- 공손하지만 간결하게, 질문 문장만 출력`,
    },
  ]);

  if (typeof resp.content === "string") {
    return resp.content.trim();
  }
  throw new Error("Failed to generate follow-up question");
}

/**
 * Extract structured PRD data dynamically based on target section
 */
function extractPRDDataDynamically(
  targetSection: string,
  question: string,
  answer: string,
  options?: QuestionOption[]
): Record<string, any> {
  const data: Record<string, any> = {};

  // If it's a choice question, map the option value
  let processedAnswer = answer;
  if (options && options.length > 0) {
    // User might have entered a number (1, 2, 3, 4)
    const numMatch = answer.match(/^(\d+)$/);
    if (numMatch) {
      const optionIndex = parseInt(numMatch[1]) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) {
        processedAnswer = options[optionIndex].label + " - " + options[optionIndex].description;
      }
    }
  }

  // Map to PRD fields based on target section
  switch (targetSection) {
    case "제품 개요":
      if (question.includes("제품명") || question.includes("이름")) {
        data.productName = processedAnswer;
      } else if (question.includes("한 줄") || question.includes("요약")) {
        data.productOneLine = processedAnswer;
      } else if (question.includes("비전")) {
        data.productVision = processedAnswer;
      } else if (question.includes("목표")) {
        data.productGoals = processedAnswer;
      } else if (question.includes("미션")) {
        data.productMission = processedAnswer;
      } else {
        // Default: assume it's product description
        data.productOneLine = processedAnswer;
      }
      break;

    case "문제 정의":
      if (question.includes("핵심") || question.includes("주요")) {
        data.coreProblem = processedAnswer;
      } else if (question.includes("영향") || question.includes("impact")) {
        data.problemImpact = processedAnswer.split(/,|;/).map((a) => a.trim());
      } else if (question.includes("시장") || question.includes("규모")) {
        data.marketSize = processedAnswer;
      } else {
        data.coreProblem = processedAnswer;
      }
      break;

    case "타겟 사용자":
      if (question.includes("페르소나") && question.includes("주")) {
        data.personaPrimary = processedAnswer;
      } else if (question.includes("페르소나") && question.includes("부")) {
        data.personaSecondary = processedAnswer;
      } else if (question.includes("상세") || question.includes("구체")) {
        data.targetUserDetail = processedAnswer;
      } else {
        data.targetUsers = processedAnswer.split(/,|;/).map((a) => a.trim());
      }
      break;

    case "기존 솔루션 분석":
    case "기존 해결 방법":
      if (question.includes("한계") || question.includes("문제")) {
        data.solutionLimitations = processedAnswer.split(/,|;/).map((a) => a.trim());
      } else {
        data.existingSolution = processedAnswer;
      }
      break;

    case "경쟁 분석":
      if (question.includes("경쟁사") || question.includes("competitor")) {
        data.competitors = processedAnswer.split(/,|;/).map((a) => a.trim());
      } else if (question.includes("우위") || question.includes("차별")) {
        data.competitiveAdvantage = processedAnswer;
      }
      break;

    case "핵심 가치 제안":
      if (question.includes("value proposition") || question.includes("가치 제안")) {
        data.valueProposition = processedAnswer;
      } else {
        data.coreValue = processedAnswer.split(/,|;/).map((a) => a.trim());
      }
      break;

    case "비즈니스 모델":
      if (question.includes("수익") && !question.includes("예측")) {
        data.businessModel = processedAnswer;
      } else if (question.includes("무료") || question.includes("free tier")) {
        data.freeTier = processedAnswer;
      } else if (question.includes("가격") || question.includes("pricing")) {
        data.pricing = processedAnswer;
      } else if (question.includes("전환") || question.includes("conversion")) {
        data.conversionStrategy = processedAnswer;
      } else if (question.includes("수익 예측") || question.includes("revenue")) {
        data.revenueProjection = processedAnswer;
      } else if (question.includes("LTV") || question.includes("CAC") || question.includes("단위 경제")) {
        data.unitEconomics = processedAnswer;
      } else {
        data.businessModel = processedAnswer;
      }
      break;

    case "핵심 기능":
      if (question.includes("상세") || question.includes("설명")) {
        // Try to parse as key-value pairs
        const descriptions: Record<string, string> = {};
        const lines = processedAnswer.split("\n").filter((l) => l.trim());
        lines.forEach((line) => {
          const match = line.match(/(.+?):\s*(.+)/);
          if (match) {
            descriptions[match[1].trim()] = match[2].trim();
          }
        });
        data.functionDescriptions = descriptions;
      } else if (question.includes("우선순위") || question.includes("phase")) {
        data.functionPriority = processedAnswer;
      } else if (question.includes("예외")) {
        data.exceptionHandling = processedAnswer;
      } else {
        data.coreFunctions = processedAnswer.split(/,|;/).map((a) => a.trim());
      }
      break;

    case "사용자 플로우":
      if (question.includes("온보딩") || question.includes("onboarding")) {
        data.onboarding = processedAnswer;
      } else {
        data.userFlow = processedAnswer;
      }
      break;

    case "MVP 범위":
      if (question.includes("기능") || question.includes("상세")) {
        data.mvpFeatures = processedAnswer;
      } else {
        data.mvpScope = processedAnswer;
      }
      break;

    case "성공 지표 (KPI)":
    case "성공 지표":
      if (question.includes("목표") || question.includes("수치")) {
        const targets: Record<string, string> = {};
        const metricLines = processedAnswer.split("\n").filter((l) => l.trim());
        metricLines.forEach((line) => {
          const match = line.match(/(.+?):\s*(.+)/);
          if (match) {
            targets[match[1].trim()] = match[2].trim();
          }
        });
        data.metricTargets = targets;
      } else if (question.includes("퍼널") || question.includes("funnel")) {
        data.conversionFunnel = processedAnswer;
      } else {
        data.successMetrics = processedAnswer.split(/,|;/).map((a) => a.trim());
      }
      break;

    case "출시 계획":
      if (question.includes("마일스톤") || question.includes("milestone")) {
        data.milestones = processedAnswer;
      } else if (question.includes("GTM") || question.includes("go to market") || question.includes("마케팅")) {
        data.goToMarket = processedAnswer;
      } else {
        data.launchTimeline = processedAnswer;
      }
      break;

    case "리스크 및 대응":
      if (question.includes("대응") || question.includes("mitigation")) {
        data.mitigation = processedAnswer;
      } else {
        data.risks = processedAnswer.split(/,|;/).map((a) => a.trim());
      }
      break;

    default:
      // Unknown section, store as generic field
      const fieldKey = targetSection.replace(/\s+/g, "_").toLowerCase();
      data[fieldKey] = processedAnswer;
      break;
  }

  return data;
}
