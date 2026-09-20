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
  id: 'U05',
  courseId: 'C-21909-2020',
  number: 5,
  titleTh: 'การตั้งค่า DVR และ NVR',
  theoryMinutes: 60,
  practicalMinutes: 180,
  learningOutcome:
    'ตั้งค่าเครื่องบันทึก DVR/NVR ค้นหาและเชื่อมต่อกล้องผ่านโปรโตคอล ONVIF/RTSP ปรับแต่งมาตรฐานการบีบอัดวิดีโอ (H.264 vs H.265) กำหนดอัตราเฟรมและบิตเรต และตั้งค่าฟังก์ชันตรวจจับการเคลื่อนไหว (Motion Detection) พร้อม Masking ได้อย่างถูกต้อง',
  requiredGates: ['U05-GATE-CONCEPT', 'U05-GATE-PRELAB', 'U05-GATE-LAB'],
};

const lessonTitles = [
  'สถาปัตยกรรมและเมนูการทำงานของ DVR และ NVR',
  'โปรโตคอลค้นหากล้อง (ONVIF Profile S/G/T และ Private Protocol)',
  'สตรีมวิดีโอและการเชื่อมต่อผ่าน RTSP URL',
  'การเพิ่มกล้องและการจับคู่ Channel ใน NVR',
  'การบีบอัดสัญญาณวิดีโอ (H.264, H.265 และ H.265+)',
  'การปรับตั้ง Resolution, Frame Rate (FPS) และ Bitrate (CBR vs VBR)',
  'การตั้งค่าการตรวจจับการเคลื่อนไหว (Motion Detection Grid & Sensitivity)',
  'การปิดบังพื้นที่ส่วนบุคคล (Privacy Masking Configuration)',
  'การตั้งตารางเวลาบันทึก (Recording Schedule: Continuous vs Motion)',
  'การบูรณาการทดสอบระบบบันทึกและจัดการช่องสัญญาณ NVR',
];

const lessons: LessonDefinition[] = lessonTitles.map((titleTh, index) => {
  const order = index + 1;
  const role = order === 1 ? 'foundation' : order <= 7 ? 'component' : 'integration';

  return {
    id: `U05-L${String(order).padStart(2, '0')}`,
    unitId: 'U05',
    order,
    role,
    titleTh,
    learningObjectives: [`เข้าใจและสามารถกำหนดค่า NVR/DVR ในเรื่อง ${titleTh} ได้อย่างชำนาญ`],
    sections: [
      {
        id: `U05-L${String(order).padStart(2, '0')}-CONCEPT`,
        type: 'concept',
        content: `เนื้อหาสำคัญของบทเรียน ${titleTh} ตามหลักสูตรช่างติดตั้งกล้องวงจรปิด 21909-2020`,
      },
    ],
    previousLessonId: order > 1 ? `U05-L${String(order - 1).padStart(2, '0')}` : undefined,
    nextLessonId: order < 10 ? `U05-L${String(order + 1).padStart(2, '0')}` : undefined,
  };
});

const assessment = (
  definition: Omit<AssessmentDefinition, 'unitId'>,
): AssessmentDefinition => ({ ...definition, unitId: 'U05' });

const assessments: AssessmentDefinition[] = [
  assessment({
    id: 'U05-A01',
    order: 1,
    type: 'knowledge_check',
    titleTh: 'แบบทดสอบการทำงานของ NVR และ Video Compression',
    purpose: 'วัดความเข้าใจ ONVIF, RTSP และความแตกต่างระหว่าง H.264 กับ H.265',
    lessonMapping: lessons.map((l) => l.id),
    tasks: [
      ...Array.from({ length: 11 }, (_, index) => ({
        id: `U05-A01-Q${String(index + 1).padStart(2, '0')}`,
        type: 'knowledge',
        prompt: `คำถามการตั้งค่า NVR และการบีบอัดข้อที่ ${index + 1}`,
        points: 1,
      })),
      {
        id: 'U05-A01-Q12',
        type: 'reasoning',
        prompt: 'การเปลี่ยน Codec จาก H.264 เป็น H.265 มีผลต่อ Bandwidth และ Storage อย่างไร และมีข้อจำกัดใดที่ต้องคำนึงถึง?',
        points: 2,
        expectedConcepts: ['50_percent_bandwidth_reduction', 'decoding_cpu_load', 'codec_compatibility'],
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
    id: 'U05-A02',
    order: 2,
    type: 'equipment_matching',
    titleTh: 'จับคู่พารามิเตอร์ NVR และฟังก์ชันการบันทึก',
    purpose: 'ประเมินการเลือก Bitrate, Codec และตารางการบันทึก',
    lessonMapping: ['U05-L02', 'U05-L05', 'U05-L06', 'U05-L09'],
    tasks: [
      { id: 'U05-A02-T01', type: 'matching', prompt: 'จับคู่รูปแบบการบันทึก (Continuous, Motion, Alarm) กับสถานการณ์', points: 5 },
      { id: 'U05-A02-T02', type: 'classification', prompt: 'จำแนกพารามิเตอร์ Main Stream vs Sub Stream', points: 5 },
    ],
    scoring: { maxScore: 10, weight: 10, method: 'points' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [{ type: 'matching_result', required: true }],
  }),
  assessment({
    id: 'U05-A03',
    order: 3,
    type: 'system_diagram',
    titleTh: 'NVR Channel Mapping & Motion Mask Plan',
    purpose: 'วางผังการกำหนด Channel กล้อง และพื้นที่ตรวจจับการเคลื่อนไหว',
    lessonMapping: ['U05-L04', 'U05-L07', 'U05-L08'],
    tasks: [
      { id: 'U05-A03-T01', type: 'equipment_selection', prompt: 'จัดสรรช่องสัญญาณ NVR ให้ตรงกับ IP และตำแหน่งกล้อง', points: 5 },
      { id: 'U05-A03-T02', type: 'system_diagram', prompt: 'วาดผังตาราง Motion Detection Grid และโซน Privacy Mask', points: 5 },
      { id: 'U05-A03-T03', type: 'reasoning', prompt: 'อธิบายการตั้งค่าความไว (Sensitivity) เพื่อลด False Alarm จากลมและใบไม้', points: 5 },
    ],
    scoring: { maxScore: 15, weight: 15, method: 'rubric' },
    passingRule: { type: 'minimum_percentage', value: 80 },
    evidenceRequirements: [
      { type: 'system_diagram', required: true },
      { type: 'reasoning', required: true },
    ],
  }),
  assessment({
    id: 'U05-A04',
    order: 4,
    type: 'pre_lab_gate',
    titleTh: 'Pre-LAB NVR Authorization & Gateway Gate',
    purpose: 'ตรวจสอบความพร้อมของรหัสผ่านกล้อง พอร์ต ONVIF และวงเครือข่าย',
    lessonMapping: ['U05-L02', 'U05-L03', 'U05-L04'],
    tasks: [
      { id: 'U05-A04-T01', type: 'checklist', prompt: 'ตรวจสอบ Default Password ของกล้องและพอร์ตสื่อสาร (ONVIF 80/8899/8000)', points: 5 },
      { id: 'U05-A04-T02', type: 'prediction', prompt: 'คาดการณ์สถานะ Channel เมื่อ NVR ใส่รหัสผ่านกล้องผิดพลาด', points: 5 },
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
  id: 'U05-LAB01',
  unitId: 'U05',
  titleTh: 'DVR & NVR Configuration Practical LAB',
  workOrder: 'เชื่อมต่อกล้องเข้ากับ NVR ผ่าน ONVIF ตั้งค่า H.265 ปรับ Motion Detection และกำหนด Privacy Mask ให้พร้อมใช้งาน',
  functionalTests: ([
    ['T01', 'ONVIF Camera Search & Authentication', true],
    ['T02', 'Channel Binding & Status Indicator', true],
    ['T03', 'Codec H.265 / Bitrate Optimization', true],
    ['T04', 'Live View Multi-Split Display', true],
    ['T05', 'Motion Detection Zone Trigger Test', true],
    ['T06', 'Privacy Masking Boundary Verification', true],
    ['T07', 'Continuous & Event Schedule Verification', true],
  ] as const).map(([id, titleTh, required]) => ({ id: `U05-LAB01-${id}`, titleTh, required })),
  evidenceRequirements: [
    { type: 'system_diagram', required: true },
    { type: 'safety_check', required: true },
    { type: 'functional_test', required: true },
  ],
  teacherVerification: { type: 'teacher_verification', required: true, teacherVerification: true },
  scoring: { maxScore: 30, weight: 30, method: 'rubric' },
};

const faultChallenge: FaultChallengeDefinition = {
  id: 'U05-F01',
  unitId: 'U05',
  titleTh: 'Fault Challenge: แก้ไขปัญหากล้องขึ้นสถานะ Account Locked หรือภาพกระตุกจาก Bitrate เกิน',
  requiredProcess: ['problem', 'possible_cause', 'test', 'result', 'solution', 'retest'],
  evidenceRequirements: [
    { type: 'fault_log', required: true },
    { type: 'retest_result', required: true },
  ],
  scoring: { maxScore: 15, weight: 15, method: 'rubric' },
};

const reflection: ReflectionDefinition = {
  id: 'U05-R01',
  unitId: 'U05',
  titleTh: 'Reflection: ความสมดุลระหว่างคุณภาพวิดีโอกับการบริหารทรัพยากรบนเครื่องบันทึก NVR',
  prompts: [
    'ทำไมไม่ควรตั้งค่า Bitrate และ FPS ให้สูงสุดในทุกกล้องพร้อมกัน?',
    'ประโยชน์ของการใช้ Motion-triggered Recording แทน Continuous Recording 24/7 คืออะไร?',
  ],
  evidenceRequirements: [{ type: 'reflection', required: true }],
  scoring: { maxScore: 5, weight: 5, method: 'rubric' },
};

export const unit05Content: UnitContentBundle = {
  unit,
  lessons,
  assessments,
  lab,
  faultChallenge,
  reflection,
  assessmentFlow: ['U05-A01', 'U05-A02', 'U05-A03', 'U05-A04', 'U05-LAB01', 'U05-F01', 'U05-R01'],
  completionRule: {
    requiredContent: ['U05-A01', 'U05-A02', 'U05-A03', 'U05-A04', 'U05-LAB01', 'U05-F01', 'U05-R01'],
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
      id: 'U05-RULE-LAB01',
      targetId: 'U05-LAB01',
      all: [
        { contentId: 'U05-A03', condition: 'passed' },
        { contentId: 'U05-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ],
    },
  ],
};
