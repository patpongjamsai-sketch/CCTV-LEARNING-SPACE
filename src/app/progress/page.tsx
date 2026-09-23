import { getVerifiedAuthContext } from '../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import { getStudentProgressOverviewService } from '../../server/services/progressionService';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';
import { allUnitsContent } from '../../content/courses/21909-2020';

interface UnitRowData {
    sequenceNo: number;
    unitId: string;
    title: string;
    description: string;
    unlocked: boolean;
    passed: boolean;
    progressPercent: number;
    labInfo: {
        roomId: number;
        title: string;
        status: string | null;
        score: number | null;
        passed: boolean;
    };
    quizInfo: {
        score: number | null;
        passed: boolean;
        status: string | null;
        feedback: string | null;
        submittedAt: string | null;
    };
}

export default async function ProgressPage() {
    let isAuthenticated = false;
    let learnerName = 'ผู้เรียนตัวอย่าง (DEMO)';
    let studentCode = '67301001';
    let userRole = 'student';
    let unitRows: UnitRowData[] = [];

    try {
        const auth = await getVerifiedAuthContext();
        if (auth) {
            isAuthenticated = true;
            const supabase = createAdminSupabaseClient();
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, display_name, role, student_code')
                .eq('id', auth.userId)
                .maybeSingle();

            if (profile?.display_name) {
                learnerName = profile.display_name;
            }
            if (profile?.student_code) {
                studentCode = profile.student_code;
            }
            if (profile?.role) {
                userRole = profile.role;
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

                // ดึงข้อมูล quizzes และ attempts ล่าสุด
                const { data: quizzes } = await supabase
                    .from('quizzes')
                    .select('id, unit_id, code, title');

                const { data: quizAttempts } = await supabase
                    .from('quiz_attempts')
                    .select('id, quiz_id, score_percent, approved_score, passed, status, submitted_at, evaluation_reason')
                    .eq('student_id', auth.userId)
                    .eq('class_id', membership.class_id)
                    .order('submitted_at', { ascending: false });

                const quizByUnit = new Map<string, {
                    approved_score: number | null;
                    score_percent: number | null;
                    passed: boolean | null;
                    status: string;
                    evaluation_reason: string | null;
                    submitted_at: string | null;
                }>();

                if (quizAttempts && quizzes) {
                    for (const attempt of quizAttempts) {
                        const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
                        if (quiz && !quizByUnit.has(quiz.unit_id)) {
                            quizByUnit.set(quiz.unit_id, attempt);
                        }
                    }
                }

                unitRows = allUnitsContent.map((bundle) => {
                    const found = overview.units.find(
                        (u) =>
                            u.sequenceNo === bundle.unit.number ||
                            u.unitId === bundle.unit.id ||
                            u.title.includes(`หน่วยที่ ${bundle.unit.number}`)
                    );
                    const quiz = found ? quizByUnit.get(found.unitId) : null;
                    const passed = found?.passed ?? false;
                    const progressPercent = found?.progressPercent ?? (bundle.unit.number === 1 ? 0 : 0);
                    const unlocked = found?.unlocked ?? (bundle.unit.number === 1);
                    const labStatus = found?.latestLabSubmission?.status ?? null;
                    const labScore = found?.latestLabSubmission?.approvedScore ?? null;
                    const quizScore = quiz?.approved_score ?? quiz?.score_percent ?? null;

                    return {
                        sequenceNo: bundle.unit.number,
                        unitId: bundle.unit.id,
                        title: bundle.unit.titleTh,
                        description: bundle.unit.learningOutcome,
                        unlocked,
                        passed,
                        progressPercent,
                        labInfo: {
                            roomId: 100 + bundle.unit.number,
                            title: bundle.lab.titleTh,
                            status: labStatus,
                            score: labScore !== null ? Number(labScore) : null,
                            passed: found?.latestLabSubmission?.passed ?? false,
                        },
                        quizInfo: {
                            score: quizScore !== null ? Number(quizScore) : null,
                            passed: Boolean(quiz?.passed),
                            status: quiz?.status ?? null,
                            feedback: quiz?.evaluation_reason ?? null,
                            submittedAt: quiz?.submitted_at ?? null,
                        },
                    };
                });
            }
        }
    } catch (err) {
        console.error('Progress page error:', err);
    }

    // กรณีไม่มีข้อมูลจริง (Unauthenticated หรือโหมด Demo Preview)
    if (unitRows.length === 0) {
        unitRows = allUnitsContent.map((bundle) => {
            const seq = bundle.unit.number;
            const passed = seq === 1;
            const unlocked = seq <= 2;
            const progressPercent = seq === 1 ? 100 : seq === 2 ? 45 : 0;
            return {
                sequenceNo: seq,
                unitId: bundle.unit.id,
                title: bundle.unit.titleTh,
                description: bundle.unit.learningOutcome,
                unlocked,
                passed,
                progressPercent,
                labInfo: {
                    roomId: 100 + seq,
                    title: bundle.lab.titleTh,
                    status: seq === 1 ? 'passed' : seq === 2 ? 'submitted' : null,
                    score: seq === 1 ? 95 : null,
                    passed: seq === 1,
                },
                quizInfo: {
                    score: seq === 1 ? 88 : null,
                    passed: seq === 1,
                    status: seq === 1 ? 'approved' : null,
                    feedback: seq === 1 ? 'ทำคะแนนภาคทฤษฎีได้ดีเยี่ยม ตอบคำถามอัตนัยครบถ้วน' : null,
                    submittedAt: seq === 1 ? '2026-09-18T10:00:00Z' : null,
                },
            };
        });
    }

    // คำนวณสถิติภาพรวม
    const completedUnitsCount = unitRows.filter((u) => u.passed).length;
    const totalProgressSum = unitRows.reduce((acc, u) => acc + u.progressPercent, 0);
    const overallProgressPercent = Math.round(totalProgressSum / Math.max(1, unitRows.length));

    let totalScoreSum = 0;
    let scoredUnitsCount = 0;
    unitRows.forEach((u) => {
        if (u.quizInfo.score !== null) {
            totalScoreSum += Number(u.quizInfo.score);
            scoredUnitsCount += 1;
        } else if (u.labInfo.score !== null) {
            totalScoreSum += Number(u.labInfo.score);
            scoredUnitsCount += 1;
        }
    });

    const averageScore = scoredUnitsCount > 0 ? (totalScoreSum / scoredUnitsCount).toFixed(1) : null;

    let gradeLabel = 'รอประเมิน';
    if (averageScore !== null) {
        const numScore = parseFloat(averageScore);
        if (numScore >= 80) gradeLabel = 'เกรด 4.0 (A)';
        else if (numScore >= 75) gradeLabel = 'เกรด 3.5 (B+)';
        else if (numScore >= 70) gradeLabel = 'เกรด 3.0 (B)';
        else if (numScore >= 65) gradeLabel = 'เกรด 2.5 (C+)';
        else if (numScore >= 60) gradeLabel = 'เกรด 2.0 (C)';
        else gradeLabel = 'ปรับปรุง (F)';
    }

    const totalLabsCompleted = unitRows.filter((u) => u.labInfo.passed || u.labInfo.status === 'passed').length;
    const estimatedHours = completedUnitsCount * 3 + totalLabsCompleted * 2;

    return (
        <div className="min-h-screen bg-[#07151e] text-[#f2fbfc]">
            <PortalGlobalNav />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ปุ่มย้อนกลับ */}
                <div className="mb-6">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <span>←</span> กลับหน้าภาพรวมการเรียนรู้
                    </a>
                </div>

                {/* แถบแจ้งเตือนเมื่อยังไม่ได้ล็อกอิน */}
                {!isAuthenticated && (
                    <div className="mb-8 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
                        <div className="flex items-center gap-3 text-cyan-200 text-sm">
                            <span className="text-xl">💡</span>
                            <div>
                                <strong>โหมดแสดงตัวอย่าง (Demo Preview):</strong> กำลังแสดงผลจำลองผลการเรียนของผู้เรียน กรุณาเข้าสู่ระบบเพื่อบันทึกและตรวจสอบคะแนนสะสมจริงของคุณ
                            </div>
                        </div>
                        <a
                            href="/login"
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wider uppercase transition shrink-0"
                        >
                            เข้าสู่ระบบ
                        </a>
                    </div>
                )}

                {/* ข้อมูลโปรไฟล์ผู้เรียน (Header Profile Card) */}
                <header className="mb-8 p-6 sm:p-8 rounded-2xl bg-[#0d2430] border border-[#285465] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-700 flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20 shrink-0">
                                {learnerName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
                                    LEARNER PROGRESSION & AUDIT RECORD
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {learnerName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                                        รหัส: {studentCode}
                                    </span>
                                    <span>•</span>
                                    <span>หลักสูตร 21909-2020 งานติดตั้งระบบโทรทัศน์วงจรปิด</span>
                                    <span>•</span>
                                    <span className="capitalize text-emerald-400 font-medium">
                                        สถานะ: {userRole === 'student' ? 'นักเรียน' : userRole}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ทางลัด */}
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href="/courses/21909-2020"
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
                            >
                                📘 เส้นทางการเรียน
                            </a>
                            <a
                                href="/missions"
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
                            >
                                🎮 ห้องปฏิบัติการ 3D
                            </a>
                            <a
                                href="/assessments"
                                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition"
                            >
                                📝 ศูนย์ทดสอบ
                            </a>
                        </div>
                    </div>
                </header>

                {/* การ์ดสถิติ 4 มิติ (Overview Statistics Grid) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {/* การ์ด 1: ความก้าวหน้ารวม */}
                    <div className="p-5 rounded-2xl bg-[#0d2430] border border-[#285465] shadow-lg flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                                <span>ความก้าวหน้ารายวิชา</span>
                                <span className="text-cyan-400 font-bold">{overallProgressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${overallProgressPercent}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            ความคืบหน้ารวมจากบทเรียน การทดลอง 3D และการประเมิน
                        </p>
                    </div>

                    {/* การ์ด 2: หน่วยที่สำเร็จ */}
                    <div className="p-5 rounded-2xl bg-[#0d2430] border border-[#285465] shadow-lg">
                        <span className="text-xs text-slate-400 font-medium">หน่วยการเรียนที่สำเร็จ</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{completedUnitsCount}</span>
                            <span className="text-sm font-semibold text-slate-400">/ 8 หน่วย</span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                            <span>✓</span> ผ่านเกณฑ์แล้ว {Math.round((completedUnitsCount / 8) * 100)}% ของหลักสูตร
                        </div>
                    </div>

                    {/* การ์ด 3: คะแนนเฉลี่ยสะสม */}
                    <div className="p-5 rounded-2xl bg-[#0d2430] border border-[#285465] shadow-lg">
                        <span className="text-xs text-slate-400 font-medium">คะแนนเฉลี่ยสะสม</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-cyan-300">
                                {averageScore ?? '—'}
                            </span>
                            {averageScore && <span className="text-sm font-semibold text-slate-400">/ 100</span>}
                        </div>
                        <div className="mt-2 text-xs text-amber-300 font-medium">
                            ระดับผลการเรียน: {gradeLabel}
                        </div>
                    </div>

                    {/* การ์ด 4: ชั่วโมงปฏิบัติและแล็บ */}
                    <div className="p-5 rounded-2xl bg-[#0d2430] border border-[#285465] shadow-lg">
                        <span className="text-xs text-slate-400 font-medium">การฝึกปฏิบัติการ 3D</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{totalLabsCompleted}</span>
                            <span className="text-sm font-semibold text-slate-400">/ 8 ห้อง</span>
                        </div>
                        <div className="mt-2 text-xs text-sky-400 font-medium">
                            ⏱ สะสมประมาณ {estimatedHours} ชั่วโมงการฝึกปฏิบัติ
                        </div>
                    </div>
                </section>

                {/* รายการหน่วยการเรียนรู้ 8 หน่วย (Curriculum 3-Step Progression Breakdown) */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#285465]/60">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                ความก้าวหน้าและผลงานแต่ละหน่วย (3 ขั้นตอนการเรียนรู้)
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                ติดตามผลลัพธ์รายบุคคล: 1. เนื้อหาบทเรียน · 2. ผลการทดลอง 3D Lab · 3. การประเมินผลท้ายหน่วย
                            </p>
                        </div>
                        <div className="text-xs font-mono text-cyan-400/90 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                            มาตรฐานหลักสูตร 8 หน่วยเรียนรู้
                        </div>
                    </div>

                    <div className="space-y-4">
                        {unitRows.map((unit) => {
                            const isLocked = !unit.unlocked;
                            const isCompleted = unit.passed;

                            return (
                                <article
                                    key={unit.unitId}
                                    className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                                        isCompleted
                                            ? 'bg-[#0d2430]/90 border-emerald-500/40 shadow-lg shadow-emerald-950/10'
                                            : unit.unlocked
                                            ? 'bg-[#0d2430] border-cyan-500/40 shadow-lg shadow-cyan-950/10'
                                            : 'bg-[#0a1b24]/60 border-slate-800 opacity-75'
                                    }`}
                                >
                                    {/* หัวการ์ดหน่วย */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
                                        <div className="flex items-start sm:items-center gap-3">
                                            <span
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                                                    isCompleted
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                        : unit.unlocked
                                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                }`}
                                            >
                                                {String(unit.sequenceNo).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base sm:text-lg font-bold text-white">
                                                        {unit.title}
                                                    </h3>
                                                    <span className="text-xs font-mono text-slate-500">
                                                        ({unit.unitId})
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                    {unit.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* สถานะรวมของหน่วย */}
                                        <div className="shrink-0">
                                            {isCompleted ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    <span>✓</span> ผ่านการอนุมัติหน่วยแล้ว
                                                </span>
                                            ) : unit.unlocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                                    <span>⏳</span> กำลังศึกษา ({unit.progressPercent}%)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                    <span>🔒</span> รอปลดล็อกตามลำดับ
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3 ขั้นตอนย่อยของการเรียนรู้ */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                        {/* ขั้นที่ 1: บทเรียนทฤษฎี */}
                                        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>📘</span> 1. บทเรียนทฤษฎี (10 บท)
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {isCompleted ? (
                                                        <span className="text-emerald-400 font-semibold">
                                                            ✓ ผ่านครบ 10/10 บทเรียน
                                                        </span>
                                                    ) : unit.unlocked ? (
                                                        <span className="text-sky-300">
                                                            {Math.min(10, Math.floor((unit.progressPercent / 100) * 10))}/10 บท (กำลังศึกษา)
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">ยังไม่เริ่มเรียน</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    ศึกษาเนื้อหาและตอบคำถาม Knowledge Checks
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-800/60">
                                                <a
                                                    href={`/courses/21909-2020`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                                >
                                                    ไปยังเนื้อหาบทเรียน <span>→</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* ขั้นที่ 2: ห้องปฏิบัติการเสมือน 3D */}
                                        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>🎮</span> 2. ห้องปฏิบัติการ 3D
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500">
                                                        Room {unit.labInfo.roomId}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {unit.labInfo.passed || unit.labInfo.status === 'passed' ? (
                                                        <span className="text-emerald-400 font-semibold">
                                                            ✓ ผ่านแล็บ ({unit.labInfo.score ?? 100}/100 คะแนน)
                                                        </span>
                                                    ) : unit.labInfo.status === 'submitted' ? (
                                                        <span className="text-amber-300 font-semibold">
                                                            📝 ส่งหลักฐานแล้ว (รอครูตรวจ)
                                                        </span>
                                                    ) : unit.unlocked ? (
                                                        <span className="text-sky-300">พร้อมเข้าทดลองปฏิบัติ</span>
                                                    ) : (
                                                        <span className="text-slate-500">รอปลดล็อก</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                                    {unit.labInfo.title}
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-800/60">
                                                <a
                                                    href={`/labs/3d/${unit.labInfo.roomId}`}
                                                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                                        isLocked
                                                            ? 'text-slate-500 pointer-events-none'
                                                            : 'text-cyan-400 hover:text-cyan-300'
                                                    }`}
                                                >
                                                    เข้าสู่ห้องแล็บ 3D (Room {unit.labInfo.roomId}) <span>→</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* ขั้นที่ 3: แบบประเมินผลท้ายหน่วย */}
                                        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>📝</span> 3. แบบทดสอบท้ายหน่วย
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {unit.quizInfo.score !== null ? (
                                                        <span className="text-emerald-400 font-semibold">
                                                            ✓ สอบแล้ว ({unit.quizInfo.score}/100 คะแนน)
                                                        </span>
                                                    ) : unit.quizInfo.status === 'submitted' ? (
                                                        <span className="text-amber-300 font-semibold">
                                                            📝 ส่งข้อสอบแล้ว (รอตรวจ)
                                                        </span>
                                                    ) : unit.unlocked ? (
                                                        <span className="text-sky-300">พร้อมทำแบบประเมิน</span>
                                                    ) : (
                                                        <span className="text-slate-500">ยังไม่ปลดล็อก</span>
                                                    )}
                                                </div>
                                                {unit.quizInfo.feedback && (
                                                    <p className="text-[11px] text-amber-200/90 mt-1 italic line-clamp-2">
                                                        ครู: &quot;{unit.quizInfo.feedback}&quot;
                                                    </p>
                                                )}
                                                {!unit.quizInfo.feedback && (
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        แบบทดสอบปรนัยและอัตนัยท้ายหน่วย
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-800/60">
                                                <a
                                                    href={`/assessments`}
                                                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                                        isLocked
                                                            ? 'text-slate-500 pointer-events-none'
                                                            : 'text-cyan-400 hover:text-cyan-300'
                                                    }`}
                                                >
                                                    ไปยังระบบทดสอบ <span>→</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* สรุปเกณฑ์สำเร็จการศึกษา */}
                <footer className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <strong className="text-slate-200">เกณฑ์การผ่านหลักสูตรวิชาชีพ:</strong> ผู้เรียนต้องสำเร็จบทเรียน ครบทั้ง 8 หน่วยการเรียนรู้ และได้คะแนนสะสมเฉลี่ยไม่ต่ำกว่าร้อยละ 60 ในแต่ละเกณฑ์
                    </div>
                    <div className="text-slate-500 shrink-0 font-mono text-[11px]">
                        CCTV Technician 3D Learning Space © 2026
                    </div>
                </footer>
            </main>
        </div>
    );
}
