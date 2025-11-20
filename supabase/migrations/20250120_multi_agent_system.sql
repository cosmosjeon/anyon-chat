-- ================================================================
-- Multi-Agent System Database Migration
-- Created: 2025-01-20
-- Description: Tables for Agent Orchestrator and Design Agent integration
-- ================================================================

-- ================================================================
-- AGENT ORCHESTRATOR TABLES
-- ================================================================

-- Agent Sessions Table
-- Tracks overall multi-agent workflow sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  current_agent TEXT NOT NULL, -- 'planning' | 'design' | 'development' | 'idle'
  status TEXT NOT NULL, -- 'planning_onboarding', 'planning_active', 'design_active', etc.
  planning_thread_id TEXT,
  design_job_id TEXT,
  development_thread_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Handoffs Table
-- Stores data transferred between agents
CREATE TABLE IF NOT EXISTS agent_handoffs (
  handoff_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  from_agent TEXT NOT NULL, -- 'planning' | 'design' | 'development'
  to_agent TEXT NOT NULL,
  data JSONB NOT NULL, -- Handoff payload (PRD, designs, etc.)
  status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- ================================================================
-- DESIGN AGENT TABLES
-- ================================================================

-- Design Jobs Table
-- Main table for Design Agent jobs
CREATE TABLE IF NOT EXISTS design_jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prd_content TEXT NOT NULL,
  user_flow_content TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  current_phase INTEGER DEFAULT 0, -- 1-6
  phase_name TEXT,
  progress_percent INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Design Progress Table
-- Real-time progress tracking for Design Agent
CREATE TABLE IF NOT EXISTS design_progress (
  progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  current_phase INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  phase_description TEXT,
  progress_percent INTEGER DEFAULT 0,
  screen_count INTEGER,
  completed_screens INTEGER,
  estimated_time_remaining INTEGER, -- in seconds
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Design Outputs Table
-- Stores generated documents and artifacts
CREATE TABLE IF NOT EXISTS design_outputs (
  output_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'design_system' | 'ux_flow' | 'screen_specs' | etc.
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT DEFAULT '0.9',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Design Decisions Table
-- Audit trail of design choices
CREATE TABLE IF NOT EXISTS design_decisions (
  decision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  screen_name TEXT,
  decision_type TEXT NOT NULL, -- 'layout' | 'component' | 'library' | 'color' | etc.
  decision TEXT NOT NULL,
  rationale TEXT,
  alternatives JSONB, -- Array of alternative options considered
  created_at TIMESTAMP DEFAULT NOW()
);

-- Open Source Selections Table
-- Tracks selected open-source libraries
CREATE TABLE IF NOT EXISTS open_source_selections (
  selection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'ui_framework' | 'state_management' | 'routing' | etc.
  library_name TEXT NOT NULL,
  github_url TEXT,
  npm_url TEXT,
  stars INTEGER,
  license TEXT,
  bundle_size TEXT,
  rationale TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ASCII UI Versions Table
-- Stores ASCII UI mockup iterations
CREATE TABLE IF NOT EXISTS ascii_ui_versions (
  version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  screen_name TEXT NOT NULL,
  ascii_content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  user_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Design Validation Results Table
-- Stores code validation results
CREATE TABLE IF NOT EXISTS design_validation_results (
  validation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES design_jobs(job_id) ON DELETE CASCADE,
  screen_name TEXT NOT NULL,
  overall_score INTEGER, -- 0-100
  syntax_check JSONB,
  typescript_check JSONB,
  tailwind_check JSONB,
  design_system_check JSONB,
  accessibility_check JSONB,
  responsive_check JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- INDEXES for Performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_project_id ON agent_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);

CREATE INDEX IF NOT EXISTS idx_agent_handoffs_session_id ON agent_handoffs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_status ON agent_handoffs(status);

CREATE INDEX IF NOT EXISTS idx_design_jobs_session_id ON design_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_project_id ON design_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_user_id ON design_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_status ON design_jobs(status);

CREATE INDEX IF NOT EXISTS idx_design_progress_job_id ON design_progress(job_id);

CREATE INDEX IF NOT EXISTS idx_design_outputs_job_id ON design_outputs(job_id);
CREATE INDEX IF NOT EXISTS idx_design_outputs_document_type ON design_outputs(document_type);

CREATE INDEX IF NOT EXISTS idx_design_decisions_job_id ON design_decisions(job_id);

CREATE INDEX IF NOT EXISTS idx_open_source_selections_job_id ON open_source_selections(job_id);

CREATE INDEX IF NOT EXISTS idx_ascii_ui_versions_job_id ON ascii_ui_versions(job_id);
CREATE INDEX IF NOT EXISTS idx_ascii_ui_versions_screen_name ON ascii_ui_versions(screen_name);

CREATE INDEX IF NOT EXISTS idx_design_validation_results_job_id ON design_validation_results(job_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_source_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ascii_ui_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_validation_results ENABLE ROW LEVEL SECURITY;

-- Agent Sessions Policies
CREATE POLICY "Users can view their own agent sessions"
  ON agent_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent sessions"
  ON agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent sessions"
  ON agent_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Agent Handoffs Policies
CREATE POLICY "Users can view handoffs for their sessions"
  ON agent_handoffs FOR SELECT
  USING (session_id IN (SELECT session_id FROM agent_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert handoffs for their sessions"
  ON agent_handoffs FOR INSERT
  WITH CHECK (session_id IN (SELECT session_id FROM agent_sessions WHERE user_id = auth.uid()));

-- Design Jobs Policies
CREATE POLICY "Users can view their own design jobs"
  ON design_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own design jobs"
  ON design_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own design jobs"
  ON design_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Design Progress Policies
CREATE POLICY "Users can view progress for their design jobs"
  ON design_progress FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert progress for their design jobs"
  ON design_progress FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- Design Outputs Policies
CREATE POLICY "Users can view outputs from their design jobs"
  ON design_outputs FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert outputs for their design jobs"
  ON design_outputs FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- Design Decisions Policies
CREATE POLICY "Users can view decisions from their design jobs"
  ON design_decisions FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert decisions for their design jobs"
  ON design_decisions FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- Open Source Selections Policies
CREATE POLICY "Users can view library selections from their design jobs"
  ON open_source_selections FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert library selections for their design jobs"
  ON open_source_selections FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- ASCII UI Versions Policies
CREATE POLICY "Users can view ASCII UI versions from their design jobs"
  ON ascii_ui_versions FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert ASCII UI versions for their design jobs"
  ON ascii_ui_versions FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can update ASCII UI versions for their design jobs"
  ON ascii_ui_versions FOR UPDATE
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- Design Validation Results Policies
CREATE POLICY "Users can view validation results from their design jobs"
  ON design_validation_results FOR SELECT
  USING (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert validation results for their design jobs"
  ON design_validation_results FOR INSERT
  WITH CHECK (job_id IN (SELECT job_id FROM design_jobs WHERE user_id = auth.uid()));

-- ================================================================
-- TRIGGERS for auto-updating timestamps
-- ================================================================

-- Update agent_sessions.updated_at on change
CREATE OR REPLACE FUNCTION update_agent_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_sessions_updated_at
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_sessions_updated_at();

-- ================================================================
-- NOTIFICATION TRIGGER for Design Jobs
-- This enables PostgreSQL LISTEN/NOTIFY for real-time job updates
-- ================================================================

CREATE OR REPLACE FUNCTION notify_new_design_job()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_design_job',
    json_build_object(
      'job_id', NEW.job_id,
      'session_id', NEW.session_id,
      'user_id', NEW.user_id,
      'project_id', NEW.project_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER design_job_notification
  AFTER INSERT ON design_jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_design_job();

-- ================================================================
-- VIEWS for easier querying
-- ================================================================

-- View for active design jobs with latest progress
CREATE OR REPLACE VIEW active_design_jobs AS
SELECT
  dj.job_id,
  dj.session_id,
  dj.project_id,
  dj.user_id,
  dj.status,
  dj.current_phase,
  dj.phase_name,
  dj.progress_percent,
  dp.phase_description,
  dp.estimated_time_remaining,
  dp.last_updated,
  dj.created_at,
  dj.started_at
FROM design_jobs dj
LEFT JOIN LATERAL (
  SELECT *
  FROM design_progress
  WHERE job_id = dj.job_id
  ORDER BY last_updated DESC
  LIMIT 1
) dp ON true
WHERE dj.status IN ('pending', 'running', 'paused');

-- View for completed sessions with all outputs
CREATE OR REPLACE VIEW completed_design_sessions AS
SELECT
  dj.job_id,
  dj.session_id,
  dj.project_id,
  dj.user_id,
  dj.status,
  dj.progress_percent,
  dj.created_at,
  dj.completed_at,
  COALESCE(
    json_object_agg(
      do2.document_type,
      json_build_object(
        'file_name', do2.file_name,
        'content', do2.content,
        'version', do2.version
      )
    ) FILTER (WHERE do2.output_id IS NOT NULL),
    '{}'::json
  ) AS documents
FROM design_jobs dj
LEFT JOIN design_outputs do2 ON dj.job_id = do2.job_id
WHERE dj.status = 'completed'
GROUP BY dj.job_id, dj.session_id, dj.project_id, dj.user_id, dj.status, dj.progress_percent, dj.created_at, dj.completed_at;

-- ================================================================
-- COMMENTS for documentation
-- ================================================================

COMMENT ON TABLE agent_sessions IS 'Tracks multi-agent workflow sessions across Planning, Design, and Development agents';
COMMENT ON TABLE agent_handoffs IS 'Stores data passed between different agents in the workflow';
COMMENT ON TABLE design_jobs IS 'Main table for Design Agent jobs with status and progress tracking';
COMMENT ON TABLE design_progress IS 'Real-time progress updates for Design Agent jobs';
COMMENT ON TABLE design_outputs IS 'Generated documents and artifacts from Design Agent';
COMMENT ON TABLE design_decisions IS 'Audit trail of all design decisions made during the process';
COMMENT ON TABLE open_source_selections IS 'Selected open-source libraries recommended by the Design Agent';
COMMENT ON TABLE ascii_ui_versions IS 'Version history of ASCII UI mockups for each screen';
COMMENT ON TABLE design_validation_results IS 'Code quality validation results for generated components';
