'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

export const Room104NetworkingProps: React.FC = () => {
  const room104 = useCctvTrainingStore((s) => s.room104);
  const smartNetwork104 = useCctvTrainingStore((s) => s.smartNetwork104);
  const activeStation104Modal = useCctvTrainingStore((s) => s.activeStation104Modal);
  const setActiveStation104Modal = useCctvTrainingStore((s) => s.setActiveStation104Modal);

  const [minimized, setMinimized] = React.useState<Record<number, boolean>>({});
  const [closed, setClosed] = React.useState<Record<number, boolean>>({});

  // When any station modal is open in Room 104, automatically hide the 3D table banners
  const isModalActive = activeStation104Modal !== null;

  const isSafeLoad = room104.poeBudgetTotalWatts <= 50;
  const isOverload = room104.poeBudgetTotalWatts > room104.poeMaxRatingWatts;
  const meterPercent = Math.min(100, Math.round((room104.poeBudgetTotalWatts / room104.poeMaxRatingWatts) * 100));

  // Animated LED activity indicator on diagnostic equipment
  const [ledPhase, setLedPhase] = React.useState<number>(0);
  const timerRef = useRef<number>(0);

  useFrame((_, delta) => {
    timerRef.current += delta;
    if (timerRef.current > 0.2) {
      timerRef.current = 0;
      setLedPhase((prev) => (prev + 1) % 6);
    }
  });

  return (
    <group>
      {/* ========================================================
          ROOM 104 WORKSHOP ENVIRONMENT: Floor, Back Wall, Lighting
         ======================================================== */}
      {/* Workshop Dedicated Floor (X: -12 to 12, Z: -7 to 7) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#08101e" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Workshop Back Wall (Z = -5.8) */}
      <mesh position={[0, 2.5, -5.8]} receiveShadow>
        <boxGeometry args={[24, 5.0, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Workshop Back Wall Neon Sign */}
      <mesh position={[0, 4.3, -5.58]}>
        <boxGeometry args={[15, 0.5, 0.05]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, 4.3, -5.54]} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="text-white font-black text-xs tracking-widest px-4 py-1 bg-slate-950/90 rounded-full border border-cyan-400/50 shadow-xl whitespace-nowrap select-none">
          🌐 ROOM 104: CCTV IP NETWORK, POE & TROUBLESHOOTING WORKSHOP
        </div>
      </Html>

      {/* Workshop Overhead Spotlights */}
      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#cffafe" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={25} color="#e0f2fe" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#dcfce7" distance={10} />

      {/* ========================================================
          STATION 1: โต๊ะวางแผน IP Address Table & Subnet (35 คะแนน)
          Location: X = -6, Z = -3
         ======================================================== */}
      <group
        position={[-6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation104Modal(1);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNetwork104.station1Completed ? '#10b981' : '#06b6d4'}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* 3D Technician Workbench */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.92, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.06, 1.3]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Upper Shelf */}
        <mesh position={[0, 1.45, -0.45]} castShadow>
          <boxGeometry args={[2.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[-1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* 3D Props: IP Planning Tablet / Laptop & Subnet Charts */}
        <group position={[-0.4, 0.98, 0.1]} rotation={[0, 0.1, 0]}>
          {/* Laptop Base */}
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Laptop Screen Open */}
          <mesh position={[0, 0.14, -0.15]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Glowing IP Matrix Screen */}
          <mesh position={[0, 0.14, -0.14]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.39, 0.25]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* 3D Subnet CIDR Reference Board on Shelf */}
        <group position={[0.5, 1.55, -0.42]}>
          <mesh>
            <boxGeometry args={[0.7, 0.3, 0.03]} />
            <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.66, 0.26]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[1] && (
          <Html position={[0, minimized[1] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[1] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation104Modal(1);
                }}
                className="bg-slate-900/95 hover:bg-cyan-950 border border-cyan-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">📋</span>
                <span className="font-bold text-[11px] text-cyan-300">โต๊ะ 1: IP Plan</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNetwork104.station1Completed ? '35/35' : `${smartNetwork104.station1Score}/35`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 1: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-cyan-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div className="bg-slate-900/95 hover:bg-cyan-950 border border-cyan-500/60 group-hover:border-cyan-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📋</span>
                      <span className="font-bold text-xs text-cyan-300">โต๊ะ 1: วางแผน IP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNetwork104.station1Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {smartNetwork104.station1Completed ? 'ผ่านแล้ว' : '35 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 1: true }));
                        }}
                        title="ย่อป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        —
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClosed((p) => ({ ...p, 1: true }));
                        }}
                        title="ปิดป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-200 flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300">ตาราง IP 8 อุปกรณ์ & ตรวจสอบ IP ชนกัน</p>
                  <div className="mt-1.5 text-[9px] font-bold text-cyan-400 bg-cyan-950/60 py-0.5 px-2 rounded-lg border border-cyan-500/30">
                    [คลิกโต๊ะ หรือกด E เพื่อเปิด]
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 2: โต๊ะตั้งค่าอุปกรณ์เครือข่าย & PoE Budget (35 คะแนน)
          Location: X = 0, Z = -3
         ======================================================== */}
      <group
        position={[0, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation104Modal(2);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNetwork104.station2Completed ? '#10b981' : isOverload ? '#ef4444' : '#f59e0b'}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* 3D Heavy-Duty Technician Workbench */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.92, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.06, 1.3]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Upper Tool Shelf */}
        <mesh position={[0, 1.45, -0.45]} castShadow>
          <boxGeometry args={[2.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[-1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* 19" Mini Server Rack Frame on Tabletop */}
        <group position={[-0.45, 1.3, -0.1]}>
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.78, 0.6, 0.52]} />
            <meshStandardMaterial color="#020617" roughness={0.8} />
          </mesh>

          {/* 3D PoE Switch Unit mounted inside Rack */}
          <group position={[0, 0.08, 0.22]}>
            <VirtualCctvDevice deviceId="POE_SWITCH_8P" position={[0, 0, 0]} />

            {/* Dynamic 3D LED Power Meter Bar on Switch Face */}
            <mesh position={[0, 0.08, 0.12]}>
              <boxGeometry args={[0.35, 0.025, 0.02]} />
              <meshBasicMaterial
                color={isOverload ? '#ef4444' : isSafeLoad ? '#10b981' : '#f59e0b'}
              />
            </mesh>
          </group>
        </group>

        {/* Watt Power Display Meter on Table */}
        <group position={[0.55, 1.05, 0.1]}>
          <mesh>
            <boxGeometry args={[0.3, 0.2, 0.15]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} />
          </mesh>
          {/* Meter Screen */}
          <mesh position={[0, 0.02, 0.078]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[0.24, 0.12]} />
            <meshBasicMaterial color={isOverload ? '#450a0a' : '#022c22'} />
          </mesh>
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[2] && (
          <Html position={[0, minimized[2] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[2] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation104Modal(2);
                }}
                className="bg-slate-900/95 hover:bg-amber-950 border border-amber-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">⚡</span>
                <span className="font-bold text-[11px] text-amber-300">โต๊ะ 2: PoE Config</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNetwork104.station2Completed ? '35/35' : `${smartNetwork104.station2Score}/35`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 2: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-amber-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div className="bg-slate-900/95 hover:bg-amber-950 border border-amber-500/60 group-hover:border-amber-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">⚡</span>
                      <span className="font-bold text-xs text-amber-300">โต๊ะ 2: ตั้งค่า PoE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNetwork104.station2Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {smartNetwork104.station2Completed ? 'ผ่านแล้ว' : '35 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 2: true }));
                        }}
                        title="ย่อป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        —
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClosed((p) => ({ ...p, 2: true }));
                        }}
                        title="ปิดป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-200 flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    PoE: {room104.poeBudgetTotalWatts}W / {room104.poeMaxRatingWatts}W ({meterPercent}%)
                  </p>
                  <div className="mt-1.5 text-[9px] font-bold text-amber-400 bg-amber-950/60 py-0.5 px-2 rounded-lg border border-amber-500/30">
                    [คลิกโต๊ะ หรือกด E เพื่อเปิด]
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 3: โต๊ะวิเคราะห์ปัญหาเครือข่าย 10 ขั้นตอน & Ping (30 คะแนน)
          Location: X = 6, Z = -3
         ======================================================== */}
      <group
        position={[6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation104Modal(3);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNetwork104.station3Completed ? '#10b981' : '#34d399'}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* 3D Heavy-Duty Technician Workbench */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.92, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.06, 1.3]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Upper Shelf */}
        <mesh position={[0, 1.45, -0.45]} castShadow>
          <boxGeometry args={[2.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[-1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.2, 1.18, -0.45]}>
          <boxGeometry args={[0.06, 0.5, 0.3]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Diagnostic Laptop Running ICMP Ping Simulation */}
        <group position={[-0.35, 0.98, 0.1]}>
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.14, -0.15]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Black Terminal Console Screen */}
          <mesh position={[0, 0.14, -0.14]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.39, 0.25]} />
            <meshBasicMaterial color="#052e16" />
          </mesh>
        </group>

        {/* Network Packet Analyzer Unit with Flashing LEDs */}
        <group position={[0.5, 1.05, 0.0]}>
          <mesh>
            <boxGeometry args={[0.4, 0.2, 0.25]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* 6 Flashing Activity LEDs */}
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <mesh key={idx} position={[(idx - 2.5) * 0.05, 0.06, 0.13]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color={ledPhase === idx ? '#10b981' : '#064e3b'} />
            </mesh>
          ))}
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[3] && (
          <Html position={[0, minimized[3] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[3] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation104Modal(3);
                }}
                className="bg-slate-900/95 hover:bg-emerald-950 border border-emerald-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">🔍</span>
                <span className="font-bold text-[11px] text-emerald-300">โต๊ะ 3: Troubleshooting</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNetwork104.station3Completed ? '30/30' : `${smartNetwork104.station3Score}/30`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 3: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-emerald-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div className="bg-slate-900/95 hover:bg-emerald-950 border border-emerald-500/60 group-hover:border-emerald-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔍</span>
                      <span className="font-bold text-xs text-emerald-300">โต๊ะ 3: แก้ปัญหา</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNetwork104.station3Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {smartNetwork104.station3Completed ? 'ผ่านแล้ว' : '30 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 3: true }));
                        }}
                        title="ย่อป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        —
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClosed((p) => ({ ...p, 3: true }));
                        }}
                        title="ปิดป้าย"
                        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-200 flex items-center justify-center text-[9px] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300">Fault Log 5 หัวข้อ, Keyword Check & Retest</p>
                  <div className="mt-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 py-0.5 px-2 rounded-lg border border-emerald-500/30">
                    [คลิกโต๊ะ หรือกด E เพื่อเปิด]
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>
    </group>
  );
};
