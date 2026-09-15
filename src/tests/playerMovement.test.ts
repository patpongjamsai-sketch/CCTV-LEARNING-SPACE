import { describe, expect, it } from 'vitest';
import {
  getCameraRelativeMove,
  moveWithObstacleSliding,
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
