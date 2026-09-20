import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { POST as createSubmission } from '../app/api/learning/submissions/route';
import { POST as uploadEvidence } from '../app/api/learning/submissions/[submissionId]/evidence/route';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../lib/auth/claims';
import { learningSubmissionInputSchema } from '../server/http/apiSchemas';
import {
  buildEvidenceStoragePath,
  sanitizeEvidenceFileName,
} from '../server/services/learningSubmissionService';

vi.mock('../lib/auth/claims', async () => {
  const actual = await vi.importActual<typeof import('../lib/auth/claims')>('../lib/auth/claims');
  return {
    ...actual,
    requireVerifiedAuthContext: vi.fn(async () => ({
      userId: '11111111-1111-4111-8111-111111111111',
      claims: { sub: '11111111-1111-4111-8111-111111111111' },
    })),
  };
});

describe('Learning submission and evidence contracts', () => {
  it('rejects a client-supplied student identity instead of trusting it', () => {
    const result = learningSubmissionInputSchema.safeParse({
      kind: 'quiz',
      classId: '22222222-2222-4222-8222-222222222222',
      quizId: '33333333-3333-4333-8333-333333333333',
      answers: { answer: 'A' },
      studentId: '44444444-4444-4444-8444-444444444444',
    });

    expect(result.success).toBe(false);
  });

  it('keeps evidence paths inside the authenticated submission directory', () => {
    const actorId = '11111111-1111-4111-8111-111111111111';
    const submissionId = '22222222-2222-4222-8222-222222222222';

    expect(sanitizeEvidenceFileName('../lab photo.png')).toBe('lab_photo.png');
    expect(buildEvidenceStoragePath(actorId, submissionId, '../lab photo.png')).toMatch(
      new RegExp(`^${actorId}/${submissionId}/[0-9a-f-]+-lab_photo\\.png$`),
    );
  });

  it('returns 400 when a learning submission payload is incomplete', async () => {
    const response = await createSubmission(
      new Request('http://localhost:3000/api/learning/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'quiz', classId: 'not-a-uuid' }),
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('Invalid learning submission payload');
  });

  it('returns 400 when an evidence upload does not contain a file', async () => {
    const form = new FormData();
    form.set('metadata', JSON.stringify({ evidenceType: 'safety_check' }));

    const response = await uploadEvidence(
      new Request('http://localhost:3000/api/learning/submissions/22222222-2222-4222-8222-222222222222/evidence', {
        method: 'POST',
        body: form,
      }),
      { params: Promise.resolve({ submissionId: '22222222-2222-4222-8222-222222222222' }) },
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('Evidence file is required');
  });

  it('returns 401 when an unauthenticated learner uploads evidence', async () => {
    vi.mocked(requireVerifiedAuthContext).mockRejectedValueOnce(new UnauthenticatedError());
    const form = new FormData();
    form.set('file', new File(['evidence'], 'evidence.png', { type: 'image/png' }));

    const response = await uploadEvidence(
      new Request('http://localhost:3000/api/learning/submissions/22222222-2222-4222-8222-222222222222/evidence', {
        method: 'POST',
        body: form,
      }),
      { params: Promise.resolve({ submissionId: '22222222-2222-4222-8222-222222222222' }) },
    );

    expect(response.status).toBe(401);
  });
});
