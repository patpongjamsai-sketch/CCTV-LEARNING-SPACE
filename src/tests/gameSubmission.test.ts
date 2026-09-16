import { describe, expect, it } from 'vitest';

import { createUnit1Submission } from '../client/game/createUnit1Submission';

describe('game submission serializer', () => {
  it('exports raw answers and topology without exporting a client score', () => {
    const browserState = {
      mission1Slots: [{ currentPlacedItem: { conceptId: 'LENS_GATHER_LIGHT' } }],
      mission2Slots: [{ currentPlacedItem: { conceptId: 'FLOW_CAMERA' } }],
      mission3Matches: { CAMERA_BULLET: 'FUNC_CAMERA' },
      mission4Cards: { analogCards: ['CARD_COAXIAL'], ipCards: ['CARD_CAT6'] },
      placedDevices: { CAMERA_BULLET: true },
      poweredDevices: { CAMERA_BULLET: true },
      connections: [],
      totalHintsUsed: 1,
      rubric: { totalScore: 100 },
    };
    const submission = createUnit1Submission(
      browserState as Parameters<typeof createUnit1Submission>[0],
    );

    expect(submission.mission1Answers).toEqual(['LENS_GATHER_LIGHT']);
    expect(submission).not.toHaveProperty('rubric');
    expect(submission).not.toHaveProperty('approvedScore');
  });
});
