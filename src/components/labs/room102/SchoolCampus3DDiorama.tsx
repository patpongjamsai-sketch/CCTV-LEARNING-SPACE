'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  OUTDOOR_SPOTS,
  OutdoorSpotId,
  ROOM102_CAMERA_CATALOG,
  Room102CameraId,
} from '../../../shared/domain/room102Types';

// 3D coordinates for the 5 outdoor spots on the diorama platform
export const SPOT_3D_COORDINATES: Record<
  OutdoorSpotId,
  {
    position: [number, number, number];
    lookAtAngle: number; // yaw rotation in radians
    labelTh: string;
  }
> = {
  OUT_MAIN_GATE: {
    position: [4.8, 0, 6.2],
    lookAtAngle: Math.PI * 0.9,
    labelTh: 'P1: ประตูหน้า',
  },
  OUT_SPORTS_FIELD: {
    position: [-5.2, 0, 2.2],
    lookAtAngle: 0,
    labelTh: 'P2: ลานกีฬา',
  },
  OUT_PARKING: {
    position: [5.2, 0, 1.8],
    lookAtAngle: Math.PI * 0.6,
    labelTh: 'P3: ลานจอดรถ',
  },
  OUT_FENCE_PERIMETER: {
    position: [-9.8, 0, -2.5],
    lookAtAngle: Math.PI * 0.15,
    labelTh: 'P4: แนวกำแพงรั้ว',
  },
  OUT_BACK_GATE: {
    position: [-9.2, 0, 5.8],
    lookAtAngle: Math.PI * 0.45,
    labelTh: 'P5: ประตูหลัง',
  },
};

// Rotating radar sweep beam for PTZ camera
const PtzRadarSweep: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const sweepRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (sweepRef.current) {
      sweepRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[position[0], 0.08, position[2]]}>
      {/* Base coverage circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Outer border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.1, 4.2, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* Rotating sweep cone/sector */}
      <group ref={sweepRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 4.15, 24, 1, 0, Math.PI / 3]} />
          <meshBasicMaterial
            color="#0ea5e9"
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

// Fixed directional FOV vision cone
const DirectionalFovCone: React.FC<{
  position: [number, number, number];
  rotationY: number;
  isCorrect: boolean;
  length?: number;
  radius?: number;
}> = ({ position, rotationY, isCorrect, length = 4.5, radius = 2.2 }) => {
  const color = isCorrect ? '#10b981' : '#f43f5e';

  return (
    <group position={[position[0], 0.8, position[2]]} rotation={[0, rotationY, 0]}>
      {/* Semi-transparent cone pointing forward */}
      <mesh
        position={[0, -0.4, length / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[radius, length, 20, 1, true]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.28}
          roughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ground projection sector */}
      <mesh
        position={[0, -0.75, length / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.2, length, 20, 1, -Math.PI / 4, Math.PI / 2]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// 3D Campus Diorama Scenery (Buildings, Fields, Parking, Cutaway walls)
const CampusEnvironment: React.FC = () => {
  return (
    <group>
      {/* 1. Base Diorama Slab (Modern Architectural Pedestal) */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[23, 0.7, 17]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Dark accent bevel at bottom */}
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[23.4, 0.1, 17.4]} />
        <meshStandardMaterial color="#334155" roughness={0.3} />
      </mesh>

      {/* 2. Grid Ground Tiles (Clean isometric grid like reference image) */}
      <gridHelper args={[22, 22, '#94a3b8', '#cbd5e1']} position={[0, 0.01, 0]} />

      {/* 3. Cutaway Walls (Back Wall and Left Wall with windows) */}
      {/* Back Wall along Z = -8.2 */}
      <group position={[0, 1.6, -8.2]}>
        {/* Wall Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[22.6, 3.2, 0.35]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Top Trim */}
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[22.8, 0.12, 0.45]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        {/* Panoramic Window Recesses */}
        {[-7, -2.5, 2.5, 7].map((xOffset, idx) => (
          <mesh key={`win-back-${idx}`} position={[xOffset, 0.2, 0.12]}>
            <boxGeometry args={[3.2, 1.8, 0.15]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Left Wall along X = -11.2 */}
      <group position={[-11.2, 1.6, 0]}>
        {/* Wall Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.35, 3.2, 16.6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Top Trim */}
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[0.45, 0.12, 16.8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        {/* Window Cutouts on Left */}
        {[-4.5, 0, 4.5].map((zOffset, idx) => (
          <mesh key={`win-left-${idx}`} position={[0.12, 0.2, zOffset]}>
            <boxGeometry args={[0.15, 1.8, 2.8]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Main School Building (อาคารเรียนหลัก 3 ชั้น) */}
      <group position={[0, 1.3, -3.2]}>
        {/* Main Block */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.5, 2.6, 4.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Roof Border & AC Chillers */}
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[8.7, 0.15, 4.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[-2, 1.65, 0.5]}>
          <boxGeometry args={[1.2, 0.5, 0.9]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[2, 1.65, -0.5]}>
          <boxGeometry args={[1.2, 0.5, 0.9]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        {/* Window Rows (Front Facade) */}
        {[-2.8, -1.0, 1.0, 2.8].map((x, i) => (
          <group key={`facade-win-${i}`}>
            <mesh position={[x, 0.6, 2.12]}>
              <boxGeometry args={[1.2, 0.7, 0.05]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.6} />
            </mesh>
            <mesh position={[x, -0.4, 2.12]}>
              <boxGeometry args={[1.2, 0.7, 0.05]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Building Entrance Canopy */}
        <mesh position={[0, -0.5, 2.4]}>
          <boxGeometry args={[2.4, 0.1, 0.8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Entrance Pillars */}
        <mesh position={[-0.9, -0.95, 2.7]}>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.9, -0.95, 2.7]}>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* 5. Sports Field & Running Track (สนามกีฬาและลานเสาธง - Spot P2) */}
      <group position={[-5.2, 0.02, 2.2]}>
        {/* Running Track Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[7.2, 5.2]} />
          <meshStandardMaterial color="#e11d48" roughness={0.9} />
        </mesh>
        {/* Green Grass Pitch */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.0, 4.0]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        {/* Field Center Circle & Line */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.76, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 4.0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Flagpole */}
        <mesh position={[0, 1.2, -2.2]}>
          <cylinderGeometry args={[0.03, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Thai Flag */}
        <mesh position={[0.3, 2.1, -2.2]}>
          <boxGeometry args={[0.5, 0.3, 0.02]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* 6. Parking Lot (ลานจอดรถ - Spot P3) */}
      <group position={[5.2, 0.02, 1.8]}>
        {/* Asphalt Pad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6.2, 4.8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Parking Bay Lines */}
        {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
          <mesh key={`stall-${i}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 3.8]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}
        {/* Low-poly Parked Car 1 (White Sedan) */}
        <group position={[-1.2, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.4, 1.8]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, -0.1]}>
            <boxGeometry args={[0.8, 0.3, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} />
          </mesh>
        </group>
        {/* Low-poly Parked Car 2 (Blue SUV) */}
        <group position={[1.2, 0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.5, 2.0]} />
            <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.35, -0.1]}>
            <boxGeometry args={[0.9, 0.35, 1.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 7. Main Front Gate (ประตูรั้วหน้าโรงเรียน - Spot P1) */}
      <group position={[4.8, 0.02, 6.4]}>
        {/* Access Road */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.2, 3.0]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Road Yellow Center Lines */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 2.6]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Security Guard Booth */}
        <mesh position={[1.6, 0.8, 0]} castShadow>
          <boxGeometry args={[1.1, 1.6, 1.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <mesh position={[1.6, 1.65, 0]}>
          <boxGeometry args={[1.3, 0.1, 1.4]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Gate Pillars & Boom Barrier */}
        <mesh position={[-1.6, 0.6, 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0.8, 0.6, 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Barrier Bar */}
        <mesh position={[-0.4, 0.5, 0.5]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[2.3, 0.08, 0.06]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* 8. Rear Perimeter Fence (แนวกำแพงรั้วโรงเรียน - Spot P4) */}
      <group position={[-10.2, 0.5, -2.5]}>
        {/* Fence Base Wall */}
        <mesh receiveShadow>
          <boxGeometry args={[0.3, 0.5, 8.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
        {/* Metal Fence Grille */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.08, 0.7, 8.5]} />
          <meshStandardMaterial color="#334155" wireframe />
        </mesh>
      </group>

      {/* 9. Back Gate (ประตูหลัง - จุดเปลี่ยว - Spot P5) */}
      <group position={[-9.2, 0.02, 5.8]}>
        {/* Dirt/Alley Road */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.5, 3.2]} />
          <meshStandardMaterial color="#52525b" roughness={0.9} />
        </mesh>
        {/* Iron Gates */}
        <mesh position={[-0.7, 0.7, 0.4]}>
          <boxGeometry args={[0.9, 1.4, 0.08]} />
          <meshStandardMaterial color="#27272a" roughness={0.4} />
        </mesh>
        <mesh position={[0.4, 0.7, 0.4]}>
          <boxGeometry args={[0.9, 1.4, 0.08]} />
          <meshStandardMaterial color="#27272a" roughness={0.4} />
        </mesh>
        {/* Warning Hazard Stripe */}
        <mesh position={[-0.15, 1.45, 0.4]}>
          <boxGeometry args={[2.0, 0.12, 0.09]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 10. Decorative Elements (Low-poly Trees & Potted Greenery like reference) */}
      <group position={[8.5, 0, -6.5]}>
        {/* Planter Pot */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 0.8, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Foliage Cone */}
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.9, 1.6, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>
      </group>

      <group position={[-9.2, 0, -6.5]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 0.8, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.9, 1.6, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// 3D Spot Marker Pin & Floating Label & Green Floor Selection Ring
interface SpotMarkerPinProps {
  spotId: OutdoorSpotId;
  isSelected: boolean;
  placedCamId?: Room102CameraId;
  isCorrect?: boolean;
  showSimulate: boolean;
  onSelect: (spotId: OutdoorSpotId) => void;
}

const SpotMarkerPin: React.FC<SpotMarkerPinProps> = ({
  spotId,
  isSelected,
  placedCamId,
  isCorrect = false,
  showSimulate,
  onSelect,
}) => {
  const spotInfo = SPOT_3D_COORDINATES[spotId] || {
    position: [0, 0, 0] as [number, number, number],
    lookAtAngle: 0,
    labelTh: spotId,
  };
  const [x, y, z] = spotInfo.position;

  return (
    <group
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(spotId);
      }}
    >
      {/* 1. SELECTION RING ON THE FLOOR (Faithful match to green selection ring in user's image) */}
      {isSelected && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 1.05, 36]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 2. Pole & Mounting Bracket */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.3, 8]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#64748b'} metalness={0.7} />
      </mesh>

      {/* 3. 3D Camera Model on Pole */}
      <group position={[0, 1.3, 0]} rotation={[0, spotInfo.lookAtAngle, 0]}>
        {placedCamId === 'PTZ_SPEED_DOME' ? (
          // Dome shape for PTZ
          <mesh castShadow>
            <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.3} />
          </mesh>
        ) : (
          // Bullet shape for standard outdoor cameras
          <mesh castShadow position={[0, 0, 0.1]}>
            <boxGeometry args={[0.16, 0.16, 0.35]} />
            <meshStandardMaterial
              color={placedCamId ? '#f8fafc' : '#475569'}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        )}
      </group>

      {/* 4. 3D FOV Simulation Cone / Radar */}
      {showSimulate && placedCamId && (
        placedCamId === 'PTZ_SPEED_DOME' ? (
          <PtzRadarSweep position={[0, 0, 0]} />
        ) : (
          <DirectionalFovCone
            position={[0, 0.5, 0]}
            rotationY={spotInfo.lookAtAngle}
            isCorrect={isCorrect}
            length={placedCamId === 'BULLET_PERIMETER_AI' ? 6.5 : 4.5}
            radius={placedCamId === 'BULLET_WIDE' ? 3.0 : 1.8}
          />
        )
      )}

      {/* 5. Floating Badge (<Html> Pill like PC-01 / Server-01 in user's image) */}
      <Html position={[0, 1.9, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(spotId);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xl transition-all duration-150 select-none cursor-pointer whitespace-nowrap ${
            isSelected
              ? 'ring-3 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105'
              : 'hover:scale-105'
          } ${
            placedCamId
              ? isCorrect
                ? 'bg-emerald-700 text-white border border-emerald-300'
                : 'bg-rose-700 text-white border border-rose-300'
              : 'bg-slate-900/90 text-slate-100 border border-slate-600 hover:border-sky-400'
          }`}
        >
          <span>{placedCamId ? ROOM102_CAMERA_CATALOG[placedCamId].icon : '📍'}</span>
          <span>{spotInfo.labelTh}</span>
          {placedCamId && (
            <span className="font-bold font-mono text-[11px]">
              {isCorrect ? '✓' : '⚠️'}
            </span>
          )}
        </button>
      </Html>
    </group>
  );
};

export interface SchoolCampus3DDioramaProps {
  placements: Partial<Record<OutdoorSpotId, Room102CameraId>>;
  selectedSpot: OutdoorSpotId;
  onSelectSpot: (spotId: OutdoorSpotId) => void;
  showSimulate: boolean;
  onToggleSimulate: () => void;
}

export const SchoolCampus3DDiorama: React.FC<SchoolCampus3DDioramaProps> = ({
  placements,
  selectedSpot,
  onSelectSpot,
  showSimulate,
  onToggleSimulate,
}) => {
  const controlsRef = useRef<any>(null);

  const resetCameraView = (type: 'iso' | 'top') => {
    if (!controlsRef.current) return;
    if (type === 'iso') {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(15, 14, 15);
      controlsRef.current.target.set(0, 0, 0);
    } else if (type === 'top') {
      controlsRef.current.object.position.set(0, 24, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  const spotKeys = Object.keys(OUTDOOR_SPOTS) as OutdoorSpotId[];

  return (
    <div className="relative w-full h-full bg-[#f1f5f9] rounded-2xl overflow-hidden select-none">
      {/* ========================================================
          Top Toolbar (Aesthetic match to user's uploaded reference)
         ======================================================== */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Left: Tool modes & instructions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-300 shadow-sm text-xs text-slate-700 font-medium">
            <span className="text-emerald-600 text-sm">⮹</span>
            <span>หมุน · ซูม · เลือกอุปกรณ์</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE WORKSPACE 01
          </div>
        </div>

        {/* Right: Actions (Reset, Top-down, FOV toggle) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => resetCameraView('iso')}
            title="รีเซ็ตมุมมองสามมิติ (Isometric)"
            className="p-1.5 px-2 rounded-xl bg-white/95 hover:bg-white border border-slate-300 shadow-sm text-xs text-slate-700 hover:text-slate-900 font-medium transition-all"
          >
            ↻ รีเซ็ตมุม
          </button>

          <button
            onClick={() => resetCameraView('top')}
            title="มุมมองแบบผังบนลงล่าง (Top-down)"
            className="p-1.5 px-2 rounded-xl bg-white/95 hover:bg-white border border-slate-300 shadow-sm text-xs text-slate-700 hover:text-slate-900 font-medium transition-all"
          >
            📐 ผังมุมบน
          </button>

          <button
            onClick={onToggleSimulate}
            className={`p-1.5 px-2.5 rounded-xl text-xs font-medium shadow-sm transition-all flex items-center gap-1 ${
              showSimulate
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'bg-white/95 hover:bg-white border border-slate-300 text-slate-700'
            }`}
          >
            <span>{showSimulate ? '👁️' : '📡'}</span>
            <span>{showSimulate ? 'ปิดจำลอง FOV' : 'แสดงรัศมีมุมมอง FOV'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3D Canvas with OrbitControls & Low-Poly Scene
         ======================================================== */}
      <Canvas
        camera={{ position: [15, 14, 15], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={['#e8ecf2']} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-10, 12, -8]} intensity={0.35} />

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.12}
          minDistance={7}
          maxDistance={32}
        />

        {/* School Campus Scenery */}
        <CampusEnvironment />

        {/* 5 Spot Marker Pins & Selection Rings */}
        {spotKeys.map((spotId) => {
          const spot = OUTDOOR_SPOTS[spotId];
          const camId = placements[spotId];
          const isSelected = selectedSpot === spotId;
          const isCorrect = camId ? camId === spot.correctCameraId : false;

          return (
            <SpotMarkerPin
              key={spotId}
              spotId={spotId}
              isSelected={isSelected}
              placedCamId={camId}
              isCorrect={isCorrect}
              showSimulate={showSimulate}
              onSelect={onSelectSpot}
            />
          );
        })}
      </Canvas>

      {/* ========================================================
          Bottom Mouse Hint Watermark
         ======================================================== */}
      <div className="absolute bottom-2 left-3 z-10 text-[11px] text-slate-500 font-medium pointer-events-none bg-white/70 px-2 py-0.5 rounded-md border border-slate-300/60 backdrop-blur-xs">
        🖱️ ลากคลิกซ้าย: หมุน 3D | ลากคลิกขวา: เลื่อนมุม | กลิ้งลูกกลิ้ง: ซูม
      </div>
    </div>
  );
};
