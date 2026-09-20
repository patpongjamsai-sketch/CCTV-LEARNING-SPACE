import { describe, expect, it } from 'vitest';
import {
  getCameraRelativeMove,
  moveWithObstacleSliding,
  getRoomPhysicsConfig,
  applyVerticalPhysics,
  type CollisionBox,
} from '../shared/domain/playerMovement';

describe('camera-relative player movement', () => {
  it('moves W toward the direction seen by a camera rotated 90 degrees', () => {
    const movement = getCameraRelativeMove({ forward: true, backward: false, left: false, right: false }, Math.PI / 2);
    expect(movement.x).toBeCloseTo(-1, 5);
    expect(movement.z).toBeCloseTo(0, 5);
  });

  it('moves D toward the right side of the screen after the camera rotates', () => {
    const movement = getCameraRelativeMove({ forward: false, backward: false, left: false, right: true }, Math.PI / 2);
    expect(movement.x).toBeCloseTo(0, 5);
    expect(movement.z).toBeCloseTo(-1, 5);
  });

  it('normalizes diagonal movement so it is not faster than straight movement', () => {
    const movement = getCameraRelativeMove({ forward: true, backward: false, left: false, right: true }, 0);
    expect(Math.hypot(movement.x, movement.z)).toBeCloseTo(1, 5);
  });
});

describe('player obstacle collision', () => {
  const wall: CollisionBox = { minX: 1, maxX: 2, minZ: -2, maxZ: 2 };

  it('blocks the axis entering a wall while preserving movement along its edge', () => {
    const next = moveWithObstacleSliding(
      { x: 0.6, z: 0 },
      { x: 0.8, z: 0.7 },
      [wall],
      0.3,
    );
    expect(next.x).toBe(0.6);
    expect(next.z).toBe(0.7);
  });

  it('allows the player to pass through a doorway gap between two wall segments', () => {
    const doorwayWalls: CollisionBox[] = [
      { minX: -4, maxX: -0.8, minZ: -0.15, maxZ: 0.15 },
      { minX: 0.8, maxX: 4, minZ: -0.15, maxZ: 0.15 },
    ];
    const next = moveWithObstacleSliding({ x: 0, z: 0.5 }, { x: 0, z: -1 }, doorwayWalls, 0.3);
    expect(next).toEqual({ x: 0, z: -0.5 });
  });
});

describe('isolated room physics config', () => {
  it('returns locked door obstacle for Room 101 when not unlocked', () => {
    const locked = getRoomPhysicsConfig(101, false);
    const unlocked = getRoomPhysicsConfig(101, true);
    expect(locked.obstacles.length).toBeGreaterThan(unlocked.obstacles.length);
    expect(locked.spawn).toEqual({ x: 0, z: 2.0 });
    expect(locked.bounds.minX).toBe(-10.5);
  });

  it('returns clean centered bounds and spawn for Room 102', () => {
    const r102 = getRoomPhysicsConfig(102);
    expect(r102.spawn).toEqual({ x: 0, z: 2.0 });
    expect(r102.bounds.minX).toBe(-10.5);
    expect(r102.bounds.maxX).toBe(10.5);
  });

  it('returns dedicated workshop bounds and spawn for Room 103 and 104', () => {
    const r103 = getRoomPhysicsConfig(103);
    const r104 = getRoomPhysicsConfig(104);
    expect(r103.spawn).toEqual({ x: 0, z: 3.5 });
    expect(r104.spawn).toEqual({ x: 0, z: 3.5 });
  });
});

describe('vertical jumping and gravity physics', () => {
  it('keeps character stationary on ground if on ground with no upward velocity', () => {
    const result = applyVerticalPhysics({ y: 0, verticalVelocity: 0 }, 0.02, 16.0);
    expect(result.y).toBe(0);
    expect(result.verticalVelocity).toBe(0);
  });

  it('ascends under initial jump impulse with gravity deceleration', () => {
    // Jump with 5.2 m/s impulse for 0.02s
    const step1 = applyVerticalPhysics({ y: 0, verticalVelocity: 5.2 }, 0.02, 16.0);
    expect(step1.y).toBeCloseTo(0.104, 3);
    expect(step1.verticalVelocity).toBeCloseTo(5.2 - 16.0 * 0.02, 3);
  });

  it('clamps to ground level and resets velocity upon landing', () => {
    // Character near ground falling down
    const landing = applyVerticalPhysics({ y: 0.05, verticalVelocity: -4.0 }, 0.05, 16.0);
    expect(landing.y).toBe(0);
    expect(landing.verticalVelocity).toBe(0);
  });
});
