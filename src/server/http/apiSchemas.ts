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

const answerPayloadSchema = z
  .union([z.array(z.unknown()), z.record(z.string(), z.unknown())])
  .superRefine((value, context) => {
    const serialized = JSON.stringify(value);
    if (serialized.length > 262144) {
      context.addIssue({
        code: 'custom',
        message: 'Answer payload is too large',
      });
    }
  });

export const learningSubmissionInputSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('quiz'),
      classId: z.string().uuid(),
      quizId: z.string().uuid(),
      answers: answerPayloadSchema,
      startedAt: z.string().datetime().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('lab'),
      classId: z.string().uuid(),
      unitId: z.string().uuid(),
      title: z.string().trim().min(1).max(200),
      studentNotes: z.string().trim().max(5_000).optional(),
    })
    .strict(),
]);

export const evidenceSubmissionIdSchema = z.string().uuid();

export const evidenceMetadataSchema = z
  .record(z.string(), z.unknown())
  .superRefine((value, context) => {
    if (JSON.stringify(value).length > 16_384) {
      context.addIssue({
        code: 'custom',
        message: 'Evidence metadata is too large',
      });
    }
  });

export const teacherReviewInputSchema = z
  .object({
    status: z.enum(['reviewing', 'passed', 'revision_required']),
    approvedScore: z.number().min(0).max(100).nullable().optional(),
    feedback: z.string().trim().max(5_000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.status === 'passed' && (value.approvedScore === null || value.approvedScore === undefined)) {
      context.addIssue({
        code: 'custom',
        path: ['approvedScore'],
        message: 'A passed LAB requires an approved score',
      });
    }

    if (value.status === 'reviewing' && value.approvedScore !== undefined && value.approvedScore !== null) {
      context.addIssue({
        code: 'custom',
        path: ['approvedScore'],
        message: 'A reviewing LAB cannot receive an approved score',
      });
    }
  });

export const studentProgressPathSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
  unitId: z.string().uuid(),
});
