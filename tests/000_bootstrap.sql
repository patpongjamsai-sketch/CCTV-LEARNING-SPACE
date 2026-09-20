\set ON_ERROR_STOP on

-- สภาพแวดล้อมจำลองเฉพาะสำหรับทดสอบ migration บน PostgreSQL 17
-- ไม่ใช่ส่วนที่จะนำไปรันบน Supabase project จริง
create schema if not exists auth;
create schema if not exists extensions;
create schema if not exists storage;
create schema if not exists test_support;

-- จำลองตารางที่ Supabase Storage จัดเตรียมให้ในฐานข้อมูลจริง
-- เพื่อให้ migration ตั้งค่า bucket ได้ใน PostgreSQL test container แบบ standalone
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

do $roles$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$roles$;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
set search_path = ''
as $function$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$function$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
set search_path = ''
as $function$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  )
$function$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;

create or replace function test_support.assert_true(
  condition boolean,
  message text
)
returns void
language plpgsql
as $function$
begin
  if condition is distinct from true then
    raise exception 'ASSERTION FAILED: %', message;
  end if;
end
$function$;

create or replace function test_support.assert_raises(
  expected_sqlstate text,
  statement_to_run text,
  message text
)
returns void
language plpgsql
as $function$
declare
  observed_sqlstate text;
begin
  begin
    execute statement_to_run;
  exception when others then
    get stacked diagnostics observed_sqlstate = returned_sqlstate;
    if observed_sqlstate = expected_sqlstate then
      return;
    end if;
    raise exception
      'ASSERTION FAILED: % (expected SQLSTATE %, got %)',
      message,
      expected_sqlstate,
      observed_sqlstate;
  end;

  raise exception
    'ASSERTION FAILED: % (statement unexpectedly succeeded)',
    message;
end
$function$;

grant usage on schema test_support to public;
grant execute on all functions in schema test_support to public;
