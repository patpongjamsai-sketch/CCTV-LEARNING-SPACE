'use client';

import { useEffect, useState } from 'react';

export type FaultChallengeModalProps = {
    unitId: string;
    unitTitle: string;
    faultTitle: string;
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

const SAMPLE_CASE_STUDIES: Record<string, FormDataState> = {
    U01: {
        problem: 'กล้อง IP Camera บริเวณทางเข้าหลัก (Main Entrance Room 101) แสดงสถานะ "NO VIDEO" บนจอ NVR ในขณะที่กล้องตัวอื่นอีก 3 ตัวทำงานปกติ',
        possibleCauses: '1. สายสัญญาณ CAT6 ขาดในหรือหัว RJ45 เข้าหัวไม่สนิท\n2. พอร์ต PoE บน Switch ช่องที่ 3 ไม่จ่ายไฟหรือชำรุด\n3. กล้อง IP Camera เสียหายจากแรงดันไฟฟ้ากระชาก',
        testMethod: '1. ใช้ Digital Multimeter วัดแรงดันไฟ PoE บนคู่สาย 4-5 (+) และ 7-8 (-) ที่ปลายสายกล้อง (พิกัด 48VDC)\n2. ใช้ Network Cable Tester ทดสอบความต่อเนื่องของสายทั้ง 8 เส้น\n3. นำสาย Patch Cord สำรองมาทดสอบต่อตรงระหว่างกล้องกับ PoE Switch',
        testResult: 'วัดแรงดันไฟที่ปลายสายได้ 0V แต่เมื่อนำ Patch Cord สำรองมาต่อตรงที่พอร์ตเดิม ไฟเลี้ยง 48V จ่ายปกติและภาพขึ้น แสดงว่าสาย CAT6 ช่วงจุดติดตั้งมีสายคอร์ที่ 4 และ 5 ขาดใน',
        evidenceFileName: 'multimeter_poe_test_0v.jpg',
        evidenceFilePreview: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        solution: 'ทำการร้อยสาย CAT6 Outdoor พร้อมชีลด์เส้นใหม่ตามแนวท่อ Conduit เข้าหัว RJ45 ตามมาตรฐาน TIA/EIA 568B พร้อมใส่ Rubber Boot กันน้ำ และทดสอบด้วย Cable Tester ผ่านครบทุกคู่สาย',
        retestResult: 'ไฟ PoE Link LED บน Switch ขึ้นสีส้ม/เขียวนิ่ง (1000Mbps), NVR ค้นพบ IP กล้องผ่าน ONVIF อัตโนมัติ, ภาพ Live View และฟังก์ชัน Recording บันทึกลง HDD สำเร็จ 100%',
    },
};

export function FaultChallengeModal({
    unitId,
    unitTitle: _unitTitle,
    faultTitle,
    isOpen,
    onClose,
    onComplete,
}: FaultChallengeModalProps) {
    const [formData, setFormData] = useState<FormDataState>(DEFAULT_FORM);
    const [activeStep, setActiveStep] = useState<number>(1);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [submittedAt, setSubmittedAt] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Load saved submission on open
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem(`cctv_fault_submission_${unitId}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed?.formData) {
                        setFormData(parsed.formData);
                        setIsSubmitted(true);
                        setSubmittedAt(parsed.submittedAt || null);
                        return;
                    }
                } catch {
                    // ignore
                }
            }
            setFormData(DEFAULT_FORM);
            setActiveStep(1);
            setIsSubmitted(false);
            setSubmittedAt(null);
            setStatusMessage(null);
        }
    }, [isOpen, unitId]);

    if (!isOpen) return null;

    const handleFieldChange = (field: keyof FormDataState, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create thumbnail preview
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
        const sample = SAMPLE_CASE_STUDIES[unitId] || SAMPLE_CASE_STUDIES.U01;
        setFormData(sample || DEFAULT_FORM);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.problem.trim() || !formData.solution.trim()) {
            alert('กรุณากรอกข้อมูลขั้นตอนการแก้ปัญหาให้ครบถ้วนอย่างน้อยปัญหาและการแก้ไข');
            return;
        }

        setIsSubmitting(true);
        const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

        const record = {
            unitId,
            formData,
            submittedAt: timestamp,
            status: 'under_review',
        };

        localStorage.setItem(`cctv_fault_submission_${unitId}`, JSON.stringify(record));

        // Fire custom event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cctv_fault_submitted', { detail: record }));
        }

        // Try server submission
        try {
            const classId = localStorage.getItem('cctv_active_class_id');
            if (classId) {
                await fetch('/api/learning/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        kind: 'lab',
                        classId,
                        unitId: unitId.toLowerCase(),
                        title: `[Fault Challenge 6 Steps] ${faultTitle}`,
                        studentNotes: JSON.stringify(formData),
                    }),
                });
            }
            setStatusMessage('ส่งแบบทดสอบและหลักฐานให้อาจารย์ผู้สอนเรียบร้อยแล้ว');
        } catch {
            setStatusMessage('บันทึกรายงานการแก้ปัญหาในอุปกรณ์ของคุณเรียบร้อย (ออฟไลน์)');
        } finally {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setSubmittedAt(timestamp);
            if (onComplete) onComplete();
        }
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
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                                {unitId}-F01 · FAULT CHALLENGE
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน 6 ขั้นตอน (15 คะแนน)
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white m-0">
                            {faultTitle}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isSubmitted && (
                            <button
                                type="button"
                                onClick={handleLoadSample}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                                title="ใส่ข้อมูลกรณีศึกษาตัวอย่างเพื่อการเรียนรู้"
                            >
                                <span>💡</span>
                                <span>โหลดกรณีศึกษาตัวอย่าง</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                            aria-label="ปิดหน้าต่าง"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Status Badge when submitted */}
                    {isSubmitted && (
                        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                                    <strong className="text-sm text-amber-300">
                                        สถานะ: รออาจารย์ผู้สอนตรวจประเมิน (Under Review)
                                    </strong>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    ส่งเมื่อ: {submittedAt || 'ล่าสุด'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed m-0">
                                {statusMessage || 'รายงานการสืบค้น 6 ขั้นตอนถูกบันทึกเข้าระบบเรียบร้อยแล้ว อาจารย์จะให้คะแนนตามเกณฑ์ Rubric (15 คะแนน) พร้อมความคิดเห็นสะท้อนกลับ'}
                            </p>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleResetToEdit}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                                >
                                    ✏️ แก้ไขรายงานที่ส่ง
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-sky-600/30"
                                >
                                    ✓ รับทราบและปิดหน้าต่าง
                                </button>
                            </div>
                        </div>
                    )}

                    {/* The 6-Step Workflow Guide */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                        {[
                            { num: 1, label: '1. Problem', desc: 'ระบุปัญหา' },
                            { num: 2, label: '2. Cause', desc: 'สมมติฐาน' },
                            { num: 3, label: '3. Test', desc: 'ตรวจวัด' },
                            { num: 4, label: '4. Result', desc: 'หลักฐาน' },
                            { num: 5, label: '5. Solution', desc: 'แก้ต้นเหตุ' },
                            { num: 6, label: '6. Retest', desc: 'ส่งมอบงาน' },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    activeStep === step.num
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                                }`}
                            >
                                <span className="block text-[11px] opacity-80">{step.label}</span>
                                <span className="text-[10px] text-slate-300">{step.desc}</span>
                            </div>
                        ))}
                    </div>

                    {/* The Form Fields */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    <span>ขั้นตอนที่ 1: การระบุปัญหา (Problem Formulation)</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">ระบุอาการเสีย / Work Order</span>
                            </div>
                            <textarea
                                rows={2}
                                value={formData.problem}
                                onChange={(e) => handleFieldChange('problem', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="เช่น กล้อง IP Camera ตัวที่ 2 บริเวณทางเข้าขึ้น No Video บน NVR แต่กล้องตัวอื่นปกติ..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
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
                                    <span>ขั้นตอนที่ 2: การวิเคราะห์สมมติฐานสาเหตุ (Possible Causes)</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">แยกแยะ Power / Physical / Logic</span>
                            </div>
                            <textarea
                                rows={3}
                                value={formData.possibleCauses}
                                onChange={(e) => handleFieldChange('possibleCauses', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="แยกแยะสาเหตุที่เป็นไปได้ 2-3 ประการ เช่น 1. สายสัญญาณขาดใน, 2. PoE Switch ช่องนั้นไม่จ่ายไฟ, 3. กล้องเสีย..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
                                required
                            />
                        </div>

                        {/* Step 3: Test & Measurement */}
                        <div
                            onFocus={() => setActiveStep(3)}
                            className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                        3
                                    </span>
                                    <span>ขั้นตอนที่ 3: การตรวจวัดและทดสอบ (Test & Measurement)</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">เครื่องมือและวิธีการทดสอบ</span>
                            </div>
                            <textarea
                                rows={3}
                                value={formData.testMethod}
                                onChange={(e) => handleFieldChange('testMethod', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="ระบุเครื่องมือ เช่น Multimeter วัดแรงดันไฟ 48V PoE, Cable Tester ตรวจสอบสายทั้ง 8 เส้น..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
                                required
                            />
                        </div>

                        {/* Step 4: Result & Evidence */}
                        <div
                            onFocus={() => setActiveStep(4)}
                            className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                        4
                                    </span>
                                    <span>ขั้นตอนที่ 4: ผลการตรวจวัดและหลักฐาน (Result & Evidence Upload)</span>
                                </label>
                                <span className="text-[11px] font-mono text-amber-400 font-semibold">★ แนบภาพถ่ายหลักฐาน</span>
                            </div>

                            <textarea
                                rows={2}
                                value={formData.testResult}
                                onChange={(e) => handleFieldChange('testResult', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="บันทึกค่าที่วัดได้จริง เช่น วัดแรงดันปลายสายได้ 0V แสดงว่าสายคอร์จ่ายไฟขาดใน..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
                                required
                            />

                            {/* Evidence File Upload Box */}
                            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                        <span>📷 แนบภาพหลักฐานการตรวจวัด (Evidence Photo / Screenshot)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 m-0">
                                        ภาพถ่ายมิเตอร์วัดไฟ, ภาพหน้าจอ NVR, หรือภาพสายสัญญาณที่ชำรุด (JPG, PNG, WebP)
                                    </p>
                                </div>

                                {!isSubmitted && (
                                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">
                                        <span>📁 เลือกไฟล์รูปภาพ</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Evidence Preview Thumbnail */}
                            {formData.evidenceFilePreview && (
                                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={formData.evidenceFilePreview}
                                            alt="หลักฐานภาพถ่าย"
                                            className="w-16 h-12 object-cover rounded-lg border border-slate-700"
                                        />
                                        <div>
                                            <span className="text-xs font-semibold text-white block">
                                                {formData.evidenceFileName || 'evidence_attachment.jpg'}
                                            </span>
                                            <span className="text-[10px] text-emerald-400 font-mono">
                                                ✓ แนบหลักฐานเรียบร้อย
                                            </span>
                                        </div>
                                    </div>

                                    {!isSubmitted && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveEvidence}
                                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 text-xs transition-colors"
                                            title="ลบภาพหลักฐาน"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 5: Root-cause Solution */}
                        <div
                            onFocus={() => setActiveStep(5)}
                            className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                        5
                                    </span>
                                    <span>ขั้นตอนที่ 5: การแก้ไขปัญหาที่ต้นเหตุ (Root-cause Solution)</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">การลงมือปฏิบัติงานจริง</span>
                            </div>
                            <textarea
                                rows={3}
                                value={formData.solution}
                                onChange={(e) => handleFieldChange('solution', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="อธิบายขั้นตอนการแก้ปัญหาที่ถูกต้อง เช่น เข้าหัว RJ45 ใหม่ตามมาตรฐาน TIA/EIA 568B, ร้อยสายในท่อ Conduit..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
                                required
                            />
                        </div>

                        {/* Step 6: Retest & Acceptance */}
                        <div
                            onFocus={() => setActiveStep(6)}
                            className="bg-slate-950/50 border border-slate-800/90 focus-within:border-amber-500/50 rounded-2xl p-5 space-y-2 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                                        6
                                    </span>
                                    <span>ขั้นตอนที่ 6: การทดสอบซ้ำและการตรวจรับรอง (Retest & Acceptance)</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">เกณฑ์ตรวจรับก่อนส่งมอบ</span>
                            </div>
                            <textarea
                                rows={2}
                                value={formData.retestResult}
                                onChange={(e) => handleFieldChange('retestResult', e.target.value)}
                                disabled={isSubmitted}
                                placeholder="บันทึกผลการทดสอบซ้ำ เช่น ภาพ Live View และ Recording กลับมาปกติ, ตรวจสอบ Link LED..."
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-75"
                                required
                            />
                        </div>

                        {/* Footer Form Submit */}
                        {!isSubmitted && (
                            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800">
                                <span className="text-xs text-slate-400">
                                    คะแนนเต็ม 15 คะแนน (น้ำหนัก 15% ตามเกณฑ์หลักสูตร)
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
                                >
                                    <span>{isSubmitting ? 'กำลังส่งรายงาน...' : '🚀 ส่งรายงานให้อาจารย์ตรวจ (Submit)'}</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
