'use client';

import { useEffect, useState } from 'react';
import type { UnitContentBundle } from '../../content/courses/21909-2020';
import { UnitExamModal } from './UnitExamModal';
import { FaultChallengeModal } from './FaultChallengeModal';
import { isAssessmentUnlocked } from '../../lib/progressionState';

export type AssessmentsHubClientProps = {
    bundles: UnitContentBundle[];
};

export function AssessmentsHubClient({ bundles }: AssessmentsHubClientProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>('U01');
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    const [examScores, setExamScores] = useState<Record<string, { score: number; passed: boolean }>>({});
    const [faultSubmissions, setFaultSubmissions] = useState<Record<string, { status: string; submittedAt: string }>>({});

    const activeBundle = bundles.find((b) => b.unit.id === selectedUnitId) || bundles[0];
    if (!activeBundle) return null;

    // Load saved scores and submissions
    const reloadSavedStates = () => {
        const scores: Record<string, { score: number; passed: boolean }> = {};
        const faults: Record<string, { status: string; submittedAt: string }> = {};

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
        });

        setExamScores(scores);
        setFaultSubmissions(faults);
    };

    useEffect(() => {
        reloadSavedStates();

        const handleExamEvent = () => reloadSavedStates();
        const handleFaultEvent = () => reloadSavedStates();

        window.addEventListener('cctv_exam_completed', handleExamEvent);
        window.addEventListener('cctv_fault_submitted', handleFaultEvent);

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
                }
            }
        }

        return () => {
            window.removeEventListener('cctv_exam_completed', handleExamEvent);
            window.removeEventListener('cctv_fault_submitted', handleFaultEvent);
        };
    }, [bundles]);

    const activeExam = examScores[activeBundle.unit.id];
    const activeFault = faultSubmissions[activeBundle.unit.id];
    const assessmentGate = isAssessmentUnlocked(activeBundle.unit.id);

    return (
        <div className="space-y-8">
            {/* Unit Dropdown Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">🎯</span>
                    <div>
                        <strong className="text-white text-base block">เลือกหน่วยการเรียนรู้ที่ต้องการประเมิน</strong>
                        <span className="text-xs text-slate-400">
                            เลือกหน่วยที่ 1 ถึง 8 เพื่อทำข้อสอบปรนัยหรือส่งแบบทดสอบอัตนัยประจำหน่วย
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="assessment-unit-select" className="text-xs text-slate-400 font-mono">
                        หน่วยการเรียนรู้:
                    </label>
                    <select
                        id="assessment-unit-select"
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-sky-400 text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                        {bundles.map((b) => (
                            <option key={b.unit.id} value={b.unit.id}>
                                {b.unit.id} : หน่วยที่ {b.unit.number} - {b.unit.titleTh}
                            </option>
                        ))}
                    </select>
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

            {/* Two Prominent Assessment Pillars */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!assessmentGate.unlocked ? 'opacity-70' : ''}`}>
                {/* Pillar 1: Multiple Choice Exam (Unit Exam Runner) */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                {activeBundle.unit.id}-A01 · MULTIPLE CHOICE
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                                ⏱️ จับเวลา 15 นาที
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-white m-0 flex items-center gap-2">
                                <span>📝 แบบทดสอบปรนัย 10 ข้อ</span>
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                วัดความรู้ความเข้าใจเนื้อหาเชิงทฤษฎีและมาตรฐานวิชาชีพ ครอบคลุมทั้ง 10 บทเรียนประจำหน่วย {activeBundle.unit.titleTh}
                            </p>
                        </div>

                        {/* Status Card */}
                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                                <span className="text-slate-400 block mb-0.5">สถานะการสอบ:</span>
                                {activeExam ? (
                                    <strong className={activeExam.passed ? 'text-emerald-400' : 'text-amber-400'}>
                                        {activeExam.passed ? '✓ ผ่านเกณฑ์แล้ว' : '⚠️ ยังไม่ผ่านเกณฑ์'} ({activeExam.score} / 10 คะแนน)
                                    </strong>
                                ) : (
                                    <strong className="text-slate-300">
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

                {/* Pillar 2: Fault Challenge 6-Step Submission Form */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
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
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
                                    <strong className="text-amber-300 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        รออาจารย์ตรวจ (ส่งเมื่อ {activeFault.submittedAt})
                                    </strong>
                                ) : (
                                    <strong className="text-slate-300">
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

            {/* 8 Individual Unit Cards (1 Card per Unit) */}
            <div className="pt-6 border-t border-slate-800 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        รายการแบบประเมินและเกณฑ์วัดผลทั้งหมด (ครบทั้ง 8 หน่วย)
                    </h3>
                    <p className="text-xs text-slate-400">
                        ตารางแสดงรหัสแบบประเมิน เกณฑ์การวัดผล และเครื่องมือสะท้อนสมรรถนะช่างเทคนิคกล้องวงจรปิด แยกตามหน่วยการเรียนรู้ (หน่วยละ 1 Card)
                    </p>
                </div>

                <div className="space-y-6">
                    {bundles.map((bundle) => {
                        const isCurrentActive = bundle.unit.id === selectedUnitId;
                        const unitExam = examScores[bundle.unit.id];
                        const unitFault = faultSubmissions[bundle.unit.id];

                        return (
                            <section
                                key={bundle.unit.id}
                                id={`unit-card-${bundle.unit.id}`}
                                className={`p-6 rounded-3xl bg-slate-900/90 border transition-all ${
                                    isCurrentActive
                                        ? 'border-sky-500/60 shadow-2xl shadow-sky-500/10 ring-1 ring-sky-500/40'
                                        : 'border-slate-800 shadow-xl'
                                }`}
                            >
                                {/* Unit Card Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                                {bundle.unit.id}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400">
                                                หน่วยการเรียนรู้ที่ {bundle.unit.number}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                                                เกณฑ์รวม 100 คะแนน
                                            </span>
                                            {unitExam?.passed ? (
                                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                                                    ✓ ปรนัย: {unitExam.score}/10 คะแนน
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono">
                                                    ○ ปรนัย: ยังไม่สอบ
                                                </span>
                                            )}
                                            {unitFault ? (
                                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold">
                                                    🟡 อัตนัย: ส่งตรวจแล้ว
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono">
                                                    ○ อัตนัย: ยังไม่ส่ง
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-xl font-bold text-white m-0">
                                            {bundle.unit.titleTh}
                                        </h4>
                                        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl m-0">
                                            {bundle.unit.learningOutcome}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUnitId(bundle.unit.id);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                isCurrentActive
                                                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-extrabold'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                                            }`}
                                        >
                                            {isCurrentActive ? '● กำลังเลือกหน่วยนี้' : 'เลือกหน่วยนี้ ↑'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-6">
                                    {/* ========================================================================= */}
                                    {/* หมวดที่ 1: แบบประเมินปรนัย (Objective Assessments / Knowledge Checks) */}
                                    {/* ========================================================================= */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sky-400 font-bold text-sm flex items-center gap-1.5">
                                                    <span aria-hidden="true">📝</span> แบบประเมินปรนัย (Objective Assessments)
                                                </span>
                                                <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-mono">
                                                    {bundle.assessments.length} รายการ
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                                                วัดความรอบรู้เชิงทฤษฎี มาตรฐานอุปกรณ์ และเกณฑ์ความปลอดภัยก่อนปฏิบัติการ
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs text-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                                                        <th className="py-2.5 px-3 w-28">รหัส</th>
                                                        <th className="py-2.5 px-3">รายการประเมิน &amp; สมรรถนะช่างที่สะท้อน</th>
                                                        <th className="py-2.5 px-3 w-40">เกณฑ์การวัดผล</th>
                                                        <th className="py-2.5 px-3 w-36 text-right">การประเมิน</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {bundle.assessments.map((a) => (
                                                        <tr key={a.id} id={a.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-3 px-3 align-top font-mono font-bold text-sky-400">
                                                                {a.id}
                                                                <span className="block text-[10px] text-slate-400 font-normal">
                                                                    {a.type === 'knowledge_check'
                                                                        ? 'Knowledge'
                                                                        : a.type === 'equipment_matching'
                                                                        ? 'Matching'
                                                                        : a.type === 'system_diagram'
                                                                        ? 'Diagram'
                                                                        : 'Pre-LAB Gate'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 align-top">
                                                                <strong className="text-white font-semibold text-sm block mb-1">
                                                                    {a.titleTh}
                                                                </strong>
                                                                <p className="text-xs text-slate-400 leading-relaxed m-0">
                                                                    <span className="text-sky-300/80 font-medium">สมรรถนะ: </span>
                                                                    {a.purpose}
                                                                </p>
                                                            </td>
                                                            <td className="py-3 px-3 align-top font-mono">
                                                                <span className="text-slate-200 font-semibold block">
                                                                    เต็ม {a.scoring.maxScore} คะแนน
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 block">
                                                                    น้ำหนัก {a.scoring.weight}%
                                                                </span>
                                                                <span className="text-[11px] text-emerald-400/90 font-sans">
                                                                    {a.passingRule.type === 'minimum_percentage'
                                                                        ? `เกณฑ์ผ่าน ≥ ${a.passingRule.value}%`
                                                                        : 'ผ่านเกณฑ์ Safety Gate'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 align-top text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedUnitId(bundle.unit.id);
                                                                        setIsExamModalOpen(true);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-sky-600/80 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                                                >
                                                                    ทำข้อสอบปรนัย
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* ========================================================================= */}
                                    {/* หมวดที่ 2: แบบประเมินอัตนัยและสมรรถนะวิชาชีพ (Subjective & Performance) */}
                                    {/* ========================================================================= */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
                                                    <span aria-hidden="true">🔍</span> แบบประเมินอัตนัยและสมรรถนะวิชาชีพ (Subjective &amp; Performance)
                                                </span>
                                                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
                                                    3 เครื่องมือ
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                                                วิเคราะห์หาสาเหตุด้วยหลักฐาน 6 ขั้นตอน และเกณฑ์สมรรถนะภาคปฏิบัติในระบบเสมือน
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs text-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                                                        <th className="py-2.5 px-3 w-28">รหัส</th>
                                                        <th className="py-2.5 px-3">เครื่องมือวัด &amp; สมรรถนะช่างเทคนิค</th>
                                                        <th className="py-2.5 px-3 w-40">เกณฑ์การวัดผล</th>
                                                        <th className="py-2.5 px-3 w-36 text-right">การประเมิน</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {/* 1. Fault Challenge (อัตนัยวิเคราะห์ 6 ขั้นตอน) */}
                                                    <tr id={bundle.faultChallenge.id} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 px-3 align-top font-mono font-bold text-amber-400">
                                                            {bundle.faultChallenge.id}
                                                            <span className="block text-[10px] text-slate-400 font-normal">
                                                                อัตนัย (Fault)
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top">
                                                            <strong className="text-white font-semibold text-sm block mb-1">
                                                                {bundle.faultChallenge.titleTh}
                                                            </strong>
                                                            <p className="text-xs text-slate-400 leading-relaxed m-0 mb-1">
                                                                <span className="text-amber-300/80 font-medium">สมรรถนะ: </span>
                                                                การวินิจฉัยปัญหาเชิงตรรกะ บันทึกหลักฐานผลทดสอบ และแก้ไขปัญหาตามกระบวนการ 6 ขั้นตอน
                                                            </p>
                                                            <span className="inline-block text-[10px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                                                                6 STEPS: Problem → Cause → Test → Result → Solution → Retest
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top font-mono">
                                                            <span className="text-slate-200 font-semibold block">
                                                                เต็ม {bundle.faultChallenge.scoring.maxScore} คะแนน
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 block">
                                                                น้ำหนัก {bundle.faultChallenge.scoring.weight}%
                                                            </span>
                                                            <span className="text-[11px] text-amber-400/90 font-sans">
                                                                รูบริกการวิเคราะห์ 6 ขั้นตอน
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedUnitId(bundle.unit.id);
                                                                    setIsFaultModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                                            >
                                                                {unitFault ? 'ดูรายงานอัตนัย' : 'ทำแบบทดสอบอัตนัย'}
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* 2. Practical LAB Rubric (สมรรถนะการปฏิบัติใน 3D Lab) */}
                                                    <tr id={bundle.lab.id} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 px-3 align-top font-mono font-bold text-emerald-400">
                                                            {bundle.lab.id}
                                                            <span className="block text-[10px] text-slate-400 font-normal">
                                                                สมรรถนะปฏิบัติ
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top">
                                                            <strong className="text-white font-semibold text-sm block mb-1">
                                                                เกณฑ์วัดผลสมรรถนะภาคปฏิบัติ: {bundle.lab.titleTh}
                                                            </strong>
                                                            <p className="text-xs text-slate-400 leading-relaxed m-0 mb-1">
                                                                <span className="text-emerald-300/80 font-medium">สมรรถนะ: </span>
                                                                การติดตั้งอุปกรณ์ ต่อสาย Cat6/HDMI คำนวณงบไฟ PoE และทดสอบสัญญาณภาพสด Live View
                                                            </p>
                                                            <span className="inline-block text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                                                                AUTHENTIC 3D LAB · ห้อง {bundle.unit.number + 100}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top font-mono">
                                                            <span className="text-slate-200 font-semibold block">
                                                                เต็ม {bundle.lab.scoring.maxScore} คะแนน
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 block">
                                                                น้ำหนัก {bundle.lab.scoring.weight}%
                                                            </span>
                                                            <span className="text-[11px] text-emerald-400/90 font-sans">
                                                                ผ่านเกณฑ์ทดสอบระบบ 100%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top text-right">
                                                            <a
                                                                href={`/labs/3d/room-${bundle.unit.number + 100}`}
                                                                className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                                                            >
                                                                เข้าห้อง LAB {bundle.unit.number + 100}
                                                            </a>
                                                        </td>
                                                    </tr>

                                                    {/* 3. Reflection (การประเมินการสะท้อนคิด) */}
                                                    <tr id={bundle.reflection.id} className="hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 px-3 align-top font-mono font-bold text-slate-400">
                                                            {bundle.reflection.id}
                                                            <span className="block text-[10px] text-slate-400 font-normal">
                                                                สะท้อนคิด
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top">
                                                            <strong className="text-white font-semibold text-sm block mb-1">
                                                                {bundle.reflection.titleTh}
                                                            </strong>
                                                            <p className="text-xs text-slate-400 leading-relaxed m-0">
                                                                <span className="text-slate-300/80 font-medium">สมรรถนะ: </span>
                                                                การประเมินตนเอง สรุปบทเรียน และสะท้อนมาตรฐานจรรยาบรรณวิชาชีพช่าง CCTV
                                                            </p>
                                                        </td>
                                                        <td className="py-3 px-3 align-top font-mono">
                                                            <span className="text-slate-200 font-semibold block">
                                                                เต็ม {bundle.reflection.scoring.maxScore} คะแนน
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 block">
                                                                น้ำหนัก {bundle.reflection.scoring.weight}%
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 font-sans">
                                                                ประเมินความสมบูรณ์
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 align-top text-right">
                                                            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 inline-block">
                                                                สะท้อนคิด
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
