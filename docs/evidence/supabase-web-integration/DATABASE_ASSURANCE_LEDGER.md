# Final-Strict Assurance Ledger — Database Foundation and Learning Rules

## Identity

- ASSURANCE_UNIT_ID: `cctv-technician-3d-training-center/database/foundation-learning-rules`
- REOPEN_GENERATION: `0`
- LEDGER_LOCATION: `docs/evidence/supabase-web-integration/DATABASE_ASSURANCE_LEDGER.md`
- ATTEMPT_COORDINATION_LOCATION: Git common directory `.git/codex-assurance/cctv-database-foundation/attempts.jsonl` with atomic `New-Item -ItemType Directory` lock at `.git/codex-assurance/cctv-database-foundation/review.lock`
- UNIT_STATUS: `open`

## Authority and boundary

- Objective: import the validated Level A/B/C database package without changing migrations 001–006, add migration-tested learning progression rules, and preserve the trusted/untrusted data boundary.
- Canonical scope authority: user-approved “แผนพัฒนาต่อจาก Supabase Database + Security”, phases 1 and 4.
- Acceptance criteria: timestamped migrations match remote history; package tests remain reusable; one active teacher per class; pre-test gates Unit 1; later units require the previous unit; one summative mission per unit/version; teacher override requires a reason and writes append-only audit evidence.
- Base state: `cc692000546e1f03bbc54b11235501976d77cd1b`, branch `feat/supabase-auth`; pre-existing untracked `supabase/.temp/` is user state and excluded.
- Candidate scope: `supabase/migrations/**`, `tests/**`, `docs/database/**`, database package manifest, and database-focused evidence. This ledger and reviewer coordination artifacts are excluded from behavior identity.
- Declared final boundary: local migrations, focused PostgreSQL contract tests, manifest verification, and parent diff inspection are complete; no remote migration is executed.
- Protected boundaries: remote database mutation, production auth/authorization change, deploy, merge, release, and push.
- REVIEW_BUDGET_MODE: `default`
- REVIEW_BUDGET_AUTHORITY: new-unit default policy
- TARGET_REVIEW_CALLS: `1`
- MAX_REVIEW_CALLS: `3`
- REVIEW_CALLS_USED: `0`
- ACTIVE_REVIEW_RESERVATION: `none`

## Repository verification profile

- Authority inspected: root `AGENTS.md`, `package.json`, validated database package README/report/test runner, and user acceptance plan.
- FOCUSED_CHECKS: targeted PostgreSQL contract files through `tests/run-tests.ps1` or a narrowed equivalent; migration manifest hash comparison.
- CANDIDATE_CHECKS: full database package runner once Docker is available; otherwise exact limitation recorded and no remote substitute.
- COMPOSE_CHECK: not applicable; package owns a disposable PostgreSQL 17 Docker runner instead of Compose.
- CANDIDATE_BOUNDARY: before independent review.
- COMPOSE_LIFECYCLE: not applicable.
- EVIDENCE_REUSE: only for an unchanged candidate manifest and identical runner inputs.
- EARLY_GATE_OVERRIDES: migration-focused tests may run early because data integrity is high risk.

## TDD

- TDD_REQUIRED: `yes` for migration 007 behavior; `no` for byte-for-byte package copying and documentation because they are imported/generated artifacts.
- Test seams: PostgreSQL constraints, functions, role grants, RLS-visible behavior, unlock decisions, and audit rows.
- RED evidence: to be recorded before migration 007 implementation.
- GREEN/REFACTOR evidence: to be recorded after each focused behavior slice.
- Exceptions authorized: none.

## Checkpoints

| Checkpoint | Changed scope | Parent verification | Decisions | Known gaps | Status |
| --- | --- | --- | --- | --- | --- |
| DB-0 | Ledger only | Base state and package source inspected | Preserve 001–006 bytes; add only a new migration | Docker daemon currently unavailable | checkpoint-ready |
| DB-1 | `docs/database/**`, `supabase/migrations/**`, `tests/**`, package manifest | Cryptographic SHA-256 and byte-size verification across all 20 package files; 100% byte-for-byte match confirmed | Package imported byte-for-byte; migration filenames mapped to remote history; 008 contract test staged for Phase 4 | Remote migration 007 pending Phase 4 | checkpoint-ready |

## Review state

- REVIEWABILITY: pending
- PARENT_ADVERSARIAL_READY: no
- REVIEW_READY: no
- REVIEW_BLOCKERS: implementation and evidence not complete

