-- ============================================================
-- PlacementAI — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  degree text,
  skills text[],
  career_goal text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resume analyses
create table if not exists resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  resume_text text,
  resume_score int,
  ats_score int,
  analysis jsonb,
  created_at timestamptz default now()
);

-- Job description matches
create table if not exists job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_description text,
  match_percentage int,
  result jsonb,
  created_at timestamptz default now()
);

-- Mock interviews
create table if not exists mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text,
  interview_type text,
  difficulty text,
  transcript jsonb,
  final_rating int,
  created_at timestamptz default now()
);

-- Saved interview questions
create table if not exists saved_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  category text,
  created_at timestamptz default now()
);

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- Placement roadmaps
create table if not exists roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  roadmap jsonb,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text,
  type text default 'general', -- 'interview_reminder' | 'daily_practice' | 'resume_update' | 'weekly_report' | 'general'
  read boolean default false,
  created_at timestamptz default now()
);

-- Progress tracking
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  interviews_completed int default 0,
  questions_attempted int default 0,
  resume_updates int default 0,
  practice_days int default 0,
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — users can only see/edit their own rows
-- ============================================================
alter table profiles enable row level security;
alter table resume_analyses enable row level security;
alter table job_matches enable row level security;
alter table mock_interviews enable row level security;
alter table saved_questions enable row level security;
alter table notes enable row level security;
alter table roadmaps enable row level security;
alter table progress enable row level security;
alter table notifications enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- A security-definer function bypasses RLS for its own internal lookup,
-- which avoids the infinite recursion you'd get from a policy on `profiles`
-- directly querying `profiles` again to check is_admin.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create policy "Admins can view all profiles" on profiles
  for select using (public.is_admin_user());

create policy "Users manage own resume analyses" on resume_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own job matches" on job_matches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own mock interviews" on mock_interviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own saved questions" on saved_questions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own roadmaps" on roadmaps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own progress" on progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own notifications" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
