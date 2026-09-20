import { notFound } from 'next/navigation';

import { getAllLessons, getLessonById, getUnitContent } from '../../../../../content/courses/21909-2020';
import { PortalGlobalNav } from '../../../../../components/portal/PortalGlobalNav';
import { getQuestionByLessonId } from '../../../../../data/unitExamQuestions';
import { LessonKnowledgeCheck } from '../../../../../components/portal/LessonKnowledgeCheck';

type LessonPageProps = {
    params: Promise<{ lessonId: string }>;
};

export function generateStaticParams() {
    return getAllLessons().map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { lessonId } = await params;
    const lesson = getLessonById(lessonId);

    if (!lesson) {
        notFound();
    }

    const unitBundle = getUnitContent(lesson.unitId);
    const unitLessons = unitBundle?.lessons || [];

    const previousLesson = lesson.previousLessonId
        ? getLessonById(lesson.previousLessonId)
        : undefined;
    const nextLesson = lesson.nextLessonId
        ? getLessonById(lesson.nextLessonId)
        : undefined;

    const question = getQuestionByLessonId(lesson.id);

    return (
        <>
            <PortalGlobalNav />
            <main className="portal-document-page" data-lesson-id={lesson.id}>
                <a className="portal-back-link" href="/courses/21909-2020">
                    ← กลับเส้นทางการเรียนรู้
                </a>
            <p className="portal-kicker">
                {lesson.unitId} · LESSON {String(lesson.order).padStart(2, '0')} · {lesson.role.toUpperCase()}
            </p>
            <h1>{lesson.titleTh}</h1>
            <p>
                บทเรียนที่ {lesson.order} จาก {unitLessons.length} ในหน่วย {lesson.unitId} ({unitBundle?.unit.titleTh}) · ใช้เป็นพื้นฐานสำหรับการทำแบบประเมินและ LAB
            </p>

            <section className="lesson-panel" aria-labelledby="lesson-objectives">
                <p className="portal-kicker">LEARNING OBJECTIVES</p>
                <h2 id="lesson-objectives">วัตถุประสงค์การเรียนรู้</h2>
                <ul className="lesson-objective-list">
                    {lesson.learningObjectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                    ))}
                </ul>
            </section>

            <section className="lesson-panel" aria-labelledby="lesson-content">
                <p className="portal-kicker">LESSON CONTENT</p>
                <h2 id="lesson-content">เนื้อหาและกิจกรรมการเรียน</h2>
                <div className="lesson-section-list">
                    {lesson.sections.map((section, index) => (
                        <article key={section.id} className="lesson-section-card">
                            <span className="lesson-section-number">ส่วนที่ {index + 1}</span>
                            <h3>{section.type === 'concept' ? 'แนวคิดหลัก' : section.type}</h3>
                            <p>{section.content}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Interactive Lesson Knowledge Check Question */}
            <LessonKnowledgeCheck question={question} />

            <section className="lesson-panel lesson-study-panel" aria-labelledby="lesson-study-guide">
                <p className="portal-kicker">STUDY GUIDE</p>
                <h2 id="lesson-study-guide">วิธีเรียนบทนี้</h2>
                <ol>
                    <li>อ่านแนวคิดหลักและระบุอุปกรณ์หรือหน้าที่ที่เกี่ยวข้องกับระบบ CCTV</li>
                    <li>เชื่อมโยงความรู้กับบทก่อนหน้าและตรวจความเข้าใจก่อนเข้าสู่บทถัดไป</li>
                    <li>จดคำถามหรือหลักฐานที่ต้องใช้ในแบบประเมินและภาคปฏิบัติของ {lesson.unitId}</li>
                </ol>
            </section>

            {!nextLesson && (
                <section className="p-6 my-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/40 text-slate-100 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/40">
                            STEP 1 COMPLETED
                        </span>
                        <span className="text-xs text-slate-400 font-medium">บทเรียนสุดท้ายของหน่วย {lesson.unitId}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">
                        🎯 ก้าวต่อไป: กิจกรรมปฏิบัติการ 3D และการประเมินผล
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        เมื่อคุณตอบคำถามท้ายบทเรียนครบทั้ง 10 บทของหน่วยนี้แล้ว ระบบจะปลดล็อกให้เข้าสู่ <strong>ห้องปฏิบัติการ 3D WebGL (Room {(unitBundle?.unit.number ?? 1) + 100})</strong> เพื่อฝึกติดตั้งและเชื่อมต่อระบบจริง หรือรอครูผู้สอนอนุมัติสิทธิ์ (Teacher Approval)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                            <span className="text-emerald-400 font-bold block mb-1">✓ ขั้นตอนที่ 1</span>
                            <span className="text-slate-300">เรียน 10 บทเรียน + ตอบคำถาม</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-sky-500/50">
                            <span className="text-sky-400 font-bold block mb-1">🎮 ขั้นตอนที่ 2 (ถัดไป)</span>
                            <span className="text-slate-200">ปฏิบัติการห้อง 3D Lab</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-500">
                            <span className="font-bold block mb-1">📝 ขั้นตอนที่ 3</span>
                            <span>แบบทดสอบ ปรนัย + อัตนัย</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`/labs/3d/room-${(unitBundle?.unit.number ?? 1) + 100}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/30"
                        >
                            <span>เข้าสู่ห้องปฏิบัติการ 3D (Room {(unitBundle?.unit.number ?? 1) + 100})</span>
                            <span>→</span>
                        </a>
                        <a
                            href="/courses/21909-2020"
                            className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                        >
                            ← กลับเส้นทางการเรียนรู้
                        </a>
                    </div>
                </section>
            )}

            <nav className="lesson-navigation" aria-label="การนำทางบทเรียน">
                {previousLesson ? (
                    <a className="portal-button portal-button-secondary" href={`/courses/21909-2020/lessons/${previousLesson.id}`}>
                        ← {previousLesson.id}: บทก่อนหน้า
                    </a>
                ) : (
                    <span />
                )}
                {nextLesson ? (
                    <a className="portal-button portal-button-primary" href={`/courses/21909-2020/lessons/${nextLesson.id}`}>
                        บทถัดไป: {nextLesson.id} →
                    </a>
                ) : (
                    <a
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
                        href={`/labs/3d/room-${(unitBundle?.unit.number ?? 1) + 100}`}
                    >
                        เข้าสู่ห้องปฏิบัติการ LAB {(unitBundle?.unit.number ?? 1) + 100} →
                    </a>
                )}
            </nav>
        </main>
    </>
    );
}
