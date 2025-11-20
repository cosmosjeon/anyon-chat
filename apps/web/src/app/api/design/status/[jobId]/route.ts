/**
 * Design Agent Status API
 * Fetch real-time progress of a Design Agent job
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const _DESIGN_AGENT_URL = process.env.DESIGN_AGENT_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = await createClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = params;

    // Verify job belongs to user
    const { data: job, error: jobError } = await supabase
      .from("design_jobs")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get latest progress
    const { data: progress } = await supabase
      .from("design_progress")
      .select("*")
      .eq("job_id", jobId)
      .order("last_updated", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      jobId: job.job_id,
      status: job.status,
      currentPhase: job.current_phase,
      phaseName: job.phase_name,
      progressPercent: job.progress_percent,
      screenCount: progress?.screen_count,
      completedScreens: progress?.completed_screens,
      estimatedTimeRemaining: progress?.estimated_time_remaining,
      lastUpdated: progress?.last_updated || job.updated_at,
      errorMessage: job.error_message,
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
