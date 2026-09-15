import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { PhysicsWorld } from '../physics/PhysicsWorld';

beforeAll(async () => {
  await RAPIER.init();
});

describe('room door collision', () => {
  it('removes the requested room door collider once and leaves other doors locked', () => {
    // จับข้อผิดพลาดกรณีผ่าน Room 102 แล้ว Collider ประตู 103 ยังขวางอยู่หรือปลดผิดห้อง
    const physics = new PhysicsWorld({ x: 0, y: 1, z: 2 });
    physics.addStaticBox({ x: 0, y: 1.5, z: 0, width: 2, height: 3, depth: 0.2, tag: 'door:102' });
    physics.addStaticBox({ x: 4, y: 1.5, z: 0, width: 2, height: 3, depth: 0.2, tag: 'door:103' });
    const unlockRoom = (physics as unknown as { unlockRoom?: (room: number) => boolean }).unlockRoom;
    expect(unlockRoom?.call(physics, 103)).toBe(true);
    expect(unlockRoom?.call(physics, 103)).toBe(false);
    expect(unlockRoom?.call(physics, 102)).toBe(true);
  });
});
