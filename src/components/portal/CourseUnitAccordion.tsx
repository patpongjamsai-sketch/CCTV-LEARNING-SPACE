'use client';

import { useState, useEffect } from 'react';
import type { UnitContentBundle } from '../../content/courses/21909-2020/types';
import {
    isUnitUnlocked,
    isLabUnlocked,
    isAssessmentUnlocked,
    getUnitLessonProgress,
    isUnitFullyPassed,
} from '../../lib/progressionState';

export type CourseUnitAccordionProps = {
    bundles: UnitContentBundle[];
};

export function CourseUnitAccordion({ bundles }: CourseUnitAccordionProps) {
    // Unit 1 is open by default for immediate learning access and SSR test consistency
    const [openUnits, setOpenUnits] = useState<Record<string, boolean>>(() =>
        bundles.reduce(
            (acc, b, idx) => ({
                ...acc,
                [b.unit.id]: idx === 0, // open Unit 1
            }),
            {} as Record<string, boolean>,
        ),
    );

    const [renderTick, setRenderTick] = useState(0);

    useEffect(() => {
        const handleUpdate = () => setRenderTick((t) => t + 1);
        window.addEventListener('cctv_approvals_updated', handleUpdate);
        window.addEventListener('cctv_exam_completed', handleUpdate);
        return () => {
            window.removeEventListener('cctv_approvals_updated', handleUpdate);
            window.removeEventListener('cctv_exam_completed', handleUpdate);
        };
    }, []);

    const toggleUnit = (unitId: string) => {
        setOpenUnits((prev) => ({
            ...prev,
            [unitId]: !prev[unitId],
        }));
    };

    const expandAll = () => {
        setOpenUnits(
            bundles.reduce((acc, b) => ({ ...acc, [b.unit.id]: true }), {} as Record<string, boolean>),
        );
    };

    const collapseAll = () => {
        setOpenUnits(
            bundles.reduce((acc, b) => ({ ...acc, [b.unit.id]: false }), {} as Record<string, boolean>),
        );
    };

    const allOpen = bundles.every((b) => openUnits[b.unit.id]);

    return (
        <div className="space-y-6" key={renderTick}>
            {/* Accordion Controls */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-400 font-mono">
                    กระบวนการเรียนรู้ 3 ขั้นตอน: 1.เนื้อหา 10 บท + ตอบคำถาม → 2.ห้องแล็บ 3D → 3.แบบทดสอบ ปรนัย+อัตนัย
                </p>
                <button
                    type="button"
                    onClick={allOpen ? collapseAll : expandAll}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                    {allOpen ? '▼ ย่อทั้งหมด (Collapse All)' : '▲ ขยายทั้งหมด (Expand All)'}
                </button>
            </div>

            {/* Accordion Items for all 8 units */}
            <div className="space-y-4">
                {bundles.map((bundle) => {
                    const uid = bundle.unit.id;
                    const isOpen = !!openUnits[bundle.unit.id];
                    const isUnitOpen = isUnitUnlocked(uid);
                    const lessonProgress = getUnitLessonProgress(uid);
                    const labGate = isLabUnlocked(uid);
                    const examGate = isAssessmentUnlocked(uid);
                    const isPassed = isUnitFullyPassed(uid);
                    const roomNum = bundle.unit.number + 100;

                    // Calculate 3-step progression percentage
                    let unitProgress = 0;
                    if (isPassed) {
                        unitProgress = 100;
                    } else {
                        const lessonShare = (lessonProgress.completedCount / 10) * 40;
                        const labShare = labGate.unlocked ? 30 : 0;
                        const examSaved = typeof window !== 'undefined' ? localStorage.getItem(`cctv_unit_exam_${uid}`) : null;
                        const examShare = examSaved ? 30 : 0;
                        unitProgress = Math.round(lessonShare + labShare + examShare);
                    }

                    return (
                        <article
                            key={bundle.unit.id}
                            id={`unit-${bundle.unit.id}`}
                            className={`unit-dropdown-card scroll-mt-24 ${isOpen ? 'is-open' : ''} ${!isUnitOpen ? 'opacity-85' : ''}`}
                        >
                            {/* Dropdown Header (Click to toggle) */}
                            <button
                                type="button"
                                onClick={() => toggleUnit(bundle.unit.id)}
                                className="unit-dropdown-header"
                                aria-expanded={isOpen}
                                aria-controls={`unit-content-${bundle.unit.id}`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <span className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                                        isPassed
                                            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                                            : isUnitOpen
                                              ? 'bg-sky-950 border-sky-600/40 text-sky-400'
                                              : 'bg-slate-900 border-slate-700 text-slate-500'
                                    }`}>
                                        U{String(bundle.unit.number).padStart(2, '0')}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                                                UNIT {String(bundle.unit.number).padStart(2, '0')}
                                            </span>
                                            <span className="text-xs text-slate-400 font-normal">
                                                · ทฤษฎี {bundle.unit.theoryMinutes} นาที · ปฏิบัติ {bundle.unit.practicalMinutes} นาที
                                            </span>
                                            {!isUnitOpen && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                    🔒 รอครูอนุมัติเปิดหน่วย
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-white m-0 truncate">
                                            {bundle.unit.titleTh}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    {isPassed ? (
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            ผ่านแล้ว 100%
                                        </span>
                                    ) : (
                                        <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                                            isUnitOpen
                                                ? 'bg-sky-950/60 text-sky-300 border-sky-600/40'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            {isUnitOpen ? `กำลังเรียน ${unitProgress}%` : 'ยังไม่เปิดหน่วย'}
                                        </span>
                                    )}
                                    <span className={`unit-dropdown-chevron ${isOpen ? 'rotated' : ''}`} aria-hidden="true">
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Body (Visible when open) */}
                            {isOpen && (
                                <div id={`unit-content-${bundle.unit.id}`} className="unit-dropdown-body">
                                    {/* หัวข้อที่ 4: Progress bar ความก้าวหน้าประจำหน่วย */}
                                    <section className="unit-section-box border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/60" aria-label="ความก้าวหน้าประจำหน่วย">
                                        <div className="unit-section-box-header">
                                            <div className="unit-section-title">
                                                <span className="text-lg" aria-hidden="true">📊</span>
                                                <span>4. Progress Bar — ความก้าวหน้า 3 ขั้นตอนประจำหน่วย</span>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                                {unitProgress}% สำเร็จ
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Unit Progress Track */}
                                            <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 transition-all duration-500 shadow-sm shadow-teal-400/30"
                                                    style={{ width: `${unitProgress}%` }}
                                                />
                                            </div>

                                            {/* 3 Criteria Checklist */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                                    <span className="text-slate-400">1. เนื้อหา & ตอบคำถาม:</span>
                                                    <strong className={lessonProgress.passed ? 'text-emerald-400' : 'text-amber-400'}>
                                                        {lessonProgress.completedCount}/10 บท {lessonProgress.passed && '✓'}
                                                    </strong>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                                    <span className="text-slate-400">2. ห้องปฏิบัติการ 3D:</span>
                                                    <strong className={labGate.unlocked ? 'text-emerald-400' : 'text-slate-400'}>
                                                        {labGate.unlocked ? '✓ ปลดล็อกแล้ว' : '🔒 ยังไม่ปลดล็อก'}
                                                    </strong>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                                    <span className="text-slate-400">3. แบบทดสอบ ปรนัย+อัตนัย:</span>
                                                    <strong className={examGate.unlocked ? 'text-emerald-400' : 'text-slate-400'}>
                                                        {examGate.unlocked ? '✓ ปลดล็อกแล้ว' : '🔒 ยังไม่ปลดล็อก'}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* หัวข้อที่ 1: เนื้อหาการเรียนรู้ 10 หัวข้อ */}
                                    <section className="unit-section-box" aria-labelledby={`lessons-heading-${bundle.unit.id}`}>
                                        <div className="unit-section-box-header">
                                            <div className="unit-section-title">
                                                <span className="text-lg" aria-hidden="true">📚</span>
                                                <h4 id={`lessons-heading-${bundle.unit.id}`} className="m-0 text-white text-sm font-bold">
                                                    1. เนื้อหาการเรียนรู้ (10 หัวข้อบทเรียน)
                                                </h4>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono">
                                                ทฤษฎี {bundle.unit.theoryMinutes} นาที
                                            </span>
                                        </div>

                                        <ol className="portal-unit-list m-0">
                                            {bundle.lessons.map((lesson) => (
                                                <li key={lesson.id} className="hover:border-sky-500/50 transition-colors">
                                                    <span className="font-mono text-xs">{lesson.id}</span>
                                                    <a
                                                        className="portal-lesson-link"
                                                        href={`/courses/21909-2020/lessons/${lesson.id}`}
                                                    >
                                                        <strong>{lesson.titleTh}</strong>
                                                    </a>
                                                    <small className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                                                        {lesson.role === 'integration'
                                                            ? 'Integration'
                                                            : lesson.role === 'foundation'
                                                                ? 'Foundation'
                                                                : 'Component'}
                                                    </small>
                                                </li>
                                            ))}
                                        </ol>
                                    </section>

                                    {/* หัวข้อที่ 2: ห้องปฏิบัติการ */}
                                    <section className="unit-section-box border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900/60" aria-labelledby={`lab-heading-${bundle.unit.id}`}>
                                        <div className="unit-section-box-header">
                                            <div className="unit-section-title">
                                                <span className="text-lg" aria-hidden="true">🛠️</span>
                                                <h4 id={`lab-heading-${bundle.unit.id}`} className="m-0 text-white text-sm font-bold">
                                                    2. ห้องปฏิบัติการเสมือนจริง (Virtual 3D Lab)
                                                </h4>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                {bundle.lab.scoring.maxScore} คะแนน ({bundle.lab.scoring.weight}%)
                                            </span>
                                        </div>

                                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                                                        {bundle.lab.id} · ROOM {roomNum}
                                                    </span>
                                                    <h5 className="text-base font-bold text-white mt-1 mb-1">
                                                        {bundle.lab.titleTh}
                                                    </h5>
                                                    <p className="text-xs text-slate-300 leading-relaxed m-0">
                                                        <strong>ใบงานปฏิบัติการ:</strong> {bundle.lab.workOrder}
                                                    </p>
                                                </div>
                                                {labGate.unlocked ? (
                                                    <a
                                                        href={`/labs/3d/room-${roomNum}`}
                                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
                                                    >
                                                        <span>🎮 เข้าสู่ห้องปฏิบัติการ 3D (Room {roomNum}) →</span>
                                                    </a>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-900 border border-amber-500/40 rounded-xl px-4 py-2.5 shrink-0">
                                                        <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                                                            <span>🔒</span>
                                                            <span>ห้องแล็บ 3D ถูกล็อก</span>
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            (ผ่าน {lessonProgress.completedCount}/10 บท หรือรอครูอนุมัติ)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Functional Tests Preview */}
                                            {bundle.lab.functionalTests && bundle.lab.functionalTests.length > 0 && (
                                                <div className="border-t border-slate-800/80 pt-3">
                                                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                                                        รายการทดสอบและตรวจรับรอง (Functional Acceptance Checklist):
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {bundle.lab.functionalTests.map((test) => (
                                                            <span
                                                                key={test.id}
                                                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
                                                            >
                                                                <span className="text-emerald-400 text-[10px]">●</span>
                                                                <span>{test.titleTh}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* หัวข้อที่ 3: แบบทดสอบ */}
                                    <section className="unit-section-box" aria-labelledby={`assessment-heading-${bundle.unit.id}`}>
                                        <div className="unit-section-box-header">
                                            <div className="unit-section-title">
                                                <span className="text-lg" aria-hidden="true">📝</span>
                                                <h4 id={`assessment-heading-${bundle.unit.id}`} className="m-0 text-white text-sm font-bold">
                                                    3. แบบทดสอบและการวัดผล (Assessments & Pipeline)
                                                </h4>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                                เกณฑ์รวม 100 คะแนน
                                            </span>
                                        </div>

                                        {/* Flow text breadcrumb */}
                                        <div className="py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-400 overflow-x-auto whitespace-nowrap mb-4">
                                            <span className="text-sky-400 font-bold mr-2">FLOW:</span>
                                            {bundle.assessmentFlow.join(' → ')}
                                        </div>

                                        {!examGate.unlocked && (
                                            <div className="mb-4 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center gap-3 text-xs">
                                                <span className="text-xl">🔒</span>
                                                <div>
                                                    <strong className="text-amber-300 font-bold block">
                                                        แบบทดสอบ (ปรนัย + อัตนัย) ถูกล็อกตามเกณฑ์การเรียนรู้
                                                    </strong>
                                                    <span className="text-slate-300">{examGate.reason}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactive Pipeline Cards */}
                                        <div className={`pipeline-grid ${!examGate.unlocked ? 'opacity-60 pointer-events-none' : ''}`}>
                                            {/* Pre-test & Knowledge Checks */}
                                            {bundle.assessments.map((asm, idx) => (
                                                <div key={asm.id} className="pipeline-card">
                                                    <div>
                                                        <div className="pipeline-card-header">
                                                            <span className="pipeline-badge text-sky-400 border border-sky-500/30">
                                                                {asm.id}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400 font-mono">
                                                                {idx === 0 ? '📝 Pre-test' : '💡 Check'}
                                                            </span>
                                                        </div>
                                                        <h4>{asm.titleTh}</h4>
                                                        <p>{asm.purpose}</p>
                                                    </div>
                                                    <div className="pipeline-card-footer">
                                                        <span className="text-xs font-mono text-emerald-400">
                                                            {asm.scoring.maxScore} คะแนน ({asm.scoring.weight}%)
                                                        </span>
                                                        <a
                                                            href={`/assessments#${asm.id}`}
                                                            className="px-2.5 py-1 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                                                        >
                                                            ทำแบบทดสอบ
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Fault Challenge */}
                                            <div className="pipeline-card card-fault">
                                                <div>
                                                    <div className="pipeline-card-header">
                                                        <span className="pipeline-badge text-amber-300 border border-amber-500/40">
                                                            {bundle.faultChallenge.id}
                                                        </span>
                                                        <span className="text-[11px] text-amber-300 font-bold font-mono">
                                                            🔍 Fault Challenge
                                                        </span>
                                                    </div>
                                                    <h4>{bundle.faultChallenge.titleTh}</h4>
                                                    <p>
                                                        กระบวนการสืบค้น 6 ขั้น: {bundle.faultChallenge.requiredProcess.join(' → ')}
                                                    </p>
                                                </div>
                                                <div className="pipeline-card-footer">
                                                    <span className="text-xs font-mono text-amber-300 font-bold">
                                                        {bundle.faultChallenge.scoring.maxScore} คะแนน (15%)
                                                    </span>
                                                    <a
                                                        href={`/assessments#${bundle.faultChallenge.id}`}
                                                        className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
                                                    >
                                                        เริ่มวิเคราะห์
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Reflection & Evidence */}
                                            <div className="pipeline-card card-reflection">
                                                <div>
                                                    <div className="pipeline-card-header">
                                                        <span className="pipeline-badge text-purple-300 border border-purple-500/40">
                                                            {bundle.reflection.id}
                                                        </span>
                                                        <span className="text-[11px] text-purple-300 font-bold font-mono">
                                                            📋 Reflection
                                                        </span>
                                                    </div>
                                                    <h4>{bundle.reflection.titleTh}</h4>
                                                    <p>
                                                        {bundle.reflection.prompts[0] || 'สรุปความรู้และหลักฐานการเรียนรู้ประจำหน่วย'}
                                                    </p>
                                                </div>
                                                <div className="pipeline-card-footer">
                                                    <span className="text-xs font-mono text-purple-300 font-bold">
                                                        {bundle.reflection.scoring.maxScore} คะแนน (5%)
                                                    </span>
                                                    <a
                                                        href={`/assessments#${bundle.reflection.id}`}
                                                        className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                                                    >
                                                        บันทึกสรุป
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
