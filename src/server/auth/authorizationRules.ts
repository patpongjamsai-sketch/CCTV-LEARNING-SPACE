export type ProfileRole = 'student' | 'teacher' | 'admin';

export type ClassMembershipSummary = {
  memberRole: 'student' | 'teacher';
  active: boolean;
};

export function canManageClass(
  role: ProfileRole,
  membership: ClassMembershipSummary | null,
): boolean {
  if (role === 'admin') return true;
  return role === 'teacher' && membership?.memberRole === 'teacher' && membership.active;
}

export function canSubmitForStudent(authenticatedUserId: string, studentId: string): boolean {
  return authenticatedUserId === studentId;
}
