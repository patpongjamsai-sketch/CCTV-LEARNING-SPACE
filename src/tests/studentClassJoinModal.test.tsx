import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StudentClassJoinModal } from '../components/portal/StudentClassJoinModal';

describe('StudentClassJoinModal component', () => {
  it('renders with scrollable layout classes and all 3 PV class groups', () => {
    const html = renderToStaticMarkup(
      <StudentClassJoinModal
        currentDisplayName="ผู้เรียนทดสอบ"
        currentStudentCode="TEST001"
      />,
    );

    // Header & Titles
    expect(html).toContain('ลงทะเบียนเข้าห้องเรียน ปวช.1');
    expect(html).toContain('วิชากล้องวงจรปิดบนระบบเครือข่าย');

    // Scrollable container classes
    expect(html).toContain('max-h-[92vh]');
    expect(html).toContain('overflow-y-auto');

    // 3 Groups
    expect(html).toContain('PV1');
    expect(html).toContain('PV2');
    expect(html).toContain('PV3');

    // Form inputs and submit button
    expect(html).toContain('student-code-input');
    expect(html).toContain('student-name-input');
    expect(html).toContain('TEST001');
    expect(html).toContain('ผู้เรียนทดสอบ');
    expect(html).toContain('ยืนยันการเข้าห้องเรียนกลุ่ม PV1');
  });

  it('renders clean blank fields when user is brand new or default learner', () => {
    const html = renderToStaticMarkup(
      <StudentClassJoinModal
        currentDisplayName="ผู้เรียน"
        currentStudentCode=""
      />,
    );

    expect(html).toContain('id="student-code-input"');
    expect(html).toContain('id="student-name-input"');
    // Default placeholder is shown and value is empty string
    expect(html).toContain('placeholder="ตัวอย่าง 69219090001 หรือ TEST001"');
  });
});
