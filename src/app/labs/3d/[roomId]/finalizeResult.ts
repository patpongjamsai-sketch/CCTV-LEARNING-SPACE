import type { Unit1Evaluation } from '../../../../server/game/evaluateUnit1Submission';

export type FinalizeResponse = {
  attemptId: string;
  approvedScore: number;
  passed: boolean;
  missionScores: Unit1Evaluation['missionScores'];
  mandatoryChecks: Unit1Evaluation['mandatoryChecks'];
};

// แปลงชื่อผลประเมินภายใน Server ให้ตรงกับรูปแบบ Response ที่ Modal และ API ใช้ร่วมกัน
export type EvaluationSummary = Pick<Unit1Evaluation, 'totalScore' | 'isPassed' | 'missionScores' | 'mandatoryChecks'>;

export function toFinalizeResponse(attemptId: string, evaluation: EvaluationSummary): FinalizeResponse {
  return {
    attemptId,
    approvedScore: evaluation.totalScore,
    passed: evaluation.isPassed,
    missionScores: evaluation.missionScores,
    mandatoryChecks: evaluation.mandatoryChecks,
  };
}
