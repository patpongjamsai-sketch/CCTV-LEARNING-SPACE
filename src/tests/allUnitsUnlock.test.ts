import { describe, expect, it, beforeEach, vi } from 'vitest';

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const storageMock = createLocalStorageMock();
(globalThis as any).localStorage = storageMock;
(globalThis as any).window = globalThis;
(globalThis as any).window.localStorage = storageMock;
(globalThis as any).window.dispatchEvent = vi.fn();
(globalThis as any).CustomEvent = class CustomEvent {
  detail: any;
  constructor(_type: string, options?: any) {
    this.detail = options?.detail;
  }
};

import {
  isLabUnlocked,
  isUnitUnlocked,
  isAssessmentUnlocked,
  saveTeacherApprovals,
  DEFAULT_TEACHER_APPROVALS,
  syncTeacherApprovalsFromApi,
} from '../lib/progressionState';

describe('All Units (U01 to U08) Progression and Unlock System', () => {
  beforeEach(() => {
    localStorage.clear();
    saveTeacherApprovals(DEFAULT_TEACHER_APPROVALS);
  });

  it('Unit 1 (U01) is unlocked by default for learners', () => {
    expect(isUnitUnlocked('U01')).toBe(true);
    expect(isLabUnlocked('U01').unlocked).toBe(true);
    expect(isAssessmentUnlocked('U01').unlocked).toBe(true);
  });

  const units = ['U02', 'U03', 'U04', 'U05', 'U06', 'U07', 'U08'];

  units.forEach((unitId) => {
    it(`Unit ${unitId} unlocks 3D Lab immediately when teacher enables lab unlock in approvals`, () => {
      saveTeacherApprovals({
        ...DEFAULT_TEACHER_APPROVALS,
        unlockedLabs: {
          ...DEFAULT_TEACHER_APPROVALS.unlockedLabs,
          [unitId]: true,
        },
      });

      const labGate = isLabUnlocked(unitId);
      expect(labGate.unlocked).toBe(true);
      expect(labGate.reason).toContain('ครูผู้สอนอนุมัติ');
      expect(isUnitUnlocked(unitId)).toBe(true);
    });

    it(`Unit ${unitId} unlocks 3D Lab immediately when teacher enables unit unlock in approvals`, () => {
      saveTeacherApprovals({
        ...DEFAULT_TEACHER_APPROVALS,
        unlockedUnits: {
          ...DEFAULT_TEACHER_APPROVALS.unlockedUnits,
          [unitId]: true,
        },
      });

      const labGate = isLabUnlocked(unitId);
      expect(labGate.unlocked).toBe(true);
      expect(isUnitUnlocked(unitId)).toBe(true);
    });

    it(`Unit ${unitId} unlocks 3D Lab immediately when student completes subjective assessment`, () => {
      // Simulate student submitting subjective diagnostic test for this unit
      localStorage.setItem(`cctv_fault_submission_${unitId}`, JSON.stringify({ status: 'submitted' }));

      const labGate = isLabUnlocked(unitId);
      expect(labGate.unlocked).toBe(true);
      expect(labGate.reason).toContain('ทำแบบทดสอบอัตนัย');
      expect(isUnitUnlocked(unitId)).toBe(true);
    });

    it(`Unit ${unitId} assessment is accessible for diagnostic self-unlock`, () => {
      const examGate = isAssessmentUnlocked(unitId);
      expect(examGate.unlocked).toBe(true);
      expect(examGate.reason).toContain('พร้อมทำแบบทดสอบอัตนัย');
    });
  });

  it('syncTeacherApprovalsFromApi correctly fetches and updates approvals in localStorage', async () => {
    const mockApprovals = {
      unlockedUnits: { U01: true, U02: true, U03: true },
      unlockedLabs: { U01: false, U02: true, U03: false },
      unlockedAssessments: { U01: true, U02: true, U03: false },
      passedUnits: { U01: true },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, approvals: mockApprovals }),
    }) as unknown as typeof fetch;

    await syncTeacherApprovalsFromApi('22222222-2222-4222-8222-222222222222');

    expect(isLabUnlocked('U02').unlocked).toBe(true);
    expect(isUnitUnlocked('U02')).toBe(true);
    expect(isUnitUnlocked('U03')).toBe(true);
  });
});
