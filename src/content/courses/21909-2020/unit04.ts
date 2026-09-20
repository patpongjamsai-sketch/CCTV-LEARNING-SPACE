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
  id: 'U04',
  courseId: 'C-21909-2020',
  number: 4,
  titleTh: 'เครือข่ายสำหรับกล้อง IP',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'กำหนดค่า IP Address, Subnet Mask และ Gateway ให้กับกล้อง IP และเครื่องบันทึก คำนวณความต้องการกำลังไฟฟ้า PoE (802.3af/802.3at) บริหาร PoE Budget ของสวิตช์เครือข่าย และออกแบบโครงสร้างระบบเครือข่าย LAN สำหรับระบบ CCTV ได้อย่างถูกต้อง',
  requiredGates: ['U04-GATE-CONCEPT', 'U04-GATE-PRELAB', 'U04-GATE-LAB'],
};

const lessonTitles = [
  'พื้นฐานเครือข่ายคอมพิวเตอร์สำหรับช่าง CCTV',
  'โครงสร้าง IPv4, Subnet Mask และ Default Gateway',
  'การจัดสรร IP Address แบบ Static vs DHCP',
  'การทำงานของ Switch และ Unmanaged vs Managed Switch',
  'มาตรฐาน PoE (802.3af 15.4W vs 802.3at PoE+ 30W)',
  'การคำนวณ PoE Power Budget ของสวิตช์',
  'การวิเคราะห์แบนด์วิดท์เครือข่าย (Network Bandwidth)',
  'การแบ่งเครือข่ายเสมือน (VLAN Isolation สำหรับ CCTV)',
  'การใช้คำสั่งทดสอบเครือข่าย (Ping, ARP, IP Scanner)',
  'การบูรณาการโครงสร้างเครือข่าย IP CCTV ประสิทธิภาพสูง',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U04-L${String(order).padStart(2, '0')}`,
    unitId: 'U04',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถจัดการระบบเครือข่ายและกำลังไฟในเรื่อง ${titleTh} ได้อย่างมีประสิทธิภาพ`],
    sections: [
      {
        id: `U04-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U04-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U04-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U04' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U04-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบหลักการเครือข่าย IP และระบบ PoE',
    purpose: 'วัดความเข้าใจ IP Subnetting, Gateway และมาตรฐาน PoE 802.3af/at',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U04-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามเครือข่ายและ PoE ข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U04-A01-Q12',
        type: 'reasoning',
        prompt: 'หาก Switch มี PoE Budget 65W และเชื่อมต่อกล้อง PTZ (25W) 2 ตัว กับกล้อง Bullet (7W) 3 ตัว สวิตช์จะจ่ายไฟพอหรือไม่?',
        points: 2,
        expectedConcepts: ['poe_budget_calculation', 'power_over_budget', 'switch_stability'],
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
    id: 'U04-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จัดสรร IP และจำแนกอุปกรณ์เครือข่าย',
    purpose: 'ประเมินการกำหนดหมายเลข IP และเลือกอุปกรณ์ Switch',
    lessonMapping: ['U04-L02', 'U04-L03', 'U04-L04', 'U04-L05'],
    tasks: [
      { id: 'U04-A02-T01', type: 'matching', prompt: 'จัดสรร IP Address ให้ไม่ชนกันใน Subnet เดียวกัน', points: 5 },
      { id: 'U04-A02-T02', type: 'classification', prompt: 'จำแนกมาตรฐาน PoE (802.3af 15.4W vs 802.3at 30W vs Passive 24V)', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U04-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'IP Topology & PoE Budget Calculation Plan',
    purpose: 'ออกแบบผังโครงสร้างเครือข่ายและการจัดสรรกำลังไฟ PoE',
    lessonMapping: ['U04-L06', 'U04-L07', 'U04-L08'],
    tasks: [
      { id: 'U04-A03-T01', type: 'equipment_selection', prompt: 'เลือกสเปก PoE Switch ให้รองรับกล้องทั้งหมดพร้อมเผื่อ Margin 20%', points: 5 },
      { id: 'U04-A03-T02', type: 'system_diagram', prompt: 'วาดผัง Network Topology แสดง IP, Subnet Mask และ Uplink Port', points: 5 },
      { id: 'U04-A03-T03', type: 'reasoning', prompt: 'คำนวณแบนด์วิดท์รวมและอธิบายเหตุผลในการแยก VLAN สำหรับ CCTV', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U04-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Network & Electrical Gate',
    purpose: 'ตรวจสอบการจัดเตรียม IP Table และความปลอดภัยด้านกำลังไฟฟ้า',
    lessonMapping: ['U04-L03', 'U04-L06', 'U04-L09'],
    tasks: [
      { id: 'U04-A04-T01', type: 'checklist', prompt: 'ตรวจสอบตาราง IP Address ไม่ให้ซ้ำซ้อนและตรวจสอบโหลดไฟรวม', points: 5 },
      { id: 'U04-A04-T02', type: 'prediction', prompt: 'คาดการณ์ผลคำสั่ง Ping ไปยัง IP ปลายทางเมื่อใส่ Gateway ผิดพลาด', points: 5 },
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
  id: 'U04-LAB01',
  unitId: 'U04',
  titleTh: 'IP Networking & PoE Budget Practical LAB',
  workOrder: 'ตั้งค่า IP Address ให้กล้องและ NVR อยู่ในวงเครือข่ายเดียวกัน ตรวจสอบ PoE Budget และทดสอบ Ping ได้ครบทุกจุด',
  functionalTests: ([
    ['T01', 'PoE Budget & Wattage Verification', true],
    ['T02', 'Static IP Configuration on Camera', true],
    ['T03', 'Subnet Mask & Gateway Integrity', true],
    ['T04', 'Ping Reachability & Round-trip Time', true],
    ['T05', 'IP Conflict Scan & Elimination', true],
    ['T06', 'Bandwidth Throughput Verification', true],
    ['T07', 'Managed Switch Port Status Audit', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U04-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U04-F01',
  unitId: 'U04',
  titleTh: 'Fault Challenge: แก้ไขปัญหา IP ชนกัน (IP Conflict) และกล้องรีสตาร์ตจากไฟ PoE ไม่พอ',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U04-R01',
  unitId: 'U04',
  titleTh: 'Reflection: ความสำคัญของการวางแผน IP และการบริหารกำลังไฟ PoE ในระบบกล้องวงจรปิด',
  prompts: [
    'หากตั้ง IP แบบ DHCP ทั้งหมดในระบบกล้องวงจรปิด จะส่งผลกระทบต่อ NVR และการบันทึกภาพอย่างไร?',
    'ทำไมต้องมีมาตรการเผื่อกำลังไฟ PoE Budget อย่างน้อย 20% ในการออกแบบสวิตช์?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit04Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U04-A01', 'U04-A02', 'U04-A03', 'U04-A04', 'U04-LAB01', 'U04-F01', 'U04-R01'],
  completionRule: {
    requiredContent: ['U04-A01', 'U04-A02', 'U04-A03', 'U04-A04', 'U04-LAB01', 'U04-F01', 'U04-R01'],
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
      id: 'U04-RULE-LAB01',
      targetId: 'U04-LAB01',
      all: [
        { contentId: 'U04-A03', condition: 'passed' },
        { contentId: 'U04-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
