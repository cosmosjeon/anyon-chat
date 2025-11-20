import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import {
  AgentType,
  SessionStatus,
  AgentProgress,
  PlanningToDesignHandoff,
  DesignToDevelopmentHandoff,
  DesignJobStatus,
} from "./types";

/**
 * Agent Orchestrator State
 * Manages the overall state across all agents in the ANYON workflow
 */
export const OrchestratorAnnotation = Annotation.Root({
  /**
   * Inherit messages for compatibility
   */
  ...MessagesAnnotation.spec,

  /**
   * Unique session identifier
   */
  sessionId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * User ID from authentication
   */
  userId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Project ID in database
   */
  projectId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Currently active agent
   */
  currentAgent: Annotation<AgentType>({
    reducer: (_, update) => update ?? "idle",
    default: () => "idle",
  }),

  /**
   * Overall session status
   */
  status: Annotation<SessionStatus>({
    reducer: (_, update) => update ?? "planning_onboarding",
    default: () => "planning_onboarding",
  }),

  /**
   * Planning Agent thread ID
   */
  planningThreadId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Design Agent job ID
   */
  designJobId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Development Agent thread ID
   */
  developmentThreadId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Handoff data from Planning to Design
   */
  planningHandoff: Annotation<PlanningToDesignHandoff | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Handoff data from Design to Development
   */
  designHandoff: Annotation<DesignToDevelopmentHandoff | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Current progress information
   */
  currentProgress: Annotation<AgentProgress | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Design Agent job status (when design is active)
   */
  designJobStatus: Annotation<DesignJobStatus | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Error message if any agent fails
   */
  errorMessage: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Whether the entire workflow is complete
   */
  isComplete: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Router field for conditional edges
   */
  next: Annotation<string>({
    reducer: (_, update) => update ?? "",
    default: () => "",
  }),

  /**
   * Created timestamp
   */
  createdAt: Annotation<Date>({
    reducer: (prev, update) => update ?? prev ?? new Date(),
    default: () => new Date(),
  }),

  /**
   * Last updated timestamp
   */
  updatedAt: Annotation<Date>({
    reducer: (_, update) => update ?? new Date(),
    default: () => new Date(),
  }),
});

export type OrchestratorState = typeof OrchestratorAnnotation.State;
export type OrchestratorReturnType = Partial<OrchestratorState>;
