\set ON_ERROR_STOP on

select test_support.assert_true(
  (select count(*) = 20 from pg_tables where schemaname = 'public'),
  'the approved scope must contain exactly 20 public tables'
);

select test_support.assert_true(
  not exists (
    select 1
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and (not c.relrowsecurity or not c.relforcerowsecurity)
  ),
  'every public table must have enabled and forced RLS'
);

select test_support.assert_true(
  not exists (
    select 1
    from pg_tables as t
    where t.schemaname = 'public'
      and not exists (
        select 1
        from pg_policies as p
        where p.schemaname = t.schemaname
          and p.tablename = t.tablename
          and p.cmd = 'SELECT'
          and 'authenticated' = any(p.roles)
      )
  ),
  'each public table must have an explicit authenticated SELECT policy'
);

select test_support.assert_true(
  not exists (
    select 1
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  ),
  'no SECURITY DEFINER function may live in the exposed public schema'
);

select test_support.assert_true(
  not exists (
    select 1
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.prosecdef
      and not coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']
  ),
  'every private SECURITY DEFINER function must lock search_path to empty'
);

select test_support.assert_true(
  not exists (
    select 1
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.prosecdef
      and has_function_privilege('public', p.oid, 'EXECUTE')
  ),
  'PUBLIC must not execute any private SECURITY DEFINER function'
);

select test_support.assert_true(
  not has_function_privilege(
    'authenticated',
    'private.approve_quiz_attempt(uuid,numeric,numeric,uuid,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'private.review_lab_submission(uuid,text,numeric,text,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'private.finalize_game_attempt(uuid,uuid,numeric,bigint,bigint,text,uuid,integer,jsonb)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'private.issue_certificate(text,uuid,uuid,jsonb)',
    'EXECUTE'
  ),
  'authenticated clients must not execute trusted outcome functions'
);

select test_support.assert_true(
  has_function_privilege(
    'service_role',
    'private.approve_quiz_attempt(uuid,numeric,numeric,uuid,text)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'private.review_lab_submission(uuid,text,numeric,text,uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'private.finalize_game_attempt(uuid,uuid,numeric,bigint,bigint,text,uuid,integer,jsonb)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'private.issue_certificate(text,uuid,uuid,jsonb)',
    'EXECUTE'
  ),
  'service_role must execute the trusted backend transaction functions'
);

select test_support.assert_true(
  not has_column_privilege(
    'authenticated', 'public.profiles', 'role', 'UPDATE'
  )
  and not has_column_privilege(
    'authenticated', 'public.lab_submissions', 'submitted_at', 'UPDATE'
  )
  and not has_column_privilege(
    'authenticated', 'public.game_events', 'received_at', 'INSERT'
  ),
  'authorization and trusted server timestamps must not be client-writable'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.audit_logs'::regclass
      and tgname = 'audit_logs_reject_update_delete'
      and not tgisinternal
  ),
  'audit_logs must have a database-level append-only guard'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created'
      and not tgisinternal
  ),
  'auth.users must create public.profiles through the approved trigger'
);

