import 'server-only';

import { assertCanManageClass } from './classService';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { teacherReviewInputSchema } from '../http/apiSchemas';

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
