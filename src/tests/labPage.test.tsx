import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('server-only', () => ({}));

const { mockAdminFrom, mockProgression, mockRoomSlug } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
  mockProgression: vi.fn(async () => ({ unlocked: true })),
  mockRoomSlug: { value: 'room-202' },
}));

function queryResult(data: unknown) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data })),
    single: vi.fn(async () => ({ data })),
  };
  return query;
}

vi.mock('../lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({
    from: mockAdminFrom,
  }),
}));

vi.mock('../server/services/progressionService', () => ({
  getStudentUnitProgressService: mockProgression,
}));

// Mock next/navigation
const mockRedirect = vi.fn();
const mockNotFound = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: () => {
    mockNotFound();
    throw new Error('NOT_FOUND');
  },
}));

// Mock auth claims
let mockAuthUser: { userId: string } | null = null;
vi.mock('../lib/auth/claims', () => ({
  getVerifiedAuthContext: vi.fn(async () => mockAuthUser),
}));

// Mock LabClientContainer for SSR static markup rendering
vi.mock('../app/labs/3d/[roomId]/LabClientContainer', () => ({
  LabClientContainer: (props: any) => (
    <div data-testid="lab-client-container">
      <span>{props.learner.displayName}</span>
      <span>{props.roomTitle}</span>
    </div>
  ),
}));

mockAdminFrom.mockImplementation((table: string) => {
  if (table === 'profiles') {
    return queryResult({
      id: '11111111-1111-4111-8111-111111111111',
      display_name: 'ผู้เรียนทดสอบ',
      role: 'student',
      student_code: 'ST-001',
    });
  }
  if (table === 'game_rooms') {
    return queryResult({
      id: '55555555-5555-4555-8555-555555555555',
      unit_id: '33333333-3333-4333-8333-333333333333',
      slug: mockRoomSlug.value,
      code: mockRoomSlug.value === 'room-101' ? 'ROOM-101' : 'ROOM-202',
      title: mockRoomSlug.value === 'room-101' ? 'Room 101 · Smart Mart' : 'Room 202 · Retail',
      status: 'published',
      content_version: 1,
    });
  }
  if (table === 'class_members') {
    return queryResult({
      class_id: '22222222-2222-4222-8222-222222222222',
      member_role: 'student',
    });
  }
  return queryResult(null);
});

import LabPage from '../app/labs/3d/[roomId]/page';

describe('3D Lab Page Gating & Permissions', () => {
  it('redirects unauthenticated users to /login with next parameter', async () => {
    mockAuthUser = null;

    await expect(
      LabPage({ params: Promise.resolve({ roomId: 'room-101' }) }),
    ).rejects.toThrow('REDIRECT:/login?next=%2Flabs%2F3d%2Froom-101');

    expect(mockRedirect).toHaveBeenCalledWith('/login?next=%2Flabs%2F3d%2Froom-101');
  });

  it('renders mock container for room-101 in fallback / preview environment', async () => {
    mockAuthUser = { userId: '11111111-1111-4111-8111-111111111111' };
    mockRoomSlug.value = 'room-101';

    const jsx = await LabPage({ params: Promise.resolve({ roomId: 'room-101' }) });
    const html = renderToStaticMarkup(jsx);

    expect(html).toContain('data-testid="lab-client-container"');
    expect(html).toContain('Room 101 · Smart Mart');
    mockRoomSlug.value = 'room-202';
  });

  it('blocks unauthenticated access attempts even if student_code and student_name query params are supplied', async () => {
    mockAuthUser = null;

    await expect(
      LabPage({
        params: Promise.resolve({ roomId: 'room-102' }),
        searchParams: Promise.resolve({
          student_code: 'STD-SPOOF',
          student_name: 'Imposter User',
        } as any),
      }),
    ).rejects.toThrow('REDIRECT:/login?next=%2Flabs%2F3d%2Froom-102');

    expect(mockRedirect).toHaveBeenCalledWith('/login?next=%2Flabs%2F3d%2Froom-102');
  });

  it('binds identity strictly from DB profile and ignores URL identity spoofing for authenticated users', async () => {
    mockAuthUser = { userId: '11111111-1111-4111-8111-111111111111' };
    mockRoomSlug.value = 'room-101';

    const jsx = await LabPage({
      params: Promise.resolve({ roomId: 'room-101' }),
      searchParams: Promise.resolve({
        student_code: 'FAKE-999',
        student_name: 'Hacked Name',
      } as any),
    });
    const html = renderToStaticMarkup(jsx);

    // Should display verified name from DB ('ผู้เรียนทดสอบ'), NOT 'Hacked Name'
    expect(html).toContain('ผู้เรียนทดสอบ');
    expect(html).not.toContain('Hacked Name');
  });
});
