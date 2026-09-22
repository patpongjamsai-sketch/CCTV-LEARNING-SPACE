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

  it('routes the first learning module to the canonical course before the LAB', async () => {
    const componentUrl = new URL('../components/portal/DashboardShell.tsx', import.meta.url).href;
    const { DashboardShell } = await import(/* @vite-ignore */ componentUrl);

    const html = renderToStaticMarkup(<DashboardShell />);

    expect(html).toMatch(/class="portal-module-card" data-unit-id="01" href="\/courses\/21909-2020"/);
  });

  it('renders the authenticated learner and backend-approved progress', async () => {
    const componentUrl = new URL('../components/portal/DashboardShell.tsx', import.meta.url).href;
    const { DashboardShell } = await import(/* @vite-ignore */ componentUrl);

    const html = renderToStaticMarkup(
      <DashboardShell
        learner={{ displayName: 'สมชาย ใจดี', role: 'student' }}
        summary={{ completedUnits: 2, totalUnits: 8, passedMissions: 3, bestScore: 88 }}
        units={[
          {
            id: 'unit-1',
            sequenceNo: 1,
            title: 'พื้นฐานระบบกล้อง IP',
            statusLabel: 'ผ่านแล้ว',
            href: '/labs/3d/room-101',
            unlocked: true,
          },
          {
            id: 'unit-2',
            sequenceNo: 2,
            title: 'การเลือกตำแหน่งกล้อง',
            statusLabel: 'รอเปิด',
            href: '/courses/21909-2020',
            unlocked: false,
          },
        ]}
      />,
    );

    expect(html).toContain('สมชาย ใจดี');
    expect(html).toContain('2 / 8');
    expect(html).toContain('3 / 5');
    expect(html).toContain('88 / 100');
    expect(html).toContain('พื้นฐานระบบกล้อง IP');
    expect(html).not.toContain('href="/labs/3d/room-102"');
  });

  it('renders the Teacher & Admin Management panel when user is a teacher', async () => {
    const componentUrl = new URL('../components/portal/DashboardShell.tsx', import.meta.url).href;
    const { DashboardShell } = await import(/* @vite-ignore */ componentUrl);

    const html = renderToStaticMarkup(
      <DashboardShell
        learner={{ displayName: 'อาจารย์สมศักดิ์', role: 'teacher' }}
        classId="class-101"
      />,
    );

    expect(html).toContain('อาจารย์สมศักดิ์');
    expect(html).toContain('Teacher &amp; Admin Center');
    expect(html).toContain('นำเข้านักเรียน (CSV)');
    expect(html).toContain('ปรับปรุงผลการเรียน (Override)');
    expect(html).toContain('ตรวจสอบ LAB');
    expect(html).toContain('href="/teacher"');
  });

  it('hides the /teacher navigation item from student learners', async () => {
    const componentUrl = new URL('../components/portal/DashboardShell.tsx', import.meta.url).href;
    const { DashboardShell } = await import(/* @vite-ignore */ componentUrl);

    const html = renderToStaticMarkup(
      <DashboardShell
        learner={{ displayName: 'สมหญิง นักเรียน', role: 'student' }}
      />,
    );

    expect(html).toContain('สมหญิง นักเรียน');
    expect(html).not.toContain('href="/teacher"');
    expect(html).not.toContain('อนุมัติสิทธิ์ (Teacher)');
  });
});
