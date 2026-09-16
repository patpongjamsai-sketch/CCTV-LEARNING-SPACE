export default function AssessmentsPage() {
  const assessments = [
    { title: 'แบบทดสอบก่อนเรียน (Diagnostic Pre-test): หน่วยที่ 1', duration: '15 นาที', status: 'เปิดใช้งาน' },
    { title: 'ภารกิจประเมินผลรวบยอด (Summative Lab): Smart Mart Room 101', duration: '45 นาที', status: 'พร้อมสอบ' },
    { title: 'แบบทดสอบหลังเรียน (Post-test): หน่วยที่ 1', duration: '20 นาที', status: 'รอทำ Lab ผ่าน' },
  ];

  return (
    <main className="portal-document-page">
      <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
      <p className="portal-kicker">ASSESSMENTS</p>
      <h1>แบบทดสอบและการวัดผล</h1>
      <p>เครื่องมือวัดและประเมินผลการเรียนรู้รายวิชาระบบกล้องวงจรปิดบนเครือข่าย</p>
      <ol className="portal-unit-list">
        {assessments.map((a, i) => (
          <li key={a.title}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <strong>{a.title}</strong>
              <small className="block text-slate-400 text-xs">เวลาทดสอบ: {a.duration}</small>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700">
              {a.status}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
