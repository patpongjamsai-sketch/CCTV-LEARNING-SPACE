import { describe, it, expect } from 'vitest';
import {
  evaluateStudentSurvey,
  UBON_ZONES,
  ZONE_SUGGESTIONS,
} from '../components/labs/room101/SiteSurveySimulator';

describe('CCTV Site Survey Evaluation Engine (Ubon Tech Campus)', () => {
  it('contains exactly 5 strategic zones for Ubon Ratchathani Technical College', () => {
    expect(UBON_ZONES).toHaveLength(5);
    const ids = UBON_ZONES.map((z) => z.id);
    expect(ids).toEqual(['gate', 'flagpole', 'workshop', 'academic', 'server']);
  });

  it('evaluates student input for Zone 1 (ซุ้มประตูทางเข้า) with the user-specified example correctly', () => {
    // User example: สภาพพื้นที่: กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะ
    const result = evaluateStudentSurvey('gate', {
      environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะ',
      lightingCond: 'ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน',
      recommendedCamera: 'Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m)',
      lensSpec: 'เลนส์ 4.0mm หรือ 6.0mm (มุมมองแคบเพื่อจับป้ายทะเบียนและใบหน้า)',
      conduitType: 'ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland',
      pdpaAction: 'ติดตั้งป้ายเตือน CCTV in Operation และห้ามส่องข้ามรั้วชุมชน',
      pdpaAgreed: true,
    });

    expect(result.fieldScores.environment).toBe(20);
    expect(result.fieldScores.lighting).toBe(15);
    expect(result.fieldScores.camera).toBe(25);
    expect(result.fieldScores.lens).toBe(15);
    expect(result.fieldScores.conduit).toBe(15);
    expect(result.fieldScores.pdpa).toBe(10);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
  });

  it('gives constructive feedback when essential technical factors are omitted', () => {
    const poorResult = evaluateStudentSurvey('gate', {
      environmentType: 'ห้องธรรมดา',
      lightingCond: 'มืดๆ',
      recommendedCamera: 'กล้องอะไรก็ได้',
      lensSpec: 'เลนส์ธรรมดา',
      conduitType: 'เดินสายตามพื้น',
      pdpaAction: 'ไม่สนใจ',
      pdpaAgreed: false,
    });

    expect(poorResult.score).toBeLessThan(70);
    expect(poorResult.feedback.length).toBeGreaterThan(0);
    expect(poorResult.grade).not.toBe('A');
  });

  it('evaluates Zone 2 (ลานเสาธง & ลานกิจกรรมกลางแจ้ง) with full outdoor specs', () => {
    const result = evaluateStudentSurvey('flagpole', {
      environmentType: 'กลางแจ้งสมบูรณ์ (Full Outdoor) / แดด ฝน ลมแรง',
      lightingCond: 'แดดจัดช่วงเที่ยง มืดสนิทช่วงกลางคืน',
      recommendedCamera: 'Speed Dome PTZ หรือ Bullet IP67',
      lensSpec: 'เลนส์ 2.8mm มุมกว้าง 103 องศา หรือซูม 25x Optical',
      conduitType: 'ท่อ uPVC กันแดด UV พร้อมสายดินและ Surge SPD',
      pdpaAction: 'พื้นที่สาธารณะของวิทยาลัย กำหนดสิทธิ์ให้เฉพาะ รปภ. และผู้บริหาร',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('evaluates Zone 3 (โรงฝึกงานช่างอุตสาหกรรม) with Vandal IK10 & EMT specs', () => {
    const result = evaluateStudentSurvey('workshop', {
      environmentType: 'ในอาคารโรงช่าง มีฝุ่น ประกายไฟเชื่อม และเครื่องจักรสั่นสะเทือน',
      lightingCond: 'แสงไฟโคม High-bay และแสงวาบจากการเชื่อมอาร์กไฟฟ้า',
      recommendedCamera: 'กล้อง Vandal-Proof โลหะมาตรฐาน IK10 IP67',
      lensSpec: 'เลนส์ 4.0mm หรือ 2.8mm แนวยาวแถวเครื่องจักร',
      conduitType: 'ท่อเหล็ก EMT ป้องกันการกระแทกเชิงกล',
      pdpaAction: 'เพื่อความปลอดภัย ป้องกันอุบัติเหตุ ไม่ส่องห้องแต่งตัวส่วนบุคคล',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('has suggestions available for all 5 zones', () => {
    for (const zone of UBON_ZONES) {
      const suggestions = ZONE_SUGGESTIONS[zone.id];
      expect(suggestions).toBeDefined();
      expect(suggestions?.environment.length).toBeGreaterThan(0);
      expect(suggestions?.lighting.length).toBeGreaterThan(0);
      expect(suggestions?.camera.length).toBeGreaterThan(0);
      expect(suggestions?.lens.length).toBeGreaterThan(0);
      expect(suggestions?.conduit.length).toBeGreaterThan(0);
      expect(suggestions?.pdpa.length).toBeGreaterThan(0);
    }
  });
});
