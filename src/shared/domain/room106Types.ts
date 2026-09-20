export interface Room106HddItem {
  id: string;
  brand: string;
  model: string;
  capacityTb: number;
  capacityLabel: string;
  grade: 'Desktop' | 'Surveillance';
  workloadRating: string; // e.g. '180 TB/year' vs '55 TB/year'
  rpm: number;
  cacheMb: number;
  is24x7Certified: boolean;
  recommended: boolean;
  description: string;
}

export const ROOM106_HDD_CATALOG: Room106HddItem[] = [
  {
    id: 'HDD-DSK-2TB',
    brand: 'BlueDesk',
    model: 'Standard 2TB Blue',
    capacityTb: 2,
    capacityLabel: '2TB',
    grade: 'Desktop',
    workloadRating: '55 TB/year',
    rpm: 5400,
    cacheMb: 64,
    is24x7Certified: false,
    recommended: false,
    description: 'ฮาร์ดดิสก์เกรดคอมพิวเตอร์สำนักงานทั่วไป ไม่รองรับการเขียนทับตลอด 24 ชม.',
  },
  {
    id: 'HDD-DSK-4TB',
    brand: 'BlueDesk',
    model: 'Standard 4TB Blue',
    capacityTb: 4,
    capacityLabel: '4TB',
    grade: 'Desktop',
    workloadRating: '55 TB/year',
    rpm: 5400,
    cacheMb: 128,
    is24x7Certified: false,
    recommended: false,
    description: 'ฮาร์ดดิสก์ Desktop 4TB ความจุไม่เพียงพอและไม่ใช่เกรด Surveillance',
  },
  {
    id: 'HDD-SURV-4TB',
    brand: 'PurpleSurv',
    model: 'Surveillance Pro 4TB Purple',
    capacityTb: 4,
    capacityLabel: '4TB',
    grade: 'Surveillance',
    workloadRating: '180 TB/year',
    rpm: 5400,
    cacheMb: 256,
    is24x7Certified: true,
    recommended: false,
    description: 'ฮาร์ดดิสก์เกรดกล้องวงจรปิดแท้ รองรับงาน 24/7 แต่ความจุ 4TB ไม่พอต่อระยะเวลา 30 วัน',
  },
  {
    id: 'HDD-DSK-8TB',
    brand: 'BlueDesk',
    model: 'Desktop Power 8TB',
    capacityTb: 8,
    capacityLabel: '8TB',
    grade: 'Desktop',
    workloadRating: '55 TB/year',
    rpm: 7200,
    cacheMb: 256,
    is24x7Certified: false,
    recommended: false,
    description: 'ความจุ 8TB เพียงพอ แต่เป็นเกรด Desktop ร้อนง่ายและมีโอกาสเสียสูงในงานบันทึกต่อเนื่อง',
  },
  {
    id: 'HDD-SURV-8TB',
    brand: 'PurpleSurv',
    model: 'Surveillance Pro 8TB Purple',
    capacityTb: 8,
    capacityLabel: '8TB',
    grade: 'Surveillance',
    workloadRating: '180 TB/year',
    rpm: 5640,
    cacheMb: 256,
    is24x7Certified: true,
    recommended: true,
    description: 'ฮาร์ดดิสก์เกรด CCTV แท้ 8TB รองรับเขียนทับ 24/7 AllFrame Firmware และ RV Sensors (แนะนำ)',
  },
];

// Station 1: Storage Calculation & Retention Planning
export interface Station1StorageCalculationPayload {
  cameraCount: number;
  resolution: string;
  codec: 'H.264' | 'H.265';
  bitrateMbps: number;
  recordingHoursPerDay: number;
  retentionDays: number;
  calculatedDailyGb: number;
  calculatedTotalTb: number;
  recommendedCapacityTb: number;
  capacityReasoning: string;
  score: number;
  isCompleted: boolean;
}

// Station 2: HDD Selection, Installation, Format & S.M.A.R.T.
export interface Station2HddManagementPayload {
  selectedHddId: string;
  selectedHddCapacity: string;
  hddGrade: 'Desktop' | 'Surveillance';
  isSataCableConnected: boolean;
  isSmartCheckPassed: boolean;
  smartStatus: {
    powerOnHours: number;
    badSectors: number;
    temperatureC: number;
    healthPercent: number;
  };
  hddFormatted: boolean;
  hddInitialized: boolean;
  selectedRaidMode: 'NONE' | 'RAID0' | 'RAID1' | 'RAID5';
  score: number;
  isCompleted: boolean;
}

// Station 3: Cloud P2P, QR Pairing & Remote Access Fault
export interface Station3RemoteAccessPayload {
  cloudP2pEnabled: boolean;
  cloudP2pStatus: 'OFFLINE' | 'ONLINE';
  networkDiagnostics: {
    gatewayOk: boolean;
    dnsServer: string;
    internetOk: boolean;
  };
  mobileQrScanned: boolean;
  pairedDeviceSerial: string;
  liveStreamTested: boolean;
  resolvedFaultId?: string;
  faultScenario?: {
    issue: string;
    cause: string;
    fixApplied: boolean;
    retestPassed: boolean;
  };
  score: number;
  isCompleted: boolean;
}

// Full Room 106 Lab Submission Payload
export interface Room106LabSubmissionPayload {
  roomId: 'room-106';
  unitNumber: 6;
  station1: Station1StorageCalculationPayload;
  station2: Station2HddManagementPayload;
  station3: Station3RemoteAccessPayload;
  totalScore: number;
  totalHintsUsed: number;
  timestamp: string;
  evidence?: Record<string, unknown>;
}
