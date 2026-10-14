'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { PPE_ITEMS } from '../../data/bulletLabData';
import {
  ShieldCheck,
  HardHat,
  Glasses,
  Shield,
  Hand,
  Footprints,
  MousePointerClick,
  Compass,
} from 'lucide-react';
import { PPEItemId } from '../../types';

export const Mission1PPEPanel: React.FC = () => {
  const ppeEquipped = useBulletLabStore((s) => s.ppeEquipped);
  const togglePPE = useBulletLabStore((s) => s.togglePPE);
  const isNearPpeTable = useBulletLabStore((s) => s.isNearPpeTable);
  const distanceToPpeTable = useBulletLabStore((s) => s.distanceToPpeTable);
  const setIsPpeModalOpen = useBulletLabStore((s) => s.setIsPpeModalOpen);

  const getIcon = (id: PPEItemId) => {
    switch (id) {
      case 'helmet':
      case 'cap':
        return <HardHat className="w-4 h-4" />;
      case 'glasses':
      case 'sunglasses':
        return <Glasses className="w-4 h-4" />;
      case 'mask':
        return <Shield className="w-4 h-4" />;
      case 'gloves':
        return <Hand className="w-4 h-4" />;
      case 'shoes':
      case 'slippers':
        return <Footprints className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Roblox Controls & Proximity Guide */}
      <div className="p-3 bg-cyan-950/50 border border-cyan-800/60 rounded-2xl text-xs text-cyan-200 space-y-2">
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Compass className="w-4 h-4" />
            <span>การบังคับตัวละคร Roblox:</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono">
            W, A, S, D / ลูกศร
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          กดปุ่ม <strong>W, A, S, D</strong> เพื่อเดินตัวละครไปยังโต๊ะชุดอุปกรณ์ PPE (ด้านซ้ายของห้อง) และกด <strong>Shift</strong> เพื่อวิ่ง
        </p>

        {/* Real-time Distance Status & Open Modal Trigger */}
        <div className="pt-2 border-t border-cyan-800/40 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">สถานะตัวละคร:</span>
            {isNearPpeTable ? (
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                ✓ ยืนอยู่ข้างโต๊ะ PPE แล้ว
              </span>
            ) : (
              <span className="font-medium text-amber-300">
                🚶 เดินเข้าใกล้โต๊ะอีก (ห่าง {distanceToPpeTable.toFixed(1)} ม.)
              </span>
            )}
          </div>

          <button
            onClick={() => setIsPpeModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
          >
            <span>🦺</span>
            <span>เปิดหน้าต่างเลือกอุปกรณ์ PPE Modal</span>
          </button>
        </div>
      </div>

      {/* Double-Click Instruction Banner */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
        <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>หมายเลขบนโต๊ะ 3D:</strong> ตัวเลข <strong>[1] ถึง [8]</strong> บนโต๊ะ 3D ตรงกับรายการอุปกรณ์ด้านล่างนี้ ดับเบิ้ลคลิกเพื่อสวมใส่
        </span>
      </div>

      {/* Equipment Checklist (All 8 Items - Neutral View) */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            รายการอุปกรณ์บนโต๊ะ (หมายเลข 1 ถึง 8)
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            สวมใส่ {PPE_ITEMS.filter((i) => ppeEquipped[i.id]).length}/8 รายการ
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {PPE_ITEMS.map((item) => {
            const isEquipped = !!ppeEquipped[item.id];
            return (
              <button
                key={item.id}
                onClick={() => togglePPE(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all text-left cursor-pointer ${
                  isEquipped
                    ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-100 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Number Badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${
                      isEquipped
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                        : 'bg-slate-800 text-cyan-300 border-slate-700'
                    }`}
                  >
                    {item.numberIndex}
                  </span>

                  <div
                    className={`p-1.5 rounded-lg ${
                      isEquipped
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getIcon(item.id)}
                  </div>
                  <div>
                    <div className="font-semibold text-[12px] flex items-center gap-1.5">
                      <span>{item.nameTh}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.descriptionTh}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isEquipped
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isEquipped ? 'สวมใส่แล้ว ✓' : '+ สวมใส่'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
