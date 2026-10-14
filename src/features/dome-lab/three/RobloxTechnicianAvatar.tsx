'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDomeLabStore } from '../store/useDomeLabStore';

interface RobloxTechnicianAvatarProps {
  isMoving: boolean;
  isSprinting: boolean;
}

export const RobloxTechnicianAvatar: React.FC<RobloxTechnicianAvatarProps> = ({
  isMoving,
  isSprinting,
}) => {
  const ppe = useDomeLabStore((s) => s.ppeEquipped);
  const hasPickedUpCamera = useDomeLabStore((s) => s.hasPickedUpCamera);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const isHoldingCamera = hasPickedUpCamera && !isCameraMounted;

  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  const walkCycleRef = useRef(0);

  useFrame((_, delta) => {
    const animSpeed = isSprinting ? 14 : 9;

    if (isMoving) {
      walkCycleRef.current += delta * animSpeed;
      const swing = Math.sin(walkCycleRef.current) * 0.65;

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      if (isHoldingCamera) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.55 + Math.sin(walkCycleRef.current) * 0.05;
          leftArmRef.current.rotation.y = 0.3;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.55 + Math.sin(walkCycleRef.current) * 0.05;
          rightArmRef.current.rotation.y = -0.3;
        }
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
      }

      if (torsoRef.current) {
        torsoRef.current.position.y = 0.9 + Math.abs(Math.sin(walkCycleRef.current)) * 0.04;
      }
    } else {
      walkCycleRef.current += delta * 2;
      const breathe = Math.sin(walkCycleRef.current) * 0.01;

      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;

      if (isHoldingCamera) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.55 + breathe;
          leftArmRef.current.rotation.y = 0.3;
          leftArmRef.current.rotation.z = 0.05;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.55 + breathe;
          rightArmRef.current.rotation.y = -0.3;
          rightArmRef.current.rotation.z = -0.05;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = 0;
          leftArmRef.current.rotation.z = 0.08 + breathe;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = 0;
          rightArmRef.current.rotation.z = -0.08 - breathe;
        }
      }

      if (torsoRef.current) {
        torsoRef.current.position.y = 0.9 + breathe;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(walkCycleRef.current * 0.5) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Shadow Blob at feet */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.4} />
      </mesh>

      {/* 2. LEGS */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.6, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {ppe.slippers ? (
          <mesh position={[0, -0.58, 0.04]}>
            <boxGeometry args={[0.24, 0.06, 0.28]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.4} />
          </mesh>
        ) : ppe.shoes ? (
          <group position={[0, -0.56, 0.03]}>
            <mesh>
              <boxGeometry args={[0.24, 0.12, 0.28]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.02, 0.08]}>
              <boxGeometry args={[0.2, 0.08, 0.1]} />
              <meshStandardMaterial color="#f97316" roughness={0.5} />
            </mesh>
          </group>
        ) : (
          <mesh position={[0, -0.58, 0.02]}>
            <boxGeometry args={[0.22, 0.06, 0.24]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        )}
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.6, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {ppe.slippers ? (
          <mesh position={[0, -0.58, 0.04]}>
            <boxGeometry args={[0.24, 0.06, 0.28]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.4} />
          </mesh>
        ) : ppe.shoes ? (
          <group position={[0, -0.56, 0.03]}>
            <mesh>
              <boxGeometry args={[0.24, 0.12, 0.28]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.02, 0.08]}>
              <boxGeometry args={[0.2, 0.08, 0.1]} />
              <meshStandardMaterial color="#f97316" roughness={0.5} />
            </mesh>
          </group>
        ) : (
          <mesh position={[0, -0.58, 0.02]}>
            <boxGeometry args={[0.22, 0.06, 0.24]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        )}
      </group>

      {/* 3. TORSO */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.28]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>

        {/* High-visibility Safety Vest */}
        <mesh position={[0, 0.02, 0.005]}>
          <boxGeometry args={[0.52, 0.54, 0.29]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} />
        </mesh>

        {/* Reflective Stripes */}
        <mesh position={[0, 0.08, 0.152]}>
          <boxGeometry args={[0.44, 0.045, 0.01]} />
          <meshStandardMaterial color="#fef08a" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.12, 0.152]}>
          <boxGeometry args={[0.44, 0.045, 0.01]} />
          <meshStandardMaterial color="#fef08a" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>

        {/* Vocational Tool Belt */}
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.54, 0.09, 0.31]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>

        {/* Held 3D Dome Camera in Hands */}
        {isHoldingCamera && (
          <group position={[0, -0.15, 0.34]} rotation={[-0.35, 0, 0]}>
            {/* Base Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.085, 0.035, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Gimbal Core */}
            <mesh position={[0, 0, 0.025]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#09090b" roughness={0.4} />
            </mesh>
            {/* Lens */}
            <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Transparent Dome Bubble */}
            <mesh position={[0, 0, 0.025]}>
              <sphereGeometry args={[0.068, 16, 16]} />
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

        {/* 4. ARMS */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.37, 0.18, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.18, 0.56, 0.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          {ppe.gloves ? (
            <mesh position={[0, -0.46, 0]}>
              <boxGeometry args={[0.2, 0.18, 0.22]} />
              <meshStandardMaterial color="#16a34a" roughness={0.4} />
            </mesh>
          ) : (
            <mesh position={[0, -0.46, 0]}>
              <boxGeometry args={[0.17, 0.16, 0.18]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
          )}
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.37, 0.18, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.18, 0.56, 0.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          {ppe.gloves ? (
            <mesh position={[0, -0.46, 0]}>
              <boxGeometry args={[0.2, 0.18, 0.22]} />
              <meshStandardMaterial color="#16a34a" roughness={0.4} />
            </mesh>
          ) : (
            <mesh position={[0, -0.46, 0]}>
              <boxGeometry args={[0.17, 0.16, 0.18]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
          )}
        </group>

        {/* 5. HEAD */}
        <group ref={headRef} position={[0, 0.46, 0]}>
          {/* Yellow/Warm Roblox Face */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.5} />
          </mesh>

          {/* Eyes */}
          <mesh position={[-0.07, 0.02, 0.155]}>
            <boxGeometry args={[0.04, 0.05, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.07, 0.02, 0.155]}>
            <boxGeometry args={[0.04, 0.05, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Safety Glasses */}
          {ppe.sunglasses ? (
            <mesh position={[0, 0.02, 0.162]}>
              <boxGeometry args={[0.24, 0.07, 0.02]} />
              <meshStandardMaterial color="#09090b" roughness={0.1} />
            </mesh>
          ) : ppe.glasses ? (
            <mesh position={[0, 0.02, 0.162]}>
              <boxGeometry args={[0.25, 0.08, 0.02]} />
              <meshStandardMaterial
                color="#38bdf8"
                metalness={0.2}
                roughness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>
          ) : null}

          {/* Dust Mask N95 */}
          {ppe.mask && (
            <mesh position={[0, -0.08, 0.165]}>
              <boxGeometry args={[0.18, 0.1, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
          )}

          {/* Headwear */}
          {ppe.cap ? (
            <group position={[0, 0.15, 0]}>
              <mesh>
                <boxGeometry args={[0.32, 0.1, 0.32]} />
                <meshStandardMaterial color="#ef4444" roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.03, 0.18]}>
                <boxGeometry args={[0.28, 0.03, 0.14]} />
                <meshStandardMaterial color="#dc2626" roughness={0.8} />
              </mesh>
            </group>
          ) : ppe.helmet ? (
            <group position={[0, 0.16, 0]}>
              <mesh>
                <boxGeometry args={[0.35, 0.16, 0.35]} />
                <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.1} />
              </mesh>
              <mesh position={[0, -0.06, 0]}>
                <boxGeometry args={[0.38, 0.03, 0.38]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.4} />
              </mesh>
            </group>
          ) : (
            /* Hair */
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.31, 0.08, 0.31]} />
              <meshStandardMaterial color="#451a03" roughness={0.8} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};
