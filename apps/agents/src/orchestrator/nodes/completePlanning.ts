/**
 * Complete Planning Node
 * Processes Planning Agent completion and prepares for Design Agent
 */

import { OrchestratorReturnType, OrchestratorState } from "../state";
import { PlanningToDesignHandoff } from "../types";
import { updateSessionStatus } from "../utils/database";

export async function completePlanning(
  state: OrchestratorState
): Promise<OrchestratorReturnType> {
  console.log("[Orchestrator] Planning Agent completed, preparing handoff...");

  // In a real implementation, we would fetch the planning results
  // from the Planning Agent's thread. For now, we'll expect it to be
  // passed in via state or fetched from database.

  // This would typically be populated by a webhook or callback from Planning Agent
  const planningHandoff: PlanningToDesignHandoff = state.planningHandoff || {
    prdContent: "", // Would be fetched from Planning Agent thread
    userFlowContent: "",
    completenessScore: 0,
    conversationContext: {},
    projectId: state.projectId!,
    userId: state.userId!,
  };

  try {
    // Update session status
    await updateSessionStatus(state.sessionId, "planning_complete", "planning");

    console.log("[Orchestrator] Planning completed, ready for design");

    return {
      status: "design_pending",
      planningHandoff,
      currentProgress: {
        agentType: "planning",
        currentPhase: "complete",
        phaseDescription: "Planning complete! Starting design...",
        progressPercent: 100,
        lastUpdated: new Date(),
      },
      updatedAt: new Date(),
      next: "trigger_design",
    };
  } catch (error) {
    console.error("[Orchestrator] Failed to complete planning:", error);

    return {
      errorMessage: `Failed to complete planning: ${error instanceof Error ? error.message : String(error)}`,
      next: "handle_error",
    };
  }
}
