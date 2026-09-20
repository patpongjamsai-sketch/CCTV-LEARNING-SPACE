import { describe, expect, it } from 'vitest';

import { unit01Content } from '../content/courses/21909-2020';
import { canUnlockContent } from '../content/courses/21909-2020/unlock';

describe('Unit 1 unlock rules', () => {
  it('keeps LAB locked when safety evidence is not validated', () => {
    const unlocked = canUnlockContent(unit01Content, 'U01-LAB01', {
      content: {
        'U01-A03': 'passed',
        'U01-A04': 'pre_lab_passed',
      },
      evidence: {
        safety_check: 'submitted',
        teacher_verification: 'verified',
      },
      overallScore: 95,
    });

    expect(unlocked).toBe(false);
  });

  it('unlocks LAB only when all content and evidence gates pass', () => {
    const unlocked = canUnlockContent(unit01Content, 'U01-LAB01', {
      content: {
        'U01-A03': 'passed',
        'U01-A04': 'pre_lab_passed',
      },
      evidence: {
        safety_check: 'validated',
        teacher_verification: 'verified',
      },
      overallScore: 95,
    });

    expect(unlocked).toBe(true);
  });
});
