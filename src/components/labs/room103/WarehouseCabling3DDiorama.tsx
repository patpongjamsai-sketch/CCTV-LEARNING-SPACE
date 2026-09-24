'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  ROOM103_ZONES,
  Room103ZoneId,
  Room103CableOptionId,
} from '../../../shared/domain/room103Types';

export type CablingTabId = 'OVERVIEW' | Room103ZoneId;

export const WAREHOUSE_ZONE_3D_CONFIG: Record<
  Room103ZoneId,
  {
    focusPos: [number, number, number];
    cameraViewPos: [number, number, number];
    titleTh: string;
    icon: string;
  }
> = {
  ZONE_OVER_AIR: {
    focusPos: [-6.5, 2.8, -4],
    cameraViewPos: [-6.5, 6.0, 2.5],
    titleTh: '1. สายโยงข้ามระหว่างอาคาร (เสาไฟฟ้าภายนอก)',
    icon: '⚡',
  },
  ZONE_MOTOR_EMI: {
    focusPos: [6.5, 1.4, -4],
    cameraViewPos: [6.5, 5.0, 1.5],
    titleTh: '2. แนวสายขนานมอเตอร์ 3 เฟส & อินเวอร์เตอร์ (EMI)',
    icon: '⚙️',
  },
  ZONE_LONG_450M: {
    focusPos: [6.5, 1.0, 4.2],
    cameraViewPos: [6.5, 4.5, 9.5],
    titleTh: '3. ป้อมยามโรงงานระยะไกล 450 เมตร (Long Run)',
    icon: '💡',
  },
  ZONE_RAIN_EXPOSED: {
    focusPos: [-6.5, 1.8, 4.2],
    cameraViewPos: [-6.5, 4.8, 9.0],
    titleTh: '4. จุดต่อสายใต้ชายคาฝนสาด (Waterproof Gland)',
    icon: '🌧️',
  },
  ZONE_ANALOG_200M: {
    focusPos: [0, 1.2, 0],
    cameraViewPos: [0, 4.5, 4.8],
    titleTh: '5. ระบบกล้อง Analog HD เดิม 200m (Coax RG6)',
    icon: '📹',
  },
};

// Smooth Camera Controller
const WarehouseCameraController: React.FC<{
  activeTab: CablingTabId;
}> = ({ activeTab }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isTransitioning = useRef<boolean>(true);

  const targetConfig = useMemo(() => {
    if (activeTab === 'OVERVIEW') {
      return {
        camPos: new THREE.Vector3(0, 16.0, 17.5),
        targetPos: new THREE.Vector3(0, 0, 0),
      };
    }
    const cfg = WAREHOUSE_ZONE_3D_CONFIG[activeTab];
    return {
      camPos: new THREE.Vector3(...cfg.cameraViewPos),
      targetPos: new THREE.Vector3(...cfg.focusPos),
    };
  }, [activeTab]);

  React.useEffect(() => {
    isTransitioning.current = true;
  }, [activeTab]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const factor = Math.min(1, delta * 4.5);

    camera.position.lerp(targetConfig.camPos, factor);
    controlsRef.current.target.lerp(targetConfig.targetPos, factor);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(targetConfig.camPos) < 0.05 &&
      controlsRef.current.target.distanceTo(targetConfig.targetPos) < 0.05
    ) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={2.5}
      maxDistance={35}
    />
  );
};

// Animated Weather & EMI Waves
const AnimatedEnvironmentEffects: React.FC<{ stressTestActive: boolean }> = ({ stressTestActive }) => {
  const emiWaveRef = useRef<THREE.Mesh>(null);
  const rainGroupRef = useRef<THREE.Group>(null);
  const laserPulseRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // 1. EMI Wave Pulsing
    if (emiWaveRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.25;
      emiWaveRef.current.scale.set(scale, scale, scale);
      const mat = emiWaveRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = stressTestActive ? 0.6 + Math.sin(state.clock.elapsedTime * 8) * 0.3 : 0.35;
      }
    }

    // 2. Rain Particles Falling
    if (rainGroupRef.current) {
      rainGroupRef.current.children.forEach((child) => {
        child.position.y -= delta * (stressTestActive ? 12 : 6);
        if (child.position.y < 0) {
          child.position.y = 4.5 + Math.random() * 2;
        }
      });
    }

    // 3. Laser Pulses along Fiber Duct
    if (laserPulseRef.current) {
      laserPulseRef.current.position.z =
        ((state.clock.elapsedTime * (stressTestActive ? 4 : 2)) % 6) + 1.2;
    }
  });

  return (
    <group>
      {/* EMI Wave Rings above Motor */}
      <mesh ref={emiWaveRef} position={[6.5, 1.6, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.4, 32]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Rain Stream above Rain Exposed Zone */}
      <group ref={rainGroupRef} position={[-6.5, 0, 4.2]}>
        {Array.from({ length: 35 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 3,
              Math.random() * 5,
              (Math.random() - 0.5) * 2.5,
            ]}
          >
            <cylinderGeometry args={[0.008, 0.008, 0.25, 4]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
          </mesh>
        ))}
      </group>

      {/* Laser Pulse on Long Distance Fiber Route */}
      <mesh ref={laserPulseRef} position={[6.5, 0.2, 1.2]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </group>
  );
};

// 3D Warehouse Scene Content
interface WarehouseSceneProps {
  selectedOptions: Partial<Record<Room103ZoneId, Room103CableOptionId>>;
  activeZoneId: Room103ZoneId;
  onSelectZone: (zoneId: Room103ZoneId) => void;
  stressTestActive: boolean;
}

const WarehouseDioramaContent: React.FC<WarehouseSceneProps> = ({
  selectedOptions,
  activeZoneId,
  onSelectZone,
  stressTestActive,
}) => {
  return (
    <group>
      {/* ========================================================
          1. ENVIRONMENT BASE & TERRAIN (Floor, Partitions, Walls)
         ======================================================== */}
      {/* Concrete Foundation Slab with stress-test ambiance */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[22, 0.3, 16]} />
        <meshStandardMaterial
          color={stressTestActive ? '#090d16' : '#0f172a'}
          roughness={0.8}
        />
      </mesh>

      {/* Asphalt & Grass zones */}
      {/* Outdoor Air Pole Zone (Top Left: X: -11 to 0, Z: -8 to 0) */}
      <mesh position={[-5.5, 0.01, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Factory Industrial Hall (Top Right: X: 0 to 11, Z: -8 to 0) */}
      <mesh position={[5.5, 0.01, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Outdoor Canopy & Warehouse Eaves (Bottom Left: X: -11 to 0, Z: 0 to 8) */}
      <mesh position={[-5.5, 0.01, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Perimeter Fence & Security Outpost (Bottom Right: X: 0 to 11, Z: 0 to 8) */}
      <mesh position={[5.5, 0.01, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#064e3b" roughness={0.9} />
      </mesh>

      {/* Central Control Hub & Analog Retrofit Console (Center: 0,0,0) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.4} />
      </mesh>

      {/* ========================================================
          2. ZONE 1: OVERHEAD UTILITY POLE & MESSENGER WIRE
             Location: Focus at [-6.5, 2.8, -4]
         ======================================================== */}
      <group
        position={[-6.5, 0, -4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('ZONE_OVER_AIR');
        }}
      >
        {/* Selection Ring */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.2, 32]} />
          <meshBasicMaterial
            color={
              selectedOptions.ZONE_OVER_AIR === 'UTP_OUTDOOR_MESSENGER'
                ? '#10b981'
                : activeZoneId === 'ZONE_OVER_AIR'
                ? '#38bdf8'
                : '#64748b'
            }
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Pole A (Left) */}
        <mesh position={[-2.5, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 4.0, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.7} />
        </mesh>
        <mesh position={[-2.5, 3.8, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Pole B (Right) */}
        <mesh position={[2.5, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 4.0, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.7} />
        </mesh>
        <mesh position={[2.5, 3.8, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Catenary Overhead Cable between Poles */}
        {selectedOptions.ZONE_OVER_AIR === 'UTP_OUTDOOR_MESSENGER' ? (
          // Correct Outdoor Messenger Cable (Black + Shiny Steel Messenger on top)
          <group position={[0, 3.75, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 5.0, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.045, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 5.0, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ) : selectedOptions.ZONE_OVER_AIR ? (
          // Wrong cable (e.g. Indoor PVC sagging and broken)
          <group position={[0, 3.2, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 4.9, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          // No Cable Installed
          <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 5.0, 8]} />
            <meshBasicMaterial color="#64748b" opacity={0.3} transparent />
          </mesh>
        )}

        {/* Floating Zone 1 HUD Label */}
        <Html position={[0, 4.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap select-none ${
              selectedOptions.ZONE_OVER_AIR === 'UTP_OUTDOOR_MESSENGER'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : selectedOptions.ZONE_OVER_AIR
                ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <span>⚡ จุด 1: เสาโยงข้ามอาคาร</span>
            <span>
              {selectedOptions.ZONE_OVER_AIR === 'UTP_OUTDOOR_MESSENGER'
                ? '✓ สลิง PE ทนแดดยูวี/พายุ'
                : selectedOptions.ZONE_OVER_AIR
                ? '⚠️ สเปกไม่เหมาะกับลม/UV'
                : '(คลิกเพื่อเลือกสาย)'}
            </span>
          </div>
        </Html>
      </group>

      {/* ========================================================
          3. ZONE 2: 3-PHASE MOTOR & INVERTER EMI
             Location: Focus at [6.5, 1.4, -4]
         ======================================================== */}
      <group
        position={[6.5, 0, -4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('ZONE_MOTOR_EMI');
        }}
      >
        {/* Selection Ring */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.2, 32]} />
          <meshBasicMaterial
            color={
              selectedOptions.ZONE_MOTOR_EMI === 'STP_FTP_SHIELDED'
                ? '#10b981'
                : activeZoneId === 'ZONE_MOTOR_EMI'
                ? '#c084fc'
                : '#64748b'
            }
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* 3-Phase Industrial Electric Motor */}
        <group position={[-1.2, 0.6, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 1.1, 16]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.35, 0.2, 0.35]} />
            <meshStandardMaterial color="#0369a1" />
          </mesh>
          <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* VFD Inverter Electrical Control Cabinet */}
        <mesh position={[1.4, 1.1, 0]} castShadow>
          <boxGeometry args={[0.8, 2.2, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Cable Tray Route passing right next to the motor */}
        <group position={[0, 1.6, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.1, 0.25, 4.0]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>

          {/* Cable on tray */}
          {selectedOptions.ZONE_MOTOR_EMI === 'STP_FTP_SHIELDED' ? (
            // Shielded STP/FTP Cable with Metallic foil and Drain Wire to ground
            <group position={[0, 0.08, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.035, 0.035, 3.8, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Drain Wire to Cabinet */}
              <mesh position={[0.8, -0.3, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.8, 8]} />
                <meshStandardMaterial color="#22c55e" />
              </mesh>
            </group>
          ) : selectedOptions.ZONE_MOTOR_EMI ? (
            <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 3.8, 16]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
          ) : null}
        </group>

        {/* Floating Zone 2 HUD Label */}
        <Html position={[0, 3.0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap select-none ${
              selectedOptions.ZONE_MOTOR_EMI === 'STP_FTP_SHIELDED'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : selectedOptions.ZONE_MOTOR_EMI
                ? 'bg-purple-950/90 border-purple-400 text-purple-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <span>⚙️ จุด 2: เลียบมอเตอร์ 3 เฟส</span>
            <span>
              {selectedOptions.ZONE_MOTOR_EMI === 'STP_FTP_SHIELDED'
                ? '✓ STP/FTP Shielded + Drain กราวด์'
                : selectedOptions.ZONE_MOTOR_EMI
                ? '⚠️ สัญญาณรบกวน EMI สูง'
                : '(คลิกเพื่อเลือกสาย)'}
            </span>
          </div>
        </Html>
      </group>

      {/* ========================================================
          4. ZONE 3: PERIMETER WALL & 450M GUARD OUTPOST (FIBER)
             Location: Focus at [6.5, 1.0, 4.2]
         ======================================================== */}
      <group
        position={[6.5, 0, 4.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('ZONE_LONG_450M');
        }}
      >
        {/* Selection Ring */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.2, 32]} />
          <meshBasicMaterial
            color={
              selectedOptions.ZONE_LONG_450M === 'FIBER_SINGLEMODE'
                ? '#10b981'
                : activeZoneId === 'ZONE_LONG_450M'
                ? '#facc15'
                : '#64748b'
            }
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Perimeter Concrete Wall */}
        <mesh position={[-2.2, 0.8, 0]} castShadow>
          <boxGeometry args={[0.25, 1.6, 4.2]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>

        {/* Security Guard Booth Building */}
        <group position={[1.4, 1.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 2.2, 1.6]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          {/* Glass window */}
          <mesh position={[0, 0.2, 0.81]}>
            <planeGeometry args={[1.2, 0.7]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Roof overhang */}
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[1.8, 0.1, 1.8]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Underground Conduit & Optical Fiber Link */}
        <group position={[-0.4, 0.15, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 3.8, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>

          {selectedOptions.ZONE_LONG_450M === 'FIBER_SINGLEMODE' ? (
            // Bright Yellow Single-Mode Fiber Patch Cord
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 3.6, 16]} />
              <meshStandardMaterial color="#facc15" roughness={0.3} emissive="#facc15" emissiveIntensity={0.3} />
            </mesh>
          ) : selectedOptions.ZONE_LONG_450M ? (
            // Standard copper cable (fails over 100m limit)
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 3.6, 16]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.6} />
            </mesh>
          ) : null}
        </group>

        {/* Floating Zone 3 HUD Label */}
        <Html position={[0, 2.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap select-none ${
              selectedOptions.ZONE_LONG_450M === 'FIBER_SINGLEMODE'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : selectedOptions.ZONE_LONG_450M
                ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <span>💡 จุด 3: ป้อมยามไกล 450m</span>
            <span>
              {selectedOptions.ZONE_LONG_450M === 'FIBER_SINGLEMODE'
                ? '✓ Single-mode Fiber Optic (ไร้ขีด 100m)'
                : selectedOptions.ZONE_LONG_450M
                ? '⚠️ เกินระยะ 100m สายทองแดง'
                : '(คลิกเพื่อเลือกสาย)'}
            </span>
          </div>
        </Html>
      </group>

      {/* ========================================================
          5. ZONE 4: RAIN EXPOSED EAVES & IP66 JUNCTION BOX
             Location: Focus at [-6.5, 1.8, 4.2]
         ======================================================== */}
      <group
        position={[-6.5, 0, 4.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('ZONE_RAIN_EXPOSED');
        }}
      >
        {/* Selection Ring */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.2, 32]} />
          <meshBasicMaterial
            color={
              selectedOptions.ZONE_RAIN_EXPOSED === 'JUNCTION_BOX_IP66_GLAND'
                ? '#10b981'
                : activeZoneId === 'ZONE_RAIN_EXPOSED'
                ? '#38bdf8'
                : '#64748b'
            }
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Warehouse Exterior Concrete Wall */}
        <mesh position={[0, 1.8, -1.0]} castShadow>
          <boxGeometry args={[4.2, 3.6, 0.3]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* Slanted Corrugated Eave Canopy */}
        <mesh position={[0, 3.2, 0.2]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[4.4, 0.08, 2.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* IP66 Junction Box or Bare Joint on Wall */}
        {selectedOptions.ZONE_RAIN_EXPOSED === 'JUNCTION_BOX_IP66_GLAND' ? (
          // IP66 Waterproof Box with Downward Drip Loop & Sealed Gland
          <group position={[0, 1.6, -0.75]}>
            {/* ABS Junction Box Body */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.5, 0.2]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} />
            </mesh>
            {/* Downward Waterproof Cable Glands */}
            <mesh position={[-0.12, -0.28, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.12, -0.28, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* U-Shaped Drip Loop Cable */}
            <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
              <torusGeometry args={[0.2, 0.03, 12, 24, Math.PI]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ) : selectedOptions.ZONE_RAIN_EXPOSED ? (
          // Bare unsealed RJ45 connector exposed to rain
          <group position={[0, 1.6, -0.8]}>
            <mesh>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        ) : null}

        {/* Outdoor Bullet Camera under Eave */}
        <group position={[1.3, 2.2, -0.6]} rotation={[0.3, -0.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.09, 0.35, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Floating Zone 4 HUD Label */}
        <Html position={[0, 3.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap select-none ${
              selectedOptions.ZONE_RAIN_EXPOSED === 'JUNCTION_BOX_IP66_GLAND'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : selectedOptions.ZONE_RAIN_EXPOSED
                ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <span>🌧️ จุด 4: ชายคาเสี่ยงฝนสาด</span>
            <span>
              {selectedOptions.ZONE_RAIN_EXPOSED === 'JUNCTION_BOX_IP66_GLAND'
                ? '✓ กล่อง IP66 + Gland คว่ำลง + Drip Loop'
                : selectedOptions.ZONE_RAIN_EXPOSED
                ? '⚠️ เสี่ยงน้ำซึม ช็อตขั้วต่อ'
                : '(คลิกเพื่อเลือกอุปกรณ์)'}
            </span>
          </div>
        </Html>
      </group>

      {/* ========================================================
          6. ZONE 5: ANALOG HD RETROFIT 200M (COAXIAL RG6)
             Location: Focus at [0, 1.2, 0]
         ======================================================== */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('ZONE_ANALOG_200M');
        }}
      >
        {/* Selection Ring */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.8, 32]} />
          <meshBasicMaterial
            color={
              selectedOptions.ZONE_ANALOG_200M === 'COAX_RG6_SOLID_COPPER'
                ? '#10b981'
                : activeZoneId === 'ZONE_ANALOG_200M'
                ? '#38bdf8'
                : '#64748b'
            }
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Central DVR / Server Console Rack */}
        <group position={[0, 0.75, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 1.5, 0.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Status LEDs on DVR */}
          <mesh position={[-0.3, 0.5, 0.46]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[-0.2, 0.5, 0.46]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Coaxial RG6 Spool & Cable Route */}
        <group position={[0.7, 0.35, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.06, 12, 24]} />
            <meshStandardMaterial
              color={
                selectedOptions.ZONE_ANALOG_200M === 'COAX_RG6_SOLID_COPPER'
                  ? '#0f172a'
                  : selectedOptions.ZONE_ANALOG_200M
                  ? '#94a3b8'
                  : '#334155'
              }
              roughness={0.4}
            />
          </mesh>
        </group>

        {/* Floating Zone 5 HUD Label */}
        <Html position={[0, 2.2, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap select-none ${
              selectedOptions.ZONE_ANALOG_200M === 'COAX_RG6_SOLID_COPPER'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : selectedOptions.ZONE_ANALOG_200M
                ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <span>📹 จุด 5: Analog HD 200m</span>
            <span>
              {selectedOptions.ZONE_ANALOG_200M === 'COAX_RG6_SOLID_COPPER'
                ? '✓ Coaxial RG6 ทองแดงแท้ ชิลด์ 95%'
                : selectedOptions.ZONE_ANALOG_200M
                ? '⚠️ สัญญาณสูญเสียสูง ภาพลาย'
                : '(คลิกเพื่อเลือกสาย)'}
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
};

// ==========================================
// MAIN EXPORTED COMPONENT: WarehouseCabling3DDiorama
// ==========================================
interface WarehouseCabling3DDioramaProps {
  selectedOptions: Partial<Record<Room103ZoneId, Room103CableOptionId>>;
  activeZoneId: Room103ZoneId;
  onSelectZone: (zoneId: Room103ZoneId) => void;
  activeTab: CablingTabId;
  onSetTab: (tab: CablingTabId) => void;
  stressTestActive: boolean;
  onToggleStressTest: () => void;
}

export const WarehouseCabling3DDiorama: React.FC<WarehouseCabling3DDioramaProps> = ({
  selectedOptions,
  activeZoneId,
  onSelectZone,
  activeTab,
  onSetTab,
  stressTestActive,
  onToggleStressTest,
}) => {
  return (
    <div className="relative w-full h-[460px] lg:h-[540px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 17.5], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-6.5, 5, -4]} intensity={12} color="#e0f2fe" distance={10} />
        <pointLight position={[6.5, 5, -4]} intensity={12} color="#c084fc" distance={10} />
        <pointLight position={[-6.5, 5, 4.2]} intensity={12} color="#38bdf8" distance={10} />
        <pointLight position={[6.5, 5, 4.2]} intensity={12} color="#facc15" distance={10} />

        <WarehouseCameraController activeTab={activeTab} />
        <AnimatedEnvironmentEffects stressTestActive={stressTestActive} />
        <WarehouseDioramaContent
          selectedOptions={selectedOptions}
          activeZoneId={activeZoneId}
          onSelectZone={(zid) => {
            onSelectZone(zid);
            onSetTab(zid);
          }}
          stressTestActive={stressTestActive}
        />
      </Canvas>

      {/* Top 3D Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md pointer-events-auto shadow-xl">
          <button
            type="button"
            onClick={() => onSetTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 มุมมองรวมทั้งไซต์
          </button>
          {(Object.keys(ROOM103_ZONES) as Room103ZoneId[]).map((zid, idx) => {
            const isSelected = activeTab === zid;
            const isDone = selectedOptions[zid] === ROOM103_ZONES[zid].correctOptionId;
            return (
              <button
                key={zid}
                type="button"
                onClick={() => {
                  onSetTab(zid);
                  onSelectZone(zid);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md'
                    : isDone
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{zid === 'ZONE_OVER_AIR' ? 'เสาไฟ' : zid === 'ZONE_MOTOR_EMI' ? 'มอเตอร์' : zid === 'ZONE_LONG_450M' ? 'ป้อมยาม' : zid === 'ZONE_RAIN_EXPOSED' ? 'ชายคา' : 'Analog'}</span>
                {isDone && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* 3D Stress Test Simulator Button */}
        <button
          type="button"
          onClick={onToggleStressTest}
          className={`px-4 py-2 rounded-2xl text-xs font-black shadow-2xl backdrop-blur-md border transition-all cursor-pointer pointer-events-auto flex items-center gap-2 ${
            stressTestActive
              ? 'bg-rose-600/95 text-white border-rose-400 animate-pulse shadow-rose-600/40'
              : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
          }`}
        >
          <span>{stressTestActive ? '🌪️ กำลังรัน Stress Test...' : '⚡ รัน 3D Stress Test'}</span>
        </button>
      </div>

      {/* Bottom 3D Quick Helper Tips */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 backdrop-blur-sm">
          💡 คลิกบนจุดในฉาก 3D เพื่อบินสำรวจระยะใกล้ · หมุน (ลากเมาส์) / ซูม (Scroll)
        </div>
      </div>
    </div>
  );
};
