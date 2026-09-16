\set ON_ERROR_STOP on

select test_support.assert_true(
  to_regclass('public.profiles') is not null,
  '001 must create public.profiles'
);

select test_support.assert_true(
  (
    select count(*) = 6
    from unnest(array[
      'profiles', 'courses', 'units', 'classes', 'class_members', 'unit_progress'
    ]) as required(table_name)
    where to_regclass(format('public.%I', required.table_name)) is not null
  ),
  '001 must create all six Level A tables'
);

select test_support.assert_true(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'profiles', 'courses', 'units', 'classes', 'class_members', 'unit_progress'
      )
      and column_name = 'id'
      and data_type <> 'uuid'
  ),
  'every Level A internal id must be UUID'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.profiles'::regclass
      and c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
  ),
  'profiles.id must reference auth.users.id'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.unit_progress'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) like '%student_id, class_id, unit_id%'
  ),
  'unit_progress must be unique by student + class + unit'
);

select test_support.assert_true(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'slug'
      and is_nullable = 'NO'
  )
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'content_version'
      and is_nullable = 'NO'
  ),
  'courses must expose a human slug and content version'
);

select test_support.assert_true(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'unit_progress'
      and column_name = 'scoring_version'
  )
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'unit_progress'
      and column_name = 'passed'
  ),
  'unit_progress must retain trusted scoring provenance'
);

select test_support.assert_raises(
  '23514',
  $statement$
    insert into public.profiles (id, display_name, role)
    values ('00000000-0000-0000-0000-000000000099', 'invalid role', 'owner')
  $statement$,
  'profiles.role must reject values outside student/teacher/admin'
);

