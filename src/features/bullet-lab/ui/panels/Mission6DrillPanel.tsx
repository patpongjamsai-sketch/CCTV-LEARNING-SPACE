'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { Wrench, ArrowDownCircle } from 'lucide-react';

export const Mission6DrillPanel: React.FC = () => {
  const drillDepthMm = useBulletLabStore((s) => s.drillDepthMm);
  const setDrillDepthMm = useBulletLabStore((s) => s.setDrillDepthMm);
  const drillAngleDeg = useBulletLabStore((s) => s.drillAngleDeg);
  const setDrillAngleDeg = useBulletLabStore((s) => s.setDrillAngleDeg);
  const isDrilling = useBulletLabStore((s) => s.isDrilling);
  const setIsDrilling = useBulletLabStore((s) => s.setIsDrilling);
  const anchorInserted = useBulletLabStore((s) => s.anchorInserted);
  const setAnchorInserted = useBulletLabStore((s) => s.setAnchorInserted);

  const simulateStepDrill = () => {
    setIsDrilling(true);
    const next = Math.min(40, drillDepthMm + 10);
    setDrillDepthMm(next);
    setTimeout(() => {
      setIsDrilling(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> จำลองการเจาะผนังคอนกรีตลึก 35 mm ที่มุมตั้งฉาก 90° จากนั้นสวมพุกพลาสติกเข้าไปในรูเจาะทั้ง 4 รู
      </div>

      {/* Drilling Simulation Controls */}
      <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            ความลึกการเจาะ (Drill Depth)
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {drillDepthMm} / 35 mm {drillDepthMm >= 35 && '✓ (พอดี)'}
          </span>
        </div>

        {/* Depth Progress Bar & Slider */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                drillDepthMm >= 35 ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (drillDepthMm / 40) * 100)}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={45}
            step={1}
            value={drillDepthMm}
            onChange={(e) => setDrillDepthMm(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Drill Angle Slider */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              องศาแนวดอกสว่าน (Drill Angle)
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {drillAngleDeg}° {drillAngleDeg === 90 ? '(ตั้งฉากสมบูรณ์)' : ''}
            </span>
          </div>
          <input
            type="range"
            min={80}
            max={100}
            step={1}
            value={drillAngleDeg}
            onChange={(e) => setDrillAngleDeg(Number(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Drill Trigger Action */}
        <button
          onClick={simulateStepDrill}
          disabled={isDrilling}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isDrilling
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>
            {isDrilling
              ? '⚡ กำลังเจาะกระแทก...'
              : drillDepthMm < 35
              ? `กดเดินเครื่องเจาะ (+10 mm)`
              : 'กดเจาะซ้ำ / ตกแต่งรูเจาะ'}
          </span>
        </button>
      </div>

      {/* Anchor Insertion Action */}
      <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            การสวมพุกยึด (Anchor Installation)
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              anchorInserted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {anchorInserted ? 'สวมพุกครบ 4 รู' : 'ยังไม่ใส่พุก'}
          </span>
        </div>

        <button
          onClick={() => setAnchorInserted(!anchorInserted)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            anchorInserted
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-950 hover:bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>{anchorInserted ? 'ถอดพุกออก' : 'กดสวมพุกยึดเข้ากับรูเจาะ'}</span>
        </button>
      </div>
    </div>
  );
};
