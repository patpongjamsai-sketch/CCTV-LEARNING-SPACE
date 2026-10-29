import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockSql, mockAdminClient } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockAdminClient: {
    from: vi.fn(),
  },
}));

vi.mock('../server/database/client', () => ({
  getServerDatabase: () => mockSql,
}));

vi.mock('../lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => mockAdminClient,
}));

import { joinClassService } from '../server/services/classService';
import { POST as joinClassRoute } from '../app/api/classes/join/route';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../lib/auth/claims';

vi.mock('../lib/auth/claims', async () => {
  const actual = await vi.importActual<typeof import('../lib/auth/claims')>('../lib/auth/claims');
  return {
    ...actual,
    requireVerifiedAuthContext: vi.fn(async () => ({
      userId: '33333333-3333-4333-8333-333333333333',
      claims: { sub: '33333333-3333-4333-8333-333333333333' },
    })),
  };
});

describe('joinClassService & /api/classes/join route contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully enrolls a student into PV1 via primary SQL database', async () => {
    // 1st sql call: check existing class membership
    mockSql.mockResolvedValueOnce([]);
    // 2nd sql call: insert/update class
    mockSql.mockResolvedValueOnce([]);
    // 3rd sql call: update profile
    mockSql.mockResolvedValueOnce([]);
    // 4th sql call: insert/update class_members
    mockSql.mockResolvedValueOnce([]);

    const result = await joinClassService('33333333-3333-4333-8333-333333333333', {
      joinCode: 'PV1',
      studentCode: '69219090001',
      displayName: 'นางสาวบัณฑิตา เพ็งกลาง',
    });

    expect(result.success).toBe(true);
    expect(result.classCode).toBe('PV1');
    expect(result.classId).toBe('22222222-2222-4222-8222-222222222222');
  });

  it('rejects with error when student is already enrolled in another class', async () => {
    // Student is already active in PV2
    mockSql.mockResolvedValueOnce([
      {
        class_id: '22222222-2222-4222-8222-222222222223',
        active: true,
        class_code: 'PV2',
      },
    ]);

    await expect(
      joinClassService('33333333-3333-4333-8333-333333333333', {
        joinCode: 'PV1',
        studentCode: '69219090001',
        displayName: 'นักเรียนทดสอบ',
      }),
    ).rejects.toThrow('คุณได้ลงทะเบียนอยู่ในกลุ่ม PV2 แล้ว');
  });

  it('uses admin Supabase client fallback when direct SQL fails', async () => {
    // Direct SQL throws connection error
    mockSql.mockRejectedValueOnce(new Error('Connection timeout to Supavisor'));

    // Admin Supabase mock setup:
    // 1. check member
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqActive = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqProfile = vi.fn().mockReturnValue({ eq: mockEqActive });
    const mockSelectMembers = vi.fn().mockReturnValue({ eq: mockEqProfile });

    // 2. check courses
    const mockCourseMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'course-uuid-1' }, error: null });
    const mockCourseLimit = vi.fn().mockReturnValue({ maybeSingle: mockCourseMaybeSingle });
    const mockCourseSelect = vi.fn().mockReturnValue({ limit: mockCourseLimit });

    // 3. upsert classes
    const mockClassesUpsert = vi.fn().mockResolvedValue({ data: null, error: null });

    // 4. update profiles
    const mockProfileEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockProfileUpdate = vi.fn().mockReturnValue({ eq: mockProfileEq });

    // 5. upsert class_members
    const mockMembersUpsert = vi.fn().mockResolvedValue({ data: null, error: null });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'class_members') {
        return {
          select: mockSelectMembers,
          upsert: mockMembersUpsert,
        };
      }
      if (table === 'courses') {
        return {
          select: mockCourseSelect,
        };
      }
      if (table === 'classes') {
        return {
          upsert: mockClassesUpsert,
        };
      }
      if (table === 'profiles') {
        return {
          update: mockProfileUpdate,
        };
      }
      return {};
    });

    const result = await joinClassService('33333333-3333-4333-8333-333333333333', {
      joinCode: 'PV3',
      studentCode: '69219090028',
      displayName: 'นายหรรษา มัครมย์',
    });

    expect(result.success).toBe(true);
    expect(result.classCode).toBe('PV3');
    expect(result.classId).toBe('22222222-2222-4222-8222-222222222224');
    expect(mockMembersUpsert).toHaveBeenCalled();
    expect(mockProfileUpdate).toHaveBeenCalled();
  });

  it('POST /api/classes/join returns 401 when unauthenticated', async () => {
    vi.mocked(requireVerifiedAuthContext).mockRejectedValueOnce(new UnauthenticatedError());

    const req = new Request('http://localhost:3000/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        joinCode: 'PV1',
        studentCode: '69219090001',
        displayName: 'นักเรียน',
      }),
    });

    const res = await joinClassRoute(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('กรุณาเข้าสู่ระบบ');
  });

  it('POST /api/classes/join returns 400 when input validation fails', async () => {
    const req = new Request('http://localhost:3000/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        joinCode: 'INVALID_GROUP',
        studentCode: '123',
        displayName: 'A',
      }),
    });

    const res = await joinClassRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
