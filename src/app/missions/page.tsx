export default function MissionsPage() {
  const missions = [
    { code: 'M1', title: 'ระบุบทบาทและฟังก์ชันของกล้องวงจรปิด', room: 'Room 101 · Smart Mart', status: 'พร้อมเรียน' },
    { code: 'M2', title: 'จำแนกระบบและเลือกประเภทกล้องให้ตรงพื้นที่', room: 'Room 101 · Smart Mart', status: 'พร้อมเรียน' },
    { code: 'M3', title: 'จับคู่ฟังก์ชันอุปกรณ์หลัก 5 ชนิด', room: 'Room 101 · Smart Mart', status: 'พร้อมเรียน' },
    { code: 'M4', title: 'เปรียบเทียบความแตกต่าง Analog vs IP', room: 'Room 101 · Smart Mart', status: 'พร้อมเรียน' },
    { code: 'M5', title: 'ต่อสายสัญญาณและจ่ายไฟระบบกล้อง IP (PoE Lab)', room: 'Room 101 · Smart Mart', status: 'พร้อมเรียน' },
  ];

  return (
    <main className="portal-document-page">
      <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
      <p className="portal-kicker">SKILL MISSIONS</p>
      <h1>ภารกิจฝึกทักษะ</h1>
      <p>ภารกิจปฏิบัติการเพื่อประเมินสมรรถนะช่างเทคนิคระบบกล้องวงจรปิด</p>
      <ol className="portal-unit-list">
        {missions.map((m) => (
          <li key={m.code}>
            <span>{m.code}</span>
            <div>
              <strong>{m.title}</strong>
              <small className="block text-slate-400 text-xs">{m.room}</small>
            </div>
            <a
              href="/labs/3d/room-101"
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold"
            >
              ทำภารกิจ
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
