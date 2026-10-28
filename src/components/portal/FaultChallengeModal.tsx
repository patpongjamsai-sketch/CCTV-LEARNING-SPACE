'use client';

import { useEffect, useState, useMemo } from 'react';
import { getUnitSubjectiveQuestions, type SubjectiveQuestion } from '../../data/unitSubjectiveQuestions';

export type FaultChallengeModalProps = {
    unitId: string;
    unitTitle: string;
    faultTitle?: string;
    initialQuestionId?: string;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
};

type FormDataState = {
    problem: string;
    possibleCauses: string;
    testMethod: string;
    testResult: string;
    evidenceFileName: string;
    evidenceFilePreview: string | null;
    solution: string;
    retestResult: string;
};

const DEFAULT_FORM: FormDataState = {
    problem: '',
    possibleCauses: '',
    testMethod: '',
    testResult: '',
    evidenceFileName: '',
    evidenceFilePreview: null,
    solution: '',
    retestResult: '',
};

export function FaultChallengeModal({
    unitId,
    unitTitle,
    faultTitle,
    initialQuestionId,
    isOpen,
    onClose,
    onComplete,
}: FaultChallengeModalProps) {
    const questions: SubjectiveQuestion[] = useMemo(() => getUnitSubjectiveQuestions(unitId), [unitId]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
        initialQuestionId || questions[0]?.id || ''
    );

    const activeQuestion = useMemo(() => {
        return questions.find((q) => q.id === selectedQuestionId) || questions[0] || null;
    }, [questions, selectedQuestionId]);

    const [formData, setFormData] = useState<FormDataState>(DEFAULT_FORM);
    const [subAnswers, setSubAnswers] = useState<Record<string, string>>({});
    const [studentName, setStudentName] = useState<string>('');
    const [studentCode, setStudentCode] = useState<string>('');
    const [activeStep, setActiveStep] = useState<number>(1);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [submittedAt, setSubmittedAt] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const hasSubQuestions = Boolean(activeQuestion?.subQuestions && activeQuestion.subQuestions.length > 0);
    const subQuestions = useMemo(() => activeQuestion?.subQuestions || [], [activeQuestion]);

    // Load user profile from session/auth or localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedName = localStorage.getItem('cctv_student_name');
            const savedCode = localStorage.getItem('cctv_student_code');
            if (savedName) setStudentName(savedName);
            if (savedCode) setStudentCode(savedCode);

            fetch('/api/auth/me', { cache: 'no-store' })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.user) {
                        setStudentName((prev) => prev || data.user.displayName || '');
                        setStudentCode((prev) => prev || data.user.studentCode || '');
                    }
                })
                .catch(() => {});
        }
    }, []);

    // Update selectedQuestionId if initialQuestionId changes
    useEffect(() => {
        if (initialQuestionId) {
            setSelectedQuestionId(initialQuestionId);
        } else if (questions.length > 0 && !questions.some((q) => q.id === selectedQuestionId)) {
            const first = questions[0];
            if (first) {
                setSelectedQuestionId(first.id);
            }
        }
    }, [initialQuestionId, questions, selectedQuestionId]);

    // Load saved submission whenever modal opens or selected question changes
    useEffect(() => {
        if (isOpen && activeQuestion) {
            const qKey = `cctv_subjective_submission_${unitId}_${activeQuestion.id}`;
            const legacyKey = `cctv_fault_submission_${unitId}`;
            const saved = localStorage.getItem(qKey) || (activeQuestion.order === 1 ? localStorage.getItem(legacyKey) : null);

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    let foundData = false;
                    if (parsed?.subAnswers) {
                        setSubAnswers(parsed.subAnswers);
                        foundData = true;
                    } else {
                        setSubAnswers({});
                    }
                    if (parsed?.formData) {
                        setFormData(parsed.formData);
                        foundData = true;
                    }
                    if (foundData) {
                        setIsSubmitted(true);
                        setSubmittedAt(parsed.submittedAt || null);
                        if (parsed.studentName) setStudentName(parsed.studentName);
                        if (parsed.studentCode) setStudentCode(parsed.studentCode);
                        return;
                    }
                } catch {
                    // ignore
                }
            }

            setFormData(DEFAULT_FORM);
            setSubAnswers({});
            setActiveStep(1);
            setIsSubmitted(false);
            setSubmittedAt(null);
            setStatusMessage(null);
        }
    }, [isOpen, unitId, activeQuestion]);

    // Sub-question status check
    const completedSubCount = subQuestions.filter((sq) => Boolean(subAnswers[sq.id]?.trim())).length;
    const isAllSubComplete = subQuestions.length > 0 && completedSubCount === subQuestions.length;
    const missingSubList = subQuestions
        .filter((sq) => !subAnswers[sq.id]?.trim())
        .map((sq) => sq.label.split(':')[0]?.trim() || sq.label);

    // Validation of all 6 steps/topics (legacy)
    const topicsStatus = [
        { step: 1, name: 'การระบุปัญหา', isFilled: Boolean(formData.problem.trim()) },
        { step: 2, name: 'การวิเคราะห์สาเหตุที่เป็นไปได้', isFilled: Boolean(formData.possibleCauses.trim()) },
        { step: 3, name: 'วิธีการทดสอบและเครื่องมือวัด', isFilled: Boolean(formData.testMethod.trim()) },
        { step: 4, name: 'ผลการตรวจวัดและแนบหลักฐาน', isFilled: Boolean(formData.testResult.trim()) },
        { step: 5, name: 'วิธีการและมาตรการแก้ไขปัญหา', isFilled: Boolean(formData.solution.trim()) },
        { step: 6, name: 'ผลการทดสอบซ้ำเพื่อส่งมอบงาน', isFilled: Boolean(formData.retestResult.trim()) },
    ];
    const completedLegacyCount = topicsStatus.filter((t) => t.isFilled).length;
    const isAllLegacyComplete = completedLegacyCount === 6;
    const missingLegacyList = topicsStatus.filter((t) => !t.isFilled).map((t) => `ขั้นตอนที่ ${t.step}`);

    // Unified completeness
    const isAllTopicsComplete = hasSubQuestions ? isAllSubComplete : isAllLegacyComplete;
    const completedTopicsCount = hasSubQuestions ? completedSubCount : completedLegacyCount;
    const totalTopicsCount = hasSubQuestions ? subQuestions.length : 6;
    const missingTopicsList = hasSubQuestions ? missingSubList : missingLegacyList;

    if (!isOpen) return null;

    const handleFieldChange = (field: keyof FormDataState, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubAnswerChange = (subQuestionId: string, value: string) => {
        setSubAnswers((prev) => ({
            ...prev,
            [subQuestionId]: value,
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                evidenceFileName: file.name,
                evidenceFilePreview: reader.result as string,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveEvidence = () => {
        setFormData((prev) => ({
            ...prev,
            evidenceFileName: '',
            evidenceFilePreview: null,
        }));
    };

    const handleLoadSample = () => {
        if (hasSubQuestions && activeQuestion?.subQuestions) {
            const sampleMap: Record<string, string> = {};
            activeQuestion.subQuestions.forEach((sq) => {
                sampleMap[sq.id] = sq.sampleAnswer || '';
            });
            setSubAnswers(sampleMap);
            setFormData((prev) => ({
                ...prev,
                evidenceFileName: 'cctv_engineering_evidence_sample.jpg',
                evidenceFilePreview: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
            }));
        } else if (activeQuestion?.sample6Steps) {
            setFormData({
                problem: activeQuestion.sample6Steps.problem,
                possibleCauses: activeQuestion.sample6Steps.possibleCauses,
                testMethod: activeQuestion.sample6Steps.testMethod,
                testResult: activeQuestion.sample6Steps.testResult,
                evidenceFileName: activeQuestion.sample6Steps.evidenceFileName || 'diagnostic_measurement_evidence.jpg',
                evidenceFilePreview: activeQuestion.sample6Steps.evidenceFilePreview || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
                solution: activeQuestion.sample6Steps.solution,
                retestResult: activeQuestion.sample6Steps.retestResult,
            });
        } else {
            setFormData(DEFAULT_FORM);
        }
    };

    // Download JSON export function (No server submission)
    const handleDownloadJson = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!isAllTopicsComplete) {
            alert(`กรุณาตอบคำถามให้ครบทุกประเด็นย่อยก่อนดาวน์โหลดไฟล์ JSON (ยังขาด: ${missingTopicsList.join(', ')})`);
            return;
        }

        const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
        const qId = activeQuestion?.id || `${unitId}-F01`;
        const safeStudentCode = (studentCode.trim() || 'student').replace(/[^a-zA-Z0-9_-]/g, '');

        const exportPayload = {
            reportTitle: hasSubQuestions
                ? 'แบบทดสอบอัตนัย: การวิเคราะห์ปัญหาและสมรรถนะวิชาชีพ CCTV'
                : 'แบบทดสอบอัตนัย: รายงานการวิเคราะห์ปัญหาด้วยหลักฐาน 6 ขั้นตอน (Evidence-Based Diagnostic)',
            courseCode: '21909-2020',
            courseName: 'การติดตั้งและบำรุงรักษาระบบโทรทัศน์วงจรปิด (CCTV System)',
            institution: 'วิทยาลัยเทคนิคอุบลราชธานี',
            unit: {
                id: unitId,
                title: unitTitle,
            },
            question: {
                id: qId,
                order: activeQuestion?.order || 1,
                titleTh: activeQuestion?.titleTh || faultTitle || 'แบบทดสอบอัตนัย',
                scenario: activeQuestion?.scenario || '',
                prompt: activeQuestion?.prompt || '',
                maxScore: activeQuestion?.maxScore || 10,
            },
            student: {
                displayName: studentName.trim() || 'ไม่ระบุชื่อ',
                studentCode: studentCode.trim() || 'ไม่ระบุรหัส',
            },
            downloadedAt: timestamp,
            status: 'completed_and_downloaded',
            completeness: {
                completedTopicsCount,
                totalTopicsCount,
                isAllTopicsComplete: true,
            },
            ...(hasSubQuestions
                ? {
                      subQuestionAnswers: subQuestions.map((sq) => ({
                          id: sq.id,
                          label: sq.label,
                          questionPrompt: sq.prompt,
                          answer: subAnswers[sq.id] || '',
                      })),
                  }
                : {
                      sixStepsDiagnosticAnswers: {
                          step1_problem: formData.problem,
                          step2_possibleCauses: formData.possibleCauses,
                          step3_testMethod: formData.testMethod,
                          step4_testResult: formData.testResult,
                          step5_solution: formData.solution,
                          step6_retestResult: formData.retestResult,
                      },
                  }),
            evidenceAttachment: {
                fileName: formData.evidenceFileName || null,
                hasImageAttached: Boolean(formData.evidenceFilePreview),
            },
        };

        const jsonString = JSON.stringify(exportPayload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cctv_subjective_${unitId}_${qId}_${safeStudentCode}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const record = {
            unitId,
            questionId: qId,
            questionTitle: activeQuestion?.titleTh || faultTitle || 'แบบทดสอบอัตนัย',
            formData,
            subAnswers,
            studentName,
            studentCode,
            submittedAt: timestamp,
            status: 'downloaded',
        };

        localStorage.setItem(`cctv_subjective_submission_${unitId}_${qId}`, JSON.stringify(record));
        localStorage.setItem(`cctv_fault_submission_${unitId}`, JSON.stringify(record));
        if (studentName) localStorage.setItem('cctv_student_name', studentName);
        if (studentCode) localStorage.setItem('cctv_student_code', studentCode);

        // Sync with Supabase Database via API to unlock 3D Lab immediately
        fetch('/api/learning/subjective', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                unitId,
                questionId: qId,
                answers: hasSubQuestions ? subAnswers : formData,
                studentName,
                studentCode,
            }),
        }).catch((err) => {
            console.warn('API subjective submission sync warning:', err);
        });

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cctv_fault_submitted', { detail: record }));
            window.dispatchEvent(new CustomEvent('cctv_subjective_submitted', { detail: record }));
        }

        setIsSubmitted(true);
        setSubmittedAt(timestamp);
        setStatusMessage(
            hasSubQuestions
                ? `บันทึกคำตอบอัตนัยครบทั้ง ${totalTopicsCount} ประเด็นลงในไฟล์ JSON สำเร็จเรียบร้อย สามารถนำไฟล์นี้ส่งให้อาจารย์ผู้สอนได้ทันที`
                : 'ดาวน์โหลดไฟล์ผลงาน JSON สำเร็จเรียบร้อย สามารถนำไฟล์นี้ส่งให้อาจารย์ผู้สอนได้ทันที'
        );
        if (onComplete) onComplete();
    };

    const handleResetToEdit = () => {
        setIsSubmitted(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                                {activeQuestion?.id || `${unitId}-F01`} · {hasSubQuestions ? 'DIAGNOSTIC PROMPT ASSESSMENT' : 'EVIDENCE-BASED DIAGNOSTIC'}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                {unitTitle} · {hasSubQuestions ? `คำถามวิเคราะห์ ${totalTopicsCount} ประเด็น` : 'อัตนัย 6 ขั้นตอน'} ({activeQuestion?.maxScore || 10} คะแนน)
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white m-0">
                            {activeQuestion?.titleTh || faultTitle || 'แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน'}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isSubmitted && (
                            <button
                                type="button"
                                onClick={handleLoadSample}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="ใส่ข้อมูลกรณีศึกษาตัวอย่างเพื่อการเรียนรู้"
                            >
                                <span>💡</span>
                                <span>โหลดกรณีศึกษาตัวอย่าง</span>
                            </button>
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

                {/* Multiple Questions Selector Tabs if more than 1 question in unit */}
                {questions.length > 1 && (
                    <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
                        <span className="text-xs text-slate-400 font-mono shrink-0">เลือกข้ออัตนัย:</span>
                        {questions.map((q) => {
                            const isSelected = q.id === activeQuestion?.id;
                            const isSaved = typeof window !== 'undefined' && Boolean(localStorage.getItem(`cctv_subjective_submission_${unitId}_${q.id}`));
                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setSelectedQuestionId(q.id)}
                                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                                    }`}
                                >
                                    <span>ข้อที่ {q.order}</span>
                                    {isSaved && <span className="text-[10px]">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Scenario and Prompt Box */}
                    {activeQuestion && (
                        <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/20 space-y-3">
                            <div>
                                <span className="text-[11px] font-mono text-amber-400 block mb-1">
                                    🏢 บริบทสถานการณ์จริง (Field Scenario):
                                </span>
                                <p className="text-xs text-slate-200 leading-relaxed m-0 font-medium">
                                    {activeQuestion.scenario}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80">
                                <span className="text-[11px] font-mono text-sky-400 block mb-1">
                                    📋 ประเด็นคำถามที่ต้องวิเคราะห์ (Diagnostic Prompt):
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed m-0">
                                    {activeQuestion.prompt}
                                </p>
                            </div>

                            {activeQuestion.expectedConcepts.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">แนวคิดสำคัญ:</span>
                                    {activeQuestion.expectedConcepts.map((concept, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono"
                                        >
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Badge when downloaded */}
                    {isSubmitted && (
                        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                    <strong className="text-sm text-emerald-300">
                                        สถานะ: ดาวน์โหลดไฟล์ JSON สำเร็จแล้ว (เสร็จสมบูรณ์)
                                    </strong>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    ดาวน์โหลดเมื่อ: {submittedAt || 'ล่าสุด'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed m-0">
                                {statusMessage || 'บันทึกรายงานการวิเคราะห์ปัญหาด้วยหลักฐาน 6 ขั้นตอนลงในไฟล์ JSON เรียบร้อยแล้ว'}
                            </p>
                            <div className="flex gap-2 pt-1 flex-wrap">
                                <button
                                    type="button"
                                    onClick={(e) => handleDownloadJson(e)}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                                >
                                    <span>📥</span>
                                    <span>ดาวน์โหลดไฟล์ JSON อีกครั้ง</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetToEdit}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                                >
                                    ✏️ แก้ไขคำตอบ
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                    ✓ ปิดหน้าต่าง
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Student Identity Box */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <span>👤</span>
                                <span>ข้อมูลผู้ทำแบบทดสอบอัตนัย:</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                                * ข้อมูลจะถูกบันทึกใส่ลงในไฟล์ JSON ที่ส่งออก
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">ชื่อ-นามสกุล นักเรียน/นักศึกษา:</label>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => {
                                        setStudentName(e.target.value);
                                        if (typeof window !== 'undefined') localStorage.setItem('cctv_student_name', e.target.value);
                                    }}
                                    placeholder="เช่น นายช่างเทคนิค ดีเด่น"
                                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">รหัสนักศึกษา (Student Code):</label>
                                <input
                                    type="text"
                                    value={studentCode}
                                    onChange={(e) => {
                                        setStudentCode(e.target.value);
                                        if (typeof window !== 'undefined') localStorage.setItem('cctv_student_code', e.target.value);
                                    }}
                                    placeholder="เช่น 6630123456"
                                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 placeholder-slate-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* All Topics Completeness Status Banner */}
                    <div
                        className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isAllTopicsComplete
                                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                                : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">{isAllTopicsComplete ? '✓' : '⚠️'}</span>
                            <div>
                                <strong className="block text-sm">
                                    ความสมบูรณ์ของคำตอบ: {completedTopicsCount}/{totalTopicsCount} {hasSubQuestions ? 'ประเด็น' : 'หัวข้อ'}
                                    {isAllTopicsComplete ? ' (ตอบครบทุกหัวข้อแล้ว)' : ' (ยังตอบไม่ครบ)'}
                                </strong>
                                <span className="text-[11px] text-slate-300 block mt-0.5">
                                    {isAllTopicsComplete
                                        ? 'พร้อมดาวน์โหลดผลงาน: สามารถคลิกปุ่ม "ดาวน์โหลดผลงาน JSON" ด้านล่างเพื่อนำส่งอาจารย์'
                                        : `เงื่อนไข: ต้องตอบคำถามให้ครบทุกหัวข้อย่อย จึงจะสามารถ Download JSON ออกมาได้ (ยังขาด: ${missingTopicsList.join(', ')})`}
                                </span>
                            </div>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold shrink-0 self-start sm:self-center border ${
                                isAllTopicsComplete
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                        >
                            {isAllTopicsComplete ? 'READY TO DOWNLOAD' : `INCOMPLETE (${completedTopicsCount}/${totalTopicsCount})`}
                        </span>
                    </div>

                    {/* Step / Prompt Navigation Guide */}
                    {hasSubQuestions ? (
                        <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(subQuestions.length, 3)} gap-2 text-center text-xs font-mono`}>
                            {subQuestions.map((sq, idx) => {
                                const isDone = Boolean(subAnswers[sq.id]?.trim());
                                return (
                                    <div
                                        key={sq.id}
                                        className={`p-2.5 rounded-xl border transition-all ${
                                            isDone
                                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-bold'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="block text-[11px]">{sq.label.split(':')[0]?.trim() || `ประเด็นที่ ${idx + 1}`}</span>
                                            {isDone && <span className="text-[10px] text-emerald-400">✓</span>}
                                        </div>
                                        <span className="text-[10px] text-slate-300 block truncate">
                                            {sq.label.split(':')[1]?.trim() || sq.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                            {[
                                { num: 1, label: '1. Problem', desc: 'ระบุปัญหา/โจทย์', isDone: Boolean(formData.problem.trim()) },
                                { num: 2, label: '2. Cause', desc: 'วิเคราะห์/สมมติฐาน', isDone: Boolean(formData.possibleCauses.trim()) },
                                { num: 3, label: '3. Test', desc: 'ตรวจวัด/เปรียบเทียบ', isDone: Boolean(formData.testMethod.trim()) },
                                { num: 4, label: '4. Result', desc: 'ผลลัพธ์/หลักฐาน', isDone: Boolean(formData.testResult.trim()) },
                                { num: 5, label: '5. Solution', desc: 'วิธีแก้/ออกแบบ', isDone: Boolean(formData.solution.trim()) },
                                { num: 6, label: '6. Retest', desc: 'ตรวจรับ/ส่งมอบ', isDone: Boolean(formData.retestResult.trim()) },
                            ].map((step) => (
                                <div
                                    key={step.num}
                                    className={`p-2.5 rounded-xl border transition-all ${
                                        activeStep === step.num
                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                                            : step.isDone
                                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="block text-[11px] opacity-80">{step.label}</span>
                                        {step.isDone && <span className="text-[10px] text-emerald-400">✓</span>}
                                    </div>
                                    <span className="text-[10px] text-slate-300">{step.desc}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* The Form Fields */}
                    <form onSubmit={handleDownloadJson} className="space-y-6">
                        {hasSubQuestions ? (
                            <>
                                {subQuestions.map((sq, idx) => (
                                    <div
                                        key={sq.id}
                                        className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span>{sq.label}</span>
                                            </label>
                                            <span
                                                className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                                                    subAnswers[sq.id]?.trim()
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}
                                            >
                                                {subAnswers[sq.id]?.trim() ? '✓ ตอบแล้ว' : 'ยังไม่ตอบ'}
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/30 text-xs text-sky-200 leading-relaxed font-sans">
                                            <strong className="text-sky-300 block mb-1 font-mono text-[11px]">📋 โจทย์ประเด็นคำถาม:</strong>
                                            {sq.prompt}
                                        </div>

                                        <textarea
                                            rows={sq.minRows || 4}
                                            value={subAnswers[sq.id] || ''}
                                            onChange={(e) => handleSubAnswerChange(sq.id, e.target.value)}
                                            placeholder={sq.placeholder}
                                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                ))}

                                {/* Evidence File Uploader Box */}
                                <div className="bg-slate-950/50 border border-slate-800/90 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-bold flex items-center justify-center">
                                                📎
                                            </span>
                                            <span>หลักฐานประกอบการวิเคราะห์ (ภาพถ่ายหน้างาน / ภาพสเปก / ไดอะแกรม)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">(ไม่บังคับ / Optional)</span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono text-slate-300">
                                                ภาพถ่ายการต่อสายจริง / ภาพหน้าจอระบบ / ผลการคำนวณ / ไฟล์หลักฐาน:
                                            </span>
                                            {formData.evidenceFileName && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveEvidence}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                                                >
                                                    ลบหลักฐาน
                                                </button>
                                            )}
                                        </div>

                                        {formData.evidenceFilePreview ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={formData.evidenceFilePreview}
                                                        alt="Evidence Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-xs text-slate-300 truncate">
                                                    <span className="font-mono text-emerald-400 block font-bold">✓ แนบไฟล์สำเร็จ</span>
                                                    <span className="text-slate-400 truncate block">{formData.evidenceFileName}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <p className="text-[11px] text-slate-400 m-0">
                                                    รองรับภาพถ่ายหน้างานจริงจากมือถือ, ภาพไดอะแกรม, หรือภาพแคปหน้าจอ (JPG, PNG, GIF)
                                                </p>
                                                <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold cursor-pointer border border-slate-700 text-center transition-colors">
                                                    <span>📷 เลือกรูปภาพหลักฐาน</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Step 1: Problem */}
                                <div
                                    onFocus={() => setActiveStep(1)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                1
                                            </span>
                                            <span>ขั้นตอนที่ 1: การระบุปัญหาและขอบเขตงาน (Problem Formulation & Scope)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">ระบุโจทย์ปัญหา / อาการขัดข้อง / ขอบเขตงาน</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={formData.problem}
                                        onChange={(e) => handleFieldChange('problem', e.target.value)}
                                        placeholder="ระบุโจทย์ปัญหาหรืออาการที่เกิดขึ้นอย่างละเอียด เช่น ความต้องการเปรียบเทียบระบบกล้องวงจรปิดเพื่อเลือกติดตั้ง, หรืออาการขัดข้องของระบบ..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Step 2: Possible Causes */}
                                <div
                                    onFocus={() => setActiveStep(2)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                2
                                            </span>
                                            <span>ขั้นตอนที่ 2: การวิเคราะห์ทางวิศวกรรมและสมมติฐาน (Engineering Analysis & Hypotheses)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">สมมติฐาน / การวิเคราะห์ทางเทคนิค</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={formData.possibleCauses}
                                        onChange={(e) => handleFieldChange('possibleCauses', e.target.value)}
                                        placeholder="วิเคราะห์ประเด็นทางวิศวกรรมหรือตั้งสมมติฐาน เช่น ข้อจำกัดของเทคโนโลยีเดิม, สาเหตุที่ระบบไม่บันทึกภาพ, หรือปัจจัยด้านแบนด์วิดท์..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Step 3: Diagnostic Test Method */}
                                <div
                                    onFocus={() => setActiveStep(3)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                3
                                            </span>
                                            <span>ขั้นตอนที่ 3: วิธีการทดสอบ ตรวจวัด หรือเปรียบเทียบ (Diagnostic, Testing & Comparison Methods)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">เครื่องมือวัด / วิธีคำนวณ / เกณฑ์เปรียบเทียบ</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={formData.testMethod}
                                        onChange={(e) => handleFieldChange('testMethod', e.target.value)}
                                        placeholder="ระบุเครื่องมือวัด ขั้นตอนการคำนวณ หรือหลักเกณฑ์ที่ใช้เปรียบเทียบพิสูจน์ เช่น การใช้ Multimeter/LAN Tester, การคำนวณ Throughput/PoE, เกณฑ์ DORI..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Step 4: Results and Evidence Upload */}
                                <div
                                    onFocus={() => setActiveStep(4)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-4 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                4
                                            </span>
                                            <span>ขั้นตอนที่ 4: ผลการวิเคราะห์ ตรวจวัด และหลักฐานเชิงประจักษ์ (Test Results, Analysis & Evidence)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-amber-400 font-bold">★ จุดประเมินหลัก</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={formData.testResult}
                                        onChange={(e) => handleFieldChange('testResult', e.target.value)}
                                        placeholder="บันทึกผลการทดสอบ ตรวจวัด หรือผลการเปรียบเทียบที่ได้ เช่น ค่าแรงดันไฟ, ผลทดสอบคู่สาย, ผลการคำนวณแบนด์วิดท์ หรือผลการประเมินสเปกเชิงวิศวกรรม..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                    />

                                    {/* Evidence File Uploader Box */}
                                    <div className="p-4 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono text-slate-300">
                                                📎 แนบภาพถ่ายการวัดจริง / ภาพหน้าจอระบบ / แผนผัง / ไฟล์หลักฐาน:
                                            </span>
                                            {formData.evidenceFileName && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveEvidence}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                                                >
                                                    ลบหลักฐาน
                                                </button>
                                            )}
                                        </div>

                                        {formData.evidenceFilePreview ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={formData.evidenceFilePreview}
                                                        alt="Evidence Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="text-xs text-slate-300 truncate">
                                                    <span className="font-mono text-emerald-400 block font-bold">✓ แนบไฟล์สำเร็จ</span>
                                                    <span className="text-slate-400 truncate block">{formData.evidenceFileName}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <p className="text-[11px] text-slate-400 m-0">
                                                    รองรับภาพถ่ายหน้างานจริงจากมือถือ, กล้อง, หรือภาพแคปหน้าจอ (JPG, PNG, GIF)
                                                </p>
                                                <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold cursor-pointer border border-slate-700 text-center transition-colors">
                                                    <span>📷 เลือกรูปภาพหลักฐาน</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Step 5: Solution */}
                                <div
                                    onFocus={() => setActiveStep(5)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                5
                                            </span>
                                            <span>ขั้นตอนที่ 5: ข้อเสนอแนะเชิงวิศวกรรมและวิธีแก้ปัญหา (Engineering Solution & Implementation)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">วิธีแก้ปัญหา / การออกแบบติดตั้ง</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={formData.solution}
                                        onChange={(e) => handleFieldChange('solution', e.target.value)}
                                        placeholder="อธิบายข้อเสนอแนะเชิงวิศวกรรมหรือมาตรการแก้ไขปัญหา เช่น การเลือกใช้อุปกรณ์ IP+NVR, การร้อยท่อและเข้าหัวสายตามมาตรฐาน T568B, การตั้งค่าระบบความปลอดภัย..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Step 6: Retest and Handover */}
                                <div
                                    onFocus={() => setActiveStep(6)}
                                    className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                                6
                                            </span>
                                            <span>ขั้นตอนที่ 6: ผลการทดสอบซ้ำและการส่งมอบงานที่ปลอดภัย (Retest, Verification & Safe Handover)</span>
                                        </label>
                                        <span className="text-[11px] font-mono text-slate-400">ตรวจรับงานจริง / ความปลอดภัย</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={formData.retestResult}
                                        onChange={(e) => handleFieldChange('retestResult', e.target.value)}
                                        placeholder="บันทึกผลการตรวจสอบซ้ำหลังดำเนินการ เช่น ภาพ Live View และ Playback ทำงานสมบูรณ์ 100%, ผลทดสอบระบบสำรองไฟ UPS, การส่งมอบงานตาม Checklist อย่างปลอดภัย..."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                            <span className="text-[11px] text-slate-400 font-mono">
                                {isAllTopicsComplete
                                    ? `✓ ตอบครบทั้ง ${totalTopicsCount} ประเด็นแล้ว พร้อมดาวน์โหลดผลงาน JSON`
                                    : `* ต้องตอบให้ครบทุกหัวข้อย่อยเพื่อดาวน์โหลด JSON (ตอบแล้ว ${completedTopicsCount}/${totalTopicsCount})`}
                            </span>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    ปิด
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isAllTopicsComplete}
                                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                                        isAllTopicsComplete
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 ring-1 ring-emerald-400 cursor-pointer'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                                    }`}
                                >
                                    <span>📥</span>
                                    <span>
                                        {isAllTopicsComplete
                                            ? 'ดาวน์โหลดผลงาน JSON (Download JSON)'
                                            : `ตอบคำถามให้ครบก่อน (${completedTopicsCount}/${totalTopicsCount})`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
