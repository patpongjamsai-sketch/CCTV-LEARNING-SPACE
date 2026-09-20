import 'server-only';

import { getServerDatabase } from '../database/client';

export type StudentUnitProgress = {
  classId: string;
  studentId: string;
  unitId: string;
  unitTitle: string;
  unitStatus: string;
  contentVersion: number;
  progressPercent: number;
  approvedScore: number | null;
  passed: boolean;
  status: string;
  attemptCount: number;
  timeSpentSeconds: number;
  unlocked: boolean;
  latestLabSubmission: {
    id: string;
    status: string;
    passed: boolean | null;
    approvedScore: number | null;
    reviewedAt: string | null;
  } | null;
};

export type StudentProgressOverview = {
  classId: string;
  studentId: string;
  units: Array<{
    unitId: string;
    sequenceNo: number;
    title: string;
    unitStatus: string;
    contentVersion: number;
    progressPercent: number;
    approvedScore: number | null;
    passed: boolean;
    status: string;
    attemptCount: number;
    timeSpentSeconds: number;
    unlocked: boolean;
    latestLabSubmission: {
      id: string;
      status: string;
      passed: boolean | null;
      approvedScore: number | null;
      reviewedAt: string | null;
    } | null;
  }>;
};

async function assertProgressReader(
  actorId: string,
  classId: string,
  studentId: string,
): Promise<void> {
  const sql = getServerDatabase();
  const [access] = await sql`
    select
      actor.id as actor_id,
      actor.role as actor_role,
      actor.active as actor_active,
      actor_members.member_role as actor_member_role,
      actor_members.active as actor_member_active,
      target_members.profile_id as target_id,
      target.active as target_profile_active,
      target_members.active as target_member_active,
      target_members.member_role as target_member_role
    from public.profiles as actor
    left join public.class_members as actor_members
      on actor_members.profile_id = actor.id
     and actor_members.class_id = ${classId}
    left join public.class_members as target_members
      on target_members.profile_id = ${studentId}
     and target_members.class_id = ${classId}
    left join public.profiles as target
      on target.id = target_members.profile_id
    where actor.id = ${actorId}
    limit 1
  `;

  const targetIsStudent =
    access?.target_id === studentId
    && access.target_profile_active === true
    && access.target_member_active === true
    && access.target_member_role === 'student';
  const actorIsAdmin = access?.actor_active === true && access.actor_role === 'admin';
  const actorIsClassTeacher =
    access?.actor_active === true
    && access.actor_role === 'teacher'
    && access.actor_member_role === 'teacher'
    && access.actor_member_active === true;

  if (!targetIsStudent || !(actorId === studentId || actorIsAdmin || actorIsClassTeacher)) {
    throw new Error('Forbidden: cannot read this student progress');
  }
}

/**
 * Returns the learner's complete progress path. Unlock values are calculated
 * by the private database predicate for every unit, never by the browser.
 */
export async function getStudentProgressOverviewService(
  actorId: string,
  classId: string,
): Promise<StudentProgressOverview> {
  await assertProgressReader(actorId, classId, actorId);
  const sql = getServerDatabase();
  const rows = await sql`
    select
      c.id as class_id,
      u.id as unit_id,
      u.sequence_no,
      u.title,
      u.status as unit_status,
      u.content_version,
      coalesce(up.progress_percent, 0) as progress_percent,
      up.approved_score,
      coalesce(up.passed, false) as passed,
      coalesce(up.status, 'not_started') as status,
      coalesce(up.attempt_count, 0) as attempt_count,
      coalesce(up.time_spent_seconds, 0) as time_spent_seconds,
      private.is_unit_unlocked(${actorId}, ${classId}, u.id) as unlocked,
      latest_lab.id as latest_lab_submission_id,
      latest_lab.status as latest_lab_status,
      latest_lab.passed as latest_lab_passed,
      latest_lab.approved_score as latest_lab_approved_score,
      latest_lab.reviewed_at as latest_lab_reviewed_at
    from public.classes as c
    join public.units as u on u.course_id = c.course_id
    left join public.unit_progress as up
      on up.class_id = c.id
     and up.student_id = ${actorId}
     and up.unit_id = u.id
    left join lateral (
      select ls.id, ls.status, ls.passed, ls.approved_score, ls.reviewed_at
      from public.lab_submissions as ls
      where ls.class_id = c.id
        and ls.student_id = ${actorId}
        and ls.unit_id = u.id
      order by ls.attempt_no desc
      limit 1
    ) as latest_lab on true
    where c.id = ${classId}
      and u.status = 'published'
    order by u.sequence_no asc
  `;

  return {
    classId,
    studentId: actorId,
    units: rows.map((row) => ({
      unitId: row.unit_id,
      sequenceNo: Number(row.sequence_no),
      title: row.title,
      unitStatus: row.unit_status,
      contentVersion: Number(row.content_version),
      progressPercent: Number(row.progress_percent),
      approvedScore: row.approved_score === null ? null : Number(row.approved_score),
      passed: Boolean(row.passed),
      status: row.status,
      attemptCount: Number(row.attempt_count),
      timeSpentSeconds: Number(row.time_spent_seconds),
      unlocked: Boolean(row.unlocked),
      latestLabSubmission: row.latest_lab_submission_id
        ? {
            id: row.latest_lab_submission_id,
            status: row.latest_lab_status,
            passed: row.latest_lab_passed === null ? null : Boolean(row.latest_lab_passed),
            approvedScore:
              row.latest_lab_approved_score === null ? null : Number(row.latest_lab_approved_score),
            reviewedAt: row.latest_lab_reviewed_at,
          }
        : null,
    })),
  };
}

export async function getStudentUnitProgressService(
  actorId: string,
  classId: string,
  studentId: string,
  unitId: string,
): Promise<StudentUnitProgress> {
  await assertProgressReader(actorId, classId, studentId);
  const sql = getServerDatabase();
  const [row] = await sql`
    select
      c.id as class_id,
      u.id as unit_id,
      u.title as unit_title,
      u.status as unit_status,
      u.content_version,
      coalesce(up.progress_percent, 0) as progress_percent,
      up.approved_score,
      coalesce(up.passed, false) as passed,
      coalesce(up.status, 'not_started') as status,
      coalesce(up.attempt_count, 0) as attempt_count,
      coalesce(up.time_spent_seconds, 0) as time_spent_seconds,
      private.is_unit_unlocked(${studentId}, ${classId}, u.id) as unlocked,
      latest_lab.id as latest_lab_submission_id,
      latest_lab.status as latest_lab_status,
      latest_lab.passed as latest_lab_passed,
      latest_lab.approved_score as latest_lab_approved_score,
      latest_lab.reviewed_at as latest_lab_reviewed_at
    from public.classes as c
    join public.units as u on u.id = ${unitId} and u.course_id = c.course_id
    left join public.unit_progress as up
      on up.class_id = c.id
     and up.student_id = ${studentId}
     and up.unit_id = u.id
    left join lateral (
      select ls.id, ls.status, ls.passed, ls.approved_score, ls.reviewed_at
      from public.lab_submissions as ls
      where ls.class_id = c.id
        and ls.student_id = ${studentId}
        and ls.unit_id = u.id
      order by ls.attempt_no desc
      limit 1
    ) as latest_lab on true
    where c.id = ${classId}
      and u.status = 'published'
  `;

  if (!row) {
    throw new Error('Not found: published unit progress record not found');
  }

  return {
    classId: row.class_id,
    studentId,
    unitId: row.unit_id,
    unitTitle: row.unit_title,
    unitStatus: row.unit_status,
    contentVersion: Number(row.content_version),
    progressPercent: Number(row.progress_percent),
    approvedScore: row.approved_score === null ? null : Number(row.approved_score),
    passed: Boolean(row.passed),
    status: row.status,
    attemptCount: Number(row.attempt_count),
    timeSpentSeconds: Number(row.time_spent_seconds),
    unlocked: Boolean(row.unlocked),
    latestLabSubmission: row.latest_lab_submission_id
      ? {
          id: row.latest_lab_submission_id,
          status: row.latest_lab_status,
          passed: row.latest_lab_passed === null ? null : Boolean(row.latest_lab_passed),
          approvedScore:
            row.latest_lab_approved_score === null ? null : Number(row.latest_lab_approved_score),
          reviewedAt: row.latest_lab_reviewed_at,
        }
      : null,
  };
}
