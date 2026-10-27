import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaultChallengeModal } from '../components/portal/FaultChallengeModal';
import { ComponentSpecExplorer } from '../components/labs/cctv-components/ComponentSpecExplorer';

describe('Subjective Assessment & CCTV Components JSON Export Contracts', () => {
  it('renders FaultChallengeModal for Unit 1 with direct diagnostic prompt fields and student info inputs', () => {
    const html = renderToStaticMarkup(
      <FaultChallengeModal
        unitId="U01"
        unitTitle="หน่วยที่ 1"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Check student credentials inputs
    expect(html).toContain('ชื่อ-นามสกุล นักเรียน/นักศึกษา:');
    expect(html).toContain('รหัสนักศึกษา (Student Code):');

    // Check diagnostic prompt assessment badge
    expect(html).toContain('DIAGNOSTIC PROMPT ASSESSMENT');

    // Check direct prompt question fields for Unit 1 Question 1
    expect(html).toContain('ประเด็นที่ 1: การเปรียบเทียบข้อดี-ข้อจำกัด 3 เทคโนโลยี');
    expect(html).toContain('ประเด็นที่ 2: ข้อสรุปเชิงวิศวกรรมและเหตุผลการเลือกใช้ IP Camera ร่วมกับ NVR');

    // Check topic completeness message requirement
    expect(html).toContain('ความสมบูรณ์ของคำตอบ');
    expect(html).toContain('ต้องตอบคำถามให้ครบทุกหัวข้อย่อย จึงจะสามารถ Download JSON ออกมาได้');

    // Check disabled state text when incomplete
    expect(html).toContain('ตอบคำถามให้ครบก่อน');
    expect(html).toContain('disabled=""');
  });

  it('renders FaultChallengeModal for Unit 2 with camera selection and DORI direct prompt fields', () => {
    const html = renderToStaticMarkup(
      <FaultChallengeModal
        unitId="U02"
        unitTitle="หน่วยที่ 2"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Check direct prompt question fields for Unit 2 Question 1
    expect(html).toContain('ประเด็นที่ 1: การเปรียบเทียบข้อดี-ข้อจำกัดและการเลือกชนิดกล้อง (Dome, Bullet, PTZ)');
    expect(html).toContain('ประเด็นที่ 2: การเลือกขนาดเลนส์ มุมมองภาพ (FOV) และการคำนวณตามเกณฑ์มาตรฐาน DORI');

    // Check topic completeness message requirement
    expect(html).toContain('ความสมบูรณ์ของคำตอบ');
    expect(html).toContain('ตอบคำถามให้ครบก่อน');
  });

  it('renders FaultChallengeModal for legacy 6-step units with all 6 step indicators', () => {
    const html = renderToStaticMarkup(
      <FaultChallengeModal
        unitId="U03"
        unitTitle="หน่วยที่ 3"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Check all 6 steps are represented in the guide
    expect(html).toContain('1. Problem');
    expect(html).toContain('2. Cause');
    expect(html).toContain('3. Test');
    expect(html).toContain('4. Result');
    expect(html).toContain('5. Solution');
    expect(html).toContain('6. Retest');
  });

  it('renders ComponentSpecExplorer with X-Ray Anatomy research form and JSON export button', () => {
    const html = renderToStaticMarkup(<ComponentSpecExplorer />);

    // Check X-Ray Anatomy Tab
    expect(html).toContain('ผ่าชิ้นส่วนภายใน (X-Ray Anatomy)');

    // Check Export JSON button is present and remote online submission button is removed
    expect(html).toContain('ส่งออกไฟล์ JSON (Download JSON)');
    expect(html).not.toContain('ส่งงานเข้าสู่ระบบ');
  });
});
