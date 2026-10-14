import { describe, expect, it } from 'vitest';
import { advanceRj45Game, createRj45Game, cutAndRetryEnd, setRj45Wire, testRj45Cable } from '../features/rj45-game/game';

const ordered = ['WO', 'O', 'WG', 'B', 'WB', 'G', 'WBr', 'Br'] as const;

function readyEnd(state: ReturnType<typeof createRj45Game>, side: 'A' | 'B') {
  const end = state.ends[side];
  end.bootOn = true;
  end.stripMm = 14;
  end.insulationIntact = true;
  end.untwistMm = 10;
  end.wires = [...ordered];
  end.trimmed = true;
  end.inserted = true;
  end.jacketUnderTab = true;
  end.crimped = true;
  end.pullChecked = true;
  return state;
}

describe('RJ45 CAT6 game rules', () => {
  it('blocks work until PoE is disconnected and the connector matches the cable', () => {
    const state = createRj45Game();
    expect(advanceRj45Game(state).stage).toBe(1);
    state.powerOff = true;
    state.connectorCorrect = true;
    expect(advanceRj45Game(state).stage).toBe(1);
    state.ppeOn = true;
    expect(advanceRj45Game(state).stage).toBe(2);
  });

  it('cannot crimp before each wire reaches the plug and the jacket is secured', () => {
    const state = createRj45Game();
    state.stage = 6;
    state.ends.A.wires = [...ordered];
    expect(advanceRj45Game(state).stage).toBe(6);
    readyEnd(state, 'A');
    expect(advanceRj45Game(state).side).toBe('B');
  });

  it('reports crossed wires and an open contact from the actual two ends', () => {
    const state = readyEnd(readyEnd(createRj45Game(), 'A'), 'B');
    state.ends.B.wires[2] = 'G';
    state.ends.B.wires[5] = 'WG';
    state.ends.B.openPin = 7;
    const result = testRj45Cable(state);
    expect(result.wiremap[2]).toBe(6);
    expect(result.wiremap[5]).toBe(3);
    expect(result.wiremap[6]).toBe(null);
    expect(result.passed).toBe(false);
  });

  it('requires a fresh tester pass after fixing a bad end', () => {
    const state = readyEnd(readyEnd(createRj45Game(), 'A'), 'B');
    state.stage = 7;
    state.ends.B.openPin = 7;
    expect(testRj45Cable(state).passed).toBe(false);
    state.ends.B.openPin = null;
    expect(testRj45Cable(state).passed).toBe(true);
    expect(state.testRuns).toBe(2);
  });

  it('prevents rearranging an already crimped plug', () => {
    const state = readyEnd(createRj45Game(), 'A');
    expect(setRj45Wire(state, 'A', 1, 'G').ends.A.wires[0]).toBe('WO');
  });

  it('returns to the tester after repairing end A instead of rebuilding end B', () => {
    const state = readyEnd(readyEnd(createRj45Game(), 'A'), 'B');
    state.stage = 7;
    const repairing = cutAndRetryEnd(state, 'A');
    readyEnd(repairing, 'A');
    repairing.stage = 6;
    expect(advanceRj45Game(repairing).stage).toBe(7);
    expect(advanceRj45Game(repairing).side).toBe('A');
  });
});
