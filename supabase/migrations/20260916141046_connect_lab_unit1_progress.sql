begin;

-- A teacher-approved LAB is a trusted Unit 1 completion signal.  Keep this
-- synchronization in the database transaction that changes the LAB status so
-- a successful review can never be committed without its progress record.
create or replace function private.sync_lab_submission_unit_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  progress_id uuid;
  old_progress jsonb;
begin
  if new.status <> 'passed' or new.passed is not true then
    return new;
  end if;

  if not exists (
    select 1
    from public.evidence_files as ef
    where ef.lab_submission_id = new.id
  ) then
    raise exception 'A passed LAB requires at least one evidence file'
      using errcode = 'P0001';
  end if;

  select to_jsonb(up)
  into old_progress
  from public.unit_progress as up
  where up.student_id = new.student_id
    and up.class_id = new.class_id
    and up.unit_id = new.unit_id
  for update;

  insert into public.unit_progress (
    student_id,
    class_id,
    unit_id,
    status,
    progress_percent,
    time_spent_seconds,
    attempt_count,
    approved_score,
    passed,
    content_version,
    scoring_version,
    started_at,
    last_activity_at,
    completed_at,
    approved_by,
    approved_at
  )
  values (
    new.student_id,
    new.class_id,
    new.unit_id,
    'completed',
    100,
    coalesce((old_progress ->> 'time_spent_seconds')::bigint, 0),
    greatest(coalesce((old_progress ->> 'attempt_count')::integer, 0), new.attempt_no),
    new.approved_score,
    true,
    new.content_version,
    new.scoring_version,
    coalesce((old_progress ->> 'started_at')::timestamptz, new.created_at),
    now(),
    coalesce(new.reviewed_at, now()),
    new.reviewed_by,
    coalesce(new.reviewed_at, now())
  )
  on conflict (student_id, class_id, unit_id) do update
  set status = 'completed',
      progress_percent = 100,
      attempt_count = greatest(public.unit_progress.attempt_count, excluded.attempt_count),
      approved_score = greatest(coalesce(public.unit_progress.approved_score, 0), excluded.approved_score),
      passed = true,
      content_version = excluded.content_version,
      scoring_version = excluded.scoring_version,
      last_activity_at = now(),
      completed_at = excluded.completed_at,
      approved_by = excluded.approved_by,
      approved_at = excluded.approved_at
  returning id into progress_id;

  perform private.write_audit_log(
    new.reviewed_by,
    'unit_progress.lab_verified',
    'unit_progress',
    progress_id,
    new.class_id,
    old_progress,
    jsonb_build_object(
      'status', 'completed',
      'progress_percent', 100,
      'approved_score', new.approved_score,
      'passed', true,
      'source_lab_submission_id', new.id,
      'content_version', new.content_version,
      'scoring_version', new.scoring_version
    ),
    new.feedback,
    '{"channel":"lab_teacher_review"}'::jsonb
  );

  return new;
end;
$function$;

revoke all on function private.sync_lab_submission_unit_progress() from public, anon, authenticated;
grant execute on function private.sync_lab_submission_unit_progress() to service_role;

drop trigger if exists lab_submissions_sync_unit_progress on public.lab_submissions;
create trigger lab_submissions_sync_unit_progress
after update of status, approved_score, passed, reviewed_at, reviewed_by
on public.lab_submissions
for each row
when (new.status = 'passed' and new.passed is true)
execute function private.sync_lab_submission_unit_progress();

commit;
