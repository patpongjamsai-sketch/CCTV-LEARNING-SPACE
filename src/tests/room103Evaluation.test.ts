import { describe, expect, it } from 'vitest';
import { evaluateUnit3Submission } from '../server/game/evaluateUnit3Submission';
import { evaluateRoomSubmission } from '../server/game/evaluateRoomSubmission';
import { T568B_COLOR_SEQUENCE } from '../shared/domain/room103Types';

const perfectRoom103Payload = {
  roomId: 'room-103',
  unitNumber: 3,
  theme: 'CCTV Cabling, Termination & RJ45 Workshop',
  station1: {
    wireSequence: [...T568B_COLOR_SEQUENCE],
    strippingLengthMm: 14,
    jacketUnderStrainRelief: true,
    rj45Crimped: true,
    coaxialStrippedProperly: true,
    bncType: 'COMPRESSION',
    centerPinShortShieldCheck: false, // NO short
    bncCrimped: true,
    cableId: 'CAM-01-UTP',
    sourceLabel: 'Rack-01 / Patch Panel Port 08',
    destLabel: 'Outdoor Gate Bullet Cam 01',
    labelMatches: true,
    safetyChecklist: {
      cutSafetyGloves: true,
      eyeProtection: true,
      cleanWorkArea: true,
    },
  },
  station2: {
    selectedOptions: {
      ZONE_OVER_AIR: 'UTP_OUTDOOR_MESSENGER',
      ZONE_MOTOR_EMI: 'STP_FTP_SHIELDED',
      ZONE_LONG_450M: 'FIBER_SINGLEMODE',
      ZONE_RAIN_EXPOSED: 'JUNCTION_BOX_IP66_GLAND',
      ZONE_ANALOG_200M: 'COAX_RG6_SOLID_COPPER',
    },
    routeSafety: {
      avoidHeatSource: true,
      respectBendRadius: true,
      separateHighVoltagePower: true,
    },
    waterproofing: {
      junctionBoxMounted: true,
      cableGlandTightened: true,
      downwardDripLoop: true,
    },
    labelingAndSafety: {
      sourceDestLabelsApplied: true,
      cableTiesOrganized: true,
      ppeSafetyChecklistPassed: true,
    },
  },
  station3: {
    case1Testing: {
      selectedUtpTool: 'CABLE_TESTER',
      selectedCoaxTool: 'MULTIMETER_CONTINUITY',
      identifiedFaultType: 'CROSSED_AND_OPEN',
      faultExplanation: 'ตรวจพบพิน 3 และ 6 สลับคู่ และพิน 7-8 ขาดวงจร',
      retestPassed: true,
    },
    case2PoEBudget: {
      switchPoEBudgetWatts: 65,
      cameraWattage: 8,
      accessoriesWattage: 5,
      safetyMarginPercent: 20,
      cameraCount: 4,
      calculatedWattsPerCamera: 15.6,
      calculatedTotalSystemWatts: 62.4,
      isBudgetSufficient: true,
    },
    case3CcaEmi: {
      ccaResistanceAnswer: 'สาย CCA มีความต้านทานไฟฟ้าสูง ทำให้เกิด PoE voltage drop แรงดันตกปลายทางเหลือ 36V กล้องจึงดับ',
      emiNoiseAnswer: 'มอเตอร์เหนี่ยวนำสัญญาณรบกวน EMI/RFI ความถี่สูงเข้าสู่สายสัญญาณ UTP',
      groundingSolutionAnswer: 'เปลี่ยนเป็นสาย STP/FTP ทองแดงแท้ bare copper แยกท่อร้อยสาย ต่อ drain wire ลงกราวด์ตู้ rack และทำ retest',
    },
  },
};

describe('Room 103: Server-Authoritative 3-Station Evaluation', () => {
  it('evaluates a perfect 3-station submission with 100/100 score and passing status', () => {
    const evaluation = evaluateUnit3Submission(perfectRoom103Payload);

    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(true);
    expect(evaluation.mandatoryChecks.nvrReachable).toBe(true);
    expect(evaluation.mandatoryChecks.clientLiveViewActive).toBe(true);
    expect(evaluation.resultDetails.station1Score).toBe(35);
    expect(evaluation.resultDetails.station2Score).toBe(35);
    expect(evaluation.resultDetails.station3Score).toBe(30);
  });

  it('detects short circuit in BNC Coaxial termination and marks mandatory check failed', () => {
    const shortPayload = {
      ...perfectRoom103Payload,
      station1: {
        ...perfectRoom103Payload.station1,
        centerPinShortShieldCheck: true, // ERROR: Core shorts with Shield!
      },
    };

    const evaluation = evaluateUnit3Submission(shortPayload);

    expect(evaluation.totalScore).toBeLessThan(100);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(false); // Critical failure!
    expect(evaluation.isPassed).toBe(false);
  });

  it('detects wrong pinout in T568B and deducts points accordingly', () => {
    const wrongPinsPayload = {
      ...perfectRoom103Payload,
      station1: {
        ...perfectRoom103Payload.station1,
        wireSequence: ['Orange', 'White-Orange', 'Blue', 'Green', 'White-Green', 'White-Blue', 'Brown', 'White-Brown'],
      },
    };

    const evaluation = evaluateUnit3Submission(wrongPinsPayload);

    expect(evaluation.resultDetails.t568bCorrectPins).toBe(0);
    expect(evaluation.resultDetails.station1Score).toBeLessThan(35);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(false);
  });

  it('re-evaluates server-side and ignores client-tampered score', () => {
    const tamperedPayload = {
      ...perfectRoom103Payload,
      finalScore: 100,
      passed: true,
      station2: {
        selectedOptions: {}, // No zones completed
        routeSafety: { avoidHeatSource: false, respectBendRadius: false, separateHighVoltagePower: false },
        waterproofing: { junctionBoxMounted: false, cableGlandTightened: false, downwardDripLoop: false },
        labelingAndSafety: { sourceDestLabelsApplied: false, cableTiesOrganized: false, ppeSafetyChecklistPassed: false },
      },
    };

    const evaluation = evaluateUnit3Submission(tamperedPayload);

    // Score must be recalculated from raw data, not trusted from client
    expect(evaluation.totalScore).toBeLessThan(70);
    expect(evaluation.isPassed).toBe(false);
  });

  it('routes through evaluateRoomSubmission("room-103") accurately', () => {
    const evaluation = evaluateRoomSubmission('room-103', perfectRoom103Payload);

    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
  });

  it('maintains backwards compatibility with legacy workstation schema', () => {
    const legacyPayload = {
      wireSequence: [
        'White-Orange',
        'Orange',
        'White-Green',
        'Blue',
        'White-Blue',
        'Green',
        'White-Brown',
        'Brown',
      ],
      crimped: true,
      waterproofGlandMounted: true,
      continuityTested: true,
      ledStatus: [true, true, true, true, true, true, true, true],
      isPass: true,
      totalHintsUsed: 0,
    };

    const evaluation = evaluateUnit3Submission(legacyPayload);

    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(true);
  });
});
