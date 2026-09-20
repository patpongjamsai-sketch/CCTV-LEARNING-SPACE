import { ZodError } from 'zod';

import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../lib/auth/claims';
import {
  evidenceMetadataSchema,
  evidenceSubmissionIdSchema,
} from '../../../../../../server/http/apiSchemas';
import { uploadLearningEvidence } from '../../../../../../server/services/learningSubmissionService';

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value
      && typeof value === 'object'
      && 'arrayBuffer' in value
      && typeof value.arrayBuffer === 'function'
      && 'size' in value
      && typeof value.size === 'number'
      && 'type' in value
      && typeof value.type === 'string',
  );
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { submissionId: rawSubmissionId } = await context.params;
    const submissionId = evidenceSubmissionIdSchema.parse(rawSubmissionId);
    const form = await request.formData();
    const file = form.get('file');

    if (!isFileLike(file)) {
      return Response.json({ error: 'Evidence file is required' }, { status: 400 });
    }

    const metadataRaw = form.get('metadata');
    let metadata: Record<string, unknown> = {};
    if (typeof metadataRaw === 'string' && metadataRaw.trim() !== '') {
      metadata = evidenceMetadataSchema.parse(JSON.parse(metadataRaw));
    }

    const result = await uploadLearningEvidence(
      authContext.userId,
      submissionId,
      file,
      metadata,
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        { error: 'Invalid evidence upload payload' },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message.startsWith('Forbidden:')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Not found:')) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const status = message.startsWith('Evidence file') ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
