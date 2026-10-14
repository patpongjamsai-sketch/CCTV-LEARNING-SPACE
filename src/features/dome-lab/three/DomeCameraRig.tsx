'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';

import { DomeMountPointId } from '../types';

interface DomeCameraRigProps {
  mountPointId?: DomeMountPointId;
  isGhost?: boolean;
}

export const DomeCameraRig: React.FC<DomeCameraRigProps> = ({
  mountPointId,
  isGhost = false,
}) => {
  const activeMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const targetId = mountPointId ?? activeMountPointId;
  const pointInfo = DOME_MOUNT_POINTS_DATA[targetId];

  const pan = useDomeLabStore((s) => s.pan);
  const tilt = useDomeLabStore((s) => s.tilt);
  const rotation = useDomeLabStore((s) => s.rotation);
  const dayNightMode = useDomeLabStore((s) => s.dayNightMode);

  // References for 3-Axis Gimbal
  const panGroupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const rollGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (panGroupRef.current) {
      // Pan: Rotate around vertical axis (Y)
      panGroupRef.current.rotation.y = THREE.MathUtils.degToRad(pan);
    }
    if (tiltGroupRef.current) {
      // Tilt: Rotate around X axis (0 to 75 deg down)
      tiltGroupRef.current.rotation.x = THREE.MathUtils.degToRad(tilt);
    }
    if (rollGroupRef.current) {
      // Azimuth / Roll: Rotate lens around optical axis (Z)
      rollGroupRef.current.rotation.z = THREE.MathUtils.degToRad(rotation);
    }
  });

  const [wx, wy, wz] = pointInfo.worldPosition;
  const isSoffit = pointInfo.mountType === 'soffit';
  const isGooseneck = pointInfo.mountType === 'steel-column';
  const isWall = pointInfo.mountType === 'wall';

  return (
    <group position={[wx, wy, wz]}>
      {/* ========================================================
          1. WALL L-BRACKET (Point B: Office gypsum wall at X = -7.35)
         ======================================================== */}
      {isWall && (
        <group>
          {/* Wall Mounting Backplate (flush with wall at x = -0.40) */}
          <mesh position={[-0.40, 0.05, 0]}>
            <boxGeometry args={[0.04, 0.26, 0.20]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* 4 Wall Fastener Screws */}
          {[-0.08, 0.08].map((sy) =>
            [-0.07, 0.07].map((sz) => (
              <mesh key={`${sy}-${sz}`} position={[-0.38, 0.05 + sy, sz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          )}
          {/* Horizontal Arm Tube (from x = -0.40 to 0) */}
          <mesh position={[-0.20, 0.06, 0]}>
            <boxGeometry args={[0.40, 0.05, 0.05]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.4} />
          </mesh>
          {/* Triangular Reinforcing Gusset */}
          <mesh position={[-0.32, 0.01, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Horizontal Mounting Flange Plate at y = 0 */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          2. GOOSENECK COLUMN BRACKET (Point D: Column at X = 5.65)
         ======================================================== */}
      {isGooseneck && (
        <group>
          {/* Column Clamping Backplate (flush with column face at x = 0.40) */}
          <mesh position={[0.40, 0.15, 0]}>
            <boxGeometry args={[0.04, 0.28, 0.24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Beam Clamping Bolts */}
          {[-0.10, 0.10].map((by) =>
            [-0.08, 0.08].map((bz) => (
              <mesh key={`${by}-${bz}`} position={[0.38, 0.15 + by, bz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          )}
          {/* Horizontal Upper Pipe */}
          <mesh position={[0.20, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.40, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.4} />
          </mesh>
          {/* Curved Elbow Downward Pipe */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.24, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.4} />
          </mesh>
          {/* Horizontal Mounting Flange Plate at y = 0 */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          3. WATERPROOF JUNCTION BOX (Point C: Under Soffit Canopy)
         ======================================================== */}
      {pointInfo.junctionBoxRequired && isSoffit && (
        <group position={[0, 0.04, 0]}>
          {/* Deep Base Waterproof Round Box (height 0.08, top touches soffit at 3.60m) */}
          <mesh>
            <cylinderGeometry args={[0.21, 0.21, 0.08, 32]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.15}
              roughness={0.4}
              transparent={isGhost}
              opacity={isGhost ? 0.4 : 1.0}
            />
          </mesh>
          {/* Waterproof Seal O-ring between Box and Lid */}
          <mesh position={[0, -0.038, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.208, 0.004, 8, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Conduit Gland Entry on side */}
          <mesh position={[0.20, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.06, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* EMT Metal Conduit running to roof */}
          <mesh position={[0.24, 0.12, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.20, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          4. DOME CAMERA BODY (Mounted flush under y = 0, hangs down)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Mounting Base Ring / Outer Collar (Top touches y = 0) */}
        <mesh position={[0, -0.012, 0]}>
          <cylinderGeometry args={[0.19, 0.20, 0.024, 32]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.2}
            roughness={0.3}
            transparent={isGhost}
            opacity={isGhost ? 0.35 : 1}
          />
        </mesh>

        {/* Waterproof Rubber O-Ring Seal Line */}
        <mesh position={[0, -0.024, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.192, 0.005, 8, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* ========================================================
            5. INTERNAL 3-AXIS GIMBAL MECHANISM
           ======================================================== */}
        {/* Axis 1: Pan Turntable (Rotates around vertical Y) */}
        <group ref={panGroupRef} position={[0, -0.026, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.012, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
          </mesh>

          {/* Gimbal Support Yoke Arms (L/R) */}
          <mesh position={[-0.12, -0.035, 0]}>
            <boxGeometry args={[0.025, 0.07, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.12, -0.035, 0]}>
            <boxGeometry args={[0.025, 0.07, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Axis 2: Tilt Cradle (Rotates around horizontal X) */}
          <group ref={tiltGroupRef} position={[0, -0.045, 0]}>
            {/* Camera Module Core Sphere */}
            <mesh>
              <sphereGeometry args={[0.10, 24, 24]} />
              <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.3} />
            </mesh>

            {/* Axis 3: Azimuth / Optical Roll (Rotates around optical axis Z) */}
            <group ref={rollGroupRef}>
              {/* Lens Bezel Faceplate */}
              <mesh position={[0, 0, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.058, 0.062, 0.016, 24]} />
                <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.2} />
              </mesh>

              {/* Optical Glass Lens Element */}
              <mesh position={[0, 0, 0.102]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.008, 24]} />
                <meshStandardMaterial
                  color="#1e1b4b"
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>

              {/* ANTI-IR FOAM RUBBER RING (Crucial Dome Feature: stops IR leaking into lens) */}
              <mesh position={[0, 0, 0.104]}>
                <torusGeometry args={[0.032, 0.004, 12, 24]} />
                <meshStandardMaterial color="#020617" roughness={1.0} />
              </mesh>

              {/* IR LED ILLUMINATOR ARRAY (Ring of 12 IR LEDs) */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const angle = (idx / 12) * Math.PI * 2;
                const radius = 0.046;
                const lx = Math.cos(angle) * radius;
                const ly = Math.sin(angle) * radius;
                const isNight = dayNightMode === 'night_ir';
                return (
                  <mesh key={idx} position={[lx, ly, 0.098]}>
                    <sphereGeometry args={[0.005, 8, 8]} />
                    <meshStandardMaterial
                      color={isNight ? '#ef4444' : '#27272a'}
                      emissive={isNight ? '#dc2626' : '#000000'}
                      emissiveIntensity={isNight ? 0.8 : 0}
                      roughness={0.3}
                    />
                  </mesh>
                );
              })}
            </group>
          </group>
        </group>

        {/* ========================================================
            6. TRANSPARENT DOME COVER BUBBLE (Hemisphere hanging downwards)
           ======================================================== */}
        <mesh position={[0, -0.024, 0]}>
          <sphereGeometry args={[0.165, 32, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transmission={0.92}
            opacity={1}
            transparent={true}
            roughness={0.08}
            ior={1.48}
            thickness={0.02}
            reflectivity={0.5}
            clearcoat={1}
          />
        </mesh>

        {/* Outer Retaining Trim Ring with 3 Vandal-Resistant Torx Screws */}
        <mesh position={[0, -0.024, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.168, 0.010, 12, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.3} />
        </mesh>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((rad, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(rad) * 0.168, -0.024, Math.sin(rad) * 0.168]}
          >
            <cylinderGeometry args={[0.004, 0.004, 0.012, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
