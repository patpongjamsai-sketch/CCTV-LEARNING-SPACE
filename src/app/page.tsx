import { redirect } from 'next/navigation';
import { getCurrentProfile } from '../lib/auth/currentProfile';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { DashboardShell, type DashboardUnit } from '../components/portal/DashboardShell';
import { getStudentProgressOverviewService } from '../server/services/progressionService';

export default async function DashboardPage() {
  let current;
  try {
    current = await getCurrentProfile();
  } catch (error) {
    console.error('Profile lookup failed:', error);
    return <ProfileUnavailable />;
  }
  if (current.status === 'unauthenticated') {
    redirect('/login?next=/');
  }
  if (current.status === 'inactive') {
    return <ProfileUnavailable />;
  }

  const profile = current.profile;

  try {
    const supabase = await createServerSupabaseClient();

    const { data: memberships, error: membershipsError } = await supabase
      .from('class_members')
      .select('class_id, member_role')
      .eq('profile_id', profile.id)
      .eq('active', true);

    if (membershipsError) throw membershipsError;

    const membership =
      memberships?.find((item) => item.member_role === 'teacher') ||
      memberships?.find((item) => item.member_role === 'student') ||
      memberships?.[0];

    const classId = membership?.class_id;
    const isStaff = profile.role === 'teacher' || profile.role === 'admin';

    // Progress and unlock state come from the server progression predicate.
    const overview = classId && !isStaff
      ? await getStudentProgressOverviewService(profile.id, classId)
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
    return <ProfileUnavailable />;
  }
}

function ProfileUnavailable() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">ไม่สามารถแสดงข้อมูลบัญชีได้</h1>
      <p>โปรดติดต่อผู้ดูแลระบบเพื่อตรวจสอบสถานะบัญชีและการเชื่อมต่อ</p>
      <a href="/auth/logout" className="text-sky-400 underline">ออกจากระบบ</a>
    </main>
  );
}
