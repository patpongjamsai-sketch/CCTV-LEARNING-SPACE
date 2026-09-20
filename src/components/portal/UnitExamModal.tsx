'use client';

import { useEffect, useMemo, useState } from 'react';
import { getUnitExamQuestions } from '../../data/unitExamQuestions';
import { getUnitSubjectiveQuestions } from '../../data/unitSubjectiveQuestions';
import {
    saveSubjectiveSubmission,
    getSubjectiveSubmissions,
    type SubjectiveSubmission,
} from '../../lib/progressionState';

export type UnitExamModalProps = {
    unitId: string;
    unitTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (score: number) => void;
};

const OPTION_PREFIXES = ['ก.', 'ข.', 'ค.', 'ง.'];
const TOTAL_EXAM_TIME_SECONDS = 15 * 60; // 15 minutes

export function UnitExamModal({
    unitId,
    unitTitle,
    isOpen,
    onClose,
    onComplete,
}: UnitExamModalProps) {
    const questions = useMemo(() => getUnitExamQuestions(unitId), [unitId]);
    const subjectiveQuestions = useMemo(() => getUnitSubjectiveQuestions(unitId), [unitId]);
    const [activeSection, setActiveSection] = useState<'objective' | 'subjective'>('objective');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(TOTAL_EXAM_TIME_SECONDS);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState<string | null>(null);

    // Subjective answers state
    const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<string, string>>({});
    const [existingSubjective, setExistingSubjective] = useState<SubjectiveSubmission | null>(null);
    const [isSubmittingSubjective, setIsSubmittingSubjective] = useState(false);
    const [subjectiveNotice, setSubjectiveNotice] = useState<string | null>(null);

    // Reset when modal opens or unit changes
    useEffect(() => {
        if (isOpen) {
            // Check for previous score
            const saved = localStorage.getItem(`cctv_unit_exam_${unitId}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data?.answers && typeof data.score === 'number') {
                        setSelectedAnswers(data.answers);
                        setScore(data.score);
                        setIsSubmitted(true);
                    }
                } catch {
                    // Start fresh
                }
            } else {
                setCurrentIndex(0);
                setSelectedAnswers({});
                setTimeLeft(TOTAL_EXAM_TIME_SECONDS);
                setIsSubmitted(false);
                setScore(0);
                setSavedNotice(null);
            }

            // Check existing subjective submission
            const allSubs = getSubjectiveSubmissions();
            const foundSub = allSubs.find((s) => s.unitId === unitId);
            if (foundSub) {
                setExistingSubjective(foundSub);
                setSubjectiveAnswers(foundSub.answers || {});
            } else {
                setExistingSubjective(null);
                setSubjectiveAnswers({});
            }
            setSubjectiveNotice(null);
        }
    }, [isOpen, unitId]);

    // Countdown Timer
    useEffect(() => {
        if (!isOpen || isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, isSubmitted, selectedAnswers]);

    if (!isOpen) return null;

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleSelectOption = (optionIndex: number) => {
        if (isSubmitted) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentIndex]: optionIndex,
        }));
    };

    const handleSubmitExam = async () => {
        // Calculate score
        let totalScore = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) {
                totalScore += 1;
            }
        });

        setScore(totalScore);
        setIsSubmitted(true);
        setIsSaving(true);

        // Persist to localStorage
        const resultRecord = {
            unitId,
            score: totalScore,
            maxScore: questions.length,
            passed: totalScore >= 7,
            answers: selectedAnswers,
            completedAt: new Date().toISOString(),
            timeSpentSeconds: TOTAL_EXAM_TIME_SECONDS - timeLeft,
        };
        localStorage.setItem(`cctv_unit_exam_${unitId}`, JSON.stringify(resultRecord));

        // Fire custom event for reactive dashboard updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cctv_exam_completed', { detail: resultRecord }));
        }

        // Attempt server submission if student is logged in with class
        try {
            const classId = localStorage.getItem('cctv_active_class_id');
            if (classId) {
                await fetch('/api/learning/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        kind: 'quiz',
                        classId,
                        quizId: `${unitId.toLowerCase()}-exam`,
                        answers: selectedAnswers,
                    }),
                });
            }
            setSavedNotice('บันทึกผลการสอบและคะแนนลงระบบสำเร็จ');
        } catch {
            setSavedNotice('บันทึกคะแนนสะสมในเครื่องสำเร็จ (ออฟไลน์)');
        } finally {
            setIsSaving(false);
            if (onComplete) {
                onComplete(totalScore);
            }
        }
    };

    const handleSubmitSubjective = () => {
        setIsSubmittingSubjective(true);
        const subRecord: SubjectiveSubmission = {
            id: `SUB-${unitId}-${Date.now()}`,
            unitId,
            studentCode: '67301',
            studentName: 'ผู้เรียน (Trainee)',
            submittedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
            answers: subjectiveAnswers,
            status: 'pending',
            maxScore: 10,
        };
        saveSubjectiveSubmission(subRecord);
        setExistingSubjective(subRecord);
        setIsSubmittingSubjective(false);
        setSubjectiveNotice('บันทึกและส่งข้อสอบอัตนัยไปยังศูนย์ตรวจของครูผู้สอนเรียบร้อยแล้ว');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cctv_subjective_submitted', { detail: subRecord }));
        }
    };

    const handleRetake = () => {
        localStorage.removeItem(`cctv_unit_exam_${unitId}`);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setTimeLeft(TOTAL_EXAM_TIME_SECONDS);
        setIsSubmitted(false);
        setScore(0);
        setSavedNotice(null);
    };

    const currentQuestion = questions[currentIndex] || questions[0];
    if (!currentQuestion) return null;
    const answeredCount = Object.keys(selectedAnswers).length;
    const isPassing = score >= 7;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
                                {unitId} · UNIT ASSESSMENT
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                แบบทดสอบประจำหน่วย (ปรนัย 10 ข้อ + อัตนัย Case Study)
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white m-0">
                            {unitTitle}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeSection === 'objective' && !isSubmitted && (
                            <div
                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm ${
                                    timeLeft < 120
                                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                                        : 'bg-slate-800/90 border-slate-700 text-sky-400'
                                }`}
                            >
                                <span className="text-xs">⏱️</span>
                                <span>{formatTimer(timeLeft)}</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="ปิดหน้าต่าง"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Dual Section Tabs: ปรนัย vs อัตนัย */}
                <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveSection('objective')}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeSection === 'objective'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>📝 ส่วนที่ 1: ข้อสอบปรนัย (10 ข้อ)</span>
                        {isSubmitted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-mono font-bold">
                                {score}/10
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('subjective')}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeSection === 'subjective'
                                ? 'border-amber-500 text-amber-300'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>✏️ ส่วนที่ 2: ข้อสอบอัตนัย (Case Study)</span>
                        {existingSubjective?.status === 'graded' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                                {existingSubjective.score}/{existingSubjective.maxScore}
                            </span>
                        ) : existingSubjective ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                                ส่งแล้ว รอตรวจ
                            </span>
                        ) : null}
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* SUBJECTIVE SECTION */}
                    {activeSection === 'subjective' && (
                        <div className="space-y-6">
                            {subjectiveNotice && (
                                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                                    <span>✓</span>
                                    <span>{subjectiveNotice}</span>
                                </div>
                            )}

                            {existingSubjective?.status === 'graded' && (
                                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-emerald-400">
                                            ผลการตรวจและประเมินโดยครูผู้สอน (Teacher Graded)
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                            ได้รับ {existingSubjective.score} / {existingSubjective.maxScore} คะแนน
                                        </span>
                                    </div>
                                    {existingSubjective.feedback && (
                                        <p className="text-xs text-slate-200 m-0 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                            <strong>ข้อเสนอแนะจากคุณครู:</strong> {existingSubjective.feedback}
                                        </p>
                                    )}
                                </div>
                            )}

                            {subjectiveQuestions.map((sq, sIdx) => (
                                <div key={sq.id} className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                                            ข้อที่ {sIdx + 1} (อัตนัย · เต็ม {sq.maxScore} คะแนน)
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {sq.id}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-base font-bold text-white m-0">
                                            {sq.titleTh}
                                        </h4>
                                        <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                                            <strong className="text-amber-400 block mb-1">📋 สถานการณ์ปัญหา (Scenario):</strong>
                                            {sq.scenario}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <strong className="text-xs text-slate-200 block">
                                            คำถามที่ต้องตอบ (Prompt):
                                        </strong>
                                        <p className="text-xs sm:text-sm text-sky-200 leading-relaxed m-0 font-medium">
                                            {sq.prompt}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <label htmlFor={`sub-ans-${sq.id}`} className="font-semibold text-slate-300">
                                                พิมพ์คำตอบและเหตุผลทางเทคนิคของคุณ:
                                            </label>
                                            <span className="font-mono text-[11px]">
                                                ความยาว: {(subjectiveAnswers[sq.id] || '').length} ตัวอักษร
                                            </span>
                                        </div>
                                        <textarea
                                            id={`sub-ans-${sq.id}`}
                                            rows={6}
                                            disabled={existingSubjective?.status === 'graded'}
                                            value={subjectiveAnswers[sq.id] || ''}
                                            onChange={(e) => setSubjectiveAnswers((prev) => ({ ...prev, [sq.id]: e.target.value }))}
                                            placeholder={sq.samplePlaceholder}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                                        />
                                    </div>

                                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                                        <span className="font-bold text-slate-300 block">🎯 แนวคิดและคำสำคัญที่ควรมีในคำตอบ:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {sq.expectedConcepts.map((concept) => (
                                                <span key={concept} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                                    • {concept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Submit Subjective Action */}
                            {existingSubjective?.status !== 'graded' && (
                                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <span className="text-xs text-slate-400">
                                        เมื่อส่งคำตอบแล้ว ระบบจะส่งตรงไปยังแดชบอร์ดของครูผู้สอนเพื่อตรวจให้คะแนน
                                    </span>
                                    <button
                                        type="button"
                                        disabled={isSubmittingSubjective || Object.keys(subjectiveAnswers).length === 0}
                                        onClick={handleSubmitSubjective}
                                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                                    >
                                        {isSubmittingSubjective ? 'กำลังส่ง...' : '📤 ส่งข้อสอบอัตนัยให้ครูตรวจ'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* OBJECTIVE SECTION */}
                    {activeSection === 'objective' && (
                        <div>
                    {!isSubmitted ? (
                        <>
                            {/* Stepper Navigator (1..10) */}
                            <div className="flex items-center justify-between gap-1 p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                                {questions.map((q, idx) => {
                                    const isCurrent = idx === currentIndex;
                                    const isAnswered = selectedAnswers[idx] !== undefined;

                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                                                isCurrent
                                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-2 ring-sky-400'
                                                    : isAnswered
                                                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Question Card */}
                            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 font-mono">
                                        ข้อที่ {currentIndex + 1} จาก {questions.length}
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        {currentQuestion.lessonId} · {currentQuestion.lessonTitle}
                                    </span>
                                </div>

                                <h4 className="text-base font-semibold text-white leading-relaxed">
                                    {currentQuestion.prompt}
                                </h4>

                                {/* Choices */}
                                <div className="space-y-2.5 pt-2">
                                    {currentQuestion.choices.map((choice, cIdx) => {
                                        const isSelected = selectedAnswers[currentIndex] === cIdx;

                                        return (
                                            <button
                                                key={cIdx}
                                                type="button"
                                                onClick={() => handleSelectOption(cIdx)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-sky-950/40 border-sky-500/80 text-white shadow-md shadow-sky-500/20'
                                                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                                                }`}
                                            >
                                                <span
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'bg-sky-500 text-white'
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {OPTION_PREFIXES[cIdx]}
                                                </span>
                                                <span className="text-sm pt-0.5 leading-relaxed">
                                                    {choice}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Exam Results & Question Review */
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <div
                                className={`p-6 rounded-2xl border text-center space-y-3 ${
                                    isPassing
                                        ? 'bg-emerald-950/30 border-emerald-500/40'
                                        : 'bg-amber-950/30 border-amber-500/40'
                                }`}
                            >
                                <div className="text-4xl">
                                    {isPassing ? '🎉' : '📖'}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-1">
                                        {isPassing ? 'ผ่านการประเมินประจำหน่วย!' : 'ยังไม่ผ่านเกณฑ์มาตรฐาน'}
                                    </h4>
                                    <p className="text-xs text-slate-300">
                                        เกณฑ์ผ่านคือ 70% (7 จาก 10 คะแนน)
                                    </p>
                                </div>

                                <div className="inline-flex items-baseline gap-2 px-6 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-inner">
                                    <span className="text-3xl font-black font-mono text-sky-400">
                                        {score}
                                    </span>
                                    <span className="text-sm font-mono text-slate-400">
                                        / 10 คะแนน ({score * 10}%)
                                    </span>
                                </div>

                                {savedNotice && (
                                    <p className="text-xs text-emerald-400 font-mono">
                                        ✓ {savedNotice}
                                    </p>
                                )}

                                <div className="pt-2 flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleRetake}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
                                    >
                                        🔄 ทำแบบทดสอบใหม่อีกครั้ง
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-sky-600/30"
                                    >
                                        ✓ บันทึกผลและปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Review */}
                            <div className="space-y-4">
                                <h5 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                    เฉลยและคำอธิบายทางวิศวกรรม (Detailed Review)
                                </h5>

                                {questions.map((q, idx) => {
                                    const userAnswer = selectedAnswers[idx];
                                    const isCorrect = userAnswer === q.answer;

                                    return (
                                        <div
                                            key={q.id}
                                            className={`p-5 rounded-2xl border ${
                                                isCorrect
                                                    ? 'bg-slate-950/40 border-emerald-500/30'
                                                    : 'bg-slate-950/40 border-rose-500/30'
                                            } space-y-3`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                                                            isCorrect
                                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                        }`}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        {q.lessonTitle}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                                                        isCorrect
                                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                                    }`}
                                                >
                                                    {isCorrect ? '✓ ถูกต้อง (+1)' : '✕ ไม่ถูกต้อง (0)'}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-white">
                                                {q.prompt}
                                            </p>

                                            <div className="space-y-1 text-xs">
                                                <div className="text-slate-300">
                                                    <strong className="text-slate-400">คำตอบของคุณ: </strong>
                                                    <span className={isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                                        {userAnswer !== undefined
                                                            ? `${OPTION_PREFIXES[userAnswer]} ${q.choices[userAnswer]}`
                                                            : 'ไม่ได้เลือกคำตอบ'}
                                                    </span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="text-emerald-300">
                                                        <strong className="text-slate-400">คำตอบที่ถูกต้อง: </strong>
                                                        <span className="font-semibold">
                                                            {OPTION_PREFIXES[q.answer]} {q.choices[q.answer]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                                                <strong className="text-sky-400 block mb-0.5">💡 คำอธิบายทางเทคนิค:</strong>
                                                {q.explanation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    </div>
                    )}
                </div>

                {/* Footer Controls (when exam in progress) */}
                {activeSection === 'objective' && !isSubmitted && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4 shrink-0">
                        <button
                            type="button"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-200 transition-colors"
                        >
                            ← ข้อก่อนหน้า
                        </button>

                        <div className="text-xs text-slate-400 font-mono">
                            ตอบแล้ว {answeredCount} / {questions.length} ข้อ
                        </div>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors shadow-md shadow-sky-600/30"
                            >
                                ข้อถัดไป →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmitExam}
                                disabled={isSaving}
                                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                            >
                                {isSaving ? 'กำลังตรวจผล...' : '✓ ส่งคำตอบและตรวจผล'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
