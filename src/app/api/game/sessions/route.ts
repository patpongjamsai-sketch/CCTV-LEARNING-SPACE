import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../lib/auth/claims';
import { createGameSessionService } from '../../../../server/services/gameService';

export async function POST(request: Request) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const body = await request.json();

    const session = await createGameSessionService(authContext.userId, body);

    return Response.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: 'Invalid session payload', details: error.issues }, { status: 400 });
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
