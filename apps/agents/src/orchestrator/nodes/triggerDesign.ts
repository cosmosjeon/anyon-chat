/**
 * Trigger Design Agent Node
 * Triggers the Design Agent with PRD and User Flow from Planning Agent
 */

import { OrchestratorReturnType, OrchestratorState } from "../state";
import { triggerDesignJob, checkDesignAgentHealth } from "../utils/designAgentClient";
import {
  storePlanningHandoff,
  updateSessionStatus,
  updateSessionIds,
} from "../utils/database";

export async function triggerDesign(
  state: OrchestratorState
): Promise<OrchestratorReturnType> {
  console.log("[Orchestrator] Triggering Design Agent...");

  // Validate that we have planning handoff data
  if (!state.planningHandoff) {
    console.error("[Orchestrator] No planning handoff data available");
    return {
      status: "failed",
      errorMessage: "Cannot trigger design agent: No planning data available",
      next: "handle_error",
    };
  }

  try {
    // Check Design Agent health
    const isHealthy = await checkDesignAgentHealth();
    if (!isHealthy) {
      throw new Error("Design Agent service is not available");
    }

    // Store handoff data in database
    await storePlanningHandoff(state.sessionId, state.planningHandoff);

    // Trigger Design Agent job
    const { jobId } = await triggerDesignJob(
      state.sessionId,
      state.planningHandoff
    );

    console.log(`[Orchestrator] Design job created: ${jobId}`);

    // Update session status
    await updateSessionStatus(state.sessionId, "design_active", "design");
    await updateSessionIds(state.sessionId, { design_job_id: jobId });

    return {
      designJobId: jobId,
      currentAgent: "design",
      status: "design_active",
      currentProgress: {
        agentType: "design",
        currentPhase: "extracting_screens",
        phaseDescription: "Analyzing PRD and extracting screens...",
        progressPercent: 5,
        lastUpdated: new Date(),
      },
      updatedAt: new Date(),
      next: "monitor_design",
    };
  } catch (error) {
    console.error("[Orchestrator] Failed to trigger design agent:", error);

    return {
      status: "failed",
      errorMessage: `Failed to trigger design agent: ${error instanceof Error ? error.message : String(error)}`,
      next: "handle_error",
    };
  }
}
