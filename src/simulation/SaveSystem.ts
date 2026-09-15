import type { SerializableGameState } from '../data/types';
import { createDefaultGameState, SAVE_KEY, SAVE_VERSION } from './GameState';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function isValidState(value: unknown): value is SerializableGameState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<SerializableGameState>;
  return state.saveVersion === SAVE_VERSION
    && typeof state.currentMission === 'string'
    && Array.isArray(state.unlockedRooms)
    && state.unlockedRooms.every((room) => Number.isInteger(room))
    && Array.isArray(state.completedObjectives)
    && state.completedObjectives.every((id) => typeof id === 'string')
    && !!state.missionResults && typeof state.missionResults === 'object'
    && !!state.inventory && typeof state.inventory === 'object'
    && typeof state.attemptCount === 'number'
    && typeof state.completionTime === 'number'
    && !!state.answers && typeof state.answers === 'object'
    && Array.isArray(state.usedHints);
}

export class SaveSystem {
  constructor(private readonly storage: StorageLike, private readonly key = SAVE_KEY) {}

  load(): SerializableGameState {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return createDefaultGameState();
      const parsed: unknown = JSON.parse(raw);
      return isValidState(parsed) ? parsed : createDefaultGameState();
    } catch {
      return createDefaultGameState();
    }
  }

  save(state: Readonly<SerializableGameState>): void {
    this.storage.setItem(this.key, JSON.stringify(state));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
