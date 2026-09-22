const navigationItems = [
    { num: '01', label: 'ภาพรวมการเรียนรู้', href: '/' },
    { num: '02', label: 'เส้นทางการเรียนรู้', href: '/courses/21909-2020' },
    { num: '03', label: 'ภารกิจฝึกทักษะ', href: '/missions' },
    { num: '04', label: 'แบบทดสอบ', href: '/assessments' },
    { num: '05', label: 'ผลการเรียนของฉัน', href: '/progress' },
    { num: '06', label: 'อนุมัติสิทธิ์ (Teacher)', href: '/teacher' },
];

import { TeacherManagementPanel } from './TeacherManagementPanel';

export type DashboardUnit = {
    id: string;
    sequenceNo: number;
    title: string;
    statusLabel: string;
    href: string;
    unlocked: boolean;
};

export type DashboardShellProps = {
    learner?: {
        displayName: string;
        role: 'student' | 'teacher' | 'admin';
    };
    summary?: {
        completedUnits: number;
        totalUnits: number;
        passedMissions: number;
        bestScore: number;
    };
    units?: DashboardUnit[];
    classId?: string;
};

const fallbackUnits: DashboardUnit[] = [
    { id: '01', sequenceNo: 1, title: 'พื้นฐานและองค์ประกอบระบบ CCTV', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '02', sequenceNo: 2, title: 'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '03', sequenceNo: 3, title: 'ระบบสาย การเชื่อมต่อ และการติดตั้ง', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '04', sequenceNo: 4, title: 'เครือข่ายสำหรับกล้อง IP', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '05', sequenceNo: 5, title: 'การตั้งค่า DVR และ NVR', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '06', sequenceNo: 6, title: 'การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '07', sequenceNo: 7, title: 'การตรวจสอบ แก้ไขปัญหา และบำรุงรักษา', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
    { id: '08', sequenceNo: 8, title: 'โครงงานบูรณาการระบบ CCTV', statusLabel: 'พร้อมเรียน', href: '/courses/21909-2020', unlocked: true },
];

export function DashboardShell({
    learner = { displayName: 'ผู้เรียน', role: 'student' },
    summary = { completedUnits: 0, totalUnits: 8, passedMissions: 0, bestScore: 0 },
    units = fallbackUnits,
    classId,
}: DashboardShellProps = {}) {
    const experiencePoints = summary.completedUnits * 100 + summary.passedMissions * 25;
    const isTeacherOrAdmin = learner.role === 'teacher' || learner.role === 'admin';
    const visibleNavItems = isTeacherOrAdmin
        ? navigationItems
        : navigationItems.filter((item) => item.href !== '/teacher');

    return (
        <div className="portal-shell">
            <aside className="portal-sidebar" aria-label="เมนูหลัก">
                <a className="portal-brand" href="/">
                    <span className="portal-brand-mark">CCTV</span>
                    <span>LEARNING ECOSYSTEM</span>
                </a>

                <p className="portal-workspace-label">Academy Workspace</p>
                <p className="portal-workspace-copy">พื้นที่เรียนรู้สำหรับช่างเทคนิคกล้องวงจรปิด</p>

                <nav className="portal-navigation" aria-label="เมนูหลัก 01 ถึง 05">
                    {visibleNavItems.map((item, index) => (
                        <a
                            className={index === 0 ? 'portal-nav-link portal-nav-link-active' : 'portal-nav-link'}
                            href={item.href}
                            key={item.href}
                        >
                            <span className="portal-nav-num" aria-hidden="true">{item.num}</span>
                            <span className="portal-nav-label">{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="portal-sidebar-note">
                    <strong>ทฤษฎีที่จับต้องได้</strong>
                    <span>เรียนรู้ ทดลอง ติดตั้ง และแก้ไขปัญหาในสถานการณ์จำลอง</span>
                </div>
            </aside>

            <main className="portal-main">
                <header className="portal-topbar">
                    <div>
                        <span>Workspace</span>
                        <strong>ภาพรวมการเรียนรู้</strong>
                    </div>
                    <div className="portal-profile flex items-center gap-3" aria-label="ข้อมูลผู้ใช้งาน">
                        <span>{experiencePoints} XP</span>
                        <span className="portal-avatar" aria-hidden="true">{learner.displayName.slice(0, 1)}</span>
                        <span>{learner.displayName}</span>
                        <a
                            href="/auth/logout"
                            className="text-xs text-slate-400 hover:text-rose-400 ml-2 transition-colors"
                            title="ออกจากระบบ"
                        >
                            ออกจากระบบ
                        </a>
                    </div>
                </header>

                <section className="portal-content">
                    <div className="portal-hero">
                        <div>
                            <p className="portal-kicker">CCTV TECHNICIAN LEARNING CENTER</p>
                            <h1>กล้องวงจรปิดบนระบบเครือข่าย</h1>
                            <p>
                                เรียนรู้จากสถานการณ์จริง ฝึกวิเคราะห์ระบบ และลงมือประกอบระบบกล้อง
                                ผ่านห้องปฏิบัติการ 3D
                            </p>
                            <div className="portal-actions">
                                <a className="portal-button portal-button-primary" href="/labs/3d/room-101">
                                    เข้าสู่ห้องปฏิบัติการ 3D
                                </a>
                                <a className="portal-button portal-button-secondary" href="/courses/21909-2020">
                                    สำรวจบทเรียน
                                </a>
                            </div>
                        </div>
                        <div className="portal-camera-visual" aria-label="ภาพแทนระบบกล้องวงจรปิด">
                            <span className="portal-camera-lens" />
                            <strong>LIVE</strong>
                            <small>ROOM 101 · SMART MART</small>
                        </div>
                    </div>

                    <div className="portal-stats" aria-label="สรุปความก้าวหน้า">
                        <article><span>บทเรียนที่เรียนแล้ว</span><strong>{summary.completedUnits} / {summary.totalUnits}</strong></article>
                        <article><span>ภารกิจที่พิชิต</span><strong>{summary.passedMissions} / 5</strong></article>
                        <article><span>คะแนนสูงสุด</span><strong>{summary.bestScore} / 100</strong></article>
                        <article><span>ประสบการณ์สะสม</span><strong>{experiencePoints} XP</strong></article>
                    </div>

                    <section className="portal-learning-path" aria-labelledby="learning-path-title">
                        <div className="portal-section-heading">
                            <div>
                                <p className="portal-kicker">LEARNING PATH</p>
                                <h2 id="learning-path-title">เส้นทางการเรียนรู้</h2>
                            </div>
                            <a href="/courses/21909-2020">ดูบทเรียนทั้งหมด</a>
                        </div>

                        <div className="portal-module-grid">
                            {units.map((unit) => {
                                const unitUnlocked = unit.unlocked ?? (unit.sequenceNo === 1 || isTeacherOrAdmin);
                                const content = (
                                    <>
                                        <span className="portal-module-number">MODULE {String(unit.sequenceNo).padStart(2, '0')}</span>
                                        <h3>{unit.title}</h3>
                                        <span>{unit.statusLabel}</span>
                                    </>
                                );

                                return unitUnlocked ? (
                                    <a className="portal-module-card" data-unit-id={unit.id} href={unit.href} key={unit.id}>{content}</a>
                                ) : (
                                    <div className="portal-module-card" data-unit-id={unit.id} aria-disabled="true" key={unit.id}>{content}</div>
                                );
                            })}
                        </div>
                    </section>

                    {isTeacherOrAdmin && (
                        <TeacherManagementPanel classId={classId} />
                    )}
                </section>
            </main>
        </div>
    );
}
