import { describe, expect, it } from 'vitest';
import { equipmentById } from '../data/equipment';
import { createDefaultGameState } from '../simulation/GameState';
import { addInventoryItem, removeInventoryItem } from '../simulation/InventoryState';

describe('inventory', () => {
  it('adds and removes without producing negative quantities', () => {
    const state = createDefaultGameState();
    const camera = equipmentById.get('ip_camera_4mp')!;
    addInventoryItem(state, camera, 1);
    expect(state.inventory[camera.id]?.quantity).toBe(1);
    expect(removeInventoryItem(state, camera.id, 2)).toBe(false);
    expect(state.inventory[camera.id]?.quantity).toBe(1);
    expect(removeInventoryItem(state, camera.id, 1)).toBe(true);
    expect(state.inventory[camera.id]).toBeUndefined();
  });
});
