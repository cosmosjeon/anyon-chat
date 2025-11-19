import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { UserFlowReturnType, UserFlowState } from "../state";
import { createEmptyUserFlowArtifact } from "../utils/templateGenerator";

/**
 * Ask Onboarding Node
 *
 * Greets user, confirms PRD, and starts user flow questionnaire
 */
export async function askOnboarding(
  state: UserFlowState,
  _config: LangGraphRunnableConfig
): Promise<UserFlowReturnType> {
  const messages = state.messages || [];
  const prdContent = state.prdContent || "";

  // If no messages yet, this is the initial greeting
  if (messages.length === 0) {
    // Extract product name from PRD if possible
    const productName = extractProductName(prdContent);

    // Extract key points from PRD
    const prdSummary = extractPRDSummary(prdContent);

    const onboardingMessage = new AIMessage({
      content: `안녕하세요! ${productName}의 PRD를 확인했습니다.

이미 파악한 정보:
${prdSummary}

이제 사용자가 어떤 화면들을 보고, 어떤 흐름으로 서비스를 이용하는지 질문하겠습니다.
각 질문마다 선택지를 드릴 테니 선택하시거나 직접 입력해주세요.

📌 답변에 따라 다음 질문이 달라질 수 있습니다.

첫 질문을 시작하겠습니다! 🚀`,
    });

    // Create empty user flow artifact
    const emptyArtifact = createEmptyUserFlowArtifact();

    const firstContent = emptyArtifact.contents[0];
    return {
      messages: [onboardingMessage],
      awaitingAnswer: false, // Will immediately move to generate_question
      artifact: emptyArtifact,
      userFlowContent: firstContent.type === "text" ? firstContent.fullMarkdown || "" : "",
    };
  }

  // If messages exist but we somehow got here, fallback
  return {
    awaitingAnswer: false,
  };
}

/**
 * Extract product name from PRD content
 */
function extractProductName(prdContent: string): string {
  // Try to find product name in various formats
  const patterns = [
    /(?:제품명|Product Name|프로젝트명):\s*\*?\*?([^\n*]+)\*?\*?/i,
    /^#\s+([^\n]+)/m, // First H1 heading
  ];

  for (const pattern of patterns) {
    const match = prdContent.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "이 제품";
}

/**
 * Extract key summary points from PRD
 */
function extractPRDSummary(prdContent: string): string {
  const summaryPoints: string[] = [];

  // Try to extract key sections
  const sections = {
    description: /(?:한 줄 요약|한줄 설명|One-liner):\s*([^\n]+)/i,
    target: /(?:타겟 사용자|Target Users?|대상 사용자):\s*([^\n]+)/i,
    features: /(?:핵심 기능|Core Features?|주요 기능):\s*([^\n]+(?:\n-[^\n]+)*)/i,
    business: /(?:비즈니스 모델|Business Model|수익 모델):\s*([^\n]+)/i,
  };

  const descMatch = prdContent.match(sections.description);
  if (descMatch) {
    summaryPoints.push(`✅ ${descMatch[1].trim()}`);
  }

  const targetMatch = prdContent.match(sections.target);
  if (targetMatch) {
    summaryPoints.push(`✅ 타겟: ${targetMatch[1].trim()}`);
  }

  const featuresMatch = prdContent.match(sections.features);
  if (featuresMatch) {
    const features = featuresMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .slice(0, 3) // Take first 3 features
      .map(line => line.replace(/^[-\d.]\s*/, '').trim())
      .join(', ');
    if (features) {
      summaryPoints.push(`✅ 핵심 기능: ${features}`);
    }
  }

  const businessMatch = prdContent.match(sections.business);
  if (businessMatch) {
    summaryPoints.push(`✅ ${businessMatch[1].trim()}`);
  }

  return summaryPoints.length > 0
    ? summaryPoints.join('\n')
    : '✅ PRD 내용을 바탕으로 진행합니다';
}
