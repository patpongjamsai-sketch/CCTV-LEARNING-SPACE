'use client';

import React from 'react';
import * as THREE from 'three';

interface VisualFovConeProps {
  origin?: [number, number, number];
  fovDegrees?: number;
  rangeMeters?: number;
  isGhost?: boolean;
}

export const VisualFovCone: React.FC<VisualFovConeProps> = ({
  origin = [0, 0, 0],
  fovDegrees = 75,
  rangeMeters = 4.5,
  isGhost = false,
}) => {
  // Calculate base radius at range distance from FOV angle
  const halfFovRad = THREE.MathUtils.degToRad(fovDegrees / 2);
  const bottomRadius = Math.tan(halfFovRad) * rangeMeters;
  const topRadius = 0.04; // Near the lens

  const coneColor = isGhost ? '#38bdf8' : '#22d3ee';
  const edgeColor = isGhost ? '#0284c7' : '#06b6d4';

  return (
    <group position={origin}>
      {/* 
        cylinderGeometry: args=[radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded]
        By default cylinder is along Y-axis, centered at height/2.
        We rotate by -PI/2 around X axis so it points along +Z axis, 
        and translate Z by rangeMeters / 2.
      */}
      <group position={[0, 0, rangeMeters / 2]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Transparent semi-solid volume */}
        <mesh>
          <cylinderGeometry
            args={[bottomRadius, topRadius, rangeMeters, 24, 1, true]}
          />
          <meshBasicMaterial
            color={coneColor}
            transparent={true}
            opacity={isGhost ? 0.08 : 0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Wireframe edges for clear boundary perception */}
        <mesh>
          <cylinderGeometry
            args={[bottomRadius, topRadius, rangeMeters, 12, 1, true]}
          />
          <meshBasicMaterial
            color={edgeColor}
            wireframe={true}
            transparent={true}
            opacity={isGhost ? 0.25 : 0.45}
            depthWrite={false}
          />
        </mesh>

        {/* Far end cross-section boundary ring */}
        <mesh position={[0, rangeMeters / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bottomRadius * 0.96, bottomRadius, 32]} />
          <meshBasicMaterial
            color={edgeColor}
            transparent={true}
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
