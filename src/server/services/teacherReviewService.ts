import 'server-only';

import { assertCanManageClass } from './classService';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { quizReviewInputSchema, teacherReviewInputSchema } from '../http/apiSchemas';
import { createAdminSupabaseClient } from '../../lib/supabase/admin';

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

  try {
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
  } catch {
    // Fallback: Query Supabase directly via HTTPS PostgREST if direct Postgres connection pool fails
    const admin = createAdminSupabaseClient();
    const isAll = classId === 'ALL';

    let labQuery = admin
      .from('lab_submissions')
      .select('id, class_id, unit_id, student_id, attempt_no, title, student_notes, status, submitted_at, profiles:profiles!lab_submissions_student_id_fkey(student_code, display_name), units(sequence_no, title), evidence_files(id)')
      .in('status', ['submitted', 'reviewing']);
    if (!isAll) {
      labQuery = labQuery.eq('class_id', classId);
    }

    let quizQuery = admin
      .from('quiz_attempts')
      .select('id, class_id, student_id, attempt_no, client_answers, raw_score, status, submitted_at, profiles:profiles!quiz_attempts_student_id_fkey(student_code, display_name), quizzes(id, title, unit_id, quiz_type, units(sequence_no, title))')
      .eq('status', 'submitted');
    if (!isAll) {
      quizQuery = quizQuery.eq('class_id', classId);
    }

    const [{ data: labRows }, { data: quizRows }] = await Promise.all([labQuery, quizQuery]);

    const labItems: PendingReviewItem[] = (labRows || []).map((r: any) => ({
      id: r.id,
      kind: 'lab',
      classId: r.class_id,
      unitId: r.unit_id,
      unitSequenceNo: Number(r.units?.sequence_no || 1),
      unitTitle: r.units?.title || '',
      studentId: r.student_id,
      studentCode: r.profiles?.student_code || '',
      displayName: r.profiles?.display_name || '',
      attemptNo: Number(r.attempt_no),
      title: r.title,
      studentNotes: r.student_notes,
      submittedAt: r.submitted_at,
      status: r.status,
      evidenceCount: Number(r.evidence_files?.length || 0),
    }));

    const quizItems: PendingReviewItem[] = (quizRows || [])
      .filter((r: any) => r.quizzes?.quiz_type !== 'pre')
      .map((r: any) => ({
        id: r.id,
        kind: 'quiz',
        classId: r.class_id,
        unitId: r.quizzes?.unit_id,
        unitSequenceNo: Number(r.quizzes?.units?.sequence_no || 1),
        unitTitle: r.quizzes?.units?.title || '',
        studentId: r.student_id,
        studentCode: r.profiles?.student_code || '',
        displayName: r.profiles?.display_name || '',
        attemptNo: Number(r.attempt_no),
        title: r.quizzes?.title || 'แบบทดสอบ',
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
}

function isDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const message = String((err as any).message || '').toLowerCase();
  const code = String((err as any).code || '').toUpperCase();
  return (
    code === 'ECIRCUITBREAKER' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    message.includes('circuitbreaker') ||
    message.includes('too many authentication failures') ||
    message.includes('connection')
  );
}

export async function reviewLabSubmissionService(
  actorId: string,
  submissionId: string,
  rawInput: unknown,
): Promise<{ success: true; submissionId: string; status: string }> {
  const input = teacherReviewInputSchema.parse(rawInput);

  let submission: { id: string; class_id: string; status: string; student_id: string; unit_id: string } | null = null;
  try {
    const sql = getServerDatabase();
    const [sub] = await sql`
      select id, class_id, status, student_id, unit_id
      from public.lab_submissions
      where id = ${submissionId}
    `;
    submission = sub ? (sub as any) : null;
  } catch (err) {
    if (!isDbConnectionError(err)) {
      throw err;
    }
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('lab_submissions')
      .select('id, class_id, status, student_id, unit_id')
      .eq('id', submissionId)
      .maybeSingle();
    submission = data;
  }

  if (!submission) {
    throw new Error('Not found: LAB submission not found');
  }

  await assertCanManageClass(actorId, submission.class_id);

  try {
    return await withTrustedTransaction(async (tx) => {
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
  } catch (txErr) {
    if (!isDbConnectionError(txErr)) {
      throw txErr;
    }

    const admin = createAdminSupabaseClient();
    const newPassed = input.status === 'passed' ? true : input.status === 'revision_required' ? false : null;
    const nowIso = new Date().toISOString();

    const { error: updateErr } = await admin
      .from('lab_submissions')
      .update({
        status: input.status,
        approved_score: ['passed', 'revision_required'].includes(input.status) ? input.approvedScore : null,
        passed: newPassed,
        reviewed_at: ['passed', 'revision_required'].includes(input.status) ? nowIso : null,
        reviewed_by: ['passed', 'revision_required'].includes(input.status) ? actorId : null,
        feedback: input.feedback ?? null,
      })
      .eq('id', submissionId);

    if (updateErr) {
      throw new Error(`Failed to update lab review: ${updateErr.message}`);
    }

    if (input.status === 'passed' && input.approvedScore !== undefined && input.approvedScore !== null) {
      await admin.from('unit_progress').upsert({
        student_id: submission.student_id,
        class_id: submission.class_id,
        unit_id: submission.unit_id,
        status: 'completed',
        progress_percent: 100,
        approved_score: input.approvedScore,
        passed: true,
        content_version: 1,
        scoring_version: 1,
        completed_at: nowIso,
        approved_by: actorId,
        approved_at: nowIso,
        last_activity_at: nowIso,
      }, { onConflict: 'student_id,class_id,unit_id' });
    }

    return {
      success: true,
      submissionId,
      status: input.status,
    };
  }
}

export async function reviewQuizAttemptService(
  actorId: string,
  classId: string,
  attemptId: string,
  rawInput: unknown,
): Promise<{ success: true; attemptId: string; status: string; approvedScore: number }> {
  const input = quizReviewInputSchema.parse(rawInput);
  await assertCanManageClass(actorId, classId);

  let attempt: {
    id: string;
    class_id: string;
    student_id: string;
    quiz_id: string;
    status: string;
    raw_score: number | null;
    max_score: number;
    passing_percentage: number;
    quizzes?: { unit_id: string; max_score: number; passing_percentage: number } | null;
  } | null = null;

  try {
    const sql = getServerDatabase();
    const [att] = await sql`
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
    attempt = att ? (att as any) : null;
  } catch (err) {
    if (!isDbConnectionError(err)) {
      throw err;
    }
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('quiz_attempts')
      .select('id, class_id, student_id, quiz_id, status, raw_score, quizzes(unit_id, max_score, passing_percentage)')
      .eq('id', attemptId)
      .eq('class_id', classId)
      .maybeSingle();

    if (data) {
      const q = Array.isArray(data.quizzes) ? data.quizzes[0] : data.quizzes;
      attempt = {
        id: data.id,
        class_id: data.class_id,
        student_id: data.student_id,
        quiz_id: data.quiz_id,
        status: data.status,
        raw_score: data.raw_score !== null ? Number(data.raw_score) : null,
        max_score: Number(q?.max_score) || 100,
        passing_percentage: Number(q?.passing_percentage) || 60,
        quizzes: q ?? null,
      };
    }
  }

  if (!attempt) {
    throw new Error('Not found: Quiz attempt not found in this class');
  }

  const maxScore = Number(attempt.max_score) || 100;
  const scorePercent = Math.min(100, Math.max(0, (input.approvedScore / maxScore) * 100));
  const passingPercentage = Number(attempt.passing_percentage) || 60;
  const isPassed = input.status === 'approved' && scorePercent >= passingPercentage;

  try {
    return await withTrustedTransaction(async (tx) => {
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
          jsonb_build_object('status', ${attempt!.status}),
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
  } catch (txErr) {
    if (!isDbConnectionError(txErr)) {
      throw txErr;
    }

    const admin = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();
    const { error: updateErr } = await admin
      .from('quiz_attempts')
      .update({
        raw_score: attempt.raw_score ?? input.approvedScore,
        approved_score: input.approvedScore,
        score_percent: scorePercent,
        passed: isPassed,
        status: input.status,
        approved_by: actorId,
        approved_at: nowIso,
        evaluation_reason: input.feedback ?? null,
        updated_at: nowIso,
      })
      .eq('id', attemptId);

    if (updateErr) {
      throw new Error(`Failed to update quiz review: ${updateErr.message}`);
    }

    if (isPassed && attempt.quizzes?.unit_id) {
      await admin.from('unit_progress').upsert({
        student_id: attempt.student_id,
        class_id: classId,
        unit_id: attempt.quizzes.unit_id,
        approved_score: input.approvedScore,
        passed: true,
        content_version: 1,
        scoring_version: 1,
        approved_by: actorId,
        approved_at: nowIso,
        last_activity_at: nowIso,
      }, { onConflict: 'student_id,class_id,unit_id' });
    }

    return {
      success: true,
      attemptId,
      status: input.status,
      approvedScore: input.approvedScore,
    };
  }
}

