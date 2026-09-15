import { Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { createDefaultGameState } from '../simulation/GameState';
import { SaveSystem, type StorageLike } from '../simulation/SaveSystem';

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('save system', () => {
  it('restores serializable progress and inventory', () => {
    const storage = new MemoryStorage();
    const save = new SaveSystem(storage);
    const state = createDefaultGameState();
    state.unlockedRooms.push(102);
    state.inventory.ip_camera_4mp = { equipmentId: 'ip_camera_4mp', quantity: 1, condition: 'good' };
    save.save(state);
    expect(save.load().unlockedRooms).toContain(102);
    expect(save.load().inventory.ip_camera_4mp?.quantity).toBe(1);
  });

  it('falls back safely from corrupted save data', () => {
    const storage = new MemoryStorage();
    storage.setItem('cctvTechnician3dSaveV1', '{not-json');
    expect(new SaveSystem(storage).load()).toEqual(createDefaultGameState());
  });

  it('does not store Three.js objects in simulation state', () => {
    const state = createDefaultGameState();
    expect(JSON.stringify(state)).not.toContain('Object3D');
    expect(Object.values(state).some((value) => value instanceof Object3D)).toBe(false);
  });
});
