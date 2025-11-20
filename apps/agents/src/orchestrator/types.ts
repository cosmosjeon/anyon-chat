/**
 * Agent Orchestrator Types
 * Manages multi-agent workflow for ANYON project creation
 */

/**
 * Agent types in the system
 */
export type AgentType = "planning" | "design" | "development" | "idle";

/**
 * Session status across all agents
 */
export type SessionStatus =
  | "planning_onboarding"
  | "planning_active"
  | "planning_complete"
  | "design_pending"
  | "design_active"
  | "design_paused"  // When user is in Google AI Studio
  | "design_complete"
  | "development_pending"
  | "development_active"
  | "development_complete"
  | "completed"
  | "failed";

/**
 * Handoff data from Planning Agent to Design Agent
 */
export interface PlanningToDesignHandoff {
  prdContent: string;
  userFlowContent: string;
  completenessScore: number;
  conversationContext: Record<string, any>;
  projectId: string;
  userId: string;
}

/**
 * Handoff data from Design Agent to Development Agent
 */
export interface DesignToDevelopmentHandoff {
  designSystem: string;  // Design_System_v0.9.md
  uxFlow: string;        // UX_Flow_v0.9.md
  screenSpecs: string;   // Screen_Specifications_v0.9.md
  aiPrompts: string;     // Google_AI_Studio_Prompts_v0.9.md
  designGuidelines: string;  // Design_Guidelines_v0.9.md
  openSourceRecs: string;    // Open_Source_Recommendations_v0.9.md
  validationResults?: {
    score: number;
    checks: Record<string, any>;
  };
  projectId: string;
  userId: string;
}

/**
 * Agent progress tracking
 */
export interface AgentProgress {
  agentType: AgentType;
  currentPhase: string;
  phaseDescription: string;
  progressPercent: number;
  estimatedTimeRemaining?: number;  // in seconds
  lastUpdated: Date;
}

/**
 * Design Agent job status
 */
export interface DesignJobStatus {
  jobId: string;
  status: string;
  currentPhase: number;
  phaseName: string;
  progressPercent: number;
  screenCount?: number;
  completedScreens?: number;
  lastUpdated: Date;
  errorMessage?: string;
}

/**
 * Inter-agent communication message
 */
export interface AgentMessage {
  fromAgent: AgentType;
  toAgent: AgentType;
  messageType: "handoff" | "progress" | "error" | "complete";
  payload: any;
  timestamp: Date;
}

/**
 * Orchestrator action types
 */
export type OrchestratorAction =
  | "start_planning"
  | "complete_planning"
  | "trigger_design"
  | "monitor_design"
  | "complete_design"
  | "trigger_development"
  | "handle_error"
  | "finish";
