\set ON_ERROR_STOP on

begin;

-- Auth metadata may supply a display name, but it must never grant an app role.
insert into auth.users (id, email, raw_user_meta_data)
values (
  '50000000-0000-0000-0000-000000000001',
  'new-student@example.test',
  '{"display_name":"New Student","role":"admin"}'::jsonb
);

select test_support.assert_true(
  (
    select display_name = 'New Student' and role = 'student'
    from public.profiles
    where id = '50000000-0000-0000-0000-000000000001'
  ),
  'auth trigger must create a student profile and ignore metadata role escalation'
);

insert into auth.users (id, email) values
  ('50000000-0000-0000-0000-000000000002', 'teacher@example.test'),
  ('50000000-0000-0000-0000-000000000003', 'other-student@example.test');

update public.profiles
set role = 'teacher'
where id = '50000000-0000-0000-0000-000000000002';

insert into public.courses (
  id, code, slug, title, total_hours, content_version, status
)
values (
  '51000000-0000-0000-0000-000000000001',
  'FLOW-TEST',
  'flow-test',
  'Workflow Test Course',
  72,
  3,
  'published'
);

insert into public.units (
  id, course_id, sequence_no, slug, title, estimated_minutes, content_version, status
)
values (
  '52000000-0000-0000-0000-000000000001',
  '51000000-0000-0000-0000-000000000001',
  1,
  'workflow-unit',
  'Workflow Unit',
  60,
  4,
  'published'
);

insert into public.classes (
  id, course_id, code, title, academic_year, semester, status
)
values (
  '53000000-0000-0000-0000-000000000001',
  '51000000-0000-0000-0000-000000000001',
  'FLOW-1',
  'Workflow Class',
  2569,
  1,
  'active'
);

insert into public.class_members (class_id, profile_id, member_role) values
  ('53000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'student'),
  ('53000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'teacher');

insert into public.quizzes (
  id, unit_id, code, slug, quiz_type, title, max_score,
  passing_percentage, content_version, scoring_version, status
)
values (
  '54000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000001',
  'POST-1',
  'post-1',
  'post',
  'Post-test',
  20,
  60,
  4,
  7,
  'published'
);

insert into public.missions (
  id, unit_id, code, slug, sequence_no, title, max_score,
  passing_score, content_version, scoring_version, status
)
values (
  '55000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000001',
  'M1',
  'mission-1',
  1,
  'Mission 1',
  100,
  70,
  4,
  9,
  'published'
);

insert into public.game_rooms (
  id, unit_id, code, slug, title, scene_key, content_version, status
)
values (
  '56000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000001',
  'ROOM-101',
  'room-101',
  'Room 101',
  'room_101_v1',
  4,
  'published'
);

-- เตรียม diagnostic pre-test ที่ผ่านการอนุมัติ เพื่อให้ fixture นี้
-- ทดสอบ game session หลังผ่าน gate ของ Unit 1 ได้จริง
insert into public.quizzes (
  id, unit_id, code, slug, quiz_type, title, max_score,
  passing_percentage, content_version, scoring_version, status
)
values (
  '54000000-0000-0000-0000-000000000002',
  '52000000-0000-0000-0000-000000000001',
  'PRE-1',
  'pre-1',
  'pre',
  'Diagnostic Pre-test',
  10,
  80,
  4,
  7,
  'published'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000001', true);

insert into public.quiz_attempts (
  quiz_id, class_id, student_id, client_answers, started_at, submitted_at
)
values (
  '54000000-0000-0000-0000-000000000002',
  '53000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '[{"question":"diagnostic","answer":"a"}]'::jsonb,
  now() - interval '5 minutes',
  now()
)
returning id as flow_pre_attempt_id \gset

reset role;
set local role service_role;
select private.approve_quiz_attempt(
  :'flow_pre_attempt_id',
  5,
  5,
  '50000000-0000-0000-0000-000000000002',
  'Diagnostic pre-test approved for workflow fixture'
);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000001', true);

insert into public.quiz_attempts (
  quiz_id, class_id, student_id, client_answers, started_at, submitted_at
)
values (
  '54000000-0000-0000-0000-000000000001',
  '53000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '[{"question":"q1","answer":"a"}]'::jsonb,
  now() - interval '5 minutes',
  now()
)
returning id as quiz_attempt_id \gset

select test_support.assert_raises(
  '42501',
  $statement$
    insert into public.quiz_attempts (
      quiz_id, class_id, student_id, client_answers, approved_score
    ) values (
      '54000000-0000-0000-0000-000000000001',
      '53000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000001',
      '[]'::jsonb,
      20
    )
  $statement$,
  'student must not insert approved_score'
);

insert into public.lab_submissions (
  class_id, unit_id, student_id, title, student_notes
)
values (
  '53000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  'LAB 1',
  'first draft'
)
returning id as lab_submission_id \gset

update public.lab_submissions
set status = 'submitted'
where id = :'lab_submission_id';

select test_support.assert_raises(
  '42501',
  format(
    'update public.lab_submissions set submitted_at = now() - interval ''1 day'' where id = %L',
    :'lab_submission_id'
  ),
  'student must not rewrite the database submission timestamp'
);

select test_support.assert_raises(
  'P0001',
  format(
    'update public.lab_submissions set status = %L where id = %L',
    'passed',
    :'lab_submission_id'
  ),
  'student must not move a LAB directly to passed'
);

select test_support.assert_raises(
  '42501',
  format(
    'update public.lab_submissions set approved_score = 100 where id = %L',
    :'lab_submission_id'
  ),
  'student must not update LAB approved_score'
);

insert into public.evidence_files (
  lab_submission_id, storage_path, original_name, mime_type, file_size, uploaded_by
)
values (
  :'lab_submission_id',
  '50000000-0000-0000-0000-000000000001/' || :'lab_submission_id' || '/evidence.pdf',
  'evidence.pdf',
  'application/pdf',
  1024,
  '50000000-0000-0000-0000-000000000001'
);

select test_support.assert_raises(
  'P0001',
  format(
    $sql$
      insert into public.evidence_files (
        lab_submission_id, storage_path, original_name, mime_type, file_size, uploaded_by
      ) values (%L, %L, 'wrong.pdf', 'application/pdf', 100, %L)
    $sql$,
    :'lab_submission_id',
    'someone-else/' || :'lab_submission_id' || '/wrong.pdf',
    '50000000-0000-0000-0000-000000000001'
  ),
  'evidence path must be owned by the learner and submission'
);

insert into public.game_sessions (
  room_id, class_id, student_id, client_session_id
)
values (
  '56000000-0000-0000-0000-000000000001',
  '53000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '57000000-0000-0000-0000-000000000001'
)
returning id as game_session_id \gset

insert into public.game_events (
  session_id, client_event_id, sequence_no, event_type, payload, client_occurred_at
)
values
  (
    :'game_session_id',
    '58000000-0000-0000-0000-000000000001',
    1,
    'mission_started',
    '{"mission":"M1"}'::jsonb,
    now() - interval '1 minute'
  ),
  (
    :'game_session_id',
    '58000000-0000-0000-0000-000000000002',
    2,
    'mission_completed',
    '{"mission":"M1"}'::jsonb,
    now()
  );

select test_support.assert_raises(
  '42501',
  format(
    $sql$
      insert into public.game_attempts (
        session_id, mission_id, student_id, class_id, attempt_no,
        approved_score, max_score_snapshot, passed, scoring_version,
        evaluator_version, first_event_sequence, last_event_sequence
      ) values (%L, %L, %L, %L, 1, 100, 100, true, 9, 'fake', 1, 2)
    $sql$,
    :'game_session_id',
    '55000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '53000000-0000-0000-0000-000000000001'
  ),
  'student must not create a trusted game attempt'
);

reset role;

select test_support.assert_true(
  (
    select attempt_no = 1
      and status = 'submitted'
      and content_version = 4
      and scoring_version = 7
      and approved_score is null
      and passed is null
    from public.quiz_attempts
    where id = :'quiz_attempt_id'
  ),
  'quiz trigger must snapshot versions without trusting client score fields'
);

set local role service_role;

select private.approve_quiz_attempt(
  :'quiz_attempt_id',
  15,
  15,
  '50000000-0000-0000-0000-000000000002',
  'server recomputation'
);

select private.review_lab_submission(
  :'lab_submission_id',
  'reviewing',
  null,
  'checking evidence',
  '50000000-0000-0000-0000-000000000002'
);

select private.review_lab_submission(
  :'lab_submission_id',
  'passed',
  90,
  'meets criteria',
  '50000000-0000-0000-0000-000000000002'
);

select test_support.assert_true(
  (
    select status = 'completed'
      and progress_percent = 100
      and approved_score = 90
      and passed = true
      and approved_by = '50000000-0000-0000-0000-000000000002'::uuid
      and approved_at is not null
    from public.unit_progress
    where student_id = '50000000-0000-0000-0000-000000000001'
      and class_id = '53000000-0000-0000-0000-000000000001'
      and unit_id = '52000000-0000-0000-0000-000000000001'
  ),
  'a passed teacher-verified LAB must synchronize Unit 1 progress with its trusted score and approval provenance'
);

select test_support.assert_true(
  exists (
    select 1
    from public.audit_logs as al
    where al.action = 'unit_progress.lab_verified'
      and al.entity_table = 'unit_progress'
      and al.class_id = '53000000-0000-0000-0000-000000000001'
      and al.new_data ->> 'source_lab_submission_id' = :'lab_submission_id'
      and al.new_data ->> 'passed' = 'true'
  ),
  'LAB to Unit 1 synchronization must leave an append-only provenance audit record'
);

select private.finalize_game_attempt(
  :'game_session_id',
  '55000000-0000-0000-0000-000000000001',
  85,
  1,
  2,
  'engine-v9',
  '50000000-0000-0000-0000-000000000002',
  1,
  '{"verified":true}'::jsonb
) as game_attempt_id \gset

select private.upsert_unit_progress(
  '50000000-0000-0000-0000-000000000001',
  '53000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000001',
  100,
  true,
  3600,
  4,
  9,
  '50000000-0000-0000-0000-000000000002'
);

select private.issue_certificate(
  'CERT-TEST-0001',
  :'game_attempt_id',
  '50000000-0000-0000-0000-000000000002',
  '{}'::jsonb
) as certificate_id \gset

select test_support.assert_raises(
  '22003',
  format(
    $sql$
      select private.finalize_game_attempt(
        %L, %L, 101, 1, 2, 'engine-v9', %L, 0, '{}'::jsonb
      )
    $sql$,
    :'game_session_id',
    '55000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002'
  ),
  'server transaction must reject scores above the mission maximum'
);

reset role;

select test_support.assert_true(
  (
    select approved_score = 15
      and score_percent = 75
      and passed
      and scoring_version = 7
    from public.quiz_attempts
    where id = :'quiz_attempt_id'
  ),
  'server quiz approval must recompute percentage and pass status'
);

select test_support.assert_true(
  (
    select status = 'passed'
      and approved_score = 90
      and passed
      and reviewed_by = '50000000-0000-0000-0000-000000000002'
    from public.lab_submissions
    where id = :'lab_submission_id'
  ),
  'server LAB review must enforce and persist the approved workflow'
);

select test_support.assert_true(
  (
    select approved_score = 85
      and max_score_snapshot = 100
      and passed
      and scoring_version = 9
    from public.game_attempts
    where id = :'game_attempt_id'
  ),
  'trusted game transaction must derive pass status from mission rules'
);

select test_support.assert_true(
  (
    select attempt_count = 1
      and best_score = 85
      and passed
      and latest_attempt_id = :'game_attempt_id'
    from public.game_mission_results
    where student_id = '50000000-0000-0000-0000-000000000001'
      and mission_id = '55000000-0000-0000-0000-000000000001'
  ),
  'trusted game transaction must update the mission aggregate atomically'
);

select test_support.assert_true(
  (
    select passed
      and approved_score = 100
      and content_version = 4
      and scoring_version = 9
    from public.unit_progress
    where student_id = '50000000-0000-0000-0000-000000000001'
      and class_id = '53000000-0000-0000-0000-000000000001'
      and unit_id = '52000000-0000-0000-0000-000000000001'
  ),
  'unit progress must be written through the trusted backend transaction'
);

select test_support.assert_true(
  (
    select source_game_attempt_id = :'game_attempt_id'
      and student_id = '50000000-0000-0000-0000-000000000001'
      and revoked_at is null
    from public.certificates
    where id = :'certificate_id'
  ),
  'certificate issuance must bind to the passed trusted attempt'
);

select test_support.assert_true(
  (select count(*) >= 5 from public.audit_logs),
  'trusted score, progress, and certificate changes must create audit records'
);

set local role service_role;
select test_support.assert_raises(
  'P0001',
  'update public.audit_logs set action = ''tampered''',
  'audit logs must reject updates even from service_role'
);
reset role;

rollback;
