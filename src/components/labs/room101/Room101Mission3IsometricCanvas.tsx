'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { ConceptId, DeviceId } from '../../../shared/domain/roleplayTypes';

export interface Mission33DCanvasProps {
  selectedDeviceId: DeviceId | null;
  onSelectDevice: (id: DeviceId | null) => void;
}

// 5 Devices in Mission 3
export const M3_DEVICE_CONFIGS = [
  {
    id: 'CAMERA_BULLET' as DeviceId,
    correctConceptId: 'FUNC_CAMERA' as ConceptId,
    nameTh: 'IP Bullet Camera',
    roleTh: 'รับภาพ & สตรีมวิดีโอ',
    posX: -4.4,
    color: '#06b6d4',
  },
  {
    id: 'POE_SWITCH_8P' as DeviceId,
    correctConceptId: 'FUNC_POE_SWITCH' as ConceptId,
    nameTh: '8-Port PoE Switch',
    roleTh: 'สวิตชิ่ง & จ่ายไฟ PoE 48V',
    posX: -2.2,
    color: '#10b981',
  },
  {
    id: 'NVR_8CH' as DeviceId,
    correctConceptId: 'FUNC_NVR' as ConceptId,
    nameTh: '8-CH NVR Recorder',
    roleTh: 'บันทึกวิดีโอ & จัดการสตรีม',
    posX: 0,
    color: '#8b5cf6',
  },
  {
    id: 'ROUTER' as DeviceId,
    correctConceptId: 'FUNC_ROUTER' as ConceptId,
    nameTh: 'Gigabit Router',
    roleTh: 'จ่าย IP & กำหนดเส้นทางเน็ต',
    posX: 2.2,
    color: '#3b82f6',
  },
  {
    id: 'CLIENT_PC' as DeviceId,
    correctConceptId: 'FUNC_CLIENT_PC' as ConceptId,
    nameTh: 'Client Monitor / PC',
    roleTh: 'ดูภาพสด Live View & ค้นหา',
    posX: 4.4,
    color: '#f59e0b',
  },
];

// ============================================================================
// 1. Procedural 3D Models
// ============================================================================

/** 3D IP Bullet Camera */
const M3IpCamera3D: React.FC<{ isSelected?: boolean; isCorrect?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isCorrect,
  isFlowing,
}) => {
  return (
    <group rotation={[0.05, 0.45, 0]}>
      <mesh position={[-0.4, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.08, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.22, 0.22, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.38, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      <group position={[0.1, 0.38, 0]} rotation={[0, 0, -0.1]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.8, 32]} />
          <meshStandardMaterial
            color={isSelected ? '#38bdf8' : isCorrect ? '#ffffff' : '#e2e8f0'}
            metalness={0.4}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.1, 0.07]} castShadow>
          <boxGeometry args={[0.36, 0.85, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.04, 32]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <sphereGeometry args={[0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.85}
            opacity={0.9}
            transparent
            roughness={0.05}
          />
        </mesh>
        {isFlowing && (
          <mesh position={[0.2, 0.28, 0.12]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** 3D 8-Port PoE Switch */
const M3PoeSwitch3D: React.FC<{ isSelected?: boolean; isCorrect?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isCorrect,
  isFlowing,
}) => {
  return (
    <group position={[0, 0.15, 0]} rotation={[0, 0.2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 1.1]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isCorrect ? '#0f172a' : '#1e293b'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0, 0.56]}>
        <boxGeometry args={[1.44, 0.24, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* 8 Ports */}
      <group position={[-0.2, -0.02, 0.57]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`p_${i}`} position={[(i % 4) * 0.15 - 0.22, i < 4 ? 0.04 : -0.04, 0]}>
            <boxGeometry args={[0.11, 0.07, 0.02]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        ))}
      </group>
      {/* LEDs */}
      {isFlowing && (
        <group position={[-0.2, 0.08, 0.57]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`l_${i}`} position={[i * 0.07 - 0.24, 0, 0]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/** 3D 8-CH NVR */
const M3Nvr3D: React.FC<{ isSelected?: boolean; isCorrect?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isCorrect,
  isFlowing,
}) => {
  return (
    <group position={[0, 0.15, 0]} rotation={[0, -0.15, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.32, 1.3]} />
        <meshStandardMaterial
          color={isSelected ? '#818cf8' : isCorrect ? '#090d16' : '#1e1b4b'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0.66]}>
        <boxGeometry args={[1.66, 0.26, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.55, 0.04, 0.67]}>
        <boxGeometry args={[0.25, 0.06, 0.01]} />
        <meshStandardMaterial color="#6366f1" emissive="#4338ca" emissiveIntensity={0.6} />
      </mesh>
      {/* Front LEDs */}
      <group position={[0.45, 0.04, 0.67]}>
        <mesh position={[-0.1, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color={isFlowing ? '#ef4444' : '#64748b'}
            emissive={isFlowing ? '#ef4444' : '#000000'}
            emissiveIntensity={isFlowing ? 0.9 : 0}
          />
        </mesh>
      </group>
    </group>
  );
};

/** 3D Gigabit Router */
const M3Router3D: React.FC<{ isSelected?: boolean; isCorrect?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isCorrect,
  isFlowing,
}) => {
  return (
    <group position={[0, 0.14, 0]} rotation={[0, 0.25, 0]}>
      {/* Router Main Sleek Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.2, 1.0]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isCorrect ? '#0f172a' : '#1e293b'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Beveled Top Shell Accent */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.8]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* 4 Articulated External Antennas */}
      {[-0.55, -0.2, 0.2, 0.55].map((x, i) => (
        <group key={`ant_${i}`} position={[x, 0.1, -0.48]} rotation={[-0.3, (i - 1.5) * 0.15, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.9, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </group>
      ))}
      {/* Wi-Fi & Internet Status LEDs */}
      <group position={[0, 0.12, 0.42]}>
        {[-0.15, 0, 0.15].map((x, i) => (
          <mesh key={`rled_${i}`} position={[x, 0, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={isFlowing ? 0.9 : 0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** 3D Client Monitor / PC Screen with Live View Simulation */
const M3Monitor3D: React.FC<{ isSelected?: boolean; isCorrect?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isCorrect,
  isFlowing,
}) => {
  const [timeString, setTimeString] = useState('12:00:00');

  useFrame(() => {
    if (isFlowing) {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0] || '12:00:00');
    }
  });

  return (
    <group position={[0, 0.35, 0]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, -0.32, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.45, 0.05, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.1, -0.08]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.8, 1.15, 0.07]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isCorrect ? '#0f172a' : '#1e293b'}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.25, 0.04]}>
        <planeGeometry args={[1.7, 1.05]} />
        <meshStandardMaterial
          color={isFlowing ? '#0f291e' : '#020617'}
          emissive={isFlowing ? '#059669' : '#0f172a'}
          emissiveIntensity={isFlowing ? 0.3 : 0.1}
        />
      </mesh>
      <Html position={[0, 0.25, 0.045]} transform distanceFactor={1.35} className="pointer-events-none select-none">
        <div className="w-[280px] h-[170px] rounded-lg bg-slate-950 flex flex-col justify-between p-2 font-mono text-[9px] text-white border border-slate-700 shadow-xl overflow-hidden relative">
          {isFlowing ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">● LIVE MONITOR 4K</span>
                <span className="text-emerald-300 text-[8px] bg-emerald-950 px-1 rounded">ONVIF PROFILE S</span>
              </div>
              <div className="text-center font-bold text-emerald-200">
                🏪 SMART MART SURVEILLANCE
              </div>
              <div className="flex justify-between text-[8px] text-slate-300 bg-slate-900/80 p-1 rounded">
                <span className="text-emerald-400">STATUS: MATCHED</span>
                <span>{timeString}</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center gap-1.5">
              <span className="text-rose-400 font-bold text-xs">NO SIGNAL</span>
              <span className="text-[8px] text-slate-400">โปรดจับคู่อุปกรณ์ให้ครบ</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// ============================================================================
// 2. Dynamic 3D Spline Cables with Flowing Photons
// ============================================================================

const M3SplineCable: React.FC<{
  startPos: [number, number, number];
  endPos: [number, number, number];
  cableColor: string;
  glowColor: string;
  isFlowing?: boolean;
}> = ({ startPos, endPos, cableColor, glowColor, isFlowing }) => {
  const particleRef = useRef<THREE.Mesh>(null);

  const { curve, tubeGeometry } = useMemo(() => {
    const p0 = new THREE.Vector3(...startPos);
    const p3 = new THREE.Vector3(...endPos);
    const midX = (p0.x + p3.x) / 2;
    const midZ = (p0.z + p3.z) / 2;
    const dx = p3.x - p0.x;

    // Elevate cable arc comfortably above table and pad rims (pad top is ~0.12, keep min at 0.20)
    const baseMinY = Math.min(p0.y, p3.y);
    const droopY = Math.max(0.20, baseMinY - 0.12);
    const forwardBow = 0.16;

    const p1 = new THREE.Vector3(p0.x + dx * 0.25, droopY + 0.04, p0.z + forwardBow * 0.5);
    const p2 = new THREE.Vector3(p3.x - dx * 0.25, droopY + 0.04, p3.z + forwardBow * 0.5);
    const midPoint = new THREE.Vector3(midX, droopY, midZ + forwardBow);

    const c = new THREE.CatmullRomCurve3([p0, p1, midPoint, p2, p3]);
    const geo = new THREE.TubeGeometry(c, 44, 0.04, 12, false);
    return { curve: c, tubeGeometry: geo };
  }, [startPos, endPos]);

  useFrame(({ clock }) => {
    if (particleRef.current && isFlowing) {
      const t = (clock.getElapsedTime() * 1.0) % 1;
      particleRef.current.position.copy(curve.getPointAt(t));
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeometry} castShadow>
        <meshStandardMaterial color={cableColor} roughness={0.35} metalness={0.3} />
      </mesh>
      {isFlowing && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={2.5} />
        </mesh>
      )}
    </group>
  );
};

// ============================================================================
// 3. Main Isometric Scene for Mission 3
// ============================================================================

const Mission3Scene: React.FC<Mission33DCanvasProps> = ({ selectedDeviceId, onSelectDevice }) => {
  const mission3Matches = useRoleplayStore((s) => s.mission3Matches);
  const missionState = useRoleplayStore((s) => s.missions.M3);

  // Check correctness of all 5
  const isCamCorrect = mission3Matches.CAMERA_BULLET === 'FUNC_CAMERA';
  const isPoeCorrect = mission3Matches.POE_SWITCH_8P === 'FUNC_POE_SWITCH';
  const isNvrCorrect = mission3Matches.NVR_8CH === 'FUNC_NVR';
  const isRouterCorrect = mission3Matches.ROUTER === 'FUNC_ROUTER';
  const isClientCorrect = mission3Matches.CLIENT_PC === 'FUNC_CLIENT_PC';

  const isAllCorrect = isCamCorrect && isPoeCorrect && isNvrCorrect && isRouterCorrect && isClientCorrect;
  const isFlowing = isAllCorrect || missionState.isCompleted;

  return (
    <>
      {/* Studio White-Gray Background */}
      <color attach="background" args={['#f1f5f9']} />

      {/* Studio Lighting - Bright Cleanroom 3-Point with Rim Lights */}
      <ambientLight intensity={1.15} color="#ffffff" />
      <directionalLight
        position={[9, 16, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-8, 10, -6]} intensity={0.7} color="#f0fdf4" />
      <directionalLight position={[0, 8, -8]} intensity={0.9} color="#e0f2fe" />
      <pointLight position={[-3, 4, 3]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[3, 4, 3]} intensity={0.6} color="#8b5cf6" />

      {/* Main Table Platform */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, -0.15, 0.2]} receiveShadow castShadow>
          <boxGeometry args={[11.5, 0.25, 4.0]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.2]} receiveShadow>
          <boxGeometry args={[11.2, 0.04, 3.7]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, -0.01, 0.2]}>
          <boxGeometry args={[11.26, 0.03, 3.76]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 2.22]}>
          <boxGeometry args={[11.5, 0.12, 0.04]} />
          <meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>

        {/* 5 Device Sockets */}
        {M3_DEVICE_CONFIGS.map((item) => {
          const currentMatch = mission3Matches[item.id];
          const isCorrect = currentMatch === item.correctConceptId;
          const isSelected = selectedDeviceId === item.id;
          const isWrong = !!currentMatch && !isCorrect;

          let padColor = item.color;
          if (isCorrect) padColor = '#10b981';
          else if (isWrong) padColor = '#ef4444';
          else if (isSelected) padColor = '#f59e0b';

          return (
            <group
              key={`m3_dev_${item.id}`}
              position={[item.posX, 0.08, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDevice(isSelected ? null : item.id);
              }}
            >
              {/* Pad Frame */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.98, 0.08, 1.84]} />
                <meshStandardMaterial
                  color={isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? '#f59e0b' : '#ffffff'}
                  emissive={padColor}
                  emissiveIntensity={isCorrect ? 0.4 : isSelected ? 0.5 : 0.05}
                  roughness={0.2}
                  metalness={0.3}
                />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[1.78, 0.06, 1.64]} />
                <meshStandardMaterial
                  color={isCorrect ? '#ecfdf5' : isWrong ? '#fef2f2' : isSelected ? '#fffbeb' : '#f8fafc'}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 1.45]} />
                <meshBasicMaterial
                  color={padColor}
                  wireframe
                  transparent
                  opacity={isCorrect ? 0.35 : isSelected ? 0.5 : 0.2}
                />
              </mesh>

              {/* 3D Model Placed */}
              <group position={[0, 0.2, 0]}>
                {item.id === 'CAMERA_BULLET' && (
                  <M3IpCamera3D isSelected={isSelected} isCorrect={isCorrect} isFlowing={isFlowing} />
                )}
                {item.id === 'POE_SWITCH_8P' && (
                  <M3PoeSwitch3D isSelected={isSelected} isCorrect={isCorrect} isFlowing={isFlowing} />
                )}
                {item.id === 'NVR_8CH' && (
                  <M3Nvr3D isSelected={isSelected} isCorrect={isCorrect} isFlowing={isFlowing} />
                )}
                {item.id === 'ROUTER' && (
                  <M3Router3D isSelected={isSelected} isCorrect={isCorrect} isFlowing={isFlowing} />
                )}
                {item.id === 'CLIENT_PC' && (
                  <M3Monitor3D isSelected={isSelected} isCorrect={isCorrect} isFlowing={isFlowing} />
                )}
              </group>

              {/* Status Badge */}
              <Html position={[0, 0.12, 1.05]} center distanceFactor={4.8} style={{ pointerEvents: 'none' }}>
                <div
                  className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold font-mono tracking-wider border shadow-md whitespace-nowrap select-none ${
                    isCorrect
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
                      : isWrong
                      ? 'bg-rose-600 text-white border-rose-400 shadow-rose-500/30'
                      : isSelected
                      ? 'bg-amber-600 text-white border-amber-300 shadow-amber-500/30 animate-pulse'
                      : 'bg-white/95 text-slate-800 border-slate-300 shadow-slate-400/20'
                  }`}
                >
                  {isCorrect ? `✓ ${item.roleTh}` : isSelected ? `กำลังเลือก ➜ ${item.nameTh}` : item.nameTh}
                </div>
              </Html>
            </group>
          );
        })}

        {/* 3D Spline Cables */}
        {isCamCorrect && isPoeCorrect && (
          <M3SplineCable
            startPos={[-4.2, 0.4, 0]}
            endPos={[-2.5, 0.35, 0.2]}
            cableColor="#0284c7"
            glowColor="#38bdf8"
            isFlowing={isFlowing}
          />
        )}
        {isPoeCorrect && isNvrCorrect && (
          <M3SplineCable
            startPos={[-1.9, 0.35, 0.2]}
            endPos={[-0.3, 0.35, -0.2]}
            cableColor="#f59e0b"
            glowColor="#fbbf24"
            isFlowing={isFlowing}
          />
        )}
        {isNvrCorrect && isRouterCorrect && (
          <M3SplineCable
            startPos={[0.3, 0.35, -0.2]}
            endPos={[1.9, 0.35, -0.2]}
            cableColor="#3b82f6"
            glowColor="#60a5fa"
            isFlowing={isFlowing}
          />
        )}
        {isRouterCorrect && isClientCorrect && (
          <M3SplineCable
            startPos={[2.5, 0.35, 0.2]}
            endPos={[4.2, 0.4, 0]}
            cableColor="#1e293b"
            glowColor="#a855f7"
            isFlowing={isFlowing}
          />
        )}
      </group>

      <OrbitControls
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minDistance={6}
        maxDistance={15}
      />
    </>
  );
};

export const Room101Mission3IsometricCanvas: React.FC<Mission33DCanvasProps> = (props) => {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
      <Canvas shadows camera={{ position: [7.2, 9.5, 8.5], fov: 42 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <Mission3Scene {...props} />
      </Canvas>

      {/* Top Banner Guide in 3D Canvas */}
      <div className="absolute top-2.5 left-3 right-3 pointer-events-none flex items-center justify-between z-10 text-xs">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-300 text-slate-800 font-semibold flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>3D Device Function Lab · คลิกเลือกอุปกรณ์ 3D บนโต๊ะเพื่อเลือกหน้าที่ หรือใช้รายการด้านล่าง</span>
        </div>
        <div className="hidden sm:block bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-300 text-[11px] text-slate-600 font-medium shadow-sm">
          หมุนมุมมอง 3D ได้อิสระ
        </div>
      </div>
    </div>
  );
};
