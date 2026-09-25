begin;

-- ----------------------------------------------------------------------
-- Unit completion rules table. Class teacher memberships are managed separately.
-- ----------------------------------------------------------------------
create table if not exists public.unit_completion_rules (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  content_version integer not null,
  summative_mission_id uuid not null references public.missions(id) on delete cascade,
  passing_percentage numeric(5,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unit_completion_rules_unit_version_key unique (unit_id, content_version),
  constraint unit_completion_rules_passing_percentage_check
    check (passing_percentage >= 0 and passing_percentage <= 100)
);

-- Covering index for foreign key summative_mission_id (FK covering test)
create index if not exists unit_completion_rules_summative_mission_id_idx
  on public.unit_completion_rules (summative_mission_id);

-- Enable and force RLS
alter table public.unit_completion_rules enable row level security;
alter table public.unit_completion_rules force row level security;

-- Permissions
revoke all on table public.unit_completion_rules from public, anon, authenticated;
grant select on table public.unit_completion_rules to authenticated;
grant all on table public.unit_completion_rules to service_role;

-- SELECT policy for authenticated
create policy unit_completion_rules_select_authorized
on public.unit_completion_rules for select
to authenticated
using (
  private.can_access_unit(unit_id)
  or private.is_teacher_or_admin()
);

-- Trigger: validate summative mission belongs to the same unit and version
create or replace function private.validate_unit_completion_rule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_mission record;
begin
  select m.id, m.unit_id, m.content_version
  into v_mission
  from public.missions as m
  where m.id = new.summative_mission_id;

  if v_mission.id is null
     or v_mission.unit_id <> new.unit_id
     or v_mission.content_version <> new.content_version then
    raise exception 'a completion rule must bind a summative mission from the same unit and version'
      using errcode = 'P0001';
  end if;

  return new;
end;
$function$;

revoke all on function private.validate_unit_completion_rule() from public, anon, authenticated;
grant execute on function private.validate_unit_completion_rule() to service_role;

drop trigger if exists unit_completion_rules_validate on public.unit_completion_rules;
create trigger unit_completion_rules_validate
before insert or update of unit_id, content_version, summative_mission_id on public.unit_completion_rules
for each row execute function private.validate_unit_completion_rule();

-- Trigger: updated_at
drop trigger if exists unit_completion_rules_set_updated_at on public.unit_completion_rules;
create trigger unit_completion_rules_set_updated_at
before update on public.unit_completion_rules
for each row execute function private.set_updated_at();

-- ----------------------------------------------------------------------
-- 3. Progression function: private.is_unit_unlocked
-- ----------------------------------------------------------------------
create or replace function private.is_unit_unlocked(
  target_student_id uuid,
  target_class_id uuid,
  target_unit_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_current_unit record;
  v_prior_unit record;
  v_override_passed text;
  v_up_passed boolean;
  v_rule record;
begin
  -- Validate active student membership
  if not private.is_class_student(target_class_id, target_student_id) then
    return false;
  end if;

  -- Validate unit belongs to class's course
  select u.id, u.sequence_no, u.course_id, u.content_version
  into v_current_unit
  from public.units as u
  join public.classes as c on c.id = target_class_id and c.course_id = u.course_id
  where u.id = target_unit_id
    and u.status = 'published';

  if not found then
    return false;
  end if;

  -- Unit 1 sequence: Unlocked if course pre-test is approved OR teacher override exists
  if v_current_unit.sequence_no = 1 then
    -- Check teacher override on unit 1
    select al.new_data ->> 'passed' into v_override_passed
    from public.audit_logs as al
    join public.unit_progress as up on up.id = al.entity_id
    where al.entity_table = 'unit_progress'
      and al.action = 'unit_progress.teacher_override'
      and up.student_id = target_student_id
      and up.class_id = target_class_id
      and up.unit_id = v_current_unit.id
    order by al.created_at desc, al.id desc
    limit 1;

    if v_override_passed = 'true' then
      return true;
    elsif v_override_passed = 'false' then
      return false;
    end if;

    -- Diagnostic course pre-test must be approved
    return exists (
      select 1
      from public.quiz_attempts as qa
      join public.quizzes as q on q.id = qa.quiz_id
      join public.units as u on u.id = q.unit_id
      where qa.student_id = target_student_id
        and qa.class_id = target_class_id
        and qa.status = 'approved'
        and q.quiz_type = 'pre'
        and u.course_id = v_current_unit.course_id
    );
  end if;

  -- For sequence > 1: find immediate prior unit in course
  select u.id, u.sequence_no, u.course_id, u.content_version
  into v_prior_unit
  from public.units as u
  where u.course_id = v_current_unit.course_id
    and u.sequence_no < v_current_unit.sequence_no
    and u.status = 'published'
  order by u.sequence_no desc
  limit 1;

  if not found then
    return true;
  end if;

  -- Prior unit must be unlocked
  if not private.is_unit_unlocked(target_student_id, target_class_id, v_prior_unit.id) then
    return false;
  end if;

  -- Check if prior unit is passed:
  -- 1) Check latest teacher override for prior unit
  select al.new_data ->> 'passed' into v_override_passed
  from public.audit_logs as al
  join public.unit_progress as up on up.id = al.entity_id
  where al.entity_table = 'unit_progress'
    and al.action = 'unit_progress.teacher_override'
    and up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = v_prior_unit.id
  order by al.created_at desc, al.id desc
  limit 1;

  if v_override_passed is not null then
    return v_override_passed = 'true';
  end if;

  -- 2) Normal completion: unit_progress.passed = true
  select up.passed into v_up_passed
  from public.unit_progress as up
  where up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = v_prior_unit.id;

  if not coalesce(v_up_passed, false) then
    return false;
  end if;

  -- 3) Stricter summative percentage if unit_completion_rules exists
  select ucr.* into v_rule
  from public.unit_completion_rules as ucr
  where ucr.unit_id = v_prior_unit.id
    and ucr.content_version = v_prior_unit.content_version;

  if found then
    return exists (
      select 1
      from public.game_attempts as ga
      where ga.student_id = target_student_id
        and ga.class_id = target_class_id
        and ga.mission_id = v_rule.summative_mission_id
        and ga.max_score_snapshot > 0
        and (ga.approved_score / ga.max_score_snapshot * 100.0) >= v_rule.passing_percentage
    );
  end if;

  return true;
end;
$function$;

revoke all on function private.is_unit_unlocked(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function private.is_unit_unlocked(uuid, uuid, uuid) to service_role;

-- ----------------------------------------------------------------------
-- 4. Oversight & unlock predicate: private.can_start_game_session
-- ----------------------------------------------------------------------
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
  select exists (
    select 1
    from public.game_rooms as gr
    join public.units as u on u.id = gr.unit_id
    join public.classes as c
      on c.id = target_class_id and c.course_id = u.course_id
    where gr.id = target_room_id
      and gr.status = 'published'
      and c.status in ('planned', 'active')
      and private.is_class_student(target_class_id, target_student_id)
      and (
        private.is_admin()
        or private.is_class_teacher(target_class_id)
        or (
          target_student_id = (select auth.uid())
          and private.is_unit_unlocked(target_student_id, target_class_id, gr.unit_id)
        )
      )
  );
$function$;

grant execute on function private.can_start_game_session(uuid, uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------
-- 5. Teacher / Admin progression override: private.override_unit_progress
-- ----------------------------------------------------------------------
create or replace function private.override_unit_progress(
  target_student_id uuid,
  target_class_id uuid,
  target_unit_id uuid,
  target_progress_percent numeric,
  target_passed boolean,
  target_reason text,
  actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_role text;
  v_is_authorized boolean := false;
  v_unit_content_version integer;
  old_row public.unit_progress%rowtype;
  v_old_data jsonb;
  progress_id uuid;
begin
  -- Validate non-blank reason
  if btrim(coalesce(target_reason, '')) = '' then
    raise exception 'a teacher override must reject a blank reason'
      using errcode = 'P0001';
  end if;

  -- Validate percentage range
  if target_progress_percent < 0 or target_progress_percent > 100 then
    raise exception 'progress percent must be between 0 and 100'
      using errcode = '23514';
  end if;

  -- Validate actor authorization (admin or active class teacher)
  select p.role into v_actor_role
  from public.profiles as p
  where p.id = actor_id and p.active = true;

  if v_actor_role is null then
    raise exception 'Actor is not an active profile'
      using errcode = 'P0001';
  end if;

  if v_actor_role = 'admin' then
    v_is_authorized := true;
  elsif v_actor_role = 'teacher' then
    select exists (
      select 1
      from public.class_members as cm
      where cm.class_id = target_class_id
        and cm.profile_id = actor_id
        and cm.member_role = 'teacher'
        and cm.active = true
    ) into v_is_authorized;
  end if;

  if not v_is_authorized then
    raise exception 'an active teacher outside the class must not override progress'
      using errcode = 'P0001';
  end if;

  -- Validate student belongs to class
  if not private.is_class_student(target_class_id, target_student_id) then
    raise exception 'Target student is not an active student in this class'
      using errcode = 'P0001';
  end if;

  -- Validate unit belongs to class's course
  select u.content_version into v_unit_content_version
  from public.units as u
  join public.classes as c on c.id = target_class_id and c.course_id = u.course_id
  where u.id = target_unit_id;

  if not found then
    raise exception 'Unit does not belong to the class course'
      using errcode = 'P0001';
  end if;

  -- Fetch existing unit_progress row if any for old_data
  select up.* into old_row
  from public.unit_progress as up
  where up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = target_unit_id
  for update;

  if found then
    v_old_data := jsonb_build_object(
      'progress_percent', old_row.progress_percent,
      'passed', old_row.passed
    );
  else
    v_old_data := null;
  end if;

  -- Upsert unit_progress
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
    target_student_id,
    target_class_id,
    target_unit_id,
    case when target_passed then 'completed' else 'in_progress' end,
    target_progress_percent,
    0,
    1,
    target_progress_percent,
    target_passed,
    v_unit_content_version,
    1,
    now(),
    now(),
    case when target_passed then now() else null end,
    actor_id,
    now()
  )
  on conflict (student_id, class_id, unit_id) do update
  set status = case when excluded.passed then 'completed' else 'in_progress' end,
      progress_percent = excluded.progress_percent,
      approved_score = excluded.approved_score,
      passed = excluded.passed,
      approved_by = excluded.approved_by,
      approved_at = excluded.approved_at,
      last_activity_at = now(),
      completed_at = case when excluded.passed then now() else null end
  returning id into progress_id;

  -- Insert into append-only audit_logs
  perform private.write_audit_log(
    actor_id,
    'unit_progress.teacher_override',
    'unit_progress',
    progress_id,
    target_class_id,
    v_old_data,
    jsonb_build_object(
      'progress_percent', target_progress_percent,
      'passed', target_passed
    ),
    target_reason,
    jsonb_build_object('channel', 'teacher_override')
  );

  return progress_id;
end;
$function$;

revoke all on function private.override_unit_progress(uuid, uuid, uuid, numeric, boolean, text, uuid) from public, anon, authenticated;
grant execute on function private.override_unit_progress(uuid, uuid, uuid, numeric, boolean, text, uuid) to service_role;

commit;
