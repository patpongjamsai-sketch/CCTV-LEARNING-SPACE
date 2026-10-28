import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile } from '../../../../lib/auth/currentProfile';
import { getServerDatabase } from '../../../../server/database/client';
import { PV_CLASSES, getPvClassByCode, getPvClassById } from '../../../../lib/classes/classGroups';

function resolveTargetClassIds(classId?: string | null): string[] {
  if (!classId || classId === 'ALL' || classId === 'all') {
    return PV_CLASSES.map((c) => c.id);
  }
  const pvByCode = getPvClassByCode(classId);
  if (pvByCode) return [pvByCode.id];
  const pvById = getPvClassById(classId);
  if (pvById) return [pvById.id];
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
    return [classId];
  }
  return PV_CLASSES.map((c) => c.id);
}

function parseUnitSeq(unitId?: string | number): number {
  if (typeof unitId === 'number') return Math.max(1, Math.min(8, unitId));
  if (typeof unitId === 'string') {
    const num = parseInt(unitId.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 8) return num;
  }
  return 1;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentProfile();
    if (user.status !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classIdParam = searchParams.get('classId');
    const targetClassIds = resolveTargetClassIds(classIdParam);

    const sql = getServerDatabase();
    const rows = await sql`
      select class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed
      from public.class_approvals
      where class_id = any(${targetClassIds})
      order by unit_sequence asc
    `;

    const unlockedUnits: Record<string, boolean> = {
      U01: true,
      U02: false,
      U03: false,
      U04: false,
      U05: false,
      U06: false,
      U07: false,
      U08: false,
    };
    const unlockedLabs: Record<string, boolean> = {
      U01: false,
      U02: false,
      U03: false,
      U04: false,
      U05: false,
      U06: false,
      U07: false,
      U08: false,
    };
    const unlockedAssessments: Record<string, boolean> = {
      U01: false,
      U02: false,
      U03: false,
      U04: false,
      U05: false,
      U06: false,
      U07: false,
      U08: false,
    };
    const passedUnits: Record<string, boolean> = {
      U01: false,
      U02: false,
      U03: false,
      U04: false,
      U05: false,
      U06: false,
      U07: false,
      U08: false,
    };

    for (const r of rows) {
      const uKey = `U${String(r.unit_sequence).padStart(2, '0')}`;
      if (r.unit_unlocked) unlockedUnits[uKey] = true;
      if (r.lab_unlocked) unlockedLabs[uKey] = true;
      if (r.assessment_unlocked) unlockedAssessments[uKey] = true;
      if (r.passed) passedUnits[uKey] = true;
    }

    return NextResponse.json({
      success: true,
      approvals: {
        unlockedUnits,
        unlockedLabs,
        unlockedAssessments,
        passedUnits,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentProfile();
    if (user.status !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.profile.role !== 'teacher' && user.profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Teachers and Admins only' }, { status: 403 });
    }

    const body = await request.json();
    const { action, classId, unitId, value } = body;
    const targetClassIds = resolveTargetClassIds(classId);
    const sql = getServerDatabase();

    if (action === 'unlock_all') {
      for (const cid of targetClassIds) {
        for (let seq = 1; seq <= 8; seq++) {
          await sql`
            insert into public.class_approvals (
              class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
            ) values (
              ${cid}, ${seq}, true, true, true, false, ${user.profile.id}, now()
            )
            on conflict (class_id, unit_sequence) do update
            set lab_unlocked = true,
                unit_unlocked = true,
                assessment_unlocked = true,
                updated_by = ${user.profile.id},
                updated_at = now()
          `;
        }
      }
      return NextResponse.json({ success: true, message: 'ปลดล็อกทุกหน่วยและห้องแล็บ 3D เรียบร้อยแล้ว' });
    }

    if (action === 'reset_strict') {
      for (const cid of targetClassIds) {
        for (let seq = 1; seq <= 8; seq++) {
          const unitOpen = seq === 1;
          await sql`
            insert into public.class_approvals (
              class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
            ) values (
              ${cid}, ${seq}, false, ${unitOpen}, false, false, ${user.profile.id}, now()
            )
            on conflict (class_id, unit_sequence) do update
            set lab_unlocked = false,
                unit_unlocked = ${unitOpen},
                assessment_unlocked = false,
                passed = false,
                updated_by = ${user.profile.id},
                updated_at = now()
          `;
        }
      }
      return NextResponse.json({ success: true, message: 'คืนค่าเกณฑ์มาตรฐานเรียบร้อยแล้ว' });
    }

    const unitSeq = parseUnitSeq(unitId);
    const boolVal = typeof value === 'boolean' ? value : true;

    for (const cid of targetClassIds) {
      if (action === 'toggle_lab') {
        await sql`
          insert into public.class_approvals (
            class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
          ) values (
            ${cid}, ${unitSeq}, ${boolVal}, true, false, false, ${user.profile.id}, now()
          )
          on conflict (class_id, unit_sequence) do update
          set lab_unlocked = ${boolVal},
              updated_by = ${user.profile.id},
              updated_at = now()
        `;
      } else if (action === 'toggle_unit') {
        await sql`
          insert into public.class_approvals (
            class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
          ) values (
            ${cid}, ${unitSeq}, false, ${boolVal}, false, false, ${user.profile.id}, now()
          )
          on conflict (class_id, unit_sequence) do update
          set unit_unlocked = ${boolVal},
              updated_by = ${user.profile.id},
              updated_at = now()
        `;
      } else if (action === 'toggle_assessment') {
        await sql`
          insert into public.class_approvals (
            class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
          ) values (
            ${cid}, ${unitSeq}, false, true, ${boolVal}, false, ${user.profile.id}, now()
          )
          on conflict (class_id, unit_sequence) do update
          set assessment_unlocked = ${boolVal},
              updated_by = ${user.profile.id},
              updated_at = now()
        `;
      } else if (action === 'toggle_passed') {
        await sql`
          insert into public.class_approvals (
            class_id, unit_sequence, lab_unlocked, unit_unlocked, assessment_unlocked, passed, updated_by, updated_at
          ) values (
            ${cid}, ${unitSeq}, true, true, true, ${boolVal}, ${user.profile.id}, now()
          )
          on conflict (class_id, unit_sequence) do update
          set passed = ${boolVal},
              updated_by = ${user.profile.id},
              updated_at = now()
        `;
      }
    }

    return NextResponse.json({
      success: true,
      action,
      unitSeq,
      value: boolVal,
      message: `บันทึกสิทธิ์ลงฐานข้อมูล Supabase สำเร็จ (${action}: ${boolVal})`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
