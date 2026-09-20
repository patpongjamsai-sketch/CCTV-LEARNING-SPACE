import 'server-only';

import { canSubmitForStudent } from '../auth/authorizationRules';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { evaluateRoomSubmission } from '../game/evaluateRoomSubmission';
import {
  gameEventsInputSchema,
  gameFinalizeInputSchema,
  gameSessionInputSchema,
} from '../http/apiSchemas';

export type GameSessionRecord = {
  id: string;
  roomId: string;
  classId: string;
  studentId: string;
  clientSessionId: string;
  status: string;
  startedAt: string;
};

export type GameFinalizeResult = {
  attemptId: string;
  approvedScore: number;
  passed: boolean;
  missionScores: Record<'M1' | 'M2' | 'M3' | 'M4' | 'M5', number>;
  mandatoryChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    clientLiveViewActive: boolean;
  };
};

/**
 * Creates a new game session after validating student enrollment and unlock progression.
 */
export async function createGameSessionService(
  actorId: string,
  rawInput: unknown,
): Promise<GameSessionRecord> {
  const input = gameSessionInputSchema.parse(rawInput);

  return withTrustedTransaction(async (tx) => {
    // 1. Verify student membership and unlock status
    const [membership] = await tx`
      select private.is_class_student(${input.classId}, ${actorId}) as is_student
    `;

    if (!membership?.is_student) {
      throw new Error('Forbidden: student is not enrolled in this class');
    }

    const [roomInfo] = await tx`
      select gr.id, gr.unit_id, gr.status as room_status, c.status as class_status
      from public.game_rooms as gr
      join public.units as u on u.id = gr.unit_id
      join public.classes as c on c.id = ${input.classId} and c.course_id = u.course_id
      where gr.id = ${input.roomId}
        and gr.status = 'published'
        and c.status in ('planned', 'active')
    `;

    if (!roomInfo) {
      throw new Error('Not found: game room or active class not available');
    }

    const [unlockInfo] = await tx`
      select private.is_unit_unlocked(${actorId}, ${input.classId}, ${roomInfo.unit_id}) as is_unlocked
    `;

    if (!unlockInfo?.is_unlocked) {
      throw new Error('Forbidden: unit is locked for this student');
    }

    // 2. Insert game session
    const [session] = await tx`
      insert into public.game_sessions (
        room_id, class_id, student_id, client_session_id, status
      ) values (
        ${input.roomId}, ${input.classId}, ${actorId}, ${input.clientSessionId}, 'active'
      )
      returning id, room_id, class_id, student_id, client_session_id, status, started_at
    `;

    if (!session) {
      throw new Error('Failed to create game session');
    }

    return {
      id: session.id,
      roomId: session.room_id,
      classId: session.class_id,
      studentId: session.student_id,
      clientSessionId: session.client_session_id,
      status: session.status,
      startedAt: session.started_at,
    };
  });
}

/**
 * Appends contiguous telemetry events to an active session.
 */
export async function appendGameEventsService(
  actorId: string,
  sessionId: string,
  rawInput: unknown,
): Promise<{ recordedCount: number }> {
  const input = gameEventsInputSchema.parse(rawInput);
  const sql = getServerDatabase();

  const [session] = await sql`
    select id, student_id, status
    from public.game_sessions
    where id = ${sessionId}
  `;

  if (!session || session.status !== 'active') {
    throw new Error('Not found: active game session not found');
  }

  if (!canSubmitForStudent(actorId, session.student_id)) {
    throw new Error('Forbidden: cannot record events for another student');
  }

  for (const event of input.events) {
    await sql`
      insert into public.game_events (
        session_id, client_event_id, sequence_no, event_type, payload, client_occurred_at
      ) values (
        ${sessionId},
        ${event.clientEventId},
        ${event.sequenceNo},
        ${event.eventType},
        ${sql.json(event.payload as any)},
        ${event.clientOccurredAt}
      )
      on conflict (session_id, client_event_id) do nothing
    `;
  }

  return { recordedCount: input.events.length };
}

/**
 * Evaluates raw answers server-side, validates contiguous telemetry events,
 * and calls trusted stored procedures to finalize attempt and progress.
 */
export async function finalizeGameSessionService(
  actorId: string,
  sessionId: string,
  rawInput: unknown,
): Promise<GameFinalizeResult> {
  const input = gameFinalizeInputSchema.parse(rawInput);
  const sql = getServerDatabase();

  const [session] = await sql`
    select gs.id, gs.student_id, gs.class_id, gs.room_id, gs.status, gr.unit_id, u.content_version
    from public.game_sessions as gs
    join public.game_rooms as gr on gr.id = gs.room_id
    join public.units as u on u.id = gr.unit_id
    where gs.id = ${sessionId}
  `;

  if (!session) {
    throw new Error('Not found: game session not found');
  }

  if (!canSubmitForStudent(actorId, session.student_id)) {
    throw new Error('Forbidden: cannot finalize session for another student');
  }

  // 1. Server-authoritative score calculation (ignoring any client score)
  const evaluation = evaluateRoomSubmission(session.unit_id, input.answerState);
  const hintsUsed = typeof (input.answerState as { totalHintsUsed?: unknown })?.totalHintsUsed === 'number'
    ? (input.answerState as { totalHintsUsed: number }).totalHintsUsed
    : 0;

  // 2. Trusted transaction
  return withTrustedTransaction(async (tx) => {
    const [attempt] = await tx`
      select private.finalize_game_attempt(
        ${sessionId},
        ${input.missionId},
        ${evaluation.totalScore},
        ${input.firstEventSequence},
        ${input.lastEventSequence},
        ${'cctv-server-v1'},
        ${actorId},
        ${hintsUsed},
        ${tx.json(evaluation.resultDetails as any)}
      ) as attempt_id
    `;

    if (!attempt?.attempt_id) {
      throw new Error('Failed to finalize attempt');
    }

    if (evaluation.isPassed) {
      await tx`
        select private.upsert_unit_progress(
          ${actorId},
          ${session.class_id},
          ${session.unit_id},
          ${evaluation.totalScore},
          ${true},
          ${0},
          ${session.content_version},
          ${1},
          ${actorId}
        )
      `;
    }

    await tx`
      update public.game_sessions
      set status = 'completed',
          completed_at = now()
      where id = ${sessionId}
    `;

    return {
      attemptId: attempt.attempt_id,
      approvedScore: evaluation.totalScore,
      passed: evaluation.isPassed,
      missionScores: evaluation.missionScores,
      mandatoryChecks: evaluation.mandatoryChecks,
    };
  });
}
