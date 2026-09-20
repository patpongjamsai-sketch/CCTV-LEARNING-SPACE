import { describe, expect, it } from 'vitest';

import { unit01Content } from '../content/courses/21909-2020';
import { validateUnitContract } from '../content/courses/21909-2020/validator';

describe('Unit 1 content contract', () => {
  it('exposes the frozen lesson and assessment flow in canonical order', () => {
    expect(unit01Content.unit.id).toBe('U01');
    expect(unit01Content.lessons.map((lesson) => lesson.id)).toEqual([
      'U01-L01',
      'U01-L02',
      'U01-L03',
      'U01-L04',
      'U01-L05',
      'U01-L06',
      'U01-L07',
      'U01-L08',
      'U01-L09',
      'U01-L10',
    ]);
    expect(unit01Content.assessments.map((assessment) => assessment.id)).toEqual([
      'U01-A01',
      'U01-A02',
      'U01-A03',
      'U01-A04',
    ]);
    expect(unit01Content.assessmentFlow).toEqual([
      'U01-A01',
      'U01-A02',
      'U01-A03',
      'U01-A04',
      'U01-LAB01',
      'U01-F01',
      'U01-R01',
    ]);
  });

  it('keeps the frozen assessment weights at 100 percent', () => {
    const weightedItems = [
      ...unit01Content.assessments,
      unit01Content.lab,
      unit01Content.faultChallenge,
      unit01Content.reflection,
    ];

    expect(weightedItems.reduce((total, item) => total + (item.scoring?.weight ?? 0), 0)).toBe(100);
  });

  it('requires safety and teacher verification before the LAB can unlock', () => {
    const labRule = unit01Content.unlockRules.find((rule) => rule.targetId === 'U01-LAB01');

    expect(labRule?.all).toEqual(
      expect.arrayContaining([
        { contentId: 'U01-A03', condition: 'passed' },
        { contentId: 'U01-A04', condition: 'pre_lab_passed' },
        { evidenceType: 'safety_check', condition: 'validated' },
        { evidenceType: 'teacher_verification', condition: 'verified' },
      ]),
    );
  });

  it('accepts the canonical baseline without errors', () => {
    const result = validateUnitContract(unit01Content);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a duplicate content id', () => {
    const candidate = structuredClone(unit01Content);
    candidate.lessons[1]!.id = 'U01-L01';

    const result = validateUnitContract(candidate);

    expect(result.valid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain('VAL-ID-001');
  });
});
