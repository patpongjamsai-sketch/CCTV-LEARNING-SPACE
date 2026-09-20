import { getVerifiedAuthContext } from '../lib/auth/claims';
import { createAdminSupabaseClient } from '../lib/supabase/admin';
import { DashboardShell, type DashboardUnit } from '../components/portal/DashboardShell';
import { getStudentProgressOverviewService } from '../server/services/progressionService';

export default async function DashboardPage() {
  try {
    const authContext = await getVerifiedAuthContext();
    if (!authContext) {
      return <DashboardShell />;
    }

    const supabase = createAdminSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, role, student_code')
      .eq('id', authContext.userId)
      .single();

    if (!profile) {
      return <DashboardShell />;
    }

    const { data: membership } = await supabase
      .from('class_members')
      .select('class_id, member_role')
      .eq('profile_id', authContext.userId)
      .eq('active', true)
      .maybeSingle();

    const classId = membership?.class_id;
    const isStaff = profile.role === 'teacher' || profile.role === 'admin';

    // Progress and unlock state come from the server progression predicate.
    const overview = classId && !isStaff
      ? await getStudentProgressOverviewService(authContext.userId, classId)
      : null;

    const units: DashboardUnit[] = [];
    let completedUnits = 0;
    let bestScore = 0;

    for (const u of overview?.units || []) {
      const passed = u.passed;
      const score = u.approvedScore ?? 0;

      if (passed) completedUnits += 1;
      if (score > bestScore) bestScore = score;

      const isUnlocked = u.unlocked;

      let statusLabel = 'รอเปิด';
      if (passed) {
        statusLabel = `ผ่านแล้ว (${score} คะแนน)`;
      } else if (isUnlocked) {
        statusLabel = u.sequenceNo === 1 ? 'พร้อมเรียน' : 'เปิดแล้ว';
      }

      const href = '/courses/21909-2020';

      units.push({
        id: u.unitId,
        sequenceNo: u.sequenceNo,
        title: u.title,
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
          totalUnits: overview?.units.length || 8,
          passedMissions: completedUnits,
          bestScore,
        }}
        units={units.length > 0 ? units : undefined}
        classId={classId}
      />
    );
  } catch (err) {
    console.error('Dashboard error:', err);
    return <DashboardShell />;
  }
}
