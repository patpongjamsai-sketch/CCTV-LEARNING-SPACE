// Types and domain models for Unit 8: Room 108 Capstone Project
// Integrated CCTV System, Commissioning & Handover

export interface CapstoneBomItem {
  id: string;
  item: string;
  category: 'CAMERA' | 'RECORDING' | 'NETWORK' | 'POWER' | 'CABLING' | 'INFRASTRUCTURE';
  model: string;
  quantity: number;
  unit: string;
  unitPriceThb: number;
  totalPriceThb: number;
  status: 'VERIFIED' | 'MISSING';
  specSummary: string;
}

export const ROOM108_CAPSTONE_BOM_CATALOG: CapstoneBomItem[] = [
  {
    id: 'BOM-01',
    item: 'IP Cameras (Dome 4K / Bullet 2K / PTZ)',
    category: 'CAMERA',
    model: 'SmartPro IP Series (4x 4K Dome, 3x 2K Bullet, 1x PTZ)',
    quantity: 8,
    unit: 'Sets',
    unitPriceThb: 3800,
    totalPriceThb: 30400,
    status: 'VERIFIED',
    specSummary: 'รองรับ H.265+, WDR 120dB, PoE 802.3af, กันน้ำกันฝุ่น IP67',
  },
  {
    id: 'BOM-02',
    item: 'PoE Switch 8-Port Gigabit (120W+)',
    category: 'NETWORK',
    model: 'NetPro GS-108P PoE+ Gigabit Switch',
    quantity: 1,
    unit: 'Unit',
    unitPriceThb: 4200,
    totalPriceThb: 4200,
    status: 'VERIFIED',
    specSummary: '8x PoE+ Gigabit Ports (Max 30W/port, Total 120W) + 2x SFP Uplink',
  },
  {
    id: 'BOM-03',
    item: '4K Surveillance NVR (8 Channels)',
    category: 'RECORDING',
    model: 'CCTV-NVR-4K-8CH Enterprise',
    quantity: 1,
    unit: 'Unit',
    unitPriceThb: 6500,
    totalPriceThb: 6500,
    status: 'VERIFIED',
    specSummary: 'รองรับแบนด์วิดท์เข้า 80 Mbps, HDMI 4K Output, ONVIF Profile S/G/T',
  },
  {
    id: 'BOM-04',
    item: 'Surveillance HDD 8TB (PurpleSurv 24/7)',
    category: 'RECORDING',
    model: 'Surveillance Pro 8TB (180 TB/yr Workload)',
    quantity: 1,
    unit: 'Unit',
    unitPriceThb: 7800,
    totalPriceThb: 7800,
    status: 'VERIFIED',
    specSummary: 'ออกแบบสำหรับบันทึก 24/7, AllFrame Firmware, Buffer 256MB',
  },
  {
    id: 'BOM-05',
    item: 'Line Interactive UPS 1000VA / 600W',
    category: 'POWER',
    model: 'SafePower Pro 1000VA / 600W LCD',
    quantity: 1,
    unit: 'Unit',
    unitPriceThb: 3900,
    totalPriceThb: 3900,
    status: 'VERIFIED',
    specSummary: 'จ่ายไฟสำรองให้อุปกรณ์ NVR + PoE Switch + 8 กล้อง ได้นานกว่า 25 นาที',
  },
  {
    id: 'BOM-06',
    item: 'Cat6 UTP Pure Copper Cabling (305m)',
    category: 'CABLING',
    model: 'Cat6 Pure Copper 23AWG Outdoor/Indoor',
    quantity: 1,
    unit: 'Roll',
    unitPriceThb: 3500,
    totalPriceThb: 3500,
    status: 'VERIFIED',
    specSummary: 'ทองแดงแท้ 100%, ทนทานรองรับ Gigabit & PoE ไม่เกิด Voltage Drop ปลายสาย',
  },
  {
    id: 'BOM-07',
    item: '19" 6U Wallmount Server Rack & PDU',
    category: 'INFRASTRUCTURE',
    model: 'RackPro 6U Depth 50cm with 4-Outlet PDU',
    quantity: 1,
    unit: 'Set',
    unitPriceThb: 2800,
    totalPriceThb: 2800,
    status: 'VERIFIED',
    specSummary: 'มีกุญแจล็อคความปลอดภัย, พัดลมระบายความร้อน 1 ตัว, รางไฟป้องกันไฟกระชาก',
  },
];

// Station 1: Customer Needs, Site Survey, Floor Plan & BOM Review (20 pts)
export interface Station1ProjectPlanningPayload {
  projectName: string;
  customerName: string;
  siteLocation: string;
  customerRequirementBrief: string;
  cameraCount: number;
  floorPlanCoverageChecked: boolean;
  floorPlanZones: Array<{
    zoneId: string;
    zoneNameTh: string;
    cameraType: string;
    targetResolution: string;
  }>;
  bomItems: CapstoneBomItem[];
  totalEstimatedBudgetThb: number;
  compatibilityNotes: string;
  bomApproved: boolean;
  score: number;
  isCompleted: boolean;
}

// Station 2: System Commissioning & Acceptance Tests (40 pts)
export interface Station2CommissioningPayload {
  hardwareRackMounted: boolean;
  poeSwitchPowerBudgetChecked: boolean;
  cameraOnline: boolean;
  nvrReachable: boolean;
  liveViewActive: boolean;
  recordingActive: boolean;
  remoteAccessOnline: boolean;
  upsFailoverTested: boolean;
  cyberHardeningVerified: boolean;
  commissioningChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    liveViewActive: boolean;
    recordingActive: boolean;
    remoteAccessOnline: boolean;
    upsBackupOk: boolean;
    passwordsHardened: boolean;
  };
  commissioningNotes: string;
  score: number;
  isCompleted: boolean;
}

// Station 3: Handover, User Training & Project Governance (25 pts)
export interface Station3HandoverPayload {
  asBuiltDocumentationAttached: boolean;
  ipAddressSchemeSummary: string;
  userTrainingCompleted: boolean;
  trainingTopics: string[];
  punchListItemsCount: number;
  punchListResolved: boolean;
  warrantyPeriodYears: number;
  customerRepresentativeName: string;
  leadTechnicianName: string;
  handoverCertificateSigned: boolean;
  handoverSignedDate: string;
  projectDefenseSummary: string;
  score: number;
  isCompleted: boolean;
}

// Full Room 108 Capstone Submission Payload (85 pts max)
export interface Room108LabSubmissionPayload {
  roomId: 'room-108';
  unitNumber: 8;
  theme: 'Integrated CCTV Capstone, Commissioning & Handover';
  station1: Station1ProjectPlanningPayload;
  station2: Station2CommissioningPayload;
  station3: Station3HandoverPayload;
  totalScore: number;
  totalHintsUsed: number;
  timestamp: string;
  evidence?: Record<string, unknown>;
}
