// Domain Types and Catalogs for Room 103: CCTV Cabling, Termination, RJ45 & BNC Workshop
// Course 21909-2020: CCTV Systems (ปวช. 2567)
// Implementation compliant with ROOM103_PLAN.md (Baseline Specification)

// ==========================================
// 1. Room Metadata & Station Configurations
// ==========================================

export const ROOM103_METADATA = {
  roomId: 'room-103',
  unitId: 'U03',
  titleTh: 'ระบบสายสัญญาณ การเข้าหัวสาย และการเชื่อมต่อ CCTV',
  titleEn: 'CCTV Cabling, Termination, RJ45 & BNC Workshop',
  theme: 'CCTV Cabling, Termination & RJ45 Workshop',
  durationMinutes: 60,
  totalScore: 100,
  passScore: 70,
  prevRoomId: 'room-102',
  nextRoomId: 'room-104',
} as const;

export const ROOM103_STATION_SCORES = {
  station1Max: 35,
  station2Max: 35,
  station3Max: 30,
  totalMax: 100,
  passThreshold: 70,
} as const;

export const ROOM103_3D_POSITIONS = {
  station1: [-6.0, 0.0, -3.0],
  station2: [0.0, 0.0, -3.0],
  station3: [6.0, 0.0, -3.0],
  spawnPoint: [0.0, 0.05, 3.5],
  detectionRadius: 3.2,
} as const;

// ==========================================
// 2. Station 1: Termination & Standards (RJ45 Dual-End & Coaxial BNC)
// ==========================================

export const T568B_COLOR_SEQUENCE = [
  'White-Orange',
  'Orange',
  'White-Green',
  'Blue',
  'White-Blue',
  'Green',
  'White-Brown',
  'Brown',
] as const;

export const T568A_COLOR_SEQUENCE = [
  'White-Green',
  'Green',
  'White-Orange',
  'Blue',
  'White-Blue',
  'Orange',
  'White-Brown',
  'Brown',
] as const;

export type T568BColor = (typeof T568B_COLOR_SEQUENCE)[number];
export type T568AColor = (typeof T568A_COLOR_SEQUENCE)[number];
export type WiringStandardType = 'T568B_STRAIGHT' | 'T568A_STRAIGHT' | 'CROSSOVER';

export const COLOR_HEX_MAP: Record<string, string> = {
  'White-Orange': '#fed7aa',
  Orange: '#ea580c',
  'White-Green': '#bbf7d0',
  Blue: '#2563eb',
  'White-Blue': '#bfdbfe',
  Green: '#16a34a',
  'White-Brown': '#e7d5c0',
  Brown: '#78350f',
};

export interface T568BPinSpec {
  pin: number;
  color: T568BColor;
  colorTh: string;
  hex: string;
  signalFunction: string;
}

export const T568B_PIN_SPECS: readonly T568BPinSpec[] = [
  { pin: 1, color: 'White-Orange', colorTh: 'ขาว-ส้ม', hex: '#fed7aa', signalFunction: 'Transmit Data + (TX+) / BI_DA+' },
  { pin: 2, color: 'Orange', colorTh: 'ส้ม', hex: '#ea580c', signalFunction: 'Transmit Data - (TX-) / BI_DA-' },
  { pin: 3, color: 'White-Green', colorTh: 'ขาว-เขียว', hex: '#bbf7d0', signalFunction: 'Receive Data + (RX+) / BI_DB+' },
  { pin: 4, color: 'Blue', colorTh: 'น้ำเงิน', hex: '#2563eb', signalFunction: 'PoE Positive / BI_DC+' },
  { pin: 5, color: 'White-Blue', colorTh: 'ขาว-น้ำเงิน', hex: '#bfdbfe', signalFunction: 'PoE Positive / BI_DC-' },
  { pin: 6, color: 'Green', colorTh: 'เขียว', hex: '#16a34a', signalFunction: 'Receive Data - (RX-) / BI_DB-' },
  { pin: 7, color: 'White-Brown', colorTh: 'ขาว-น้ำตาล', hex: '#e7d5c0', signalFunction: 'PoE Negative / BI_DD+' },
  { pin: 8, color: 'Brown', colorTh: 'น้ำตาล', hex: '#78350f', signalFunction: 'PoE Negative / BI_DD-' },
];

export const ROOM103_STRIPPING_MIN_MM = 12;
export const ROOM103_STRIPPING_MAX_MM = 15;
export const ROOM103_DEFAULT_CABLE_ID = 'CAM-01-UTP';
export const ROOM103_DEFAULT_SOURCE_LABEL = 'Rack-01 / Patch Panel Port 08';
export const ROOM103_DEFAULT_DEST_LABEL = 'Outdoor Gate Bullet Cam 01';

export type CoaxAssemblyStep = 1 | 2 | 3 | 4;

export interface CoaxAssemblyDetails {
  currentStep: CoaxAssemblyStep;
  jacketStripped: boolean;
  braidFoldedBack: boolean;
  dielectricTrimmed: boolean;
  centerConductorExposedMm: number; // 6.5mm optimal
  bncFitted: boolean;
  bncType: 'COMPRESSION' | 'CRIMP' | 'TWIST_ON';
  shortCheckDone: boolean;
  hasShort: boolean;
  compressionCrimped: boolean;
}

export interface CableTesterSimulationState {
  isActive: boolean;
  isPassed: boolean;
  activePinIndex: number; // 0-7
  masterLeds: boolean[]; // 8 pins
  remoteLeds: boolean[]; // 8 pins
  statusMessage: string;
  videoSignalStatus: 'HD_CLEAR' | 'NO_SIGNAL' | 'NOISY' | 'STANDBY';
}

export interface Station1Payload {
  // UTP Dual-End Termination
  wiringStandard?: WiringStandardType;
  wireSequence: string[]; // Side A sequence (backwards compatible)
  sideAWireSequence?: string[];
  sideBWireSequence?: string[];
  sideAStrippingMm?: number;
  sideBStrippingMm?: number;
  strippingLengthMm: number; // optimal: 12 - 15 mm
  jacketUnderStrainRelief: boolean;
  sideACrimped?: boolean;
  sideBCrimped?: boolean;
  rj45Crimped: boolean;

  // Coaxial 4-Step Termination
  coaxialStrippedProperly: boolean;
  bncType: 'COMPRESSION' | 'CRIMP' | 'TWIST_ON';
  centerPinShortShieldCheck: boolean; // must be false (no short)
  bncCrimped: boolean;
  coaxDetails?: CoaxAssemblyDetails;

  // Cable Testing & Signal Simulation
  cableTesterPassed?: boolean;
  videoSignalOutputPassed?: boolean;

  // Cable Labeling
  cableId: string;
  sourceLabel: string;
  destLabel: string;
  labelMatches: boolean;

  // Safety Checklist
  safetyChecklist: {
    cutSafetyGloves: boolean;
    eyeProtection: boolean;
    cleanWorkArea: boolean;
  };

  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// 3. Station 2: Cable Selection & Environmental Protection
// ==========================================

export type Room103ZoneId =
  | 'ZONE_OVER_AIR'
  | 'ZONE_MOTOR_EMI'
  | 'ZONE_LONG_450M'
  | 'ZONE_RAIN_EXPOSED'
  | 'ZONE_ANALOG_200M';

export type Room103CableOptionId =
  | 'UTP_OUTDOOR_MESSENGER'
  | 'STP_FTP_SHIELDED'
  | 'FIBER_SINGLEMODE'
  | 'JUNCTION_BOX_IP66_GLAND'
  | 'COAX_RG6_SOLID_COPPER'
  | 'UTP_CAT5E_INDOOR_PVC'
  | 'COAX_RG59_CCA';

export interface Room103CableSpec {
  id: Room103CableOptionId;
  nameTh: string;
  category: 'copper' | 'fiber' | 'coaxial' | 'protection';
  descriptionTh: string;
  idealApplicationTh: string;
  icon: string;
}

export const ROOM103_CABLE_CATALOG: Record<Room103CableOptionId, Room103CableSpec> = {
  UTP_OUTDOOR_MESSENGER: {
    id: 'UTP_OUTDOOR_MESSENGER',
    nameTh: 'สาย UTP Cat6 Outdoor PE Double Jacket พร้อมสลิง Drop-wire',
    category: 'copper',
    descriptionTh: 'เปลือก PE สองชั้น ทนรังสียูวีและความชื้น มีสลิงเหล็กรับแรงดึงและเจลกันซึมน้ำ',
    idealApplicationTh: 'โยงข้ามเสาไฟฟ้าระหว่างอาคาร ทนแดด ลม ฝน',
    icon: '🏗️',
  },
  STP_FTP_SHIELDED: {
    id: 'STP_FTP_SHIELDED',
    nameTh: 'สาย STP/FTP Cat6 Shielded มีฟอยล์หุ้มและสายกราวด์ (Drain Wire)',
    category: 'copper',
    descriptionTh: 'ฟอยล์อลูมิเนียมสะท้อนคลื่นแม่เหล็กไฟฟ้า พร้อมสาย Drain Wire ต่อลงกราวด์ตู้ Rack',
    idealApplicationTh: 'เดินเลียบรางสายไฟเครื่องจักร โรงงาน มอเตอร์ไฟแรงสูง ป้องกัน EMI/RFI',
    icon: '⚡',
  },
  FIBER_SINGLEMODE: {
    id: 'FIBER_SINGLEMODE',
    nameTh: 'สายใยแก้วนำแสง Single-Mode Fiber Optic + Media Converter / SFP',
    category: 'fiber',
    descriptionTh: 'ส่งสัญญาณด้วยแสงเลเซอร์ ไม่จำกัดระยะทาง 100 เมตรของสายทองแดง ป้องกันฟ้าผ่ากวน',
    idealApplicationTh: 'ระยะทางไกลเกิน 100 เมตร (เช่น ป้อมยาม 450m) ข้ามอาคารขนาดใหญ่',
    icon: '💡',
  },
  JUNCTION_BOX_IP66_GLAND: {
    id: 'JUNCTION_BOX_IP66_GLAND',
    nameTh: 'กล่องพักสายกันน้ำ IP66 + เคเบิลแกลนด์กันน้ำ (Waterproof Cable Gland)',
    category: 'protection',
    descriptionTh: 'กล่องพลาสติก ABS เกรดกันน้ำ IP66 มียางโอริง พร้อมเคเบิลแกลนด์รัดสายแน่นหนาคว่ำลง',
    idealApplicationTh: 'จุดต่อสายภายนอกอาคาร ใต้ชายคา ป้องกันน้ำฝนและความชื้นกัดกร่อน',
    icon: '🛡️',
  },
  COAX_RG6_SOLID_COPPER: {
    id: 'COAX_RG6_SOLID_COPPER',
    nameTh: 'สาย Coaxial RG6 ชิลด์ถัก 95% แกนทองแดงแท้ (Bare Solid Copper) + BNC บีบอัด',
    category: 'coaxial',
    descriptionTh: 'แกนทองแดงแท้ความต้านทานต่ำ ชิลด์ 95% ป้องกันคลื่นรบกวน ส่งสัญญาณ Analog HD ได้ไกล 250m+',
    idealApplicationTh: 'ระบบกล้อง Analog HD (AHD/TVI/CVI) ระยะไกลโดยภาพไม่ลาย',
    icon: '📹',
  },
  UTP_CAT5E_INDOOR_PVC: {
    id: 'UTP_CAT5E_INDOOR_PVC',
    nameTh: 'สาย UTP Cat5e Indoor เปลือก PVC ธรรมดา (ไม่กันน้ำ/ไม่มีชิลด์)',
    category: 'copper',
    descriptionTh: 'สายมาตรฐานภายในอาคาร ไม่ทนแดดฝน และไม่มีฟอยล์กันคลื่นรบกวน',
    idealApplicationTh: 'ใช้งานทั่วไปภายในห้องสำนักงานระยะสั้น',
    icon: '🏢',
  },
  COAX_RG59_CCA: {
    id: 'COAX_RG59_CCA',
    nameTh: 'สาย Coaxial RG59 แกนอลูมิเนียมเคลือบทองแดง (CCA) ชิลด์บาง 60%',
    category: 'coaxial',
    descriptionTh: 'สายราคาประหยัด การสูญเสียสูง ไม่เหมาะกับระยะทางไกล',
    idealApplicationTh: 'งานระยะใกล้มากและงบประมาณจำกัด',
    icon: '⚠️',
  },
};

export interface Room103ZoneConfig {
  id: Room103ZoneId;
  nameTh: string;
  locationTh: string;
  environmentTh: string;
  correctOptionId: Room103CableOptionId;
  explanationTh: string;
  xPercent: number;
  yPercent: number;
}

export const ROOM103_ZONES: Record<Room103ZoneId, Room103ZoneConfig> = {
  ZONE_OVER_AIR: {
    id: 'ZONE_OVER_AIR',
    nameTh: 'จุดที่ 1: สายโยงข้ามระหว่างอาคาร',
    locationTh: 'เสาไฟฟ้าระหว่างโกดัง A และโกดัง B',
    environmentTh: 'สายแขวนลอยภายนอกอาคาร สัมผัสแดดยูวี ความชื้น และลมแรงตลอด 24 ชั่วโมง',
    correctOptionId: 'UTP_OUTDOOR_MESSENGER',
    explanationTh: 'สลิงเหล็กรับแรงดึงป้องกันสายขาดจากลมพายุ และเปลือก PE ทนรังสียูวีและความชื้นได้ดี',
    xPercent: 20,
    yPercent: 30,
  },
  ZONE_MOTOR_EMI: {
    id: 'ZONE_MOTOR_EMI',
    nameTh: 'จุดที่ 2: แนวเดินสายขนานเครื่องจักรและมอเตอร์',
    locationTh: 'สายพานลำเลียงโรงงานและตู้ควบคุมอินเวอร์เตอร์',
    environmentTh: 'มีคลื่นแม่เหล็กไฟฟ้ารบกวน (EMI/RFI) สูงมากจากมอเตอร์ไฟ 3 เฟส',
    correctOptionId: 'STP_FTP_SHIELDED',
    explanationTh: 'ฟอยล์อะลูมิเนียมสะท้อนคลื่นกวน และสาย Drain Wire นำประจุเหนี่ยวนำระบายลงกราวด์ตู้ Rack',
    xPercent: 75,
    yPercent: 30,
  },
  ZONE_LONG_450M: {
    id: 'ZONE_LONG_450M',
    nameTh: 'จุดที่ 3: สายไปยังกล้องป้อมยามระยะ 450 เมตร',
    locationTh: 'แนวกำแพงรั้วทางเข้าโรงงานระยะไกล',
    environmentTh: 'ระยะทาง 450 เมตร เกินขีดจำกัด 100 เมตรของสายทองแดง UTP',
    correctOptionId: 'FIBER_SINGLEMODE',
    explanationTh: 'ส่งข้อมูลด้วยแสงเลเซอร์ ไม่จำกัดระยะ 100 เมตร ไม่สูญเสียสัญญาณ และปลอดจากฟ้าผ่ารบกวน',
    xPercent: 85,
    yPercent: 75,
  },
  ZONE_RAIN_EXPOSED: {
    id: 'ZONE_RAIN_EXPOSED',
    nameTh: 'จุดที่ 4: จุดต่อสายภายนอกชายคาเสี่ยงฝนสาด',
    locationTh: 'ผนังภายนอกอาคารคลังสินค้า',
    environmentTh: 'ฝนสาดโดยตรง เสี่ยงน้ำซึมเข้าขั้วต่อ RJ45 เกิดสนิมและช็อต',
    correctOptionId: 'JUNCTION_BOX_IP66_GLAND',
    explanationTh: 'กล่องซีลโอริงป้องกันน้ำระดับ IP66 และเคเบิลแกลนด์ช่วยรัดสายให้แน่นโดยหันช่องสายลงด้านล่าง',
    xPercent: 45,
    yPercent: 80,
  },
  ZONE_ANALOG_200M: {
    id: 'ZONE_ANALOG_200M',
    nameTh: 'จุดที่ 5: เดินสายกล้อง Analog HD ระยะไกล 200 เมตร',
    locationTh: 'อาคารสำนักงานเก่าเชื่อมต่อไปยังป้อมหลัง',
    environmentTh: 'ระบบกล้อง Analog เดิมความละเอียด 4K ระยะ 200 เมตร ต้องการภาพคมชัดไม่ลาย',
    correctOptionId: 'COAX_RG6_SOLID_COPPER',
    explanationTh: 'แกนทองแดงแท้ความต้านทานต่ำ ชิลด์ 95% ป้องกันคลื่นแทรก ให้สัญญาณความถี่สูงผ่านได้ไกล',
    xPercent: 25,
    yPercent: 70,
  },
};

export interface Station2Payload {
  selectedOptions: Partial<Record<Room103ZoneId, Room103CableOptionId>>;
  routeSafety: {
    avoidHeatSource: boolean;
    respectBendRadius: boolean;
    separateHighVoltagePower: boolean;
  };
  waterproofing: {
    junctionBoxMounted: boolean;
    cableGlandTightened: boolean;
    downwardDripLoop: boolean;
  };
  labelingAndSafety: {
    sourceDestLabelsApplied: boolean;
    cableTiesOrganized: boolean;
    ppeSafetyChecklistPassed: boolean;
  };
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// 4. Station 3: Diagnostics, PoE Budget & Root Cause Analysis
// ==========================================

export const ROOM103_POE_BUDGET_CONFIG = {
  defaultSwitchWatts: 65,
  cameraBaseWatts: 8,
  accessoriesWatts: 5,
  safetyMarginPercent: 20,
  defaultCameraCount: 4,
  calculatedPerCameraWatts: 15.6, // (8 + 5) * 1.2
  calculatedTotalWatts: 62.4, // 15.6 * 4
  maxBudgetWatts: 65,
} as const;

export const ROOM103_CASE3_KEYWORDS = [
  'CCA',
  'higher resistance',
  'voltage drop',
  'pure bare copper',
  'EMI/RFI',
  'STP/FTP',
  'drain wire',
  'shield grounding',
  'PoE budget',
  'retest',
] as const;

export const ROOM103_CASE3_REQUIRED_TERMS: readonly (readonly string[])[] = [
  ['cca', 'อลูมิเนียม', 'copper clad aluminum'],
  ['ความต้านทาน', 'resistance', 'โอห์ม', 'ohm', 'higher resistance'],
  ['แรงดันตก', 'voltage drop', 'โวลต์ตก', 'drop'],
  ['ทองแดงแท้', 'pure copper', 'bare copper', 'pure bare copper', 'แกนทองแดง'],
  ['emi', 'rfi', 'คลื่นแม่เหล็ก', 'สัญญาณกวน', 'noise', 'emi/rfi'],
  ['stp', 'ftp', 'shield', 'ฟอยล์', 'ชีลด์', 'stp/ftp'],
  ['drain wire', 'เดรน', 'สายระบาย'],
  ['กราวด์', 'ground', 'ลงดิน', 'ตู้ rack', 'shield grounding'],
  ['retest', 'ทดสอบซ้ำ', 'ตรวจซ้ำ', 'วัดซ้ำ'],
];

export interface Station3Payload {
  // Case 1: Cable Continuity & Wiremap Diagnostics
  case1Testing: {
    selectedUtpTool: 'CABLE_TESTER' | 'MULTIMETER' | 'VISUAL_ONLY';
    selectedCoaxTool: 'MULTIMETER_CONTINUITY' | 'CABLE_TESTER' | 'NONE';
    identifiedFaultType: 'CROSSED_AND_OPEN' | 'PERFECT' | 'TOTAL_SHORT';
    faultExplanation: string;
    retestPassed: boolean;
    score: number;
  };

  // Case 2: PoE Power Budget Interactive Calculator
  case2PoEBudget: {
    switchPoEBudgetWatts: number; // e.g. 65W
    cameraWattage: number; // e.g. 8W
    accessoriesWattage: number; // e.g. 5W
    safetyMarginPercent: number; // e.g. 20%
    cameraCount: number; // e.g. 4
    calculatedWattsPerCamera: number; // (8 + 5) * 1.2 = 15.6W
    calculatedTotalSystemWatts: number; // 15.6 * 4 = 62.4W
    isBudgetSufficient: boolean; // true (62.4W <= 65W)
    score: number;
  };

  // Case 3: CCA & Motor EMI Diagnosis
  case3CcaEmi: {
    ccaResistanceAnswer: string;
    emiNoiseAnswer: string;
    groundingSolutionAnswer: string;
    keywordsFound: string[];
    score: number;
  };

  totalScore?: number;
  isCompleted?: boolean;
}

// ==========================================
// 5. Aggregate State & Submission Payloads
// ==========================================

export interface Room103LabState {
  station1: Station1Payload;
  station2: Station2Payload;
  station3: Station3Payload;
}

export interface Room103LabSubmissionPayload {
  roomId: 'room-103';
  unitNumber: 3;
  theme: 'CCTV Cabling, Termination & RJ45 Workshop';
  station1: Station1Payload;
  station2: Station2Payload;
  station3: Station3Payload;
  clientScore?: number;
  finalScore?: number;
  passed?: boolean;
  timestamp: string;
}

export interface Room103MandatoryChecks {
  cameraOnline: boolean;
  nvrReachable: boolean;
  clientLiveViewActive: boolean;
}

export interface Room103ResultDetails {
  theme: string;
  station1Score: number;
  station2Score: number;
  station3Score: number;
  t568bCorrectPins: number;
  coaxialCheck: 'PASS_NO_SHORT' | 'FAIL_SHORT';
  zonesCorrect: number;
  poeBudgetPassed: boolean;
  keywordsMatched: number;
}
