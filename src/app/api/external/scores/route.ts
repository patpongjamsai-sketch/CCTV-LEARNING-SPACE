import { NextRequest, NextResponse } from 'next/server';
import {
  getStudentScores,
  getAllScores,
  recordExternalScore,
  dispatchScoreWebhook,
} from '../../../../server/services/externalScoreService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentCode = searchParams.get('student_code');

  if (studentCode) {
    const scores = getStudentScores(studentCode);
    return NextResponse.json({
      student_code: studentCode,
      total_records: scores.length,
      scores,
    });
  }

  const all = getAllScores();
  return NextResponse.json({
    total_records: all.length,
    scores: all,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_code, student_name, room_id, unit_id, score, max_score, return_url } = body;

    if (!student_code || !room_id || score === undefined) {
      return NextResponse.json(
        { error: 'student_code, room_id and score are required' },
        { status: 400 },
      );
    }

    const record = recordExternalScore({
      studentCode: student_code,
      studentName: student_name || 'ผู้เรียน',
      roomId: room_id,
      unitId: unit_id || 'U01',
      score: Number(score),
      maxScore: max_score ? Number(max_score) : 100,
      returnUrl: return_url,
    });

    // If return_url is provided, attempt webhook dispatch in background
    if (return_url) {
      void dispatchScoreWebhook(return_url, record);
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error recording score' },
      { status: 500 },
    );
  }
}
