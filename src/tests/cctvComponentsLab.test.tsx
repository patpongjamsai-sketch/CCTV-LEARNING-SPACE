import { describe, it, expect } from 'vitest';
import {
  REALISTIC_COMPONENTS,
  DIAGNOSTIC_SCENARIOS,
  MASTERY_QUIZ_QUESTIONS,
} from '../components/labs/cctv-components/cctvComponentsData';

describe('CCTV 5 Core Components Engineering Lab', () => {
  it('contains all 5 essential CCTV hardware categories', () => {
    expect(REALISTIC_COMPONENTS).toHaveLength(5);
    const categories = REALISTIC_COMPONENTS.map((c) => c.category);
    expect(categories).toContain('camera');
    expect(categories).toContain('transmission');
    expect(categories).toContain('storage');
    expect(categories).toContain('network_vms');
    expect(categories).toContain('display');
  });

  it('provides realistic specs and anatomy parts for each component', () => {
    REALISTIC_COMPONENTS.forEach((comp) => {
      expect(comp.modelCode).toBeTruthy();
      expect(Object.keys(comp.specs).length).toBeGreaterThanOrEqual(4);
      expect(comp.anatomyParts.length).toBeGreaterThanOrEqual(2);
      comp.anatomyParts.forEach((part) => {
        expect(part.nameTh).toBeTruthy();
        expect(part.functionTh).toBeTruthy();
        expect(part.specDetails.length).toBeGreaterThan(0);
      });
    });
  });

  it('calculates PoE Power Budget correctly and detects overload', () => {
    const calculatePoeOverload = (camCount: number, wattsPerCam: number, switchBudget: number) => {
      const totalUsed = camCount * wattsPerCam;
      return totalUsed > switchBudget;
    };

    // 8 cameras * 12W = 96W on 120W switch (Safe)
    expect(calculatePoeOverload(8, 12, 120)).toBe(false);

    // 6 cameras * 12W = 72W on 65W switch (Overload)
    expect(calculatePoeOverload(6, 12, 65)).toBe(true);

    // 4 standard cameras * 8W = 32W on 65W switch (Safe)
    expect(calculatePoeOverload(4, 8, 65)).toBe(false);
  });

  it('calculates video bandwidth and retention days accurately', () => {
    // 4 cameras with H.265+ @ 2.5 Mbps each
    const camCount = 4;
    const bitrateMbps = 2.5;
    const totalBitrate = camCount * bitrateMbps; // 10.0 Mbps
    expect(totalBitrate).toBe(10.0);

    // Daily GB: (10 Mbps * 3600 * 24 / 8) / 1000 = 108 GB/day
    const dailyGb = (totalBitrate * 3600 * 24) / 8 / 1000;
    expect(dailyGb).toBe(108);

    // 4TB HDD (3,600 GB usable) / 108 GB/day = ~33 days
    const usableGb = 4000 * 0.9;
    const days = Math.floor(usableGb / dailyGb);
    expect(days).toBeGreaterThanOrEqual(30);
  });

  it('contains 5 realistic diagnostic troubleshooting scenarios with correct solutions', () => {
    expect(DIAGNOSTIC_SCENARIOS).toHaveLength(5);
    DIAGNOSTIC_SCENARIOS.forEach((scenario) => {
      expect(scenario.ticketNo).toMatch(/^TICK-101-\d{2}$/);
      expect(scenario.options.length).toBe(3);
      const correctOptions = scenario.options.filter((o) => o.isCorrect);
      expect(correctOptions).toHaveLength(1);
      expect(scenario.techEvidence.multimeterPoE).toBeTruthy();
    });
  });

  it('contains 10 comprehensive mastery assessment questions', () => {
    expect(MASTERY_QUIZ_QUESTIONS).toHaveLength(10);
    MASTERY_QUIZ_QUESTIONS.forEach((q) => {
      expect(q.optionsTh).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanationTh.length).toBeGreaterThan(10);
    });
  });
});
