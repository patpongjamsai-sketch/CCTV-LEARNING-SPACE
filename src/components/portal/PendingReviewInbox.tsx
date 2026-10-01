'use client';

import { useEffect, useState } from 'react';

export type PendingItem = {
    id: string;
    kind: 'lab' | 'quiz';
    classId: string;
    unitId: string;
    unitSequenceNo: number;
    unitTitle: string;
    studentId: string;
    studentCode: string;
    displayName: string;
    attemptNo: number;
    title: string;
    studentNotes?: string | null;
    submittedAt: string | null;
    status: string;
    evidenceCount?: number;
    rawScore?: number | null;
    clientAnswers?: unknown;
};

type Props = {
    classId: string;
    onReviewCompleted?: () => void;
};

export function PendingReviewInbox({ classId, onReviewCompleted }: Props) {
    const [items, setItems] = useState<PendingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterKind, setFilterKind] = useState<'all' | 'lab' | 'quiz'>('all');
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);

    // Review Form State
    const [reviewScore, setReviewScore] = useState<string>('85');
    const [reviewFeedback, setReviewFeedback] = useState<string>('ปฏิบัติตามเกณฑ์ความปลอดภัยและการต่อสายถูกต้องเรียบร้อย');
    const [reviewStatus, setReviewStatus] = useState<'passed' | 'revision_required'>('passed');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionNotice, setActionNotice] = useState<string | null>(null);

    const fetchPending = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/classes/${encodeURIComponent(classId)}/reviews/pending`);
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch {
            // handle error silently
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!classId) return;
        void fetchPending();
    }, [classId]);

    const handleSubmitReview = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        setActionNotice(null);
        try {
            let res: Response;
            if (selectedItem.kind === 'lab') {
                res = await fetch(`/api/classes/${encodeURIComponent(classId)}/labs/${encodeURIComponent(selectedItem.id)}/review`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: reviewStatus,
                        approvedScore: Number(reviewScore),
                        feedback: reviewFeedback,
                    }),
                });
            } else {
                res = await fetch(`/api/classes/${encodeURIComponent(classId)}/quizzes/${encodeURIComponent(selectedItem.id)}/review`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: reviewStatus === 'passed' ? 'approved' : 'rejected',
                        approvedScore: Number(reviewScore),
                        feedback: reviewFeedback,
                    }),
                });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'บันทึกผลการตรวจไม่สำเร็จ');
            }

            setActionNotice(`✓ บันทึกผลการตรวจของ ${selectedItem.displayName} เรียบร้อยแล้ว`);
            setSelectedItem(null);
            void fetchPending();
            if (onReviewCompleted) onReviewCompleted();
        } catch (err) {
            setActionNotice(err instanceof Error ? `ข้อผิดพลาด: ${err.message}` : 'เกิดข้อผิดพลาดในการบันทึกผล');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = items.filter((it) => {
        if (filterKind === 'all') return true;
        return it.kind === filterKind;
    });

    return (
        <div className="space-y-4">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                        📥 ศูนย์ตรวจและอนุมัติงานค้าง (Pending Work Queue)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                        {items.length} งานรอตรวจ
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFilterKind('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filterKind === 'all'
                                ? 'bg-sky-500 text-slate-950 shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        ทั้งหมด ({items.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterKind('lab')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filterKind === 'lab'
                                ? 'bg-sky-500 text-slate-950 shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        แล็บ 3D ({items.filter((i) => i.kind === 'lab').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterKind('quiz')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filterKind === 'quiz'
                                ? 'bg-sky-500 text-slate-950 shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        ข้อสอบอัตนัย ({items.filter((i) => i.kind === 'quiz').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => void fetchPending()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                        title="รีเฟรชงานค้าง"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {actionNotice && (
                <div className="p-3.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-medium">
                    {actionNotice}
                </div>
            )}

            {/* Content List */}
            {isLoading ? (
                <div className="py-12 text-center text-slate-400 animate-pulse font-mono text-xs">
                    กำลังดึงข้อมูลงานที่รอตรวจ...
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-400 space-y-1">
                    <div className="text-2xl">🎉</div>
                    <div className="text-sm font-semibold text-white">ไม่มีงานค้างรอตรวจในขณะนี้</div>
                    <div className="text-xs text-slate-400 font-mono">
                        นักเรียนทุกคนในชั้นเรียนนี้ได้รับการประเมินครบถ้วนแล้ว
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                            item.kind === 'lab'
                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        }`}
                                    >
                                        {item.kind === 'lab' ? '🔬 ปฏิบัติการแล็บ' : '📝 ข้อสอบอัตนัย'} · U{String(item.unitSequenceNo).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        รอบที่ {item.attemptNo}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white m-0 truncate">
                                        {item.title}
                                    </h4>
                                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                                        {item.displayName} <span className="font-mono text-sky-400">({item.studentCode})</span>
                                    </div>
                                </div>

                                {item.studentNotes && (
                                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic line-clamp-2">
                                        &quot;{item.studentNotes}&quot;
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                                    {item.evidenceCount !== undefined && item.evidenceCount > 0 && (
                                        <span>📎 ไฟล์แนบ: {item.evidenceCount} ไฟล์</span>
                                    )}
                                    <span>⏱️ ส่งเมื่อ: {item.submittedAt ? new Date(item.submittedAt).toLocaleString('th-TH') : '-'}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedItem(item);
                                    setReviewScore('85');
                                    setReviewStatus('passed');
                                    setReviewFeedback(
                                        item.kind === 'lab'
                                            ? 'ผ่านเกณฑ์มาตรฐานการติดตั้งและต่อสาย มีหลักฐานครบถ้วน'
                                            : 'ตอบได้ตรงประเด็นตามหลักวิชาชีพการติดตั้งกล้องวงจรปิด',
                                    );
                                }}
                                className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>⚖️</span>
                                <span>เปิดตรวจและให้คะแนน</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Grading */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 flex items-center justify-between gap-4">
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold uppercase">
                                    ตรวจผลการประเมิน · {selectedItem.kind === 'lab' ? 'LAB SUBMISSION' : 'SUBJECTIVE EXAM'}
                                </span>
                                <h3 className="text-base font-bold text-white mt-1 mb-0">
                                    {selectedItem.displayName} ({selectedItem.studentCode})
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {selectedItem.title} · หน่วยที่ {selectedItem.unitSequenceNo}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body Form */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {selectedItem.studentNotes && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">ข้อความจากผู้เรียน:</label>
                                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                                        {selectedItem.studentNotes}
                                    </div>
                                </div>
                            )}

                            {Boolean(selectedItem.clientAnswers) && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">คำตอบข้อสอบอัตนัย:</label>
                                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto max-h-36">
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(selectedItem.clientAnswers, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        ผลการประเมิน
                                    </label>
                                    <select
                                        value={reviewStatus}
                                        onChange={(e) => setReviewStatus(e.target.value as 'passed' | 'revision_required')}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
                                    >
                                        <option value="passed">✓ ผ่านเกณฑ์ (Approved / Passed)</option>
                                        <option value="revision_required">⚠️ ขอให้แก้ไข (Revision Required)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        คะแนนที่ให้ (เต็ม 100)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={reviewScore}
                                        onChange={(e) => setReviewScore(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    ข้อคิดเห็นและคำแนะนำจากครูผู้สอน (Feedback)
                                </label>
                                <textarea
                                    rows={3}
                                    value={reviewFeedback}
                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                                    placeholder="ระบุคำแนะนำหรือสิ่งที่ต้องปรับปรุง..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                disabled={isSubmitting}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                            >
                                {isSubmitting ? 'กำลังบันทึกลงฐานข้อมูล...' : '✓ บันทึกผลการตรวจ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
