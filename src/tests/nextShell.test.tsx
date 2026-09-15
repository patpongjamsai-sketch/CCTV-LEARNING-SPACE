import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('Next.js learning portal shell', () => {
  it('shows the CCTV course navigation and Room 101 entry point', async () => {
    const componentUrl = new URL('../components/portal/DashboardShell.tsx', import.meta.url).href;
    const { DashboardShell } = await import(/* @vite-ignore */ componentUrl);

    const html = renderToStaticMarkup(<DashboardShell />);

    expect(html).toContain('กล้องวงจรปิดบนระบบเครือข่าย');
    expect(html).toContain('เส้นทางการเรียนรู้');
    expect(html).toContain('ห้องปฏิบัติการ 3D');
    expect(html).toContain('href="/labs/3d/room-101"');
  });
});
