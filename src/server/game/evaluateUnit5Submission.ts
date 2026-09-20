import { unit5SubmissionSchema, type CommonUnitEvaluation } from '../../shared/domain/workstationTypes';
import type { Room105LabSubmissionPayload } from '../../shared/domain/room105Types';

const ST3_NVR_KEYWORDS = [
  ['account locked', 'ล็อค', 'lockout', 'รหัสผ่านผิด', 'authentication'],
  ['rtsp', 'port 554', 'พอร์ต', 'firewall', 'blocked'],
  ['bitrate', 'overflow', 'กระตุก', 'h.265', 'codec', 'เฟรมดรอป'],
  ['retest', 'ทดสอบซ้ำ', 'online', 'ฟื้นตัว', 'สำเร็จ'],
];

export function evaluateUnit5Submission(rawInput: unknown): CommonUnitEvaluation {
  const anyInput = (rawInput || {}) as Record<string, any>;
  const payload = (anyInput.smartNvr || anyInput) as Partial<Room105LabSubmissionPayload> & Record<string, any>;

  // -------------------------------------------------------------
  // Detect Room 105 3-Station Simulation Payload
  // -------------------------------------------------------------
  if (payload.station1 || payload.station2 || payload.station3) {
    let s1Score = 0;
    let s2Score = 0;
    let s3Score = 0;

    // -------------------------------------------------------------
    // STATION 1: ONVIF Discovery & Channel Mapping (35 pts max)
    // -------------------------------------------------------------
    const st1 = payload.station1 || ({} as any);

    // 1. ONVIF WS-Discovery executed (10 pts)
    if (st1.onvifDiscovered) {
      s1Score += 10;
    }

    // 2. Authentication passed on cameras (8 pts)
    const authCount = Number(st1.authSuccessCount ?? 0);
    const mappings = Array.isArray(st1.channelMappings) ? st1.channelMappings : [];
    const authFromMappings = mappings.filter((m: any) => m.authenticated).length;
    const effectiveAuth = Math.max(authCount, authFromMappings);

    if (effectiveAuth >= 4) {
      s1Score += 8;
    } else if (effectiveAuth >= 2) {
      s1Score += 5;
    }

    // 3. Channel Mapping with no collision (10 pts)
    // Check duplicate channel numbers
    const channelCounts: Record<number, number> = {};
    mappings.forEach((row: any) => {
      const ch = Number(row.channelNumber);
      if (ch) {
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      }
    });
    const hasDuplicateChannels = Object.values(channelCounts).some((count) => count > 1);
    const hasCollision = st1.hasChannelCollision ?? hasDuplicateChannels;

    if (!hasCollision && mappings.length >= 4) {
      s1Score += 10;
    } else if (!hasCollision && mappings.length >= 2) {
      s1Score += 6;
    } else if (hasCollision) {
      s1Score += 2; // Collision penalty
    }

    // 4. Status online & preview verified (7 pts)
    const onlineCount = mappings.filter((m: any) => m.status === 'ONLINE' && m.previewVerified).length;
    if (onlineCount >= 4) {
      s1Score += 7;
    } else if (onlineCount >= 2) {
      s1Score += 4;
    }

    s1Score = Math.min(35, s1Score);

    // -------------------------------------------------------------
    // STATION 2: Video Compression, Bitrate & Live View (35 pts max)
    // -------------------------------------------------------------
    const st2 = payload.station2 || ({} as any);

    // 1. Codec Selection: H.265 earns full 10 pts, H.264 earns 5 pts (10 pts)
    const codec = st2.selectedGlobalCodec || 'H.265';
    if (codec === 'H.265') {
      s2Score += 10;
    } else {
      s2Score += 5;
    }

    // 2. Stream Resolution & Frame Rate logic (8 pts)
    const streamConfigs = st2.streamConfigs ? Object.values(st2.streamConfigs) : [];
    const fpsValid = streamConfigs.length > 0
      ? streamConfigs.every((c: any) => c.mainStream?.frameRateFps >= 20 && c.mainStream?.frameRateFps <= 30)
      : true;

    if (fpsValid && streamConfigs.length >= 2) {
      s2Score += 8;
    } else if (streamConfigs.length >= 1) {
      s2Score += 4;
    } else {
      s2Score += 8; // Default config
    }

    // 3. Bitrate control mode & reasoning (8 pts)
    const totalBitrate = Number(st2.estimatedTotalBitrateMbps ?? 13.26);
    const reasoningText = (st2.bitrateReasoning || '').trim();
    if (totalBitrate <= 25 && reasoningText.length >= 20) {
      s2Score += 8;
    } else if (totalBitrate <= 25) {
      s2Score += 5;
    }

    // 4. Multi-split Live View verified (9 pts)
    const liveOk = Boolean(st2.liveViewVerified);
    const isMulti = st2.multiSplitMode === '4-SPLIT';
    if (liveOk && isMulti) {
      s2Score += 9;
    } else if (liveOk) {
      s2Score += 6;
    }

    s2Score = Math.min(35, s2Score);

    // -------------------------------------------------------------
    // STATION 3: Motion, Privacy, Schedule & Fault Retest (30 pts max)
    // -------------------------------------------------------------
    const st3 = payload.station3 || ({} as any);

    // 1. Motion Grid & Sensitivity (8 pts)
    const activeCells = Number(st3.motionGridActiveCellsCount ?? 12);
    const sensitivity = Number(st3.motionSensitivity ?? 75);
    if (activeCells >= 8 && sensitivity >= 60 && sensitivity <= 90) {
      s3Score += 8;
    } else if (activeCells > 0) {
      s3Score += 5;
    }

    // 2. Privacy Masking Area (7 pts)
    const masks = Array.isArray(st3.privacyMaskList) ? st3.privacyMaskList : [];
    if (masks.length >= 1) {
      s3Score += 7;
    }

    // 3. 24/7 Recording Schedule Configuration (7 pts)
    const schedule = Array.isArray(st3.recordingSchedule) ? st3.recordingSchedule : [];
    const hasContinuous = schedule.some((d: any) =>
      Array.isArray(d.timeRanges) && d.timeRanges.some((r: any) => r.mode === 'CONTINUOUS')
    );
    const hasMotionMode = schedule.some((d: any) =>
      Array.isArray(d.timeRanges) && d.timeRanges.some((r: any) => r.mode === 'MOTION')
    );
    if (hasContinuous && hasMotionMode) {
      s3Score += 7;
    } else if (schedule.length > 0) {
      s3Score += 4;
    }

    // 4. Fault Log Analysis & Retest Result (8 pts)
    const fLog = st3.faultLog || {};
    const logText = `${fLog.problemDescription || ''} ${fLog.possibleCause || ''} ${fLog.appliedSolution || ''} ${fLog.retestVerification || ''}`.toLowerCase();
    let keywordsFound = 0;
    for (const group of ST3_NVR_KEYWORDS) {
      if (group.some((k) => logText.includes(k.toLowerCase()))) {
        keywordsFound++;
      }
    }
    const logComplete = (fLog.problemDescription || '').length >= 15 && (fLog.appliedSolution || '').length >= 15;
    const retestPassed = Boolean(st3.retestPassed && (fLog.retestPassed ?? true));

    if (retestPassed && logComplete && keywordsFound >= 2) {
      s3Score += 8;
    } else if (retestPassed) {
      s3Score += 5;
    }

    s3Score = Math.min(30, s3Score);

    const totalScore = Math.min(100, Math.round(s1Score + s2Score + s3Score));

    // Mandatory Checks
    const cameraOnline = Boolean(st1.onvifDiscovered && !hasCollision && onlineCount >= 2);
    const nvrReachable = Boolean(st1.onvifDiscovered && retestPassed);
    const clientLiveViewActive = Boolean(liveOk && totalScore >= 70);
    const isPassed = Boolean(totalScore >= 70 && cameraOnline && nvrReachable);

    return {
      totalScore,
      isPassed,
      missionScores: {
        STATION_1_ONVIF_CHANNEL_MAPPING: s1Score,
        STATION_2_VIDEO_CODEC_LIVE_VIEW: s2Score,
        STATION_3_MOTION_SCHEDULE_FAULT: s3Score,
      },
      mandatoryChecks: {
        cameraOnline,
        nvrReachable,
        clientLiveViewActive,
      },
      resultDetails: {
        station1Score: s1Score,
        station2Score: s2Score,
        station3Score: s3Score,
        hasChannelCollision: hasCollision,
        globalCodec: codec,
        storageSavingPercent: st2.storageSavingPercent ?? (codec === 'H.265' ? 52 : 0),
        retestPassed,
      },
    };
  }

  // -------------------------------------------------------------
  // Legacy Workstation Submission Evaluation (Backward-Compatible)
  // -------------------------------------------------------------
  const parsed = unit5SubmissionSchema.parse(rawInput || {});

  let score = 0;
  const missionScores: Record<string, number> = {
    M1_ONVIF_DISCOVERY: 0,
    M2_CHANNEL_ASSIGNMENT: 0,
    M3_H265_COMPRESSION: 0,
    M4_PRIVACY_MASKING: 0,
    M5_BITRATE_OPTIMIZATION: 0,
  };

  // M1 & M2: ONVIF Discovery and Channel Binding
  if (parsed.onvifDiscovered && parsed.discoveredChannels.length >= 2) {
    missionScores.M1_ONVIF_DISCOVERY = 20;
    missionScores.M2_CHANNEL_ASSIGNMENT = 20;
    score += 40;
  } else if (parsed.onvifDiscovered) {
    missionScores.M1_ONVIF_DISCOVERY = 15;
    missionScores.M2_CHANNEL_ASSIGNMENT = 10;
    score += 25;
  }

  // M3 & M5: H.265 Codec & Bitrate Optimization (>50% savings)
  if (parsed.videoCodec === 'H.265') {
    missionScores.M3_H265_COMPRESSION = 20;
    missionScores.M5_BITRATE_OPTIMIZATION = 20;
    score += 40;
  } else {
    missionScores.M3_H265_COMPRESSION = 10;
    missionScores.M5_BITRATE_OPTIMIZATION = 5;
    score += 15;
  }

  // M4: Privacy Masking
  if (parsed.privacyMaskConfigured) {
    missionScores.M4_PRIVACY_MASKING = 20;
    score += 20;
  }

  const hintPenalty = Math.min(10, parsed.totalHintsUsed * 2);
  const finalScore = Math.max(0, score - hintPenalty);

  return {
    totalScore: finalScore,
    isPassed: finalScore >= 70 && parsed.onvifDiscovered,
    missionScores,
    mandatoryChecks: {
      cameraOnline: parsed.onvifDiscovered && parsed.discoveredChannels.length >= 2,
      nvrReachable: parsed.onvifDiscovered,
      clientLiveViewActive: parsed.videoCodec === 'H.265' || parsed.videoCodec === 'H.264',
    },
    resultDetails: {
      onvifDiscovered: parsed.onvifDiscovered,
      discoveredChannels: parsed.discoveredChannels,
      videoCodec: parsed.videoCodec,
      privacyMaskConfigured: parsed.privacyMaskConfigured,
    },
  };
}
