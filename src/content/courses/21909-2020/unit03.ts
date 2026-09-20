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
  id: 'U03',
  courseId: 'C-21909-2020',
  number: 3,
  titleTh: 'ระบบสาย การเชื่อมต่อ และการติดตั้ง',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'จำแนกประเภทและคุณสมบัติของสายสัญญาณ (Coaxial RG6, UTP CAT5e/CAT6, Fiber Optic) ปฏิบัติการเข้าหัว BNC, RJ45 ตามมาตรฐาน T568A/T568B ตรวจสอบสัญญาณด้วย Cable Tester และติดตั้งท่อร้อยสายตามมาตรฐานความปลอดภัย',
  requiredGates: ['U03-GATE-CONCEPT', 'U03-GATE-PRELAB', 'U03-GATE-LAB'],
};

const lessonTitles = [
  'ชนิดของสายสัญญาณในระบบ CCTV (Coaxial, UTP, Fiber Optic)',
  'โครงสร้างสาย Coaxial RG6 และขั้วต่อ BNC',
  'สายคู่บิดเกลียว UTP (CAT5e, CAT6) และการป้องกันสัญญาณรบกวน',
  'มาตรฐานการเรียงสาย RJ45 (T568A vs T568B)',
  'สายใยแก้วนำแสง (Fiber Optic) และ Media Converter',
  'เครื่องมือเข้าหัวสายและการปฏิบัติตามมาตรฐานช่าง',
  'การทดสอบสายสัญญาณ (Cable Continuity & Wiremap Tester)',
  'การสูญเสียสัญญาณในสายและข้อจำกัดเรื่องระยะทาง (Attenuation & Distance)',
  'การเดินท่อร้อยสาย รางเก็บสาย และการซีลกันน้ำ (Conduit & Waterproofing)',
  'การบูรณาการทดสอบระบบสายสัญญาณรวมทั้งไซต์งาน',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U03-L${String(order).padStart(2, '0')}`,
    unitId: 'U03',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถปฏิบัติตามมาตรฐานงาน ${titleTh} ได้อย่างถูกต้องและปลอดภัย`],
    sections: [
      {
        id: `U03-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U03-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U03-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U03' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U03-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบมาตรฐานสายสัญญาณและขั้วต่อ',
    purpose: 'วัดความรู้เรื่องโครงสร้างสาย มาตรฐาน T568B และการสูญเสียในสาย',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U03-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามมาตรฐานสายสัญญาณข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U03-A01-Q12',
        type: 'reasoning',
        prompt: 'หากเดินสาย UTP CAT6 ระยะทาง 120 เมตรจาก Switch ไปยังกล้อง PoE จะเกิดผลกระทบใดและควรแก้ปัญหาอย่างไร?',
        points: 2,
        expectedConcepts: ['ethernet_100m_limit', 'poe_voltage_drop', 'poe_extender_fiber'],
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
    id: 'U03-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่สายสัญญาณ อุปกรณ์เข้าหัว และเครื่องมือทดสอบ',
    purpose: 'ประเมินการเลือกเครื่องมือและอุปกรณ์เชื่อมต่อสาย',
    lessonMapping: ['U03-L02', 'U03-L04', 'U03-L06', 'U03-L07'],
    tasks: [
      { id: 'U03-A02-T01', type: 'matching', prompt: 'จับคู่หัวต่อ BNC, RJ45, SC/LC กับสายสัญญาณ', points: 5 },
      { id: 'U03-A02-T02', type: 'classification', prompt: 'เรียงลำดับสีสาย T568B ทั้ง 8 เส้น', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U03-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'Cabling & Conduit Route Blueprint',
    purpose: 'ออกแบบเส้นทางเดินสาย ระยะทาง และจุดพักสาย',
    lessonMapping: ['U03-L03', 'U03-L08', 'U03-L09'],
    tasks: [
      { id: 'U03-A03-T01', type: 'equipment_selection', prompt: 'เลือกชนิดสายสัญญาณตามระยะทางและสภาพแวดล้อม', points: 5 },
      { id: 'U03-A03-T02', type: 'system_diagram', prompt: 'วาดผังเส้นทางเดินท่อร้อยสายและตำแหน่ง Junction Box', points: 5 },
      { id: 'U03-A03-T03', type: 'reasoning', prompt: 'อธิบายการป้องกันคลื่นรบกวนจากแนวสายไฟฟ้าแรงสูง (EMI)', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U03-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Cable Safety & Tool Readiness Gate',
    purpose: 'ตรวจสอบความปลอดภัยในการตัด ปอก เข้าหัว และการใช้เครื่องมือช่าง',
    lessonMapping: ['U03-L06', 'U03-L07', 'U03-L09'],
    tasks: [
      { id: 'U03-A04-T01', type: 'checklist', prompt: 'ตรวจสอบคีมย้ำ คัตเตอร์ เครื่องวัดสาย และอุปกรณ์ป้องกัน', points: 5 },
      { id: 'U03-A04-T02', type: 'prediction', prompt: 'คาดการณ์สถานะไฟ LED บน Cable Tester กรณีสายไขว้ (Crossover)', points: 5 },
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
  id: 'U03-LAB01',
  unitId: 'U03',
  titleTh: 'Cabling & Termination Practical LAB',
  workOrder: 'เข้าหัวสาย BNC และ RJ45 T568B ตรวจสอบสัญญาณครบ 8 เส้น และติดตั้งกล่องกันน้ำอย่างถูกต้อง',
  functionalTests: ([
    ['T01', 'Cable Stripping & Prep Inspection', true],
    ['T02', 'BNC Compression & Resistance Check', true],
    ['T03', 'RJ45 T568B Pinout Alignment', true],
    ['T04', 'Crimping Integrity & Strain Relief', true],
    ['T05', 'Cable Tester 1-8 Pin Continuity Test', true],
    ['T06', 'PoE Continuity & Loop Resistance', true],
    ['T07', 'Waterproof Gland & Conduit Sealing', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U03-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U03-F01',
  unitId: 'U03',
  titleTh: 'Fault Challenge: วินิจฉัยสายสัญญาณผิดพลาด (Open, Short, Miswire)',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U03-R01',
  unitId: 'U03',
  titleTh: 'Reflection: ความสำคัญของมาตรฐานการเข้าหัวสายและผลกระทบต่อระบบระยะยาว',
  prompts: [
    'หากเข้าหัว RJ45 หลวมหรือไม่คลุมเปลือกสาย (Jacket) จะเกิดผลเสียในระยะยาวอย่างไร?',
    'เหตุใดช่าง CCTV มืออาชีพจึงต้องใช้เครื่อง Cable Tester ตรวจสอบสายทุกเส้นก่อนส่งมอบงาน?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit03Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U03-A01', 'U03-A02', 'U03-A03', 'U03-A04', 'U03-LAB01', 'U03-F01', 'U03-R01'],
  completionRule: {
    requiredContent: ['U03-A01', 'U03-A02', 'U03-A03', 'U03-A04', 'U03-LAB01', 'U03-F01', 'U03-R01'],
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
      id: 'U03-RULE-LAB01',
      targetId: 'U03-LAB01',
      all: [
        { contentId: 'U03-A03', condition: 'passed' },
        { contentId: 'U03-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
