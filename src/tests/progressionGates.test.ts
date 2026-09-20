import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockSql, mockTx, mockTrustedTransaction } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockTx: vi.fn(),
  mockTrustedTransaction: vi.fn(async (operation: (tx: unknown) => unknown) => operation(mockTx)),
}));

vi.mock('../server/database/client', () => ({
  getServerDatabase: () => mockSql,
  withTrustedTransaction: mockTrustedTransaction,
}));

import { GET as getProgress } from '../app/api/classes/[classId]/students/[studentId]/progress/[unitId]/route';
import { PATCH as reviewLab } from '../app/api/learning/lab-submissions/[submissionId]/review/route';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../lib/auth/claims';
import { teacherReviewInputSchema } from '../server/http/apiSchemas';
import { getStudentProgressOverviewService } from '../server/services/progressionService';
import { reviewLabSubmissionService } from '../server/services/teacherReviewService';

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

describe('Server-authoritative progression and teacher verification', () => {
  it('reads overview progress and unlock state from the server contract', async () => {
    mockSql
      .mockResolvedValueOnce([{
        actor_id: '11111111-1111-4111-8111-111111111111',
        actor_role: 'student',
        actor_active: true,
        actor_member_role: 'student',
        actor_member_active: true,
        target_id: '11111111-1111-4111-8111-111111111111',
        target_profile_active: true,
        target_member_active: true,
        target_member_role: 'student',
      }])
      .mockResolvedValueOnce([{
        class_id: '22222222-2222-4222-8222-222222222222',
        unit_id: '33333333-3333-4333-8333-333333333333',
        sequence_no: 1,
        title: 'พื้นฐานระบบ CCTV',
        unit_status: 'published',
        content_version: 1,
        progress_percent: '60',
        approved_score: '85',
        passed: true,
        status: 'completed',
        attempt_count: 2,
        time_spent_seconds: 900,
        unlocked: true,
        latest_lab_submission_id: '66666666-6666-4666-8666-666666666666',
        latest_lab_status: 'passed',
        latest_lab_passed: true,
        latest_lab_approved_score: '92',
        latest_lab_reviewed_at: '2026-09-16T10:00:00.000Z',
      }]);

    await expect(
      getStudentProgressOverviewService(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
      ),
    ).resolves.toEqual({
      classId: '22222222-2222-4222-8222-222222222222',
      studentId: '11111111-1111-4111-8111-111111111111',
      units: [{
        unitId: '33333333-3333-4333-8333-333333333333',
        sequenceNo: 1,
        title: 'พื้นฐานระบบ CCTV',
        unitStatus: 'published',
        contentVersion: 1,
        progressPercent: 60,
        approvedScore: 85,
        passed: true,
        status: 'completed',
        attemptCount: 2,
        timeSpentSeconds: 900,
        unlocked: true,
        latestLabSubmission: {
          id: '66666666-6666-4666-8666-666666666666',
          status: 'passed',
          passed: true,
          approvedScore: 92,
          reviewedAt: '2026-09-16T10:00:00.000Z',
        },
      }],
    });
  });

  it('does not expose progress for an inactive target profile', async () => {
    mockSql.mockReset();
    mockSql.mockResolvedValueOnce([{
      actor_id: '11111111-1111-4111-8111-111111111111',
      actor_role: 'student',
      actor_active: true,
      actor_member_role: 'student',
      actor_member_active: true,
      target_id: '11111111-1111-4111-8111-111111111111',
      target_profile_active: false,
      target_member_active: true,
      target_member_role: 'student',
    }]);

    await expect(
      getStudentProgressOverviewService(
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
      ),
    ).rejects.toThrow('Forbidden: cannot read this student progress');
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('requires an approved score when a teacher marks a LAB as passed', () => {
    const result = teacherReviewInputSchema.safeParse({
      status: 'passed',
      feedback: 'ตรวจแล้ว',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a client-supplied score while a teacher marks a LAB as reviewing', () => {
    const result = teacherReviewInputSchema.safeParse({
      status: 'reviewing',
      approvedScore: 90,
    });

    expect(result.success).toBe(false);
  });

  it('lets only an authorized teacher transition a LAB through the trusted review function', async () => {
    mockSql.mockReset();
    mockTx.mockReset();
    mockSql
      .mockResolvedValueOnce([{
        id: '66666666-6666-4666-8666-666666666666',
        class_id: '22222222-2222-4222-8222-222222222222',
        status: 'reviewing',
      }])
      .mockResolvedValueOnce([{
        role: 'teacher',
        member_role: 'teacher',
        active: true,
      }]);
    mockTx.mockResolvedValueOnce([{
      submission_id: '66666666-6666-4666-8666-666666666666',
    }]);

    await expect(
      reviewLabSubmissionService(
        '77777777-7777-4777-8777-777777777777',
        '66666666-6666-4666-8666-666666666666',
        { status: 'passed', approvedScore: 92, feedback: 'ผ่านเกณฑ์' },
      ),
    ).resolves.toEqual({
      success: true,
      submissionId: '66666666-6666-4666-8666-666666666666',
      status: 'passed',
    });
    expect(mockTrustedTransaction).toHaveBeenCalledTimes(1);
    expect(mockTx).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when an unauthenticated learner reads progress and gates', async () => {
    vi.mocked(requireVerifiedAuthContext).mockRejectedValueOnce(new UnauthenticatedError());

    const response = await getProgress(new Request('http://localhost:3000/progress'), {
      params: Promise.resolve({
        classId: '22222222-2222-4222-8222-222222222222',
        studentId: '11111111-1111-4111-8111-111111111111',
        unitId: '33333333-3333-4333-8333-333333333333',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 400 when a teacher review path or payload is malformed', async () => {
    const response = await reviewLab(
      new Request('http://localhost:3000/api/learning/lab-submissions/not-a-uuid/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'passed' }),
      }),
      { params: Promise.resolve({ submissionId: 'not-a-uuid' }) },
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid JSON instead of leaking a server error', async () => {
    const response = await reviewLab(
      new Request('http://localhost:3000/api/learning/lab-submissions/66666666-6666-4666-8666-666666666666/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{"status":',
      }),
      { params: Promise.resolve({ submissionId: '66666666-6666-4666-8666-666666666666' }) },
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 when the database rejects a passed LAB without evidence', async () => {
    mockSql.mockReset();
    mockTx.mockReset();
    mockSql
      .mockResolvedValueOnce([{
        id: '66666666-6666-4666-8666-666666666666',
        class_id: '22222222-2222-4222-8222-222222222222',
        status: 'reviewing',
      }])
      .mockResolvedValueOnce([{
        role: 'teacher',
        member_role: 'teacher',
        active: true,
      }]);
    mockTx.mockRejectedValueOnce(new Error('A passed LAB requires at least one evidence file'));

    const response = await reviewLab(
      new Request('http://localhost:3000/api/learning/lab-submissions/66666666-6666-4666-8666-666666666666/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'passed', approvedScore: 90 }),
      }),
      { params: Promise.resolve({ submissionId: '66666666-6666-4666-8666-666666666666' }) },
    );

    expect(response.status).toBe(400);
  });

  it('rejects malformed teacher override paths before touching the database', async () => {
    mockSql.mockClear();
    const response = await (await import('../app/api/classes/[classId]/students/[studentId]/progress/[unitId]/route')).PATCH(
      new Request('http://localhost:3000/api/classes/not-a-uuid/students/not-a-uuid/progress/not-a-uuid', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressPercent: 100, passed: true, reason: 'ตรวจผ่าน' }),
      }),
      {
        params: Promise.resolve({
          classId: 'not-a-uuid',
          studentId: 'not-a-uuid',
          unitId: 'not-a-uuid',
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(mockSql).not.toHaveBeenCalled();
  });
});
