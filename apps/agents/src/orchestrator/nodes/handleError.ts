/**
 * Handle Error Node
 * Handles errors from any agent in the workflow
 */

import { OrchestratorReturnType, OrchestratorState } from "../state";
import { updateSessionStatus } from "../utils/database";

export async function handleError(
  state: OrchestratorState
): Promise<OrchestratorReturnType> {
  console.error(
    `[Orchestrator] Error in ${state.currentAgent} agent: ${state.errorMessage}`
  );

  try {
    // Update session status to failed
    await updateSessionStatus(state.sessionId, "failed", state.currentAgent);

    // Log error details
    console.error("[Orchestrator] Session marked as failed:", {
      sessionId: state.sessionId,
      currentAgent: state.currentAgent,
      status: state.status,
      error: state.errorMessage,
    });

    return {
      status: "failed",
      isComplete: true,
      updatedAt: new Date(),
      next: "END",
    };
  } catch (dbError) {
    console.error(
      "[Orchestrator] Failed to update error status in database:",
      dbError
    );

    // Even if database update fails, mark as complete to end the workflow
    return {
      status: "failed",
      isComplete: true,
      errorMessage: state.errorMessage,
      next: "END",
    };
  }
}
