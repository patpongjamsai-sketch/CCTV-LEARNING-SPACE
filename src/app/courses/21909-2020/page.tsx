import { allUnitsContent } from '../../../content/courses/21909-2020';
import { CourseUnitAccordion } from '../../../components/portal/CourseUnitAccordion';
import { PortalGlobalNav } from '../../../components/portal/PortalGlobalNav';

export default function CoursePage() {
  const totalUnits = allUnitsContent.length;
  const totalLessons = allUnitsContent.reduce((acc, u) => acc + u.lessons.length, 0);
  const totalTheoryHours = 18;
  const totalPracticalHours = 54;
  const totalHours = 72;
  const completedUnits = 1;
  const completionPercentage = Math.round((completedUnits / totalUnits) * 100);

  return (
    <>
      <PortalGlobalNav />
      <main className="portal-document-page">
        <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
      <p className="portal-kicker">COURSE 21909-2020</p>
      <h1>เส้นทางการเรียนรู้ (8 หน่วยการเรียนรู้ {totalLessons} บทเรียน)</h1>
      <p>
        รายวิชา {totalHours} ชั่วโมง แบ่งเป็นทฤษฎี {totalTheoryHours} ชั่วโมงและปฏิบัติ {totalPracticalHours} ชั่วโมง ตามมาตรฐาน ปวช. 2567
      </p>

      {/* Course Completion Meter */}
      <section className="course-completion-card" aria-label="ภาพรวมความก้าวหน้าตลอดหลักสูตร">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold block mb-1">
              COURSE PROGRESSION
            </span>
            <h2 className="text-lg font-bold text-white m-0">ความก้าวหน้ารายวิชา</h2>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-mono font-bold">
              สำเร็จแล้ว {completionPercentage}% · {completedUnits}/{totalUnits} หน่วย
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="course-progress-track" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="course-progress-fill" style={{ width: `${completionPercentage}%` }} />
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">หน่วยการเรียนรู้</span>
            <strong className="text-white text-base block mt-0.5">{totalUnits} หน่วย</strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">บทเรียนทั้งหมด</span>
            <strong className="text-white text-base block mt-0.5">{totalLessons} บทเรียน</strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">เวลาเรียนตามเกณฑ์</span>
            <strong className="text-white text-base block mt-0.5">{totalHours} ชม. (18/54)</strong>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">ห้องปฏิบัติการ 3D</span>
            <strong className="text-emerald-400 text-base block mt-0.5">{totalUnits} Virtual Labs</strong>
          </div>
        </div>
      </section>

      {/* Sticky Quick Jump Tab Bar */}
      <nav className="course-sticky-nav" aria-label="แถบกระโดดข้ามหน่วยการเรียนรู้">
        <span className="text-xs font-mono text-slate-400 font-bold shrink-0 hidden md:inline">
          QUICK JUMP:
        </span>
        {allUnitsContent.map((bundle) => (
          <a
            key={bundle.unit.id}
            href={`#unit-${bundle.unit.id}`}
            className="course-sticky-tab-btn"
          >
            <span className="tab-num">U{String(bundle.unit.number).padStart(2, '0')}</span>
            <span className="truncate max-w-[130px]">{bundle.unit.titleTh.split(' ')[0]}</span>
          </a>
        ))}
      </nav>

      {/* Unit Dropdowns / Accordion Section */}
      <section className="space-y-6" aria-label="รายการหน่วยการเรียนรู้แบบ Dropdown">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold block">
              CURRICULUM UNITS
            </span>
            <h2 className="text-xl font-bold text-white m-0">
              หน่วยการเรียนรู้ (คลิกเพื่อขยายดูเนื้อหา 4 หัวข้อ)
            </h2>
          </div>
        </div>

        {/* The Accordion Component */}
        <CourseUnitAccordion bundles={allUnitsContent} />
      </section>
      </main>
    </>
  );
}


