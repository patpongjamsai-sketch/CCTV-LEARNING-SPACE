\set ON_ERROR_STOP on

-- Breaks caught by this contract:
-- - a second active teacher can join the same class;
-- - completion rules can bind a mission from another unit/version or duplicate a unit version;
-- - a learner can bypass the course pre-test, the prior-unit rule, or its percentage threshold;
-- - a teacher override has no reason, is issued by an unrelated actor, or leaves no immutable audit evidence;
-- - client-facing session checks expose trusted mutation functions or stop active teachers/admins from oversight.

begin;

insert into auth.users (id, email) values
  ('61000000-0000-0000-0000-000000000001', 'progress-student@example.test'),
  ('62000000-0000-0000-0000-000000000001', 'progress-teacher@example.test'),
  ('62000000-0000-0000-0000-000000000002', 'unassigned-teacher@example.test'),
  ('63000000-0000-0000-0000-000000000001', 'progress-admin@example.test');

update public.profiles
set role = 'teacher'
where id in (
  '62000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000002'
);

update public.profiles
set role = 'admin'
where id = '63000000-0000-0000-0000-000000000001';

insert into public.courses (
  id, code, slug, title, total_hours, content_version, status
)
values (
  '64000000-0000-0000-0000-000000000001',
  'PROG-TEST',
  'progression-test',
  'Learning Progression Contract Course',
  72,
  2,
  'published'
);

insert into public.units (
  id, course_id, sequence_no, slug, title, estimated_minutes, content_version, status
)
values
  (
    '65000000-0000-0000-0000-000000000001',
    '64000000-0000-0000-0000-000000000001',
    1,
    'progression-unit-1',
    'Progression Unit 1',
    60,
    2,
    'published'
  ),
  (
    '65000000-0000-0000-0000-000000000002',
    '64000000-0000-0000-0000-000000000001',
    2,
    'progression-unit-2',
    'Progression Unit 2',
    60,
    2,
    'published'
  ),
  (
    '65000000-0000-0000-0000-000000000003',
    '64000000-0000-0000-0000-000000000001',
    3,
    'progression-unit-3',
    'Progression Unit 3',
    60,
    2,
    'published'
  ),
  (
    '65000000-0000-0000-0000-000000000004',
    '64000000-0000-0000-0000-000000000001',
    4,
    'progression-unit-4',
    'Progression Unit 4',
    60,
    2,
    'published'
  );

insert into public.classes (
  id, course_id, code, title, academic_year, semester, status
)
values (
  '66000000-0000-0000-0000-000000000001',
  '64000000-0000-0000-0000-000000000001',
  'PROG-1',
  'Progression Contract Class',
  2569,
  2,
  'active'
);

insert into public.class_members (class_id, profile_id, member_role) values
  (
    '66000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    'student'
  ),
  (
    '66000000-0000-0000-0000-000000000001',
    '62000000-0000-0000-0000-000000000001',
    'teacher'
  );

select test_support.assert_raises(
  '23505',
  $statement$
    insert into public.class_members (class_id, profile_id, member_role)
    values (
      '66000000-0000-0000-0000-000000000001',
      '62000000-0000-0000-0000-000000000002',
      'teacher'
    )
  $statement$,
  'a class must reject a second active teacher'
);

insert into public.missions (
  id, unit_id, code, slug, sequence_no, title, max_score,
  passing_score, content_version, scoring_version, status
)
values
  (
    '67000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000001',
    'U1-SUM',
    'u1-summative',
    1,
    'Unit 1 Summative Mission',
    100,
    60,
    2,
    1,
    'published'
  ),
  (
    '67000000-0000-0000-0000-000000000002',
    '65000000-0000-0000-0000-000000000001',
    'U1-ALT',
    'u1-alternate',
    2,
    'Unit 1 Alternate Mission',
    100,
    60,
    2,
    1,
    'published'
  ),
  (
    '67000000-0000-0000-0000-000000000003',
    '65000000-0000-0000-0000-000000000002',
    'U2-SUM',
    'u2-summative',
    1,
    'Unit 2 Summative Mission',
    100,
    60,
    2,
    1,
    'published'
  ),
  (
    '67000000-0000-0000-0000-000000000004',
    '65000000-0000-0000-0000-000000000003',
    'U3-SUM',
    'u3-summative',
    1,
    'Unit 3 Summative Mission',
    100,
    60,
    2,
    1,
    'published'
  ),
  (
    '67000000-0000-0000-0000-000000000005',
    '65000000-0000-0000-0000-000000000004',
    'U4-SUM',
    'u4-summative',
    1,
    'Unit 4 Summative Mission',
    100,
    60,
    2,
    1,
    'published'
  );

insert into public.unit_completion_rules (
  unit_id, content_version, summative_mission_id, passing_percentage
)
values
  (
    '65000000-0000-0000-0000-000000000001',
    2,
    '67000000-0000-0000-0000-000000000001',
    70
  ),
  (
    '65000000-0000-0000-0000-000000000002',
    2,
    '67000000-0000-0000-0000-000000000003',
    70
  ),
  (
    '65000000-0000-0000-0000-000000000003',
    2,
    '67000000-0000-0000-0000-000000000004',
    70
  );

select test_support.assert_raises(
  'P0001',
  $statement$
    insert into public.unit_completion_rules (
      unit_id, content_version, summative_mission_id, passing_percentage
    ) values (
      '65000000-0000-0000-0000-000000000004',
      2,
      '67000000-0000-0000-0000-000000000001',
      70
    )
  $statement$,
  'a completion rule must bind a summative mission from the same unit and version'
);

select test_support.assert_raises(
  '23505',
  $statement$
    insert into public.unit_completion_rules (
      unit_id, content_version, summative_mission_id, passing_percentage
    ) values (
      '65000000-0000-0000-0000-000000000001',
      2,
      '67000000-0000-0000-0000-000000000002',
      70
    )
  $statement$,
  'a unit/version must have exactly one summative completion rule'
);

select test_support.assert_raises(
  '23514',
  $statement$
    insert into public.unit_completion_rules (
      unit_id, content_version, summative_mission_id, passing_percentage
    ) values (
      '65000000-0000-0000-0000-000000000004',
      2,
      '67000000-0000-0000-0000-000000000005',
      101
    )
  $statement$,
  'a completion rule passing percentage must stay within 0 to 100'
);

select test_support.assert_true(
  (
    select c.relrowsecurity and c.relforcerowsecurity
    from pg_class as c
    where c.oid = 'public.unit_completion_rules'::regclass
  )
  and has_table_privilege('authenticated', 'public.unit_completion_rules', 'SELECT')
  and not has_table_privilege('authenticated', 'public.unit_completion_rules', 'INSERT')
  and not has_table_privilege('authenticated', 'public.unit_completion_rules', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.unit_completion_rules', 'DELETE')
  and has_table_privilege('service_role', 'public.unit_completion_rules', 'INSERT')
  and has_table_privilege('service_role', 'public.unit_completion_rules', 'UPDATE')
  and has_table_privilege('service_role', 'public.unit_completion_rules', 'DELETE'),
  'completion rules must be RLS-protected, readable to class members, and mutable only by service_role'
);

insert into public.game_rooms (
  id, unit_id, code, slug, title, scene_key, content_version, status
)
values
  (
    '68000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000001',
    'PROG-ROOM-1',
    'progression-room-1',
    'Progression Room 1',
    'progression_room_1_v2',
    2,
    'published'
  ),
  (
    '68000000-0000-0000-0000-000000000003',
    '65000000-0000-0000-0000-000000000003',
    'PROG-ROOM-3',
    'progression-room-3',
    'Progression Room 3',
    'progression_room_3_v2',
    2,
    'published'
  );

set local role service_role;
select test_support.assert_true(
  not private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000001'
  ),
  'Unit 1 must remain locked until the course pre-test is approved'
);
reset role;

insert into public.quizzes (
  id, unit_id, code, slug, quiz_type, title, max_score,
  passing_percentage, content_version, scoring_version, status
)
values (
  '69000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000001',
  'COURSE-PRE',
  'course-pre',
  'pre',
  'Course Diagnostic Pre-test',
  10,
  80,
  2,
  1,
  'published'
);

insert into public.quiz_attempts (
  quiz_id, class_id, student_id, client_answers, started_at, submitted_at
)
values (
  '69000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001',
  '[{"answer":"diagnostic"}]'::jsonb,
  now() - interval '5 minutes',
  now()
)
returning id as progression_pre_attempt_id \gset

set local role service_role;
select private.approve_quiz_attempt(
  :'progression_pre_attempt_id',
  5,
  5,
  '62000000-0000-0000-0000-000000000001',
  'Diagnostic pre-test completed'
);

select test_support.assert_true(
  (
    select status = 'approved' and passed = false
    from public.quiz_attempts
    where id = :'progression_pre_attempt_id'
  ),
  'the pre-test fixture must be approved but not passing to prove completion is diagnostic'
);

select test_support.assert_true(
  private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000001'
  ),
  'an approved course pre-test must unlock Unit 1 even when its diagnostic score is below pass'
);

select test_support.assert_true(
  not private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000002'
  ),
  'Unit 2 must remain locked until Unit 1 is passed under its completion rule'
);

-- Frozen Unit 1 rule: a teacher-passed LAB with evidence is sufficient to
-- complete Unit 1 and unlock the next unit, even when a stricter game-score
-- completion rule also exists for the unit.
insert into public.lab_submissions (
  id, class_id, unit_id, student_id, title, student_notes, status
)
values (
  '6a000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001',
  'LAB01 evidence gate',
  'Teacher-reviewed Unit 1 practical evidence',
  'submitted'
);

update public.lab_submissions
set status = 'submitted', submitted_at = now()
where id = '6a000000-0000-0000-0000-000000000001';

insert into public.evidence_files (
  lab_submission_id, storage_path, original_name, mime_type, file_size, uploaded_by
)
values (
  '6a000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001/6a000000-0000-0000-0000-000000000001/lab01.pdf',
  'lab01.pdf',
  'application/pdf',
  1024,
  '61000000-0000-0000-0000-000000000001'
);

select private.review_lab_submission(
  '6a000000-0000-0000-0000-000000000001',
  'reviewing',
  null,
  'Evidence checked',
  '62000000-0000-0000-0000-000000000001'
);

select private.review_lab_submission(
  '6a000000-0000-0000-0000-000000000001',
  'passed',
  90,
  'LAB01 passed',
  '62000000-0000-0000-0000-000000000001'
);

select test_support.assert_true(
  private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000002'
  ),
  'a passed LAB with evidence must unlock Unit 2 without requiring a separate game score'
);

update public.unit_progress
set status = 'in_progress',
    progress_percent = 0,
    approved_score = null,
    passed = false,
    completed_at = null,
    approved_by = null,
    approved_at = null
where student_id = '61000000-0000-0000-0000-000000000001'
  and class_id = '66000000-0000-0000-0000-000000000001'
  and unit_id = '65000000-0000-0000-0000-000000000001';
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '61000000-0000-0000-0000-000000000001',
  true
);

select test_support.assert_true(
  not private.can_start_game_session(
    '68000000-0000-0000-0000-000000000003',
    '66000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001'
  ),
  'a student must not start a game session in a locked later unit'
);

select test_support.assert_raises(
  '42501',
  $statement$
    insert into public.game_sessions (
      room_id, class_id, student_id, client_session_id
    ) values (
      '68000000-0000-0000-0000-000000000003',
      '66000000-0000-0000-0000-000000000001',
      '61000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000003'
    )
  $statement$,
  'the game_sessions RLS policy must enforce the unlock decision for students'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '62000000-0000-0000-0000-000000000001',
  true
);
select test_support.assert_true(
  private.can_start_game_session(
    '68000000-0000-0000-0000-000000000003',
    '66000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001'
  ),
  'the active class teacher must retain oversight of a valid locked student room'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '63000000-0000-0000-0000-000000000001',
  true
);
select test_support.assert_true(
  private.can_start_game_session(
    '68000000-0000-0000-0000-000000000003',
    '66000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001'
  ),
  'the active admin must retain oversight of a valid locked student room'
);
reset role;

insert into public.game_sessions (
  room_id, class_id, student_id, client_session_id
)
values (
  '68000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001'
)
returning id as progression_game_session_id \gset

insert into public.game_events (
  session_id, client_event_id, sequence_no, event_type, payload, client_occurred_at
)
values
  (
    :'progression_game_session_id',
    '71000000-0000-0000-0000-000000000001',
    1,
    'mission_started',
    '{"mission":"U1-SUM"}'::jsonb,
    now() - interval '2 minutes'
  ),
  (
    :'progression_game_session_id',
    '71000000-0000-0000-0000-000000000002',
    2,
    'mission_completed',
    '{"mission":"U1-SUM"}'::jsonb,
    now() - interval '1 minute'
  );

set local role service_role;
select private.finalize_game_attempt(
  :'progression_game_session_id',
  '67000000-0000-0000-0000-000000000001',
  65,
  1,
  2,
  'progression-contract-v1',
  '62000000-0000-0000-0000-000000000001'
);

select private.upsert_unit_progress(
  '61000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000001',
  100,
  true,
  600,
  2,
  1,
  '62000000-0000-0000-0000-000000000001'
);

select test_support.assert_true(
  not private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000002'
  ),
  'a passed unit_progress row must not unlock the next unit below its stricter summative percentage'
);
reset role;

insert into public.game_events (
  session_id, client_event_id, sequence_no, event_type, payload, client_occurred_at
)
values
  (
    :'progression_game_session_id',
    '71000000-0000-0000-0000-000000000003',
    3,
    'mission_retried',
    '{"mission":"U1-SUM"}'::jsonb,
    now() - interval '30 seconds'
  ),
  (
    :'progression_game_session_id',
    '71000000-0000-0000-0000-000000000004',
    4,
    'mission_completed',
    '{"mission":"U1-SUM"}'::jsonb,
    now()
  );

set local role service_role;
select private.finalize_game_attempt(
  :'progression_game_session_id',
  '67000000-0000-0000-0000-000000000001',
  75,
  3,
  4,
  'progression-contract-v1',
  '62000000-0000-0000-0000-000000000001'
);

select test_support.assert_true(
  private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000002'
  ),
  'the prior unit must unlock the next unit once its summative score reaches the configured percentage'
);

select test_support.assert_true(
  not private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000003'
  ),
  'Unit 3 must remain locked until Unit 2 is passed'
);

select test_support.assert_raises(
  'P0001',
  $statement$
    select private.override_unit_progress(
      '61000000-0000-0000-0000-000000000001',
      '66000000-0000-0000-0000-000000000001',
      '65000000-0000-0000-0000-000000000002',
      100,
      true,
      '   ',
      '62000000-0000-0000-0000-000000000001'
    )
  $statement$,
  'a teacher override must reject a blank reason'
);

select test_support.assert_raises(
  'P0001',
  $statement$
    select private.override_unit_progress(
      '61000000-0000-0000-0000-000000000001',
      '66000000-0000-0000-0000-000000000001',
      '65000000-0000-0000-0000-000000000002',
      100,
      true,
      'Unassigned teacher must not override this class',
      '62000000-0000-0000-0000-000000000002'
    )
  $statement$,
  'an active teacher outside the class must not override progress'
);

select private.override_unit_progress(
  '61000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000002',
  100,
  true,
  'Supervised alternative assessment',
  '62000000-0000-0000-0000-000000000001'
) as progression_override_id \gset

select test_support.assert_true(
  private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000003'
  ),
  'a valid teacher override must intentionally unlock the next sequence unit'
);

select test_support.assert_true(
  exists (
    select 1
    from public.audit_logs as al
    where al.action = 'unit_progress.teacher_override'
      and al.entity_table = 'unit_progress'
      and al.entity_id = :'progression_override_id'
      and al.old_data is null
      and al.new_data ->> 'passed' = 'true'
      and al.reason = 'Supervised alternative assessment'
  ),
  'a first teacher override must write new progress data and its nonblank reason to the append-only audit log'
);

select private.override_unit_progress(
  '61000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000002',
  40,
  false,
  'Administrator correction',
  '63000000-0000-0000-0000-000000000001'
);

select test_support.assert_true(
  not private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000003'
  ),
  'an admin may correct an override back to not passed'
);

select test_support.assert_true(
  exists (
    select 1
    from public.audit_logs as al
    where al.action = 'unit_progress.teacher_override'
      and al.entity_table = 'unit_progress'
      and al.entity_id = :'progression_override_id'
      and al.old_data ->> 'passed' = 'true'
      and al.new_data ->> 'passed' = 'false'
      and al.reason = 'Administrator correction'
  ),
  'an admin correction must retain both the old and new progress data in the audit log'
);

select private.override_unit_progress(
  '61000000-0000-0000-0000-000000000001',
  '66000000-0000-0000-0000-000000000001',
  '65000000-0000-0000-0000-000000000002',
  100,
  true,
  'Teacher confirms alternative assessment',
  '62000000-0000-0000-0000-000000000001'
);

select test_support.assert_true(
  private.is_unit_unlocked(
    '61000000-0000-0000-0000-000000000001',
    '66000000-0000-0000-0000-000000000001',
    '65000000-0000-0000-0000-000000000003'
  ),
  'a later valid teacher override must restore the next-unit unlock'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '61000000-0000-0000-0000-000000000001',
  true
);
select test_support.assert_true(
  private.can_start_game_session(
    '68000000-0000-0000-0000-000000000003',
    '66000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001'
  ),
  'a student may start the game session only after the progression rule unlocks the unit'
);

insert into public.game_sessions (
  room_id, class_id, student_id, client_session_id
)
values (
  '68000000-0000-0000-0000-000000000003',
  '66000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000004'
);
reset role;

select test_support.assert_true(
  has_function_privilege(
    'authenticated',
    'private.can_start_game_session(uuid,uuid,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'private.is_unit_unlocked(uuid,uuid,uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'private.is_unit_unlocked(uuid,uuid,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'private.override_unit_progress(uuid,uuid,uuid,numeric,boolean,text,uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'service_role',
    'private.override_unit_progress(uuid,uuid,uuid,numeric,boolean,text,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'public',
    'private.is_unit_unlocked(uuid,uuid,uuid)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'public',
    'private.override_unit_progress(uuid,uuid,uuid,numeric,boolean,text,uuid)',
    'EXECUTE'
  ),
  'only the existing authenticated session predicate and trusted service functions must be executable'
);

rollback;
