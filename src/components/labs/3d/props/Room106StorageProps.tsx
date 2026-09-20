'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useCctvTrainingStore } from '../../../../store/useCctvTrainingStore';
import { VirtualCctvDevice } from '../../../equipment/VirtualCctvDevice';

type Room106Station = 1 | 2 | 3;

interface StationWorkbenchProps {
  position: [number, number, number];
  station: Room106Station;
  title: string;
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
    {/* ขอบเขตสถานีอยู่บนพื้น ส่วนป้ายสถานีเป็น Overlay แยกออกจาก Background */}
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.5, 1.7, 32]} />
      <meshBasicMaterial color={completed ? '#10b981' : '#0284c7'} opacity={0.65} transparent />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.6, 0.9, 1.2]} />
      <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
    </mesh>
    <mesh position={[0, 0.92, 0]} receiveShadow>
      <boxGeometry args={[2.7, 0.06, 1.3]} />
      <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
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
            className="bg-slate-900/95 hover:bg-sky-950 border border-sky-500/60 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md text-center transition-all flex items-center gap-2 cursor-pointer select-none group"
          >
            <span className="text-xs">{completed ? '✅' : '🧰'}</span>
            <span className="font-bold text-[11px] text-sky-300">โต๊ะ {station}: {title}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMinimize();
              }}
              title="ขยายป้าย"
              className="text-[10px] text-sky-400 hover:text-white font-bold ml-1 px-1.5 py-0.5 bg-slate-800 rounded-md cursor-pointer"
            >
              ➕
            </button>
          </div>
        ) : (
          <div className="flex min-w-56 cursor-pointer flex-col items-center select-none group">
            <div
              onClick={() => onOpen()}
              className="rounded-2xl border border-sky-500/60 bg-slate-950/95 p-2.5 text-center shadow-2xl backdrop-blur-md transition-transform group-hover:scale-105 min-w-[210px]"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1 border-b border-white/10 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{completed ? '✅' : '🧰'}</span>
                  <span className="text-xs font-bold text-sky-300">Station {station}: {title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMinimize();
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
                      onClose();
                    }}
                    title="ปิดป้าย"
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 bg-slate-800 hover:bg-rose-950 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-slate-300">{description}</div>
              <div className={`mt-1 text-[9px] font-bold ${completed ? 'text-emerald-300' : 'text-amber-300'}`}>
                {completed ? '✓ บันทึกผลแล้ว' : 'เดินมาที่โต๊ะ แล้วกด E หรือคลิก'}
              </div>
            </div>
          </div>
        )}
      </Html>
    )}
  </group>
);

export const Room106StorageProps: React.FC = () => {
  const smartStorage106 = useCctvTrainingStore((s) => s.smartStorage106);
  const activeStation106Modal = useCctvTrainingStore((s) => s.activeStation106Modal);
  const setActiveStation106Modal = useCctvTrainingStore((s) => s.setActiveStation106Modal);
  const isModalActive = activeStation106Modal !== null;

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial color="#111827" roughness={0.72} />
      </mesh>
      <mesh position={[0, 2.5, -5.8]} receiveShadow>
        <boxGeometry args={[22, 5, 0.25]} />
        <meshStandardMaterial color="#0f172a" roughness={0.72} />
      </mesh>
      <Html position={[0, 4.3, -5.54]} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-full border border-sky-400/50 bg-slate-950/90 px-4 py-1 text-xs font-black tracking-widest text-white shadow-xl">
          📹 ROOM 106: STORAGE, RETENTION &amp; CLOUD P2P
        </div>
      </Html>

      <pointLight position={[-6, 4.5, -2]} intensity={25} color="#bae6fd" distance={10} />
      <pointLight position={[0, 4.5, -2]} intensity={25} color="#dbeafe" distance={10} />
      <pointLight position={[6, 4.5, -2]} intensity={25} color="#c4b5fd" distance={10} />

      <StationWorkbench
        position={[-6, 0, -3]}
        station={1}
        title="คำนวณ Storage"
        description="จำนวนกล้อง · Retention Days · ความจุ TB"
        completed={smartStorage106.station1Completed}
        isModalActive={isModalActive}
        minimized={minimized[1] ?? false}
        closed={closed[1] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 1: !p[1] }))}
        onClose={() => setClosed((p) => ({ ...p, 1: true }))}
        onOpen={() => setActiveStation106Modal(1)}
      >
        <group position={[-0.55, 0.98, 0.05]}>
          <VirtualCctvDevice deviceId="NVR_8CH" position={[0, 0, 0]} />
        </group>
        <group position={[0.55, 1.0, 0.05]}>
          <mesh>
            <boxGeometry args={[0.44, 0.02, 0.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.15, -0.14]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </group>
      </StationWorkbench>

      <StationWorkbench
        position={[0, 0, -3]}
        station={2}
        title="จัดการ HDD"
        description="Surveillance HDD · SATA · Format / Initialize"
        completed={smartStorage106.station2Completed}
        isModalActive={isModalActive}
        minimized={minimized[2] ?? false}
        closed={closed[2] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 2: !p[2] }))}
        onClose={() => setClosed((p) => ({ ...p, 2: true }))}
        onOpen={() => setActiveStation106Modal(2)}
      >
        <group position={[-0.55, 0.98, 0]}>
          <VirtualCctvDevice deviceId="NVR_8CH" position={[0, 0, 0]} />
        </group>
        <group position={[0.55, 0.98, 0.05]} rotation={[0, 0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.42, 0.04, 0.3]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.022, 0]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshBasicMaterial color="#7c3aed" />
          </mesh>
        </group>
      </StationWorkbench>

      <StationWorkbench
        position={[6, 0, -3]}
        station={3}
        title="Cloud P2P / QR"
        description="เปิดบริการ · Online · จับคู่ Mobile App"
        completed={smartStorage106.station3Completed}
        isModalActive={isModalActive}
        minimized={minimized[3] ?? false}
        closed={closed[3] ?? false}
        onToggleMinimize={() => setMinimized((p) => ({ ...p, 3: !p[3] }))}
        onClose={() => setClosed((p) => ({ ...p, 3: true }))}
        onOpen={() => setActiveStation106Modal(3)}
      >
        <group position={[-0.45, 1.0, 0.05]}>
          <VirtualCctvDevice deviceId="NVR_8CH" position={[0, 0, 0]} />
        </group>
        <group position={[0.55, 0.98, 0.05]} rotation={[-Math.PI / 2, 0, -0.4]}>
          <mesh>
            <boxGeometry args={[0.18, 0.3, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.14, 0.23]} />
            <meshBasicMaterial color={smartStorage106.station3Completed ? '#065f46' : '#1e293b'} />
          </mesh>
        </group>
      </StationWorkbench>
    </group>
  );
};
