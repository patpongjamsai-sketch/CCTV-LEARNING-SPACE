begin;

create or replace function private.write_audit_log(
  p_actor_id uuid,
  p_action text,
  p_entity_table text,
  p_entity_id uuid,
  p_class_id uuid,
  p_old_data jsonb,
  p_new_data jsonb,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  audit_id uuid;
begin
  insert into public.audit_logs (
    actor_id,
    actor_kind,
    action,
    entity_table,
    entity_id,
    class_id,
    old_data,
    new_data,
    reason,
    metadata
  )
  values (
    p_actor_id,
    case when p_actor_id is null then 'system' else 'user' end,
    p_action,
    p_entity_table,
    p_entity_id,
    p_class_id,
    p_old_data,
    p_new_data,
    p_reason,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into audit_id;

  return audit_id;
end
$function$;

create or replace function private.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception using
    errcode = 'P0001',
    message = 'audit_logs is append-only';
end
$function$;

drop trigger if exists audit_logs_reject_update_delete on public.audit_logs;
create trigger audit_logs_reject_update_delete
before update or delete on public.audit_logs
for each row execute function private.prevent_audit_log_mutation();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := now();
  return new;
end
$function$;

do $triggers$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'courses', 'units', 'classes', 'class_members', 'unit_progress',
    'quizzes', 'quiz_attempts', 'lab_submissions', 'missions', 'game_rooms',
    'game_sessions', 'game_mission_results'
  ]
  loop
    execute format(
      'drop trigger if exists %I on public.%I',
      table_name || '_set_updated_at',
      table_name
    );
    execute format(
      'create trigger %I before update on public.%I '
      || 'for each row execute function private.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end
$triggers$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  safe_display_name text;
begin
  safe_display_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      'ผู้ใช้ใหม่'
    ),
    100
  );

  insert into public.profiles (id, display_name, role, active)
  values (new.id, safe_display_name, 'student', true)
  on conflict (id) do nothing;

  return new;
end
$function$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

-- Backfill Auth users that existed before this migration. Authorization never
-- comes from raw_user_meta_data; every backfilled profile starts as student.
insert into public.profiles (id, display_name, role, active)
select
  u.id,
  left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      'ผู้ใช้ใหม่'
    ),
    100
  ),
  'student',
  true
from auth.users as u
where not exists (
  select 1 from public.profiles as p where p.id = u.id
)
on conflict (id) do nothing;

create or replace function private.validate_class_member_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  profile_role text;
begin
  select p.role into profile_role
  from public.profiles as p
  where p.id = new.profile_id and p.active;

  if profile_role is null then
    raise exception 'Class member profile must exist and be active';
  end if;

  if new.member_role = 'student' and profile_role <> 'student' then
    raise exception 'Only a student profile can have student class membership';
  end if;

  if new.member_role = 'teacher' and profile_role not in ('teacher', 'admin') then
    raise exception 'Only a teacher or admin profile can have teacher membership';
  end if;

  return new;
end
$function$;

drop trigger if exists class_members_validate_role on public.class_members;
create trigger class_members_validate_role
before insert or update of profile_id, member_role, active
on public.class_members
for each row execute function private.validate_class_member_role();

create or replace function private.validate_class_unit_pair()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  class_course_id uuid;
  unit_course_id uuid;
begin
  select c.course_id into class_course_id
  from public.classes as c
  where c.id = new.class_id;

  select u.course_id into unit_course_id
  from public.units as u
  where u.id = new.unit_id;

  if class_course_id is null or unit_course_id is null
     or class_course_id <> unit_course_id then
    raise exception 'Unit must belong to the class course';
  end if;

  return new;
end
$function$;

drop trigger if exists unit_progress_validate_class_unit on public.unit_progress;
create trigger unit_progress_validate_class_unit
before insert or update of class_id, unit_id on public.unit_progress
for each row execute function private.validate_class_unit_pair();

drop trigger if exists lab_submissions_validate_class_unit on public.lab_submissions;
create trigger lab_submissions_validate_class_unit
before insert or update of class_id, unit_id on public.lab_submissions
for each row execute function private.validate_class_unit_pair();

create or replace function private.prepare_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  quiz_row public.quizzes%rowtype;
  class_course_id uuid;
  quiz_course_id uuid;
begin
  select q.* into quiz_row
  from public.quizzes as q
  where q.id = new.quiz_id;

  if not found then
    raise exception 'Quiz does not exist';
  end if;

  select c.course_id into class_course_id
  from public.classes as c
  where c.id = new.class_id;

  select u.course_id into quiz_course_id
  from public.units as u
  where u.id = quiz_row.unit_id;

  if class_course_id is null or class_course_id <> quiz_course_id then
    raise exception 'Quiz unit must belong to the class course';
  end if;

  if not private.is_class_student(new.class_id, new.student_id) then
    raise exception 'Quiz attempt student must be active in the class';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      new.quiz_id::text || ':' || new.class_id::text || ':' || new.student_id::text,
      0
    )
  );

  select coalesce(max(qa.attempt_no), 0) + 1
  into new.attempt_no
  from public.quiz_attempts as qa
  where qa.quiz_id = new.quiz_id
    and qa.class_id = new.class_id
    and qa.student_id = new.student_id;

  new.content_version := quiz_row.content_version;
  new.scoring_version := quiz_row.scoring_version;
  new.status := 'submitted';
  new.raw_score := null;
  new.approved_score := null;
  new.score_percent := null;
  new.passed := null;
  new.evaluator_version := null;
  new.approved_by := null;
  new.approved_at := null;
  new.evaluation_reason := null;
  new.started_at := coalesce(new.started_at, now());
  new.submitted_at := coalesce(new.submitted_at, now());
  new.duration_seconds := greatest(
    0,
    floor(extract(epoch from (new.submitted_at - new.started_at)))::integer
  );

  return new;
end
$function$;

drop trigger if exists quiz_attempts_prepare on public.quiz_attempts;
create trigger quiz_attempts_prepare
before insert on public.quiz_attempts
for each row execute function private.prepare_quiz_attempt();

create or replace function private.prepare_lab_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  unit_content_version integer;
begin
  if not private.is_class_student(new.class_id, new.student_id) then
    raise exception 'LAB student must be active in the class';
  end if;

  select u.content_version into unit_content_version
  from public.units as u
  where u.id = new.unit_id;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      new.class_id::text || ':' || new.unit_id::text || ':' || new.student_id::text,
      0
    )
  );

  select coalesce(max(ls.attempt_no), 0) + 1
  into new.attempt_no
  from public.lab_submissions as ls
  where ls.class_id = new.class_id
    and ls.unit_id = new.unit_id
    and ls.student_id = new.student_id;

  new.status := 'draft';
  new.approved_score := null;
  new.passed := null;
  new.submitted_at := null;
  new.reviewed_at := null;
  new.reviewed_by := null;
  new.feedback := null;
  new.content_version := unit_content_version;
  new.scoring_version := 1;

  return new;
end
$function$;

drop trigger if exists lab_submissions_prepare on public.lab_submissions;
create trigger lab_submissions_prepare
before insert on public.lab_submissions
for each row execute function private.prepare_lab_submission();

create or replace function private.guard_lab_student_update()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if (select auth.uid()) is null or (select auth.uid()) <> old.student_id then
    raise exception 'Only the owning student can edit this LAB draft';
  end if;

  if new.id is distinct from old.id
     or new.class_id is distinct from old.class_id
     or new.unit_id is distinct from old.unit_id
     or new.student_id is distinct from old.student_id
     or new.attempt_no is distinct from old.attempt_no
     or new.approved_score is distinct from old.approved_score
     or new.passed is distinct from old.passed
     or new.reviewed_at is distinct from old.reviewed_at
     or new.reviewed_by is distinct from old.reviewed_by
     or new.feedback is distinct from old.feedback
     or new.content_version is distinct from old.content_version
     or new.scoring_version is distinct from old.scoring_version
     or new.created_at is distinct from old.created_at then
    raise exception 'Student cannot change trusted LAB fields';
  end if;

  if new.status is distinct from old.status and not (
    (old.status = 'draft' and new.status = 'submitted')
    or (old.status = 'revision_required' and new.status = 'submitted')
  ) then
    raise exception 'Invalid student LAB status transition: % -> %', old.status, new.status;
  end if;

  if old.status not in ('draft', 'revision_required') and (
    new.title is distinct from old.title
    or new.student_notes is distinct from old.student_notes
  ) then
    raise exception 'Submitted LAB content cannot be edited until revision is requested';
  end if;

  if new.status = 'submitted' and new.submitted_at is null then
    new.submitted_at := now();
  end if;

  return new;
end
$function$;

drop trigger if exists lab_submissions_guard_student_update on public.lab_submissions;
create trigger lab_submissions_guard_student_update
before update on public.lab_submissions
for each row execute function private.guard_lab_student_update();

create or replace function private.validate_evidence_file()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  submission_student_id uuid;
  required_prefix text;
begin
  select ls.student_id into submission_student_id
  from public.lab_submissions as ls
  where ls.id = new.lab_submission_id;

  if submission_student_id is null then
    raise exception 'Evidence must reference a LAB submission';
  end if;

  if new.uploaded_by <> submission_student_id then
    raise exception 'Evidence uploader must own the LAB submission';
  end if;

  required_prefix := submission_student_id::text
    || '/' || new.lab_submission_id::text || '/';

  if left(new.storage_path, char_length(required_prefix)) <> required_prefix then
    raise exception 'Evidence path must start with %', required_prefix;
  end if;

  return new;
end
$function$;

drop trigger if exists evidence_files_validate_path on public.evidence_files;
create trigger evidence_files_validate_path
before insert or update on public.evidence_files
for each row execute function private.validate_evidence_file();

create or replace function private.prepare_game_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  room_row public.game_rooms%rowtype;
  class_course_id uuid;
  room_course_id uuid;
begin
  select gr.* into room_row
  from public.game_rooms as gr
  where gr.id = new.room_id;

  if not found then
    raise exception 'Game room does not exist';
  end if;

  select c.course_id into class_course_id
  from public.classes as c
  where c.id = new.class_id;

  select u.course_id into room_course_id
  from public.units as u
  where u.id = room_row.unit_id;

  if class_course_id is null or class_course_id <> room_course_id then
    raise exception 'Game room unit must belong to the class course';
  end if;

  if not private.is_class_student(new.class_id, new.student_id) then
    raise exception 'Game session student must be active in the class';
  end if;

  new.status := 'active';
  new.content_version := room_row.content_version;
  new.started_at := coalesce(new.started_at, now());
  new.last_event_at := null;
  new.ended_at := null;

  return new;
end
$function$;

drop trigger if exists game_sessions_prepare on public.game_sessions;
create trigger game_sessions_prepare
before insert on public.game_sessions
for each row execute function private.prepare_game_session();

create or replace function private.prepare_game_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  new.received_at := now();
  return new;
end
$function$;

drop trigger if exists game_events_prepare on public.game_events;
create trigger game_events_prepare
before insert on public.game_events
for each row execute function private.prepare_game_event();

create or replace function private.touch_game_session_from_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.game_sessions
  set last_event_at = greatest(coalesce(last_event_at, new.received_at), new.received_at)
  where id = new.session_id;
  return new;
end
$function$;

drop trigger if exists game_events_touch_session on public.game_events;
create trigger game_events_touch_session
after insert on public.game_events
for each row execute function private.touch_game_session_from_event();

create or replace function private.reject_row_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception using
    errcode = 'P0001',
    message = format('%s rows are immutable', tg_table_name);
end
$function$;

drop trigger if exists game_events_reject_update_delete on public.game_events;
create trigger game_events_reject_update_delete
before update or delete on public.game_events
for each row execute function private.reject_row_mutation();

drop trigger if exists game_attempts_reject_update_delete on public.game_attempts;
create trigger game_attempts_reject_update_delete
before update or delete on public.game_attempts
for each row execute function private.reject_row_mutation();

create or replace function private.approve_quiz_attempt(
  p_attempt_id uuid,
  p_raw_score numeric,
  p_approved_score numeric,
  p_actor_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  attempt_row public.quiz_attempts%rowtype;
  quiz_row public.quizzes%rowtype;
  calculated_percent numeric(5,2);
  calculated_passed boolean;
begin
  select qa.* into attempt_row
  from public.quiz_attempts as qa
  where qa.id = p_attempt_id
  for update;

  if not found then
    raise exception 'Quiz attempt does not exist';
  end if;

  if attempt_row.status <> 'submitted' then
    raise exception 'Only a submitted quiz attempt can be approved';
  end if;

  select q.* into quiz_row
  from public.quizzes as q
  where q.id = attempt_row.quiz_id;

  if p_raw_score < 0 or p_raw_score > quiz_row.max_score
     or p_approved_score < 0 or p_approved_score > quiz_row.max_score then
    raise exception using
      errcode = '22003',
      message = 'Quiz score is outside the allowed range';
  end if;

  if p_actor_id is not null and not exists (
    select 1 from public.profiles as p
    where p.id = p_actor_id and p.active and p.role in ('teacher', 'admin')
  ) then
    raise exception 'Quiz approver must be an active teacher or admin';
  end if;

  calculated_percent := round((p_approved_score / quiz_row.max_score) * 100, 2);
  calculated_passed := calculated_percent >= quiz_row.passing_percentage;

  update public.quiz_attempts
  set raw_score = p_raw_score,
      approved_score = p_approved_score,
      score_percent = calculated_percent,
      passed = calculated_passed,
      status = 'approved',
      evaluator_version = 'database-v1',
      approved_by = p_actor_id,
      approved_at = now(),
      evaluation_reason = p_reason
  where id = p_attempt_id;

  perform private.write_audit_log(
    p_actor_id,
    'quiz_attempt.approved',
    'quiz_attempts',
    p_attempt_id,
    attempt_row.class_id,
    jsonb_build_object('status', attempt_row.status),
    jsonb_build_object(
      'status', 'approved',
      'approved_score', p_approved_score,
      'score_percent', calculated_percent,
      'passed', calculated_passed,
      'scoring_version', attempt_row.scoring_version
    ),
    p_reason,
    '{"channel":"backend_transaction"}'::jsonb
  );

  return p_attempt_id;
end
$function$;

create or replace function private.review_lab_submission(
  p_submission_id uuid,
  p_new_status text,
  p_approved_score numeric,
  p_feedback text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  submission_row public.lab_submissions%rowtype;
  new_passed boolean;
begin
  select ls.* into submission_row
  from public.lab_submissions as ls
  where ls.id = p_submission_id
  for update;

  if not found then
    raise exception 'LAB submission does not exist';
  end if;

  if not exists (
    select 1 from public.profiles as p
    where p.id = p_actor_id and p.active and p.role in ('teacher', 'admin')
  ) then
    raise exception 'LAB reviewer must be an active teacher or admin';
  end if;

  if not private.is_class_student(submission_row.class_id, submission_row.student_id) then
    raise exception 'LAB student is not active in the class';
  end if;

  if not (
    (submission_row.status = 'submitted' and p_new_status = 'reviewing')
    or (
      submission_row.status = 'reviewing'
      and p_new_status in ('passed', 'revision_required')
    )
  ) then
    raise exception 'Invalid LAB review transition: % -> %',
      submission_row.status,
      p_new_status;
  end if;

  if p_new_status = 'passed' and (
    p_approved_score is null or p_approved_score < 0 or p_approved_score > 100
  ) then
    raise exception using
      errcode = '22003',
      message = 'Passed LAB requires an approved score from 0 to 100';
  end if;

  new_passed := case
    when p_new_status = 'passed' then true
    when p_new_status = 'revision_required' then false
    else null
  end;

  update public.lab_submissions
  set status = p_new_status,
      approved_score = case
        when p_new_status in ('passed', 'revision_required') then p_approved_score
        else null
      end,
      passed = new_passed,
      reviewed_at = case
        when p_new_status in ('passed', 'revision_required') then now()
        else null
      end,
      reviewed_by = case
        when p_new_status in ('passed', 'revision_required') then p_actor_id
        else null
      end,
      feedback = p_feedback
  where id = p_submission_id;

  perform private.write_audit_log(
    p_actor_id,
    'lab_submission.' || p_new_status,
    'lab_submissions',
    p_submission_id,
    submission_row.class_id,
    jsonb_build_object('status', submission_row.status),
    jsonb_build_object(
      'status', p_new_status,
      'approved_score', p_approved_score,
      'passed', new_passed,
      'scoring_version', submission_row.scoring_version
    ),
    p_feedback,
    '{"channel":"backend_transaction"}'::jsonb
  );

  return p_submission_id;
end
$function$;

create or replace function private.finalize_game_attempt(
  p_session_id uuid,
  p_mission_id uuid,
  p_approved_score numeric,
  p_first_event_sequence bigint,
  p_last_event_sequence bigint,
  p_evaluator_version text,
  p_actor_id uuid,
  p_hints_used integer default 0,
  p_result_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  session_row public.game_sessions%rowtype;
  room_unit_id uuid;
  mission_row public.missions%rowtype;
  next_attempt_no integer;
  new_attempt_id uuid;
  calculated_passed boolean;
  event_count bigint;
begin
  select gs.* into session_row
  from public.game_sessions as gs
  where gs.id = p_session_id
  for update;

  if not found then
    raise exception 'Game session does not exist';
  end if;

  select gr.unit_id into room_unit_id
  from public.game_rooms as gr
  where gr.id = session_row.room_id;

  select m.* into mission_row
  from public.missions as m
  where m.id = p_mission_id;

  if not found or mission_row.unit_id <> room_unit_id then
    raise exception 'Mission must belong to the game room unit';
  end if;

  if p_approved_score < 0 or p_approved_score > mission_row.max_score then
    raise exception using
      errcode = '22003',
      message = 'Game score is outside the mission score range';
  end if;

  if p_first_event_sequence <= 0
     or p_last_event_sequence < p_first_event_sequence then
    raise exception 'Invalid game event sequence range';
  end if;

  select count(*) into event_count
  from public.game_events as ge
  where ge.session_id = p_session_id
    and ge.sequence_no between p_first_event_sequence and p_last_event_sequence;

  if event_count <> (p_last_event_sequence - p_first_event_sequence + 1) then
    raise exception 'Trusted game attempt requires a contiguous event range';
  end if;

  if p_hints_used < 0 then
    raise exception 'hints_used cannot be negative';
  end if;

  if jsonb_typeof(coalesce(p_result_details, '{}'::jsonb)) <> 'object' then
    raise exception 'result_details must be a JSON object';
  end if;

  if char_length(btrim(p_evaluator_version)) not between 1 and 100 then
    raise exception 'evaluator_version is required';
  end if;

  if p_actor_id is not null and not exists (
    select 1 from public.profiles as p
    where p.id = p_actor_id and p.active and p.role in ('teacher', 'admin')
  ) then
    raise exception 'Game evaluator must be an active teacher or admin';
  end if;

  select coalesce(max(ga.attempt_no), 0) + 1 into next_attempt_no
  from public.game_attempts as ga
  where ga.session_id = p_session_id
    and ga.mission_id = p_mission_id;

  if mission_row.max_attempts is not null
     and next_attempt_no > mission_row.max_attempts then
    raise exception 'Mission attempt limit reached';
  end if;

  calculated_passed := p_approved_score >= mission_row.passing_score;
  new_attempt_id := gen_random_uuid();

  insert into public.game_attempts (
    id,
    session_id,
    mission_id,
    student_id,
    class_id,
    attempt_no,
    approved_score,
    max_score_snapshot,
    passed,
    hints_used,
    content_version,
    scoring_version,
    evaluator_version,
    first_event_sequence,
    last_event_sequence,
    result_details,
    evaluated_by
  )
  values (
    new_attempt_id,
    p_session_id,
    p_mission_id,
    session_row.student_id,
    session_row.class_id,
    next_attempt_no,
    p_approved_score,
    mission_row.max_score,
    calculated_passed,
    p_hints_used,
    mission_row.content_version,
    mission_row.scoring_version,
    p_evaluator_version,
    p_first_event_sequence,
    p_last_event_sequence,
    coalesce(p_result_details, '{}'::jsonb),
    p_actor_id
  );

  insert into public.game_mission_results (
    student_id,
    class_id,
    mission_id,
    attempt_count,
    hints_used,
    best_score,
    passed,
    first_passed_at,
    latest_attempt_id,
    content_version,
    scoring_version
  )
  values (
    session_row.student_id,
    session_row.class_id,
    p_mission_id,
    1,
    p_hints_used,
    p_approved_score,
    calculated_passed,
    case when calculated_passed then now() else null end,
    new_attempt_id,
    mission_row.content_version,
    mission_row.scoring_version
  )
  on conflict (student_id, class_id, mission_id) do update
  set attempt_count = public.game_mission_results.attempt_count + 1,
      hints_used = public.game_mission_results.hints_used + excluded.hints_used,
      best_score = greatest(public.game_mission_results.best_score, excluded.best_score),
      passed = public.game_mission_results.passed or excluded.passed,
      first_passed_at = coalesce(
        public.game_mission_results.first_passed_at,
        excluded.first_passed_at
      ),
      latest_attempt_id = excluded.latest_attempt_id,
      content_version = excluded.content_version,
      scoring_version = excluded.scoring_version;

  perform private.write_audit_log(
    p_actor_id,
    'game_attempt.finalized',
    'game_attempts',
    new_attempt_id,
    session_row.class_id,
    null,
    jsonb_build_object(
      'approved_score', p_approved_score,
      'passed', calculated_passed,
      'content_version', mission_row.content_version,
      'scoring_version', mission_row.scoring_version,
      'event_range', jsonb_build_array(
        p_first_event_sequence,
        p_last_event_sequence
      )
    ),
    null,
    jsonb_build_object(
      'channel', 'backend_transaction',
      'evaluator_version', p_evaluator_version
    )
  );

  return new_attempt_id;
end
$function$;

create or replace function private.upsert_unit_progress(
  p_student_id uuid,
  p_class_id uuid,
  p_unit_id uuid,
  p_progress_percent numeric,
  p_passed boolean,
  p_time_spent_seconds bigint,
  p_content_version integer,
  p_scoring_version integer,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  progress_id uuid;
  old_progress jsonb;
  calculated_status text;
begin
  if not private.is_class_student(p_class_id, p_student_id) then
    raise exception 'Progress student must be active in the class';
  end if;

  if not exists (
    select 1
    from public.units as u
    join public.classes as c on c.id = p_class_id and c.course_id = u.course_id
    where u.id = p_unit_id
  ) then
    raise exception 'Progress unit must belong to the class course';
  end if;

  if p_progress_percent < 0 or p_progress_percent > 100
     or p_time_spent_seconds < 0
     or p_content_version <= 0
     or p_scoring_version <= 0 then
    raise exception using
      errcode = '22003',
      message = 'Progress values are outside the allowed range';
  end if;

  if p_actor_id is not null and not exists (
    select 1 from public.profiles as p
    where p.id = p_actor_id and p.active and p.role in ('teacher', 'admin')
  ) then
    raise exception 'Progress approver must be an active teacher or admin';
  end if;

  select to_jsonb(up) into old_progress
  from public.unit_progress as up
  where up.student_id = p_student_id
    and up.class_id = p_class_id
    and up.unit_id = p_unit_id
  for update;

  calculated_status := case
    when p_progress_percent = 0 then 'not_started'
    when p_progress_percent = 100 then 'completed'
    else 'in_progress'
  end;

  insert into public.unit_progress (
    student_id,
    class_id,
    unit_id,
    status,
    progress_percent,
    time_spent_seconds,
    attempt_count,
    approved_score,
    passed,
    content_version,
    scoring_version,
    started_at,
    last_activity_at,
    completed_at,
    approved_by,
    approved_at
  )
  values (
    p_student_id,
    p_class_id,
    p_unit_id,
    calculated_status,
    p_progress_percent,
    p_time_spent_seconds,
    1,
    p_progress_percent,
    p_passed,
    p_content_version,
    p_scoring_version,
    case when p_progress_percent > 0 then now() else null end,
    now(),
    case when p_progress_percent = 100 then now() else null end,
    p_actor_id,
    now()
  )
  on conflict (student_id, class_id, unit_id) do update
  set status = excluded.status,
      progress_percent = excluded.progress_percent,
      time_spent_seconds = greatest(
        public.unit_progress.time_spent_seconds,
        excluded.time_spent_seconds
      ),
      approved_score = excluded.approved_score,
      passed = excluded.passed,
      content_version = excluded.content_version,
      scoring_version = excluded.scoring_version,
      started_at = coalesce(public.unit_progress.started_at, excluded.started_at),
      last_activity_at = excluded.last_activity_at,
      completed_at = excluded.completed_at,
      approved_by = excluded.approved_by,
      approved_at = excluded.approved_at
  returning id into progress_id;

  perform private.write_audit_log(
    p_actor_id,
    'unit_progress.approved',
    'unit_progress',
    progress_id,
    p_class_id,
    old_progress,
    jsonb_build_object(
      'progress_percent', p_progress_percent,
      'passed', p_passed,
      'content_version', p_content_version,
      'scoring_version', p_scoring_version
    ),
    null,
    '{"channel":"backend_transaction"}'::jsonb
  );

  return progress_id;
end
$function$;

create or replace function private.issue_certificate(
  p_certificate_no text,
  p_source_game_attempt_id uuid,
  p_actor_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  attempt_row public.game_attempts%rowtype;
  certificate_id uuid;
  derived_course_id uuid;
begin
  select ga.* into attempt_row
  from public.game_attempts as ga
  where ga.id = p_source_game_attempt_id
  for share;

  if not found or not attempt_row.passed then
    raise exception 'Certificate requires a passed trusted game attempt';
  end if;

  if p_actor_id is not null and not exists (
    select 1 from public.profiles as p
    where p.id = p_actor_id and p.active and p.role in ('teacher', 'admin')
  ) then
    raise exception 'Certificate issuer must be an active teacher or admin';
  end if;

  select u.course_id into derived_course_id
  from public.missions as m
  join public.units as u on u.id = m.unit_id
  where m.id = attempt_row.mission_id;

  insert into public.certificates (
    certificate_no,
    student_id,
    class_id,
    course_id,
    source_game_attempt_id,
    content_version,
    scoring_version,
    issued_by,
    metadata
  )
  values (
    p_certificate_no,
    attempt_row.student_id,
    attempt_row.class_id,
    derived_course_id,
    p_source_game_attempt_id,
    attempt_row.content_version,
    attempt_row.scoring_version,
    p_actor_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into certificate_id;

  perform private.write_audit_log(
    p_actor_id,
    'certificate.issued',
    'certificates',
    certificate_id,
    attempt_row.class_id,
    null,
    jsonb_build_object(
      'certificate_no', p_certificate_no,
      'source_game_attempt_id', p_source_game_attempt_id,
      'scoring_version', attempt_row.scoring_version
    ),
    null,
    '{"channel":"backend_transaction"}'::jsonb
  );

  return certificate_id;
end
$function$;

create or replace function private.audit_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.role is distinct from old.role or new.active is distinct from old.active then
    perform private.write_audit_log(
      (select auth.uid()),
      'profile.authorization_changed',
      'profiles',
      new.id,
      null,
      jsonb_build_object('role', old.role, 'active', old.active),
      jsonb_build_object('role', new.role, 'active', new.active),
      null,
      '{"channel":"database_trigger"}'::jsonb
    );
  end if;
  return new;
end
$function$;

drop trigger if exists profiles_audit_authorization_change on public.profiles;
create trigger profiles_audit_authorization_change
after update of role, active on public.profiles
for each row execute function private.audit_profile_privilege_change();

create or replace function private.audit_class_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  target_row public.class_members%rowtype;
  action_name text;
begin
  target_row := case when tg_op = 'DELETE' then old else new end;
  action_name := case
    when tg_op = 'INSERT' then 'class_membership.created'
    when tg_op = 'UPDATE' then 'class_membership.updated'
    else 'class_membership.deleted'
  end;

  perform private.write_audit_log(
    (select auth.uid()),
    action_name,
    'class_members',
    target_row.id,
    target_row.class_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    null,
    '{"channel":"database_trigger"}'::jsonb
  );

  return case when tg_op = 'DELETE' then old else new end;
end
$function$;

drop trigger if exists class_members_audit_change on public.class_members;
create trigger class_members_audit_change
after insert or update or delete on public.class_members
for each row execute function private.audit_class_membership_change();

revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_teacher_or_admin() to authenticated;
grant execute on function private.is_class_member(uuid) to authenticated;
grant execute on function private.is_class_teacher(uuid) to authenticated;
grant execute on function private.is_class_student(uuid, uuid) to authenticated;
grant execute on function private.can_access_class(uuid) to authenticated;
grant execute on function private.can_read_profile(uuid) to authenticated;
grant execute on function private.can_read_student_record(uuid, uuid) to authenticated;
grant execute on function private.can_access_unit(uuid) to authenticated;
grant execute on function private.can_submit_quiz(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_submit_lab(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_add_evidence(uuid, uuid) to authenticated;
grant execute on function private.can_start_game_session(uuid, uuid, uuid) to authenticated;
grant execute on function private.owns_active_game_session(uuid) to authenticated;
grant execute on function private.can_read_game_session(uuid) to authenticated;

grant execute on function private.approve_quiz_attempt(uuid, numeric, numeric, uuid, text)
  to service_role;
grant execute on function private.review_lab_submission(uuid, text, numeric, text, uuid)
  to service_role;
grant execute on function private.finalize_game_attempt(
  uuid, uuid, numeric, bigint, bigint, text, uuid, integer, jsonb
)
  to service_role;
grant execute on function private.upsert_unit_progress(
  uuid, uuid, uuid, numeric, boolean, bigint, integer, integer, uuid
)
  to service_role;
grant execute on function private.issue_certificate(text, uuid, uuid, jsonb)
  to service_role;
grant execute on function private.write_audit_log(
  uuid, text, text, uuid, uuid, jsonb, jsonb, text, jsonb
)
  to service_role;

commit;
