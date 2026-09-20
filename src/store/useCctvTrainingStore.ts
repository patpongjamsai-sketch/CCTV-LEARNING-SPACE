import { create } from 'zustand';
import { T568B_STANDARD } from '../shared/domain/workstationTypes';
import {
  Station1StorageCalculationPayload,
  Station2HddManagementPayload,
  Station3RemoteAccessPayload,
} from '../shared/domain/room106Types';
import {
  Station1DiagnosticPayload,
  Station2SignalQualityPayload,
  Station3MaintenancePayload,
} from '../shared/domain/room107Types';
import {
  Station1ProjectPlanningPayload,
  Station2CommissioningPayload,
  Station3HandoverPayload,
} from '../shared/domain/room108Types';

export type CctvToolId =
  | 'TOOL_NONE'
  | 'TOOL_CRIMPER'
  | 'TOOL_WATERPROOF_GLAND'
  | 'TOOL_MULTIMETER'
  | 'TOOL_GROUND_ISOLATOR'
  | 'TOOL_CLEANING_CLOTH'
  | 'TOOL_HDD_8TB'
  | 'TOOL_SMARTPHONE';

export interface CctvTrainingStoreState {
  activeRoomId: string;
  activeTool: CctvToolId;
  setActiveTool: (tool: CctvToolId) => void;
  setActiveRoomId: (roomId: string) => void;

  // ==========================================
  // Room 101 State & Actions (Smart Mart Simulation Modals)
  // ==========================================
  activeStation101Modal: 1 | 2 | 3 | 4 | 5 | null;
  setActiveStation101Modal: (station: 1 | 2 | 3 | 4 | 5 | null) => void;

  // ==========================================
  // Room 102 State & Actions (Smart School Simulation)
  // ==========================================
  activeStation102Modal: 1 | 2 | 3 | null;
  setActiveStation102Modal: (station: 1 | 2 | 3 | null) => void;
  smartSchool102: {
    station1OutdoorCompleted: boolean;
    station1Score: number;
    station2IndoorCompleted: boolean;
    station2Score: number;
    station3WrittenCompleted: boolean;
    station3Score: number;
    station3Answers: {
      case1Answer: string;
      case2Answer: string;
      keywordsFound: string[];
    };
  };
  setSmartSchool102Station1: (score: number) => void;
  setSmartSchool102Station2: (score: number) => void;
  setSmartSchool102Station3: (data: { case1Answer: string; case2Answer: string; score: number; keywordsFound: string[] }) => void;
  room102: {
    zoneA: 'dome' | 'bullet' | 'ptz';
    zoneB: 'dome' | 'bullet' | 'ptz';
    zoneC: 'dome' | 'bullet' | 'ptz';
    lensFocal: '2.8mm' | '4mm' | '6mm' | '12mm';
    privacyMask: boolean;
    coverageTested: boolean;
    coveragePercent: number;
    smartSchoolScore?: number;
  };
  setR102ZoneCamera: (zone: 'zoneA' | 'zoneB' | 'zoneC', type: 'dome' | 'bullet' | 'ptz') => void;
  setR102Lens: (focal: '2.8mm' | '4mm' | '6mm' | '12mm') => void;
  toggleR102PrivacyMask: () => void;
  testR102Coverage: () => void;

  // ==========================================
  // Room 103 State & Actions
  // ==========================================
  activeStation103Modal: 1 | 2 | 3 | null;
  setActiveStation103Modal: (station: 1 | 2 | 3 | null) => void;
  smartCabling103: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
  };
  setSmartCabling103Station1: (score: number) => void;
  setSmartCabling103Station2: (score: number) => void;
  setSmartCabling103Station3: (score: number) => void;
  room103: {
    wireSequence: string[];
    crimped: boolean;
    waterproofGlandMounted: boolean;
    continuityTested: boolean;
    ledStatus: boolean[];
    isPass: boolean;
  };
  swapR103Wire: (fromIdx: number, toIdx: number) => void;
  setR103WireSequence: (seq: string[]) => void;
  crimpR103Rj45: () => void;
  mountR103Gland: () => void;
  testR103Continuity: () => void;

  // ==========================================
  // Room 104 State & Actions (Network, IP & Troubleshooting)
  // ==========================================
  activeStation104Modal: 1 | 2 | 3 | null;
  setActiveStation104Modal: (station: 1 | 2 | 3 | null) => void;
  smartNetwork104: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
  };
  setSmartNetwork104Station1: (score: number) => void;
  setSmartNetwork104Station2: (score: number) => void;
  setSmartNetwork104Station3: (score: number) => void;
  room104: {
    ipAddress: string;
    subnetMask: string;
    defaultGateway: string;
    poeBudgetTotalWatts: number;
    poeMaxRatingWatts: number;
    loadBalanced: boolean;
    pingTested: boolean;
    pingResult: {
      rttMs: number;
      packetsSent: number;
      packetsReceived: number;
      packetLossPercent: number;
    };
  };
  setR104NetworkConfig: (ip: string, mask: string, gw: string) => void;
  toggleR104LoadBalance: () => void;
  testR104Ping: () => void;

  // ==========================================
  // Room 105 State & Actions (NVR, ONVIF & Video Compression)
  // ==========================================
  activeStation105Modal: 1 | 2 | 3 | null;
  setActiveStation105Modal: (station: 1 | 2 | 3 | null) => void;
  smartNvr105: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
  };
  setSmartNvr105Station1: (score: number) => void;
  setSmartNvr105Station2: (score: number) => void;
  setSmartNvr105Station3: (score: number) => void;
  room105: {
    onvifDiscovered: boolean;
    discoveredChannels: string[];
    videoCodec: 'H.264' | 'H.265';
    storageSavingRatio: number;
    privacyMaskConfigured: boolean;
  };
  scanR105Onvif: () => void;
  setR105Codec: (codec: 'H.264' | 'H.265') => void;
  toggleR105PrivacyMask: () => void;

  // ==========================================
  // Room 106 State & Actions
  // ==========================================
  activeStation106Modal: 1 | 2 | 3 | null;
  setActiveStation106Modal: (station: 1 | 2 | 3 | null) => void;
  smartStorage106: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
    station1Data?: Station1StorageCalculationPayload;
    station2Data?: Station2HddManagementPayload;
    station3Data?: Station3RemoteAccessPayload;
  };
  setSmartStorage106Station1: (payload: Station1StorageCalculationPayload) => void;
  setSmartStorage106Station2: (payload: Station2HddManagementPayload) => void;
  setSmartStorage106Station3: (payload: Station3RemoteAccessPayload) => void;
  room106: {
    cameraCount: number;
    retentionDays: number;
    calculatedStorageTb: number;
    selectedHddSize: string;
    hddGrade: 'Desktop' | 'Surveillance';
    hddFormatted: boolean;
    cloudP2pEnabled: boolean;
    cloudP2pStatus: 'OFFLINE' | 'ONLINE';
    mobileQrScanned: boolean;
  };
  setR106StoragePlan: (cameraCount: number, retentionDays: number) => void;
  setR106StorageCalc: (tb: number) => void;
  selectR106Hdd: (size: string, grade: 'Desktop' | 'Surveillance') => void;
  formatR106Hdd: () => void;
  toggleR106CloudP2p: () => void;
  scanR106Qr: () => void;

  // ==========================================
  // Room 107 State & Actions
  // ==========================================
  activeStation107Modal: 1 | 2 | 3 | null;
  setActiveStation107Modal: (station: 1 | 2 | 3 | null) => void;
  smartTroubleshooting107: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
    station1Data?: Station1DiagnosticPayload;
    station2Data?: Station2SignalQualityPayload;
    station3Data?: Station3MaintenancePayload;
  };
  setSmartTroubleshooting107Station1: (payload: Station1DiagnosticPayload) => void;
  setSmartTroubleshooting107Station2: (payload: Station2SignalQualityPayload) => void;
  setSmartTroubleshooting107Station3: (payload: Station3MaintenancePayload) => void;
  room107: {
    faultDeviceId: string;
    step1PoEVoltageChecked: boolean;
    step1PoEVoltageValue: number;
    step2GroundLoopIsolatorInstalled: boolean;
    step3LensCleaned: boolean;
    step3PmChecklistSigned: boolean;
    resolvedFaults: string[];
  };
  checkR107PoEVoltage: () => void;
  installR107Isolator: () => void;
  cleanR107Lens: () => void;
  signR107PmChecklist: () => void;

  // ==========================================
  // Room 108 State & Actions (Integrated Capstone Project)
  // ==========================================
  activeStation108Modal: 1 | 2 | 3 | null;
  setActiveStation108Modal: (station: 1 | 2 | 3 | null) => void;
  smartCapstone108: {
    station1Completed: boolean;
    station1Score: number;
    station2Completed: boolean;
    station2Score: number;
    station3Completed: boolean;
    station3Score: number;
    station1Data?: Station1ProjectPlanningPayload;
    station2Data?: Station2CommissioningPayload;
    station3Data?: Station3HandoverPayload;
  };
  setSmartCapstone108Station1: (payload: Station1ProjectPlanningPayload) => void;
  setSmartCapstone108Station2: (payload: Station2CommissioningPayload) => void;
  setSmartCapstone108Station3: (payload: Station3HandoverPayload) => void;
  room108: {
    bomApproved: boolean;
    bomItems: Array<{ item: string; quantity: number; status: 'VERIFIED' | 'MISSING' }>;
    commissioningChecks: {
      cameraOnline: boolean;
      nvrReachable: boolean;
      liveViewActive: boolean;
      recordingActive: boolean;
      remoteAccessOnline: boolean;
    };
    handoverCertificateSigned: boolean;
  };
  approveR108Bom: () => void;
  verifyR108Commissioning: (key: 'cameraOnline' | 'nvrReachable' | 'liveViewActive' | 'recordingActive' | 'remoteAccessOnline') => void;
  signR108Handover: () => void;

  // Global Submission Builder
  buildRoomSubmission: (roomId: string) => Record<string, unknown>;
}

export const useCctvTrainingStore = create<CctvTrainingStoreState>((set, get) => ({
  activeRoomId: 'room-101',
  activeTool: 'TOOL_NONE',
  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),

  // Room 101 (Smart Mart Simulation Modals)
  activeStation101Modal: null,
  setActiveStation101Modal: (station) => set({ activeStation101Modal: station }),

  // Room 102 (Smart School Simulation)
  activeStation102Modal: null,
  setActiveStation102Modal: (station) => set({ activeStation102Modal: station }),
  smartSchool102: {
    station1OutdoorCompleted: false,
    station1Score: 0,
    station2IndoorCompleted: false,
    station2Score: 0,
    station3WrittenCompleted: false,
    station3Score: 0,
    station3Answers: {
      case1Answer: '',
      case2Answer: '',
      keywordsFound: [],
    },
  },
  setSmartSchool102Station1: (score) =>
    set((s) => ({
      smartSchool102: {
        ...s.smartSchool102,
        station1OutdoorCompleted: true,
        station1Score: score,
      },
    })),
  setSmartSchool102Station2: (score) =>
    set((s) => ({
      smartSchool102: {
        ...s.smartSchool102,
        station2IndoorCompleted: true,
        station2Score: score,
      },
    })),
  setSmartSchool102Station3: (data) =>
    set((s) => ({
      smartSchool102: {
        ...s.smartSchool102,
        station3WrittenCompleted: true,
        station3Score: data.score,
        station3Answers: {
          case1Answer: data.case1Answer,
          case2Answer: data.case2Answer,
          keywordsFound: data.keywordsFound,
        },
      },
    })),
  room102: {
    zoneA: 'dome',
    zoneB: 'bullet',
    zoneC: 'ptz',
    lensFocal: '2.8mm',
    privacyMask: true,
    coverageTested: false,
    coveragePercent: 94,
    smartSchoolScore: 0,
  },
  setR102ZoneCamera: (zone, type) =>
    set((s) => ({ room102: { ...s.room102, [zone]: type } })),
  setR102Lens: (lensFocal) =>
    set((s) => ({
      room102: {
        ...s.room102,
        lensFocal,
        coveragePercent: lensFocal === '2.8mm' ? 94 : lensFocal === '4mm' ? 82 : 65,
      },
    })),
  toggleR102PrivacyMask: () =>
    set((s) => ({ room102: { ...s.room102, privacyMask: !s.room102.privacyMask } })),
  testR102Coverage: () =>
    set((s) => ({ room102: { ...s.room102, coverageTested: true } })),

  // Room 103 (3-Station Cabling Simulation)
  activeStation103Modal: null,
  setActiveStation103Modal: (station) => set({ activeStation103Modal: station }),
  smartCabling103: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartCabling103Station1: (score) =>
    set((s) => ({
      smartCabling103: {
        ...s.smartCabling103,
        station1Completed: true,
        station1Score: score,
      },
    })),
  setSmartCabling103Station2: (score) =>
    set((s) => ({
      smartCabling103: {
        ...s.smartCabling103,
        station2Completed: true,
        station2Score: score,
      },
    })),
  setSmartCabling103Station3: (score) =>
    set((s) => ({
      smartCabling103: {
        ...s.smartCabling103,
        station3Completed: true,
        station3Score: score,
      },
    })),

  // Room 103
  room103: {
    wireSequence: [
      'Orange',
      'White-Orange',
      'Blue',
      'White-Green',
      'White-Blue',
      'Green',
      'White-Brown',
      'Brown',
    ],
    crimped: false,
    waterproofGlandMounted: false,
    continuityTested: false,
    ledStatus: [false, false, false, false, false, false, false, false],
    isPass: false,
  },
  swapR103Wire: (fromIdx, toIdx) =>
    set((s) => {
      const arr = [...s.room103.wireSequence];
      const temp = arr[fromIdx]!;
      arr[fromIdx] = arr[toIdx]!;
      arr[toIdx] = temp;
      return { room103: { ...s.room103, wireSequence: arr, continuityTested: false } };
    }),
  setR103WireSequence: (seq) =>
    set((s) => ({ room103: { ...s.room103, wireSequence: seq, continuityTested: false } })),
  crimpR103Rj45: () =>
    set((s) => ({ room103: { ...s.room103, crimped: true } })),
  mountR103Gland: () =>
    set((s) => ({ room103: { ...s.room103, waterproofGlandMounted: true } })),
  testR103Continuity: () =>
    set((s) => {
      const isMatch = s.room103.wireSequence.every((col, i) => col === T568B_STANDARD[i]);
      return {
        room103: {
          ...s.room103,
          continuityTested: true,
          ledStatus: isMatch ? [true, true, true, true, true, true, true, true] : [true, false, true, false, true, true, false, false],
          isPass: isMatch && s.room103.crimped,
        },
      };
    }),

  // Room 104 (3-Station Networking Simulation)
  activeStation104Modal: null,
  setActiveStation104Modal: (station) => set({ activeStation104Modal: station }),
  smartNetwork104: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartNetwork104Station1: (score) =>
    set((s) => ({
      smartNetwork104: {
        ...s.smartNetwork104,
        station1Completed: true,
        station1Score: score,
      },
    })),
  setSmartNetwork104Station2: (score) =>
    set((s) => ({
      smartNetwork104: {
        ...s.smartNetwork104,
        station2Completed: true,
        station2Score: score,
      },
    })),
  setSmartNetwork104Station3: (score) =>
    set((s) => ({
      smartNetwork104: {
        ...s.smartNetwork104,
        station3Completed: true,
        station3Score: score,
      },
    })),

  // Room 104 Legacy Workbench State
  room104: {
    ipAddress: '192.168.1.100',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.1',
    poeBudgetTotalWatts: 48,
    poeMaxRatingWatts: 65,
    loadBalanced: false,
    pingTested: false,
    pingResult: {
      rttMs: 1.2,
      packetsSent: 4,
      packetsReceived: 4,
      packetLossPercent: 0,
    },
  },
  setR104NetworkConfig: (ipAddress, subnetMask, defaultGateway) =>
    set((s) => ({ room104: { ...s.room104, ipAddress, subnetMask, defaultGateway } })),
  toggleR104LoadBalance: () =>
    set((s) => {
      const nextBal = !s.room104.loadBalanced;
      return {
        room104: {
          ...s.room104,
          loadBalanced: nextBal,
          poeBudgetTotalWatts: nextBal ? 45 : 56,
        },
      };
    }),
  testR104Ping: () =>
    set((s) => ({
      room104: {
        ...s.room104,
        pingTested: true,
        pingResult: {
          rttMs: 1.2,
          packetsSent: 4,
          packetsReceived: 4,
          packetLossPercent: 0,
        },
      },
    })),

  // Room 105 (3-Station NVR/ONVIF Simulation)
  activeStation105Modal: null,
  setActiveStation105Modal: (station) => set({ activeStation105Modal: station }),
  smartNvr105: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartNvr105Station1: (score) =>
    set((s) => ({
      smartNvr105: {
        ...s.smartNvr105,
        station1Completed: true,
        station1Score: Math.max(s.smartNvr105.station1Score, score),
      },
    })),
  setSmartNvr105Station2: (score) =>
    set((s) => ({
      smartNvr105: {
        ...s.smartNvr105,
        station2Completed: true,
        station2Score: Math.max(s.smartNvr105.station2Score, score),
      },
    })),
  setSmartNvr105Station3: (score) =>
    set((s) => ({
      smartNvr105: {
        ...s.smartNvr105,
        station3Completed: true,
        station3Score: Math.max(s.smartNvr105.station3Score, score),
      },
    })),
  // Room 105 Legacy State
  room105: {
    onvifDiscovered: false,
    discoveredChannels: [],
    videoCodec: 'H.265',
    storageSavingRatio: 0.5,
    privacyMaskConfigured: false,
  },
  scanR105Onvif: () =>
    set((s) => ({
      room105: {
        ...s.room105,
        onvifDiscovered: true,
        discoveredChannels: ['CH1_DOME', 'CH2_BULLET'],
      },
    })),
  setR105Codec: (videoCodec) =>
    set((s) => ({
      room105: {
        ...s.room105,
        videoCodec,
        storageSavingRatio: videoCodec === 'H.265' ? 0.5 : 0,
      },
    })),
  toggleR105PrivacyMask: () =>
    set((s) => ({
      room105: {
        ...s.room105,
        privacyMaskConfigured: !s.room105.privacyMaskConfigured,
      },
    })),

  // Room 106
  activeStation106Modal: null,
  setActiveStation106Modal: (station) => set({ activeStation106Modal: station }),
  smartStorage106: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartStorage106Station1: (payload) =>
    set((s) => ({
      smartStorage106: {
        ...s.smartStorage106,
        station1Completed: true,
        station1Score: Math.max(s.smartStorage106.station1Score, payload.score),
        station1Data: payload,
      },
      room106: {
        ...s.room106,
        cameraCount: payload.cameraCount,
        retentionDays: payload.retentionDays,
        calculatedStorageTb: payload.calculatedTotalTb,
      },
    })),
  setSmartStorage106Station2: (payload) =>
    set((s) => ({
      smartStorage106: {
        ...s.smartStorage106,
        station2Completed: true,
        station2Score: Math.max(s.smartStorage106.station2Score, payload.score),
        station2Data: payload,
      },
      room106: {
        ...s.room106,
        selectedHddSize: payload.selectedHddCapacity,
        hddGrade: payload.hddGrade,
        hddFormatted: payload.hddFormatted,
      },
    })),
  setSmartStorage106Station3: (payload) =>
    set((s) => ({
      smartStorage106: {
        ...s.smartStorage106,
        station3Completed: true,
        station3Score: Math.max(s.smartStorage106.station3Score, payload.score),
        station3Data: payload,
      },
      room106: {
        ...s.room106,
        cloudP2pEnabled: payload.cloudP2pEnabled,
        cloudP2pStatus: payload.cloudP2pStatus,
        mobileQrScanned: payload.mobileQrScanned,
      },
    })),
  room106: {
    cameraCount: 8,
    retentionDays: 30,
    calculatedStorageTb: 7.8,
    selectedHddSize: '8TB',
    hddGrade: 'Surveillance',
    hddFormatted: false,
    cloudP2pEnabled: false,
    cloudP2pStatus: 'OFFLINE',
    mobileQrScanned: false,
  },
  setR106StoragePlan: (cameraCount, retentionDays) =>
    set((s) => ({ room106: { ...s.room106, cameraCount, retentionDays } })),
  setR106StorageCalc: (calculatedStorageTb) =>
    set((s) => ({ room106: { ...s.room106, calculatedStorageTb } })),
  selectR106Hdd: (selectedHddSize, hddGrade) =>
    set((s) => ({ room106: { ...s.room106, selectedHddSize, hddGrade } })),
  formatR106Hdd: () =>
    set((s) => ({ room106: { ...s.room106, hddFormatted: true } })),
  toggleR106CloudP2p: () =>
    set((s) => {
      const nextEnabled = !s.room106.cloudP2pEnabled;
      return {
        room106: {
          ...s.room106,
          cloudP2pEnabled: nextEnabled,
          cloudP2pStatus: nextEnabled ? 'ONLINE' : 'OFFLINE',
        },
      };
    }),
  scanR106Qr: () =>
    set((s) => ({ room106: { ...s.room106, mobileQrScanned: true } })),

  // Room 107 (Troubleshooting & Systematic Maintenance)
  activeStation107Modal: null,
  setActiveStation107Modal: (station) => set({ activeStation107Modal: station }),
  smartTroubleshooting107: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartTroubleshooting107Station1: (payload) =>
    set((s) => ({
      smartTroubleshooting107: {
        ...s.smartTroubleshooting107,
        station1Completed: payload.isCompleted,
        station1Score: Math.max(s.smartTroubleshooting107.station1Score, payload.score),
        station1Data: payload,
      },
      room107: {
        ...s.room107,
        step1PoEVoltageChecked: payload.isCompleted || payload.noVideoResolved,
        step1PoEVoltageValue: payload.measuredPoEVoltage,
        resolvedFaults: payload.noVideoResolved
          ? Array.from(new Set([...s.room107.resolvedFaults, 'NO_VIDEO']))
          : s.room107.resolvedFaults,
      },
    })),
  setSmartTroubleshooting107Station2: (payload) =>
    set((s) => ({
      smartTroubleshooting107: {
        ...s.smartTroubleshooting107,
        station2Completed: payload.isCompleted,
        station2Score: Math.max(s.smartTroubleshooting107.station2Score, payload.score),
        station2Data: payload,
      },
      room107: {
        ...s.room107,
        step2GroundLoopIsolatorInstalled: payload.isolatorInstalled,
        resolvedFaults: payload.humBarsResolved
          ? Array.from(new Set([...s.room107.resolvedFaults, 'HUM_BARS']))
          : s.room107.resolvedFaults,
      },
    })),
  setSmartTroubleshooting107Station3: (payload) =>
    set((s) => ({
      smartTroubleshooting107: {
        ...s.smartTroubleshooting107,
        station3Completed: payload.isCompleted,
        station3Score: Math.max(s.smartTroubleshooting107.station3Score, payload.score),
        station3Data: payload,
      },
      room107: {
        ...s.room107,
        step3LensCleaned: payload.lensInspection.cleanDone,
        step3PmChecklistSigned: payload.pmChecklistSigned,
      },
    })),
  room107: {
    faultDeviceId: 'CAM-03',
    step1PoEVoltageChecked: false,
    step1PoEVoltageValue: 42.5,
    step2GroundLoopIsolatorInstalled: false,
    step3LensCleaned: false,
    step3PmChecklistSigned: false,
    resolvedFaults: [],
  },
  checkR107PoEVoltage: () =>
    set((s) => ({
      room107: {
        ...s.room107,
        step1PoEVoltageChecked: true,
        resolvedFaults: Array.from(new Set([...s.room107.resolvedFaults, 'NO_VIDEO'])),
      },
    })),
  installR107Isolator: () =>
    set((s) => ({
      room107: {
        ...s.room107,
        step2GroundLoopIsolatorInstalled: true,
        resolvedFaults: Array.from(new Set([...s.room107.resolvedFaults, 'HUM_BARS'])),
      },
    })),
  cleanR107Lens: () =>
    set((s) => ({ room107: { ...s.room107, step3LensCleaned: true } })),
  signR107PmChecklist: () =>
    set((s) => ({ room107: { ...s.room107, step3PmChecklistSigned: true } })),

  // Room 108 (Integrated Capstone Project)
  activeStation108Modal: null,
  setActiveStation108Modal: (station) => set({ activeStation108Modal: station }),
  smartCapstone108: {
    station1Completed: false,
    station1Score: 0,
    station2Completed: false,
    station2Score: 0,
    station3Completed: false,
    station3Score: 0,
  },
  setSmartCapstone108Station1: (payload) =>
    set((s) => ({
      smartCapstone108: {
        ...s.smartCapstone108,
        station1Completed: true,
        station1Score: Math.max(s.smartCapstone108.station1Score, payload.score),
        station1Data: payload,
      },
      room108: {
        ...s.room108,
        bomApproved: payload.bomApproved,
        bomItems: payload.bomItems.map((b) => ({
          item: b.item,
          quantity: b.quantity,
          status: b.status,
        })),
      },
    })),
  setSmartCapstone108Station2: (payload) =>
    set((s) => ({
      smartCapstone108: {
        ...s.smartCapstone108,
        station2Completed: true,
        station2Score: Math.max(s.smartCapstone108.station2Score, payload.score),
        station2Data: payload,
      },
      room108: {
        ...s.room108,
        commissioningChecks: {
          cameraOnline: payload.cameraOnline,
          nvrReachable: payload.nvrReachable,
          liveViewActive: payload.liveViewActive,
          recordingActive: payload.recordingActive,
          remoteAccessOnline: payload.remoteAccessOnline,
        },
      },
    })),
  setSmartCapstone108Station3: (payload) =>
    set((s) => ({
      smartCapstone108: {
        ...s.smartCapstone108,
        station3Completed: true,
        station3Score: Math.max(s.smartCapstone108.station3Score, payload.score),
        station3Data: payload,
      },
      room108: {
        ...s.room108,
        handoverCertificateSigned: payload.handoverCertificateSigned,
      },
    })),
  room108: {
    bomApproved: false,
    bomItems: [
      { item: 'IP Cameras (Dome/Bullet/PTZ)', quantity: 8, status: 'VERIFIED' },
      { item: 'PoE Switch 8-Port (65W+)', quantity: 1, status: 'VERIFIED' },
      { item: '4K Surveillance NVR', quantity: 1, status: 'VERIFIED' },
      { item: 'Surveillance HDD 8TB', quantity: 1, status: 'VERIFIED' },
      { item: 'UPS 1000VA / 600W', quantity: 1, status: 'VERIFIED' },
    ],
    commissioningChecks: {
      cameraOnline: false,
      nvrReachable: false,
      liveViewActive: false,
      recordingActive: false,
      remoteAccessOnline: false,
    },
    handoverCertificateSigned: false,
  },
  approveR108Bom: () =>
    set((s) => ({ room108: { ...s.room108, bomApproved: true } })),
  verifyR108Commissioning: (key) =>
    set((s) => ({
      room108: {
        ...s.room108,
        commissioningChecks: {
          ...s.room108.commissioningChecks,
          [key]: true,
        },
      },
    })),
  signR108Handover: () =>
    set((s) => ({
      room108: {
        ...s.room108,
        handoverCertificateSigned: true,
        commissioningChecks: {
          cameraOnline: true,
          nvrReachable: true,
          liveViewActive: true,
          recordingActive: true,
          remoteAccessOnline: true,
        },
      },
    })),

  // Global Submission Builder
  buildRoomSubmission: (roomId: string) => {
    const s = get();
    const cleanId = roomId.toLowerCase();
    const numMatch = cleanId.match(/(?:room-?|u0?)(\d+)/i);
    let num = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : 101;
    if (num < 10) num += 100;

    switch (num) {
      case 102:
        return {
          ...s.room102,
          smartSchool: s.smartSchool102,
        };
      case 103:
        return s.room103;
      case 104:
        return {
          ...s.room104,
          smartNetwork: s.smartNetwork104,
        };
      case 105:
        return {
          ...s.room105,
          smartNvr: s.smartNvr105,
        };
      case 106:
        return {
          ...s.room106,
          roomId: 'room-106',
          unitNumber: 6,
          smartStorage: s.smartStorage106,
          station1: s.smartStorage106.station1Data,
          station2: s.smartStorage106.station2Data,
          station3: s.smartStorage106.station3Data,
          totalScore:
            s.smartStorage106.station1Score +
            s.smartStorage106.station2Score +
            s.smartStorage106.station3Score,
        };
      case 107:
        return {
          ...s.room107,
          roomId: 'room-107',
          unitNumber: 7,
          theme: 'Troubleshooting, Fault Isolation & Preventive Maintenance',
          smartTroubleshooting: s.smartTroubleshooting107,
          station1: s.smartTroubleshooting107.station1Data,
          station2: s.smartTroubleshooting107.station2Data,
          station3: s.smartTroubleshooting107.station3Data,
          totalScore:
            s.smartTroubleshooting107.station1Score +
            s.smartTroubleshooting107.station2Score +
            s.smartTroubleshooting107.station3Score,
        };
      case 108:
        return {
          ...s.room108,
          roomId: 'room-108',
          unitNumber: 8,
          theme: 'Integrated CCTV Capstone, Commissioning & Handover',
          smartCapstone: s.smartCapstone108,
          station1: s.smartCapstone108.station1Data,
          station2: s.smartCapstone108.station2Data,
          station3: s.smartCapstone108.station3Data,
          totalScore:
            s.smartCapstone108.station1Score +
            s.smartCapstone108.station2Score +
            s.smartCapstone108.station3Score,
        };
      default:
        return {};
    }
  },
}));
