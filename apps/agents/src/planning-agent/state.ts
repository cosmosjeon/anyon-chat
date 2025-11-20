import { Annotation, MessagesAnnotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Answer, PRDData, ConversationContext, DynamicQuestion } from "./types";
import { ArtifactV3 } from "@opencanvas/shared/types";
import { TemplateLevel } from "./prd-checklist";
import { OC_SUMMARIZED_MESSAGE_KEY } from "@opencanvas/shared/constants";

/**
 * Type for messages passed to the model
 */
export type Messages =
  | Array<BaseMessage>
  | BaseMessage;

/**
 * Helper to check if a message is a summary message
 */
function isSummaryMessage(msg: unknown): boolean {
  if (typeof msg !== "object" || Array.isArray(msg) || !msg) return false;

  if (!("additional_kwargs" in msg) && !("kwargs" in msg)) return false;

  const kwargs = "additional_kwargs" in msg ? msg.additional_kwargs : (msg as any).kwargs;
  if (!kwargs || typeof kwargs !== "object") return false;

  return OC_SUMMARIZED_MESSAGE_KEY in kwargs;
}

/**
 * PRD Questionnaire Graph State
 */
export const PRDQuestionnaireAnnotation = Annotation.Root({
  /**
   * Inherit messages from MessagesAnnotation
   * This allows the graph to work with the existing open-canvas infrastructure
   */
  ...MessagesAnnotation.spec,

  /**
   * The list of messages passed to the model. Can include summarized messages,
   * and others which are NOT shown to the user.
   */
  _messages: Annotation<BaseMessage[], Messages>({
    reducer: (state, update) => {
      const latestMsg = Array.isArray(update)
        ? update[update.length - 1]
        : update;

      if (isSummaryMessage(latestMsg)) {
        // The state list has been updated by a summary message. Clear the existing state messages.
        return messagesStateReducer([], update);
      }

      return messagesStateReducer(state, update);
    },
    default: () => [],
  }),

  /**
   * Template level selected by user (simple/standard/detailed)
   */
  templateLevel: Annotation<TemplateLevel>({
    reducer: (prev, update) => update ?? prev ?? "standard",
    default: () => "standard",
  }),

  /**
   * Maximum number of questions allowed for this session
   */
  maxQuestions: Annotation<number>({
    reducer: (prev, update) => update ?? prev ?? 30,
    default: () => 30,
  }),

  /**
   * Current question count (increments with each question asked)
   */
  currentQuestionCount: Annotation<number>({
    reducer: (prev, update) => update ?? prev ?? 0,
    default: () => 0,
  }),

  /**
   * Conversation context extracted from previous answers
   * Used for dynamic question generation
   */
  conversationContext: Annotation<ConversationContext>({
    reducer: (prev, update) => {
      if (!update) return prev || {};
      return { ...(prev || {}), ...update };
    },
    default: () => ({}),
  }),

  /**
   * PRD completeness score (0-100)
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
    default: () => "q1_product_description",
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
   * Structured PRD data extracted from answers
   */
  prdData: Annotation<Partial<PRDData>>({
    reducer: (prev, update) => {
      if (!update) return prev || {};
      return { ...(prev || {}), ...update };
    },
    default: () => ({}),
  }),

  /**
   * Current PRD markdown content (for artifact)
   * This gets updated progressively as answers are collected
   */
  prdContent: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /**
   * Artifact containing the PRD document
   * This is displayed in the canvas on the right side
   */
  artifact: Annotation<ArtifactV3 | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Whether the graph is waiting for a user's answer to the last question.
   */
  awaitingAnswer: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Internal flag to request a follow-up question for more detail.
   */
  needsFollowup: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * Optional custom question text (e.g., dynamically generated follow-up).
   */
  customQuestionText: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Recently generated dynamic question info.
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

  /**
   * User Flow phase flag
   * Indicates if we've moved to user flow generation phase
   */
  isUserFlowPhase: Annotation<boolean>({
    reducer: (_, update) => update ?? false,
    default: () => false,
  }),

  /**
   * User flow context for collecting screen/flow information
   */
  userFlowContext: Annotation<Record<string, any>>({
    reducer: (prev, update) => {
      if (!update) return prev || {};
      return { ...(prev || {}), ...update };
    },
    default: () => ({}),
  }),

  /**
   * User flow question count
   */
  userFlowQuestionCount: Annotation<number>({
    reducer: (prev, update) => update ?? prev ?? 0,
    default: () => 0,
  }),

  /**
   * User flow completeness (0-100)
   */
  userFlowCompleteness: Annotation<number>({
    reducer: (_, update) => update ?? 0,
    default: () => 0,
  }),

  /**
   * User Flow content (from userflow-agent)
   */
  userFlowContent: Annotation<string>({
    reducer: (_, update) => update ?? "",
    default: () => "",
  }),

  /**
   * Design Agent job ID (after triggering design phase)
   */
  designJobId: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  /**
   * Error message if any step fails
   */
  errorMessage: Annotation<string | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),
});

export type PRDQuestionnaireState =
  typeof PRDQuestionnaireAnnotation.State;

export type PRDQuestionnaireReturnType = Partial<PRDQuestionnaireState>;
