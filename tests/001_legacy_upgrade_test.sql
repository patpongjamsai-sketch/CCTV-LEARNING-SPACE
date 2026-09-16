\set ON_ERROR_STOP on

select test_support.assert_true(
  (
    select data_type = 'uuid'
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'id'
  ),
  'legacy courses.id must be converted from bigint to UUID'
);

select test_support.assert_true(
  (
    select count(*) = 2 and bool_and(data_type = 'uuid')
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'units'
      and column_name in ('id', 'course_id')
  ),
  'legacy units identifiers must be converted from bigint to UUID'
);

select test_support.assert_true(
  (select count(*) = 1 from public.courses where code = '21909-2020')
  and (select count(*) = 8 from public.units),
  'legacy course and all eight units must be preserved'
);

select test_support.assert_true(
  (
    select c.title = 'กล้องวงจรปิดบนระบบเครือข่าย'
      and c.content_version = 1
      and c.slug = '21909-2020'
    from public.courses c
    where c.code = '21909-2020'
  ),
  'legacy course content and version must survive migration'
);

select test_support.assert_true(
  not exists (
    select 1
    from public.units u
    left join public.courses c on c.id = u.course_id
    where c.id is null
  ),
  'legacy unit-to-course relationships must survive UUID conversion'
);
