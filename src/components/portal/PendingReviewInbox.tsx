'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase/client';
import { isNotificationSoundEnabled, setNotificationSoundEnabled, playNotificationChime } from '../../lib/soundEffects';

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
    onItemsUpdated?: (count: number) => void;
};

export function PendingReviewInbox({ classId, onReviewCompleted, onItemsUpdated }: Props) {
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
    const [recentArrivalIds, setRecentArrivalIds] = useState<string[]>([]);
    const [isRealtimeActive, setIsRealtimeActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

    useEffect(() => {
        setSoundEnabled(isNotificationSoundEnabled());
        const handleSoundChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ enabled: boolean }>;
            if (customEvent.detail?.enabled !== undefined) {
                setSoundEnabled(customEvent.detail.enabled);
            }
        };
        window.addEventListener('cctv_sound_setting_changed', handleSoundChange);
        return () => window.removeEventListener('cctv_sound_setting_changed', handleSoundChange);
    }, []);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        setNotificationSoundEnabled(next);
        if (next) {
            playNotificationChime('alert');
        }
    };

    const triggerNotice = (msg: string) => {
        setActionNotice(msg);
    };

    const fetchPending = async (isBackground = false) => {
        if (!isBackground) {
            setIsLoading(true);
        }
        try {
            const res = await fetch(`/api/classes/${encodeURIComponent(classId)}/reviews/pending`);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setItems(list);
                if (onItemsUpdated) {
                    onItemsUpdated(list.length);
                }
            }
        } catch {
            // handle error silently
        } finally {
            if (!isBackground) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!actionNotice) return;
        const timer = setTimeout(() => {
            setActionNotice(null);
        }, 6000);
        return () => clearTimeout(timer);
    }, [actionNotice]);

    useEffect(() => {
        if (!classId) return;
        let isActive = true;

        void fetchPending();

        let channel: any = null;
        try {
            const supabase = createBrowserSupabaseClient();
            const isAll = classId === 'ALL';

            channel = supabase
                .channel(`teacher-pending-inbox:${classId}`)
                .on(
                    'postgres_changes' as any,
                    {
                        event: '*',
                        schema: 'public',
                        table: 'lab_submissions',
                        ...(isAll ? {} : { filter: `class_id=eq.${classId}` }),
                    } as any,
                    (payload: { eventType: string; new?: { id?: string } }) => {
                        if (isActive) {
                            void fetchPending(true);
                            if (payload.eventType === 'INSERT') {
                                if (payload.new?.id) {
                                    const insertedId = String(payload.new.id);
                                    setRecentArrivalIds((prev) => Array.from(new Set([...prev, insertedId])));
                                    setTimeout(() => {
                                        setRecentArrivalIds((prev) => prev.filter((id) => id !== insertedId));
                                    }, 30000);
                                }
                                triggerNotice('🔔 มีผลงานแล็บใหม่ส่งเข้ามาตรวจแบบเรียลไทม์');
                                playNotificationChime('new_submission');
                            }
                        }
                    }
                )
                .on(
                    'postgres_changes' as any,
                    {
                        event: '*',
                        schema: 'public',
                        table: 'quiz_attempts',
                        ...(isAll ? {} : { filter: `class_id=eq.${classId}` }),
                    } as any,
                    (payload: { eventType: string; new?: { id?: string } }) => {
                        if (isActive) {
                            void fetchPending(true);
                            if (payload.eventType === 'INSERT') {
                                if (payload.new?.id) {
                                    const insertedId = String(payload.new.id);
                                    setRecentArrivalIds((prev) => Array.from(new Set([...prev, insertedId])));
                                    setTimeout(() => {
                                        setRecentArrivalIds((prev) => prev.filter((id) => id !== insertedId));
                                    }, 30000);
                                }
                                triggerNotice('🔔 มีแบบทดสอบใหม่ส่งเข้ามาตรวจแบบเรียลไทม์');
                                playNotificationChime('new_submission');
                            }
                        }
                    }
                )
                .subscribe((status: string) => {
                    if (isActive) {
                        if (status === 'SUBSCRIBED') {
                            setIsRealtimeActive(true);
                        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                            setIsRealtimeActive(false);
                        }
                    }
                });
        } catch {
            // Fallback gracefully if Supabase client cannot be initialized in environment
        }

        return () => {
            isActive = false;
            setIsRealtimeActive(false);
            if (channel) {
                try {
                    const supabase = createBrowserSupabaseClient();
                    void supabase.removeChannel(channel);
                } catch {
                    // ignore
                }
            }
        };
    }, [classId]);

    const handleSubmitReview = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        setActionNotice(null);
        try {
            let res: Response;
            if (selectedItem.kind === 'lab') {
                res = await fetch(`/api/learning/lab-submissions/${encodeURIComponent(selectedItem.id)}/review`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: reviewStatus,
                        approvedScore: Number(reviewScore),
                        feedback: reviewFeedback,
                    }),
                });
            } else {
                res = await fetch(`/api/classes/${encodeURIComponent(selectedItem.classId || classId)}/quizzes/${encodeURIComponent(selectedItem.id)}/review`, {
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
            playNotificationChime('approval_success');
            setSelectedItem(null);
            void fetchPending();
            if (onReviewCompleted) onReviewCompleted();
        } catch (err) {
            setActionNotice(err instanceof Error ? `ข้อผิดพลาด: ${err.message}` : 'เกิดข้อผิดพลาดในการบันทึกผล');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickPass = async (item: PendingItem) => {
        setIsSubmitting(true);
        try {
            let res: Response;
            if (item.kind === 'lab') {
                res = await fetch(`/api/learning/lab-submissions/${encodeURIComponent(item.id)}/review`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'passed',
                        approvedScore: 85,
                        feedback: 'ผ่านเกณฑ์มาตรฐานการติดตั้งและต่อสาย มีหลักฐานครบถ้วน',
                    }),
                });
            } else {
                res = await fetch(`/api/classes/${encodeURIComponent(item.classId || classId)}/quizzes/${encodeURIComponent(item.id)}/review`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'approved',
                        approvedScore: 18,
                        feedback: 'ตอบได้ตรงประเด็นตามหลักวิชาชีพการติดตั้งกล้องวงจรปิด',
                    }),
                });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'อนุมัติไม่สำเร็จ');
            }

            triggerNotice(`⚡ อนุมัติผ่านผลงานของ ${item.displayName} เรียบร้อยแล้ว`);
            playNotificationChime('approval_success');
            void fetchPending();
            if (onReviewCompleted) onReviewCompleted();
        } catch (err) {
            triggerNotice(err instanceof Error ? `ข้อผิดพลาด: ${err.message}` : 'เกิดข้อผิดพลาดในการอนุมัติ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBatchApprove = async () => {
        if (filteredItems.length === 0) return;
        const confirmMsg = `ยืนยันการอนุมัติผ่านงานที่ค้างตรวจทั้งหมด ${filteredItems.length} รายการทันทีหรือไม่?`;
        if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/classes/${encodeURIComponent(classId)}/reviews/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: filteredItems.map((it) => ({
                        id: it.id,
                        kind: it.kind,
                        classId: it.classId || classId,
                    })),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'บันทึกการอนุมัติกลุ่มไม่สำเร็จ');
            }

            const data = await res.json();
            triggerNotice(`⚡ อนุมัติผ่านผลงานทั้งหมด ${data.approvedCount || filteredItems.length} รายการเรียบร้อยแล้ว`);
            playNotificationChime('approval_success');
            void fetchPending();
            if (onReviewCompleted) onReviewCompleted();
        } catch (err) {
            triggerNotice(err instanceof Error ? `ข้อผิดพลาด: ${err.message}` : 'เกิดข้อผิดพลาดในการอนุมัติกลุ่ม');
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
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">
                        📥 ศูนย์ตรวจและอนุมัติงานค้าง (Pending Work Queue)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                        {items.length} งานรอตรวจ
                    </span>
                    <span
                        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border transition-colors ${
                            isRealtimeActive
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title={isRealtimeActive ? 'เชื่อมต่อ Supabase Realtime สำเร็จ ข้อมูลจะอัปเดตทันทีเมื่อนักเรียนกดส่ง' : 'กำลังเชื่อมต่อหรือใช้โหมดอัปเดตมาตรฐาน'}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                        <span>{isRealtimeActive ? '⚡ ซิงก์เรียลไทม์สด' : 'ซิงก์มาตรฐาน'}</span>
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
                    {filteredItems.length > 0 && (
                        <button
                            type="button"
                            onClick={() => void handleBatchApprove()}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                            title="อนุมัติผ่านงานที่ค้างตรวจทั้งหมดในคิวนี้ทันที"
                        >
                            <span>⚡</span>
                            <span>อนุมัติผ่านทั้งหมด ({filteredItems.length})</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={toggleSound}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                            soundEnabled
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                        }`}
                        title={soundEnabled ? 'เสียงแจ้งเตือนเปิดอยู่ (คลิกเพื่อปิดเสียง)' : 'เสียงแจ้งเตือนปิดอยู่ (คลิกเพื่อเปิดเสียง)'}
                    >
                        <span>{soundEnabled ? '🔊' : '🔇'}</span>
                        <span className="text-[11px] font-sans hidden md:inline">{soundEnabled ? 'เปิดเสียง' : 'ปิดเสียง'}</span>
                    </button>
                </div>
            </div>

            {actionNotice && (
                <div className="p-3.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-medium flex items-center justify-between transition-all shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="animate-bounce">🔔</span>
                        <span>{actionNotice}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActionNotice(null)}
                        className="text-sky-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-sky-500/20 transition-colors cursor-pointer"
                        title="ปิดการแจ้งเตือน"
                    >
                        ✕
                    </button>
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
                    {filteredItems.map((item) => {
                        const isRecent = recentArrivalIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                className={`p-4 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between space-y-3 ${
                                    isRecent
                                        ? 'border-amber-400/90 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/15 bg-slate-900/95'
                                        : 'border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                                    item.kind === 'lab'
                                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                }`}
                                            >
                                                {item.kind === 'lab' ? '🔬 ปฏิบัติการแล็บ' : '📝 ข้อสอบอัตนัย'} · U{String(item.unitSequenceNo).padStart(2, '0')}
                                            </span>
                                            {isRecent && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse flex items-center gap-1">
                                                    <span>✨</span>
                                                    <span>ส่งใหม่สด (Live)</span>
                                                </span>
                                            )}
                                        </div>
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

                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => void handleQuickPass(item)}
                                        disabled={isSubmitting}
                                        className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1 shrink-0"
                                        title="อนุมัติผ่านทันทีด้วยคะแนนมาตรฐาน (Quick Pass)"
                                    >
                                        <span>⚡</span>
                                        <span className="hidden sm:inline">ผ่านทันที</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setRecentArrivalIds((prev) => prev.filter((id) => id !== item.id));
                                            setReviewScore(item.kind === 'quiz' ? '18' : '85');
                                            setReviewStatus('passed');
                                            setReviewFeedback(
                                                item.kind === 'lab'
                                                    ? 'ผ่านเกณฑ์มาตรฐานการติดตั้งและต่อสาย มีหลักฐานครบถ้วน'
                                                    : 'ตอบได้ตรงประเด็นตามหลักวิชาชีพการติดตั้งกล้องวงจรปิด ครบถ้วนตามมาตรฐาน',
                                            );
                                        }}
                                        className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <span>⚖️</span>
                                        <span>เปิดตรวจและให้คะแนน</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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

                            {Boolean(selectedItem.clientAnswers) && (() => {
                                const raw = selectedItem.clientAnswers as Record<string, unknown> | null;
                                const evidenceImg = (raw?._evidence as { filePreview?: string } | undefined)?.filePreview ||
                                    (raw?.evidenceFilePreview as string | undefined) || null;
                                const evidenceName = (raw?._evidence as { fileName?: string } | undefined)?.fileName ||
                                    (raw?.evidenceFileName as string | undefined) || null;

                                const textEntries = Object.entries(raw || {}).filter(([k]) =>
                                    k !== '_evidence' && k !== 'evidenceFilePreview' && k !== 'evidenceFileName'
                                );

                                return (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-slate-300 block">คำตอบและหลักฐานจากผู้เรียน:</label>
                                        
                                        {evidenceImg && (
                                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                                <span className="text-xs text-sky-400 font-semibold flex items-center gap-1.5">
                                                    <span>📷</span>
                                                    <span>รูปภาพหลักฐาน ({evidenceName || 'ภาพถ่ายการตรวจวัด/วงจร'}):</span>
                                                </span>
                                                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-64">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={evidenceImg} alt="หลักฐานการตรวจวัด" className="max-h-64 object-contain" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-2.5 max-h-48 overflow-y-auto">
                                            {textEntries.length > 0 ? (
                                                textEntries.map(([key, val]) => (
                                                    <div key={key} className="border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                                                        <span className="text-[11px] font-mono text-amber-400 font-bold block">{key}:</span>
                                                        <span className="text-xs text-slate-200 leading-relaxed block whitespace-pre-wrap">{String(val || '-')}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(raw, null, 2)}</pre>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

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
                                        {selectedItem.kind === 'quiz'
                                            ? 'คะแนนที่ให้ (เต็ม 20 คะแนน, เกณฑ์ผ่าน 12 คะแนน)'
                                            : 'คะแนนที่ให้ (เต็ม 100 คะแนน, เกณฑ์ผ่าน 60 คะแนน)'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedItem.kind === 'quiz' ? 20 : 100}
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
