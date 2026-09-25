import 'server-only';

import { assertCanManageClass } from './classService';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { quizReviewInputSchema, teacherReviewInputSchema } from '../http/apiSchemas';

export type PendingReviewItem = {
  id: string;
  kind: 'lab' | 'quiz';
  classId: string;
  unitId: string;
  unitSequenceNo: number;
  unitTitle: string;
  studentId: string;
  studentCode: string;
  displayName: string;
  attemptNo: number;
  title: string;
  studentNotes?: string | null;
  submittedAt: string | null;
  status: string;
  evidenceCount?: number;
  rawScore?: number | null;
  clientAnswers?: unknown;
};

export async function getPendingReviewsService(
  actorId: string,
  classId: string,
): Promise<PendingReviewItem[]> {
  await assertCanManageClass(actorId, classId);
  const sql = getServerDatabase();

  const [labRows, quizRows] = await Promise.all([
    sql`
      select
        ls.id,
        ls.class_id,
        ls.unit_id,
        ls.student_id,
        ls.attempt_no,
        ls.title,
        ls.student_notes,
        ls.status,
        ls.submitted_at,
        p.student_code,
        p.display_name,
        u.sequence_no as unit_sequence_no,
        u.title as unit_title,
        count(ef.id)::int as evidence_count
      from public.lab_submissions as ls
      join public.profiles as p on p.id = ls.student_id
      join public.units as u on u.id = ls.unit_id
      left join public.evidence_files as ef on ef.lab_submission_id = ls.id
      where ls.class_id = ${classId}
        and ls.status in ('submitted', 'reviewing')
      group by ls.id, p.id, u.id
      order by ls.submitted_at asc
    `,
    sql`
      select
        qa.id,
        qa.class_id,
        qa.student_id,
        qa.attempt_no,
        qa.client_answers,
        qa.raw_score,
        qa.status,
        qa.submitted_at,
        p.student_code,
        p.display_name,
        q.title as quiz_title,
        q.unit_id,
        u.sequence_no as unit_sequence_no,
        u.title as unit_title
      from public.quiz_attempts as qa
      join public.profiles as p on p.id = qa.student_id
      join public.quizzes as q on q.id = qa.quiz_id
      join public.units as u on u.id = q.unit_id
      where qa.class_id = ${classId}
        and qa.status = 'submitted'
        and q.quiz_type != 'pre'
      order by qa.submitted_at asc
    `,
  ]);

  const labItems: PendingReviewItem[] = labRows.map((r: any) => ({
    id: r.id,
    kind: 'lab',
    classId: r.class_id,
    unitId: r.unit_id,
    unitSequenceNo: Number(r.unit_sequence_no),
    unitTitle: r.unit_title,
    studentId: r.student_id,
    studentCode: r.student_code || '',
    displayName: r.display_name || '',
    attemptNo: Number(r.attempt_no),
    title: r.title,
    studentNotes: r.student_notes,
    submittedAt: r.submitted_at,
    status: r.status,
    evidenceCount: Number(r.evidence_count || 0),
  }));

  const quizItems: PendingReviewItem[] = quizRows.map((r: any) => ({
    id: r.id,
    kind: 'quiz',
    classId: r.class_id,
    unitId: r.unit_id,
    unitSequenceNo: Number(r.unit_sequence_no),
    unitTitle: r.unit_title,
    studentId: r.student_id,
    studentCode: r.student_code || '',
    displayName: r.display_name || '',
    attemptNo: Number(r.attempt_no),
    title: r.quiz_title,
    submittedAt: r.submitted_at,
    status: r.status,
    rawScore: r.raw_score !== null ? Number(r.raw_score) : null,
    clientAnswers: r.client_answers,
  }));

  return [...labItems, ...quizItems].sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeA - timeB;
  });
}

export async function reviewLabSubmissionService(
  actorId: string,
  submissionId: string,
  rawInput: unknown,
): Promise<{ success: true; submissionId: string; status: string }> {
  const input = teacherReviewInputSchema.parse(rawInput);
  const sql = getServerDatabase();
  const [submission] = await sql`
    select id, class_id, status
    from public.lab_submissions
    where id = ${submissionId}
  `;

  if (!submission) {
    throw new Error('Not found: LAB submission not found');
  }

  await assertCanManageClass(actorId, submission.class_id);

  return withTrustedTransaction(async (tx) => {
    const [result] = await tx`
      select private.review_lab_submission(
        ${submissionId},
        ${input.status},
        ${input.approvedScore ?? null},
        ${input.feedback ?? null},
        ${actorId}
      ) as submission_id
    `;

    if (!result?.submission_id) {
      throw new Error('Teacher review failed to return submission ID');
    }

    return {
      success: true,
      submissionId: result.submission_id,
      status: input.status,
    };
  });
}

export async function reviewQuizAttemptService(
  actorId: string,
  classId: string,
  attemptId: string,
  rawInput: unknown,
): Promise<{ success: true; attemptId: string; status: string; approvedScore: number }> {
  const input = quizReviewInputSchema.parse(rawInput);
  await assertCanManageClass(actorId, classId);
  const sql = getServerDatabase();

  const [attempt] = await sql`
    select
      qa.id,
      qa.class_id,
      qa.student_id,
      qa.quiz_id,
      qa.status,
      qa.raw_score,
      q.max_score,
      q.passing_percentage
    from public.quiz_attempts as qa
    join public.quizzes as q on q.id = qa.quiz_id
    where qa.id = ${attemptId}
      and qa.class_id = ${classId}
  `;

  if (!attempt) {
    throw new Error('Not found: Quiz attempt not found in this class');
  }

  const maxScore = Number(attempt.max_score) || 100;
  const scorePercent = Math.min(100, Math.max(0, (input.approvedScore / maxScore) * 100));
  const passingPercentage = Number(attempt.passing_percentage) || 60;
  const isPassed = input.status === 'approved' && scorePercent >= passingPercentage;

  return withTrustedTransaction(async (tx) => {
    await tx`
      update public.quiz_attempts
      set
        raw_score = coalesce(raw_score, ${input.approvedScore}),
        approved_score = ${input.approvedScore},
        score_percent = ${scorePercent},
        passed = ${isPassed},
        status = ${input.status},
        approved_by = ${actorId},
        approved_at = now(),
        evaluation_reason = ${input.feedback ?? null},
        updated_at = now()
      where id = ${attemptId}
    `;

    await tx`
      select private.write_audit_log(
        ${actorId},
        'quiz_attempt.teacher_review',
        'quiz_attempts',
        ${attemptId},
        ${classId},
        jsonb_build_object('status', ${attempt.status}),
        jsonb_build_object('status', ${input.status}, 'approved_score', ${input.approvedScore}, 'passed', ${isPassed}),
        ${input.feedback ?? null},
        jsonb_build_object('evaluator', ${actorId})
      )
    `;

    return {
      success: true,
      attemptId,
      status: input.status,
      approvedScore: input.approvedScore,
    };
  });
}

