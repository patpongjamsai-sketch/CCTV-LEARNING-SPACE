# CODEX MASTER PROMPT
## CCTV Technician 3D Training Center
### Phase 1.1 — AI Project Governance & Project Foundation

You are working as a **Software Architect + Repository Maintainer** for the following project.

## 1. Repository

Repository:

`patpongjamsai-sketch/CCTV-LEARNING-SPACE`

Target branch:

`docs/project-foundation`

Base branch:

`main`

Before making any change:

1. Confirm the current branch is `docs/project-foundation`.
2. Inspect repository status and existing structure.
3. Read the existing `AGENTS.md`.
4. Read `README.md`.
5. Read `ROADMAP.md`.
6. Inspect `package.json`.
7. Inspect the relevant `src/` directory structure only to understand the current architecture.
8. Do NOT modify application source code during this phase.

If the target branch does not exist or you are not currently on it, STOP and report the issue rather than modifying `main`.

---

# 2. Project Identity

Project:

**CCTV Technician 3D Training Center — Unit 1: IP CCTV Fundamentals**

Course:

**กล้องวงจรปิดบนระบบเครือข่าย (21909-2020)**

Education level:

**ประกาศนียบัตรวิชาชีพ (ปวช.) หลักสูตร พ.ศ. 2567**

Current learning environment:

**3D Block-Style Role-Play inside Smart Mart**

The learner takes the role of a:

**ช่างฝึกหัด CCTV**

The system combines:

- 3D exploration
- NPC interaction
- knowledge stations
- virtual CCTV equipment
- mission-based learning
- semantic answer verification
- network topology simulation
- PoE simulation
- learning evidence
- scoring
- certificate verification

This is an educational system.

Learning validity and assessment integrity are higher priority than convenience of implementation.

---

# 3. Current Technology Baseline

The current repository uses approximately:

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Rapier
- Zustand
- Vitest
- Playwright

The repository may still contain legacy Vite scripts or artifacts.

DO NOT remove or migrate legacy Vite elements in this phase.

Document them as technical debt or migration residue when appropriate.

Do not assume README commands are correct merely because they are documented.

Compare documentation with actual repository configuration.

For development URLs, prefer wording such as:

> Use the local URL printed by the Next.js development server.

Do not hard-code the legacy Vite port unless verified.

---

# 4. Current Architecture Baseline

The existing application approximately follows:

```text
src/
  data/
  domain/
  store/
  utils/
  components/
    player/
    learning/
    equipment/
    hud/
```

Preserve this conceptual separation.

Responsibilities should approximately remain:

```text
data
    ↓
Learning content / equipment definitions

domain
    ↓
Business rules / mission rules / connection rules

store
    ↓
Runtime application state

components
    ↓
Presentation + interaction

utils
    ↓
Supporting pure/shared functionality
```

Do NOT move domain logic into UI components.

Do NOT create duplicate business logic.

Zustand remains the state-management solution unless a future approved architecture decision explicitly changes it.

---

# 5. Protected Learning Domain Rules

The following rules are considered protected baseline requirements.

The current assessment uses a:

**100-point rubric**

Baseline pass condition:

```text
Final Score >= 80 / 100
```

AND the mandatory technical conditions must also be satisfied:

```text
Camera Online
AND
NVR Reachable
AND
Live View Available
```

A numeric score alone is NOT sufficient.

Do NOT change:

- pass threshold
- rubric semantics
- mandatory conditions
- mission correctness rules
- PoE calculation behavior
- topology semantics
- certificate eligibility

during Phase 1.1.

This phase may DOCUMENT those rules only.

It must not modify their implementation.

---

# 6. Virtual CCTV Baseline

The learning environment includes concepts such as:

- IP Camera
- PoE Switch
- NVR
- PC
- Monitor
- RJ45
- Cat6
- HDMI
- PoE ports
- Non-PoE uplink
- status LEDs
- device power state
- network reachability
- Live View

Current virtual laboratory behavior includes a PoE budget baseline of approximately:

```text
65 W
```

Treat implementation as authoritative where repository code differs from documentation.

Do not silently resolve discrepancies.

Record important discrepancies for human review.

---

# 7. Existing Rooms

Existing playable work includes Room 101 and Room 102.

Room 102 focuses on:

**Camera Selection & Placement**

Future roadmap includes approximately:

```text
Room 103
Cable & Connector Lab

Room 104
Network & Recorder

Room 105
Fault Detective
```

Phase 1.1 MUST NOT implement Rooms 103–105.

Backlog documentation may reference them as future work only.

---

# 8. Future Backend Direction

The planned backend platform is:

**Supabase**

Expected responsibilities:

- PostgreSQL
- Authentication
- Storage
- Row Level Security
- learner profiles
- learning events
- evidence
- attempts
- authoritative assessment records
- certificate records

These are architectural intentions.

DO NOT create Supabase schema or application integration in Phase 1.1.

---

# 9. Backend Security Invariants

Document the following rules in the architecture/security documentation.

Identity:

```text
auth.users
```

is the authentication identity source.

Application-readable profile information belongs in:

```text
public.profiles
```

All application tables in `public` should use RLS and least privilege.

Learners may submit things such as:

```text
answers
attempts
events
LAB evidence
```

Learners MUST NOT directly write authoritative values such as:

```text
approved_score
passed
certificate
certificate verification state
```

Authoritative assessment must be recalculated or validated on a trusted boundary such as:

```text
Next.js Server
Database Transaction / trusted database function
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
private API keys
server secrets
administrative credentials
```

to browser/client code.

UUID should be preferred for internal identifiers.

Human-readable identifiers may use:

```text
code
slug
```

---

# 10. Save Data Rule

If persisted game data has a `saveVersion`, incompatible save changes must never be introduced silently.

Future incompatible changes require:

1. explicit version change
2. migration strategy
3. migration test
4. backward compatibility decision
5. human approval where learning evidence may be affected

Document this rule.

Do not change the save schema in Phase 1.1.

---

# 11. AI Development Governance

Establish repository rules so future AI agents MUST:

1. Read `AGENTS.md`.
2. Read `plans/CURRENT_PHASE.md`.
3. Read the task specification.
4. Read only relevant architecture/domain documentation.
5. Inspect relevant implementation.
6. Implement only the approved scope.
7. Update relevant tests.
8. Validate the result.
9. Report exactly what changed.

AI MUST NOT:

- rewrite unrelated components
- perform opportunistic refactors
- replace architecture without approval
- introduce another state-management system
- duplicate domain logic inside UI components
- change assessment rules silently
- change certificate rules silently
- modify save schema without migration
- expose secrets client-side
- invent requirements to unblock itself
- claim tests passed without running them

When requirements conflict:

**STOP and report the conflict.**

Do not guess.

---

# 12. Git Workflow

Document the preferred development workflow:

```text
main
  ↑
Pull Request
  ↑
feature/*
fix/*
docs/*
```

Examples:

```text
docs/project-foundation
feature/room103-cable-lab
feature/supabase-auth
fix/player-collision
```

AI-generated feature work should not be performed directly on `main`.

Changes should be:

```text
Task
→ Branch
→ Implement
→ Validate
→ Review Diff
→ Pull Request
→ Human Review
→ Merge
```

Do NOT merge this branch automatically.

---

# 13. Phase 1.1 Scope

This phase is:

**AI Project Governance & Project Foundation**

You are authorized to create/update ONLY:

```text
AGENTS.md

docs/
  PRD.md
  ARCHITECTURE.md
  DOMAIN_RULES.md
  SECURITY.md
  DEVELOPMENT.md
  AI_WORKFLOW.md

plans/
  CURRENT_PHASE.md
  BACKLOG.md
  TASK_TEMPLATE.md
```

Do not create additional files unless absolutely required to complete this documentation task.

---

# 14. Protected Files / Out of Scope

DO NOT MODIFY:

```text
src/**
package.json
package-lock.json
next.config.ts
playtest.js
playtest_full.js
output/**
```

Do not modify:

- gameplay
- Room 101
- Room 102
- mission implementation
- scoring implementation
- certificate implementation
- Zustand implementation
- 3D scene
- player controller
- physics
- CCTV topology implementation
- Supabase database
- authentication
- production deployment configuration

Phase 1.1 is documentation/governance only.

---

# 15. AGENTS.md Requirements

The repository already contains an automatically managed Next.js section similar to:

```text
<!-- BEGIN:nextjs-agent-rules -->
...
<!-- END:nextjs-agent-rules -->
```

PRESERVE this block.

Do not delete or rewrite it unnecessarily.

Add project-specific governance outside the generated block.

`AGENTS.md` must clearly define:

- project purpose
- required reading order
- scope discipline
- architecture boundaries
- learning/domain invariants
- state-management rule
- save migration rule
- backend security boundaries
- testing requirements
- Git workflow
- Definition of Done
- documentation authority
- conflict/stop conditions

---

# 16. docs/PRD.md

Create a concise but useful Product Requirements Document.

Include:

## Product Purpose

Explain the vocational CCTV training purpose.

## Target Learners

ปวช. learners studying course 21909-2020.

## Learning Experience

Describe:

```text
Explore
→ Learn
→ Interact
→ Practice
→ Diagnose
→ Verify
→ Score
→ Evidence
```

## Current Product Scope

Document current Unit 1 and existing Rooms 101/102 without inventing functionality.

## Assessment

Document the 100-point rubric and mandatory pass conditions.

## Functional Requirements

High-level requirements only.

## Non-Functional Requirements

Include:

- performance
- maintainability
- accessibility
- educational integrity
- security
- observability/evidence
- browser compatibility

## Success Metrics

Include future measurable indicators such as:

- mission completion
- learner errors
- interaction failure
- wandering time
- FPS
- test pass rate
- learning evidence completeness

## Out of Scope

Clearly identify Phase 1.1 exclusions.

---

# 17. docs/ARCHITECTURE.md

Document current architecture and future boundaries.

Include:

```text
Next.js / React
       │
React Three Fiber
       │
Three.js + Rapier
       │
Zustand
       │
Domain Rules
```

Explain:

```text
data
domain
store
utils
components
```

Document future Supabase boundary separately and mark it as:

**PLANNED — NOT IMPLEMENTED BY PHASE 1.1**

Include a conceptual future data flow:

```text
Browser / 3D Client
        │
        │ learner events
        ▼
Next.js trusted server boundary
        │
        ▼
Supabase PostgreSQL
        │
        ├─ Profiles
        ├─ Attempts
        ├─ Evidence
        ├─ Assessment
        └─ Certificates
```

Document trusted vs untrusted boundaries.

Also record legacy Vite configuration as something requiring a separate migration audit rather than deleting it now.

---

# 18. docs/DOMAIN_RULES.md

This file protects educational and gameplay rules from accidental AI changes.

Include:

## Assessment

```text
100 points
PASS >= 80
```

Mandatory conditions:

```text
Camera Online
NVR Reachable
Live View Available
```

Explain that:

```text
score >= 80
```

without mandatory conditions is NOT a pass.

Include protected concepts:

- mission validation
- semantic verification
- network topology
- PoE budget
- equipment connectivity
- Live View
- evidence
- certificate eligibility

State clearly:

**Changing a protected domain rule requires an explicit task, tests, and human review.**

Do not invent detailed rubric weights if they cannot be verified from the repository.

---

# 19. docs/SECURITY.md

Document:

- client is untrusted
- server/database trusted boundaries
- Supabase RLS
- least privilege
- service-role protection
- learner submission vs authoritative approval
- evidence storage
- certificate integrity
- secret handling
- environment variables
- audit/event principles

Use this conceptual rule:

```text
CLIENT MAY SUBMIT
CLIENT MAY NOT APPROVE
```

The server/database must determine authoritative assessment state.

---

# 20. docs/DEVELOPMENT.md

Document the current engineering workflow.

Include commands verified from `package.json`.

Expected examples include:

```powershell
npm install
npm run dev
npm run lint
npm test
npm run build
```

Also document existing Playwright/playtest commands if verified.

Do NOT blindly document:

```text
127.0.0.1:5173
```

when `npm run dev` uses Next.js.

Instead instruct developers to use the URL printed by the development server unless the actual project explicitly configures a port.

Document:

- local setup
- branch naming
- commit discipline
- PR workflow
- testing
- environment variable rules
- secrets
- database migration policy
- Definition of Done

---

# 21. docs/AI_WORKFLOW.md

Define the preferred AI-assisted workflow:

```text
Human
   │
   ▼
ChatGPT
Requirement / Architecture / Planning
   │
   ▼
Task Specification
   │
   ▼
Codex
Repository implementation
   │
   ▼
Automated Validation
   │
   ▼
Diff Review
   │
   ▼
Pull Request
   │
   ▼
Human Approval
```

Define AI roles:

### Planner
Clarifies goals, scope, architecture and acceptance criteria.

### Implementer
Changes only the authorized repository scope.

### Reviewer
Checks diff, architecture, domain rules and tests.

Do not allow one role to silently redefine requirements while implementing them.

Include a context-efficiency rule:

**Read the minimum repository context required for the current task.**

---

# 22. plans/CURRENT_PHASE.md

Create:

```text
Phase: 1.1
Name: AI Project Governance & Project Foundation
Status: ACTIVE
```

Objective:

Establish the repository governance and documentation foundation before further feature/backend development.

Allowed scope:

```text
AGENTS.md
docs/**
plans/**
```

Explicitly forbidden:

```text
src/**
gameplay
database implementation
Room implementation
assessment implementation
```

Acceptance criteria:

- governance rules exist
- product baseline documented
- architecture documented
- domain rules protected
- security boundaries documented
- AI workflow documented
- task template available
- backlog separated from authorized work
- application source remains unchanged

Next phase should NOT be automatically started.

---

# 23. plans/BACKLOG.md

Create a lightweight backlog.

Separate future work from current authorization.

Possible categories:

```text
Architecture / Migration Audit
Learner Playtest
Performance Profiling
Room 103 — Cable & Connector Lab
Room 104 — Network & Recorder
Room 105 — Fault Detective
Supabase Foundation
Authentication / Profiles
Learning Evidence
Assessment Security
Certificate Verification
Accessibility
Asset Optimization
Deployment
```

Clearly state:

**An item appearing in BACKLOG.md does not authorize implementation.**

---

# 24. plans/TASK_TEMPLATE.md

Create a reusable task specification template containing:

```text
Task ID
Title
Goal
Background
Current Behavior
Desired Behavior

In Scope
Out of Scope

Allowed Files
Protected Files

Requirements

Acceptance Criteria

Tests Required

Security Considerations
Domain Rule Impact
Save Data Impact

Risks

Stop Conditions

Implementation Evidence
Validation Result
```

Include this rule:

If implementation requires modifying a protected file not listed in `Allowed Files`, STOP and request scope approval.

---

# 25. Documentation Language

Repository technical documentation may primarily use English because it will be consumed by AI agents and developers.

Preserve important Thai educational names and terminology where useful, including:

```text
กล้องวงจรปิดบนระบบเครือข่าย
ช่างฝึกหัด CCTV
ประกาศนียบัตรวิชาชีพ (ปวช.)
```

Keep documentation concise enough to be useful as AI context.

Avoid unnecessary prose.

---

# 26. Validation

After creating the documentation:

Run:

```powershell
git status
git diff --check
```

Confirm that no files outside the approved Phase 1.1 scope changed.

Because this phase is documentation-only, application tests do not need to be changed.

If practical and the repository environment is already installed, existing validation may be run, but DO NOT modify source code merely to fix unrelated existing failures.

Inspect:

```text
git diff --stat
git diff
```

Verify:

```text
NO src/** modifications
NO package changes
NO gameplay changes
NO database changes
```

---

# 27. Definition of Done

Phase 1.1 is complete only when:

1. Existing Next.js generated rules in `AGENTS.md` are preserved.
2. Project-specific AI governance is added.
3. `docs/PRD.md` exists.
4. `docs/ARCHITECTURE.md` exists.
5. `docs/DOMAIN_RULES.md` exists.
6. `docs/SECURITY.md` exists.
7. `docs/DEVELOPMENT.md` exists.
8. `docs/AI_WORKFLOW.md` exists.
9. `plans/CURRENT_PHASE.md` exists.
10. `plans/BACKLOG.md` exists.
11. `plans/TASK_TEMPLATE.md` exists.
12. No application source code was modified.
13. No dependency was added or removed.
14. No database schema was created.
15. No gameplay behavior was changed.
16. Final diff was reviewed.

---

# 28. STOP CONDITIONS

STOP implementation and report instead of guessing if:

- branch is incorrect
- requirements conflict
- repository implementation contradicts a protected domain rule
- completing the task requires modifying `src/**`
- completing the task requires dependency changes
- completing the task requires database changes
- an existing document establishes a conflicting architecture
- scoring/certificate behavior cannot be verified
- an irreversible action would be required

Do not resolve architectural conflicts silently.

---

# 29. Final Report

When complete, DO NOT automatically merge into `main`.

Return a concise report using:

```text
PHASE 1.1 RESULT

Status:
COMPLETE / BLOCKED

Branch:
docs/project-foundation

Created:
- ...

Updated:
- ...

Application Source Modified:
NO / YES

Dependencies Modified:
NO / YES

Database Modified:
NO / YES

Validation:
- git diff --check:
- scope verification:
- additional checks:

Important Findings:
- ...

Conflicts / Unverified Assumptions:
- ...

Recommended Next Step:
- ...
```

If everything succeeds, stop after the report.

Do NOT begin Phase 1.2 automatically.
Do NOT merge the branch automatically.
