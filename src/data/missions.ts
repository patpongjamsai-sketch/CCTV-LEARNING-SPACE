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
  title: 'CCTV Components & System Assembly',
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

export const floor1Mission103: MissionDefinition = {
  id: 'F1-M103',
  floor: 1,
  room: 103,
  title: 'Cabling, Termination & Continuity Lab',
  description: 'ปฏิบัติการเข้าหัวสาย RJ45 T568B และ BNC ตรวจสอบความถูกต้องด้วย Cable Tester 8 พิน',
  objectives: [
    { id: 'wire:r103:t568b_sequence', type: 'connect', label: 'เรียงลำดับสีสาย T568B ทั้ง 8 เส้นถูกต้อง', required: true },
    { id: 'crimp:r103:rj45_crimping', type: 'place', label: 'ย้ำหัวต่อ RJ45 ด้วยคีมย้ำมาตรฐาน', required: true },
    { id: 'test:r103:cable_continuity', type: 'test', label: 'ทดสอบสัญญาณผ่าน Cable Continuity Tester 1-8', required: true },
    { id: 'mount:r103:waterproof_gland', type: 'inspect', label: 'ตรวจสอบการซีลกันน้ำ Waterproof Box & Gland', required: true },
  ],
  passScore: 70,
  nextMission: 'F1-M104',
};

export const floor1Mission104: MissionDefinition = {
  id: 'F1-M104',
  floor: 1,
  room: 104,
  title: 'IP Networking & PoE Budget Workstation',
  description: 'กำหนดค่า Static IP, Subnet Mask, Gateway ให้กล้อง และคำนวณ PoE Budget บน Switch',
  objectives: [
    { id: 'config:r104:ip_addressing', type: 'select', label: 'กำหนดค่า Static IP และ Subnet ให้อยู่ในวงเดียวกัน', required: true },
    { id: 'calc:r104:poe_budget', type: 'answer', label: 'คำนวณ PoE Power Budget ไม่ให้เกินกำลังวัตต์ของ Switch', required: true },
    { id: 'test:r104:ping_verification', type: 'test', label: 'ทดสอบการติดต่อเครือข่ายด้วยคำสั่ง Ping สำเร็จ', required: true },
    { id: 'audit:r104:vlan_isolation', type: 'inspect', label: 'ตรวจสอบการแยก Security Traffic และป้องกัน IP Conflict', required: true },
  ],
  passScore: 70,
  nextMission: 'F1-M105',
};

export const floor1Mission105: MissionDefinition = {
  id: 'F1-M105',
  floor: 1,
  room: 105,
  title: 'DVR/NVR Configuration & Video Compression',
  description: 'ค้นหากล้องผ่าน ONVIF กำหนดช่องสัญญาณ สลับ Codec เป็น H.265 และตั้งค่า Privacy Mask',
  objectives: [
    { id: 'search:r105:onvif_discovery', type: 'inspect', label: 'ค้นหากล้องในเครือข่ายผ่านโปรโตคอล ONVIF', required: true },
    { id: 'bind:r105:channel_assignment', type: 'connect', label: 'จับคู่กล้องเข้ากับ NVR Channel 1-4', required: true },
    { id: 'config:r105:h265_compression', type: 'select', label: 'ปรับแต่งการบีบอัดวิดีโอเป็น H.265 เพื่อประหยัดพื้นที่', required: true },
    { id: 'mask:r105:privacy_protection', type: 'place', label: 'กำหนดพื้นที่ Privacy Mask เพื่อคุ้มครองข้อมูลส่วนบุคคล', required: true },
  ],
  passScore: 70,
  nextMission: 'F1-M106',
};

export const floor1Mission106: MissionDefinition = {
  id: 'F1-M106',
  floor: 1,
  room: 106,
  title: 'Storage Calculation & Cloud P2P Access',
  description: 'คำนวณขนาด HDD ตามระยะเวลาเก็บภาพ ติดตั้งดิสก์ และเปิดใช้งาน Cloud P2P ผ่านสมาร์ตโฟน',
  objectives: [
    { id: 'calc:r106:storage_retention', type: 'answer', label: 'คำนวณความจุ HDD (TB) ให้พอบันทึก 30 วัน', required: true },
    { id: 'format:r106:hdd_initialization', type: 'test', label: 'ติดตั้งและ Format Surveillance HDD สำเร็จ', required: true },
    { id: 'p2p:r106:cloud_activation', type: 'connect', label: 'เปิดสถานะ Cloud P2P เป็น Online', required: true },
    { id: 'qr:r106:mobile_viewing', type: 'inspect', label: 'จำลองการสแกน QR Code ดูภาพสดบนโทรศัพท์มือถือ', required: true },
  ],
  passScore: 70,
  nextMission: 'F1-M107',
};

export const floor1Mission107: MissionDefinition = {
  id: 'F1-M107',
  floor: 1,
  room: 107,
  title: 'Troubleshooting & Maintenance Detective Lab',
  description: 'วินิจฉัยและแก้ไขปัญหา NO VIDEO, แรงดันไฟตก, Ground Loop และจัดทำ PM Checklist',
  objectives: [
    { id: 'diagnose:r107:no_video_fault', type: 'troubleshoot', label: 'วิเคราะห์และแก้ไขอาการ NO VIDEO ตาม Diagnostic Tree', required: true },
    { id: 'solve:r107:ground_loop_noise', type: 'troubleshoot', label: 'ขจัดสัญญาณรบกวน Hum Bars ด้วย Ground Loop Isolator', required: true },
    { id: 'measure:r107:voltage_drop', type: 'test', label: 'วัดแรงดันไฟปลายสายและแก้ปัญหาไฟตก', required: true },
    { id: 'pm:r107:maintenance_checklist', type: 'inspect', label: 'ตรวจเช็คทำความสะอาดเลนส์และเซ็นรับรองแบบฟอร์ม PM', required: true },
  ],
  passScore: 70,
  nextMission: 'F1-M108',
};

export const floor1Mission108: MissionDefinition = {
  id: 'F1-M108',
  floor: 1,
  room: 108,
  title: 'Capstone Integrated CCTV Project',
  description: 'บูรณาการออกแบบระบบ CCTV เต็มรูปแบบ จัดทำ BOM ตรวจรับระบบ และส่งมอบงาน Turnkey',
  objectives: [
    { id: 'design:r108:site_topology', type: 'place', label: 'วางผังอุปกรณ์ครบวงจรทั้งกล้อง สวิตช์ NVR และจอภาพ', required: true },
    { id: 'bom:r108:cost_estimation', type: 'select', label: 'จัดทำบัญชีวัสดุ Bill of Materials และงบประมาณโครงการ', required: true },
    { id: 'commission:r108:full_testing', type: 'test', label: 'ตรวจรับระบบ (Acceptance Test) Live View, บันทึก และ Cloud', required: true },
    { id: 'handover:r108:final_signoff', type: 'inspect', label: 'จัดเตรียมเอกสารส่งมอบงาน Handover Certificate', required: true },
  ],
  passScore: 80,
  nextMission: null,
};

export const missions: MissionDefinition[] = [
  floor1Mission101,
  floor1Mission102,
  floor1Mission103,
  floor1Mission104,
  floor1Mission105,
  floor1Mission106,
  floor1Mission107,
  floor1Mission108,
];

export const missionById = new Map(missions.map((mission) => [mission.id, mission]));
