import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockSql } = vi.hoisted(() => ({
  mockSql: vi.fn(),
}));

vi.mock('../server/database/client', () => ({
  getServerDatabase: () => mockSql,
  withTrustedTransaction: async (cb: any) => cb(mockSql),
}));

import { GET as getPendingReviews } from '../app/api/classes/[classId]/reviews/pending/route';
import { PATCH as reviewQuizAttempt } from '../app/api/classes/[classId]/quizzes/[attemptId]/review/route';
import { GET as getStudentAttempts } from '../app/api/classes/[classId]/students/[studentId]/attempts/route';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../lib/auth/claims';

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

describe('Teacher Review & Attempt History APIs', () => {
  const testClassId = '22222222-2222-4222-8222-222222222222';
  const testStudentId = '44444444-4444-4444-8444-444444444444';
  const testAttemptId = '77777777-7777-4777-8777-777777777777';

  it('GET /api/classes/[classId]/reviews/pending returns unified pending lab & quiz reviews', async () => {
    // 1. assertCanManageClass
    mockSql.mockResolvedValueOnce([{ role: 'teacher', member_role: 'teacher', active: true }]);
    // 2. labRows
    mockSql.mockResolvedValueOnce([
      {
        id: 'lab-1',
        class_id: testClassId,
        unit_id: 'unit-1',
        student_id: testStudentId,
        attempt_no: 1,
        title: 'การเข้าหัว BNC',
        student_notes: 'ต่อสายเสร็จเรียบร้อยครับ',
        status: 'submitted',
        submitted_at: '2026-09-25T10:00:00Z',
        student_code: '67301',
        display_name: 'นาย ก ช่างกล้อง',
        unit_sequence_no: 1,
        unit_title: 'พื้นฐานกล้องวงจรปิด',
        evidence_count: 2,
      },
    ]);
    // 3. quizRows
    mockSql.mockResolvedValueOnce([
      {
        id: 'quiz-1',
        class_id: testClassId,
        student_id: testStudentId,
        attempt_no: 1,
        client_answers: { q1: 'คำตอบอัตนัย' },
        raw_score: 8,
        status: 'submitted',
        submitted_at: '2026-09-25T11:00:00Z',
        student_code: '67301',
        display_name: 'นาย ก ช่างกล้อง',
        quiz_title: 'แบบทดสอบหน่วยที่ 1',
        unit_id: 'unit-1',
        unit_sequence_no: 1,
        unit_title: 'พื้นฐานกล้องวงจรปิด',
      },
    ]);

    const req = new Request(`http://localhost:3000/api/classes/${testClassId}/reviews/pending`);
    const res = await getPendingReviews(req, {
      params: Promise.resolve({ classId: testClassId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].kind).toBe('lab');
    expect(data[0].evidenceCount).toBe(2);
    expect(data[1].kind).toBe('quiz');
  });

  it('PATCH /api/classes/[classId]/quizzes/[attemptId]/review approves quiz attempt and writes audit log', async () => {
    // 1. assertCanManageClass
    mockSql.mockResolvedValueOnce([{ role: 'teacher', member_role: 'teacher', active: true }]);
    // 2. select attempt
    mockSql.mockResolvedValueOnce([
      {
        id: testAttemptId,
        class_id: testClassId,
        student_id: testStudentId,
        quiz_id: 'quiz-1',
        status: 'submitted',
        raw_score: 8,
        max_score: 10,
        passing_percentage: 60,
      },
    ]);
    // 3. update attempt
    mockSql.mockResolvedValueOnce([]);
    // 4. write audit log
    mockSql.mockResolvedValueOnce([]);

    const req = new Request(`http://localhost:3000/api/classes/${testClassId}/quizzes/${testAttemptId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        approvedScore: 9,
        feedback: 'ตอบได้ดีมาก มีความเข้าใจระบบชัดเจน',
      }),
    });

    const res = await reviewQuizAttempt(req, {
      params: Promise.resolve({ classId: testClassId, attemptId: testAttemptId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('approved');
    expect(data.approvedScore).toBe(9);
  });

  it('GET /api/classes/[classId]/students/[studentId]/attempts returns game attempts history', async () => {
    // 1. assertCanManageClass
    mockSql.mockResolvedValueOnce([{ role: 'teacher', member_role: 'teacher', active: true }]);
    // 2. select game attempts
    mockSql.mockResolvedValueOnce([
      {
        id: 'att-1',
        attempt_no: 2,
        mission_id: 'm-1',
        mission_code: 'M01',
        mission_title: 'ภารกิจเข้าหัว BNC',
        unit_id: 'u-1',
        approved_score: '95',
        max_score_snapshot: '100',
        passed: true,
        hints_used: 1,
        result_details: { bncCrimpSuccess: true, continuityTest: 'pass' },
        evaluated_at: '2026-09-25T12:00:00Z',
        created_at: '2026-09-25T11:55:00Z',
      },
    ]);

    const req = new Request(`http://localhost:3000/api/classes/${testClassId}/students/${testStudentId}/attempts`);
    const res = await getStudentAttempts(req, {
      params: Promise.resolve({ classId: testClassId, studentId: testStudentId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].missionCode).toBe('M01');
    expect(data[0].approvedScore).toBe(95);
    expect(data[0].passed).toBe(true);
    expect(data[0].resultDetails.bncCrimpSuccess).toBe(true);
  });
});
