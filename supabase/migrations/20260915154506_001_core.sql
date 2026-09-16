begin;

-- Internal helpers live outside the exposed public schema.
create schema if not exists private;
revoke all on schema private from public;

-- Supabase normally provides pgcrypto. IF NOT EXISTS keeps this safe on both
-- a fresh local PostgreSQL instance and the managed project.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Reconcile the partially-created development schema found on 2026-09-15.
-- The conversion preserves the existing course and eight unit rows while
-- replacing bigint identity keys with UUID keys.
do $migration$
declare
  courses_use_bigint boolean;
  units_exist boolean;
  units_use_bigint boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'id'
      and data_type <> 'uuid'
  ) into courses_use_bigint;

  select to_regclass('public.units') is not null into units_exist;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'units'
      and column_name = 'id'
      and data_type <> 'uuid'
  ) into units_use_bigint;

  if courses_use_bigint then
    alter table public.courses
      add column if not exists migration_uuid_id uuid;
    update public.courses
      set migration_uuid_id = gen_random_uuid()
      where migration_uuid_id is null;
    alter table public.courses
      alter column migration_uuid_id set default gen_random_uuid(),
      alter column migration_uuid_id set not null;

    if units_exist then
      alter table public.units
        add column if not exists migration_uuid_course_id uuid;
      update public.units as u
      set migration_uuid_course_id = c.migration_uuid_id
      from public.courses as c
      where u.course_id = c.id
        and u.migration_uuid_course_id is null;

      if exists (
        select 1 from public.units where migration_uuid_course_id is null
      ) then
        raise exception 'Cannot convert units.course_id: orphaned legacy course reference';
      end if;

      alter table public.units
        alter column migration_uuid_course_id set not null;

      if units_use_bigint then
        alter table public.units
          add column if not exists migration_uuid_id uuid;
        update public.units
          set migration_uuid_id = gen_random_uuid()
          where migration_uuid_id is null;
        alter table public.units
          alter column migration_uuid_id set default gen_random_uuid(),
          alter column migration_uuid_id set not null;
      end if;

      drop index if exists public.units_published_course_idx;
      alter table public.units drop constraint if exists units_course_id_fkey;
      alter table public.units drop constraint if exists units_course_id_sequence_no_key;
      alter table public.units drop constraint if exists units_course_id_slug_key;
      alter table public.units drop constraint if exists units_pkey;
      alter table public.units drop column course_id;
      alter table public.units rename column migration_uuid_course_id to course_id;

      if units_use_bigint then
        alter table public.units drop column id;
        alter table public.units rename column migration_uuid_id to id;
      end if;
    end if;

    alter table public.courses drop constraint if exists courses_pkey;
    alter table public.courses drop column id;
    alter table public.courses rename column migration_uuid_id to id;
  end if;
end
$migration$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique,
  display_name text not null,
  role text not null default 'student',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_role_check,
  drop constraint if exists profiles_display_name_check,
  drop constraint if exists profiles_student_code_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('student', 'teacher', 'admin')),
  add constraint profiles_display_name_check
    check (char_length(btrim(display_name)) between 1 and 100),
  add constraint profiles_student_code_check
    check (
      student_code is null
      or char_length(btrim(student_code)) between 1 and 30
    );

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  title text not null,
  curriculum text,
  description text,
  total_hours smallint not null,
  content_version integer not null default 1,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'published_version'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'content_version'
  ) then
    alter table public.courses rename column published_version to content_version;
  end if;
end
$migration$;

alter table public.courses
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists content_version integer not null default 1;

update public.courses
set slug = coalesce(
  nullif(
    btrim(
      regexp_replace(lower(code), '[^a-z0-9]+', '-', 'g'),
      '-'
    ),
    ''
  ),
  'course-' || left(id::text, 8)
)
where slug is null or btrim(slug) = '';

with duplicate_slugs as (
  select
    id,
    slug,
    row_number() over (partition by slug order by id) as duplicate_number
  from public.courses
)
update public.courses as c
set slug = c.slug || '-' || left(c.id::text, 8)
from duplicate_slugs as d
where c.id = d.id
  and d.duplicate_number > 1;

alter table public.courses
  alter column id set default gen_random_uuid(),
  alter column slug set not null,
  alter column content_version set default 1,
  alter column content_version set not null;

alter table public.courses
  drop constraint if exists courses_code_check,
  drop constraint if exists courses_slug_check,
  drop constraint if exists courses_title_check,
  drop constraint if exists courses_total_hours_check,
  drop constraint if exists courses_content_version_check,
  drop constraint if exists courses_published_version_check,
  drop constraint if exists courses_status_check,
  drop constraint if exists courses_slug_key;

alter table public.courses
  add constraint courses_code_check
    check (char_length(btrim(code)) between 1 and 30),
  add constraint courses_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint courses_title_check
    check (char_length(btrim(title)) between 1 and 200),
  add constraint courses_total_hours_check
    check (total_hours > 0),
  add constraint courses_content_version_check
    check (content_version > 0),
  add constraint courses_status_check
    check (status in ('draft', 'published', 'archived')),
  add constraint courses_slug_key unique (slug);

do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.courses'::regclass and contype = 'p'
  ) then
    alter table public.courses add constraint courses_pkey primary key (id);
  end if;
end
$migration$;

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  sequence_no smallint not null,
  slug text not null,
  title text not null,
  description text,
  estimated_minutes integer not null,
  content_version integer not null default 1,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sequence_no),
  unique (course_id, slug)
);

alter table public.units
  add column if not exists description text,
  add column if not exists content_version integer not null default 1;

alter table public.units
  alter column id set default gen_random_uuid(),
  alter column content_version set default 1,
  alter column content_version set not null;

alter table public.units
  drop constraint if exists units_sequence_no_check,
  drop constraint if exists units_slug_check,
  drop constraint if exists units_title_check,
  drop constraint if exists units_estimated_minutes_check,
  drop constraint if exists units_content_version_check,
  drop constraint if exists units_status_check;

alter table public.units
  add constraint units_sequence_no_check
    check (sequence_no between 1 and 99),
  add constraint units_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint units_title_check
    check (char_length(btrim(title)) between 1 and 200),
  add constraint units_estimated_minutes_check
    check (estimated_minutes > 0),
  add constraint units_content_version_check
    check (content_version > 0),
  add constraint units_status_check
    check (status in ('draft', 'published', 'archived'));

do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.units'::regclass and contype = 'p'
  ) then
    alter table public.units add constraint units_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.units'::regclass
      and contype = 'f'
      and confrelid = 'public.courses'::regclass
  ) then
    alter table public.units
      add constraint units_course_id_fkey
      foreign key (course_id) references public.courses(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.units'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) like '%course_id, sequence_no%'
  ) then
    alter table public.units
      add constraint units_course_id_sequence_no_key
      unique (course_id, sequence_no);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.units'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) like '%course_id, slug%'
  ) then
    alter table public.units
      add constraint units_course_id_slug_key unique (course_id, slug);
  end if;
end
$migration$;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  code text not null,
  title text not null,
  academic_year smallint not null,
  semester smallint not null,
  status text not null default 'planned',
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_code_check
    check (char_length(btrim(code)) between 1 and 40),
  constraint classes_title_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint classes_academic_year_check
    check (academic_year between 2000 and 3000),
  constraint classes_semester_check
    check (semester between 1 and 3),
  constraint classes_status_check
    check (status in ('planned', 'active', 'completed', 'archived')),
  constraint classes_date_range_check
    check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint classes_course_period_code_key
    unique (course_id, academic_year, semester, code)
);

create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_members_role_check
    check (member_role in ('student', 'teacher')),
  constraint class_members_dates_check
    check (left_at is null or left_at >= joined_at),
  constraint class_members_class_profile_key unique (class_id, profile_id)
);

create table public.unit_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  status text not null default 'not_started',
  progress_percent numeric(5,2) not null default 0,
  time_spent_seconds bigint not null default 0,
  attempt_count integer not null default 0,
  approved_score numeric(8,2),
  passed boolean,
  content_version integer not null,
  scoring_version integer not null,
  started_at timestamptz,
  last_activity_at timestamptz,
  completed_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unit_progress_status_check
    check (status in ('not_started', 'in_progress', 'completed')),
  constraint unit_progress_percent_check
    check (progress_percent between 0 and 100),
  constraint unit_progress_time_check check (time_spent_seconds >= 0),
  constraint unit_progress_attempt_count_check check (attempt_count >= 0),
  constraint unit_progress_score_check
    check (approved_score is null or approved_score between 0 and 100),
  constraint unit_progress_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint unit_progress_pass_provenance_check
    check (
      passed is distinct from true
      or (approved_score is not null and approved_at is not null)
    ),
  constraint unit_progress_student_class_unit_key
    unique (student_id, class_id, unit_id)
);

create index if not exists units_course_sequence_idx
  on public.units (course_id, sequence_no);
create index if not exists units_published_course_idx
  on public.units (course_id, sequence_no)
  where status = 'published';
create index if not exists classes_course_period_idx
  on public.classes (course_id, academic_year, semester);
create index if not exists class_members_profile_active_idx
  on public.class_members (profile_id, active, class_id);
create index if not exists class_members_teacher_class_idx
  on public.class_members (class_id, profile_id)
  where member_role = 'teacher' and active;
create index if not exists unit_progress_student_class_idx
  on public.unit_progress (student_id, class_id, unit_id);
create index if not exists unit_progress_class_unit_idx
  on public.unit_progress (class_id, unit_id);

commit;

