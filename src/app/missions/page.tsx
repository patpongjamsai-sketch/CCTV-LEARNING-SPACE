import { redirect } from 'next/navigation';
import { missions } from '../../data/missions';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';
import { getCurrentProfile } from '../../lib/auth/currentProfile';

export default async function MissionsPage() {
    const current = await getCurrentProfile();
    if (current.status === 'unauthenticated') {
        redirect('/login?next=/missions');
    }
    return (
        <>
            <PortalGlobalNav />
            <main className="portal-document-page">
                <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
                <p className="portal-kicker">SKILL MISSIONS</p>
                <h1>ภารกิจฝึกทักษะประจำห้องปฏิบัติการ (8 ภารกิจหลัก)</h1>
                <p>ภารกิจปฏิบัติการเพื่อประเมินสมรรถนะช่างเทคนิคระบบกล้องวงจรปิดตามมาตรฐานวิชาชีพ</p>
                <ol className="portal-unit-list">
                    {missions.map((m) => (
                        <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <span className="shrink-0">{m.id}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <strong>{m.title}</strong>
                                        {m.room === 104 && (
                                            <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
                                                2D Pre-Lab + 3D
                                            </span>
                                        )}
                                    </div>
                                    <small className="block text-slate-400 text-xs mt-0.5">
                                        Room {m.room} · {m.description}
                                    </small>
                                    {m.room === 104 && (
                                        <div className="mt-1 text-[11px] text-sky-300/80 font-medium">
                                            💡 รวมหัวข้อฝึก: จำลองเสียบสาย PoE Switch, ตั้งค่า IP & NVR GUI, คำสั่ง Switch CLI และแบ่งวง Subnetting
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {m.room === 104 && (
                                    <a
                                        href="/labs/network-simulator"
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-sky-500/40 rounded-xl text-xs font-bold transition-all shrink-0"
                                    >
                                        💻 2D Pre-Lab
                                    </a>
                                )}
                                <a
                                    href={`/labs/3d/room-${m.room}`}
                                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 shrink-0"
                                >
                                    เข้าสู่ Room {m.room}
                                </a>
                            </div>
                        </li>
                    ))}
                </ol>
            </main>
        </>
    );
}
