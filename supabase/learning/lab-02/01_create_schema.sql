-- LAB 2: สร้างห้องเรียน สมาชิก และความก้าวหน้า
-- ต้องรัน LAB 1 สำเร็จก่อน และใช้เฉพาะ Supabase Development Project

begin;

-- 1) ห้องเรียนหนึ่งห้องเปิดจากหนึ่งรายวิชา และมีครูเจ้าของหนึ่งคน
create table public.classrooms (
  id bigint generated always as identity primary key,
  course_id bigint not null references public.courses(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  classroom_code text not null unique
    check (classroom_code ~ '^[A-Z0-9][A-Z0-9-]{2,29}$'),
  name text not null check (char_length(trim(name)) between 1 and 150),
  academic_year smallint not null check (academic_year between 2500 and 2700),
  semester smallint not null check (semester between 1 and 3),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classrooms_date_order_check
    check (ends_on is null or starts_on is null or ends_on >= starts_on),
  unique (id, course_id)
);

-- 2) สมาชิกต้องเป็น Profile ที่มีอยู่จริง และห้ามซ้ำในห้องเดียวกัน
create table public.classroom_members (
  classroom_id bigint not null references public.classrooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'student'
    check (member_role in ('student', 'assistant')),
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, profile_id)
);

-- 3) เพิ่ม Candidate Key ให้ units เพื่อบังคับว่า Unit และ Course ต้องคู่กัน
alter table public.units
  add constraint units_id_course_id_key unique (id, course_id);

-- 4) Progress ต้องเป็นของสมาชิกจริง และอยู่ใน Course เดียวกับ Classroom
create table public.unit_progress (
  classroom_id bigint not null,
  course_id bigint not null,
  profile_id uuid not null,
  unit_id bigint not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent smallint not null default 0
    check (progress_percent between 0 and 100),
  best_score numeric(5,2)
    check (best_score is null or best_score between 0 and 100),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (classroom_id, profile_id, unit_id),
  constraint unit_progress_member_fk
    foreign key (classroom_id, profile_id)
    references public.classroom_members(classroom_id, profile_id)
    on delete cascade,
  constraint unit_progress_classroom_course_fk
    foreign key (classroom_id, course_id)
    references public.classrooms(id, course_id)
    on delete cascade,
  constraint unit_progress_unit_course_fk
    foreign key (unit_id, course_id)
    references public.units(id, course_id)
    on delete cascade,
  constraint unit_progress_state_check check (
    (
      status = 'not_started'
      and progress_percent = 0
      and started_at is null
      and completed_at is null
    )
    or (
      status = 'in_progress'
      and progress_percent between 0 and 99
      and started_at is not null
      and completed_at is null
    )
    or (
      status = 'completed'
      and progress_percent = 100
      and started_at is not null
      and completed_at is not null
    )
  ),
  constraint unit_progress_time_order_check
    check (completed_at is null or started_at is null or completed_at >= started_at)
);

-- 5) Index สำหรับหน้าห้องเรียน รายชื่อสมาชิก และ Dashboard ความก้าวหน้า
create index classrooms_teacher_status_idx
  on public.classrooms (teacher_id, status);

create index classroom_members_profile_active_idx
  on public.classroom_members (profile_id, active);

create index unit_progress_profile_classroom_idx
  on public.unit_progress (profile_id, classroom_id);

create index unit_progress_classroom_status_idx
  on public.unit_progress (classroom_id, status);

-- 6) Helper ตรวจครูเจ้าของห้อง อยู่ใน schema ที่ไม่เปิดผ่าน Data API
create schema if not exists private;
-- ป้องกัน Client สร้างวัตถุใน private แต่ไม่เปลี่ยนสิทธิ์ USAGE เดิมของระบบอื่น
revoke create on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.is_classroom_teacher(p_classroom_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classrooms as c
    where c.id = p_classroom_id
      and c.teacher_id = (select auth.uid())
  );
$$;

revoke all on function private.is_classroom_teacher(bigint)
  from public, anon, authenticated;
grant execute on function private.is_classroom_teacher(bigint)
  to authenticated;

-- 7) เปิด RLS และกำหนดสิทธิ์ระดับตาราง
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;
alter table public.unit_progress enable row level security;

revoke all on table
  public.classrooms,
  public.classroom_members,
  public.unit_progress
from anon, authenticated;

grant select on table
  public.classrooms,
  public.classroom_members,
  public.unit_progress
to authenticated;

-- นักเรียนเห็นห้องที่ตนเป็นสมาชิก ครูเห็นห้องที่ตนเป็นเจ้าของ
create policy classrooms_select_member_or_teacher
  on public.classrooms
  for select
  to authenticated
  using (
    teacher_id = (select auth.uid())
    or exists (
      select 1
      from public.classroom_members as cm
      where cm.classroom_id = classrooms.id
        and cm.profile_id = (select auth.uid())
        and cm.active
    )
  );

-- สมาชิกเห็นข้อมูลของตน ครูเจ้าของห้องเห็นสมาชิกในห้องของตน
create policy classroom_members_select_self_or_teacher
  on public.classroom_members
  for select
  to authenticated
  using (
    profile_id = (select auth.uid())
    or private.is_classroom_teacher(classroom_id)
  );

-- นักเรียนเห็น Progress ของตน ครูเจ้าของห้องเห็น Progress ของห้อง
create policy unit_progress_select_self_or_teacher
  on public.unit_progress
  for select
  to authenticated
  using (
    profile_id = (select auth.uid())
    or private.is_classroom_teacher(classroom_id)
  );

commit;

select 'LAB 2 schema created successfully' as result;
