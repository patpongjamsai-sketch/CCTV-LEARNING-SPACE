'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../store/useCctvTrainingStore';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export interface Room101SmartMartSceneProps {
  isRoom102Unlocked?: boolean;
  onEnterRoom102?: () => void;
}

// ประตูพอร์ทัลเชื่อมต่อสู่ Room 102 (อยู่ที่ผนังตะวันออก X = 10.8, Z = 0)
const Room102ExitPortal: React.FC<{ isUnlocked: boolean; onEnter?: () => void }> = ({
  isUnlocked,
  onEnter,
}) => {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const targetZLeft = isUnlocked ? -1.8 : -0.9;
    const targetZRight = isUnlocked ? 1.8 : 0.9;

    if (leftDoorRef.current) {
      leftDoorRef.current.position.z = THREE.MathUtils.damp(
        leftDoorRef.current.position.z,
        targetZLeft,
        4,
        delta
      );
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.z = THREE.MathUtils.damp(
        rightDoorRef.current.position.z,
        targetZRight,
        4,
        delta
      );
    }
  });

  return (
    <group position={[10.7, 0, 0]}>
      {/* คานโครงสร้างประตูพอร์ทัล */}
      <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.2, 3.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* รางเลื่อนประตูอลูมิเนียม */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.4, 0.12, 3.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ไฟสถานะ LED บาร์เหนือประตู */}
      <mesh position={[-0.26, 3.75, 0]}>
        <boxGeometry args={[0.04, 0.4, 2.8]} />
        <meshStandardMaterial
          color={isUnlocked ? '#10b981' : '#ef4444'}
          emissive={isUnlocked ? '#10b981' : '#ef4444'}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* ป้าย HTML 3D แสดงสถานะประตูและปุ่มกดข้ามห้อง */}
      <Html
        position={[-0.35, 2.6, 0]}
        center
        transform
        distanceFactor={6}
        zIndexRange={[10, 0]}
      >
        {isUnlocked ? (
          <button
            type="button"
            onClick={onEnter}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-400 bg-emerald-950/95 hover:bg-emerald-900 text-emerald-200 font-bold text-xs shadow-2xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-transform hover:scale-105 select-none"
          >
            <span>🟢</span>
            <span>[E] เข้าสู่ ROOM 102: SMART SCHOOL LAB ➜</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl border border-rose-500/80 bg-rose-950/95 text-rose-200 font-bold text-xs shadow-2xl flex items-center gap-2 whitespace-nowrap select-none">
            <span>🔒</span>
            <span>ROOM 102: ต้องผ่านภารกิจ Room 101 ก่อน (คะแนน &gt;= 80)</span>
          </div>
        )}
      </Html>

      {/* บานประตูเลื่อนกระจกซ้าย */}
      <group ref={leftDoorRef} position={[0, 1.5, -0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 3.0, 1.6]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.01, 0, 0]}>
          <boxGeometry args={[0.05, 2.6, 1.4]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.65}
            opacity={0.4}
            transparent
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* บานประตูเลื่อนกระจกขวา */}
      <group ref={rightDoorRef} position={[0, 1.5, 0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 3.0, 1.6]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.01, 0, 0]}>
          <boxGeometry args={[0.05, 2.6, 1.4]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.65}
            opacity={0.4}
            transparent
            roughness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
};

export const Room101SmartMartScene: React.FC<Room101SmartMartSceneProps> = ({
  isRoom102Unlocked = false,
  onEnterRoom102,
}) => {
  const setActiveStation101Modal = useCctvTrainingStore((s) => s.setActiveStation101Modal);
  const activeStation101Modal = useCctvTrainingStore((s) => s.activeStation101Modal);
  const missions = useRoleplayStore((s) => s.missions);
  const isStarted = useRoleplayStore((s) => s.isStarted);
  const isModalActive = activeStation101Modal !== null;

  let activeTargetStation: 1 | 2 | 3 | 4 | 5 = 1;
  if (!missions.M1.isCompleted) activeTargetStation = 1;
  else if (!missions.M2.isCompleted) activeTargetStation = 2;
  else if (!missions.M3.isCompleted) activeTargetStation = 3;
  else if (!missions.M4.isCompleted) activeTargetStation = 4;
  else if (!missions.M5.isCompleted) activeTargetStation = 5;

  return (
    <group dispose={null}>
      {/* ========================================================
          1. โครงสร้างห้องเดี่ยว Room 101 (22 x 26 เมตร, ศูนย์กลางที่ 0,0)
         ======================================================== */}
      {/* เพดานห้อง */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ผนังทิศเหนือ (Z = -13) */}
      <mesh position={[0, 2.5, -13]} receiveShadow>
        <boxGeometry args={[22, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* แถบไฟวิ่งสถาปัตยกรรมทิศเหนือ */}
      <mesh position={[0, 4.3, -12.78]}>
        <boxGeometry args={[22, 0.35, 0.05]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.4} />
      </mesh>
      {/* ป้ายชื่อห้องหลัก Room 101 */}
      <mesh position={[0, 4.4, -12.7]}>
        <boxGeometry args={[8, 0.6, 0.1]} />
        <meshStandardMaterial color="#0369a1" />
      </mesh>
      <Html position={[0, 4.4, -12.6]} center transform distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div className="text-white font-bold text-sm tracking-wider px-3.5 py-1 bg-sky-950/90 rounded border border-sky-400 select-none shadow-xl">
          ROOM 101: IP CCTV FUNDAMENTALS LAB
        </div>
      </Html>

      {/* ผนังทิศใต้ (Z = +13 พร้อมประตูกระจกทางเข้าด้านหน้า) */}
      <mesh position={[-6.5, 2.5, 13]} receiveShadow>
        <boxGeometry args={[9, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[6.5, 2.5, 13]} receiveShadow>
        <boxGeometry args={[9, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.0, 13]}>
        <boxGeometry args={[4, 4, 0.1]} />
        <meshPhysicalMaterial color="#38bdf8" transmission={0.7} opacity={0.5} transparent roughness={0.1} />
      </mesh>

      {/* ผนังทิศตะวันตก (X = -11, ผนังปิดสนิท) */}
      <mesh position={[-11, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ผนังทิศตะวันออก (X = +11, มีช่องประตูพอร์ทัลข้ามไป Room 102 ที่ Z = 0) */}
      <mesh position={[11, 2.5, -7.5]} receiveShadow>
        <boxGeometry args={[0.4, 5, 11]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[11, 2.5, 7.5]} receiveShadow>
        <boxGeometry args={[0.4, 5, 11]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ประตูพอร์ทัลทางออกไป Room 102 */}
      <Room102ExitPortal isUnlocked={isRoom102Unlocked} onEnter={onEnterRoom102} />

      {/* พื้นกระเบื้อง Room 101 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 26]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.05} />
      </mesh>
      <gridHelper args={[22, 22, 0x008080, 0xcfd8dc]} position={[0, 0.01, 0]} />

      {/* ========================================================
          2. อุปกรณ์ภายในร้านสะดวกซื้อ Smart Mart (พิกัดกึ่งกลาง 0,0)
         ======================================================== */}
      {/* เคาน์เตอร์สรุปงาน / จุดรับภารกิจ (Zone A ที่ X = 0, Z = -1) */}
      <group position={[0, 0, -1]}>
        <mesh position={[0, 0.55, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.1, 0.8]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.12, -0.6]}>
          <boxGeometry args={[3.4, 0.05, 0.9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Point of Sale Monitor */}
        <mesh position={[0.8, 1.45, -0.6]}>
          <boxGeometry args={[0.5, 0.4, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Standing NPC ผู้จัดการ */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* ชั้นวางสินค้ากลางร้าน */}
      <group position={[-2.2, 0, -5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.2, 4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      </group>
      <group position={[2.2, 0, -5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.2, 4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      </group>

      {/* ห้องอุปกรณ์เครือข่าย (Network Room) ที่มุมตะวันออกเฉียงเหนือ (Zone C อยู่ข้างในที่ X = 6, Z = -8) */}
      <group>
        {/* ผนังกั้นฝั่งตะวันตกของห้อง Network */}
        <mesh position={[3.8, 1.4, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* ผนังหน้า (ซ้ายของประตู) */}
        <mesh position={[4.55, 1.4, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* ผนังหน้า (ขวาของประตู) */}
        <mesh position={[8.6, 1.4, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* คานเหนือประตู */}
        <mesh position={[6, 2.5, -4.5]}>
          <boxGeometry args={[1.4, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* กระจกสังเกตการณ์ */}
        <mesh position={[8.55, 1.4, -4.32]}>
          <boxGeometry args={[2.6, 1.6, 0.04]} />
          <meshPhysicalMaterial color="#7dd3fc" transmission={0.75} opacity={0.4} transparent roughness={0.08} />
        </mesh>
      </group>

      {/* ห้องบันทึกภาพ NVR (CCTV Server Room) ที่มุมตะวันตกเฉียงใต้ (Zone D อยู่ข้างในที่ X = -6, Z = 4) */}
      <group>
        {/* ผนังกั้นฝั่งตะวันออกของห้อง Server */}
        <mesh position={[-3.8, 1.4, 4]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.8, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* ผนังหน้า (ซ้ายของประตู) */}
        <mesh position={[-8.6, 1.4, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* ผนังหน้า (ขวาของประตู) */}
        <mesh position={[-4.55, 1.4, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* คานเหนือประตู */}
        <mesh position={[-6, 2.5, 1.5]}>
          <boxGeometry args={[1.4, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* กระจกสังเกตการณ์ */}
        <mesh position={[-8.55, 1.4, 1.68]}>
          <boxGeometry args={[2.6, 1.6, 0.04]} />
          <meshPhysicalMaterial color="#fde68a" transmission={0.72} opacity={0.4} transparent roughness={0.1} />
        </mesh>
      </group>

      {/* 2.2 สถานีทดสอบกล้อง IP (Zone B ที่ X = -6, Z = -8) -> ภารกิจ 1 */}
      <group
        position={[-6, 0, -8]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation101Modal(1);
        }}
      >
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Waypoint Beacon Beam for Station 1 */}
        {activeTargetStation === 1 && !missions.M1.isCompleted && (
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.04, 0.35, 2.2, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
          </mesh>
        )}

        {isStarted && !isModalActive && (
          <Html position={[0, 1.6, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStation101Modal(1);
              }}
              className={`bg-slate-900/95 hover:bg-sky-950 border border-sky-400 py-1 px-2.5 rounded-full shadow-2xl backdrop-blur text-center flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none hover:scale-105 transition-transform ${
                activeTargetStation === 1 && !missions.M1.isCompleted
                  ? 'ring-2 ring-sky-400 animate-pulse scale-110 shadow-sky-500/50'
                  : ''
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {missions.M1.isCompleted ? '✓' : '1'}
              </span>
              <span className="font-bold text-[11px] text-sky-200">
                {activeTargetStation === 1 && !missions.M1.isCompleted
                  ? '👉 โต๊ะ 1: ภาพดิจิทัล [คลิกเพื่อเริ่ม]'
                  : 'โต๊ะ 1: ภาพดิจิทัล'}
              </span>
            </button>
          </Html>
        )}
      </group>

      {/* 2.3 ตู้แร็คเครือข่าย PoE (Zone C ที่ X = 6, Z = -8) -> ภารกิจ 2 */}
      <group
        position={[6, 0, -8]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation101Modal(2);
        }}
      >
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 2.0, 0.8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Waypoint Beacon Beam for Station 2 */}
        {activeTargetStation === 2 && !missions.M2.isCompleted && (
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.04, 0.35, 2.2, 16]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
          </mesh>
        )}

        {isStarted && !isModalActive && (
          <Html position={[0, 2.3, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStation101Modal(2);
              }}
              className={`bg-slate-900/95 hover:bg-emerald-950 border border-emerald-400 py-1 px-2.5 rounded-full shadow-2xl backdrop-blur text-center flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none hover:scale-105 transition-transform ${
                activeTargetStation === 2 && !missions.M2.isCompleted
                  ? 'ring-2 ring-emerald-400 animate-pulse scale-110 shadow-emerald-500/50'
                  : ''
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {missions.M2.isCompleted ? '✓' : '2'}
              </span>
              <span className="font-bold text-[11px] text-emerald-200">
                {activeTargetStation === 2 && !missions.M2.isCompleted
                  ? '👉 โต๊ะ 2: Data Flow [คลิกเพื่อเริ่ม]'
                  : 'โต๊ะ 2: Data Flow'}
              </span>
            </button>
          </Html>
        )}
      </group>

      {/* 2.4 เครื่องบันทึกภาพ NVR (Zone D ที่ X = -6, Z = 4) -> ภารกิจ 3 */}
      <group
        position={[-6, 0, 4]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation101Modal(3);
        }}
      >
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Waypoint Beacon Beam for Station 3 */}
        {activeTargetStation === 3 && !missions.M3.isCompleted && (
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.04, 0.35, 2.2, 16]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
          </mesh>
        )}

        {isStarted && !isModalActive && (
          <Html position={[0, 1.6, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStation101Modal(3);
              }}
              className={`bg-slate-900/95 hover:bg-amber-950 border border-amber-400 py-1 px-2.5 rounded-full shadow-2xl backdrop-blur text-center flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none hover:scale-105 transition-transform ${
                activeTargetStation === 3 && !missions.M3.isCompleted
                  ? 'ring-2 ring-amber-400 animate-pulse scale-110 shadow-amber-500/50'
                  : ''
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {missions.M3.isCompleted ? '✓' : '3'}
              </span>
              <span className="font-bold text-[11px] text-amber-200">
                {activeTargetStation === 3 && !missions.M3.isCompleted
                  ? '👉 โต๊ะ 3: หน้าที่อุปกรณ์ [คลิกเพื่อเริ่ม]'
                  : 'โต๊ะ 3: หน้าที่อุปกรณ์'}
              </span>
            </button>
          </Html>
        )}
      </group>

      {/* 2.5 โต๊ะเปรียบเทียบระบบ Analog vs IP (Zone F ที่ X = 0, Z = 9) -> ภารกิจ 4 */}
      <group
        position={[0, 0, 9]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation101Modal(4);
        }}
      >
        <mesh position={[-2.4, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshStandardMaterial color="#78716c" roughness={0.6} />
        </mesh>
        <mesh position={[2.4, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>

        {/* Waypoint Beacon Beam for Station 4 */}
        {activeTargetStation === 4 && !missions.M4.isCompleted && (
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.04, 0.35, 2.2, 16]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
          </mesh>
        )}

        {isStarted && !isModalActive && (
          <Html position={[0, 1.6, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStation101Modal(4);
              }}
              className={`bg-slate-900/95 hover:bg-purple-950 border border-purple-400 py-1 px-2.5 rounded-full shadow-2xl backdrop-blur text-center flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none hover:scale-105 transition-transform ${
                activeTargetStation === 4 && !missions.M4.isCompleted
                  ? 'ring-2 ring-purple-400 animate-pulse scale-110 shadow-purple-500/50'
                  : ''
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {missions.M4.isCompleted ? '✓' : '4'}
              </span>
              <span className="font-bold text-[11px] text-purple-200">
                {activeTargetStation === 4 && !missions.M4.isCompleted
                  ? '👉 โต๊ะ 4: Analog vs IP [คลิกเพื่อเริ่ม]'
                  : 'โต๊ะ 4: Analog vs IP'}
              </span>
            </button>
          </Html>
        )}
      </group>

      {/* 2.6 โต๊ะคอมพิวเตอร์ควบคุม Client PC (Zone E ที่ X = 6, Z = 4) -> ภารกิจ 5 */}
      <group
        position={[6, 0, 4]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation101Modal(5);
        }}
      >
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.9, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.6, 0.45, 0.04]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>

        {/* Waypoint Beacon Beam for Station 5 */}
        {activeTargetStation === 5 && !missions.M5.isCompleted && (
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.04, 0.35, 2.2, 16]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
          </mesh>
        )}

        {isStarted && !isModalActive && (
          <Html position={[0, 1.8, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStation101Modal(5);
              }}
              className={`bg-slate-900/95 hover:bg-sky-950 border border-sky-400 py-1 px-2.5 rounded-full shadow-2xl backdrop-blur text-center flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none hover:scale-105 transition-transform ${
                activeTargetStation === 5 && !missions.M5.isCompleted
                  ? 'ring-2 ring-emerald-400 animate-pulse scale-110 shadow-emerald-500/50'
                  : ''
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {missions.M5.isCompleted ? '✓' : '5'}
              </span>
              <span className="font-bold text-[11px] text-sky-200">
                {activeTargetStation === 5 && !missions.M5.isCompleted
                  ? '👉 โต๊ะ 5: ต่อสาย & Live View [คลิกเพื่อเริ่ม]'
                  : 'โต๊ะ 5: ต่อสาย & Live View'}
              </span>
            </button>
          </Html>
        )}
      </group>

      {/* ========================================================
          3. ระบบแสงสว่างเฉพาะ Room 101 (ประหยัด GPU และ Draw Calls)
         ======================================================== */}
      {[-7, 0, 7].map((x) =>
        [-7, 0, 7].map((z) => (
          <mesh key={`r101_light_${x}_${z}`} position={[x, 4.95, z]}>
            <boxGeometry args={[1.6, 0.08, 1.6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
          </mesh>
        ))
      )}

      {/* จุดกำเนิดแสง Point Lights สองจุดเพื่อความนุ่มนวล */}
      <pointLight position={[-4, 4.5, 0]} distance={18} intensity={1.5} color="#fffcf5" />
      <pointLight position={[4, 4.5, 0]} distance={18} intensity={1.5} color="#fffcf5" />

      {/* แสงสว่างทั่วไป */}
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[6, 14, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 12, -6]} intensity={0.5} color="#e0f2fe" />
    </group>
  );
};
