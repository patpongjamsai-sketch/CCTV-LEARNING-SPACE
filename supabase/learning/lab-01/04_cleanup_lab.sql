-- LAB 1: ล้างข้อมูลทดลอง
-- คำเตือน: Script นี้ลบตาราง profiles, courses และ units พร้อมข้อมูลทั้งหมด
-- ใช้เฉพาะ Development Project และตรวจชื่อ Project ก่อนกด Run

begin;

-- ลบตารางลูกก่อนตารางแม่
drop table if exists public.units;
drop table if exists public.courses;
drop table if exists public.profiles;

commit;

select 'LAB 1 cleanup completed' as result;

