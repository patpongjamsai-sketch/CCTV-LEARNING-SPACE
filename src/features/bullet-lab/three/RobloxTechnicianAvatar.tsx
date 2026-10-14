'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBulletLabStore } from '../store/useBulletLabStore';

interface RobloxTechnicianAvatarProps {
  isMoving: boolean;
  isSprinting: boolean;
}

export const RobloxTechnicianAvatar: React.FC<RobloxTechnicianAvatarProps> = ({
  isMoving,
  isSprinting,
}) => {
  const ppe = useBulletLabStore((s) => s.ppeEquipped);

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
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;

      // Slight body vertical bounce when walking
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.9 + Math.abs(Math.sin(walkCycleRef.current)) * 0.04;
      }
    } else {
      // Idle breathing and settle
      walkCycleRef.current += delta * 2;
      const breathe = Math.sin(walkCycleRef.current) * 0.01;

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        leftArmRef.current.rotation.z = 0.08 + breathe;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.z = -0.08 - breathe;
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

      {/* 2. LEGS (Pivot from top of hips: Y = 0.6) */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.6, 0]}>
        {/* Navy Pants Leg Box */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Footwear on Left Leg */}
        {ppe.slippers ? (
          // Cyan casual slip-on sandals (Decoy)
          <mesh position={[0, -0.58, 0.04]}>
            <boxGeometry args={[0.24, 0.06, 0.28]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.4} />
          </mesh>
        ) : ppe.shoes ? (
          // Black & orange safety boots
          <group position={[0, -0.56, 0.03]}>
            <mesh>
              <boxGeometry args={[0.24, 0.12, 0.28]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Orange toe reinforcement */}
            <mesh position={[0, -0.02, 0.1]}>
              <boxGeometry args={[0.22, 0.08, 0.08]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>
          </group>
        ) : (
          // Standard dark shoes
          <mesh position={[0, -0.58, 0.02]}>
            <boxGeometry args={[0.23, 0.07, 0.25]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        )}
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.6, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Footwear on Right Leg */}
        {ppe.slippers ? (
          <mesh position={[0, -0.58, 0.04]}>
            <boxGeometry args={[0.24, 0.06, 0.28]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.4} />
          </mesh>
        ) : ppe.shoes ? (
          <group position={[0, -0.56, 0.03]}>
            <mesh>
              <boxGeometry args={[0.24, 0.12, 0.28]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
            </mesh>
            <mesh position={[0, -0.02, 0.1]}>
              <boxGeometry args={[0.22, 0.08, 0.08]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>
          </group>
        ) : (
          <mesh position={[0, -0.58, 0.02]}>
            <boxGeometry args={[0.23, 0.07, 0.25]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        )}
      </group>

      {/* 3. TORSO (Center Y = 0.9) */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        {/* Main Torso Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.58, 0.28]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>

        {/* High-visibility Safety Vest Layer */}
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[0.51, 0.56, 0.28]} />
          <meshStandardMaterial color="#84cc16" roughness={0.4} />
        </mesh>

        {/* Reflective silver stripes */}
        <mesh position={[0, 0.08, 0.15]}>
          <planeGeometry args={[0.46, 0.06]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.1, 0.15]}>
          <planeGeometry args={[0.46, 0.06]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>

        {/* CCTV Technician Logo Badge on Chest */}
        <mesh position={[-0.14, 0.16, 0.152]}>
          <planeGeometry args={[0.1, 0.06]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* 4. ARMS (Pivot from shoulders: Y = 0.22 from torso center) */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.36, 0.22, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.2, 0.55, 0.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>

          {/* Hand / Work Glove */}
          {ppe.gloves ? (
            <mesh position={[0, -0.44, 0]}>
              <boxGeometry args={[0.22, 0.2, 0.22]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>
          ) : (
            <mesh position={[0, -0.45, 0]}>
              <boxGeometry args={[0.18, 0.16, 0.18]} />
              <meshStandardMaterial color="#fcd34d" roughness={0.7} />
            </mesh>
          )}
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.36, 0.22, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.2, 0.55, 0.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>

          {/* Hand / Work Glove */}
          {ppe.gloves ? (
            <mesh position={[0, -0.44, 0]}>
              <boxGeometry args={[0.22, 0.2, 0.22]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>
          ) : (
            <mesh position={[0, -0.45, 0]}>
              <boxGeometry args={[0.18, 0.16, 0.18]} />
              <meshStandardMaterial color="#fcd34d" roughness={0.7} />
            </mesh>
          )}
        </group>

        {/* 5. HEAD & HEAD ACCESSORIES (Y = 0.48 above torso center) */}
        <group ref={headRef} position={[0, 0.48, 0]}>
          {/* Blocky Roblox Head */}
          <mesh>
            <boxGeometry args={[0.34, 0.34, 0.32]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>

          {/* Roblox Face Features (Eyes and Smile on Front: +Z) */}
          {/* Eyes */}
          <mesh position={[-0.08, 0.04, 0.165]}>
            <planeGeometry args={[0.04, 0.06]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.08, 0.04, 0.165]}>
            <planeGeometry args={[0.04, 0.06]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Smile Mouth */}
          <mesh position={[0, -0.06, 0.165]}>
            <planeGeometry args={[0.12, 0.03]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Dust Mask (N95) */}
          {ppe.mask && (
            <mesh position={[0, -0.07, 0.17]}>
              <boxGeometry args={[0.24, 0.14, 0.08]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
          )}

          {/* Safety Glasses vs Sunglasses */}
          {ppe.sunglasses ? (
            // Sunglasses (Fashion Decoy)
            <group position={[0, 0.04, 0.17]}>
              <mesh>
                <boxGeometry args={[0.3, 0.08, 0.04]} />
                <meshStandardMaterial color="#090d16" roughness={0.1} metalness={0.8} />
              </mesh>
            </group>
          ) : ppe.glasses ? (
            // Clear Safety Goggles
            <group position={[0, 0.04, 0.17]}>
              <mesh>
                <boxGeometry args={[0.32, 0.1, 0.05]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.6}
                  roughness={0.1}
                />
              </mesh>
              {/* Elastic strap on sides */}
              <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[0.35, 0.04, 0.28]} />
                <meshBasicMaterial color="#0284c7" wireframe={true} />
              </mesh>
            </group>
          ) : null}

          {/* Safety Helmet vs Baseball Cap */}
          {ppe.cap ? (
            // Red Baseball Cap (Fashion Decoy)
            <group position={[0, 0.15, 0]}>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.36, 0.12, 0.36]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
              {/* Front Visor Bill */}
              <mesh position={[0, 0, 0.24]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[0.32, 0.03, 0.16]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
            </group>
          ) : ppe.helmet ? (
            // Yellow Safety Hardhat
            <group position={[0, 0.16, 0]}>
              {/* Hardhat Dome */}
              <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[0.38, 0.16, 0.38]} />
                <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.1} />
              </mesh>
              {/* Hardhat Outer Brim Rim */}
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[0.44, 0.03, 0.44]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.2} />
              </mesh>
              {/* Center Hardhat Ridge */}
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.06, 0.04, 0.36]} />
                <meshStandardMaterial color="#a16207" />
              </mesh>
            </group>
          ) : (
            // Hair Block
            <mesh position={[0, 0.15, -0.02]}>
              <boxGeometry args={[0.35, 0.08, 0.34]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};
