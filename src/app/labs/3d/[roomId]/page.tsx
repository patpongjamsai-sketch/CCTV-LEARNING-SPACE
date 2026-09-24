import { redirect } from 'next/navigation';
import { getVerifiedAuthContext } from '../../../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../../../lib/supabase/admin';
import { getStudentUnitProgressService } from '../../../../server/services/progressionService';
import { LabClientContainer } from './LabClientContainer';
import { allUnitsContent } from '../../../../content/courses/21909-2020';

type LabPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams?: Promise<{
    return_url?: string;
  }>;
};

export default async function LabPage({ params, searchParams }: LabPageProps) {
  const { roomId } = await params;
  const search = searchParams ? await searchParams : {};

  // 1. Authenticate user strictly using verified Supabase session
  const authContext = await getVerifiedAuthContext();

  if (!authContext) {
    redirect(`/login?next=${encodeURIComponent(`/labs/3d/${roomId}`)}`);
  }

  const returnUrl = search.return_url || null;

  // Resolve room number and unit metadata
  const roomNum = parseInt(roomId.replace(/[^0-9]/g, ''), 10) || 101;
  const unitBundle = allUnitsContent.find((u) => u.unit.number === roomNum - 100) || allUnitsContent[0];
  const unitId = unitBundle?.unit.id || 'U01';
  const defaultTitle = `Room ${roomNum} · ${unitBundle?.unit.titleTh || 'CCTV Lab'}`;

  try {
    const supabase = createAdminSupabaseClient();

    // 2. Fetch verified user profile from database only
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, role, student_code')
      .eq('id', authContext.userId)
      .eq('active', true)
      .maybeSingle();

    // 3. Fetch game room
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId);
    let roomQuery = supabase
      .from('game_rooms')
      .select('id, unit_id, slug, code, title, status, content_version')
      .eq('status', 'published');

    if (isUuid) {
      roomQuery = roomQuery.eq('id', roomId);
    } else {
      roomQuery = roomQuery.eq('slug', roomId);
    }

    const { data: room } = await roomQuery.maybeSingle();

    // 4. Check active class membership
    let classId = '00000000-0000-0000-0000-000000000000';
    let isStaff = false;

    if (profile) {
      const { data: membership } = await supabase
        .from('class_members')
        .select('class_id, member_role')
        .eq('profile_id', authContext.userId)
        .eq('active', true)
        .maybeSingle();

      classId = membership?.class_id || classId;
      isStaff = profile.role === 'teacher' || profile.role === 'admin';
    }

    // 5. Progression gate check
    if (room && !isStaff && classId !== '00000000-0000-0000-0000-000000000000') {
      const progression = await getStudentUnitProgressService(
        authContext.userId,
        classId,
        authContext.userId,
        room.unit_id,
      );

      if (progression && !progression.unlocked) {
        return (
          <main className="portal-lab-page min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
            <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto border border-amber-500/30">
                🔒
              </div>
              <h1 className="text-xl font-bold text-white">ห้องปฏิบัติการนี้ยังไม่ปลดล็อก</h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                ผู้เรียนจำเป็นต้องทำแบบทดสอบก่อนเรียน หรือผ่านหน่วยการเรียนรู้ก่อนหน้าตามลำดับ
                หรือติดต่อครูผู้สอนเพื่อขอเปิดสิทธิ์ (Teacher Override)
              </p>
              <div className="pt-2">
                <a
                  href="/labs"
                  className="inline-block w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                >
                  ← กลับสู่หน้ารวมห้องปฏิบัติการ
                </a>
              </div>
            </div>
          </main>
        );
      }
    }

    return (
      <LabClientContainer
        learner={{
          id: authContext.userId,
          displayName: profile?.display_name || 'ผู้เรียน',
          studentCode: profile?.student_code || null,
        }}
        roomId={room?.id || roomId}
        classId={classId}
        unitId={room?.unit_id || unitId}
        missionId="00000000-0000-0000-0000-000000000000"
        roomTitle={room?.title || defaultTitle}
        returnUrl={returnUrl}
      />
    );
  } catch {
    // Fallback when DB credentials are mock/unavailable in dev
    return (
      <LabClientContainer
        learner={{
          id: authContext.userId,
          displayName: 'ผู้เรียน (Preview)',
          studentCode: null,
        }}
        roomId={roomId}
        classId="22222222-2222-4222-8222-222222222222"
        unitId={unitId}
        missionId="44444444-4444-4444-8444-444444444444"
        roomTitle={defaultTitle}
        returnUrl={returnUrl}
      />
    );
  }
}
