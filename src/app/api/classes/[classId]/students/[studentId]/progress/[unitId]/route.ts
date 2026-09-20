import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../../../lib/auth/claims';
import { overrideStudentProgressService } from '../../../../../../../../server/services/classService';
import { studentProgressPathSchema } from '../../../../../../../../server/http/apiSchemas';
import { getStudentUnitProgressService } from '../../../../../../../../server/services/progressionService';

type RouteContext = {
  params: Promise<{
    classId: string;
    studentId: string;
    unitId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const params = studentProgressPathSchema.parse(await context.params);
    const result = await getStudentUnitProgressService(
      authContext.userId,
      params.classId,
      params.studentId,
      params.unitId,
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid progress path', details: error.issues }, { status: 400 });
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const params = studentProgressPathSchema.parse(await context.params);
    const body = await request.json();

    const result = await overrideStudentProgressService(
      authContext.userId,
      params.classId,
      params.studentId,
      params.unitId,
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
