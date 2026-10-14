'use client';

import React, { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useDomeLabStore } from '../store/useDomeLabStore';
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
  position = [-2.4, 0, 1.8],
}) => {
  const ppeEquipped = useDomeLabStore((s) => s.ppeEquipped);
  const togglePPE = useDomeLabStore((s) => s.togglePPE);
  const isNearPpeTable = useDomeLabStore((s) => s.isNearPpeTable);
  const distanceToPpeTable = useDomeLabStore((s) => s.distanceToPpeTable);
  const isPpeModalOpen = useDomeLabStore((s) => s.isPpeModalOpen);
  const isMission4ModalOpen = useDomeLabStore((s) => s.isMission4ModalOpen);
  const setIsPpeModalOpen = useDomeLabStore((s) => s.setIsPpeModalOpen);

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

      {/* Tabletop Safety Cyan Border Trim */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.72, 0.04, 0.92]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
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
        <mesh position={[-0.75, -0.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.4, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0.75, -0.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.4, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Header Board */}
        <mesh>
          <boxGeometry args={[1.7, 0.36, 0.04]} />
          <meshStandardMaterial color="#0284c7" metalness={0.2} roughness={0.3} />
        </mesh>
      </group>

      {/* 3. INTERACTIVE 3D PROPS ON TABLE */}
      {TABLE_ITEMS.map((item) => {
        const isEquipped = ppeEquipped[item.id];
        const isHovered = hoveredItem === item.id;
        const [ix, iy, iz] = item.offset;

        return (
          <group
            key={item.id}
            position={[ix, iy, iz]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredItem(item.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredItem(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleItemDoubleClick(item.id, item.numberIndex);
            }}
          >
            {/* Number Tag Disc */}
            <mesh position={[0, -0.03, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.01, 16]} />
              <meshStandardMaterial
                color={isEquipped ? '#10b981' : item.isDecoy ? '#ef4444' : '#0284c7'}
                roughness={0.3}
              />
            </mesh>

            {/* Representative 3D geometry */}
            {item.id === 'helmet' && (
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#eab308" roughness={0.3} />
              </mesh>
            )}
            {item.id === 'glasses' && (
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.03]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
              </mesh>
            )}
            {item.id === 'mask' && (
              <mesh position={[0, 0.03, 0]}>
                <coneGeometry args={[0.06, 0.05, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
              </mesh>
            )}
            {item.id === 'gloves' && (
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.1, 0.03, 0.12]} />
                <meshStandardMaterial color="#16a34a" roughness={0.5} />
              </mesh>
            )}
            {item.id === 'shoes' && (
              <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[0.1, 0.07, 0.14]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} />
              </mesh>
            )}
            {item.id === 'slippers' && (
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.1, 0.02, 0.14]} />
                <meshStandardMaterial color="#06b6d4" roughness={0.4} />
              </mesh>
            )}
            {item.id === 'cap' && (
              <mesh position={[0, 0.04, 0]}>
                <sphereGeometry args={[0.07, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#dc2626" roughness={0.7} />
              </mesh>
            )}
            {item.id === 'sunglasses' && (
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.12, 0.03, 0.03]} />
                <meshStandardMaterial color="#09090b" roughness={0.1} />
              </mesh>
            )}

            {/* Hover Tooltip */}
            {isHovered && !isAnyModalOpen && (
              <Html position={[0, 0.15, 0]} center transform distanceFactor={5}>
                <div className="bg-slate-900/95 border border-sky-400 text-sky-200 text-[11px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  #{item.numberIndex} {item.nameTh} {isEquipped ? '(✓ สวมใส่แล้ว)' : '(คลิกเพื่อสวมใส่)'}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Proximity Interaction Ring and Notification */}
      {isNearPpeTable && !isAnyModalOpen && (
        <>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.35, 32]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>

          <Html position={[0, 1.4, 0]} center transform distanceFactor={5.5}>
            <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setIsPpeModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-sky-300 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer"
              >
                <span>🛡️</span>
                <span>กด E หรือคลิกเพื่อเปิดตู้ PPE</span>
              </button>
              {doubleClickNotice && (
                <div className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] px-2.5 py-1 rounded-md shadow whitespace-nowrap">
                  {doubleClickNotice}
                </div>
              )}
            </div>
          </Html>
        </>
      )}
    </group>
  );
};
