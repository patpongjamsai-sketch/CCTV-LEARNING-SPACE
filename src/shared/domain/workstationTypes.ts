import { z } from 'zod';

// ==========================================
// Unit 02: Room 102 Camera Selection & FOV
// ==========================================
export const unit2SubmissionSchema = z.object({
  zoneA: z.enum(['dome', 'bullet', 'ptz']).default('dome'),
  zoneB: z.enum(['dome', 'bullet', 'ptz']).default('bullet'),
  zoneC: z.enum(['dome', 'bullet', 'ptz']).default('ptz'),
  lensFocal: z.enum(['2.8mm', '4mm', '6mm', '12mm']).default('2.8mm'),
  privacyMask: z.boolean().default(true),
  coverageTested: z.boolean().default(true),
  coveragePercent: z.number().min(0).max(100).default(94),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit2Submission = z.input<typeof unit2SubmissionSchema>;

// ==========================================
// Unit 03: Room 103 Cabling & Termination
// ==========================================
export const T568B_STANDARD = [
  'White-Orange',
  'Orange',
  'White-Green',
  'Blue',
  'White-Blue',
  'Green',
  'White-Brown',
  'Brown',
] as const;

export const unit3SubmissionSchema = z.object({
  wireSequence: z.array(z.string()).length(8),
  crimped: z.boolean().default(true),
  waterproofGlandMounted: z.boolean().default(true),
  continuityTested: z.boolean().default(true),
  ledStatus: z.array(z.boolean()).length(8).default([true, true, true, true, true, true, true, true]),
  isPass: z.boolean().default(true),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit3Submission = z.input<typeof unit3SubmissionSchema>;

// ==========================================
// Unit 04: Room 104 Networking & PoE Budget
// ==========================================
export const unit4SubmissionSchema = z.object({
  ipAddress: z.string().min(7).max(15).default('192.168.1.100'),
  subnetMask: z.string().min(7).max(15).default('255.255.255.0'),
  defaultGateway: z.string().min(7).max(15).default('192.168.1.1'),
  poeBudgetTotalWatts: z.number().min(0).max(150).default(45),
  poeMaxRatingWatts: z.number().default(65),
  loadBalanced: z.boolean().default(true),
  pingTested: z.boolean().default(true),
  pingResult: z.object({
    rttMs: z.number().default(1.2),
    packetsSent: z.number().default(4),
    packetsReceived: z.number().default(4),
    packetLossPercent: z.number().default(0),
  }).default({
    rttMs: 1.2,
    packetsSent: 4,
    packetsReceived: 4,
    packetLossPercent: 0,
  }),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit4Submission = z.input<typeof unit4SubmissionSchema>;

// ==========================================
// Unit 05: Room 105 DVR & NVR Configuration
// ==========================================
export const unit5SubmissionSchema = z.object({
  onvifDiscovered: z.boolean().default(true),
  discoveredChannels: z.array(z.string()).default(['CH1_DOME', 'CH2_BULLET']),
  videoCodec: z.enum(['H.264', 'H.265']).default('H.265'),
  storageSavingRatio: z.number().default(0.5), // 50% savings
  privacyMaskConfigured: z.boolean().default(true),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit5Submission = z.input<typeof unit5SubmissionSchema>;

// ==========================================
// Unit 06: Room 106 Storage & Cloud P2P
// ==========================================
export const unit6SubmissionSchema = z.object({
  cameraCount: z.number().default(8),
  retentionDays: z.number().default(30),
  calculatedStorageTb: z.number().default(7.8),
  selectedHddSize: z.string().default('8TB'),
  hddGrade: z.enum(['Desktop', 'Surveillance']).default('Surveillance'),
  hddFormatted: z.boolean().default(true),
  cloudP2pEnabled: z.boolean().default(true),
  cloudP2pStatus: z.enum(['OFFLINE', 'ONLINE']).default('ONLINE'),
  mobileQrScanned: z.boolean().default(true),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit6Submission = z.input<typeof unit6SubmissionSchema>;

// ==========================================
// Unit 07: Room 107 Troubleshooting
// ==========================================
export const unit7SubmissionSchema = z.object({
  faultDeviceId: z.string().default('CAM-03'),
  step1PoEVoltageChecked: z.boolean().default(true),
  step1PoEVoltageValue: z.number().default(42.5), // voltage drop detected
  step2GroundLoopIsolatorInstalled: z.boolean().default(true),
  step3LensCleaned: z.boolean().default(true),
  step3PmChecklistSigned: z.boolean().default(true),
  resolvedFaults: z.array(z.string()).default(['NO_VIDEO', 'HUM_BARS']),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit7Submission = z.input<typeof unit7SubmissionSchema>;

// ==========================================
// Unit 08: Room 108 Capstone Project
// ==========================================
export const unit8SubmissionSchema = z.object({
  bomApproved: z.boolean().default(true),
  bomItems: z.array(z.object({
    item: z.string(),
    quantity: z.number(),
    status: z.enum(['VERIFIED', 'MISSING']),
  })).default([
    { item: 'IP Cameras (Dome/Bullet/PTZ)', quantity: 8, status: 'VERIFIED' },
    { item: 'PoE Switch 8-Port (65W+)', quantity: 1, status: 'VERIFIED' },
    { item: '4K Surveillance NVR', quantity: 1, status: 'VERIFIED' },
    { item: 'Surveillance HDD 8TB', quantity: 1, status: 'VERIFIED' },
    { item: 'UPS 1000VA / 600W', quantity: 1, status: 'VERIFIED' },
  ]),
  commissioningChecks: z.object({
    cameraOnline: z.boolean().default(true),
    nvrReachable: z.boolean().default(true),
    liveViewActive: z.boolean().default(true),
    recordingActive: z.boolean().default(true),
    remoteAccessOnline: z.boolean().default(true),
  }).default({
    cameraOnline: true,
    nvrReachable: true,
    liveViewActive: true,
    recordingActive: true,
    remoteAccessOnline: true,
  }),
  handoverCertificateSigned: z.boolean().default(true),
  totalHintsUsed: z.number().int().min(0).default(0),
});

export type Unit8Submission = z.input<typeof unit8SubmissionSchema>;

// Common Evaluation Result Structure matching Room 101
export type CommonUnitEvaluation = {
  totalScore: number;
  isPassed: boolean;
  missionScores: Record<string, number>;
  mandatoryChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    clientLiveViewActive: boolean;
  };
  resultDetails: Record<string, unknown>;
};
