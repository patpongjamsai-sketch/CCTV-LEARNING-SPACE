import { requiredEquipment } from '../data/equipment';
import { floor1Mission101, floor1Mission102, missionById } from '../data/missions';
import { learningQuestions } from '../data/questions';
import type { ScoreBreakdown, SerializableGameState } from '../data/types';

const room101QuestionIds = new Set(learningQuestions.filter((question) => !question.id.startsWith('q102_')).map((question) => question.id));

function correctPoints(state: Readonly<SerializableGameState>, category: string, questionIds = room101QuestionIds): number {
  return learningQuestions
    .filter((question) => questionIds.has(question.id) && question.category === category && state.answers[question.id]?.correct)
    .reduce((total, question) => total + question.points, 0);
}

export function hasCompletedCoreObjectives(state: Readonly<SerializableGameState>): boolean {
  const completed = new Set(state.completedObjectives);
  return requiredEquipment.every((item) => completed.has(`inspect:${item.id}`))
    && completed.has('pickup:ip_camera_4mp')
    && completed.has('place:ip_camera_4mp:inspection_pad');
}

export function calculateScore(state: Readonly<SerializableGameState>): ScoreBreakdown {
  const completed = new Set(state.completedObjectives);
  const inspected = requiredEquipment.filter((item) => completed.has(`inspect:${item.id}`)).length;
  const knowledge = Math.min(20, correctPoints(state, 'knowledge'));
  const equipmentSelection = Math.min(25, inspected * 2 + correctPoints(state, 'selection'));
  const connection = Math.min(25, correctPoints(state, 'connection'));

  const faultRecord = state.answers.q_fault;
  let problemSolving = 0;
  if (faultRecord?.correct) {
    const retryPenalty = Math.max(0, faultRecord.attempts - 1) * 5;
    const hintPenalty = state.usedHints.includes('q_fault') ? 5 : 0;
    problemSolving = Math.max(0, 15 - retryPenalty - hintPenalty);
  }

  const budgetManagement = Math.min(10, correctPoints(state, 'budget'));
  const completion = hasCompletedCoreObjectives(state) ? 5 : 0;
  const total = knowledge + equipmentSelection + connection + problemSolving + budgetManagement + completion;
  return { knowledge, equipmentSelection, connection, problemSolving, budgetManagement, completion, total };
}

export function hasCompletedMissionCoreObjectives(state: Readonly<SerializableGameState>, missionId: string): boolean {
  if (missionId === floor1Mission101.id) return hasCompletedCoreObjectives(state);
  const mission = missionById.get(missionId);
  if (!mission) return false;
  return mission.objectives
    .filter((objective) => objective.required)
    .every((objective) => state.completedObjectives.includes(objective.id));
}

export function calculateMissionScore(state: Readonly<SerializableGameState>, missionId: string): ScoreBreakdown {
  if (missionId !== floor1Mission102.id) return calculateScore(state);
  const ids = new Set(floor1Mission102.objectives.map((objective) => objective.questionId).filter(Boolean));
  const points = (category: string): number => learningQuestions
    .filter((question) => ids.has(question.id) && question.category === category && state.answers[question.id]?.correct)
    .reduce((total, question) => total + question.points, 0);
  const coverage = state.answers.q102_coverage;
  const problemSolving = coverage?.correct
    ? Math.max(0, 15 - Math.max(0, coverage.attempts - 1) * 5 - (state.usedHints.includes('q102_coverage') ? 5 : 0))
    : 0;
  const knowledge = Math.min(20, points('knowledge'));
  const equipmentSelection = Math.min(30, points('selection'));
  const connection = Math.min(30, points('connection'));
  const budgetManagement = 0;
  const completion = hasCompletedMissionCoreObjectives(state, missionId) ? 5 : 0;
  const total = knowledge + equipmentSelection + connection + problemSolving + completion;
  return { knowledge, equipmentSelection, connection, problemSolving, budgetManagement, completion, total };
}
