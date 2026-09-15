-- LAB 2: ข้อมูลทดลอง
-- ก่อน Run ต้องสร้าง Auth User 2 คน แล้วแทน UUID ทั้งสองตำแหน่งด้านล่าง

begin;

do $$
declare
  v_teacher_id uuid := '<TEACHER_AUTH_UUID>';
  v_student_id uuid := '<STUDENT_AUTH_UUID>';
  v_course_id bigint;
  v_classroom_id bigint;
  v_first_unit_id bigint;
begin
  -- Profile ต้องใช้ UUID เดียวกับ auth.users
  insert into public.profiles (id, student_code, display_name, role)
  values (v_teacher_id, null, 'ครูผู้สอนทดลอง', 'teacher')
  on conflict (id) do update
    set display_name = excluded.display_name,
        role = excluded.role,
        active = true,
        updated_at = now();

  insert into public.profiles (id, student_code, display_name, role)
  values (v_student_id, 'TEST-001', 'ผู้เรียนทดลอง', 'student')
  on conflict (id) do update
    set student_code = excluded.student_code,
        display_name = excluded.display_name,
        role = excluded.role,
        active = true,
        updated_at = now();

  select id
    into strict v_course_id
  from public.courses
  where code = '21909-2020';

  insert into public.classrooms (
    course_id,
    teacher_id,
    classroom_code,
    name,
    academic_year,
    semester,
    status
  )
  values (
    v_course_id,
    v_teacher_id,
    'CCTV-2-69',
    'กล้องวงจรปิดระบบเครือข่าย ภาคเรียน 2/2569',
    2569,
    2,
    'active'
  )
  on conflict (classroom_code) do update
    set teacher_id = excluded.teacher_id,
        name = excluded.name,
        status = excluded.status,
        updated_at = now()
  returning id into v_classroom_id;

  insert into public.classroom_members (
    classroom_id,
    profile_id,
    member_role
  )
  values (v_classroom_id, v_student_id, 'student')
  on conflict (classroom_id, profile_id) do update
    set member_role = excluded.member_role,
        active = true;

  select id
    into strict v_first_unit_id
  from public.units
  where course_id = v_course_id
  order by sequence_no
  limit 1;

  insert into public.unit_progress (
    classroom_id,
    course_id,
    profile_id,
    unit_id,
    status,
    progress_percent
  )
  values (
    v_classroom_id,
    v_course_id,
    v_student_id,
    v_first_unit_id,
    'not_started',
    0
  )
  on conflict (classroom_id, profile_id, unit_id) do nothing;
end
$$;

commit;

select 'LAB 2 sample data created successfully' as result;

