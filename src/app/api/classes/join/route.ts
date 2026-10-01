import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { requireVerifiedAuthContext, UnauthenticatedError } from '../../../../lib/auth/claims';
import { joinClassService } from '../../../../server/services/classService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authContext = await requireVerifiedAuthContext();
    const body = await request.json().catch(() => ({}));

    const result = await joinClassService(authContext.userId, body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนเลือกกลุ่มเรียน' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message || 'ข้อมูลการลงทะเบียนไม่ถูกต้อง';
      return NextResponse.json({ error: firstIssue, details: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียนเข้ากลุ่มเรียน' }, { status: 500 });
  }
}
