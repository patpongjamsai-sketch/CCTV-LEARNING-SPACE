import { unit8SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';

export function evaluateUnit8Submission(rawInput: unknown): CommonUnitEvaluation {
  const input = (rawInput || {}) as any;

  // Check if input follows the 3-station Room 108 structured payload
  const hasStructuredStations = Boolean(
    input.station1 || input.station2 || input.station3 || input.smartCapstone
  );

  if (hasStructuredStations) {
    const s1Data = input.station1 || input.smartCapstone?.station1Data || {};
    const s2Data = input.station2 || input.smartCapstone?.station2Data || {};
    const s3Data = input.station3 || input.smartCapstone?.station3Data || {};

    // ----------------------------------------------------
    // Station 1: Customer Brief, Floor Plan & BOM (20 pts)
    // ----------------------------------------------------
    let s1Score = 0;
    const brief = String(s1Data.customerRequirementBrief || '');
    const hasBrief = brief.trim().length >= 10;
    if (hasBrief) s1Score += 3;

    const floorPlanChecked = Boolean(s1Data.floorPlanCoverageChecked);
    const zones = Array.isArray(s1Data.floorPlanZones) ? s1Data.floorPlanZones : [];
    const zonesPassed = zones.length >= 8 && zones.every((z: any) => z.isBlindSpotFree);
    if (floorPlanChecked && zonesPassed) s1Score += 7;
    else if (floorPlanChecked || zones.length >= 4) s1Score += 4;

    const bomApproved = Boolean(s1Data.bomApproved ?? input.bomApproved);
    const bomItems = Array.isArray(s1Data.bomItems) ? s1Data.bomItems : (input.bomItems || []);
    const verifiedItems = bomItems.filter((b: any) => b.status === 'VERIFIED');
    if (bomApproved && verifiedItems.length >= 7) s1Score += 10;
    else if (bomApproved && verifiedItems.length >= 4) s1Score += 7;
    else if (bomApproved) s1Score += 5;

    s1Score = Math.min(20, s1Score);

    // ----------------------------------------------------
    // Station 2: Integrated System Commissioning (40 pts)
    // ----------------------------------------------------
    let s2Score = 0;
    const cameraOnline = Boolean(
      s2Data.cameraCountOnline === 8 ||
      s2Data.cameraCountOnline >= 6 ||
      input.commissioningChecks?.cameraOnline
    );
    const nvrReachable = Boolean(
      s2Data.nvrReachable ?? input.commissioningChecks?.nvrReachable
    );
    if (cameraOnline && nvrReachable) s2Score += 12;
    else if (cameraOnline || nvrReachable) s2Score += 6;

    const liveView = Boolean(
      s2Data.liveView8ChannelsActive ?? input.commissioningChecks?.liveViewActive
    );
    const recording = Boolean(
      s2Data.recordingActive24_7 ?? input.commissioningChecks?.recordingActive
    );
    if (liveView && recording) s2Score += 12;
    else if (liveView || recording) s2Score += 6;

    const upsHold = Boolean(s2Data.upsFailoverTested ?? true);
    if (upsHold) s2Score += 8;

    const hardening = s2Data.cyberHardening || {};
    const isHardened = Boolean(
      (hardening.defaultPasswordChanged && hardening.rtspPortChanged && !hardening.telnetEnabled) ||
      s2Data.isCompleted
    );
    if (isHardened) s2Score += 8;
    else if (hardening.defaultPasswordChanged) s2Score += 4;

    s2Score = Math.min(40, s2Score);

    // ----------------------------------------------------
    // Station 3: Punch List & Handover Sign-off (25 pts)
    // ----------------------------------------------------
    let s3Score = 0;
    const docs = s3Data.documentationPackage || {};
    const asBuiltDelivered = Boolean(docs.asBuiltDiagramDelivered ?? true);
    const userTrained = Boolean(s3Data.userTrainingCompleted ?? true);
    if (asBuiltDelivered && userTrained) s3Score += 8;
    else if (asBuiltDelivered || userTrained) s3Score += 4;

    const defects = Number(s3Data.punchListDefectsCount ?? 0);
    const defectsResolved = Boolean(s3Data.punchListDefectsResolved ?? (defects === 0));
    if (defects === 0 && defectsResolved) s3Score += 7;
    else if (defects <= 1) s3Score += 3;

    const handoverSigned = Boolean(
      s3Data.handoverCertificateSigned ?? input.handoverCertificateSigned
    );
    const signee = String(s3Data.customerSigneeName || '').trim();
    if (handoverSigned && signee.length >= 2) s3Score += 10;
    else if (handoverSigned) s3Score += 7;

    s3Score = Math.min(25, s3Score);

    // Hints penalty
    const totalHints = Number(input.totalHintsUsed || 0);
    const hintPenalty = Math.min(5, totalHints * 1);

    const totalRawScore = s1Score + s2Score + s3Score;
    const finalScore = Math.max(0, totalRawScore - hintPenalty);

    // Mandatory checks
    const mandatoryCamOnline = cameraOnline;
    const mandatoryNvrReachable = nvrReachable;
    const mandatoryLiveView = liveView;
    const mandatoryHandover = handoverSigned;

    const allMandatoryPassed =
      mandatoryCamOnline &&
      mandatoryNvrReachable &&
      mandatoryLiveView &&
      mandatoryHandover;

    const isPassed = finalScore >= 70 && allMandatoryPassed;

    // Mission scores mapping to existing schema keys
    const missionScores: Record<string, number> = {
      M1_BOM_BUDGET_REVIEW: s1Score, // max 20
      M2_SYSTEM_COMMISSIONING: Math.round(s2Score * (20 / 40)), // max 20
      M3_ACCEPTANCE_TESTING: Math.round(s2Score * (20 / 40)), // max 20
      M4_HANDOVER_CERTIFICATION: Math.round(s3Score * (15 / 25)), // max 15
      M5_PROJECT_GOVERNANCE: Math.round(s3Score * (10 / 25)), // max 10
    };

    return {
      totalScore: finalScore, // max 85
      isPassed,
      missionScores,
      mandatoryChecks: {
        cameraOnline: mandatoryCamOnline,
        nvrReachable: mandatoryNvrReachable,
        clientLiveViewActive: mandatoryLiveView,
      },
      resultDetails: {
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        bomApproved,
        verifiedItemsCount: verifiedItems.length,
        commissioningChecks: {
          cameraOnline,
          nvrReachable,
          liveViewActive: liveView,
          recordingActive: recording,
          upsFailoverTested: upsHold,
        },
        handoverCertificateSigned: handoverSigned,
        punchListZeroDefects: defects === 0,
      },
    };
  }

  // Fallback: Legacy flat payload evaluation
  const parsed = unit8SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_BOM_BUDGET_REVIEW: 0,
    M2_SYSTEM_COMMISSIONING: 0,
    M3_ACCEPTANCE_TESTING: 0,
    M4_HANDOVER_CERTIFICATION: 0,
    M5_PROJECT_GOVERNANCE: 0,
  };

  // M1: BOM & Budget Review
  if (parsed.bomApproved && parsed.bomItems.length >= 5) {
    missionScores.M1_BOM_BUDGET_REVIEW = 20;
    score += 20;
  } else if (parsed.bomApproved) {
    missionScores.M1_BOM_BUDGET_REVIEW = 15;
    score += 15;
  }

  // M2 & M3: System Commissioning & Acceptance Testing
  if (parsed.commissioningChecks.cameraOnline && parsed.commissioningChecks.nvrReachable) {
    missionScores.M2_SYSTEM_COMMISSIONING = 20;
    score += 20;
  } else {
    missionScores.M2_SYSTEM_COMMISSIONING = 10;
    score += 10;
  }

  if (parsed.commissioningChecks.liveViewActive && parsed.commissioningChecks.recordingActive) {
    missionScores.M3_ACCEPTANCE_TESTING = 20;
    score += 20;
  } else {
    missionScores.M3_ACCEPTANCE_TESTING = 10;
    score += 10;
  }

  // M4: Handover Certification
  if (parsed.handoverCertificateSigned) {
    missionScores.M4_HANDOVER_CERTIFICATION = 15;
    score += 15;
  }

  // M5: Project Governance / Quality
  missionScores.M5_PROJECT_GOVERNANCE = 10;
  score += 10;

  const hintPenalty = Math.min(5, parsed.totalHintsUsed * 1);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && parsed.handoverCertificateSigned,
    missionScores,
    mandatoryChecks: {
      cameraOnline: parsed.commissioningChecks.cameraOnline,
      nvrReachable: parsed.commissioningChecks.nvrReachable,
      clientLiveViewActive: parsed.commissioningChecks.liveViewActive,
    },
    resultDetails: {
      bomApproved: parsed.bomApproved,
      bomItemsCount: parsed.bomItems.length,
      commissioningChecks: parsed.commissioningChecks,
      handoverCertificateSigned: parsed.handoverCertificateSigned,
    },
  };
}
