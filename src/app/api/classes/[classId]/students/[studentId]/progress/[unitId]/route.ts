import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../../../lib/auth/claims';
import { overrideStudentProgressService } from '../../../../../../../../server/services/classService';

type RouteContext = {
  params: Promise<{
    classId: string;
    studentId: string;
    unitId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { classId, studentId, unitId } = await context.params;
    const body = await request.json();

    const result = await overrideStudentProgressService(
      authContext.userId,
      classId,
      studentId,
      unitId,
      body,
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid progress override payload', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('Forbidden:')) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return Response.json({ error: message }, { status: 500 });
  }
}
