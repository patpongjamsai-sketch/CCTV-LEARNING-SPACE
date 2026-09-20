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
  id: 'U02',
  courseId: 'C-21909-2020',
  number: 2,
  titleTh: 'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'เปรียบเทียบชนิดของกล้องวงจรปิด (Dome, Bullet, PTZ) เลือกขนาดเลนส์และมุมมองภาพ (FOV) ให้สอดคล้องกับพื้นที่ ติดตั้งตามมาตรฐานความปลอดภัยและความเป็นส่วนตัว พร้อมทดสอบ Coverage Area และขจัดจุดบอด',
  requiredGates: ['U02-GATE-CONCEPT', 'U02-GATE-PRELAB', 'U02-GATE-LAB'],
};

const lessonTitles = [
  'ชนิดและรูปทรงของกล้องวงจรปิด (Dome, Bullet, PTZ, Turret)',
  'เซนเซอร์รับภาพและขนาดเลนส์ (Sensor & Focal Length)',
  'มุมมองภาพ (FOV) และเกณฑ์ระยะ DORI',
  'การทำงานในที่มืดและสภาพแสงย้อน (IR, White Light, WDR)',
  'มาตรฐานความทนทานและสิ่งแวดล้อม (IP66, IP67, IK10)',
  'การสำรวจพื้นที่และวางตำแหน่งกล้อง (Site Survey)',
  'การวิเคราะห์และแก้ไขจุดบอด (Blind Spot & Overlap)',
  'ความเป็นส่วนตัวและกรอบกฎหมาย (Privacy & PDPA)',
  'อุปกรณ์ยึดจับและกล่องพักสาย (Mounting & Junction Box)',
  'การบูรณาการเลือกกล้องตามโจทย์สถานการณ์จริง',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U02-L${String(order).padStart(2, '0')}`,
    unitId: 'U02',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถประยุกต์ใช้ความรู้เรื่อง ${titleTh} ในงานติดตั้งกล้องวงจรปิดได้`],
    sections: [
      {
        id: `U02-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U02-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U02-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U02' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U02-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบคุณลักษณะของกล้องและเลนส์',
    purpose: 'วัดความเข้าใจชนิดกล้อง ขนาดเลนส์ และระยะ DORI',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U02-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามคุณลักษณะกล้องข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U02-A01-Q12',
        type: 'reasoning',
        prompt: 'หากต้องการจับภาพป้ายทะเบียนรถที่ทางเข้า ควรเลือกระยะเลนส์และตำแหน่งกล้องอย่างไร?',
        points: 2,
        expectedConcepts: ['focal_length', 'dori_identification', 'mounting_angle'],
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
    id: 'U02-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่ชนิดกล้องกับพื้นที่ติดตั้ง',
    purpose: 'ประเมินความสามารถในการเลือกกล้องให้เหมาะกับสภาพแวดล้อมจริง',
    lessonMapping: ['U02-L01', 'U02-L04', 'U02-L05', 'U02-L06'],
    tasks: [
      { id: 'U02-A02-T01', type: 'matching', prompt: 'จับคู่กล้อง (Dome, Bullet, PTZ) กับจุดติดตั้ง', points: 5 },
      { id: 'U02-A02-T02', type: 'classification', prompt: 'จำแนกระดับมาตรฐาน IP Rating และ IK Rating', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U02-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'Camera Coverage & Layout Plan',
    purpose: 'ออกแบบผังตำแหน่งกล้องและขอบเขตมุมมอง (FOV) ลดจุดบอด',
    lessonMapping: ['U02-L03', 'U02-L06', 'U02-L07', 'U02-L08'],
    tasks: [
      { id: 'U02-A03-T01', type: 'equipment_selection', prompt: 'เลือกชนิดกล้องและเลนส์ตามผังอาคาร', points: 5 },
      { id: 'U02-A03-T02', type: 'system_diagram', prompt: 'วาดผังมุมกล้องและแนวครอบคลุม (Coverage Map)', points: 5 },
      { id: 'U02-A03-T03', type: 'reasoning', prompt: 'อธิบายการป้องกันจุดอับและการปกป้องความเป็นส่วนตัว', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U02-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Safety Gate & Physical Checklist',
    purpose: 'ตรวจสอบความปลอดภัยในการทำงานที่สูงและเครื่องมือยึดจับ',
    lessonMapping: ['U02-L05', 'U02-L08', 'U02-L09'],
    tasks: [
      { id: 'U02-A04-T01', type: 'checklist', prompt: 'ตรวจสอบอุปกรณ์ความปลอดภัย PPE บันได และกล่องกันน้ำ', points: 5 },
      { id: 'U02-A04-T02', type: 'prediction', prompt: 'คาดการณ์มุมภาพและระยะแสงอินฟราเรดสะท้อนผนัง', points: 5 },
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
  id: 'U02-LAB01',
  unitId: 'U02',
  titleTh: 'Camera Selection & Placement Practical LAB',
  workOrder: 'ติดตั้งกล้อง ปรับมุมก้มเงย ตรวจสอบระยะ DORI และลดจุดบอดตามข้อกำหนดหน้างาน',
  functionalTests: ([
    ['T01', 'Physical Mounting & Alignment', true],
    ['T02', 'Focal Length & FOV Verification', true],
    ['T03', 'DORI Test Target Recognition', true],
    ['T04', 'WDR & Backlight Adjustment', true],
    ['T05', 'IR Reflection Inspection', true],
    ['T06', 'Privacy Mask Configuration', true],
    ['T07', 'Blind Spot Elimination Audit', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U02-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U02-F01',
  unitId: 'U02',
  titleTh: 'Fault Challenge: แก้ไขปัญหาภาพสะท้อนแสงอินฟราเรด (IR Bleed/Reflection)',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U02-R01',
  unitId: 'U02',
  titleTh: 'Reflection: การเลือกตำแหน่งกล้องที่สมดุลระหว่างความครอบคลุมและความเป็นส่วนตัว',
  prompts: [
    'การเลือกเลนส์มุมกว้าง (2.8mm) กับเลนส์มุมแคบ (6mm) ส่งผลต่อรายละเอียดภาพของใบหน้าคนอย่างไร?',
    'คุณมีแนวทางจัดการจุดอับ (Blind spot) โดยไม่ให้กระทบต่อความเป็นส่วนตัวของผู้อื่นอย่างไร?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit02Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U02-A01', 'U02-A02', 'U02-A03', 'U02-A04', 'U02-LAB01', 'U02-F01', 'U02-R01'],
  completionRule: {
    requiredContent: ['U02-A01', 'U02-A02', 'U02-A03', 'U02-A04', 'U02-LAB01', 'U02-F01', 'U02-R01'],
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
      id: 'U02-RULE-LAB01',
      targetId: 'U02-LAB01',
      all: [
        { contentId: 'U02-A03', condition: 'passed' },
        { contentId: 'U02-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
