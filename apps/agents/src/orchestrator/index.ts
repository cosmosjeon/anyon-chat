/**
 * Agent Orchestrator
 * Coordinates multi-agent workflow: Planning → Design → Development
 */

import { StateGraph, END } from "@langchain/langgraph";
import { OrchestratorAnnotation, OrchestratorState } from "./state";

// Import node functions
import { initializeSession } from "./nodes/initializeSession";
import { completePlanning } from "./nodes/completePlanning";
import { triggerDesign } from "./nodes/triggerDesign";
import { monitorDesign } from "./nodes/monitorDesign";
import { handleError } from "./nodes/handleError";

/**
 * Define the orchestrator workflow graph
 */
const workflow = new StateGraph(OrchestratorAnnotation)
  // Add nodes
  .addNode("initialize_session", initializeSession)
  .addNode("complete_planning", completePlanning)
  .addNode("trigger_design", triggerDesign)
  .addNode("monitor_design", monitorDesign)
  .addNode("handle_error", handleError);

// Set entry point
workflow.addEdge("__start__", "initialize_session");

// Add conditional edges based on 'next' field in state
workflow.addConditionalEdges(
  "initialize_session",
  (state: OrchestratorState) => state.next || "start_planning",
  {
    start_planning: "complete_planning",  // For now, jump to planning complete
    handle_error: "handle_error",
  }
);

workflow.addConditionalEdges(
  "complete_planning",
  (state: OrchestratorState) => state.next || "trigger_design",
  {
    trigger_design: "trigger_design",
    handle_error: "handle_error",
  }
);

workflow.addConditionalEdges(
  "trigger_design",
  (state: OrchestratorState) => state.next || "monitor_design",
  {
    monitor_design: "monitor_design",
    handle_error: "handle_error",
  }
);

workflow.addConditionalEdges(
  "monitor_design",
  (state: OrchestratorState) => state.next || "monitor_design",
  {
    monitor_design: "monitor_design",
    complete_design: END,
    handle_error: "handle_error",
  }
);

workflow.addEdge("handle_error", END);

// Compile the graph
export const orchestratorGraph = workflow.compile();

/**
 * Helper function to start a new multi-agent session
 */
export async function startMultiAgentSession(config: {
  userId: string;
  projectId?: string;
}) {
  const initialState = {
    userId: config.userId,
    projectId: config.projectId,
  };

  const result = await orchestratorGraph.invoke(initialState);
  return result;
}

/**
 * Helper function to trigger design after planning completes
 */
export async function triggerDesignPhase(config: {
  sessionId: string;
  prdContent: string;
  userFlowContent: string;
  completenessScore: number;
  projectId: string;
  userId: string;
}) {
  const state = {
    sessionId: config.sessionId,
    userId: config.userId,
    projectId: config.projectId,
    status: "planning_complete" as const,
    currentAgent: "planning" as const,
    planningHandoff: {
      prdContent: config.prdContent,
      userFlowContent: config.userFlowContent,
      completenessScore: config.completenessScore,
      conversationContext: {},
      projectId: config.projectId,
      userId: config.userId,
    },
    next: "trigger_design",
  };

  const result = await orchestratorGraph.invoke(state);
  return result;
}

export { OrchestratorState } from "./state";
export * from "./types";
