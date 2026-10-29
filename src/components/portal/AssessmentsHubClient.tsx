'use client';

import { useEffect, useState, useMemo } from 'react';
import type { UnitContentBundle } from '../../content/courses/21909-2020';
import { FaultChallengeModal } from './FaultChallengeModal';
import { ReflectionModal } from './ReflectionModal';
import { isAssessmentUnlocked, syncTeacherApprovalsFromApi } from '../../lib/progressionState';
import { getUnitSubjectiveQuestions, type SubjectiveQuestion } from '../../data/unitSubjectiveQuestions';

export type AssessmentsHubClientProps = {
    bundles: UnitContentBundle[];
};

export function AssessmentsHubClient({ bundles }: AssessmentsHubClientProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>('U01');
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);
    const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);

    const [faultSubmissions, setFaultSubmissions] = useState<Record<string, { status: string; submittedAt: string; count?: number }>>({});
    const [questionSubmissionMap, setQuestionSubmissionMap] = useState<Record<string, boolean>>({});
    const [reflections, setReflections] = useState<Record<string, { submittedAt: string }>>({});
    const [serverFeedback, setServerFeedback] = useState<{ status: string; score: number | null; feedback: string | null } | null>(null);

    const [currentUser, setCurrentUser] = useState<{ displayName: string; studentCode?: string; role: string } | null>(null);

    const activeBundle = bundles.find((b) => b.unit.id === selectedUnitId) || bundles[0];

    const currentUnitQuestions: SubjectiveQuestion[] = useMemo(() => {
        if (!activeBundle) return [];
        return getUnitSubjectiveQuestions(activeBundle.unit.id);
    }, [activeBundle]);

    // Reload saved submissions from localStorage
    const reloadSavedStates = () => {
        const faults: Record<string, { status: string; submittedAt: string; count?: number }> = {};
        const qMap: Record<string, boolean> = {};
        const refls: Record<string, { submittedAt: string }> = {};

        bundles.forEach((b) => {
            const uid = b.unit.id;
            const uQuestions = getUnitSubjectiveQuestions(uid);
            let submittedCount = 0;
            let lastSubmittedAt = '';

            uQuestions.forEach((q) => {
                const qKey = `cctv_subjective_submission_${uid}_${q.id}`;
                const savedQ = localStorage.getItem(qKey);
                if (savedQ) {
                    try {
                        const parsed = JSON.parse(savedQ);
                        if (parsed?.submittedAt) {
                            qMap[`${uid}_${q.id}`] = true;
                            submittedCount++;
                            lastSubmittedAt = parsed.submittedAt;
                        }
                    } catch {
                        // ignore
                    }
                }
            });

            // Legacy fault submission fallback
            const savedFault = localStorage.getItem(`cctv_fault_submission_${uid}`);
            if (savedFault) {
                try {
                    const parsed = JSON.parse(savedFault);
                    if (parsed?.submittedAt) {
                        if (submittedCount === 0) {
                            submittedCount = 1;
                            lastSubmittedAt = parsed.submittedAt;
                            if (uQuestions[0]) {
                                qMap[`${uid}_${uQuestions[0].id}`] = true;
                            }
                        }
                    }
                } catch {
                    // ignore
                }
            }

            if (submittedCount > 0) {
                faults[uid] = {
                    status: 'under_review',
                    submittedAt: lastSubmittedAt,
                    count: submittedCount,
                };
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

        setFaultSubmissions(faults);
        setQuestionSubmissionMap(qMap);
        setReflections(refls);
    };

    useEffect(() => {
        reloadSavedStates();

        fetch('/api/auth/me', { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user) {
                    setCurrentUser(data.user);
                }
                if (data?.membership?.classId && typeof window !== 'undefined') {
                    localStorage.setItem('cctv_active_class_id', data.membership.classId);
                }
            })
            .catch(() => {
                // ignore
            });

        const handleFaultEvent = () => reloadSavedStates();
        const handleReflEvent = () => reloadSavedStates();

        void syncTeacherApprovalsFromApi();
        window.addEventListener('cctv_fault_submitted', handleFaultEvent);
        window.addEventListener('cctv_subjective_submitted', handleFaultEvent);
        window.addEventListener('cctv_reflection_saved', handleReflEvent);

        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            if (hash.startsWith('U0')) {
                const targetUnit = hash.substring(0, 3);
                if (bundles.some((b) => b.unit.id === targetUnit)) {
                    setSelectedUnitId(targetUnit);
                }
                if (hash.includes('-F01') || hash.includes('-SUB') || hash.includes('-A01')) {
                    setIsFaultModalOpen(true);
                } else if (hash.includes('-R01')) {
                    setIsReflectionModalOpen(true);
                }
            }
        }

        return () => {
            window.removeEventListener('cctv_fault_submitted', handleFaultEvent);
            window.removeEventListener('cctv_subjective_submitted', handleFaultEvent);
            window.removeEventListener('cctv_reflection_saved', handleReflEvent);
        };
    }, [bundles]);

    // Load server-side review feedback whenever selected unit changes
    useEffect(() => {
        fetch(`/api/learning/subjective?unitId=${encodeURIComponent(selectedUnitId)}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.submission) {
                    setServerFeedback({
                        status: data.submission.status,
                        score: data.submission.score,
                        feedback: data.submission.feedback,
                    });
                } else {
                    setServerFeedback(null);
                }
            })
            .catch(() => setServerFeedback(null));
    }, [selectedUnitId]);

    if (!activeBundle) return null;

    const activeFault = faultSubmissions[activeBundle.unit.id];
    const activeReflection = reflections[activeBundle.unit.id];
    const assessmentGate = isAssessmentUnlocked(activeBundle.unit.id);

    const handleOpenDiagnosticModal = (questionId?: string) => {
        setSelectedQuestionId(questionId);
        setIsFaultModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* User Profile Connected Banner */}
            {currentUser && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm" aria-hidden="true">
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
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-mono text-xs">
                            สถานะ: {currentUser.role === 'teacher' ? 'ครูผู้สอน' : currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                        </span>
                    </div>
                </div>
            )}

            {/* Unit Selector Bar (Interactive Pills U01-U08) */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">🔍</span>
                        <div>
                            <strong className="text-white text-base block">
                                เลือกหน่วยการเรียนรู้ที่ต้องการประเมินสมรรถนะ
                            </strong>
                            <span className="text-xs text-slate-400">
                                สลับหน่วยที่ 1 ถึง 8 เพื่อทำแบบทดสอบอัตนัยวิเคราะห์ปัญหาด้วยหลักฐาน (6 ขั้นตอน) และบันทึกการสะท้อนคิด
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
                            className="bg-slate-950 border border-slate-700 text-amber-400 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors"
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
                        const fState = faultSubmissions[b.unit.id];
                        const uQuestions = getUnitSubjectiveQuestions(b.unit.id);
                        const isAllSubmitted = fState && fState.count && fState.count >= uQuestions.length;

                        return (
                            <button
                                key={b.unit.id}
                                type="button"
                                onClick={() => setSelectedUnitId(b.unit.id)}
                                className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold">{b.unit.id}</span>
                                    {isAllSubmitted ? (
                                        <span className="text-[10px] text-emerald-400 font-bold">✓ ครบแล้ว</span>
                                    ) : fState ? (
                                        <span className="text-[10px] text-amber-400 font-bold">🟡 {fState.count || 1}/{uQuestions.length}</span>
                                    ) : null}
                                </div>
                                <div className="text-[11px] truncate mt-1 text-slate-300 font-medium">
                                    หน่วยที่ {b.unit.number}
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-0.5">
                                    <span>{uQuestions.length} ข้ออัตนัย</span>
                                    <span>·</span>
                                    <span>{fState ? 'เสร็จแล้ว' : 'รอทำ'}</span>
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

            {/* Unit Outcome & Pre-LAB Safety Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-amber-400 font-mono font-bold text-sm">
                            {activeBundle.unit.id} : หน่วยการเรียนรู้ที่ {activeBundle.unit.number} - {activeBundle.unit.titleTh}
                        </span>
                        {/* Contract test anchor for Uxx-A04 */}
                        <span id={`${activeBundle.unit.id}-A04`} className="px-2 py-0.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 text-[11px] font-mono">
                            [{activeBundle.unit.id}-A04] Pre-LAB Safety Gate
                        </span>
                    </div>
                    <p className="text-slate-400 m-0 leading-relaxed max-w-3xl">
                        {activeBundle.unit.learningOutcome}
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    <a
                        href={`/labs/3d/room-${activeBundle.unit.number + 100}`}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
                    >
                        <span>🚪 ห้องทดลอง 3D ({activeBundle.unit.number + 100})</span>
                    </a>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* Primary Centerpiece: แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน */}
            {/* (Contract test anchor: Uxx-A01 and Uxx-F01) */}
            {/* ========================================================================= */}
            <div
                id={`${activeBundle.unit.id}-A01`}
                className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden ${
                    !assessmentGate.unlocked ? 'opacity-70' : ''
                }`}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Section Header */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                id={activeBundle.faultChallenge.id}
                                className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            >
                                {activeBundle.unit.id}-A01 · {activeBundle.faultChallenge.id} · FAULT CHALLENGE
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800/50">
                                6 STEPS EVIDENCE-BASED DIAGNOSTIC
                            </span>
                        </div>
                        <span className="text-xs text-amber-300 font-mono font-bold bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800/40">
                            น้ำหนักประเมิน 20 คะแนน (Rubric Assessment)
                        </span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white m-0 flex items-center gap-2.5">
                            <span className="text-amber-400">🔍</span>
                            <span>แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน</span>
                        </h2>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-4xl">
                            การประเมินสมรรถนะการวินิจฉัยและแก้ไขข้อผิดพลาดทางเทคนิคตามมาตรฐานช่างกล้องวงจรปิดมืออาชีพ
                            วิเคราะห์สถานการณ์หน้างานจริง สืบหาสาเหตุ ทดสอบด้วยเครื่องมือวัด และบันทึกหลักฐานเชิงประจักษ์
                        </p>
                    </div>

                    {/* Process Flow Badge */}
                    <div className="py-2.5 px-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap flex items-center gap-2">
                        <span className="text-amber-400 font-bold">ระเบียบวิธี 6 ขั้นตอน:</span>
                        <span>1. ระบุปัญหา</span>
                        <span className="text-amber-500">→</span>
                        <span>2. สันนิษฐานสาเหตุ</span>
                        <span className="text-amber-500">→</span>
                        <span>3. ตรวจวัดด้วยเครื่องมือ</span>
                        <span className="text-amber-500">→</span>
                        <span className="text-emerald-400 font-bold">4. ผลการตรวจวัด (แนบภาพหลักฐาน)</span>
                        <span className="text-amber-500">→</span>
                        <span>5. แก้ไขที่ต้นเหตุ</span>
                        <span className="text-amber-500">→</span>
                        <span>6. ทดสอบซ้ำเพื่อส่งมอบ</span>
                    </div>
                </div>

                {/* Teacher Review Feedback Banner (if reviewed by teacher) */}
                {serverFeedback?.status === 'revision_required' ? (
                    <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/60 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                            <span>⚠️</span>
                            <span>ครูผู้สอนส่งข้อคิดเห็นขอให้ปรับปรุงแก้ไข (Revision Required)</span>
                        </div>
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-200">
                            <strong>คำแนะนำจากครู:</strong> {serverFeedback.feedback || 'โปรดปรับปรุงคำตอบตามเกณฑ์'}
                            {serverFeedback.score !== null && (
                                <span className="block mt-1 font-mono font-bold text-amber-300">
                                    คะแนนที่ได้เบื้องต้น: {serverFeedback.score} / 20 คะแนน
                                </span>
                            )}
                        </div>
                    </div>
                ) : serverFeedback?.status === 'graded' || serverFeedback?.status === 'approved' ? (
                    <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                            <span>✓</span>
                            <span>ผลการประเมิน: ผ่านเกณฑ์แล้ว (Approved) · คะแนน {serverFeedback.score || 0} / 20 คะแนน</span>
                        </div>
                        {serverFeedback.feedback && (
                            <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-slate-200">
                                <strong>ข้อคิดเห็นจากครู:</strong> {serverFeedback.feedback}
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Question Scenarios Grid */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 font-bold">
                            ชุดสถานการณ์วิเคราะห์ปัญหาประจำหน่วย ({currentUnitQuestions.length} ข้อ):
                        </span>
                        {activeFault && (
                            <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                ส่งแล้ว {activeFault.count || 1}/{currentUnitQuestions.length} ข้อ
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentUnitQuestions.map((q) => {
                            const isSubmitted = Boolean(questionSubmissionMap[`${activeBundle.unit.id}_${q.id}`]);

                            return (
                                <div
                                    key={q.id}
                                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold">
                                                ข้อที่ {q.order} · {q.id}
                                            </span>
                                            <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                                {q.titleTh}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 m-0">
                                            {q.scenario}
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                เกณฑ์คะแนน: {q.maxScore} คะแนน (นน. {q.maxScore}%)
                                            </span>
                                            <span className="text-slate-600">·</span>
                                            <span className="text-[10px] text-amber-400/90 font-mono">
                                                📷 รองรับการแนบภาพถ่ายหลักฐาน
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-end justify-center gap-2">
                                        <div className="text-xs">
                                            {serverFeedback?.status === 'revision_required' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold font-mono">
                                                    <span>⚠️</span>
                                                    <span>ขอให้แก้ไข</span>
                                                </span>
                                            ) : serverFeedback?.status === 'graded' || serverFeedback?.status === 'approved' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 font-bold font-mono">
                                                    <span>✓</span>
                                                    <span>ผ่านแล้ว ({serverFeedback.score || 0}/20)</span>
                                                </span>
                                            ) : isSubmitted ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-800/50 text-sky-300 font-bold font-mono">
                                                    <span>✓</span>
                                                    <span>ส่งตรวจแล้ว (รอผล)</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                                                    รอการส่งคำตอบ
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenDiagnosticModal(q.id)}
                                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span>🔍</span>
                                            <span>
                                                {serverFeedback?.status === 'revision_required'
                                                    ? 'แก้ไขคำตอบตามคำแนะนำครู →'
                                                    : isSubmitted
                                                        ? 'ดูคำตอบ / ปรับปรุงคำตอบ'
                                                        : 'เริ่มทำข้อสอบอัตนัย →'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* Lower Section: การสะท้อนคิดและจรรยาบรรณวิชาชีพช่าง CCTV (Self Reflection) */}
            {/* ========================================================================= */}
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
                        {/* Contract test anchor for Uxx-LAB01 */}
                        <span id={activeBundle.lab.id} className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[11px] font-mono">
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

            {/* Modals */}
            <FaultChallengeModal
                unitId={activeBundle.unit.id}
                unitTitle={activeBundle.unit.titleTh}
                faultTitle={activeBundle.faultChallenge.titleTh}
                initialQuestionId={selectedQuestionId}
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
