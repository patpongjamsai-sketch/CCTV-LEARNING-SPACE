begin;

-- New Supabase projects no longer expose public tables automatically. Keep the
-- API surface explicit so behavior is identical across old and new projects.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables
  from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences
  from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions
  from public, anon, authenticated, service_role;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;

grant usage on schema public to authenticated, service_role;
grant usage on schema private to authenticated, service_role;

-- service_role is backend-only and bypasses RLS. Browser clients receive only
-- authenticated privileges plus the policies below.
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select on all tables in schema public to authenticated;

-- Safe client-authored surfaces. Trusted outcome columns are deliberately not
-- granted. PostgreSQL evaluates column privileges before RLS/triggers.
grant update (student_code, display_name)
  on public.profiles to authenticated;

grant insert (
  quiz_id, class_id, student_id, client_answers, started_at, submitted_at
)
  on public.quiz_attempts to authenticated;

grant insert (
  class_id, unit_id, student_id, title, student_notes
)
  on public.lab_submissions to authenticated;
grant update (title, student_notes, status)
  on public.lab_submissions to authenticated;

grant insert (
  lab_submission_id, storage_path, original_name, mime_type, file_size,
  checksum_sha256, uploaded_by, metadata
)
  on public.evidence_files to authenticated;

grant insert (
  room_id, class_id, student_id, client_session_id, client_context, started_at
)
  on public.game_sessions to authenticated;
grant insert (
  session_id, sequence_no, state, schema_version, client_recorded_at
)
  on public.game_checkpoints to authenticated;
grant insert (
  session_id, client_event_id, sequence_no, event_type, payload,
  schema_version, client_occurred_at
)
  on public.game_events to authenticated;

-- Security-definer helpers are required to avoid recursive RLS while checking
-- profiles and classroom membership. Every function has an empty search_path.
create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
    and p.active
$function$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(private.current_user_role() = 'admin', false)
$function$;

create or replace function private.is_teacher_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(private.current_user_role() in ('teacher', 'admin'), false)
$function$;

create or replace function private.is_class_member(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.class_members as cm
    join public.profiles as p on p.id = cm.profile_id and p.active
    where cm.class_id = target_class_id
      and cm.profile_id = (select auth.uid())
      and cm.active
  )
$function$;

create or replace function private.is_class_teacher(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.is_admin() or exists (
    select 1
    from public.class_members as cm
    join public.profiles as p on p.id = cm.profile_id and p.active
    where cm.class_id = target_class_id
      and cm.profile_id = (select auth.uid())
      and cm.member_role = 'teacher'
      and cm.active
  )
$function$;

create or replace function private.is_class_student(
  target_class_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.class_members as cm
    join public.profiles as p on p.id = cm.profile_id and p.active
    where cm.class_id = target_class_id
      and cm.profile_id = target_student_id
      and cm.member_role = 'student'
      and cm.active
  )
$function$;

create or replace function private.can_access_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.is_admin() or private.is_class_member(target_class_id)
$function$;

create or replace function private.can_read_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    target_profile_id = (select auth.uid())
    or private.is_admin()
    or exists (
      select 1
      from public.class_members as teacher_membership
      join public.class_members as target_membership
        on target_membership.class_id = teacher_membership.class_id
       and target_membership.profile_id = target_profile_id
       and target_membership.active
      where teacher_membership.profile_id = (select auth.uid())
        and teacher_membership.member_role = 'teacher'
        and teacher_membership.active
    )
$function$;

create or replace function private.can_read_student_record(
  target_student_id uuid,
  target_class_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (
      target_student_id = (select auth.uid())
      and private.is_class_student(target_class_id, target_student_id)
    )
    or private.is_admin()
    or (
      private.is_class_teacher(target_class_id)
      and private.is_class_student(target_class_id, target_student_id)
    )
$function$;

create or replace function private.can_access_unit(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.is_admin() or exists (
    select 1
    from public.units as u
    join public.classes as c on c.course_id = u.course_id
    join public.class_members as cm on cm.class_id = c.id and cm.active
    where u.id = target_unit_id
      and cm.profile_id = (select auth.uid())
  )
$function$;

create or replace function private.can_submit_quiz(
  target_quiz_id uuid,
  target_class_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    target_student_id = (select auth.uid())
    and private.is_class_student(target_class_id, target_student_id)
    and exists (
      select 1
      from public.quizzes as q
      join public.units as u on u.id = q.unit_id
      join public.classes as c
        on c.id = target_class_id and c.course_id = u.course_id
      where q.id = target_quiz_id
        and q.status = 'published'
        and (q.available_from is null or q.available_from <= now())
        and (q.available_until is null or q.available_until >= now())
        and c.status in ('planned', 'active')
    )
$function$;

create or replace function private.can_submit_lab(
  target_class_id uuid,
  target_unit_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    target_student_id = (select auth.uid())
    and private.is_class_student(target_class_id, target_student_id)
    and exists (
      select 1
      from public.units as u
      join public.classes as c
        on c.id = target_class_id and c.course_id = u.course_id
      where u.id = target_unit_id
        and u.status = 'published'
        and c.status in ('planned', 'active')
    )
$function$;

create or replace function private.can_add_evidence(
  target_submission_id uuid,
  target_uploader_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    target_uploader_id = (select auth.uid())
    and exists (
      select 1
      from public.lab_submissions as ls
      where ls.id = target_submission_id
        and ls.student_id = target_uploader_id
        and ls.status in ('draft', 'submitted', 'revision_required')
        and private.is_class_student(ls.class_id, target_uploader_id)
    )
$function$;

create or replace function private.can_start_game_session(
  target_room_id uuid,
  target_class_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    target_student_id = (select auth.uid())
    and private.is_class_student(target_class_id, target_student_id)
    and exists (
      select 1
      from public.game_rooms as gr
      join public.units as u on u.id = gr.unit_id
      join public.classes as c
        on c.id = target_class_id and c.course_id = u.course_id
      where gr.id = target_room_id
        and gr.status = 'published'
        and c.status in ('planned', 'active')
    )
$function$;

create or replace function private.owns_active_game_session(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.game_sessions as gs
    where gs.id = target_session_id
      and gs.student_id = (select auth.uid())
      and gs.status = 'active'
      and private.is_class_student(gs.class_id, gs.student_id)
  )
$function$;

create or replace function private.can_read_game_session(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.game_sessions as gs
    where gs.id = target_session_id
      and private.can_read_student_record(gs.student_id, gs.class_id)
  )
$function$;

revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;

-- Remove the partial policies found in the development project, and any policy
-- left by a previous failed local rehearsal, before installing the complete set.
do $policies$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$policies$;

do $rls$
declare
  table_row record;
begin
  for table_row in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      table_row.schemaname,
      table_row.tablename
    );
    execute format(
      'alter table %I.%I force row level security',
      table_row.schemaname,
      table_row.tablename
    );
  end loop;
end
$rls$;

create policy profiles_select_authorized
on public.profiles for select
to authenticated
using (private.can_read_profile(id));

create policy profiles_update_safe_fields
on public.profiles for update
to authenticated
using (id = (select auth.uid()) or private.is_admin())
with check (id = (select auth.uid()) or private.is_admin());

create policy courses_select_authorized
on public.courses for select
to authenticated
using (status = 'published' or private.is_teacher_or_admin());

create policy units_select_authorized
on public.units for select
to authenticated
using (
  (status = 'published' and private.can_access_unit(id))
  or private.is_teacher_or_admin()
);

create policy classes_select_members
on public.classes for select
to authenticated
using (private.can_access_class(id));

create policy class_members_select_authorized
on public.class_members for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_admin()
  or private.is_class_teacher(class_id)
);

create policy unit_progress_select_authorized
on public.unit_progress for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy quizzes_select_authorized
on public.quizzes for select
to authenticated
using (
  (status = 'published' and private.can_access_unit(unit_id))
  or private.is_teacher_or_admin()
);

create policy quiz_attempts_select_authorized
on public.quiz_attempts for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy quiz_attempts_insert_own
on public.quiz_attempts for insert
to authenticated
with check (private.can_submit_quiz(quiz_id, class_id, student_id));

create policy lab_submissions_select_authorized
on public.lab_submissions for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy lab_submissions_insert_own
on public.lab_submissions for insert
to authenticated
with check (private.can_submit_lab(class_id, unit_id, student_id));

create policy lab_submissions_update_own
on public.lab_submissions for update
to authenticated
using (
  student_id = (select auth.uid())
  and private.is_class_student(class_id, student_id)
)
with check (
  student_id = (select auth.uid())
  and private.is_class_student(class_id, student_id)
);

create policy evidence_files_select_authorized
on public.evidence_files for select
to authenticated
using (
  exists (
    select 1
    from public.lab_submissions as ls
    where ls.id = evidence_files.lab_submission_id
      and private.can_read_student_record(ls.student_id, ls.class_id)
  )
);

create policy evidence_files_insert_own
on public.evidence_files for insert
to authenticated
with check (private.can_add_evidence(lab_submission_id, uploaded_by));

create policy audit_logs_select_authorized
on public.audit_logs for select
to authenticated
using (
  private.is_admin()
  or (class_id is not null and private.is_class_teacher(class_id))
);

create policy missions_select_authorized
on public.missions for select
to authenticated
using (
  (status = 'published' and private.can_access_unit(unit_id))
  or private.is_teacher_or_admin()
);

create policy game_rooms_select_authorized
on public.game_rooms for select
to authenticated
using (
  (status = 'published' and private.can_access_unit(unit_id))
  or private.is_teacher_or_admin()
);

create policy game_sessions_select_authorized
on public.game_sessions for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy game_sessions_insert_own
on public.game_sessions for insert
to authenticated
with check (private.can_start_game_session(room_id, class_id, student_id));

create policy game_checkpoints_select_authorized
on public.game_checkpoints for select
to authenticated
using (private.can_read_game_session(session_id));

create policy game_checkpoints_insert_own
on public.game_checkpoints for insert
to authenticated
with check (private.owns_active_game_session(session_id));

create policy game_events_select_authorized
on public.game_events for select
to authenticated
using (private.can_read_game_session(session_id));

create policy game_events_insert_own
on public.game_events for insert
to authenticated
with check (private.owns_active_game_session(session_id));

create policy game_attempts_select_authorized
on public.game_attempts for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy game_mission_results_select_authorized
on public.game_mission_results for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

create policy certificates_select_authorized
on public.certificates for select
to authenticated
using (private.can_read_student_record(student_id, class_id));

commit;
