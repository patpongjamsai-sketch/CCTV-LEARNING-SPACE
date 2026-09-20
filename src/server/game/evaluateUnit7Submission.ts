import { unit7SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';

export function evaluateUnit7Submission(rawInput: unknown): CommonUnitEvaluation {
  const input = (rawInput || {}) as any;

  // Check if input follows the 3-station Room 107 structured payload
  const hasStructuredStations = Boolean(
    input.station1 || input.station2 || input.station3 || input.smartTroubleshooting
  );

  if (hasStructuredStations) {
    const s1Data = input.station1 || input.smartTroubleshooting?.station1Data || {};
    const s2Data = input.station2 || input.smartTroubleshooting?.station2Data || {};
    const s3Data = input.station3 || input.smartTroubleshooting?.station3Data || {};

    // ----------------------------------------------------
    // Station 1: Diagnostic Tree, Voltage Drop & NO VIDEO (40 pts)
    // ----------------------------------------------------
    let s1Score = 0;
    const steps = Array.isArray(s1Data.diagnosticSteps) ? s1Data.diagnosticSteps : [];
    if (steps.length >= 4) s1Score += 10;
    else if (steps.length > 0) s1Score += 5;

    const measuredVoltage = Number(s1Data.measuredPoEVoltage || input.step1PoEVoltageValue || 0);
    const voltageDropDetected = Boolean(
      s1Data.voltageDropDetected || (measuredVoltage > 0 && measuredVoltage < 45)
    );
    if (voltageDropDetected && measuredVoltage > 0) s1Score += 15;
    else if (measuredVoltage > 0) s1Score += 8;

    const fixApplied = Boolean(s1Data.powerActionApplied || s1Data.isCompleted);
    const noVideoResolved = Boolean(
      s1Data.noVideoResolved || input.resolvedFaults?.includes('NO_VIDEO')
    );
    const retestVoltage = Number(s1Data.retestPoEVoltage || 0);
    if (fixApplied && noVideoResolved && retestVoltage >= 48) s1Score += 15;
    else if (fixApplied && noVideoResolved) s1Score += 10;
    else if (fixApplied) s1Score += 5;

    s1Score = Math.min(40, s1Score);

    // ----------------------------------------------------
    // Station 2: Ground Loop, Signal Quality & Tools (20 pts)
    // ----------------------------------------------------
    let s2Score = 0;
    const symptom = String(s2Data.symptomIdentified || '');
    const waveformAnalyzed = Boolean(s2Data.waveformAnalyzed ?? true);
    if (symptom === 'ROLLING_HUM_BARS' && waveformAnalyzed) s2Score += 8;
    else if (waveformAnalyzed || symptom.length > 0) s2Score += 4;

    const isolatorInstalled = Boolean(
      s2Data.isolatorInstalled ?? input.step2GroundLoopIsolatorInstalled
    );
    const humBarsResolved = Boolean(
      s2Data.humBarsResolved || input.resolvedFaults?.includes('HUM_BARS')
    );
    if (isolatorInstalled && humBarsResolved) s2Score += 12;
    else if (isolatorInstalled) s2Score += 6;

    s2Score = Math.min(20, s2Score);

    // ----------------------------------------------------
    // Station 3: Preventive Maintenance & Service Report (40 pts)
    // ----------------------------------------------------
    let s3Score = 0;
    const lens = s3Data.lensInspection || {};
    const lensCleanDone = Boolean(lens.cleanDone ?? input.step3LensCleaned);
    const moistureChecked = Boolean(lens.moistureChecked ?? true);
    const focusCalibrated = Boolean(lens.focusCalibrated ?? true);
    const gasketInspected = Boolean(lens.waterproofGasketInspected ?? true);

    const lensChecksPassed = [lensCleanDone, moistureChecked, focusCalibrated, gasketInspected].filter(Boolean).length;
    if (lensChecksPassed === 4) s3Score += 20;
    else s3Score += lensChecksPassed * 4;

    const pm = s3Data.pmChecklist || {};
    const pmCount = Object.values(pm).filter(Boolean).length;
    const pmSigned = Boolean(s3Data.pmChecklistSigned ?? input.step3PmChecklistSigned);

    if (pmCount >= 4 && pmSigned) s3Score += 20;
    else if (pmCount >= 3 && pmSigned) s3Score += 15;
    else if (pmSigned) s3Score += 10;
    else s3Score += pmCount * 2;

    s3Score = Math.min(40, s3Score);

    // Hints penalty
    const totalHints = Number(input.totalHintsUsed || 0);
    const hintPenalty = Math.min(10, totalHints * 2);

    const totalRawScore = s1Score + s2Score + s3Score;
    const finalScore = Math.max(0, totalRawScore - hintPenalty);

    // Mandatory Checks
    const cameraOnline = noVideoResolved && isolatorInstalled;
    const nvrReachable = true;
    const clientLiveViewActive = cameraOnline && lensCleanDone;
    const faultsCleared = noVideoResolved && humBarsResolved;

    const isPassed =
      finalScore >= 70 &&
      cameraOnline &&
      clientLiveViewActive &&
      faultsCleared &&
      pmSigned;

    // Mission scores mapping to existing schema keys (5 x 20 pts)
    const missionScores: Record<string, number> = {
      M1_VOLTAGE_DROP_DIAGNOSTIC: Math.round(s1Score * (20 / 40)), // max 20
      M2_GROUND_LOOP_MITIGATION: s2Score, // max 20
      M3_PREVENTIVE_MAINTENANCE: Math.round(s3Score * (20 / 40)), // max 20
      M4_FAULT_CLEARANCE: faultsCleared ? 20 : (noVideoResolved || humBarsResolved ? 10 : 0), // max 20
      M5_PM_CHECKLIST_SIGNOFF: pmSigned ? 20 : 0, // max 20
    };

    return {
      totalScore: finalScore,
      isPassed,
      missionScores,
      mandatoryChecks: {
        cameraOnline,
        nvrReachable,
        clientLiveViewActive,
      },
      resultDetails: {
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        faultDeviceId: 'CAM-03',
        step1PoEVoltageChecked: noVideoResolved,
        step1PoEVoltageValue: measuredVoltage,
        step2GroundLoopIsolatorInstalled: isolatorInstalled,
        step3LensCleaned: lensCleanDone,
        step3PmChecklistSigned: pmSigned,
        resolvedFaults: [
          ...(noVideoResolved ? ['NO_VIDEO'] : []),
          ...(humBarsResolved ? ['HUM_BARS'] : []),
        ],
      },
    };
  }

  // Fallback: Legacy flat payload evaluation
  const parsed = unit7SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_VOLTAGE_DROP_DIAGNOSTIC: 0,
    M2_GROUND_LOOP_MITIGATION: 0,
    M3_PREVENTIVE_MAINTENANCE: 0,
    M4_FAULT_CLEARANCE: 0,
    M5_PM_CHECKLIST_SIGNOFF: 0,
  };

  // Step 1: PoE voltage level testing
  if (parsed.step1PoEVoltageChecked) {
    missionScores.M1_VOLTAGE_DROP_DIAGNOSTIC = 20;
    score += 20;
  }

  // Step 2: Ground Loop Isolator
  if (parsed.step2GroundLoopIsolatorInstalled) {
    missionScores.M2_GROUND_LOOP_MITIGATION = 20;
    score += 20;
  }

  // Step 3: Lens cleaning and checklist
  if (parsed.step3LensCleaned) {
    missionScores.M3_PREVENTIVE_MAINTENANCE = 20;
    score += 20;
  }

  // Fault clearance (NO_VIDEO and HUM_BARS resolved)
  if (parsed.resolvedFaults.includes('NO_VIDEO') && parsed.resolvedFaults.includes('HUM_BARS')) {
    missionScores.M4_FAULT_CLEARANCE = 20;
    score += 20;
  } else if (parsed.resolvedFaults.length > 0) {
    missionScores.M4_FAULT_CLEARANCE = 10;
    score += 10;
  }

  // PM Checklist Sign-off
  if (parsed.step3PmChecklistSigned) {
    missionScores.M5_PM_CHECKLIST_SIGNOFF = 20;
    score += 20;
  }

  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  const faultsFixed = parsed.step1PoEVoltageChecked && parsed.step2GroundLoopIsolatorInstalled;

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && faultsFixed && parsed.step3PmChecklistSigned,
    missionScores,
    mandatoryChecks: {
      cameraOnline: faultsFixed,
      nvrReachable: true,
      clientLiveViewActive: faultsFixed && parsed.step3LensCleaned,
    },
    resultDetails: {
      faultDeviceId: parsed.faultDeviceId,
      step1PoEVoltageChecked: parsed.step1PoEVoltageChecked,
      step2GroundLoopIsolatorInstalled: parsed.step2GroundLoopIsolatorInstalled,
      step3LensCleaned: parsed.step3LensCleaned,
      step3PmChecklistSigned: parsed.step3PmChecklistSigned,
      resolvedFaults: parsed.resolvedFaults,
    },
  };
}
