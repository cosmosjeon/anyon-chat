# Agent Orchestrator

The Agent Orchestrator coordinates the multi-agent workflow in ANYON, managing transitions between Planning, Design, and Development agents.

## Architecture

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orchestrator   │ ◄─── You are here
│  (LangGraph)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│Planning │ │ Design Agent │
│ Agent   │ │  (Python)    │
│(Node.js)│ │              │
└─────────┘ └──────────────┘
```

## Workflow States

The orchestrator manages sessions through these states:

1. **planning_onboarding** - Starting planning agent
2. **planning_active** - Planning agent is running
3. **planning_complete** - Planning finished, ready for design
4. **design_pending** - Waiting to trigger design
5. **design_active** - Design agent is running
6. **design_paused** - User is in Google AI Studio
7. **design_complete** - Design finished
8. **development_pending** - Ready for development (future)
9. **completed** - All agents complete
10. **failed** - Error occurred

## Key Components

### State (`state.ts`)

The orchestrator state tracks:
- `sessionId`: Unique session identifier
- `userId` & `projectId`: User and project context
- `currentAgent`: Which agent is active
- `status`: Current workflow status
- `planningHandoff`: Data from Planning → Design
- `designHandoff`: Data from Design → Development
- `currentProgress`: Real-time progress info

### Nodes

**`initializeSession`**
- Creates new multi-agent session
- Sets up initial state
- Creates database records

**`completePlanning`**
- Processes Planning Agent completion
- Prepares handoff data for Design Agent
- Updates session status

**`triggerDesign`**
- Triggers Design Agent service
- Stores handoff data
- Monitors health of Design Agent

**`monitorDesign`**
- Polls Design Agent for progress
- Updates orchestrator state
- Detects completion or failure

**`handleError`**
- Handles errors from any agent
- Updates session status
- Provides error feedback

### Utilities

**`database.ts`**
- Creates and updates agent sessions
- Stores handoff data
- Manages session state

**`designAgentClient.ts`**
- HTTP client for Design Agent API
- Triggers design jobs
- Fetches progress and results

## Usage

### Starting a Multi-Agent Session

```typescript
import { startMultiAgentSession } from "@opencanvas/agents/orchestrator";

const result = await startMultiAgentSession({
  userId: "user-123",
  projectId: "project-456",
});

console.log("Session ID:", result.sessionId);
```

### Triggering Design After Planning

```typescript
import { triggerDesignPhase } from "@opencanvas/agents/orchestrator";

const result = await triggerDesignPhase({
  sessionId: "session-789",
  prdContent: "# PRD Content...",
  userFlowContent: "# User Flow...",
  completenessScore: 95,
  projectId: "project-456",
  userId: "user-123",
});

console.log("Design Job ID:", result.designJobId);
```

## Integration Points

### 1. Planning Agent Completion Hook

When Planning Agent completes, call:

```typescript
// In planning-agent/nodes/generateFinalPRD.ts
import { triggerDesignPhase } from "../orchestrator";

// After PRD generation
await triggerDesignPhase({
  sessionId: state.sessionId,
  prdContent: state.prdContent,
  userFlowContent: state.userFlowContent,
  completenessScore: state.completenessScore,
  projectId: state.projectId,
  userId: state.userId,
});
```

### 2. Design Agent Progress Monitoring

The orchestrator polls the Design Agent API:

```
GET http://localhost:8000/api/design/status/{jobId}

Response:
{
  "job_id": "...",
  "status": "running",
  "current_phase": 3,
  "phase_name": "create_ascii_ui",
  "progress_percent": 45,
  "screen_count": 6,
  "completed_screens": 2
}
```

### 3. Database Schema

The orchestrator uses these tables:

- `agent_sessions` - Overall session tracking
- `agent_handoffs` - Data passed between agents
- `design_jobs` - Design Agent job tracking
- `design_progress` - Real-time progress updates
- `design_outputs` - Generated documents
- `design_decisions` - Design decision audit trail

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Design Agent
DESIGN_AGENT_URL=http://localhost:8000

# LangGraph
LANGGRAPH_API_URL=http://localhost:54369
```

## Development

### Running Locally

1. Start Design Agent:
```bash
cd ../Design\ Agent
docker-compose up -d
```

2. Start LangGraph server:
```bash
yarn langgraphjs dev --port 54369
```

3. The orchestrator is automatically available as part of the LangGraph server.

### Testing

```bash
# Run orchestrator tests
cd apps/agents
yarn test orchestrator
```

## Error Handling

The orchestrator handles errors at multiple levels:

1. **Node-level errors**: Caught and routed to `handleError` node
2. **Database errors**: Logged and returned in state
3. **Design Agent errors**: Detected via status polling
4. **Network errors**: Retry logic with exponential backoff

## Monitoring

View orchestrator activity:

```sql
-- Active sessions
SELECT * FROM agent_sessions WHERE status NOT IN ('completed', 'failed');

-- Recent handoffs
SELECT * FROM agent_handoffs ORDER BY created_at DESC LIMIT 10;

-- Design job progress
SELECT * FROM design_jobs WHERE status = 'running';
```

## Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Retry logic for failed agents
- [ ] Parallel agent execution
- [ ] Agent rollback/undo functionality
- [ ] Comprehensive analytics dashboard
