import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../lib/auth/claims';
import { classPathSchema } from '../../../../../../server/http/apiSchemas';
import { getPendingReviewsService } from '../../../../../../server/services/teacherReviewService';

type RouteContext = {
  params: Promise<{
    classId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const params = classPathSchema.parse(await context.params);

    const pending = await getPendingReviewsService(authContext.userId, params.classId);

    return Response.json(pending, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid class path', details: error.issues }, { status: 400 });
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
