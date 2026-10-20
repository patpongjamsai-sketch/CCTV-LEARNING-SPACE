'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConduitBendingLabPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    studentName: string;
    classGroup: string;
    timestamp: string;
  } | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONDUIT_PRACTICAL_SUBMISSION') {
        const payload = event.data.payload;
        setSubmissionReceipt({
          studentName: payload.studentName,
          classGroup: payload.classGroup,
          timestamp: new Date().toLocaleTimeString('th-TH'),
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-all border border-slate-700/60"
          >
            <span>←</span>
            <span>กลับศูนย์ปฏิบัติการ (Labs)</span>
          </Link>
          <span className="hidden sm:inline-block w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
              UNIT 03 · ROOM 103 COMPANION
            </span>
            <span className="text-xs md:text-sm font-bold text-white hidden md:inline-block">
              คู่มือ 3D Interactive การดัดท่อ uPVC: ดัดสามเข่า 90° & ดัด 45° หลบคาน
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {submissionReceipt && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
              <span>✅ ส่งงานแล้ว:</span>
              <strong className="text-white">{submissionReceipt.studentName}</strong>
              <span className="text-[10px] text-emerald-400/80">({submissionReceipt.timestamp} น.)</span>
            </span>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all border border-slate-700"
            title="สลับโหมดเต็มหน้าจอ"
          >
            <span>{isFullscreen ? '🗗 ออกจากเต็มจอ' : '⛶ เต็มจอ'}</span>
          </button>
        </div>
      </header>

      {/* 3D WebGL Canvas Frame */}
      <main className="flex-1 w-full h-full relative">
        <iframe
          src="/labs/conduit-bending.html"
          className="w-full h-full border-0 absolute inset-0"
          title="3D uPVC Conduit Bending Lab"
          allow="accelerometer; autoplay; camera; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        />
      </main>
    </div>
  );
}
