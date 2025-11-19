import { StateGraph, START, END } from "@langchain/langgraph";
import { UserFlowAnnotation, UserFlowState } from "./state";
import { askOnboarding } from "./nodes/askOnboarding";
import { generateQuestion } from "./nodes/generateQuestion";
import { processAnswer } from "./nodes/processAnswer";
import { generateFinalFlow } from "./nodes/generateFinalFlow";

/**
 * User Flow Questionnaire Graph
 *
 * Flow:
 * 1. START → route_start
 * 2. Route based on state:
 *    - If no messages yet: ask_onboarding (PRD confirmation)
 *    - If waiting for answer + user message: process_answer
 *    - Otherwise: generate_question
 * 3. After process_answer: generate_question (loop until complete)
 * 4. When complete: generate_final_flow → END (generates all 3 formats)
 */

// Router for start of run
function routeOnStart(state: UserFlowState): string {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  // Onboarding phase - show PRD summary and start
  if (messages.length === 0) {
    return "ask_onboarding";
  }

  // If we're waiting for an answer and the latest message is from the user, process it
  if (state.awaitingAnswer && lastMessage?._getType() === "human") {
    return "process_answer";
  }

  // If no questions asked yet, generate first question
  if (state.currentQuestionCount === 0) {
    return "generate_question";
  }

  // Otherwise, generate next question
  return "generate_question";
}

// Router after processing answer
function routeAfterProcessAnswer(state: UserFlowState): string {
  // If we need a follow-up, go back to generate_question immediately
  if (state.needsFollowup) {
    return "generate_question";
  }

  // If complete, generate final user flow
  if (state.isComplete) {
    return "generate_final_flow";
  }

  // Otherwise, continue to next question
  return "generate_question";
}

// Router after generating question
function routeAfterGenerateQuestion(state: UserFlowState): string {
  // If complete (reached max questions or high completeness), generate final flow
  if (state.isComplete) {
    return "generate_final_flow";
  }

  // Otherwise, wait for user answer (END to pause)
  return "end";
}

// Build the graph
const builder = new StateGraph(UserFlowAnnotation)
  // Add nodes
  .addNode("route_start", async () => ({}))
  .addNode("ask_onboarding", askOnboarding)
  .addNode("generate_question", generateQuestion)
  .addNode("process_answer", processAnswer)
  .addNode("generate_final_flow", generateFinalFlow)

  // Add edges
  .addEdge(START, "route_start")

  // Route from start
  .addConditionalEdges("route_start", routeOnStart, {
    ask_onboarding: "ask_onboarding",
    process_answer: "process_answer",
    generate_question: "generate_question",
  })

  // After onboarding, continue to first question
  .addEdge("ask_onboarding", "generate_question")

  // After processing answer, decide next step
  .addConditionalEdges("process_answer", routeAfterProcessAnswer, {
    generate_question: "generate_question",
    generate_final_flow: "generate_final_flow",
  })

  // After generating question, wait or finish
  .addConditionalEdges("generate_question", routeAfterGenerateQuestion, {
    generate_final_flow: "generate_final_flow",
    end: END,
  })

  // After generating final flow, we're done
  .addEdge("generate_final_flow", END);

// Compile the graph
const graph = builder.compile();

// Export with config
export const userFlowGraph = graph.withConfig({
  runName: "userflow",
});

// Export node names for use in GraphContext
export const USER_FLOW_GRAPH_NODES = [
  "ask_onboarding",
  "generate_question",
  "process_answer",
  "generate_final_flow",
] as const;
