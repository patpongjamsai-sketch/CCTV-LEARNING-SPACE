import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const NpcDialogue: React.FC = () => {
  const activeDialogue = useRoleplayStore((s) => s.activeDialogue);
  const nextDialogueBubble = useRoleplayStore((s) => s.nextDialogueBubble);
  const closeDialogue = useRoleplayStore((s) => s.closeDialogue);

  if (!activeDialogue || !activeDialogue.isOpen) return null;

  const { speakerNameTh, speakerRoleTh, bubbles, currentBubbleIndex } = activeDialogue;
  const currentBubble = bubbles[currentBubbleIndex] ?? '';
  const isLast = currentBubbleIndex + 1 >= bubbles.length;

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
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={closeDialogue}
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer underline"
          >
            ปิดบทสนทนา (Esc)
          </button>
          <button
            type="button"
            onClick={nextDialogueBubble}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white text-sm font-semibold cursor-pointer shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            <span>{isLast ? 'เสร็จสิ้นการสนทนา' : 'ข้อความถัดไป'}</span>
            <kbd className="text-[10px] bg-sky-700/60 px-1.5 py-0.5 rounded font-mono">[E]</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
