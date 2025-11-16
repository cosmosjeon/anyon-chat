-- ================================================================
-- ANYON 프로젝트 데이터베이스 마이그레이션
-- 작성일: 2025-01-17
-- 설명: AI 기반 PRD/사용자 시나리오 자동 생성 도구용 테이블 생성
-- ================================================================

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT, -- 'mobile', 'web', 'saas' 등
  project_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRD 문서 테이블
CREATE TABLE IF NOT EXISTS prd_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content JSONB NOT NULL, -- PRDDocument 전체 저장
  version INTEGER DEFAULT 1,
  completion_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 시나리오 테이블
CREATE TABLE IF NOT EXISTS scenario_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 대화 기록 테이블
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_number INTEGER,
  question TEXT,
  answer TEXT,
  section_mapped TEXT, -- 어느 섹션에 반영되었는지
  created_at TIMESTAMP DEFAULT NOW()
);

-- 분석 이벤트 테이블 (성공 지표 추적)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  event_type TEXT NOT NULL, -- 'question_answered', 'section_completed', 'prd_exported' 등
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 인덱스 생성
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_prd_documents_project_id ON prd_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_scenario_documents_project_id ON scenario_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_project_id ON conversation_history(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_project_id ON analytics_events(project_id);

-- ================================================================
-- RLS (Row Level Security) 정책
-- ================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 프로젝트 정책: 자신의 프로젝트만 조회/수정 가능
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- PRD 문서 정책
CREATE POLICY "Users can view PRDs of their projects"
  ON prd_documents FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert PRDs for their projects"
  ON prd_documents FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update PRDs of their projects"
  ON prd_documents FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 사용자 시나리오 정책
CREATE POLICY "Users can view scenarios of their projects"
  ON scenario_documents FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert scenarios for their projects"
  ON scenario_documents FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update scenarios of their projects"
  ON scenario_documents FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 대화 기록 정책
CREATE POLICY "Users can view conversation history of their projects"
  ON conversation_history FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert conversation history for their projects"
  ON conversation_history FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 분석 이벤트 정책
CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
