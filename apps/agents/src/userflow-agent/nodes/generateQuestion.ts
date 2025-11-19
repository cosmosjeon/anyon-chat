import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { UserFlowReturnType, UserFlowState } from "../state";
import { DynamicQuestion } from "../types";
import { getModelFromConfig } from "../../utils";
import { GENERATE_QUESTION_PROMPT } from "../prompts";

/**
 * Generate Question Node
 *
 * Dynamically generates the next question based on:
 * - Current user flow completeness
 * - Previous answers and context
 * - Question stage (1-8)
 */
export async function generateQuestion(
  state: UserFlowState,
  config: LangGraphRunnableConfig
): Promise<UserFlowReturnType> {
  console.log("[generateQuestion] entering:", {
    currentQuestionCount: state.currentQuestionCount,
    maxQuestions: state.maxQuestions,
    awaitingAnswer: state.awaitingAnswer,
    needsFollowup: state.needsFollowup,
  });

  const {
    userFlowContext,
    answers,
    currentQuestionCount,
    maxQuestions,
    completenessScore,
    needsFollowup,
    customQuestionText,
  } = state;

  // Check if we should finish (reached max questions or high completeness)
  if (currentQuestionCount >= maxQuestions || completenessScore >= 95) {
    return {
      isComplete: true,
    };
  }

  // Determine current stage based on question count
  const stage = determineQuestionStage(currentQuestionCount);

  // Build context for AI
  const contextText = buildContextText(userFlowContext, answers);

  // Use custom question if provided (for follow-ups)
  if (needsFollowup && customQuestionText) {
    const questionMessage = new AIMessage({
      content: `💡 **꼬리 질문** (${currentQuestionCount + 1}/${maxQuestions})

${customQuestionText}`,
    });

    return {
      messages: [questionMessage],
      awaitingAnswer: true,
      currentQuestionCount: currentQuestionCount + 1,
      needsFollowup: false,
      customQuestionText: undefined,
    };
  }

  // Generate dynamic question using AI
  const model = await getModelFromConfig(config);

  const prompt = GENERATE_QUESTION_PROMPT.replace("{context}", contextText).replace(
    "{questionStage}",
    stage.description
  );

  try {
    const response = await model.invoke([
      { role: "system", content: "당신은 UX 설계 전문가입니다. 사용자 플로우를 파악하기 위한 질문을 생성합니다." },
      { role: "user", content: prompt },
    ]);

    const responseText = response.content.toString();

    // Try to parse JSON response
    let questionData: any;
    try {
      // Extract JSON from response (might be wrapped in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: use the response as-is
        questionData = {
          questionText: responseText,
          choices: [],
          isFollowUp: false,
          stage: stage.name,
        };
      }
    } catch (parseError) {
      // If parsing fails, use response text directly
      questionData = {
        questionText: responseText,
        choices: [],
        isFollowUp: false,
        stage: stage.name,
      };
    }

    // Format the question message
    const questionText = formatQuestionMessage(
      questionData,
      currentQuestionCount + 1,
      maxQuestions,
      stage.name
    );

    const questionMessage = new AIMessage({
      content: questionText,
      additional_kwargs: {
        dynamicQuestion: questionData,
      },
    });

    // Create DynamicQuestion object
    const dynamicQuestion: DynamicQuestion = {
      id: `uf_q${currentQuestionCount + 1}`,
      questionText: questionData.questionText,
      choices: questionData.choices || [],
      context: stage.name,
      isFollowUp: questionData.isFollowUp || false,
    };

    return {
      messages: [questionMessage],
      awaitingAnswer: true,
      currentQuestionCount: currentQuestionCount + 1,
      latestDynamicQuestion: dynamicQuestion,
    };
  } catch (error) {
    console.error("[generateQuestion] error generating question:", error);

    // Fallback question
    const fallbackMessage = new AIMessage({
      content: `질문 ${currentQuestionCount + 1}/${maxQuestions}

${stage.name}에 대해 설명해주세요.`,
    });

    return {
      messages: [fallbackMessage],
      awaitingAnswer: true,
      currentQuestionCount: currentQuestionCount + 1,
    };
  }
}

/**
 * Determine question stage based on count
 * Based on AI_USERFLOW_QA_EXAMPLE.md 8-stage structure
 */
function determineQuestionStage(questionCount: number): {
  name: string;
  description: string;
} {
  if (questionCount < 2) {
    return {
      name: "1단계: 전체 화면 구조",
      description: "화면 개수와 각 화면의 이름/역할을 파악합니다.",
    };
  } else if (questionCount < 5) {
    return {
      name: "2단계: 첫 실행 플로우",
      description: "스플래시, 로그인, 온보딩 등 첫 실행 시 경험을 파악합니다.",
    };
  } else if (questionCount < 8) {
    return {
      name: "3단계: 메인 화면 구성",
      description: "메인 화면의 레이아웃, 주요 버튼, UI 요소를 파악합니다.",
    };
  } else if (questionCount < 11) {
    return {
      name: "4단계: 주요 기능 화면",
      description: "핵심 기능 화면(추가/편집/상세 등)의 구성을 파악합니다.",
    };
  } else if (questionCount < 13) {
    return {
      name: "5단계: 목록 상호작용",
      description: "리스트 항목 클릭, 체크박스, 스와이프 등 상호작용을 파악합니다.",
    };
  } else if (questionCount < 16) {
    return {
      name: "6단계: 부가 기능 화면",
      description: "설정, 통계, 프로필 등 부가 화면을 파악합니다.",
    };
  } else if (questionCount < 19) {
    return {
      name: "7단계: 유료 전환 플로우",
      description: "Freemium인 경우 결제 화면과 유료 전환 흐름을 파악합니다.",
    };
  } else {
    return {
      name: "8단계: 전체 흐름 정리",
      description: "전체 사용자 여정을 확인하고 정리합니다.",
    };
  }
}

/**
 * Build context text from collected answers
 */
function buildContextText(
  context: any,
  answers: Array<{ questionText: string; answer: string }> | undefined
): string {
  const lines: string[] = [];

  // Add context info
  if (context.totalScreens) {
    lines.push(`화면 개수: ${context.totalScreens}개`);
  }

  if (context.screenList && context.screenList.length > 0) {
    lines.push(
      `화면 목록: ${context.screenList.map((s: any) => s.name).join(", ")}`
    );
  }

  if (context.mainScreenLayout) {
    lines.push(`메인 화면 레이아웃: ${context.mainScreenLayout}`);
  }

  if (context.loginMethod) {
    lines.push(`로그인 방식: ${context.loginMethod}`);
  }

  // Add recent answers (last 3)
  if (answers && answers.length > 0) {
    const recentAnswers = answers.slice(-3);
    lines.push("\n최근 답변:");
    recentAnswers.forEach((a) => {
      lines.push(`Q: ${a.questionText}`);
      lines.push(`A: ${a.answer}`);
    });
  }

  return lines.length > 0 ? lines.join("\n") : "아직 수집된 정보가 없습니다.";
}

/**
 * Format question message with choices
 */
function formatQuestionMessage(
  questionData: any,
  currentQuestion: number,
  maxQuestions: number,
  stageName: string
): string {
  const parts: string[] = [];

  // Progress header
  if (questionData.isFollowUp) {
    parts.push(`💡 **꼬리 질문** (${currentQuestion}/${maxQuestions})\n`);
  } else {
    parts.push(`**질문 ${currentQuestion}/${maxQuestions}** - ${stageName}\n`);
  }

  // Question text
  parts.push(questionData.questionText);

  // Choices (if provided)
  if (questionData.choices && questionData.choices.length > 0) {
    parts.push("\n");
    questionData.choices.forEach((choice: string) => {
      parts.push(choice);
    });
    parts.push("\nD) 직접 입력");
  }

  return parts.join("\n");
}
