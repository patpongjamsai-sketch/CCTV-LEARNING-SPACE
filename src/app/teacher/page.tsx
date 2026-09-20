import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';
import { TeacherApprovalDashboard } from '../../components/portal/TeacherApprovalDashboard';

export default function TeacherPage() {
    return (
        <>
            <PortalGlobalNav />
            <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                            <a
                                href="/"
                                className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 mb-1 transition-colors"
                            >
                                ← กลับหน้าภาพรวมการเรียนรู้
                            </a>
                            <h1 className="text-3xl font-black text-white">
                                แดชบอร์ดครูผู้สอน (Teacher & Instructor Portal)
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                กำหนดและอนุมัติสิทธิ์การเปิดหน่วยการเรียนรู้ (8 หน่วย 80 บทเรียน), การเข้าห้องปฏิบัติการ 3D, และตรวจข้อสอบอัตนัย
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                                ● ระบบพร้อมทำงาน (Online)
                            </span>
                        </div>
                    </div>

                    {/* Teacher Approval Dashboard Component */}
                    <TeacherApprovalDashboard classId="CLASS-2569-CCTV-01" />
                </div>
            </main>
        </>
    );
}
