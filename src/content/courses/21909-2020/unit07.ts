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
  id: 'U07',
  courseId: 'C-21909-2020',
  number: 7,
  titleTh: 'การตรวจสอบ แก้ไขปัญหา และบำรุงรักษา',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'ประยุกต์ใช้กระบวนการวินิจฉัยปัญหาอย่างเป็นระบบ (6-Step Troubleshooting) ตรวจสอบและแก้ไขอาการเสียยอดนิยม (NO VIDEO, สัญญาณรบกวน Hum Bars, แรงดันไฟตก, IP Conflict) และปฏิบัติตามแผนบำรุงรักษาเชิงป้องกัน (Preventive Maintenance Checklist) ได้ตามมาตรฐานวิชาชีพ',
  requiredGates: ['U07-GATE-CONCEPT', 'U07-GATE-PRELAB', 'U07-GATE-LAB'],
};

const lessonTitles = [
  'กระบวนการสืบค้นและวินิจฉัยปัญหาอย่างเป็นระบบ (Diagnostic Tree)',
  'การวิเคราะห์และแก้ไขอาการ NO VIDEO (ภาพไม่ขึ้น)',
  'การวิเคราะห์ปัญหาสัญญาณรบกวน คลื่นลาย และ Ground Loop',
  'การตรวจสอบปัญหาแรงดันไฟตก (Voltage Drop) และสายสัญญาณเสื่อมสภาพ',
  'การแก้ไขปัญหาภาพเบลอ โฟกัสหลุด และไอน้ำในหน้าเลนส์',
  'การแก้ปัญหาการเชื่อมต่อเครือข่ายและ Packet Loss',
  'เครื่องมือวัดและทดสอบขั้นสูงสำหรับช่างซ่อมบำรุง (CCTV Tester)',
  'การจัดทำแผนบำรุงรักษาเชิงป้องกัน (Preventive Maintenance Checklist)',
  'เทคนิคการทำความสะอาดเลนส์ เคส และการตรวจสอบข้อต่อภายนอก',
  'การบูรณาการบันทึกรายงานปัญหาและประวัติการซ่อมบำรุง (Service Report)',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U07-L${String(order).padStart(2, '0')}`,
    unitId: 'U07',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถวินิจฉัย ซ่อมแซม และบำรุงรักษาในเรื่อง ${titleTh} ได้อย่างมีหลักการ`],
    sections: [
      {
        id: `U07-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U07-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U07-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U07' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U07-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบอาการเสียและการวินิจฉัยระบบ CCTV',
    purpose: 'วัดความเข้าใจลำดับการตัดสาเหตุ (Isolation) และอาการเสียเฉพาะทาง',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U07-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามการแก้ไขปัญหาและการบำรุงรักษาข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U07-A01-Q12',
        type: 'reasoning',
        prompt: 'ภาพจากกล้องวงจรปิดแบบอนาล็อกมีริ้วคลื่นลายวิ่งขึ้นลง (Rolling Hum Bars) เกิดจากสาเหตุใดและแก้ไขอย่างไร?',
        points: 2,
        expectedConcepts: ['ground_loop', 'ground_loop_isolator', 'common_ground_potential'],
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
    id: 'U07-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่อาการเสียกับสาเหตุและเครื่องมือวัด',
    purpose: 'ประเมินการเลือกใช้เครื่องมือทดสอบและระบุสาเหตุข้อบกพร่อง',
    lessonMapping: ['U07-L02', 'U07-L03', 'U07-L04', 'U07-L07'],
    tasks: [
      { id: 'U07-A02-T01', type: 'matching', prompt: 'จับคู่อาการเสีย (NO VIDEO, IR reflection, Hum bars, IP drop) กับวิธีแก้ไข', points: 5 },
      { id: 'U07-A02-T02', type: 'classification', prompt: 'จัดหมวดหมู่เครื่องมือตรวจวัด (Multimeter, CCTV Tester, Cable Tester, Ping Tool)', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U07-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'Diagnostic Tree & Troubleshooting Flowchart',
    purpose: 'เขียนแผนผังลำดับการวิเคราะห์ปัญหาอย่างเป็นขั้นตอนตามหลักสากล',
    lessonMapping: ['U07-L01', 'U07-L02', 'U07-L04'],
    tasks: [
      { id: 'U07-A03-T01', type: 'equipment_selection', prompt: 'เลือกจุดทดสอบและเครื่องมือที่ต้องใช้ในแต่ละโหนดการตรวจ', points: 5 },
      { id: 'U07-A03-T02', type: 'system_diagram', prompt: 'เขียนผังการตัดสินใจ (Decision Tree) เมื่อพบอาการ NO VIDEO', points: 5 },
      { id: 'U07-A03-T03', type: 'reasoning', prompt: 'อธิบายเหตุผลว่าทำไมต้องเริ่มตรวจจาก Power และ Physical Layer ก่อน Software', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U07-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Diagnostic Safety & Tool Gate',
    purpose: 'ตรวจสอบความปลอดภัยทางไฟฟ้าก่อนสัมผัสอุปกรณ์และเครื่องมือวัด',
    lessonMapping: ['U07-L04', 'U07-L07', 'U07-L09'],
    tasks: [
      { id: 'U07-A04-T01', type: 'checklist', prompt: 'ตรวจสอบฉนวนเครื่องมือวัด มิเตอร์ และการตัดไฟก่อนถอดชิ้นส่วน', points: 5 },
      { id: 'U07-A04-T02', type: 'prediction', prompt: 'คาดการณ์ค่าแรงดันไฟที่วัดได้จากปลายสายเมื่อสายยาว 80 เมตรและมีโหลด', points: 5 },
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
  id: 'U07-LAB01',
  unitId: 'U07',
  titleTh: 'Troubleshooting & Maintenance Practical LAB',
  workOrder: 'จำลองการแก้ปัญหา 3 อาการเสีย (NO VIDEO, ไฟตก, IP Conflict) และทำการบำรุงรักษา Preventive Maintenance ครบถ้วน',
  functionalTests: ([
    ['T01', 'Power & Voltage Level Measurement', true],
    ['T02', 'Cabling & Continuity Fault Isolation', true],
    ['T03', 'Network IP Conflict Resolution', true],
    ['T04', 'Ground Loop Hum Bar Elimination', true],
    ['T05', 'Lens Cleaning & Waterproof Gasket Inspection', true],
    ['T06', 'Firmware & Password Security Audit', true],
    ['T07', 'Preventive Maintenance Service Report Signoff', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U07-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U07-F01',
  unitId: 'U07',
  titleTh: 'Fault Challenge: แก้ไขปัญหาอาการเสียซับซ้อน (PoE Drop เมื่อเปิดโหมดกลางคืน)',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U07-R01',
  unitId: 'U07',
  titleTh: 'Reflection: จรรยาบรรณช่างเทคนิคและการบำรุงรักษาเชิงป้องกัน',
  prompts: [
    'การมี Preventive Maintenance Checklist เป็นประจำทุก 6 เดือนช่วยลดความเสียหายต่อลูกค้าได้อย่างไร?',
    'หากพบอุปกรณ์ทำงานผิดปกติแต่ยังไม่ถึงขั้นดับสนิท ช่างที่ดีควรดำเนินการอย่างไร?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit07Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U07-A01', 'U07-A02', 'U07-A03', 'U07-A04', 'U07-LAB01', 'U07-F01', 'U07-R01'],
  completionRule: {
    requiredContent: ['U07-A01', 'U07-A02', 'U07-A03', 'U07-A04', 'U07-LAB01', 'U07-F01', 'U07-R01'],
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
      id: 'U07-RULE-LAB01',
      targetId: 'U07-LAB01',
      all: [
        { contentId: 'U07-A03', condition: 'passed' },
        { contentId: 'U07-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
