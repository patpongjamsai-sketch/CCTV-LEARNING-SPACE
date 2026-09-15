import type { LearningQuestion } from './types';

export const learningQuestions: LearningQuestion[] = [
  {
    id: 'q_ip_camera', triggerEquipmentId: 'ip_camera_4mp', category: 'knowledge', points: 4,
    prompt: 'IP Camera ส่งภาพไปยัง NVR ผ่านระบบใด',
    choices: ['เครือข่าย Ethernet', 'สายไฟ AC เท่านั้น', 'พอร์ต HDMI จากกล้อง', 'HDD โดยตรง'], answer: 0,
    explanation: 'IP Camera ส่งข้อมูลผ่านเครือข่าย และอาจรับไฟผ่าน PoE เมื่ออุปกรณ์รองรับ',
    hint: 'สังเกตพอร์ต RJ45 ของกล้อง',
  },
  {
    id: 'q_dvr', triggerEquipmentId: 'dvr_8ch', category: 'knowledge', points: 4,
    prompt: 'ก่อนต่อกล้องเข้ากับ DVR ควรตรวจข้อมูลใดก่อน',
    choices: ['ชนิดสัญญาณและจำนวนช่องที่รองรับ', 'สีของตัวเครื่อง', 'ขนาดเมาส์', 'ชื่อ Wi-Fi'], answer: 0,
    explanation: 'DVR ต้องรองรับชนิดสัญญาณของกล้องและมีช่องเพียงพอ', hint: 'ดูป้ายรุ่นและพอร์ต BNC',
  },
  {
    id: 'q_nvr', triggerEquipmentId: 'nvr_8ch', category: 'knowledge', points: 4,
    prompt: 'เครื่องบันทึกใดเหมาะกับ IP Camera 4 ตัวผ่าน PoE Switch',
    choices: ['NVR อย่างน้อย 4 ช่อง', 'DVR Analog เท่านั้น', 'Monitor', 'UPS'], answer: 0,
    explanation: 'NVR รับสตรีมจาก IP Camera และต้องมีจำนวนช่องเพียงพอ', hint: 'ระบบนี้ส่งข้อมูลผ่าน Ethernet',
  },
  {
    id: 'q_poe', triggerEquipmentId: 'poe_switch_8port', category: 'knowledge', points: 4,
    prompt: 'PoE Switch มีหน้าที่หลักอะไรในระบบ IP CCTV',
    choices: ['ส่งข้อมูลและจ่ายไฟผ่าน Ethernet', 'บันทึกภาพแทน NVR', 'แสดงภาพแทน Monitor', 'แปลง HDMI เป็น Coaxial'], answer: 0,
    explanation: 'PoE Switch รวมการรับส่งข้อมูลและจ่ายไฟให้กล้องที่รองรับ PoE', hint: 'PoE ย่อมาจาก Power over Ethernet',
  },
  {
    id: 'q_hdd', triggerEquipmentId: 'surveillance_hdd_2tb', category: 'knowledge', points: 4,
    prompt: 'HDD ทำหน้าที่ใดในระบบ CCTV',
    choices: ['เก็บข้อมูลภาพย้อนหลัง', 'รับภาพแทน Camera', 'จ่ายไฟให้ Switch', 'กำหนด IP Address'], answer: 0,
    explanation: 'HDD ภายใน Recorder ใช้เก็บข้อมูลเพื่อค้นหาและ Playback ภายหลัง', hint: 'นึกถึงคำว่า Storage',
  },
  {
    id: 'q_classify', category: 'selection', points: 5,
    prompt: 'ชุดใดเป็นอุปกรณ์ของระบบ IP CCTV ทั้งหมด',
    choices: ['IP Camera, CAT6, PoE Switch, NVR', 'Analog Camera, Coaxial, NVR, BNC', 'IP Camera, BNC, DVR, CAT6', 'Monitor, UPS, BNC, Router'], answer: 0,
    explanation: 'ระบบ IP ใช้ IP Camera, Ethernet/CAT6, Switch และ NVR', hint: 'มองหาเส้นทางที่ใช้ RJ45 ต่อเนื่อง',
  },
  {
    id: 'q_connection', category: 'connection', points: 25,
    prompt: 'เส้นทางใดถูกต้องสำหรับระบบ IP Camera ที่ใช้ PoE',
    choices: ['IP Camera → CAT6 → PoE Switch → NVR → HDMI → Monitor', 'IP Camera → Coaxial → BNC → NVR', 'Monitor → CAT6 → Camera → HDD', 'HDD → Router → Monitor → Camera'], answer: 0,
    explanation: 'ภาพจาก IP Camera เดินทางผ่าน Ethernet และ PoE Switch ไปยัง NVR ก่อนแสดงผล', hint: 'เริ่มจาก Camera และจบที่ Monitor',
  },
  {
    id: 'q_fault', category: 'problem', points: 15,
    prompt: 'กล้องหนึ่งตัวขึ้น NO VIDEO แต่กล้องอื่นปกติ ควรตรวจอะไรเป็นลำดับแรก',
    choices: ['Power และการเชื่อมต่อของกล้องจุดนั้น', 'Format HDD ทันที', 'Factory Reset ทุกอุปกรณ์', 'เปลี่ยน Router โดยไม่ทดสอบ'], answer: 0,
    explanation: 'เริ่มจาก Power และ Connection เพราะปลอดภัย กระทบน้อย และช่วยแยกสาเหตุได้', hint: 'เริ่มจากชั้นพื้นฐานที่สุดก่อนเปลี่ยนค่าระบบ',
  },
  {
    id: 'q_budget', category: 'budget', points: 10,
    prompt: 'งบฝึก 9,000 บาท ชุดใดเข้ากันได้และไม่เกินงบ',
    choices: ['IP Camera 1,850 + PoE Switch 2,800 + NVR 3,900 = 8,550', 'IP Camera + BNC + DVR = 5,070', 'Analog Camera + PoE Switch + NVR = 7,650', 'Monitor เพียงเครื่องเดียว = 2,700'], answer: 0,
    explanation: 'ชุดแรกเป็นระบบ IP ที่อุปกรณ์เข้ากันและรวมราคาเพื่อการฝึก 8,550 บาท', hint: 'ตรวจทั้งชนิดระบบและผลรวมราคา ไม่เลือกจากราคาต่ำอย่างเดียว',
  },
  {
    id: 'q102_dome', triggerEquipmentId: 'dome_camera', category: 'knowledge', points: 5,
    prompt: 'Dome Camera เหมาะกับงานใดมากที่สุดในสถานการณ์ฝึกนี้',
    choices: ['ติดเพดานภายใน Lobby', 'เฝ้าลานกว้างและสั่งหมุนตลอดเวลา', 'ซ่อนในห้องน้ำ', 'ติดใต้น้ำ'], answer: 0,
    explanation: 'ทรงโดมติดเพดานภายในได้เรียบร้อยและสังเกตทิศทางเลนส์ได้ยากกว่า', hint: 'พิจารณารูปทรงและสภาพแวดล้อมภายในอาคาร',
  },
  {
    id: 'q102_bullet', triggerEquipmentId: 'bullet_camera', category: 'knowledge', points: 5,
    prompt: 'จุดเด่นของ Bullet Camera ในงานภายนอกคือข้อใด',
    choices: ['ไม่มีทิศทางการมอง', 'เห็นทิศทางชัดและเลือก Housing ที่ทนสภาพอากาศได้', 'หมุนได้ทุกทิศทางทุกรุ่น', 'ไม่ต้องใช้ไฟ'], answer: 1,
    explanation: 'รูปทรงกระบอกสื่อทิศทางชัด และต้องเลือกรุ่นที่มี IP Rating เหมาะกับภายนอก', hint: 'มองที่รูปทรงกระบอกและการป้องกันสภาพอากาศ',
  },
  {
    id: 'q102_ptz', triggerEquipmentId: 'ptz_camera', category: 'knowledge', points: 5,
    prompt: 'สถานการณ์ใดเหมาะกับ PTZ Camera',
    choices: ['มุมคงที่หน้าประตูเล็ก', 'จุดที่ห้ามมีผู้ควบคุม', 'ลานกว้างที่ต้องสั่งหมุน ก้ม เงย และซูม', 'พื้นที่ที่ไม่มีระบบเครือข่ายหรือสายไฟ'], answer: 2,
    explanation: 'PTZ เหมาะกับลานกว้างและงานที่มีผู้ควบคุมหรือ Preset ติดตามมุมมอง', hint: 'PTZ ย่อมาจาก Pan, Tilt และ Zoom',
  },
  {
    id: 'q102_privacy', category: 'knowledge', points: 5,
    prompt: 'ก่อนยืนยันมุมกล้อง ควรตรวจเรื่องใดเพื่อเคารพความเป็นส่วนตัว',
    choices: ['เลือกสีตัวกล้อง', 'หลีกเลี่ยงการจับภาพพื้นที่ส่วนบุคคลที่ไม่เกี่ยวข้อง', 'เพิ่มการซูมสูงสุดเสมอ', 'ซ่อนป้ายแจ้งเตือนทั้งหมด'], answer: 1,
    explanation: 'มุมกล้องต้องจำกัดตามวัตถุประสงค์และหลีกเลี่ยงพื้นที่ส่วนบุคคลที่ไม่เกี่ยวข้อง', hint: 'บันทึกเฉพาะพื้นที่ที่จำเป็นต่อวัตถุประสงค์',
  },
  {
    id: 'q102_select', category: 'selection', points: 30,
    prompt: 'ชุดใดจับคู่ชนิดกล้องกับพื้นที่ได้เหมาะสมที่สุด',
    choices: ['Dome–Lobby, Bullet–ทางเข้าภายนอก, PTZ–ลานกว้าง', 'PTZ–ห้องน้ำ, Dome–ใต้น้ำ, Bullet–ห้องมืดโดยไม่ตรวจสเปก', 'Bullet–ทุกจุดโดยไม่สำรวจ, PTZ–ทางเดินแคบ, Dome–เสาไฟ', 'เลือกจากราคาต่ำสุดเพียงอย่างเดียว'], answer: 0,
    explanation: 'การเลือกต้องสัมพันธ์กับพื้นที่ รูปทรงกล้อง Coverage และสภาพแวดล้อม', hint: 'จับคู่ Indoor, Outdoor และพื้นที่กว้างแยกกัน',
  },
  {
    id: 'q102_place', category: 'connection', points: 30,
    prompt: 'ตำแหน่งใดช่วยให้เห็นใบหน้าบริเวณทางเข้าโดยลดจุดบอด',
    choices: ['สูงมากและหันตรงลงพื้น', 'หลังสิ่งกีดขวาง', 'สูงพอป้องกันการเอื้อมถึงและเอียงเห็นแนวใบหน้า', 'หันออกนอกพื้นที่เป้าหมาย'], answer: 2,
    explanation: 'ตำแหน่งต้องป้องกันการเข้าถึงแต่ยังรักษามุมก้มที่เห็นรายละเอียดใบหน้า', hint: 'สูงเกินไปทำให้เห็นเพียงศีรษะ ต่ำเกินไปเสี่ยงถูกแตะต้อง',
  },
  {
    id: 'q102_coverage', category: 'problem', points: 15,
    prompt: 'Coverage Preview พบจุดบอดข้างประตู ควรทำอะไรเป็นลำดับแรก',
    choices: ['ปรับมุมหรือจุดติดตั้งแล้วทดสอบ Preview ซ้ำ', 'เพิ่มความละเอียดโดยไม่เปลี่ยนมุม', 'ลบภาพทดสอบ', 'ปิดกล้องจุดอื่นทั้งหมด'], answer: 0,
    explanation: 'ปรับมุมหรือจุดติดตั้งทีละตัวแปร แล้ว Preview ซ้ำเพื่อยืนยันว่าจุดบอดลดลง', hint: 'เปลี่ยนตัวแปรที่เกี่ยวกับมุมมองก่อน',
  },
];

export const questionById = new Map(learningQuestions.map((question) => [question.id, question]));
export const questionsByEquipment = new Map(
  learningQuestions.filter((question) => question.triggerEquipmentId).map((question) => [question.triggerEquipmentId!, question]),
);
