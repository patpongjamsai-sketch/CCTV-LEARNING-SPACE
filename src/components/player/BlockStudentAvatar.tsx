import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InventoryItem } from '../../shared/domain/roleplayTypes';

interface BlockStudentAvatarProps {
  isMoving: boolean;
  isSprinting: boolean;
  carriedItem: InventoryItem | null;
}

export const BlockStudentAvatar: React.FC<BlockStudentAvatarProps> = ({
  isMoving,
  isSprinting,
  carriedItem,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = isSprinting ? 14 : 9;

    if (isMoving) {
      const swing = Math.sin(t * speed) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      // If holding heavy equipment, arms are held out in front
      const isHeavy = carriedItem?.weight === 'HEAVY';
      if (isHeavy) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * speed) * 0.05;
          leftArmRef.current.rotation.z = 0.2;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * speed) * 0.05;
          rightArmRef.current.rotation.z = -0.2;
        }
      } else if (carriedItem) {
        // Holding card in right hand
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 4 + Math.sin(t * speed) * 0.1;
          rightArmRef.current.rotation.z = 0;
        }
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
      }
    } else {
      // Idle breathing
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;

      const isHeavy = carriedItem?.weight === 'HEAVY';
      if (isHeavy) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI / 3;
          leftArmRef.current.rotation.z = 0.2;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 3;
          rightArmRef.current.rotation.z = -0.2;
        }
      } else if (carriedItem) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = 0;
          leftArmRef.current.rotation.z = 0;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 4;
          rightArmRef.current.rotation.z = 0;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = 0;
          leftArmRef.current.rotation.z = 0.05;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = 0;
          rightArmRef.current.rotation.z = -0.05;
        }
      }

      if (headRef.current) {
        headRef.current.position.y = 1.4 + Math.sin(t * 2) * 0.015;
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Shadow Blob */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#0b1b24" opacity={0.45} transparent />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color="#f6c29b" roughness={0.6} />
        {/* Trainee Cap (Navy blue) */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.34, 0.08, 0.34]} />
          <meshStandardMaterial color="#0f2b3c" roughness={0.5} />
        </mesh>
        {/* Cap Visor */}
        <mesh position={[0, 0.11, 0.2]}>
          <boxGeometry args={[0.32, 0.02, 0.12]} />
          <meshStandardMaterial color="#0f2b3c" roughness={0.5} />
        </mesh>
        {/* Friendly Eyes */}
        <mesh position={[-0.08, 0.02, 0.165]}>
          <boxGeometry args={[0.04, 0.06, 0.01]} />
          <meshBasicMaterial color="#1a252f" />
        </mesh>
        <mesh position={[0.08, 0.02, 0.165]}>
          <boxGeometry args={[0.04, 0.06, 0.01]} />
          <meshBasicMaterial color="#1a252f" />
        </mesh>
      </mesh>

      {/* Torso with Technician Vest */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.42, 0.52, 0.26]} />
        <meshStandardMaterial color="#008080" roughness={0.5} />
        {/* Hi-Vis Safety Stripes on Vest */}
        <mesh position={[0, 0.08, 0.132]}>
          <boxGeometry args={[0.38, 0.04, 0.01]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, -0.1, 0.132]}>
          <boxGeometry args={[0.38, 0.04, 0.01]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.25} />
        </mesh>
        {/* Trainee ID Badge */}
        <mesh position={[0.11, 0.16, 0.133]}>
          <boxGeometry args={[0.08, 0.1, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.28, 0.9, 0]} castShadow>
        <boxGeometry args={[0.12, 0.48, 0.14]} />
        <meshStandardMaterial color="#008080" roughness={0.6} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.28, 0.9, 0]} castShadow>
        <boxGeometry args={[0.12, 0.48, 0.14]} />
        <meshStandardMaterial color="#008080" roughness={0.6} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.12, 0.32, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.12, 0.32, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Carried Item Miniature */}
      {carriedItem && (
        <group
          position={
            carriedItem.weight === 'HEAVY' ? [0, 0.85, 0.36] : [0.32, 0.82, 0.28]
          }
        >
          {carriedItem.type === 'KNOWLEDGE_CARD' ? (
            <mesh rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.24, 0.32, 0.015]} />
              <meshStandardMaterial
                color="#00a8ff"
                emissive="#00a8ff"
                emissiveIntensity={0.3}
                roughness={0.2}
              />
            </mesh>
          ) : (
            <mesh>
              <boxGeometry
                args={
                  carriedItem.deviceId === 'POE_SWITCH_8P'
                    ? [0.32, 0.08, 0.2]
                    : carriedItem.deviceId === 'NVR_8CH'
                    ? [0.36, 0.09, 0.28]
                    : [0.18, 0.18, 0.24]
                }
              />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.5} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};
