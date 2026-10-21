import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';
import { SiteSurveySimulator } from '../../../components/labs/room101/SiteSurveySimulator';

export const metadata: Metadata = {
  title: 'CCTV Site Survey & Installation Workstation | U01 2D Pre-Lab (วท.อุบลราชธานี)',
  description: 'ระบบจำลองการสำรวจพื้นที่ 6 จุดสำรวจยุทธศาสตร์ วิทยาลัยเทคนิคอุบลราชธานี, 6 ขั้นตอนติดตั้งมาตรฐานช่าง, องค์ประกอบ 5 ส่วน และระบบส่งมอบงาน Commissioning',
};

export default function SiteSurveyLabPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Application Bar with Navigation */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าศูนย์ปฏิบัติการ</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-white">U01 ภารกิจฝึกปฏิบัติ:</span>
            <span className="text-xs text-sky-400 font-mono">2D Site Survey & Installation Workstation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/labs"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl transition-all hidden md:inline-block"
          >
            ห้องปฏิบัติการ 8 Units
          </Link>
          <Link
            href="/labs/cctv-components"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>🧩 กิจกรรม 5 องค์ประกอบ</span>
          </Link>
          <Link
            href="/labs/3d/room-101"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Box className="w-3.5 h-3.5" />
            <span>เข้าสู่ห้อง 3D Room 101</span>
          </Link>
        </div>
      </nav>

      {/* Simulator Component */}
      <div className="flex-1">
        <SiteSurveySimulator />
      </div>
    </div>
  );
}
