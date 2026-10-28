begin;

-- 1. Table: public.class_approvals
-- Stores class-wide approvals for each unit set by teachers
create table if not exists public.class_approvals (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  unit_sequence integer not null check (unit_sequence between 1 and 8),
  lab_unlocked boolean not null default false,
  unit_unlocked boolean not null default true,
  assessment_unlocked boolean not null default false,
  passed boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint class_approvals_class_unit_seq unique (class_id, unit_sequence)
);

-- 2. Table: public.subjective_submissions
-- Stores student submissions for Evidence-Based Diagnostic Assessment (แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน)
create table if not exists public.subjective_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  unit_sequence integer not null check (unit_sequence between 1 and 8),
  question_id text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted',
  score numeric,
  feedback text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjective_submissions_student_unit_key unique (student_id, unit_sequence, question_id)
);

-- Enable RLS
alter table public.class_approvals enable row level security;
alter table public.subjective_submissions enable row level security;

-- Class approvals RLS
drop policy if exists class_approvals_select_policy on public.class_approvals;
create policy class_approvals_select_policy on public.class_approvals
  for select to authenticated using (true);

drop policy if exists class_approvals_all_policy on public.class_approvals;
create policy class_approvals_all_policy on public.class_approvals
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
        and profiles.active = true
    )
  );

-- Subjective submissions RLS
drop policy if exists subjective_submissions_select_policy on public.subjective_submissions;
create policy subjective_submissions_select_policy on public.subjective_submissions
  for select to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
        and profiles.active = true
    )
  );

drop policy if exists subjective_submissions_insert_policy on public.subjective_submissions;
create policy subjective_submissions_insert_policy on public.subjective_submissions
  for insert to authenticated
  with check (
    student_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
        and profiles.active = true
    )
  );

drop policy if exists subjective_submissions_update_policy on public.subjective_submissions;
create policy subjective_submissions_update_policy on public.subjective_submissions
  for update to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('teacher', 'admin')
        and profiles.active = true
    )
  );

-- 3. Update private.is_unit_unlocked
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
  v_class_lab_unlocked boolean;
  v_class_unit_unlocked boolean;
  v_has_subjective boolean;
begin
  if not private.is_class_student(target_class_id, target_student_id) then
    return false;
  end if;

  select u.id, u.sequence_no, u.course_id, u.content_version
  into v_current_unit
  from public.units as u
  join public.classes as c on c.id = target_class_id and c.course_id = u.course_id
  where u.id = target_unit_id
    and u.status = 'published';

  if not found then
    return false;
  end if;

  -- 1. Check if teacher override explicitly set passed for this unit
  select al.new_data ->> 'passed' into v_override_passed
  from public.audit_logs as al
  join public.unit_progress as up on up.id = al.entity_id
  where al.entity_table = 'unit_progress'
    and al.action = 'unit_progress.teacher_override'
    and up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = v_current_unit.id
  order by al.event_seq desc, al.occurred_at desc, al.id desc
  limit 1;

  if v_override_passed = 'true' then
    return true;
  elsif v_override_passed = 'false' then
    return false;
  end if;

  -- 2. Check if teacher unlocked lab or unit for this class via class_approvals
  select ca.lab_unlocked, ca.unit_unlocked
  into v_class_lab_unlocked, v_class_unit_unlocked
  from public.class_approvals as ca
  where ca.class_id = target_class_id
    and ca.unit_sequence = v_current_unit.sequence_no;

  if v_class_lab_unlocked = true or v_class_unit_unlocked = true then
    return true;
  end if;

  -- 3. Check if student submitted subjective assessment ("แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน")
  select exists (
    select 1
    from public.subjective_submissions as ss
    where ss.student_id = target_student_id
      and ss.unit_sequence = v_current_unit.sequence_no
  ) into v_has_subjective;

  if v_has_subjective then
    return true;
  end if;

  -- 4. Check legacy pre-test if sequence_no = 1
  if v_current_unit.sequence_no = 1 then
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

  -- For sequence_no > 1, check prior unit completion
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

  if not private.is_unit_unlocked(target_student_id, target_class_id, v_prior_unit.id) then
    return false;
  end if;

  select al.new_data ->> 'passed' into v_override_passed
  from public.audit_logs as al
  join public.unit_progress as up on up.id = al.entity_id
  where al.entity_table = 'unit_progress'
    and al.action = 'unit_progress.teacher_override'
    and up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = v_prior_unit.id
  order by al.event_seq desc, al.occurred_at desc, al.id desc
  limit 1;

  if v_override_passed is not null then
    return v_override_passed = 'true';
  end if;

  select up.passed into v_up_passed
  from public.unit_progress as up
  where up.student_id = target_student_id
    and up.class_id = target_class_id
    and up.unit_id = v_prior_unit.id;

  return coalesce(v_up_passed, false);
end;
$function$;

revoke all on function private.is_unit_unlocked(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function private.is_unit_unlocked(uuid, uuid, uuid) to service_role;

commit;
