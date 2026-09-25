'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRoleplayStore } from '../../../store/useRoleplayStore';

// Type definition for slot items
export interface Mission13DCanvasProps {
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onSlotClick: (index: number) => void;
}

// Data mapping for the 4 pipeline stages
const STAGE_CONFIGS = [
  {
    index: 0,
    cardId: 'M1_LENS',
    label: 'ขั้นตอนที่ 1: เลนส์และไฟ IR',
    nameTh: 'Optical Lens & IR',
    posX: -3.3,
    color: '#0284c7',
    accentColor: '#38bdf8',
  },
  {
    index: 1,
    cardId: 'M1_SENSOR',
    label: 'ขั้นตอนที่ 2: เซนเซอร์รับภาพ',
    nameTh: 'CMOS Image Sensor',
    posX: -1.1,
    color: '#059669',
    accentColor: '#10b981',
  },
  {
    index: 2,
    cardId: 'M1_PROCESSOR',
    label: 'ขั้นตอนที่ 3: ชิปประมวลผล ISP',
    nameTh: 'ISP SoC & Motherboard',
    posX: 1.1,
    color: '#4f46e5',
    accentColor: '#818cf8',
  },
  {
    index: 3,
    cardId: 'M1_LAN',
    label: 'ขั้นตอนที่ 4: พอร์ต PoE & เครือข่าย',
    nameTh: 'RJ45 PoE Interface',
    posX: 3.3,
    color: '#d97706',
    accentColor: '#f59e0b',
  },
];

// Shuffled tray layout so components are NOT placed directly underneath corresponding sockets
const SHUFFLED_TRAY_ITEMS = [
  { cardId: 'M1_LAN', nameTh: 'RJ45 PoE Interface', posX: -3.3 },
  { cardId: 'M1_LENS', nameTh: 'Optical Lens & IR', posX: -1.1 },
  { cardId: 'M1_PROCESSOR', nameTh: 'ISP SoC & Motherboard', posX: 1.1 },
  { cardId: 'M1_SENSOR', nameTh: 'CMOS Image Sensor', posX: 3.3 },
];

// 1. 3D Optical Lens Component with Night Vision IR LEDs & IR-Cut Filter
const Lens3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Outer Anodized Aluminum Lens Barrel */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.74, 0.78, 0.5, 32]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#38bdf8' : '#1e293b'}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Focus & Zoom Ribbed Grip Rings */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.79, 0.79, 0.12, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Blue Anodized Aperture Rim */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.04, 32]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Multi-Coated Convex Optical Glass Element */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.92}
          opacity={0.88}
          transparent
          roughness={0.03}
          ior={1.55}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Lens Reflection Core */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
        <meshPhysicalMaterial
          color="#818cf8"
          transmission={0.7}
          opacity={0.5}
          transparent
          roughness={0.1}
        />
      </mesh>

      {/* IR LED Night-Vision Ring: 6 Infrared Diodes around the lens */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 0.62;
        return (
          <mesh
            key={`ir_led_${i}`}
            position={[Math.cos(angle) * r, 0.26, Math.sin(angle) * r]}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.05, 0.06, 12]} />
            <meshStandardMaterial
              color="#dc2626"
              emissive="#ef4444"
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Light Sensor Photocell (CDS) */}
      <mesh position={[0, 0.26, -0.62]}>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

// 2. 3D CMOS Image Sensor Component with Ceramic Die & IR-Cut Glass
const Sensor3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Green Electronic PCB Substrate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.12, 1.35]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : '#065f46'}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {([
        [-0.55, -0.55],
        [0.55, -0.55],
        [-0.55, 0.55],
        [0.55, 0.55],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={`mount_pad_${i}`} position={[x, 0.065, z]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Ceramic Sensor Housing Cavity */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.98, 0.06, 0.98]} />
        <meshStandardMaterial color="#022c22" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* 1/2.8" Iridescent Silicon Sensor Die */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.82, 0.02, 0.82]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#34d399' : '#059669'}
          metalness={0.9}
          roughness={0.1}
          emissive={isWrong ? '#ef4444' : '#10b981'}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* IR-Cut Filter Protective Glass Tint */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.88, 0.02, 0.88]} />
        <meshPhysicalMaterial
          color="#ec4899"
          transmission={0.85}
          opacity={0.45}
          transparent
          roughness={0.05}
          ior={1.5}
        />
      </mesh>

      {/* Golden Leadframe Pins */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.42, 0.03, 1.42]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
};

// 3. 3D ISP Processor Chip Component with Finned Heatsink & Motherboard
const Processor3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* High-Tech Motherboard Base PCB */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.12, 1.35]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : '#0f172a'}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Gold Edge Connector / Traces */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[1.25, 0.01, 1.25]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Main ISP SoC Package */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.95, 0.08, 0.95]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : '#1e1b4b'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Finned Aluminum Heatsink for Thermal Dissipation (4 Silver Cooling Fins) */}
      <group position={[0, 0.18, 0]}>
        {[-0.24, -0.08, 0.08, 0.24].map((z, idx) => (
          <mesh key={`fin_${idx}`} position={[0, 0.07, z]} castShadow>
            <boxGeometry args={[0.85, 0.14, 0.04]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        ))}
        {/* Heatsink Base Plate */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.86, 0.03, 0.86]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* LPDDR RAM Chip alongside ISP */}
      <mesh position={[0.42, 0.1, 0.42]}>
        <boxGeometry args={[0.3, 0.06, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Glowing Neural Engine Activity Core */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={isSelected ? 1.4 : 0.8}
        />
      </mesh>
    </group>
  );
};

// 4. 3D RJ45 LAN Interface Component with Status LEDs & Waterproof Gland
const LanPort3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Shielded Metal Modular Jack Body */}
      <mesh castShadow receiveShadow position={[0, 0.32, -0.05]}>
        <boxGeometry args={[1.1, 0.65, 1.1]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#fbbf24' : '#64748b'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* RJ45 Plug Cavity */}
      <mesh position={[0, 0.32, 0.51]}>
        <boxGeometry args={[0.7, 0.46, 0.1]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* 8 Gold-Plated Terminal Pins */}
      <mesh position={[0, 0.4, 0.48]}>
        <boxGeometry args={[0.55, 0.04, 0.1]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Dual Activity LEDs (Green Link & Amber PoE/Activity) */}
      <mesh position={[-0.32, 0.58, 0.52]}>
        <boxGeometry args={[0.1, 0.06, 0.03]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0.32, 0.58, 0.52]}>
        <boxGeometry args={[0.1, 0.06, 0.03]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.0} />
      </mesh>

      {/* Waterproof Cable Gland & Pigtail Cable Exit (Backside) */}
      <group position={[0, 0.32, -0.75]}>
        {/* Threaded Hex Nut Gland */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.35, 6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Rubber Seal Ring */}
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[0.36, 0.05, 12, 24]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
        {/* Cable Tube */}
        <mesh position={[0, 0, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.4, 16]} />
          <meshStandardMaterial color="#020617" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// Particle / Beam flow between stages
const PipelineBeamFlow: React.FC<{
  fromX: number;
  toX: number;
  isActive: boolean;
  isCompletedFull: boolean;
  type: 'LIGHT' | 'ANALOG' | 'DIGITAL';
}> = ({ fromX, toX, isActive, isCompletedFull, type }) => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = 16;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!particlesRef.current || !isActive) return;
    const t = clock.getElapsedTime() * (type === 'DIGITAL' ? 3.0 : 2.2);

    for (let i = 0; i < count; i++) {
      const progress = ((i / count + t * 0.4) % 1.0);
      const curX = fromX + (toX - fromX) * progress;
      const curY = 0.5 + Math.sin(progress * Math.PI) * (type === 'LIGHT' ? 0.08 : 0.04);
      const curZ = Math.sin(progress * Math.PI * 4 + i) * 0.05;

      dummy.position.set(curX, curY, curZ);
      const scale = isActive ? 0.08 + Math.sin(progress * Math.PI) * 0.06 : 0.001;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  let beamColor = '#38bdf8';
  if (type === 'ANALOG') beamColor = '#10b981';
  if (type === 'DIGITAL') beamColor = '#818cf8';

  return (
    <group>
      {/* Solid Guide Wire / Laser Core */}
      <mesh position={[(fromX + toX) / 2, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, Math.abs(toX - fromX), 12]} />
        <meshStandardMaterial
          color={beamColor}
          emissive={beamColor}
          emissiveIntensity={isActive ? (isCompletedFull ? 1.2 : 0.8) : 0.1}
          transparent
          opacity={isActive ? 0.85 : 0.25}
        />
      </mesh>

      {/* Instanced Pulsing Data Particles */}
      {isActive && (
        <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={beamColor} />
        </instancedMesh>
      )}
    </group>
  );
};

// Main 3D Scene Inside the Canvas
const IsometricWorkbenchScene: React.FC<Mission13DCanvasProps> = ({
  selectedCardId,
  onSelectCard,
  onSlotClick,
}) => {
  const mission1Slots = useRoleplayStore((s) => s.mission1Slots);
  const isMissionComplete = useRoleplayStore((s) => s.missions.M1.isCompleted);

  // Determine stage flow active statuses
  const isStep1Placed = mission1Slots[0]?.status === 'CORRECT';
  const isStep2Placed = isStep1Placed && mission1Slots[1]?.status === 'CORRECT';
  const isStep3Placed = isStep2Placed && mission1Slots[2]?.status === 'CORRECT';
  const isStep4Placed = isStep3Placed && mission1Slots[3]?.status === 'CORRECT';

  return (
    <>
      {/* Studio Workbench Clear Background */}
      <color attach="background" args={['#0b1329']} />

      {/* Lighting tailored for High-Tech Electronics Workbench */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[8, 14, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-8, 10, -6]} intensity={0.7} color="#38bdf8" />
      <pointLight position={[0, 4, 1]} intensity={0.8} distance={16} color="#ffffff" />
      <pointLight position={[0, 1.5, -2]} intensity={0.5} distance={10} color="#0ea5e9" />

      {/* ========================================================
          1. 3D Cutaway Bullet IP Camera Chassis (Horizontal Cradle)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Anti-Static Laboratory Workbench Base Mat */}
        <mesh position={[0, -0.22, 0.4]} receiveShadow>
          <boxGeometry args={[9.6, 0.25, 5.2]} />
          <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* High-Tech Measurement Grid Lines */}
        <gridHelper args={[9.2, 18, 0x0284c7, 0x1e293b]} position={[0, -0.09, 0.4]} />

        {/* Realistic Cutaway Security Camera Lower Cradle (Horizontal along X axis) */}
        <group position={[0, 0.18, 0]}>
          {/* Half-cylinder cradle body opening upward: rotated horizontally */}
          <mesh rotation={[0, 0, Math.PI / 2]} receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 8.4, 36, 1, false, Math.PI, Math.PI]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Interior Dark Anti-Glare Coating */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.02, 0]}>
            <cylinderGeometry args={[1.46, 1.46, 8.35, 36, 1, false, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>

          {/* Front Bezel Collar (X = -4.2) */}
          <group position={[-4.2, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.58, 1.58, 0.2, 36, 1, false, Math.PI, Math.PI]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
            {/* Orange Silicone Waterproof O-Ring */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[1.51, 0.04, 12, 36, Math.PI]} />
              <meshStandardMaterial color="#f97316" roughness={0.4} />
            </mesh>
          </group>

          {/* Rear Endcap & 3-Axis Swivel Wall Bracket (X = +4.2) */}
          <group position={[4.2, 0, 0]}>
            {/* Rear Endcap half-ring */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.56, 1.56, 0.22, 36, 1, false, Math.PI, Math.PI]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Swivel Arm Joint */}
            <mesh position={[0.28, -0.3, 0]}>
              <sphereGeometry args={[0.38, 20, 20]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0.65, -0.45, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.22, 0.26, 0.7, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
            </mesh>
          </group>

          {/* Top Sunshield Visor (Rear Half-Cutaway Arch: positioned behind, doesn't block top view) */}
          <mesh position={[0, 0.65, -0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.68, 1.68, 7.8, 36, 1, false, Math.PI * 0.72, Math.PI * 0.56]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.2}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* ========================================================
            2. Real-Time Photon Beam & Signal Particle Transmissions
           ======================================================== */}
        <PipelineBeamFlow
          fromX={-3.3}
          toX={-1.1}
          isActive={isStep1Placed}
          isCompletedFull={isMissionComplete}
          type="LIGHT"
        />
        <PipelineBeamFlow
          fromX={-1.1}
          toX={1.1}
          isActive={isStep2Placed}
          isCompletedFull={isMissionComplete}
          type="ANALOG"
        />
        <PipelineBeamFlow
          fromX={1.1}
          toX={3.3}
          isActive={isStep3Placed}
          isCompletedFull={isMissionComplete}
          type="DIGITAL"
        />

        {/* Stage 4 Outgoing Network Pulse */}
        {isStep4Placed && (
          <group position={[4.1, 0.45, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.32, 0.9, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={1.2}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        )}

        {/* ========================================================
            3. The 4 Interactive Sockets & Placed 3D Models
           ======================================================== */}
        {STAGE_CONFIGS.map((stage) => {
          const slot = mission1Slots[stage.index];
          const placedItem = slot?.currentPlacedItem;
          const isCorrect = slot?.status === 'CORRECT';
          const isWrong = slot?.status === 'WRONG_ORDER' || slot?.status === 'WRONG_TYPE';
          const isTargeted = selectedCardId !== null;

          // Socket theme color
          let socketGlowColor = stage.accentColor;
          if (isCorrect) socketGlowColor = '#10b981';
          else if (isWrong) socketGlowColor = '#ef4444';
          else if (isTargeted) socketGlowColor = '#38bdf8';

          return (
            <group
              key={`socket_3d_${stage.index}`}
              position={[stage.posX, 0.08, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(stage.index);
              }}
            >
              {/* Distinct Socket Mounting Base with Stage Color Accent */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.7, 0.09, 1.7]} />
                <meshStandardMaterial
                  color={isCorrect ? '#064e3b' : isWrong ? '#450a0a' : '#0f172a'}
                  roughness={0.4}
                  metalness={0.6}
                />
              </mesh>

              {/* Glowing Neon Rim Accent */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.74, 0.02, 1.74]} />
                <meshStandardMaterial
                  color={socketGlowColor}
                  emissive={socketGlowColor}
                  emissiveIntensity={isCorrect ? 0.9 : isTargeted ? 0.8 : 0.4}
                />
              </mesh>

              {/* Inner Recessed Cavity */}
              <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[1.48, 0.06, 1.48]} />
                <meshStandardMaterial color="#020617" roughness={0.9} />
              </mesh>

              {/* Step Number Badge */}
              <Html
                position={[0, 0.12, 1.0]}
                center
                distanceFactor={4.8}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className={`px-2 py-0.5 rounded-full text-[8px] font-bold font-mono tracking-wider border shadow-lg whitespace-nowrap select-none ${
                    isCorrect
                      ? 'bg-emerald-950/95 text-emerald-300 border-emerald-400 shadow-emerald-500/30'
                      : isWrong
                      ? 'bg-rose-950/95 text-rose-300 border-rose-400'
                      : 'bg-slate-900/95 text-slate-300 border-slate-700'
                  }`}
                >
                  {isCorrect ? `✓ ${stage.label}` : `[ช่องที่ ${stage.index + 1}] ${stage.nameTh}`}
                </div>
              </Html>

              {/* Placed 3D Part Model or Distinct Ghost Hologram Guide */}
              {placedItem ? (
                <group position={[0, 0.38, 0]}>
                  {placedItem.id === 'M1_LENS' && <Lens3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_SENSOR' && <Sensor3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_PROCESSOR' && <Processor3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_LAN' && <LanPort3DModel isWrong={isWrong} />}
                </group>
              ) : (
                /* Ghost Hologram Wireframe Blueprint tailored to each specific component */
                <group position={[0, 0.35, 0]}>
                  {stage.index === 0 && (
                    /* Lens Wireframe Blueprint */
                    <mesh>
                      <cylinderGeometry args={[0.72, 0.72, 0.45, 18]} />
                      <meshBasicMaterial
                        color={isTargeted ? '#38bdf8' : stage.accentColor}
                        wireframe
                        transparent
                        opacity={isTargeted ? 0.75 : 0.35}
                      />
                    </mesh>
                  )}
                  {stage.index === 1 && (
                    /* Sensor Wireframe Blueprint */
                    <mesh>
                      <boxGeometry args={[1.3, 0.16, 1.3]} />
                      <meshBasicMaterial
                        color={isTargeted ? '#38bdf8' : stage.accentColor}
                        wireframe
                        transparent
                        opacity={isTargeted ? 0.75 : 0.35}
                      />
                    </mesh>
                  )}
                  {stage.index === 2 && (
                    /* Processor Wireframe Blueprint */
                    <mesh>
                      <boxGeometry args={[1.3, 0.28, 1.3]} />
                      <meshBasicMaterial
                        color={isTargeted ? '#38bdf8' : stage.accentColor}
                        wireframe
                        transparent
                        opacity={isTargeted ? 0.75 : 0.35}
                      />
                    </mesh>
                  )}
                  {stage.index === 3 && (
                    /* LAN Interface Wireframe Blueprint */
                    <mesh position={[0, 0.15, 0]}>
                      <boxGeometry args={[1.1, 0.65, 1.1]} />
                      <meshBasicMaterial
                        color={isTargeted ? '#38bdf8' : stage.accentColor}
                        wireframe
                        transparent
                        opacity={isTargeted ? 0.75 : 0.35}
                      />
                    </mesh>
                  )}
                </group>
              )}
            </group>
          );
        })}

        {/* ========================================================
            4. 3D Bottom Component Shelf (Shuffled Unplaced Parts)
           ======================================================== */}
        <group position={[0, 0, 2.3]}>
          {/* Component Tray Shelf Bench */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[9.2, 0.14, 1.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* Shuffled Tray items */}
          {SHUFFLED_TRAY_ITEMS.map((item) => {
            const isPlaced = mission1Slots.some(
              (s) => s.currentPlacedItem?.id === item.cardId
            );
            const isSelected = selectedCardId === item.cardId;

            return (
              <group
                key={`tray_3d_${item.cardId}`}
                position={[item.posX, 0.2, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCard(isSelected ? null : item.cardId);
                }}
              >
                {/* Tray Pedestal */}
                <mesh receiveShadow>
                  <cylinderGeometry args={[0.55, 0.6, 0.1, 24]} />
                  <meshStandardMaterial
                    color={isSelected ? '#38bdf8' : '#1e293b'}
                    emissive={isSelected ? '#38bdf8' : '#000000'}
                    emissiveIntensity={isSelected ? 0.6 : 0}
                  />
                </mesh>

                {/* Floating 3D Part on Tray (Only if not placed yet) */}
                {!isPlaced && (
                  <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <group position={[0, 0.35, 0]} scale={0.75}>
                      {item.cardId === 'M1_LENS' && <Lens3DModel isSelected={isSelected} />}
                      {item.cardId === 'M1_SENSOR' && <Sensor3DModel isSelected={isSelected} />}
                      {item.cardId === 'M1_PROCESSOR' && (
                        <Processor3DModel isSelected={isSelected} />
                      )}
                      {item.cardId === 'M1_LAN' && <LanPort3DModel isSelected={isSelected} />}
                    </group>
                  </Float>
                )}

                {/* HTML Label under tray part */}
                <Html position={[0, -0.05, 0.55]} center distanceFactor={4.8}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCard(isSelected ? null : item.cardId);
                    }}
                    className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold whitespace-nowrap transition-transform cursor-pointer select-none ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 scale-105 shadow-sm shadow-sky-500/50'
                        : isPlaced
                        ? 'bg-slate-800/80 text-slate-500 line-through opacity-50'
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {isPlaced ? 'ประกอบแล้ว' : isSelected ? 'กำลังถือ ➜' : item.nameTh}
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

export const Room101Mission1IsometricCanvas: React.FC<Mission13DCanvasProps> = (props) => {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
      <Canvas
        shadows
        camera={{ position: [6.5, 8.5, 7.5], fov: 38 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <IsometricWorkbenchScene {...props} />
      </Canvas>

      {/* Top Banner Guide in 3D Canvas */}
      <div className="absolute top-2.5 left-3 right-3 pointer-events-none flex items-center justify-between z-10 text-xs">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-300 text-slate-800 font-semibold flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <span>3D Isometric Workbench · คลิกเลือกชิ้นส่วน 3D ด้านล่างแล้วคลิกที่ช่อง Socket</span>
        </div>
        <div className="hidden sm:block bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-300 text-[11px] text-slate-600 font-medium shadow-sm">
          หมุนมุมมองได้เล็กน้อย
        </div>
      </div>
    </div>
  );
};
