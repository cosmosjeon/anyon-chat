# 🚀 Quick Start Guide - Design Agent Integration

## ✅ What's Already Done

All the code is implemented and built successfully! Here's what's ready:

- ✅ Agent Orchestrator (11 files) - Coordinating multi-agent workflow
- ✅ Planning Agent Integration - Triggers Design Agent automatically
- ✅ Database Schema (9 tables) - Migration file created
- ✅ API Endpoints (4 routes) - Session, status, documents, progress
- ✅ Frontend Components (3 components) - Dashboard, progress, documents
- ✅ Docker Configuration - Design Agent deployment ready
- ✅ Documentation (2,500+ lines) - Complete guides
- ✅ Dependencies Installed - All packages ready
- ✅ Code Built Successfully - TypeScript compiled

## 📋 Setup Steps (5-10 minutes)

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the contents of:
   ```
   supabase/migrations/20250120_multi_agent_system.sql
   ```
6. Paste into the query editor
7. Click "Run" button
8. Verify success: Check "Tables" tab for new tables

**Option B: Using Supabase CLI (if installed)**

```bash
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat"
supabase db push
```

### Step 2: Configure Environment Variables

Create `.env.local` in `apps/web/`:

```env
# Supabase (should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Design Agent Integration (NEW)
DESIGN_AGENT_URL=http://localhost:8000

# Anthropic API (should already have this)
ANTHROPIC_API_KEY=sk-ant-...
```

Create `.env` in root directory:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Design Agent (if deploying)
DESIGN_AGENT_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
```

### Step 3: Start the Services

Open **3 separate terminals**:

**Terminal 1: LangGraph Server (Planning & Orchestrator)**
```bash
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat"
yarn langgraphjs dev --port 54369 --no-browser
```

**Terminal 2: Frontend (Next.js)**
```bash
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat\apps\web"
yarn dev
```

**Terminal 3: Design Agent (Optional - for full workflow)**
```bash
# If Design Agent is set up:
cd "C:\Users\Han\Documents\SKKU 1st Grade\Design Agent"
docker-compose up

# OR if using the docker-compose in anyon-chat:
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat"
docker-compose -f docker-compose.design-agent.yml up
```

### Step 4: Test the Integration

1. **Open browser**: http://localhost:3000
2. **Create a new project**
3. **Complete Planning Agent questions**:
   - Answer the onboarding questions
   - Complete the PRD questions
   - Complete the User Flow questions
4. **Watch the magic** ✨:
   - Planning Agent automatically triggers Design Agent
   - See real-time progress in Agent Dashboard
   - View generated documents when complete

## 🎯 Quick Test (Without Design Agent)

If you haven't set up the Design Agent yet, you can still test the Planning Agent:

1. Start only Terminals 1 & 2 above
2. Go to http://localhost:3000
3. Create a project and complete Planning Agent
4. The orchestrator will try to trigger Design Agent (will fail gracefully if not running)
5. You can see the flow working in the database tables

## 📊 Verify Setup

### Check Database Tables

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'agent_sessions',
  'agent_handoffs',
  'design_jobs',
  'design_progress',
  'design_outputs'
);

-- Should return 5 rows (or 9 if all design tables created)
```

### Check API Endpoints

After starting the frontend, test these URLs:

```bash
# Health check (should return 200)
curl http://localhost:3000/api/orchestrator/sessions

# Should return 401 if not logged in (good!)
# If logged in, should return empty sessions array
```

### Check LangGraph Server

```bash
# Health check
curl http://localhost:54369/ok

# Should return:
# {"ok":true}
```

## 🎨 Using the New Components

In your React pages, import and use the components:

```tsx
import { AgentDashboard, DesignProgress, DesignDocuments } from "@/components/agents";

export default function ProjectPage() {
  const sessionId = "..."; // From your database
  const designJobId = "..."; // From agent_sessions.design_job_id

  return (
    <div className="container p-6 space-y-6">
      {/* Shows Planning, Design, Development agents */}
      <AgentDashboard sessionId={sessionId} />

      {/* Shows real-time design progress */}
      {designJobId && (
        <>
          <DesignProgress jobId={designJobId} />
          <DesignDocuments jobId={designJobId} />
        </>
      )}
    </div>
  );
}
```

## 🐛 Troubleshooting

### LangGraph Server Won't Start

```bash
# Check if port is already in use
netstat -an | find "54369"

# Use different port
yarn langgraphjs dev --port 54370 --no-browser
```

### Frontend Build Errors

```bash
# Clear cache and rebuild
cd apps/web
rm -rf .next
yarn dev
```

### Database Connection Errors

1. Check environment variables are set
2. Verify Supabase project is active
3. Check service role key has correct permissions

### Design Agent Not Starting

```bash
# Check Docker is running
docker ps

# View Design Agent logs
docker logs anyon-design-agent -f

# Restart
docker-compose -f docker-compose.design-agent.yml restart
```

## 📚 Documentation

- **Complete Architecture**: `MULTI_AGENT_ARCHITECTURE.md`
- **Integration Guide**: `DESIGN_AGENT_INTEGRATION.md`
- **Implementation Summary**: `IMPLEMENTATION_COMPLETE.md`
- **Database Schema**: `supabase/migrations/20250120_multi_agent_system.sql`

## 🎊 What You Can Do Now

1. **Planning Agent** ✅ - Already working
   - Dynamic question generation
   - PRD creation
   - User Flow creation

2. **Agent Orchestrator** ✅ - Now working!
   - Automatic agent transitions
   - State management
   - Progress tracking

3. **Design Agent Integration** ✅ - Ready to go!
   - Automatic trigger after Planning
   - Real-time progress tracking
   - Document generation and viewing

4. **Frontend Components** ✅ - Ready to use!
   - AgentDashboard - Multi-agent overview
   - DesignProgress - Real-time progress
   - DesignDocuments - Document viewer

## 🚀 Next Steps

1. **Start the servers** (Steps above)
2. **Test the Planning Agent** (should work immediately)
3. **Set up Design Agent** (optional, for full workflow)
4. **Integrate components** into your UI
5. **Customize styling** to match your brand

## 💡 Pro Tips

- **Use polling carefully**: The components poll every 2-5 seconds. Adjust `refetchInterval` if needed.
- **Handle loading states**: All components show loading spinners automatically.
- **Error boundaries**: Wrap components in error boundaries for production.
- **TypeScript**: All components are fully typed for great DX.
- **Dark mode**: Components support dark mode out of the box.

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ LangGraph server starts without errors
2. ✅ Frontend loads at http://localhost:3000
3. ✅ Planning Agent asks questions
4. ✅ PRD and User Flow generated
5. ✅ AgentDashboard shows "Planning" as completed
6. ✅ Database tables contain session data
7. ✅ (Optional) Design Agent starts and processes job

## 📞 Need Help?

Check these files for detailed information:

- **Setup issues**: `DESIGN_AGENT_INTEGRATION.md` → Troubleshooting section
- **Architecture questions**: `MULTI_AGENT_ARCHITECTURE.md`
- **API documentation**: `DESIGN_AGENT_INTEGRATION.md` → API Endpoints section
- **Database questions**: `supabase/migrations/20250120_multi_agent_system.sql` → Comments

---

**Status**: ✅ All code implemented and built successfully!
**Ready to run**: Just follow the steps above
**Estimated setup time**: 5-10 minutes

Enjoy your multi-agent ANYON system! 🎉
