-- Enable Supabase Realtime for lab_submissions and quiz_attempts (student quiz scores).
-- This allows the Teacher Dashboard to receive real-time INSERT and UPDATE events
-- without requiring manual page refresh.

do $migration$
begin
  -- 1. Ensure publication exists
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;

  -- 2. Add public.lab_submissions
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'lab_submissions'
  ) then
    alter publication supabase_realtime add table public.lab_submissions;
  end if;

  -- 3. Add public.quiz_attempts (stores student quiz scores & statuses)
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'quiz_attempts'
  ) then
    alter publication supabase_realtime add table public.quiz_attempts;
  end if;

  -- 4. Add public.unit_progress (stores student progression)
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'unit_progress'
  ) then
    alter publication supabase_realtime add table public.unit_progress;
  end if;
end
$migration$;

-- 5. Set REPLICA IDENTITY FULL so UPDATE payloads contain all row attributes
alter table public.lab_submissions replica identity full;
alter table public.quiz_attempts replica identity full;
alter table public.unit_progress replica identity full;
