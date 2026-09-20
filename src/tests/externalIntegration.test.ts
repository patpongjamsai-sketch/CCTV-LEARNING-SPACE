import { describe, expect, it } from 'vitest';
import {
  generateScoreSignature,
  recordExternalScore,
  getStudentScores,
} from '../server/services/externalScoreService';
import { GET as getScoresApi, POST as postScoresApi } from '../app/api/external/scores/route';
import { NextRequest } from 'next/server';

describe('External Website Integration & Score Synchronization', () => {
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

  it('serves GET and POST through the external scores API route', async () => {
    // POST new score
    const postReq = new NextRequest('http://localhost:3000/api/external/scores', {
      method: 'POST',
      body: JSON.stringify({
        student_code: 'STD-API-USER',
        student_name: 'กานต์ดา',
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
