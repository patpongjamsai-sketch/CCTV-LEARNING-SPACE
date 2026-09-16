import type { CableConnection, ConceptId, DeviceId } from '../../shared/domain/roleplayTypes';

type SubmissionSource = {
  mission1Slots: ReadonlyArray<{ currentPlacedItem?: { conceptId?: ConceptId } }>;
  mission2Slots: ReadonlyArray<{ currentPlacedItem?: { conceptId?: ConceptId } }>;
  mission3Matches: Partial<Record<DeviceId, ConceptId>>;
  mission4Cards: { analogCards: ConceptId[]; ipCards: ConceptId[] };
  placedDevices: Partial<Record<DeviceId, boolean>>;
  poweredDevices: Partial<Record<DeviceId, boolean>>;
  connections: CableConnection[];
  totalHintsUsed: number;
};

export function createUnit1Submission(source: SubmissionSource) {
  return {
    // ส่งเฉพาะคำตอบดิบ Backend จะเทียบกับเฉลยกลางอีกครั้ง
    mission1Answers: source.mission1Slots.map((slot) => slot.currentPlacedItem?.conceptId ?? null),
    mission2Answers: source.mission2Slots.map((slot) => slot.currentPlacedItem?.conceptId ?? null),
    mission3Matches: { ...source.mission3Matches },
    mission4Cards: {
      analogCards: [...source.mission4Cards.analogCards],
      ipCards: [...source.mission4Cards.ipCards],
    },
    placedDevices: { ...source.placedDevices },
    poweredDevices: { ...source.poweredDevices },
    connections: source.connections.map((connection) => ({ ...connection })),
    totalHintsUsed: source.totalHintsUsed,
  };
}
