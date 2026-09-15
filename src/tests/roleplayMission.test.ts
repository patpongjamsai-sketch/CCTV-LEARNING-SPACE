import { describe, it, expect } from 'vitest';
import {
  validateCardDrop,
  checkMission1Complete,
  checkMission2Complete,
  checkMission3Matches,
  checkMission4AnalogVsIp,
  evaluateFullRubric,
} from '../shared/domain/missionRules';
import { PlacedCardSlot } from '../shared/domain/roleplayTypes';
import { KNOWLEDGE_CARDS, INITIAL_MISSION_1_SLOTS } from '../data/unit1RoleplayContent';

describe('Unit 1 Roleplay Mission Rules', () => {
  describe('Mission 1: Digital Video Pipeline', () => {
    it('validates correct card in correct slot', () => {
      const slots: PlacedCardSlot[] = INITIAL_MISSION_1_SLOTS.map((s) => ({ ...s }));
      const result = validateCardDrop(slots[0]!, KNOWLEDGE_CARDS.M1_LENS!, slots);
      expect(result.isCorrect).toBe(true);
      expect(result.status).toBe('CORRECT');
    });

    it('rejects wrong card order with WRONG_ORDER status and hint', () => {
      const slots: PlacedCardSlot[] = INITIAL_MISSION_1_SLOTS.map((s) => ({ ...s }));
      // Placing LAN card in slot 0 (Lens)
      const result = validateCardDrop(slots[0]!, KNOWLEDGE_CARDS.M1_LAN!, slots);
      expect(result.isCorrect).toBe(false);
      expect(result.status).toBe('WRONG_ORDER');
    });

    it('rejects invalid item types', () => {
      const slots: PlacedCardSlot[] = INITIAL_MISSION_1_SLOTS.map((s) => ({ ...s }));
      const devItem = {
        id: 'DEV_TEST',
        type: 'DEVICE' as const,
        nameTh: 'กล้อง',
        nameEn: 'Cam',
        description: 'test',
        icon: '📷',
        quantity: 1,
        weight: 'LIGHT' as const,
        sourceZone: 'ZONE_B' as const,
      };
      const result = validateCardDrop(slots[0]!, devItem, slots);
      expect(result.isCorrect).toBe(false);
      expect(result.status).toBe('WRONG_TYPE');
    });

    it('awards 15 points only when all 4 pipeline stages are sequenced', () => {
      const slots: PlacedCardSlot[] = [
        { slotIndex: 0, labelTh: '1', acceptedConceptId: 'LENS_GATHER_LIGHT', currentPlacedItem: KNOWLEDGE_CARDS.M1_LENS, status: 'CORRECT' },
        { slotIndex: 1, labelTh: '2', acceptedConceptId: 'SENSOR_CONVERT_SIGNAL', currentPlacedItem: KNOWLEDGE_CARDS.M1_SENSOR, status: 'CORRECT' },
        { slotIndex: 2, labelTh: '3', acceptedConceptId: 'PROCESSOR_COMPRESS_VIDEO', currentPlacedItem: KNOWLEDGE_CARDS.M1_PROCESSOR, status: 'CORRECT' },
        { slotIndex: 3, labelTh: '4', acceptedConceptId: 'LAN_SEND_PACKET', currentPlacedItem: KNOWLEDGE_CARDS.M1_LAN, status: 'CORRECT' },
      ];
      const completion = checkMission1Complete(slots);
      expect(completion.isComplete).toBe(true);
      expect(completion.score).toBe(15);
    });
  });

  describe('Mission 2: Data Flow Path', () => {
    it('awards 20 points when Camera -> Switch -> NVR -> Client PC are ordered', () => {
      const slots: PlacedCardSlot[] = [
        { slotIndex: 0, labelTh: '1', acceptedConceptId: 'FLOW_CAMERA', currentPlacedItem: KNOWLEDGE_CARDS.M2_CAM, status: 'CORRECT' },
        { slotIndex: 1, labelTh: '2', acceptedConceptId: 'FLOW_POE_SWITCH', currentPlacedItem: KNOWLEDGE_CARDS.M2_POE_SW, status: 'CORRECT' },
        { slotIndex: 2, labelTh: '3', acceptedConceptId: 'FLOW_NVR', currentPlacedItem: KNOWLEDGE_CARDS.M2_NVR, status: 'CORRECT' },
        { slotIndex: 3, labelTh: '4', acceptedConceptId: 'FLOW_CLIENT_PC', currentPlacedItem: KNOWLEDGE_CARDS.M2_CLIENT, status: 'CORRECT' },
      ];
      const res = checkMission2Complete(slots);
      expect(res.isComplete).toBe(true);
      expect(res.score).toBe(20);
    });
  });

  describe('Mission 3: Device to Function Matching', () => {
    it('correctly validates matching of all 5 devices', () => {
      const matches = {
        CAMERA_BULLET: 'FUNC_CAMERA' as const,
        POE_SWITCH_8P: 'FUNC_POE_SWITCH' as const,
        NVR_8CH: 'FUNC_NVR' as const,
        ROUTER: 'FUNC_ROUTER' as const,
        CLIENT_PC: 'FUNC_CLIENT_PC' as const,
      };
      const evalRes = checkMission3Matches(matches);
      expect(evalRes.isComplete).toBe(true);
      expect(evalRes.score).toBe(15);
      expect(evalRes.correctCount).toBe(5);
    });
  });

  describe('Mission 4: Analog vs IP Comparison', () => {
    it('passes when at least 6 of 8 cards are correctly categorized', () => {
      const distribution = {
        analogCards: ['CARD_COAXIAL', 'CARD_DVR', 'CARD_ANALOG_SIGNAL'] as any,
        ipCards: ['CARD_CAT6', 'CARD_NVR', 'CARD_POE'] as any, // 6 correct, 2 missing
      };
      const res = checkMission4AnalogVsIp(distribution);
      expect(res.correctCount).toBe(6);
      expect(res.isPassed).toBe(true);
      expect(res.score).toBeGreaterThanOrEqual(11);
    });

    it('fails when less than 6 cards are correctly categorized', () => {
      const distribution = {
        analogCards: ['CARD_COAXIAL', 'CARD_CAT6'] as any, // 1 correct, 1 wrong
        ipCards: ['CARD_DVR'] as any, // wrong
      };
      const res = checkMission4AnalogVsIp(distribution);
      expect(res.isPassed).toBe(false);
      expect(res.score).toBe(0);
    });
  });

  describe('Rubric 100-Point Evaluation', () => {
    it('computes 100 points and passing when all missions and mandatory checks pass', () => {
      const missions = {
        M1: { missionId: 'M1', titleTh: '', descriptionTh: '', isUnlocked: true, isCompleted: true, score: 15, maxScore: 15, attempts: 1, hintsUsed: 0 },
        M2: { missionId: 'M2', titleTh: '', descriptionTh: '', isUnlocked: true, isCompleted: true, score: 20, maxScore: 20, attempts: 1, hintsUsed: 0 },
        M3: { missionId: 'M3', titleTh: '', descriptionTh: '', isUnlocked: true, isCompleted: true, score: 15, maxScore: 15, attempts: 1, hintsUsed: 0 },
        M4: { missionId: 'M4', titleTh: '', descriptionTh: '', isUnlocked: true, isCompleted: true, score: 15, maxScore: 15, attempts: 1, hintsUsed: 0 },
        M5: { missionId: 'M5', titleTh: '', descriptionTh: '', isUnlocked: true, isCompleted: true, score: 25, maxScore: 25, attempts: 1, hintsUsed: 0 },
      } as any;

      const topologyResult = {
        isCameraPowered: true,
        isCameraOnline: true,
        isNvrPowered: true,
        isNvrReachable: true,
        isClientPcPowered: true,
        isClientPcReachable: true,
        isMonitorPowered: true,
        isMonitorConnectedToNvr: true,
        isLiveViewActive: true,
        totalPoeWattsUsed: 7.5,
        poeBudgetWatts: 65,
        diagnosticEvents: [],
      };

      const rubric = evaluateFullRubric(missions, topologyResult, 0);
      expect(rubric.totalScore).toBe(100);
      expect(rubric.isPassed).toBe(true);
      expect(rubric.mandatoryChecks.cameraOnline).toBe(true);
      expect(rubric.mandatoryChecks.clientLiveViewActive).toBe(true);
    });
  });
});
