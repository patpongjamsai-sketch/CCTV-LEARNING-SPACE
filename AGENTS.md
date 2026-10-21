<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Workflow Rules

- **Implementation Plan**: Always create an Implementation Plan (`implementation_plan.md`) when planning is required, and wait for user approval before proceeding to execution.
- **No Scratchpad**: Do NOT create scratchpad files, scratch notes, or temporary scratch scripts (`scratch/` directory). Keep all planning structured exclusively within the Implementation Plan without generating scratchpad drafts.

# Supabase Backend & RBAC Integration Rules

We are building the "CCTV Learning Ecosystem" using **Next.js (App Router)** and **Supabase (PostgreSQL)**. Follow these specific Supabase patterns:

## 1. Authentication & User Profiles
- **Auth Provider:** Use Supabase Auth with Google OAuth (`supabase.auth.signInWithOAuth({ provider: 'google' })`) and email/password.
- **Profiles Table:** Maintain the public `profiles` table synced with `auth.users`:
  - `id` (UUID, primary key references `auth.users.id` on delete cascade)
  - `student_code` (TEXT, unique identifier for students)
  - `display_name` (TEXT)
  - `role` (TEXT: `'student'`, `'teacher'`, or `'admin'`, default `'student'`)
  - `active` (BOOLEAN, default `true`)
  - `created_at` (TIMESTAMPTZ)
- **Auto-Profile Trigger:** Use the PostgreSQL trigger `on_auth_user_created` (`private.handle_new_auth_user()`) that automatically creates a row in `public.profiles` when a new user signs up via Supabase Auth.

## 2. Row Level Security (RLS) Policies
Maintain strict RLS policies on Supabase for data security:
- **`profiles`:** Users can read and update their own profile (`display_name`, `student_code`). Teachers and Admins can view profiles in classes they instruct.
- **`quizzes & quiz_attempts`:** Students can insert and read their own quiz results. Trusted outcomes (`approved_score`, `passed`) are calculated by Server/Database functions and cannot be set directly by clients. Teachers can read all student scores.
- **`lab_submissions`:** 
  - Students can submit and view their own lab submissions and draft notes.
  - Teachers have full read access and write/approve access to grade and provide feedback on submissions in their classes.

## 3. Storage for Lab Submissions
- **Bucket:** Use the private Supabase Storage bucket named `lab-evidence`.
- **Upload Path:** Enforce `{student_uuid}/{lab_submission_uuid}/{filename}`.
- **Access Model:** Server-brokered upload and authenticated/signed URLs with strict validation (MIME types, SHA256 checksum, size limit <= 50MB) to ensure students only upload to their own submissions and teachers can inspect submissions.

## 4. UI Implementation (Student vs Teacher Views)
- Check user role via server-side session and `profiles.role` table using `getCurrentProfile()`.
- **Student Portal:** Course/Labs overview, Quizzes, Interactive 3D Labs, and Lab upload/evidence forms.
- **Teacher Dashboard (`/teacher`):** Protected route (teachers and admins only) showing list of student submissions with status badges (`pending`, `passed`, `revision_required`) and grading/approval action buttons.

