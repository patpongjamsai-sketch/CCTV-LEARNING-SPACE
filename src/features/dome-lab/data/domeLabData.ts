import {
  AnchorType,
  DomeAssemblyChecklist,
  DomeMountPointId,
  DomeMountPointInfo,
  DrillBitSize,
  DrillBitType,
  DrillMode,
  MissionMeta,
  PPEItem,
  RoomId,
  RoomMeta,
  SurfaceInfo,
  SurfaceType,
} from '../types';

export const MISSIONS_DATA: MissionMeta[] = [
  {
    id: 1,
    titleTh: 'เตรียมความปลอดภัย & ชุด PPE',
    subtitleTh: 'สำรวจห้อง 3D และเลือกสวมใส่อุปกรณ์ความปลอดภัยให้ถูกต้อง',
    phaseName: 'Safety Protocol',
    iconName: 'ShieldCheck',
  },
  {
    id: 2,
    titleTh: 'สำรวจพื้นที่ 2 ห้อง & จุดติดตั้งกล้องโดม',
    subtitleTh: 'เลือกจุดติดตั้งในห้องสำนักงาน & โรงฝึกงาน พร้อมวิเคราะห์ความเสี่ยง IR Reflection',
    phaseName: 'Site Survey & IR Analysis',
    iconName: 'MapPin',
  },
  {
    id: 3,
    titleTh: 'ปรับกิมบอล 3 แกน & ทดสอบ Day/Night IR',
    subtitleTh: 'ปรับ Pan, Tilt, Azimuth Rotation และทดสอบภาพกลางคืนป้องกันแสงสะท้อน',
    phaseName: '3-Axis Gimbal & IR Glare Test',
    iconName: 'Camera',
  },
  {
    id: 4,
    titleTh: 'ใบงานติดตั้ง 4 พื้นผิว & ประกอบโดม',
    subtitleTh: 'เลือกอุปกรณ์ช่างข้อ 2–7 เอง ตรวจสอบยางกัน IR และทดสอบแรงดึง Pull Test',
    phaseName: 'Surface Worksheets & Assembly',
    iconName: 'Wrench',
  },
];

export const PPE_ITEMS_DATA: PPEItem[] = [
  {
    id: 'helmet',
    numberIndex: 1,
    nameTh: 'หมวกนิรภัย (Hard Hat)',
    category: 'required',
    icon: 'HardHat',
    descriptionTh: 'ป้องกันเศษฝ้าเพดาน เครื่องมือ หรือสิ่งของหล่นใส่ศีรษะขณะปฏิบัติงานใต้ฝ้าและบันได',
  },
  {
    id: 'glasses',
    numberIndex: 2,
    nameTh: 'แว่นตานิรภัย (Safety Glasses)',
    category: 'required',
    icon: 'Glasses',
    descriptionTh: 'ป้องกันเศษฝุ่นคอนกรีต เศษผงยิปซั่ม และสะเก็ดโลหะกระเด็นเข้าตาระหว่างการเจาะเพดาน',
  },
  {
    id: 'mask',
    numberIndex: 3,
    nameTh: 'หน้ากากกันฝุ่น (Dust Mask N95)',
    category: 'required',
    icon: 'Shield',
    descriptionTh: 'กรองฝุ่นละอองยิปซั่ม ฝุ่นซีเมนต์ และผงใยแก้วในช่องว่างเหนือฝ้าเพดาน',
  },
  {
    id: 'gloves',
    numberIndex: 4,
    nameTh: 'ถุงมือช่างเคลือบ PU (Work Gloves)',
    category: 'required',
    icon: 'HandMetal',
    descriptionTh: 'กระชับมือ ป้องกันบาดแผลจากขอบโครงคร่าว C-Line และจับสว่านได้มั่นคง',
  },
  {
    id: 'shoes',
    numberIndex: 5,
    nameTh: 'รองเท้านิรภัยหัวเหล็ก (Safety Shoes)',
    category: 'required',
    icon: 'Footprints',
    descriptionTh: 'ป้องกันการเหยียบเศษตะปู สกรู และการตกกระแทกของอุปกรณ์ช่างหนัก',
  },
  {
    id: 'slippers',
    numberIndex: 6,
    nameTh: 'รองเท้าแตะลำลอง (Slippers)',
    category: 'decoy',
    icon: 'Ban',
    descriptionTh: 'อันตรายร้ายแรง ห้ามสวมใส่ในพื้นที่ปฏิบัติงานช่าง เสี่ยงลื่นตกจากบันไดหรือเหยียบของมีคม',
  },
  {
    id: 'cap',
    numberIndex: 7,
    nameTh: 'หมวกแก๊ปผ้า (Fabric Cap)',
    category: 'decoy',
    icon: 'Ban',
    descriptionTh: 'ไม่สามารถรับแรงกระแทกจากวัสดุหล่นใส่ได้ ไม่ได้มาตรฐานความปลอดภัยงานช่างอาชีวะ',
  },
  {
    id: 'sunglasses',
    numberIndex: 8,
    nameTh: 'แว่นกันแดดแฟชั่น (Fashion Sunglasses)',
    category: 'decoy',
    icon: 'Ban',
    descriptionTh: 'เลนส์มืดเกินไป ไม่ทนแรงกระแทกจากสะเก็ดงานเจาะ ทำให้ทัศนวิสัยในร่มลดลงเสี่ยงอุบัติเหตุ',
  },
];

export const ROOMS_DATA: Record<RoomId, RoomMeta> = {
  room1_indoor: {
    id: 'room1_indoor',
    nameTh: 'ห้องสำนักงาน & ศูนย์เซิร์ฟเวอร์',
    subtitleTh: 'Indoor Office & Server Center',
    badgeTh: '🏢 งานภายในอาคาร (ฝ้าเพดาน & รับมือ IR Fog)',
    descriptionTh:
      'ฝึกสำรวจพื้นที่ติดตั้งบนฝ้าเพดานฉาบเรียบ การซ่อนสายสัญญาณบนฝ้า และการระวังแสง IR สะท้อนตู้ Server ทรงสูงในเวลากลางคืน',
    environmentFeatures: [
      'ฝ้าเพดานฉาบเรียบ Gypsum / T-Bar สูง 2.8 ม.',
      'ตู้ Server Rack สูง 2.2 ม. (ตัวสร้างแสงสะท้อน IR)',
      'ประตูกระจกทางเข้าบานเลื่อน (สภาวะย้อนแสงภายนอก)',
      'โต๊ะทำงานและเครื่องใช้สำนักงาน',
    ],
  },
  room2_outdoor: {
    id: 'room2_outdoor',
    nameTh: 'โรงฝึกงาน & ทางเดินชายคา',
    subtitleTh: 'Semi-Outdoor Workshop & Walkway',
    badgeTh: '🏭 งานกึ่งภายนอก (ชายคา & โครงสร้างเหล็ก)',
    descriptionTh:
      'ฝึกสำรวจพื้นที่ใต้ชายคาอาคาร การติดตั้งร่วมกับ Waterproof Junction Box และการติดตั้งบนเสาเหล็กด้วยขายึดรูปงวงช้าง',
    environmentFeatures: [
      'ชายคาอาคาร Soffit สูง 3.4 ม.',
      'โครงสร้างเหล็กกล่อง & เสา H-Beam',
      'ผนังคอนกรีตบล็อกเปลือย',
      'ท่อร้อยสายไฟเหล็ก EMT & ราง Wireway',
    ],
  },
};

export const DOME_MOUNT_POINTS_DATA: Record<DomeMountPointId, DomeMountPointInfo> = {
  // ========================================================
  // ZONE 1: INDOOR OFFICE LAB (Left Zone: Points A, B)
  // ========================================================
  A: {
    id: 'A',
    roomId: 'room1_indoor',
    label: 'จุด A: กลางฝ้าเพดานสำนักงานใหญ่',
    worldPosition: [-9.5, 3.6, 0],
    heightMeters: 3.6,
    mountType: 'ceiling',
    obstruction: false,
    irReflectionRisk: 'none',
    irReflectionReasonTh: 'ตำแหน่งกลางฝ้าเพดานโถงสำนักงานใหญ่ ห่างจากผนังเกิน 3 ม. แสง IR กระจายตัวดีเยี่ยม ไม่มีสิ่งสะท้อน',
    coveragePotential: 95,
    vandalRisk: 'low',
    junctionBoxRequired: false,
    descriptionTh: 'กึ่งกลางฝ้าเพดานห้องสำนักงานใหญ่ ปรับมุมกิมบอลได้รอบทิศทาง 360° เลนส์มุมกว้าง 92° (2.8 มม.) ครอบคลุมพื้นที่ทำงานส่วนกลาง',
    taskGuideTh: 'ตำแหน่งกึ่งกลางฝ้าเพดานสามารถหมุนปรับทิศทางเลนส์ได้รอบ 360° เลนส์ 2.8 มม. ให้มุมรับภาพ 92° ครอบคลุมพื้นที่เปิดโล่งกว้างขวาง และร้อยสายซ่อนบนฝ้าได้เรียบร้อย',
    isOptimal: true,
    lensMm: 2.8,
    fovDegrees: 92,
    targetDescription: 'ปรับหันกิมบอลได้อิสระ 360° รอบจุดติดตั้ง เลนส์ 2.8 มม. มุมมองกว้าง 92° ครอบคลุมโถงสำนักงาน',
  },
  B: {
    id: 'B',
    roomId: 'room1_indoor',
    label: 'จุด B: ผนังสำนักงานพร้อมขายึด L-Bracket',
    worldPosition: [-18.05, 2.6, 1.5],
    heightMeters: 2.6,
    mountType: 'wall',
    obstruction: false,
    irReflectionRisk: 'none',
    irReflectionReasonTh: 'ตำแหน่งบนผนังแนวตั้งฝั่งซ้าย ยื่นด้วย L-Bracket ส่องเปิดโล่งเข้าหาแนวโต๊ะทำงานและทางเดินสำนักงาน',
    coveragePotential: 90,
    vandalRisk: 'low',
    junctionBoxRequired: false,
    descriptionTh: 'ผนังแนวตั้งยึดแป้น L-Bracket ส่องคลุมทางเดินและโต๊ะทำงานในสำนักงานใหญ่',
    taskGuideTh: 'การติดตั้งบนระนาบดิ่ง ต้องใช้ขายึด L-Bracket เพื่อให้กล้องคว่ำลง และปรับระนาบ Azimuth Rotation ให้เส้นขอบฟ้าตรง',
    isOptimal: true,
    lensMm: 2.8,
    fovDegrees: 88,
    targetDescription: 'ติดตั้งบนขายึด L-Bracket ส่องคลุมโต๊ะทำงานและแนวทางเดินภายในสำนักงานใหญ่',
  },

  // ========================================================
  // ZONE 2: WORKSHOP & SEMI-OUTDOOR LAB (Right Zone: Points C, D)
  // ========================================================
  C: {
    id: 'C',
    roomId: 'room2_outdoor',
    label: 'จุด C: ใต้คานโครงสร้างโรงงาน',
    worldPosition: [6.0, 4.12, -4.5],
    heightMeters: 4.2,
    mountType: 'soffit',
    obstruction: false,
    irReflectionRisk: 'none',
    irReflectionReasonTh: 'ใต้คานโครงสร้างโรงงานเปิดโล่ง ส่องคลุมทางเดินสัญจรหลักระยะไกล ไม่มีผนังข้างกั้นแสง IR',
    coveragePotential: 92,
    vandalRisk: 'medium',
    junctionBoxRequired: true,
    descriptionTh: 'ใต้คานโครงสร้างโรงงาน (Soffit/Beam) ส่องแนวทางเดินสัญจรหลัก ป้องกันละอองฝนและความชื้น',
    taskGuideTh: 'ติดตั้งกึ่งภายนอก ต้องติดร่วมกับ Waterproof Junction Box และซีลยาง O-ring ป้องกันความชื้น',
    isOptimal: true,
    lensMm: 2.8,
    fovDegrees: 95,
    targetDescription: 'ใต้คานโครงสร้างโรงงาน ส่องคลุมแนวทางเดินสัญจรหลัก ป้องกันฝนสาด',
  },
  D: {
    id: 'D',
    roomId: 'room2_outdoor',
    label: 'จุด D: เสาเหล็กโครงสร้าง H-Beam กลางโรงงาน',
    worldPosition: [11.1, 3.2, 1.5],
    heightMeters: 3.2,
    mountType: 'steel-column',
    obstruction: false,
    irReflectionRisk: 'low',
    irReflectionReasonTh: 'ขายึดงวงช้างยื่นห่างจากเสาเหล็ก 40 ซม. แสง IR จึงไม่สะท้อนโครงเสา',
    coveragePotential: 88,
    vandalRisk: 'high',
    junctionBoxRequired: true,
    descriptionTh: 'เสาเหล็กรูปพรรณพร้อมขายึดทรงงวงช้าง (Gooseneck Wall Bracket) ส่องคลุมทางแยกโรงงาน',
    taskGuideTh: 'การติดตั้งบนเสาระนาบดิ่ง ต้องใช้ขายึดงวงช้างเพื่อคว่ำกล้องลง และปรับหมุนแกน Azimuth Rotation',
    isOptimal: true,
    lensMm: 4.0,
    fovDegrees: 75,
    targetDescription: 'เสาเหล็กพร้อมขายึดทรงงวงช้าง (Wall Bracket) หันหน้าเลนส์คว่ำลง',
  },
};

export interface DomeIdealAngle {
  pan: number;
  tilt: number;
  rotation: number;
  targetDescriptionTh: string;
  targetZoneLabelTh: string;
}

export const DOME_IDEAL_ANGLES: Record<DomeMountPointId, DomeIdealAngle> = {
  A: {
    pan: 67,
    tilt: 28,
    rotation: 0,
    targetDescriptionTh: 'ส่องกึ่งกลางโถงสำนักงาน เล็งเข้าหาจุดตรวจจับใบหน้าบุคคลหน้าทางเดิน (Pan +67°, Tilt 28°)',
    targetZoneLabelTh: 'ทางเดินหน้าสำนักงาน (Office Entrance)',
  },
  B: {
    pan: 90,
    tilt: 8,
    rotation: 0,
    targetDescriptionTh: 'ติดตั้งบนขายึด L-Bracket ส่องกวาดข้ามห้องเข้าหาทางเดินสำนักงาน (Pan +90°, Tilt 8°)',
    targetZoneLabelTh: 'ทางเดินสำนักงานและโต๊ะทำงาน (Office Walkway)',
  },
  C: {
    pan: 0,
    tilt: 23,
    rotation: 0,
    targetDescriptionTh: 'ใต้คานโครงสร้างโรงงาน ส่องตรงตามแนวทางเดินสัญจรหลัก (Pan 0°, Tilt 23°)',
    targetZoneLabelTh: 'ทางเดินสัญจรหลักโรงงาน (Main Factory Walkway)',
  },
  D: {
    pan: -90,
    tilt: 17,
    rotation: 0,
    targetDescriptionTh: 'บนเสาโครงเหล็กด้วยขายึดงวงช้าง ส่องเฉียงเข้าสู่ทางเดินหลักโรงงาน (Pan -90°, Tilt 17°)',
    targetZoneLabelTh: 'ทางเดินช่างและเลนสัญจร (Industrial Lane)',
  },
};

export const calculateDomeFovCoverage = (
  pointId: DomeMountPointId,
  pan: number,
  tilt: number,
  rotation: number
): number => {
  const ideal = DOME_IDEAL_ANGLES[pointId] || DOME_IDEAL_ANGLES.A;
  const panDiff = Math.abs(pan - ideal.pan);
  const tiltDiff = Math.abs(tilt - ideal.tilt);
  const rollDiff = Math.abs(rotation - ideal.rotation);
  const deviation = panDiff * 1.1 + tiltDiff * 1.4 + rollDiff * 0.7;
  return Math.max(15, Math.min(98, Math.round(100 - deviation * 1.35)));
};

export const SURFACES_DATA: Record<SurfaceType, SurfaceInfo> = {
  wood: {
    id: 'wood',
    nameTh: 'โครงสร้างไม้ / ไม้ฝา',
    subtitleTh: 'Wood Structure / Timber Stud',
    color: '#8b5a2b',
    texturePattern: 'wood-grain',
    recommendedBit: 'ดอกเจาะไม้ปลายเดือยแหลม (Brad-point Bit)',
    recommendedBitType: 'wood',
    recommendedBitSize: '4mm',
    recommendedMode: 'normal',
    recommendedAnchor: 'ขันยึดตรงด้วยสกรูเกลียวปล่อยงานไม้ (Wood Screw Direct)',
    recommendedAnchorType: 'wood-screw-direct',
    recommendedScrew: 'สกรูเกลียวปล่อยเตเปอร์ 1.5 นิ้ว (ไม้แท้)',
    drillDepthMm: 25,
    maxPullForceN: 25,
    notesTh:
      'เจาะนำศูนย์ด้วยดอกเจาะไม้รอบปานกลาง ห้ามใช้โหมดกระแทก (Hammer) ขันสกรูให้แน่นพอดีระวังเกลียวหวาน',
  },
  metal: {
    id: 'metal',
    nameTh: 'โครงเหล็กกล่อง / โครงคร่าว C-Line',
    subtitleTh: 'Steel Beam / Metal Stud C-Line',
    color: '#475569',
    texturePattern: 'brushed-metal',
    recommendedBit: 'ดอกสว่านเจาะเหล็ก HSS คมตัด 118° (High Speed Steel)',
    recommendedBitType: 'metal',
    recommendedBitSize: '4mm',
    recommendedMode: 'driver',
    recommendedAnchor: 'สกรูปลายสว่านยึดเหล็ก มีปีก/มีเกลียวในตัว (Self-drilling TEK Screw)',
    recommendedAnchorType: 'self-drilling-metal',
    recommendedScrew: 'สกรูปลายสว่านหัวกระทะคมพิเศษ 1 นิ้ว',
    drillDepthMm: 20,
    maxPullForceN: 35,
    notesTh:
      'เจาะด้วยรอบช้า-ปานกลาง หากเป็น C-Line ฝ้าเพดาน ให้ใช้สกรูยึดโครงฝ้าเฉพาะทาง ห้ามใช้โหมดกระแทกเด็ดขาด',
  },
  concrete: {
    id: 'concrete',
    nameTh: 'ผนังปูน / พื้นคอนกรีตหล่อ',
    subtitleTh: 'Solid Concrete / Masonry Slab',
    color: '#64748b',
    texturePattern: 'concrete-rough',
    recommendedBit: 'ดอกสว่านเจาะปูนหัวคาร์ไบด์ (Carbide Tipped Masonry)',
    recommendedBitType: 'masonry',
    recommendedBitSize: '6mm',
    recommendedMode: 'hammer',
    recommendedAnchor: 'พุกพลาสติกขยายตัว เบอร์ 7 + สกรูเกลียวปล่อย (Plastic Wall Plug #7)',
    recommendedAnchorType: 'plastic-expansion',
    recommendedScrew: 'สกรูเกลียวปล่อยเหล็กชุบขาว #7 ยาว 1.5 นิ้ว',
    drillDepthMm: 35,
    maxPullForceN: 40,
    notesTh:
      'ใช้สว่านโหมดกระแทก (Hammer) เป่าฝุ่นปูนออกจากรูเจาะก่อนตอกพุกพลาสติกให้จมเสมอผิวปูน',
  },
  smartboard: {
    id: 'smartboard',
    nameTh: 'แผ่นสมาร์ทบอร์ด / แผ่นยิปซั่มฝ้าฉาบเรียบ',
    subtitleTh: 'Smartboard / Gypsum Board Ceiling',
    color: '#94a3b8',
    texturePattern: 'cement-board',
    recommendedBit: 'ดอกสว่านอเนกประสงค์คมเจียรเพชร (Multi-purpose Bit)',
    recommendedBitType: 'multipurpose',
    recommendedBitSize: '8mm',
    recommendedMode: 'normal',
    recommendedAnchor: 'พุกผีเสื้อ / พุกร่มสำหรับผนังกลวง (Hollow Wall Toggle Bolt)',
    recommendedAnchorType: 'hollow-wall-toggle',
    recommendedScrew: 'สกรูยึดแกนพุกผีเสื้อ M4 ยาว 40 มม.',
    drillDepthMm: 30,
    maxPullForceN: 18,
    notesTh:
      'ข้อควรระวังสำคัญของงานฝ้าเพดาน: ห้ามใช้โหมดกระแทกเด็ดขาด เพราะจะทำให้แผ่นยิปซั่มแตกร้าวทะลุ ต้องใช้พุกผีเสื้อที่กางปีกยึดหลังแผ่น',
  },
};

export function evaluateDomeMission4Submission(
  surfaceType: SurfaceType,
  drillBit: DrillBitType | null,
  drillBitSize: DrillBitSize | null,
  drillMode: DrillMode | null,
  anchor: AnchorType | null,
  drillDepthMm: number | null,
  pullTestForceN: number | null,
  domeAssembly: DomeAssemblyChecklist
): {
  score: number;
  isPassed: boolean;
  feedback: string[];
} {
  const target = SURFACES_DATA[surfaceType];
  const feedback: string[] = [];
  let score = 0;

  // 1. Drill Bit Type (20 pts)
  if (drillBit === target.recommendedBitType) {
    score += 20;
    feedback.push(`✓ ชนิดดอกสว่าน: ถูกต้อง (${target.recommendedBit}) เหมาะสมกับโครงสร้าง`);
  } else {
    feedback.push(`✗ ชนิดดอกสว่าน: ไม่เหมาะสม ควรใช้ ${target.recommendedBit}`);
  }

  // 2. Drill Bit Size (15 pts)
  if (drillBitSize === target.recommendedBitSize) {
    score += 15;
    feedback.push(`✓ ขนาดดอกสว่าน: ถูกต้อง (${target.recommendedBitSize}) ตรงตามสเปกของพุก/สกรู`);
  } else {
    feedback.push(`✗ ขนาดดอกสว่าน: แนะนำให้ใช้ ${target.recommendedBitSize} เพื่อให้รูเจาะแน่นพอดี`);
  }

  // 3. Drill Mode (20 pts)
  if (drillMode === target.recommendedMode) {
    score += 20;
    feedback.push(`✓ โหมดการเจาะ: ถูกต้อง (${target.recommendedMode}) ป้องกันการแตกร้าวของวัสดุ`);
  } else {
    if (surfaceType === 'smartboard' && drillMode === 'hammer') {
      feedback.push(`⚠️ ข้อผิดพลาดร้ายแรง: การใช้โหมดกระแทกกับแผ่นยิปซั่ม/สมาร์ทบอร์ดจะทำให้แผ่นทะลุแตกร้าว!`);
    } else {
      feedback.push(`✗ โหมดการเจาะ: ควรปรับสว่านไปที่โหมด ${target.recommendedMode}`);
    }
  }

  // 4. Fastener & Anchor (20 pts)
  if (anchor === target.recommendedAnchorType) {
    score += 20;
    feedback.push(`✓ รูปแบบการยึดน็อตและพุก: ถูกต้อง (${target.recommendedAnchor})`);
  } else {
    if (surfaceType === 'smartboard' && anchor === 'plastic-expansion') {
      feedback.push(`⚠️ ข้อผิดพลาด: พุกพลาสติกธรรมดาไม่สามารถยึดบนแผ่นฝ้ากลวงได้ จะหลุดร่วง ต้องใช้พุกผีเสื้อ`);
    } else {
      feedback.push(`✗ อุปกรณ์ยึด: แนะนำให้ใช้ ${target.recommendedAnchor}`);
    }
  }

  // 5. Drill Depth & Pull Force (15 pts)
  const depthDiff = Math.abs((drillDepthMm ?? 0) - target.drillDepthMm);
  if (depthDiff <= 5) {
    score += 10;
    feedback.push(`✓ ความลึกการเจาะ: เหมาะสม (${drillDepthMm} มม.)`);
  } else {
    feedback.push(`✗ ความลึกการเจาะ: ควรลึกประมาณ ${target.drillDepthMm} มม.`);
  }

  const pullTarget = target.maxPullForceN;
  if ((pullTestForceN ?? 0) >= pullTarget * 0.7 && (pullTestForceN ?? 0) <= pullTarget * 1.3) {
    score += 5;
    feedback.push(`✓ แรงดึงทดสอบ Pull Test: ผ่านเกณฑ์ความปลอดภัย (${pullTestForceN} N)`);
  } else {
    feedback.push(`✗ แรงดึงทดสอบ: แนะนำแรงดึงทดสอบมาตรฐาน ${pullTarget} N`);
  }

  // 6. Dome Assembly Checklist (10 pts)
  let assemblyCount = 0;
  if (domeAssembly.basePlateMounted) assemblyCount++;
  if (domeAssembly.cableGrommetSealed) assemblyCount++;
  if (domeAssembly.antiIrRingVerified) assemblyCount++;
  if (domeAssembly.domeCoverCleaned) assemblyCount++;

  const assemblyScore = Math.round((assemblyCount / 4) * 10);
  score += assemblyScore;

  if (domeAssembly.antiIrRingVerified) {
    feedback.push(`✓ วงแหวนโฟมกัน IR: ตรวจสอบแล้วแนบสนิทหน้าเลนส์ ป้องกันแสงสะท้อนเลนส์`);
  } else {
    feedback.push(`⚠️ คำเตือนสำคัญ: ไม่ได้ตรวจวงแหวนโฟมกัน IR! แสงอินฟราเรดจะสะท้อนเข้าเลนส์จนภาพขาวในเวลากลางคืน`);
  }

  if (domeAssembly.domeCoverCleaned) {
    feedback.push(`✓ ความสะอาดฝาครอบโดม: เช็ดทำความสะอาดด้วยผ้าไมโครไฟเบอร์เรียบร้อย`);
  } else {
    feedback.push(`⚠️ คำเตือน: ฝาครอบโดมมีรอยนิ้วมือหรือฝุ่น จะเกิดการสะท้อนของแสง IR กระจายตัว`);
  }

  const finalScore = Math.min(100, Math.max(0, score));
  return {
    score: finalScore,
    isPassed: finalScore >= 70,
    feedback,
  };
}
