import { describe, expect, it } from 'vitest';

import {
  gameEventsInputSchema,
  gameFinalizeInputSchema,
  gameSessionInputSchema,
  progressOverrideInputSchema,
} from '../server/http/apiSchemas';

const firstId = '11111111-1111-4111-8111-111111111111';
const secondId = '22222222-2222-4222-8222-222222222222';

describe('API input boundaries', () => {
  it('never accepts a browser-selected student or score when starting/finalizing a game', () => {
    const session = gameSessionInputSchema.parse({
      roomId: firstId,
      classId: secondId,
      clientSessionId: firstId,
      studentId: 'attacker-selected-id',
    });
    const finalize = gameFinalizeInputSchema.parse({
      missionId: secondId,
      firstEventSequence: 1,
      lastEventSequence: 1,
      answerState: {},
      approvedScore: 100,
    });

    expect(session).not.toHaveProperty('studentId');
    expect(finalize).not.toHaveProperty('approvedScore');
  });

  it('requires monotonically valid event input', () => {
    const result = gameEventsInputSchema.safeParse({
      events: [{
        clientEventId: firstId,
        sequenceNo: 0,
        eventType: 'Mission Completed',
        payload: {},
        clientOccurredAt: new Date().toISOString(),
      }],
    });

    expect(result.success).toBe(false);
  });

  it('requires a meaningful reason for a teacher override', () => {
    const result = progressOverrideInputSchema.safeParse({ progressPercent: 100, passed: true, reason: '  ' });
    expect(result.success).toBe(false);
  });
});
