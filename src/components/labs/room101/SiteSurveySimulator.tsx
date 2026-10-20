'use client';

import { useState } from 'react';
import {
  MapPin,
  Shield,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Tv,
  HardDrive,
  Cpu,
  Cable,
  Camera,
  Play,
  Check,
  Activity,
  AlertCircle,
  Zap,
} from 'lucide-react';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export interface StrategicZone {
  id: string;
  nameTh: string;
  nameEn: string;
  distanceMeters: number;
  environmentType: string;
  lightingCond: string;
  recommendedCamera: string;
  lensSpec: string;
  mountingHeight: string;
  conduitType: string;
  pdpaRequirement: string;
  pdpaAction: string;
  techNote: string;
  svgPos: { x: number; y: number };
}

export interface WorkflowStep {
  id: string;
  orderNumber: number;
  titleTh: string;
  category: 'safety' | 'conduit' | 'cabling' | 'mounting' | 'rack' | 'testing';
  summaryTh: string;
  toolsNeeded: string[];
  safetyStandard: string;
  keyRule: string;
}

export interface ComponentDetail {
  id: string;
  nameTh: string;
  nameEn: string;
  category: 'camera' | 'transmission' | 'storage' | 'recorder' | 'display';
  roleTh: string;
  specsTh: string[];
  analogEquivalent: string;
  ipEquivalent: string;
  proTip: string;
}

// 5 Strategic Zones of Ubon Ratchathani Technical College
export const UBON_ZONES: StrategicZone[] = [
  {
    id: 'gate',
    nameTh: '1. ซุ้มประตูทางเข้าหลัก & ป้อมยาม',
    nameEn: 'Main Entrance Gate & Security Guardhouse',
    distanceMeters: 85,
    environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะ',
    lightingCond: 'ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน',
    recommendedCamera: 'Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m)',
    lensSpec: 'เลนส์ 4.0mm หรือ 6.0mm (มุมมองแคบเพื่อจับป้ายทะเบียนและใบหน้าผู้เข้า-ออก)',
    mountingHeight: '3.5 เมตร บนเสาเหล็กกลมหรือผนังป้อมยาม',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland',
    pdpaRequirement: 'ติดตั้งป้ายเตือน "พื้นที่นี้อยู่ภายใต้การบันทึกภาพด้วยกล้องวงจรปิด (CCTV in Operation)" ขนาดไม่น้อยกว่า A4 ที่ซุ้มประตู',
    pdpaAction: 'ห้ามหันมุมกล้องมองข้ามแนวรั้ววิทยาลัยไปยังบ้านพักอาศัยของชุมชนโดยรอบ',
    techNote: 'ระยะ 85m ยังอยู่ในเกณฑ์สาย UTP ไม่เกิน 100m แต่ควรใช้สายทองแดงแท้ (Pure Copper CAT6) ไม่ใช้สาย CCA เพื่อป้องกันไฟตก',
    svgPos: { x: 180, y: 390 },
  },
  {
    id: 'flagpole',
    nameTh: '2. ลานหน้าเสาธง & ลานกิจกรรมกลางแจ้ง',
    nameEn: 'Flagpole Plaza & Open Activity Field',
    distanceMeters: 60,
    environmentType: 'กลางแจ้งสมบูรณ์ (Full Outdoor) / แดด ฝน ลมแรง',
    lightingCond: 'แดดจัดช่วงเช้าและเที่ยง / มืดสนิทช่วงกลางคืน',
    recommendedCamera: 'Speed Dome PTZ หรือ Bullet มุมกว้าง กันน้ำมาตรฐาน IP67',
    lensSpec: 'เลนส์ 2.8mm (มุมมองกว้าง 103°) หรือ PTZ ซูมเลนส์ 25x Optical Zoom',
    mountingHeight: '5.0 - 6.0 เมตร บนเสาไฟลานกิจกรรม',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว/PE กันแดด UV + กล่องพักสาย IP67 พร้อมสายดินกราวด์',
    pdpaRequirement: 'ครอบคลุมพื้นที่สาธารณะของสถานศึกษาเพื่อความปลอดภัยในกิจกรรมรวมของนักศึกษา',
    pdpaAction: 'กำหนดสิทธิ์การดูภาพสดและการหมุน PTZ เฉพาะเจ้าหน้าที่ รปภ. และผู้บริหารเท่านั้น',
    techNote: 'พื้นที่เปิดโล่งมีความเสี่ยงต่อฟ้าผ่า ควรติดตั้ง Surge Protection Device (SPD) สำหรับสาย LAN',
    svgPos: { x: 380, y: 340 },
  },
  {
    id: 'workshop',
    nameTh: '3. โรงฝึกงานแผนกช่างอุตสาหกรรม',
    nameEn: 'Engineering Workshops (Machining & Welding)',
    distanceMeters: 95,
    environmentType: 'ในอาคารโรงงานสูง มีฝุ่นละออง ประกายไฟ ละอองน้ำมัน และการสั่นสะเทือน',
    lightingCond: 'แสงไฟโคม High-bay และแสงวาบจากการเชื่อมอาร์กไฟฟ้า',
    recommendedCamera: 'Vandal-Proof Bullet หรือ Dome โครงสร้างโลหะ มาตรฐาน IK10 & IP67',
    lensSpec: 'เลนส์ 4.0mm หรือ 2.8mm เลนส์มุมกว้างเพื่อครอบคลุมแนวยาวของแถวเครื่องจักร',
    mountingHeight: '4.0 - 4.5 เมตร ใต้โครงสร้างหลังคาเหล็กโรงช่าง',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว หรือท่อเหล็ก EMT ในจุดที่เสี่ยงต่อการกระแทกเชิงกล',
    pdpaRequirement: 'ใช้เพื่อกำกับความปลอดภัยในการปฏิบัติงานและป้องกันอุบัติเหตุในโรงฝึกงาน',
    pdpaAction: 'หลีกเลี่ยงการส่องมุมกล้องเข้าไปในพื้นที่แต่งตัวหรือล็อกเกอร์เก็บของส่วนบุคคล',
    techNote: 'ระยะ 95 เมตร ใกล้ขีดจำกัดกฎ 100 เมตรของ UTP CAT6 มาก ต้องวัดความต้านทานสายและไม่ให้มีรอยต่อสายกลางทางเด็ดขาด',
    svgPos: { x: 570, y: 380 },
  },
  {
    id: 'academic',
    nameTh: '4. อาคารเรียน & อาคารวิทยบริการ',
    nameEn: 'Academic Classrooms & Library Building',
    distanceMeters: 45,
    environmentType: 'ในร่ม (Indoor) โถงทางเดิน ฝ้าเพดาน T-Bar หรือคอนกรีต',
    lightingCond: 'แสงสว่างสม่ำเสมอจากหลอด LED ตลอดช่วงเวลาทำการ',
    recommendedCamera: 'Dome IP Camera 4MP เลนส์กว้าง ดีไซน์เรียบร้อยกลมกลืนกับสถาปัตยกรรม',
    lensSpec: 'เลนส์ 2.8mm (มุมมองกว้าง 100°+ เพื่อครอบคลุมทั้งแนวทางเดิน)',
    mountingHeight: '2.8 - 3.2 เมตร ใต้ฝ้าเพดาน',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้าเพดาน หรือรางเก็บสายไฟพลาสติก',
    pdpaRequirement: 'ปกป้องสิทธิส่วนบุคคลของนักเรียน ครู และบุคลากรทางการศึกษาอย่างเคร่งครัด',
    pdpaAction: 'ต้องตั้งค่า Privacy Masking (หน้ากากแถบดำ) ปิดบังบริเวณประตูห้องน้ำและโต๊ะลงทะเบียนเอกสารสำคัญ',
    techNote: 'การเจาะฝ้า T-Bar ต้องใช้แผ่นรองไม้อัดหลังฝ้าเพื่อกระจายน้ำหนัก ไม่ให้ฝ้าหย่อนแอ่นตัว',
    svgPos: { x: 340, y: 190 },
  },
  {
    id: 'server',
    nameTh: '5. ศูนย์ควบคุมส่วนกลาง & Server Room',
    nameEn: 'Central Network Control & CCTV Server Room',
    distanceMeters: 0,
    environmentType: 'ห้องควบคุมระบบปรับอากาศ 24 ชม. ปราศจากฝุ่น และมีระบบคีย์การ์ด',
    lightingCond: 'แสงสว่างหลอดไฟห้องคอมพิวเตอร์',
    recommendedCamera: 'Dome Camera 2MP ตรวจจับการเข้า-ออกของเจ้าหน้าที่ในห้องเซิร์ฟเวอร์',
    lensSpec: 'เลนส์ 2.8mm ส่องตรงจุดตู้ Rack และประตูทางเข้าหลัก',
    mountingHeight: '2.6 เมตร บนเพดานห้อง',
    conduitType: 'Wireway (รางวายเวย์โลหะ) เข้าสู่ตู้ Rack 19 นิ้ว',
    pdpaRequirement: 'เป็นพื้นที่ความลับสูงสุดตามมาตรฐาน PDPA (Zone Data Processor)',
    pdpaAction: 'บันทึก Log การเข้าถึงห้องและ Log การสืบค้นภาพจากเครื่อง NVR ทุกครั้งตามกฎหมาย',
    techNote: 'ศูนย์รวมตู้ Rack 19", NVR 32-CH, PoE Switch 24-Port และระบบสำรองไฟ UPS 2000VA',
    svgPos: { x: 510, y: 150 },
  },
];

// Standard 6-Step Installation Workflow
export const INSTALLATION_STEPS: WorkflowStep[] = [
  {
    id: 'step_ppe',
    orderNumber: 1,
    titleTh: '1. สวมใส่อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE)',
    category: 'safety',
    summaryTh: 'ตรวจสอบพื้นที่ สวมหมวกนิรภัย แว่นตากันสะเก็ด ถุงมือกันบาด และรองเท้าเซฟตี้ พร้อมตรวจสอบความมั่นคงของบันไดช่าง',
    toolsNeeded: ['หมวกนิรภัย (Hard Hat)', 'ถุงมือกันบาด PU', 'แว่นตานิรภัย', 'รองเท้าหัวเหล็ก', 'บันไดทรงเอไฟเบอร์กลาส'],
    safetyStandard: 'มาตรฐานความปลอดภัยในการทำงานบนที่สูง (OSHA / กฎกระทรวงแรงงาน)',
    keyRule: 'ห้ามทำงานติดตั้งบนบันไดลำพัง ต้องมีช่างคู่บัดดี้จับบันไดเสมอ และไม่ยืนบนขั้นบนสุด',
  },
  {
    id: 'step_conduit',
    orderNumber: 2,
    titleTh: '2. ติดตั้งแนวท่อร้อยสาย uPVC และกล่องพักสายกันน้ำ IP66',
    category: 'conduit',
    summaryTh: 'วัดระยะ ดัดท่อร้อยสาย uPVC สีขาว ยึดแคล้มป์ก้ามปูทุก 60-80 ซม. และติดตั้งกล่องพักสายกันน้ำ IP66 ในตำแหน่งติดตั้งกล้อง',
    toolsNeeded: ['สปริงดัดท่อ uPVC', 'กรรไกรตัดท่อ', 'สว่านโรตารี่', 'พุกพลาสติก & สกรู', 'ระดับน้ำแม่เหล็ก'],
    safetyStandard: 'มาตรฐานการเดินท่อสายสัญญาณ วสท. (EIT Standard)',
    keyRule: 'กล่องพักสายภายนอกต้องเจาะรูร้อยสายเข้าทางด้านล่างของกล่องเสมอ เพื่อป้องกันน้ำฝนไหลย้อนเข้ากล่อง',
  },
  {
    id: 'step_cabling',
    orderNumber: 3,
    titleTh: '3. ดึงสายสัญญาณ UTP CAT6 & เข้าหัว RJ45 ตามมาตรฐาน T568B',
    category: 'cabling',
    summaryTh: 'ร้อยสาย UTP CAT6 ภายในท่อร้อยสายโดยไม่ให้สายบิดเกลียวหรือมีรอยต่อ เข้าหัวต่อ RJ45 ตามมาตรฐาน T568B ทั้ง 2 ปลาย และทดสอบด้วย Cable Tester',
    toolsNeeded: ['สาย UTP CAT6 ทองแดงแท้', 'ลวดดึงสาย (Fish Tape)', 'คีมปอกสาย LAN', 'คีมย้ำหัว RJ45', 'Cable Continuity Tester'],
    safetyStandard: 'มาตรฐาน ANSI/TIA-568.2-D Balanced Twisted-Pair Cabling',
    keyRule: 'ความยาวสายต้องไม่เกิน 100 เมตร และคลายเกลียวคู่สายก่อนเข้าหัวไม่เกิน 13 มม. (0.5 นิ้ว)',
  },
  {
    id: 'step_mounting',
    orderNumber: 4,
    titleTh: '4. ยึดตัวกล้อง ปรับมุมมอง (Pan/Tilt) และซีลซิลิโคนกันน้ำ',
    category: 'mounting',
    summaryTh: 'ยึดฐานกล้องเข้ากับฝากล่องพักสาย เสียบต่อแจ็ค RJ45 และใส่ปลอกกันน้ำ (Waterproof Gland) ปรับมุมก้ม-เงย-ส่าย แล้วซีลซิลิโคนขอบกล่อง',
    toolsNeeded: ['ไขควงแม่เหล็ก', 'ประแจหกเหลี่ยมปรับกิมบอล', 'ซิลิโคนยาแนวภายนอก', 'ผ้าเช็ดเลนส์ไมโครไฟเบอร์'],
    safetyStandard: 'มาตรฐานการป้องกันน้ำและฝุ่น IP66/IP67 (IEC 60529)',
    keyRule: 'ใส่สารดูดความชื้น (Silica Gel Pack) ไว้ในกล่องพักสาย และขันกิมบอลกล้องให้แน่นพอดี ไม่ปีนเกลียว',
  },
  {
    id: 'step_rack',
    orderNumber: 5,
    titleTh: '5. จัดสายเข้าตู้ Rack / เชื่อมต่อสวิตช์ PoE & เครื่อง NVR',
    category: 'rack',
    summaryTh: 'จัดระเบียบสายในตู้ Rack ด้วย Cable Management ยึดเข้า Patch Panel เสียบสายแพตช์คอร์ดเข้า PoE Switch และต่อสาย Uplink สู่เครื่องบันทึก NVR',
    toolsNeeded: ['สายรัดตีนตุ๊กแก (Velcro Tie)', 'Patch Panel 24-Port', 'PoE Switch 802.3af/at', 'เครื่องบันทึก NVR', 'สาย Patch Cord CAT6'],
    safetyStandard: 'มาตรฐาน EIA-310-D สำหรับตู้ Rack 19 นิ้ว',
    keyRule: 'ห้ามใช้สายรัดพลาสติก (Zip Tie) รัดแน่นจนสาย LAN บุบแบน ให้ใช้ Velcro Tie เพื่อรักษาโครงสร้างคู่สาย',
  },
  {
    id: 'step_commissioning',
    orderNumber: 6,
    titleTh: '6. ตรวจสอบระบบและส่งมอบงาน (Commissioning & Handover)',
    category: 'testing',
    summaryTh: 'ตรวจสอบไฟสถานะ Power PoE ตรวจสอบภาพสด Live View ทุกแชนแนล ตั้งเวลาตรงตาม NTP Server ตรวจสอบการบันทึกภาพลง Surveillance HDD และสาธิต Playback',
    toolsNeeded: ['จอมอนิเตอร์ HDMI', 'แล็ปท็อปช่าง (SADP Tool)', 'มิเตอร์วัดไฟ PoE Tester', 'เอกสารส่งมอบงาน (Acceptance Form)'],
    safetyStandard: 'มาตรฐานการตรวจรับระบบรักษาความปลอดภัยดิจิทัล',
    keyRule: 'ต้องเปลี่ยนรหัสผ่านเริ่มต้น (Default Password) ของกล้องและ NVR ทันที และเปิดใช้ Privacy Masking ตามข้อตกลง',
  },
];

// 5 System Components Data
export const CCTV_5_COMPONENTS: ComponentDetail[] = [
  {
    id: 'camera',
    nameTh: '1. กล้องวงจรปิด (Camera Unit: Bullet / Dome)',
    nameEn: 'Optical Lens, Image Sensor & Video Processor',
    category: 'camera',
    roleTh: 'รับคลื่นแสงผ่านเลนส์ เปลี่ยนเป็นประจุไฟฟ้าด้วย Image Sensor (CMOS) แล้วประมวลผลบีบอัดเป็นสัญญาณวิดีโอ',
    specsTh: [
      'ความละเอียด 2MP - 4MP Ultra HD',
      'ชิปบีบอัด H.265 / H.265+ ประหยัดแบนด์วิดท์ 50%',
      'ระบบ True WDR 120dB ช่วยเกลี่ยแสงย้อน',
      'Smart IR ส่องสว่างกลางคืน 30-50 เมตร',
    ],
    analogEquivalent: 'กล้อง Analog HD (AHD/TVI/CVI) ส่งสัญญาณไฟฟ้าคลื่นต่อเนื่องผ่านพอร์ต BNC ไม่สามารถประมวลผลแพ็กเก็ตดิจิทัลในตัวได้',
    ipEquivalent: 'กล้อง IP มีมินิคอมพิวเตอร์และ ISP ในตัว ส่งข้อมูลเป็น TCP/IP Digital Packets ผ่านพอร์ต LAN RJ45 และรับไฟ PoE 48V ในสายเดียวกัน',
    proTip: 'กล้องภายนอกให้เลือกทรง Bullet โครงสร้างโลหะกันน้ำ IP67 ส่วนภายในอาคารให้เลือกทรง Dome เพราะดูเรียบร้อยและทิศทางเลนส์สังเกตได้ยากกว่า',
  },
  {
    id: 'transmission',
    nameTh: '2. ตัวกลางส่งสัญญาณและจ่ายไฟ (Transmission & PoE Switch)',
    nameEn: 'UTP CAT6 Cable & Power over Ethernet Switch',
    category: 'transmission',
    roleTh: 'เป็นเส้นทางส่งผ่านข้อมูลแพ็กเก็ตวิดีโอดิจิทัล พร้อมจ่ายกระแสไฟฟ้าแรงดัน DC 48V ไปเลี้ยงตัวกล้องผ่านสาย UTP เส้นเดียว',
    specsTh: [
      'สาย UTP CAT6 (4 คู่สายบิดเกลียว 23AWG)',
      'มาตรฐาน PoE IEEE 802.3af (15.4W) / 802.3at (30W)',
      'ระยะทางมาตรฐานสูงสุด 100 เมตร (TIA/EIA)',
      'แบนด์วิดท์รองรับ 1000 Mbps (Gigabit Uplink)',
    ],
    analogEquivalent: 'ใช้สาย Coaxial RG6 + สายไฟ VGV/DC 12V เดินคู่กันไป ต้องมี Power Supply Box จ่ายไฟแยกต่างหาก และสัญญาณดรอปลงตามระยะทาง',
    ipEquivalent: 'ใช้สาย LAN เส้นเดียวผ่าน PoE Switch (Power over Ethernet) ประหยัดค่าแรงเดินสายไฟ 220V และตัดปัญหาไฟรั่วลงโครงสร้างอาคาร',
    proTip: 'คำนวณ PoE Power Budget ของสวิตช์เสมอ เช่น กล้อง 4 ตัวใช้ตัวละ 12W รวมเป็น 48W สวิตช์ต้องมีกำลังขับอย่างน้อย 65W ขึ้นไป',
  },
  {
    id: 'storage',
    nameTh: '3. แหล่งจัดเก็บข้อมูลภาพ (Surveillance Harddisk)',
    nameEn: 'Surveillance-Grade HDD (WD Purple / Seagate SkyHawk)',
    category: 'storage',
    roleTh: 'บันทึกสตรีมวิดีโอความคมชัดสูงต่อเนื่องตลอด 24 ชั่วโมง 7 วัน 365 วัน โดยไม่หยุดพัก',
    specsTh: [
      'การทำงาน 90% Write (เขียน) / 10% Read (อ่าน)',
      'รองรับภาระงาน (Workload) 180 TB/ปี (สูงกว่า HDD ทั่วไป 3 เท่า)',
      'เซนเซอร์ตรวจจับการสั่นสะเทือน (RV Sensors) สำหรับติดตั้งหลายลูก',
      'เทคโนโลยี AllFrame ลดการกระตุกและการสูญเสียเฟรมภาพ (Drop Frames)',
    ],
    analogEquivalent: 'ใช้ฮาร์ดดิสก์แบบเดียวกับระบบ IP แต่ DVR บันทึกข้อมูลที่แปลงมาจากตัวเครื่องเอง',
    ipEquivalent: 'NVR บันทึกสตรีมข้อมูลดิจิทัลที่ผ่านการบีบอัด H.265 มาจากตัวกล้องโดยตรงลงสู่ฮาร์ดดิสก์',
    proTip: 'ห้ามนำ Desktop PC HDD มาใช้ในระบบ CCTV เด็ดขาด เพราะออกแบบมาสำหรับการทำงาน 8 ชม./วัน จะเกิด Bad Sector และพังเสียหายภายใน 3-6 เดือน',
  },
  {
    id: 'recorder',
    nameTh: '4. ระบบบันทึกและประมวลผล (NVR - Network Video Recorder)',
    nameEn: 'NVR Processing Unit & Video Management Engine',
    category: 'recorder',
    roleTh: 'รับสตรีมข้อมูลดิจิทัลจากกล้อง IP ผ่านเครือข่าย จัดเก็บลงฮาร์ดดิสก์ ประมวลผล AI ตรวจจับ และส่งภาพออกจอแสดงผล',
    specsTh: [
      'ช่องสัญญาณ 4 / 8 / 16 / 32 Channels',
      'Incoming Bandwidth 80 - 160 Mbps',
      'เอาต์พุตแสดงผล 4K Ultra HD ผ่านพอร์ต HDMI',
      'ฟังก์ชันค้นหาอัจฉริยะ (Smart Playback) ตามการตรวจจับการเคลื่อนไหว',
    ],
    analogEquivalent: 'DVR (Digital Video Recorder) ต้องมีชิป Analog-to-Digital Converter (ADC) ในเครื่องเพื่อแปลงสัญญาณไฟฟ้าจากสาย RG6',
    ipEquivalent: 'NVR ไม่ต้องแปลงสัญญาณ เพราะกล้อง IP แปลงเป็นดิจิทัลมาแล้ว NVR เพียงแค่จัดเส้นทางข้อมูล (Routing) และบันทึกลงฮาร์ดดิสก์',
    proTip: 'เลือก NVR ที่มี Incoming Bandwidth เผื่อไว้เสมอ เช่น กล้อง 4MP 4 ตัว ใช้ตัวละ 6 Mbps รวม 24 Mbps ให้เลือก NVR ที่รองรับอย่างน้อย 60 Mbps ขึ้นไป',
  },
  {
    id: 'display',
    nameTh: '5. จอแสดงผลและส่วนควบคุม (Display Monitor & Client Console)',
    nameEn: 'Surveillance Monitor, HDMI Output & Client Software',
    category: 'display',
    roleTh: 'แสดงผลภาพสด (Live View) แบบแยกจอ 1/4/9 ช่อง และเป็นอินเทอร์เฟซให้เจ้าหน้าที่ค้นหาภาพย้อนหลัง (Playback)',
    specsTh: [
      'ความละเอียด Full HD (1080p) หรือ 4K (3840×2160)',
      'พาเนลหน้าจอออกแบบเพื่อเปิดต่อเนื่อง 24/7 (Anti-Burn-in)',
      'การเชื่อมต่อ HDMI 2.0 / VGA',
      'รองรับ Client App บนคอมพิวเตอร์และมือถือผ่านระบบ Cloud P2P',
    ],
    analogEquivalent: 'เชื่อมต่อตรงกับพอร์ต HDMI/VGA ของ DVR เพื่อดูภาพสด',
    ipEquivalent: 'สามารถดูได้ทั้งจากจอที่ต่อตรงกับ NVR และดูผ่านโปรแกรม VMS (iVMS-4200) บนคอมพิวเตอร์เครื่องใดก็ได้ในเครือข่ายวิทยาลัย',
    proTip: 'อย่าตั้งจอภาพ CCTV ในจุดที่บุคคลภายนอกที่ไม่เกี่ยวข้องสามารถมองเห็นหน้าจอได้ชัดเจน เพื่อให้เป็นไปตามข้อกำหนด PDPA',
  },
];

// 4 Commissioning Steps
export const COMMISSIONING_STEPS = [
  {
    step: 1,
    title: '1. Power Active Check (ตรวจสอบระบบไฟฟ้า)',
    desc: 'ตรวจสอบไฟ LED สถานะของ PoE Switch พอร์ต 1-4 สว่างสีเขียว และไฟ LED หน้าตัวกล้องติดสว่างครบทุกจุด',
    expectedVal: 'DC 48V - 52V Active / LED Link & PoE Solid Green',
  },
  {
    step: 2,
    title: '2. Live View Check (ตรวจสอบภาพสด)',
    desc: 'ตรวจสอบภาพสดบนหน้าจอมอนิเตอร์ทุกช่อง สัญญาณภาพคมชัด อัตราเฟรมเรต 25fps ไม่มีอาการภาพลาย สัญญาณขาด หรือจอฟ้า',
    expectedVal: 'Resolution: 2560×1440 (4MP) @ 25fps / H.265 Main Stream',
  },
  {
    step: 3,
    title: '3. Continuous Recording Check (ตรวจสอบการบันทึก)',
    desc: 'ตรวจสอบสถานะของ Surveillance HDD ว่าขึ้นสถานะ "Normal/Healthy" และมีไอคอน REC สีแดง/น้ำเงิน แสดงบนจอภาพทุกแชนแนล',
    expectedVal: 'HDD 4TB Format: Initialized / Recording Mode: 24/7 Continuous',
  },
  {
    step: 4,
    title: '4. Playback Verification (ทดสอบค้นหาภาพย้อนหลัง)',
    desc: 'ทดสอบเข้าสู่เมนู Playback ค้นหาไฟล์วิดีโอย้อนหลัง 5 นาทีที่ผ่านมา ตรวจสอบวันที่และเวลาว่าตรงตามเวลาจริง (NTP Time Sync)',
    expectedVal: 'Timeline Bar: Solid Blue (Normal Video) / Time drift < 1 sec',
  },
];

// Fault Troubleshooting Scenarios
export const FAULT_SCENARIOS = [
  {
    id: 'fault_no_video',
    title: 'กรณีที่ 1: กล้องซุ้มประตูหน้าขึ้นหน้าจอ "NO VIDEO" ภาพไม่ปรากฏ',
    symptom: 'พอร์ต 1 บนสวิตช์ PoE ไฟไม่ติด กล้องไม่ทำงาน จอดำสนิท',
    questionTh: 'ในฐานะช่างติดตั้ง CCTV ท่านจะดำเนินการตรวจสอบสิ่งใดเป็นลำดับแรก?',
    options: [
      { text: 'เปลี่ยนตัวกล้องใหม่ทันทีเพราะคิดว่ากล้องเสีย', isCorrect: false, feedback: 'ไม่ถูกต้อง! สิ้นเปลืองงบประมาณ ควรตรวจสอบระบบสายและไฟเลี้ยงก่อน' },
      { text: 'ใช้ Cable Tester ตรวจสอบสาย UTP CAT6 ระยะ 85m และตรวจขั้ว RJ45 ว่าเข้าสายตาม T568B ถูกต้องหรือไม่', isCorrect: true, feedback: 'ถูกต้องเยี่ยมยอด! 80% ของอาการ No Video เกิดจากการเข้าหัว RJ45 หลวม หรือสาย UTP ขาดหักภายใน' },
      { text: 'เปลี่ยนจอมอนิเตอร์ใหม่', isCorrect: false, feedback: 'ไม่ถูกต้อง! จอมอนิเตอร์เปิดติดปกติและแสดงผลแชนแนลอื่นได้' },
    ],
  },
  {
    id: 'fault_hdd_error',
    title: 'กรณีที่ 2: เครื่องบันทึก NVR ส่งเสียงบี๊บเตือน "HDD NOT INITIALIZED / NO RECORD"',
    symptom: 'ไอคอนรูปฮาร์ดดิสก์กะพริบสีแดง ภาพสดดูได้ปกติแต่ไม่บันทึกข้อมูลย้อนหลัง',
    questionTh: 'ขั้นตอนการแก้ปัญหาที่ถูกต้องตามหลักมาตรฐานช่างคือข้อใด?',
    options: [
      { text: 'เข้าสู่เมนู Storage Management บน NVR แล้วสั่งกด "Format / Initialize" ฮาร์ดดิสก์ให้เข้ากับระบบไฟล์ของ NVR', isCorrect: true, feedback: 'ถูกต้อง! ฮาร์ดดิสก์ใหม่แกะกล่องจำเป็นต้องถูก Format บน NVR เพื่อสร้าง Partition และ File System สำหรับกล้องวงจรปิด' },
      { text: 'ถอดปลั๊กเครื่อง NVR ออกทันทีแล้วเปิดใหม่ซ้ำๆ', isCorrect: false, feedback: 'ผิดวิธี! อาจทำให้ฮาร์ดดิสก์เกิดความเสียหายจากไฟกระชากได้' },
      { text: 'ซื้อการ์ด MicroSD เสียบแทนฮาร์ดดิสก์', isCorrect: false, feedback: 'ไม่ถูกต้อง! MicroSD มีความจุจำกัด ไม่สามารถทดแทนฮาร์ดดิสก์ระบบ NVR กลางได้' },
    ],
  },
  {
    id: 'fault_backlight',
    title: 'กรณีที่ 3: ภาพจากกล้องซุ้มประตูเวลากลางวัน หน้าคนขับรถมืดสนิทมองไม่เห็นใบหน้า',
    symptom: 'แสงแดดภายนอกสว่างจัด ทำให้วัตถุในร่มกลายเป็นเงาดำ (Silhouetted / Backlight)',
    questionTh: 'ช่างควรแก้ไขโดยการตั้งค่าฟังก์ชันใดในตัวกล้อง IP?',
    options: [
      { text: 'ปรับความสว่าง (Brightness) ของจอมอนิเตอร์ให้สว่างสุด', isCorrect: false, feedback: 'ไม่ช่วยแก้ปัญหา เพราะจะทำให้ภาพส่วนที่สว่างอยู่แล้วขาวโพลนจนมองไม่เห็นรายละเอียด' },
      { text: 'เปิดใช้ฟังก์ชัน True WDR (Wide Dynamic Range 120dB) ในเมนู Image Settings ของกล้อง', isCorrect: true, feedback: 'ถูกต้องแม่นยำ! True WDR จะรวมภาพที่ถ่ายด้วยชัตเตอร์เร็วและช้าเข้าด้วยกัน ทำให้เห็นรายละเอียดทั้งส่วนมืดและส่วนสว่าง' },
      { text: 'นำสติ๊กเกอร์สีดำมาแปะหน้าเลนส์', isCorrect: false, feedback: 'ผิดอย่างยิ่ง! จะทำให้เลนส์มืดและเบลอ' },
    ],
  },
  {
    id: 'fault_poe_budget',
    title: 'กรณีที่ 4: กล้องวงจรปิดติดๆ ดับๆ เฉพาะในเวลากลางคืนเมื่อไฟ IR เปิดทำงาน',
    symptom: 'กลางวันกล้อง 4 ตัวทำงานปกติ แต่พอ 18.30 น. กล้องบางตัวหลุดการเชื่อมต่อไปเรื่อยๆ',
    questionTh: 'สาเหตุทางเทคนิคที่เป็นไปได้มากที่สุดคือข้อใด?',
    options: [
      { text: 'มีผีหลอกในวิทยาลัยเทคนิคอุบลราชธานี', isCorrect: false, feedback: 'ไม่เกี่ยวข้องกับหลักการทางวิศวกรรมไฟฟ้า!' },
      { text: 'กำลังไฟ PoE Power Budget ของสวิตช์ไม่เพียงพอ เพราะหลอด IR ในเวลากลางคืนกินไฟเพิ่มขึ้นเท่าตัว', isCorrect: true, feedback: 'ถูกต้องตรงจุด! หลอดอินฟราเรดจะกินไฟเพิ่มขึ้นจาก 5W เป็น 11-13W ทำให้กำลังวัตต์รวมของสวิตช์เกินขีดจำกัด (Budget Overload)' },
      { text: 'สาย UTP ยืดยาวขึ้นในเวลากลางคืน', isCorrect: false, feedback: 'ไม่ถูกต้อง! ความยาวสายไม่มีการเปลี่ยนแปลงตามเวลากลางคืน' },
    ],
  },
];

export function SiteSurveySimulator() {
  const [activeTab, setActiveTab] = useState<'survey' | 'workflow' | 'components' | 'commissioning'>('survey');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('gate');
  const [surveyedZones, setSurveyedZones] = useState<string[]>(['gate']);
  const [pdpaAgreed, setPdpaAgreed] = useState<Record<string, boolean>>({
    gate: true,
    flagpole: false,
    workshop: false,
    academic: false,
    server: false,
  });

  // Workflow Sequencer State
  const [steps, setSteps] = useState<WorkflowStep[]>([
    INSTALLATION_STEPS[1]!,
    INSTALLATION_STEPS[0]!,
    INSTALLATION_STEPS[3]!,
    INSTALLATION_STEPS[2]!,
    INSTALLATION_STEPS[5]!,
    INSTALLATION_STEPS[4]!,
  ]);
  const [sequenceChecked, setSequenceChecked] = useState(false);
  const [sequenceValid, setSequenceValid] = useState(false);

  // Components State
  const [architectureMode, setArchitectureMode] = useState<'ip' | 'analog'>('ip');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('camera');

  // Commissioning State
  const [commissioningStatus, setCommissioningStatus] = useState<Record<number, 'idle' | 'testing' | 'pass'>>({
    1: 'pass',
    2: 'idle',
    3: 'idle',
    4: 'idle',
  });
  const [isCommissioningRunning, setIsCommissioningRunning] = useState(false);
  const [activeFaultIndex, setActiveFaultIndex] = useState(0);
  const [faultAnswers, setFaultAnswers] = useState<Record<string, number | null>>({});
  const [showSurveyReport, setShowSurveyReport] = useState(false);

  // Selected zone object
  const currentZone: StrategicZone = UBON_ZONES.find((z) => z.id === selectedZoneId) ?? UBON_ZONES[0]!;
  const currentComponent: ComponentDetail = CCTV_5_COMPONENTS.find((c) => c.id === selectedComponentId) ?? CCTV_5_COMPONENTS[0]!;

  // Mark zone surveyed
  const handleMarkSurveyed = (zoneId: string) => {
    if (!surveyedZones.includes(zoneId)) {
      setSurveyedZones([...surveyedZones, zoneId]);
    }
    setPdpaAgreed((prev) => ({ ...prev, [zoneId]: true }));
  };

  // Reorder steps
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    const temp = newSteps[index]!;
    newSteps[index] = newSteps[targetIndex]!;
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
    setSequenceChecked(false);
  };

  // Reset steps to random or original
  const resetSteps = () => {
    setSteps([
      INSTALLATION_STEPS[2]!,
      INSTALLATION_STEPS[0]!,
      INSTALLATION_STEPS[4]!,
      INSTALLATION_STEPS[1]!,
      INSTALLATION_STEPS[5]!,
      INSTALLATION_STEPS[3]!,
    ]);
    setSequenceChecked(false);
    setSequenceValid(false);
  };

  // Validate step order
  const checkSequence = () => {
    const isCorrect = steps.every((s, idx) => s.orderNumber === idx + 1);
    setSequenceValid(isCorrect);
    setSequenceChecked(true);
  };

  // Auto-solve sequence for demonstration
  const autoSortSequence = () => {
    setSteps([...INSTALLATION_STEPS]);
    setSequenceValid(true);
    setSequenceChecked(true);
  };

  // Run Commissioning Test
  const runCommissioningSimulation = () => {
    setIsCommissioningRunning(true);
    setCommissioningStatus({ 1: 'testing', 2: 'idle', 3: 'idle', 4: 'idle' });

    setTimeout(() => {
      setCommissioningStatus((prev) => ({ ...prev, 1: 'pass', 2: 'testing' }));
      setTimeout(() => {
        setCommissioningStatus((prev) => ({ ...prev, 2: 'pass', 3: 'testing' }));
        setTimeout(() => {
          setCommissioningStatus((prev) => ({ ...prev, 3: 'pass', 4: 'testing' }));
          setTimeout(() => {
            setCommissioningStatus((prev) => ({ ...prev, 4: 'pass' }));
            setIsCommissioningRunning(false);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Overall Completion Calculation
  const surveyProgress = Math.round((surveyedZones.length / UBON_ZONES.length) * 100);
  const faultScore = Object.entries(faultAnswers).filter(([fid, optIdx]) => {
    const sc = FAULT_SCENARIOS.find((s) => s.id === fid);
    return sc && optIdx !== null && sc.options[optIdx]?.isCorrect;
  }).length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100">
      {/* =========================================================
          TOP BANNER: UBTC LAB HEADER & OVERALL PROGRESS
         ========================================================= */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3.5 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Shield className="w-3.5 h-3.5" /> วิทยาลัยเทคนิคอุบลราชธานี
              </span>
              <span className="text-xs font-mono text-slate-400">Unit 01 (Room 101 Companion)</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight mt-0.5">
              CCTV Site Survey & Installation Workstation
            </h1>
            <p className="text-xs text-slate-400">
              ระบบจำลองการสำรวจพื้นที่ 5 โซนยุทธศาสตร์, ขั้นตอนการติดตั้งมาตรฐาน 6 ขั้น, องค์ประกอบ 5 ส่วน และ Commissioning
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">สำรวจพื้นที่</span>
              <span className="text-sm font-bold text-sky-400">
                {surveyedZones.length}/{UBON_ZONES.length} โซน ({surveyProgress}%)
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">ลำดับติดตั้ง</span>
              <span className={`text-sm font-bold ${sequenceValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {sequenceValid ? 'ผ่านเกณฑ์ 100%' : 'ยังไม่จัดลำดับ'}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">แก้โจทย์หน้างาน</span>
              <span className="text-sm font-bold text-indigo-400">
                {faultScore}/{FAULT_SCENARIOS.length} ข้อ
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'survey'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>แท็บ 1: ผังสำรวจ 5 โซน วท.อุบลฯ</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-sky-950 text-sky-200">
              {surveyedZones.length}/5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>แท็บ 2: ลำดับ 6 ขั้นตอนติดตั้งมาตรฐาน</span>
            {sequenceValid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          <button
            onClick={() => setActiveTab('components')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'components'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>แท็บ 3: ประกอบ 5 องค์ประกอบ & สถาปัตยกรรม IP vs Analog</span>
          </button>

          <button
            onClick={() => setActiveTab('commissioning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'commissioning'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>แท็บ 4: คอนโซลส่งมอบงาน & แก้ปัญหาหน้างาน</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-950 text-indigo-200">
              {faultScore}/4
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN TAB CONTENT AREA
         ========================================================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* -----------------------------------------------------------------
            TAB 1: CAMPUS SITE SURVEY MAP (วิทยาลัยเทคนิคอุบลราชธานี)
           ----------------------------------------------------------------- */}
        {activeTab === 'survey' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Interactive SVG Map Layout */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    แผนผังจำลองวิทยาเขต: วิทยาลัยเทคนิคอุบลราชธานี
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  คลิกที่จุดเพื่อตรวจสอบสภาพแวดล้อม
                </span>
              </div>

              {/* Interactive Campus SVG Viewport */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-800">
                <svg
                  viewBox="0 0 760 500"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                    <radialGradient id="serverGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="760" height="500" fill="url(#campusGrid)" />

                  {/* Campus Boundary & Roads */}
                  <path
                    d="M 60 440 L 700 440 L 700 80 L 60 80 Z"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  {/* Main Road through Gate */}
                  <path
                    d="M 180 480 L 180 340 L 520 340 L 520 180"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="32"
                  />
                  <path
                    d="M 180 480 L 180 340 L 520 340 L 520 180"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2"
                    strokeDasharray="10 8"
                  />

                  {/* UTP Cabling Lines from Server Room (Zone 5) to each Zone */}
                  {UBON_ZONES.map((z) => {
                    if (z.id === 'server') return null;
                    const serverPos = UBON_ZONES.find((x) => x.id === 'server')!.svgPos;
                    const isSelected = selectedZoneId === z.id;
                    return (
                      <g key={`cable-${z.id}`}>
                        <line
                          x1={serverPos.x}
                          y1={serverPos.y}
                          x2={z.svgPos.x}
                          y2={z.svgPos.y}
                          stroke={isSelected ? '#38bdf8' : '#334155'}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          strokeDasharray={isSelected ? 'none' : '4 3'}
                        />
                        {/* Midpoint distance label */}
                        <rect
                          x={(serverPos.x + z.svgPos.x) / 2 - 20}
                          y={(serverPos.y + z.svgPos.y) / 2 - 10}
                          width="40"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                          stroke={isSelected ? '#38bdf8' : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x={(serverPos.x + z.svgPos.x) / 2}
                          y={(serverPos.y + z.svgPos.y) / 2 + 3}
                          fill={z.distanceMeters > 90 ? '#f59e0b' : '#94a3b8'}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {z.distanceMeters}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Buildings Visual Layout */}
                  {/* Gate Area */}
                  <rect x="130" y="360" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  <text x="180" y="405" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">ซุ้มประตู วท.อบ.</text>

                  {/* Flagpole & Plaza */}
                  <circle cx="380" cy="340" r="42" fill="#0f2b38" stroke="#0284c7" strokeWidth="1.5" />
                  <text x="380" y="344" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">เสาธง/ลานรวม</text>

                  {/* Workshop building */}
                  <rect x="510" y="340" width="130" height="80" rx="6" fill="#292524" stroke="#78350f" strokeWidth="1.5" />
                  <text x="575" y="385" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">โรงช่างอุตสาหกรรม</text>

                  {/* Academic / Library */}
                  <rect x="280" y="140" width="130" height="80" rx="6" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1.5" />
                  <text x="345" y="185" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">อาคารเรียน/วิทยบริการ</text>

                  {/* Server Room */}
                  <circle cx="510" cy="150" r="40" fill="url(#serverGlow)" />
                  <rect x="460" y="115" width="100" height="70" rx="8" fill="#082f49" stroke="#0284c7" strokeWidth="2" />
                  <text x="510" y="148" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">Server Room</text>
                  <text x="510" y="163" fill="#7dd3fc" fontSize="8" textAnchor="middle">NVR 32CH / UPS</text>

                  {/* Interactive Zone Markers */}
                  {UBON_ZONES.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const isSurveyed = surveyedZones.includes(zone.id);

                    return (
                      <g
                        key={zone.id}
                        transform={`translate(${zone.svgPos.x}, ${zone.svgPos.y})`}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        {/* Outer Glow on Selected */}
                        {isSelected && (
                          <circle r="24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2">
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              from="0"
                              to="360"
                              dur="6s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        {/* Pulse Ring */}
                        <circle
                          r="18"
                          fill={isSurveyed ? '#059669' : '#0284c7'}
                          fillOpacity={isSelected ? '0.9' : '0.7'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* Icon/Number */}
                        <text
                          y="4"
                          fill="#ffffff"
                          fontSize="11"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {zone.nameTh[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg p-2 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> สำรวจแล้ว
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> ยังไม่สำรวจ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> สาย UTP &gt; 90m (ระวัง)
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSurveyReport(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition cursor-pointer text-[10px]"
                  >
                    <FileText className="w-3 h-3" />
                    <span>ออกใบบันทึกผลการสำรวจ</span>
                  </button>
                </div>
              </div>

              {/* Zone Selector Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                {UBON_ZONES.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  const isSurveyed = surveyedZones.includes(zone.id);

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/80 border-sky-500 text-white shadow-md'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-sky-400 font-bold">{zone.distanceMeters}m</span>
                        {isSurveyed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <p className="text-xs font-semibold truncate">{zone.nameTh.replace(/^\d+\.\s*/, '')}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Detail Inspection & PDPA Checklist */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      สเปกการสำรวจหน้างานวิทยาลัย
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">{currentZone.nameTh}</h2>
                    <p className="text-[11px] text-slate-400">{currentZone.nameEn}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                      ระยะสาย: {currentZone.distanceMeters}m
                    </span>
                    {currentZone.distanceMeters >= 90 && (
                      <span className="block text-[10px] text-amber-400 font-bold mt-1">
                        ⚠️ กฎ 100m UTP Limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Survey Checklist Details */}
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" /> สภาวะแสงสว่างและสิ่งแวดล้อม
                    </span>
                    <p className="text-slate-200 font-medium">{currentZone.lightingCond}</p>
                    <p className="text-slate-400 text-[11px] mt-1">สภาพพื้นที่: {currentZone.environmentType}</p>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-sky-400" /> กล้องและเลนส์ที่วิศวกรกำหนด
                    </span>
                    <p className="text-sky-300 font-semibold">{currentZone.recommendedCamera}</p>
                    <p className="text-slate-300 text-[11px] mt-1">เลนส์: {currentZone.lensSpec}</p>
                    <p className="text-slate-400 text-[11px]">ความสูงติดตั้ง: {currentZone.mountingHeight}</p>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1.5">
                      <Cable className="w-3 h-3 text-emerald-400" /> ท่อร้อยสายและกล่องพักสาย
                    </span>
                    <p className="text-slate-300">{currentZone.conduitType}</p>
                    <p className="text-slate-400 text-[11px] mt-1 italic">ข้อแนะนำช่าง: {currentZone.techNote}</p>
                  </div>

                  {/* PDPA Section */}
                  <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-800/60">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase block mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" /> ข้อกำหนด PDPA ในสถานศึกษา
                    </span>
                    <p className="text-slate-200 text-xs mb-1.5">{currentZone.pdpaRequirement}</p>
                    <p className="text-indigo-200 text-[11px] mb-3">🛡️ {currentZone.pdpaAction}</p>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 p-2 rounded-lg border border-indigo-800/40 hover:bg-slate-900 transition">
                      <input
                        type="checkbox"
                        checked={pdpaAgreed[currentZone.id] || false}
                        onChange={(e) =>
                          setPdpaAgreed({ ...pdpaAgreed, [currentZone.id]: e.target.checked })
                        }
                        className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-slate-300">
                        ยืนยันการตรวจสอบหลักเกณฑ์ PDPA และจุดติดตั้งป้ายเตือน
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {surveyedZones.includes(currentZone.id) ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกการสำรวจเรียบร้อย
                    </span>
                  ) : (
                    'ยังไม่ได้บันทึกผลการสำรวจ'
                  )}
                </span>

                <button
                  onClick={() => handleMarkSurveyed(currentZone.id)}
                  disabled={surveyedZones.includes(currentZone.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surveyedZones.includes(currentZone.id)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{surveyedZones.includes(currentZone.id) ? 'สำรวจสำเร็จแล้ว' : 'บันทึกการสำรวจโซนนี้'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 2: INSTALLATION WORKFLOW SEQUENCER (6 ขั้นตอนมาตรฐาน)
           ----------------------------------------------------------------- */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            {/* Intro & Instructions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    มาตรฐานฝีมือแรงงานช่างติดตั้ง CCTV (Standard Installation Workflow)
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">
                    จัดลำดับ 6 ขั้นตอนการติดตั้งกล้องวงจรปิดตามหลักวิศวกรรมและความปลอดภัย
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ใช้ปุ่มเลื่อนขึ้น (▲) และเลื่อนลง (▼) เพื่อเรียงลำดับขั้นตอนก่อน-หลังให้ถูกต้องตามหลักช่าง
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetSteps}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> สลับลำดับใหม่
                  </button>
                  <button
                    onClick={autoSortSequence}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 transition cursor-pointer"
                  >
                    เฉลยลำดับ
                  </button>
                  <button
                    onClick={checkSequence}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> ตรวจสอบความถูกต้อง
                  </button>
                </div>
              </div>

              {/* Validation Result Toast / Alert */}
              {sequenceChecked && (
                <div
                  className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
                    sequenceValid
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-amber-950/60 border-amber-500 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sequenceValid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {sequenceValid
                          ? '🎉 ถูกต้องสมบูรณ์แบบ! ลำดับขั้นตอนเป็นไปตามมาตรฐานวิชาชีพช่าง CCTV'
                          : '⚠️ ยังมีขั้นตอนที่สลับตำแหน่งกันอยู่! กรุณาตรวจสอบใหม่อีกครั้ง'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {sequenceValid
                          ? 'เริ่มต้นด้วย PPE เสมอ $\\rightarrow$ เดินท่อ $\\rightarrow$ ร้อยสาย UTP & เข้าหัว $\\rightarrow$ ยึดกล้อง $\\rightarrow$ ตู้ Rack & PoE $\\rightarrow$ Commissioning'
                          : 'คำแนะนำ: ตรวจสอบว่าได้สวมใส่ PPE เป็นขั้นตอนแรกสุดหรือไม่ และไม่ควรติดกล้องก่อนที่จะเดินท่อร้อยสาย'}
                      </p>
                    </div>
                  </div>
                  {sequenceValid && (
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500 text-slate-950">
                      +100 คะแนนช่าง
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map((step, index) => {
                const isCurrentPositionCorrect = sequenceChecked && step.orderNumber === index + 1;
                const isCurrentPositionWrong = sequenceChecked && step.orderNumber !== index + 1;

                return (
                  <div
                    key={step.id}
                    className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg ${
                      isCurrentPositionCorrect
                        ? 'border-emerald-500/70 bg-emerald-950/10'
                        : isCurrentPositionWrong
                        ? 'border-amber-500/70 bg-amber-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-sky-400">
                            #{index + 1}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            ตำแหน่งปัจจุบัน
                          </span>
                        </div>

                        {/* Order Controls */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                            title="เลื่อนขึ้น"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                            title="เลื่อนลง"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1.5">{step.titleTh}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{step.summaryTh}</p>

                      {/* Tools Required */}
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          เครื่องมือและอุปกรณ์ช่าง:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {step.toolsNeeded.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Key Principle */}
                    <div className="pt-3 border-t border-slate-800/80 text-[11px] text-amber-400/90 font-medium">
                      💡 {step.keyRule}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 3: 5 COMPONENTS & SYSTEM WORKFLOW (Analog vs IP)
           ----------------------------------------------------------------- */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            {/* Architecture Comparison Controller */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    เปรียบเทียบสถาปัตยกรรมระบบ CCTV
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Analog HD (Coaxial + DVR) vs IP Network Camera (CAT6 + PoE + NVR)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    สลับเพื่อสังเกตการไหลของสัญญาณและโครงสร้างองค์ประกอบหลัก 5 ส่วน
                  </p>
                </div>

                {/* Architecture Toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setArchitectureMode('ip')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      architectureMode === 'ip'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ระบบ IP Camera (มาตรฐานปัจจุบัน)</span>
                  </button>
                  <button
                    onClick={() => setArchitectureMode('analog')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      architectureMode === 'analog'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>ระบบ Analog HD (ระบบดั้งเดิม)</span>
                  </button>
                </div>
              </div>

              {/* Animated Interactive Signal Diagram */}
              <div className="mt-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto">
                <div className="min-w-[680px] flex items-center justify-between relative py-4 px-2">
                  {/* Step 1: Camera */}
                  <div
                    onClick={() => setSelectedComponentId('camera')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedComponentId === 'camera'
                        ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">1. ตัวกล้อง</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {architectureMode === 'ip' ? 'IP Bullet 4MP' : 'Analog AHD 2MP'}
                    </span>
                  </div>

                  {/* Connecting Line 1 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">
                      {architectureMode === 'ip' ? 'CAT6 UTP (Data + PoE 48V)' : 'RG6 Coaxial + ไฟ 12V'}
                    </span>
                    <div className="w-full h-1 bg-slate-800 relative overflow-hidden rounded-full">
                      <div
                        className={`h-full w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] ${
                          architectureMode === 'ip' ? 'bg-sky-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">
                      {architectureMode === 'ip' ? 'Digital Packets (TCP/IP)' : 'Analog Waveform (BNC)'}
                    </span>
                  </div>

                  {/* Step 2: Transmission / Switch */}
                  <div
                    onClick={() => setSelectedComponentId('transmission')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedComponentId === 'transmission'
                        ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Cable className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">2. ชุมสาย/สวิตช์</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {architectureMode === 'ip' ? 'PoE Switch 8-Port' : 'Power Supply Box'}
                    </span>
                  </div>

                  {/* Connecting Line 2 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">
                      {architectureMode === 'ip' ? 'Gigabit Ethernet Uplink' : 'BNC Direct Connector'}
                    </span>
                    <div className="w-full h-1 bg-slate-800 relative overflow-hidden rounded-full">
                      <div
                        className={`h-full w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] ${
                          architectureMode === 'ip' ? 'bg-sky-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step 3 & 4: Recorder & Storage */}
                  <div
                    onClick={() => setSelectedComponentId('recorder')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedComponentId === 'recorder'
                        ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">3. เครื่องบันทึก</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {architectureMode === 'ip' ? 'NVR (H.265)' : 'DVR (BNC Ports)'}
                    </span>
                  </div>

                  {/* Step Storage */}
                  <div
                    onClick={() => setSelectedComponentId('storage')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedComponentId === 'storage'
                        ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">4. หน่วยจัดเก็บ</span>
                    <span className="text-[10px] text-slate-400 font-mono">Surveillance HDD 4TB</span>
                  </div>

                  {/* Connecting Line 3 */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">HDMI 4K Cable</span>
                    <div className="w-full h-1 bg-slate-800 relative overflow-hidden rounded-full">
                      <div className="h-full w-1/3 bg-purple-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>

                  {/* Step 5: Display Monitor */}
                  <div
                    onClick={() => setSelectedComponentId('display')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedComponentId === 'display'
                        ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Tv className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">5. จอแสดงผล</span>
                    <span className="text-[10px] text-slate-400 font-mono">Live View 4K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Component Deep-Dive Inspection Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-2">
                <div>
                  <span className="text-xs font-bold uppercase text-sky-400 tracking-wider">
                    ข้อมูลจำเพาะเชิงช่าง (Component Technical Specification)
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{currentComponent.nameTh}</h3>
                  <p className="text-xs text-slate-400">{currentComponent.nameEn}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Category: {currentComponent.category.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Role & Specs */}
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase mb-1">บทบาทหน้าที่หลัก:</h4>
                    <p className="text-slate-300 leading-relaxed">{currentComponent.roleTh}</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase mb-1.5">คุณสมบัติทางเทคนิค:</h4>
                    <ul className="space-y-1 text-slate-300">
                      {currentComponent.specsTh.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Architecture Comparison Details */}
                <div className="space-y-3">
                  <div className="bg-sky-950/30 p-3.5 rounded-xl border border-sky-800/40">
                    <h4 className="text-[11px] font-bold text-sky-300 uppercase mb-1 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-sky-400" /> ในระบบ IP Network Camera:
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{currentComponent.ipEquivalent}</p>
                  </div>

                  <div className="bg-amber-950/30 p-3.5 rounded-xl border border-amber-800/40">
                    <h4 className="text-[11px] font-bold text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                      <Cable className="w-3 h-3 text-amber-400" /> ในระบบ Analog HD:
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{currentComponent.analogEquivalent}</p>
                  </div>

                  <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40 text-emerald-300 text-[11px]">
                    ⭐ <span className="font-bold">เคล็ดลับช่างมืออาชีพ:</span> {currentComponent.proTip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            TAB 4: COMMISSIONING CONSOLE & FIELD FAULT TROUBLESHOOTING
           ----------------------------------------------------------------- */}
        {activeTab === 'commissioning' && (
          <div className="space-y-6">
            {/* Top 4-Step Commissioning Checklist Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    กระบวนการตรวจรับและส่งมอบระบบ (4-Step Commissioning Procedure)
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">
                    การทดสอบการทำงาน 4 ลำดับก่อนส่งมอบงานวิทยาลัยเทคนิคอุบลราชธานี
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ตรวจสอบสถานะ Power, Live View, บันทึกภาพ 24/7 และทดสอบค้นหา Playback ย้อนหลัง
                  </p>
                </div>

                <button
                  onClick={runCommissioningSimulation}
                  disabled={isCommissioningRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{isCommissioningRunning ? 'กำลังทดสอบระบบ...' : 'รันการทดสอบ Commissioning'}</span>
                </button>
              </div>

              {/* 4 Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {COMMISSIONING_STEPS.map((cs) => {
                  const status = commissioningStatus[cs.step];

                  return (
                    <div
                      key={cs.step}
                      className={`p-3.5 rounded-xl border transition-all ${
                        status === 'pass'
                          ? 'bg-emerald-950/30 border-emerald-500/60'
                          : status === 'testing'
                          ? 'bg-sky-950/40 border-sky-500/60 animate-pulse'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{cs.title}</span>
                        {status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {status === 'testing' && <Activity className="w-4 h-4 text-sky-400 animate-spin" />}
                        {status === 'idle' && <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{cs.desc}</p>
                      <div className="text-[10px] font-mono bg-slate-900/80 p-1.5 rounded text-sky-300 border border-slate-800">
                        {cs.expectedVal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field Fault Troubleshooting Interactive Scenarios */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    การจำลองอาการเสียและแนวทางแก้ไขหน้างานจริง (Technician Fault Simulator)
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    แบบฝึกหัดแก้ปัญหา 4 สถานการณ์หน้างาน ณ วิทยาลัยเทคนิคอุบลราชธานี
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                    แก้โจทย์ถูกต้อง {faultScore}/{FAULT_SCENARIOS.length}
                  </span>
                </div>
              </div>

              {/* Scenario Carousel / Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 4 Cols: Scenario List */}
                <div className="lg:col-span-4 space-y-2">
                  {FAULT_SCENARIOS.map((sc, idx) => {
                    const selectedOpt = faultAnswers[sc.id];
                    const isSolved = selectedOpt !== undefined && selectedOpt !== null && sc.options[selectedOpt]?.isCorrect;

                    return (
                      <button
                        key={sc.id}
                        onClick={() => setActiveFaultIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          activeFaultIndex === idx
                            ? 'bg-sky-950/80 border-sky-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-sky-400 font-mono">เคส #{idx + 1}</span>
                          {isSolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <h4 className="text-xs font-semibold line-clamp-1">{sc.title}</h4>
                      </button>
                    );
                  })}
                </div>

                {/* Right 8 Cols: Active Scenario Details & Question */}
                <div className="lg:col-span-8 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  {(() => {
                    const currentFault = FAULT_SCENARIOS[activeFaultIndex] ?? FAULT_SCENARIOS[0]!;
                    const selectedChoiceIndex = faultAnswers[currentFault.id];
                    const hasAnswered = selectedChoiceIndex !== undefined && selectedChoiceIndex !== null;
                    const selectedOption = hasAnswered ? currentFault.options[selectedChoiceIndex] : undefined;

                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-bold text-white">{currentFault.title}</h4>
                        </div>
                        <p className="text-xs text-amber-200/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50 mb-4">
                          🚨 <span className="font-semibold">อาการที่พบ:</span> {currentFault.symptom}
                        </p>

                        <p className="text-xs font-bold text-sky-300 mb-3">{currentFault.questionTh}</p>

                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          {currentFault.options.map((opt, optIdx) => {
                            const isSelected = selectedChoiceIndex === optIdx;

                            return (
                              <button
                                key={optIdx}
                                onClick={() =>
                                  setFaultAnswers({ ...faultAnswers, [currentFault.id]: optIdx })
                                }
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                                  isSelected
                                    ? opt.isCorrect
                                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                                      : 'bg-rose-950/70 border-rose-500 text-rose-100'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback Banner */}
                        {selectedOption && (
                          <div
                            className={`p-3 rounded-xl border text-xs ${
                              selectedOption.isCorrect
                                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                : 'bg-rose-950/50 border-rose-500 text-rose-200'
                            }`}
                          >
                            <p className="font-medium">
                              {selectedOption.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL: SITE SURVEY REPORT GENERATOR
         ========================================================= */}
      {showSurveyReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase">
                  เอกสารประกอบการตรวจรับงานระบบ CCTV
                </span>
                <h3 className="text-base font-bold text-white">
                  ใบบันทึกผลการสำรวจและวางระบบ CCTV (วิทยาลัยเทคนิคอุบลราชธานี)
                </h3>
              </div>
              <button
                onClick={() => setShowSurveyReport(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-300">
                  <span className="text-slate-500">สถานที่:</span> วิทยาลัยเทคนิคอุบลราชธานี
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">จำนวนโซนที่สำรวจเสร็จสิ้น:</span>{' '}
                  <span className="text-sky-400 font-bold">{surveyedZones.length} / 5 โซน</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">การจัดลำดับ 6 ขั้นตอนติดตั้ง:</span>{' '}
                  <span className={sequenceValid ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {sequenceValid ? 'ผ่านเกณฑ์มาตรฐานช่าง' : 'ยังไม่สมบูรณ์'}
                  </span>
                </p>
              </div>

              {/* Table of Zones */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-800">
                      <th className="p-2">โซนยุทธศาสตร์</th>
                      <th className="p-2">ระยะ UTP</th>
                      <th className="p-2">ชนิดกล้อง</th>
                      <th className="p-2">PDPA Checklist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    {UBON_ZONES.map((z) => (
                      <tr key={z.id} className="hover:bg-slate-800/40">
                        <td className="p-2 text-white font-medium">{z.nameTh}</td>
                        <td className="p-2 font-mono text-sky-400">{z.distanceMeters}m</td>
                        <td className="p-2 text-slate-300 truncate max-w-[140px]">{z.recommendedCamera}</td>
                        <td className="p-2">
                          {pdpaAgreed[z.id] ? (
                            <span className="text-emerald-400 font-bold">✓ ตรวจแล้ว</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSurveyReport(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                รับทราบและปิดเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
