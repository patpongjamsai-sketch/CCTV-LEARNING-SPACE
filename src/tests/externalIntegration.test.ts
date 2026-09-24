import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generateScoreSignature,
  recordExternalScore,
  getStudentScores,
} from '../server/services/externalScoreService';
import { GET as getScoresApi, POST as postScoresApi } from '../app/api/external/scores/route';
import { NextRequest } from 'next/server';
import { UnauthenticatedError } from '../lib/auth/claims';

let mockAuthUser: { userId: string } | null = { userId: '11111111-1111-4111-8111-111111111111' };
let mockProfileRole = 'student';
let mockStudentCode = 'STD-API-USER';

vi.mock('../lib/auth/claims', () => ({
  UnauthenticatedError: class UnauthenticatedError extends Error {
    constructor() {
      super('Authenticated claims are required.');
      this.name = 'UnauthenticatedError';
    }
  },
  requireVerifiedAuthContext: vi.fn(async () => {
    if (!mockAuthUser) {
      throw new UnauthenticatedError();
    }
    return { userId: mockAuthUser.userId, claims: { sub: mockAuthUser.userId } };
  }),
}));

vi.mock('../lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: mockAuthUser?.userId,
              role: mockProfileRole,
              student_code: mockStudentCode,
              display_name: 'กานต์ดา',
            },
          }),
        }),
      }),
    }),
  }),
}));

describe('External Website Integration & Score Synchronization', () => {
  beforeEach(() => {
    mockAuthUser = { userId: '11111111-1111-4111-8111-111111111111' };
    mockProfileRole = 'student';
    mockStudentCode = 'STD-API-USER';
  });

  it('generates consistent HMAC-SHA256 signatures for score payloads', () => {
    const data = {
      studentCode: 'STD670101',
      roomId: 'room-102',
      score: 95,
      completedAt: '2026-09-17T12:00:00.000Z',
    };

    const sig1 = generateScoreSignature(data, 'test-secret');
    const sig2 = generateScoreSignature(data, 'test-secret');
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // SHA-256 hex length
  });

  it('records external student scores in the integration service', () => {
    const record = recordExternalScore({
      studentCode: 'STD-UNIT-TEST-1',
      studentName: 'สมศักดิ์ ทดสอบ',
      roomId: 'room-103',
      unitId: 'U03',
      score: 90,
      returnUrl: 'https://school.ac.th/cctv/callback',
    });

    expect(record.studentCode).toBe('STD-UNIT-TEST-1');
    expect(record.passed).toBe(true);
    expect(record.signature).toBeDefined();

    const history = getStudentScores('STD-UNIT-TEST-1');
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0]?.score).toBe(90);
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockAuthUser = null;

    const postReq = new NextRequest('http://localhost:3000/api/external/scores', {
      method: 'POST',
      body: JSON.stringify({
        room_id: 'room-104',
        score: 88,
      }),
    });

    const postRes = await postScoresApi(postReq);
    expect(postRes.status).toBe(401);

    const getReq = new NextRequest('http://localhost:3000/api/external/scores');
    const getRes = await getScoresApi(getReq);
    expect(getRes.status).toBe(401);
  });

  it('prevents students from accessing or recording scores for other student codes', async () => {
    mockAuthUser = { userId: '11111111-1111-4111-8111-111111111111' };
    mockProfileRole = 'student';
    mockStudentCode = 'MY-CODE';

    // Student tries to POST for another student code
    const postReq = new NextRequest('http://localhost:3000/api/external/scores', {
      method: 'POST',
      body: JSON.stringify({
        student_code: 'ANOTHER-STUDENT',
        room_id: 'room-104',
        score: 100,
      }),
    });
    const postRes = await postScoresApi(postReq);
    expect(postRes.status).toBe(403);

    // Student tries to GET another student's scores
    const getReq = new NextRequest('http://localhost:3000/api/external/scores?student_code=ANOTHER-STUDENT');
    const getRes = await getScoresApi(getReq);
    expect(getRes.status).toBe(403);
  });

  it('serves GET and POST through the external scores API route for verified student', async () => {
    mockAuthUser = { userId: '11111111-1111-4111-8111-111111111111' };
    mockProfileRole = 'student';
    mockStudentCode = 'STD-API-USER';

    // POST new score
    const postReq = new NextRequest('http://localhost:3000/api/external/scores', {
      method: 'POST',
      body: JSON.stringify({
        room_id: 'room-104',
        unit_id: 'U04',
        score: 88,
      }),
    });

    const postRes = await postScoresApi(postReq);
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.success).toBe(true);
    expect(postJson.record.score).toBe(88);
    expect(postJson.record.studentCode).toBe('STD-API-USER');

    // GET score for this student
    const getReq = new NextRequest('http://localhost:3000/api/external/scores?student_code=STD-API-USER');
    const getRes = await getScoresApi(getReq);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.student_code).toBe('STD-API-USER');
    expect(getJson.scores.length).toBeGreaterThanOrEqual(1);
    expect(getJson.scores[0].unitId).toBe('U04');
  });
});

