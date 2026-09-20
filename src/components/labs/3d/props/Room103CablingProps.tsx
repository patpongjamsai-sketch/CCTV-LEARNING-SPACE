'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';

const COLOR_HEX_MAP: Record<string, string> = {
  'White-Orange': '#ffedd5',
  'Orange': '#ea580c',
  'White-Green': '#dcfce7',
  'Blue': '#2563eb',
  'White-Blue': '#dbeafe',
  'Green': '#16a34a',
  'White-Brown': '#f5ebe0',
  'Brown': '#78350f',
};

export const Room103CablingProps: React.FC = () => {
  const activeStation103Modal = useCctvTrainingStore((s) => s.activeStation103Modal);
  const setActiveStation103Modal = useCctvTrainingStore((s) => s.setActiveStation103Modal);
  const smartCabling103 = useCctvTrainingStore((s) => s.smartCabling103);
  const isModalActive = activeStation103Modal !== null;

  const [minimized, setMinimized] = React.useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [closed, setClosed] = React.useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  // Animated LED wiremap tester simulation on Station 3
  const [activeLed, setActiveLed] = React.useState<number>(0);
  const timerRef = useRef<number>(0);

  useFrame((_, delta) => {
    timerRef.current += delta;
    if (timerRef.current > 0.25) {
      timerRef.current = 0;
      setActiveLed((prev) => (prev + 1) % 8);
    }
  });

  return (
    <group>
      {/* ========================================================
          ROOM 103 WORKSHOP ENVIRONMENT: Floor, Back Wall, Lighting
         ======================================================== */}
      {/* Workshop Dedicated Floor (X: -12 to 12, Z: -7 to 7) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Workshop Back Wall (Z = -5.8) */}
      <mesh position={[0, 2.5, -5.8]} receiveShadow>
        <boxGeometry args={[24, 5.0, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Workshop Back Wall Neon Sign */}
      <mesh position={[0, 4.3, -5.58]}>
        <boxGeometry args={[14, 0.5, 0.05]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, 4.3, -5.54]} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="text-white font-black text-xs tracking-widest px-4 py-1 bg-slate-950/90 rounded-full border border-blue-400/50 shadow-xl whitespace-nowrap select-none">
          🛠️ ROOM 103: CCTV CABLING, TERMINATION & POE WORKSHOP
        </div>
      </Html>

      {/* Workshop Overhead Spotlights */}
      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#e0f2fe" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={25} color="#e0f2fe" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#e0f2fe" distance={10} />

      {/* ========================================================
          STATION 1: โต๊ะเข้าหัวสาย RJ45 Cat6 & BNC Coaxial (35 คะแนน)
          Location: X = -6, Z = -3
         ======================================================== */}
      <group
        position={[-6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation103Modal(1);
        }}
      >
        {/* Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartCabling103.station1Completed ? '#10b981' : '#38bdf8'}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* 3D Heavy-Duty Technician Workbench */}
        {/* Table Frame & Legs */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Tabletop Surface (Laminate Top) */}
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

        {/* 3D Props on Table 1: Crimper, Stripper, Cable Roll & Connectors */}
        {/* Spool of Blue Cat6 UTP Cable */}
        <group position={[-0.85, 1.08, -0.2]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 16]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.23, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
        </group>

        {/* Stripped UTP Cable with 8 Color Wires Fan-Out */}
        <group position={[-0.3, 0.96, 0.1]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.45, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {Object.entries(COLOR_HEX_MAP).map(([colName, hex], idx) => (
            <mesh key={colName} position={[0.26, 0.01, (idx - 3.5) * 0.025]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
              <meshStandardMaterial color={hex} />
            </mesh>
          ))}
        </group>

        {/* Professional RJ45 Crimper Tool (Red & Black Handles) */}
        <group position={[0.35, 0.98, 0.1]} rotation={[0, 0.4, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.04, 0.24]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.015, -0.09]}>
            <boxGeometry args={[0.07, 0.05, 0.08]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Box of RJ45 Cat6 Plugs */}
        <group position={[0.75, 0.98, -0.2]}>
          <mesh>
            <boxGeometry args={[0.2, 0.08, 0.2]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.6} transparent roughness={0.2} />
          </mesh>
        </group>

        {/* BNC Compression Tool & RG6 Cable on Upper Shelf */}
        <group position={[-0.4, 1.5, -0.45]}>
          <mesh>
            <boxGeometry args={[0.06, 0.04, 0.2]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
        </group>

        {/* Floating 3D Overhead Station Sign */}
        {!isModalActive && !closed[1] && (
          <Html position={[0, minimized[1] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[1] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation103Modal(1);
                }}
                className="bg-slate-900/95 hover:bg-sky-950 border border-sky-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">⚡</span>
                <span className="font-bold text-[11px] text-sky-300">โต๊ะ 1: เข้าหัวสาย</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartCabling103.station1Completed ? '35/35' : `${smartCabling103.station1Score}/35`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 1: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-sky-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div
                  onClick={() => setActiveStation103Modal(1)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartCabling103.station1Completed
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-sky-400 text-sky-100 shadow-sky-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">⚡</span>
                      <span className="font-bold text-xs text-sky-300">โต๊ะที่ 1: เข้าหัวสาย</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartCabling103.station1Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {smartCabling103.station1Completed ? 'ผ่านแล้ว' : '35 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 1: true }));
                        }}
                        title="ย่อป้าย"
                        className="text-[10px] text-slate-400 hover:text-white font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-sky-900 rounded cursor-pointer"
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
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-950 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {smartCabling103.station1Completed ? '✓ เข้าหัวสาย T568B & BNC แล้ว' : 'เข้าหัวสาย RJ45 Cat6 & BNC Coaxial'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>คะแนน: <strong className="text-emerald-400">{smartCabling103.station1Score}/35</strong></span>
                    <span className="text-sky-400 font-mono">[กด E หรือคลิก]</span>
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 2: โต๊ะเลือกสายสัญญาณ 5 จุดติดตั้ง (35 คะแนน)
          Location: X = 0, Z = -3
         ======================================================== */}
      <group
        position={[0, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation103Modal(2);
        }}
      >
        {/* Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartCabling103.station2Completed ? '#10b981' : '#a855f7'}
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
        {/* Cable Display Backboard */}
        <mesh position={[0, 1.5, -0.55]} castShadow>
          <boxGeometry args={[2.5, 1.1, 0.08]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>

        {/* 3D Props on Table 2: 5 Cable Route Samples */}
        {/* IP66 Junction Box with Waterproof Cable Gland */}
        <group position={[-0.7, 1.0, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.16, 0.24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[-0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
        </group>

        {/* Single-Mode Fiber Optic Yellow Patch Cord Reel */}
        <group position={[-0.1, 1.0, -0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.03, 12, 24]} />
            <meshStandardMaterial color="#facc15" roughness={0.3} />
          </mesh>
        </group>

        {/* Shielded STP/FTP Cable with Metallic Drain Wire */}
        <group position={[0.5, 0.98, 0.1]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Outdoor UTP with Steel Messenger Wire on Display Board */}
        <group position={[0, 1.6, -0.5]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 1.8, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* Floating 3D Overhead Station Sign */}
        {!isModalActive && !closed[2] && (
          <Html position={[0, minimized[2] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[2] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation103Modal(2);
                }}
                className="bg-slate-900/95 hover:bg-purple-950 border border-purple-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">🌐</span>
                <span className="font-bold text-[11px] text-purple-300">โต๊ะ 2: เลือกสาย</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartCabling103.station2Completed ? '35/35' : `${smartCabling103.station2Score}/35`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 2: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-purple-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div
                  onClick={() => setActiveStation103Modal(2)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartCabling103.station2Completed
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-purple-400 text-purple-100 shadow-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🌐</span>
                      <span className="font-bold text-xs text-purple-300">โต๊ะที่ 2: เลือกสายสัญญาณ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartCabling103.station2Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {smartCabling103.station2Completed ? 'ผ่านแล้ว' : '35 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 2: true }));
                        }}
                        title="ย่อป้าย"
                        className="text-[10px] text-slate-400 hover:text-white font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-purple-900 rounded cursor-pointer"
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
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-950 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {smartCabling103.station2Completed ? '✓ เลือกสาย 5 จุดติดตั้งแล้ว' : 'วิเคราะห์เส้นทาง 5 จุดติดตั้งกล้อง'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>คะแนน: <strong className="text-emerald-400">{smartCabling103.station2Score}/35</strong></span>
                    <span className="text-purple-400 font-mono">[กด E หรือคลิก]</span>
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 3: โต๊ะตรวจสอบสาย & คำนวณ PoE Power Budget (30 คะแนน)
          Location: X = 6, Z = -3
         ======================================================== */}
      <group
        position={[6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation103Modal(3);
        }}
      >
        {/* Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartCabling103.station3Completed ? '#10b981' : '#f59e0b'}
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

        {/* 3D Props on Table 3: Animated Wiremap Tester, Multimeter & PoE Switch Rack */}
        {/* 8-Pin LED Master Cable Tester (Animated Blinking LED lights) */}
        <group position={[-0.75, 1.05, 0.1]}>
          <mesh>
            <boxGeometry args={[0.22, 0.12, 0.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {/* 8 LEDs on Tester */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const isLit = activeLed === i;
            return (
              <mesh key={i} position={[0.04, 0.07, -0.14 + i * 0.04]}>
                <sphereGeometry args={[0.012, 12, 12]} />
                <meshStandardMaterial
                  color={isLit ? '#10b981' : '#334155'}
                  emissive={isLit ? '#10b981' : '#000000'}
                  emissiveIntensity={isLit ? 1.5 : 0}
                />
              </mesh>
            );
          })}
        </group>

        {/* Digital Multimeter (Yellow Case & Red/Black Probes) */}
        <group position={[-0.15, 1.0, 0.15]} rotation={[-0.1, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.18, 0.06, 0.28]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.035, -0.06]}>
            <boxGeometry args={[0.12, 0.01, 0.08]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* 8-Port PoE Switch with Power Budget LED Display */}
        <group position={[0.65, 1.02, -0.1]}>
          <mesh>
            <boxGeometry args={[0.6, 0.1, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* PoE Watt Meter Bar */}
          <mesh position={[-0.08, 0.055, 0.15]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.2, 0.055, 0.15]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>

        {/* Diagnostic Laptop Screen */}
        <group position={[0.05, 1.05, -0.3]} rotation={[0, -0.1, 0]}>
          {/* Laptop Base */}
          <mesh>
            <boxGeometry args={[0.36, 0.02, 0.26]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Laptop Screen Open at Angle */}
          <group position={[0, 0.12, -0.12]} rotation={[-0.25, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.36, 0.24, 0.015]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.33, 0.21]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
          </group>
        </group>

        {/* Floating 3D Overhead Station Sign */}
        {!isModalActive && !closed[3] && (
          <Html position={[0, minimized[3] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[3] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation103Modal(3);
                }}
                className="bg-slate-900/95 hover:bg-amber-950 border border-amber-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">📊</span>
                <span className="font-bold text-[11px] text-amber-300">โต๊ะ 3: PoE Budget</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartCabling103.station3Completed ? '30/30' : `${smartCabling103.station3Score}/30`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 3: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-amber-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div
                  onClick={() => setActiveStation103Modal(3)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartCabling103.station3Completed
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-amber-400 text-amber-100 shadow-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📊</span>
                      <span className="font-bold text-xs text-amber-300">โต๊ะที่ 3: ตรวจสอบสาย & PoE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartCabling103.station3Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {smartCabling103.station3Completed ? 'ผ่านแล้ว' : '30 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 3: true }));
                        }}
                        title="ย่อป้าย"
                        className="text-[10px] text-slate-400 hover:text-white font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-amber-900 rounded cursor-pointer"
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
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-950 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {smartCabling103.station3Completed ? '✓ ตรวจสอบสายและ PoE แล้ว' : 'ตรวจ Wiremap & คำนวณ PoE Budget'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>คะแนน: <strong className="text-emerald-400">{smartCabling103.station3Score}/30</strong></span>
                    <span className="text-amber-400 font-mono">[กด E หรือคลิก]</span>
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
