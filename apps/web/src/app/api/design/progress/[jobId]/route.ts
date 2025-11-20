/**
 * Design Agent Progress History API
 * Fetch progress timeline for a Design Agent job
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Get progress history
    const { data: progressHistory, error: progressError } = await supabase
      .from("design_progress")
      .select("*")
      .eq("job_id", jobId)
      .order("last_updated", { ascending: true });

    if (progressError) {
      return NextResponse.json(
        { error: "Failed to fetch progress history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobId,
      status: job.status,
      progressHistory: progressHistory.map((p) => ({
        phase: p.current_phase,
        phaseName: p.phase_name,
        description: p.phase_description,
        progressPercent: p.progress_percent,
        timestamp: p.last_updated,
      })),
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
