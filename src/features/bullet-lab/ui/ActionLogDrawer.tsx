'use client';

import React from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { ListOrdered, X, Clock, Tag } from 'lucide-react';

export const ActionLogDrawer: React.FC = () => {
  const showActionLog = useBulletLabStore((s) => s.showActionLog);
  const setShowActionLog = useBulletLabStore((s) => s.setShowActionLog);
  const actionLogs = useBulletLabStore((s) => s.actionLogs);

  if (!showActionLog) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 z-40 bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <ListOrdered className="w-4 h-4" />
          <span>บันทึกการกระทำ (Action Log)</span>
        </div>
        <button
          onClick={() => setShowActionLog(false)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Log Entries List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {actionLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            ยังไม่มีประวัติการกระทำ
          </div>
        ) : (
          actionLogs.map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {entry.timestamp}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-medium text-[10px]">
                  ภารกิจ {entry.mission}
                </span>
              </div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="font-mono text-cyan-300">{entry.action}</span>
              </div>
              <div className="text-slate-300 text-[11px] pl-4">{entry.detail}</div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-center text-[11px] text-slate-400">
        เก็บบันทึกประวัติการกระทำล่าสุด {actionLogs.length} รายการ
      </div>
    </div>
  );
};
