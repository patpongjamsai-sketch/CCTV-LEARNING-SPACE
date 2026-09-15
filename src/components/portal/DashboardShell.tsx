const navigationItems = [
  { label: 'ภาพรวมการเรียนรู้', href: '/' },
  { label: 'เส้นทางการเรียนรู้', href: '/courses/21909-2020' },
  { label: 'ห้องปฏิบัติการ 3D', href: '/labs/3d/room-101' },
  { label: 'ภารกิจฝึกทักษะ', href: '/missions' },
  { label: 'แบบทดสอบ', href: '/assessments' },
  { label: 'ผลการเรียนของฉัน', href: '/progress' },
];

const learningUnits = [
  ['01', 'พื้นฐานและองค์ประกอบระบบ CCTV', 'พร้อมเรียน', '/labs/3d/room-101'],
  ['02', 'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง', 'กำลังพัฒนา', '/courses/21909-2020'],
  ['03', 'ระบบสาย การเชื่อมต่อ และการติดตั้ง', 'รอเปิด', '/courses/21909-2020'],
];

export function DashboardShell() {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar" aria-label="เมนูหลัก">
        <a className="portal-brand" href="/">
          <span className="portal-brand-mark">CCTV</span>
          <span>LEARNING ECOSYSTEM</span>
        </a>

        <p className="portal-workspace-label">Academy Workspace</p>
        <p className="portal-workspace-copy">พื้นที่เรียนรู้สำหรับช่างเทคนิคกล้องวงจรปิด</p>

        <nav className="portal-navigation">
          {navigationItems.map((item, index) => (
            <a
              className={index === 0 ? 'portal-nav-link portal-nav-link-active' : 'portal-nav-link'}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {item.label}
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
          <div className="portal-profile" aria-label="ข้อมูลผู้เรียนตัวอย่าง">
            <span>0 XP</span>
            <span className="portal-avatar" aria-hidden="true">ผ</span>
            <span>ผู้เรียน</span>
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
            <article><span>บทเรียนที่เรียนแล้ว</span><strong>0 / 8</strong></article>
            <article><span>ภารกิจที่พิชิต</span><strong>0 / 5</strong></article>
            <article><span>คะแนนสูงสุด</span><strong>0 / 100</strong></article>
            <article><span>ประสบการณ์สะสม</span><strong>0 XP</strong></article>
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
              {learningUnits.map(([number, title, status, href]) => (
                <a className="portal-module-card" href={href} key={number}>
                  <span className="portal-module-number">MODULE {number}</span>
                  <h3>{title}</h3>
                  <span>{status}</span>
                </a>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
