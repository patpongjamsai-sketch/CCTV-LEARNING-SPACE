import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { POST as createSession } from '../app/api/game/sessions/route';
import { POST as appendEvents } from '../app/api/game/sessions/[sessionId]/events/route';
import { POST as finalizeSession } from '../app/api/game/sessions/[sessionId]/finalize/route';
import { POST as importStudents } from '../app/api/classes/[classId]/students/import/route';
import { PATCH as overrideProgress } from '../app/api/classes/[classId]/students/[studentId]/progress/[unitId]/route';

import { requireVerifiedAuthContext, UnauthenticatedError } from '../lib/auth/claims';

// Mock auth claims to control authentication in tests
vi.mock('../lib/auth/claims', async () => {
  const actual = await vi.importActual<typeof import('../lib/auth/claims')>('../lib/auth/claims');
  return {
    ...actual,
    requireVerifiedAuthContext: vi.fn(async () => {
      // default: return test user context
      return {
        userId: '11111111-1111-4111-8111-111111111111',
        claims: { sub: '11111111-1111-4111-8111-111111111111' },
      };
    }),
  };
});

describe('API Route Handlers - Security and Validation Contracts', () => {
  it('returns 401 Unauthorized when auth context is missing or unauthenticated', async () => {
    vi.mocked(requireVerifiedAuthContext).mockRejectedValueOnce(new UnauthenticatedError());

    const request = new Request('http://localhost:3000/api/game/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: '11111111-1111-4111-8111-111111111111' }),
    });

    const response = await createSession(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Authenticated claims are required.');
  });

  it('POST /api/game/sessions rejects malformed payloads with 400', async () => {
    const request = new Request('http://localhost:3000/api/game/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: 'not-a-uuid' }),
    });

    const response = await createSession(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toContain('Invalid session payload');
  });

  it('POST /api/game/sessions/[sessionId]/events rejects invalid event sequence numbers with 400', async () => {
    const request = new Request('http://localhost:3000/api/game/sessions/s1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            clientEventId: '22222222-2222-4222-8222-222222222222',
            sequenceNo: 0, // invalid (min is 1)
            eventType: 'mission_started',
            payload: {},
            clientOccurredAt: new Date().toISOString(),
          },
        ],
      }),
    });

    const response = await appendEvents(request, {
      params: Promise.resolve({ sessionId: 's1' }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid event payload');
  });

  it('POST /api/game/sessions/[sessionId]/finalize rejects malformed payloads with 400', async () => {
    const request = new Request('http://localhost:3000/api/game/sessions/s1/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionId: 'not-a-uuid',
      }),
    });

    const response = await finalizeSession(request, {
      params: Promise.resolve({ sessionId: 's1' }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid finalization payload');
  });

  it('POST /api/classes/[classId]/students/import rejects invalid CSV content with 400', async () => {
    const request = new Request('http://localhost:3000/api/classes/c1/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csv: 'invalid,header\nsomething,else',
      }),
    });

    const response = await importStudents(request, {
      params: Promise.resolve({ classId: 'c1' }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/email,student_code,display_name/);
  });

  it('PATCH /api/classes/[classId]/students/[studentId]/progress/[unitId] rejects blank reason with 400', async () => {
    const request = new Request('http://localhost:3000/api/classes/c1/students/s1/progress/u1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progressPercent: 100,
        passed: true,
        reason: '   ', // blank reason
      }),
    });

    const response = await overrideProgress(request, {
      params: Promise.resolve({
        classId: 'c1',
        studentId: 's1',
        unitId: 'u1',
      }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid progress override payload');
  });
});
