import {
  MissionMeta,
  MountPointId,
  MountPointInfo,
  PPEItem,
  SurfaceInfo,
  SurfaceType,
} from '../types';

export const MISSIONS_LIST: MissionMeta[] = [
  {
    id: 1,
    titleTh: '1. ความปลอดภัย & สวมอุปกรณ์ PPE',
    subtitleTh: 'ตรวจสอบและสวมใส่อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคลก่อนปฏิบัติงานช่าง',
    phaseName: 'Safety & PPE',
    iconName: 'ShieldCheck',
  },
  {
    id: 2,
    titleTh: '2. สำรวจหน้างาน & เลือกจุดติดตั้ง',
    subtitleTh: 'วิเคราะห์ตำแหน่งติดตั้ง A–E ตามระดับความสูง มุมบอด และความเสี่ยงจากการชน',
    phaseName: 'Site Survey',
    iconName: 'MapPin',
  },
  {
    id: 3,
    titleTh: '3. ปรับมุมมอง & จำลองกรวยภาพ FOV',
    subtitleTh: 'ปรับตั้งแกน Pan, Tilt และ Rotation ให้ครอบคลุมโซนเป้าหมาย (Target Zone)',
    phaseName: 'Camera FOV',
    iconName: 'Video',
  },
  {
    id: 4,
    titleTh: '4. ปฏิบัติการติดตั้งกล้องตามชนิดพื้นผิววัสดุ & ทดสอบแรงดึง',
    subtitleTh: 'เลือกวัสดุ (ไม้/เหล็ก/ปูน/สมาร์ทบอร์ด) จับคู่อุปกรณ์ ดอกสว่าน โหมดเจาะ น็อตสกรู ยึดฐาน และทดสอบแรงดึง',
    phaseName: 'Surface Installation & Testing',
    iconName: 'Wrench',
  },
];

export const MOUNT_POINTS: MountPointInfo[] = [
  {
    id: 'A',
    label: 'ตำแหน่ง A: เสาทางเข้าหลัก (เสาปูน)',
    worldPosition: [1.2, 2.8, -0.05],
    heightMeters: 2.8,
    obstruction: false,
    collisionRisk: 'low',
    coveragePotential: 92,
    descriptionTh: 'ความสูง 2.8 เมตร มีมุมมองครอบคลุมทางเข้าหลักชัดเจน ปลอดภัยจากการเฉี่ยวชน',
  },
  {
    id: 'B',
    label: 'ตำแหน่ง B: ผนังด้านข้างระดับต่ำ',
    worldPosition: [-1.4, 1.6, -0.05],
    heightMeters: 1.6,
    obstruction: false,
    collisionRisk: 'high',
    coveragePotential: 65,
    descriptionTh: 'ความสูงเพียง 1.6 เมตร เสี่ยงต่อการถูกชนกระแทกหรือถูกผู้ไม่หวังดีเอื้อมถึง',
  },
  {
    id: 'C',
    label: 'ตำแหน่ง C: ใต้กันสาดชายคา',
    worldPosition: [0.3, 3.4, -0.05],
    heightMeters: 3.4,
    obstruction: false,
    collisionRisk: 'low',
    coveragePotential: 88,
    descriptionTh: 'ความสูง 3.4 เมตร หลบฝนและแสงสะท้อนได้ดี แต่ต้องใช้บันไดสูงในการบำรุงรักษา',
  },
  {
    id: 'D',
    label: 'ตำแหน่ง D: มุมอับใกล้ท่อระบายน้ำ',
    worldPosition: [-2.2, 2.5, -0.05],
    heightMeters: 2.5,
    obstruction: true,
    collisionRisk: 'medium',
    coveragePotential: 48,
    descriptionTh: 'มีสิ่งกีดขวาง (ท่อระบายน้ำ/ขอบเสา) บดบังมุมมองกล้องบางส่วน',
  },
  {
    id: 'E',
    label: 'ตำแหน่ง E: กึ่งกลางทางเดินหน้าประตู',
    worldPosition: [0.0, 2.7, -0.05],
    heightMeters: 2.7,
    obstruction: false,
    collisionRisk: 'low',
    coveragePotential: 95,
    descriptionTh: 'จุดติดตั้งที่ให้มุมมองเข้าหาใบหน้าผู้สัญจรตรงแนวแกนเลนส์สมบูรณ์แบบ',
  },
];

export const SURFACES_DATA: Record<SurfaceType, SurfaceInfo> = {
  wood: {
    id: 'wood',
    nameTh: 'ไม้ (Wood / Timber)',
    color: '#854d0e',
    texturePattern: 'เนื้อไม้ธรรมชาติ / ไม้อัดโครงสร้าง / แผ่นไม้เทียม',
    recommendedBit: 'ดอกสว่านเจาะไม้ (Brad-point) หรือดอก HSS (3–4 มม.)',
    recommendedBitType: 'wood',
    recommendedBitSize: '4mm',
    recommendedMode: 'normal',
    recommendedAnchor: 'ไม่ต้องใช้พุก (ยึดตรงเข้าเนื้อไม้)',
    recommendedAnchorType: 'wood-screw-direct',
    recommendedScrew: 'สกรูเกลียวปล่อยงานไม้หัวเตเปอร์ (Wood Screw #7/8 x 1.2 นิ้ว)',
    drillDepthMm: 25,
    maxPullForceN: 35,
    notesTh: 'เจาะรูนำ (Pilot Hole) ลึก 25–30 มม. ขนาดเล็กกว่าเกลียวสกรูเล็กน้อย เพื่อป้องกันเนื้อไม้แตกฉีก และห้ามใช้โหมดกระแทกเด็ดขาด',
  },
  metal: {
    id: 'metal',
    nameTh: 'เหล็ก (Steel / Sheet Metal / โครงเหล็ก)',
    color: '#475569',
    texturePattern: 'โครงสร้างเหล็กรูปพรรณ / แปเหล็กกัลวาไนซ์ / แผ่นเมทัลชีท',
    recommendedBit: 'ดอกสว่านเจาะเหล็ก HSS (High-Speed Steel) หรือดอก Step Drill (4–5 มม.)',
    recommendedBitType: 'metal',
    recommendedBitSize: '4mm',
    recommendedMode: 'normal',
    recommendedAnchor: 'ไม่ต้องใช้พุก (ยึดตรงเข้าโครงสร้างเหล็ก)',
    recommendedAnchorType: 'self-drilling-metal',
    recommendedScrew: 'สกรูปลายสว่านยึดเหล็ก (Self-Drilling TEK Screw พร้อมแหวนยาง EPDM)',
    drillDepthMm: 5,
    maxPullForceN: 40,
    notesTh: 'ใช้เหล็กส่ง (Center Punch) ตอกนำศูนย์กันดอกสว่านไถล ใช้ความเร็วรอบต่ำ-ปานกลาง แรงบิดสูง และห้ามใช้โหมดกระแทก',
  },
  concrete: {
    id: 'concrete',
    nameTh: 'ปูน (Concrete / Masonry / อิฐมอญฉาบปูน)',
    color: '#94a3b8',
    texturePattern: 'คอนกรีตเสริมเหล็ก / เสาปูนหล่อสำเร็จ / ผนังก่ออิฐฉาบปูน',
    recommendedBit: 'ดอกสว่านเจาะปูนหัวคาร์ไบด์ (Masonry Carbide Bit 6.5 มม.)',
    recommendedBitType: 'masonry',
    recommendedBitSize: '6mm',
    recommendedMode: 'hammer',
    recommendedAnchor: 'พุกพลาสติกมาตรฐาน #7 (Plastic Wall Plug #7)',
    recommendedAnchorType: 'plastic-expansion',
    recommendedScrew: 'สกรูเกลียวปล่อยหัวจมสแตนเลส (Tapping Screw #7/8 x 1.5 นิ้ว)',
    drillDepthMm: 40,
    maxPullForceN: 40,
    notesTh: 'ต้องเปิดโหมดกระแทก (Hammer Mode) เจาะลึก 35–40 มม. และต้องเป่าผงปูนออกจากรูก่อนตอกพุกพลาสติกให้จมเสมอกำแพง',
  },
  smartboard: {
    id: 'smartboard',
    nameTh: 'แผ่นสมาร์ทบอร์ด (Smartboard / Fiber Cement / ยิปซั่ม)',
    color: '#cbd5e1',
    texturePattern: 'แผ่นไฟเบอร์ซีเมนต์บอร์ด / ผนังเบา / ฝ้าเพดานกลวง',
    recommendedBit: 'ดอกสว่านเจาะอเนกประสงค์ (Multipurpose Bit 8–9 มม.)',
    recommendedBitType: 'multipurpose',
    recommendedBitSize: '8mm',
    recommendedMode: 'normal',
    recommendedAnchor: 'พุกผีเสื้อ / พุกร่มสำหรับผนังกลวง (Hollow Wall Toggle Anchor)',
    recommendedAnchorType: 'hollow-wall-toggle',
    recommendedScrew: 'สกรูเกลียวมิลตัวยาวพร้อมปีกกางพุกผีเสื้อ (Machine Screw with Toggle)',
    drillDepthMm: 12,
    maxPullForceN: 25,
    notesTh: 'สมาร์ทบอร์ดเป็นวัสดุกรอบแตกง่าย ห้ามใช้โหมดกระแทกเด็ดขาด ต้องใช้พุกผีเสื้อกางปีกด้านหลังเพื่อกระจายแรงยึดเกาะ',
  },
};

export const PPE_ITEMS: PPEItem[] = [
  {
    id: 'helmet',
    numberIndex: 1,
    nameTh: 'หมวกนิรภัย (Safety Helmet)',
    category: 'required',
    icon: 'HardHat',
    descriptionTh: 'ป้องกันของตกจากที่สูงและศีรษะกระแทกโครงสร้างอาคาร',
  },
  {
    id: 'glasses',
    numberIndex: 2,
    nameTh: 'แว่นตานิรภัย (Safety Glasses)',
    category: 'required',
    icon: 'Glasses',
    descriptionTh: 'ป้องกันสะเก็ดปูนและฝุ่นละอองเข้าดวงตาระหว่างการเจาะผนัง',
  },
  {
    id: 'mask',
    numberIndex: 3,
    nameTh: 'หน้ากากกันฝุ่น (Dust Mask / N95)',
    category: 'required',
    icon: 'Shield',
    descriptionTh: 'ป้องกันการสูดดมฝุ่นคอนกรีตและฝุ่นซิลิกาขนาดเล็ก',
  },
  {
    id: 'gloves',
    numberIndex: 4,
    nameTh: 'ถุงมือช่างกระชับมือ (Work Gloves)',
    category: 'required',
    icon: 'Hand',
    descriptionTh: 'ป้องกันของมีคมและการลื่นไถลขณะจับถือเครื่องมือช่าง',
  },
  {
    id: 'shoes',
    numberIndex: 5,
    nameTh: 'รองเท้านิรภัยหัวเหล็ก (Safety Shoes)',
    category: 'required',
    icon: 'Footprints',
    descriptionTh: 'ป้องกันของหนักหล่นทับเท้าและการลื่นล้มในพื้นที่ทำงาน',
  },
  // Decoys
  {
    id: 'slippers',
    numberIndex: 6,
    nameTh: 'รองเท้าแตะลำลอง (Slippers)',
    category: 'decoy',
    icon: 'Footprints',
    descriptionTh: 'ไม่เหมาะกับงานช่าง เสี่ยงต่อการเหยียบของแหลมคมและการลื่นไถล',
  },
  {
    id: 'cap',
    numberIndex: 7,
    nameTh: 'หมวกแก๊ปแฟชั่น (Baseball Cap)',
    category: 'decoy',
    icon: 'HardHat',
    descriptionTh: 'ไม่สามารถกันแรงกระแทกจากของแข็งหรือวัตถุหล่นทับได้',
  },
  {
    id: 'sunglasses',
    numberIndex: 8,
    nameTh: 'แว่นกันแดดแฟชั่น (Sunglasses)',
    category: 'decoy',
    icon: 'Glasses',
    descriptionTh: 'ไม่ทนทานต่อสะเก็ดหินปูนและอาจลดทอนทัศนวิสัยในที่แสงน้อย',
  },
];

export interface IdealMountPointAngle {
  pan: number;
  tilt: number;
  roll: number;
  recommendedFov: number;
  targetDescription: string;
}

export const MOUNT_POINT_IDEAL_ANGLES: Record<MountPointId, IdealMountPointAngle> = {
  A: {
    pan: -36,
    tilt: -38,
    roll: 0,
    recommendedFov: 70,
    targetDescription: 'เสาปูนขวา (สูง 2.8m): แนะนำ Pan -36° (หันซ้าย) และ Tilt -38° (ก้มลง) ตรงเข้าหาจุดตรวจจับใบหน้าผู้เดินเข้าประตู',
  },
  B: {
    pan: 40,
    tilt: -11,
    roll: 0,
    recommendedFov: 65,
    targetDescription: 'ผนังต่ำซ้าย (สูง 1.6m): แนะนำ Pan +40° (หันขวา) และ Tilt -11° (ก้มเพียงเล็กน้อยระดับสายตา) ตรงเข้าหาประตู',
  },
  C: {
    pan: -10,
    tilt: -53,
    roll: 0,
    recommendedFov: 75,
    targetDescription: 'ใต้กันสาด (สูง 3.4m): แนะนำ Pan -10° และ Tilt -53° (ก้มชันจากมุมสูง) ส่องคลุมพื้นที่ทางเดินหน้าประตู',
  },
  D: {
    pan: 53,
    tilt: -25,
    roll: 0,
    recommendedFov: 60,
    targetDescription: 'มุมอับใกล้ท่อ (สูง 2.5m): แนะนำ Pan +53° (หันขวาเฉียงพ้นแนวท่อ) และ Tilt -25° ส่องเข้าหาประตูทางเข้า',
  },
  E: {
    pan: 0,
    tilt: -42,
    roll: 0,
    recommendedFov: 75,
    targetDescription: 'กึ่งกลางหน้าประตู (สูง 2.7m): แนะนำ Pan 0° (ตรงแนวแกน) และ Tilt -42° (ก้มลงส่องแนวทางเดินและใบหน้าตรง)',
  },
};

export const calculateFovCoverage = (
  pointId: MountPointId,
  pan: number,
  tilt: number,
  roll: number
): number => {
  const ideal = MOUNT_POINT_IDEAL_ANGLES[pointId] || MOUNT_POINT_IDEAL_ANGLES.A;
  const panDiff = Math.abs(pan - ideal.pan);
  const tiltDiff = Math.abs(tilt - ideal.tilt);
  const rollDiff = Math.abs(roll - ideal.roll);
  const deviation = panDiff * 1.2 + tiltDiff * 1.5 + rollDiff * 0.8;
  return Math.max(15, Math.min(98, Math.round(100 - deviation * 1.35)));
};
