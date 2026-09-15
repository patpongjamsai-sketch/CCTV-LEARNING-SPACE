import { equipmentById } from '../data/equipment';
import { floor1Mission101, missionById } from '../data/missions';
import { questionById } from '../data/questions';
import type { ScoreBreakdown } from '../data/types';
import { GameStore } from './GameState';
import { addInventoryItem, removeInventoryItem } from './InventoryState';
import { calculateMissionScore, hasCompletedMissionCoreObjectives } from './ScoreSystem';

export interface EvaluationResult {
  passed: boolean;
  breakdown: ScoreBreakdown;
  missingCore: boolean;
}

export class MissionEngine {
  constructor(private readonly store: GameStore, private readonly now = () => Date.now()) {}

  start(missionId = this.store.snapshot.currentMission): boolean {
    const definition = missionById.get(missionId);
    if (!definition || !this.store.snapshot.unlockedRooms.includes(definition.room)) return false;
    let started = false;
    this.store.update((state) => {
      const switchingMission = state.currentMission !== missionId;
      state.currentMission = missionId;
      state.missionResults[missionId] ??= {
        status: 'not-started', score: 0, bestScore: 0, attemptCount: 0,
        completionTime: 0, completedAt: null,
      };
      const result = state.missionResults[missionId];
      if (!result) return;
      if (result.status === 'not-started') result.status = 'active';
      if (switchingMission || !state.missionStartedAt) state.missionStartedAt = this.now();
      started = true;
    });
    return started;
  }

  inspectEquipment(equipmentId: string): void {
    if (!equipmentById.has(equipmentId)) return;
    const prefix = this.store.snapshot.currentMission === 'F1-M102' ? 'inspect:r102:' : 'inspect:';
    this.completeObjective(`${prefix}${equipmentId}`);
  }

  pickupEquipment(equipmentId: string): boolean {
    const equipment = equipmentById.get(equipmentId);
    if (!equipment?.pickupable || this.store.snapshot.inventory[equipmentId]) return false;
    this.store.update((state) => {
      addInventoryItem(state, equipment, 1);
      state.equipmentChanged += 1;
      addUnique(state.completedObjectives, `pickup:${equipmentId}`);
    });
    return true;
  }

  placeEquipment(equipmentId: string, targetId: string): boolean {
    if (!this.store.snapshot.inventory[equipmentId]) return false;
    let placed = false;
    this.store.update((state) => {
      placed = removeInventoryItem(state, equipmentId, 1);
      if (!placed) return;
      state.equipmentChanged += 1;
      addUnique(state.completedObjectives, `place:${equipmentId}:${targetId}`);
    });
    return placed;
  }

  answerQuestion(questionId: string, selected: number): { correct: boolean; explanation: string } | null {
    const question = questionById.get(questionId);
    if (!question || !question.choices[selected]) return null;
    const correct = selected === question.answer;
    this.store.update((state) => {
      const previous = state.answers[questionId];
      state.answers[questionId] = { selected, correct, attempts: (previous?.attempts ?? 0) + 1 };
      if (!correct) state.wrongSelections += 1;
      if (correct) {
        addUnique(state.completedObjectives, `answer:${questionId}`);
        if (questionId === 'q_budget') state.budgetUsed = 8550;
      }
    });
    return { correct, explanation: question.explanation };
  }

  useHint(questionId: string): string | null {
    const question = questionById.get(questionId);
    if (!question) return null;
    this.store.update((state) => {
      if (state.usedHints.includes(questionId)) return;
      state.usedHints.push(questionId);
      state.hintsUsed += 1;
    });
    return question.hint;
  }

  recordAction(objectiveId: string): boolean {
    const mission = missionById.get(this.store.snapshot.currentMission);
    if (!mission?.objectives.some((objective) => objective.id === objectiveId)) return false;
    this.completeObjective(objectiveId);
    return true;
  }

  evaluate(): EvaluationResult {
    const missionId = this.store.snapshot.currentMission;
    const definition = missionById.get(missionId) ?? floor1Mission101;
    const breakdown = calculateMissionScore(this.store.snapshot, missionId);
    const missingCore = !hasCompletedMissionCoreObjectives(this.store.snapshot, missionId);
    const passed = !missingCore && breakdown.total >= definition.passScore;

    this.store.update((state) => {
      const result = state.missionResults[missionId];
      if (!result) return;
      result.attemptCount += 1;
      state.attemptCount = result.attemptCount;
      result.score = breakdown.total;
      result.bestScore = Math.max(result.bestScore, breakdown.total);
      if (!passed) return;
      result.status = 'completed';
      result.completedAt ??= new Date(this.now()).toISOString();
      if (state.missionStartedAt) result.completionTime = Math.max(1, Math.round((this.now() - state.missionStartedAt) / 1000));
      state.completionTime = result.completionTime;
      if (definition.nextMission) addUniqueNumber(state.unlockedRooms, definition.room + 1);
    });
    return { passed, breakdown, missingCore };
  }

  getScore(): ScoreBreakdown {
    return calculateMissionScore(this.store.snapshot, this.store.snapshot.currentMission);
  }

  private completeObjective(id: string): void {
    this.store.update((state) => addUnique(state.completedObjectives, id));
  }
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function addUniqueNumber(values: number[], value: number): void {
  if (!values.includes(value)) values.push(value);
}
