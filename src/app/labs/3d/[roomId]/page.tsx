import { notFound, redirect } from 'next/navigation';
import { getVerifiedAuthContext } from '../../../../lib/auth/claims';
import { getServerDatabase } from '../../../../server/database/client';
import { LabClientContainer } from './LabClientContainer';

type LabPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function LabPage({ params }: LabPageProps) {
  const { roomId } = await params;

  // 1. Authenticate user
  const authContext = await getVerifiedAuthContext();
  if (!authContext) {
    redirect(`/login?next=${encodeURIComponent(`/labs/3d/${roomId}`)}`);
  }

  try {
    const sql = getServerDatabase();

    // 2. Fetch user profile
    const [profile] = await sql`
      select id, display_name, role, student_code
      from public.profiles
      where id = ${authContext.userId} and active = true
    `;

    if (!profile) {
      redirect('/login');
    }

    // 3. Fetch game room
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId);
    const [room] = await sql`
      select id, unit_id, slug, code, title, status, content_version
      from public.game_rooms
      where ${isUuid ? sql`id = ${roomId}` : sql`slug = ${roomId}`}
        and status = 'published'
    `;

    if (!room) {
      notFound();
    }

    // 4. Fetch student active class membership
    const [membership] = await sql`
      select class_id, member_role
      from public.class_members
      where profile_id = ${authContext.userId} and active = true
      limit 1
    `;

    const classId = membership?.class_id;
    const isStaff = profile.role === 'teacher' || profile.role === 'admin';

    // 5. Verify unlock status
    let isUnlocked = isStaff;
    if (!isStaff && classId) {
      try {
        const [unlock] = await sql`
          select private.is_unit_unlocked(${authContext.userId}, ${classId}, ${room.unit_id}) as is_unlocked
        `;
        isUnlocked = Boolean(unlock?.is_unlocked);
      } catch {
        isUnlocked = room.slug === 'room-101';
      }
    } else if (!isStaff) {
      isUnlocked = room.slug === 'room-101';
    }

    // If unit is locked for this student, show locked notice
    if (!isUnlocked) {
      return (
        <main className="portal-lab-page min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
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
                href="/"
                className="inline-block w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                ← กลับสู่แดชบอร์ด
              </a>
            </div>
          </div>
        </main>
      );
    }

    // 6. Fetch summative mission for this unit
    const [mission] = await sql`
      select id, title
      from public.missions
      where unit_id = ${room.unit_id}
      order by sequence_no asc
      limit 1
    `;

    return (
      <LabClientContainer
        learner={{
          id: authContext.userId,
          displayName: profile.display_name,
          studentCode: profile.student_code,
        }}
        roomId={room.id}
        classId={classId || '00000000-0000-0000-0000-000000000000'}
        unitId={room.unit_id}
        missionId={mission?.id || '00000000-0000-0000-0000-000000000000'}
        roomTitle={room.title}
      />
    );
  } catch (err) {
    // If DB is unavailable in preview/mock environment, fall back to mock container if room-101
    if (roomId === 'room-101') {
      return (
        <LabClientContainer
          learner={{
            id: authContext.userId,
            displayName: 'ผู้เรียน (Preview)',
            studentCode: 'DEMO',
          }}
          roomId="11111111-1111-4111-8111-111111111111"
          classId="22222222-2222-4222-8222-222222222222"
          unitId="33333333-3333-4333-8333-333333333333"
          missionId="44444444-4444-4444-8444-444444444444"
          roomTitle="Room 101 · Smart Mart"
        />
      );
    }
    throw err;
  }
}
