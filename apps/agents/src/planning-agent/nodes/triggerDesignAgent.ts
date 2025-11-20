import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { triggerDesignPhase } from "../../orchestrator";

/**
 * Trigger Design Agent Node
 *
 * Called after Planning (PRD + User Flow) is complete
 * Triggers the Design Agent via the Orchestrator
 */
export async function triggerDesignAgent(
  state: PRDQuestionnaireState,
  config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  console.log("[Planning Agent] Triggering Design Agent...");

  // Extract necessary data
  const prdContent = state.prdContent || "";
  const userFlowContent = state.userFlowContent || "";
  const completenessScore = state.completenessScore || 0;
  const projectId = state.projectId;
  const userId = state.userId;

  // Validate we have all required data
  if (!prdContent || !userFlowContent) {
    console.warn("[Planning Agent] Missing PRD or User Flow content, skipping Design Agent trigger");
    return {
      messages: [
        new AIMessage({
          content: "⚠️ PRD 또는 User Flow가 완성되지 않아 디자인 에이전트를 시작할 수 없습니다.",
        }),
      ],
    };
  }

  if (!projectId || !userId) {
    console.warn("[Planning Agent] Missing projectId or userId, skipping Design Agent trigger");
    return {
      messages: [
        new AIMessage({
          content: "⚠️ 프로젝트 정보가 없어 디자인 에이전트를 시작할 수 없습니다.",
        }),
      ],
    };
  }

  try {
    // Trigger Design Agent via Orchestrator
    const sessionId = config.configurable?.thread_id || `session-${Date.now()}`;

    const result = await triggerDesignPhase({
      sessionId,
      prdContent,
      userFlowContent,
      completenessScore,
      projectId,
      userId,
    });

    console.log(`[Planning Agent] Design Agent triggered successfully. Job ID: ${result.designJobId}`);

    // Notify user that Design Agent has started
    const designStartMessage = new AIMessage({
      content: `🎨 기획이 완료되었습니다! 이제 디자인 에이전트가 UI/UX 디자인을 시작합니다.\n\n디자인 에이전트는 다음 작업을 수행합니다:\n\n1️⃣ 화면 추출 및 분석\n2️⃣ 레이아웃 옵션 생성\n3️⃣ ASCII UI 목업 제작\n4️⃣ 디자인 시스템 구축\n5️⃣ 디자인 문서 생성 (6개)\n\n완료까지 약 30-45분이 소요됩니다. 진행 상황은 대시보드에서 확인하실 수 있습니다.`,
    });

    return {
      messages: [designStartMessage],
      // Store design job ID in state for tracking
      designJobId: result.designJobId,
    };
  } catch (error) {
    console.error("[Planning Agent] Failed to trigger Design Agent:", error);

    const errorMessage = new AIMessage({
      content: `❌ 디자인 에이전트 시작 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}\n\n수동으로 디자인 단계를 시작하거나 관리자에게 문의해주세요.`,
    });

    return {
      messages: [errorMessage],
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
