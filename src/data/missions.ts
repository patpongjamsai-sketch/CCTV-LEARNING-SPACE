import { requiredEquipment } from './equipment';
import type { MissionDefinition, MissionObjective } from './types';

const inspectObjectives: MissionObjective[] = requiredEquipment.map((equipment) => ({
  id: `inspect:${equipment.id}`,
  type: 'inspect',
  label: `ตรวจสอบ ${equipment.name}`,
  required: true,
  equipmentId: equipment.id,
}));

export const floor1Mission101: MissionDefinition = {
  id: 'F1-M101',
  floor: 1,
  room: 101,
  title: 'CCTV Components',
  description: 'ตรวจสอบอุปกรณ์พื้นฐาน ระบุหน้าที่และความสัมพันธ์ แล้วเตรียมชุดสำหรับงาน CCTV อย่างปลอดภัย',
  objectives: [
    ...inspectObjectives,
    { id: 'pickup:ip_camera_4mp', type: 'pickup', label: 'หยิบ IP Camera เข้ากระเป๋าช่าง', required: true, equipmentId: 'ip_camera_4mp' },
    { id: 'place:ip_camera_4mp:inspection_pad', type: 'place', label: 'วาง IP Camera บน Inspection Bench', required: true, equipmentId: 'ip_camera_4mp' },
    { id: 'answer:q_classify', type: 'select', label: 'จำแนกชุดอุปกรณ์ระบบ IP', required: false, questionId: 'q_classify' },
    { id: 'answer:q_connection', type: 'connect', label: 'วิเคราะห์เส้นทางการเชื่อมต่อ', required: false, questionId: 'q_connection' },
    { id: 'answer:q_fault', type: 'troubleshoot', label: 'วิเคราะห์อาการ NO VIDEO', required: false, questionId: 'q_fault' },
    { id: 'answer:q_budget', type: 'select', label: 'เลือกชุดอุปกรณ์ภายในงบฝึก', required: false, questionId: 'q_budget' },
  ],
  passScore: 70,
  nextMission: 'F1-M102',
};

export const floor1Mission102: MissionDefinition = {
  id: 'F1-M102',
  floor: 1,
  room: 102,
  title: 'Camera Selection & Placement',
  description: 'เปรียบเทียบ Dome, Bullet และ PTZ แล้วเลือกชนิดกล้องกับตำแหน่งติดตั้งให้เหมาะกับสถานการณ์',
  objectives: [
    { id: 'inspect:r102:dome_camera', type: 'inspect', label: 'ตรวจสอบ Dome Camera', required: true, equipmentId: 'dome_camera' },
    { id: 'inspect:r102:bullet_camera', type: 'inspect', label: 'ตรวจสอบ Bullet Camera', required: true, equipmentId: 'bullet_camera' },
    { id: 'inspect:r102:ptz_camera', type: 'inspect', label: 'ตรวจสอบ PTZ Camera', required: true, equipmentId: 'ptz_camera' },
    { id: 'test:r102:coverage_preview', type: 'test', label: 'ทดลอง Coverage Preview', required: true },
    { id: 'answer:q102_dome', type: 'answer', label: 'วิเคราะห์การใช้ Dome Camera', required: false, questionId: 'q102_dome' },
    { id: 'answer:q102_bullet', type: 'answer', label: 'วิเคราะห์การใช้ Bullet Camera', required: false, questionId: 'q102_bullet' },
    { id: 'answer:q102_ptz', type: 'answer', label: 'วิเคราะห์การใช้ PTZ Camera', required: false, questionId: 'q102_ptz' },
    { id: 'answer:q102_privacy', type: 'answer', label: 'ตรวจหลักความเป็นส่วนตัว', required: false, questionId: 'q102_privacy' },
    { id: 'answer:q102_select', type: 'select', label: 'จับคู่กล้องกับพื้นที่', required: false, questionId: 'q102_select' },
    { id: 'answer:q102_place', type: 'place', label: 'เลือกตำแหน่งติดตั้ง', required: false, questionId: 'q102_place' },
    { id: 'answer:q102_coverage', type: 'troubleshoot', label: 'แก้จุดบอดจาก Coverage Preview', required: false, questionId: 'q102_coverage' },
  ],
  passScore: 70,
  nextMission: 'F1-M103',
};

export const missions: MissionDefinition[] = [floor1Mission101, floor1Mission102];
export const missionById = new Map(missions.map((mission) => [mission.id, mission]));
