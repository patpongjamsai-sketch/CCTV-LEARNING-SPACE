'use client';

import React from 'react';
import Link from 'next/link';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';
import {
  RotateCcw,
  History,
  Building2,
  Warehouse,
  ChevronLeft,
  Video,
} from 'lucide-react';

export const DomeLabHeader: React.FC = () => {
  const learningMode = useDomeLabStore((s) => s.learningMode);
  const setLearningMode = useDomeLabStore((s) => s.setLearningMode);
  const activeRoom = useDomeLabStore((s) => s.activeRoom);
  const setActiveRoom = useDomeLabStore((s) => s.setActiveRoom);
  const setShowActionLog = useDomeLabStore((s) => s.setShowActionLog);
  const resetLab = useDomeLabStore((s) => s.resetLab);
  const hasPickedUpCamera = useDomeLabStore((s) => s.hasPickedUpCamera);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const mountedPointId = useDomeLabStore((s) => s.mountedPointId);

  return (
    <header className="relative z-30 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-white select-none shadow-xl">
      {/* Left: Brand, Back button & Room Switcher */}
      <div className="flex items-center gap-3">
        <Link
          href="/labs"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="กลับหน้ารวมห้องปฏิบัติการ"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">คอร์สรวม</span>
        </Link>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-100">
                Dome Camera 3D Interactive Lab
              </h1>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-mono">
                V1 · 2 ห้องฝึกปฏิบัติ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              สถาปัตยกรรมกิมบอล 3 แกน · การระวังแสงสะท้อน IR · ใบงาน 4 พื้นผิว
            </p>
          </div>
        </div>

        {/* 2 ROOMS SECTION URL SWITCHER */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 ml-3">
          <Link
            href="/labs/dome-camera/room-1"
            onClick={() => setActiveRoom('room1_indoor')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRoom === 'room1_indoor'
                ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ห้องที่ 1: สำนักงาน (A–B)</span>
          </Link>
          <Link
            href="/labs/dome-camera/room-2"
            onClick={() => setActiveRoom('room2_outdoor')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRoom === 'room2_outdoor'
                ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>ห้องที่ 2: โรงฝึกงาน (C–D)</span>
          </Link>
        </div>
      </div>

      {/* Center: Camera Inventory / Installation Status Badge */}
      <div className="hidden md:flex items-center">
        {hasPickedUpCamera && !isCameraMounted && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border border-cyan-400/60 px-3.5 py-1 rounded-xl shadow-lg animate-pulse">
            <span className="text-sm">📹</span>
            <span className="text-xs font-bold text-cyan-300">ช่างกำลังถือกล้องโดม</span>
            <span className="text-[11px] text-slate-300 font-normal">
              (เดินไปที่จุด A–D แล้วกด <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">E</kbd> เพื่อติดตั้ง)
            </span>
          </div>
        )}
        {isCameraMounted && mountedPointId && (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-3.5 py-1 rounded-xl shadow-lg">
            <span className="text-sm">🎯</span>
            <span className="text-xs font-bold text-emerald-300">ติดตั้งสำเร็จที่จุด {mountedPointId}</span>
            <span className="text-[11px] text-slate-300 font-normal">
              ({DOME_MOUNT_POINTS_DATA[mountedPointId].lensMm}mm · FOV {DOME_MOUNT_POINTS_DATA[mountedPointId].fovDegrees}°)
            </span>
          </div>
        )}
      </div>

      {/* Right: Mode Selector, Action Logs & Reset */}
      <div className="flex items-center gap-2">
        {/* Learning Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setLearningMode('learn')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              learningMode === 'learn'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ฝึกเรียนรู้
          </button>
          <button
            onClick={() => setLearningMode('practice')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              learningMode === 'practice'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ฝึกปฏิบัติ
          </button>
          <button
            onClick={() => setLearningMode('assessment')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              learningMode === 'assessment'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ประเมินผล
          </button>
        </div>

        {/* Action Log Drawer Trigger */}
        <button
          onClick={() => setShowActionLog(true)}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800/80 cursor-pointer"
          title="บันทึกประวัติปฏิบัติการ (Action Log)"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Reset Lab Button */}
        <button
          onClick={() => {
            if (window.confirm('คุณต้องการรีเซ็ตห้องปฏิบัติการและเริ่มต้นใหม่ทั้งหมดหรือไม่?')) {
              resetLab();
            }
          }}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800/80 cursor-pointer"
          title="รีเซ็ตห้องปฏิบัติการ (Reset Lab)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
