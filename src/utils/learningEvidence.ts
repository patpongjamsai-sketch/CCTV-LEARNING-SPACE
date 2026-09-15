import { RubricEvaluation } from '../shared/domain';
import { LESSON_META } from '../data/unit1RoleplayContent';

export interface LearningEvidenceRecord {
  traineeId: string;
  traineeName: string;
  courseCode: string;
  courseName: string;
  unitNumber: number;
  unitTitle: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  attemptsCount: number;
  hintsUsedCount: number;
  mistakesCount: number;
  rubric: RubricEvaluation;
  verificationHash: string;
  logEntries: string[];
}

export function generateSimpleVerificationHash(
  traineeName: string,
  totalScore: number,
  timestamp: string
): string {
  const raw = `${traineeName}_${totalScore}_${timestamp}_CCTV_U1_PASS`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `CERT-21909-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function createLearningEvidence(
  traineeName: string,
  startTime: number,
  endTime: number,
  attempts: number,
  hints: number,
  mistakes: number,
  rubric: RubricEvaluation,
  logEntries: string[]
): LearningEvidenceRecord {
  const completedAt = new Date(endTime).toISOString();
  const startedAt = new Date(startTime).toISOString();
  const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const verificationHash = generateSimpleVerificationHash(traineeName, rubric.totalScore, completedAt);

  return {
    traineeId: 'STD-2567-VEC',
    traineeName: traineeName || 'นักเรียนช่างฝึกหัด CCTV',
    courseCode: LESSON_META.courseCode,
    courseName: LESSON_META.courseNameTh,
    unitNumber: LESSON_META.unitNumber,
    unitTitle: LESSON_META.unitTitleTh,
    startedAt,
    completedAt,
    durationSeconds,
    attemptsCount: attempts,
    hintsUsedCount: hints,
    mistakesCount: mistakes,
    rubric,
    verificationHash,
    logEntries,
  };
}
