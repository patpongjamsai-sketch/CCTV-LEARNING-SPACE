import type { EvidenceType, UnitContentBundle, UnlockCondition } from './types';

export type ContentProgressStatus = 'passed' | 'completed' | 'pre_lab_passed';
export type EvidenceStatus = 'submitted' | 'validated' | 'verified';

export interface LearnerUnlockState {
  content: Record<string, ContentProgressStatus | undefined>;
  evidence: Partial<Record<EvidenceType, EvidenceStatus>>;
  // คะแนนเป็นข้อมูลประกอบ ไม่สามารถ override Gate ที่บังคับไว้ใน Contract ได้
  overallScore?: number;
}

function conditionPasses(condition: UnlockCondition, state: LearnerUnlockState): boolean {
  if ('contentId' in condition) {
    return state.content[condition.contentId] === condition.condition;
  }

  return state.evidence[condition.evidenceType] === condition.condition;
}

export function canUnlockContent(
  bundle: UnitContentBundle,
  targetId: string,
  state: LearnerUnlockState,
): boolean {
  const rule = bundle.unlockRules.find((candidate) => candidate.targetId === targetId);
  if (!rule) return false;

  return rule.all.every((condition) => conditionPasses(condition, state));
}
