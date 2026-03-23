create extension if not exists pgcrypto;

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  attempt_number integer not null check (attempt_number >= 1),
  taken_at timestamptz not null default now(),
  communication_score numeric(3,2) not null check (communication_score between 1 and 5),
  appearance_score numeric(3,2) not null check (appearance_score between 1 and 5),
  social_score numeric(3,2) not null check (social_score between 1 and 5),
  performance_score numeric(3,2) not null check (performance_score between 1 and 5),
  behavioural_score numeric(3,2) not null check (behavioural_score between 1 and 5),
  dominant_type text not null,
  raw_responses jsonb not null
);

create unique index if not exists quiz_results_session_attempt_idx
  on public.quiz_results (session_id, attempt_number);

create index if not exists quiz_results_taken_at_idx
  on public.quiz_results (taken_at desc);

alter table public.quiz_results enable row level security;

-- Public anonymous insert/select, no update/delete.
drop policy if exists "quiz_results_insert_all" on public.quiz_results;
create policy "quiz_results_insert_all"
  on public.quiz_results
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "quiz_results_select_all" on public.quiz_results;
create policy "quiz_results_select_all"
  on public.quiz_results
  for select
  to anon, authenticated
  using (true);
