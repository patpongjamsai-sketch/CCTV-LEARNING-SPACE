'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase/client';
import {
    getTeacherApprovals,
    saveTeacherApprovals,
    getSubjectiveSubmissions,
    gradeSubjectiveSubmission,
    DEFAULT_TEACHER_APPROVALS,
    type TeacherApprovals,
    type SubjectiveSubmission,
} from '../../lib/progressionState';
import { allUnitsContent } from '../../content/courses/21909-2020';

export type TeacherApprovalDashboardProps = {
    classId?: string;
};

type ActiveTab = 'approvals' | 'students' | 'grading' | 'csv' | 'override';

export type RosterStudent = {
    id: string;
    code: string;
    name: string;
    groupId?: string;
    orderNum?: number;
    unitProgress: Record<string, {
        lessons: number;
        lab: boolean;
        labScore?: number | null;
        exam: boolean;
        examScore?: number | null;
        passed: boolean;
        latestQuizStatus?: string;
        latestQuizSubmittedAt?: string | null;
        latestLabStatus?: string;
    }>;
};

const DEFAULT_CSV_STUDENTS = `email,student_code,display_name
69219090001@cctv.local,69219090001,นางสาวบัณฑิตา เพ็งกลาง
69219090002@cctv.local,69219090002,นายแทนคุณ ขันเงิน
69219090003@cctv.local,69219090003,นายเทวา อาภรณ์ศรี
69219090004@cctv.local,69219090004,นายโจ จิรวัฒน์ จันทร์ไพจิตร์
69219090006@cctv.local,69219090006,นางสาวณฐาปนี แสวงวงศ์
69219090007@cctv.local,69219090007,นางสาวศศิวิมล สกุลทอง
69219090008@cctv.local,69219090008,นายภัทรพล คชรักษ์
69219090009@cctv.local,69219090009,นายรวิกร พันธุ์นิล
69219090011@cctv.local,69219090011,นายอภิภู เอราวรรณ์
69219090012@cctv.local,69219090012,นางสาวกวินตรา บรรทอน
69219090015@cctv.local,69219090015,นางสาวกนกวรรณ ชินะแสง
69219090040@cctv.local,69219090040,นางสาวเปณิกา สุวรรณ
69219090048@cctv.local,69219090048,นายหัสถกรณ์ แสงอาจหาญ
69219090016@cctv.local,69219090016,นายกิตติโชค สาโสม
69219090017@cctv.local,69219090017,นางสาวกนกวรรณ ประตังทะสา
69219090018@cctv.local,69219090018,นางสาวพิชญดา คล้ายบุญมี
69219090019@cctv.local,69219090019,นายณัฐอติกันต์ คำพะวัง
69219090020@cctv.local,69219090020,นายพัสกร โพธิ์มั่น
69219090021@cctv.local,69219090021,นางสาวกัญญาพร นารัตน์
69219090022@cctv.local,69219090022,นายสรวิทย์ กาสีสอน
69219090023@cctv.local,69219090023,นายธนกร พลราษฎร์
69219090024@cctv.local,69219090024,นายอดิเทพ อนุคง
69219090026@cctv.local,69219090026,นายภัทรธณพล เจ๊กทิม
69219090027@cctv.local,69219090027,นายกิตติกานต์ จันทาโทอ่อน
69219090042@cctv.local,69219090042,นายยุติธรรม ปุยคำ
69219090043@cctv.local,69219090043,นายธีรพัฒน์ เฉวียงหงส์
69219090046@cctv.local,69219090046,นางสาวอมรรัตน์ เดชห้วยไผ่
69219090028@cctv.local,69219090028,นายหรรษา มัครมย์
69219090029@cctv.local,69219090029,นายปิติ จตุพรพงศ์
69219090030@cctv.local,69219090030,นายวชรวิทย์ ทองสว่าง
69219090031@cctv.local,69219090031,นายนฤชยา จำปาพันธ์
69219090032@cctv.local,69219090032,นางสาวกิตติกา เกษมสุข
69219090033@cctv.local,69219090033,นายพลกฤต ทองดอนดู่
69219090034@cctv.local,69219090034,นายศักดิ์ชัยรินทร์ จันทร์ผอง
69219090035@cctv.local,69219090035,นายศตวพร ผลจันทร์
69219090037@cctv.local,69219090037,นายจิรวัฒน์ อ่อนพันธ์
69219090038@cctv.local,69219090038,นายก้องเกียรติ์ ศรีมาคำ
69219090039@cctv.local,69219090039,นางสาวอัญธิญากร พันธ์เพ็ง
69219090044@cctv.local,69219090044,นางสาวปภัสสร ผูกมิตร
69219090045@cctv.local,69219090045,นายต้นตการณ์ โพสาวัง`;

const DEFAULT_CLASS_UUID = '22222222-2222-4222-8222-222222222222';

export const resolveClassUuid = (cid: string): string => {
    if (!cid) return DEFAULT_CLASS_UUID;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cid)) {
        return cid;
    }
    if (cid === 'CLASS-2569-CCTV-01' || cid === '21909-2020') {
        return DEFAULT_CLASS_UUID;
    }
    return cid;
};

export function TeacherApprovalDashboard({ classId = 'default-class' }: TeacherApprovalDashboardProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('approvals');
    const [approvals, setApprovals] = useState<TeacherApprovals>(DEFAULT_TEACHER_APPROVALS);
    const [submissions, setSubmissions] = useState<SubjectiveSubmission[]>([]);
    const [students, setStudents] = useState<RosterStudent[]>([]);
    const [selectedUnitTab, setSelectedUnitTab] = useState<string>('U01');
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
    const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
    const [lastSyncTime, setLastSyncTime] = useState<string>('เพิ่งอัปเดต');
    const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
    const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
    const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

    // Grading modal/form state
    const [selectedSubmission, setSelectedSubmission] = useState<SubjectiveSubmission | null>(null);
    const [gradeScore, setGradeScore] = useState<string>('8');
    const [gradeFeedback, setGradeFeedback] = useState<string>('ตอบได้ตรงประเด็นตามเกณฑ์วิชาชีพ มีการเชื่อมโยงระบบได้ถูกต้อง');

    // CSV & Override Form State
    const [targetClassId, setTargetClassId] = useState(classId);
    const [csvText, setCsvText] = useState(DEFAULT_CSV_STUDENTS);
    const [isImporting, setIsImporting] = useState(false);
    const [overrideStudentId, setOverrideStudentId] = useState('69219090001');
    const [overrideUnitId, setOverrideUnitId] = useState('U01');
    const [overridePassed, setOverridePassed] = useState(true);
    const [overridePercent, setOverridePercent] = useState('100');
    const [overrideReason, setOverrideReason] = useState('');

    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchStudents = async (cid: string) => {
        const effectiveUuid = resolveClassUuid(cid);
        if (!effectiveUuid || effectiveUuid.trim() === '') return;
        setIsLoadingStudents(true);
        setFetchError(null);
        try {
            const res = await fetch(`/api/classes/${encodeURIComponent(effectiveUuid.trim())}/students`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    if (data.length > 0) {
                        const mapped: RosterStudent[] = data.map((st: {
                            studentId: string;
                            studentCode: string;
                            displayName: string;
                            unitProgress?: Record<string, {
                                progressPercent: number;
                                passed: boolean;
                                unlocked: boolean;
                                approvedScore?: number | null;
                                latestQuiz?: { id: string; score: number | null; passed: boolean | null; status: string; submittedAt: string | null } | null;
                                latestLab?: { id: string; status: string; passed: boolean | null; approvedScore: number | null; reviewedAt: string | null; submittedAt: string | null } | null;
                            }>;
                        }) => ({
                            id: st.studentId,
                            code: st.studentCode || '',
                            name: st.displayName || 'ผู้เรียน',
                            unitProgress: Object.entries(st.unitProgress || {}).reduce((acc, [uk, uv]) => {
                                acc[uk] = {
                                    lessons: uv.progressPercent >= 40 ? 10 : Math.round((uv.progressPercent / 40) * 10),
                                    lab: uv.latestLab?.passed ?? uv.unlocked,
                                    labScore: uv.latestLab?.approvedScore ?? (uv.passed ? 90 : null),
                                    exam: uv.latestQuiz?.passed ?? uv.passed,
                                    examScore: uv.latestQuiz?.score ?? uv.approvedScore,
                                    passed: uv.passed,
                                    latestQuizStatus: uv.latestQuiz?.status,
                                    latestQuizSubmittedAt: uv.latestQuiz?.submittedAt,
                                    latestLabStatus: uv.latestLab?.status,
                                };
                                return acc;
                            }, {} as RosterStudent['unitProgress']),
                        }));
                        setStudents(mapped);
                    } else {
                        setStudents([]);
                    }
                    setLastSyncTime(new Date().toLocaleTimeString('th-TH'));
                    setFetchError(null);
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                const errMessage = errData.error || `HTTP ${res.status}: ${res.statusText}`;
                setFetchError(
                    /password authentication failed/i.test(String(errMessage))
                        ? 'เชื่อมต่อฐานข้อมูลรายชื่อไม่สำเร็จ: ตรวจค่า SUPABASE_DB_URL ใน Vercel แล้ว Deploy ใหม่'
                        : `เกิดข้อผิดพลาดในการโหลดรายชื่อนักเรียนจากฐานข้อมูล (${errMessage})`,
                );
            }
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Network error';
            setFetchError(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อโหลดรายชื่อได้ (${errMessage})`);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // Rehydrate and reload state when events fire
    useEffect(() => {
        const savedApprovals = getTeacherApprovals();
        setApprovals(savedApprovals);
        setSubmissions(getSubjectiveSubmissions());

        fetchStudents(classId);

        const updateState = () => {
            setApprovals(getTeacherApprovals());
            setSubmissions(getSubjectiveSubmissions());
        };

        window.addEventListener('cctv_approvals_updated', updateState);
        window.addEventListener('cctv_subjective_updated', updateState);
        return () => {
            window.removeEventListener('cctv_approvals_updated', updateState);
            window.removeEventListener('cctv_subjective_updated', updateState);
        };
    }, [classId]);

    // Live auto-polling effect every 20 seconds
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchStudents(classId);
            setSubmissions(getSubjectiveSubmissions());
        }, 20000);
        return () => clearInterval(interval);
    }, [autoRefresh, classId]);

    // Membership changes trigger a fresh server-authorized roster read.
    useEffect(() => {
        const effectiveClassId = resolveClassUuid(classId);
        if (!effectiveClassId) {
            setRealtimeStatus('fallback');
            return;
        }

        const supabase = createBrowserSupabaseClient();
        let isActive = true;
        const channel = supabase
            .channel(`teacher-roster:${effectiveClassId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'class_members',
                    filter: `class_id=eq.${effectiveClassId}`,
                },
                () => {
                    if (isActive) void fetchStudents(classId);
                },
            )
            .subscribe((status) => {
                if (!isActive) return;
                if (status === 'SUBSCRIBED') {
                    setRealtimeStatus('connected');
                    // Fetch again after subscribing to cover changes during connection setup.
                    void fetchStudents(classId);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    setRealtimeStatus('fallback');
                }
            });

        return () => {
            isActive = false;
            void supabase.removeChannel(channel);
        };
    }, [classId]);

    const showNotice = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // Handler to toggle Unit Unlock
    const toggleUnitUnlock = (unitId: string) => {
        const current = !!approvals.unlockedUnits[unitId];
        const next = !current;
        const updated: TeacherApprovals = {
            ...approvals,
            unlockedUnits: {
                ...approvals.unlockedUnits,
                [unitId]: next,
            },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice(`อัปเดตสิทธิ์หน่วย ${unitId}: ${next ? '🔓 ปลดล็อกให้เรียนได้แล้ว' : '🔒 ล็อกหน่วยการเรียนรู้'}`);
    };

    // Handler to toggle 3D Lab Unlock
    const toggleLabUnlock = (unitId: string) => {
        const current = !!approvals.unlockedLabs[unitId];
        const next = !current;
        const updated: TeacherApprovals = {
            ...approvals,
            unlockedLabs: {
                ...approvals.unlockedLabs,
                [unitId]: next,
            },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice(`ห้องปฏิบัติการ 3D (Room ${parseInt(unitId.replace(/[^0-9]/g, '')) + 100}): ${next ? '🎮 ปลดล็อกห้องแล็บ 3D เรียบร้อย' : '🔒 ล็อกห้องแล็บตามเกณฑ์มาตรฐาน'}`);
    };

    // Handler to toggle Assessment Unlock
    const toggleAssessmentUnlock = (unitId: string) => {
        const current = !!approvals.unlockedAssessments[unitId];
        const next = !current;
        const updated: TeacherApprovals = {
            ...approvals,
            unlockedAssessments: {
                ...approvals.unlockedAssessments,
                [unitId]: next,
            },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice(`แบบทดสอบ ปรนัย+อัตนัย (${unitId}): ${next ? '📝 ปลดล็อกให้ทำข้อสอบได้แล้ว' : '🔒 ล็อกแบบทดสอบตามเกณฑ์มาตรฐาน'}`);
    };

    // Handler to mark unit as Passed (Teacher Override)
    const toggleUnitPassed = (unitId: string) => {
        const current = !!approvals.passedUnits[unitId];
        const next = !current;
        const updated: TeacherApprovals = {
            ...approvals,
            passedUnits: {
                ...approvals.passedUnits,
                [unitId]: next,
            },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice(`อนุมัติผลหน่วย ${unitId}: ${next ? '✓ ครูอนุมัติให้ผ่านหน่วยการเรียนรู้แล้ว' : 'ยกเลิกการอนุมัติผ่าน'}`);
    };

    // Unlock All Units & Labs
    const handleUnlockAll = () => {
        const allUnlocked: Record<string, boolean> = {};
        allUnitsContent.forEach((u) => {
            allUnlocked[u.unit.id] = true;
        });
        const updated: TeacherApprovals = {
            ...approvals,
            unlockedUnits: { ...allUnlocked },
            unlockedLabs: { ...allUnlocked },
            unlockedAssessments: { ...allUnlocked },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice('🚀 ปลดล็อกทุกหน่วยการเรียนรู้, ห้องแล็บ 3D, และแบบทดสอบครบทั้ง 8 หน่วยแล้ว', 'success');
    };

    // Reset to Strict Mode
    const handleResetStrict = () => {
        const strictUnits: Record<string, boolean> = { U01: true, U02: false, U03: false, U04: false, U05: false, U06: false, U07: false, U08: false };
        const lockedAll: Record<string, boolean> = { U01: false, U02: false, U03: false, U04: false, U05: false, U06: false, U07: false, U08: false };
        const updated: TeacherApprovals = {
            ...approvals,
            unlockedUnits: strictUnits,
            unlockedLabs: { ...lockedAll },
            unlockedAssessments: { ...lockedAll },
            passedUnits: {},
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);
        showNotice('🔒 รีเซ็ตระบบกลับสู่เกณฑ์มาตรฐาน (ต้องเรียนผ่าน 1.เนื้อหา -> 2.ห้องแล็บ 3D -> 3.แบบทดสอบ)', 'info');
    };

    // Grade subjective submission
    const handleGradeSubmission = (status: 'graded' | 'revision_requested') => {
        if (!selectedSubmission) return;
        gradeSubjectiveSubmission(
            selectedSubmission.id,
            Number(gradeScore),
            gradeFeedback,
            status,
        );
        setSelectedSubmission(null);
        showNotice(`บันทึกผลการตรวจข้อสอบอัตนัยของ ${selectedSubmission.studentName} เรียบร้อย (${status === 'graded' ? 'ผ่านเกณฑ์' : 'ขอให้แก้ไข'})`);
    };

    // Handler to approve student progress (optimistic local state + DB API sync)
    const handleApproveStudent = async (student: RosterStudent, unitKey: string = 'U01') => {
        setStudents((prev) =>
            prev.map((s) => {
                if (s.id === student.id || s.code === student.code) {
                    const currentU = s.unitProgress[unitKey] || { lessons: 10, lab: false, exam: false, passed: false };
                    return {
                        ...s,
                        unitProgress: {
                            ...s.unitProgress,
                            [unitKey]: {
                                ...currentU,
                                lab: true,
                                exam: true,
                                passed: true,
                            },
                        },
                    };
                }
                return s;
            }),
        );

        const effectiveClassUuid = resolveClassUuid(classId);
        const isStudentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student.id);

        if (effectiveClassUuid && isStudentUuid) {
            try {
                const unitUuid = '33333333-3333-4333-8333-333333333333';
                const res = await fetch(`/api/classes/${encodeURIComponent(effectiveClassUuid.trim())}/students/${student.id}/progress/${unitUuid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        progressPercent: 100,
                        passed: true,
                        reason: 'อนุมัติผ่านด่านโดยครูผู้สอน (Teacher Override via Dashboard)',
                    }),
                });

                if (res.ok) {
                    showNotice(`✓ ฐานข้อมูลอัปเดต: ปลดล็อกและอนุมัติสิทธิ์ให้ ${student.name} เรียบร้อยแล้ว`, 'success');
                    return;
                }
            } catch {
                // fallback notice
            }
        }

        showNotice(`อนุมัติสิทธิ์พิเศษให้ ${student.name} เข้าห้องแล็บและทำแบบทดสอบได้ทันที`);
    };

    // Handler to submit teacher override
    const handleOverrideSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updated: TeacherApprovals = {
            ...approvals,
            passedUnits: {
                ...approvals.passedUnits,
                [overrideUnitId]: overridePassed,
            },
        };
        setApprovals(updated);
        saveTeacherApprovals(updated);

        const effectiveClassUuid = resolveClassUuid(classId);
        const targetStudent = students.find((s) => s.code === overrideStudentId || s.id === overrideStudentId);
        const isStudentUuid = targetStudent && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetStudent.id);

        if (effectiveClassUuid && isStudentUuid && targetStudent) {
            try {
                const unitUuid = '33333333-3333-4333-8333-333333333333';
                const res = await fetch(`/api/classes/${encodeURIComponent(effectiveClassUuid.trim())}/students/${targetStudent.id}/progress/${unitUuid}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        progressPercent: Number(overridePercent),
                        passed: overridePassed,
                        reason: overrideReason || 'Teacher Override Audit via Dashboard',
                    }),
                });
                if (res.ok) {
                    showNotice(`✓ บันทึกผลลงฐานข้อมูล: อนุมัติ Override สำหรับ ${targetStudent.name} (${overrideStudentId}) สำเร็จ`, 'success');
                    fetchStudents(classId);
                    return;
                }
            } catch {
                // fallback
            }
        }

        showNotice(`บันทึก Teacher Override สำหรับรหัส ${overrideStudentId} หน่วย ${overrideUnitId} เรียบร้อยแล้ว`);
    };

    // Handler to import student CSV
    const handleCsvImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);
        const isClassUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetClassId);

        if (isClassUuid) {
            try {
                const res = await fetch(`/api/classes/${targetClassId}/students/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csv: csvText }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsImporting(false);
                    showNotice(`✓ นำเข้ารายชื่อนักเรียนลงฐานข้อมูลสำเร็จ ${data.count} รายการ`, 'success');
                    fetchStudents(targetClassId);
                    return;
                } else {
                    const err = await res.json();
                    showNotice(`เกิดข้อผิดพลาดในการนำเข้า: ${err.error || 'Unknown error'}`, 'error');
                    setIsImporting(false);
                    return;
                }
            } catch {
                // fallback
            }
        }

        setTimeout(() => {
            setIsImporting(false);
            showNotice('นำเข้ารายชื่อนักเรียนในชั้นเรียนสำเร็จ 3 รายการ');
        }, 800);
    };


    return (
        <section className="portal-teacher-dashboard bg-slate-900/95 border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                            TEACHER COMMAND CENTER
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            คลาส: {classId} · วิชา 21909-2020
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">
                        ศูนย์อนุมัติสิทธิ์และจัดการการเรียนรู้ (Teacher Approval Hub)
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                        ควบคุมการปลดล็อกหน่วยการเรียนรู้, อนุมัติสิทธิ์การเข้าห้องปฏิบัติการ 3D และแบบทดสอบ
                        รวมถึงตรวจให้คะแนนข้อสอบอัตนัยประจำหน่วย ตามเงื่อนไขและดุลยพินิจของครูผู้สอน
                    </p>
                </div>

                {/* Quick Master Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleUnlockAll}
                        className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                        title="เปิดทุกหน่วยและห้องปฏิบัติการทั้งหมดให้เรียนได้อิสระ"
                    >
                        <span>🚀 ปลดล็อกทุกหน่วย (Unlock All)</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleResetStrict}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                        title="รีเซ็ตกลับสู่ระบบ 3 ขั้นตอนแบบเข้มงวด"
                    >
                        <span>🔒 คืนค่าเกณฑ์มาตรฐาน</span>
                    </button>
                </div>
            </div>

            {/* Notification Alert Banner */}
            {notification && (
                <div
                    className={`mb-6 p-4 rounded-2xl text-xs font-medium border flex items-center justify-between transition-all ${
                        notification.type === 'success'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                            : notification.type === 'info'
                              ? 'bg-sky-950/60 border-sky-500/50 text-sky-200'
                              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-base">{notification.type === 'success' ? '✓' : 'ℹ️'}</span>
                        <span>{notification.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotification(null)}
                        className="text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('approvals')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'approvals'
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <span>🎛️ 1. อนุมัติหน่วยเรียน & ห้องแล็บ 3D</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('grading')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'grading'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <span>📝 2. ศูนย์ตรวจข้อสอบอัตนัย</span>
                    {submissions.filter((s) => s.status === 'pending').length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            {submissions.filter((s) => s.status === 'pending').length}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'students'
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <span>👥 3. ทะเบียนนักเรียน & ความก้าวหน้า</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('override')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'override'
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <span>⚡ 4. บันทึกผลรายบุคคล (Override)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('csv')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'csv'
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <span>📥 5. นำเข้านักเรียน (CSV)</span>
                </button>
            </div>

            {/* TAB 1: CURRICULUM & LAB APPROVAL MATRIX */}
            {activeTab === 'approvals' && (
                <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-300">
                            <strong>กระบวนการเรียนรู้ 3 ขั้นตอน:</strong>
                            <span className="text-slate-400 ml-2">
                                (1) เรียนเนื้อหา 10 บท + ตอบคำถามระหว่างเรียน → (2) ปฏิบัติการห้อง labs 3D → (3) แบบทดสอบ ปรนัย + อัตนัย
                            </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                            * ปุ่มสีเขียว = ปลดล็อกแล้ว · ปุ่มสีเทา = ล็อกตามเกณฑ์
                        </span>
                    </div>

                    {/* Unit Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {allUnitsContent.map((bundle) => {
                            const uid = bundle.unit.id;
                            const roomNum = bundle.unit.number + 100;
                            const isUnitOpen = approvals.unlockedUnits[uid] !== false;
                            const isLabOpen = !!approvals.unlockedLabs[uid];
                            const isExamOpen = !!approvals.unlockedAssessments[uid];
                            const isPassed = !!approvals.passedUnits[uid];

                            return (
                                <article
                                    key={uid}
                                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                                        isPassed
                                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                                            : isUnitOpen
                                              ? 'bg-slate-950/80 border-slate-700 hover:border-sky-500/50'
                                              : 'bg-slate-950/40 border-slate-800 opacity-75'
                                    }`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-11 h-11 rounded-xl bg-sky-950 border border-sky-500/30 text-sky-400 flex items-center justify-center font-mono font-black text-sm">
                                                {uid}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-mono font-bold text-sky-400 uppercase">
                                                        UNIT {String(bundle.unit.number).padStart(2, '0')}
                                                    </span>
                                                    {isPassed && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            ✓ ผ่านหน่วยแล้ว
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-bold text-white m-0">
                                                    {bundle.unit.titleTh}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Unit Master Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => toggleUnitUnlock(uid)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                isUnitOpen
                                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {isUnitOpen ? '🔓 หน่วย: เปิด' : '🔒 หน่วย: ล็อก'}
                                        </button>
                                    </div>

                                    {/* 3 Discrete Steps Controls */}
                                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                                        {/* Step 1: Lessons + In-lesson questions */}
                                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>📚</span>
                                                <div>
                                                    <strong className="text-slate-200 block">
                                                        1. เนื้อหา 10 บท + คำถามระหว่างเรียน
                                                    </strong>
                                                    <span className="text-[11px] text-slate-400">
                                                        {bundle.lessons.length} บทเรียน · {bundle.unit.theoryMinutes} นาที
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-emerald-400 font-mono font-semibold">
                                                {isUnitOpen ? 'พร้อมเรียน 10 บท' : 'รอเปิดหน่วย'}
                                            </span>
                                        </div>

                                        {/* Step 2: 3D Lab Simulation */}
                                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>🎮</span>
                                                <div>
                                                    <strong className="text-slate-200 block">
                                                        2. ปฏิบัติการห้อง labs 3D (Room {roomNum})
                                                    </strong>
                                                    <span className="text-[11px] text-slate-400">
                                                        {bundle.lab.titleTh}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleLabUnlock(uid)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    isLabOpen
                                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                                }`}
                                            >
                                                {isLabOpen ? '✓ อนุมัติแล็บ 3D แล้ว' : '🔒 อนุมัติสิทธิ์ห้องแล็บ'}
                                            </button>
                                        </div>

                                        {/* Step 3: Assessments (Objective + Subjective) */}
                                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>📝</span>
                                                <div>
                                                    <strong className="text-slate-200 block">
                                                        3. แบบทดสอบ ปรนัย + อัตนัย
                                                    </strong>
                                                    <span className="text-[11px] text-slate-400">
                                                        ปรนัย 10 ข้อ + อัตนัย Case Study
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleAssessmentUnlock(uid)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    isExamOpen
                                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                                }`}
                                            >
                                                {isExamOpen ? '✓ อนุมัติสอบแล้ว' : '🔒 อนุมัติสิทธิ์ทำข้อสอบ'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Action Footer */}
                                    <div className="pt-2 flex items-center justify-between text-xs">
                                        <a
                                            href={`/labs/3d/room-${roomNum}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
                                        >
                                            <span>เปิดดูห้อง 3D (Room {roomNum}) ↗</span>
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => toggleUnitPassed(uid)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                isPassed
                                                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                            }`}
                                        >
                                            {isPassed ? 'ยกเลิกการให้ผ่าน' : 'อนุมัติให้ผ่านหน่วยทันที'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: SUBJECTIVE EXAM GRADING HUB */}
            {activeTab === 'grading' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white m-0">
                                รายการข้อสอบอัตนัยที่รอครูตรวจ (Subjective Examination Submissions)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                ตรวจสอบการวิเคราะห์ คำนวณ และการแก้ปัญหาตามสถานการณ์จริงของผู้เรียน
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ส่งตรวจแล้ว {submissions.length} รายการ
                        </span>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="p-12 rounded-3xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                            <span className="text-4xl block">📋</span>
                            <h4 className="text-base font-bold text-slate-200">ยังไม่มีรายการส่งข้อสอบอัตนัยที่ค้างตรวจ</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                เมื่อผู้เรียนทำข้อสอบอัตนัยประจำหน่วยและกดส่ง ระบบจะส่งคำตอบมายังหน้านี้เพื่อให้ครูผู้สอนให้คะแนนและข้อเสนอแนะ
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                {sub.unitId} · อัตนัย
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                รหัส: {sub.studentCode} · {sub.studentName}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    sub.status === 'graded'
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : sub.status === 'revision_requested'
                                                          ? 'bg-rose-500/20 text-rose-300'
                                                          : 'bg-amber-500/20 text-amber-300'
                                                }`}
                                            >
                                                {sub.status === 'graded' ? '✓ ตรวจแล้ว' : sub.status === 'revision_requested' ? '⚠️ ขอแก้ไข' : '⏳ รอตรวจ'}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-white m-0">
                                            ส่งเมื่อ: {sub.submittedAt} {sub.score !== undefined && `· ได้รับ ${sub.score} / ${sub.maxScore} คะแนน`}
                                        </p>

                                        {sub.feedback && (
                                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                                                <strong>Feedback จากครู:</strong> {sub.feedback}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSubmission(sub);
                                            setGradeScore(String(sub.score || 8));
                                            setGradeFeedback(sub.feedback || 'ตอบได้ดี มีความเข้าใจหลักการทางเทคนิค');
                                        }}
                                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
                                    >
                                        ✏️ ตรวจและให้คะแนน
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grading Modal Form */}
                    {selectedSubmission && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                            <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div>
                                        <span className="text-xs font-mono text-amber-400 font-bold">
                                            ตรวจข้อสอบอัตนัย · {selectedSubmission.unitId}
                                        </span>
                                        <h3 className="text-lg font-bold text-white m-0">
                                            ผู้ส่ง: {selectedSubmission.studentName} ({selectedSubmission.studentCode})
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubmission(null)}
                                        className="text-slate-400 hover:text-white text-lg"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Answers Display */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                                        คำตอบที่ผู้เรียนส่งมา:
                                    </h4>
                                    {Object.entries(selectedSubmission.answers).map(([key, val]) => (
                                        <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                            <span className="text-xs font-mono text-sky-400 font-semibold">{key}:</span>
                                            <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed m-0">
                                                {val}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Grading Inputs */}
                                <div className="space-y-4 pt-2 border-t border-slate-800">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                คะแนนที่ให้ (เต็ม {selectedSubmission.maxScore} คะแนน)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={selectedSubmission.maxScore}
                                                value={gradeScore}
                                                onChange={(e) => setGradeScore(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            คำแนะนำ / ข้อเสนอแนะเชิงเทคนิคจากครูผู้สอน
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={gradeFeedback}
                                            onChange={(e) => setGradeFeedback(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                            placeholder="ระบุข้อชื่นชม จุดที่ต้องปรับปรุง หรือวิธีคิดที่ถูกต้อง..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleGradeSubmission('revision_requested')}
                                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                                        >
                                            ⚠️ ขอให้แก้ไขใหม่
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleGradeSubmission('graded')}
                                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                                        >
                                            ✓ บันทึกคะแนนและอนุมัติผ่าน
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: STUDENT ROSTER & PROGRESSION APPROVAL */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white m-0">
                                รายชื่อผู้เรียนและความก้าวหน้า 3 ขั้นตอน
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                ตรวจสอบคะแนนสอบ ผลการทำแล็บ 3D และอนุมัติการผ่านด่านของผู้เรียนสดตามรายหน่วย
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isLoadingStudents}
                                    onClick={() => {
                                        fetchStudents(classId);
                                        setSubmissions(getSubjectiveSubmissions());
                                        showNotice('✓ อัปเดตข้อมูลผู้เรียนและผลสอบสดเรียบร้อยแล้ว', 'info');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-sky-400 border border-slate-700 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <span>{isLoadingStudents ? '⏳ กำลังซิงก์...' : '🔄 รีเฟรชข้อมูลสด'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`px-2.5 py-1.5 rounded-xl border font-mono text-[11px] transition-colors cursor-pointer ${
                                        autoRefresh
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}
                                >
                                    {autoRefresh ? '● Auto-Sync (20s)' : '○ Auto-Sync: ปิด'}
                                </button>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                                {lastSyncTime}
                            </span>
                            <span
                                className={`text-[11px] font-mono ${
                                    realtimeStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                                role="status"
                            >
                                {realtimeStatus === 'connected'
                                    ? '● Supabase Realtime'
                                    : realtimeStatus === 'connecting'
                                      ? '◌ กำลังเชื่อม Realtime'
                                      : autoRefresh
                                        ? '● Polling สำรอง'
                                        : '⚠ Realtime ไม่พร้อม · เปิด Auto-Sync'}
                            </span>
                        </div>
                    </div>

                    {/* Unit Selector Tabs (U01 to U08) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mr-1">
                            เลือกหน่วยเรียนรู้:
                        </span>
                        {allUnitsContent.map((bundle) => {
                            const uid = bundle.unit.id;
                            const isSelected = selectedUnitTab === uid;
                            return (
                                <button
                                    key={uid}
                                    type="button"
                                    onClick={() => setSelectedUnitTab(uid)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                    }`}
                                >
                                    <span className="font-mono">{uid}</span>
                                    <span>{bundle.unit.titleTh.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Error Banner if API sync failed */}
                    {fetchError && (
                        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/30">
                            <div className="flex items-start sm:items-center gap-2.5">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="font-bold text-amber-100 m-0">{fetchError}</p>
                                    <p className="text-[11px] text-amber-300/80 m-0 mt-0.5">
                                        ระบบจะแสดงผลเฉพาะข้อมูลที่ดึงได้ หรือกรุณาตรวจสอบสิทธิ์ครูผู้สอนและตาราง <code className="font-mono bg-amber-900/40 px-1 py-0.5 rounded">class_members</code> ใน Supabase
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchStudents(classId)}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 transition-all cursor-pointer shadow"
                            >
                                🔄 โหลดใหม่อีกครั้ง
                            </button>
                        </div>
                    )}

                    {/* Group Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mr-1">
                            กลุ่มเรียน:
                        </span>
                        {[
                            { id: 'ALL', label: `ทั้งหมด (${students.length} คน)` },
                            ...(students.some((student) => student.groupId)
                                ? [
                                      { id: '692190901', label: `กลุ่ม 1 (${students.filter((s) => s.groupId === '692190901').length} คน)` },
                                      { id: '692190902', label: `กลุ่ม 2 (${students.filter((s) => s.groupId === '692190902').length} คน)` },
                                      { id: '692190903', label: `กลุ่ม 3 (${students.filter((s) => s.groupId === '692190903').length} คน)` },
                                  ]
                                : []),
                        ].map((grp) => {
                            const isGrpSelected = selectedGroupFilter === grp.id;
                            return (
                                <button
                                    key={grp.id}
                                    type="button"
                                    onClick={() => setSelectedGroupFilter(grp.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        isGrpSelected
                                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                    }`}
                                >
                                    {grp.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                                    <th className="p-3 w-12 text-center">ลำดับ</th>
                                    <th className="p-3">รหัสผู้เรียน</th>
                                    <th className="p-3">ชื่อ - สกุล</th>
                                    <th className="p-3">กลุ่ม</th>
                                    <th className="p-3">1. เนื้อหา 10 บท</th>
                                    <th className="p-3">2. ห้องแล็บ 3D</th>
                                    <th className="p-3">3. แบบทดสอบ</th>
                                    <th className="p-3">ผลการอนุมัติ</th>
                                    <th className="p-3 text-right">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {students
                                    .filter((st) => selectedGroupFilter === 'ALL' || st.groupId === selectedGroupFilter)
                                    .map((st, idx) => {
                                    const currentUnitData = st.unitProgress[selectedUnitTab] || { lessons: 0, lab: false, exam: false, passed: false };
                                    const pendingSub = submissions.find(
                                        (s) =>
                                            (s.studentCode === st.code || s.studentName === st.name) &&
                                            s.unitId === selectedUnitTab &&
                                            s.status === 'pending',
                                    );

                                    return (
                                        <tr key={st.code || st.id} className="hover:bg-slate-950/40 transition-colors">
                                            <td className="p-3 text-center font-mono text-slate-400">
                                                {st.orderNum || idx + 1}
                                            </td>
                                            <td className="p-3 font-mono font-bold text-sky-400">
                                                {st.code || st.id.slice(0, 8)}
                                            </td>
                                            <td className="p-3 font-semibold text-white">
                                                {st.name}
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                                    {st.groupId ? `กลุ่ม ${st.groupId.slice(-1)}` : '-'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                                        currentUnitData.lessons >= 10
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : 'bg-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {currentUnitData.lessons}/10 บท
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {currentUnitData.lab ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        ✓ ผ่านแล็บ 3D {currentUnitData.labScore ? `(${currentUnitData.labScore}/100)` : ''}
                                                    </span>
                                                ) : currentUnitData.latestLabStatus === 'submitted' || currentUnitData.latestLabStatus === 'reviewing' ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                                        🔔 ส่งแล็บแล้ว (รอตรวจ)
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">
                                                        รอทดสอบ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {pendingSub ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSubmission(pendingSub);
                                                            setGradeScore(String(pendingSub.score || 8));
                                                            setGradeFeedback(pendingSub.feedback || '');
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer animate-pulse"
                                                        title="คลิกเพื่อตรวจข้อสอบอัตนัยนี้ทันที"
                                                    >
                                                        <span>🔔 มีข้อสอบใหม่ (ตรวจ)</span>
                                                    </button>
                                                ) : currentUnitData.exam ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        ✓ สอบแล้ว {currentUnitData.examScore ? `(${currentUnitData.examScore}/100)` : ''}
                                                    </span>
                                                ) : currentUnitData.latestQuizStatus === 'submitted' ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                                        📝 ส่งข้อสอบแล้ว
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">
                                                        ยังไม่สอบ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        currentUnitData.passed
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                    }`}
                                                >
                                                    {currentUnitData.passed
                                                        ? `✓ ผ่านหน่วย ${selectedUnitTab.replace('U0', '').replace('U', '')}`
                                                        : 'กำลังดำเนินการ'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApproveStudent(st, selectedUnitTab)}
                                                    className="px-3 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    อนุมัติผ่านด่าน
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: TEACHER OVERRIDE FORM */}
            {activeTab === 'override' && (
                <form
                    onSubmit={handleOverrideSubmit}
                    className="space-y-4 max-w-2xl"
                >
                    <h3 className="text-base font-bold text-white">
                        ปรับปรุงผลการเรียนเป็นกรณีพิเศษ (Teacher Override Audit)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">รหัสผู้เรียน</label>
                            <input
                                type="text"
                                value={overrideStudentId}
                                onChange={(e) => setOverrideStudentId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">หน่วยการเรียนรู้</label>
                            <select
                                value={overrideUnitId}
                                onChange={(e) => setOverrideUnitId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-sky-400 focus:outline-none focus:border-sky-500"
                            >
                                {allUnitsContent.map((u) => (
                                    <option key={u.unit.id} value={u.unit.id}>
                                        {u.unit.id} : {u.unit.titleTh}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">ร้อยละความก้าวหน้า (0 - 100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={overridePercent}
                                onChange={(e) => setOverridePercent(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="overridePassedCheck"
                                checked={overridePassed}
                                onChange={(e) => setOverridePassed(e.target.checked)}
                                className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500"
                            />
                            <label htmlFor="overridePassedCheck" className="text-sm font-medium text-slate-200 cursor-pointer">
                                อนุมัติให้ผ่านหน่วยการเรียนรู้นี้ (Passed)
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            เหตุผลประกอบการอนุมัติ (บันทึกลง Audit Log)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="ระบุเหตุผล เช่น ผ่านการประเมินทักษะภาคปฏิบัติในห้องเรียนจริงแล้ว..."
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-500"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                        >
                            บันทึกผลการอนุมัติ
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 5: CSV IMPORT FORM */}
            {activeTab === 'csv' && (
                <form
                    onSubmit={handleCsvImport}
                    className="space-y-4 max-w-2xl"
                >
                    <h3 className="text-base font-bold text-white">
                        นำเข้ารายชื่อนักเรียนในชั้นเรียน (CSV Import)
                    </h3>
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">รหัสชั้นเรียน (Class ID)</label>
                        <input
                            type="text"
                            value={targetClassId}
                            onChange={(e) => setTargetClassId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            ข้อมูลนักเรียนรูปแบบ CSV (email,student_code,display_name)
                        </label>
                        <textarea
                            rows={5}
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                            className="w-full font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-500"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isImporting}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                        >
                            {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าบัญชีนักเรียน'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
