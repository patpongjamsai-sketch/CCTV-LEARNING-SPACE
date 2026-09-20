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
  id: 'U01',
  courseId: 'C-21909-2020',
  number: 1,
  titleTh: 'พื้นฐานและองค์ประกอบระบบ CCTV',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'อธิบายหลักการและองค์ประกอบของระบบ CCTV เปรียบเทียบ Analog, HD Analog และ IP Camera และประกอบระบบพื้นฐานเพื่อแสดงภาพและบันทึกภาพได้อย่างถูกต้องและปลอดภัย',
  requiredGates: ['U01-GATE-CONCEPT', 'U01-GATE-PRELAB', 'U01-GATE-LAB'],
};

const lessonTitles = [
  'รู้จักระบบ CCTV',
  'Camera: จุดเริ่มต้นของภาพ',
  'DVR และ NVR: ศูนย์กลางของระบบบันทึก',
  'HDD และการบันทึก',
  'Monitor และการแสดงผล',
  'Switch และ Router',
  'Power Supply และ PoE',
  'Signal / Power / Recording Path',
  'Analog vs HD Analog vs IP Camera',
  'System Compatibility',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U01-L${String(order).padStart(2, '0')}`,
    unitId: 'U01',
    order,
    role,
    titleTh,
    learningObjectives: [`อธิบายและนำแนวคิดเรื่อง ${titleTh} ไปเชื่อมกับระบบ CCTV ได้`],
    sections: [
      {
        id: `U01-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาหลักของ ${titleTh} ตามขอบเขต Unit 1`,
      },
    ],
    previousLessonId: order > 1 ? `U01-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U01-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U01' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U01-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบตรวจความเข้าใจระบบ CCTV',
    purpose: 'ตรวจ Mental Model ขององค์ประกอบและเส้นทางภาพ/การบันทึก',
    lessonMapping: lessons.map((lesson) => lesson.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U01-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามความรู้พื้นฐานข้อ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U01-A01-Q12',
        type: 'reasoning',
        prompt: 'Live View ทำงานแต่ Playback ไม่ทำงาน ควรตรวจ Function/Path ใดต่อ?',
        points: 2,
        expectedConcepts: ['recording', 'storage', 'playback_path'],
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
    id: 'U01-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่ Equipment กับหน้าที่',
    purpose: 'ตรวจการระบุหน้าที่ของอุปกรณ์ก่อนนำไปประกอบระบบ',
    lessonMapping: ['U01-L02', 'U01-L03', 'U01-L04', 'U01-L05', 'U01-L06', 'U01-L07'],
    tasks: [
      { id: 'U01-A02-T01', type: 'matching', prompt: 'จับคู่อุปกรณ์กับหน้าที่', points: 5 },
      { id: 'U01-A02-T02', type: 'classification', prompt: 'จำแนกอุปกรณ์ของ IP CCTV', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U01-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'CCTV System Puzzle',
    purpose: 'เชื่อมโยง Requirement, Architecture, Equipment และ Function',
    lessonMapping: ['U01-L03', 'U01-L06', 'U01-L08', 'U01-L09', 'U01-L10'],
    tasks: [
      { id: 'U01-A03-T01', type: 'equipment_selection', prompt: 'เลือกอุปกรณ์ให้ตรง Requirement', points: 5 },
      { id: 'U01-A03-T02', type: 'system_diagram', prompt: 'วาดความสัมพันธ์ IP Camera → Switch → NVR', points: 5 },
      { id: 'U01-A03-T03', type: 'reasoning', prompt: 'อธิบายเหตุผลของ Architecture ที่เลือก', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U01-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Preparation และ Safety Gate',
    purpose: 'ตรวจความพร้อม อุปกรณ์ แผนผัง Power และความปลอดภัยก่อนจ่ายไฟ',
    lessonMapping: ['U01-L07', 'U01-L08', 'U01-L10'],
    tasks: [
      { id: 'U01-A04-T01', type: 'checklist', prompt: 'ตรวจ Equipment, Port และ Power Requirement', points: 5 },
      { id: 'U01-A04-T02', type: 'prediction', prompt: 'คาดการณ์ผล Live View, Recording และ Playback', points: 5 },
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
  id: 'U01-LAB01',
  unitId: 'U01',
  titleTh: 'Basic CCTV System LAB',
  workOrder: 'ประกอบระบบ CCTV พื้นฐานให้แสดงภาพ บันทึกภาพ และเรียกดูภาพย้อนหลังได้อย่างปลอดภัย',
  functionalTests: ([
    ['T01', 'Power', true],
    ['T02', 'Camera Active', true],
    ['T03', 'Connection', true],
    ['T04', 'Live View', true],
    ['T05', 'Recording', true],
    ['T06', 'Playback', true],
    ['T07', 'Diagram vs Actual System', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U01-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U01-F01',
  unitId: 'U01',
  titleTh: 'Fault Challenge: วิเคราะห์ปัญหาด้วยหลักฐาน',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U01-R01',
  unitId: 'U01',
  titleTh: 'Reflection & Evidence',
  prompts: [
    'ระบบที่ประกอบเป็น Architecture แบบใด และเพราะอะไร?',
    'Evidence ใดทำให้คุณตัดสมมติฐานของ Fault ออกได้?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit01Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U01-A01', 'U01-A02', 'U01-A03', 'U01-A04', 'U01-LAB01', 'U01-F01', 'U01-R01'],
  completionRule: {
    requiredContent: ['U01-A01', 'U01-A02', 'U01-A03', 'U01-A04', 'U01-LAB01', 'U01-F01', 'U01-R01'],
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
      id: 'U01-RULE-LAB01',
      targetId: 'U01-LAB01',
      all: [
        { contentId: 'U01-A03', condition: 'passed' },
        { contentId: 'U01-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
