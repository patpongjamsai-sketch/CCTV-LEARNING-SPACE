'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRoleplayStore } from '../../../store/useRoleplayStore';

export interface Mission23DCanvasProps {
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onSlotClick: (index: number) => void;
  isTestingFlow?: boolean;
  onTriggerTest?: () => void;
}

// 4 Stages in IP CCTV Data Flow
export const M2_STAGE_CONFIGS = [
  {
    index: 0,
    cardId: 'M2_CAM',
    label: 'จุดที่ 1: กล้องวงจรปิด IP',
    nameTh: 'IP Bullet Camera',
    specTh: '4K H.265 / PoE Class 3',
    posX: -4.0,
    color: '#06b6d4',
  },
  {
    index: 1,
    cardId: 'M2_POE_SW',
    label: 'จุดที่ 2: สวิตช์ PoE',
    nameTh: '8-Port PoE Switch',
    specTh: '8x RJ45 100M + 2x GbE Uplink',
    posX: -1.35,
    color: '#10b981',
  },
  {
    index: 2,
    cardId: 'M2_NVR',
    label: 'จุดที่ 3: เครื่องบันทึก NVR',
    nameTh: '8-CH 4K NVR Recorder',
    specTh: '1x GbE LAN + 1x HDMI 4K',
    posX: 1.35,
    color: '#8b5cf6',
  },
  {
    index: 3,
    cardId: 'M2_CLIENT',
    label: 'จุดที่ 4: จอมอนิเตอร์ / Client',
    nameTh: 'Client Monitor / PC',
    specTh: 'HDMI 4K 60Hz Live View',
    posX: 4.0,
    color: '#f59e0b',
  },
];

// ============================================================================
// 1. Procedural 3D Models for CCTV Hardware
// ============================================================================

/** 3D IP Bullet Camera */
export const IpCamera3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isWrong,
  isFlowing,
}) => {
  const ledRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ledRef.current && isFlowing) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 8) * 0.5;
      }
    }
  });

  return (
    <group rotation={[0.05, 0.45, 0]}>
      {/* Wall/Desk Mounting Base Plate */}
      <mesh position={[-0.4, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.35, 0.08, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Articulated Swivel Arm */}
      <mesh position={[-0.22, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.42, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main Bullet Housing Body */}
      <group position={[0.1, 0.42, 0]} rotation={[0, 0, -0.1]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.32, 0.85, 32]} />
          <meshStandardMaterial
            color={isWrong ? '#7f1d1d' : isSelected ? '#38bdf8' : '#e2e8f0'}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Top Weatherproof Sunshield Hood */}
        <mesh position={[0, 0.12, 0.08]} castShadow>
          <boxGeometry args={[0.38, 0.9, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Front Dark Optical Bezel */}
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.05, 32]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Glass Lens Element with Blue Reflection */}
        <mesh position={[0, 0.46, 0]}>
          <sphereGeometry args={[0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.85}
            opacity={0.9}
            transparent
            roughness={0.05}
            ior={1.5}
            clearcoat={1}
          />
        </mesh>

        {/* IR Night Vision Array Rim */}
        <mesh position={[0, 0.45, 0]}>
          <ringGeometry args={[0.22, 0.28, 24]} />
          <meshBasicMaterial color={isFlowing ? '#ef4444' : '#334155'} />
        </mesh>

        {/* Status / Link LED */}
        <mesh ref={ledRef} position={[0.22, 0.3, 0.15]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={isFlowing ? 1.0 : 0.4}
          />
        </mesh>

        {/* Pigtail Cable Lead with RJ45 Port Socket */}
        <mesh position={[-0.2, -0.45, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.2, -0.58, 0]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.22]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

/** 3D 8-Port PoE Switch */
export const PoeSwitch3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isWrong,
  isFlowing,
}) => {
  const ledPulseRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ledPulseRef.current && isFlowing) {
      const t = clock.getElapsedTime() * 12;
      ledPulseRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.3 + (Math.sin(t + i * 1.5) > 0 ? 0.8 : 0);
        }
      });
    }
  });

  return (
    <group position={[0, 0.16, 0]} rotation={[0, 0.2, 0]}>
      {/* 1U Metal Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.32, 1.15]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : isSelected ? '#38bdf8' : '#0f172a'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Front Faceplate Inset */}
      <mesh position={[0, 0, 0.58]}>
        <boxGeometry args={[1.48, 0.26, 0.02]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 8x RJ45 PoE Ports Bay */}
      <group position={[-0.22, -0.02, 0.59]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={`rj45_port_${i}`} position={[(i % 4) * 0.16 - 0.24, i < 4 ? 0.05 : -0.05, 0]}>
            {/* RJ45 Shielded Metal Jack */}
            <mesh>
              <boxGeometry args={[0.13, 0.08, 0.03]} />
              <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Port Cavity */}
            <mesh position={[0, 0, 0.015]}>
              <boxGeometry args={[0.1, 0.06, 0.01]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2x Gigabit Uplink SFP Ports */}
      <group position={[0.5, 0, 0.59]}>
        <mesh position={[-0.08, 0, 0]}>
          <boxGeometry args={[0.13, 0.14, 0.03]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <boxGeometry args={[0.13, 0.14, 0.03]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* LED Activity Indicators Array */}
      <group ref={ledPulseRef} position={[-0.22, 0.1, 0.59]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`led_${i}`} position={[i * 0.08 - 0.28, 0, 0]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={isFlowing ? 0.8 : 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* PoE Power LED & Logo */}
      <mesh position={[0.62, 0.09, 0.59]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  );
};

/** 3D 8-CH NVR (Network Video Recorder) */
export const Nvr3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean; isFlowing?: boolean }> = ({
  isSelected,
  isWrong,
  isFlowing,
}) => {
  const hddLedRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (hddLedRef.current && isFlowing) {
      const mat = hddLedRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.2 + (Math.sin(clock.getElapsedTime() * 18) > 0.3 ? 0.9 : 0);
      }
    }
  });

  return (
    <group position={[0, 0.16, 0]} rotation={[0, -0.2, 0]}>
      {/* NVR Metal Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.34, 1.35]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : isSelected ? '#818cf8' : '#090d16'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Front Glossy Bezel Accent */}
      <mesh position={[0, 0, 0.68]}>
        <boxGeometry args={[1.72, 0.28, 0.02]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.7} roughness={0.15} />
      </mesh>

      {/* Front NVR Metallic Emblem */}
      <mesh position={[-0.6, 0.05, 0.69]}>
        <boxGeometry args={[0.3, 0.08, 0.01]} />
        <meshStandardMaterial color="#6366f1" emissive="#4338ca" emissiveIntensity={0.6} />
      </mesh>

      {/* Status LEDs (Power, Net, HDD Recording) */}
      <group position={[0.5, 0.05, 0.69]}>
        {/* Power LED (Blue) */}
        <mesh position={[-0.15, 0, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
        </mesh>
        {/* Net Link LED (Green) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={isFlowing ? 0.9 : 0.3}
          />
        </mesh>
        {/* HDD Write Activity LED (Red Blinking) */}
        <mesh ref={hddLedRef} position={[0.15, 0, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isFlowing ? 0.9 : 0.2}
          />
        </mesh>
      </group>

      {/* Front USB Port */}
      <mesh position={[0.65, -0.06, 0.69]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear Panel Ports (LAN & HDMI) */}
      <group position={[0, 0, -0.68]}>
        {/* LAN RJ45 Port */}
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} />
        </mesh>
        {/* HDMI Gold Port */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.18, 0.08, 0.03]} />
          <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

/** 3D Client Monitor / PC Screen with Live View Simulation */
export const ClientMonitor3DModel: React.FC<{
  isSelected?: boolean;
  isWrong?: boolean;
  isFlowing?: boolean;
  isSystemReady?: boolean;
}> = ({ isSelected, isWrong, isFlowing, isSystemReady }) => {
  const [timeString, setTimeString] = useState<string>('12:00:00');

  useFrame(() => {
    if (isFlowing || isSystemReady) {
      const now = new Date();
      const timePart = now.toTimeString().split(' ')[0] || '12:00:00';
      setTimeString(timePart);
    }
  });

  return (
    <group position={[0, 0.38, 0]} rotation={[0, -0.38, 0]}>
      {/* Monitor Stand Base */}
      <mesh position={[0, -0.34, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.05, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Monitor Stand Upright Stem */}
      <mesh position={[0, -0.12, -0.1]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.1]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Monitor Outer Frame / Bezel */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.9, 1.25, 0.08]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : isSelected ? '#38bdf8' : '#0f172a'}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* 3D Screen Surface with Dynamic Display */}
      <mesh position={[0, 0.28, 0.045]}>
        <planeGeometry args={[1.8, 1.15]} />
        <meshStandardMaterial
          color={isSystemReady || isFlowing ? '#0f291e' : '#020617'}
          emissive={isSystemReady || isFlowing ? '#059669' : '#0f172a'}
          emissiveIntensity={isSystemReady || isFlowing ? 0.35 : 0.1}
          roughness={0.1}
        />
      </mesh>

      {/* HTML Overlay on Screen Surface */}
      <Html
        position={[0, 0.28, 0.05]}
        transform
        distanceFactor={1.3}
        className="pointer-events-none select-none"
      >
        <div className="w-[300px] h-[190px] rounded-lg bg-slate-950 flex flex-col justify-between p-2.5 font-mono text-[10px] text-white border border-slate-700 shadow-2xl overflow-hidden relative">
          {isSystemReady || isFlowing ? (
            /* Live Stream Active Feed */
            <>
              {/* Simulated Camera Feed Background Graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-sky-950/70 -z-10 flex items-center justify-center">
                <div className="relative w-full h-full opacity-40">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                  {/* Target Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-emerald-400/60 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Header Info */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-300 text-[11px]">
                    ● CAM 01 [LIVE 4K]
                  </span>
                </div>
                <div className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 text-[9px] text-emerald-300">
                  H.265 · 30 FPS · 8192 Kbps
                </div>
              </div>

              {/* Center Overlay Tag */}
              <div className="text-center z-10">
                <div className="inline-block px-2 py-0.5 rounded bg-slate-900/80 border border-emerald-500/50 text-emerald-200 font-bold text-[10px] shadow">
                  🏪 SMART MART · ENTRANCE GATE
                </div>
              </div>

              {/* Footer Timestamp & Status */}
              <div className="flex items-center justify-between text-[9px] text-slate-300 z-10 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold">SIGNAL: OPTIMAL 100%</span>
                <span className="font-mono text-slate-100">{timeString}</span>
              </div>
            </>
          ) : (
            /* Standby / No Signal Screen */
            <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-sm animate-pulse">
                ✕
              </div>
              <div>
                <div className="font-bold text-rose-400 text-xs tracking-wider">
                  NO HDMI VIDEO SIGNAL
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  โปรดเชื่อมต่อสายส่งข้อมูลให้ถูกต้อง
                </div>
              </div>
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

interface CableSplineProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  cableColor: string;
  glowColor: string;
  isFlowing?: boolean;
  labelTh: string;
  cableType: 'CAT6' | 'HDMI';
}

export const SplineCable3D: React.FC<CableSplineProps> = ({
  startPos,
  endPos,
  cableColor,
  glowColor,
  isFlowing,
  labelTh,
  cableType,
}) => {
  const particleRef = useRef<THREE.Mesh>(null);

  // Generate a realistic drooping curve between ports
  const { curve, tubeGeometry } = useMemo(() => {
    const p0 = new THREE.Vector3(...startPos);
    const p3 = new THREE.Vector3(...endPos);

    // Droop midpoint down towards the workbench
    const midX = (p0.x + p3.x) / 2;
    const midZ = (p0.z + p3.z) / 2;
    const droopY = Math.min(p0.y, p3.y) - (cableType === 'HDMI' ? 0.35 : 0.45);

    const p1 = new THREE.Vector3(p0.x + 0.3, droopY, p0.z - 0.2);
    const p2 = new THREE.Vector3(p3.x - 0.3, droopY, p3.z - 0.2);

    const c = new THREE.CatmullRomCurve3([p0, p1, new THREE.Vector3(midX, droopY - 0.1, midZ), p2, p3]);
    const geo = new THREE.TubeGeometry(c, 48, cableType === 'HDMI' ? 0.045 : 0.038, 12, false);
    return { curve: c, tubeGeometry: geo };
  }, [startPos, endPos, cableType]);

  // Animate particle pulse along curve
  useFrame(({ clock }) => {
    if (particleRef.current && isFlowing) {
      const speed = cableType === 'HDMI' ? 1.2 : 0.9;
      const t = (clock.getElapsedTime() * speed) % 1;
      const pos = curve.getPointAt(t);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* 3D Physical Cable Tube */}
      <mesh geometry={tubeGeometry} castShadow>
        <meshStandardMaterial
          color={cableColor}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>

      {/* Floating Data Photon Particle */}
      {isFlowing && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Floating Cable Protocol Tag */}
      <Html
        position={[(startPos[0] + endPos[0]) / 2, Math.min(startPos[1], endPos[1]) - 0.35, (startPos[2] + endPos[2]) / 2]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider border shadow-lg whitespace-nowrap select-none flex items-center gap-1 ${
            isFlowing
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 animate-pulse'
              : 'bg-slate-900/90 text-slate-300 border-slate-700'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: glowColor }} />
          <span>{labelTh}</span>
        </div>
      </Html>
    </group>
  );
};

// ============================================================================
// 3. Main Isometric Workbench Scene
// ============================================================================

const IsometricWorkbenchScene: React.FC<Mission23DCanvasProps> = ({
  selectedCardId,
  onSelectCard,
  onSlotClick,
  isTestingFlow,
}) => {
  const mission2Slots = useRoleplayStore((s) => s.mission2Slots);
  const missionState = useRoleplayStore((s) => s.missions.M2);

  // Check which stages are currently placed correctly
  const isCamCorrect = mission2Slots[0]?.status === 'CORRECT';
  const isPoeCorrect = mission2Slots[1]?.status === 'CORRECT';
  const isNvrCorrect = mission2Slots[2]?.status === 'CORRECT';
  const isClientCorrect = mission2Slots[3]?.status === 'CORRECT';

  // Cable 1 connects Cam (0) -> PoE Switch (1)
  const isCable1Ready = isCamCorrect && isPoeCorrect;
  // Cable 2 connects PoE Switch (1) -> NVR (2)
  const isCable2Ready = isPoeCorrect && isNvrCorrect;
  // Cable 3 connects NVR (2) -> Monitor (3)
  const isCable3Ready = isNvrCorrect && isClientCorrect;

  const isFullSystemReady = isCamCorrect && isPoeCorrect && isNvrCorrect && isClientCorrect;
  const isFlowActive = isFullSystemReady && (isTestingFlow || missionState.isCompleted);

  return (
    <>
      {/* Studio Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-4, 4, 3]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[0, 4, 3]} intensity={0.6} color="#10b981" />
      <pointLight position={[4, 4, 3]} intensity={0.6} color="#8b5cf6" />

      {/* Main Workbench Assembly Group */}
      <group position={[0, -0.6, 0]}>
        {/* Workbench Table Top */}
        <mesh position={[0, -0.15, 0.4]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.25, 4.2]} />
          <meshStandardMaterial color="#0b1120" roughness={0.35} metalness={0.75} />
        </mesh>

        {/* Electrostatic Mat Surface (ESD Mat) */}
        <mesh position={[0, 0, 0.4]} receiveShadow>
          <boxGeometry args={[10.2, 0.04, 3.9]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.2} opacity={0.3} transparent />
        </mesh>

        {/* Workbench Front Trim with Glowing Accent */}
        <mesh position={[0, -0.15, 2.52]}>
          <boxGeometry args={[10.5, 0.12, 0.04]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
        </mesh>

        {/* ========================================================
            4 Device Socket Bays on Table
           ======================================================== */}
        {M2_STAGE_CONFIGS.map((stage) => {
          const slot = mission2Slots[stage.index];
          const placedItem = slot?.currentPlacedItem;
          const isCorrect = slot?.status === 'CORRECT';
          const isWrong = slot?.status === 'WRONG_ORDER' || slot?.status === 'WRONG_TYPE';
          const isTargeted = selectedCardId !== null && !placedItem;

          let socketColor = '#1e293b';
          if (isCorrect) socketColor = '#10b981';
          else if (isWrong) socketColor = '#ef4444';
          else if (isTargeted) socketColor = '#06b6d4';

          return (
            <group
              key={`m2_socket_3d_${stage.index}`}
              position={[stage.posX, 0.08, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(stage.index);
              }}
            >
              {/* Socket Pad Rim */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.1, 0.08, 1.9]} />
                <meshStandardMaterial
                  color={socketColor}
                  emissive={socketColor}
                  emissiveIntensity={isCorrect ? 0.35 : isTargeted ? 0.45 : 0.08}
                  roughness={0.3}
                  metalness={0.6}
                />
              </mesh>

              {/* Inner Recessed Cavity */}
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[1.85, 0.06, 1.65]} />
                <meshStandardMaterial color="#020617" roughness={0.8} />
              </mesh>

              {/* Step Number Badge */}
              <Html
                position={[0, 0.12, 1.05]}
                center
                distanceFactor={10}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border shadow-lg whitespace-nowrap select-none ${
                    isCorrect
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400'
                      : isWrong
                      ? 'bg-rose-950/90 text-rose-300 border-rose-400'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700'
                  }`}
                >
                  {isCorrect ? `✓ ลำดับที่ ${stage.index + 1}` : `[ช่องที่ ${stage.index + 1}]`}
                </div>
              </Html>

              {/* Placed 3D Hardware Model */}
              {placedItem ? (
                <group position={[0, 0.2, 0]}>
                  {placedItem.id === 'M2_CAM' && (
                    <IpCamera3DModel isWrong={isWrong} isFlowing={isFlowActive} />
                  )}
                  {placedItem.id === 'M2_POE_SW' && (
                    <PoeSwitch3DModel isWrong={isWrong} isFlowing={isFlowActive} />
                  )}
                  {placedItem.id === 'M2_NVR' && (
                    <Nvr3DModel isWrong={isWrong} isFlowing={isFlowActive} />
                  )}
                  {placedItem.id === 'M2_CLIENT' && (
                    <ClientMonitor3DModel
                      isWrong={isWrong}
                      isFlowing={isFlowActive}
                      isSystemReady={isFullSystemReady}
                    />
                  )}
                </group>
              ) : (
                /* Ghost Hologram placeholder when empty */
                <group position={[0, 0.3, 0]}>
                  <mesh>
                    <boxGeometry args={[1.2, 0.4, 1.0]} />
                    <meshBasicMaterial
                      color={isTargeted ? '#06b6d4' : '#64748b'}
                      wireframe
                      transparent
                      opacity={isTargeted ? 0.7 : 0.25}
                    />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}

        {/* ========================================================
            Dynamic 3D Spline Cables Connecting Slots
           ======================================================== */}
        {/* Cable 1: IP Camera -> PoE Switch (Cat6 Ethernet) */}
        {isCable1Ready && (
          <SplineCable3D
            startPos={[-3.8, 0.4, 0]}
            endPos={[-1.7, 0.35, 0.3]}
            cableColor="#0284c7"
            glowColor="#38bdf8"
            isFlowing={isFlowActive}
            labelTh="Cat6 (Video + PoE 48V)"
            cableType="CAT6"
          />
        )}

        {/* Cable 2: PoE Switch -> NVR (Cat6 Gigabit Uplink) */}
        {isCable2Ready && (
          <SplineCable3D
            startPos={[-1.0, 0.35, 0.3]}
            endPos={[0.9, 0.35, -0.3]}
            cableColor="#f59e0b"
            glowColor="#fbbf24"
            isFlowing={isFlowActive}
            labelTh="Cat6 (GbE IP Stream)"
            cableType="CAT6"
          />
        )}

        {/* Cable 3: NVR -> Monitor (HDMI Digital Video) */}
        {isCable3Ready && (
          <SplineCable3D
            startPos={[1.8, 0.35, -0.3]}
            endPos={[3.8, 0.4, -0.1]}
            cableColor="#1e293b"
            glowColor="#a855f7"
            isFlowing={isFlowActive}
            labelTh="HDMI 4K 60Hz"
            cableType="HDMI"
          />
        )}

        {/* ========================================================
            3D Bottom Component Shelf (Unplaced 3D Parts Pick-up)
           ======================================================== */}
        <group position={[0, 0, 2.3]}>
          {/* Component Tray Shelf */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[9.6, 0.12, 1.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
          </mesh>

          {M2_STAGE_CONFIGS.map((stage) => {
            const isPlaced = mission2Slots.some(
              (s) => s.currentPlacedItem?.id === stage.cardId
            );
            const isSelected = selectedCardId === stage.cardId;

            return (
              <group
                key={`m2_tray_3d_${stage.cardId}`}
                position={[stage.posX, 0.2, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCard(isSelected ? null : stage.cardId);
                }}
              >
                {/* Tray Pedestal */}
                <mesh receiveShadow>
                  <cylinderGeometry args={[0.55, 0.6, 0.1, 24]} />
                  <meshStandardMaterial
                    color={isSelected ? '#06b6d4' : '#1e293b'}
                    emissive={isSelected ? '#06b6d4' : '#000000'}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                  />
                </mesh>

                {/* Floating 3D Part on Tray (Only if not placed yet) */}
                {!isPlaced && (
                  <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <group position={[0, 0.35, 0]} scale={0.7}>
                      {stage.cardId === 'M2_CAM' && <IpCamera3DModel isSelected={isSelected} />}
                      {stage.cardId === 'M2_POE_SW' && <PoeSwitch3DModel isSelected={isSelected} />}
                      {stage.cardId === 'M2_NVR' && <Nvr3DModel isSelected={isSelected} />}
                      {stage.cardId === 'M2_CLIENT' && <ClientMonitor3DModel isSelected={isSelected} />}
                    </group>
                  </Float>
                )}

                {/* HTML Label under tray part */}
                <Html position={[0, -0.05, 0.55]} center distanceFactor={10}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCard(isSelected ? null : stage.cardId);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-transform cursor-pointer select-none ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 scale-105 shadow-md shadow-cyan-500/50'
                        : isPlaced
                        ? 'bg-slate-800/80 text-slate-500 line-through opacity-50'
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {isPlaced ? 'ติดตั้งแล้ว' : isSelected ? 'กำลังถือ ➜' : stage.nameTh}
                  </button>
                </Html>
              </group>
            );
          })}
        </group>
      </group>

      {/* OrbitControls locked for Top-down 3/4 Isometric Perspective */}
      <OrbitControls
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minDistance={6}
        maxDistance={14}
      />
    </>
  );
};

export const Room101Mission2IsometricCanvas: React.FC<Mission23DCanvasProps> = (props) => {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-inner">
      <Canvas
        shadows
        camera={{ position: [7.0, 9.0, 8.0], fov: 40 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <IsometricWorkbenchScene {...props} />
      </Canvas>

      {/* Top Banner Guide in 3D Canvas */}
      <div className="absolute top-2.5 left-3 right-3 pointer-events-none flex items-center justify-between z-10 text-xs">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/30 text-emerald-200 font-medium flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>3D Data Flow Lab · เลือกอุปกรณ์ 3D จากถาดล่างแล้ววางลงบนโต๊ะเพื่อเชื่อมต่อสายอัตโนมัติ</span>
        </div>
        <div className="hidden sm:block bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-slate-400">
          หมุนมุมมอง 3D ได้อิสระ
        </div>
      </div>
    </div>
  );
};
