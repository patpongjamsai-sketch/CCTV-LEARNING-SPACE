-- The teacher roster listens for membership changes and re-fetches the
-- authorized roster from the server. RLS on class_members scopes visible rows.
do $migration$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'class_members'
  ) then
    alter publication supabase_realtime add table public.class_members;
  end if;
end
$migration$;
