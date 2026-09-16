import { getVerifiedAuthContext } from '../lib/auth/claims';
import { createAdminSupabaseClient } from '../lib/supabase/admin';
import { DashboardShell, type DashboardUnit } from '../components/portal/DashboardShell';

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

    // Fetch units and student's progress
    const { data: unitRows } = await supabase
      .from('units')
      .select('id, sequence_no, title')
      .eq('status', 'published')
      .order('sequence_no', { ascending: true });

    const { data: progressRows } = await supabase
      .from('unit_progress')
      .select('unit_id, highest_score, passed, progress_percent')
      .eq('student_id', authContext.userId);

    const progressMap = new Map((progressRows || []).map((p: any) => [p.unit_id, p]));

    const units: DashboardUnit[] = [];
    let completedUnits = 0;
    let bestScore = 0;

    for (const u of unitRows || []) {
      const prog = progressMap.get(u.id);
      const passed = Boolean(prog?.passed);
      const score = Number(prog?.highest_score || 0);

      if (passed) completedUnits += 1;
      if (score > bestScore) bestScore = score;

      const isUnlocked = isStaff || u.sequence_no === 1 || passed;

      let statusLabel = 'รอเปิด';
      if (passed) {
        statusLabel = `ผ่านแล้ว (${score} คะแนน)`;
      } else if (isUnlocked) {
        statusLabel = u.sequence_no === 1 ? 'พร้อมเรียน' : 'เปิดแล้ว';
      }

      const href = u.sequence_no === 1 ? '/labs/3d/room-101' : '/courses/21909-2020';

      units.push({
        id: u.id,
        sequenceNo: u.sequence_no,
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
          totalUnits: (unitRows || []).length || 8,
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
