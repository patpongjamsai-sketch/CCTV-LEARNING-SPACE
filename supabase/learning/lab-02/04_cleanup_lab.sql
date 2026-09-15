-- LAB 2: ล้างวัตถุทดลอง
-- คำเตือน: ลบห้อง สมาชิก และ Progress ทั้งหมดของ LAB 2
-- ใช้เฉพาะ Development Project และตรวจชื่อ Project ก่อนกด Run

begin;

-- Policy ของ classrooms อ้างถึง classroom_members จึงต้องลบ Dependency ก่อน
drop policy if exists classrooms_select_member_or_teacher
  on public.classrooms;

drop table if exists public.unit_progress;
drop table if exists public.classroom_members;
drop table if exists public.classrooms;

drop function if exists private.is_classroom_teacher(bigint);

alter table if exists public.units
  drop constraint if exists units_id_course_id_key;

commit;

select 'LAB 2 cleanup completed' as result;
