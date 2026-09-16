begin;

-- Added from Supabase Performance Advisor after migrations 001-005. Each
-- index starts with its foreign-key column so parent updates/deletes and joins
-- remain efficient as classroom evidence grows.
create index certificates_course_id_idx
  on public.certificates (course_id);
create index certificates_issued_by_idx
  on public.certificates (issued_by);
create index certificates_revoked_by_idx
  on public.certificates (revoked_by);

create index game_attempts_evaluated_by_idx
  on public.game_attempts (evaluated_by);
create index game_attempts_mission_id_idx
  on public.game_attempts (mission_id);

create index game_mission_results_latest_attempt_id_idx
  on public.game_mission_results (latest_attempt_id);
create index game_mission_results_mission_id_idx
  on public.game_mission_results (mission_id);

create index game_sessions_room_id_idx
  on public.game_sessions (room_id);

create index lab_submissions_reviewed_by_idx
  on public.lab_submissions (reviewed_by);
create index lab_submissions_unit_id_idx
  on public.lab_submissions (unit_id);

create index quiz_attempts_approved_by_idx
  on public.quiz_attempts (approved_by);

create index unit_progress_approved_by_idx
  on public.unit_progress (approved_by);
create index unit_progress_unit_id_idx
  on public.unit_progress (unit_id);

commit;

