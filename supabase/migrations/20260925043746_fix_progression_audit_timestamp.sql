begin;

-- เพิ่มลำดับเหตุการณ์ที่เชื่อถือได้ แม้ audit หลายรายการจะเกิดใน transaction เดียวกัน
create sequence if not exists private.audit_log_event_seq;

alter table public.audit_logs
  add column if not exists event_seq bigint
  not null default nextval('private.audit_log_event_seq'::regclass);

-- แก้ฟังก์ชันปลดล็อกให้ใช้ event_seq เป็นลำดับหลัก
-- โดยคงกติกา unlock เดิมทั้งหมดไว้
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

  if v_current_unit.sequence_no = 1 then
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

  if not coalesce(v_up_passed, false) then
    return false;
  end if;

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

commit;
