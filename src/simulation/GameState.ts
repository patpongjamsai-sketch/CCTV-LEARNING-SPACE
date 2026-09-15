import type { SerializableGameState } from '../data/types';

export const SAVE_VERSION = 1 as const;
export const SAVE_KEY = 'cctvTechnician3dSaveV1';

export function createDefaultGameState(): SerializableGameState {
  return {
    saveVersion: SAVE_VERSION,
    currentMission: 'F1-M101',
    unlockedRooms: [101],
    completedObjectives: [],
    missionResults: {
      'F1-M101': {
        status: 'not-started', score: 0, bestScore: 0, attemptCount: 0,
        completionTime: 0, completedAt: null,
      },
    },
    inventory: {},
    attemptCount: 0,
    completionTime: 0,
    answers: {},
    usedHints: [],
    hintsUsed: 0,
    wrongSelections: 0,
    equipmentChanged: 0,
    budgetUsed: 0,
    missionStartedAt: null,
  };
}

type StateListener = (state: SerializableGameState) => void;

export class GameStore {
  private state: SerializableGameState;
  private readonly listeners = new Set<StateListener>();

  constructor(initialState: SerializableGameState = createDefaultGameState()) {
    this.state = structuredClone(initialState);
  }

  get snapshot(): Readonly<SerializableGameState> {
    return this.state;
  }

  update(mutator: (draft: SerializableGameState) => void): void {
    const draft = structuredClone(this.state);
    mutator(draft);
    this.state = draft;
    this.listeners.forEach((listener) => listener(this.state));
  }

  replace(nextState: SerializableGameState): void {
    this.state = structuredClone(nextState);
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
