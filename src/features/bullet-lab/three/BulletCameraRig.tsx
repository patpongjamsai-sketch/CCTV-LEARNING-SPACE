'use client';

import React from 'react';
import * as THREE from 'three';
import { VisualFovCone } from './VisualFovCone';

interface BulletCameraRigProps {
  position?: [number, number, number];
  pan?: number; // degrees (-90 to +90)
  tilt?: number; // degrees (-60 to +60)
  rotation?: number; // degrees (-45 to +45)
  showFovCone?: boolean;
  fovDegrees?: number;
  isGhost?: boolean;
  scale?: number;
}

const SCREW_OFFSETS: [number, number][] = [
  [0.045, 0.045],
  [-0.045, 0.045],
  [0.045, -0.045],
  [-0.045, -0.045],
];

export const BulletCameraRig: React.FC<BulletCameraRigProps> = ({
  position = [0, 0, 0],
  pan = 0,
  tilt = -15,
  rotation = 0,
  showFovCone = true,
  fovDegrees = 75,
  isGhost = false,
  scale = 1,
}) => {
  // Conversions from degrees to radians
  const panRad = THREE.MathUtils.degToRad(pan);
  const tiltRad = THREE.MathUtils.degToRad(tilt);
  const rollRad = THREE.MathUtils.degToRad(rotation);

  // Materials
  const baseColor = isGhost ? '#38bdf8' : '#f1f5f9';
  const accentColor = isGhost ? '#0284c7' : '#334155';
  const metalColor = isGhost ? '#7dd3fc' : '#94a3b8';
  const lensColor = isGhost ? '#0ea5e9' : '#090d16';
  const irColor = isGhost ? '#38bdf8' : '#ef4444';

  const opacity = isGhost ? 0.35 : 1.0;
  const transparent = isGhost;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Wall Mount Base Plate (Flange) */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.075, 0.02, 32]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={isGhost ? 0.1 : 0.4}
          roughness={0.3}
          transparent={transparent}
          opacity={opacity}
          wireframe={isGhost}
        />
      </mesh>

      {/* Mounting Screws (4 peripheral screw heads) */}
      {!isGhost && (
        <>
          {SCREW_OFFSETS.map(([sx, sy], idx) => (
            <mesh key={idx} position={[sx, sy, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.008, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {/* Base Stem Bracket extending out from the wall */}
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.08, 24]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.6}
          roughness={0.3}
          transparent={transparent}
          opacity={opacity}
          wireframe={isGhost}
        />
      </mesh>

      {/* 2. Pan Pivot (Swivels around Y axis) */}
      <group position={[0, 0, 0.11]} rotation={[0, panRad, 0]}>
        {/* Pan Joint Ball / Swivel Hub */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.032, 24, 24]} />
          <meshStandardMaterial
            color={metalColor}
            metalness={0.7}
            roughness={0.2}
            transparent={transparent}
            opacity={opacity}
            wireframe={isGhost}
          />
        </mesh>

        {/* Pan locking collar */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.034, 0.006, 12, 32]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.8}
            roughness={0.3}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Arm extending forward from pan swivel */}
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 24]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.5}
            roughness={0.3}
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* 3. Tilt Pivot (Pitches up and down around X axis: negative tilts down) */}
        <group position={[0, 0, 0.07]} rotation={[-tiltRad, 0, 0]}>
          {/* Tilt Hinge Joint */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 24]} />
            <meshStandardMaterial
              color={metalColor}
              metalness={0.7}
              roughness={0.2}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>

          {/* 4. Camera Body with Axial Roll (Rotation) */}
          <group position={[0, 0, 0.04]} rotation={[0, 0, rollRad]}>
            {/* Main Bullet Camera Housing (Cylindrical body) */}
            <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.18, 32]} />
              <meshStandardMaterial
                color={baseColor}
                metalness={isGhost ? 0.2 : 0.3}
                roughness={0.25}
                transparent={transparent}
                opacity={opacity}
                wireframe={isGhost}
              />
            </mesh>

            {/* Rear Cap with waterproof cable gland */}
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.042, 0.02, 32]} />
              <meshStandardMaterial
                color={accentColor}
                metalness={0.4}
                roughness={0.4}
                transparent={transparent}
                opacity={opacity}
              />
            </mesh>

            {/* Flexible network/power cable pigtail tail */}
            {!isGhost && (
              <mesh position={[0, -0.02, 0.01]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.08, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
            )}

            {/* Sunshield Visor / Weather Hood (Top cover) */}
            <mesh position={[0, 0.025, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry
                args={[0.048, 0.048, 0.16, 32, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial
                color={accentColor}
                metalness={0.4}
                roughness={0.3}
                transparent={transparent}
                opacity={opacity}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Front Bezel Ring */}
            <mesh position={[0, 0, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.044, 0.042, 0.015, 32]} />
              <meshStandardMaterial
                color={accentColor}
                metalness={0.8}
                roughness={0.2}
                transparent={transparent}
                opacity={opacity}
              />
            </mesh>

            {/* Front Face Glass Window */}
            <mesh position={[0, 0, 0.213]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.004, 32]} />
              <meshStandardMaterial
                color={lensColor}
                metalness={0.9}
                roughness={0.1}
                transparent={true}
                opacity={isGhost ? 0.4 : 0.85}
              />
            </mesh>

            {/* Central Optical Lens Aperture */}
            <mesh position={[0, 0, 0.216]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.005, 24]} />
              <meshStandardMaterial
                color="#030712"
                metalness={0.95}
                roughness={0.05}
              />
            </mesh>

            {/* Infrared (IR) LED Illuminator Ring (Circular dots) */}
            {!isGhost &&
              [...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 0.026;
                const lx = Math.cos(angle) * radius;
                const ly = Math.sin(angle) * radius;
                return (
                  <mesh
                    key={i}
                    position={[lx, ly, 0.215]}
                    rotation={[Math.PI / 2, 0, 0]}
                  >
                    <cylinderGeometry args={[0.003, 0.003, 0.003, 12]} />
                    <meshStandardMaterial
                      color={irColor}
                      emissive={irColor}
                      emissiveIntensity={0.6}
                    />
                  </mesh>
                );
              })}

            {/* 5. Visual FOV Cone projected forward from lens face */}
            {showFovCone && (
              <VisualFovCone
                origin={[0, 0, 0.22]}
                fovDegrees={fovDegrees}
                rangeMeters={5}
                isGhost={isGhost}
              />
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
