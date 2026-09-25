import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../../lib/auth/claims';
import { classStudentPathSchema } from '../../../../../../../server/http/apiSchemas';
import { getStudentGameAttemptsHistoryService } from '../../../../../../../server/services/gameService';

type RouteContext = {
  params: Promise<{
    classId: string;
    studentId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const params = classStudentPathSchema.parse(await context.params);

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId') || undefined;

    const attempts = await getStudentGameAttemptsHistoryService(
      authContext.userId,
      params.classId,
      params.studentId,
      unitId,
    );

    return Response.json(attempts, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid request path', details: error.issues }, { status: 400 });
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
