export type Room102CameraId =
  | 'BULLET_WDR'
  | 'PTZ_SPEED_DOME'
  | 'BULLET_WIDE'
  | 'BULLET_PERIMETER_AI'
  | 'BULLET_FULLCOLOR'
  | 'DOME_IK10'
  | 'TURRET_INDOOR'
  | 'FISHEYE_360'
  | 'RECESSED_DOME'
  | 'DOME_PRIVACY';

export interface Room102CameraSpec {
  id: Room102CameraId;
  nameTh: string;
  nameEn: string;
  category: 'outdoor' | 'indoor';
  lensFocal: string;
  fovAngle: number;
  ipRating: string;
  ikRating?: string;
  specialFeature: string;
  descriptionTh: string;
  icon: string;
}

export const ROOM102_CAMERA_CATALOG: Record<Room102CameraId, Room102CameraSpec> = {
  BULLET_WDR: {
    id: 'BULLET_WDR',
    nameTh: 'กล้องกระบอก Bullet True WDR (120dB)',
    nameEn: 'True WDR Outdoor Bullet',
    category: 'outdoor',
    lensFocal: '4-6mm',
    fovAngle: 55,
    ipRating: 'IP67',
    specialFeature: 'True WDR 120dB + Sunshield',
    descriptionTh: 'มีปีกบังแดดกันฝน ชดเชยแสงย้อนแดดแรงตอนเช้า-เย็น ระบุใบหน้าชัดเจน',
    icon: '📹',
  },
  PTZ_SPEED_DOME: {
    id: 'PTZ_SPEED_DOME',
    nameTh: 'กล้องหมุนซูม PTZ Speed Dome (25x Zoom)',
    nameEn: 'PTZ Outdoor Speed Dome',
    category: 'outdoor',
    lensFocal: '4.8-120mm (25x)',
    fovAngle: 60,
    ipRating: 'IP66',
    specialFeature: 'Pan 360° + Tilt + 25x Optical Zoom',
    descriptionTh: 'หมุนตรวจการณ์ลานกว้าง 360 องศา ซูมระยะไกลตรวจกิจกรรมหน้าเสาธงและสนามฟุตบอล',
    icon: '🔭',
  },
  BULLET_WIDE: {
    id: 'BULLET_WIDE',
    nameTh: 'กล้องกระบอก Bullet มุมกว้าง (Wide 2.8mm)',
    nameEn: 'Wide-Angle Outdoor Bullet',
    category: 'outdoor',
    lensFocal: '2.8mm',
    fovAngle: 105,
    ipRating: 'IP67',
    specialFeature: 'IR Night Vision 40m + Wide Angle',
    descriptionTh: 'เลนส์มุมกว้างครอบคลุมภาพรวมลานจอดรถครู/ผู้ปกครอง ป้องกันการเฉี่ยวชน',
    icon: '🚗',
  },
  BULLET_PERIMETER_AI: {
    id: 'BULLET_PERIMETER_AI',
    nameTh: 'กล้องกระบอกตรวจแนวรั้ว (Line Crossing AI)',
    nameEn: 'Perimeter AI Bullet',
    category: 'outdoor',
    lensFocal: '6mm',
    fovAngle: 45,
    ipRating: 'IP67',
    specialFeature: 'Smart Line Crossing & Intrusion Alert',
    descriptionTh: 'เลนส์โฟกัสแคบแนวยาว ตรวจจับคนปีนข้ามกำแพงรั้วโรงเรียนด้วยระบบ AI',
    icon: '🛡️',
  },
  BULLET_FULLCOLOR: {
    id: 'BULLET_FULLCOLOR',
    nameTh: 'กล้องภาพสีกลางคืน Full-Color (F1.0)',
    nameEn: 'Full-Color 24/7 Bullet',
    category: 'outdoor',
    lensFocal: '4mm',
    fovAngle: 85,
    ipRating: 'IP67',
    specialFeature: 'Warm White Light + F1.0 Super Aperture',
    descriptionTh: 'ให้ภาพสี 24 ชม. แม้มืดสนิทตรงประตูหลังโรงเรียน ระบุสีรถและเสื้อผ้าคนร้ายได้แม่นยำ',
    icon: '💡',
  },
  DOME_IK10: {
    id: 'DOME_IK10',
    nameTh: 'กล้องโดมทนการกระแทก Vandal-Proof (IK10)',
    nameEn: 'Vandal-Proof Dome (IK10)',
    category: 'indoor',
    lensFocal: '2.8mm',
    fovAngle: 100,
    ipRating: 'IP66',
    ikRating: 'IK10',
    specialFeature: 'Vandal-Proof Dome Shell (ทุบไม่แตก)',
    descriptionTh: 'ฝาครอบโพลีคาร์บอเนตทนแรงกระแทก 20 จูล ป้องกันเด็กเตะบอลชนหรือปัดเปลี่ยนมุม',
    icon: '🛡️',
  },
  TURRET_INDOOR: {
    id: 'TURRET_INDOOR',
    nameTh: 'กล้องทรงลูกตา Turret Eyeball (2.8mm)',
    nameEn: 'Indoor Turret Eyeball',
    category: 'indoor',
    lensFocal: '2.8mm',
    fovAngle: 98,
    ipRating: 'IP66',
    specialFeature: 'No IR Bleed / แยกเลนส์กับไฟ IR',
    descriptionTh: 'ปรับมุมก้มเงยง่าย ภาพชัดเจนไม่สะท้อนฝาครอบโดม เหมาะกับโรงอาหารและจุดแลกคูปอง',
    icon: '👁️',
  },
  FISHEYE_360: {
    id: 'FISHEYE_360',
    nameTh: 'กล้องพาโนรามา Fisheye 360 องศา',
    nameEn: '360° Panoramic Fisheye',
    category: 'indoor',
    lensFocal: '1.2mm Panoramic',
    fovAngle: 180,
    ipRating: 'IP54',
    specialFeature: '360° Surround View + Dewarping',
    descriptionTh: 'ติดกลางเพดานห้องเซิร์ฟเวอร์/แล็บคอมพิวเตอร์ มองเห็นรอบทิศทาง 100% ไร้จุดบอด',
    icon: '🌐',
  },
  RECESSED_DOME: {
    id: 'RECESSED_DOME',
    nameTh: 'กล้องโดมแบบฝังฝ้าเพดาน (In-Ceiling Dome)',
    nameEn: 'Recessed In-Ceiling Dome',
    category: 'indoor',
    lensFocal: '2.8-12mm Varifocal',
    fovAngle: 90,
    ipRating: 'Indoor',
    specialFeature: 'Sleek Aesthetic Recessed Mount',
    descriptionTh: 'ฝังเรียบเนียนไปกับฝ้าเพดานห้องสมุดดิจิทัล สวยงาม ไม่บดบังทัศนียภาพ',
    icon: '🏛️',
  },
  DOME_PRIVACY: {
    id: 'DOME_PRIVACY',
    nameTh: 'กล้องโดมฟังก์ชัน Privacy Masking (PDPA)',
    nameEn: 'Privacy Masking Dome',
    category: 'indoor',
    lensFocal: '2.8mm',
    fovAngle: 95,
    ipRating: 'IP54',
    specialFeature: 'Configurable Privacy Mask Block',
    descriptionTh: 'ติดตั้งหน้าห้องพยาบาลและทางแยกห้องน้ำ ปิดแถบดำทับพื้นที่ส่วนบุคคลตามกฎหมาย PDPA',
    icon: '🔒',
  },
};

// ==========================================
// Station 1: Outdoor Smart School Zones
// ==========================================
export type OutdoorSpotId =
  | 'OUT_MAIN_GATE'
  | 'OUT_SPORTS_FIELD'
  | 'OUT_PARKING'
  | 'OUT_FENCE_PERIMETER'
  | 'OUT_BACK_GATE';

export interface OutdoorSpotConfig {
  id: OutdoorSpotId;
  nameTh: string;
  locationTh: string;
  problemScenarioTh: string;
  correctCameraId: Room102CameraId;
  xPercent: number; // For 2D map placement (0 - 100%)
  yPercent: number;
}

export const OUTDOOR_SPOTS: Record<OutdoorSpotId, OutdoorSpotConfig> = {
  OUT_MAIN_GATE: {
    id: 'OUT_MAIN_GATE',
    nameTh: 'จุดที่ 1: ประตูรั้วหลักทางเข้าโรงเรียน',
    locationTh: 'ซุ้มประตูด้านหน้าโรงเรียน',
    problemScenarioTh: 'เช้าและเย็นมีแสงแดดย้อนเข้าหน้ากล้องแรงมาก ต้องการเห็นหน้าคนเดินเข้าและป้ายทะเบียนชัดเจน',
    correctCameraId: 'BULLET_WDR',
    xPercent: 78,
    yPercent: 76,
  },
  OUT_SPORTS_FIELD: {
    id: 'OUT_SPORTS_FIELD',
    nameTh: 'จุดที่ 2: สนามกีฬาและลานเสาธงกลางแจ้ง',
    locationTh: 'ลานอเนกประสงค์กลางแจ้งขนาดใหญ่',
    problemScenarioTh: 'พื้นที่กว้างมาก ต้องหมุนตรวจการชุมนุมรอบทิศทาง 360 องศา และซูมระยะไกลได้',
    correctCameraId: 'PTZ_SPEED_DOME',
    xPercent: 50,
    yPercent: 35,
  },
  OUT_PARKING: {
    id: 'OUT_PARKING',
    nameTh: 'จุดที่ 3: ลานจอดรถครูและผู้ปกครอง',
    locationTh: 'ลานจอดรถยนต์และจักรยานยนต์',
    problemScenarioTh: 'ต้องการมุมกว้างครอบคลุมช่องจอดทั้งหมดเพื่อป้องกันการเฉี่ยวชนและขโมยหมวกกันน็อก',
    correctCameraId: 'BULLET_WIDE',
    xPercent: 82,
    yPercent: 28,
  },
  OUT_FENCE_PERIMETER: {
    id: 'OUT_FENCE_PERIMETER',
    nameTh: 'จุดที่ 4: แนวกำแพงรั้วด้านข้างโรงเรียน',
    locationTh: 'แนวกำแพงรั้วยาวติดที่รกร้าง',
    problemScenarioTh: 'แนวกำแพงยาว ต้องการระบบแจ้งเตือนทันทีเมื่อมีคนปีนข้ามเส้นรั้วโรงเรียน',
    correctCameraId: 'BULLET_PERIMETER_AI',
    xPercent: 18,
    yPercent: 32,
  },
  OUT_BACK_GATE: {
    id: 'OUT_BACK_GATE',
    nameTh: 'จุดที่ 5: ประตูหลังโรงเรียน (จุดลับตา)',
    locationTh: 'ซอยด้านหลังโรงเรียน มืดสนิทเวลากลางคืน',
    problemScenarioTh: 'มืดสนิท ไม่มีไฟทาง ต้องการภาพสีตลอด 24 ชั่วโมงเพื่อระบุสีเสื้อผ้าและสียานพาหนะคนร้าย',
    correctCameraId: 'BULLET_FULLCOLOR',
    xPercent: 22,
    yPercent: 78,
  },
};

// ==========================================
// Station 2: Indoor Smart School Zones
// ==========================================
export type IndoorSpotId =
  | 'IN_CORRIDOR_STAIRS'
  | 'IN_CANTEEN'
  | 'IN_SERVER_COMPUTER_LAB'
  | 'IN_DIGITAL_LIBRARY'
  | 'IN_INFIRMARY_RESTROOM';

export interface IndoorSpotConfig {
  id: IndoorSpotId;
  nameTh: string;
  locationTh: string;
  problemScenarioTh: string;
  correctCameraId: Room102CameraId;
  requiresPrivacyMask?: boolean;
  xPercent: number;
  yPercent: number;
}

export const INDOOR_SPOTS: Record<IndoorSpotId, IndoorSpotConfig> = {
  IN_CORRIDOR_STAIRS: {
    id: 'IN_CORRIDOR_STAIRS',
    nameTh: 'จุดที่ 1: โถงทางเดินหน้าห้องและบันได',
    locationTh: 'ทางเดินชั้น 2 หน้าห้องเรียน',
    problemScenarioTh: 'เพดานต่ำ นักเรียนวิ่งเล่นเตะบอลบ่อย กล้องเดิมโดนชนจนเบี้ยวและฝาแตก ต้องการแบบทุบไม่แตก',
    correctCameraId: 'DOME_IK10',
    xPercent: 50,
    yPercent: 48,
  },
  IN_CANTEEN: {
    id: 'IN_CANTEEN',
    nameTh: 'จุดที่ 2: โรงอาหารและจุดชำระเงิน',
    locationTh: 'เคาน์เตอร์แลกคูปองและแถวร้านค้า',
    problemScenarioTh: 'คนพลุกพล่าน ปรับก้มเงยง่าย กลางคืนไฟสลัว ต้องการภาพชัดไร้แสง IR สะท้อนฝาครอบ',
    correctCameraId: 'TURRET_INDOOR',
    xPercent: 25,
    yPercent: 75,
  },
  IN_SERVER_COMPUTER_LAB: {
    id: 'IN_SERVER_COMPUTER_LAB',
    nameTh: 'จุดที่ 3: ห้องเซิร์ฟเวอร์ & คอมพิวเตอร์แล็บ',
    locationTh: 'ศูนย์ข้อมูลและห้องคอมพิวเตอร์',
    problemScenarioTh: 'มีอุปกรณ์ไอทีและตู้เซิร์ฟเวอร์มูลค่าสูง ต้องมองเห็นครอบคลุม 100% ไร้จุดบอดกลางห้อง',
    correctCameraId: 'FISHEYE_360',
    xPercent: 76,
    yPercent: 25,
  },
  IN_DIGITAL_LIBRARY: {
    id: 'IN_DIGITAL_LIBRARY',
    nameTh: 'จุดที่ 4: ห้องสมุดดิจิทัลและพื้นที่อ่านหนังสือ',
    locationTh: 'เพดานห้องสมุดตกแต่งพิเศษ',
    problemScenarioTh: 'ต้องการความสวยงาม กลมกลืนกับฝ้าเพดาน ไม่ดูน่ากลัวหรือทำให้ผู้ใช้บริการอึดอัด',
    correctCameraId: 'RECESSED_DOME',
    xPercent: 26,
    yPercent: 25,
  },
  IN_INFIRMARY_RESTROOM: {
    id: 'IN_INFIRMARY_RESTROOM',
    nameTh: 'จุดที่ 5: หน้าห้องพยาบาล & ทางแยกห้องน้ำ',
    locationTh: 'โถงทางเข้าพื้นที่สุขอนามัย',
    problemScenarioTh: 'เป็นพื้นที่อ่อนไหวตามกฎหมาย PDPA ต้องปิดแถบดำทับประตูห้องน้ำและเตียงผู้ป่วยเด็ดขาด',
    correctCameraId: 'DOME_PRIVACY',
    requiresPrivacyMask: true,
    xPercent: 75,
    yPercent: 75,
  },
};

// ==========================================
// Station 3: Written Case Study Evaluation
// ==========================================
export interface WrittenCaseQuestion {
  id: string;
  titleTh: string;
  scenarioTh: string;
  questionTh: string;
  expectedKeywords: string[];
  sampleExpertAnswerTh: string;
  maxScore: number;
}

export const WRITTEN_CASES: WrittenCaseQuestion[] = [
  {
    id: 'CASE_1_BACKLIGHT',
    titleTh: 'กรณีศึกษาที่ 1: ประตูหน้าโรงเรียนย้อนแสง (Backlighting Issue)',
    scenarioTh:
      'ผู้อำนวยการโรงเรียนพบว่า กล้องตรงประตูรั้วหน้าโรงเรียน เวลา 07.30 น. ช่วงที่นักเรียนกำลังเดินเข้า ภาพหน้าเด็กทุกคนกลายเป็น "เงาดำสนิท" แต่วิวถนนด้านหลังสว่างจ้ามาก',
    questionTh:
      'ในฐานะช่างผู้เชี่ยวชาญ จงอธิบายว่าทำไมภาพหน้าเด็กจึงมืดดำ และต้องแก้ปัญหาด้วยการเลือกกล้องที่มีฟังก์ชันเทคโนโลยีใด (ระบุชื่อฟังก์ชันและหลักการทำงาน)?',
    expectedKeywords: ['wdr', 'wide dynamic range', 'ย้อนแสง', 'ชดเชยแสง', 'เซนเซอร์', 'สว่าง'],
    sampleExpertAnswerTh:
      'สาเหตุเกิดจากสภาวะแสงย้อน (High Contrast/Backlight) แสงภายนอกสว่างกว่าตัวแบบ ทำให้กล้องเฉลี่ยแสงจนใบหน้ามืด แนวทางแก้ไขคือต้องเลือกใช้กล้องที่มีเทคโนโลยี True WDR (Wide Dynamic Range 120dB ขึ้นไป) ซึ่งกล้องจะเก็บภาพที่มี Exposure ต่างกัน (ภาพมืดและภาพสว่าง) มารวมกันเป็นเฟรมเดียว ทำให้มองเห็นรายละเอียดทั้งใบหน้าคนและฉากหลังพร้อมกันอย่างชัดเจน',
    maxScore: 15,
  },
  {
    id: 'CASE_2_VANDALISM',
    titleTh: 'กรณีศึกษาที่ 2: กล้องทางเดินบันไดถูกลูกบอลเตะกระแทก (Vandalism Issue)',
    scenarioTh:
      'กล้องวงจรปิดที่ติดตั้งบริเวณบันไดชั้น 2 มักถูกลูกฟุตบอลที่นักเรียนเตะเล่นกระแทกจนฝาครอบแตกร้าว และตัวกล้องหมุนเปลี่ยนทิศทางชี้ขึ้นเพดาน ส่งผลให้ไม่มีภาพจุดเกิดเหตุ',
    questionTh:
      'กล้องบริเวณนี้ควรเปลี่ยนเป็นกล้องรูปทรงใด และต้องระบุสเปกความทนทานต่อแรงกระแทกตามมาตรฐานสากลใด เพื่อป้องกันความเสียหายดังกล่าว?',
    expectedKeywords: ['ik10', 'vandal', 'dome', 'โดม', 'กันกระแทก', 'กระแทก', 'จูล', 'โพลีคาร์บอเนต'],
    sampleExpertAnswerTh:
      'ควรเปลี่ยนมาใช้กล้องทรงโดมทนการทุบทำลาย (Vandal-Proof Dome Camera) ที่ผ่านการรับรองมาตรฐานการทนแรงกระแทกระดับ IK10 (สามารถทนแรงกระแทกได้ถึง 20 จูล หรือเทียบเท่าการตกของวัตถุหนัก 5 กิโลกรัม) ฝาครอบทำจากโพลีคาร์บอเนตเนื้อหนาพิเศษ และฐานกล้องยึดติดแน่น ป้องกันไม่ให้มุมกล้องเบี้ยวหรือเคลื่อนที่เมื่อถูกลูกบอลกระแทก',
    maxScore: 15,
  },
];
