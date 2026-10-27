import { describe, it, expect } from 'vitest';
import {
  evaluateStudentSurvey,
  UBON_ZONES,
  ZONE_SUGGESTIONS,
} from '../components/labs/room101/SiteSurveySimulator';

describe('CCTV Site Survey Evaluation Engine (Ubon Tech Campus - 5 Strategic Camera Survey Points)', () => {
  it('contains exactly 5 strategic survey zones for CCTV camera deployment', () => {
    expect(UBON_ZONES).toHaveLength(5);
    const ids = UBON_ZONES.map((z) => z.id);
    expect(ids).toEqual(['gate', 'admin', 'parking_dome', 'com_tech', 'canteen']);
  });

  it('evaluates student input for Point 1 (หน้าป้อมยามติดถนนเข้าออกวิทยาลัย) correctly', () => {
    const result = evaluateStudentSurvey('gate', {
      environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะและริมถนนสาธารณะ',
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

  it('evaluates Point 2 (อาคารอำนวยการ) with administrative indoor specs', () => {
    const result = evaluateStudentSurvey('admin', {
      environmentType: 'ในร่ม (Indoor) โถงต้อนรับและทางเดินอาคารอำนวยการ สะอาดเรียบร้อย',
      lightingCond: 'แสงสว่างสม่ำเสมอจากหลอด LED ตลอดช่วงเวลาทำการ',
      recommendedCamera: 'Dome IP Camera 4MP ดีไซน์เรียบร้อยกลมกลืนกับสถาปัตยกรรม',
      lensSpec: 'เลนส์ 2.8mm (มุมมองกว้าง 100°+ เพื่อครอบคลุมทั้งแนวทางเดินโถง)',
      conduitType: 'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้าเพดาน หรือรางเก็บสายพลาสติก',
      pdpaAction: 'ตั้งค่า Privacy Masking (หน้ากากแถบดำ) ปิดบังโต๊ะลงทะเบียนเอกสารการเงินและประตูห้องน้ำ',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('evaluates Point 3 (โดมใหญ่จอดรถ) with covered canopy specs', () => {
    const result = evaluateStudentSurvey('parking_dome', {
      environmentType: 'กึ่งกลางแจ้งใต้หลังคาโดมจอดรถ (Semi-Outdoor) ลมพัดผ่าน ฝุ่นควันไอเสียรถยนต์',
      lightingCond: 'ใต้โดมมีเงาร่มครึ้ม แสงภายนอกสว่างจ้า และเวลากลางคืนมืดสลัว',
      recommendedCamera: 'Bullet IP Camera 4MP โครงสร้างโลหะกันน้ำ IP67 DarkFighter Smart IR 50m',
      lensSpec: 'เลนส์ 2.8mm - 4.0mm ครอบคลุมแถวจอดรถยนต์และจักรยานยนต์',
      conduitType: 'ท่อ uPVC ขาว/ท่อเหล็ก EMT ยึดโครงสร้างเหล็ก + กล่องพักสาย IP66 และ Surge SPD',
      pdpaAction: 'เพื่อดูแลความปลอดภัยในทรัพย์สินและยานพาหนะของครูและนักศึกษา กำหนดสิทธิ์ดูภาพเฉพาะ รปภ.',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('evaluates Point 4 (อาคารเรียนแผนกเทคโนโลยีคอมพิวเตอร์) with corridor IK10 specs', () => {
    const result = evaluateStudentSurvey('com_tech', {
      environmentType: 'ในอาคารเรียน (Indoor) ระเบียงทางเดินหน้าห้องปฏิบัติการคอมพิวเตอร์ ฝ้าเพดาน T-Bar',
      lightingCond: 'แสงไฟสว่างจากหลอด LED ตามทางเดินและแสงสะท้อนจากกระจกห้องแล็บ',
      recommendedCamera: 'Vandal-Proof Dome IP Camera 4MP ทนแรงกระแทก IK10',
      lensSpec: 'เลนส์ 2.8mm (มุมกว้าง 103°) ครอบคลุมแนวยาวระเบียงทางเดิน',
      conduitType: 'ท่อ uPVC ขาว ซ่อนเหนือฝ้า T-Bar พร้อมแผ่นไม้อัดรองรับน้ำหนัก',
      pdpaAction: 'คุ้มครองสิทธิส่วนบุคคลของนักศึกษาและอาจารย์ ไม่หันมุมกล้องมองเข้าห้องน้ำ',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('evaluates Point 5 (โรงอาหาร) with canteen grease-resistant specs', () => {
    const result = evaluateStudentSurvey('canteen', {
      environmentType: 'กึ่งกลางแจ้งโถงสูงโรงอาหาร (Semi-Outdoor) ละอองไอน้ำมัน ไอร้อน ควัน ฝุ่น ละอองอาหาร',
      lightingCond: 'แสงแดดธรรมชาติส่องผ่านช่องลมด้านข้างผสมกับแสงโคมไฟโรงอาหาร',
      recommendedCamera: 'Dome IP Camera 4MP โครงสร้างโลหะกันน้ำ/ไอน้ำมัน IP66/IP67 และกันกระแทก IK10',
      lensSpec: 'เลนส์ 2.8mm มุมกว้าง เพื่อครอบคลุมลานที่นั่งรับประทานอาหารและจุดร้านค้า',
      conduitType: 'ท่อร้อยสาย uPVC สีขาว ซีลข้อต่อกันความชื้นและไอไขมันแน่นหนา',
      pdpaAction: 'ติดป้ายเตือน CCTV in Operation และสิทธิ์การเข้าถึงภาพเพื่อความปลอดภัยในทรัพย์สินและสุขอนามัย',
      pdpaAgreed: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });

  it('has suggestions available for all strategic zones', () => {
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
