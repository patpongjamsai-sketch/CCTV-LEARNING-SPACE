'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

export const Room105NvrConfigProps: React.FC = () => {
  const smartNvr105 = useCctvTrainingStore((s: any) => s.smartNvr105);
  const activeStation105Modal = useCctvTrainingStore((s: any) => s.activeStation105Modal);
  const setActiveStation105Modal = useCctvTrainingStore((s: any) => s.setActiveStation105Modal);

  const [minimized, setMinimized] = React.useState<Record<number, boolean>>({});
  const [closed, setClosed] = React.useState<Record<number, boolean>>({});

  // When any station modal is open in Room 105, automatically hide the 3D table banners
  const isModalActive = activeStation105Modal !== null;

  return (
    <group>
      {/* ========================================================
          ROOM 105 WORKSHOP ENVIRONMENT: Floor, Back Wall, Lighting
         ======================================================== */}
      {/* Workshop Dedicated Floor (X: -12 to 12, Z: -7 to 7) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#060d17" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Workshop Back Wall (Z = -5.8) */}
      <mesh position={[0, 2.5, -5.8]} receiveShadow>
        <boxGeometry args={[24, 5.0, 0.4]} />
        <meshStandardMaterial color="#0c1322" roughness={0.8} />
      </mesh>

      {/* Workshop Back Wall Neon Sign */}
      <mesh position={[0, 4.3, -5.58]}>
        <boxGeometry args={[16, 0.5, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.6} />
      </mesh>
      <Html position={[0, 4.3, -5.54]} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="text-white font-black text-xs tracking-widest px-4 py-1 bg-slate-950/90 rounded-full border border-purple-400/50 shadow-xl whitespace-nowrap select-none">
          📹 ROOM 105: NVR/DVR CONFIGURATION, ONVIF &amp; VIDEO MANAGEMENT
        </div>
      </Html>

      {/* Workshop Overhead Spotlights */}
      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#c7d2fe" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={25} color="#e0e7ff" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#ddd6fe" distance={10} />

      {/* ========================================================
          STATION 1: โต๊ะค้นหากล้อง ONVIF & ผัง Channel Mapping (35 คะแนน)
          Location: X = -6, Z = -3
         ======================================================== */}
      <group
        position={[-6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation105Modal(1);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNvr105?.station1Completed ? '#10b981' : '#0284c7'}
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

        {/* 3D Props on Station 1: Test Cameras & ONVIF Console Laptop */}
        <group position={[-0.5, 0.98, 0.1]} rotation={[0, 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.14, -0.15]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Screen ONVIF Scanner glow */}
          <mesh position={[0, 0.14, -0.14]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.39, 0.25]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* 3D Test Cameras on Stand */}
        <group position={[0.5, 0.98, -0.1]}>
          <VirtualCctvDevice deviceId="CAMERA_DOME" position={[0, 0, 0]} />
        </group>
        <group position={[0.8, 1.48, -0.42]}>
          <VirtualCctvDevice deviceId="CAMERA_BULLET" position={[0, 0, 0]} rotation={[0, -0.5, 0]} />
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[1] && (
          <Html position={[0, minimized[1] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[1] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation105Modal(1);
                }}
                className="bg-slate-900/95 hover:bg-sky-950 border border-sky-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">🔍</span>
                <span className="font-bold text-[11px] text-sky-300">โต๊ะ 1: ONVIF</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNvr105?.station1Score || 0}/35
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
                <div className="bg-slate-900/95 hover:bg-sky-950 border border-sky-500/60 group-hover:border-sky-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔍</span>
                      <span className="font-bold text-xs text-sky-300">โต๊ะ 1: ค้นหากล้อง</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNvr105?.station1Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {smartNvr105?.station1Completed ? '✓' : 'เริ่ม'}
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
                  <div className="text-[10px] text-slate-300">
                    สแกน Profile S/G/T &amp; ผัง Channel Mapping
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    คะแนน: <strong className="text-emerald-400">{smartNvr105?.station1Score || 0}</strong>/35
                  </div>
                  <div className="text-[9px] text-sky-400 font-semibold mt-1 animate-pulse">
                    [กด E หรือคลิกเพื่อเปิด]
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-sky-500/50" />
                <div className="w-2 h-2 rounded-full bg-sky-400 shadow-lg" />
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 2: โต๊ะ NVR Video Codec, Bitrate & Multi-Split (35 คะแนน)
          Location: X = 0, Z = -3
         ======================================================== */}
      <group
        position={[0, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setClosed((p) => ({ ...p, 2: false }));
          setActiveStation105Modal(2);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNvr105?.station2Completed ? '#10b981' : '#6366f1'}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* 3D Security Console Desk */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.92, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.06, 1.3]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* 3D NVR Chassis on Desk */}
        <group position={[-0.6, 0.98, 0]}>
          <VirtualCctvDevice deviceId="NVR_8CH" position={[0, 0, 0]} />
        </group>

        {/* 3D Monitor Screen on Desk */}
        <group position={[0.4, 0.98, 0]}>
          <VirtualCctvDevice deviceId="MONITOR" position={[0, 0, 0]} rotation={[0, -0.15, 0]} />
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[2] && (
          <Html position={[0, minimized[2] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[2] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation105Modal(2);
                }}
                className="bg-slate-900/95 hover:bg-indigo-950 border border-indigo-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">⚡</span>
                <span className="font-bold text-[11px] text-indigo-300">โต๊ะ 2: Codec</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNvr105?.station2Score || 0}/35
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 2: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-indigo-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div className="bg-slate-900/95 hover:bg-indigo-950 border border-indigo-500/60 group-hover:border-indigo-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">⚡</span>
                      <span className="font-bold text-xs text-indigo-300">โต๊ะ 2: ตั้งค่า Codec</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNvr105?.station2Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {smartNvr105?.station2Completed ? '✓' : 'เริ่ม'}
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
                  <div className="text-[10px] text-slate-300">
                    บีบอัด H.264/H.265 &amp; ตรวจภาพสด 4-Split
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    คะแนน: <strong className="text-emerald-400">{smartNvr105?.station2Score || 0}</strong>/35
                  </div>
                  <div className="text-[9px] text-indigo-400 font-semibold mt-1 animate-pulse">
                    [กด E หรือคลิกเพื่อเปิด]
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-indigo-500/50" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-lg" />
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          STATION 3: โต๊ะ Motion, Privacy, Schedule & Fault Retest (30 คะแนน)
          Location: X = 6, Z = -3
         ======================================================== */}
      <group
        position={[6, 0, -3]}
        onClick={(e) => {
          e.stopPropagation();
          setClosed((p) => ({ ...p, 3: false }));
          setActiveStation105Modal(3);
        }}
      >
        {/* Glowing Safety Zone Border on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial
            color={smartNvr105?.station3Completed ? '#10b981' : '#a855f7'}
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

        {/* 3D Props on Station 3: Diagnostic Terminal & Alarm / Motion Sensor Panel */}
        <group position={[-0.4, 0.98, 0.1]} rotation={[0, -0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.14, -0.15]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Screen glow purple */}
          <mesh position={[0, 0.14, -0.14]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.39, 0.25]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </group>

        {/* Motion Sensor Beacon Indicator */}
        <group position={[0.6, 1.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.1, 0.25, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={smartNvr105?.station3Completed ? 0.3 : 0.8}
            />
          </mesh>
        </group>

        {/* 3D Interactive Floating Holographic Banner */}
        {!isModalActive && !closed[3] && (
          <Html position={[0, minimized[3] ? 1.8 : 2.2, 0]} center distanceFactor={8}>
            {minimized[3] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation105Modal(3);
                }}
                className="bg-slate-900/95 hover:bg-purple-950 border border-purple-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="text-xs">🛡️</span>
                <span className="font-bold text-[11px] text-purple-300">โต๊ะ 3: Motion &amp; Fault</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  {smartNvr105?.station3Score || 0}/30
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 3: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-purple-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div className="bg-slate-900/95 hover:bg-purple-950 border border-purple-500/60 group-hover:border-purple-400 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[200px]">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🛡️</span>
                      <span className="font-bold text-xs text-purple-300">โต๊ะ 3: Motion &amp; Schedule</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartNvr105?.station3Completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {smartNvr105?.station3Completed ? '✓' : 'เริ่ม'}
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
                  <div className="text-[10px] text-slate-300">
                    Motion Grid, 24/7 Schedule &amp; Retest ปัญหา NVR
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    คะแนน: <strong className="text-emerald-400">{smartNvr105?.station3Score || 0}</strong>/30
                  </div>
                  <div className="text-[9px] text-purple-400 font-semibold mt-1 animate-pulse">
                    [กด E หรือคลิกเพื่อเปิด]
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-purple-500/50" />
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg" />
              </div>
            )}
          </Html>
        )}
      </group>
    </group>
  );
};
