'use client';

import React, { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { PPEItemId } from '../types';

interface PpeStationTable3DProps {
  position?: [number, number, number];
}

interface TableItemConfig {
  id: PPEItemId;
  numberIndex: number;
  nameTh: string;
  isDecoy: boolean;
  offset: [number, number, number];
}

const TABLE_LEGS: [number, number, number][] = [
  [-0.75, 0.42, -0.38],
  [0.75, 0.42, -0.38],
  [-0.75, 0.42, 0.38],
  [0.75, 0.42, 0.38],
];

const TABLE_ITEMS: TableItemConfig[] = [
  { id: 'helmet', numberIndex: 1, nameTh: 'หมวกนิรภัย', isDecoy: false, offset: [-0.6, 0.92, 0.2] },
  { id: 'glasses', numberIndex: 2, nameTh: 'แว่นตานิรภัย', isDecoy: false, offset: [-0.2, 0.9, 0.2] },
  { id: 'mask', numberIndex: 3, nameTh: 'หน้ากาก N95', isDecoy: false, offset: [0.2, 0.9, 0.2] },
  { id: 'gloves', numberIndex: 4, nameTh: 'ถุงมือช่าง', isDecoy: false, offset: [0.6, 0.9, 0.2] },

  // Back Row (Shoes & Decoys)
  { id: 'shoes', numberIndex: 5, nameTh: 'รองเท้าเซฟตี้', isDecoy: false, offset: [-0.6, 0.92, -0.2] },
  { id: 'slippers', numberIndex: 6, nameTh: 'รองเท้าแตะ', isDecoy: true, offset: [-0.2, 0.9, -0.2] },
  { id: 'cap', numberIndex: 7, nameTh: 'หมวกแก๊ป', isDecoy: true, offset: [0.2, 0.92, -0.2] },
  { id: 'sunglasses', numberIndex: 8, nameTh: 'แว่นกันแดด', isDecoy: true, offset: [0.6, 0.9, -0.2] },
];

export const PpeStationTable3D: React.FC<PpeStationTable3DProps> = ({
  position = [-2.4, 0, 2.0],
}) => {
  const ppeEquipped = useBulletLabStore((s) => s.ppeEquipped);
  const togglePPE = useBulletLabStore((s) => s.togglePPE);
  const isNearPpeTable = useBulletLabStore((s) => s.isNearPpeTable);
  const distanceToPpeTable = useBulletLabStore((s) => s.distanceToPpeTable);
  const isPpeModalOpen = useBulletLabStore((s) => s.isPpeModalOpen);
  const isMission4ModalOpen = useBulletLabStore((s) => s.isMission4ModalOpen);
  const setIsPpeModalOpen = useBulletLabStore((s) => s.setIsPpeModalOpen);

  const isAnyModalOpen = isPpeModalOpen || isMission4ModalOpen;

  const [hoveredItem, setHoveredItem] = useState<PPEItemId | null>(null);
  const [doubleClickNotice, setDoubleClickNotice] = useState<string | null>(null);

  const handleItemDoubleClick = (id: PPEItemId, numberIndex: number) => {
    if (!isNearPpeTable) {
      setDoubleClickNotice(`⚠️ ต้องเดินเข้ามาใกล้โต๊ะก่อน (ห่าง ${distanceToPpeTable.toFixed(1)}m)`);
      setTimeout(() => setDoubleClickNotice(null), 2500);
      return;
    }

    togglePPE(id);
    const willEquip = !ppeEquipped[id];
    setDoubleClickNotice(`${willEquip ? '✨ สวมใส่อุปกรณ์ หมายเลข ' : 'ถอดอุปกรณ์ หมายเลข '} [${numberIndex}]`);
    setTimeout(() => setDoubleClickNotice(null), 2000);
  };

  return (
    <group position={position}>
      {/* 1. TABLE STRUCTURE */}
      {/* Table Top Surface (0.85m high) */}
      <mesh position={[0, 0.85, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.08, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Tabletop Safety Yellow Border Trim */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.72, 0.04, 0.92]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.4} />
      </mesh>

      {/* 4 Metal Legs */}
      {TABLE_LEGS.map(([lx, ly, lz], i) => (
        <mesh key={i} position={[lx, ly, lz]}>
          <cylinderGeometry args={[0.03, 0.03, 0.84, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
        </mesh>
      ))}

      {/* 2. OVERHEAD STATION SIGNBOARD */}
      <group position={[0, 2.1, 0]}>
        {/* Support Rods extending from table */}
        <mesh position={[-0.75, -0.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.4, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0.75, -0.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.4, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* 3D Signboard Banner */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 0.32, 0.04]} />
          <meshStandardMaterial
            color={isNearPpeTable ? '#0284c7' : '#1e293b'}
            roughness={0.4}
          />
        </mesh>

        {/* Signboard HTML Text & Proximity Prompt (hidden when modal is open) */}
        {!isAnyModalOpen && (
          <Html position={[0, 0, 0.03]} center distanceFactor={7}>
            <div className="flex flex-col items-center whitespace-nowrap text-center select-none pointer-events-auto">
              <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400 text-cyan-300 font-bold text-xs shadow-lg flex items-center gap-1.5">
                <span>🦺 โต๊ะชุดอุปกรณ์ PPE</span>
                <span className="text-[10px] text-amber-300 font-normal">
                  (ดับเบิ้ลคลิก 2 ครั้งเพื่อใส่)
                </span>
              </div>
              {/* Proximity Status & Modal Launcher Button */}
              <div className="mt-1 flex items-center gap-1.5">
                {isNearPpeTable ? (
                  <>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-semibold">
                      ✓ อยู่ในระยะโต๊ะแล้ว
                    </span>
                    <button
                      onClick={() => setIsPpeModalOpen(true)}
                      className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border border-cyan-300 shadow transition-transform hover:scale-105 cursor-pointer"
                    >
                      📋 เปิดหน้าต่าง PPE Modal
                    </button>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900/90 text-slate-400 border border-slate-700">
                    🚶 เดินเข้ามาใกล้โต๊ะ (ห่าง {distanceToPpeTable.toFixed(1)} ม.)
                  </span>
                )}
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Floating Action Feedback Notification */}
      {!isAnyModalOpen && doubleClickNotice && (
        <Html position={[0, 1.4, 0]} center distanceFactor={6} pointerEvents="none">
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/95 border border-cyan-400 text-white font-bold text-xs shadow-2xl animate-bounce">
            {doubleClickNotice}
          </div>
        </Html>
      )}

      {/* 3. INDIVIDUAL 3D PPE ITEMS ON THE TABLETOP */}
      {TABLE_ITEMS.map((item) => {
        const isEquipped = !!ppeEquipped[item.id];
        const isHovered = hoveredItem === item.id;
        const [ix, iy, iz] = item.offset;

        return (
          <group
            key={item.id}
            position={[ix, iy, iz]}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleItemDoubleClick(item.id, item.numberIndex);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredItem(item.id);
            }}
            onPointerOut={() => {
              setHoveredItem(null);
            }}
          >
            {/* 3D Visual Mesh for each item */}
            {item.id === 'helmet' && (
              // Hardhat (Yellow)
              <group scale={isEquipped ? [0.6, 0.6, 0.6] : [0.9, 0.9, 0.9]}>
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[0.22, 0.12, 0.22]} />
                  <meshStandardMaterial
                    color="#eab308"
                    roughness={0.2}
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.4 : 1.0}
                  />
                </mesh>
                <mesh position={[0, 0.01, 0]}>
                  <boxGeometry args={[0.26, 0.02, 0.26]} />
                  <meshStandardMaterial
                    color="#ca8a04"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.4 : 1.0}
                  />
                </mesh>
              </group>
            )}

            {item.id === 'glasses' && (
              // Safety Goggles (Clear/Cyan)
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.18, 0.06, 0.06]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  transparent
                  opacity={isEquipped ? 0.3 : 0.8}
                  roughness={0.1}
                />
              </mesh>
            )}

            {item.id === 'mask' && (
              // Dust Mask (White)
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.14, 0.08, 0.06]} />
                <meshStandardMaterial
                  color="#ffffff"
                  transparent={isEquipped}
                  opacity={isEquipped ? 0.3 : 1.0}
                  roughness={0.5}
                />
              </mesh>
            )}

            {item.id === 'gloves' && (
              // Orange Gloves Pair
              <group position={[0, 0.02, 0]}>
                <mesh position={[-0.05, 0, 0]}>
                  <boxGeometry args={[0.07, 0.03, 0.12]} />
                  <meshStandardMaterial
                    color="#f97316"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
                <mesh position={[0.05, 0, 0]}>
                  <boxGeometry args={[0.07, 0.03, 0.12]} />
                  <meshStandardMaterial
                    color="#f97316"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
              </group>
            )}

            {item.id === 'shoes' && (
              // Safety Boots (Black/Orange) Pair
              <group position={[0, 0.05, 0]}>
                <mesh position={[-0.07, 0, 0]}>
                  <boxGeometry args={[0.1, 0.1, 0.18]} />
                  <meshStandardMaterial
                    color="#0f172a"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
                <mesh position={[0.07, 0, 0]}>
                  <boxGeometry args={[0.1, 0.1, 0.18]} />
                  <meshStandardMaterial
                    color="#0f172a"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
              </group>
            )}

            {item.id === 'slippers' && (
              // Cyan Casual Slippers Pair (Decoy)
              <group position={[0, 0.02, 0]}>
                <mesh position={[-0.06, 0, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.18]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
                <mesh position={[0.06, 0, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.18]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
              </group>
            )}

            {item.id === 'cap' && (
              // Red Baseball Cap (Decoy)
              <group position={[0, 0.04, 0]}>
                <mesh>
                  <boxGeometry args={[0.18, 0.08, 0.18]} />
                  <meshStandardMaterial
                    color="#dc2626"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
                <mesh position={[0, -0.02, 0.1]}>
                  <boxGeometry args={[0.16, 0.02, 0.08]} />
                  <meshStandardMaterial
                    color="#dc2626"
                    transparent={isEquipped}
                    opacity={isEquipped ? 0.3 : 1.0}
                  />
                </mesh>
              </group>
            )}

            {item.id === 'sunglasses' && (
              // Dark Sunglasses (Decoy)
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.16, 0.04, 0.03]} />
                <meshStandardMaterial
                  color="#090d16"
                  metalness={0.9}
                  roughness={0.1}
                  transparent={isEquipped}
                  opacity={isEquipped ? 0.3 : 1.0}
                />
              </mesh>
            )}

            {/* Glowing Selection Disc under item */}
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.11, 24]} />
              <meshBasicMaterial
                color={
                  isHovered
                    ? '#22d3ee'
                    : isEquipped
                    ? '#10b981'
                    : item.isDecoy
                    ? '#f59e0b'
                    : '#64748b'
                }
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Interactive HTML Tag showing ONLY number (1 to 8) - hidden when modal is open */}
            {!isAnyModalOpen && (
              <Html position={[0, 0.22, 0]} center distanceFactor={6}>
                <div
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleItemDoubleClick(item.id, item.numberIndex);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all cursor-pointer select-none shadow-xl border-2 ${
                    isEquipped
                      ? 'bg-emerald-500 text-slate-950 border-emerald-200 ring-2 ring-emerald-400/60 scale-105'
                      : isHovered
                      ? 'bg-cyan-400 text-slate-950 border-white scale-125 ring-2 ring-cyan-300/80'
                      : item.isDecoy
                      ? 'bg-slate-950/90 text-amber-300 border-amber-500/80 hover:scale-110'
                      : 'bg-slate-950/90 text-cyan-300 border-cyan-500/80 hover:scale-110'
                  }`}
                  title={`หมายเลข [${item.numberIndex}] (ดับเบิ้ลคลิก 2 ครั้งเพื่อสวมใส่/ถอด)`}
                >
                  {item.numberIndex}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
