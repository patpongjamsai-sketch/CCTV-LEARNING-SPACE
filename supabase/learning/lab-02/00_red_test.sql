-- LAB 2: RED ก่อนสร้าง และ GREEN หลังสร้าง
-- Production change ที่ Test นี้ตรวจจับ: ตารางหาย หรือ RLS ถูกปิด

do $$
declare
  v_missing_tables text;
  v_rls_disabled text;
begin
  select string_agg(required_table, ', ' order by required_table)
    into v_missing_tables
  from unnest(array['classrooms', 'classroom_members', 'unit_progress']) as required_table
  where to_regclass('public.' || required_table) is null;

  if v_missing_tables is not null then
    raise exception 'LAB 2 RED: missing tables: %', v_missing_tables;
  end if;

  select string_agg(c.relname, ', ' order by c.relname)
    into v_rls_disabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('classrooms', 'classroom_members', 'unit_progress')
    and not c.relrowsecurity;

  if v_rls_disabled is not null then
    raise exception 'LAB 2 RED: RLS disabled on: %', v_rls_disabled;
  end if;

  raise notice 'LAB 2 GREEN: required tables and RLS are ready';
end
$$;

