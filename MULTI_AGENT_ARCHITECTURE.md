# ANYON Multi-Agent Architecture

## System Overview

ANYON uses a **specialized multi-agent architecture** where each agent focuses on a specific phase of the product development process.

```
┌────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                     (Next.js + React)                           │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Project   │  │    Agent     │  │     Document        │  │
│  │   Setup     │  │   Dashboard  │  │     Viewer          │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└────────┬───────────────────┬────────────────────┬─────────────┘
         │                   │                    │
         │                   │                    │
┌────────┴───────────────────┴────────────────────┴─────────────┐
│                   AGENT ORCHESTRATOR                            │
│                  (LangGraph Workflow)                           │
│                                                                 │
│  Responsibilities:                                              │
│  • Session management                                           │
│  • Agent coordination                                           │
│  • State transitions                                            │
│  • Error handling                                               │
│  • Progress tracking                                            │
└─────────┬──────────────┬──────────────┬─────────────────────┘
          │              │              │
   ┌──────┴─────┐ ┌─────┴──────┐ ┌─────┴──────────┐
   │  Planning  │ │   Design   │ │  Development   │
   │   Agent    │ │   Agent    │ │     Agent      │
   │ (Node.js)  │ │  (Python)  │ │    (Future)    │
   └──────┬─────┘ └─────┬──────┘ └─────┬──────────┘
          │              │               │
          └──────────────┴───────────────┘
                         │
              ┌──────────┴──────────┐
              │  Shared PostgreSQL  │
              │      Database       │
              │     (Supabase)      │
              └─────────────────────┘
```

## Agent Workflow

### Phase 1: Planning Agent 📋

**Duration**: 10-20 minutes
**Technology**: Node.js + LangGraph
**Port**: 54369

**Responsibilities**:
1. Welcome user and explain process
2. Ask dynamic questions based on previous answers
3. Extract structured PRD data
4. Generate comprehensive PRD document
5. Create user flow diagrams
6. Calculate completeness score
7. **Trigger Design Agent** via Orchestrator

**Output**:
- PRD (Product Requirements Document)
- User Flow Document
- Completeness Score (0-100)

**State Transitions**:
```
idle → planning_onboarding → planning_active → planning_complete
```

### Phase 2: Design Agent 🎨

**Duration**: 30-45 minutes
**Technology**: Python + FastAPI + LangGraph
**Port**: 8000

**Phases**:
1. **Extract Screens** (2 min) - Parse PRD for UI screens
2. **Generate Options** (3 min) - 2-3 layout options per screen
3. **ASCII UI Creation** (8 min) - Interactive mockup refinement
4. **Design System** (2 min) - Component library definition
5. **Optional Pause** - User can use Google AI Studio
6. **Code Validation** (2 min) - Quality checks
7. **Documentation** (3 min) - Generate 6 documents

**Output Documents**:
- `Design_System_v0.9.md` - Component library, colors, typography
- `UX_Flow_v0.9.md` - Detailed user experience flows
- `Screen_Specifications_v0.9.md` - Detailed screen specs
- `Google_AI_Studio_Prompts_v0.9.md` - Prompts for visual design
- `Design_Guidelines_v0.9.md` - Design principles and rules
- `Open_Source_Recommendations_v0.9.md` - Recommended libraries

**State Transitions**:
```
design_pending → design_active → design_paused (optional) →
design_active → design_complete
```

### Phase 3: Development Agent 💻 (Future)

**Duration**: TBD
**Technology**: TBD
**Responsibilities**: Code generation and implementation

## Database Schema

### Core Tables

```sql
-- Session Management
agent_sessions          -- Overall workflow sessions
agent_handoffs          -- Data passed between agents

-- Design Agent
design_jobs             -- Job tracking
design_progress         -- Real-time progress
design_outputs          -- Generated documents
design_decisions        -- Design choice audit
open_source_selections  -- Recommended libraries
ascii_ui_versions       -- UI mockup history
design_validation_results -- Code quality scores

-- Existing (from Planning)
projects                -- Project metadata
prd_documents          -- PRD content
scenario_documents     -- User scenarios
conversation_history   -- Q&A history
```

### Key Relationships

```
user → agent_sessions → agent_handoffs
                     ↓
                 design_jobs → design_progress
                            → design_outputs (6 documents)
                            → design_decisions
                            → ascii_ui_versions
                            → open_source_selections
                            → design_validation_results
```

## Data Flow

### 1. Session Initialization

```
User creates project
    ↓
Frontend → Orchestrator.initializeSession()
    ↓
Create agent_session record
    ↓
Start Planning Agent
```

### 2. Planning → Design Handoff

```
Planning completes PRD
    ↓
Planning → Orchestrator.completePlanning()
    ↓
Store in agent_handoffs table
    ↓
Orchestrator → Design Agent HTTP POST
    ↓
Design Agent creates job in design_jobs
    ↓
PostgreSQL NOTIFY trigger fires
    ↓
Design Agent worker picks up job
```

### 3. Design Progress Updates

```
Design Agent processes job
    ↓
Updates design_progress table every 5-10s
    ↓
Frontend polls /api/design/status/{jobId}
    ↓
Display progress to user
```

### 4. Design Completion

```
Design Agent finishes Phase 6
    ↓
Insert 6 documents into design_outputs
    ↓
Update design_jobs.status = 'completed'
    ↓
Orchestrator detects completion
    ↓
Ready for Development Agent (future)
```

## API Architecture

### Planning Agent API (LangGraph)

**Base URL**: `http://localhost:54369`

```
POST /threads                    - Create new thread
POST /threads/{id}/runs/stream   - Stream agent execution
GET  /threads/{id}/state         - Get current state
```

### Design Agent API (FastAPI)

**Base URL**: `http://localhost:8000`

```
POST /api/design/start                - Trigger new job
GET  /api/design/status/{jobId}       - Get job status
GET  /api/design/documents/{jobId}    - Fetch documents
POST /api/design/feedback/{jobId}     - Submit feedback
POST /api/design/approve/{jobId}      - Approve screen
POST /api/design/cancel/{jobId}       - Cancel job
GET  /health                          - Health check
```

### Orchestrator API (Internal)

No direct HTTP API - used via LangGraph workflow invocation.

```typescript
// Programmatic usage
import { startMultiAgentSession, triggerDesignPhase } from '@opencanvas/agents/orchestrator';

const session = await startMultiAgentSession({
  userId: 'user-123',
  projectId: 'project-456'
});

const design = await triggerDesignPhase({
  sessionId: session.sessionId,
  prdContent: '...',
  userFlowContent: '...',
  completenessScore: 95,
  projectId: 'project-456',
  userId: 'user-123'
});
```

## Technology Stack

### Planning Agent
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: LangGraph.js
- **LLM**: Claude Sonnet 4.5 (Anthropic)
- **State**: PostgreSQL (via LangGraph checkpointer)

### Design Agent
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **State Machine**: LangGraph (Python)
- **LLM**: Claude Sonnet 4.5 (Anthropic)
- **Database**: PostgreSQL (asyncpg)
- **Cache**: Redis
- **Validation**: ESLint, Prettier (for generated code)

### Orchestrator
- **Language**: TypeScript
- **Framework**: LangGraph.js
- **Database**: Supabase (PostgreSQL)
- **HTTP Client**: native fetch

### Frontend
- **Framework**: Next.js 14
- **UI**: React + TailwindCSS
- **State Management**: TanStack Query
- **Real-time**: Polling / WebSocket

### Database
- **Provider**: Supabase (PostgreSQL)
- **Features**:
  - Row Level Security (RLS)
  - Real-time subscriptions
  - LISTEN/NOTIFY for events
  - Migrations via SQL files

## Deployment Architecture

### Development

```
Terminal 1: Design Agent
$ docker-compose -f docker-compose.design-agent.yml up

Terminal 2: LangGraph Server
$ yarn langgraphjs dev --port 54369

Terminal 3: Frontend
$ cd apps/web && yarn dev

Terminal 4: Redis
$ docker run -p 6379:6379 redis:alpine
```

### Production

```
┌─────────────────┐
│   Vercel/AWS    │  ← Frontend (Next.js)
└────────┬────────┘
         │
┌────────┴────────┐
│   Render/Fly    │  ← LangGraph Server
└────────┬────────┘
         │
┌────────┴────────┐
│   Docker Cloud  │  ← Design Agent (Python)
└────────┬────────┘
         │
┌────────┴────────┐
│   Supabase      │  ← PostgreSQL Database
└─────────────────┘
```

## Monitoring & Observability

### Key Metrics

**Session Metrics**:
- Active sessions count
- Session completion rate
- Average session duration
- Agent transition times

**Design Agent Metrics**:
- Job queue length
- Average job duration
- Success/failure rate
- Document generation rate

**Performance Metrics**:
- API response times
- Database query performance
- LLM token usage
- Error rates by agent

### Monitoring Queries

```sql
-- Active sessions
SELECT current_agent, COUNT(*)
FROM agent_sessions
WHERE status NOT IN ('completed', 'failed')
GROUP BY current_agent;

-- Design job statistics (last 24h)
SELECT
  status,
  COUNT(*) as jobs,
  AVG(progress_percent) as avg_progress,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_sec
FROM design_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Most common errors
SELECT
  error_message,
  COUNT(*) as occurrences
FROM design_jobs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_message
ORDER BY occurrences DESC
LIMIT 10;
```

## Security Considerations

### Authentication
- All requests must include valid auth token
- Row Level Security (RLS) enforces user data isolation
- Service role key used for backend operations

### API Security
- Rate limiting on public endpoints
- Input validation on all user inputs
- SQL injection prevention via parameterized queries
- XSS prevention via content sanitization

### Data Privacy
- User data isolated via RLS policies
- Sensitive data encrypted at rest
- API keys stored in environment variables
- No PII in logs

## Scalability

### Current Limits
- Single Design Agent instance
- Polling-based progress updates
- Synchronous job processing

### Future Improvements
- [ ] Multiple Design Agent workers
- [ ] Job queue with priorities
- [ ] WebSocket for real-time updates
- [ ] Caching layer for repeated queries
- [ ] Horizontal scaling of LangGraph servers

## Error Handling

### Agent-Level Errors
Each agent handles its own errors and reports to Orchestrator

### Orchestrator Error Handling
```typescript
try {
  await triggerDesign(state);
} catch (error) {
  return {
    status: 'failed',
    errorMessage: error.message,
    next: 'handle_error'
  };
}
```

### Database Errors
- Transaction rollbacks on failures
- Retry logic for transient errors
- Error logging to separate table

### Recovery Mechanisms
- Checkpoint-based state recovery
- Manual job restart capability
- Partial progress preservation

## Testing Strategy

### Unit Tests
- Individual node functions
- Database utilities
- API client functions

### Integration Tests
- Agent-to-agent handoffs
- Database operations
- API endpoint functionality

### End-to-End Tests
- Complete workflow (Planning → Design)
- Error scenarios
- Edge cases

### Performance Tests
- Load testing Design Agent
- Database query optimization
- Concurrent session handling

## Future Enhancements

### Short-term (1-3 months)
- [ ] WebSocket real-time updates
- [ ] Advanced error recovery
- [ ] Admin dashboard
- [ ] Analytics and insights

### Medium-term (3-6 months)
- [ ] Development Agent
- [ ] Parallel agent execution
- [ ] Agent rollback/undo
- [ ] Version control integration

### Long-term (6-12 months)
- [ ] Agent marketplace
- [ ] Custom agent creation
- [ ] Multi-project workflows
- [ ] Collaborative features

## Resources

- **Orchestrator README**: `apps/agents/src/orchestrator/README.md`
- **Integration Guide**: `DESIGN_AGENT_INTEGRATION.md`
- **Implementation Summary**: `INTEGRATION_SUMMARY.md`
- **Database Migration**: `supabase/migrations/20250120_multi_agent_system.sql`
- **Docker Compose**: `docker-compose.design-agent.yml`

---

**Last Updated**: 2025-01-20
**Version**: 1.0
**Status**: Infrastructure Complete, Integration In Progress
