import { redirect } from 'next/navigation';

type LaunchPageProps = {
  searchParams: Promise<{
    target?: string;
    student_code?: string;
    student_name?: string;
    return_url?: string;
    class_id?: string;
  }>;
};

export default async function LaunchPage({ searchParams }: LaunchPageProps) {
  const params = await searchParams;
  const target = params.target || '/labs';
  const studentCode = params.student_code;
  const studentName = params.student_name;
  const returnUrl = params.return_url;

  // If launched with explicit target or student_code, redirect with query parameters
  if (studentCode || params.target) {
    const redirectUrl = new URL(target, 'http://localhost:3000');
    if (studentCode) redirectUrl.searchParams.set('student_code', studentCode);
    if (studentName) redirectUrl.searchParams.set('student_name', studentName);
    if (returnUrl) redirectUrl.searchParams.set('return_url', returnUrl);

    redirect(`${redirectUrl.pathname}${redirectUrl.search}`);
  }

  // If no params, render the External Integration Launchpad tester UI
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
            EXTERNAL LAUNCH & DEEP-LINKING
          </span>
          <h1 className="text-2xl font-black text-white">
            ตัวช่วยเชื่อมโยงเว็บหลัก (CCTV Launchpad)
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            กำหนดค่า Parameter เพื่อจำลองการส่งตัวนักเรียนจากเว็บหลักมายังห้องปฏิบัติการ และเชื่อมโยงคะแนนกลับ
          </p>
        </div>

        <form action="/launch" method="GET" className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              ห้องปฏิบัติการเป้าหมาย (Target Lab):
            </label>
            <select
              name="target"
              defaultValue="/labs/3d/room-102"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-sky-500"
            >
              <option value="/labs/3d/room-101">Room 101 · Smart Mart 3D (CCTV Components)</option>
              <option value="/labs/3d/room-102">Room 102 · Camera Selection & FOV Placement</option>
              <option value="/labs/3d/room-103">Room 103 · Cabling, RJ45 T568B & BNC Tester</option>
              <option value="/labs/3d/room-104">Room 104 · IP Networking & PoE Budget</option>
              <option value="/labs/3d/room-105">Room 105 · DVR/NVR Setup & H.265 Compression</option>
              <option value="/labs/3d/room-106">Room 106 · Storage Calculation & Cloud P2P</option>
              <option value="/labs/3d/room-107">Room 107 · Troubleshooting Diagnostic Lab</option>
              <option value="/labs/3d/room-108">Room 108 · Capstone Integrated CCTV Project</option>
              <option value="/labs">หน้ารวมทุกห้องปฏิบัติการ (/labs)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                รหัสนักศึกษา (student_code):
              </label>
              <input
                type="text"
                name="student_code"
                defaultValue="STD670101"
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                ชื่อ-นามสกุล (student_name):
              </label>
              <input
                type="text"
                name="student_name"
                defaultValue="สมชาย ใจดี"
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              URL ส่งคะแนนกลับ (return_url สำหรับเว็บหลัก):
            </label>
            <input
              type="text"
              name="return_url"
              defaultValue="https://example.com/cctv/callback"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono text-slate-300"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/25"
            >
              🚀 เปิดห้องปฏิบัติการ (Launch Lab)
            </button>
          </div>
        </form>

        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-400">
          <strong className="text-slate-300 block font-semibold">ตัวอย่าง Link ที่เว็บหลักต้องใช้:</strong>
          <code className="block p-2 bg-slate-900 rounded-lg text-emerald-400 font-mono break-all text-[11px]">
            https://&lt;domain&gt;/launch?target=/labs/3d/room-102&amp;student_code=STD670101&amp;student_name=สมชาย&amp;return_url=https://mainwebsite.ac.th/callback
          </code>
        </div>
      </div>
    </main>
  );
}
