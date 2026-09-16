import { getVerifiedAuthContext } from '../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../lib/supabase/admin';

export default async function ProgressPage() {
  let learnerName = 'ผู้เรียน';
  let unitRows: Array<{ id: string; sequence_no: number; title: string; score: number; passed: boolean }> = [];

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

      const { data: units } = await supabase
        .from('units')
        .select('id, sequence_no, title')
        .eq('status', 'published')
        .order('sequence_no', { ascending: true });

      const { data: progressList } = await supabase
        .from('unit_progress')
        .select('unit_id, highest_score, passed')
        .eq('student_id', auth.userId);

      const progMap = new Map((progressList || []).map((p: any) => [p.unit_id, p]));

      unitRows = (units || []).map((u: any) => {
        const p = progMap.get(u.id);
        return {
          id: u.id,
          sequence_no: u.sequence_no,
          title: u.title,
          score: Number(p?.highest_score || 0),
          passed: Boolean(p?.passed),
        };
      });
    }
  } catch (err) {
    console.error('Progress page error:', err);
    // fallback preview
  }

  return (
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
              <small className={u.passed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {u.passed ? `ผ่านแล้ว (${u.score} คะแนน)` : 'ยังไม่ผ่าน'}
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
  );
}
