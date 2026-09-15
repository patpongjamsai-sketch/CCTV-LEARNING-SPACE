-- LAB 1: เพิ่มรายวิชา 21909-2020 และ 8 หน่วย
-- Script นี้ใช้ ON CONFLICT เพื่อให้ทดลองรันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ

insert into public.courses (
  code,
  title,
  curriculum,
  total_hours,
  published_version,
  status
)
values (
  '21909-2020',
  'กล้องวงจรปิดบนระบบเครือข่าย',
  'หลักสูตรประกาศนียบัตรวิชาชีพ พ.ศ. 2567',
  72,
  1,
  'published'
)
on conflict (code) do update
set
  title = excluded.title,
  curriculum = excluded.curriculum,
  total_hours = excluded.total_hours,
  published_version = excluded.published_version,
  status = excluded.status,
  updated_at = now();

with target_course as (
  select id from public.courses where code = '21909-2020'
), seed_units(sequence_no, slug, title, estimated_minutes, status) as (
  values
    (1, 'cctv-foundations', 'พื้นฐานและองค์ประกอบระบบ CCTV', 540, 'published'),
    (2, 'camera-selection', 'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง', 540, 'draft'),
    (3, 'cabling-installation', 'ระบบสาย การเชื่อมต่อ และการติดตั้ง', 540, 'draft'),
    (4, 'ip-camera-networking', 'เครือข่ายสำหรับกล้อง IP', 540, 'draft'),
    (5, 'dvr-nvr-configuration', 'การตั้งค่า DVR และ NVR', 540, 'draft'),
    (6, 'recording-storage-remote', 'การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล', 540, 'draft'),
    (7, 'troubleshooting-maintenance', 'การตรวจสอบ แก้ไขปัญหา และบำรุงรักษา', 540, 'draft'),
    (8, 'cctv-integrated-project', 'โครงงานบูรณาการระบบ CCTV', 540, 'draft')
)
insert into public.units (
  course_id,
  sequence_no,
  slug,
  title,
  estimated_minutes,
  content_version,
  status
)
select
  target_course.id,
  seed_units.sequence_no,
  seed_units.slug,
  seed_units.title,
  seed_units.estimated_minutes,
  1,
  seed_units.status
from target_course
cross join seed_units
on conflict (course_id, sequence_no) do update
set
  slug = excluded.slug,
  title = excluded.title,
  estimated_minutes = excluded.estimated_minutes,
  content_version = excluded.content_version,
  status = excluded.status,
  updated_at = now();

select
  c.code,
  c.title as course_title,
  count(u.id) as unit_count,
  sum(u.estimated_minutes) as total_estimated_minutes
from public.courses c
left join public.units u on u.course_id = c.id
where c.code = '21909-2020'
group by c.id, c.code, c.title;

select
  u.sequence_no,
  u.slug,
  u.title,
  u.status
from public.units u
join public.courses c on c.id = u.course_id
where c.code = '21909-2020'
order by u.sequence_no;

