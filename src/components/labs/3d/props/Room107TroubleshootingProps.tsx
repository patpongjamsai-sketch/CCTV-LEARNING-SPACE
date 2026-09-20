'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

type Room107Station = 1 | 2 | 3;

interface StationWorkbenchProps {
  position: [number, number, number];
  station: Room107Station;
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
    {/* Floor station ring */}
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.5, 1.7, 32]} />
      <meshBasicMaterial color={completed ? '#10b981' : '#f43f5e'} opacity={0.65} transparent />
    </mesh>
    {/* Table Base */}
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.6, 0.9, 1.2]} />
      <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
    </mesh>
    {/* Metallic Trim Bar */}
    <mesh position={[0, 0.92, 0]} receiveShadow>
      <boxGeometry args={[2.7, 0.06, 1.3]} />
      <meshStandardMaterial color={completed ? '#059669' : '#e11d48'} roughness={0.3} metalness={0.6} />
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
            className="bg-slate-900/95 hover:bg-rose-950 border border-rose-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group pointer-events-auto"
          >
            <span className="text-xs">{completed ? '✅' : '🔧'}</span>
            <span className="font-bold text-[11px] text-rose-300">
              โต๊ะ {station}: {title} ({pointsLabel})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMinimize();
              }}
              title="ขยายป้าย"
              className="text-[10px] text-rose-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
            >
              ➕
            </button>
          </div>
        ) : (
          <div className="flex min-w-56 cursor-pointer flex-col items-center select-none group pointer-events-auto">
            <div
              onClick={() => onOpen()}
              className="rounded-2xl border border-rose-500/60 bg-slate-950/95 p-2.5 text-center shadow-2xl backdrop-blur-md transition-transform group-hover:scale-105 min-w-[220px]"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-rose-500/20 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{completed ? '✅' : '🔧'}</span>
                  <span className="text-xs font-bold text-rose-300">
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
                    className="text-[10px] text-slate-400 hover:text-white font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-900 rounded cursor-pointer"
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
                <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  {pointsLabel}
                </span>
                <span className={`text-[9px] font-bold ${completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {completed ? '✓ แก้ไขสำเร็จ' : 'กด E หรือคลิกเปิด'}
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

export const Room107TroubleshootingProps: React.FC = () => {
  const smartTroubleshooting107 = useCctvTrainingStore((s) => s.smartTroubleshooting107);
  const activeStation107Modal = useCctvTrainingStore((s) => s.activeStation107Modal);
  const setActiveStation107Modal = useCctvTrainingStore((s) => s.setActiveStation107Modal);
  const isModalActive = activeStation107Modal !== null;

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
        <div className="whitespace-nowrap rounded-full border border-rose-500/60 bg-slate-950/90 px-5 py-1.5 text-xs font-black tracking-widest text-rose-300 shadow-2xl flex items-center gap-2">
          <span>🔧</span>
          <span>ROOM 107: CCTV TROUBLESHOOTING &amp; PREVENTIVE MAINTENANCE (100 PTS)</span>
        </div>
      </Html>

      {/* Atmospheric Point Lights */}
      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#fda4af" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={25} color="#fde68a" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#86efac" distance={10} />

      {/* Station 1: Diagnostic Tree, Voltage Drop & NO VIDEO (40 pts) */}
      <StationWorkbench
        position={[-6, 0, -3]}
        station={1}
        title="วินิจฉัย NO VIDEO & ไฟตก"
        pointsLabel="40 คะแนน"
        description="6-Step Diagnostic Tree · ตรวจวัด PoE 42.5V · ขจัดปัญหาแรงดันไฟตก"
        completed={smartTroubleshooting107.station1Completed}
        isModalActive={isModalActive}
     minimized={minimized[1] ?? false}
closed={closed[1] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 1: !p[1] }))}
        onClose={() => setClosed((p) => ({ ...p, 1: true }))}
        onOpen={() => setActiveStation107Modal(1)}
      >
        {/* Faulty CAM-03 mounted on mini wall post */}
        <group position={[-0.7, 1.2, -0.2]}>
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[0.3, 0.8, 0.1]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <VirtualCctvDevice deviceId="CAMERA_BULLET" position={[0, 0.2, 0.05]} />
        </group>

        {/* Digital Multimeter with probes on desk */}
        <group position={[0.2, 0.98, 0.05]} rotation={[0, -0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.16, 0.04, 0.24]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.022, -0.03]}>
            <planeGeometry args={[0.12, 0.08]} />
            <meshBasicMaterial color={smartTroubleshooting107.station1Completed ? '#10b981' : '#ef4444'} />
          </mesh>
        </group>

        {/* Diagnostic Monitor */}
        <group position={[0.65, 1.0, 0]}>
          <VirtualCctvDevice deviceId="MONITOR" position={[0, 0, 0]} />
        </group>
      </StationWorkbench>

      {/* Station 2: Ground Loop, Signal Quality & Tools (20 pts) */}
      <StationWorkbench
        position={[0, 0, -3]}
        station={2}
        title="คลื่นรบกวน & Ground Loop"
        pointsLabel="20 คะแนน"
        description="Rolling Hum Bars 50Hz · วัดความต่างศักย์กราวด์ · ใส่ Ground Loop Isolator"
        completed={smartTroubleshooting107.station2Completed}
        isModalActive={isModalActive}
   minimized={minimized[2] ?? false}
closed={closed[2] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 2: !p[2] }))}
        onClose={() => setClosed((p) => ({ ...p, 2: true }))}
        onOpen={() => setActiveStation107Modal(2)}
      >
        {/* CCTV Tester Monitor Screen */}
        <group position={[-0.45, 1.0, 0]}>
          <VirtualCctvDevice deviceId="MONITOR" position={[0, 0, 0]} />
        </group>

        {/* Coaxial & Signal Patch Terminal */}
        <group position={[0.4, 0.98, 0.05]}>
          <mesh>
            <boxGeometry args={[0.4, 0.08, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Ground Loop Isolator Cylinder (visible on desk) */}
          <group position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.16, 16]} />
              <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </StationWorkbench>

      {/* Station 3: Preventive Maintenance & Service Report (40 pts) */}
      <StationWorkbench
        position={[6, 0, -3]}
        station={3}
        title="บำรุงรักษา PM & รายงาน"
        pointsLabel="40 คะแนน"
        description="ทำความสะอาดเลนส์ · ซีลยางกันน้ำ · PM Checklist 5 ข้อ · เซ็นรับรอง Service Report"
        completed={smartTroubleshooting107.station3Completed}
        isModalActive={isModalActive}
    minimized={minimized[3] ?? false}
closed={closed[3] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 3: !p[3] }))}
        onClose={() => setClosed((p) => ({ ...p, 3: true }))}
        onOpen={() => setActiveStation107Modal(3)}
      >
        {/* Optical Lens & Dome Model under service */}
        <group position={[-0.5, 0.98, 0]}>
          <VirtualCctvDevice deviceId="CAMERA_DOME" position={[0, 0.15, 0]} />
        </group>

        {/* Cleaning Spray & Microfiber Kit */}
        <group position={[0, 0.98, 0.1]}>
          <mesh position={[-0.08, 0.06, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.3} />
          </mesh>
          <mesh position={[0.06, 0.01, 0]}>
            <boxGeometry args={[0.1, 0.015, 0.1]} />
            <meshStandardMaterial color="#fde047" roughness={0.9} />
          </mesh>
        </group>

        {/* PM Clipboard & Service Report Binder */}
        <group position={[0.5, 0.98, 0.05]} rotation={[0, -0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.02, 0.36]} />
            <meshStandardMaterial color="#0f766e" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.012, 0]}>
            <planeGeometry args={[0.22, 0.3]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
      </StationWorkbench>
    </group>
  );
};
