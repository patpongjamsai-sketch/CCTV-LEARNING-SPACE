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
  Edit3,
  Send,
  Award,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { UbonCampus2DMap } from './UbonCampus2DMap';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export interface StudentSurveyInput {
  environmentType: string;
  lightingCond: string;
  recommendedCamera: string;
  lensSpec: string;
  conduitType: string;
  pdpaAction: string;
  pdpaAgreed: boolean;
}

export interface StudentSurveyData extends StudentSurveyInput {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  feedback: string[];
  fieldScores: {
    environment: number;
    lighting: number;
    camera: number;
    lens: number;
    conduit: number;
    pdpa: number;
  };
  submittedAt: string;
}

export interface SurveyEvaluationResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  feedback: string[];
  fieldScores: {
    environment: number;
    lighting: number;
    camera: number;
    lens: number;
    conduit: number;
    pdpa: number;
  };
}

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

// 6 Strategic Zones of Ubon Ratchathani Technical College
export const UBON_ZONES: StrategicZone[] = [
  {
    id: 'gate',
    nameTh: '1. หน้าป้อมยามติดถนนเข้าออกวิทยาลัย',
    nameEn: 'Main Guardhouse on East Entrance Road (Chawalanok Rd.)',
    distanceMeters: 90,
    environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะและสภาพแวดล้อมริมถนนสาธารณะ',
    lightingCond: 'ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน (Headlight Glare)',
    recommendedCamera: 'Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m กันน้ำ IP67)',
    lensSpec: 'เลนส์ 4.0mm หรือ 6.0mm (มุมแคบเพื่อจับป้ายทะเบียนรถและใบหน้าผู้เข้า-ออก)',
    mountingHeight: '3.0 - 3.5 เมตร บนเสาเหล็กกลมหน้าป้อมยาม',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland',
    pdpaRequirement: 'ติดตั้งป้ายเตือน "พื้นที่นี้อยู่ภายใต้การบันทึกภาพด้วยกล้องวงจรปิด (CCTV in Operation)" ขนาดไม่น้อยกว่า A4',
    pdpaAction: 'ห้ามหันมุมกล้องมองข้ามแนวรั้วไปยังบ้านพักอาศัยของชุมชนโดยรอบถนนชวาลานอก',
    techNote: 'ระยะ 90m ใกล้ขีดจำกัด 100m ต้องใช้สาย Pure Copper CAT6 แท้ และทดสอบค่าความต้านทานสาย',
    svgPos: { x: 845, y: 360 },
  },
  {
    id: 'server',
    nameTh: '2. ห้องควบคุมระบบกล้องวงจรปิด',
    nameEn: 'CCTV Central Control & Server Room (NVR Hub)',
    distanceMeters: 0,
    environmentType: 'ในร่ม (Indoor) ห้องควบคุมปรับอากาศ 24 ชม. ปราศจากฝุ่น และมีระบบคีย์การ์ด',
    lightingCond: 'แสงสว่างสม่ำเสมอจากหลอดไฟห้องควบคุมระบบตลอดเวลา',
    recommendedCamera: 'Dome IP Camera 2MP ตรวจจับการเข้า-ออกของเจ้าหน้าที่และสังเกตหน้าตู้ Rack',
    lensSpec: 'เลนส์ 2.8mm ส่องตรงจุดตู้ Rack 19 นิ้วและประตูทางเข้าหลัก',
    mountingHeight: '2.6 - 2.8 เมตร ใต้เพดานห้องควบคุม',
    conduitType: 'Wireway (รางวายเวย์โลหะ) เข้าสู่ตู้ Rack 19 นิ้ว จัดสายด้วย Patch Panel',
    pdpaRequirement: 'เป็นพื้นที่ความลับสูงสุดตามมาตรฐาน PDPA (Zone Data Processor)',
    pdpaAction: 'บันทึก Log การเข้าถึงห้องและ Log การสืบค้นภาพจากเครื่อง NVR ทุกครั้งตามกฎหมาย',
    techNote: 'ศูนย์รวมตู้ Rack 19", NVR 32-CH, PoE Switch 24-Port และระบบสำรองไฟ UPS 2000VA',
    svgPos: { x: 535, y: 205 },
  },
  {
    id: 'admin',
    nameTh: '3. อาคารอำนวยการ',
    nameEn: 'Administrative & Director Building',
    distanceMeters: 40,
    environmentType: 'ในร่ม (Indoor) โถงต้อนรับและทางเดินอาคารอำนวยการ ฝ้าเพดานเรียบ สภาพแวดล้อมสะอาด',
    lightingCond: 'แสงไฟสว่างจากหลอด LED ตลอดช่วงเวลาทำการราชการ',
    recommendedCamera: 'Dome IP Camera 4MP ดีไซน์สวยงาม กลมกลืนกับสถาปัตยกรรมภายใน',
    lensSpec: 'เลนส์ 2.8mm (มุมมองกว้าง 100°+ เพื่อครอบคลุมโถงต้อนรับและทางเดิน)',
    mountingHeight: '2.8 - 3.0 เมตร ใต้ฝ้าเพดาน',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้าเพดาน หรือรางเก็บสายไฟพลาสติกเข้ารูป',
    pdpaRequirement: 'คุ้มครองสิทธิส่วนบุคคลของผู้มาติดต่อราชการ ครู และบุคลากรทางการศึกษา',
    pdpaAction: 'ตั้งค่า Privacy Masking (หน้ากากแถบดำ) ปิดบังบริเวณโต๊ะเอกสารสำคัญการเงินและไม่ส่องประตูห้องน้ำ',
    techNote: 'จุดศูนย์กลางประสานงาน เดินสาย UTP ระยะสั้น 40m ผ่านท่อ uPVC เหนือฝ้าเพดาน',
    svgPos: { x: 585, y: 340 },
  },
  {
    id: 'parking_dome',
    nameTh: '4. โดมใหญ่จอดรถ',
    nameEn: 'Large Covered Parking Dome & Vehicle Canopy',
    distanceMeters: 75,
    environmentType: 'กึ่งกลางแจ้งใต้ร่มเงาหลังคาโดมโค้ง (Semi-Outdoor) ลมพัดผ่าน ฝุ่นควันและไอเสียรถยนต์',
    lightingCond: 'ใต้โดมมีเงาร่มครึ้ม แสงภายนอกสว่างจ้า (ความต่างแสงสูง) และเวลากลางคืนมืดสลัว',
    recommendedCamera: 'Bullet IP Camera 4MP โครงสร้างโลหะกันน้ำ IP67 พร้อม DarkFighter และ Smart IR 50m',
    lensSpec: 'เลนส์ 2.8mm - 4.0mm เพื่อครอบคลุมแนวกว้างของแถวจอดรถยนต์และจักรยานยนต์',
    mountingHeight: '4.0 - 5.0 เมตร บนเสาโครงสร้างเหล็กของโดม',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว/ท่อเหล็ก EMT ยึดโครงสร้างเหล็ก + กล่องพักสาย IP66 และ Surge SPD',
    pdpaRequirement: 'เพื่อดูแลความปลอดภัยในทรัพย์สินและยานพาหนะของครู บุคลากร และนักศึกษา',
    pdpaAction: 'กำหนดสิทธิ์การดูภาพสดเฉพาะเจ้าหน้าที่ รปภ. และผู้ดูแลระบบเท่านั้น',
    techNote: 'โครงสร้างโลหะขนาดใหญ่ในพื้นที่เปิดโล่ง ควรติดตั้ง Surge Protection Device (SPD) ป้องกันไฟกระชาก',
    svgPos: { x: 705, y: 565 },
  },
  {
    id: 'com_tech',
    nameTh: '5. อาคารเรียนแผนกเทคโนโลยีคอมพิวเตอร์',
    nameEn: 'Computer Technology Department Building',
    distanceMeters: 65,
    environmentType: 'ในอาคารเรียน (Indoor) ระเบียงทางเดินหน้าห้องปฏิบัติการคอมพิวเตอร์ ฝ้าเพดาน T-Bar',
    lightingCond: 'แสงไฟสว่างจากหลอด LED ตามทางเดินและแสงสะท้อนจากกระจกห้องแล็บ',
    recommendedCamera: 'Vandal-Proof Dome IP Camera 4MP โครงสร้างทนแรงกระแทก IK10 & IP66',
    lensSpec: 'เลนส์ 2.8mm (มุมกว้าง 103°) ครอบคลุมแนวยาวตลอดระเบียงทางเดินหน้าห้องเรียน',
    mountingHeight: '2.8 - 3.2 เมตร ใต้ฝ้าเพดาน T-Bar',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้า T-Bar พร้อมแผ่นไม้อัดรองรับน้ำหนัก',
    pdpaRequirement: 'คุ้มครองสิทธิความเป็นส่วนตัวของนักศึกษาและอาจารย์ผู้สอน',
    pdpaAction: 'ไม่หันมุมกล้องมองเข้าไปในพื้นที่ส่วนตัวหรือบริเวณห้องน้ำของอาคารเรียน',
    techNote: 'จุดเชื่อมต่ออุปกรณ์แล็บเครือข่าย สามารถเดินสาย Trunk ไปยังตู้ Rack ประจำชั้นของแผนกคอมฯ',
    svgPos: { x: 415, y: 525 },
  },
  {
    id: 'canteen',
    nameTh: '6. โรงอาหาร',
    nameEn: 'College Canteen & Cafeteria Hall',
    distanceMeters: 55,
    environmentType: 'กึ่งกลางแจ้งโถงสูง (Semi-Outdoor High Ceiling) ไอน้ำมัน ไอร้อน ควัน ฝุ่น ละอองอาหาร และคนพลุกพล่าน',
    lightingCond: 'แสงแดดธรรมชาติส่องผ่านช่องลมด้านข้างผสมกับแสงโคมไฟโรงอาหาร',
    recommendedCamera: 'Dome IP Camera 4MP โครงสร้างโลหะกันน้ำ/ไอน้ำมัน IP66/IP67 และกันกระแทก IK10',
    lensSpec: 'เลนส์ 2.8mm มุมกว้าง เพื่อครอบคลุมลานที่นั่งรับประทานอาหารและจุดร้านค้า',
    mountingHeight: '3.5 - 4.0 เมตร บนเสาโครงสร้างอาคารโรงอาหาร',
    conduitType: 'ท่อร้อยสาย uPVC สีขาว ซีลข้อต่อกันความชื้นและไอไขมันแน่นหนา',
    pdpaRequirement: 'รักษาความปลอดภัยและสุขอนามัยในพื้นที่รับประทานอาหารของวิทยาลัย',
    pdpaAction: 'ติดป้ายเตือน CCTV in Operation และสิทธิ์การเข้าถึงภาพเพื่อความปลอดภัยในทรัพย์สิน',
    techNote: 'หลีกเลี่ยงการติดตั้งใกล้เตาแก๊สหรือพัดลมดูดควันโดยตรงเพื่อป้องกันคราบเขม่าจับหน้าเลนส์',
    svgPos: { x: 380, y: 375 },
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

// Suggestion options for students to quickly study and fill in findings
export const ZONE_SUGGESTIONS: Record<string, {
  environment: string[];
  lighting: string[];
  camera: string[];
  lens: string[];
  conduit: string[];
  pdpa: string[];
}> = {
  gate: {
    environment: [
      'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะและสภาพแวดล้อมริมถนนสาธารณะ',
      'กลางแจ้งสมบูรณ์ (Full Outdoor) แดดจัด',
      'ในร่ม (Indoor) ปราศจากฝุ่น',
    ],
    lighting: [
      'ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน (Headlight Glare)',
      'แสงสว่างสม่ำเสมอจากหลอด LED',
      'แสงสลัวตลอดทั้งวัน',
    ],
    camera: [
      'Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m กันน้ำ IP67)',
      'Speed Dome PTZ 25x Zoom IP67',
      'Dome IP Camera 2MP ทรงโดมพลาสติก',
    ],
    lens: [
      'เลนส์ 4.0mm หรือ 6.0mm (มุมแคบเพื่อจับป้ายทะเบียนรถและใบหน้าผู้เข้า-ออก)',
      'เลนส์ 2.8mm (มุมมองกว้าง 103°)',
      'เลนส์ฟิชอาย 360°',
    ],
    conduit: [
      'ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland',
      'ท่อเหล็ก EMT แข็งแรงทนกระแทก',
      'ราง Wireway โลหะ',
    ],
    pdpa: [
      'ติดตั้งป้ายเตือน CCTV in Operation และห้ามส่องข้ามรั้วไปยังบ้านพักชุมชน',
      'ไม่จำเป็นต้องติดป้ายเตือน',
      'เปิดสตรีมภาพสาธารณะให้ทุกคนดูได้',
    ],
  },
  server: {
    environment: [
      'ในร่ม (Indoor) ห้องควบคุมปรับอากาศ 24 ชม. ปราศจากฝุ่น และมีระบบคีย์การ์ด',
      'กึ่งกลางแจ้ง มีฝุ่นควัน',
      'พื้นที่ชื้นแฉะตลอดเวลา',
    ],
    lighting: [
      'แสงสว่างสม่ำเสมอจากหลอดไฟห้องควบคุมระบบตลอดเวลา',
      'มืดสนิท 24 ชั่วโมง',
      'แสงไฟกระพริบ',
    ],
    camera: [
      'Dome IP Camera 2MP ตรวจจับการเข้า-ออกของเจ้าหน้าที่และสังเกตหน้าตู้ Rack',
      'Speed Dome PTZ ขนาดใหญ่',
      'กล้องโซล่าเซลล์ไร้สาย',
    ],
    lens: [
      'เลนส์ 2.8mm ส่องตรงจุดตู้ Rack 19 นิ้วและประตูทางเข้าหลัก',
      'เลนส์ซูมไกล 50 เมตร',
      'เลนส์มาโคร',
    ],
    conduit: [
      'Wireway (รางวายเวย์โลหะ) เข้าสู่ตู้ Rack 19 นิ้ว จัดสายด้วย Patch Panel',
      'ปล่อยสายกองบนพื้นห้องเซิร์ฟเวอร์',
      'ตีกิ๊บสายกับผนัง',
    ],
    pdpa: [
      'พื้นที่ความลับสูงสุด (Zone Data Processor) บันทึก Log การเข้าถึงและสืบค้นตามกฎหมาย',
      'อนุญาตให้บุคคลภายนอกเข้าดู NVR ได้อิสระ',
    ],
  },
  admin: {
    environment: [
      'ในร่ม (Indoor) โถงต้อนรับและทางเดินอาคารอำนวยการ ฝ้าเพดานเรียบ สภาพแวดล้อมสะอาด',
      'กลางแจ้งแดดจัด มีฝนสาด',
      'โรงช่างมีฝุ่นละออง',
    ],
    lighting: [
      'แสงไฟสว่างจากหลอด LED ตลอดช่วงเวลาทำการราชการ',
      'ย้อนแสงจัดจากไฟหน้ารถยนต์',
      'มืดสนิทตลอดวัน',
    ],
    camera: [
      'Dome IP Camera 4MP ดีไซน์สวยงาม กลมกลืนกับสถาปัตยกรรมภายใน',
      'กล้องทรงกระบอกเหล็กขนาดใหญ่',
      'กล้องเว็บแคม',
    ],
    lens: [
      'เลนส์ 2.8mm (มุมมองกว้าง 100°+ เพื่อครอบคลุมโถงต้อนรับและทางเดิน)',
      'เลนส์ 8.0mm มุมแคบเจาะจง',
      'เลนส์เทเลโฟโต้',
    ],
    conduit: [
      'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้าเพดาน หรือรางเก็บสายไฟพลาสติกเข้ารูป',
      'เดินสายเปลือยห้อยลงมา',
      'ท่อเหล็กหนาพิเศษฝังดิน',
    ],
    pdpa: [
      'ตั้งค่า Privacy Masking (หน้ากากแถบดำ) ปิดบังบริเวณโต๊ะเอกสารสำคัญการเงินและไม่ส่องประตูห้องน้ำ',
      'ถ่ายทอดสดโถงต้อนรับลงโซเชียลมีเดีย',
    ],
  },
  parking_dome: {
    environment: [
      'กึ่งกลางแจ้งใต้ร่มเงาหลังคาโดมโค้ง (Semi-Outdoor) ลมพัดผ่าน ฝุ่นควันและไอเสียรถยนต์',
      'ห้องแอร์ควบคุมความเย็น',
      'ห้องใต้ดิน',
    ],
    lighting: [
      'ใต้โดมมีเงาร่มครึ้ม แสงภายนอกสว่างจ้า (ความต่างแสงสูง) และเวลากลางคืนมืดสลัว',
      'แสงสม่ำเสมอตลอด 24 ชม.',
    ],
    camera: [
      'Bullet IP Camera 4MP โครงสร้างโลหะกันน้ำ IP67 พร้อม DarkFighter และ Smart IR 50m',
      'กล้องพลาสติกสำหรับใช้ภายในห้องนอน',
    ],
    lens: [
      'เลนส์ 2.8mm - 4.0mm เพื่อครอบคลุมแนวกว้างของแถวจอดรถยนต์และจักรยานยนต์',
      'เลนส์มาโครระยะใกล้ 10 ซม.',
    ],
    conduit: [
      'ท่อร้อยสาย uPVC สีขาว/ท่อเหล็ก EMT ยึดโครงสร้างเหล็ก + กล่องพักสาย IP66 และ Surge SPD',
      'มัดสาย LAN กับลวดหนาม',
    ],
    pdpa: [
      'เพื่อดูแลความปลอดภัยในทรัพย์สินและยานพาหนะของครู บุคลากร และนักศึกษา กำหนดสิทธิ์ดูภาพเฉพาะ รปภ.',
      'ส่องกล้องเข้าไปในกระจกรถยนต์ส่วนบุคคล',
    ],
  },
  com_tech: {
    environment: [
      'ในอาคารเรียน (Indoor) ระเบียงทางเดินหน้าห้องปฏิบัติการคอมพิวเตอร์ ฝ้าเพดาน T-Bar',
      'กลางแจ้งสมบูรณ์ ตากแดดตากฝน',
    ],
    lighting: [
      'แสงไฟสว่างจากหลอด LED ตามทางเดินและแสงสะท้อนจากกระจกห้องแล็บ',
      'มืดสนิทตลอดเวลา',
    ],
    camera: [
      'Vandal-Proof Dome IP Camera 4MP โครงสร้างทนแรงกระแทก IK10 & IP66',
      'กล้องเว็บแคมพลาสติก',
    ],
    lens: [
      'เลนส์ 2.8mm (มุมกว้าง 103°) ครอบคลุมแนวยาวตลอดระเบียงทางเดินหน้าห้องเรียน',
      'เลนส์ 16mm ซูมเฉพาะจุด',
    ],
    conduit: [
      'ท่อร้อยสาย uPVC สีขาว ซ่อนสายเหนือฝ้า T-Bar พร้อมแผ่นไม้อัดรองรับน้ำหนัก',
      'ปล่อยสายห้อยโตงเตงหน้าประตูห้องเรียน',
    ],
    pdpa: [
      'คุ้มครองสิทธิส่วนบุคคลของนักศึกษาและอาจารย์ ไม่หันมุมกล้องมองเข้าห้องน้ำหรือพื้นที่ส่วนตัว',
      'ติดกล้องถ่ายทอดสดในห้องน้ำ',
    ],
  },
  canteen: {
    environment: [
      'กึ่งกลางแจ้งโถงสูง (Semi-Outdoor High Ceiling) ไอน้ำมัน ไอร้อน ควัน ฝุ่น ละอองอาหาร และคนพลุกพล่าน',
      'ห้องเซิร์ฟเวอร์ปลอดเชื้อ',
    ],
    lighting: [
      'แสงแดดธรรมชาติส่องผ่านช่องลมด้านข้างผสมกับแสงโคมไฟโรงอาหาร',
      'มืดสนิทตลอดวัน',
    ],
    camera: [
      'Dome IP Camera 4MP โครงสร้างโลหะกันน้ำ/ไอน้ำมัน IP66/IP67 และกันกระแทก IK10',
      'กล้องกล่องกระดาษจำลอง',
    ],
    lens: [
      'เลนส์ 2.8mm มุมกว้าง เพื่อครอบคลุมลานที่นั่งรับประทานอาหารและจุดร้านค้า',
      'เลนส์ 12mm มุมแคบ',
    ],
    conduit: [
      'ท่อร้อยสาย uPVC สีขาว ซีลข้อต่อกันความชื้นและไอไขมันแน่นหนา',
      'เดินสายเปลือยผ่านเตาแก๊ส',
    ],
    pdpa: [
      'ติดป้ายเตือน CCTV in Operation และสิทธิ์การเข้าถึงภาพเพื่อความปลอดภัยในทรัพย์สินและสุขอนามัย',
      'ส่องกล้องซูมจานอาหารของนักเรียนทุกคน',
    ],
  },
};

// Evaluation Engine
export function evaluateStudentSurvey(zoneId: string, input: StudentSurveyInput): SurveyEvaluationResult {
  let envScore = 0;
  let lightScore = 0;
  let camScore = 0;
  let lensScore = 0;
  let conduitScore = 0;
  let pdpaScore = 0;
  const feedback: string[] = [];

  const envLower = (input.environmentType || '').toLowerCase();
  const lightLower = (input.lightingCond || '').toLowerCase();
  const camLower = (input.recommendedCamera || '').toLowerCase();
  const lensLower = (input.lensSpec || '').toLowerCase();
  const condLower = (input.conduitType || '').toLowerCase();
  const pdpaLower = (input.pdpaAction || '').toLowerCase();

  switch (zoneId) {
    case 'gate':
      // Environment (20)
      if (envLower.includes('กึ่งกลางแจ้ง') || envLower.includes('semi') || envLower.includes('ฝุ่น') || envLower.includes('ยานพาหนะ') || envLower.includes('ถนน') || envLower.includes('ป้อมยาม')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
        feedback.push('สภาพพื้นที่ควรระบุปัจจัยเรื่องฝุ่นควันยานพาหนะหรือพื้นที่กึ่งกลางแจ้ง (Semi-Outdoor)');
      }

      // Lighting (15)
      if (lightLower.includes('ย้อนแสง') || lightLower.includes('wdr') || lightLower.includes('ไฟหน้า') || lightLower.includes('แดด') || lightLower.includes('กลางคืน') || lightLower.includes('glare')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
        feedback.push('ควรคำนึงถึงปัญหาย้อนแสงเวลากลางวันและแสงไฟหน้ารถยนต์ส่องตรง');
      }

      // Camera (25)
      if (camLower.includes('bullet') || camLower.includes('กระบอก') || camLower.includes('wdr') || camLower.includes('4mp') || camLower.includes('ip66') || camLower.includes('ip67')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
        feedback.push('ซุ้มประตูควรใช้กล้องทรง Bullet IP ที่มีฟังก์ชัน True WDR เพื่อตัดแสงย้อน');
      }

      // Lens (15)
      if (lensLower.includes('4') || lensLower.includes('6') || lensLower.includes('แคบ') || lensLower.includes('ทะเบียน') || lensLower.includes('ใบหน้า') || lensLower.includes('identify')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
        feedback.push('ซุ้มประตูต้องการภาพระดับ Identify จับป้ายทะเบียน/ใบหน้า ควรใช้เลนส์ 4.0-6.0mm');
      }

      // Conduit (15)
      if (condLower.includes('upvc') || condLower.includes('ip66') || condLower.includes('กันน้ำ') || condLower.includes('gland') || condLower.includes('20') || condLower.includes('emt')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
        feedback.push('ภายนอกอาคารควรใช้ท่อ uPVC หรือกล่องพักสายกันน้ำ IP66 พร้อม Cable Gland');
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('ป้าย') || pdpaLower.includes('เตือน') || pdpaLower.includes('รั้ว') || pdpaLower.includes('ชุมชน') || pdpaLower.includes('cctv') || pdpaLower.includes('operation')) {
        pdpaScore += 5;
      } else if (!input.pdpaAgreed) {
        feedback.push('ต้องทำเครื่องหมายยืนยันและระบุการติดป้ายเตือน CCTV in Operation ตาม PDPA');
      }
      break;

    case 'server':
      // Environment (20)
      if (envLower.includes('ปรับอากาศ') || envLower.includes('แอร์') || envLower.includes('คีย์การ์ด') || envLower.includes('ควบคุม') || envLower.includes('24') || envLower.includes('server') || envLower.includes('ตู้') || envLower.includes('ในร่ม') || envLower.includes('indoor')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
        feedback.push('ควรระบุสภาพห้องควบคุมปรับอากาศ 24 ชม. และมีระบบคีย์การ์ด');
      }

      // Lighting (15)
      if (lightLower.includes('หลอดไฟ') || lightLower.includes('คอมพิวเตอร์') || lightLower.includes('สว่าง') || lightLower.includes('led') || lightLower.includes('สม่ำเสมอ')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
      }

      // Camera (25)
      if (camLower.includes('dome') || camLower.includes('โดม') || camLower.includes('2mp') || camLower.includes('rack') || camLower.includes('ประตู') || camLower.includes('เข้า-ออก')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
      }

      // Lens (15)
      if (lensLower.includes('2.8') || lensLower.includes('กว้าง') || lensLower.includes('rack') || lensLower.includes('ประตู')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
      }

      // Conduit (15)
      if (condLower.includes('wireway') || condLower.includes('วายเวย์') || condLower.includes('rack') || condLower.includes('รางโลหะ') || condLower.includes('ราง')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('log') || pdpaLower.includes('ความลับ') || pdpaLower.includes('processor') || pdpaLower.includes('สืบค้น') || pdpaLower.includes('บันทึก')) {
        pdpaScore += 5;
      }
      break;

    case 'admin':
      // Environment (20)
      if (envLower.includes('ในร่ม') || envLower.includes('indoor') || envLower.includes('อำนวยการ') || envLower.includes('โถง') || envLower.includes('ทางเดิน') || envLower.includes('ฝ้าเพดาน') || envLower.includes('สะอาด')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
      }

      // Lighting (15)
      if (lightLower.includes('led') || lightLower.includes('สม่ำเสมอ') || lightLower.includes('หลอดไฟ') || lightLower.includes('สว่าง') || lightLower.includes('ทำการ')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
      }

      // Camera (25)
      if (camLower.includes('dome') || camLower.includes('โดม') || camLower.includes('4mp') || camLower.includes('กลมกลืน') || camLower.includes('เรียบร้อย') || camLower.includes('ip')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
      }

      // Lens (15)
      if (lensLower.includes('2.8') || lensLower.includes('กว้าง') || lensLower.includes('100') || lensLower.includes('103') || lensLower.includes('โถง')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
      }

      // Conduit (15)
      if (condLower.includes('upvc') || condLower.includes('ฝ้า') || condLower.includes('ราง') || condLower.includes('ซ่อน') || condLower.includes('พลาสติก')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('mask') || pdpaLower.includes('หน้ากาก') || pdpaLower.includes('ห้องน้ำ') || pdpaLower.includes('เอกสาร') || pdpaLower.includes('การเงิน') || pdpaLower.includes('privacy') || pdpaLower.includes('ส่วนบุคคล')) {
        pdpaScore += 5;
      }
      break;

    case 'parking_dome':
      // Environment (20)
      if (envLower.includes('โดม') || envLower.includes('จอดรถ') || envLower.includes('semi') || envLower.includes('กึ่งกลางแจ้ง') || envLower.includes('หลังคา') || envLower.includes('ไอเสีย') || envLower.includes('ควัน')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
        feedback.push('ควรระบุปัจจัยเรื่องโดมจอดรถกึ่งกลางแจ้ง (Semi-Outdoor) และไอเสียยานพาหนะ');
      }

      // Lighting (15)
      if (lightLower.includes('เงา') || lightLower.includes('ร่ม') || lightLower.includes('ต่าง') || lightLower.includes('มืด') || lightLower.includes('กลางคืน') || lightLower.includes('สว่าง') || lightLower.includes('wdr') || lightLower.includes('จ้า')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
      }

      // Camera (25)
      if (camLower.includes('bullet') || camLower.includes('กระบอก') || camLower.includes('ip67') || camLower.includes('darkfighter') || camLower.includes('4mp') || camLower.includes('ir') || camLower.includes('โลหะ')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
      }

      // Lens (15)
      if (lensLower.includes('2.8') || lensLower.includes('4.0') || lensLower.includes('4') || lensLower.includes('กว้าง') || lensLower.includes('จอดรถ')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
      }

      // Conduit (15)
      if (condLower.includes('upvc') || condLower.includes('emt') || condLower.includes('เหล็ก') || condLower.includes('spd') || condLower.includes('surge') || condLower.includes('ip66') || condLower.includes('โครงสร้าง')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('ทรัพย์สิน') || pdpaLower.includes('ยานพาหนะ') || pdpaLower.includes('รปภ') || pdpaLower.includes('ผู้บริหาร') || pdpaLower.includes('ปลอดภัย') || pdpaLower.includes('ป้าย')) {
        pdpaScore += 5;
      }
      break;

    case 'com_tech':
      // Environment (20)
      if (envLower.includes('คอมพิวเตอร์') || envLower.includes('ในอาคาร') || envLower.includes('indoor') || envLower.includes('ทางเดิน') || envLower.includes('t-bar') || envLower.includes('ฝ้า') || envLower.includes('อาคารเรียน')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
      }

      // Lighting (15)
      if (lightLower.includes('led') || lightLower.includes('สะท้อน') || lightLower.includes('กระจก') || lightLower.includes('สว่าง') || lightLower.includes('หลอดไฟ')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
      }

      // Camera (25)
      if (camLower.includes('vandal') || camLower.includes('ik10') || camLower.includes('dome') || camLower.includes('โดม') || camLower.includes('4mp') || camLower.includes('กระแทก')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
      }

      // Lens (15)
      if (lensLower.includes('2.8') || lensLower.includes('กว้าง') || lensLower.includes('103') || lensLower.includes('ทางเดิน') || lensLower.includes('ระเบียง')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
      }

      // Conduit (15)
      if (condLower.includes('upvc') || condLower.includes('ฝ้า') || condLower.includes('t-bar') || condLower.includes('ไม้อัด') || condLower.includes('ซ่อน')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('สิทธิ') || pdpaLower.includes('ส่วนตัว') || pdpaLower.includes('ห้องน้ำ') || pdpaLower.includes('นักศึกษา') || pdpaLower.includes('ความเป็นส่วนตัว')) {
        pdpaScore += 5;
      }
      break;

    case 'canteen':
      // Environment (20)
      if (envLower.includes('โรงอาหาร') || envLower.includes('โภชนาการ') || envLower.includes('น้ำมัน') || envLower.includes('ควัน') || envLower.includes('ไอร้อน') || envLower.includes('semi') || envLower.includes('กึ่งกลางแจ้ง') || envLower.includes('พลุกพล่าน')) {
        envScore = 20;
      } else if (envLower.trim().length > 3) {
        envScore = 10;
        feedback.push('ควรระบุสภาพโรงอาหารที่มีละอองไอน้ำมัน ไอร้อน ควัน และความชื้น');
      }

      // Lighting (15)
      if (lightLower.includes('ธรรมชาติ') || lightLower.includes('ช่องลม') || lightLower.includes('โคมไฟ') || lightLower.includes('ผสม') || lightLower.includes('แดด') || lightLower.includes('สว่าง')) {
        lightScore = 15;
      } else if (lightLower.trim().length > 3) {
        lightScore = 8;
      }

      // Camera (25)
      if (camLower.includes('dome') || camLower.includes('โดม') || camLower.includes('ip66') || camLower.includes('ip67') || camLower.includes('ik10') || camLower.includes('น้ำมัน') || camLower.includes('โลหะ') || camLower.includes('4mp')) {
        camScore = 25;
      } else if (camLower.trim().length > 3) {
        camScore = 12;
      }

      // Lens (15)
      if (lensLower.includes('2.8') || lensLower.includes('กว้าง') || lensLower.includes('ร้านค้า') || lensLower.includes('รับประทาน') || lensLower.includes('อาหาร')) {
        lensScore = 15;
      } else if (lensLower.trim().length > 2) {
        lensScore = 8;
      }

      // Conduit (15)
      if (condLower.includes('upvc') || condLower.includes('ซีล') || condLower.includes('แน่นหนา') || condLower.includes('น้ำมัน') || condLower.includes('ความชื้น') || condLower.includes('ท่อ')) {
        conduitScore = 15;
      } else if (condLower.trim().length > 3) {
        conduitScore = 8;
      }

      // PDPA (10)
      if (input.pdpaAgreed) pdpaScore += 5;
      if (pdpaLower.includes('ป้าย') || pdpaLower.includes('เตือน') || pdpaLower.includes('cctv') || pdpaLower.includes('operation') || pdpaLower.includes('ทรัพย์สิน') || pdpaLower.includes('สุขอนามัย') || pdpaLower.includes('ปลอดภัย')) {
        pdpaScore += 5;
      }
      break;

    default:
      envScore = 15;
      lightScore = 10;
      camScore = 20;
      lensScore = 10;
      conduitScore = 10;
      pdpaScore = 8;
  }

  const totalScore = envScore + lightScore + camScore + lensScore + conduitScore + pdpaScore;
  let grade: 'A' | 'B' | 'C' | 'D' = 'D';
  if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore >= 40) grade = 'C';

  if (feedback.length === 0) {
    if (totalScore >= 80) {
      feedback.push('ผลการสำรวจและสเปกทางวิศวกรรมถูกต้องสมบูรณ์แบบตามมาตรฐานงานช่าง CCTV วท.อุบลราชธานี');
    } else {
      feedback.push('บันทึกข้อมูลสำเร็จ ตรวจสอบความครบถ้วนของสเปกเพื่อเพิ่มคะแนนวิชาชีพ');
    }
  }

  return {
    score: totalScore,
    grade,
    feedback,
    fieldScores: {
      environment: envScore,
      lighting: lightScore,
      camera: camScore,
      lens: lensScore,
      conduit: conduitScore,
      pdpa: pdpaScore,
    },
  };
}

export function SiteSurveySimulator() {
  const [activeTab, setActiveTab] = useState<'survey' | 'workflow' | 'components' | 'commissioning'>('survey');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('gate');
  const [surveyedZones, setSurveyedZones] = useState<string[]>(['gate']);
  const [pdpaAgreed, setPdpaAgreed] = useState<Record<string, boolean>>({
    gate: true,
    server: false,
    admin: false,
    parking_dome: false,
    com_tech: false,
    canteen: false,
  });

  // Student submitted survey answers and scores
  const [submittedSurveys, setSubmittedSurveys] = useState<Record<string, StudentSurveyData>>({});

  // Active form drafts per zone
  const [surveyDrafts, setSurveyDrafts] = useState<Record<string, {
    environmentType: string;
    lightingCond: string;
    recommendedCamera: string;
    lensSpec: string;
    conduitType: string;
    pdpaAction: string;
  }>>({
    gate: {
      environmentType: 'กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะและสภาพแวดล้อมริมถนนสาธารณะ',
      lightingCond: '',
      recommendedCamera: '',
      lensSpec: '',
      conduitType: '',
      pdpaAction: '',
    },
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

  // Current draft & submission
  const currentDraft = surveyDrafts[selectedZoneId] || {
    environmentType: submittedSurveys[selectedZoneId]?.environmentType || '',
    lightingCond: submittedSurveys[selectedZoneId]?.lightingCond || '',
    recommendedCamera: submittedSurveys[selectedZoneId]?.recommendedCamera || '',
    lensSpec: submittedSurveys[selectedZoneId]?.lensSpec || '',
    conduitType: submittedSurveys[selectedZoneId]?.conduitType || '',
    pdpaAction: submittedSurveys[selectedZoneId]?.pdpaAction || '',
  };

  const isCurrentZoneSubmitted = !!submittedSurveys[selectedZoneId];
  const currentSubmission = submittedSurveys[selectedZoneId];

  // Update a field in the active zone draft
  const handleUpdateDraft = (field: string, value: string) => {
    setSurveyDrafts((prev) => ({
      ...prev,
      [selectedZoneId]: {
        ...(prev[selectedZoneId] || {
          environmentType: '',
          lightingCond: '',
          recommendedCamera: '',
          lensSpec: '',
          conduitType: '',
          pdpaAction: '',
        }),
        [field]: value,
      },
    }));
  };

  // Quick fill from suggestions
  const handleApplySuggestion = (field: string, value: string) => {
    handleUpdateDraft(field, value);
  };

  // Fill standard sample specifications for self-study
  const handleFillStandardSpec = (zone: StrategicZone) => {
    setSurveyDrafts((prev) => ({
      ...prev,
      [zone.id]: {
        environmentType: zone.environmentType,
        lightingCond: zone.lightingCond,
        recommendedCamera: zone.recommendedCamera,
        lensSpec: zone.lensSpec,
        conduitType: zone.conduitType,
        pdpaAction: zone.pdpaAction,
      },
    }));
    setPdpaAgreed((prev) => ({ ...prev, [zone.id]: true }));
  };

  // Submit survey for evaluation
  const handleSubmitSurvey = (zoneId: string) => {
    const draft = surveyDrafts[zoneId] || {
      environmentType: '',
      lightingCond: '',
      recommendedCamera: '',
      lensSpec: '',
      conduitType: '',
      pdpaAction: '',
    };
    const isPdpaAgreed = pdpaAgreed[zoneId] || false;

    const evaluation = evaluateStudentSurvey(zoneId, {
      ...draft,
      pdpaAgreed: isPdpaAgreed,
    });

    const surveyData: StudentSurveyData = {
      environmentType: draft.environmentType,
      lightingCond: draft.lightingCond,
      recommendedCamera: draft.recommendedCamera,
      lensSpec: draft.lensSpec,
      conduitType: draft.conduitType,
      pdpaAction: draft.pdpaAction,
      pdpaAgreed: isPdpaAgreed,
      score: evaluation.score,
      grade: evaluation.grade,
      feedback: evaluation.feedback,
      fieldScores: evaluation.fieldScores,
      submittedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setSubmittedSurveys((prev) => ({ ...prev, [zoneId]: surveyData }));
    if (!surveyedZones.includes(zoneId)) {
      setSurveyedZones((prev) => [...prev, zoneId]);
    }
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
              ระบบจำลองการสำรวจพื้นที่ 6 จุดสำรวจยุทธศาสตร์, ขั้นตอนการติดตั้งมาตรฐาน 6 ขั้น, องค์ประกอบ 5 ส่วน และ Commissioning
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
            {/* Left 7 Cols: 2D Architectural / Satellite Map of Ubon Ratchathani Technical College */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <UbonCampus2DMap
                selectedZoneId={selectedZoneId}
                onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
                surveyedZones={surveyedZones}
                submittedSurveys={submittedSurveys}
              />

              {/* Zone Selector Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {UBON_ZONES.map((zone, idx) => {
                  const isSelected = selectedZoneId === zone.id;
                  const isSubmitted = !!submittedSurveys[zone.id];
                  const submission = submittedSurveys[zone.id];

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/90 border-sky-400 text-white shadow-lg ring-1 ring-sky-500/50'
                          : isSubmitted
                          ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200 hover:border-emerald-400'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-sky-400 font-bold">
                          #{idx + 1} • {zone.distanceMeters}m
                        </span>
                        {isSubmitted && submission ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {submission.score}%
                          </span>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <p className="text-xs font-semibold truncate">
                        {zone.nameTh.replace(/^\d+\.\s*/, '')}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Map Footer helper note */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>
                    พื้นที่จริง: <strong className="text-white">วิทยาลัยเทคนิคอุบลราชธานี</strong> (แผนผัง 2D ไร้ป้ายตัวหนังสือตามโจทย์)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSurveyReport(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition cursor-pointer text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ออกใบบันทึกผลการสำรวจ ({Object.keys(submittedSurveys).length}/6)</span>
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Student Survey Input Form & Technical Grading */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
              <div>
                {/* Zone Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        จุดสำรวจที่ {currentZone.id === 'gate' ? '1' : currentZone.id === 'flagpole' ? '2' : currentZone.id === 'workshop' ? '3' : currentZone.id === 'academic' ? '4' : '5'}
                      </span>
                      {currentSubmission && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentSubmission.score >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          เกรด {currentSubmission.grade} ({currentSubmission.score}/100)
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">{currentZone.nameTh}</h2>
                    <p className="text-[11px] text-slate-400">{currentZone.nameEn}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-bold bg-slate-950 text-sky-400 border border-slate-800 inline-block">
                      {currentZone.distanceMeters}m UTP
                    </span>
                    {currentZone.distanceMeters >= 90 && (
                      <span className="block text-[10px] text-amber-400 font-bold mt-1">
                        ⚠️ เสี่ยงเกินขีด 100m
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Task Instructions */}
                <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-2.5 mb-3 text-xs text-sky-200/90 flex items-start gap-2">
                  <Edit3 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sky-200">
                      ให้นักเรียนสำรวจพื้นที่จริง แล้วพิมพ์ข้อมูลวิศวกรรมลงในช่องกรอกข้อมูล:
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      สามารถคลิกแท็กคำศัพท์แนะนำเพื่อกรอกข้อมูลอย่างรวดเร็ว หรือพิมพ์ระบุสภาพแวดล้อมจริง
                    </p>
                  </div>
                </div>

                {/* 6 Form Input Fields */}
                <div className="space-y-3.5 text-xs max-h-[52vh] overflow-y-auto pr-1">
                  {/* Field 1: สภาพพื้นที่และสิ่งแวดล้อม */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        สภาพพื้นที่และสิ่งแวดล้อม (Environment / Conditions)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.environment}/20 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.environmentType}
                      onChange={(e) => handleUpdateDraft('environmentType', e.target.value)}
                      placeholder="เช่น กึ่งกลางแจ้ง (Semi-Outdoor) / ฝุ่นควันยานพาหนะ"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-500 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.environment.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('environmentType', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-200 border border-slate-700/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 2: สภาวะแสงสว่างและปัญหาแสง */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        สภาวะแสงสว่างและปัญหาแสง (Lighting & Contrast)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.lighting}/15 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.lightingCond}
                      onChange={(e) => handleUpdateDraft('lightingCond', e.target.value)}
                      placeholder="เช่น ย้อนแสงจัดเวลากลางวัน / แสงไฟหน้ารถยนต์ส่องตรงเวลากลางคืน"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-500 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.lighting.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('lightingCond', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-200 border border-slate-700/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 3: การเลือกชนิดกล้อง */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        การเลือกชนิดกล้อง (Recommended Camera Model)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.camera}/25 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.recommendedCamera}
                      onChange={(e) => handleUpdateDraft('recommendedCamera', e.target.value)}
                      placeholder="เช่น Bullet IP Camera 4MP (True WDR 120dB + Smart IR 50m)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-500 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.camera.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('recommendedCamera', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-200 border border-slate-700/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 4: ขนาดเลนส์และระดับ DORI */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        ขนาดเลนส์และระดับ DORI (Lens & DORI Requirement)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.lens}/15 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.lensSpec}
                      onChange={(e) => handleUpdateDraft('lensSpec', e.target.value)}
                      placeholder="เช่น เลนส์ 4.0mm หรือ 6.0mm (มุมมองแคบเพื่อจับป้ายทะเบียนและใบหน้า)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-500 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.lens.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('lensSpec', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-200 border border-slate-700/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 5: ท่อร้อยสายและอุปกรณ์กันน้ำ */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cable className="w-3.5 h-3.5 text-emerald-400" />
                        ท่อร้อยสายและอุปกรณ์กันน้ำ (Conduit & Waterproof Box)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.conduit}/15 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.conduitType}
                      onChange={(e) => handleUpdateDraft('conduitType', e.target.value)}
                      placeholder="เช่น ท่อร้อยสาย uPVC สีขาว 20mm + กล่องพักสายกันน้ำ IP66 พร้อม Cable Gland"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-500 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.conduit.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('conduitType', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-900/60 text-slate-300 hover:text-sky-200 border border-slate-700/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 6: ข้อกำหนดและความปลอดภัย PDPA */}
                  <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-900/50 space-y-2">
                    <label className="text-[11px] font-bold text-indigo-300 block flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        ข้อกำหนดและการปฏิบัติตามกฎหมาย PDPA (PDPA Action)
                      </span>
                      {currentSubmission && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {currentSubmission.fieldScores.pdpa}/10 คะแนน
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDraft.pdpaAction}
                      onChange={(e) => handleUpdateDraft('pdpaAction', e.target.value)}
                      placeholder="เช่น ติดตั้งป้ายเตือน CCTV in Operation และห้ามส่องข้ามรั้วไปยังบ้านพักชุมชน"
                      className="w-full bg-slate-900 border border-indigo-800/60 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] text-indigo-400/80 py-0.5 mr-0.5">ตัวเลือกแนะนำ:</span>
                      {ZONE_SUGGESTIONS[currentZone.id]?.pdpa.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySuggestion('pdpaAction', chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>

                    {/* PDPA Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 p-2 rounded-lg border border-indigo-800/40 hover:bg-slate-900 transition mt-2">
                      <input
                        type="checkbox"
                        checked={pdpaAgreed[currentZone.id] || false}
                        onChange={(e) =>
                          setPdpaAgreed({ ...pdpaAgreed, [currentZone.id]: e.target.checked })
                        }
                        className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-slate-300">
                        ยืนยันการตรวจสอบหลักเกณฑ์ PDPA และจุดติดตั้งป้ายเตือน CCTV
                      </span>
                    </label>
                  </div>
                </div>

                {/* Feedback Banner if submitted */}
                {currentSubmission && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs ${
                    currentSubmission.score >= 80
                      ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                      : currentSubmission.score >= 60
                      ? 'bg-sky-950/60 border-sky-500/80 text-sky-200'
                      : 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        ผลการประเมินวิศวกรรม: เกรด {currentSubmission.grade} ({currentSubmission.score}/100)
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        ส่งเมื่อ {currentSubmission.submittedAt} น.
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-95">
                      {currentSubmission.feedback.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleFillStandardSpec(currentZone)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  title="ใส่ตัวอย่างสเปกมาตรฐานวิทยาลัยเพื่อการเรียนรู้"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ใส่ข้อความมาตรฐาน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitSurvey(currentZone.id)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isCurrentZoneSubmitted ? 'อัปเดตคำตอบการสำรวจ' : 'บันทึกและส่งคำตอบการสำรวจ'}</span>
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
          MODAL: SITE SURVEY REPORT GENERATOR & COMMISSIONING SHEET
         ========================================================= */}
      {showSurveyReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  เอกสารประกอบการตรวจรับงานระบบ CCTV (Site Survey Commissioning Report)
                </span>
                <h3 className="text-base font-bold text-white">
                  ใบบันทึกผลการสำรวจและวางระบบ CCTV ภาคสนาม (วิทยาลัยเทคนิคอุบลราชธานี)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSurveyReport(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">สถานที่สำรวจจริง</span>
                  <span className="text-sm font-bold text-white">วิทยาลัยเทคนิคอุบลราชธานี</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">ผัง 2D ไร้ป้ายตัวหนังสือ 6 โซน</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">ความคืบหน้าการส่งคำตอบ</span>
                  <span className="text-sm font-bold text-sky-400">
                    {Object.keys(submittedSurveys).length} / 6 โซน ({Math.round((Object.keys(submittedSurveys).length / 6) * 100)}%)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    คะแนนเฉลี่ย:{' '}
                    <strong className="text-emerald-400">
                      {Object.values(submittedSurveys).length > 0
                        ? Math.round(
                            Object.values(submittedSurveys).reduce((a, b) => a + b.score, 0) /
                              Object.values(submittedSurveys).length
                          )
                        : 0}
                      %
                    </strong>
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">การจัดลำดับ 6 ขั้นตอน</span>
                  <span className={`text-sm font-bold ${sequenceValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {sequenceValid ? 'ผ่านเกณฑ์มาตรฐานช่าง' : 'ยังไม่จัดลำดับ'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">PPE $\rightarrow$ ท่อ $\rightarrow$ UTP $\rightarrow$ กล้อง $\rightarrow$ Rack $\rightarrow$ ตรวจรับ</span>
                </div>
              </div>

              {/* Comprehensive Table of Zones & Submitted Answers */}
              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-800">
                      <th className="p-2.5">โซนยุทธศาสตร์</th>
                      <th className="p-2.5">ระยะสาย</th>
                      <th className="p-2.5">สภาพพื้นที่ที่สำรวจได้</th>
                      <th className="p-2.5">ชนิดกล้อง & เลนส์</th>
                      <th className="p-2.5">ท่อร้อยสาย</th>
                      <th className="p-2.5">PDPA</th>
                      <th className="p-2.5 text-right">ผลประเมิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    {UBON_ZONES.map((z) => {
                      const sub = submittedSurveys[z.id];
                      return (
                        <tr key={z.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-medium text-white">
                            <div>{z.nameTh}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{z.nameEn}</div>
                          </td>
                          <td className="p-2.5 font-mono text-sky-400 font-bold whitespace-nowrap">
                            {z.distanceMeters}m
                          </td>
                          <td className="p-2.5 text-slate-300 max-w-[160px]">
                            {sub ? (
                              <p className="truncate" title={sub.environmentType}>
                                {sub.environmentType || '-'}
                              </p>
                            ) : (
                              <span className="text-slate-500 italic">ยังไม่ได้ส่งคำตอบ</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300 max-w-[180px]">
                            {sub ? (
                              <div>
                                <p className="font-semibold text-sky-300 truncate" title={sub.recommendedCamera}>
                                  {sub.recommendedCamera || '-'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate" title={sub.lensSpec}>
                                  {sub.lensSpec || '-'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300 max-w-[140px]">
                            {sub ? (
                              <p className="truncate" title={sub.conduitType}>
                                {sub.conduitType || '-'}
                              </p>
                            ) : (
                              <span className="text-slate-500 italic">-</span>
                            )}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            {pdpaAgreed[z.id] ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            {sub ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.score >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : sub.score >= 60
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {sub.score}% (เกรด {sub.grade})
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">รอส่ง</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Completion Certification Seal if all 6 completed */}
              {Object.keys(submittedSurveys).length === 6 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        🎖️ ผ่านการทดสอบภาคสนามระดับวิทยาลัย (UBTC Certified Field Survey)
                      </h4>
                      <p className="text-xs text-emerald-200/80">
                        นักเรียนได้สำรวจและระบุสเปกทางวิศวกรรมครบทั้ง 6 โซนยุทธศาสตร์ วิทยาลัยเทคนิคอุบลราชธานี
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 font-mono">
                    PASS 100%
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.) สาขาวิชาช่างอิเล็กทรอนิกส์ / เทคนิคคอมพิวเตอร์
              </span>
              <button
                type="button"
                onClick={() => setShowSurveyReport(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer"
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
