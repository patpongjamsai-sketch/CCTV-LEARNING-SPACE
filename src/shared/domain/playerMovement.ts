export interface MovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export interface Point2D {
  x: number;
  z: number;
}

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// เขตพื้นที่เดินศูนย์ฝึกอบรม (ครอบคลุมทั้ง Room 101 และ Room 102 ต่อเนื่องกัน)
export const FACILITY_BOUNDS = {
  minX: -22.5,
  maxX: 20.5,
  minZ: -11.5,
  maxZ: 11.5,
};

// ตำแหน่งและมิติของประตูเชื่อมต่อระหว่าง Room 101 และ Room 102
export const INTER_ROOM_DOOR = {
  x: -2.0,
  z: 0.0,
  width: 4.0, // ช่องเปิดกว้าง 4 เมตร (-2.0 ถึง +2.0)
  collider: { minX: -2.3, maxX: -1.7, minZ: -2.1, maxZ: 2.1 },
};

// สิ่งกีดขวางถาวรใน Room 101 (เลื่อนตำแหน่งแกน X = -13 ให้อยู่ในโซน X: -24 ถึง -2 อย่างถูกต้อง)
export const ROOM101_OBSTACLES: CollisionBox[] = [
  // ชั้นวางสินค้ากลางร้าน
  { minX: -16.05, maxX: -14.35, minZ: -7.15, maxZ: -2.85 },
  { minX: -11.65, maxX: -9.95, minZ: -7.15, maxZ: -2.85 },
  // เคาน์เตอร์ผู้จัดการ
  { minX: -14.75, maxX: -11.25, minZ: -1.55, maxZ: -0.45 },
  // ห้องอุปกรณ์เครือข่าย: ผนังซ้าย และผนังหน้าที่เว้นช่องประตูกว้าง 1.4 เมตร
  { minX: -9.35, maxX: -9.05, minZ: -12.5, maxZ: -4.35 },
  { minX: -9.2, maxX: -7.7, minZ: -4.65, maxZ: -4.35 },
  { minX: -6.3, maxX: -2.5, minZ: -4.65, maxZ: -4.35 },
  // ห้องบันทึกภาพ NVR: ผนังขวา และผนังหน้าที่เว้นช่องประตูกว้าง 1.4 เมตร
  { minX: -16.95, maxX: -16.65, minZ: 1.5, maxZ: 6.5 },
  { minX: -23.5, maxX: -19.7, minZ: 1.35, maxZ: 1.65 },
  { minX: -18.3, maxX: -16.8, minZ: 1.35, maxZ: 1.65 },
  // โต๊ะและแท่นหลัก
  { minX: -20.25, maxX: -17.75, minZ: 3.15, maxZ: 4.85 },
  { minX: -8.55, maxX: -5.45, minZ: 3.15, maxZ: 4.85 },
  { minX: -16.75, maxX: -14.05, minZ: 8.15, maxZ: 9.85 },
  { minX: -11.95, maxX: -9.25, minZ: 8.15, maxZ: 9.85 },
];

// ผนังกั้นระหว่างห้อง 101 และ 102 ที่ X = -2 (เว้นช่องประตูกลาง Z = -2 ถึง +2)
export const CONNECTING_WALL_OBSTACLES: CollisionBox[] = [
  { minX: -2.25, maxX: -1.75, minZ: -13.0, maxZ: -2.0 },
  { minX: -2.25, maxX: -1.75, minZ: 2.0, maxZ: 13.0 },
];

// สิ่งกีดขวางใน Room 102 (Smart School Lab)
export const ROOM102_OBSTACLES: CollisionBox[] = [
  // Station 1: ผังภายนอก Smart School Desk
  { minX: 2.8, maxX: 5.2, minZ: -4.8, maxZ: -3.2 },
  // Station 2: ผังภายใน Smart School & IK10 Desk
  { minX: 14.8, maxX: 17.2, minZ: -4.8, maxZ: -3.2 },
  // Station 3: โต๊ะวิเคราะห์ปัญหาหน้างาน
  { minX: 8.8, maxX: 11.2, minZ: 4.2, maxZ: 5.8 },
  // ผนังกั้นทางออกไปสู่ Room 103 (X = 22)
  { minX: 21.75, maxX: 22.25, minZ: -13.0, maxZ: 13.0 },
];

// สิ่งกีดขวางใน Room 103 (Cabling & Termination Workshop Tables)
export const ROOM103_OBSTACLES: CollisionBox[] = [
  // โต๊ะที่ 1: สถานีเข้าหัวสาย RJ45 & BNC [-6, 0, -3]
  { minX: -7.6, maxX: -4.4, minZ: -4.2, maxZ: -1.8 },
  // โต๊ะที่ 2: สถานีเลือกสายสัญญาณ 5 จุดติดตั้ง [0, 0, -3]
  { minX: -1.6, maxX: 1.6, minZ: -4.2, maxZ: -1.8 },
  // โต๊ะที่ 3: สถานีตรวจสอบสาย & คำนวณ PoE [6, 0, -3]
  { minX: 4.4, maxX: 7.6, minZ: -4.2, maxZ: -1.8 },
  // ผนังห้องด้านหลัง (Z = -5.5)
  { minX: -12.0, maxX: 12.0, minZ: -6.0, maxZ: -5.0 },
];

// สิ่งกีดขวางใน Room 104 (IP Network & PoE Troubleshooting Workshop Tables)
export const ROOM104_OBSTACLES: CollisionBox[] = [
  // โต๊ะที่ 1: วางแผน IP Address Table [-6, 0, -3]
  { minX: -7.6, maxX: -4.4, minZ: -4.2, maxZ: -1.8 },
  // โต๊ะที่ 2: ตั้งค่าอุปกรณ์ & PoE Budget [0, 0, -3]
  { minX: -1.6, maxX: 1.6, minZ: -4.2, maxZ: -1.8 },
  // โต๊ะที่ 3: วิเคราะห์ปัญหา 10 ขั้นตอน [6, 0, -3]
  { minX: 4.4, maxX: 7.6, minZ: -4.2, maxZ: -1.8 },
  // ผนังห้องด้านหลัง (Z = -5.5)
  { minX: -12.0, maxX: 12.0, minZ: -6.0, maxZ: -5.0 },
];

// สิ่งกีดขวางถาวรใน Room 101 แบบแยกเดี่ยวอิสระ (พิกัดกึ่งกลาง X: 0, Z: 0)
export const ISOLATED_ROOM101_BOUNDS = {
  minX: -10.5,
  maxX: 10.5,
  minZ: -12.0,
  maxZ: 12.0,
};

export const ISOLATED_ROOM101_OBSTACLES: CollisionBox[] = [
  // ชั้นวางสินค้ากลางร้าน (เดิมคือ -16.05..-14.35 และ -11.65..-9.95 บวก 13)
  { minX: -3.05, maxX: -1.35, minZ: -7.15, maxZ: -2.85 },
  { minX: 1.35, maxX: 3.05, minZ: -7.15, maxZ: -2.85 },
  // เคาน์เตอร์ผู้จัดการ
  { minX: -1.75, maxX: 1.75, minZ: -1.55, maxZ: -0.45 },
  // ห้องอุปกรณ์เครือข่าย
  { minX: 3.65, maxX: 3.95, minZ: -12.5, maxZ: -4.35 },
  { minX: 3.8, maxX: 5.3, minZ: -4.65, maxZ: -4.35 },
  { minX: 6.7, maxX: 10.5, minZ: -4.65, maxZ: -4.35 },
  // ห้องบันทึกภาพ NVR
  { minX: -3.95, maxX: -3.65, minZ: 1.5, maxZ: 6.5 },
  { minX: -10.5, maxX: -6.7, minZ: 1.35, maxZ: 1.65 },
  { minX: -5.3, maxX: -3.8, minZ: 1.35, maxZ: 1.65 },
  // โต๊ะและแท่นหลัก
  { minX: -7.25, maxX: -4.75, minZ: 3.15, maxZ: 4.85 },
  { minX: 4.45, maxX: 7.55, minZ: 3.15, maxZ: 4.85 },
  { minX: -3.75, maxX: -1.05, minZ: 8.15, maxZ: 9.85 },
  { minX: 1.05, maxX: 3.75, minZ: 8.15, maxZ: 9.85 },
];

// สิ่งกีดขวางใน Room 102 แบบแยกเดี่ยวอิสระ (พิกัดกึ่งกลาง X: 0, Z: 0)
export const ISOLATED_ROOM102_BOUNDS = {
  minX: -10.5,
  maxX: 10.5,
  minZ: -10.5,
  maxZ: 10.5,
};

export const ISOLATED_ROOM102_OBSTACLES: CollisionBox[] = [
  // Station 1: Outdoor & Perimeter Desk at [-6, 0, -4]
  { minX: -7.2, maxX: -4.8, minZ: -4.8, maxZ: -3.2 },
  // Station 2: Indoor Corridor & Classroom Desk at [6, 0, -4]
  { minX: 4.8, maxX: 7.2, minZ: -4.8, maxZ: -3.2 },
  // Station 3: Server & Gate Configuration Desk at [0, 0, 5]
  { minX: -1.2, maxX: 1.2, minZ: 4.2, maxZ: 5.8 },
  // Central Innovation Holo-Pod at [0, 0, 0]
  { minX: -1.6, maxX: 1.6, minZ: -1.6, maxZ: 1.6 },
];

// ฟังก์ชันคืนค่าอุปสรรคและขอบเขตสำหรับห้องเดี่ยวอิสระ
export function getRoomPhysicsConfig(roomNum: number, isRoom102Unlocked: boolean = false) {
  if (roomNum === 101) {
    const obstacles = [...ISOLATED_ROOM101_OBSTACLES];
    // ประตูพอร์ทัลทางออกไป Room 102 อยู่ที่ X = 10.8 (ฝั่งตะวันออก)
    if (!isRoom102Unlocked) {
      obstacles.push({ minX: 10.2, maxX: 11.0, minZ: -2.0, maxZ: 2.0 });
    }
    return {
      obstacles,
      bounds: ISOLATED_ROOM101_BOUNDS,
      spawn: { x: 0, z: 2.0 },
    };
  }

  if (roomNum === 102) {
    return {
      obstacles: ISOLATED_ROOM102_OBSTACLES,
      bounds: ISOLATED_ROOM102_BOUNDS,
      spawn: { x: 0, z: 2.0 },
    };
  }

  if (roomNum === 103) {
    return {
      obstacles: ROOM103_OBSTACLES,
      bounds: { minX: -11.0, maxX: 11.0, minZ: -5.0, maxZ: 6.0 },
      spawn: { x: 0, z: 3.5 },
    };
  }

  if (roomNum === 104) {
    return {
      obstacles: ROOM104_OBSTACLES,
      bounds: { minX: -11.0, maxX: 11.0, minZ: -5.0, maxZ: 6.0 },
      spawn: { x: 0, z: 3.5 },
    };
  }

  // Fallback สำหรับห้อง 105 - 108
  return {
    obstacles: [],
    bounds: { minX: -10.0, maxX: 10.0, minZ: -10.0, maxZ: 10.0 },
    spawn: { x: 0, z: 2.5 },
  };
}

// สร้างรายการสิ่งกีดขวางทั้งหมดแบบไดนามิกตามสถานะการปลดล็อกประตู
export function getConnectedSceneObstacles(isRoom102Unlocked: boolean): CollisionBox[] {
  const list = [
    ...ROOM101_OBSTACLES,
    ...CONNECTING_WALL_OBSTACLES,
    ...ROOM102_OBSTACLES,
  ];
  if (!isRoom102Unlocked) {
    list.push(INTER_ROOM_DOOR.collider);
  }
  return list;
}

// Default export สำหรับ backwards compatibility
export const STORE_OBSTACLES: CollisionBox[] = getConnectedSceneObstacles(false);

export function getCameraRelativeMove(input: MovementInput, yaw: number): Point2D {
  const forwardAmount = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
  const rightAmount = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  const x = -Math.sin(yaw) * forwardAmount + Math.cos(yaw) * rightAmount;
  const z = -Math.cos(yaw) * forwardAmount - Math.sin(yaw) * rightAmount;
  const length = Math.hypot(x, z);
  return length > 0 ? { x: x / length, z: z / length } : { x: 0, z: 0 };
}

function collides(point: Point2D, obstacles: CollisionBox[], radius: number): boolean {
  return obstacles.some((box) =>
    point.x + radius > box.minX &&
    point.x - radius < box.maxX &&
    point.z + radius > box.minZ &&
    point.z - radius < box.maxZ
  );
}

export function moveWithObstacleSliding(
  current: Point2D,
  delta: Point2D,
  obstacles: CollisionBox[],
  radius: number,
): Point2D {
  const nextX = { x: current.x + delta.x, z: current.z };
  const resolvedX = collides(nextX, obstacles, radius) ? current.x : nextX.x;
  const nextZ = { x: resolvedX, z: current.z + delta.z };
  const resolvedZ = collides(nextZ, obstacles, radius) ? current.z : nextZ.z;
  return { x: resolvedX, z: resolvedZ };
}

export interface VerticalPhysicsState {
  y: number;
  verticalVelocity: number;
}

export function applyVerticalPhysics(
  current: VerticalPhysicsState,
  deltaSeconds: number,
  gravity: number = 16.0,
): VerticalPhysicsState {
  if (current.y <= 0 && current.verticalVelocity <= 0) {
    return { y: 0, verticalVelocity: 0 };
  }

  const nextVelocity = current.verticalVelocity - gravity * deltaSeconds;
  const nextY = current.y + current.verticalVelocity * deltaSeconds;

  if (nextY <= 0) {
    return { y: 0, verticalVelocity: 0 };
  }

  return { y: nextY, verticalVelocity: nextVelocity };
}
