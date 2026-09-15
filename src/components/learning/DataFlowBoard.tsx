import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const DataFlowBoard: React.FC = () => {
  const mission2Slots = useRoleplayStore((s) => s.mission2Slots);
  const placeCardOnMission2Slot = useRoleplayStore((s) => s.placeCardOnMission2Slot);
  const carriedItem = useRoleplayStore((s) => s.carriedItem);
  const isComplete = useRoleplayStore((s) => s.missions.M2.isCompleted);

  const packetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (isComplete && packetRef.current) {
      const t = (state.clock.getElapsedTime() * 1.5) % 4; // loop through 4 stages
      // Slot positions x from -1.8 to 1.8
      const stage = Math.floor(t);
      const frac = t - stage;
      const xStart = -1.8 + stage * 1.2;
      const xEnd = -1.8 + (stage + 1) * 1.2;
      packetRef.current.position.x = xStart + (xEnd - xStart) * frac;
      packetRef.current.position.y = 1.35 + Math.sin(frac * Math.PI) * 0.15;
    }
  });

  return (
    <group position={[0, 0, 4]}>
      {/* Board Base Frame */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[4.8, 0.9, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Board Title Plaque */}
      <mesh position={[0, 1.6, 0.11]}>
        <boxGeometry args={[3.2, 0.22, 0.02]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.2} />
      </mesh>

      {/* Connecting Cable Line */}
      <mesh position={[0, 1.2, 0.11]}>
        <boxGeometry args={[3.8, 0.04, 0.01]} />
        <meshStandardMaterial
          color={isComplete ? '#10b981' : '#475569'}
          emissive={isComplete ? '#10b981' : '#000000'}
          emissiveIntensity={isComplete ? 0.6 : 0}
        />
      </mesh>

      {/* 4 Interactive Drop Slots */}
      {mission2Slots.map((slot, index) => {
        const posX = -1.8 + index * 1.2;
        const isOccupied = !!slot.currentPlacedItem;
        const isHoverEligible = carriedItem?.type === 'KNOWLEDGE_CARD';

        return (
          <group
            key={`m2_slot_${index}`}
            position={[posX, 1.2, 0.12]}
            onClick={() => placeCardOnMission2Slot(index)}
          >
            {/* Slot Plate */}
            <mesh>
              <boxGeometry args={[0.95, 0.55, 0.04]} />
              <meshStandardMaterial
                color={
                  isOccupied
                    ? '#10b981'
                    : isHoverEligible
                    ? '#0284c7'
                    : '#334155'
                }
                emissive={isOccupied ? '#10b981' : '#000000'}
                emissiveIntensity={isOccupied ? 0.25 : 0}
                roughness={0.4}
              />
            </mesh>

            {/* Placed Card indicator */}
            {isOccupied && (
              <mesh position={[0, 0, 0.04]}>
                <boxGeometry args={[0.85, 0.45, 0.02]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Animated Glowing Packet */}
      {isComplete && (
        <mesh ref={packetRef} position={[-1.8, 1.35, 0.15]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};
