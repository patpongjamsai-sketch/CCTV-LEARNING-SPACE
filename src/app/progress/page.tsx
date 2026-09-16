import { getVerifiedAuthContext } from '../../lib/auth/claims';
import { getServerDatabase } from '../../server/database/client';

export default async function ProgressPage() {
  let learnerName = 'ผู้เรียน';
  let unitRows: Array<{ id: string; sequence_no: number; title: string; score: number; passed: boolean }> = [];

  try {
    const auth = await getVerifiedAuthContext();
    if (auth) {
      const sql = getServerDatabase();
      const [profile] = await sql`
        select display_name from public.profiles where id = ${auth.userId}
      `;
      if (profile?.display_name) {
        learnerName = profile.display_name;
      }

      unitRows = await sql`
        select
          u.id,
          u.sequence_no,
          u.title,
          coalesce(up.highest_score, 0) as score,
          coalesce(up.passed, false) as passed
        from public.units as u
        left join public.unit_progress as up
          on up.unit_id = u.id and up.student_id = ${auth.userId}
        where u.status = 'published'
        order by u.sequence_no asc
      `;
    }
  } catch {
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
