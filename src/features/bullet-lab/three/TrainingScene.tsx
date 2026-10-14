'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useBulletLabStore } from '../store/useBulletLabStore';
import {
  MOUNT_POINTS,
  SURFACES_DATA,
  MOUNT_POINT_IDEAL_ANGLES,
} from '../data/bulletLabData';
import { BulletCameraRig } from './BulletCameraRig';
import { GhostCameraRig } from './GhostCameraRig';
import { TargetZoneOverlay } from './TargetZoneOverlay';
import { RobloxPlayerController } from './RobloxPlayerController';
import { PpeStationTable3D } from './PpeStationTable3D';
import { InteractiveTools3D } from './InteractiveTools3D';

export const TrainingScene: React.FC = () => {
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const selectedMountPointId = useBulletLabStore((s) => s.selectedMountPoint);
  const setSelectedMountPoint = useBulletLabStore((s) => s.setSelectedMountPoint);
  const surfaceType = useBulletLabStore((s) => s.surfaceType);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const rotation = useBulletLabStore((s) => s.rotation);
  const fovDegrees = useBulletLabStore((s) => s.fovDegrees);
  const ghostCameraVisible = useBulletLabStore((s) => s.ghostCameraVisible);
  const pullTestForceN = useBulletLabStore((s) => s.pullTestForceN);
  const isPpeModalOpen = useBulletLabStore((s) => s.isPpeModalOpen);
  const isMission4ModalOpen = useBulletLabStore((s) => s.isMission4ModalOpen);

  const activeMountPoint =
    MOUNT_POINTS.find((p) => p.id === selectedMountPointId) ?? MOUNT_POINTS[0]!;
  const activeSurface = SURFACES_DATA[surfaceType] ?? SURFACES_DATA.concrete!;

  // Pull test displacement deflection simulation (mm to 3D units)
  const deflectionZ = (pullTestForceN / 40) * 0.008;

  return (
    <group>
      {/* ============================================================ */}
      {/* 1. ROOM ARCHITECTURE (Floor, Ceiling, Walls, Canopy)          */}
      {/* ============================================================ */}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Floor Grid Lines */}
      <gridHelper args={[10, 20, '#475569', '#334155']} position={[0, 0.005, 2]} />

      {/* Main Mounting Wall (Z = -0.1) */}
      {/* The color changes dynamically based on the selected SurfaceType */}
      <mesh position={[0, 2.5, -0.1]} receiveShadow>
        <boxGeometry args={[8.0, 5.0, 0.2]} />
        <meshStandardMaterial
          color={activeSurface.color}
          roughness={surfaceType === 'wood' ? 0.6 : 0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Wall Top Parapet Cornice Trim */}
      <mesh position={[0, 5.02, -0.02]}>
        <boxGeometry args={[8.2, 0.16, 0.36]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Wall Baseboard Trim */}
      <mesh position={[0, 0.08, -0.01]}>
        <boxGeometry args={[8.0, 0.16, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Canopy / Eave above door & above Point C (Underside at Y = 3.55 directly above Point C 3.4m) */}
      <group position={[0, 3.55, 0.55]}>
        {/* Main canopy slab */}
        <mesh receiveShadow>
          <boxGeometry args={[4.4, 0.1, 1.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Canopy front fascia trim */}
        <mesh position={[0, 0, 0.65]}>
          <boxGeometry args={[4.42, 0.14, 0.04]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Left & right steel support brackets */}
        <mesh position={[-1.6, -0.28, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[1.6, -0.28, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
      </group>

      {/* Point A: Concrete Entrance Column (เสาปูนทางเข้าหลัก X = 1.2, Y = 2.8m) */}
      <group position={[1.2, 2.5, 0.04]}>
        {/* Main Column Pillar Shaft */}
        <mesh receiveShadow>
          <boxGeometry args={[0.46, 5.0, 0.28]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
        {/* Column Base Pedestal */}
        <mesh position={[0, -2.38, 0.02]}>
          <boxGeometry args={[0.52, 0.24, 0.32]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
        {/* Column Capital Top Trim */}
        <mesh position={[0, 2.38, 0.02]}>
          <boxGeometry args={[0.52, 0.24, 0.32]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
        {/* Subtle Pillar Vertical Groove Line */}
        <mesh position={[0, 0, 0.145]}>
          <planeGeometry args={[0.04, 4.4]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
      </group>

      {/* Point D: Drainage Downpipe & Corner Obstruction (ท่อระบายน้ำ PVC แนวตั้ง X = -2.05) */}
      <group position={[-2.05, 2.5, 0.06]}>
        {/* Vertical Drainage Pipe */}
        <mesh receiveShadow>
          <cylinderGeometry args={[0.045, 0.045, 5.0, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        {/* Pipe Wall Clamps / Mounting Brackets */}
        {[-1.6, -0.6, 0.4, 1.4, 2.2].map((by, i) => (
          <mesh key={i} position={[0, by, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
        ))}
      </group>
      {/* Corner Wall Obstruction Alcove for Point D (X = -2.35) */}
      <mesh position={[-2.4, 2.5, 0.04]}>
        <boxGeometry args={[0.35, 5.0, 0.28]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Point B: Low-Level Wall Feature (ผนังระดับต่ำ 1.6m) */}
      <group position={[-1.4, 1.6, 0.01]}>
        {/* Height marker indicator line */}
        <mesh position={[0, -0.4, 0.01]}>
          <planeGeometry args={[0.5, 0.02]} />
          <meshBasicMaterial color="#ca8a04" />
        </mesh>
        {/* Electrical switch box below camera */}
        <mesh position={[0.2, -0.5, 0.02]}>
          <boxGeometry args={[0.1, 0.14, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
        </mesh>
      </group>

      {/* Doorway Arch, Lintel (Point E: X = 0, Y = 2.7m) & Door */}
      <group position={[0, 0, 0]}>
        {/* Door Frame */}
        <mesh position={[0, 1.25, -0.02]}>
          <boxGeometry args={[1.2, 2.5, 0.06]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Door Lintel Beam directly beneath Point E */}
        <mesh position={[0, 2.54, 0.02]}>
          <boxGeometry args={[1.36, 0.12, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Door Leaf (Dark grey industrial door with window) */}
        <mesh position={[0, 1.2, -0.01]}>
          <boxGeometry args={[1.08, 2.38, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Door Glass Panel */}
        <mesh position={[0, 1.6, 0.01]}>
          <boxGeometry args={[0.5, 0.8, 0.02]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.3}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. MOUNT POINTS (A, B, C, D, E) Interactive 3D Badges        */}
      {/* ============================================================ */}
      {MOUNT_POINTS.map((pt) => {
        const isSelected = pt.id === selectedMountPointId;
        const [px, py, pz] = pt.worldPosition;

        return (
          <group key={pt.id} position={[px, py, pz]}>
            {/* Glowing Ring for Mount Point */}
            <mesh
              position={[0, 0, 0.005]}
              onClick={() => setSelectedMountPoint(pt.id)}
            >
              <ringGeometry args={[0.07, 0.09, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#22d3ee' : '#94a3b8'}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner Center Dot */}
            <mesh position={[0, 0, 0.006]}>
              <circleGeometry args={[0.025, 24]} />
              <meshBasicMaterial
                color={isSelected ? '#06b6d4' : '#64748b'}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* HTML Marker Label (hidden when modal is open) */}
            {!isPpeModalOpen && !isMission4ModalOpen && (
              <Html position={[0, 0.16, 0.02]} center distanceFactor={7}>
                <button
                  onClick={() => setSelectedMountPoint(pt.id)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-900 scale-110'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-cyan-400 hover:text-white'
                  }`}
                >
                  <span>{pt.id}</span>
                  <span className="text-[10px] font-normal opacity-90">
                    {pt.heightMeters}m
                  </span>
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* ============================================================ */}
      {/* 3. BULLET CAMERA RIG (Mounted at Selected Point)             */}
      {/* ============================================================ */}
      {/* If current mission is before Base Mount (mission 7), camera is still placed on preview */}
      <group
        position={[
          activeMountPoint.worldPosition[0],
          activeMountPoint.worldPosition[1],
          activeMountPoint.worldPosition[2] + deflectionZ,
        ]}
      >
        <BulletCameraRig
          pan={pan}
          tilt={tilt}
          rotation={rotation}
          fovDegrees={fovDegrees}
          showFovCone={currentMission >= 3}
        />

        {/* Pull Test Force Vector Arrow (when testing force) */}
        {pullTestForceN > 0 && (
          <group position={[0, -0.05, 0.15]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.25, 12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.03, 0.06, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {!isPpeModalOpen && !isMission4ModalOpen && (
              <Html position={[0, -0.1, 0.15]} center distanceFactor={6}>
                <div className="bg-red-950/90 text-red-200 border border-red-500/60 text-[11px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap animate-pulse">
                  แรงดึง {pullTestForceN} N
                </div>
              </Html>
            )}
          </group>
        )}
      </group>

      {/* ============================================================ */}
      {/* 4. GHOST / INSTRUCTOR CAMERA OVERLAY (Ideal Comparison)      */}
      {/* ============================================================ */}
      {ghostCameraVisible && (
        <GhostCameraRig
          position={activeMountPoint.worldPosition}
          idealPan={MOUNT_POINT_IDEAL_ANGLES[selectedMountPointId]?.pan ?? 0}
          idealTilt={MOUNT_POINT_IDEAL_ANGLES[selectedMountPointId]?.tilt ?? -25}
          idealRotation={MOUNT_POINT_IDEAL_ANGLES[selectedMountPointId]?.roll ?? 0}
        />
      )}

      {/* 5. TARGET ZONE & ROBLOX PLAYER & PPE WORKBENCH & TOOLS */}
      <TargetZoneOverlay showLabels={currentMission <= 3} />
      <PpeStationTable3D position={[-2.4, 0, 2.0]} />
      <RobloxPlayerController />
      <InteractiveTools3D />
    </group>
  );
};
