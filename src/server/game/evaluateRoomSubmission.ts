import { evaluateUnit1Submission, type Unit1Submission } from './evaluateUnit1Submission';
import { evaluateUnit2Submission } from './evaluateUnit2Submission';
import { evaluateUnit3Submission } from './evaluateUnit3Submission';
import { evaluateUnit4Submission } from './evaluateUnit4Submission';
import { evaluateUnit5Submission } from './evaluateUnit5Submission';
import { evaluateUnit6Submission } from './evaluateUnit6Submission';
import { evaluateUnit7Submission } from './evaluateUnit7Submission';
import { evaluateUnit8Submission } from './evaluateUnit8Submission';
import type { CommonUnitEvaluation } from '../../shared/domain/workstationTypes';

export function evaluateRoomSubmission(
  unitIdOrRoomId: string,
  rawAnswerState: unknown,
): CommonUnitEvaluation {
  // Normalize unit number / room number
  const cleanId = unitIdOrRoomId.toLowerCase();
  const roomNumMatch = cleanId.match(/(?:room-?|u0?)(\d+)/i);
  let roomNum = roomNumMatch && roomNumMatch[1] ? parseInt(roomNumMatch[1], 10) : 101;
  if (roomNum < 10) {
    roomNum += 100; // U01 -> 101, U02 -> 102
  }

  switch (roomNum) {
    case 101: {
      const u1 = evaluateUnit1Submission(rawAnswerState as Unit1Submission);
      return {
        totalScore: u1.totalScore,
        isPassed: u1.isPassed,
        missionScores: u1.missionScores,
        mandatoryChecks: u1.mandatoryChecks,
        resultDetails: u1.resultDetails,
      };
    }
    case 102:
      return evaluateUnit2Submission(rawAnswerState);
    case 103:
      return evaluateUnit3Submission(rawAnswerState);
    case 104:
      return evaluateUnit4Submission(rawAnswerState);
    case 105:
      return evaluateUnit5Submission(rawAnswerState);
    case 106:
      return evaluateUnit6Submission(rawAnswerState);
    case 107:
      return evaluateUnit7Submission(rawAnswerState);
    case 108:
      return evaluateUnit8Submission(rawAnswerState);
    default:
      return evaluateUnit1Submission(rawAnswerState as Unit1Submission);
  }
}
