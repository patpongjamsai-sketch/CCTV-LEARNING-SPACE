'use client';

import React from 'react';
import { useDomeLabStore } from '../../store/useDomeLabStore';
import { PPE_ITEMS_DATA } from '../../data/domeLabData';
import { ShieldCheck, HardHat, Check, ArrowRight } from 'lucide-react';

export const Mission1PPEPanel: React.FC = () => {
  const ppeEquipped = useDomeLabStore((s) => s.ppeEquipped);
  const setIsPpeModalOpen = useDomeLabStore((s) => s.setIsPpeModalOpen);
  const setCurrentMission = useDomeLabStore((s) => s.setCurrentMission);
  const distanceToPpeTable = useDomeLabStore((s) => s.distanceToPpeTable);
  const activeRoom = useDomeLabStore((s) => s.activeRoom);

  const requiredItems = PPE_ITEMS_DATA.filter((i) => i.category === 'required');
  const equippedCount = requiredItems.filter((i) => ppeEquipped[i.id]).length;

  const isComplete =
    equippedCount === 5 &&
    !ppeEquipped.slippers &&
    !ppeEquipped.cap &&
    !ppeEquipped.sunglasses;

  const isRoom1 = activeRoom === 'room1_indoor';

  return (
    <div className="p-4 space-y-4 text-slate-200 select-none">
      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>ภารกิจที่ 1: ความปลอดภัย & ชุด PPE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isRoom1
            ? 'ก่อนเริ่มงานติดตั้งกล้องโดม ช่างต้องเตรียมความปลอดภัยให้พร้อม โดยเดินไปที่โต๊ะอุปกรณ์ PPE (มุมห้องสำนักงาน โซนหน้าซ้าย) แล้วกดเลือกอุปกรณ์ความปลอดภัย'
            : 'ก่อนเริ่มงานติดตั้งกล้องโดม ช่างต้องเตรียมความปลอดภัยให้พร้อม โดยเดินไปที่โต๊ะอุปกรณ์ PPE (โซนโรงฝึกงาน โซนหน้าอาคาร) แล้วกดเลือกอุปกรณ์ความปลอดภัย'}
        </p>
      </div>

      {/* Checklist of Required PPE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>อุปกรณ์ความปลอดภัยจำเป็น</span>
          <span className="font-mono text-cyan-400">
            {equippedCount} / 5 รายการ
          </span>
        </div>

        <div className="space-y-1.5">
          {requiredItems.map((item) => {
            const isEquipped = ppeEquipped[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all ${
                  isEquipped
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">#{item.numberIndex}</span>
                  <span className="font-medium">{item.nameTh}</span>
                </div>
                {isEquipped ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-500">ยังไม่สวม</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Proximity / Open Modal Button */}
      <div className="pt-2">
        <button
          onClick={() => setIsPpeModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg border border-cyan-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <HardHat className="w-4 h-4" />
          <span>เปิดตู้เลือกอุปกรณ์ PPE (ห่าง {distanceToPpeTable.toFixed(1)} ม.)</span>
        </button>
      </div>

      {/* Next Mission Button */}
      {isComplete && (
        <div className="pt-2 animate-in fade-in duration-300">
          <button
            onClick={() => setCurrentMission(2)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl border border-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>ผ่านการเตรียมความปลอดภัย! ไปต่อภารกิจที่ 2</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
