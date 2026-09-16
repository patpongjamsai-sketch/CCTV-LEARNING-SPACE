begin;

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  code text not null,
  slug text not null,
  quiz_type text not null,
  title text not null,
  instructions text,
  max_score numeric(8,2) not null,
  passing_percentage numeric(5,2) not null,
  time_limit_minutes integer,
  content_version integer not null,
  scoring_version integer not null,
  status text not null default 'draft',
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quizzes_code_check
    check (char_length(btrim(code)) between 1 and 40),
  constraint quizzes_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint quizzes_type_check
    check (quiz_type in ('pre', 'post', 'practice')),
  constraint quizzes_title_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint quizzes_max_score_check check (max_score > 0),
  constraint quizzes_passing_percentage_check
    check (passing_percentage between 0 and 100),
  constraint quizzes_time_limit_check
    check (time_limit_minutes is null or time_limit_minutes > 0),
  constraint quizzes_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint quizzes_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint quizzes_availability_check
    check (
      available_until is null
      or available_from is null
      or available_until >= available_from
    ),
  constraint quizzes_unit_code_version_key
    unique (unit_id, code, content_version),
  constraint quizzes_unit_slug_version_key
    unique (unit_id, slug, content_version)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  attempt_no integer not null,
  client_answers jsonb not null default '[]'::jsonb,
  raw_score numeric(8,2),
  approved_score numeric(8,2),
  score_percent numeric(5,2),
  passed boolean,
  status text not null default 'submitted',
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  duration_seconds integer,
  content_version integer not null,
  scoring_version integer not null,
  evaluator_version text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  evaluation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_attempts_attempt_no_check check (attempt_no > 0),
  constraint quiz_attempts_answers_shape_check
    check (
      jsonb_typeof(client_answers) in ('array', 'object')
      and octet_length(client_answers::text) <= 262144
    ),
  constraint quiz_attempts_scores_check
    check (
      (raw_score is null or raw_score >= 0)
      and (approved_score is null or approved_score >= 0)
      and (score_percent is null or score_percent between 0 and 100)
    ),
  constraint quiz_attempts_status_check
    check (status in ('submitted', 'approved', 'rejected')),
  constraint quiz_attempts_time_check
    check (
      submitted_at >= started_at
      and (duration_seconds is null or duration_seconds >= 0)
    ),
  constraint quiz_attempts_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint quiz_attempts_approval_check
    check (
      status <> 'approved'
      or (
        raw_score is not null
        and approved_score is not null
        and score_percent is not null
        and passed is not null
        and approved_at is not null
      )
    ),
  constraint quiz_attempts_quiz_class_student_attempt_key
    unique (quiz_id, class_id, student_id, attempt_no)
);

create table public.lab_submissions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  attempt_no integer not null,
  title text not null,
  student_notes text,
  status text not null default 'draft',
  approved_score numeric(5,2),
  passed boolean,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  feedback text,
  content_version integer not null,
  scoring_version integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lab_submissions_attempt_no_check check (attempt_no > 0),
  constraint lab_submissions_title_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint lab_submissions_status_check
    check (
      status in (
        'draft', 'submitted', 'reviewing', 'passed', 'revision_required'
      )
    ),
  constraint lab_submissions_score_check
    check (approved_score is null or approved_score between 0 and 100),
  constraint lab_submissions_versions_check
    check (content_version > 0 and scoring_version > 0),
  constraint lab_submissions_submission_time_check
    check (status = 'draft' or submitted_at is not null),
  constraint lab_submissions_review_check
    check (
      status not in ('passed', 'revision_required')
      or (
        reviewed_at is not null
        and reviewed_by is not null
        and passed is not null
      )
    ),
  constraint lab_submissions_pass_check
    check (
      status <> 'passed'
      or (passed and approved_score is not null)
    ),
  constraint lab_submissions_class_unit_student_attempt_key
    unique (class_id, unit_id, student_id, attempt_no)
);

create table public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  lab_submission_id uuid not null
    references public.lab_submissions(id) on delete cascade,
  storage_bucket text not null default 'lab-evidence',
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  file_size bigint not null,
  checksum_sha256 text,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint evidence_files_bucket_check
    check (storage_bucket = 'lab-evidence'),
  constraint evidence_files_path_check
    check (
      char_length(storage_path) between 5 and 1024
      and storage_path !~ '(^|/)\.\.(/|$)'
      and left(storage_path, 1) <> '/'
    ),
  constraint evidence_files_name_check
    check (char_length(btrim(original_name)) between 1 and 255),
  constraint evidence_files_mime_check
    check (
      mime_type in (
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf', 'video/mp4'
      )
    ),
  constraint evidence_files_size_check
    check (file_size between 1 and 52428800),
  constraint evidence_files_checksum_check
    check (
      checksum_sha256 is null
      or checksum_sha256 ~ '^[0-9a-f]{64}$'
    ),
  constraint evidence_files_metadata_shape_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint evidence_files_bucket_path_key unique (storage_bucket, storage_path)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_kind text not null default 'user',
  action text not null,
  entity_table text not null,
  entity_id uuid,
  class_id uuid references public.classes(id) on delete set null,
  old_data jsonb,
  new_data jsonb,
  reason text,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  constraint audit_logs_actor_kind_check
    check (actor_kind in ('user', 'service', 'system')),
  constraint audit_logs_action_check
    check (action ~ '^[a-z][a-z0-9_.-]{1,79}$'),
  constraint audit_logs_entity_table_check
    check (entity_table ~ '^[a-z][a-z0-9_]{1,62}$'),
  constraint audit_logs_json_shape_check
    check (
      (old_data is null or jsonb_typeof(old_data) = 'object')
      and (new_data is null or jsonb_typeof(new_data) = 'object')
      and jsonb_typeof(metadata) = 'object'
    )
);

create index quizzes_unit_type_status_idx
  on public.quizzes (unit_id, quiz_type, status, content_version);
create index quiz_attempts_student_quiz_idx
  on public.quiz_attempts (student_id, quiz_id, submitted_at desc);
create index quiz_attempts_class_quiz_idx
  on public.quiz_attempts (class_id, quiz_id, submitted_at desc);
create index quiz_attempts_pending_idx
  on public.quiz_attempts (submitted_at)
  where status = 'submitted';
create index lab_submissions_student_unit_idx
  on public.lab_submissions (student_id, unit_id, attempt_no desc);
create index lab_submissions_class_status_idx
  on public.lab_submissions (class_id, status, submitted_at);
create index evidence_files_submission_idx
  on public.evidence_files (lab_submission_id, created_at);
create index evidence_files_uploaded_by_idx
  on public.evidence_files (uploaded_by, created_at desc);
create index audit_logs_entity_idx
  on public.audit_logs (entity_table, entity_id, occurred_at desc);
create index audit_logs_class_idx
  on public.audit_logs (class_id, occurred_at desc)
  where class_id is not null;
create index audit_logs_actor_idx
  on public.audit_logs (actor_id, occurred_at desc)
  where actor_id is not null;

commit;

