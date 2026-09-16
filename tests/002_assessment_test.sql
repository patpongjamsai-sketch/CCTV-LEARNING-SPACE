\set ON_ERROR_STOP on

select test_support.assert_true(
  (
    select count(*) = 5
    from unnest(array[
      'quizzes', 'quiz_attempts', 'lab_submissions', 'evidence_files', 'audit_logs'
    ]) as required(table_name)
    where to_regclass(format('public.%I', required.table_name)) is not null
  ),
  '002 must create all five Level B tables'
);

select test_support.assert_true(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'quizzes', 'quiz_attempts', 'lab_submissions', 'evidence_files', 'audit_logs'
      )
      and column_name = 'id'
      and data_type <> 'uuid'
  ),
  'every Level B internal id must be UUID'
);

select test_support.assert_true(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quiz_attempts'
      and column_name in ('approved_score', 'passed', 'scoring_version')
  ) = 3,
  'quiz_attempts must carry trusted result and scoring provenance fields'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.quiz_attempts'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) like '%quiz_id, class_id, student_id, attempt_no%'
  ),
  'quiz attempts must have a stable per-student attempt sequence'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.lab_submissions'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%revision_required%'
      and pg_get_constraintdef(c.oid) like '%reviewing%'
  ),
  'LAB status constraint must include the approved workflow states'
);

select test_support.assert_true(
  exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.evidence_files'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%lab-evidence%'
  ),
  'evidence metadata must be pinned to the private lab-evidence bucket'
);
