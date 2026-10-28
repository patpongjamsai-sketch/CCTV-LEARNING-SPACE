import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile } from '../../../../lib/auth/currentProfile';
import { getServerDatabase } from '../../../../server/database/client';

function parseUnitSeq(unitId?: string | number): number {
  if (typeof unitId === 'number') return Math.max(1, Math.min(8, unitId));
  if (typeof unitId === 'string') {
    const num = parseInt(unitId.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 8) return num;
  }
  return 1;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentProfile();
    const body = await request.json();
    const { unitId, questionId, answers } = body;

    const unitSeq = parseUnitSeq(unitId);
    const qId = String(questionId || `${unitId || 'U01'}-F01`);

    if (user.status !== 'authenticated') {
      return NextResponse.json({
        success: true,
        localOnly: true,
        message: 'บันทึกผลการทดสอบอัตนัยในเครื่องเรียบร้อย (ไม่ได้เข้าสู่ระบบ)',
      });
    }

    const studentId = user.profile.id;
    const sql = getServerDatabase();

    // 1. Find student's active class_id
    const membership = await sql`
      select class_id
      from public.class_members
      where profile_id = ${studentId} and active = true
      limit 1
    `;
    const classId = membership.length > 0 && membership[0] ? (membership[0].class_id as string) : null;

    // 2. Upsert into public.subjective_submissions
    await sql`
      insert into public.subjective_submissions (
        student_id, class_id, unit_sequence, question_id, answers, status, submitted_at, updated_at
      ) values (
        ${studentId}, ${classId}, ${unitSeq}, ${qId}, ${JSON.stringify(answers || {})}, 'submitted', now(), now()
      )
      on conflict (student_id, unit_sequence, question_id) do update
      set answers = ${JSON.stringify(answers || {})},
          status = 'submitted',
          updated_at = now()
    `;

    // 3. Ensure unit_progress row exists and is marked
    if (classId) {
      const unitRow = await sql`
        select id from public.units
        where sequence_no = ${unitSeq}
        limit 1
      `;
      if (unitRow.length > 0 && unitRow[0]) {
        const uId = unitRow[0].id as string;
        await sql`
          insert into public.unit_progress (
            student_id, class_id, unit_id, status, progress_percent, last_activity_at
          ) values (
            ${studentId}, ${classId}, ${uId}, 'in_progress', 50, now()
          )
          on conflict (student_id, class_id, unit_id) do update
          set last_activity_at = now(),
              progress_percent = greatest(public.unit_progress.progress_percent, 50)
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกแบบทดสอบอัตนัยวิเคราะห์ปัญหาด้วยหลักฐานสำเร็จ ปลดล็อกห้องปฏิบัติการ 3D เรียบร้อย',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
