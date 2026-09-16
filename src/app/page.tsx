import { getVerifiedAuthContext } from '../lib/auth/claims';
import { getServerDatabase } from '../server/database/client';
import { DashboardShell, type DashboardUnit } from '../components/portal/DashboardShell';

export default async function DashboardPage() {
  try {
    const authContext = await getVerifiedAuthContext();
    if (!authContext) {
      return <DashboardShell />;
    }

    const sql = getServerDatabase();

    const [profile] = await sql`
      select id, display_name, role, student_code
      from public.profiles
      where id = ${authContext.userId}
    `;

    if (!profile) {
      return <DashboardShell />;
    }

    const [membership] = await sql`
      select class_id, member_role
      from public.class_members
      where profile_id = ${authContext.userId} and active = true
      limit 1
    `;

    const classId = membership?.class_id;

    // Fetch units and student's progress
    const unitRows = await sql`
      select
        u.id,
        u.sequence_no,
        u.title,
        coalesce(up.passed, false) as passed,
        coalesce(up.highest_score, 0) as score,
        coalesce(up.progress_percent, 0) as progress_percent
      from public.units as u
      left join public.unit_progress as up
        on up.unit_id = u.id and up.student_id = ${authContext.userId}
      where u.status = 'published'
      order by u.sequence_no asc
    `;

    const isStaff = profile.role === 'teacher' || profile.role === 'admin';

    const units: DashboardUnit[] = [];
    let completedUnits = 0;
    let bestScore = 0;

    for (const row of unitRows) {
      if (row.passed) completedUnits += 1;
      if (row.score > bestScore) bestScore = row.score;

      let isUnlocked = isStaff;
      if (!isStaff && classId) {
        try {
          const [unlock] = await sql`
            select private.is_unit_unlocked(${authContext.userId}, ${classId}, ${row.id}) as is_unlocked
          `;
          isUnlocked = Boolean(unlock?.is_unlocked);
        } catch {
          // If progression check fails, unit 1 defaults to true for initial access
          isUnlocked = row.sequence_no === 1;
        }
      } else if (!isStaff) {
        isUnlocked = row.sequence_no === 1;
      }

      let statusLabel = 'รอเปิด';
      if (row.passed) {
        statusLabel = `ผ่านแล้ว (${row.score} คะแนน)`;
      } else if (isUnlocked) {
        statusLabel = row.sequence_no === 1 ? 'พร้อมเรียน' : 'เปิดแล้ว';
      }

      const href = row.sequence_no === 1 ? '/labs/3d/room-101' : '/courses/21909-2020';

      units.push({
        id: row.id,
        sequenceNo: row.sequence_no,
        title: row.title,
        statusLabel,
        href,
        unlocked: isUnlocked,
      });
    }

    return (
      <DashboardShell
        learner={{
          displayName: profile.display_name,
          role: profile.role,
        }}
        summary={{
          completedUnits,
          totalUnits: unitRows.length || 8,
          passedMissions: completedUnits, // in Unit 1, passing unit equals passing summative mission
          bestScore,
        }}
        units={units.length > 0 ? units : undefined}
        classId={classId}
      />
    );
  } catch {
    // If DB is unavailable during build time or prerender, fallback to default shell
    return <DashboardShell />;
  }
}
