# Final-Strict Assurance Ledger — Next.js Auth and Game Integration

## Identity

- ASSURANCE_UNIT_ID: `cctv-technician-3d-training-center/web/auth-game-integration`
- REOPEN_GENERATION: `0`
- LEDGER_LOCATION: `docs/evidence/supabase-web-integration/WEB_ASSURANCE_LEDGER.md`
- ATTEMPT_COORDINATION_LOCATION: Git common directory `.git/codex-assurance/cctv-web-auth-game/attempts.jsonl` with atomic `New-Item -ItemType Directory` lock at `.git/codex-assurance/cctv-web-auth-game/review.lock`
- UNIT_STATUS: `open`

## Authority and boundary

- Objective: connect the existing Next.js shell and 3D game to Supabase Auth, RLS-governed raw writes, and server-authoritative PostgreSQL transactions without exposing secrets or trusting browser scores.
- Canonical scope authority: user-approved plan phases 2, 3, and 5; Private Storage is explicitly deferred.
- Acceptance criteria: invite-only email/password auth; browser/server clients and `proxy.ts`; claims revalidated in every mutation; CSV enrollment; protected room access; authenticated identity in the game; server recomputation of score; dashboard reads approved database state; API contracts implemented.
- Base state: `cc692000546e1f03bbc54b11235501976d77cd1b`, branch `feat/supabase-auth`; pre-existing untracked `supabase/.temp/` is user state and excluded.
- Candidate scope: application source, focused tests, environment template, package manifests/lockfile, and web-integration evidence. This ledger and reviewer coordination artifacts are excluded from behavior identity.
- Declared final boundary: focused tests, typecheck, production build, secret-surface inspection, and parent adversarial review are complete; no deploy or remote auth configuration change occurs.
- Protected boundaries: production auth/authorization change, database deployment, Vercel deploy, merge, release, and push.
- REVIEW_BUDGET_MODE: `default`
- REVIEW_BUDGET_AUTHORITY: new-unit default policy
- TARGET_REVIEW_CALLS: `1`
- MAX_REVIEW_CALLS: `3`
- REVIEW_CALLS_USED: `0`
- ACTIVE_REVIEW_RESERVATION: `none`

## Repository verification profile

- Authority inspected: root `AGENTS.md`, local Next.js 16 docs, `package.json`, current app routes/components, shared domain tests, and the integration blueprint.
- FOCUSED_CHECKS: targeted Vitest files and `npx tsc --noEmit` for changed contracts.
- CANDIDATE_CHECKS: `npm test`, `npm run lint`, and `npm run build` once for the frozen candidate.
- COMPOSE_CHECK: not applicable; no repository Compose entrypoint.
- CANDIDATE_BOUNDARY: before independent review.
- COMPOSE_LIFECYCLE: not applicable.
- EVIDENCE_REUSE: only for an unchanged candidate manifest and command inputs.
- EARLY_GATE_OVERRIDES: auth and server-authority focused tests run during implementation.

## TDD

- TDD_REQUIRED: `yes`.
- Test seams: auth form validation, CSV parsing/import outcomes, authorization decisions, game submission validation/re-scoring, filtered dashboard view models, and route response contracts.
- RED evidence: to be recorded before each production behavior slice.
- GREEN/REFACTOR evidence: to be recorded after each focused test cycle.
- Exceptions authorized: generated Supabase database types and configuration-only files only.

## Checkpoints

| Checkpoint | Changed scope | Parent verification | Decisions | Known gaps | Status |
| --- | --- | --- | --- | --- | --- |
| WEB-0 | Ledger only | Existing shell, game boundary, and Next.js guidance inspected | Node runtime; proxy refresh only; DAL reauthorizes every operation | Implementation not started | checkpoint-ready |
| WEB-1 | `src/proxy.ts`, `src/app/login/**`, `src/app/forgot-password/**`, `src/app/set-password/**`, `src/app/auth/**`, `src/tests/auth.pages.test.tsx`, `src/tests/proxy.test.ts` | Next.js 16 build passing (Turbopack, 9 routes including Proxy); Vitest 25 files / 89 tests passing; typecheck passing | Cookie refresh via Next.js 16 proxy; generic forgot-password response; claim-gated set-password; invite-only model | Class management UI & game session API routes pending Phase 5 | checkpoint-ready |

## Review state

- REVIEWABILITY: pending
- PARENT_ADVERSARIAL_READY: no
- REVIEW_READY: no
- REVIEW_BLOCKERS: implementation and evidence not complete

