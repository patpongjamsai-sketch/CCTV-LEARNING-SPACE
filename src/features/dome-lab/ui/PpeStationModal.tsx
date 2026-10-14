'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { PPE_ITEMS_DATA } from '../data/domeLabData';
import { PPEItemId } from '../types';
import { RobloxTechnicianAvatar } from '../three/RobloxTechnicianAvatar';
import {
  ShieldCheck,
  HardHat,
  Glasses,
  Shield,
  Footprints,
  X,
  RotateCcw,
  Check,
  Ban,
  HandMetal,
} from 'lucide-react';

export const PpeStationModal: React.FC = () => {
  const isPpeModalOpen = useDomeLabStore((s) => s.isPpeModalOpen);
  const setIsPpeModalOpen = useDomeLabStore((s) => s.setIsPpeModalOpen);
  const ppeEquipped = useDomeLabStore((s) => s.ppeEquipped);
  const togglePPE = useDomeLabStore((s) => s.togglePPE);
  const setPpeEquipped = useDomeLabStore((s) => s.setPpeEquipped);
  const distanceToPpeTable = useDomeLabStore((s) => s.distanceToPpeTable);
  const setCurrentMission = useDomeLabStore((s) => s.setCurrentMission);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPpeModalOpen) {
        setIsPpeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPpeModalOpen, setIsPpeModalOpen]);

  if (!isPpeModalOpen) return null;

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
        return <HandMetal className="w-4 h-4" />;
      case 'shoes':
      case 'slippers':
        return <Footprints className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const handleUnequipAll = () => {
    const updated = { ...ppeEquipped };
    PPE_ITEMS_DATA.forEach((item) => {
      updated[item.id] = false;
    });
    setPpeEquipped(updated);
  };

  const isCompletePassed =
    ppeEquipped.helmet &&
    ppeEquipped.glasses &&
    ppeEquipped.mask &&
    ppeEquipped.gloves &&
    ppeEquipped.shoes &&
    !ppeEquipped.slippers &&
    !ppeEquipped.cap &&
    !ppeEquipped.sunglasses;

  const hasDecoys = ppeEquipped.slippers || ppeEquipped.cap || ppeEquipped.sunglasses;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] isolate flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  สถานีสวมใส่อุปกรณ์ความปลอดภัย (PPE Workbench)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                  ระยะห่างโต๊ะ {distanceToPpeTable.toFixed(1)} ม.
                </span>
              </div>
              <p className="text-xs text-slate-400">
                คลิกเลือกอุปกรณ์ทางขวาเพื่อสวมใส่เข้าตัวละคร Roblox Technician ทางซ้าย
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPpeModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: 3D Preview of Roblox Character wearing PPE */}
          <div className="w-full lg:w-5/12 h-64 lg:h-auto bg-slate-950/90 relative flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              Roblox Technician 3D Preview
            </div>

            <div className="w-full h-full">
              <Canvas camera={{ position: [0, 1.2, 2.8], fov: 42 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[3, 5, 4]} intensity={1.2} />
                <pointLight position={[-3, 2, 2]} intensity={0.5} />
                <OrbitControls
                  enablePan={false}
                  minDistance={1.8}
                  maxDistance={4.5}
                  maxPolarAngle={Math.PI / 2 + 0.1}
                />
                <group position={[0, -0.6, 0]}>
                  <RobloxTechnicianAvatar isMoving={false} isSprinting={false} />
                </group>
              </Canvas>
            </div>

            {/* Validation Notification Banner */}
            <div className="absolute bottom-4 inset-x-4 z-10">
              {isCompletePassed ? (
                <div className="bg-emerald-950/90 border border-emerald-500/60 p-2.5 rounded-2xl flex items-center justify-between text-xs text-emerald-300 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">สวมใส่อุปกรณ์ PPE ครบถ้วนถูกต้องตามมาตรฐาน!</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsPpeModalOpen(false);
                      setCurrentMission(2);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-xl text-xs cursor-pointer shadow transition-all"
                  >
                    ไปภารกิจที่ 2 ➜
                  </button>
                </div>
              ) : hasDecoys ? (
                <div className="bg-red-950/90 border border-red-500/60 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-red-300 shadow-xl backdrop-blur-md">
                  <Ban className="w-4 h-4 text-red-400 shrink-0" />
                  <span>มีอุปกรณ์หลอก/ไม่ปลอดภัย! ถอดรองเท้าแตะ แว่นกันแดด หรือหมวกแก๊ปออก</span>
                </div>
              ) : (
                <div className="bg-slate-900/90 border border-slate-700/60 p-2.5 rounded-2xl flex items-center justify-between text-xs text-slate-300 shadow-xl backdrop-blur-md">
                  <span>เลือกอุปกรณ์จำเป็นให้ครบ 5 รายการ (แว่น, หมวก, ถุงมือ, รองเท้า, หน้ากาก)</span>
                  <button
                    onClick={handleUnequipAll}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ถอดทั้งหมด</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: PPE Items Grid */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PPE_ITEMS_DATA.map((item) => {
                const isEquipped = ppeEquipped[item.id];
                const isDecoy = item.category === 'decoy';

                return (
                  <button
                    key={item.id}
                    onClick={() => togglePPE(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                      isEquipped
                        ? isDecoy
                          ? 'bg-red-950/40 border-red-500/70 shadow-lg ring-1 ring-red-500/30'
                          : 'bg-emerald-950/40 border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                        isEquipped
                          ? isDecoy
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {getIcon(item.id)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          #{item.numberIndex} {item.nameTh}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            isEquipped
                              ? isDecoy
                                ? 'bg-red-900/80 text-red-200'
                                : 'bg-emerald-900/80 text-emerald-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isEquipped ? (isDecoy ? '⚠️ อันตราย' : '✓ สวมใส่') : 'ยังไม่เลือก'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.descriptionTh}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
