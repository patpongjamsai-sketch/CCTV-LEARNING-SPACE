-- Migration: 20261001150000_pv_classes_and_join_flow.sql
-- Seed or update classes for PV1, PV2, PV3 (ปวช.1 กลุ่ม 1, กลุ่ม 2, กลุ่ม 3)

do $$
declare
  v_course_id uuid;
begin
  select id into v_course_id
  from public.courses
  where code = '21909-2020'
  limit 1;

  if v_course_id is not null then
    -- Class 1 (PV1)
    insert into public.classes (
      id, course_id, code, title, academic_year, semester, status
    ) values (
      '22222222-2222-4222-8222-222222222222',
      v_course_id,
      'PV1',
      'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 1',
      2569,
      2,
      'active'
    )
    on conflict (id) do update
    set code = 'PV1',
        title = 'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 1',
        status = 'active';

    -- Class 2 (PV2)
    insert into public.classes (
      id, course_id, code, title, academic_year, semester, status
    ) values (
      '22222222-2222-4222-8222-222222222223',
      v_course_id,
      'PV2',
      'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 2',
      2569,
      2,
      'active'
    )
    on conflict (id) do update
    set code = 'PV2',
        title = 'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 2',
        status = 'active';

    -- Class 3 (PV3)
    insert into public.classes (
      id, course_id, code, title, academic_year, semester, status
    ) values (
      '22222222-2222-4222-8222-222222222224',
      v_course_id,
      'PV3',
      'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 3',
      2569,
      2,
      'active'
    )
    on conflict (id) do update
    set code = 'PV3',
        title = 'ปวช.1 ช่างไฟฟ้ากำลัง - กลุ่ม 3',
        status = 'active';
  end if;
end $$;
