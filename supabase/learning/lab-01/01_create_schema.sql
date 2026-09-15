-- LAB 1: สร้าง profiles, courses และ units
-- ใช้เฉพาะ Supabase Development Project

begin;

-- 1) Profile ใช้ UUID เดียวกับ Supabase Auth User
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique,
  display_name text not null check (char_length(trim(display_name)) between 1 and 100),
  role text not null default 'student'
    check (role in ('student', 'teacher', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Bigint Identity เหมาะกับข้อมูลที่สร้างในฐานข้อมูลเดียวและเรียงตามลำดับได้ดี
create table public.courses (
  id bigint generated always as identity primary key,
  code text not null unique check (char_length(trim(code)) between 1 and 30),
  title text not null check (char_length(trim(title)) between 1 and 200),
  curriculum text,
  total_hours smallint not null check (total_hours > 0),
  published_version integer not null default 1 check (published_version > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Unit ต้องสังกัด Course ที่มีอยู่จริง
create table public.units (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  sequence_no smallint not null check (sequence_no between 1 and 99),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 1 and 200),
  estimated_minutes integer not null check (estimated_minutes > 0),
  content_version integer not null default 1 check (content_version > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sequence_no),
  unique (course_id, slug)
);

-- Foreign Key ไม่ได้สร้าง Index ให้อัตโนมัติ
-- Partial Index นี้รองรับหน้ารายวิชาที่อ่านเฉพาะหน่วย Published
create index units_published_course_idx
  on public.units (course_id, sequence_no)
  where status = 'published';

-- 4) เปิด RLS ทุกตารางใน public
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.units enable row level security;

-- 5) เริ่มจากไม่มีสิทธิ์ แล้วให้คืนเฉพาะสิ่งที่แอปต้องใช้
revoke all on table public.profiles, public.courses, public.units
  from anon, authenticated;

-- ผู้ที่ Login อ่าน Profile ของตน และแก้ได้เฉพาะ display_name
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

-- ผู้ที่ Login อ่าน Course และ Unit ได้ แต่ Browser เขียนไม่ได้
grant select on table public.courses, public.units to authenticated;

-- 6) Profile Policies
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 7) Course และ Unit Policies: อ่านได้เฉพาะ Published
create policy courses_select_published
  on public.courses
  for select
  to authenticated
  using (status = 'published');

create policy units_select_published
  on public.units
  for select
  to authenticated
  using (status = 'published');

commit;

select 'LAB 1 schema created successfully' as result;

