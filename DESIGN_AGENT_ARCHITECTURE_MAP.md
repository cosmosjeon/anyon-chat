# Design Agent Integration Architecture

This document captures how the Python-based Design Agent (in `../Design Agent`) is wired into the ANYON Chat workspace (this repo). It focuses on concrete code paths, shared data structures, and runtime responsibilities so you can trace the multi-agent workflow end to end.

## System Overview

```mermaid
flowchart LR
    subgraph User Experience (Next.js / Supabase)
        UI[ANYON Web<br/>apps/web]
        API{{Next API Routes}}
    end

    subgraph Multi-Agent Control Plane (Node / LangGraph)
        PLAN[[Planning Agent<br/>apps/agents/src/planning-agent]]
        ORCH[[Orchestrator Graph<br/>apps/agents/src/orchestrator]]
    end

    subgraph Shared Data Plane (Supabase Postgres)
        S1[(agent_sessions)]
        S2[(agent_handoffs)]
        S3[(design_jobs)]
        S4[(design_progress / outputs / decisions)]
    end

    subgraph Design Agent Service (FastAPI + Workers)
        API2[[FastAPI API<br/>src/main.py]]
        LISTEN[[Job Listener<br/>src/workers/job_listener.py]]
        WORKER[[LangGraph Workflow<br/>src/workers/job_processor.py]]
        WS[[WebSocket / progress]]
        REDIS[(Redis Cache)]
    end

    User -->|Chat + dashboards| UI
    UI -->|REST calls| API
    API -->|start / fetch sessions| S1
    PLAN -->|handoff + trigger| ORCH
    ORCH -->|POST /api/design/start| API2
    ORCH -->|session + handoff rows| S1 & S2
    API2 -->|INSERT job| S3
    S3 -->|NOTIFY new_design_job| LISTEN
    LISTEN -->|spawn job| WORKER
    WORKER -->|update progress / documents| S3 & S4
    WORKER -->|broadcast events| WS
    API -->|poll status / docs| S3 & S4
    ORCH -->|GET status + docs| API2
    WORKER -->|optional ticket updates| UIX[(ANYON Kanban API)]
```

## Component Map

### 1. ANYON Chat (TypeScript / Next.js)

- **Planning Agent node** (`apps/agents/src/planning-agent/nodes/triggerDesignAgent.ts:12-84`) validates PRD/User Flow output and calls the orchestrator helper `triggerDesignPhase` to hand off work to Design.
- **Orchestrator graph** (`apps/agents/src/orchestrator/index.ts:12-115`) composes LangGraph nodes for `initialize_session → complete_planning → trigger_design → monitor_design`. Each node works against shared Supabase state (`apps/agents/src/orchestrator/utils/database.ts:17-179`).
- **Design Agent HTTP client** (`apps/agents/src/orchestrator/utils/designAgentClient.ts:8-184`) centralizes REST calls into the Python service (start job, poll status, fetch documents, cancel, feedback, approve, health check) using `process.env.DESIGN_AGENT_URL`.
- **Monitoring node** (`apps/agents/src/orchestrator/nodes/monitorDesign.ts:10-124`) loops until design is complete/failed, updates Supabase session metadata, and packages documents into `designHandoff` for downstream development agents.

### 2. Shared Data Plane (Supabase Postgres)

- **Schemas & policies** (`supabase/migrations/20250120_multi_agent_system.sql:13-161` & `:219-282`) define `agent_sessions`, `agent_handoffs`, `design_jobs`, `design_progress`, `design_outputs`, `design_decisions`, `open_source_selections`, `ascii_ui_versions`, and `design_validation_results` with RLS policies matching authenticated users.
- **Derived views** (`supabase/migrations/20250120_multi_agent_system.sql:333-383`) expose `active_design_jobs` (latest progress) and `completed_design_sessions` (documents aggregated as JSON) for dashboards.
- **Notification trigger** (`supabase/migrations/20250120_multi_agent_system.sql:320-327`) fires `pg_notify('new_design_job', …)` whenever a new job row is inserted, allowing the Design Agent worker to react without polling.

### 3. Design Agent Service (Python / FastAPI + LangGraph)

- **FastAPI entrypoint** (`../Design Agent/src/main.py:35-420`) exposes REST endpoints:
  - `POST /api/jobs/create` accepts PRD/TRD, persists `shared.design_jobs`, optionally opens an ANYON Kanban ticket via `AnyonClient`.
  - `POST /api/jobs/{job_id}/start` flips status to `in_progress` and async-starts the LangGraph workflow.
  - `GET /api/jobs/{job_id}/status`, `/package`, `/download` surface progress + deliverables.
  - `WebSocket /ws/design/{job_id}` streams progress + ASCII mockups and accepts live feedback.
- **Job listener** (`../Design Agent/src/workers/job_listener.py:22-224`) listens on `new_design_job` and spawns `process_job` tasks whenever the ANYON stack writes a new job row.
- **LangGraph job processor** (`../Design Agent/src/workers/job_processor.py:23-205`) runs the 6-phase workflow, updates `shared.design_progress`, and persists outputs. It reuses `progress_updater` for WebSocket broadcasts and supports pause/resume via LangGraph checkpoints.
- **ANYON Kanban integration** (`../Design Agent/src/integration/anyon_client.py:23-240`) can create/update tickets, attach generated docs, and mark completion, so human operators see progress outside the chat UI.
- **Configuration** (`../Design Agent/src/config.py`) keeps `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, and `ANYON_*` credentials aligned with the chat environment.

### 4. Deployment Topology

- `docker-compose.design-agent.yml:16-115` adds three services beside ANYON Chat:
  - `design-agent`: FastAPI server bound to port 8000.
  - `design-agent-worker`: optional dedicated worker invoking `python -m src.workers.job_processor`.
  - `redis`: cache for open-source search + rate limiting.
- All containers share `.env` secrets so both repos talk to the same Postgres/Supabase instance and network.

### 5. UX + Observability Hooks

- **Next API routes** (`apps/web/src/app/api/design/status/[jobId]/route.ts:11-69`, `documents/[jobId]/route.ts`, `progress/[jobId]/route.ts`) enforce auth and read Supabase tables to power dashboards.
- **Dashboards** (`apps/web/src/components/agents/AgentDashboard.tsx:23-169` and `DesignProgress.tsx:35-210`) poll those APIs with React Query to show current agent, phase timeline, ETA, screen counts, and job IDs.
- **WebSocket support** is available for richer UI (Design Agent `src/main.py:420-520`), although the current Next UI still relies on polling the shared tables.

## End-to-End Flow

1. **Planning completes**  
   - The Planning Agent node verifies PRD + User Flow data, gathers `projectId/userId`, and calls `triggerDesignPhase` with a new or existing session id (`apps/agents/src/planning-agent/nodes/triggerDesignAgent.ts:12-72`).

2. **Orchestrator seeds session state**  
   - `triggerDesignPhase` feeds the orchestrator graph with `planningHandoff`, forcing the `trigger_design` node to run (`apps/agents/src/orchestrator/index.ts:92-118`).

3. **Trigger node checks prerequisites & stores context**  
   - `triggerDesign` performs a `/health` check, records the planning payload inside `agent_handoffs`, updates `agent_sessions`, and POSTs `/api/design/start` (client-side alias for the Python API) to get a `job_id` (`apps/agents/src/orchestrator/nodes/triggerDesign.ts:14-74` & `utils/designAgentClient.ts:14-100`).  
   - Environment variables `DESIGN_AGENT_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` tie these calls to the correct services (`apps/agents/src/orchestrator/utils/designAgentClient.ts:8-9` and `utils/database.ts:12-16`).

4. **Design Agent enqueues the job**  
   - The FastAPI endpoint persists the job, optionally creates an ANYON Kanban ticket, and leaves the row in `shared.design_jobs` with status `pending` (`../Design Agent/src/main.py:210-272`).  
   - Supabase trigger `notify_new_design_job` publishes a LISTEN/NOTIFY event (`supabase/migrations/20250120_multi_agent_system.sql:320-327`).

5. **Workers take over**  
   - `JobListener` receives the notification, deserializes the payload, and spawns `process_job(job_id)` (`../Design Agent/src/workers/job_listener.py:35-123`).  
   - `process_job` sets job status to `running`, inserts a `design_progress` row, runs the LangGraph workflow, and keeps writing progress percentages + phase names (`../Design Agent/src/workers/job_processor.py:35-205`).  
   - During the run, `src/workers/progress_updater.py` updates the database and optionally broadcasts WebSocket messages, while document generators populate `shared.design_outputs`.

6. **Dashboards stay in sync**  
   - Next.js API routes read `design_jobs`, `design_progress`, and `design_outputs` for the authenticated user (`apps/web/src/app/api/design/status/[jobId]/route.ts:11-67` & siblings).  
   - React dashboards poll those routes every few seconds, rendering progress bars, ETA, and per-phase status (`apps/web/src/components/agents/DesignProgress.tsx:35-210`).

7. **Orchestrator monitors completion**  
   - `monitorDesign` polls `/api/design/status/{jobId}` and `/api/design/documents/{jobId}`. When status turns `completed`, it updates `agent_sessions` to `design_complete`, records a `designHandoff`, and emits `next: complete_design` (`apps/agents/src/orchestrator/nodes/monitorDesign.ts:10-96`).

8. **Outputs & next steps**  
   - The Design Agent’s document API returns the six deliverables (Design System, UX Flow, Screen Specs, AI Prompts, Design Guidelines, Open Source Recommendations). These become part of the JSON handoff consumed by future development agents.  
   - If optional ANYON Kanban integration is enabled, `src/integration/anyon_client.py` updates board tickets and uploads the same files (`../Design Agent/src/integration/anyon_client.py:23-240`).

## Interface Reference

| Direction | Endpoint / Table | Description |
|-----------|------------------|-------------|
| ANYON → Design Agent | `POST ${DESIGN_AGENT_URL}/api/design/start` (client wrapper) | Creates a design job with PRD + User Flow payload. |
| ANYON → Design Agent | `GET ${DESIGN_AGENT_URL}/api/design/status/{jobId}` | Current phase, percentage, and errors for orchestrator + dashboards. |
| ANYON → Design Agent | `GET ${DESIGN_AGENT_URL}/api/design/documents/{jobId}` | Returns Markdown for the six deliverables (consumed by `monitorDesign`). |
| Design Agent → Supabase | Insert/update `design_jobs`, `design_progress`, `design_outputs`, `design_decisions`, etc. | Persisted via SQLAlchemy models in `shared` schema; surfaced in Supabase through the migration. |
| ANYON Web → Supabase | `agent_sessions`, `agent_handoffs`, `design_jobs`, `design_progress`, `design_outputs` | Next API reads authenticated slices for dashboards and job history. |
| Optional | `POST /ws/design/{jobId}` (WebSocket) | Bidirectional channel for ASCII mockups + user feedback/resume commands. |
| Optional | ANYON Kanban API (`/tickets`, `/tickets/{id}`…) | Status/ticket sync handled by `AnyonClient`. |

## Deployment & Ops Notes

- Use `docker-compose -f docker-compose.design-agent.yml up` to launch FastAPI, Redis, and optional worker alongside the existing Next/Node stack (`docker-compose.design-agent.yml:14-115`).
- Ensure both repos point at the same Postgres (Supabase) instance so that `shared.design_*` tables seen by the Design Agent correspond to the RLS-protected tables the Next.js API queries.
- Health checks:
  - `GET ${DESIGN_AGENT_URL}/health` (used by `checkDesignAgentHealth` before triggering jobs).
  - Redis and FastAPI containers expose Docker healthchecks for quick troubleshooting.
- Sensitive env vars (`ANTHROPIC_API_KEY`, Supabase service role key) must be present in both `.env` files; orchestrator writes require the service role key, while the Next.js API uses the Supabase server client for row-level access control.

## Future Alignment Questions

- The TypeScript client hits `/api/design/start/status/documents`, while the FastAPI server currently exposes `/api/jobs/...`. Either alias routes need to be added on the Python side or the client should be updated to point at the `/api/jobs/*` endpoints.
- Once the Development Agent comes online, reuse the `designHandoff` payload emitted from `monitorDesign` to trigger the next phase via the orchestrator graph.

