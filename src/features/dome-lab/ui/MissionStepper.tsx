'use client';

import React from 'react';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { MISSIONS_DATA } from '../data/domeLabData';
import { MissionId } from '../types';
import { ShieldCheck, MapPin, Camera, Wrench, CheckCircle2 } from 'lucide-react';

export const MissionStepper: React.FC = () => {
  const currentMission = useDomeLabStore((s) => s.currentMission);
  const setCurrentMission = useDomeLabStore((s) => s.setCurrentMission);
  const submissionsBySurface = useDomeLabStore((s) => s.submissionsBySurface);
  const ppeEquipped = useDomeLabStore((s) => s.ppeEquipped);

  // Check PPE completion
  const isPpeComplete =
    ppeEquipped.helmet &&
    ppeEquipped.glasses &&
    ppeEquipped.mask &&
    ppeEquipped.gloves &&
    ppeEquipped.shoes &&
    !ppeEquipped.slippers &&
    !ppeEquipped.cap &&
    !ppeEquipped.sunglasses;

  // Check Mission 4 progress
  const completedSurfacesCount = Object.values(submissionsBySurface).filter(Boolean).length;

  const getMissionIcon = (id: MissionId) => {
    switch (id) {
      case 1:
        return <ShieldCheck className="w-4 h-4" />;
      case 2:
        return <MapPin className="w-4 h-4" />;
      case 3:
        return <Camera className="w-4 h-4" />;
      case 4:
        return <Wrench className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 select-none shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {MISSIONS_DATA.map((m) => {
          const isActive = currentMission === m.id;
          const isPassed =
            (m.id === 1 && isPpeComplete) ||
            (m.id === 4 && completedSurfacesCount === 4);

          return (
            <button
              key={m.id}
              onClick={() => setCurrentMission(m.id)}
              className={`flex-1 min-w-[200px] flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/70 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : isPassed
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : getMissionIcon(m.id)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400/80">
                    ภารกิจ {m.id} · {m.phaseName}
                  </span>
                  {m.id === 4 && completedSurfacesCount > 0 && (
                    <span className="text-[9px] font-bold bg-cyan-900/80 text-cyan-200 px-1 rounded">
                      {completedSurfacesCount}/4 พื้นผิว
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {m.titleTh}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
