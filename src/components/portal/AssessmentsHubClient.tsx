'use client';

import { useEffect, useState } from 'react';
import type { UnitContentBundle } from '../../content/courses/21909-2020';
import { UnitExamModal } from './UnitExamModal';
import { FaultChallengeModal } from './FaultChallengeModal';
import { ReflectionModal } from './ReflectionModal';
import { isAssessmentUnlocked } from '../../lib/progressionState';

export type AssessmentsHubClientProps = {
    bundles: UnitContentBundle[];
};

export function AssessmentsHubClient({ bundles }: AssessmentsHubClientProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>('U01');
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

    const [examScores, setExamScores] = useState<Record<string, { score: number; passed: boolean }>>({});
    const [faultSubmissions, setFaultSubmissions] = useState<Record<string, { status: string; submittedAt: string }>>({});
    const [reflections, setReflections] = useState<Record<string, { submittedAt: string }>>({});

    const [currentUser, setCurrentUser] = useState<{ displayName: string; studentCode?: string; role: string } | null>(null);

    const activeBundle = bundles.find((b) => b.unit.id === selectedUnitId) || bundles[0];
    if (!activeBundle) return null;

    // Load saved scores, fault submissions, and reflections
    const reloadSavedStates = () => {
        const scores: Record<string, { score: number; passed: boolean }> = {};
        const faults: Record<string, { status: string; submittedAt: string }> = {};
        const refls: Record<string, { submittedAt: string }> = {};

        bundles.forEach((b) => {
            const uid = b.unit.id;
            const savedExam = localStorage.getItem(`cctv_unit_exam_${uid}`);
            if (savedExam) {
                try {
                    const parsed = JSON.parse(savedExam);
                    if (typeof parsed?.score === 'number') {
                        scores[uid] = { score: parsed.score, passed: parsed.passed };
                    }
                } catch {
                    // ignore
                }
            }

            const savedFault = localStorage.getItem(`cctv_fault_submission_${uid}`);
            if (savedFault) {
                try {
                    const parsed = JSON.parse(savedFault);
                    if (parsed?.submittedAt) {
                        faults[uid] = { status: 'under_review', submittedAt: parsed.submittedAt };
                    }
                } catch {
                    // ignore
                }
            }

            const savedRefl = localStorage.getItem(`cctv_reflection_${uid}`);
            if (savedRefl) {
                try {
                    const parsed = JSON.parse(savedRefl);
                    if (parsed?.submittedAt) {
                        refls[uid] = { submittedAt: parsed.submittedAt };
                    }
                } catch {
                    // ignore
                }
            }
        });

        setExamScores(scores);
        setFaultSubmissions(faults);
        setReflections(refls);
    };

    useEffect(() => {
        reloadSavedStates();

        // Fetch current logged-in user profile
        fetch('/api/auth/me', { cache: 'no-store' })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.user) {
                    setCurrentUser(data.user);
                }
            })
            .catch(() => {
                // ignore
            });

        const handleExamEvent = () => reloadSavedStates();
        const handleFaultEvent = () => reloadSavedStates();
        const handleReflEvent = () => reloadSavedStates();

        window.addEventListener('cctv_exam_completed', handleExamEvent);
        window.addEventListener('cctv_fault_submitted', handleFaultEvent);
        window.addEventListener('cctv_reflection_saved', handleReflEvent);

        // Check URL hash on load (e.g. /assessments#U01-A01 or /assessments#U01-F01)
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            if (hash.startsWith('U0')) {
                const targetUnit = hash.substring(0, 3);
                if (bundles.some((b) => b.unit.id === targetUnit)) {
                    setSelectedUnitId(targetUnit);
                }
                if (hash.includes('-A01') || hash.includes('-A02')) {
                    setIsExamModalOpen(true);
                } else if (hash.includes('-F01')) {
                    setIsFaultModalOpen(true);
                } else if (hash.includes('-R01')) {
                    setIsReflectionModalOpen(true);
                }
            }
        }

        return () => {
            window.removeEventListener('cctv_exam_completed', handleExamEvent);
            window.removeEventListener('cctv_fault_submitted', handleFaultEvent);
            window.removeEventListener('cctv_reflection_saved', handleReflEvent);
        };
    }, [bundles]);

    const activeExam = examScores[activeBundle.unit.id];
    const activeFault = faultSubmissions[activeBundle.unit.id];
    const activeReflection = reflections[activeBundle.unit.id];
    const assessmentGate = isAssessmentUnlocked(activeBundle.unit.id);

    return (
        <div className="space-y-6">
            {/* User Profile Connected Banner */}
            {currentUser && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm" aria-hidden="true">
                            {currentUser.displayName.slice(0, 1) || 'ช'}
                        </span>
                        <div>
                            <span className="text-slate-400 block text-[11px]">ผู้เข้าสอบที่เข้าสู่ระบบ:</span>
                            <strong className="text-white font-bold text-sm">
                                {currentUser.displayName}
                                {currentUser.studentCode ? ` (รหัสนักศึกษา: ${currentUser.studentCode})` : ''}
                            </strong>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-mono text-xs">
                            สถานะ: {currentUser.role === 'teacher' ? 'ครูผู้สอน' : currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                        </span>
                    </div>
                </div>
            )}

            {/* Unit Selector Bar (Interactive Pills U01-U08) */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">🎯</span>
                        <div>
                            <strong className="text-white text-base block">
                                เลือกหน่วยการเรียนรู้ที่ต้องการประเมินสมรรถนะ
                            </strong>
                            <span className="text-xs text-slate-400">
                                สลับหน่วยที่ 1 ถึง 8 เพื่อทำข้อสอบปรนัย ส่งรายงานอัตนัย และบันทึกการสะท้อนคิด
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="assessment-unit-select" className="text-xs text-slate-400 font-mono">
                            หน่วย:
                        </label>
                        <select
                            id="assessment-unit-select"
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-sky-400 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 transition-colors"
                        >
                            {bundles.map((b) => (
                                <option key={b.unit.id} value={b.unit.id}>
                                    {b.unit.id} : หน่วยที่ {b.unit.number} - {b.unit.titleTh}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quick Unit Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 border-t border-slate-800/80">
                    {bundles.map((b) => {
                        const isSelected = b.unit.id === selectedUnitId;
                        const hasPassed = examScores[b.unit.id]?.passed;
                        const hasFault = Boolean(faultSubmissions[b.unit.id]);

                        return (
                            <button
                                key={b.unit.id}
                                type="button"
                                onClick={() => setSelectedUnitId(b.unit.id)}
                                className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-sky-500/20 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold">{b.unit.id}</span>
                                    {hasPassed && (
                                        <span className="text-[10px] text-emerald-400 font-bold">✓ สอบแล้ว</span>
                                    )}
                                </div>
                                <div className="text-[11px] truncate mt-1 text-slate-300 font-medium">
                                    หน่วยที่ {b.unit.number}
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-0.5">
                                    <span>{hasPassed ? '📝 10/10' : '📝 รอสอบ'}</span>
                                    <span>·</span>
                                    <span>{hasFault ? '🟡 ส่งแล้ว' : 'รอส่ง'}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Assessment Lock Banner */}
            {!assessmentGate.unlocked && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start sm:items-center gap-3 text-amber-200 text-xs">
                    <span className="text-2xl shrink-0">🔒</span>
                    <div>
                        <strong className="text-amber-300 font-bold block text-sm">
                            แบบทดสอบของหน่วย {activeBundle.unit.id} ถูกล็อกตามเกณฑ์การเรียนรู้
                        </strong>
                        <p className="text-xs text-slate-300 m-0 mt-0.5 leading-relaxed">
                            {assessmentGate.reason}
                        </p>
                    </div>
                </div>
            )}

            {/* Unit Outcome Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                    <span className="text-sky-400 font-mono font-bold block">
                        {activeBundle.unit.id} : หน่วยการเรียนรู้ที่ {activeBundle.unit.number} - {activeBundle.unit.titleTh}
                    </span>
                    <p className="text-slate-400 m-0 mt-0.5 leading-relaxed">
                        {activeBundle.unit.learningOutcome}
                    </p>
                </div>
                <div className="shrink-0">
                    <a
                        href={`/labs/3d/room-${activeBundle.unit.number + 100}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
                    >
                        <span>🚪 ห้องทดลอง 3D ({activeBundle.unit.number + 100})</span>
                    </a>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 3 Main Assessment Cards (ปรนัย, อัตนัย, สะท้อนคิด) */}
            {/* ========================================================================= */}
            <div className="space-y-6">
                {/* Upper Row: 2 Pillars (Multiple Choice Exam & Fault Challenge) */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!assessmentGate.unlocked ? 'opacity-70' : ''}`}>
                    {/* Card 1: Multiple Choice Exam 10 Questions */}
                    <div
                        id={`${activeBundle.unit.id}-A01`}
                        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                    {activeBundle.unit.id}-A01 · MULTIPLE CHOICE
                                </span>
                                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                    ⏱️ จับเวลา 15 นาที
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white m-0 flex items-center gap-2">
                                    <span>📝 แบบทดสอบปรนัย 10 ข้อ</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                    วัดความรู้ความเข้าใจเนื้อหาเชิงทฤษฎีและมาตรฐานวิชาชีพ ครอบคลุมทั้ง 10 บทเรียนประจำหน่วย {activeBundle.unit.titleTh}
                                </p>
                            </div>

                            {/* Pre-LAB Safety Gate Badge */}
                            <div className="flex items-center gap-2 text-[11px] text-sky-300/90 font-mono bg-sky-950/50 px-3 py-1.5 rounded-xl border border-sky-800/40">
                                <span className="font-bold">[{activeBundle.unit.id}-A04]</span>
                                <span>Pre-LAB Gate: ตรวจความปลอดภัยและมาตรฐานอุปกรณ์ก่อนจ่ายไฟ</span>
                            </div>

                            {/* Status Card */}
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">สถานะการสอบ:</span>
                                    {activeExam ? (
                                        <strong className={activeExam.passed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                            {activeExam.passed ? '✓ ผ่านเกณฑ์แล้ว' : '⚠️ ยังไม่ผ่านเกณฑ์'} ({activeExam.score} / 10 คะแนน)
                                        </strong>
                                    ) : (
                                        <strong className="text-slate-300 font-semibold">
                                            ยังไม่ได้ทำข้อสอบ (พร้อมสอบ 10 ข้อ)
                                        </strong>
                                    )}
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 font-mono font-bold">
                                    เต็ม 10 คะแนน
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsExamModalOpen(true)}
                                className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-black text-sm transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{activeExam ? '🔄 ทำข้อสอบปรนัยอีกครั้ง (10 ข้อ)' : '🚀 เริ่มทำข้อสอบปรนัย (10 ข้อ) →'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Fault Challenge 6-Step Submission Form */}
                    <div
                        id={activeBundle.faultChallenge.id}
                        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    {activeBundle.faultChallenge.id} · FAULT CHALLENGE
                                </span>
                                <span className="text-xs text-amber-300 font-mono font-bold">
                                    15 คะแนน (นน. 15%)
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white m-0 flex items-center gap-2">
                                    <span>🔍 แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                    {activeBundle.faultChallenge.titleTh}
                                </p>
                            </div>

                            {/* Process Flow Badge */}
                            <div className="py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
                                <span className="text-amber-400 font-bold mr-1.5">6 STEPS:</span>
                                Problem → Cause → Test → Result (Evidence) → Solution → Retest
                            </div>

                            {/* Status Card */}
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">สถานะการส่งงาน:</span>
                                    {activeFault ? (
                                        <strong className="text-amber-300 flex items-center gap-1.5 font-bold">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                            รออาจารย์ตรวจ (ส่งเมื่อ {activeFault.submittedAt})
                                        </strong>
                                    ) : (
                                        <strong className="text-slate-300 font-semibold">
                                            ยังไม่ได้ส่งรายงาน (พร้อมทำแบบทดสอบ)
                                        </strong>
                                    )}
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold">
                                    แนบภาพหลักฐานได้
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFaultModalOpen(true)}
                                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{activeFault ? '✏️ ดู / แก้ไขรายงานอัตนัย (6 ขั้นตอน)' : '🔍 เริ่มทำแบบทดสอบอัตนัย (6 ขั้นตอน) →'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower Row: Card 3 (Self Reflection & Ethics) */}
                <div
                    id={activeBundle.reflection.id}
                    className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="space-y-3 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                {activeBundle.reflection.id} · SELF REFLECTION
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[11px] font-mono">
                                เชื่อมโยงเกณฑ์สมรรถนะปฏิบัติ [{activeBundle.lab.id}]
                            </span>
                            <span className="text-xs text-indigo-300 font-mono font-bold">
                                5 คะแนน (นน. 5%)
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white m-0 flex items-center gap-2">
                                <span>💡 การสะท้อนคิดและจรรยาบรรณวิชาชีพช่าง CCTV</span>
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {activeBundle.reflection.titleTh} — การประเมินตนเอง ถอดบทเรียนจากการปฏิบัติงานจริง และสะท้อนมาตรฐานจรรยาบรรณวิชาชีพช่าง CCTV
                            </p>
                        </div>

                        {/* Status Message */}
                        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2">
                            <span className="text-slate-400">สถานะการสะท้อนคิด:</span>
                            {activeReflection ? (
                                <strong className="text-emerald-400 font-bold">
                                    ✓ บันทึกการสะท้อนคิดแล้ว (อัปเดตเมื่อ {activeReflection.submittedAt})
                                </strong>
                            ) : (
                                <strong className="text-slate-400">
                                    ยังไม่ได้บันทึกการสะท้อนคิด (สามารถกดบันทึกเพื่อสรุปบทเรียน)
                                </strong>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setIsReflectionModalOpen(true)}
                            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>📋 {activeReflection ? 'ดู / แก้ไขการสะท้อนคิด' : 'บันทึกการสะท้อนคิด'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UnitExamModal
                unitId={activeBundle.unit.id}
                unitTitle={activeBundle.unit.titleTh}
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                onComplete={() => reloadSavedStates()}
            />

            <FaultChallengeModal
                unitId={activeBundle.unit.id}
                unitTitle={activeBundle.unit.titleTh}
                faultTitle={activeBundle.faultChallenge.titleTh}
                isOpen={isFaultModalOpen}
                onClose={() => setIsFaultModalOpen(false)}
                onComplete={() => reloadSavedStates()}
            />

            <ReflectionModal
                unitId={activeBundle.unit.id}
                unitTitle={activeBundle.unit.titleTh}
                reflectionTitle={activeBundle.reflection.titleTh}
                prompts={activeBundle.reflection.prompts}
                isOpen={isReflectionModalOpen}
                onClose={() => setIsReflectionModalOpen(false)}
                onComplete={() => reloadSavedStates()}
            />
        </div>
    );
}
