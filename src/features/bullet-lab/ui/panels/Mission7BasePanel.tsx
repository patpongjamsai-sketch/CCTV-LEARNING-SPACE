'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { Box } from 'lucide-react';
import { ScrewTightness } from '../../types';

export const Mission7BasePanel: React.FC = () => {
  const baseMounted = useBulletLabStore((s) => s.baseMounted);
  const setBaseMounted = useBulletLabStore((s) => s.setBaseMounted);
  const screwTightness = useBulletLabStore((s) => s.screwTightness);
  const setScrewTightness = useBulletLabStore((s) => s.setScrewTightness);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>เป้าหมาย:</strong> นำกล่องพักสายกันน้ำ (Junction Box) หรือแป้นยึดฐาน Snap เข้ากับตำแหน่งรูเจาะ จากนั้นขันสกรูให้แน่นหนาตามมาตรฐาน
      </div>

      {/* Snap Base Action */}
      <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            สถานะการประกบฐานยึด (Snap to Wall)
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              baseMounted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {baseMounted ? 'ประกบติดผนังแล้ว' : 'ยังไม่ได้ประกอบ'}
          </span>
        </div>

        <button
          onClick={() => setBaseMounted(!baseMounted)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            baseMounted
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>
            {baseMounted
              ? 'ถอดกล่องพักสายออก'
              : 'Snap กล่องพักสาย / ฐานยึดเข้าตำแหน่ง'}
          </span>
        </button>
      </div>

      {/* Screw Tightness Selector */}
      <div className="space-y-2.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <label className="text-xs font-semibold text-slate-300">
          ระดับแรงขันสกรูยึด 4 จุด (Screw Tightening State)
        </label>

        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: 'loose',
              name: 'ขันหลวม (Loose)',
              desc: 'สกรูยังไม่แนบสนิท ฐานขยับได้เมื่อมีแรงดึง',
              badge: 'หลวม',
              color: 'border-amber-500/60 text-amber-300 bg-amber-950/40',
            },
            {
              id: 'correct',
              name: 'ขันแน่นพอดี (Correct Torque)',
              desc: 'หน้าสัมผัสแนบสนิท ไม่กดบีบเนื้อพลาสติกจนแตก',
              badge: 'มาตรฐาน',
              color: 'border-emerald-500/60 text-emerald-300 bg-emerald-950/40',
            },
            {
              id: 'overtight',
              name: 'ขันแน่นเกินไป (Overtightened)',
              desc: 'เสี่ยงพลาสติกแตกร้าวหรือเกลียวพุกหวานรูด',
              badge: 'เกินพิกัด',
              color: 'border-red-500/60 text-red-300 bg-red-950/40',
            },
          ].map((item) => {
            const isSelected = screwTightness === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScrewTightness(item.id as ScrewTightness)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? item.color
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80">
                    {item.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
