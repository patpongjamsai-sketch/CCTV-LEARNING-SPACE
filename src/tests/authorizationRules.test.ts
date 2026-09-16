import { describe, expect, it } from 'vitest';

import { canManageClass, canSubmitForStudent } from '../server/auth/authorizationRules';

describe('application authorization rules', () => {
  it('allows an active class teacher and an active admin to manage a class', () => {
    expect(canManageClass('teacher', { memberRole: 'teacher', active: true })).toBe(true);
    expect(canManageClass('admin', null)).toBe(true);
  });

  it('does not let a student or an inactive teacher manage a class', () => {
    expect(canManageClass('student', { memberRole: 'student', active: true })).toBe(false);
    expect(canManageClass('teacher', { memberRole: 'teacher', active: false })).toBe(false);
  });

  it('only lets a student submit game data for their own profile', () => {
    expect(canSubmitForStudent('student-1', 'student-1')).toBe(true);
    expect(canSubmitForStudent('student-1', 'student-2')).toBe(false);
  });
});
