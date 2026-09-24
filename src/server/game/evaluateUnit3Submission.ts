import {
  unit3SubmissionSchema,
  T568B_STANDARD,
  type CommonUnitEvaluation,
} from '../../shared/domain/workstationTypes';
import {
  T568B_COLOR_SEQUENCE,
  ROOM103_CASE3_REQUIRED_TERMS,
} from '../../shared/domain/room103Types';

const CASE3_REQUIRED_TERMS = ROOM103_CASE3_REQUIRED_TERMS;

export function evaluateUnit3Submission(rawInput: unknown): CommonUnitEvaluation {
  const anyInput = (rawInput || {}) as Record<string, any>;
  const payload = anyInput.smartCabling || anyInput;

  // Check if 3-Station payload for Room 103
  if (payload.station1 || payload.station2 || payload.station3) {
    let s1Score = 0;
    let s2Score = 0;
    let s3Score = 0;

    // -------------------------------------------------------------
    // STATION 1: Termination (UTP/RJ45 & Coaxial/BNC) - 35 pts max
    // -------------------------------------------------------------
    const st1 = payload.station1 || {};
    let t568bCorrectPins = 0;
    const wireSeqA = Array.isArray(st1.sideAWireSequence)
      ? st1.sideAWireSequence
      : Array.isArray(st1.wireSequence)
      ? st1.wireSequence
      : [];
    const wireSeqB = Array.isArray(st1.sideBWireSequence) ? st1.sideBWireSequence : wireSeqA;

    let correctA = 0;
    let correctB = 0;
    for (let i = 0; i < 8; i++) {
      if (wireSeqA[i] === T568B_COLOR_SEQUENCE[i] || wireSeqA[i] === T568B_STANDARD[i]) {
        correctA++;
      }
      if (wireSeqB[i] === T568B_COLOR_SEQUENCE[i] || wireSeqB[i] === T568B_STANDARD[i]) {
        correctB++;
      }
    }
    t568bCorrectPins = Math.round((correctA + correctB) / 2);

    // T568B RJ45 (12 pts)
    const t568bPoints = Math.round((t568bCorrectPins / 8) * 12);
    s1Score += t568bPoints;

    // Coaxial BNC (10 pts)
    if (st1.coaxialStrippedProperly) s1Score += 3;
    if (st1.bncType === 'COMPRESSION') s1Score += 4;
    if (st1.centerPinShortShieldCheck === false) s1Score += 3; // No short is correct!

    // Labeling (6 pts)
    if (st1.labelMatches && st1.cableId) s1Score += 6;

    // Safety & Tools (7 pts)
    const safe = st1.safetyChecklist || {};
    let safeCount = 0;
    if (safe.cutSafetyGloves) safeCount++;
    if (safe.eyeProtection) safeCount++;
    if (safe.cleanWorkArea) safeCount++;
    s1Score += Math.round((safeCount / 3) * 7);

    // -------------------------------------------------------------
    // STATION 2: Cable Selection & Environmental - 35 pts max
    // -------------------------------------------------------------
    const st2 = payload.station2 || {};
    const opts = st2.selectedOptions || {};
    let zonePoints = 0;
    if (opts.ZONE_OVER_AIR === 'UTP_OUTDOOR_MESSENGER') zonePoints += 3;
    if (opts.ZONE_MOTOR_EMI === 'STP_FTP_SHIELDED') zonePoints += 3;
    if (opts.ZONE_LONG_450M === 'FIBER_SINGLEMODE') zonePoints += 3;
    if (opts.ZONE_RAIN_EXPOSED === 'JUNCTION_BOX_IP66_GLAND') zonePoints += 3;
    if (opts.ZONE_ANALOG_200M === 'COAX_RG6_SOLID_COPPER') zonePoints += 3;
    s2Score += zonePoints; // 15 pts

    // Route Safety (8 pts)
    const route = st2.routeSafety || {};
    if (route.avoidHeatSource) s2Score += 3;
    if (route.respectBendRadius) s2Score += 3;
    if (route.separateHighVoltagePower) s2Score += 2;

    // Waterproofing (7 pts)
    const water = st2.waterproofing || {};
    if (water.junctionBoxMounted) s2Score += 3;
    if (water.cableGlandTightened) s2Score += 2;
    if (water.downwardDripLoop) s2Score += 2;

    // Labeling & Safety (5 pts)
    const labSafe = st2.labelingAndSafety || {};
    if (labSafe.sourceDestLabelsApplied) s2Score += 2;
    if (labSafe.cableTiesOrganized) s2Score += 2;
    if (labSafe.ppeSafetyChecklistPassed) s2Score += 1;

    // -------------------------------------------------------------
    // STATION 3: Diagnostics, PoE Budget & Root Cause - 30 pts max
    // -------------------------------------------------------------
    const st3 = payload.station3 || {};

    // Case 1: Testing & Wiremap (10 pts)
    const c1 = st3.case1Testing || {};
    if (c1.selectedUtpTool === 'CABLE_TESTER') s3Score += 3;
    if (c1.selectedCoaxTool === 'MULTIMETER_CONTINUITY') s3Score += 3;
    if (c1.identifiedFaultType === 'CROSSED_AND_OPEN') s3Score += 2;
    if (c1.retestPassed) s3Score += 2;

    // Case 2: PoE Power Budget (10 pts)
    const c2 = st3.case2PoEBudget || {};
    if (c2.switchPoEBudgetWatts >= 60) s3Score += 2;
    const calcPerCam = ((c2.cameraWattage || 8) + (c2.accessoriesWattage || 5)) * (1 + (c2.safetyMarginPercent || 20) / 100);
    if (Math.abs(calcPerCam - (c2.calculatedWattsPerCamera || 0)) < 0.2 || Math.abs(calcPerCam - 15.6) < 0.2) {
      s3Score += 3;
    }
    const calcTotal = calcPerCam * (c2.cameraCount || 4);
    if (Math.abs(calcTotal - (c2.calculatedTotalSystemWatts || 0)) < 0.5 || Math.abs(calcTotal - 62.4) < 0.5) {
      s3Score += 3;
    }
    if (c2.isBudgetSufficient) s3Score += 2;

    // Case 3: CCA & EMI Written (10 pts)
    const c3 = st3.case3CcaEmi || {};
    const textAll = `${c3.ccaResistanceAnswer || ''} ${c3.emiNoiseAnswer || ''} ${c3.groundingSolutionAnswer || ''}`.toLowerCase();
    let keywordsMatched = 0;
    for (const termList of CASE3_REQUIRED_TERMS) {
      if (termList.some((t) => textAll.includes(t.toLowerCase()))) {
        keywordsMatched++;
      }
    }
    const keywordPoints = Math.min(8, Math.round((keywordsMatched / 6) * 8));
    const lengthValid =
      (c3.ccaResistanceAnswer || '').length >= 25 &&
      (c3.emiNoiseAnswer || '').length >= 25 &&
      (c3.groundingSolutionAnswer || '').length >= 35;
    s3Score += keywordPoints + (lengthValid ? 2 : 0);

    const totalCalculatedScore = Math.min(100, Math.round(s1Score + s2Score + s3Score));

    // Mandatory Checks
    const cameraOnline = t568bCorrectPins === 8 && st1.centerPinShortShieldCheck === false;
    const nvrReachable = zonePoints >= 9 && Boolean(c1.retestPassed);
    const clientLiveViewActive = totalCalculatedScore >= 70;
    const isPassed = totalCalculatedScore >= 70 && cameraOnline && nvrReachable;

    return {
      totalScore: totalCalculatedScore,
      isPassed,
      missionScores: {
        M1_TERMINATION_PINOUT: s1Score,
        M2_CABLE_SELECTION_ROUTE: s2Score,
        M3_DIAGNOSTICS_POE_BUDGET: s3Score,
        M4_CONTINUITY_TEST: c1.retestPassed ? 10 : 5,
        M5_SAFETY_WATERPROOFING: safeCount >= 2 && water.junctionBoxMounted ? 10 : 5,
      },
      mandatoryChecks: {
        cameraOnline,
        nvrReachable,
        clientLiveViewActive,
      },
      resultDetails: {
        theme: 'CCTV Cabling, Termination & RJ45 Workshop',
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        t568bCorrectPins,
        coaxialCheck: st1.centerPinShortShieldCheck === false ? 'PASS_NO_SHORT' : 'FAIL_SHORT',
        zonesCorrect: zonePoints / 3,
        poeBudgetPassed: c2.isBudgetSufficient,
        keywordsMatched,
      },
    };
  }

  // -------------------------------------------------------------
  // Legacy Workstation Submission Schema (Backwards Compatible)
  // -------------------------------------------------------------
  const parsed = unit3SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_T568B_SEQUENCE: 0,
    M2_RJ45_CRIMPING: 0,
    M3_WATERPROOF_GLAND: 0,
    M4_CONTINUITY_TEST: 0,
    M5_PINOUT_ACCURACY: 0,
  };

  // M1 & M5: T568B Sequence check
  let correctPins = 0;
  for (let i = 0; i < 8; i++) {
    if (parsed.wireSequence[i] === T568B_STANDARD[i]) {
      correctPins++;
    }
  }

  const sequenceRatio = correctPins / 8;
  const sequencePoints = Math.round(sequenceRatio * 20);
  missionScores.M1_T568B_SEQUENCE = sequencePoints;
  score += sequencePoints;

  missionScores.M5_PINOUT_ACCURACY = correctPins === 8 ? 20 : Math.round(sequenceRatio * 15);
  score += missionScores.M5_PINOUT_ACCURACY;

  // M2: RJ45 Crimper
  if (parsed.crimped) {
    missionScores.M2_RJ45_CRIMPING = 20;
    score += 20;
  }

  // M3: Waterproof Gland assembly
  if (parsed.waterproofGlandMounted) {
    missionScores.M3_WATERPROOF_GLAND = 20;
    score += 20;
  }

  // M4: Cable Continuity Tester (all 8 LEDs pass)
  const ledsAllPass = parsed.ledStatus.every((s) => s === true);
  if (parsed.continuityTested && ledsAllPass && correctPins === 8) {
    missionScores.M4_CONTINUITY_TEST = 20;
    score += 20;
  } else if (parsed.continuityTested) {
    missionScores.M4_CONTINUITY_TEST = 10;
    score += 10;
  }

  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && correctPins === 8,
    missionScores,
    mandatoryChecks: {
      cameraOnline: correctPins === 8 && parsed.crimped,
      nvrReachable: parsed.continuityTested && ledsAllPass,
      clientLiveViewActive: parsed.isPass,
    },
    resultDetails: {
      correctPins,
      wireSequence: parsed.wireSequence,
      crimped: parsed.crimped,
      waterproofGlandMounted: parsed.waterproofGlandMounted,
      continuityTested: parsed.continuityTested,
    },
  };
}
