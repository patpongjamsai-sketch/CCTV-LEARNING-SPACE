'use client';

import React from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { LearningMode } from '../types';
import {
  Camera,
  RotateCcw,
  ListOrdered,
  Eye,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';

export const BulletLabHeader: React.FC = () => {
  const learningMode = useBulletLabStore((s) => s.learningMode);
  const setLearningMode = useBulletLabStore((s) => s.setLearningMode);
  const ghostCameraVisible = useBulletLabStore((s) => s.ghostCameraVisible);
  const toggleGhostCamera = useBulletLabStore((s) => s.toggleGhostCamera);
  const showActionLog = useBulletLabStore((s) => s.showActionLog);
  const setShowActionLog = useBulletLabStore((s) => s.setShowActionLog);
  const resetLab = useBulletLabStore((s) => s.resetLab);

  return (
    <header className="h-16 px-4 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
      {/* Left: Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/labs"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="กลับสู่หน้ารวมห้องปฏิบัติการ"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Bullet Camera 3D Interactive Lab</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                V1
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              สถานการณ์จำลองติดตั้งกล้องกระบอกเสมือนจริง (R3F Interactive)
            </p>
          </div>
        </div>
      </div>

      {/* Center: Learning Mode Switcher */}
      <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
        {[
          { id: 'learn', name: 'Learn Mode', icon: GraduationCap },
          { id: 'practice', name: 'Practice Mode', icon: Sparkles },
          { id: 'assessment', name: 'Assessment Mode', icon: ClipboardCheck },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = learningMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setLearningMode(m.id as LearningMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2">
        {/* Ghost Camera Toggle */}
        <button
          onClick={toggleGhostCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            ghostCameraVisible
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="เปรียบเทียบกับตำแหน่งติดตั้งอุดมคติของครูผู้สอน"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ghost Camera</span>
        </button>

        {/* Action Log Toggle */}
        <button
          onClick={() => setShowActionLog(!showActionLog)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            showActionLog
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="เปิด/ปิดหน้าต่างประวัติการกระทำ"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Action Log</span>
        </button>

        {/* Reset Lab Button */}
        <button
          onClick={resetLab}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
          title="รีเซ็ตสถานะห้องแล็บทั้งหมด"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
