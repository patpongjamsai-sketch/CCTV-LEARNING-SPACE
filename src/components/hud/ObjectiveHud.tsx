import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const ObjectiveHud: React.FC = () => {
  const activeMissionId = useRoleplayStore((s) => s.activeMissionId);
  const missions = useRoleplayStore((s) => s.missions);
  const rubric = useRoleplayStore((s) => s.rubric);
  const currentZone = useRoleplayStore((s) => s.currentZone);
  const setNotebookOpen = useRoleplayStore((s) => s.setNotebookOpen);
  const isNotebookOpen = useRoleplayStore((s) => s.isNotebookOpen);

  const activeMission = missions[activeMissionId];

  const zoneNames: Record<string, string> = {
    ZONE_A: 'โซน A · จุดรับภารกิจ (Entrance)',
    ZONE_B: 'โซน B · สถานีกล้อง IP (Camera)',
    ZONE_C: 'โซน C · ห้องอุปกรณ์เครือข่าย (PoE Switch)',
    ZONE_D: 'โซน D · ห้องบันทึกภาพ (NVR)',
    ZONE_E: 'โซน E · โต๊ะควบคุม (Control Desk)',
    ZONE_F: 'โซน F · มุมเปรียบเทียบ Analog vs IP',
  };

  return (
    <div className="fixed top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {/* Objective Card */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-white pointer-events-auto">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {activeMission.missionId}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            คะแนนสะสม: <strong className="text-emerald-400 font-bold text-sm">{rubric.totalScore}</strong>/100
          </span>
        </div>

        <h2 className="text-sm font-bold text-slate-100 line-clamp-1">
          {activeMission.titleTh}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
          {activeMission.descriptionTh}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden border border-slate-700">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${Math.min(100, (rubric.totalScore / 80) * 100)}%` }}
          />
        </div>

        {/* Zone & Notebook trigger */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span className="truncate">{zoneNames[currentZone] || currentZone}</span>
          <button
            type="button"
            onClick={() => setNotebookOpen(!isNotebookOpen)}
            className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-slate-200 border border-slate-600 cursor-pointer font-medium transition-colors"
          >
            Tab Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
