import { describe, it, expect } from 'vitest';
import {
  UBON_ZONES,
  INSTALLATION_STEPS,
  CCTV_5_COMPONENTS,
  COMMISSIONING_STEPS,
  FAULT_SCENARIOS,
  evaluateStudentSurvey,
} from '../components/labs/room101/SiteSurveySimulator';

describe('CCTV Site Survey JSON Export Payload Validation', () => {
  it('builds a valid JSON export payload matching the 4-tab workstation structure', () => {
    const studentName = 'สมชาย ใจมั่น';
    const studentCode = '66309010042';

    // Simulated 5-zone student survey answers
    const studentInputs: Record<string, any> = {
      gate: {
        environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะและริมถนนสาธารณะ',
        lightingCond: 'ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน',
        recommendedCamera: 'Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m)',
        lensSpec: 'เลนส์ 4.0mm หรือ 6.0mm (มุมมองแคบเพื่อจับป้ายทะเบียนและใบหน้า)',
        conduitType: 'ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland',
        pdpaAction: 'ติดตั้งป้ายเตือน CCTV in Operation และห้ามส่องข้ามรั้วชุมชน',
        pdpaAgreed: true,
      },
      admin: {
        environmentType: 'ในร่ม (Indoor) โถงต้อนรับและทางเดินอาคารอำนวยการ สะอาดเรียบร้อย',
        lightingCond: 'แสงสว่างสม่ำเสมอจากหลอด LED ตลอดช่วงเวลาทำการ',
        recommendedCamera: 'Dome IP Camera 4MP ดีไซน์เรียบร้อยกลมกลืนกับสถาปัตยกรรม',
        lensSpec: 'เลนส์ 2.8mm (มุมมองกว้าง 100°+ เพื่อครอบคลุมทั้งแนวทางเดินโถง)',
        conduitType: 'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้าเพดาน หรือรางเก็บสายพลาสติก',
        pdpaAction: 'ตั้งค่า Privacy Masking (หน้ากากแถบดำ) ปิดบังโต๊ะลงทะเบียนเอกสารการเงินและประตูห้องน้ำ',
        pdpaAgreed: true,
      },
    };

    const simulatedSubmissions: Record<string, any> = {};
    for (const [zoneId, input] of Object.entries(studentInputs)) {
      const evalRes = evaluateStudentSurvey(zoneId, input);
      simulatedSubmissions[zoneId] = {
        ...input,
        score: evalRes.score,
        grade: evalRes.grade,
        fieldScores: evalRes.fieldScores,
        feedback: evalRes.feedback,
        submittedAt: '12:30',
      };
    }

    const payload = {
      reportTitle: 'รายงานผลการสำรวจพื้นที่ จัดลำดับการติดตั้ง และส่งมอบระบบ CCTV (CCTV Site Survey & Installation Workstation)',
      courseCode: '21909-2020',
      courseName: 'การติดตั้งและบำรุงรักษาระบบโทรทัศน์วงจรปิด (CCTV System)',
      institution: 'วิทยาลัยเทคนิคอุบลราชธานี',
      exportedAt: new Date().toISOString(),
      student: {
        displayName: studentName,
        studentCode: studentCode,
      },
      summary: {
        totalSurveyZones: UBON_ZONES.length,
        submittedSurveyZones: Object.keys(simulatedSubmissions).length,
        workflowSequenceStatus: 'PASSED_100%',
        commissioningStatus: 'TESTED_AND_VERIFIED',
        faultSolvingScore: `4/${FAULT_SCENARIOS.length}`,
      },
      tab1_siteSurveyResults: UBON_ZONES.map((zone, idx) => {
        const input = studentInputs[zone.id] || {};
        const sub = simulatedSubmissions[zone.id];
        return {
          pointNumber: idx + 1,
          zoneId: zone.id,
          zoneNameTh: zone.nameTh,
          zoneNameEn: zone.nameEn,
          cableDistanceMeters: zone.distanceMeters,
          studentInput: input,
          evaluation: sub ?? null,
        };
      }),
      tab2_installationWorkflow: {
        isValidSequence: true,
        stepsOrder: INSTALLATION_STEPS.map((s, idx) => ({
          currentPosition: idx + 1,
          expectedOrder: s.orderNumber,
          stepId: s.id,
          titleTh: s.titleTh,
          category: s.category,
        })),
      },
      tab3_componentsArchitecture: {
        mode: 'ip',
        coreComponentsCovered: CCTV_5_COMPONENTS.map((c) => ({
          id: c.id,
          nameTh: c.nameTh,
          category: c.category,
        })),
      },
      tab4_commissioningAndFaultSolving: {
        commissioningChecks: COMMISSIONING_STEPS.map((cs) => ({
          step: cs.step,
          title: cs.title,
          status: 'pass',
        })),
        faultScenarios: FAULT_SCENARIOS.map((sc, idx) => ({
          caseNumber: idx + 1,
          scenarioId: sc.id,
          title: sc.title,
          studentAnswerIndex: 1,
          isCorrect: true,
        })),
        totalSolvedCorrectly: 4,
      },
    };

    expect(payload.student.displayName).toBe('สมชาย ใจมั่น');
    expect(payload.student.studentCode).toBe('66309010042');
    expect(payload.tab1_siteSurveyResults).toHaveLength(5);
    expect(payload.tab1_siteSurveyResults[0]?.zoneId).toBe('gate');
    expect(payload.tab1_siteSurveyResults[1]?.zoneId).toBe('admin');
    expect(payload.tab1_siteSurveyResults[2]?.zoneId).toBe('parking_dome');
    expect(payload.tab1_siteSurveyResults[3]?.zoneId).toBe('com_tech');
    expect(payload.tab1_siteSurveyResults[4]?.zoneId).toBe('canteen');
    expect(payload.tab2_installationWorkflow.stepsOrder).toHaveLength(6);
    expect(payload.tab3_componentsArchitecture.coreComponentsCovered).toHaveLength(5);
    expect(payload.tab4_commissioningAndFaultSolving.faultScenarios).toHaveLength(4);

    const jsonString = JSON.stringify(payload);
    expect(jsonString).toContain('21909-2020');
    expect(jsonString).toContain('วิทยาลัยเทคนิคอุบลราชธานี');
  });
});
