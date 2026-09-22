import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import TeacherPage from '../app/teacher/page';
import { TeacherApprovalDashboard } from '../components/portal/TeacherApprovalDashboard';
import { DEFAULT_TEACHER_APPROVALS } from '../lib/progressionState';

describe('Teacher Approval Dashboard SSR & Hydration contract', () => {
  it('exports canonical DEFAULT_TEACHER_APPROVALS with safe initial defaults', () => {
    expect(DEFAULT_TEACHER_APPROVALS.unlockedUnits.U01).toBe(true);
    expect(DEFAULT_TEACHER_APPROVALS.unlockedUnits.U02).toBe(false);
    expect(DEFAULT_TEACHER_APPROVALS.unlockedLabs.U01).toBe(false);
    expect(DEFAULT_TEACHER_APPROVALS.unlockedAssessments.U01).toBe(false);
  });

  it('renders TeacherPage static markup safely without hydration divergence', async () => {
    const page = await TeacherPage();
    const html = renderToStaticMarkup(page);

    expect(html).toContain('แดชบอร์ดครูผู้สอน');
    expect(html).toContain('TEACHER COMMAND CENTER');
    expect(html).toContain('CLASS-2569-CCTV-01');

    // Canonical SSR defaults for initial view
    expect(html).toContain('🔒 อนุมัติสิทธิ์ห้องแล็บ');
    expect(html).toContain('🔓 หน่วย: เปิด');
    expect(html).toContain('🔒 หน่วย: ล็อก');
  });

  it('renders TeacherApprovalDashboard component directly with SSR-safe initial state', () => {
    const html = renderToStaticMarkup(<TeacherApprovalDashboard classId="TEST-CLASS-01" />);

    expect(html).toContain('TEST-CLASS-01');
    expect(html).toContain('ศูนย์อนุมัติสิทธิ์และจัดการการเรียนรู้');
    expect(html).toContain('🔒 อนุมัติสิทธิ์ห้องแล็บ');
  });
});
