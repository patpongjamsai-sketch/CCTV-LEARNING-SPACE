import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../lib/auth/claims';
import { importStudentsFromCsvService } from '../../../../../../server/services/classService';

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { classId } = await context.params;

    let csvContent: string;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return Response.json({ error: 'Missing CSV file in form data' }, { status: 400 });
      }
      csvContent = await (file as File).text();
    } else {
      const body = await request.json();
      if (typeof body?.csv !== 'string') {
        return Response.json({ error: 'Body must contain a csv string property' }, { status: 400 });
      }
      csvContent = body.csv;
    }

    const result = await importStudentsFromCsvService(authContext.userId, classId, csvContent);

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid CSV format', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('Forbidden:')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('CSV')) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return Response.json({ error: message }, { status: 500 });
  }
}
