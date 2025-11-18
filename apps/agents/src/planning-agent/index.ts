import { StateGraph, START, END } from "@langchain/langgraph";
import { PRDQuestionnaireAnnotation, PRDQuestionnaireState } from "./state";
import { askOnboarding } from "./nodes/askOnboarding";
import { generateQuestion } from "./nodes/generateQuestion";
import { processAnswer } from "./nodes/processAnswer";
import { updatePRD } from "./nodes/updatePRD";
import { generateFinalPRD } from "./nodes/generateFinalPRD";

/**
 * PRD Questionnaire Graph (Dynamic Version)
 *
 * Flow:
 * 1. START → route_start
 * 2. Route based on state:
 *    - If no template selected yet: ask_onboarding
 *    - If waiting for answer + user message: process_answer
 *    - Otherwise: generate_question
 * 3. After process_answer: update_prd → generate_question (loop until complete)
 * 4. When complete: generate_final_prd → END
 */

// Router for start of run
function routeOnStart(state: PRDQuestionnaireState): string {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  // Onboarding phase - MUST complete before processing answers
  // Step 1: messages.length === 0 → ask_onboarding (ask for idea)
  // Step 2: messages.length === 2 → ask_onboarding (ask for template level)
  // Step 3: messages.length === 4 → ask_onboarding (confirm and finish onboarding)
  // IMPORTANT: Check messages.length BEFORE awaitingAnswer to avoid skipping onboarding
  if (messages.length < 5) {
    return "ask_onboarding";
  }

  // After onboarding is complete (messages.length >= 5)
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
function routeAfterProcessAnswer(state: PRDQuestionnaireState): string {
  // If we need a follow-up, go back to generate_question
  if (state.needsFollowup) {
    return "generate_question";
  }

  // If complete, generate final PRD
  if (state.isComplete) {
    return "generate_final_prd";
  }

  // Otherwise, update PRD and continue
  return "update_prd";
}

// Router after generating question
function routeAfterGenerateQuestion(state: PRDQuestionnaireState): string {
  // If complete (no more questions needed), generate final PRD
  if (state.isComplete) {
    return "generate_final_prd";
  }

  // Otherwise, wait for user answer (END to pause)
  return "end";
}

// Build the graph
const builder = new StateGraph(PRDQuestionnaireAnnotation)
  // Add nodes
  .addNode("route_start", async () => ({}))
  .addNode("ask_onboarding", askOnboarding)
  .addNode("generate_question", generateQuestion)
  .addNode("process_answer", processAnswer)
  .addNode("update_prd", updatePRD)
  .addNode("generate_final_prd", generateFinalPRD)

  // Add edges
  .addEdge(START, "route_start")

  // Route from start
  .addConditionalEdges("route_start", routeOnStart, {
    ask_onboarding: "ask_onboarding",
    process_answer: "process_answer",
    generate_question: "generate_question",
  })

  // After onboarding, wait for user input
  .addEdge("ask_onboarding", END)

  // After generating question, check if complete or wait for answer
  .addConditionalEdges("generate_question", routeAfterGenerateQuestion, {
    generate_final_prd: "generate_final_prd",
    end: END,
  })

  // After processing answer, route based on completion
  .addConditionalEdges("process_answer", routeAfterProcessAnswer, {
    generate_question: "generate_question",
    update_prd: "update_prd",
    generate_final_prd: "generate_final_prd",
  })

  // After updating PRD, generate next question
  .addEdge("update_prd", "generate_question")

  // After generating final PRD, we're done
  .addEdge("generate_final_prd", END);

// Compile the graph
export const graph = builder.compile();

// Export with config
export const prdQuestionnaireGraph = graph.withConfig({
  runName: "planning",
});
