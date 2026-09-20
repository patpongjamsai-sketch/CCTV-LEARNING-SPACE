import { missions } from '../../data/missions';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';

export default function MissionsPage() {
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
                        <li key={m.id}>
                            <span>{m.id}</span>
                            <div>
                                <strong>{m.title}</strong>
                                <small className="block text-slate-400 text-xs mt-0.5">
                                    Room {m.room} · {m.description}
                                </small>
                            </div>
                            <a
                                href={`/labs/3d/room-${m.room}`}
                                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 shrink-0"
                            >
                                เข้าสู่ Room {m.room}
                            </a>
                        </li>
                    ))}
                </ol>
            </main>
        </>
    );
}
