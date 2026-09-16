import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('server-only', () => ({}));

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

    const jsx = await LabPage({ params: Promise.resolve({ roomId: 'room-101' }) });
    const html = renderToStaticMarkup(jsx);

    expect(html).toContain('data-testid="lab-client-container"');
    expect(html).toContain('Room 101 · Smart Mart');
  });
});
