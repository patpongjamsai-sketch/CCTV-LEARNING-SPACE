'use client';

import React from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';

interface TechnicianAvatar3DProps {
  position?: [number, number, number];
}

export const TechnicianAvatar3D: React.FC<TechnicianAvatar3DProps> = ({
  position = [-2.2, 0, 1.2],
}) => {
  const ppe = useBulletLabStore((s) => s.ppeEquipped);

  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Technician Shadow Base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.4} />
      </mesh>

      {/* 1. Legs / Pants */}
      <mesh position={[-0.12, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Feet / Footwear */}
      {/* Decoy Slippers vs Safety Shoes */}
      {ppe.slippers ? (
        // Slippers (Cyan casual sandals)
        <>
          <mesh position={[-0.12, 0.03, 0.04]}>
            <boxGeometry args={[0.12, 0.04, 0.22]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.5} />
          </mesh>
          <mesh position={[0.12, 0.03, 0.04]}>
            <boxGeometry args={[0.12, 0.04, 0.22]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.5} />
          </mesh>
        </>
      ) : ppe.shoes ? (
        // Safety Boots (Heavy black/orange steel toe)
        <>
          <mesh position={[-0.12, 0.06, 0.05]}>
            <boxGeometry args={[0.14, 0.12, 0.26]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[-0.12, 0.04, 0.14]}>
            <boxGeometry args={[0.12, 0.08, 0.08]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>

          <mesh position={[0.12, 0.06, 0.05]}>
            <boxGeometry args={[0.14, 0.12, 0.26]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0.12, 0.04, 0.14]}>
            <boxGeometry args={[0.12, 0.08, 0.08]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
        </>
      ) : (
        // Regular plain shoes
        <>
          <mesh position={[-0.12, 0.04, 0.04]}>
            <boxGeometry args={[0.11, 0.08, 0.22]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          <mesh position={[0.12, 0.04, 0.04]}>
            <boxGeometry args={[0.11, 0.08, 0.22]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
        </>
      )}

      {/* 2. Torso / Shirt & High-visibility Vest */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.42, 0.55, 0.22]} />
        <meshStandardMaterial color="#0284c7" roughness={0.6} />
      </mesh>

      {/* Reflective Safety Vest */}
      <mesh position={[0, 1.16, 0.01]}>
        <boxGeometry args={[0.43, 0.52, 0.22]} />
        <meshStandardMaterial color="#84cc16" roughness={0.5} />
      </mesh>
      {/* Reflective stripes */}
      <mesh position={[0, 1.16, 0.125]}>
        <planeGeometry args={[0.38, 0.06]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.02, 0.125]}>
        <planeGeometry args={[0.38, 0.06]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* 3. Arms & Hands */}
      {/* Left Arm */}
      <mesh position={[-0.26, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 12]} />
        <meshStandardMaterial color="#0284c7" roughness={0.6} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[0.26, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 12]} />
        <meshStandardMaterial color="#0284c7" roughness={0.6} />
      </mesh>

      {/* Hands / Gloves */}
      {ppe.gloves ? (
        <>
          <mesh position={[-0.26, 0.85, 0]}>
            <boxGeometry args={[0.09, 0.12, 0.08]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
          <mesh position={[0.26, 0.85, 0]}>
            <boxGeometry args={[0.09, 0.12, 0.08]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.26, 0.85, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.07]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.7} />
          </mesh>
          <mesh position={[0.26, 0.85, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.07]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.7} />
          </mesh>
        </>
      )}

      {/* 4. Head & Face */}
      <group position={[0, 1.58, 0]}>
        {/* Head Sphere */}
        <mesh>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>

        {/* Dust Mask */}
        {ppe.mask && (
          <mesh position={[0, -0.02, 0.11]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.16, 0.1, 0.08]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>
        )}

        {/* Safety Glasses vs Sunglasses */}
        {ppe.sunglasses ? (
          // Sunglasses (Dark fashion)
          <mesh position={[0, 0.03, 0.12]}>
            <boxGeometry args={[0.18, 0.05, 0.04]} />
            <meshStandardMaterial color="#090d16" roughness={0.1} />
          </mesh>
        ) : ppe.glasses ? (
          // Clear Safety Goggles
          <mesh position={[0, 0.03, 0.12]}>
            <boxGeometry args={[0.2, 0.07, 0.05]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.6}
              metalness={0.4}
              roughness={0.1}
            />
          </mesh>
        ) : null}

        {/* Safety Helmet vs Fashion Cap */}
        {ppe.cap ? (
          // Baseball Cap
          <group position={[0, 0.08, 0]}>
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#dc2626" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.02, 0.14]}>
              <boxGeometry args={[0.16, 0.02, 0.12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.7} />
            </mesh>
          </group>
        ) : ppe.helmet ? (
          // Hardhat / Safety Helmet (Yellow with brim)
          <group position={[0, 0.08, 0]}>
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.155, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Hardhat brim */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.175, 0.175, 0.02, 24]} />
              <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Center crest rib */}
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.03, 0.05, 0.24]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.2} />
            </mesh>
          </group>
        ) : (
          // Natural hair
          <mesh position={[0, 0.07, -0.02]}>
            <sphereGeometry args={[0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
};
