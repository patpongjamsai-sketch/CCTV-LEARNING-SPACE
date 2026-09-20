'use client';

// Progression and Teacher Approval State Engine
// Manages the 3-step pedagogical sequence:
// 1. Study 10 lessons + answer in-lesson questions
// 2. Hands-on 3D virtual lab simulation
// 3. Objective multiple-choice + Subjective essay exam

export type TeacherApprovals = {
    // Unit-level unlock overrides (e.g. U01: true, U02: true)
    unlockedUnits: Record<string, boolean>;
    // 3D Lab unlock overrides (e.g. U01: true)
    unlockedLabs: Record<string, boolean>;
    // Assessment unlock overrides (e.g. U01: true)
    unlockedAssessments: Record<string, boolean>;
    // Unit pass overrides (e.g. U01: true)
    passedUnits: Record<string, boolean>;
    // Per-student specific overrides: studentCode -> unitId -> { labUnlocked, examUnlocked, passed }
    studentOverrides: Record<string, Record<string, { labUnlocked?: boolean; examUnlocked?: boolean; passed?: boolean }>>;
};

export type SubjectiveSubmission = {
    id: string;
    unitId: string;
    studentCode: string;
    studentName: string;
    submittedAt: string;
    answers: Record<string, string>;
    status: 'pending' | 'graded' | 'revision_requested';
    score?: number;
    maxScore: number;
    feedback?: string;
    gradedAt?: string;
};

const STORAGE_KEY_TEACHER_APPROVALS = 'cctv_teacher_approvals';
const STORAGE_KEY_SUBJECTIVE_SUBMISSIONS = 'cctv_subjective_submissions';

// Initial default teacher approvals: Unit 1 unlocked by default for orientation
export const DEFAULT_TEACHER_APPROVALS: TeacherApprovals = {
    unlockedUnits: {
        U01: true,
        U02: false,
        U03: false,
        U04: false,
        U05: false,
        U06: false,
        U07: false,
        U08: false,
    },
    unlockedLabs: {
        U01: false,
        U02: false,
        U03: false,
        U04: false,
        U05: false,
        U06: false,
        U07: false,
        U08: false,
    },
    unlockedAssessments: {
        U01: false,
        U02: false,
        U03: false,
        U04: false,
        U05: false,
        U06: false,
        U07: false,
        U08: false,
    },
    passedUnits: {},
    studentOverrides: {},
};

/**
 * Retrieve current teacher approvals from localStorage (or fallback)
 */
export function getTeacherApprovals(): TeacherApprovals {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_APPROVALS;
    try {
        const saved = localStorage.getItem(STORAGE_KEY_TEACHER_APPROVALS);
        if (!saved) return DEFAULT_TEACHER_APPROVALS;
        const parsed = JSON.parse(saved);
        return {
            unlockedUnits: { ...DEFAULT_TEACHER_APPROVALS.unlockedUnits, ...(parsed.unlockedUnits || {}) },
            unlockedLabs: { ...DEFAULT_TEACHER_APPROVALS.unlockedLabs, ...(parsed.unlockedLabs || {}) },
            unlockedAssessments: { ...DEFAULT_TEACHER_APPROVALS.unlockedAssessments, ...(parsed.unlockedAssessments || {}) },
            passedUnits: { ...(parsed.passedUnits || {}) },
            studentOverrides: { ...(parsed.studentOverrides || {}) },
        };
    } catch {
        return DEFAULT_TEACHER_APPROVALS;
    }
}

/**
 * Save updated teacher approvals and broadcast change event
 */
export function saveTeacherApprovals(approvals: TeacherApprovals): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY_TEACHER_APPROVALS, JSON.stringify(approvals));
        window.dispatchEvent(new CustomEvent('cctv_approvals_updated', { detail: approvals }));
    } catch {
        // ignore storage errors
    }
}

/**
 * Check whether a learning unit is unlocked for learners.
 * Teachers/Admins always have full access.
 */
export function isUnitUnlocked(unitId: string, role?: string): boolean {
    if (role === 'teacher' || role === 'admin') return true;
    const approvals = getTeacherApprovals();
    // Check direct unit unlock
    if (approvals.unlockedUnits[unitId]) return true;

    // Unit 1 is accessible by default unless explicitly set to false
    if (unitId === 'U01' && approvals.unlockedUnits[unitId] !== false) return true;

    // Check if prior unit was marked passed
    const unitNum = parseInt(unitId.replace(/[^0-9]/g, ''), 10);
    if (unitNum > 1) {
        const priorUnitId = `U${String(unitNum - 1).padStart(2, '0')}`;
        if (approvals.passedUnits[priorUnitId] || isUnitFullyPassed(priorUnitId)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if the 10 lessons + in-lesson knowledge check questions of a unit are completed
 */
export function getUnitLessonProgress(unitId: string): {
    totalLessons: number;
    completedCount: number;
    passed: boolean;
    missingLessons: string[];
} {
    const totalLessons = 10;
    const missing: string[] = [];
    let completedCount = 0;

    if (typeof window === 'undefined') {
        return { totalLessons, completedCount: 0, passed: false, missingLessons: [] };
    }

    for (let i = 1; i <= totalLessons; i++) {
        const lessonId = `${unitId}-L${String(i).padStart(2, '0')}`;
        const saved = localStorage.getItem(`lesson_quiz_${lessonId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed?.isCorrect || parsed?.choice !== undefined) {
                    completedCount++;
                    continue;
                }
            } catch {
                // ignore
            }
        }
        missing.push(lessonId);
    }

    return {
        totalLessons,
        completedCount,
        passed: completedCount >= totalLessons,
        missingLessons: missing,
    };
}

/**
 * Check if the 3D Virtual Lab is unlocked for a unit.
 * Rules:
 * - Unlocked if role is teacher/admin
 * - Unlocked if teacher explicitly enabled it in approvals
 * - Unlocked if student completed all 10 lessons + knowledge checks of that unit
 */
export function isLabUnlocked(unitId: string, role?: string, studentCode?: string): {
    unlocked: boolean;
    reason: string;
} {
    if (typeof window === 'undefined') {
        return { unlocked: true, reason: '' };
    }
    if (role === 'teacher' || role === 'admin') {
        return { unlocked: true, reason: 'สิทธิ์ผู้สอน/ผู้ดูแลระบบ (Teacher Override)' };
    }

    // Check if the Unit itself is unlocked first
    if (!isUnitUnlocked(unitId, role)) {
        return {
            unlocked: false,
            reason: 'หน่วยการเรียนรู้นี้ยังไม่เปิด กรุณาศึกษาตามลำดับ หรือรอครูผู้สอนอนุมัติการเปิดหน่วย',
        };
    }

    const approvals = getTeacherApprovals();

    // Check student-specific override
    if (studentCode && approvals.studentOverrides[studentCode]?.[unitId]?.labUnlocked) {
        return { unlocked: true, reason: 'ครูผู้สอนอนุมัติการเข้าห้องแล็บเป็นรายบุคคล' };
    }

    // Check class-level teacher lab approval
    if (approvals.unlockedLabs[unitId]) {
        return { unlocked: true, reason: 'ครูผู้สอนอนุมัติให้เข้าห้องปฏิบัติการ 3D แล้ว' };
    }

    // Check lesson completion
    const lessonProgress = getUnitLessonProgress(unitId);
    if (lessonProgress.passed) {
        return { unlocked: true, reason: 'ผ่านการเรียนรู้และตอบคำถามครบ 10 บทเรียนแล้ว' };
    }

    return {
        unlocked: false,
        reason: `ต้องเรียนเนื้อหาและตอบคำถามระหว่างเรียนให้ครบทั้ง 10 บทก่อน (ปัจจุบันผ่าน ${lessonProgress.completedCount}/${lessonProgress.totalLessons} บท) หรือรอครูผู้สอนอนุมัติ`,
    };
}

/**
 * Check if the 3D Virtual Lab has been completed/passed
 */
export function isLabPassed(unitId: string): boolean {
    if (typeof window === 'undefined') return false;
    const roomNum = parseInt(unitId.replace(/[^0-9]/g, ''), 10) + 100;
    const labSubmission = localStorage.getItem(`cctv_lab_submission_${unitId}`);
    const labFinished = localStorage.getItem(`cctv_lab_room_${roomNum}_completed`);
    const teacherApprovals = getTeacherApprovals();

    if (teacherApprovals.passedUnits[unitId]) return true;

    return !!(labSubmission || labFinished);
}

/**
 * Check if the Assessment (ปรนัย + อัตนัย) is unlocked for a unit.
 * Rules:
 * - Unlocked if role is teacher/admin
 * - Unlocked if teacher explicitly enabled it in approvals
 * - Unlocked if student has completed the 3D Lab of that unit
 */
export function isAssessmentUnlocked(unitId: string, role?: string, studentCode?: string): {
    unlocked: boolean;
    reason: string;
} {
    if (role === 'teacher' || role === 'admin') {
        return { unlocked: true, reason: 'สิทธิ์ผู้สอน/ผู้ดูแลระบบ (Teacher Override)' };
    }

    const approvals = getTeacherApprovals();

    // Check student-specific override
    if (studentCode && approvals.studentOverrides[studentCode]?.[unitId]?.examUnlocked) {
        return { unlocked: true, reason: 'ครูผู้สอนอนุมัติการทำแบบทดสอบเป็นรายบุคคล' };
    }

    // Check class-level teacher assessment approval
    if (approvals.unlockedAssessments[unitId]) {
        return { unlocked: true, reason: 'ครูผู้สอนอนุมัติให้ทำแบบทดสอบแล้ว' };
    }

    // Check lab completion requirement
    if (isLabPassed(unitId)) {
        return { unlocked: true, reason: 'ผ่านการปฏิบัติการห้อง 3D Lab แล้ว พร้อมทำแบบทดสอบ' };
    }

    return {
        unlocked: false,
        reason: 'ต้องผ่านการทดสอบในห้องปฏิบัติการ 3D Lab ของหน่วยนี้ก่อน จึงจะสามารถทำแบบทดสอบได้ หรือรอครูผู้สอนอนุมัติ',
    };
}

/**
 * Check if unit is fully passed (All 3 steps: Lessons, Lab 3D, and Assessments)
 */
export function isUnitFullyPassed(unitId: string): boolean {
    if (typeof window === 'undefined') return false;
    const approvals = getTeacherApprovals();
    if (approvals.passedUnits[unitId]) return true;

    const examSaved = localStorage.getItem(`cctv_unit_exam_${unitId}`);
    if (examSaved) {
        try {
            const parsed = JSON.parse(examSaved);
            if (parsed.passed) return true;
        } catch {
            // ignore
        }
    }
    return false;
}

/**
 * Subjective Exam Submissions Management
 */
export function getSubjectiveSubmissions(): SubjectiveSubmission[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SUBJECTIVE_SUBMISSIONS);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveSubjectiveSubmission(sub: SubjectiveSubmission): void {
    if (typeof window === 'undefined') return;
    try {
        const list = getSubjectiveSubmissions();
        const existingIndex = list.findIndex((item) => item.id === sub.id || (item.unitId === sub.unitId && item.studentCode === sub.studentCode));
        if (existingIndex >= 0) {
            list[existingIndex] = { ...list[existingIndex], ...sub };
        } else {
            list.unshift(sub);
        }
        localStorage.setItem(STORAGE_KEY_SUBJECTIVE_SUBMISSIONS, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('cctv_subjective_updated', { detail: list }));
    } catch {
        // ignore
    }
}

export function gradeSubjectiveSubmission(
    submissionId: string,
    score: number,
    feedback: string,
    status: 'graded' | 'revision_requested',
): void {
    if (typeof window === 'undefined') return;
    const list = getSubjectiveSubmissions();
    const sub = list.find((item) => item.id === submissionId);
    if (sub) {
        sub.score = score;
        sub.feedback = feedback;
        sub.status = status;
        sub.gradedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY_SUBJECTIVE_SUBMISSIONS, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('cctv_subjective_updated', { detail: list }));
    }
}
