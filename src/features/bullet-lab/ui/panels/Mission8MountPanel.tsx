'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { Camera, Lock, Unlock } from 'lucide-react';

export const Mission8MountPanel: React.FC = () => {
  const cameraMounted = useBulletLabStore((s) => s.cameraMounted);
  const setCameraMounted = useBulletLabStore((s) => s.setCameraMounted);
  const jointLocked = useBulletLabStore((s) => s.jointLocked);
  const setJointLocked = useBulletLabStore((s) => s.setJointLocked);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const rotation = useBulletLabStore((s) => s.rotation);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> สวมประกอบตัวกล้อง Bullet เข้ากับแป้นฐานยึด ตรวจสอบมุมมองเลนส์ และหมุนล็อกข้อต่อ 3 แกนให้แน่นหนาป้องกันกล้องก้มตก
      </div>

      {/* Mount Camera Action */}
      <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            การสวมตัวกล้องเข้ากับฐาน
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              cameraMounted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {cameraMounted ? 'ประกอบสมบูรณ์' : 'พร้อมประกอบ'}
          </span>
        </div>

        <button
          onClick={() => setCameraMounted(!cameraMounted)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            cameraMounted
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>
            {cameraMounted
              ? 'ถอดตัวกล้องออกจากฐาน'
              : 'สวมตัวกล้อง Bullet เข้ากับฐานยึด'}
          </span>
        </button>
      </div>

      {/* Joint Locking Mechanism */}
      <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            ระบบล็อกข้อต่อ 3 แกน (3-Axis Joint Lock)
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              jointLocked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {jointLocked ? '🔒 ล็อกแน่นหนา' : '🔓 ยังไม่ล็อก'}
          </span>
        </div>

        <button
          onClick={() => setJointLocked(!jointLocked)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            jointLocked
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-950 hover:bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          {jointLocked ? (
            <>
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>คลายตัวล็อกข้อต่อ (Unlock)</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>ขันเกลียวล็อกข้อต่อ 3 แกน (Lock Joint)</span>
            </>
          )}
        </button>
      </div>

      {/* Current Angle Summary */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
        <div className="text-slate-500 font-medium">มุมกล้องที่ล็อกไว้ปัจจุบัน:</div>
        <div className="font-mono text-cyan-300 font-semibold flex gap-3">
          <span>Pan: {pan}°</span>
          <span>Tilt: {tilt}°</span>
          <span>Roll: {rotation}°</span>
        </div>
      </div>
    </div>
  );
};
