# AGIRHEO — Execution Platform

> "Stop planning. Start executing."

A premium multi-user SaaS platform built with Next.js 14, Supabase, and deployed on Vercel. 6 core systems designed to transform users into high performers.

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Charts | Recharts |
| Deployment | Vercel |
| AI | Anthropic Claude API |

---

## THE 6 SYSTEMS

1. **Clarity Engine** — Goal setting with Why/Outcome/Deadline/Sacrifice/Identity
2. **Mission System** — Daily task execution with focus timers and Done/Failed status
3. **Streak Tracker** — 90-day heatmap, current streak, best streak, failure count
4. **Feedback System** — Daily reflection + AI-powered brutal honest feedback
5. **Environment Control** — Community feed, accountability partners, competitor profiles
6. **Leverage Panel** — AI-generated daily intelligence insights per goal

---

## SETUP — STEP BY STEP

### STEP 1: Prerequisites
Make sure you have installed:
- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com

```bash
node --version   # Should show v18+
npm --version    # Should show 9+
```

### STEP 2: Create Supabase Project

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Name it "agirheo", choose a strong database password, pick nearest region
4. Wait ~2 minutes for it to provision
5. Go to **Project Settings → API**
6. Copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### STEP 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Paste the entire contents into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned."

### STEP 4: Get Anthropic API Key (for AI feedback)

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → Create new key
4. Copy the key (starts with `sk-ant-...`)

### STEP 5: Install and Configure Locally

```bash
# Navigate to project folder
cd agirheo

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Now open `.env.local` in any text editor and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### STEP 6: Run Locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see the Agirheo landing page.

Test by:
1. Clicking "BEGIN →" 
2. Creating an account
3. Setting your first goal in Clarity Engine
4. Adding tasks in Mission System

---

## DEPLOY TO VERCEL (Production)

### STEP 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial Agirheo commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOURUSERNAME/agirheo.git
git push -u origin main
```

### STEP 2: Deploy on Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your `agirheo` repository
4. Vercel auto-detects Next.js — don't change framework settings
5. **IMPORTANT: Add Environment Variables** (click "Environment Variables" before deploying):

```
NEXT_PUBLIC_SUPABASE_URL       = [your supabase project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY  = [your supabase anon key]
SUPABASE_SERVICE_ROLE_KEY      = [your supabase service role key]
ANTHROPIC_API_KEY              = [your anthropic key]
NEXT_PUBLIC_APP_URL            = https://your-app.vercel.app
```

6. Click **Deploy**
7. Wait ~2 minutes — Vercel builds and deploys automatically

### STEP 3: Update Supabase Auth Settings

1. Go back to Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
4. Click Save

### STEP 4: Your App is Live! 🔥

Visit your Vercel URL — share it with users.

---

## FUTURE UPDATES (How to Deploy Changes)

Any push to `main` branch automatically redeploys on Vercel:

```bash
git add .
git commit -m "your changes"
git push
```

That's it. Vercel handles the rest.

---

## ADDING FEATURES LATER

### Add a new page:
1. Create `src/app/dashboard/new-feature/page.tsx`
2. Add route to sidebar in `src/components/layout/Sidebar.tsx`
3. Push to GitHub → auto-deploys

### Add a new database table:
1. Go to Supabase SQL Editor
2. Run your CREATE TABLE statement
3. Add TypeScript type in `src/types/index.ts`

### Change AI model or prompts:
- Edit `src/app/api/feedback/route.ts` for feedback AI
- Edit `src/app/api/leverage/route.ts` for insights AI

---

## TROUBLESHOOTING

**"Cannot find module" errors:**
```bash
npm install
```

**Supabase connection errors:**
- Check `.env.local` has correct values
- Make sure no extra spaces around the `=` sign

**Auth redirecting to wrong URL:**
- Check Supabase Auth → URL Configuration is set correctly

**Build fails on Vercel:**
- Check all env variables are set in Vercel dashboard
- Look at build logs for specific error

---

## SUPPORT

For any issues, check:
1. Browser console (F12) for client errors
2. Vercel function logs for API errors
3. Supabase logs under "Logs" in dashboard

---

*Built for winners. Execute every day.*
