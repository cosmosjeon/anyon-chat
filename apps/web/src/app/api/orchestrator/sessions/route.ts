/**
 * Orchestrator Sessions API
 * Create and manage multi-agent sessions
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const _DESIGN_AGENT_URL = process.env.DESIGN_AGENT_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Create agent session
    const { data: session, error } = await supabase
      .from("agent_sessions")
      .insert({
        user_id: user.id,
        project_id: projectId,
        current_agent: "planning",
        status: "planning_onboarding",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create agent session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.session_id,
      status: session.status,
      currentAgent: session.current_agent,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sessionId from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      // Return all sessions for user
      const { data: sessions, error } = await supabase
        .from("agent_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch sessions" },
          { status: 500 }
        );
      }

      return NextResponse.json({ sessions });
    }

    // Get specific session
    const { data: session, error } = await supabase
      .from("agent_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
