/**
 * Monitor Design Agent Node
 * Monitors the Design Agent job progress and updates state
 */

import { OrchestratorReturnType, OrchestratorState } from "../state";
import { getDesignJobStatus, getDesignDocuments } from "../utils/designAgentClient";
import { updateSessionStatus } from "../utils/database";

export async function monitorDesign(
  state: OrchestratorState
): Promise<OrchestratorReturnType> {
  console.log("[Orchestrator] Monitoring Design Agent progress...");

  if (!state.designJobId) {
    return {
      errorMessage: "No design job ID available for monitoring",
      next: "handle_error",
    };
  }

  try {
    // Get current job status from Design Agent
    const jobStatus = await getDesignJobStatus(state.designJobId);

    console.log(
      `[Orchestrator] Design job status: ${jobStatus.status}, Phase: ${jobStatus.phaseName}, Progress: ${jobStatus.progressPercent}%`
    );

    // Check if job is complete
    if (jobStatus.status === "completed") {
      console.log("[Orchestrator] Design Agent completed!");

      // Fetch generated documents
      const documents = await getDesignDocuments(state.designJobId);

      // Update session status
      await updateSessionStatus(state.sessionId, "design_complete", "design");

      return {
        status: "design_complete",
        designJobStatus: jobStatus,
        designHandoff: {
          ...documents,
          projectId: state.projectId!,
          userId: state.userId!,
        },
        currentProgress: {
          agentType: "design",
          currentPhase: "complete",
          phaseDescription: "Design complete! Documents generated.",
          progressPercent: 100,
          lastUpdated: new Date(),
        },
        updatedAt: new Date(),
        next: "complete_design",
      };
    }

    // Check if job failed
    if (jobStatus.status === "failed") {
      console.error(
        `[Orchestrator] Design job failed: ${jobStatus.errorMessage}`
      );

      return {
        status: "failed",
        errorMessage: jobStatus.errorMessage || "Design job failed",
        next: "handle_error",
      };
    }

    // Job is still in progress
    return {
      designJobStatus: jobStatus,
      currentProgress: {
        agentType: "design",
        currentPhase: jobStatus.phaseName,
        phaseDescription: getPhaseDescription(jobStatus.phaseName),
        progressPercent: jobStatus.progressPercent,
        estimatedTimeRemaining: estimateTimeRemaining(jobStatus.progressPercent),
        lastUpdated: new Date(),
      },
      updatedAt: new Date(),
      next: "monitor_design", // Continue monitoring
    };
  } catch (error) {
    console.error("[Orchestrator] Failed to monitor design job:", error);

    return {
      errorMessage: `Failed to monitor design job: ${error instanceof Error ? error.message : String(error)}`,
      next: "handle_error",
    };
  }
}

/**
 * Get human-readable phase description
 */
function getPhaseDescription(phaseName: string): string {
  const descriptions: Record<string, string> = {
    extract_screens: "Extracting screens from PRD...",
    generate_options: "Generating layout options...",
    create_ascii_ui: "Creating ASCII UI mockups...",
    refine_design: "Refining design with user feedback...",
    build_design_system: "Building design system...",
    generate_ai_prompts: "Generating AI Studio prompts...",
    validate_code: "Validating generated code...",
    generate_documents: "Generating documentation...",
    package_for_dev: "Packaging deliverables...",
  };

  return descriptions[phaseName] || `Working on ${phaseName}...`;
}

/**
 * Estimate time remaining based on progress
 */
function estimateTimeRemaining(progressPercent: number): number {
  // Rough estimate: Design Agent takes ~30-45 minutes total
  const totalEstimatedSeconds = 40 * 60; // 40 minutes
  const remaining = (100 - progressPercent) / 100;
  return Math.round(totalEstimatedSeconds * remaining);
}
