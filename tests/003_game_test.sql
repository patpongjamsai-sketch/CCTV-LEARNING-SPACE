\set ON_ERROR_STOP on

select test_support.assert_true(
  (
    select count(*) = 8
    from unnest(array[
      'missions', 'game_rooms', 'game_sessions', 'game_checkpoints',
      'game_events', 'game_attempts', 'game_mission_results', 'certificates'
    ]) as required(table_name)
    where to_regclass(format('public.%I', required.table_name)) is not null
  ),
  '003 must create all eight Level C tables'
);

select test_support.assert_true(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'missions', 'game_rooms', 'game_sessions', 'game_checkpoints',
        'game_events', 'game_attempts', 'game_mission_results', 'certificates'
      )
      and column_name = 'id'
      and data_type <> 'uuid'
  ),
  'every Level C internal id must be UUID'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.game_events'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) like '%session_id, sequence_no%'
  )
  and exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.game_events'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) like '%session_id, client_event_id%'
  ),
  'untrusted game events must be ordered and idempotent per session'
);

select test_support.assert_true(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'game_attempts'
      and column_name in ('approved_score', 'passed', 'scoring_version')
  ) = 3,
  'trusted game attempts must retain approved outcome and scoring version'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.certificates'::regclass
      and c.contype = 'f'
      and c.confrelid = 'public.game_attempts'::regclass
  ),
  'certificates must reference a trusted game attempt'
);
