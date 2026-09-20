import { unit6SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';


export function evaluateUnit6Submission(rawInput: unknown): CommonUnitEvaluation {
  const input = (rawInput || {}) as any;

  // Check if input follows the 3-station Room 106 structured payload
  const hasStructuredStations = Boolean(
    input.station1 || input.station2 || input.station3 || input.smartStorage
  );

  if (hasStructuredStations) {
    const s1Data = input.station1 || input.smartStorage?.station1Data || {};
    const s2Data = input.station2 || input.smartStorage?.station2Data || {};
    const s3Data = input.station3 || input.smartStorage?.station3Data || {};

    // Station 1: Storage Calculation & Retention (20 pts)
    let s1Score = 0;
    const cameraCount = Number(s1Data.cameraCount || 0);
    const retentionDays = Number(s1Data.retentionDays || 0);
    const calculatedTb = Number(s1Data.calculatedTotalTb || s1Data.calculatedStorageTb || 0);
    const recommendedCapacity = Number(s1Data.recommendedCapacityTb || 0);
    const reasoning = String(s1Data.capacityReasoning || '');

    if (cameraCount === 8 && retentionDays === 30) s1Score += 5;
    else if (cameraCount > 0 && retentionDays > 0) s1Score += 3;

    if (Math.abs(calculatedTb - 7.72) <= 0.35 || Math.abs(calculatedTb - 7.8) <= 0.35) {
      s1Score += 8;
    } else if (calculatedTb > 0) {
      s1Score += 4;
    }

    if (recommendedCapacity === 8 || s2Data.selectedHddCapacity?.includes('8TB')) {
      s1Score += 5;
    } else if (recommendedCapacity >= 6 && recommendedCapacity <= 10) {
      s1Score += 3;
    }

    if (reasoning.trim().length >= 25) s1Score += 2;
    else if (reasoning.trim().length >= 10) s1Score += 1;

    // Station 2: HDD Selection, Installation, Format & S.M.A.R.T. (40 pts)
    let s2Score = 0;
    const hddSize = String(s2Data.selectedHddCapacity || s2Data.selectedHddSize || '');
    const hddGrade = String(s2Data.hddGrade || '');
    const isSataConnected = Boolean(s2Data.isSataCableConnected ?? true);
    const hddFormatted = Boolean(s2Data.hddFormatted);
    const hddInitialized = Boolean(s2Data.hddInitialized ?? hddFormatted);
    const isSmartCheckPassed = Boolean(s2Data.isSmartCheckPassed);

    if (hddSize.includes('8TB')) s2Score += 10;
    else if (hddSize.includes('4TB')) s2Score += 5;

    if (hddGrade === 'Surveillance') s2Score += 10;
    else s2Score += 3;

    if (isSataConnected && hddFormatted && hddInitialized) s2Score += 15;
    else if (isSataConnected && (hddFormatted || hddInitialized)) s2Score += 10;
    else if (isSataConnected) s2Score += 6;

    if (isSmartCheckPassed) s2Score += 5;

    // Station 3: Cloud P2P, QR Pairing & Remote Access Fault (40 pts)
    let s3Score = 0;
    const cloudP2pEnabled = Boolean(s3Data.cloudP2pEnabled);
    const cloudP2pStatus = String(s3Data.cloudP2pStatus || 'OFFLINE');
    const mobileQrScanned = Boolean(s3Data.mobileQrScanned);
    const liveStreamTested = Boolean(s3Data.liveStreamTested ?? mobileQrScanned);
    const faultRetestPassed = Boolean(
      s3Data.faultScenario?.retestPassed ?? s3Data.retestPassed ?? (cloudP2pStatus === 'ONLINE')
    );

    if (cloudP2pEnabled && cloudP2pStatus === 'ONLINE') s3Score += 20;
    else if (cloudP2pEnabled) s3Score += 8;

    if (mobileQrScanned && liveStreamTested) s3Score += 10;
    else if (mobileQrScanned) s3Score += 6;

    s3Score += 5; // Security reasoning credit (Cloud P2P vs DDNS)

    if (faultRetestPassed) s3Score += 5;

    const totalHintsUsed = Number(input.totalHintsUsed || 0);
    const hintPenalty = Math.min(10, totalHintsUsed * 2);
    const rawTotal = s1Score + s2Score + s3Score;
    const finalScore = Math.max(0, rawTotal - hintPenalty);

    const isPassed = finalScore >= 70 && hddFormatted && cloudP2pStatus === 'ONLINE';

    return {
      totalScore: finalScore,
      isPassed,
      missionScores: {
        STATION_1_STORAGE_CALCULATION: s1Score,
        STATION_2_HDD_MANAGEMENT: s2Score,
        STATION_3_REMOTE_ACCESS_P2P: s3Score,
      },
      mandatoryChecks: {
        cameraOnline: true,
        nvrReachable: hddFormatted,
        clientLiveViewActive: cloudP2pStatus === 'ONLINE',
      },
      resultDetails: {
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        calculatedStorageTb: calculatedTb,
        selectedHddSize: hddSize,
        hddGrade,
        hddFormatted,
        cloudP2pStatus,
      },
    };
  }

  // Fallback: Legacy flat schema evaluation
  const parsed = unit6SubmissionSchema.parse(input);

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_STORAGE_CALCULATION: 0,
    M2_SURVEILLANCE_HDD_GRADE: 0,
    M3_HDD_INITIALIZATION: 0,
    M4_CLOUD_P2P_ACTIVATION: 0,
    M5_MOBILE_REMOTE_ACCESS: 0,
  };

  // M1: Storage Calculation formula check (~7.8 TB)
  if (Math.abs(parsed.calculatedStorageTb - 7.8) <= 0.5) {
    missionScores.M1_STORAGE_CALCULATION = 20;
    score += 20;
  } else {
    missionScores.M1_STORAGE_CALCULATION = 10;
    score += 10;
  }

  // M2: Surveillance HDD Grade & Capacity (8TB Surveillance)
  if (parsed.selectedHddSize === '8TB' && parsed.hddGrade === 'Surveillance') {
    missionScores.M2_SURVEILLANCE_HDD_GRADE = 20;
    score += 20;
  } else if (parsed.selectedHddSize === '8TB') {
    missionScores.M2_SURVEILLANCE_HDD_GRADE = 10;
    score += 10;
  }

  // M3: HDD Formatting / Initialization
  if (parsed.hddFormatted) {
    missionScores.M3_HDD_INITIALIZATION = 20;
    score += 20;
  }

  // M4: Cloud P2P Activation (ONLINE)
  if (parsed.cloudP2pEnabled && parsed.cloudP2pStatus === 'ONLINE') {
    missionScores.M4_CLOUD_P2P_ACTIVATION = 20;
    score += 20;
  } else if (parsed.cloudP2pEnabled) {
    missionScores.M4_CLOUD_P2P_ACTIVATION = 10;
    score += 10;
  }

  // M5: Mobile Remote Access QR Code
  if (parsed.mobileQrScanned) {
    missionScores.M5_MOBILE_REMOTE_ACCESS = 20;
    score += 20;
  }

  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && parsed.hddFormatted && parsed.cloudP2pStatus === 'ONLINE',
    missionScores,
    mandatoryChecks: {
      cameraOnline: true,
      nvrReachable: parsed.hddFormatted,
      clientLiveViewActive: parsed.cloudP2pStatus === 'ONLINE',
    },
    resultDetails: {
      calculatedStorageTb: parsed.calculatedStorageTb,
      selectedHddSize: parsed.selectedHddSize,
      hddGrade: parsed.hddGrade,
      hddFormatted: parsed.hddFormatted,
      cloudP2pStatus: parsed.cloudP2pStatus,
    },
  };
}
