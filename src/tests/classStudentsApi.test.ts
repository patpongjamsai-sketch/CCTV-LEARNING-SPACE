import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockSql } = vi.hoisted(() => ({
  mockSql: vi.fn(),
}));

vi.mock('../server/database/client', () => ({
  getServerDatabase: () => mockSql,
}));

import { GET as getClassStudents } from '../app/api/classes/[classId]/students/route';
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

describe('GET /api/classes/[classId]/students route contract', () => {
  it('returns 401 when request is unauthenticated', async () => {
    vi.mocked(requireVerifiedAuthContext).mockRejectedValueOnce(new UnauthenticatedError());

    const request = new Request('http://localhost:3000/api/classes/22222222-2222-4222-8222-222222222222/students');
    const response = await getClassStudents(request, {
      params: Promise.resolve({ classId: '22222222-2222-4222-8222-222222222222' }),
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Authenticated claims are required.');
  });

  it('returns 400 when classId is not a valid UUID', async () => {
    const request = new Request('http://localhost:3000/api/classes/not-a-uuid/students');
    const response = await getClassStudents(request, {
      params: Promise.resolve({ classId: 'not-a-uuid' }),
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid class path');
  });

  it('returns enrolled students with their unit progress when authorized', async () => {
    // 1st sql call: assertCanManageClass query
    mockSql.mockResolvedValueOnce([
      { role: 'teacher', member_role: 'teacher', active: true },
    ]);

    // 2nd sql call: getClassStudentsService main query
    mockSql.mockResolvedValueOnce([
      {
        student_id: '44444444-4444-4444-4444-444444444444',
        student_code: '67301',
        display_name: 'นาย ก ช่างกล้อง',
        unit_id: '33333333-3333-4333-8333-333333333333',
        sequence_no: 1,
        progress_percent: '100',
        passed: true,
        unlocked: true,
        approved_score: '85',
      },
      {
        student_id: '55555555-5555-4555-8555-555555555555',
        student_code: '67302',
        display_name: 'นาย ข ปฏิบัติการ',
        unit_id: '33333333-3333-4333-8333-333333333333',
        sequence_no: 1,
        progress_percent: '40',
        passed: false,
        unlocked: false,
        approved_score: null,
      },
    ]);

    const request = new Request('http://localhost:3000/api/classes/22222222-2222-4222-8222-222222222222/students');
    const response = await getClassStudents(request, {
      params: Promise.resolve({ classId: '22222222-2222-4222-8222-222222222222' }),
    });

    expect(response.status).toBe(200);
    const students = await response.json();

    expect(Array.isArray(students)).toBe(true);
    expect(students).toHaveLength(2);
    expect(students[0].studentCode).toBe('67301');
    expect(students[0].displayName).toBe('นาย ก ช่างกล้อง');
    expect(students[0].unitProgress.U01.passed).toBe(true);
    expect(students[0].unitProgress.U01.unlocked).toBe(true);

    expect(students[1].studentCode).toBe('67302');
    expect(students[1].displayName).toBe('นาย ข ปฏิบัติการ');
    expect(students[1].unitProgress.U01.passed).toBe(false);
  });
});
