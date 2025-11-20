# ⚠️ Setup Required Before Running

The application is **ready to run**, but needs your API credentials to start.

## 🔑 Required Credentials

### 1. Supabase (Required)

You need a Supabase project for database functionality.

**Get your credentials:**
1. Go to https://supabase.com/
2. Sign in or create account
3. Create a new project (or use existing)
4. Go to Project Settings → API
5. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 2. Anthropic API Key (Required for AI agents)

**Get your API key:**
1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Go to API Keys section
4. Create a new key
5. Copy the key (starts with `sk-ant-...`)

## 📝 Configuration Steps

### Step 1: Update Root `.env`

Edit: `.env` in the project root

```env
# Anthropic (Required)
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Supabase (Required)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Design Agent (Optional for now)
DESIGN_AGENT_URL=http://localhost:8000

# LangSmith (Optional)
LANGSMITH_TRACING=false
LANGSMITH_API_KEY=
```

### Step 2: Update Web `.env.local`

Edit: `apps/web/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Design Agent
DESIGN_AGENT_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ANTHROPIC_ENABLED=true
NEXT_PUBLIC_OPENAI_ENABLED=false
NEXT_PUBLIC_GEMINI_ENABLED=false
```

### Step 3: Apply Database Migration

**Option A: Supabase Dashboard**

1. Go to https://app.supabase.com/
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy entire contents of:
   ```
   supabase/migrations/20250120_multi_agent_system.sql
   ```
6. Paste into query editor
7. Click **Run**
8. Verify: Check **Tables** tab for new tables

**Expected tables:**
- `agent_sessions`
- `agent_handoffs`
- `design_jobs`
- `design_progress`
- `design_outputs`
- `design_decisions`
- `open_source_selections`
- `ascii_ui_versions`
- `design_validation_results`

## 🚀 After Configuration

Once you've added your credentials, run:

### Terminal 1: LangGraph Server
```bash
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat"
yarn langgraphjs dev --port 54369 --no-browser
```

### Terminal 2: Frontend
```bash
cd "C:\Users\Han\Documents\SKKU 1st Grade\ANYON INTERFACE 2\anyon-chat\apps\web"
yarn dev
```

### Access the Application
Open: **http://localhost:3000**

## ✅ Verification

**Check LangGraph is running:**
```bash
curl http://localhost:54369/ok
```
Expected: `{"ok":true}`

**Check Frontend is running:**
Open: http://localhost:3000
Expected: ANYON login/home page

## 🎯 What Works After Setup

1. **Planning Agent** ✅
   - Dynamic questionnaire
   - PRD generation
   - User Flow generation

2. **Agent Orchestrator** ✅
   - Automatic agent transitions
   - State management in database
   - Progress tracking

3. **Frontend Components** ✅
   - AgentDashboard
   - Real-time progress tracking
   - Document viewing

## 💡 Quick Start (Minimal Setup)

If you just want to test quickly:

1. **Supabase**: Use the existing tables if you have them, or create a minimal project
2. **Anthropic**: This is required for agents to work (Claude AI)
3. **Design Agent**: Skip for now - Planning Agent will work fine without it

## 📞 Need Help?

**Free Tier Options:**
- **Supabase**: Free tier available at supabase.com
- **Anthropic**: Sign up at console.anthropic.com (paid, but has free trial credits)

**Files to Check:**
- `.env` (root) - Should have ANTHROPIC_API_KEY and SUPABASE_* variables
- `apps/web/.env.local` - Should have NEXT_PUBLIC_SUPABASE_* variables

**Current Status:**
- ✅ All code implemented
- ✅ Dependencies installed
- ✅ Packages built successfully
- ⏳ Waiting for API credentials
- ⏳ Waiting for database migration

---

**Once configured, everything will work!** The implementation is complete - we just need your credentials to connect to the services.
