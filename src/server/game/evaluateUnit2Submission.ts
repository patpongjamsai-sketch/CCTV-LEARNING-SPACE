import { unit2SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';

export function evaluateUnit2Submission(rawInput: unknown): CommonUnitEvaluation {
  const parsed = unit2SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_CAMERA_SELECTION: 0,
    M2_LENS_FOV: 0,
    M3_BLIND_SPOT_MITIGATION: 0,
    M4_PDPA_PRIVACY: 0,
    M5_SITE_SURVEY: 0,
  };

  // Check if this submission contains Smart School 3-Station payload
  const anyInput = rawInput as Record<string, any> | undefined;
  const smartSchool = anyInput?.smartSchool || anyInput;

  if (smartSchool?.station1Outdoor || smartSchool?.station1Score !== undefined) {
    const s1Score = smartSchool.station1Score ?? (smartSchool.station1Outdoor?.score ?? 0);
    const s2Score = smartSchool.station2Score ?? (smartSchool.station2Indoor?.score ?? 0);
    const s3Score = smartSchool.station3Score ?? (smartSchool.station3Written?.totalScore ?? 0);

    // Station 1 = 35 pts, Station 2 = 35 pts, Station 3 = 30 pts (Total = 100)
    const weightedS1 = Math.round((s1Score / 100) * 35);
    const weightedS2 = Math.round((s2Score / 100) * 35);
    const weightedS3 = Math.round(s3Score);
    const smartSchoolTotal = Math.min(100, weightedS1 + weightedS2 + weightedS3);

    missionScores.M1_CAMERA_SELECTION = weightedS1;
    missionScores.M2_LENS_FOV = Math.round(weightedS2 / 2);
    missionScores.M3_BLIND_SPOT_MITIGATION = Math.round(weightedS2 / 2);
    missionScores.M4_PDPA_PRIVACY = smartSchool?.station2Indoor?.privacyMask ? 10 : 0;
    missionScores.M5_SITE_SURVEY = weightedS3;

    return {
      totalScore: smartSchoolTotal,
      isPassed: smartSchoolTotal >= 70,
      missionScores,
      mandatoryChecks: {
        cameraOnline: true,
        nvrReachable: true,
        clientLiveViewActive: true,
      },
      resultDetails: {
        theme: 'Smart School CCTV System',
        station1OutdoorScore: s1Score,
        station2IndoorScore: s2Score,
        station3WrittenScore: s3Score,
        keywordsDetected: smartSchool?.station3Answers?.keywordsFound || smartSchool?.station3Written?.keywordsFound || [],
      },
    };
  }

  // M1: Camera Selection (Zone A: Dome, Zone B: Bullet, Zone C: PTZ)
  if (parsed.zoneA === 'dome' && parsed.zoneB === 'bullet' && parsed.zoneC === 'ptz') {
    missionScores.M1_CAMERA_SELECTION = 20;
    score += 20;
  } else {
    // Partial points
    let partial = 0;
    if (parsed.zoneA === 'dome') partial += 7;
    if (parsed.zoneB === 'bullet') partial += 7;
    if (parsed.zoneC === 'ptz') partial += 6;
    missionScores.M1_CAMERA_SELECTION = partial;
    score += partial;
  }

  // M2: Lens & FOV Optimization (2.8mm wide angle)
  if (parsed.lensFocal === '2.8mm') {
    missionScores.M2_LENS_FOV = 20;
    score += 20;
  } else {
    missionScores.M2_LENS_FOV = 10;
    score += 10;
  }

  // M3: Coverage & Blind Spot Mitigation (Coverage tested and >= 90%)
  if (parsed.coverageTested && parsed.coveragePercent >= 90) {
    missionScores.M3_BLIND_SPOT_MITIGATION = 20;
    score += 20;
  } else if (parsed.coverageTested) {
    missionScores.M3_BLIND_SPOT_MITIGATION = 10;
    score += 10;
  }

  // M4: PDPA Privacy Masking
  if (parsed.privacyMask) {
    missionScores.M4_PDPA_PRIVACY = 20;
    score += 20;
  }

  // M5: Site Survey Completion
  missionScores.M5_SITE_SURVEY = 20;
  score += 20;

  // Penalty for hints if any
  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70,
    missionScores,
    mandatoryChecks: {
      cameraOnline: parsed.zoneA === 'dome' && parsed.zoneB === 'bullet',
      nvrReachable: true,
      clientLiveViewActive: parsed.coverageTested,
    },
    resultDetails: {
      zoneA: parsed.zoneA,
      zoneB: parsed.zoneB,
      zoneC: parsed.zoneC,
      lensFocal: parsed.lensFocal,
      coveragePercent: parsed.coveragePercent,
      privacyMask: parsed.privacyMask,
    },
  };
}
