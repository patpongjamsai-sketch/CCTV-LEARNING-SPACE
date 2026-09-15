import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const InventoryBar: React.FC = () => {
  const inventory = useRoleplayStore((s) => s.inventory);
  const activeSlotIndex = useRoleplayStore((s) => s.activeSlotIndex);
  const selectSlot = useRoleplayStore((s) => s.selectSlot);
  const carriedItem = useRoleplayStore((s) => s.carriedItem);
  const dropCarriedItem = useRoleplayStore((s) => s.dropCarriedItem);
  const returnAll = useRoleplayStore((s) => s.returnAllItemsToStations);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 select-none">
      {/* Carried Item Notification Tag */}
      {carriedItem && (
        <div className="flex items-center gap-2 bg-slate-900/90 border border-sky-500/40 text-slate-100 text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
          <span>ถืออยู่ในมือ:</span>
          <span className="font-semibold text-sky-400">{carriedItem.nameTh}</span>
          {carriedItem.weight === 'HEAVY' && (
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px] border border-amber-500/30">
              หนัก (ถือสองมือ)
            </span>
          )}
          <button
            type="button"
            onClick={dropCarriedItem}
            className="ml-1 text-[11px] text-slate-400 hover:text-red-400 cursor-pointer underline"
          >
            เก็บลงช่อง
          </button>
        </div>
      )}

      {/* 5-Slot Hotbar */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl">
        {inventory.map((item, idx) => {
          const isActive = idx === activeSlotIndex;

          return (
            <button
              key={`slot_${idx}`}
              type="button"
              onClick={() => selectSlot(idx)}
              className={`relative w-14 h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/20 scale-105'
                  : 'border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/50'
              }`}
            >
              {/* Hotkey Indicator */}
              <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-slate-400">
                {idx + 1}
              </span>

              {/* Item Icon & Quantity */}
              {item ? (
                <>
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="text-[9px] text-slate-200 truncate w-12 text-center mt-1">
                    {item.nameTh.split(' ')[0]}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-slate-600 font-mono">ว่าง</span>
              )}
            </button>
          );
        })}

        {/* Return Items Button */}
        <button
          type="button"
          onClick={returnAll}
          title="นำของกลับจุดเดิม ป้องกันวัตถุสูญหาย"
          className="ml-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-300 rounded-xl text-xs flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          <span className="text-sm">🔄</span>
          <span className="text-[9px] mt-0.5 text-slate-400">คืนของ</span>
        </button>
      </div>
    </div>
  );
};
