'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { Award, Activity } from 'lucide-react';

export const Mission9PullTestPanel: React.FC = () => {
  const pullTestForceN = useBulletLabStore((s) => s.pullTestForceN);
  const setPullTestForceN = useBulletLabStore((s) => s.setPullTestForceN);
  const setIsPullTesting = useBulletLabStore((s) => s.setIsPullTesting);
  const setShowResultModal = useBulletLabStore((s) => s.setShowResultModal);

  const applyTestForce = (force: number) => {
    setIsPullTesting(true);
    setPullTestForceN(force);
    setTimeout(() => {
      setIsPullTesting(false);
    }, 500);
  };

  // Simulated base deflection calculation in mm
  const displacementMm = (pullTestForceN * 0.015).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> ทดสอบความมั่นคงของฐานยึดด้วยแรงดึงทางกล (Pull Test 10N–40N) สังเกตการโยกคลอนหรือการขยับตัวของฐานในฉาก 3D
      </div>

      {/* Force Selection Buttons */}
      <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <label className="text-xs font-semibold text-slate-300">
          เลือกระดับแรงดึงทดสอบ (Pull Test Force)
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {[10, 20, 30, 40].map((f) => (
            <button
              key={f}
              onClick={() => applyTestForce(f)}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border text-center transition-all cursor-pointer ${
                pullTestForceN === f
                  ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {f} N
            </button>
          ))}
        </div>

        {/* Force Slider */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">ปรับแรงดึงแบบละเอียด:</span>
            <span className="font-mono text-red-400 font-bold">
              {pullTestForceN} N
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={pullTestForceN}
            onChange={(e) => setPullTestForceN(Number(e.target.value))}
            className="w-full accent-red-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Real-time Deflection Telemetry Card */}
      <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            การขยับตัวของฐาน (Base Deflection)
          </span>
          <span className="font-mono text-emerald-400 font-bold text-xs">
            {displacementMm} mm
          </span>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed">
          {pullTestForceN === 0 ? (
            'ยังไม่ได้ให้แรงดึง กดเลือกปุ่ม 10N–40N ด้านบนเพื่อเริ่มทดสอบ'
          ) : Number(displacementMm) <= 1.0 ? (
            <span className="text-emerald-300 font-medium">
              ✓ ฐานยึดแน่นหนาสมบูรณ์ (การขยับ &lt; 1.0 mm อยู่ในเกณฑ์มาตรฐาน)
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              ⚠️ ฐานมีการขยับตัวเล็กน้อย ตรวจสอบแรงขันสกรูและการฝังพุก
            </span>
          )}
        </div>
      </div>

      {/* View Final Installation Summary Screen */}
      <button
        onClick={() => setShowResultModal(true)}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/20 cursor-pointer"
      >
        <Award className="w-4 h-4" />
        <span>ดูสรุปผลการฝึกติดตั้ง (Summary Report)</span>
      </button>
    </div>
  );
};
