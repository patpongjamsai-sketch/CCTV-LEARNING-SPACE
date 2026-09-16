import { z } from 'zod';

export const gameSessionInputSchema = z.object({
  roomId: z.string().uuid(),
  classId: z.string().uuid(),
  clientSessionId: z.string().uuid(),
}).strip();

export const gameFinalizeInputSchema = z.object({
  missionId: z.string().uuid(),
  firstEventSequence: z.number().int().min(1),
  lastEventSequence: z.number().int().min(1),
  answerState: z.record(z.string(), z.unknown()).default({}),
}).strip();

export const gameEventsInputSchema = z.object({
  events: z.array(
    z.object({
      clientEventId: z.string().uuid(),
      sequenceNo: z.number().int().min(1),
      eventType: z.string().min(1),
      payload: z.record(z.string(), z.unknown()).default({}),
      clientOccurredAt: z.string().datetime(),
    }),
  ).min(1),
});

export const progressOverrideInputSchema = z.object({
  progressPercent: z.number().min(0).max(100),
  passed: z.boolean(),
  reason: z.string().trim().min(3),
});
