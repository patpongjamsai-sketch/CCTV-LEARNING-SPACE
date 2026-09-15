const units = [
  'พื้นฐานและองค์ประกอบระบบ CCTV',
  'กล้อง การเลือกใช้ และตำแหน่งติดตั้ง',
  'ระบบสาย การเชื่อมต่อ และการติดตั้ง',
  'เครือข่ายสำหรับกล้อง IP',
  'การตั้งค่า DVR และ NVR',
  'การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล',
  'การตรวจสอบ แก้ไขปัญหา และบำรุงรักษา',
  'โครงงานบูรณาการระบบ CCTV',
];

export default function CoursePage() {
  return (
    <main className="portal-document-page">
      <a className="portal-back-link" href="/">← กลับหน้าภาพรวม</a>
      <p className="portal-kicker">COURSE 21909-2020</p>
      <h1>เส้นทางการเรียนรู้</h1>
      <p>รายวิชา 72 ชั่วโมง แบ่งเป็นทฤษฎี 18 ชั่วโมงและปฏิบัติ 54 ชั่วโมง</p>
      <ol className="portal-unit-list">
        {units.map((unit, index) => (
          <li key={unit}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{unit}</strong>
            <small>{index === 0 ? 'พร้อมเรียน' : 'เตรียมเนื้อหา'}</small>
          </li>
        ))}
      </ol>
    </main>
  );
}
