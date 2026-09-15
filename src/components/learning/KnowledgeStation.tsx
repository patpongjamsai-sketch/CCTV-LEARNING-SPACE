import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZoneId } from '../../shared/domain/roleplayTypes';

interface KnowledgeStationProps {
  zoneId: ZoneId;
  position: [number, number, number];
  color: string;
  onInteract?: () => void;
}

export const KnowledgeStation: React.FC<KnowledgeStationProps> = ({
  position,
  color,
  onInteract,
}) => {
  const badgeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (badgeRef.current) {
      const t = state.clock.getElapsedTime();
      badgeRef.current.position.y = position[1] + 2.4 + Math.sin(t * 2.2) * 0.08;
      badgeRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group position={position} onClick={onInteract}>
      {/* Floating Holographic Beacon */}
      <group ref={badgeRef}>
        {/* Outer Rotating Diamond/Octahedron */}
        <mesh>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            wireframe
          />
        </mesh>
        {/* Core Glowing Sphere */}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Ground Projection Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.72, 32]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
    </group>
  );
};
