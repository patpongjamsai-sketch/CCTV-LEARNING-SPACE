\set ON_ERROR_STOP on

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique,
  display_name text not null,
  role text not null default 'student'
    check (role in ('student', 'teacher', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id bigint generated always as identity primary key,
  code text not null unique,
  title text not null,
  curriculum text,
  total_hours smallint not null check (total_hours > 0),
  published_version integer not null default 1 check (published_version > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  sequence_no smallint not null,
  slug text not null,
  title text not null,
  estimated_minutes integer not null,
  content_version integer not null default 1,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sequence_no),
  unique (course_id, slug)
);

insert into public.courses (
  code, title, curriculum, total_hours, published_version, status
)
values (
  '21909-2020',
  'กล้องวงจรปิดบนระบบเครือข่าย',
  'หลักสูตรประกาศนียบัตรวิชาชีพ พ.ศ. 2567',
  72,
  1,
  'published'
);

insert into public.units (
  course_id, sequence_no, slug, title, estimated_minutes, content_version, status
)
select
  c.id,
  seed.sequence_no,
  seed.slug,
  seed.title,
  540,
  1,
  case when seed.sequence_no = 1 then 'published' else 'draft' end
from public.courses c
cross join (
  values
    (1, 'cctv-foundations', 'พื้นฐานและองค์ประกอบระบบ CCTV'),
    (2, 'camera-selection', 'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง'),
    (3, 'cabling-installation', 'ระบบสาย การเชื่อมต่อ และการติดตั้ง'),
    (4, 'ip-camera-networking', 'เครือข่ายสำหรับกล้อง IP'),
    (5, 'dvr-nvr-configuration', 'การตั้งค่า DVR และ NVR'),
    (6, 'recording-storage-remote', 'การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล'),
    (7, 'troubleshooting-maintenance', 'การตรวจสอบ แก้ไขปัญหา และบำรุงรักษา'),
    (8, 'cctv-integrated-project', 'โครงงานบูรณาการระบบ CCTV')
) as seed(sequence_no, slug, title)
where c.code = '21909-2020';

