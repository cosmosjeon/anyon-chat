/**
 * Initialize Agent Session Node
 * Creates a new multi-agent session and sets up initial state
 */

import { OrchestratorReturnType, OrchestratorState } from "../state";
import { createAgentSession } from "../utils/database";
import { v4 as uuidv4 } from "uuid";

export async function initializeSession(
  state: OrchestratorState
): Promise<OrchestratorReturnType> {
  console.log("[Orchestrator] Initializing new multi-agent session...");

  // Extract user and project info from state or generate defaults
  const userId = state.userId || "default-user";
  const projectId = state.projectId || `project-${uuidv4()}`;

  try {
    // Create session in database
    const sessionId = await createAgentSession(userId, projectId);

    console.log(`[Orchestrator] Session created: ${sessionId}`);

    return {
      sessionId,
      userId,
      projectId,
      currentAgent: "planning",
      status: "planning_onboarding",
      currentProgress: {
        agentType: "planning",
        currentPhase: "onboarding",
        phaseDescription: "Starting planning agent...",
        progressPercent: 0,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      next: "start_planning",
    };
  } catch (error) {
    console.error("[Orchestrator] Failed to initialize session:", error);

    return {
      status: "failed",
      errorMessage: `Failed to initialize session: ${error instanceof Error ? error.message : String(error)}`,
      next: "handle_error",
    };
  }
}
