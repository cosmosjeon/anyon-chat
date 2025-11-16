import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { TEMPLATE_LEVEL_OPTIONS } from "../prd-checklist";

/**
 * Ask Onboarding Node
 *
 * Presents template level options to the user and initializes the session
 */
export async function askOnboarding(
  state: PRDQuestionnaireState,
  config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  // Check if template level is already selected
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  // If last message is from user, it's their template selection
  if (lastMessage?._getType() === "human") {
    const userInput = lastMessage.content.toString().trim();

    // Try to parse as number (1, 2, or 3)
    let selectedLevel: "simple" | "standard" | "detailed" = "standard";
    let maxQuestions = 30;

    if (userInput === "1") {
      selectedLevel = "simple";
      maxQuestions = 15;
    } else if (userInput === "2") {
      selectedLevel = "standard";
      maxQuestions = 30;
    } else if (userInput === "3") {
      selectedLevel = "detailed";
      maxQuestions = 50;
    }

    // Confirmation message
    const confirmationMessage = new AIMessage({
      content: `좋습니다! ${TEMPLATE_LEVEL_OPTIONS.find(opt => opt.value === selectedLevel)?.label}로 진행하겠습니다.\n\n${maxQuestions}개 질문 내외로 PRD를 작성해드리겠습니다. 첫 질문을 시작하겠습니다! 🚀`,
    });

    return {
      messages: [confirmationMessage],
      templateLevel: selectedLevel,
      maxQuestions,
      awaitingAnswer: false,
    };
  }

  // Initial onboarding message
  const onboardingMessage = new AIMessage({
    content: `안녕하세요! 😊

저는 여러분의 제품 아이디어를 체계적인 PRD(Product Requirements Document)로 만들어드리는 AI 기획자입니다.

대화를 통해 질문을 드리고, 답변하실 때마다 오른쪽 캔버스에서 PRD가 실시간으로 완성되는 모습을 보실 수 있어요.

먼저, 얼마나 디테일하게 PRD를 작성할지 선택해주세요:

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
  });

  return {
    messages: [onboardingMessage],
    awaitingAnswer: true,
  };
}
