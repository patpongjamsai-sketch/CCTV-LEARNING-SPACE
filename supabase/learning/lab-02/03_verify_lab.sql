-- LAB 2: ตรวจสอบโครงสร้าง ความสัมพันธ์ สิทธิ์ และข้อมูล
-- รันทีละ Section และเก็บ Screenshot เป็นหลักฐาน

-- Section A: ตารางและคอลัมน์
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  is_identity
from information_schema.columns
where table_schema = 'public'
  and table_name in ('classrooms', 'classroom_members', 'unit_progress')
order by table_name, ordinal_position;

-- Section B: Primary Key, Foreign Key, Unique และ Check Constraint
select
  conrelid::regclass as table_name,
  conname as constraint_name,
  case contype
    when 'p' then 'PRIMARY KEY'
    when 'f' then 'FOREIGN KEY'
    when 'u' then 'UNIQUE'
    when 'c' then 'CHECK'
    else contype::text
  end as constraint_type,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (
  'public.classrooms'::regclass,
  'public.classroom_members'::regclass,
  'public.unit_progress'::regclass
)
order by conrelid::regclass::text, constraint_type, constraint_name;

-- Section C: Index
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('classrooms', 'classroom_members', 'unit_progress')
order by tablename, indexname;

-- Section D: RLS และ Policy
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  p.policyname,
  p.cmd,
  p.roles,
  p.qual
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
left join pg_policies as p
  on p.schemaname = n.nspname
 and p.tablename = c.relname
where n.nspname = 'public'
  and c.relname in ('classrooms', 'classroom_members', 'unit_progress')
order by c.relname, p.policyname;

-- Section E: Browser ได้ SELECT แต่ไม่ได้ INSERT, UPDATE หรือ DELETE
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('classrooms', 'classroom_members', 'unit_progress')
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;

-- Section F: ตรวจ Helper ด้านความปลอดภัย
select
  n.nspname as function_schema,
  p.proname as function_name,
  p.prosecdef as security_definer,
  p.proconfig as function_config
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname = 'private'
  and p.proname = 'is_classroom_teacher';

-- Section G: ข้อมูลห้อง สมาชิก และความก้าวหน้า
select
  c.classroom_code,
  c.name as classroom_name,
  course.code as course_code,
  member.display_name,
  cm.member_role,
  u.sequence_no,
  u.title as unit_title,
  up.status,
  up.progress_percent,
  up.best_score,
  up.attempt_count
from public.classrooms as c
join public.courses as course on course.id = c.course_id
left join public.classroom_members as cm on cm.classroom_id = c.id
left join public.profiles as member on member.id = cm.profile_id
left join public.unit_progress as up
  on up.classroom_id = cm.classroom_id
 and up.profile_id = cm.profile_id
left join public.units as u on u.id = up.unit_id
order by c.classroom_code, member.display_name, u.sequence_no;

-- Section H: Automated Assertions ต้องจบโดยไม่มี ERROR
do $$
declare
  v_problem text;
begin
  select string_agg(c.relname, ', ' order by c.relname)
    into v_problem
  from pg_class as c
  join pg_namespace as n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('classrooms', 'classroom_members', 'unit_progress')
    and not c.relrowsecurity;

  if v_problem is not null then
    raise exception 'RLS is disabled on: %', v_problem;
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name in ('classrooms', 'classroom_members', 'unit_progress')
      and grantee in ('anon', 'authenticated')
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
  ) then
    raise exception 'Browser role has an unsafe write privilege';
  end if;

  if not exists (
    select 1
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = 'is_classroom_teacher'
      and p.prosecdef
      and exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) as setting
        where setting like 'search_path=%'
      )
  ) then
    raise exception 'Teacher helper is missing or search_path is not locked';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'classrooms_select_member_or_teacher',
        'classroom_members_select_self_or_teacher',
        'unit_progress_select_self_or_teacher'
      )
  ) <> 3 then
    raise exception 'One or more LAB 2 RLS policies are missing';
  end if;

  if (
    select count(*)
    from pg_constraint
    where conname in (
      'unit_progress_member_fk',
      'unit_progress_classroom_course_fk',
      'unit_progress_unit_course_fk',
      'unit_progress_state_check'
    )
      and conrelid = 'public.unit_progress'::regclass
  ) <> 4 then
    raise exception 'One or more LAB 2 integrity constraints are missing';
  end if;

  raise notice 'LAB 2 verification passed';
end
$$;
