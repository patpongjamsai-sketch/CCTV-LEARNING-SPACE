import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../../../lib/supabase/admin';
import {
  getStudentScores,
  getAllScores,
  recordExternalScore,
  dispatchScoreWebhook,
} from '../../../../server/services/externalScoreService';

export async function GET(request: NextRequest) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const supabase = createAdminSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, student_code, display_name')
      .eq('id', authContext.userId)
      .maybeSingle();

    const isStaff = profile?.role === 'teacher' || profile?.role === 'admin';
    const userStudentCode = profile?.student_code || authContext.userId;

    const { searchParams } = new URL(request.url);
    const requestedStudentCode = searchParams.get('student_code');

    // Students can only access their own scores
    if (!isStaff) {
      if (requestedStudentCode && requestedStudentCode !== userStudentCode) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access scores of another student' },
          { status: 403 },
        );
      }

      const scores = getStudentScores(userStudentCode);
      return NextResponse.json({
        student_code: userStudentCode,
        total_records: scores.length,
        scores,
      });
    }

    // Staff can query by student_code or list all
    if (requestedStudentCode) {
      const scores = getStudentScores(requestedStudentCode);
      return NextResponse.json({
        student_code: requestedStudentCode,
        total_records: scores.length,
        scores,
      });
    }

    const all = getAllScores();
    return NextResponse.json({
      total_records: all.length,
      scores: all,
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const supabase = createAdminSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, student_code, display_name')
      .eq('id', authContext.userId)
      .maybeSingle();

    const isStaff = profile?.role === 'teacher' || profile?.role === 'admin';
    const verifiedStudentCode = profile?.student_code || authContext.userId;
    const verifiedStudentName = profile?.display_name || 'ผู้เรียน';

    const body = await request.json();
    const { student_code, room_id, unit_id, score, max_score, return_url } = body;

    if (!room_id || score === undefined) {
      return NextResponse.json(
        { error: 'room_id and score are required' },
        { status: 400 },
      );
    }

    // Students cannot impersonate other student codes
    if (!isStaff && student_code && student_code !== verifiedStudentCode) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot record score for another student' },
        { status: 403 },
      );
    }

    const finalStudentCode = isStaff && student_code ? student_code : verifiedStudentCode;
    const finalStudentName = isStaff && body.student_name ? body.student_name : verifiedStudentName;

    const record = recordExternalScore({
      studentCode: finalStudentCode,
      studentName: finalStudentName,
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
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error recording score' },
      { status: 500 },
    );
  }
}
