'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false ensures WebGL canvas initializes cleanly without SSR hydration issues
const DomeLabContainer = dynamic(
  () =>
    import('../../../../features/dome-lab/ui/DomeLabContainer').then(
      (mod) => mod.DomeLabContainer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <span className="text-xl">🏢</span>
        </div>
        <p className="mt-4 text-sm font-semibold text-cyan-300">
          กำลังเตรียมห้องปฏิบัติการที่ 1: ห้องสำนักงานในอาคาร (Office Lab)...
        </p>
        <p className="mt-1 text-xs text-slate-500">
          จุด A (ฝ้าเพดาน) · จุด B (ผนัง) · กิมบอล 3 แกน · WebGL Loading
        </p>
      </div>
    ),
  }
);

export default function DomeRoom1Page() {
  return <DomeLabContainer initialRoomId="room1_indoor" />;
}
