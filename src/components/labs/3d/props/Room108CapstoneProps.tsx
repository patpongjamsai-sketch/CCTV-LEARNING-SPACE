'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

type Room108Station = 1 | 2 | 3;

interface StationWorkbenchProps {
  position: [number, number, number];
  station: Room108Station;
  title: string;
  pointsLabel: string;
  description: string;
  completed: boolean;
  isModalActive: boolean;
  minimized: boolean;
  closed: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

const StationWorkbench: React.FC<StationWorkbenchProps> = ({
  position,
  station,
  title,
  pointsLabel,
  description,
  completed,
  isModalActive,
  minimized,
  closed,
  onToggleMinimize,
  onClose,
  onOpen,
  children,
}) => (
  <group position={position} onClick={() => onOpen()}>
    {/* 3D Floor Station Ring with Amber/Gold & Emerald theme */}
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.5, 1.7, 32]} />
      <meshBasicMaterial color={completed ? '#10b981' : '#f59e0b'} opacity={0.65} transparent />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.6, 0.9, 1.2]} />
      <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
    </mesh>
    {/* Metallic Trim Bar */}
    <mesh position={[0, 0.92, 0]} receiveShadow>
      <boxGeometry args={[2.7, 0.06, 1.3]} />
      <meshStandardMaterial color={completed ? '#059669' : '#d97706'} roughness={0.3} metalness={0.6} />
    </mesh>
    {children}
    {!isModalActive && !closed && (
      <Html position={[0, minimized ? 1.8 : 2.1, 0]} center distanceFactor={8}>
        {minimized ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="bg-slate-900/95 hover:bg-amber-950 border border-amber-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group pointer-events-auto"
          >
            <span className="text-xs">{completed ? '✅' : '🎓'}</span>
            <span className="font-bold text-[11px] text-amber-300">
              โต๊ะ {station}: {title} ({pointsLabel})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMinimize();
              }}
              title="ขยายป้าย"
              className="text-[10px] text-amber-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
            >
              ➕
            </button>
          </div>
        ) : (
          <div className="flex min-w-56 cursor-pointer flex-col items-center select-none group pointer-events-auto">
            <div
              onClick={() => onOpen()}
              className="rounded-2xl border border-amber-500/60 bg-slate-950/95 p-2.5 text-center shadow-2xl backdrop-blur-md transition-transform group-hover:scale-105 min-w-[220px]"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-amber-500/20 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{completed ? '✅' : '🎓'}</span>
                  <span className="text-xs font-bold text-amber-300">
                    Station {station}: {title}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMinimize();
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
                      onClose();
                    }}
                    title="ปิดป้าย"
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-950 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center px-1 mb-1">
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  {pointsLabel}
                </span>
                <span className={`text-[9px] font-bold ${completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {completed ? '✓ เสร็จสมบูรณ์' : 'กด E หรือคลิกเปิด'}
                </span>
              </div>
              <div className="mt-1 text-[10px] text-slate-300 text-left px-1 leading-snug">{description}</div>
            </div>
          </div>
        )}
      </Html>
    )}
  </group>
);

interface Room108CapstonePropsProps {
  onFinalizeSubmission?: () => void;
}

export const Room108CapstoneProps: React.FC<Room108CapstonePropsProps> = () => {
  const smartCapstone108 = useCctvTrainingStore((s) => s.smartCapstone108);
  const activeStation108Modal = useCctvTrainingStore((s) => s.activeStation108Modal);
  const setActiveStation108Modal = useCctvTrainingStore((s) => s.setActiveStation108Modal);
  const isModalActive = activeStation108Modal !== null;

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
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 2.5, -5.8]} receiveShadow>
        <boxGeometry args={[22, 5, 0.25]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.7} />
      </mesh>
      {/* Room Overhead Title Banner */}
      <Html position={[0, 4.3, -5.54]} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-full border border-amber-500/60 bg-slate-950/90 px-5 py-1.5 text-xs font-black tracking-widest text-amber-300 shadow-2xl flex items-center gap-2">
          <span>🎓</span>
          <span>ROOM 108: INTEGRATED CCTV CAPSTONE &amp; HANDOVER (85 PTS)</span>
        </div>
      </Html>

      {/* Atmospheric Point Lights */}
      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#fde68a" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={30} color="#fef08a" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#86efac" distance={10} />

      {/* Station 1: Project Planning, FOV & BOM (20 pts) */}
      <StationWorkbench
        position={[-6, 0, -3]}
        station={1}
        title="วางแผนผัง & บัญชี BOM"
        pointsLabel="20 คะแนน"
        description="Requirement Brief · ตรวจสอบ FOV 8 โซน · อนุมัติงบประมาณ BOM 7 รายการ"
        completed={smartCapstone108.station1Completed}
        isModalActive={isModalActive}
        minimized={minimized[1] ?? false}
        closed={closed[1] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 1: !p[1] }))}
        onClose={() => setClosed((p) => ({ ...p, 1: true }))}
        onOpen={() => setActiveStation108Modal(1)}
      >
        {/* Blueprints / Architectural Documents */}
        <group position={[-0.5, 0.96, 0.05]} rotation={[-Math.PI / 2, 0, 0.1]}>
          <mesh>
            <planeGeometry args={[0.5, 0.35]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.46, 0.31]} />
            <meshBasicMaterial color="#38bdf8" wireframe />
          </mesh>
        </group>
        {/* Planning Laptop */}
        <group position={[0.4, 0.98, 0.05]}>
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.28]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.14, -0.13]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[0.4, 0.26, 0.015]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
        {/* Sample Camera on Desk */}
        <group position={[0, 0.98, -0.2]}>
          <VirtualCctvDevice deviceId="CAMERA_DOME" position={[0, 0, 0]} />
        </group>
      </StationWorkbench>

      {/* Station 2: Integrated System Commissioning (40 pts) */}
      <StationWorkbench
        position={[0, 0, -3]}
        station={2}
        title="Commissioning & Hardening"
        pointsLabel="40 คะแนน"
        description="NVR 8-Ch Reachable · 8 Cameras Online · 24/7 Rec · UPS Failover · Cyber Hardening"
        completed={smartCapstone108.station2Completed}
        isModalActive={isModalActive}
        minimized={minimized[2] ?? false}
        closed={closed[2] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 2: !p[2] }))}
        onClose={() => setClosed((p) => ({ ...p, 2: true }))}
        onOpen={() => setActiveStation108Modal(2)}
      >
        {/* 6U Mini Rack & Devices */}
        <group position={[-0.6, 1.0, 0]}>
          <VirtualCctvDevice deviceId="NVR_8CH" position={[0, 0, 0]} />
        </group>
        <group position={[0.45, 1.0, 0]}>
          <VirtualCctvDevice deviceId="MONITOR" position={[0, 0, 0]} />
        </group>
        <group position={[-0.6, 0.95, 0.2]}>
          <VirtualCctvDevice deviceId="POE_SWITCH_8P" position={[0, 0, 0]} />
        </group>
        {/* UPS Unit */}
        <group position={[0.0, 0.98, -0.15]}>
          <mesh>
            <boxGeometry args={[0.22, 0.16, 0.32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0.165]}>
            <planeGeometry args={[0.06, 0.04]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      </StationWorkbench>

      {/* Station 3: Acceptance & Handover (25 pts) */}
      <StationWorkbench
        position={[6, 0, -3]}
        station={3}
        title="ส่งมอบงาน & ใบรับรอง"
        pointsLabel="25 คะแนน"
        description="Punch List เคลียร์ 0 ข้อบกพร่อง · บันทึกฝึกอบรมผู้ใช้ · Digital Handover Sign-off"
        completed={smartCapstone108.station3Completed}
        isModalActive={isModalActive}
        minimized={minimized[3] ?? false}
        closed={closed[3] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 3: !p[3] }))}
        onClose={() => setClosed((p) => ({ ...p, 3: true }))}
        onOpen={() => setActiveStation108Modal(3)}
      >
        {/* Handover Document Binder & Certificate */}
        <group position={[-0.45, 0.98, 0.05]} rotation={[0, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.36, 0.05, 0.44]} />
            <meshStandardMaterial color="#064e3b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.028, 0]}>
            <planeGeometry args={[0.3, 0.38]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          {/* Gold Embossed Seal */}
          <mesh position={[0.08, 0.03, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
        {/* Terminal/Tablet for Digital Sign-off */}
        <group position={[0.45, 0.98, 0.05]} rotation={[-Math.PI / 2, 0, -0.2]}>
          <mesh>
            <boxGeometry args={[0.26, 0.36, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshBasicMaterial color={smartCapstone108.station3Completed ? '#065f46' : '#1e293b'} />
          </mesh>
        </group>
      </StationWorkbench>
    </group>
  );
};
