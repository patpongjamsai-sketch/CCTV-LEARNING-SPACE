import { describe, it, expect } from 'vitest';
import { evaluateRoomSubmission } from '../src/server/game/evaluateRoomSubmission';
import { evaluateUnit2Submission } from '../src/server/game/evaluateUnit2Submission';
import { evaluateUnit3Submission } from '../src/server/game/evaluateUnit3Submission';
import { evaluateUnit4Submission } from '../src/server/game/evaluateUnit4Submission';
import { evaluateUnit5Submission } from '../src/server/game/evaluateUnit5Submission';
import { evaluateUnit6Submission } from '../src/server/game/evaluateUnit6Submission';
import { evaluateUnit7Submission } from '../src/server/game/evaluateUnit7Submission';
import { evaluateUnit8Submission } from '../src/server/game/evaluateUnit8Submission';
import { T568B_STANDARD } from '../src/shared/domain/workstationTypes';

describe('Server-Authoritative Room Evaluators (Unit 02 - Unit 08)', () => {
  it('Unit 02: Evaluates Camera Selection & FOV correctly', () => {
    const res = evaluateUnit2Submission({
      zoneA: 'dome',
      zoneB: 'bullet',
      zoneC: 'ptz',
      lensFocal: '2.8mm',
      privacyMask: true,
      coverageTested: true,
      coveragePercent: 94,
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
  });

  it('Unit 03: Evaluates Cabling, Termination & T568B Continuity correctly', () => {
    const res = evaluateUnit3Submission({
      wireSequence: [...T568B_STANDARD],
      crimped: true,
      waterproofGlandMounted: true,
      continuityTested: true,
      ledStatus: [true, true, true, true, true, true, true, true],
      isPass: true,
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.nvrReachable).toBe(true);
  });

  it('Unit 04: Evaluates IP Networking & PoE Budget correctly', () => {
    const res = evaluateUnit4Submission({
      ipAddress: '192.168.1.100',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      poeBudgetTotalWatts: 45,
      poeMaxRatingWatts: 65,
      loadBalanced: true,
      pingTested: true,
      pingResult: {
        rttMs: 1.2,
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
      },
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
  });

  it('Unit 05: Evaluates DVR & NVR ONVIF Discovery and H.265 Codec (Legacy Format)', () => {
    const res = evaluateUnit5Submission({
      onvifDiscovered: true,
      discoveredChannels: ['CH1_DOME', 'CH2_BULLET'],
      videoCodec: 'H.265',
      storageSavingRatio: 0.5,
      privacyMaskConfigured: true,
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
  });

  it('Unit 05: Evaluates Room 105 3-Station Simulation with 100/100 score and passed checks', () => {
    const res = evaluateUnit5Submission({
      station1: {
        onvifDiscovered: true,
        discoveredDeviceCount: 4,
        channelMappings: [
          { channelNumber: 1, deviceId: 'CAM-01', ipAddress: '192.168.1.101', onvifProfile: 'Profile S', authenticated: true, status: 'ONLINE', previewVerified: true },
          { channelNumber: 2, deviceId: 'CAM-02', ipAddress: '192.168.1.102', onvifProfile: 'Profile S', authenticated: true, status: 'ONLINE', previewVerified: true },
          { channelNumber: 3, deviceId: 'CAM-03', ipAddress: '192.168.1.103', onvifProfile: 'Profile S', authenticated: true, status: 'ONLINE', previewVerified: true },
          { channelNumber: 4, deviceId: 'CAM-04', ipAddress: '192.168.1.104', onvifProfile: 'Profile S', authenticated: true, status: 'ONLINE', previewVerified: true },
        ],
        hasChannelCollision: false,
        totalAssignedChannels: 4,
        authSuccessCount: 4,
      },
      station2: {
        selectedGlobalCodec: 'H.265',
        streamConfigs: {
          1: { channelNumber: 1, mainStream: { frameRateFps: 25, bitrateKbps: 4096, bitrateMode: 'CBR' }, subStream: { frameRateFps: 15, bitrateKbps: 512 } },
          2: { channelNumber: 2, mainStream: { frameRateFps: 25, bitrateKbps: 3072, bitrateMode: 'CBR' }, subStream: { frameRateFps: 15, bitrateKbps: 512 } },
        },
        storageSavingPercent: 52,
        estimatedTotalBitrateMbps: 13.26,
        bitrateReasoning: 'เลือกใช้ H.265 ร่วมกับ CBR เพื่อรักษาเสถียรภาพแบนด์วิดท์บนเครือข่าย LAN',
        liveViewVerified: true,
        multiSplitMode: '4-SPLIT',
      },
      station3: {
        motionSensitivity: 75,
        motionGridActiveCellsCount: 12,
        privacyMaskList: [{ id: 'MASK-01', nameTh: 'Window', channelNumber: 1, xPercent: 10, yPercent: 10, widthPercent: 20, heightPercent: 20 }],
        recordingSchedule: [
          { day: 'MON', timeRanges: [{ startHour: 0, endHour: 8, mode: 'MOTION' }, { startHour: 8, endHour: 18, mode: 'CONTINUOUS' }] },
        ],
        faultLog: {
          problemDescription: 'กล้อง CAM-02 หลุดการเชื่อมต่อ NVR แจ้งเตือน Account Locked',
          possibleCause: 'รหัสผ่าน ONVIF กล้องไม่ตรงกับ NVR',
          testMethod: 'ตรวจพอร์ตและ Ping',
          testResult: 'Ping ตอบสนองปกติ',
          appliedSolution: 'ปลดล็อคผ่าน Account Security Menu และซิงค์ Master Password',
          retestVerification: 'Retest สำเร็จ: กล้อง CAM-02 กลับมา Online ภาพสตรีมสดขึ้นปกติ',
          retestPassed: true,
        },
        retestPassed: true,
      },
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.nvrReachable).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
    expect(res.resultDetails.station1Score).toBe(35);
    expect(res.resultDetails.station2Score).toBe(35);
    expect(res.resultDetails.station3Score).toBe(30);
  });

  it('Unit 05: Penalizes Channel Collision and H.264 lower compression', () => {
    const res = evaluateUnit5Submission({
      station1: {
        onvifDiscovered: true,
        channelMappings: [
          { channelNumber: 1, deviceId: 'CAM-01', ipAddress: '192.168.1.101', authenticated: true, status: 'ONLINE', previewVerified: true },
          { channelNumber: 1, deviceId: 'CAM-02', ipAddress: '192.168.1.102', authenticated: true, status: 'ONLINE', previewVerified: true }, // Collision on CH 1!
        ],
        hasChannelCollision: true,
        totalAssignedChannels: 2,
        authSuccessCount: 2,
      },
      station2: {
        selectedGlobalCodec: 'H.264',
        estimatedTotalBitrateMbps: 22.0,
        bitrateReasoning: 'H.264 legacy',
        liveViewVerified: true,
        multiSplitMode: '1-SPLIT',
      },
      station3: {
        motionSensitivity: 40, // sub-optimal
        motionGridActiveCellsCount: 3,
        privacyMaskList: [],
        recordingSchedule: [],
        faultLog: {
          problemDescription: 'ภาพไม่ขึ้น',
          appliedSolution: 'รีเซ็ต',
          retestPassed: false,
        },
        retestPassed: false,
      },
    });

    expect(res.resultDetails.hasChannelCollision).toBe(true);
    expect(res.resultDetails.station1Score).toBeLessThan(25);
    expect(res.resultDetails.station2Score).toBeLessThan(30);
    expect(res.mandatoryChecks.cameraOnline).toBe(false);
    expect(res.mandatoryChecks.nvrReachable).toBe(false);
    expect(res.isPassed).toBe(false);
  });

  it('Unit 06: Evaluates Storage Calculator 7.8TB, 8TB HDD & Cloud P2P (Legacy Schema)', () => {
    const res = evaluateUnit6Submission({
      cameraCount: 8,
      retentionDays: 30,
      calculatedStorageTb: 7.8,
      selectedHddSize: '8TB',
      hddGrade: 'Surveillance',
      hddFormatted: true,
      cloudP2pEnabled: true,
      cloudP2pStatus: 'ONLINE',
      mobileQrScanned: true,
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
  });

  it('Unit 06: Evaluates Room 106 3-Station Structured Payload for 100/100', () => {
    const res = evaluateUnit6Submission({
      roomId: 'room-106',
      unitNumber: 6,
      station1: {
        cameraCount: 8,
        retentionDays: 30,
        calculatedTotalTb: 7.72,
        recommendedCapacityTb: 8,
        capacityReasoning: 'กล้อง 8 ตัว 4Mbps 30 วัน ใช้ ~7.72TB ต้องใช้ 8TB รองรับ FS Overhead',
      },
      station2: {
        selectedHddCapacity: '8TB',
        hddGrade: 'Surveillance',
        isSataCableConnected: true,
        isSmartCheckPassed: true,
        hddFormatted: true,
        hddInitialized: true,
      },
      station3: {
        cloudP2pEnabled: true,
        cloudP2pStatus: 'ONLINE',
        mobileQrScanned: true,
        liveStreamTested: true,
        faultScenario: { retestPassed: true },
      },
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.nvrReachable).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
    expect(res.resultDetails.station1Score).toBe(20);
    expect(res.resultDetails.station2Score).toBe(40);
    expect(res.resultDetails.station3Score).toBe(40);
  });

  it('Unit 06: Penalizes Desktop grade, unformatted HDD, and offline Cloud P2P', () => {
    const res = evaluateUnit6Submission({
      roomId: 'room-106',
      station1: {
        cameraCount: 8,
        retentionDays: 30,
        calculatedTotalTb: 3.5, // incorrect calculation
        recommendedCapacityTb: 4, // too small
        capacityReasoning: 'สั้นเกินไป',
      },
      station2: {
        selectedHddCapacity: '4TB',
        hddGrade: 'Desktop', // Desktop penalty
        isSataCableConnected: false,
        isSmartCheckPassed: false,
        hddFormatted: false, // unformatted
        hddInitialized: false,
      },
      station3: {
        cloudP2pEnabled: false,
        cloudP2pStatus: 'OFFLINE',
        mobileQrScanned: false,
        liveStreamTested: false,
      },
    });

    expect(res.totalScore).toBeLessThan(40);
    expect(res.isPassed).toBe(false);
    expect(res.mandatoryChecks.nvrReachable).toBe(false);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(false);
  });

  it('Unit 07: Evaluates 3-step Troubleshooting for CAM-03 NO VIDEO & Hum Bars', () => {
    const res = evaluateUnit7Submission({
      faultDeviceId: 'CAM-03',
      step1PoEVoltageChecked: true,
      step1PoEVoltageValue: 42.5,
      step2GroundLoopIsolatorInstalled: true,
      step3LensCleaned: true,
      step3PmChecklistSigned: true,
      resolvedFaults: ['NO_VIDEO', 'HUM_BARS'],
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
  });

  it('Unit 07: Evaluates Room 107 3-Station Structured Payload for 100/100', () => {
    const res = evaluateUnit7Submission({
      roomId: 'room-107',
      unitNumber: 7,
      station1: {
        faultDeviceId: 'CAM-03',
        diagnosticSteps: [
          { id: 'POWER', status: 'FAULT_FOUND' },
          { id: 'PHYSICAL', status: 'VERIFIED' },
          { id: 'SIGNAL', status: 'FAULT_FOUND' },
          { id: 'NETWORK', status: 'VERIFIED' },
          { id: 'DEVICE', status: 'VERIFIED' },
        ],
        measuredPoEVoltage: 42.5,
        nominalPoEVoltage: 48.0,
        cableDistanceMeters: 110,
        voltageDropDetected: true,
        selectedPowerAction: 'UPGRADE_EXTENDER',
        powerActionApplied: true,
        retestPoEVoltage: 50.2,
        noVideoResolved: true,
      },
      station2: {
        symptomIdentified: 'ROLLING_HUM_BARS',
        rootCause: 'GROUND_LOOP_POTENTIAL_DIFF',
        groundPotentialDiffVolts: 2.4,
        isolatorInstalled: true,
        installationPosition: 'CAMERA_END',
        waveformAnalyzed: true,
        retestVideoClean: true,
        humBarsResolved: true,
      },
      station3: {
        lensInspection: {
          cleanDone: true,
          moistureChecked: true,
          focusCalibrated: true,
          waterproofGasketInspected: true,
        },
        pmChecklist: {
          powerMeasured: true,
          connectorSealed: true,
          cameraCleaned: true,
          nvrFirmwareChecked: true,
          recordingLogVerified: true,
        },
        faultLog: {
          problemDescription: 'CAM-03 NO VIDEO & Hum Bars',
          possibleCause: 'Voltage drop & ground loop',
          testPerformed: 'Multimeter & CCTV tester',
          solutionApplied: 'PoE extender & Isolator',
          retestPassed: true,
          preventiveAction: 'Use pure copper Cat6',
        },
        pmChecklistSigned: true,
        technicianName: 'ช่างทดสอบ',
      },
    });

    expect(res.totalScore).toBe(100);
    expect(res.isPassed).toBe(true);
    expect(res.resultDetails.station1Score).toBe(40);
    expect(res.resultDetails.station2Score).toBe(20);
    expect(res.resultDetails.station3Score).toBe(40);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
  });

  it('Unit 07: Penalizes uncorrected voltage, missing isolator, and unsigned PM checklist', () => {
    const res = evaluateUnit7Submission({
      roomId: 'room-107',
      station1: {
        measuredPoEVoltage: 42.5,
        voltageDropDetected: true,
        selectedPowerAction: 'REPLACE_CAMERA', // ineffective fix
        powerActionApplied: true,
        retestPoEVoltage: 42.5,
        noVideoResolved: false,
      },
      station2: {
        symptomIdentified: 'ROLLING_HUM_BARS',
        isolatorInstalled: false, // missing isolator
        humBarsResolved: false,
      },
      station3: {
        lensInspection: {
          cleanDone: false,
          moistureChecked: false,
          focusCalibrated: false,
          waterproofGasketInspected: false,
        },
        pmChecklist: {
          powerMeasured: false,
          connectorSealed: false,
          cameraCleaned: false,
          nvrFirmwareChecked: false,
          recordingLogVerified: false,
        },
        pmChecklistSigned: false, // unsigned
      },
    });

    expect(res.totalScore).toBeLessThan(70);
    expect(res.isPassed).toBe(false);
    expect(res.mandatoryChecks.cameraOnline).toBe(false);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(false);
  });

  it('Unit 08: Evaluates Capstone Project BOM and Handover with 85/100 score', () => {
    const res = evaluateUnit8Submission({
      bomApproved: true,
      bomItems: [
        { item: 'IP Cameras', quantity: 8, status: 'VERIFIED' },
        { item: 'PoE Switch', quantity: 1, status: 'VERIFIED' },
        { item: 'NVR 4K', quantity: 1, status: 'VERIFIED' },
        { item: 'HDD 8TB', quantity: 1, status: 'VERIFIED' },
        { item: 'UPS 1000VA', quantity: 1, status: 'VERIFIED' },
      ],
      commissioningChecks: {
        cameraOnline: true,
        nvrReachable: true,
        liveViewActive: true,
        recordingActive: true,
        remoteAccessOnline: true,
      },
      handoverCertificateSigned: true,
    });

    expect(res.totalScore).toBe(85);
    expect(res.isPassed).toBe(true);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.nvrReachable).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
  });

  it('Unit 08: Evaluates Room 108 3-Station Structured Payload for 85/85 Capstone Score', () => {
    const res = evaluateUnit8Submission({
      roomId: 'room-108',
      unitNumber: 8,
      station1: {
        customerRequirementBrief: 'ระบบ CCTV 8 กล้อง บันทึก 30 วัน PoE Switch + UPS',
        floorPlanCoverageChecked: true,
        floorPlanZones: [
          { zoneId: 'Z1', isBlindSpotFree: true },
          { zoneId: 'Z2', isBlindSpotFree: true },
          { zoneId: 'Z3', isBlindSpotFree: true },
          { zoneId: 'Z4', isBlindSpotFree: true },
          { zoneId: 'Z5', isBlindSpotFree: true },
          { zoneId: 'Z6', isBlindSpotFree: true },
          { zoneId: 'Z7', isBlindSpotFree: true },
          { zoneId: 'Z8', isBlindSpotFree: true },
        ],
        bomApproved: true,
        bomItems: [
          { item: 'IP Cameras', quantity: 8, status: 'VERIFIED' },
          { item: 'PoE Switch', quantity: 1, status: 'VERIFIED' },
          { item: '4K Surveillance NVR', quantity: 1, status: 'VERIFIED' },
          { item: 'Surveillance HDD 8TB', quantity: 1, status: 'VERIFIED' },
          { item: 'UPS 1000VA', quantity: 1, status: 'VERIFIED' },
          { item: 'Cat6 Cable 305m', quantity: 1, status: 'VERIFIED' },
          { item: 'Wall Rack 6U', quantity: 1, status: 'VERIFIED' },
        ],
      },
      station2: {
        cameraCountOnline: 8,
        nvrReachable: true,
        liveView8ChannelsActive: true,
        recordingActive24_7: true,
        upsFailoverTested: true,
        cyberHardening: {
          defaultPasswordChanged: true,
          rtspPortChanged: true,
          telnetEnabled: false,
        },
      },
      station3: {
        documentationPackage: { asBuiltDiagramDelivered: true },
        userTrainingCompleted: true,
        punchListDefectsCount: 0,
        punchListDefectsResolved: true,
        handoverCertificateSigned: true,
        customerSigneeName: 'คุณสมชาย สมาร์ทมาร์ท',
      },
    });

    expect(res.totalScore).toBe(85);
    expect(res.isPassed).toBe(true);
    expect(res.resultDetails.station1Score).toBe(20);
    expect(res.resultDetails.station2Score).toBe(40);
    expect(res.resultDetails.station3Score).toBe(25);
    expect(res.mandatoryChecks.cameraOnline).toBe(true);
    expect(res.mandatoryChecks.nvrReachable).toBe(true);
    expect(res.mandatoryChecks.clientLiveViewActive).toBe(true);
  });

  it('Unit 08: Penalizes unapproved BOM, offline cameras and unsigned handover', () => {
    const res = evaluateUnit8Submission({
      roomId: 'room-108',
      station1: {
        customerRequirementBrief: 'สั้น',
        floorPlanCoverageChecked: false,
        floorPlanZones: [],
        bomApproved: false,
        bomItems: [],
      },
      station2: {
        cameraCountOnline: 2,
        nvrReachable: false,
        liveView8ChannelsActive: false,
        recordingActive24_7: false,
        upsFailoverTested: false,
      },
      station3: {
        handoverCertificateSigned: false,
        punchListDefectsCount: 5,
        customerSigneeName: '',
      },
    });

    expect(res.totalScore).toBeLessThan(70);
    expect(res.isPassed).toBe(false);
    expect(res.mandatoryChecks.cameraOnline).toBe(false);
    expect(res.mandatoryChecks.nvrReachable).toBe(false);
  });

  it('evaluateRoomSubmission correctly routes room-102 through room-108', () => {
    const res102 = evaluateRoomSubmission('room-102', {
      zoneA: 'dome',
      zoneB: 'bullet',
      zoneC: 'ptz',
      lensFocal: '2.8mm',
      privacyMask: true,
      coverageTested: true,
      coveragePercent: 94,
    });
    expect(res102.isPassed).toBe(true);

    const res108 = evaluateRoomSubmission('room-108', {
      bomApproved: true,
      bomItems: [
        { item: 'IP Cameras', quantity: 8, status: 'VERIFIED' },
        { item: 'PoE Switch', quantity: 1, status: 'VERIFIED' },
        { item: 'NVR 4K', quantity: 1, status: 'VERIFIED' },
        { item: 'HDD 8TB', quantity: 1, status: 'VERIFIED' },
        { item: 'UPS 1000VA', quantity: 1, status: 'VERIFIED' },
      ],
      commissioningChecks: {
        cameraOnline: true,
        nvrReachable: true,
        liveViewActive: true,
        recordingActive: true,
        remoteAccessOnline: true,
      },
      handoverCertificateSigned: true,
    });
    expect(res108.totalScore).toBe(85);
    expect(res108.isPassed).toBe(true);
  });
});
