# PlacementAI — AI Interview & Placement Assistant

A Next.js 14 + TypeScript + Tailwind app for resume analysis, job matching, and AI mock interviews.

## What's built vs. what's stubbed

This scaffold is a real, working starting point — not the entire 60-item spec fully
implemented. Working end-to-end right now:

- Landing page (all sections)
- Signup / Login / Forgot Password via Supabase Auth (email+password and Google OAuth)
- Dashboard shell with sample stats
- Resume Analyzer → calls OpenAI via `/api/resume/analyze`
- Job Description Matcher → calls OpenAI via `/api/job/match`
- AI Mock Interview (one question at a time, with feedback) → `/api/interview/chat`
- AI Answer Improvement → `/api/answer/improve`
- Placement Roadmap generator → `/api/roadmap/generate`
- Notes (create/edit/delete/pin/search) via Supabase
- Profile page via Supabase
- Legal/extra pages, 404
- Full Supabase schema with Row Level Security (`supabase/schema.sql`)

Not yet built (natural next steps, noted inline in code where relevant):
- Server-side PDF/DOCX parsing (packages `pdf-parse` and `mammoth` are installed but
  not wired up — currently the Resume Analyzer reads plain text client-side)
- Admin panel, notifications, global search, saved history views
- Charts/analytics on the progress tracker (recharts is installed, not yet used)

## 1. Prerequisites

- Node.js 18.18+ and npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- An [OpenAI](https://platform.openai.com) API key
- A [GitHub](https://github.com) account (for deployment)

## 2. Install

```bash
cd interview-assistant
npm install
```

## 3. Set up Supabase

1. Create a project at supabase.com.
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret, server-only)
4. (Optional) Go to **Authentication → Providers** and enable Google OAuth if you want
   the "Continue with Google" buttons to work — add your OAuth client ID/secret there.

## 4. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Run locally

```bash
npm run dev
```

Visit http://localhost:3000.

## 6. Deploy to Vercel

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel project's **Environment Variables** settings, add the same 5 variables
   from `.env.local` (set `NEXT_PUBLIC_APP_URL` to your production domain once assigned).
4. Deploy. Vercel auto-detects Next.js — no build config needed.
5. Once live, go back to Supabase **Authentication → URL Configuration** and add your
   Vercel domain to the allowed redirect URLs (needed for Google OAuth and password resets).

## Project structure

```
app/
  page.tsx                 landing page
  login/, signup/, forgot-password/   auth pages
  dashboard/                post-login home
  resume-analyzer/          resume upload + AI analysis
  job-matcher/               JD comparison
  mock-interview/            AI interview chat flow
  answer-improvement/        answer rewriting tool
  roadmap/                   placement roadmap generator
  notes/, profile/           Supabase-backed CRUD pages
  about/, contact/, privacy/, terms/, help/   static pages
  api/                       Next.js API routes (OpenAI calls live server-side here)
components/                  Navbar, Sidebar, Footer, Card, Button
lib/                         supabase.ts, openai.ts client helpers
supabase/schema.sql          full DB schema + Row Level Security policies
```

## Notes on security

- The OpenAI API key and Supabase service role key are only ever read in `app/api/*`
  route handlers (server-side) — never exposed to the browser.
- Row Level Security is enabled on every table so users can only read/write their own rows.
- Add rate limiting (e.g. Vercel's built-in or Upstash Ratelimit) to the `api/*` routes
  before going to production, since each call spends OpenAI credits.
