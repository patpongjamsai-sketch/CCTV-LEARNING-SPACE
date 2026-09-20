import type {
  AssessmentDefinition,
  FaultChallengeDefinition,
  LabDefinition,
  LessonDefinition,
  ReflectionDefinition,
  UnitContentBundle,
  UnitDefinition,
} from './types';

const unit: UnitDefinition = {
  id: 'U06',
  courseId: 'C-21909-2020',
  number: 6,
  titleTh: 'การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'เลือกฮาร์ดดิสก์เกรดบันทึกภาพ (Surveillance HDD) คำนวณความจุฮาร์ดดิสก์ให้สอดคล้องกับระยะเวลาเก็บข้อมูล (Retention Days) กำหนดค่า RAID สำรองข้อมูล และตั้งค่าการดูภาพระยะไกลผ่านระบบคลาวด์ P2P และ DDNS ได้อย่างปลอดภัย',
  requiredGates: ['U06-GATE-CONCEPT', 'U06-GATE-PRELAB', 'U06-GATE-LAB'],
};

const lessonTitles = [
  'ความแตกต่างระหว่าง Surveillance HDD กับ Desktop HDD',
  'ปัจจัยที่มีผลต่อขนาดไฟล์วิดีโอ (Bitrate, Codec, Resolution, FPS)',
  'สูตรการคำนวณพื้นที่จัดเก็บข้อมูล (Storage Calculation Formula)',
  'การคำนวณจำนวนวันที่บันทึกได้ (Retention Period Calculation)',
  'ระบบความปลอดภัยของข้อมูลดิสก์และ RAID (RAID 0, 1, 5)',
  'การ Format, จัดสรรดิสก์ (Disk Quota) และตรวจสอบ S.M.A.R.T.',
  'การสำรองข้อมูลภาพ (Video Export via USB, FTP, Cloud)',
  'การเชื่อมต่อดูภาพระยะไกลผ่าน Cloud P2P และ QR Code',
  'การเชื่อมต่อผ่าน DDNS และการตั้งค่า Port Forwarding',
  'ความปลอดภัยในการเข้าถึงจากภายนอก (Cybersecurity Best Practices)',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U06-L${String(order).padStart(2, '0')}`,
    unitId: 'U06',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถคำนวณพื้นที่จัดเก็บพร้อมจัดการการดูภาพระยะไกลในเรื่อง ${titleTh} ได้อย่างปลอดภัย`],
    sections: [
      {
        id: `U06-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U06-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U06-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U06' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U06-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบการจัดเก็บข้อมูลและการดูภาพระยะไกล',
    purpose: 'วัดความเข้าใจสูตรคำนวณความจุ HDD และกลไก Cloud P2P vs DDNS',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U06-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามการจัดเก็บข้อมูลและดูภาพระยะไกลข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U06-A01-Q12',
        type: 'reasoning',
        prompt: 'หากลูกค้าต้องการบันทึกภาพกล้อง 8 ตัว (บิตเรต 4096 kbps/ตัว) ตลอด 24 ชม. เป็นเวลา 30 วัน ต้องใช้ HDD ความจุขั้นต่ำกี่ TB?',
        points: 2,
        expectedConcepts: ['storage_formula', 'retention_days', 'terabyte_rounding'],
      },
    ],
    scoring: { maxScore: 13, weight: 15, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 70 },
    evidenceRequirements: [
      { type: 'knowledge_answer', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U06-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่คุณสมบัติ HDD และวิธีการดูภาพระยะไกล',
    purpose: 'ประเมินการเลือกชนิดดิสก์และการกำหนดสิทธิ์ผู้ใช้ระยะไกล',
    lessonMapping: ['U06-L01', 'U06-L05', 'U06-L08', 'U06-L09'],
    tasks: [
      { id: 'U06-A02-T01', type: 'matching', prompt: 'จับคู่ระดับ RAID (0, 1, 5) กับคุณสมบัติความปลอดภัยของข้อมูล', points: 5 },
      { id: 'U06-A02-T02', type: 'classification', prompt: 'เปรียบเทียบจุดเด่น-จุดด้อยระหว่าง Cloud P2P กับ DDNS Port Forward', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U06-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'Storage Calculation & Cloud Topology Plan',
    purpose: 'คำนวณความจุ HDD รวม และออกแบบผังเส้นทางสัญญาณดูภาพผ่านอินเทอร์เน็ต',
    lessonMapping: ['U06-L03', 'U06-L04', 'U06-L08', 'U06-L10'],
    tasks: [
      { id: 'U06-A03-T01', type: 'equipment_selection', prompt: 'เลือกขนาด HDD (TB) และจำนวน Bay ของ NVR ให้รองรับ', points: 5 },
      { id: 'U06-A03-T02', type: 'system_diagram', prompt: 'วาดผังการเชื่อมต่อ NVR → Router → Cloud Server → Mobile App', points: 5 },
      { id: 'U06-A03-T03', type: 'reasoning', prompt: 'อธิบายมาตรการความปลอดภัยไซเบอร์เพื่อป้องกันการถูกแฮกระบบกล้อง', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U06-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Storage Readiness & Network Access Gate',
    purpose: 'ตรวจสอบความพร้อมของ HDD สาย SATA และการเชื่อมต่ออินเทอร์เน็ต',
    lessonMapping: ['U06-L01', 'U06-L06', 'U06-L08'],
    tasks: [
      { id: 'U06-A04-T01', type: 'checklist', prompt: 'ตรวจสอบสถานะ HDD ขันน็อตยึดดิสก์ และตรวจสอบไฟสถานะ LAN/WAN บน Router', points: 5 },
      { id: 'U06-A04-T02', type: 'prediction', prompt: 'คาดการณ์สาเหตุเมื่อสแกน QR Code บนแอปแล้วขึ้นสถานะ Device Offline', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'rubric' },
    passingRule: { type: 'pre_lab_gate' },
    evidenceRequirements: [
      { type: 'safety_check', required: true },
      { type: 'system_diagram', required: true },
    ],
  }),
];

const lab: LabDefinition = {
  id: 'U06-LAB01',
  unitId: 'U06',
  titleTh: 'Storage Calculation & Cloud P2P Practical LAB',
  workOrder: 'คำนวณและติดตั้ง HDD ลงใน NVR สั่ง Format ระบบ และเปิดใช้งาน Cloud P2P ให้ดูภาพผ่านสมาร์ตโฟนได้สำเร็จ',
  functionalTests: ([
    ['T01', 'Surveillance HDD Installation & SATA Connection', true],
    ['T02', 'HDD Initialization & Formatting', true],
    ['T03', 'Storage Capacity & Retention Validation', true],
    ['T04', 'Cloud P2P Service Activation', true],
    ['T05', 'QR Code Mobile App Pairing', true],
    ['T06', 'Remote Live View & Playback Verification', true],
    ['T07', 'Strong Password & Cyber Hardening Audit', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U06-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U06-F01',
  unitId: 'U06',
  titleTh: 'Fault Challenge: แก้ไขปัญหา HDD Not Found และสถานะ Cloud P2P ค้าง Offline',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U06-R01',
  unitId: 'U06',
  titleTh: 'Reflection: ความรับผิดชอบด้านความปลอดภัยของข้อมูลและการดูภาพย้อนหลัง',
  prompts: [
    'ทำไมการใช้ Desktop HDD ในงานบันทึก CCTV 24/7 จึงมักเสียชีวิตภายใน 6-12 เดือน?',
    'หากปล่อยให้ระบบใช้ Default Password เมื่อเปิดดูภาพผ่าน P2P จะมีความเสี่ยงด้านใดบ้าง?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit06Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U06-A01', 'U06-A02', 'U06-A03', 'U06-A04', 'U06-LAB01', 'U06-F01', 'U06-R01'],
  completionRule: {
    requiredContent: ['U06-A01', 'U06-A02', 'U06-A03', 'U06-A04', 'U06-LAB01', 'U06-F01', 'U06-R01'],
    requiredEvidence: [
      { type: 'knowledge_answer', required: true },
      { type: 'system_diagram', required: true },
      { type: 'safety_check', required: true },
      { type: 'functional_test', required: true },
      { type: 'fault_log', required: true },
      { type: 'reflection', required: true },
      { type: 'teacher_verification', required: true, teacherVerification: true },
    ],
    requiredGates: unit.requiredGates,
    requireTeacherVerification: true,
  },
  unlockRules: [
    {
      id: 'U06-RULE-LAB01',
      targetId: 'U06-LAB01',
      all: [
        { contentId: 'U06-A03', condition: 'passed' },
        { contentId: 'U06-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
