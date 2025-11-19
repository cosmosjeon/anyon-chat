import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { Answer, DynamicQuestion, UserFlowContext, UserFlowData } from "./types";
import { ArtifactV3 } from "@opencanvas/shared/types";

/**
 * User Flow Agent Graph State
 */
export const UserFlowAnnotation = Annotation.Root({
  /**
   * Inherit messages from MessagesAnnotation
   * This allows the graph to work with the existing open-canvas infrastructure
   */
  ...MessagesAnnotation.spec,

  /**
   * Completed PRD content from Planning Agent
   * This is the foundation for generating user flows
   */
  prdContent: Annotation<string>({
    reducer: (_, update) => update ?? "",
    default: () => "",
  }),

  /**
   * Maximum number of questions allowed for this session
   * Typically ~19 questions based on AI_USERFLOW_QA_EXAMPLE.md
   */
  maxQuestions: Annotation<number>({
    reducer: (prev, update) => update ?? prev ?? 20,
    default: () => 20,
  }),

  /**
   * Current question count (increments with each question asked)
   */
  currentQuestionCount: Annotation<number>({
    reducer: (prev, update) => update ?? prev ?? 0,
    default: () => 0,
  }),

  /**
   * User flow context extracted from previous answers
   * Used for dynamic question generation
   */
  userFlowContext: Annotation<UserFlowContext>({
    reducer: (prev, update) => {
      if (!update) return prev || {};
      return { ...(prev || {}), ...update };
    },
    default: () => ({}),
  }),

  /**
   * User flow completeness score (0-100)
   */
  completenessScore: Annotation<number>({
    reducer: (_, update) => update ?? 0,
    default: () => 0,
  }),

  /**
   * Current question being asked
   */
  currentQuestionId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "uf_q1_screen_count",
  }),

  /**
   * List of completed question IDs
   */
  completedQuestions: Annotation<string[]>({
    reducer: (prev, update) => {
      if (!update) return prev || [];
      return [...(prev || []), ...update];
    },
    default: () => [],
  }),

  /**
   * Collected answers from the user
   */
  answers: Annotation<Answer[]>({
    reducer: (prev, update) => {
      if (!update) return prev || [];
      return [...(prev || []), ...update];
    },
    default: () => [],
  }),

  /**
   * Structured user flow data extracted from answers
   */
  userFlowData: Annotation<Partial<UserFlowData>>({
    reducer: (prev, update) => {
      if (!update) return prev || {};
      return { ...(prev || {}), ...update };
    },
    default: () => ({}),
  }),

  /**
   * Current user flow markdown content (for artifact)
   * This gets updated progressively as answers are collected
   */
  userFlowContent: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * Text-based user flow scenarios
   */
  textFlow: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * ASCII screen mockups
   */
  asciiScreens: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * Mermaid flow diagram
   */
  mermaidDiagram: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * Artifact containing the user flow document
   * This is displayed in the canvas on the right side
   * Contains 3 sub-tabs: Text, ASCII, Mermaid
   */
  artifact: Annotation<ArtifactV3 | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Whether the graph is waiting for a user's answer to the last question
   */
  awaitingAnswer: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Internal flag to request a follow-up question for more detail
   */
  needsFollowup: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Optional custom question text (e.g., dynamically generated follow-up)
   */
  customQuestionText: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Recently generated dynamic question info
   */
  latestDynamicQuestion: Annotation<DynamicQuestion | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Whether the questionnaire is complete
   */
  isComplete: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Router field for conditional edges
   */
  next: Annotation<string>({
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
   * Project ID in Supabase
   */
  projectId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),
});

export type UserFlowState = typeof UserFlowAnnotation.State;

export type UserFlowReturnType = Partial<UserFlowState>;
