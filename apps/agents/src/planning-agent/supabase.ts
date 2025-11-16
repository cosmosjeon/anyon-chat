import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found. Database features will be disabled.");
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * 프로젝트 생성 또는 조회
 */
export async function getOrCreateProject(
  userId: string,
  projectName: string,
  projectDescription?: string
) {
  if (!supabase) return null;

  try {
    // 기존 프로젝트 조회 (최근 프로젝트)
    const { data: existingProjects, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching project:", fetchError);
      return null;
    }

    // 최근 프로젝트가 있으면 반환
    if (existingProjects && existingProjects.length > 0) {
      return existingProjects[0];
    }

    // 없으면 새로 생성
    const { data: newProject, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        project_name: projectName,
        project_description: projectDescription,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating project:", createError);
      return null;
    }

    return newProject;
  } catch (error) {
    console.error("Error in getOrCreateProject:", error);
    return null;
  }
}

/**
 * 대화 기록 저장
 */
export async function saveConversationHistory(
  projectId: string,
  questionNumber: number,
  question: string,
  answer: string,
  sectionMapped?: string
) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("conversation_history")
      .insert({
        project_id: projectId,
        question_number: questionNumber,
        question,
        answer,
        section_mapped: sectionMapped,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving conversation history:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in saveConversationHistory:", error);
    return null;
  }
}

/**
 * PRD 문서 저장/업데이트
 */
export async function savePRDDocument(
  projectId: string,
  content: any,
  completionRate: number,
  version: number = 1
) {
  if (!supabase) return null;

  try {
    // 기존 PRD 조회
    const { data: existingPRD, error: fetchError } = await supabase
      .from("prd_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching PRD:", fetchError);
    }

    if (existingPRD && existingPRD.length > 0) {
      // 기존 PRD 업데이트
      const { data, error } = await supabase
        .from("prd_documents")
        .update({
          content,
          completion_rate: completionRate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPRD[0].id)
        .select()
        .single();

      if (error) {
        console.error("Error updating PRD:", error);
        return null;
      }

      return data;
    } else {
      // 새 PRD 생성
      const { data, error } = await supabase
        .from("prd_documents")
        .insert({
          project_id: projectId,
          content,
          version,
          completion_rate: completionRate,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating PRD:", error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Error in savePRDDocument:", error);
    return null;
  }
}

/**
 * 사용자 시나리오 문서 저장
 */
export async function saveScenarioDocument(
  projectId: string,
  content: any
) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("scenario_documents")
      .insert({
        project_id: projectId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving scenario document:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in saveScenarioDocument:", error);
    return null;
  }
}

/**
 * 분석 이벤트 기록
 */
export async function trackAnalyticsEvent(
  userId: string,
  projectId: string,
  eventType: string,
  metadata?: any
) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        user_id: userId,
        project_id: projectId,
        event_type: eventType,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error tracking analytics event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in trackAnalyticsEvent:", error);
    return null;
  }
}
