-- 20260924100000_enforce_rls_and_revoke_anon.sql
-- Security Hardening: Enforce RLS on all scoring and learning tables, revoke anon permissions

begin;

-- 1. Ensure anon role has NO privileges on public data tables
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema private from anon;

-- 2. Ensure all tables in public schema have RLS enabled and forced
do $$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table %I.%I enable row level security', table_record.schemaname, table_record.tablename);
    execute format('alter table %I.%I force row level security', table_record.schemaname, table_record.tablename);
  end loop;
end;
$$;

-- 3. Verify authenticated role column permissions are restricted to safe columns only
revoke insert, update, delete on public.student_scores from authenticated;
grant select on public.student_scores to authenticated;

revoke insert, update, delete on public.unit_progression from authenticated;
grant select on public.unit_progression to authenticated;

revoke insert, update, delete on public.progression_audit_logs from authenticated;
grant select on public.progression_audit_logs to authenticated;

commit;
