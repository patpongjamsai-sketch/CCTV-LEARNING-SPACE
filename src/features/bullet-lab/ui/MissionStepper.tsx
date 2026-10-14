'use client';

import React from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { MISSIONS_LIST } from '../data/bulletLabData';
import { MissionId } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MissionStepper: React.FC = () => {
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const setCurrentMission = useBulletLabStore((s) => s.setCurrentMission);

  const handlePrev = () => {
    if (currentMission > 1) {
      setCurrentMission((currentMission - 1) as MissionId);
    }
  };

  const handleNext = () => {
    if (currentMission < 4) {
      setCurrentMission((currentMission + 1) as MissionId);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={currentMission <= 1}
        className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
          currentMission <= 1
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
        }`}
        title="ภารกิจก่อนหน้า"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Stepper Dots & Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
        {MISSIONS_LIST.map((m) => {
          const isActive = m.id === currentMission;
          return (
            <button
              key={m.id}
              onClick={() => setCurrentMission(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive
                    ? 'bg-slate-950 text-cyan-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {m.id}
              </span>
              <span className="hidden md:inline">{m.phaseName}</span>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentMission >= 4}
        className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
          currentMission >= 4
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
        }`}
        title="ภารกิจถัดไป"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
