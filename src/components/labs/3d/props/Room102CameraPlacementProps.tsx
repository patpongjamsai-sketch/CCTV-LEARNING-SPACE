'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useRoleplayStore } from '../../../../store/useRoleplayStore';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

export const Room102CameraPlacementProps: React.FC = () => {
  const activeStation102Modal = useCctvTrainingStore((s) => s.activeStation102Modal);
  const setActiveStation102Modal = useCctvTrainingStore((s) => s.setActiveStation102Modal);
  const smartSchool = useCctvTrainingStore((s) => s.smartSchool102);
  const isStarted = useRoleplayStore((s) => s.isStarted);
  const isModalActive = activeStation102Modal !== null;

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

  return (
    <group>
      {/* ========================================================
          3D Smart School Station 1: Outdoor & Perimeter Table
         ======================================================== */}
      <group
        position={[-6, 0, -4]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation102Modal(1);
        }}
      >
        {/* Lab Desk Model */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Floating Hologram Beacon */}
        <mesh position={[0, 1.3, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={smartSchool.station1OutdoorCompleted ? '#10b981' : '#38bdf8'}
            emissive={smartSchool.station1OutdoorCompleted ? '#10b981' : '#38bdf8'}
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>

        {/* Floor Glow Ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial
            color={smartSchool.station1OutdoorCompleted ? '#10b981' : '#38bdf8'}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* 3D Circular Marker Pin / Station Banner */}
        {isStarted && !isModalActive && !closed[1] && (
          <Html position={[0, minimized[1] ? 1.6 : 2.2, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            {minimized[1] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation102Modal(1);
                }}
                className="bg-slate-900/95 hover:bg-sky-950 border border-sky-400 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  {smartSchool.station1OutdoorCompleted ? '✓' : '1'}
                </span>
                <span className="font-bold text-[11px] text-sky-300">โต๊ะ 1: พื้นที่ภายนอก</span>
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
                  onClick={() => setActiveStation102Modal(1)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartSchool.station1OutdoorCompleted
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-sky-400 text-sky-100 shadow-sky-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🏫</span>
                      <span className="font-bold text-xs text-sky-300">โต๊ะที่ 1: ติดตั้งภายนอก</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartSchool.station1OutdoorCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {smartSchool.station1OutdoorCompleted ? 'ผ่านแล้ว' : '35 คะแนน'}
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
                    {smartSchool.station1OutdoorCompleted ? '✓ ติดตั้งกล้องภายนอก 4 ตัวแล้ว' : 'วางตำแหน่งกล้องแนวรั้ว & ทางเข้า'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>สถานะ: <strong className={smartSchool.station1OutdoorCompleted ? 'text-emerald-400' : 'text-sky-400'}>{smartSchool.station1OutdoorCompleted ? 'เสร็จสิ้น' : 'รอปฏิบัติ'}</strong></span>
                    <span className="text-sky-400 font-mono">[กด E หรือคลิก]</span>
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          3D Smart School Station 2: Indoor & Facilities Table
         ======================================================== */}
      <group
        position={[6, 0, -4]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation102Modal(2);
        }}
      >
        {/* Lab Desk Model */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Floating Hologram Beacon */}
        <mesh position={[0, 1.3, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={smartSchool.station2IndoorCompleted ? '#10b981' : '#34d399'}
            emissive={smartSchool.station2IndoorCompleted ? '#10b981' : '#34d399'}
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>

        {/* Floor Glow Ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial
            color={smartSchool.station2IndoorCompleted ? '#10b981' : '#34d399'}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* 3D Circular Marker Pin / Station Banner */}
        {isStarted && !isModalActive && !closed[2] && (
          <Html position={[0, minimized[2] ? 1.6 : 2.2, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            {minimized[2] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation102Modal(2);
                }}
                className="bg-slate-900/95 hover:bg-emerald-950 border border-emerald-400 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  {smartSchool.station2IndoorCompleted ? '✓' : '2'}
                </span>
                <span className="font-bold text-[11px] text-emerald-300">โต๊ะ 2: ภายในอาคาร</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((p) => ({ ...p, 2: false }));
                  }}
                  title="ขยายป้าย"
                  className="text-[10px] text-emerald-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
                >
                  ➕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center select-none cursor-pointer group">
                <div
                  onClick={() => setActiveStation102Modal(2)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartSchool.station2IndoorCompleted
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🚪</span>
                      <span className="font-bold text-xs text-emerald-300">โต๊ะที่ 2: ติดตั้งภายใน</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartSchool.station2IndoorCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {smartSchool.station2IndoorCompleted ? 'ผ่านแล้ว' : '35 คะแนน'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMinimized((p) => ({ ...p, 2: true }));
                        }}
                        title="ย่อป้าย"
                        className="text-[10px] text-slate-400 hover:text-white font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-emerald-900 rounded cursor-pointer"
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
                    {smartSchool.station2IndoorCompleted ? '✓ ติดตั้งกล้องภายใน 4 ตัวแล้ว' : 'วางตำแหน่งกล้องโถงทางเดิน & ห้องเรียน'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>สถานะ: <strong className={smartSchool.station2IndoorCompleted ? 'text-emerald-400' : 'text-emerald-300'}>{smartSchool.station2IndoorCompleted ? 'เสร็จสิ้น' : 'รอปฏิบัติ'}</strong></span>
                    <span className="text-emerald-400 font-mono">[กด E หรือคลิก]</span>
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          3D Smart School Station 3: Analytical Case Study Table
         ======================================================== */}
      <group
        position={[0, 0, 5]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStation102Modal(3);
        }}
      >
        {/* Lab Desk Model */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.8, 0.9, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Computer Screen on Table */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.7, 0.45, 0.06]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 1.15, 0.035]}>
          <planeGeometry args={[0.62, 0.38]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Floating Hologram Beacon */}
        <mesh position={[0, 1.6, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={smartSchool.station3WrittenCompleted ? '#10b981' : '#f59e0b'}
            emissive={smartSchool.station3WrittenCompleted ? '#10b981' : '#f59e0b'}
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>

        {/* Floor Glow Ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial
            color={smartSchool.station3WrittenCompleted ? '#10b981' : '#f59e0b'}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* 3D Circular Marker Pin / Station Banner */}
        {isStarted && !isModalActive && !closed[3] && (
          <Html position={[0, minimized[3] ? 1.6 : 2.2, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
            {minimized[3] ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation102Modal(3);
                }}
                className="bg-slate-900/95 hover:bg-amber-950 border border-amber-400 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  {smartSchool.station3WrittenCompleted ? '✓' : '3'}
                </span>
                <span className="font-bold text-[11px] text-amber-300">โต๊ะ 3: เคสวิเคราะห์</span>
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
                  onClick={() => setActiveStation102Modal(3)}
                  className={`p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-center transition-all duration-200 transform group-hover:scale-105 min-w-[210px] border-2 ${
                    smartSchool.station3WrittenCompleted
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-emerald-500/40'
                      : 'bg-slate-900/95 border-amber-400 text-amber-100 shadow-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📝</span>
                      <span className="font-bold text-xs text-amber-300">โต๊ะที่ 3: กรณีศึกษา</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          smartSchool.station3WrittenCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {smartSchool.station3WrittenCompleted ? 'ผ่านแล้ว' : '30 คะแนน'}
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
                    {smartSchool.station3WrittenCompleted ? '✓ ทำแบบทดสอบครบแล้ว' : 'ตอบคำถามวิเคราะห์เลนส์ & Blind Spot'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>สถานะ: <strong className={smartSchool.station3WrittenCompleted ? 'text-emerald-400' : 'text-amber-300'}>{smartSchool.station3WrittenCompleted ? 'เสร็จสิ้น' : 'รอปฏิบัติ'}</strong></span>
                    <span className="text-amber-400 font-mono">[กด E หรือคลิก]</span>
                  </div>
                </div>
              </div>
            )}
          </Html>
        )}
      </group>

      {/* ========================================================
          Environmental Exhibits: Real 3D CCTV Fixtures in Room
         ======================================================== */}
      {/* Ceiling Mount Dome */}
      <group position={[0, 4.2, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <VirtualCctvDevice deviceId="CAMERA_DOME" position={[0, 0.2, 0]} />
        <mesh position={[0, -1.8, 0]}>
          <coneGeometry args={[2.8, 3.8, 16, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Wall Mount Bullet */}
      <group position={[-5, 3.5, 10.6]} rotation={[0, Math.PI, 0]}>
        <VirtualCctvDevice deviceId="CAMERA_BULLET" position={[0, 0, 0.1]} />
      </group>

      {/* High Pole Mount PTZ */}
      <group position={[8, 0, -1]}>
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 4.4, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <VirtualCctvDevice deviceId="CAMERA_DOME" position={[0, 4.1, 0.4]} />
      </group>
    </group>
  );
};
