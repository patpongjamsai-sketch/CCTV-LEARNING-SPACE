\set ON_ERROR_STOP on

select test_support.assert_true(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  ),
  'RLS must be enabled on every public table'
);

select test_support.assert_true(
  not exists (
    select 1
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
      and (
        has_table_privilege('anon', format('%I.%I', t.table_schema, t.table_name), 'SELECT')
        or has_table_privilege('anon', format('%I.%I', t.table_schema, t.table_name), 'INSERT')
        or has_table_privilege('anon', format('%I.%I', t.table_schema, t.table_name), 'UPDATE')
        or has_table_privilege('anon', format('%I.%I', t.table_schema, t.table_name), 'DELETE')
      )
  ),
  'anon must have no table access in this authenticated learning system'
);

select test_support.assert_true(
  has_column_privilege('authenticated', 'public.quiz_attempts', 'client_answers', 'INSERT')
  and not has_column_privilege('authenticated', 'public.quiz_attempts', 'approved_score', 'INSERT')
  and not has_column_privilege('authenticated', 'public.quiz_attempts', 'passed', 'INSERT'),
  'learners may submit quiz answers but not trusted quiz outcomes'
);

select test_support.assert_true(
  has_column_privilege('authenticated', 'public.game_events', 'payload', 'INSERT')
  and not has_column_privilege('authenticated', 'public.game_events', 'received_at', 'INSERT')
  and not has_table_privilege('authenticated', 'public.game_events', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.game_events', 'DELETE'),
  'game_events must be client-insertable but immutable'
);

select test_support.assert_true(
  not has_table_privilege('authenticated', 'public.game_attempts', 'INSERT')
  and not has_table_privilege('authenticated', 'public.game_mission_results', 'INSERT')
  and not has_table_privilege('authenticated', 'public.certificates', 'INSERT'),
  'trusted game outcomes and certificates must be backend-only'
);

select test_support.assert_true(
  not has_table_privilege('authenticated', 'public.audit_logs', 'INSERT')
  and not has_table_privilege('authenticated', 'public.audit_logs', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.audit_logs', 'DELETE'),
  'audit_logs must be append-only and not client-writable'
);

begin;

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'student1@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'student2@example.test'),
  ('20000000-0000-0000-0000-000000000001', 'teacher@example.test'),
  ('30000000-0000-0000-0000-000000000001', 'admin@example.test');

insert into public.profiles (id, display_name, role) values
  ('10000000-0000-0000-0000-000000000001', 'Student One', 'student'),
  ('10000000-0000-0000-0000-000000000002', 'Student Two', 'student'),
  ('20000000-0000-0000-0000-000000000001', 'Teacher', 'teacher'),
  ('30000000-0000-0000-0000-000000000001', 'Admin', 'admin')
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role;

insert into public.courses (id, code, slug, title, total_hours, content_version, status)
values (
  '40000000-0000-0000-0000-000000000001',
  'SEC-TEST',
  'sec-test',
  'Security Test Course',
  72,
  1,
  'published'
);

insert into public.units (
  id, course_id, sequence_no, slug, title, estimated_minutes, content_version, status
)
values (
  '41000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  1,
  'security-unit',
  'Security Unit',
  60,
  1,
  'published'
);

insert into public.classes (
  id, course_id, code, title, academic_year, semester, status
)
values (
  '42000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'SEC-1',
  'Security Class',
  2569,
  1,
  'active'
);

insert into public.class_members (class_id, profile_id, member_role) values
  ('42000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'student'),
  ('42000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'teacher');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select test_support.assert_true(
  (select count(*) = 1 from public.profiles),
  'student must see only their own profile'
);

select test_support.assert_true(
  (select count(*) = 1 from public.classes),
  'student must see a class where they are an active member'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);

select test_support.assert_true(
  (select count(*) = 0 from public.classes),
  'student must not see a class where they are not a member'
);

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);

select test_support.assert_true(
  (select count(*) = 2 from public.profiles),
  'teacher must see self and learners in classes they teach'
);

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);

select test_support.assert_true(
  (select count(*) = 4 from public.profiles),
  'admin must be able to inspect all profiles'
);

rollback;
