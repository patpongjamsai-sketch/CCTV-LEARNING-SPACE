import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';
import { NetworkSimulator } from '../../../components/labs/room104/NetworkSimulator';

export const metadata: Metadata = {
  title: 'CCTV Network Simulator | U04 2D Pre-Lab Workstation',
  description: 'ระบบจำลองการวางระบบเครือข่ายกล้องวงจรปิดเสมือนจริง 2D (Room 104 Companion)',
};

export default function NetworkSimulatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Application Bar with Navigation */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าห้องแล็บ</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-white">U04 ภารกิจฝึกปฏิบัติ:</span>
            <span className="text-xs text-sky-400 font-mono">2D Interactive Pre-Lab Workstation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/labs"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl transition-all"
          >
            ห้องปฏิบัติการ 8 Units
          </Link>
          <Link
            href="/labs/3d/room-104?student_code=DEMO-TRAINEE&student_name=ผู้ทดลองเรียน"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Box className="w-3.5 h-3.5" />
            <span>เข้าสู่ห้อง 3D Room 104</span>
          </Link>
        </div>
      </nav>

      {/* Simulator Component */}
      <div className="flex-1">
        <NetworkSimulator />
      </div>
    </div>
  );
}
