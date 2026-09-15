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

// สิ่งกีดขวางในฉาก ใช้ชุดข้อมูลเดียวกันกับการเคลื่อนที่เพื่อป้องกันภาพกับ Collision ไม่ตรงกัน
export const STORE_OBSTACLES: CollisionBox[] = [
  // ชั้นวางสินค้ากลางร้าน
  { minX: -3.05, maxX: -1.35, minZ: -7.15, maxZ: -2.85 },
  { minX: 1.35, maxX: 3.05, minZ: -7.15, maxZ: -2.85 },
  // เคาน์เตอร์ผู้จัดการ
  { minX: -1.75, maxX: 1.75, minZ: -1.55, maxZ: -0.45 },
  // Zone C: ผนังซ้าย และผนังหน้าที่เว้นช่องประตูกว้าง 1.4 เมตร
  { minX: 3.65, maxX: 3.95, minZ: -12.5, maxZ: -4.35 },
  { minX: 3.8, maxX: 5.3, minZ: -4.65, maxZ: -4.35 },
  { minX: 6.7, maxX: 10.5, minZ: -4.65, maxZ: -4.35 },
  // Zone D: ผนังขวา และผนังหน้าที่เว้นช่องประตูกว้าง 1.4 เมตร
  { minX: -3.95, maxX: -3.65, minZ: 1.5, maxZ: 6.5 },
  { minX: -10.5, maxX: -6.7, minZ: 1.35, maxZ: 1.65 },
  { minX: -5.3, maxX: -3.8, minZ: 1.35, maxZ: 1.65 },
  // โต๊ะและแท่นหลักที่ผู้เรียนต้องเดินอ้อม
  { minX: -7.25, maxX: -4.75, minZ: 3.15, maxZ: 4.85 },
  { minX: 4.45, maxX: 7.55, minZ: 3.15, maxZ: 4.85 },
  { minX: -3.75, maxX: -1.05, minZ: 8.15, maxZ: 9.85 },
  { minX: 1.05, maxX: 3.75, minZ: 8.15, maxZ: 9.85 },
];

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
