import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('../lib/auth/currentProfile', () => ({
  getCurrentProfile: vi.fn(async () => ({
    status: 'authenticated',
    profile: {
      id: 'teacher-1',
      role: 'teacher',
      display_name: 'ครูผู้สอน',
      student_code: null,
    },
  })),
}));

import TeacherPage from '../app/teacher/page';
import { TeacherApprovalDashboard } from '../components/portal/TeacherApprovalDashboard';
import { StudentAttemptHistoryModal } from '../components/portal/StudentAttemptHistoryModal';
import { PendingReviewInbox } from '../components/portal/PendingReviewInbox';
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

  it('renders StudentAttemptHistoryModal safely when open with student profile', () => {
    const html = renderToStaticMarkup(
      <StudentAttemptHistoryModal
        isOpen={true}
        onClose={() => {}}
        classId="22222222-2222-4222-8222-222222222222"
        studentId="11111111-1111-4111-8111-111111111111"
        studentName="สมชาย สายช่าง"
        studentCode="69219090001"
      />
    );

    expect(html).toContain('ประวัติภารกิจจำลอง 3D');
    expect(html).toContain('สมชาย สายช่าง');
    expect(html).toContain('69219090001');
    expect(html).toContain('ยังไม่มีประวัติการส่งภารกิจ 3D');
  });

  it('renders PendingReviewInbox safely with initial tabs and counters', () => {
    const html = renderToStaticMarkup(
      <PendingReviewInbox
        classId="22222222-2222-4222-8222-222222222222"
        onReviewCompleted={() => {}}
      />
    );

    expect(html).toContain('ศูนย์ตรวจและอนุมัติงานค้าง (Pending Work Queue)');
    expect(html).toContain('ทั้งหมด (0)');
    expect(html).toContain('แล็บ 3D (0)');
    expect(html).toContain('ข้อสอบอัตนัย (0)');
    expect(html).toContain('ไม่มีงานค้างรอตรวจในขณะนี้');
  });

  it('generates Thai-compatible CSV with UTF-8 BOM prefix', () => {
    const headers = ['ลำดับ', 'รหัสผู้เรียน', 'ชื่อ - สกุล', 'กลุ่ม', 'ผลการอนุมัติหน่วย'];
    const row = ['1', '"69219090001"', '"นายทดสอบ ระบบดี"', '"กลุ่ม 1"', 'ผ่าน'];
    const csvContent = '\uFEFF' + [headers.join(','), row.join(',')].join('\r\n');

    expect(csvContent.charCodeAt(0)).toBe(0xFEFF);
    expect(csvContent).toContain('นายทดสอบ ระบบดี');
    expect(csvContent).toContain('ผลการอนุมัติหน่วย');
  });
});
