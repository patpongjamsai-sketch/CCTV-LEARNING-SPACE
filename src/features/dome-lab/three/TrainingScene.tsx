'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';
import { DomeMountPointId } from '../types';
import { RobloxPlayerController } from './RobloxPlayerController';
import { PpeStationTable3D } from './PpeStationTable3D';
import { DomeCameraRig } from './DomeCameraRig';
import { VisualFovCone } from './VisualFovCone';

export const TrainingScene: React.FC = () => {
  const activeRoom = useDomeLabStore((s) => s.activeRoom);
  const selectedMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const setSelectedMountPoint = useDomeLabStore((s) => s.setSelectedMountPoint);
  const dayNightMode = useDomeLabStore((s) => s.dayNightMode);
  const fovDegrees = useDomeLabStore((s) => s.fovDegrees);
  const pan = useDomeLabStore((s) => s.pan);
  const tilt = useDomeLabStore((s) => s.tilt);
  const isPpeModalOpen = useDomeLabStore((s) => s.isPpeModalOpen);
  const isMission4ModalOpen = useDomeLabStore((s) => s.isMission4ModalOpen);

  const hasPickedUpCamera = useDomeLabStore((s) => s.hasPickedUpCamera);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const mountedPointId = useDomeLabStore((s) => s.mountedPointId);
  const isNearCameraTable = useDomeLabStore((s) => s.isNearCameraTable);
  const nearMountPointId = useDomeLabStore((s) => s.nearMountPointId);
  const pickUpCamera = useDomeLabStore((s) => s.pickUpCamera);
  const mountCameraAtPoint = useDomeLabStore((s) => s.mountCameraAtPoint);
  const roomCameras = useDomeLabStore((s) => s.roomCameras);

  const isRoom1 = activeRoom === 'room1_indoor';
  const isAnyModalOpen = isPpeModalOpen || isMission4ModalOpen;
  const isNight = dayNightMode === 'night_ir';

  const activeMountId = mountedPointId ?? selectedMountPointId;
  const activePoint = DOME_MOUNT_POINTS_DATA[activeMountId];

  return (
    <group>
      {/* ========================================================
          1. LIGHTING (Dynamic Day vs Night IR for 22x22m Space matching Room 101)
         ======================================================== */}
      <ambientLight intensity={isNight ? 0.08 : 0.85} color={isNight ? '#1e1b4b' : '#ffffff'} />
      <directionalLight
        position={[6, 14, 6]}
        intensity={isNight ? 0.12 : 1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 12, -6]} intensity={isNight ? 0.05 : 0.5} color="#e0f2fe" />

      {/* Point lights for natural soft fill */}
      {!isNight && (
        <>
          <pointLight position={[-4, 4.5, 0]} distance={18} intensity={isRoom1 ? 0.9 : 1.1} color={isRoom1 ? '#f8fafc' : '#fef08a'} />
          <pointLight position={[4, 4.5, 0]} distance={18} intensity={isRoom1 ? 0.9 : 1.1} color={isRoom1 ? '#f8fafc' : '#fef08a'} />
        </>
      )}

      {/* ========================================================
          2. DEDICATED ROOM STUDIO FLOORING & WALLS (22m x 22m, Height 5.0m - 5.2m)
         ======================================================== */}
      {isRoom1 ? (
        <>
          {/* Room 1 (Office): Large Modern Office Floor (22x22m, Centered at [0,0,0]) */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[22.0, 22.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <gridHelper args={[22, 22, '#0ea5e9', '#334155']} position={[0, 0.005, 0]} />

          {/* Enclosing Boundary Walls (Height 5.0m) */}
          {/* Back Wall (North at Z = -11.0) */}
          <mesh position={[0, 2.5, -11.0]}>
            <boxGeometry args={[22.0, 5.0, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Architectural Cyan Accent Light Bar (like Room 101) */}
          <mesh position={[0, 4.3, -10.88]}>
            <boxGeometry args={[22.0, 0.35, 0.05]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
          {/* Left Wall (West at X = -11.0, Mount Point B Wall) */}
          <mesh position={[-11.0, 2.5, 0]}>
            <boxGeometry args={[0.2, 5.0, 22.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Right Wall (East at X = 11.0) */}
          <mesh position={[11.0, 2.5, 0]}>
            <boxGeometry args={[0.2, 5.0, 22.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Front Wall (South at Z = 11.0) */}
          <mesh position={[0, 2.5, 11.0]}>
            <boxGeometry args={[22.0, 5.0, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* Ceiling (Y = 4.0m) */}
          <mesh position={[0, 4.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[22.0, 22.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Troffer Lights 3x3 Grid on Ceiling */}
          {[-7.0, 0, 7.0].map((tx, idx) =>
            [-7.0, 0, 7.0].map((tz, jdx) => (
              <mesh key={`troffer_${idx}_${jdx}`} position={[tx, 3.98, tz]}>
                <boxGeometry args={[1.6, 0.05, 0.8]} />
                <meshStandardMaterial
                  color={isNight ? '#334155' : '#ffffff'}
                  emissive={isNight ? '#000000' : '#ffffff'}
                  emissiveIntensity={isNight ? 0 : 0.8}
                />
              </mesh>
            ))
          )}
        </>
      ) : (
        <>
          {/* Room 2 (Workshop): Coated Industrial Concrete (22x22m, Centered at [0,0,0]) */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[22.0, 22.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <gridHelper args={[22, 22, '#475569', '#334155']} position={[0, 0.005, 0]} />

          {/* Yellow Safety Walkway down center corridor (Z axis) */}
          <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 22.0]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[-1.2, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 22.0]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[1.2, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 22.0]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          {/* Crosswalk / Intersection Walkway */}
          <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[22.0, 2.0]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>

          {/* Enclosing Boundary Walls (Height 5.2m) */}
          {/* Back Wall (North at Z = -11.0) */}
          <mesh position={[0, 2.6, -11.0]}>
            <boxGeometry args={[22.0, 5.2, 0.2]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          {/* Left Wall (West at X = -11.0) */}
          <mesh position={[-11.0, 2.6, 0]}>
            <boxGeometry args={[0.2, 5.2, 22.0]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          {/* Right Wall (East at X = 11.0) */}
          <mesh position={[11.0, 2.6, 0]}>
            <boxGeometry args={[0.2, 5.2, 22.0]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          {/* Front Wall (South at Z = 11.0) */}
          <mesh position={[0, 2.6, 11.0]}>
            <boxGeometry args={[22.0, 5.2, 0.2]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>

          {/* Industrial Ceiling (Y = 5.2m) */}
          <mesh position={[0, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[22.0, 22.0]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Steel Truss Overhead Beams */}
          {[-7.0, -3.5, 0, 3.5, 7.0].map((tz, idx) => (
            <mesh key={`truss_${idx}`} position={[0, 5.08, tz]}>
              <boxGeometry args={[22.0, 0.25, 0.2]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </>
      )}

      {/* ========================================================
          3. WORKBENCHES: PPE STATION & CAMERA DISPATCH
         ======================================================== */}
      {/* A. PPE Workbench */}
      <PpeStationTable3D position={[-6.0, 0, 4.0]} />

      {/* B. Camera Dispatch Table */}
      <group position={[-6.0, 0, -4.0]}>
        {/* Heavy Duty Tool Bench */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.2, 0.76, 0.85]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Wooden Workbench Top Surface */}
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[1.25, 0.04, 0.9]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>

        {/* Unboxing CCTV Packaging Box */}
        <group position={[0, 0.88, 0]}>
          <mesh>
            <boxGeometry args={[0.34, 0.16, 0.34]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.082, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.3]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} />
          </mesh>
        </group>

        {/* 3D Dome Camera Resting on Box before Pick up (Room isolated, without floating badge) */}
        {(isRoom1 ? !roomCameras.room1_indoor.hasPickedUpCamera : !roomCameras.room2_outdoor.hasPickedUpCamera) && (
          <group position={[0, 1.02, 0]}>
            {/* Camera Base Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.095, 0.04, 20]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Gimbal Core */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#09090b" roughness={0.4} />
            </mesh>
            {/* Lens */}
            <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.025, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Transparent Dome Bubble */}
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.078, 16, 16]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.35}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
          </group>
        )}

        {/* Proximity Button when player is close */}
        {isNearCameraTable && !(isRoom1 ? roomCameras.room1_indoor.hasPickedUpCamera : roomCameras.room2_outdoor.hasPickedUpCamera) && !isAnyModalOpen && (
          <Html position={[0, 0.95, 0.5]} center distanceFactor={5.0}>
            <button
              onClick={() => pickUpCamera()}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs border border-cyan-300 shadow-2xl flex items-center gap-2 cursor-pointer transition-all scale-105 ring-4 ring-cyan-400/40"
            >
              <span>📦</span>
              <span>กด E เพื่อหยิบตัวกล้อง Dome Camera</span>
            </button>
          </Html>
        )}
      </group>

      {/* ========================================================
          5. ZONE 1 (LEFT): LARGE ENTERPRISE OFFICE PROPS (22x22m)
         ======================================================== */}
      {isRoom1 && (
        <>
          {/* Row of 42U Server Racks along Left Wall near Point B (X = -10.1) */}
          {[-3.0, 0.0, 3.0].map((rz, idx) => (
            <group key={idx} position={[-10.1, 1.1, rz]}>
              <mesh>
                <boxGeometry args={[0.85, 2.2, 0.95]} />
                <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.6} />
              </mesh>
              {/* Glass Door */}
              <mesh position={[0.43, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.9, 2.1, 0.02]} />
                <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Server LEDs */}
              {[-0.8, -0.4, 0, 0.4, 0.8].map((yOff, jdx) => (
                <mesh key={jdx} position={[0.44, yOff, 0.2]}>
                  <sphereGeometry args={[0.015, 8, 8]} />
                  <meshStandardMaterial
                    color={(idx + jdx) % 2 === 0 ? '#10b981' : '#06b6d4'}
                    emissive={(idx + jdx) % 2 === 0 ? '#10b981' : '#06b6d4'}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              ))}
            </group>
          ))}

          {/* Office Desks & Workstation Clusters on East Side */}
          {[3.5, 7.0].map((dx, idx) =>
            [-3.5, 3.5].map((dz, jdx) => (
              <group key={`${idx}-${jdx}`} position={[dx, 0, dz]}>
                <mesh position={[0, 0.38, 0]}>
                  <boxGeometry args={[1.8, 0.76, 0.9]} />
                  <meshStandardMaterial color="#475569" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                  <boxGeometry args={[0.7, 0.45, 0.05]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.9, 0.028]}>
                  <planeGeometry args={[0.66, 0.4]} />
                  <meshBasicMaterial color="#0284c7" />
                </mesh>
              </group>
            ))
          )}

          {/* Office Glass Sliding Door Partition */}
          <group position={[3.0, 1.3, 7.5]}>
            <mesh>
              <boxGeometry args={[0.04, 2.6, 2.4]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.35}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.06, 2.62, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>

          {/* Target Pedestrian Mannequin in Office Main Walkway (Centered at [0, 0, 0]) */}
          <group position={[0, 0, 0]}>
            {/* Target Floor Bullseye Decals */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.9, 1.05, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.52, 32]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 24]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.7} />
            </mesh>

            {/* Mannequin 3D Body */}
            {/* Head Sphere at 1.62m */}
            <mesh position={[0, 1.62, 0]}>
              <sphereGeometry args={[0.11, 20, 20]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} emissive="#0284c7" emissiveIntensity={0.3} />
            </mesh>
            {/* Face Detection AI Reticle */}
            <group position={[0, 1.62, 0]}>
              <mesh>
                <boxGeometry args={[0.26, 0.32, 0.26]} />
                <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.7} />
              </mesh>
              <mesh position={[0, 0, 0.132]}>
                <ringGeometry args={[0.03, 0.042, 16]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>
            </group>
            {/* Torso */}
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.38, 0.58, 0.22]} />
              <meshStandardMaterial color="#0284c7" transparent opacity={0.4} />
            </mesh>
            {/* Legs */}
            <mesh position={[0, 0.44, 0]}>
              <boxGeometry args={[0.3, 0.84, 0.2]} />
              <meshStandardMaterial color="#0369a1" transparent opacity={0.35} />
            </mesh>

            {/* Floating Target Badge above Mannequin */}
            {!isAnyModalOpen && (
              <Html position={[0, 2.1, 0]} center distanceFactor={6.8} pointerEvents="none">
                <div className="flex flex-col items-center gap-1 select-none animate-bounce">
                  <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950/95 text-cyan-300 border border-cyan-400 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>🎯 จุดที่ต้องการบันทึกภาพ (เป้าหมายสัญจร)</span>
                  </div>
                  <div className="text-[9px] font-mono text-cyan-200 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-800 shadow">
                    ระดับตรวจจับใบหน้า: 1.60 ม. · ทางเดินหลักสำนักงาน
                  </div>
                </div>
              </Html>
            )}
          </group>
        </>
      )}

      {/* ========================================================
          6. ZONE 2 (RIGHT): LARGE FACTORY PROPS (22x22m, Height 5.2m)
         ======================================================== */}
      {!isRoom1 && (
        <>
          {/* Structural Beam / Soffit over Point C ([0, 4.28, -3.5]) */}
          <mesh position={[0, 4.28, -3.5]}>
            <boxGeometry args={[4.0, 0.16, 2.6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Grid of Structural Steel H-Beam Columns (5.2m High) */}
          {([
            [-4.0, -6.0],
            [-4.0, 6.0],
            [4.0, 0], // Column holding Point D ([3.6, 3.2, 0])
            [4.0, -6.0],
            [4.0, 6.0],
          ] as const).map(([cx, cz], idx) => (
            <group key={idx} position={[cx, 2.6, cz]}>
              <mesh>
                <boxGeometry args={[0.35, 5.2, 0.35]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, -2.55, 0]}>
                <boxGeometry args={[0.55, 0.1, 0.55]} />
                <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
              </mesh>
              {/* EMT Conduit Running Up Column */}
              <mesh position={[-0.20, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 5.2, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* High-Bay Industrial Pendant Lamps (Hanging at Y = 4.8m) */}
          {([
            [-4.0, -3.0],
            [-4.0, 3.0],
            [4.0, -3.0],
            [4.0, 3.0],
          ] as const).map(([hx, hz], idx) => (
            <group key={idx} position={[hx, 4.8, hz]}>
              {/* Hanging Cord */}
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.4, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Industrial Bell Reflector */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.26, 0.18, 16, 1, true]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
              {/* Emissive LED Bulb */}
              <mesh position={[0, -0.04, 0]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial
                  color={isNight ? '#475569' : '#fef08a'}
                  emissive={isNight ? '#000000' : '#fef08a'}
                  emissiveIntensity={isNight ? 0 : 0.9}
                />
              </mesh>
            </group>
          ))}

          {/* Heavy Duty Pallet Racking with Stored Goods along X = 9.5 */}
          {[-5.0, 0.0, 5.0].map((rz, idx) => (
            <group key={idx} position={[9.5, 0, rz]}>
              {/* Upright Frames */}
              <mesh position={[-0.45, 2.0, 0]}>
                <boxGeometry args={[0.08, 4.0, 1.8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0.45, 2.0, 0]}>
                <boxGeometry args={[0.08, 4.0, 1.8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Orange Load Beams */}
              {[1.0, 2.2, 3.4].map((by, jdx) => (
                <group key={jdx} position={[0, by, 0]}>
                  <mesh position={[0, 0, 0.88]}>
                    <boxGeometry args={[1.0, 0.08, 0.05]} />
                    <meshStandardMaterial color="#ea580c" metalness={0.6} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 0, -0.88]}>
                    <boxGeometry args={[1.0, 0.08, 0.05]} />
                    <meshStandardMaterial color="#ea580c" metalness={0.6} roughness={0.4} />
                  </mesh>
                  {/* Wooden Pallet & Box */}
                  <mesh position={[0, 0.06, 0]}>
                    <boxGeometry args={[0.85, 0.1, 1.6]} />
                    <meshStandardMaterial color="#b45309" roughness={0.8} />
                  </mesh>
                  <mesh position={[0, 0.32, 0]}>
                    <boxGeometry args={[0.7, 0.42, 1.3]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.7} />
                  </mesh>
                </group>
              ))}
            </group>
          ))}

          {/* Workshop Step Ladder */}
          <group position={[7.0, 0.9, -2.0]}>
            <mesh rotation={[0, 0, 0.15]} position={[-0.15, 0, 0]}>
              <boxGeometry args={[0.06, 1.9, 0.45]} />
              <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh rotation={[0, 0, -0.15]} position={[0.15, 0, 0]}>
              <boxGeometry args={[0.06, 1.9, 0.45]} />
              <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.4} />
            </mesh>
          </group>

          {/* Target Pedestrian Mannequin in Workshop Walkway (Centered at [0, 0, 0]) */}
          <group position={[0, 0, 0]}>
            {/* Target Floor Bullseye Decals on Walkway */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.9, 1.05, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.52, 32]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 24]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.7} />
            </mesh>

            {/* Mannequin 3D Body */}
            {/* Head Sphere at 1.62m */}
            <mesh position={[0, 1.62, 0]}>
              <sphereGeometry args={[0.11, 20, 20]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} emissive="#0284c7" emissiveIntensity={0.3} />
            </mesh>
            {/* Face Detection AI Reticle */}
            <group position={[0, 1.62, 0]}>
              <mesh>
                <boxGeometry args={[0.26, 0.32, 0.26]} />
                <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.7} />
              </mesh>
              <mesh position={[0, 0, 0.132]}>
                <ringGeometry args={[0.03, 0.042, 16]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>
            </group>
            {/* Torso */}
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.38, 0.58, 0.22]} />
              <meshStandardMaterial color="#0284c7" transparent opacity={0.4} />
            </mesh>
            {/* Legs */}
            <mesh position={[0, 0.44, 0]}>
              <boxGeometry args={[0.3, 0.84, 0.2]} />
              <meshStandardMaterial color="#0369a1" transparent opacity={0.35} />
            </mesh>

            {/* Floating Target Badge above Mannequin */}
            {!isAnyModalOpen && (
              <Html position={[0, 2.1, 0]} center distanceFactor={6.8} pointerEvents="none">
                <div className="flex flex-col items-center gap-1 select-none animate-bounce">
                  <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950/95 text-cyan-300 border border-cyan-400 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>🎯 จุดที่ต้องการบันทึกภาพ (เป้าหมายสัญจร)</span>
                  </div>
                  <div className="text-[9px] font-mono text-cyan-200 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-800 shadow">
                    ระดับตรวจจับใบหน้า: 1.60 ม. · แนวทางเดินสัญจรโรงงาน
                  </div>
                </div>
              </Html>
            )}
          </group>
        </>
      )}

      {/* ========================================================
          7. MOUNT POINT BEACONS & PRE-INSTALLED BRACKETS
          Neutral styling (Cyan/Sky/Slate) without spoiler colors!
         ======================================================== */}
      {(Object.keys(DOME_MOUNT_POINTS_DATA) as DomeMountPointId[])
        .filter((pointId) => DOME_MOUNT_POINTS_DATA[pointId].roomId === activeRoom)
        .map((pointId) => {
        const pt = DOME_MOUNT_POINTS_DATA[pointId];
        const [px, py, pz] = pt.worldPosition;
        const isSelected = activeMountId === pointId;
        const isNear = nearMountPointId === pointId;
        const isThisMounted =
          pt.roomId === 'room1_indoor'
            ? roomCameras.room1_indoor.isCameraMounted && roomCameras.room1_indoor.mountedPointId === pointId
            : roomCameras.room2_outdoor.isCameraMounted && roomCameras.room2_outdoor.mountedPointId === pointId;
        if (isThisMounted) return null;

        return (
          <group
            key={pointId}
            position={[px, py, pz]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMountPoint(pointId);
            }}
          >
            {/* Pre-installed Wall L-Bracket for Point B when unmounted */}
            {pointId === 'B' && (
              <group>
                <mesh position={[-0.40, 0.05, 0]}>
                  <boxGeometry args={[0.04, 0.26, 0.20]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[-0.20, 0.06, 0]}>
                  <boxGeometry args={[0.40, 0.05, 0.05]} />
                  <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.01, 0]}>
                  <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.3} />
                </mesh>
              </group>
            )}

            {/* Pre-installed Junction Box for Point C when unmounted */}
            {pointId === 'C' && (
              <group position={[0, 0.04, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.21, 0.21, 0.08, 32]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.15} roughness={0.4} />
                </mesh>
              </group>
            )}

            {/* Pre-installed Gooseneck Bracket for Point D when unmounted */}
            {pointId === 'D' && (
              <group>
                <mesh position={[0.40, 0.15, 0]}>
                  <boxGeometry args={[0.04, 0.28, 0.24]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0.20, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.40, 16]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.24, 16]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.01, 0]}>
                  <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
                </mesh>
              </group>
            )}

            {/* Target Ring aligned horizontally with mounting flange */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
              <ringGeometry args={[0.18, 0.24, 24]} />
              <meshBasicMaterial
                color={isSelected ? '#38bdf8' : '#64748b'}
                transparent
                opacity={isSelected ? 0.85 : 0.45}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Center Pulsing Sphere */}
            <mesh position={[0, -0.01, 0]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : '#94a3b8'}
                emissive={isSelected ? '#0284c7' : '#475569'}
                emissiveIntensity={isSelected ? 0.6 : 0.2}
              />
            </mesh>

            {/* Interactive Installation Button when player is close and holding camera */}
            {hasPickedUpCamera && !isCameraMounted && isNear && !isAnyModalOpen && (
              <Html position={[0, -0.85, 0]} center distanceFactor={4.8}>
                <button
                  onClick={() => mountCameraAtPoint(pointId)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-300 shadow-2xl flex items-center gap-2 cursor-pointer transition-all scale-110 ring-4 ring-sky-400/40 animate-pulse"
                >
                  <span>🎯</span>
                  <span>ติดตั้งกล้อง (กด E)</span>
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* ========================================================
          8. DOME CAMERA RIGS (Per-Room Mounted Cameras)
         ======================================================== */}
      {roomCameras.room1_indoor.isCameraMounted && roomCameras.room1_indoor.mountedPointId && (
        <DomeCameraRig mountPointId={roomCameras.room1_indoor.mountedPointId} />
      )}
      {roomCameras.room2_outdoor.isCameraMounted && roomCameras.room2_outdoor.mountedPointId && (
        <DomeCameraRig mountPointId={roomCameras.room2_outdoor.mountedPointId} />
      )}

      {/* 3D Visual FOV Cone for the Active Room Camera when Mounted */}
      {isCameraMounted && mountedPointId && activePoint.roomId === activeRoom && (
        <>
          <VisualFovCone
            origin={[activePoint.worldPosition[0], activePoint.worldPosition[1] - 0.05, activePoint.worldPosition[2]]}
            fovDegrees={fovDegrees}
            rangeMeters={6.5}
            isNightIr={isNight}
            pan={pan}
            tilt={tilt}
          />

          {/* Technical Specs Floating Badge (Lens & FOV, No % Spoilers) */}
          {!isAnyModalOpen && (
            <Html
              position={[activePoint.worldPosition[0], activePoint.worldPosition[1] - 0.45, activePoint.worldPosition[2]]}
              center
              transform
              distanceFactor={5.5}
            >
              <div className="bg-slate-950/95 border border-cyan-500/80 text-cyan-200 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xl flex items-center gap-2 whitespace-nowrap pointer-events-none">
                <span>📹 เลนส์: {activePoint.lensMm ?? 2.8} มม.</span>
                <span className="text-cyan-400">|</span>
                <span>📐 FOV: {fovDegrees}°</span>
              </div>
            </Html>
          )}
        </>
      )}

      {/* ========================================================
          9. ROBLOX TECHNICIAN AVATAR CONTROLLER
         ======================================================== */}
      <RobloxPlayerController />
    </group>
  );
};
