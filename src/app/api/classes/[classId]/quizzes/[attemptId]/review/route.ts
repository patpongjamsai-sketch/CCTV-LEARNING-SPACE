import { z, ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../../lib/auth/claims';
import { reviewQuizAttemptService } from '../../../../../../../server/services/teacherReviewService';

const quizReviewRouteSchema = z.object({
  classId: z.string().uuid(),
  attemptId: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{
    classId: string;
    attemptId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const params = quizReviewRouteSchema.parse(await context.params);
    const body = await request.json();

    const result = await reviewQuizAttemptService(
      authContext.userId,
      params.classId,
      params.attemptId,
      body,
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid quiz review payload', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('Forbidden:')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Not found:')) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return Response.json({ error: message }, { status: 500 });
  }
}
