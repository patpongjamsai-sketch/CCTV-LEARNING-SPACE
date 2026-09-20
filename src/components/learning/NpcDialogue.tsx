import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const NpcDialogue: React.FC = () => {
  const activeDialogue = useRoleplayStore((s) => s.activeDialogue);
  const nextDialogueBubble = useRoleplayStore((s) => s.nextDialogueBubble);
  const closeDialogue = useRoleplayStore((s) => s.closeDialogue);
  const setNotebookOpen = useRoleplayStore((s) => s.setNotebookOpen);
  const setNotebookActiveTab = useRoleplayStore((s) => s.setNotebookActiveTab);

  if (!activeDialogue || !activeDialogue.isOpen) return null;

  const { speakerNameTh, speakerRoleTh, bubbles, currentBubbleIndex, zoneId } = activeDialogue;
  const currentBubble = bubbles[currentBubbleIndex] ?? '';
  const isLast = currentBubbleIndex + 1 >= bubbles.length;

  const getActionLabel = () => {
    if (!isLast) return 'ข้อความถัดไป';
    switch (zoneId) {
      case 'ZONE_A':
        return '📋 เปิด Checklist ภารกิจ';
      case 'ZONE_B':
        return '🎯 เริ่มภารกิจที่ 1: ภาพดิจิทัล ➜';
      case 'ZONE_C':
        return '🎯 เริ่มภารกิจที่ 2: Data Flow ➜';
      case 'ZONE_D':
        return '🎯 เริ่มภารกิจที่ 3: หน้าที่อุปกรณ์ ➜';
      case 'ZONE_F':
        return '🎯 เริ่มภารกิจที่ 4: Analog vs IP ➜';
      case 'ZONE_E':
        return '🎯 เริ่มภารกิจที่ 5: ต่อสาย & Live View ➜';
      default:
        return '🎯 เริ่มภารกิจประจำโต๊ะนี้ ➜';
    }
  };

  const openChecklistDirect = () => {
    closeDialogue();
    setNotebookOpen(true);
    setNotebookActiveTab('checklist');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-24 bg-slate-950/40 backdrop-blur-[2px] select-none p-4">
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-sky-500/50 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
        {/* Header: Speaker Name & Role */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-base font-bold text-sky-300">{speakerNameTh}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {speakerRoleTh}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentBubbleIndex + 1} / {bubbles.length}
          </span>
        </div>

        {/* Bubble Text (Max 140 chars guaranteed) */}
        <p className="text-base leading-relaxed text-slate-200 min-h-[3.5rem] font-sans">
          {currentBubble}
        </p>

        {/* Buttons & Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeDialogue}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer underline"
            >
              ปิดบทสนทนา (Esc)
            </button>
            {isLast && zoneId !== 'ZONE_A' && (
              <button
                type="button"
                onClick={openChecklistDirect}
                className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 font-medium"
              >
                <span>📋 เปิด Checklist รวม</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={nextDialogueBubble}
            className={`px-4 py-1.5 rounded-xl text-white text-sm font-semibold cursor-pointer shadow-md transition-all flex items-center gap-1.5 ${
              isLast
                ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-emerald-500/25'
                : 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 shadow-sky-500/20'
            }`}
          >
            <span>{getActionLabel()}</span>
            <kbd className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">[E]</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
