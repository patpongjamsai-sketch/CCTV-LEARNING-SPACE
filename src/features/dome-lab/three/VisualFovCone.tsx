'use client';

import React from 'react';
import * as THREE from 'three';

interface VisualFovConeProps {
  origin?: [number, number, number];
  fovDegrees?: number;
  rangeMeters?: number;
  isNightIr?: boolean;
  pan?: number;
  tilt?: number;
}

export const VisualFovCone: React.FC<VisualFovConeProps> = ({
  origin = [0, 0, 0],
  fovDegrees = 95,
  rangeMeters = 5.0,
  isNightIr = false,
  pan = 0,
  tilt = 35,
}) => {
  const halfFovRad = THREE.MathUtils.degToRad(fovDegrees / 2);
  const bottomRadius = Math.tan(halfFovRad) * rangeMeters;
  const topRadius = 0.05;

  const coneColor = isNightIr ? '#ef4444' : '#06b6d4';
  const edgeColor = isNightIr ? '#dc2626' : '#22d3ee';

  return (
    <group position={origin}>
      <group rotation={[0, THREE.MathUtils.degToRad(pan), 0]}>
        <group rotation={[THREE.MathUtils.degToRad(tilt), 0, 0]}>
          <group position={[0, 0, rangeMeters / 2]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Transparent Volume */}
        <mesh>
          <cylinderGeometry
            args={[bottomRadius, topRadius, rangeMeters, 24, 1, true]}
          />
          <meshBasicMaterial
            color={coneColor}
            transparent={true}
            opacity={isNightIr ? 0.12 : 0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Wireframe Outline */}
        <mesh>
          <cylinderGeometry
            args={[bottomRadius, topRadius, rangeMeters, 12, 1, true]}
          />
          <meshBasicMaterial
            color={edgeColor}
            wireframe={true}
            transparent={true}
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* Cross-section ring */}
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
  </group>
</group>
  );
};
