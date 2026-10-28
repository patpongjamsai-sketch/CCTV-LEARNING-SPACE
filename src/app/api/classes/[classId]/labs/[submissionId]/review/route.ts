import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../../lib/auth/claims';
import { evidenceSubmissionIdSchema } from '../../../../../../../server/http/apiSchemas';
import { reviewLabSubmissionService } from '../../../../../../../server/services/teacherReviewService';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ classId: string; submissionId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { submissionId: rawSubmissionId } = await context.params;
    const submissionId = evidenceSubmissionIdSchema.parse(rawSubmissionId);
    const body = await request.json();

    const result = await reviewLabSubmissionService(
      authContext.userId,
      submissionId,
      body,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid teacher review payload', details: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
