'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { PPE_ITEMS } from '../data/bulletLabData';
import { PPEItemId } from '../types';
import { RobloxTechnicianAvatar } from '../three/RobloxTechnicianAvatar';
import {
  ShieldCheck,
  HardHat,
  Glasses,
  Shield,
  Hand,
  Footprints,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';

export const PpeStationModal: React.FC = () => {
  const isPpeModalOpen = useBulletLabStore((s) => s.isPpeModalOpen);
  const setIsPpeModalOpen = useBulletLabStore((s) => s.setIsPpeModalOpen);
  const ppeEquipped = useBulletLabStore((s) => s.ppeEquipped);
  const togglePPE = useBulletLabStore((s) => s.togglePPE);
  const setPpeEquipped = useBulletLabStore((s) => s.setPpeEquipped);
  const distanceToPpeTable = useBulletLabStore((s) => s.distanceToPpeTable);

  // Close on ESC key
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

  const totalEquipped = PPE_ITEMS.filter((item) => !!ppeEquipped[item.id]).length;

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

  const handleUnequipAll = () => {
    const updated = { ...ppeEquipped };
    PPE_ITEMS.forEach((item) => {
      updated[item.id] = false;
    });
    setPpeEquipped(updated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ppe-modal-title"
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
                <h2 id="ppe-modal-title" className="text-base sm:text-lg font-bold text-white tracking-wide">
                  สถานีสวมใส่อุปกรณ์ความปลอดภัย (PPE Station)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                  ระยะห่างโต๊ะ {distanceToPpeTable.toFixed(1)} ม.
                </span>
              </div>
              <p className="text-xs text-slate-400">
                คลิกเลือกอุปกรณ์ทางด้านขวาเพื่อสวมใส่เข้าตัวละคร Roblox ทางด้านซ้าย
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPpeModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
            title="ปิดหน้าต่าง (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY: 2 COLUMNS (LEFT: 3D ROBLOX AVATAR / RIGHT: 8 ITEMS LIST) */}
        <div className="flex-1 overflow-hidden p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-0">
          {/* LEFT COLUMN: 3D ROBLOX TECHNICIAN AVATAR (Interactive 3D Live Preview) */}
          <div className="lg:col-span-5 flex flex-col min-h-0 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
            {/* Top Viewport Header */}
            <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>🤖</span>
                <span>หุ่นจำลองตัวละคร Roblox (3D Live Preview)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                🖱️ คลิกค้างเพื่อหมุน 360°
              </span>
            </div>

            {/* 3D Canvas Area */}
            <div className="flex-1 relative w-full h-full min-h-[320px] bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
              <Canvas
                camera={{ position: [0, 1.0, 2.7], fov: 42 }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                <ambientLight intensity={1.3} />
                <directionalLight position={[3, 4, 3]} intensity={1.6} />
                <directionalLight position={[-3, 2, -2]} intensity={0.7} />
                <pointLight position={[0, 2.2, 1.5]} intensity={0.9} color="#38bdf8" />
                <OrbitControls
                  enableZoom={true}
                  minDistance={1.4}
                  maxDistance={4.2}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.8}
                  target={[0, 0.8, 0]}
                />
                <group position={[0, 0, 0]}>
                  {/* Roblox Avatar with worn PPE gear */}
                  <RobloxTechnicianAvatar isMoving={false} isSprinting={false} />

                  {/* Industrial Stage Pedestal */}
                  <mesh position={[0, -0.02, 0]} receiveShadow>
                    <cylinderGeometry args={[0.85, 0.95, 0.06, 32]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
                  </mesh>
                  {/* Glowing Pedestal Ring */}
                  <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.78, 0.82, 32]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                </group>
              </Canvas>

              {/* Real-time Equipped Indicator Overlay */}
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/90 text-cyan-300 border border-cyan-500/40 shadow-lg backdrop-blur">
                  กำลังสวมใส่: {totalEquipped} ชิ้น
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-900/80 border border-slate-700/60 backdrop-blur">
                  หมุนดูด้านหน้า / หลังได้
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EQUIPMENT LIST 1 TO 8 (Neutral Assessment View) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧰</span>
                <span>รายการอุปกรณ์บนโต๊ะ (หมายเลข 1 ถึง 8)</span>
              </span>
              <span className="text-xs font-mono text-cyan-300 font-semibold">
                เลือกสวมใส่แล้ว {totalEquipped} จาก 8 รายการ
              </span>
            </div>

            {/* List of 8 Items - Clean & Neutral */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1.5 my-2">
              {PPE_ITEMS.map((item) => {
                const isEquipped = !!ppeEquipped[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => togglePPE(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePPE(item.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none group ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-100 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    {/* Left: Number Badge + Icon + Name + Description */}
                    <div className="flex items-center gap-3">
                      {/* Number Badge [1] to [8] */}
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 border transition-transform group-hover:scale-105 ${
                          isEquipped
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                            : 'bg-slate-800 text-cyan-300 border-slate-700'
                        }`}
                      >
                        {item.numberIndex}
                      </span>

                      {/* Icon */}
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isEquipped
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {getIcon(item.id)}
                      </div>

                      {/* Details */}
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{item.nameTh}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-snug">
                          {item.descriptionTh}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill */}
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all ${
                          isEquipped
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>สวมใส่อยู่</span>
                          </>
                        ) : (
                          <span>+ สวมใส่</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={handleUnequipAll}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ถอดอุปกรณ์ทั้งหมด</span>
              </button>

              <button
                onClick={() => setIsPpeModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                ยืนยันการเลือก & กลับสู่แล็บ 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
