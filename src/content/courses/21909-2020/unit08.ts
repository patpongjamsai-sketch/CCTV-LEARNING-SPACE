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
  id: 'U08',
  courseId: 'C-21909-2020',
  number: 8,
  titleTh: 'โครงงานบูรณาการระบบ CCTV',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'บูรณาการความรู้และทักษะทั้งหมดในการสำรวจความต้องการของลูกค้า ออกแบบผังระบบกล้องวงจรปิด จัดทำรายการวัสดุและประมาณการราคา (Bill of Materials: BOM) ติดตั้งและตั้งค่าระบบเบ็ดเสร็จ และจัดทำเอกสารส่งมอบงาน (Commissioning & Handover) ตามมาตรฐานวิชาชีพ',
  requiredGates: ['U08-GATE-CONCEPT', 'U08-GATE-PRELAB', 'U08-GATE-LAB'],
};

const lessonTitles = [
  'การรับฟังความต้องการของลูกค้าและวิเคราะห์ความเสี่ยง (Customer Needs)',
  'การสำรวจพื้นที่และการจัดทำผังหน้างานจริง (Site Survey & Floor Plan)',
  'การเลือกอุปกรณ์ที่เข้ากันได้และมีประสิทธิภาพสูงสุด (Compatibility)',
  'การจัดทำบัญชีแสดงปริมาณวัสดุและราคา (Bill of Materials: BOM)',
  'แผนการเดินสาย ท่อ และการจ่ายไฟอย่างปลอดภัย (Cabling & Power Plan)',
  'แผนผังเครือข่ายและความมั่นคงปลอดภัยทางไซเบอร์ (Cybersecurity Plan)',
  'การดำเนินการติดตั้งและการประสานงานหน้างาน (Project Management)',
  'การทดสอบระบบและการส่งมอบงาน (Commissioning & Acceptance Test)',
  'การฝึกอบรมผู้ใช้งานและการจัดทำคู่มือการใช้งาน (User Training & Manual)',
  'การนำเสนอผลงานโครงงานและการประเมินสมรรถนะช่าง (Project Defense)',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U08-L${String(order).padStart(2, '0')}`,
    unitId: 'U08',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถบูรณาการทักษะช่างระดับมืออาชีพในเรื่อง ${titleTh} ได้อย่างสมบูรณ์`],
    sections: [
      {
        id: `U08-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U08-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U08-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U08' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U08-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบการจัดการโครงงานและมาตรฐานส่งมอบงาน',
    purpose: 'วัดความเข้าใจกระบวนการทำ BOM, เกณฑ์ Acceptance Criteria และเอกสารส่งมอบ',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U08-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามโครงงานบูรณาการข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U08-A01-Q12',
        type: 'reasoning',
        prompt: 'เอกสารตรวจรับงาน (Handover Document) ควรประกอบด้วยหัวข้อสำคัญใดบ้างเพื่อให้ลูกค้ามั่นใจในระบบ?',
        points: 2,
        expectedConcepts: ['as_built_drawing', 'ip_table', 'warranty_terms', 'user_training_signoff'],
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
    id: 'U08-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่รายการอุปกรณ์กับงบประมาณและ BOM',
    purpose: 'ประเมินการจัดสรร Bill of Materials และการควบคุมต้นทุนโครงการ',
    lessonMapping: ['U08-L03', 'U08-L04', 'U08-L05'],
    tasks: [
      { id: 'U08-A02-T01', type: 'matching', prompt: 'จัดสรรอุปกรณ์หลักและอุปกรณ์สิ้นเปลืองเข้าสู่หมวดหมู่ BOM', points: 5 },
      { id: 'U08-A02-T02', type: 'classification', prompt: 'คำนวณต้นทุนรวมและค่าแรงติดตั้งให้สอดคล้องกับงบประมาณจำลอง', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U08-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'Comprehensive Master CCTV System Blueprint',
    purpose: 'เขียนผังรวมทั้งระบบ (Floor Plan, Single Line Diagram, IP Map และ Storage Scheme)',
    lessonMapping: ['U08-L02', 'U08-L05', 'U08-L06'],
    tasks: [
      { id: 'U08-A03-T01', type: 'equipment_selection', prompt: 'เลือกสเปกกล้อง สวิตช์ เครื่องบันทึก และอุปกรณ์ป้องกันไฟฟ้ากระชาก (Surge Protection)', points: 5 },
      { id: 'U08-A03-T02', type: 'system_diagram', prompt: 'วาดผัง Master Topology แสดงความเชื่อมโยงทุกอุปกรณ์', points: 5 },
      { id: 'U08-A03-T03', type: 'reasoning', prompt: 'นำเสนอเหตุผลด้านความคุ้มค่า ความปลอดภัย และการรองรับการขยายตัวในอนาคต', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U08-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB Project Commissioning Safety Gate',
    purpose: 'ตรวจสอบความปลอดภัยโดยรวมของระบบไฟฟ้า ท่อร้อยสาย และการจัดเก็บก่อนปล่อยกระแสไฟจริง',
    lessonMapping: ['U08-L05', 'U08-L07', 'U08-L08'],
    tasks: [
      { id: 'U08-A04-T01', type: 'checklist', prompt: 'ตรวจสอบสายดิน ระบบสำรองไฟ UPS และการป้องกันไฟกระชาก', points: 5 },
      { id: 'U08-A04-T02', type: 'prediction', prompt: 'คาดการณ์ระยะเวลาสำรองไฟของระบบเมื่อเกิดเหตุไฟดับกะทันหัน', points: 5 },
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
  id: 'U08-LAB01',
  unitId: 'U08',
  titleTh: 'Capstone Integrated CCTV Project Practical LAB',
  workOrder: 'จำลองการส่งมอบโครงการระบบกล้องวงจรปิดแบบเบ็ดเสร็จ (Turnkey CCTV Solution) ตรวจรับตามเกณฑ์มาตรฐาน และออกใบรับรองส่งมอบ',
  functionalTests: ([
    ['T01', 'Master Hardware & Rack Installation Audit', true],
    ['T02', 'Full Channel Live View 1080p Verification', true],
    ['T03', 'Continuous 24/7 & Event Recording Validation', true],
    ['T04', 'Cloud P2P & Multi-User Permission Testing', true],
    ['T05', 'UPS Power Failover Simulation', true],
    ['T06', 'Cyber Hardening & Security Audit Signoff', true],
    ['T07', 'Customer Handover Acceptance Signoff', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U08-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U08-F01',
  unitId: 'U08',
  titleTh: 'Fault Challenge: การแก้ปัญหาหน้างานจริงก่อนส่งมอบ (Client Punch List)',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U08-R01',
  unitId: 'U08',
  titleTh: 'Reflection: ความภาคภูมิใจและสมรรถนะช่างเทคนิคระบบกล้องวงจรปิดมืออาชีพ',
  prompts: [
    'จากการเรียนรู้และปฏิบัติครบทั้ง 8 หน่วย สิ่งใดคือทักษะสำคัญที่สุดในการเป็นช่าง CCTV มืออาชีพ?',
    'คุณจะนำจรรยาบรรณวิชาชีพและการปกป้องความเป็นส่วนตัวไปใช้ในการทำงานจริงในอนาคตอย่างไร?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit08Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U08-A01', 'U08-A02', 'U08-A03', 'U08-A04', 'U08-LAB01', 'U08-F01', 'U08-R01'],
  completionRule: {
    requiredContent: ['U08-A01', 'U08-A02', 'U08-A03', 'U08-A04', 'U08-LAB01', 'U08-F01', 'U08-R01'],
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
      id: 'U08-RULE-LAB01',
      targetId: 'U08-LAB01',
      all: [
        { contentId: 'U08-A03', condition: 'passed' },
        { contentId: 'U08-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
