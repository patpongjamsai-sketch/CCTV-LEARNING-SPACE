-- LAB 1: ชุดตรวจสอบ
-- แนะนำให้เลือกและ Run ทีละ Section เพื่ออ่านผลลัพธ์

-- SECTION A: ตรวจจำนวนข้อมูล
select
  (select count(*) from public.courses where code = '21909-2020') as course_count,
  (
    select count(*)
    from public.units u
    join public.courses c on c.id = u.course_id
    where c.code = '21909-2020'
  ) as unit_count;

-- คาดหวัง course_count = 1 และ unit_count = 8

-- SECTION B: ตรวจ Primary, Foreign, Unique และ Check Constraints
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
  'public.profiles'::regclass,
  'public.courses'::regclass,
  'public.units'::regclass
)
-- ใช้ Expression ต้นฉบับเมื่อ Cast สำหรับ ORDER BY
-- PostgreSQL ไม่อนุญาตให้นำ Alias table_name ไป Cast เป็น table_name::text ตรงนี้
order by conrelid::regclass::text, constraint_type, constraint_name;

-- SECTION C: ตรวจ Index
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'courses', 'units')
order by tablename, indexname;

-- SECTION D: ตรวจว่าเปิด RLS ครบ
select
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as force_rls
from pg_class
where oid in (
  'public.profiles'::regclass,
  'public.courses'::regclass,
  'public.units'::regclass
)
order by relname;

-- คาดหวัง rls_enabled = true ทั้ง 3 ตาราง

-- SECTION E: ตรวจ Policies
select
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'courses', 'units')
order by tablename, policyname;

-- SECTION F: ตรวจสิทธิ์ระดับตาราง
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles', 'courses', 'units')
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;

-- SECTION G: ตรวจสิทธิ์ระดับ Column
select
  grantee,
  table_name,
  column_name,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
order by column_name, privilege_type;

-- SECTION H: Negative Tests แบบจับ Error เพื่อให้ Script ทำงานต่อได้
do $$
declare
  target_course_id bigint;
begin
  select id into target_course_id
  from public.courses
  where code = '21909-2020';

  -- Test 1: Course Code ซ้ำ
  begin
    insert into public.courses (code, title, total_hours)
    values ('21909-2020', 'รายการซ้ำ', 72);
    raise exception 'FAILED: duplicate course code was accepted';
  exception
    when unique_violation then
      raise notice 'PASS: unique constraint rejected duplicate course code';
  end;

  -- Test 2: Sequence เป็น 0
  begin
    insert into public.units (
      course_id, sequence_no, slug, title, estimated_minutes
    ) values (
      target_course_id, 0, 'invalid-sequence', 'หน่วยที่ไม่ถูกต้อง', 60
    );
    raise exception 'FAILED: invalid sequence was accepted';
  exception
    when check_violation then
      raise notice 'PASS: check constraint rejected sequence 0';
  end;

  -- Test 3: Course ID ไม่มีจริง
  begin
    insert into public.units (
      course_id, sequence_no, slug, title, estimated_minutes
    ) values (
      9223372036854775807, 9, 'missing-course', 'หน่วยกำพร้า', 60
    );
    raise exception 'FAILED: missing foreign key was accepted';
  exception
    when foreign_key_violation then
      raise notice 'PASS: foreign key rejected unknown course_id';
  end;
end $$;

-- SECTION I: ตรวจว่าข้อมูลยังคงถูกต้องหลัง Negative Tests
select c.code, count(u.id) as unit_count
from public.courses c
left join public.units u on u.course_id = c.id
where c.code = '21909-2020'
group by c.code;

-- SECTION J: จำลองการอ่านผ่าน Role authenticated
-- คาดหวัง course_count = 1 และ visible_unit_count = 1
-- เพราะ Unit 01 Published ส่วน Unit 02-08 ยังเป็น Draft
begin;
set local role authenticated;

select count(*) as course_count
from public.courses
where code = '21909-2020';

select count(*) as visible_unit_count
from public.units u
join public.courses c on c.id = u.course_id
where c.code = '21909-2020';

rollback;
