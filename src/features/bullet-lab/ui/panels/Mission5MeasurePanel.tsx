'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { Check, Trash2, Crosshair } from 'lucide-react';

const HOLE_OFFSETS = [
  { x: 0.045, y: 0.045, label: 'รูเจาะที่ 1 (บนขวา)' },
  { x: -0.045, y: 0.045, label: 'รูเจาะที่ 2 (บนซ้าย)' },
  { x: 0.045, y: -0.045, label: 'รูเจาะที่ 3 (ล่างขวา)' },
  { x: -0.045, y: -0.045, label: 'รูเจาะที่ 4 (ล่างซ้าย)' },
];

export const Mission5MeasurePanel: React.FC = () => {
  const templatePlaced = useBulletLabStore((s) => s.templatePlaced);
  const setTemplatePlaced = useBulletLabStore((s) => s.setTemplatePlaced);
  const tapeMeasureActive = useBulletLabStore((s) => s.tapeMeasureActive);
  const setTapeMeasureActive = useBulletLabStore((s) => s.setTapeMeasureActive);
  const levelChecked = useBulletLabStore((s) => s.levelChecked);
  const setLevelChecked = useBulletLabStore((s) => s.setLevelChecked);
  const markedPoints = useBulletLabStore((s) => s.markedPoints);
  const addMarkedPoint = useBulletLabStore((s) => s.addMarkedPoint);
  const clearMarkedPoints = useBulletLabStore((s) => s.clearMarkedPoints);

  const markNextHole = () => {
    const holeIndex = markedPoints.length;
    if (holeIndex >= 4) return;

    const currentOffset = HOLE_OFFSETS[holeIndex];
    if (!currentOffset) return;

    addMarkedPoint({
      id: `hole-${Date.now()}`,
      x: currentOffset.x,
      y: currentOffset.y,
      label: currentOffset.label,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> วางแผ่นทาบเจาะ (Mounting Template), ตรวจระดับน้ำระนาบ, วัดระดับความสูง และใช้ดินสอมาร์กตำแหน่งจุดเจาะทั้ง 4 รู
      </div>

      {/* Measurement Tools Toggles */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          อุปกรณ์วัดและจัดระนาบ (Interactive 3D Tools)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {/* Template */}
          <button
            onClick={() => setTemplatePlaced(!templatePlaced)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              templatePlaced
                ? 'bg-cyan-950/60 border-cyan-400 text-white'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span>📋 วางแผ่นทาบเจาะ (Mount Template)</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                templatePlaced
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {templatePlaced ? 'วางอยู่บนผนัง' : 'คลิกเพื่อวาง'}
            </span>
          </button>

          {/* Level */}
          <button
            onClick={() => setLevelChecked(!levelChecked)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              levelChecked
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span>🟢 วางระดับน้ำตรวจแนวขนาน (Spirit Level)</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                levelChecked
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {levelChecked ? 'ได้ระนาบ 0°' : 'คลิกตรวจ'}
            </span>
          </button>

          {/* Tape Measure */}
          <button
            onClick={() => setTapeMeasureActive(!tapeMeasureActive)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              tapeMeasureActive
                ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span>📏 ดึงตลับเมตรวัดความสูงจากพื้น (Tape Measure)</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tapeMeasureActive
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tapeMeasureActive ? 'กำลังวัด' : 'คลิกวัด'}
            </span>
          </button>
        </div>
      </div>

      {/* Marking Action Section */}
      <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            ตำแหน่งมาร์กรูเจาะ ({markedPoints.length}/4 จุด)
          </span>
          {markedPoints.length > 0 && (
            <button
              onClick={clearMarkedPoints}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>ล้างจุดมาร์ก</span>
            </button>
          )}
        </div>

        <button
          onClick={markNextHole}
          disabled={markedPoints.length >= 4}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            markedPoints.length < 4
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>
            {markedPoints.length < 4
              ? `มาร์กจุดเจาะที่ ${markedPoints.length + 1} ด้วยดินสอช่าง`
              : 'มาร์กครบ 4 จุดแล้ว'}
          </span>
        </button>

        {/* Marked Points Details */}
        <div className="space-y-1 pt-1">
          {markedPoints.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]"
            >
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                {pt.label}
              </span>
              <span className="font-mono text-cyan-400 text-[10px]">
                X: {pt.x > 0 ? `+${pt.x}` : pt.x}m, Y:{' '}
                {pt.y > 0 ? `+${pt.y}` : pt.y}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
