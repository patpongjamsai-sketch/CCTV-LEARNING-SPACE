import { notFound } from 'next/navigation';

type LabPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function LabPage({ params }: LabPageProps) {
  const { roomId } = await params;

  if (roomId !== 'room-101') {
    notFound();
  }

  return (
    <main className="portal-lab-page">
      <div className="portal-lab-toolbar">
        <a href="/">← กลับ Dashboard</a>
        <div>
          <span>UNIT 01</span>
          <strong>Room 101 · Smart Mart</strong>
        </div>
        <span className="portal-status-ready">พร้อมเชื่อมเกม</span>
      </div>
      <section className="portal-lab-stage">
        <p className="portal-kicker">NEXT.JS INTEGRATION BOUNDARY</p>
        <h1>ห้องปฏิบัติการ 3D</h1>
        <p>
          Next.js Route พร้อมแล้ว เกมเดิมยังคงแยกเป็น Baseline จนกว่าจะเพิ่ม
          Supabase Session และ Server-authoritative Scoring ในขั้นถัดไป
        </p>
        <dl>
          <div><dt>Room</dt><dd>room-101</dd></div>
          <div><dt>Course</dt><dd>21909-2020</dd></div>
          <div><dt>Integration</dt><dd>Shell Ready</dd></div>
        </dl>
      </section>
    </main>
  );
}
