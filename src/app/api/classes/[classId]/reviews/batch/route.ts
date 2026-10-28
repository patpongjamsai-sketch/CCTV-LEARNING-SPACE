import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../../../lib/auth/claims';
import { reviewLabSubmissionService, reviewQuizAttemptService } from '../../../../../../server/services/teacherReviewService';

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const { classId } = await context.params;
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    let successCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (item.kind === 'lab') {
          await reviewLabSubmissionService(authContext.userId, item.id, {
            status: 'passed',
            approvedScore: 85,
            feedback: 'ผ่านเกณฑ์มาตรฐานการติดตั้งและต่อสาย มีหลักฐานครบถ้วน',
          });
          successCount++;
        } else {
          await reviewQuizAttemptService(authContext.userId, item.classId || classId, item.id, {
            status: 'approved',
            approvedScore: 18,
            feedback: 'ตอบได้ตรงประเด็นตามหลักวิชาชีพการติดตั้งกล้องวงจรปิด',
          });
          successCount++;
        }
      } catch (itemErr) {
        errors.push(`Item ${item.id}: ${itemErr instanceof Error ? itemErr.message : 'Error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      approvedCount: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
