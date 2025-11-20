/**
 * Design Agent Client
 * Communicates with the Python-based Design Agent service
 */

import { PlanningToDesignHandoff, DesignJobStatus } from "../types";

const DESIGN_AGENT_BASE_URL =
  process.env.DESIGN_AGENT_URL || "http://localhost:8000";

/**
 * Trigger a new Design Agent job
 */
export async function triggerDesignJob(
  sessionId: string,
  handoffData: PlanningToDesignHandoff
): Promise<{ jobId: string }> {
  const response = await fetch(`${DESIGN_AGENT_BASE_URL}/api/design/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      prd_content: handoffData.prdContent,
      user_flow_content: handoffData.userFlowContent,
      project_id: handoffData.projectId,
      user_id: handoffData.userId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to trigger design job: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  return { jobId: data.job_id };
}

/**
 * Get Design Agent job status
 */
export async function getDesignJobStatus(
  jobId: string
): Promise<DesignJobStatus> {
  const response = await fetch(
    `${DESIGN_AGENT_BASE_URL}/api/design/status/${jobId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get design job status: ${response.status}`);
  }

  const data = await response.json();

  return {
    jobId: data.job_id,
    status: data.status,
    currentPhase: data.current_phase || 0,
    phaseName: data.phase_name || "",
    progressPercent: data.progress_percent || 0,
    screenCount: data.screen_count,
    completedScreens: data.completed_screens,
    lastUpdated: new Date(data.last_updated),
    errorMessage: data.error_message,
  };
}

/**
 * Get Design Agent output documents
 */
export async function getDesignDocuments(jobId: string): Promise<{
  designSystem: string;
  uxFlow: string;
  screenSpecs: string;
  aiPrompts: string;
  designGuidelines: string;
  openSourceRecs: string;
}> {
  const response = await fetch(
    `${DESIGN_AGENT_BASE_URL}/api/design/documents/${jobId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get design documents: ${response.status}`);
  }

  const data = await response.json();

  return {
    designSystem: data.design_system || "",
    uxFlow: data.ux_flow || "",
    screenSpecs: data.screen_specs || "",
    aiPrompts: data.ai_prompts || "",
    designGuidelines: data.design_guidelines || "",
    openSourceRecs: data.open_source_recs || "",
  };
}

/**
 * Cancel a Design Agent job
 */
export async function cancelDesignJob(jobId: string): Promise<void> {
  const response = await fetch(
    `${DESIGN_AGENT_BASE_URL}/api/design/cancel/${jobId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to cancel design job: ${response.status}`);
  }
}

/**
 * Check if Design Agent service is available
 */
export async function checkDesignAgentHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${DESIGN_AGENT_BASE_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Design Agent health check failed:", error);
    return false;
  }
}

/**
 * Submit user feedback during design refinement
 */
export async function submitDesignFeedback(
  jobId: string,
  screenName: string,
  feedback: string
): Promise<void> {
  const response = await fetch(
    `${DESIGN_AGENT_BASE_URL}/api/design/feedback/${jobId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        screen_name: screenName,
        feedback,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to submit feedback: ${response.status}`);
  }
}

/**
 * Approve a screen design
 */
export async function approveScreenDesign(
  jobId: string,
  screenName: string
): Promise<void> {
  const response = await fetch(
    `${DESIGN_AGENT_BASE_URL}/api/design/approve/${jobId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        screen_name: screenName,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to approve screen: ${response.status}`);
  }
}
