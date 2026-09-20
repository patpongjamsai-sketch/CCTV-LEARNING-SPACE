import { getVerifiedAuthContext } from '../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import { getStudentProgressOverviewService } from '../../server/services/progressionService';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';

export default async function ProgressPage() {
    let learnerName = 'ผู้เรียน';
    let unitRows: Array<{
        id: string;
        sequence_no: number;
        title: string;
        score: number;
        passed: boolean;
        unlocked: boolean;
        progressPercent: number;
        latestLabStatus: string | null;
    }> = [];

    try {
        const auth = await getVerifiedAuthContext();
        if (auth) {
            const supabase = createAdminSupabaseClient();
            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', auth.userId)
                .maybeSingle();

            if (profile?.display_name) {
                learnerName = profile.display_name;
            }

            const { data: membership } = await supabase
                .from('class_members')
                .select('class_id')
                .eq('profile_id', auth.userId)
                .eq('member_role', 'student')
                .eq('active', true)
                .maybeSingle();

            if (membership?.class_id) {
                const overview = await getStudentProgressOverviewService(auth.userId, membership.class_id);
                unitRows = overview.units.map((unit) => ({
                    id: unit.unitId,
                    sequence_no: unit.sequenceNo,
                    title: unit.title,
                    score: unit.approvedScore ?? 0,
                    passed: unit.passed,
                    unlocked: unit.unlocked,
                    progressPercent: unit.progressPercent,
                    latestLabStatus: unit.latestLabSubmission?.status ?? null,
                }));
            }
        }
    } catch (err) {
        console.error('Progress page error:', err);
        // fallback preview
    }

    return (
        <>
            <PortalGlobalNav />
            <main className="portal-document-page">
                <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
                <p className="portal-kicker">LEARNER RECORD</p>
                <h1>ผลการเรียนของฉัน</h1>
                <p>สรุปผลการเรียนและบันทึกคะแนนสะสมของผู้เรียน: <strong>{learnerName}</strong></p>

                {unitRows.length > 0 ? (
                    <ol className="portal-unit-list">
                        {unitRows.map((u) => (
                            <li key={u.id}>
                                <span>{String(u.sequence_no).padStart(2, '0')}</span>
                                <strong>{u.title}</strong>
                                <small className={u.passed ? 'text-emerald-400 font-bold' : u.unlocked ? 'text-sky-300' : 'text-slate-400'}>
                                    {u.passed
                                        ? `ผ่านแล้ว (${u.score} คะแนน)`
                                        : u.unlocked
                                            ? `กำลังเรียน (${u.progressPercent}%)`
                                            : 'ยังไม่ปลดล็อก'}
                                    {u.latestLabStatus ? ` · LAB: ${u.latestLabStatus}` : ''}
                                </small>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300">
                        กรุณา <a href="/login" className="text-sky-400 font-bold hover:underline">เข้าสู่ระบบ</a> เพื่อดูประวัติและผลการประเมินคะแนนสะสมจริงของคุณ
                    </div>
                )}
            </main>
        </>
    );
}
