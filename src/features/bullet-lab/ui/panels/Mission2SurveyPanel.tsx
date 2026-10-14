'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { MOUNT_POINTS } from '../../data/bulletLabData';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { MountPointId } from '../../types';

export const Mission2SurveyPanel: React.FC = () => {
  const selectedMountPoint = useBulletLabStore((s) => s.selectedMountPoint);
  const setSelectedMountPoint = useBulletLabStore((s) => s.setSelectedMountPoint);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> เลือกจุดติดตั้งบนผนัง A, B, C, D, E โดยพิจารณาระดับความสูง (แนะนำ 2.5–3.2m), ความเสี่ยงจากการชน, และสิ่งกีดขวาง
      </div>

      <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
        <span>🎥</span>
        <span>
          <strong>ระบบกล้องอัตโนมัติ:</strong> เมื่อคลิกเลือกจุด A–E มุมกล้อง 3D จะบินไปโฟกัสที่จุดนั้นในระยะใกล้เพื่อสังเกตสภาพแวดล้อมจริง
        </span>
      </div>

      <div className="space-y-2">
        {MOUNT_POINTS.map((pt) => {
          const isSelected = pt.id === selectedMountPoint;
          return (
            <div
              key={pt.id}
              onClick={() => setSelectedMountPoint(pt.id as MountPointId)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {pt.id}
                  </span>
                  <span className="font-semibold text-xs text-slate-200">
                    {pt.label}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    เลือกอยู่
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pl-9">
                {pt.descriptionTh}
              </p>

              {/* Technical Attributes Chips */}
              <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                  สูง: {pt.heightMeters} m
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                    pt.collisionRisk === 'low'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                      : pt.collisionRisk === 'medium'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                      : 'bg-red-950/60 text-red-300 border border-red-800/50'
                  }`}
                >
                  {pt.collisionRisk === 'low' ? (
                    <CheckCircle className="w-2.5 h-2.5" />
                  ) : (
                    <AlertTriangle className="w-2.5 h-2.5" />
                  )}
                  ความเสี่ยงชน: {pt.collisionRisk}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[10px] font-mono">
                  ศักยภาพมุมมอง: {pt.coveragePotential}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
