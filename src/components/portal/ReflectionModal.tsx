'use client';

import { useEffect, useState } from 'react';

export type ReflectionModalProps = {
    unitId: string;
    unitTitle: string;
    reflectionTitle: string;
    prompts: string[];
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
};

type ReflectionDataState = {
    answers: Record<string, string>;
    ethicsCommitment: boolean;
    submittedAt: string | null;
};

export function ReflectionModal({
    unitId,
    unitTitle,
    reflectionTitle,
    prompts,
    isOpen,
    onClose,
    onComplete,
}: ReflectionModalProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [ethicsCommitment, setEthicsCommitment] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [submittedAt, setSubmittedAt] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Load saved reflection on open
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem(`cctv_reflection_${unitId}`);
            if (saved) {
                try {
                    const parsed: ReflectionDataState = JSON.parse(saved);
                    if (parsed?.answers) {
                        setAnswers(parsed.answers);
                        setEthicsCommitment(parsed.ethicsCommitment || false);
                        setIsSubmitted(Boolean(parsed.submittedAt));
                        setSubmittedAt(parsed.submittedAt || null);
                    }
                } catch {
                    // ignore
                }
            } else {
                setAnswers({});
                setEthicsCommitment(false);
                setIsSubmitted(false);
                setSubmittedAt(null);
            }
            setStatusMessage(null);
            setIsSubmitting(false);
        }
    }, [isOpen, unitId]);

    if (!isOpen) return null;

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [index.toString()]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submissions
        if (isSubmitting) return;

        // Validation
        const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
        if (answeredCount < Math.min(1, prompts.length)) {
            setStatusMessage('กรุณากรอกข้อความสะท้อนคิดอย่างน้อย 1 หัวข้อ');
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        // Simulate save process
        await new Promise((resolve) => setTimeout(resolve, 600));

        const now = new Date();
        const formattedDate = `${now.getDate()} ${
            ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][
                now.getMonth()
            ]
        } ${now.getFullYear() + 543} ${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes(),
        ).padStart(2, '0')} น.`;

        const payload: ReflectionDataState = {
            answers,
            ethicsCommitment,
            submittedAt: formattedDate,
        };

        localStorage.setItem(`cctv_reflection_${unitId}`, JSON.stringify(payload));
        setIsSubmitted(true);
        setSubmittedAt(formattedDate);
        setIsSubmitting(false);
        setStatusMessage('บันทึกการสะท้อนคิดและจรรยาบรรณวิชาชีพสำเร็จแล้ว');

        // Dispatch global event for listeners
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cctv_reflection_saved', { detail: { unitId, payload } }));
        }

        if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {unitId}-R01 · SELF REFLECTION
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                                หน่วยการเรียนรู้: {unitTitle}
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white m-0 flex items-center gap-2">
                            <span>💡 {reflectionTitle || 'การสะท้อนคิดและจรรยาบรรณวิชาชีพช่าง CCTV'}</span>
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="ปิดหน้าต่าง"
                    >
                        ✕
                    </button>
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-950 flex items-start gap-3 text-xs text-slate-300">
                    <span className="text-lg shrink-0" aria-hidden="true">📋</span>
                    <div>
                        <strong className="text-indigo-300 block mb-0.5">วัตถุประสงค์การสะท้อนคิด (Reflection Purpose)</strong>
                        <span>
                            การประเมินตนเอง สรุปบทเรียนสำคัญจากการปฏิบัติงาน และตระหนักถึงจรรยาบรรณวิชาชีพช่างติดตั้งระบบกล้องวงจรปิด (ความปลอดภัย ความลับข้อมูลลูกค้า และมาตรฐานการติดตั้ง)
                        </span>
                    </div>
                </div>

                {/* Status Alert */}
                {statusMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                        <span>✓</span>
                        <span>{statusMessage}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-5">
                    {prompts && prompts.length > 0 ? (
                        prompts.map((prompt, idx) => (
                            <div key={idx} className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-200 leading-relaxed">
                                    <span className="text-indigo-400 font-mono mr-1.5">ข้อที่ {idx + 1}:</span>
                                    {prompt}
                                </label>
                                <textarea
                                    rows={3}
                                    value={answers[idx.toString()] || ''}
                                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                    placeholder="พิมพ์บันทึกความคิดเห็น ข้อสรุป หรือบทเรียนที่ได้รับ..."
                                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-200">
                                สรุปสิ่งที่ท่านได้เรียนรู้และสิ่งที่ต้องพัฒนาต่อในการติดตั้งระบบ CCTV ประจำหน่วยนี้
                            </label>
                            <textarea
                                rows={4}
                                value={answers['0'] || ''}
                                onChange={(e) => handleAnswerChange(0, e.target.value)}
                                placeholder="พิมพ์ข้อคิดเห็นและสรุปบทเรียน..."
                                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
                            />
                        </div>
                    )}

                    {/* Ethics Checkbox */}
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="ethics-checkbox"
                            checked={ethicsCommitment}
                            onChange={(e) => setEthicsCommitment(e.target.checked)}
                            className="mt-0.5 rounded bg-slate-900 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        />
                        <label htmlFor="ethics-checkbox" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                            <strong className="text-indigo-300 block mb-0.5">การยึดมั่นในจรรยาบรรณวิชาชีพช่าง CCTV</strong>
                            ข้าพเจ้าขอรับรองว่าจะปฏิบัติตามมาตรฐานวิชาชีพ ไม่เผยแพร่ภาพกล้องวงจรปิดของลูกค้า รักษาความปลอดภัยของรหัสผ่าน และคำนึงถึงความปลอดภัยทางไฟฟ้าสูงสุด
                        </label>
                    </div>

                    {/* Submission Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                        <div className="text-xs text-slate-400">
                            {submittedAt ? (
                                <span className="text-emerald-400 font-mono">
                                    ✓ บันทึกเมื่อ: {submittedAt}
                                </span>
                            ) : (
                                <span>ยังไม่ได้บันทึกการสะท้อนคิด</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                ปิด
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>กำลังบันทึก...</span>
                                    </>
                                ) : (
                                    <span>{isSubmitted ? '🔄 อัปเดตการสะท้อนคิด' : '💾 บันทึกการสะท้อนคิด'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
