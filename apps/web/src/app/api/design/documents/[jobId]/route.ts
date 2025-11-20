/**
 * Design Agent Documents API
 * Fetch generated design documents
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

    // Get all documents
    const { data: documents, error: docsError } = await supabase
      .from("design_outputs")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (docsError) {
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    // Organize documents by type
    const docsMap: Record<string, any> = {};
    documents.forEach((doc) => {
      docsMap[doc.document_type] = {
        fileName: doc.file_name,
        content: doc.content,
        version: doc.version,
        createdAt: doc.created_at,
      };
    });

    return NextResponse.json({
      jobId,
      status: job.status,
      documents: docsMap,
      documentCount: documents.length,
    });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
