import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { TEMPLATE_LEVEL_OPTIONS } from "../prd-checklist";
import { createEmptyPRDArtifact } from "../utils/templateGenerator";

/**
 * Ask Onboarding Node
 *
 * Two-step onboarding process:
 * 1. Ask user about their product idea
 * 2. Present template level options
 */
export async function askOnboarding(
  state: PRDQuestionnaireState,
  _config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  // Find the last AI message to determine current step
  const lastAIMessage = [...messages].reverse().find(m => m._getType() === "ai");
  const lastAIContent = lastAIMessage?.content.toString() || "";

  // Step 1: Initial greeting - ask for product idea
  if (messages.length === 0) {
    const initialMessage = new AIMessage({
      content: `안녕하세요! 😊

저는 여러분의 제품 아이디어를 체계적인 PRD(Product Requirements Document)로 만들어드리는 AI 기획자입니다.

대화를 통해 질문을 드리고, 답변하실 때마다 오른쪽 캔버스에서 PRD가 실시간으로 완성되는 모습을 보실 수 있어요.

**먼저, 어떤 제품 아이디어를 가지고 계신지 간단히 말씀해주세요!** 💡

예시:
- "온라인 쇼핑몰에서 사이즈 실패를 줄이는 AI 추천 서비스"
- "개발자를 위한 코드 리뷰 자동화 도구"
- "취미를 공유하는 로컬 커뮤니티 앱"`,
    });

    // Preserve the initial empty artifact (from GraphContext or create new)
    const emptyArtifact = state.artifact || createEmptyPRDArtifact('standard');

    return {
      messages: [initialMessage],
      awaitingAnswer: true,
      artifact: emptyArtifact,
    };
  }

  // Step 2: If this is the first user message OR last AI message asked for product idea
  // Handle both cases: user sent message directly on welcome screen, OR user replied to AI greeting
  if (
    lastMessage?._getType() === "human" && 
    (messages.length === 1 || lastAIContent.includes("어떤 제품 아이디어"))
  ) {
    const userIdea = lastMessage.content.toString();

    // IMPORTANT: Save the original idea to conversationContext
    // This is the user's FIRST description and should be used throughout
    const conversationContext = {
      originalIdea: userIdea,
    };

    const templateSelectionMessage = new AIMessage({
      content: `좋은 아이디어네요! 👍

"${userIdea.length > 100 ? userIdea.substring(0, 100) + '...' : userIdea}"

이제 얼마나 디테일하게 PRD를 작성할지 선택해주세요:

1️⃣ **빠르게 (10-15개 질문)**
   - 핵심만 담은 간단한 PRD
   - 빠르게 아이디어를 정리하고 싶을 때

2️⃣ **표준 (20-30개 질문)** ⭐ 추천
   - 실무용 완전한 PRD
   - 비즈니스 모델, 성공 지표 포함

3️⃣ **디테일하게 (40-50개 질문)**
   - 투자 제안용 완벽한 PRD
   - 경쟁 분석, 리스크 대응까지 포함

숫자를 입력해주세요 (1, 2, 3):`,
      additional_kwargs: {
        dynamicQuestion: {
          question: {
            question: "템플릿 레벨을 선택해주세요 (1, 2, 3)",
            type: "single_choice",
            targetSection: "온보딩",
            rationale: "템플릿 레벨 선택",
          },
          options: [
            { label: "1", value: "simple", description: "빠르게 (10-15개 질문)" },
            { label: "2", value: "standard", description: "표준 (20-30개 질문)" },
            { label: "3", value: "detailed", description: "디테일하게 (40-50개 질문)" },
          ],
        },
      },
    });

    // Preserve the artifact through Step 2 as well
    const currentArtifact = state.artifact || createEmptyPRDArtifact('standard');

    return {
      messages: [templateSelectionMessage],
      awaitingAnswer: true,
      conversationContext, // Save original idea
      artifact: currentArtifact,
      customQuestionText: JSON.stringify({
        question: {
          question: "템플릿 레벨을 선택해주세요 (1, 2, 3)",
          type: "single_choice",
          targetSection: "온보딩",
          rationale: "템플릿 레벨 선택",
        },
        options: [
          { label: "1", value: "simple", description: "빠르게 (10-15개 질문)" },
          { label: "2", value: "standard", description: "표준 (20-30개 질문)" },
          { label: "3", value: "detailed", description: "디테일하게 (40-50개 질문)" },
        ],
      }),
      latestDynamicQuestion: {
        question: "템플릿 레벨을 선택해주세요 (1, 2, 3)",
        type: "single_choice",
        targetSection: "온보딩",
        rationale: "템플릿 레벨 선택",
      },
    };
  }

  // Step 3: If last AI message asked for template level, process the selection
  if (lastMessage?._getType() === "human" && lastAIContent.includes("얼마나 디테일하게")) {
    const userInput = lastMessage.content.toString().trim().toLowerCase();

    console.log("[askOnboarding] received template selection:", {
      currentQuestionCount: state.currentQuestionCount,
      templateLevel: state.templateLevel,
      userInput,
    });

    // Parse template selection
    let selectedLevel: "simple" | "standard" | "detailed" = "standard";
    let maxQuestions = 30;

    const numericMatch = userInput.match(/(\d+)/);
    const numericValue = numericMatch ? parseInt(numericMatch[1], 10) : undefined;
    const isExplicitQuestionCount =
      numericValue !== undefined && !["1", "2", "3"].includes(userInput);

    if (isExplicitQuestionCount) {
      const clampedValue = Math.max(5, Math.min(numericValue ?? 10, 60));
      if (clampedValue <= 15) {
        selectedLevel = "simple";
        maxQuestions = clampedValue;
      } else if (clampedValue <= 30) {
        selectedLevel = "standard";
        maxQuestions = clampedValue;
      } else {
        selectedLevel = "detailed";
        maxQuestions = clampedValue;
      }
    } else if (userInput === "1" || userInput.includes("빠르게") || userInput.includes("간단")) {
      selectedLevel = "simple";
      maxQuestions = 15;
    } else if (userInput === "2" || userInput.includes("표준") || userInput.includes("standard")) {
      selectedLevel = "standard";
      maxQuestions = 30;
    } else if (userInput === "3" || userInput.includes("디테일") || userInput.includes("detailed") || userInput.includes("완벽")) {
      selectedLevel = "detailed";
      maxQuestions = 50;
    }

    // Confirmation message
    const confirmationMessage = new AIMessage({
      content: `좋습니다! ${TEMPLATE_LEVEL_OPTIONS.find(opt => opt.value === selectedLevel)?.label}로 진행하겠습니다.

${maxQuestions}개 질문 내외로 PRD를 작성해드리겠습니다. 첫 질문을 시작하겠습니다! 🚀`,
    });

    // Create empty PRD artifact with selected template level
    const emptyArtifact = createEmptyPRDArtifact(selectedLevel);

    const result = {
      messages: [confirmationMessage],
      templateLevel: selectedLevel,
      maxQuestions,
      awaitingAnswer: false,
      artifact: emptyArtifact,
    };

    console.log("[askOnboarding] template confirmed - RETURNING:", {
      selectedLevel,
      maxQuestions,
      result,
    });

    return result;
  }

  // Fallback: if we don't know what step we're on, start from the beginning
  const initialMessage = new AIMessage({
    content: `안녕하세요! 😊

저는 여러분의 제품 아이디어를 체계적인 PRD(Product Requirements Document)로 만들어드리는 AI 기획자입니다.

대화를 통해 질문을 드리고, 답변하실 때마다 오른쪽 캔버스에서 PRD가 실시간으로 완성되는 모습을 보실 수 있어요.

**먼저, 어떤 제품 아이디어를 가지고 계신지 간단히 말씀해주세요!** 💡

예시:
- "온라인 쇼핑몰에서 사이즈 실패를 줄이는 AI 추천 서비스"
- "개발자를 위한 코드 리뷰 자동화 도구"
- "취미를 공유하는 로컬 커뮤니티 앱"`,
  });

  return {
    messages: [initialMessage],
    awaitingAnswer: true,
  };
}
