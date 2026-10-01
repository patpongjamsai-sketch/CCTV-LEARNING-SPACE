'use client';

import { useEffect, useState } from 'react';

export type AttemptHistoryItem = {
    id: string;
    attemptNo: number;
    missionId: string;
    missionCode: string;
    missionTitle: string;
    unitId: string;
    approvedScore: number;
    maxScoreSnapshot: number;
    passed: boolean;
    hintsUsed: number;
    resultDetails: Record<string, unknown>;
    evaluatedAt: string;
    createdAt: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    studentId: string | null;
    studentName: string;
    studentCode: string;
    selectedUnitId?: string;
};

export function StudentAttemptHistoryModal({
    isOpen,
    onClose,
    classId,
    studentId,
    studentName,
    studentCode,
    selectedUnitId,
}: Props) {
    const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !studentId) return;

        let isCancelled = false;
        const fetchHistory = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const query = selectedUnitId ? `?unitId=${encodeURIComponent(selectedUnitId)}` : '';
                const res = await fetch(`/api/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}/attempts${query}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || `HTTP ${res.status}`);
                }
                const data = await res.json();
                if (!isCancelled) {
                    setAttempts(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (!isCancelled) {
                    setFetchError(err instanceof Error ? err.message : 'ไม่สามารถโหลดประวัติความพยายามได้');
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        void fetchHistory();
        return () => {
            isCancelled = true;
        };
    }, [isOpen, classId, studentId, selectedUnitId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
                                {studentCode}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                ประวัติภารกิจจำลอง 3D
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white m-0">
                            {studentName}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="ปิดหน้าต่าง"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {isLoading && (
                        <div className="py-12 text-center text-slate-400 animate-pulse font-mono text-xs">
                            กำลังโหลดประวัติและรายละเอียดผลการประเมิน...
                        </div>
                    )}

                    {fetchError && (
                        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                            เกิดข้อผิดพลาด: {fetchError}
                        </div>
                    )}

                    {!isLoading && !fetchError && attempts.length === 0 && (
                        <div className="py-12 text-center text-slate-400 font-mono text-xs">
                            ยังไม่มีประวัติการส่งภารกิจ 3D สำหรับหน่วยนี้
                        </div>
                    )}

                    {!isLoading && attempts.length > 0 && (
                        <div className="space-y-4">
                            {attempts.map((att, idx) => (
                                <div
                                    key={att.id || idx}
                                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3"
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                                                รอบที่ {att.attemptNo}
                                            </span>
                                            <span className="text-sm font-bold text-white">
                                                {att.missionTitle || att.missionCode}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                                                    att.passed
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                }`}
                                            >
                                                {att.passed ? '✓ ผ่านเกณฑ์' : '⏳ ไม่ผ่านเกณฑ์'} ({att.approvedScore}/{att.maxScoreSnapshot})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                                        <span>💡 คำใบ้ที่ใช้: {att.hintsUsed} ครั้ง</span>
                                        <span>⏱️ ประเมินเมื่อ: {new Date(att.evaluatedAt || att.createdAt).toLocaleString('th-TH')}</span>
                                    </div>

                                    {/* Checklist Details */}
                                    {att.resultDetails && Object.keys(att.resultDetails).length > 0 && (
                                        <div className="pt-2 border-t border-slate-800/80">
                                            <div className="text-[11px] font-bold text-slate-300 mb-1.5">
                                                รายการตรวจประเมินของระบบ (System Checklist):
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                                                {Object.entries(att.resultDetails).map(([k, v]) => {
                                                    const isSuccess = v === true || v === 'pass' || v === 'success';
                                                    return (
                                                        <div
                                                            key={k}
                                                            className={`px-2.5 py-1 rounded-lg border flex items-center justify-between ${
                                                                isSuccess
                                                                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                                                    : 'bg-slate-900 border-slate-800 text-slate-300'
                                                            }`}
                                                        >
                                                            <span className="truncate pr-2">{k}</span>
                                                            <span className="shrink-0 font-bold">
                                                                {typeof v === 'boolean'
                                                                    ? v ? '✓ ผ่าน' : '✗ ไม่ผ่าน'
                                                                    : String(v)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
