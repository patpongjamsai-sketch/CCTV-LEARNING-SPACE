import crypto from 'crypto';

export type ExternalScoreRecord = {
  id: string;
  studentCode: string;
  studentName: string;
  roomId: string;
  unitId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: string;
  returnUrl?: string | null;
  signature: string;
};

// In-memory score store for preview/standalone operation
const scoreMemoryStore = new Map<string, ExternalScoreRecord[]>();

const DEFAULT_SECRET = process.env.EXTERNAL_INTEGRATION_SECRET || 'cctv-learning-ecosystem-2026-secret-key';

export function generateScoreSignature(
  data: { studentCode: string; roomId: string; score: number; completedAt: string },
  secret = DEFAULT_SECRET,
): string {
  const message = `${data.studentCode}|${data.roomId}|${data.score}|${data.completedAt}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export function recordExternalScore(record: {
  studentCode: string;
  studentName: string;
  roomId: string;
  unitId: string;
  score: number;
  maxScore?: number;
  passed?: boolean;
  returnUrl?: string | null;
}): ExternalScoreRecord {
  const completedAt = new Date().toISOString();
  const maxScore = record.maxScore ?? 100;
  const passed = record.passed ?? record.score >= 70;

  const signature = generateScoreSignature({
    studentCode: record.studentCode,
    roomId: record.roomId,
    score: record.score,
    completedAt,
  });

  const entry: ExternalScoreRecord = {
    id: crypto.randomUUID(),
    studentCode: record.studentCode,
    studentName: record.studentName,
    roomId: record.roomId,
    unitId: record.unitId,
    score: record.score,
    maxScore,
    passed,
    completedAt,
    returnUrl: record.returnUrl,
    signature,
  };

  const existing = scoreMemoryStore.get(record.studentCode) || [];
  scoreMemoryStore.set(record.studentCode, [...existing, entry]);

  return entry;
}

export function getStudentScores(studentCode: string): ExternalScoreRecord[] {
  return scoreMemoryStore.get(studentCode) || [];
}

export function getAllScores(): ExternalScoreRecord[] {
  return Array.from(scoreMemoryStore.values()).flat();
}

export async function dispatchScoreWebhook(
  returnUrl: string,
  payload: ExternalScoreRecord,
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(returnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CCTV-Signature': payload.signature,
      },
      body: JSON.stringify(payload),
    });

    return {
      success: res.ok,
      status: res.status,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown webhook error',
    };
  }
}
