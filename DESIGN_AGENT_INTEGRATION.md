# Design Agent Integration Guide

This guide explains how the Design Agent is integrated with anyon-chat as part of a multi-agent workflow.

## Overview

The ANYON system uses a **multi-agent architecture** where specialized agents handle different phases:

1. **Planning Agent** (Node.js/LangGraph) - Generates PRD and User Flow
2. **Design Agent** (Python/FastAPI/LangGraph) - Creates UI designs and specifications
3. **Development Agent** (Future) - Generates code and implementation

The **Agent Orchestrator** coordinates transitions between these agents.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ANYON Frontend                         │
│              (Next.js/React/TypeScript)                   │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ REST API + WebSocket
                   │
┌──────────────────┴───────────────────────────────────────┐
│              Agent Orchestrator Service                   │
│                 (Node.js/LangGraph)                       │
│                                                           │
│  • Routes requests to appropriate agents                  │
│  • Manages inter-agent communication                      │
│  • Tracks overall session state                           │
└──────────┬───────────┬──────────────────┬────────────────┘
           │           │                  │
   ┌───────┴──────┐  ┌┴──────────────┐  ┌┴────────────┐
   │  Planning    │  │ Design Agent  │  │ Development │
   │  Agent       │  │ (Python)      │  │ Agent       │
   │  (Node.js)   │  │               │  │ (Future)    │
   │  Port: 54369 │  │ Port: 8000    │  │             │
   └──────────────┘  └───────────────┘  └─────────────┘
           │                 │                  │
           └─────────────────┴──────────────────┘
                             │
                   ┌─────────┴──────────┐
                   │ Shared PostgreSQL  │
                   │    Database        │
                   │   (Supabase)       │
                   └────────────────────┘
```

## Workflow Sequence

### Phase 1: Planning (Existing)

1. User starts a new project
2. Planning Agent asks questions
3. Generates PRD and User Flow
4. Stores in database
5. **Triggers Orchestrator completion hook**

### Phase 2: Design (New)

1. **Orchestrator receives Planning completion**
2. Stores handoff data in `agent_handoffs` table
3. **Triggers Design Agent** via HTTP POST to `http://localhost:8000/api/design/start`
4. Design Agent:
   - **Phase 1**: Extracts screens from PRD (2 min)
   - **Phase 2**: Generates layout options (3 min)
   - **Phase 3**: Creates ASCII UI mockups (8 min)
   - **Phase 4**: Builds design system (2 min)
   - **Optional Pause**: User can use Google AI Studio for visual designs
   - **Phase 5**: Validates generated code (2 min)
   - **Phase 6**: Generates 6 documentation files (3 min)
5. **Design complete** - outputs stored in `design_outputs` table
6. Orchestrator can trigger next agent (Development)

### Phase 3: Development (Future)

Will handle code generation and implementation.

## Database Schema

### Core Orchestration Tables

**`agent_sessions`**
- Tracks overall multi-agent workflow
- Links Planning, Design, and Development

**`agent_handoffs`**
- Stores data passed between agents
- Contains PRD, User Flow, Design outputs, etc.

### Design Agent Tables

**`design_jobs`**
- Main job tracking table
- Status: pending → running → completed/failed

**`design_progress`**
- Real-time progress updates
- Phase name, percentage, estimated time remaining

**`design_outputs`**
- Generated documents:
  - Design_System_v0.9.md
  - UX_Flow_v0.9.md
  - Screen_Specifications_v0.9.md
  - Google_AI_Studio_Prompts_v0.9.md
  - Design_Guidelines_v0.9.md
  - Open_Source_Recommendations_v0.9.md

**`design_decisions`**
- Audit trail of design choices
- Screen names, rationale, alternatives

**`open_source_selections`**
- Recommended libraries (React, TailwindCSS, etc.)
- GitHub stars, bundle size, license info

**`ascii_ui_versions`**
- Version history of ASCII UI mockups
- User feedback and approvals

**`design_validation_results`**
- Code quality scores
- TypeScript, Tailwind, accessibility checks

## Setup Instructions

### 1. Database Migration

Apply the database migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# SQL Editor → Run supabase/migrations/20250120_multi_agent_system.sql
```

### 2. Design Agent Deployment

#### Option A: Docker (Recommended)

```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, ANTHROPIC_API_KEY, etc.

# Start Design Agent service
docker-compose -f docker-compose.design-agent.yml up -d

# Check logs
docker logs anyon-design-agent -f

# Verify health
curl http://localhost:8000/health
```

#### Option B: Local Python (Development)

```bash
# Navigate to Design Agent directory
cd "../Design Agent"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://..."
export ANTHROPIC_API_KEY="sk-..."
export REDIS_URL="redis://localhost:6379"

# Run server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Update anyon-chat Environment

Add to `.env`:

```env
# Design Agent Integration
DESIGN_AGENT_URL=http://localhost:8000

# If using Docker
DESIGN_AGENT_URL=http://design-agent:8000
```

### 4. Verify Integration

```bash
# 1. Check Design Agent health
curl http://localhost:8000/health

# 2. Check Planning Agent
curl http://localhost:54369/ok

# 3. Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM agent_sessions;"
```

## API Endpoints

### Agent Orchestrator (Internal)

No direct REST API - used via LangGraph workflow.

### Design Agent API

**POST** `/api/design/start`
- Trigger new design job
- Body: `{ session_id, prd_content, user_flow_content, project_id, user_id }`
- Returns: `{ job_id }`

**GET** `/api/design/status/{job_id}`
- Get job status and progress
- Returns: `{ status, current_phase, progress_percent, ... }`

**GET** `/api/design/documents/{job_id}`
- Fetch generated documents
- Returns: `{ design_system, ux_flow, screen_specs, ... }`

**POST** `/api/design/feedback/{job_id}`
- Submit user feedback during design refinement
- Body: `{ screen_name, feedback }`

**POST** `/api/design/approve/{job_id}`
- Approve a screen design
- Body: `{ screen_name }`

**POST** `/api/design/cancel/{job_id}`
- Cancel running job

**GET** `/health`
- Health check endpoint

## Frontend Integration

### 1. Display Design Progress

```typescript
// components/DesignProgress.tsx
import { useQuery } from '@tanstack/react-query';

function DesignProgress({ jobId }: { jobId: string }) {
  const { data } = useQuery({
    queryKey: ['designProgress', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/design/status/${jobId}`);
      return res.json();
    },
    refetchInterval: 2000, // Poll every 2 seconds
  });

  return (
    <div>
      <div>Phase: {data?.phase_name}</div>
      <div>Progress: {data?.progress_percent}%</div>
      <ProgressBar value={data?.progress_percent} />
    </div>
  );
}
```

### 2. ASCII UI Viewer

```typescript
// components/AsciiUIViewer.tsx
function AsciiUIViewer({ screenName, asciiContent }: Props) {
  return (
    <div className="ascii-viewer">
      <h3>{screenName}</h3>
      <pre className="font-mono bg-gray-50 p-4">
        {asciiContent}
      </pre>
      <button onClick={() => approveScreen(screenName)}>
        ✅ Approve
      </button>
    </div>
  );
}
```

### 3. Document Download

```typescript
async function downloadDesignDocs(jobId: string) {
  const docs = await fetch(`/api/design/documents/${jobId}`).then(r => r.json());

  // Download as ZIP or individual files
  downloadFile('Design_System.md', docs.designSystem);
  downloadFile('UX_Flow.md', docs.uxFlow);
  // ... etc
}
```

## Code Examples

### Triggering Design from Planning Agent

```typescript
// apps/agents/src/planning-agent/nodes/generateFinalPRD.ts

import { triggerDesignPhase } from "../../orchestrator";

export async function generateFinalPRD(state: PlanningState) {
  // ... generate PRD logic ...

  // When complete, trigger design
  if (state.isComplete) {
    await triggerDesignPhase({
      sessionId: state.sessionId,
      prdContent: state.prdContent,
      userFlowContent: state.userFlowContent,
      completenessScore: state.completenessScore,
      projectId: state.projectId!,
      userId: state.userId!,
    });
  }

  return { ...state };
}
```

### Monitoring Design Progress in Frontend

```typescript
// app/api/design/progress/[jobId]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const designClient = new DesignAgentClient();
  const status = await designClient.getJobStatus(params.jobId);

  return Response.json(status);
}
```

## Troubleshooting

### Design Agent Not Starting

```bash
# Check Docker logs
docker logs anyon-design-agent

# Common issues:
# - Database connection failed → check DATABASE_URL
# - Port 8000 already in use → change port mapping
# - Missing API key → check ANTHROPIC_API_KEY
```

### Jobs Stuck in Pending

```sql
-- Check job status
SELECT job_id, status, current_phase, error_message
FROM design_jobs
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Manually update if needed
UPDATE design_jobs
SET status = 'failed', error_message = 'Timeout'
WHERE job_id = '...';
```

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL

# Check if tables exist
\dt agent_sessions
\dt design_jobs

# Check row counts
SELECT COUNT(*) FROM agent_sessions;
```

## Development Workflow

1. **Make changes to Orchestrator** (Node.js)
   - Edit files in `apps/agents/src/orchestrator/`
   - LangGraph server auto-reloads

2. **Make changes to Design Agent** (Python)
   - Edit files in `../Design Agent/src/`
   - If using Docker with volume mount, container auto-reloads
   - Otherwise: `docker restart anyon-design-agent`

3. **Test end-to-end flow**
   ```bash
   # Terminal 1: Start LangGraph
   yarn langgraphjs dev

   # Terminal 2: Start Design Agent
   docker-compose -f docker-compose.design-agent.yml up

   # Terminal 3: Start frontend
   cd apps/web && yarn dev
   ```

## Monitoring & Analytics

View system activity:

```sql
-- Active sessions
SELECT
  s.session_id,
  s.current_agent,
  s.status,
  s.created_at,
  p.project_name
FROM agent_sessions s
JOIN projects p ON s.project_id = p.id
WHERE s.status NOT IN ('completed', 'failed')
ORDER BY s.created_at DESC;

-- Design job statistics
SELECT
  status,
  COUNT(*) as count,
  AVG(progress_percent) as avg_progress,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM design_jobs
GROUP BY status;

-- Recent design outputs
SELECT
  dj.job_id,
  dj.status,
  COUNT(DISTINCT do.document_type) as doc_count,
  MAX(do.created_at) as latest_output
FROM design_jobs dj
LEFT JOIN design_outputs do ON dj.job_id = do.job_id
GROUP BY dj.job_id, dj.status
ORDER BY latest_output DESC;
```

## Next Steps

1. ✅ Agent Orchestrator structure created
2. ✅ Database migration completed
3. ✅ Docker configuration ready
4. 🔄 Integrate completion hook in Planning Agent
5. 🔄 Build frontend components
6. 🔄 Add WebSocket for real-time updates
7. 🔄 Create unified agent dashboard
8. 🔄 End-to-end testing

## References

- [Agent Orchestrator README](./apps/agents/src/orchestrator/README.md)
- [Design Agent Documentation](../Design%20Agent/README.md)
- [Database Migration](./supabase/migrations/20250120_multi_agent_system.sql)
- [Docker Compose](./docker-compose.design-agent.yml)
