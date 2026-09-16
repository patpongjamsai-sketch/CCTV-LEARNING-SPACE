begin;

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  code text not null,
  slug text not null,
  sequence_no smallint not null,
  title text not null,
  description text,
  max_score numeric(8,2) not null,
  passing_score numeric(8,2) not null,
  max_attempts integer,
  content_version integer not null,
  scoring_version integer not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_code_check
    check (char_length(btrim(code)) between 1 and 40),
  constraint missions_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint missions_sequence_check check (sequence_no between 1 and 99),
  constraint missions_title_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint missions_score_check
    check (
      max_score > 0
      and passing_score between 0 and max_score
    ),
  constraint missions_max_attempts_check
    check (max_attempts is null or max_attempts > 0),
  constraint missions_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint missions_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint missions_unit_sequence_version_key
    unique (unit_id, sequence_no, content_version),
  constraint missions_unit_code_version_key
    unique (unit_id, code, content_version),
  constraint missions_unit_slug_version_key
    unique (unit_id, slug, content_version)
);

create table public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  code text not null,
  slug text not null,
  title text not null,
  description text,
  scene_key text not null,
  content_version integer not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_rooms_code_check
    check (char_length(btrim(code)) between 1 and 40),
  constraint game_rooms_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint game_rooms_title_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint game_rooms_scene_key_check
    check (scene_key ~ '^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,199}$'),
  constraint game_rooms_content_version_check check (content_version > 0),
  constraint game_rooms_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint game_rooms_unit_code_version_key
    unique (unit_id, code, content_version),
  constraint game_rooms_unit_slug_version_key
    unique (unit_id, slug, content_version)
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  client_session_id uuid not null,
  status text not null default 'active',
  content_version integer not null,
  client_context jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  last_event_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_sessions_status_check
    check (status in ('active', 'completed', 'abandoned')),
  constraint game_sessions_content_version_check check (content_version > 0),
  constraint game_sessions_context_check
    check (
      jsonb_typeof(client_context) = 'object'
      and octet_length(client_context::text) <= 16384
    ),
  constraint game_sessions_time_check
    check (
      (last_event_at is null or last_event_at >= started_at)
      and (ended_at is null or ended_at >= started_at)
    ),
  constraint game_sessions_student_client_key
    unique (student_id, client_session_id)
);

create table public.game_checkpoints (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  sequence_no bigint not null,
  state jsonb not null,
  schema_version integer not null default 1,
  client_recorded_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  constraint game_checkpoints_sequence_check check (sequence_no >= 0),
  constraint game_checkpoints_state_check
    check (
      jsonb_typeof(state) = 'object'
      and octet_length(state::text) <= 65536
    ),
  constraint game_checkpoints_schema_version_check check (schema_version > 0),
  constraint game_checkpoints_session_sequence_key unique (session_id, sequence_no)
);

create table public.game_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  client_event_id uuid not null,
  sequence_no bigint not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  client_occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint game_events_sequence_check check (sequence_no > 0),
  constraint game_events_type_check
    check (event_type ~ '^[a-z][a-z0-9_.-]{1,79}$'),
  constraint game_events_payload_check
    check (
      jsonb_typeof(payload) = 'object'
      and octet_length(payload::text) <= 65536
    ),
  constraint game_events_schema_version_check check (schema_version > 0),
  constraint game_events_client_time_check
    check (client_occurred_at <= received_at + interval '5 minutes'),
  constraint game_events_session_sequence_key unique (session_id, sequence_no),
  constraint game_events_session_client_event_key unique (session_id, client_event_id)
);

create table public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete restrict,
  mission_id uuid not null references public.missions(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  attempt_no integer not null,
  approved_score numeric(8,2) not null,
  max_score_snapshot numeric(8,2) not null,
  passed boolean not null,
  hints_used integer not null default 0,
  content_version integer not null,
  scoring_version integer not null,
  evaluator_version text not null,
  first_event_sequence bigint not null,
  last_event_sequence bigint not null,
  result_details jsonb not null default '{}'::jsonb,
  evaluated_by uuid references public.profiles(id) on delete set null,
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint game_attempts_attempt_no_check check (attempt_no > 0),
  constraint game_attempts_score_check
    check (
      max_score_snapshot > 0
      and approved_score between 0 and max_score_snapshot
    ),
  constraint game_attempts_hints_check check (hints_used >= 0),
  constraint game_attempts_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint game_attempts_evaluator_check
    check (char_length(btrim(evaluator_version)) between 1 and 100),
  constraint game_attempts_event_range_check
    check (
      first_event_sequence > 0
      and last_event_sequence >= first_event_sequence
    ),
  constraint game_attempts_result_shape_check
    check (jsonb_typeof(result_details) = 'object'),
  constraint game_attempts_session_mission_attempt_key
    unique (session_id, mission_id, attempt_no)
);

create table public.game_mission_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  mission_id uuid not null references public.missions(id) on delete restrict,
  attempt_count integer not null,
  hints_used integer not null default 0,
  best_score numeric(8,2) not null,
  passed boolean not null,
  first_passed_at timestamptz,
  latest_attempt_id uuid not null
    references public.game_attempts(id) on delete restrict,
  content_version integer not null,
  scoring_version integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_mission_results_attempts_check check (attempt_count > 0),
  constraint game_mission_results_hints_check check (hints_used >= 0),
  constraint game_mission_results_score_check check (best_score >= 0),
  constraint game_mission_results_pass_time_check
    check (not passed or first_passed_at is not null),
  constraint game_mission_results_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint game_mission_results_student_class_mission_key
    unique (student_id, class_id, mission_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text not null unique,
  student_id uuid not null references public.profiles(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  source_game_attempt_id uuid not null unique
    references public.game_attempts(id) on delete restrict,
  content_version integer not null,
  scoring_version integer not null,
  issued_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  revocation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint certificates_number_check
    check (certificate_no ~ '^[A-Z0-9][A-Z0-9./-]{5,79}$'),
  constraint certificates_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint certificates_revocation_check
    check (
      (revoked_at is null and revoked_by is null and revocation_reason is null)
      or (
        revoked_at is not null
        and revoked_by is not null
        and char_length(btrim(revocation_reason)) between 1 and 500
      )
    ),
  constraint certificates_metadata_shape_check
    check (jsonb_typeof(metadata) = 'object')
);

create index missions_unit_status_idx
  on public.missions (unit_id, status, sequence_no, content_version);
create index game_rooms_unit_status_idx
  on public.game_rooms (unit_id, status, content_version);
create index game_sessions_student_started_idx
  on public.game_sessions (student_id, started_at desc);
create index game_sessions_class_started_idx
  on public.game_sessions (class_id, started_at desc);
create index game_sessions_active_idx
  on public.game_sessions (student_id, started_at desc)
  where status = 'active';
create index game_checkpoints_session_latest_idx
  on public.game_checkpoints (session_id, sequence_no desc);
create index game_events_session_received_idx
  on public.game_events (session_id, received_at, sequence_no);
create index game_events_type_received_idx
  on public.game_events (event_type, received_at desc);
create index game_attempts_student_mission_idx
  on public.game_attempts (student_id, mission_id, evaluated_at desc);
create index game_attempts_class_mission_idx
  on public.game_attempts (class_id, mission_id, evaluated_at desc);
create index game_mission_results_class_mission_idx
  on public.game_mission_results (class_id, mission_id, passed);
create index certificates_student_issued_idx
  on public.certificates (student_id, issued_at desc);
create index certificates_class_issued_idx
  on public.certificates (class_id, issued_at desc);

commit;

