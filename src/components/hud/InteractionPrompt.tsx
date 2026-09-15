import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const InteractionPrompt: React.FC = () => {
  const prompt = useRoleplayStore((s) => s.interactionPromptText);
  const notification = useRoleplayStore((s) => s.notificationMessage);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none select-none">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-2 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
              : 'bg-slate-900/90 text-slate-100 border-slate-700'
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* Proximity Interaction Prompt */}
      {prompt && !notification && (
        <div className="bg-slate-900/95 border border-sky-500/60 text-slate-100 text-sm px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>{prompt}</span>
        </div>
      )}
    </div>
  );
};
