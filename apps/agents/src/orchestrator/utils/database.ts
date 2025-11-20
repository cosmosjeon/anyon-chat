/**
 * Database utilities for Agent Orchestrator
 * Handles database interactions for session management and agent handoffs
 */

import { createClient } from "@supabase/supabase-js";
import {
  PlanningToDesignHandoff,
  SessionStatus,
} from "../types";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create a new agent session
 */
export async function createAgentSession(
  userId: string,
  projectId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("agent_sessions")
    .insert({
      user_id: userId,
      project_id: projectId,
      current_agent: "planning",
      status: "planning_onboarding",
      created_at: new Date().toISOString(),
    })
    .select("session_id")
    .single();

  if (error) {
    throw new Error(`Failed to create agent session: ${error.message}`);
  }

  return data.session_id;
}

/**
 * Update agent session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  currentAgent: string
): Promise<void> {
  const { error } = await supabase
    .from("agent_sessions")
    .update({
      status,
      current_agent: currentAgent,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`);
  }
}

/**
 * Store Planning → Design handoff data
 */
export async function storePlanningHandoff(
  sessionId: string,
  handoffData: PlanningToDesignHandoff
): Promise<string> {
  const { data, error } = await supabase
    .from("agent_handoffs")
    .insert({
      session_id: sessionId,
      from_agent: "planning",
      to_agent: "design",
      data: handoffData,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("handoff_id")
    .single();

  if (error) {
    throw new Error(`Failed to store planning handoff: ${error.message}`);
  }

  return data.handoff_id;
}

/**
 * Retrieve handoff data
 */
export async function getHandoffData(
  sessionId: string,
  fromAgent: string,
  toAgent: string
): Promise<any> {
  const { data, error } = await supabase
    .from("agent_handoffs")
    .select("data")
    .eq("session_id", sessionId)
    .eq("from_agent", fromAgent)
    .eq("to_agent", toAgent)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to get handoff data: ${error.message}`);
  }

  return data.data;
}

/**
 * Update session with thread/job IDs
 */
export async function updateSessionIds(
  sessionId: string,
  updates: {
    planning_thread_id?: string;
    design_job_id?: string;
    development_thread_id?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("agent_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(`Failed to update session IDs: ${error.message}`);
  }
}

/**
 * Get current session state
 */
export async function getSessionState(sessionId: string): Promise<any> {
  const { data, error } = await supabase
    .from("agent_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error) {
    throw new Error(`Failed to get session state: ${error.message}`);
  }

  return data;
}

/**
 * Mark handoff as complete
 */
export async function completeHandoff(
  sessionId: string,
  fromAgent: string,
  toAgent: string
): Promise<void> {
  const { error } = await supabase
    .from("agent_handoffs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("from_agent", fromAgent)
    .eq("to_agent", toAgent);

  if (error) {
    throw new Error(`Failed to complete handoff: ${error.message}`);
  }
}
