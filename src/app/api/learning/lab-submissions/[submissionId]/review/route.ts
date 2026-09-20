import { ZodError } from 'zod';

import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../lib/auth/claims';
import { evidenceSubmissionIdSchema } from '../../../../../../server/http/apiSchemas';
import { reviewLabSubmissionService } from '../../../../../../server/services/teacherReviewService';

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { submissionId: rawSubmissionId } = await context.params;
    const submissionId = evidenceSubmissionIdSchema.parse(rawSubmissionId);
    const result = await reviewLabSubmissionService(
      authContext.userId,
      submissionId,
      await request.json(),
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid teacher review payload', details: error.issues }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('Forbidden:')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Not found:')) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message.startsWith('Invalid LAB review transition')) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('A passed LAB requires')) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return Response.json({ error: message }, { status: 500 });
  }
}
