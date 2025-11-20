import { StateGraph, START, END } from "@langchain/langgraph";
import { PRDQuestionnaireAnnotation, PRDQuestionnaireState } from "./state";
import { askOnboarding } from "./nodes/askOnboarding";
import { generateQuestion } from "./nodes/generateQuestion";
import { processAnswer } from "./nodes/processAnswer";
import { updatePRD } from "./nodes/updatePRD";
import { generateFinalPRD } from "./nodes/generateFinalPRD";
import { triggerDesignAgent } from "./nodes/triggerDesignAgent";

// Import User Flow nodes
import { askOnboarding as askUserFlowOnboarding } from "../userflow-agent/nodes/askOnboarding";
import { generateQuestion as generateUserFlowQuestion } from "../userflow-agent/nodes/generateQuestion";
import { processAnswer as processUserFlowAnswer } from "../userflow-agent/nodes/processAnswer";
import { generateFinalFlow } from "../userflow-agent/nodes/generateFinalFlow";

/**
 * PRD Questionnaire Graph (Dynamic Version with User Flow)
 *
 * Flow:
 * 1. START → route_start
 * 2. PRD Phase:
 *    - If no template selected yet: ask_onboarding
 *    - If waiting for answer + user message: process_answer
 *    - Otherwise: generate_question
 * 3. After process_answer: update_prd → generate_question (loop until complete)
 * 4. When PRD complete: generate_final_prd → ask_userflow_onboarding
 * 5. User Flow Phase:
 *    - ask_userflow_onboarding → generate_userflow_question
 *    - User answers → process_userflow_answer → generate_userflow_question (loop)
 *    - When complete: generate_final_flow → END
 */

// Router for start of run
function routeOnStart(state: PRDQuestionnaireState): string {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  // Check if we're in User Flow phase
  if (state.isUserFlowPhase) {
    // User Flow phase routing
    if (state.awaitingAnswer && lastMessage?._getType() === "human") {
      return "process_userflow_answer";
    }
    return "generate_userflow_question";
  }

  // PRD Phase routing
  // Onboarding phase - MUST complete before processing answers
  if (messages.length < 5) {
    return "ask_onboarding";
  }

  // After onboarding is complete
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
  // Add PRD nodes
  .addNode("route_start", async () => ({}))
  .addNode("ask_onboarding", askOnboarding)
  .addNode("generate_question", generateQuestion)
  .addNode("process_answer", processAnswer)
  .addNode("update_prd", updatePRD)
  .addNode("generate_final_prd", generateFinalPRD)
  .addNode("trigger_design_agent", triggerDesignAgent)

  // Add User Flow nodes
  .addNode("ask_userflow_onboarding", async (state: PRDQuestionnaireState) => {
    const result = await askUserFlowOnboarding(
      {
        messages: state.messages,
        prdContent: state.prdContent,
      } as any,
      {} as any
    );
    return {
      messages: result.messages || [],
      artifact: result.artifact,
      userFlowContent: result.userFlowContent,
      isUserFlowPhase: true,
      awaitingAnswer: result.awaitingAnswer ?? false,
    };
  })
  .addNode("generate_userflow_question", async (state: PRDQuestionnaireState) => {
    const result = await generateUserFlowQuestion(
      {
        messages: state.messages,
        prdContent: state.prdContent,
        userFlowContext: state.userFlowContext || {},
        currentQuestionCount: state.userFlowQuestionCount || 0,
        maxQuestions: 20,
        completenessScore: state.userFlowCompleteness || 0,
        answers: state.answers || [],
        latestDynamicQuestion: state.latestDynamicQuestion,
        needsFollowup: state.needsFollowup || false,
        customQuestionText: state.customQuestionText,
      } as any,
      {} as any
    );
    return {
      messages: result.messages || [],
      awaitingAnswer: result.awaitingAnswer ?? false,
      userFlowQuestionCount: (result as any).currentQuestionCount ?? state.userFlowQuestionCount,
      userFlowCompleteness: (result as any).completenessScore ?? state.userFlowCompleteness,
      latestDynamicQuestion: (result as any).latestDynamicQuestion,
      isComplete: result.isComplete ?? false,
    };
  })
  .addNode("process_userflow_answer", async (state: PRDQuestionnaireState) => {
    const result = await processUserFlowAnswer(
      {
        messages: state.messages,
        userFlowContext: state.userFlowContext || {},
        currentQuestionCount: state.userFlowQuestionCount || 0,
        answers: state.answers || [],
        latestDynamicQuestion: state.latestDynamicQuestion,
        artifact: state.artifact,
      } as any,
      {} as any
    );
    return {
      messages: result.messages || [],
      answers: result.answers || [],
      userFlowContext: { ...state.userFlowContext, ...(result as any).userFlowContext },
      userFlowQuestionCount: (result as any).currentQuestionCount ?? state.userFlowQuestionCount,
      userFlowCompleteness: (result as any).completenessScore ?? state.userFlowCompleteness,
      artifact: result.artifact,
      userFlowContent: result.userFlowContent,
      needsFollowup: result.needsFollowup ?? false,
      customQuestionText: result.customQuestionText,
      awaitingAnswer: result.awaitingAnswer ?? false,
    };
  })
  .addNode("generate_final_flow", async (state: PRDQuestionnaireState) => {
    const result = await generateFinalFlow(
      {
        messages: state.messages,
        prdContent: state.prdContent,
        userFlowContext: state.userFlowContext || {},
        answers: state.answers || [],
      } as any,
      {} as any
    );
    return {
      messages: result.messages || [],
      textFlow: result.textFlow,
      asciiScreens: result.asciiScreens,
      mermaidDiagram: result.mermaidDiagram,
      artifact: result.artifact,
      userFlowContent: result.userFlowContent,
      completenessScore: result.completenessScore ?? 100,
      isComplete: true,
    };
  })

  // Add edges
  .addEdge(START, "route_start")

  // Route from start
  .addConditionalEdges("route_start", routeOnStart, {
    ask_onboarding: "ask_onboarding",
    process_answer: "process_answer",
    generate_question: "generate_question",
    process_userflow_answer: "process_userflow_answer",
    generate_userflow_question: "generate_userflow_question",
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

  // User Flow edges
  // After generating final PRD, transition to User Flow
  .addEdge("generate_final_prd", "ask_userflow_onboarding")
  .addEdge("ask_userflow_onboarding", "generate_userflow_question")
  .addConditionalEdges("generate_userflow_question", (state: PRDQuestionnaireState) => {
    if (state.isComplete || state.userFlowCompleteness >= 95 || state.userFlowQuestionCount >= 20) {
      return "generate_final_flow";
    }
    return "end";
  }, {
    generate_final_flow: "generate_final_flow",
    end: END,
  })
  .addConditionalEdges("process_userflow_answer", (state: PRDQuestionnaireState) => {
    if (state.isComplete || state.userFlowCompleteness >= 95 || state.userFlowQuestionCount >= 20) {
      return "generate_final_flow";
    }
    if (state.needsFollowup) {
      return "generate_userflow_question";
    }
    return "generate_userflow_question";
  }, {
    generate_final_flow: "generate_final_flow",
    generate_userflow_question: "generate_userflow_question",
  })

  // After generating final flow, trigger Design Agent
  .addEdge("generate_final_flow", "trigger_design_agent")

  // After triggering design agent, we're done
  .addEdge("trigger_design_agent", END);

// Compile the graph
export const graph = builder.compile();

// Export with config
export const prdQuestionnaireGraph = graph.withConfig({
  runName: "planning",
});
