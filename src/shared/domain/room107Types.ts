// Types and domain models for Unit 7: Room 107 Troubleshooting & Preventive Maintenance
// Systematic Fault Isolation, Voltage Drop, Ground Loop Mitigation & PM Checklist

export type DiagnosticStep = 'POWER' | 'PHYSICAL' | 'SIGNAL' | 'NETWORK' | 'DEVICE';

export interface DiagnosticStepItem {
  id: DiagnosticStep;
  nameTh: string;
  order: number;
  description: string;
  status: 'PENDING' | 'CHECKING' | 'VERIFIED' | 'FAULT_FOUND';
  findings?: string;
}

export const DEFAULT_DIAGNOSTIC_STEPS: DiagnosticStepItem[] = [
  {
    id: 'POWER',
    nameTh: '1. ตรวจสอบระบบจ่ายไฟ (Power & PoE)',
    order: 1,
    description: 'วัดแรงดันไฟตก (Voltage Drop) และตรวจสเปกหม้อแปลง/PoE Switch',
    status: 'FAULT_FOUND',
    findings: 'แรงดันไฟตกเหลือ 42.5V ต่ำกว่ามาตรฐาน 48V (สาย Cat5e ยาว 110ม.) ทำให้กล้องรีบูตวน (No Link)',
  },
  {
    id: 'PHYSICAL',
    nameTh: '2. ตรวจสอบสายและจุดเชื่อมต่อ (Physical Layer)',
    order: 2,
    description: 'ตรวจหัว RJ45/BNC, ข้อต่อกันน้ำ, การพับหักงอ และระยะสาย',
    status: 'VERIFIED',
    findings: 'สายสัญญาณไม่มีรอยขาด หัว RJ45 เข้าหัว T568B ปกติ แต่พบปัญหาระยะสายเกิน 100 เมตร',
  },
  {
    id: 'SIGNAL',
    nameTh: '3. ตรวจสอบคุณภาพสัญญาณภาพ (Signal Quality)',
    order: 3,
    description: 'ตรวจคลื่นรบกวน Hum Bars, Ground Loop, สัญญาณภาพซ้อน หรือกระตุก',
    status: 'FAULT_FOUND',
    findings: 'พบเส้นคลื่นลายเลื่อนในแนวนอน (Rolling Hum Bars 50Hz) จากความต่างศักย์กราวด์ตัวถังกล้องกับ NVR Rack',
  },
  {
    id: 'NETWORK',
    nameTh: '4. ตรวจสอบเครือข่ายและการส่งข้อมูล (Network & Packets)',
    order: 4,
    description: 'ทดสอบ Ping, Latency, Packet Loss และการชนกันของ IP Address',
    status: 'VERIFIED',
    findings: 'Ping NVR Gateway 192.168.1.1 Latency <1ms Packet Loss 0%',
  },
  {
    id: 'DEVICE',
    nameTh: '5. ตรวจสอบฮาร์ดแวร์ตัวกล้องและเลนส์ (Device & Lens)',
    order: 5,
    description: 'ตรวจหน้าเลนส์ ไอน้ำ ซีลยางกันน้ำ และทดสอบฟังก์ชัน IR Cut Filter',
    status: 'VERIFIED',
    findings: 'หน้าเลนส์มีคราบฝุ่นเกาะ ซีลยาง Housing ยังยืดหยุ่นดี จำเป็นต้องทำความสะอาดตามรอบ PM',
  },
];

// Station 1: Diagnostic Tree, Voltage Drop & NO VIDEO (40 pts)
export interface Station1DiagnosticPayload {
  faultDeviceId: string; // e.g. 'CAM-03'
  diagnosticSteps: DiagnosticStepItem[];
  measuredPoEVoltage: number; // e.g. 42.5 (V)
  nominalPoEVoltage: number; // 48.0 (V)
  cableDistanceMeters: number; // e.g. 110 (m)
  voltageDropDetected: boolean;
  selectedPowerAction: 'UPGRADE_EXTENDER' | 'BOOST_INJECTOR' | 'REPLACE_CAT6' | 'REPLACE_CAMERA';
  powerActionApplied: boolean;
  retestPoEVoltage: number; // e.g. 50.2 (V)
  noVideoResolved: boolean;
  score: number; // max 40
  isCompleted: boolean;
}

// Station 2: Ground Loop, Signal Quality & Tools (20 pts)
export interface Station2SignalQualityPayload {
  symptomIdentified: 'ROLLING_HUM_BARS' | 'GHOSTING' | 'INTERMITTENT_LINK';
  rootCause: 'GROUND_LOOP_POTENTIAL_DIFF' | 'UNSHIELDED_POWER_PROXIMITY';
  groundPotentialDiffVolts: number; // e.g. 2.4 VAC
  groundLoopIsolatorModel: string; // e.g. 'Passive Video Ground Loop Isolator BNC/RJ45'
  isolatorInstalled: boolean;
  installationPosition: 'CAMERA_END' | 'NVR_END';
  waveformAnalyzed: boolean;
  retestVideoClean: boolean;
  humBarsResolved: boolean;
  score: number; // max 20
  isCompleted: boolean;
}

// Station 3: Preventive Maintenance & Service Report (40 pts)
export interface Station3MaintenancePayload {
  lensInspection: {
    cleanDone: boolean;
    moistureChecked: boolean;
    focusCalibrated: boolean;
    waterproofGasketInspected: boolean;
  };
  pmChecklist: {
    powerMeasured: boolean;
    connectorSealed: boolean;
    cameraCleaned: boolean;
    nvrFirmwareChecked: boolean;
    recordingLogVerified: boolean;
  };
  faultLog: {
    problemDescription: string;
    possibleCause: string;
    testPerformed: string;
    solutionApplied: string;
    retestPassed: boolean;
    preventiveAction: string;
  };
  pmChecklistSigned: boolean;
  technicianName: string;
  customerAcknowledged: boolean;
  score: number; // max 40
  isCompleted: boolean;
}

// Complete Room 107 Submission Payload (100 pts)
export interface Room107LabSubmissionPayload {
  roomId: 'room-107';
  unitNumber: 7;
  studentName?: string;
  studentCode?: string;
  station1: Station1DiagnosticPayload;
  station2: Station2SignalQualityPayload;
  station3: Station3MaintenancePayload;
  totalScore: number;
  isPassed: boolean;
  faultDeviceId: string;
  step1PoEVoltageChecked: boolean;
  step1PoEVoltageValue: number;
  step2GroundLoopIsolatorInstalled: boolean;
  step3LensCleaned: boolean;
  step3PmChecklistSigned: boolean;
  resolvedFaults: string[];
  totalHintsUsed: number;
  submittedAt: string;
}
