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
    label: 'ขั้นตอนที่ 1: เลนส์ออปติคัล',
    nameTh: 'Optical Lens',
    posX: -3.3,
    color: '#38bdf8',
  },
  {
    index: 1,
    cardId: 'M1_SENSOR',
    label: 'ขั้นตอนที่ 2: เซนเซอร์รับภาพ',
    nameTh: 'CMOS Sensor',
    posX: -1.1,
    color: '#10b981',
  },
  {
    index: 2,
    cardId: 'M1_PROCESSOR',
    label: 'ขั้นตอนที่ 3: ชิปประมวลผล',
    nameTh: 'ISP SoC Processor',
    posX: 1.1,
    color: '#6366f1',
  },
  {
    index: 3,
    cardId: 'M1_LAN',
    label: 'ขั้นตอนที่ 4: พอร์ตเครือข่าย',
    nameTh: 'RJ45 LAN Interface',
    posX: 3.3,
    color: '#f59e0b',
  },
];

// 3D Optical Lens Component
const Lens3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Outer Metal Barrel */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.76, 0.45, 32]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#38bdf8' : '#334155'}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      {/* Aperture Accent Ring */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.05, 32]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Multi-Coated Convex Glass Element */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.88}
          opacity={0.85}
          transparent
          roughness={0.05}
          ior={1.52}
          clearcoat={1.0}
        />
      </mesh>
      {/* Inner Lens Reflection Core */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.2, 24]} />
        <meshPhysicalMaterial
          color="#a855f7"
          transmission={0.7}
          opacity={0.6}
          transparent
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// 3D CMOS Image Sensor Component
const Sensor3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Ceramic/PCB Substrate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.12, 1.25]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : '#064e3b'}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      {/* Silicon Die Cavity */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.95, 0.05, 0.95]} />
        <meshStandardMaterial color="#022c22" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Pixel Matrix Array (Iridescent Silicon) */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.82, 0.02, 0.82]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#34d399' : '#10b981'}
          metalness={0.85}
          roughness={0.15}
          emissive={isWrong ? '#ef4444' : '#10b981'}
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Gold Bond Wires & Outer Pin Rim */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.35, 0.04, 1.35]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
};

// 3D ISP Processor Chip Component
const Processor3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* BGA IC Chip Package */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.18, 1.3]} />
        <meshStandardMaterial
          color={isWrong ? '#7f1d1d' : '#0f172a'}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Metallic Heatspreader Top Plate */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.05, 0.04, 1.05]} />
        <meshStandardMaterial
          color={isWrong ? '#f87171' : isSelected ? '#818cf8' : '#475569'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {/* Glowing Neural ISP Core Emblem */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.55, 0.03, 0.55]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Solder Ball Grid Rim */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[1.34, 0.04, 1.34]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// 3D RJ45 LAN Interface Component
const LanPort3DModel: React.FC<{ isSelected?: boolean; isWrong?: boolean }> = ({ isSelected, isWrong }) => {
  return (
    <group>
      {/* Shielded Metal Jack Body */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.1, 0.75, 1.15]} />
        <meshStandardMaterial
          color={isWrong ? '#ef4444' : isSelected ? '#fbbf24' : '#64748b'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      {/* RJ45 Plug Cavity */}
      <mesh position={[0, 0.35, 0.55]}>
        <boxGeometry args={[0.7, 0.5, 0.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      {/* 8 Gold Pins */}
      <mesh position={[0, 0.42, 0.52]}>
        <boxGeometry args={[0.55, 0.04, 0.12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Dual Activity LEDs (Green Link + Amber Activity) */}
      <mesh position={[-0.32, 0.65, 0.56]}>
        <boxGeometry args={[0.12, 0.08, 0.04]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.32, 0.65, 0.56]}>
        <boxGeometry args={[0.12, 0.08, 0.04]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>
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
      {/* Studio White-Gray Background */}
      <color attach="background" args={['#f1f5f9']} />

      {/* Lighting tailored for Studio White-Gray Isometric View */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[10, 16, 8]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-8, 10, -6]} intensity={0.5} color="#e2e8f0" />
      <pointLight position={[0, 4, 0]} intensity={0.6} distance={15} color="#ffffff" />

      {/* ========================================================
          1. 3D Cutaway IP Camera Chassis & Circuit Board Platform
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Futuristic Workbench Base Platform */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[9.4, 0.35, 4.4]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* High-Tech Circuit Motherboard */}
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[8.8, 0.06, 3.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>
        <gridHelper args={[8.6, 20, 0x0284c7, 0x1e293b]} position={[0, 0.05, 0]} />

        {/* Cutaway Half-Cylinder Camera Bullet Body (Cutaway Housing) */}
        <group position={[0, 0.65, -0.6]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[1.55, 1.6, 8.4, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.8}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Cyan Trim Stripe */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[1.57, 1.62, 0.15, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Front Sunshield Visor */}
        <mesh position={[-4.2, 0.7, -0.6]}>
          <cylinderGeometry args={[1.65, 1.65, 0.6, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
        </mesh>

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
          <group position={[4.0, 0.5, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.3, 0.9, 16]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={1.0}
                transparent
                opacity={0.8}
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

          let slotBorderColor = '#334155';
          if (isCorrect) slotBorderColor = '#10b981';
          else if (isWrong) slotBorderColor = '#ef4444';
          else if (isTargeted) slotBorderColor = '#38bdf8';

          return (
            <group
              key={`socket_3d_${stage.index}`}
              position={[stage.posX, 0.08, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(stage.index);
              }}
            >
              {/* Socket Pad Rim */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.7, 0.08, 1.7]} />
                <meshStandardMaterial
                  color={slotBorderColor}
                  emissive={slotBorderColor}
                  emissiveIntensity={isCorrect ? 0.35 : isTargeted ? 0.4 : 0.08}
                  roughness={0.3}
                  metalness={0.6}
                />
              </mesh>

              {/* Inner Recessed Cavity */}
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[1.45, 0.06, 1.45]} />
                <meshStandardMaterial color="#020617" roughness={0.8} />
              </mesh>

              {/* Step Number Badge */}
              <Html
                position={[0, 0.12, 0.95]}
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
                  {isCorrect ? `✓ ขั้นที่ ${stage.index + 1}` : `[ช่องที่ ${stage.index + 1}]`}
                </div>
              </Html>

              {/* Placed 3D Part Model */}
              {placedItem ? (
                <group position={[0, 0.4, 0]}>
                  {placedItem.id === 'M1_LENS' && <Lens3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_SENSOR' && <Sensor3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_PROCESSOR' && <Processor3DModel isWrong={isWrong} />}
                  {placedItem.id === 'M1_LAN' && <LanPort3DModel isWrong={isWrong} />}
                </group>
              ) : (
                /* Ghost Hologram placeholder when empty */
                <group position={[0, 0.3, 0]}>
                  <mesh>
                    <boxGeometry args={[0.9, 0.35, 0.9]} />
                    <meshBasicMaterial
                      color={isTargeted ? '#38bdf8' : '#64748b'}
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
            4. 3D Bottom Component Shelf (Unplaced 3D Parts Pick-up)
           ======================================================== */}
        <group position={[0, 0, 2.3]}>
          {/* Component Tray Shelf */}
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <boxGeometry args={[8.8, 0.12, 1.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
          </mesh>

          {STAGE_CONFIGS.map((stage) => {
            const isPlaced = mission1Slots.some(
              (s) => s.currentPlacedItem?.id === stage.cardId
            );
            const isSelected = selectedCardId === stage.cardId;

            return (
              <group
                key={`tray_3d_${stage.cardId}`}
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
                    color={isSelected ? '#38bdf8' : '#1e293b'}
                    emissive={isSelected ? '#38bdf8' : '#000000'}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                  />
                </mesh>

                {/* Floating 3D Part on Tray (Only if not placed yet) */}
                {!isPlaced && (
                  <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <group position={[0, 0.35, 0]} scale={0.75}>
                      {stage.cardId === 'M1_LENS' && <Lens3DModel isSelected={isSelected} />}
                      {stage.cardId === 'M1_SENSOR' && <Sensor3DModel isSelected={isSelected} />}
                      {stage.cardId === 'M1_PROCESSOR' && (
                        <Processor3DModel isSelected={isSelected} />
                      )}
                      {stage.cardId === 'M1_LAN' && <LanPort3DModel isSelected={isSelected} />}
                    </group>
                  </Float>
                )}

                {/* HTML Label under tray part */}
                <Html position={[0, -0.05, 0.5]} center distanceFactor={10}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCard(isSelected ? null : stage.cardId);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-transform cursor-pointer select-none ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 scale-105 shadow-md shadow-sky-500/50'
                        : isPlaced
                        ? 'bg-slate-800/80 text-slate-500 line-through opacity-50'
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {isPlaced ? 'ประกอบแล้ว' : isSelected ? 'กำลังถือ ➜' : stage.nameTh}
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
