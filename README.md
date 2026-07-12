# AceInterview — AI Interview & Placement Assistant

A Next.js 14 + TypeScript + Tailwind app for resume analysis, job matching, AI mock
interviews, and placement prep — powered by Google Gemini (free tier) and Supabase.

## What's built

- Landing page (all sections except pricing — removed for now, easy to re-add later)
- Signup / Login / Forgot Password via Supabase Auth (email+password + Google OAuth)
- Dashboard shell with sample stats
- Resume Analyzer — real PDF/DOCX/TXT text extraction (server-side) + Gemini analysis
- Job Description Matcher — Gemini-powered comparison
- AI Mock Interview (one question at a time, with feedback) — Gemini-powered
- AI Answer Improvement — Gemini-powered
- Placement Roadmap generator — Gemini-powered
- Notes (create/edit/delete/pin/search) via Supabase
- Global Search — searches notes, saved questions, resume analyses, and mock
  interviews from a search bar in the sidebar
- Notifications — bell icon in the sidebar, reads from a `notifications` table
- Admin Panel (`/admin`) — user list, delete users, platform analytics.
  Restricted to accounts with `is_admin = true` in the `profiles` table.
- Profile page via Supabase
- Legal/extra pages, 404
- Full Supabase schema with Row Level Security (`supabase/schema.sql`)

Not yet built: sending actual notifications on a schedule (the table + UI exist,
but nothing populates it automatically yet — see "Adding real notifications" below),
subscription/pricing tiers (removed intentionally, straightforward to re-add).

## 1. Prerequisites

- Node.js 18.18+ and npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key for Gemini (free tier)
- A [GitHub](https://github.com) account (for deployment)

## 2. Install

```bash
cd interview-assistant
npm install
```

## 3. Set up Supabase

1. Create a project at supabase.com.
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
   (If you already ran an older version of this schema, just re-run it —
   the new tables like `notifications` and the admin policy use `create table if not exists`
   and are safe to run again.)
3. Go to **Project Settings → API Keys** and copy:
   - **Project URL**
   - **Publishable key** (or "anon" key on older projects)
   - **Secret key** (or "service_role" key on older projects) — keep this private

## 4. Set up Gemini (replaces OpenAI — free tier)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account → **Create API key**
3. Copy the key — this goes in `GEMINI_API_KEY`

Free tier covers Gemini Flash models with generous daily limits, no credit card
required. Commercial/production use at scale will eventually need billing enabled —
see Google's current terms on the same page.

## 5. Set up Google Login (optional but the buttons are already wired up)

The Login/Signup pages already call `supabase.auth.signInWithOAuth({ provider: "google" })`
— this step just turns it on:

1. In [Google Cloud Console](https://console.cloud.google.com/), create (or reuse) a project
   → **APIs & Services → Credentials** → **Create Credentials → OAuth client ID**
   → Application type: **Web application**
2. Add an **Authorized redirect URI**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (find your project ref in the Supabase Project URL)
3. Copy the generated **Client ID** and **Client Secret**
4. In Supabase: **Authentication → Providers → Google** → paste both → Save
5. Once deployed, also add your live site URL to Supabase **Authentication → URL
   Configuration → Redirect URLs** (e.g. `https://your-app.vercel.app/dashboard`)

Until you do this, the "Continue with Google" buttons will show an error — email/password
signup and login work fine without it.

## 6. Make your account an admin (to see /admin)

After signing up once through the app:
1. Supabase → **Table Editor → profiles**
2. Find your row (matched by your user id / email in `auth.users`)
3. Set `is_admin` to `true` → Save

## 7. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 8. Run locally

```bash
npm run dev
```

Visit http://localhost:3000. **Restart the dev server any time you change `.env.local`.**

## 9. Deploy to Vercel

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
3. In the Vercel project's **Environment Variables** settings, add the same variables
   from `.env.local` (set `NEXT_PUBLIC_APP_URL` to your production domain once assigned).
4. Deploy — Vercel auto-detects Next.js.
5. Add your Vercel domain to Supabase **Authentication → URL Configuration → Redirect URLs**
   (needed for Google OAuth and password resets to work on the live site).

## Project structure

```
app/
  page.tsx                    landing page
  login/, signup/, forgot-password/    auth pages
  dashboard/                  post-login home
  resume-analyzer/            resume upload (PDF/DOCX/TXT) + Gemini analysis
  job-matcher/                JD comparison
  mock-interview/             AI interview chat flow
  answer-improvement/         answer rewriting tool
  roadmap/                    placement roadmap generator
  notes/, profile/            Supabase-backed CRUD pages
  search/                     global search results page
  admin/                      admin panel (user list, analytics)
  about/, contact/, privacy/, terms/, help/   static pages
  api/
    resume/analyze/           Gemini resume analysis
    resume/extract/           server-side PDF/DOCX/TXT text extraction
    job/match/                Gemini job matching
    interview/chat/           Gemini mock interview flow
    answer/improve/           Gemini answer rewriting
    roadmap/generate/         Gemini roadmap generation
    admin/users/               admin: list/delete users (service role, admin-gated)
    admin/analytics/           admin: platform counts (service role, admin-gated)
components/
  Navbar, Sidebar, Footer, Card, Button, SearchBar, NotificationBell
lib/
  supabase.ts     client + service-role helpers
  gemini.ts       Gemini client + JSON-generation helper
  adminAuth.ts    verifies a request comes from an is_admin user
supabase/schema.sql   full DB schema + Row Level Security policies
```

## Adding real notifications

Right now the `notifications` table and bell UI exist, but nothing writes rows into
it automatically. To make it live: insert a row into `notifications` (user_id, title,
message, type) whenever a relevant event happens — e.g. after a resume analysis
completes, or on a scheduled Supabase Edge Function / cron job for daily practice
reminders and weekly reports.

## Notes on security

- Gemini API key and Supabase service role key are only ever read in `app/api/*`
  route handlers (server-side) — never exposed to the browser.
- Row Level Security is enabled on every table; users can only read/write their own rows.
  Admin routes go through the service role key and an explicit `is_admin` check
  (`lib/adminAuth.ts`) rather than relying on RLS alone.
- Add rate limiting (e.g. Vercel's built-in or Upstash Ratelimit) to the `api/*` routes
  before real production use.
