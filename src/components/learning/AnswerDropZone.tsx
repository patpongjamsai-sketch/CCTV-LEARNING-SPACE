import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const AnswerDropZone: React.FC = () => {
  const mission1Slots = useRoleplayStore((s) => s.mission1Slots);
  const placeCardOnMission1Slot = useRoleplayStore((s) => s.placeCardOnMission1Slot);
  const carriedItem = useRoleplayStore((s) => s.carriedItem);
  const isComplete = useRoleplayStore((s) => s.missions.M1.isCompleted);

  return (
    <group position={[-6, 0, -8]}>
      {/* Bench Surface */}
      <mesh position={[0, 1.05, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.08, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
      </mesh>

      {/* Exploded View Lens to LAN Visual Display */}
      <group position={[0, 1.3, -0.2]}>
        {/* Optical Lens */}
        <mesh position={[-0.9, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 24]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.8} opacity={0.7} transparent roughness={0.1} />
        </mesh>
        {/* Arrow 1 */}
        <mesh position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.04, 0.12, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>

        {/* CMOS Sensor */}
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.04]} />
          <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Arrow 2 */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.04, 0.12, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>

        {/* ISP Processor Chip */}
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.04]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Arrow 3 */}
        <mesh position={[0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.04, 0.12, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>

        {/* LAN RJ45 Port */}
        <mesh position={[0.9, 0, 0]}>
          <boxGeometry args={[0.16, 0.14, 0.12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
      </group>

      {/* 4 Answer Drop Slots on Bench */}
      {mission1Slots.map((slot, index) => {
        const posX = -0.9 + index * 0.6;
        const isOccupied = !!slot.currentPlacedItem;
        const isReady = carriedItem?.type === 'KNOWLEDGE_CARD';

        let color = '#334155';
        if (slot.status === 'CORRECT') color = '#10b981';
        else if (slot.status === 'WRONG_ORDER') color = '#eab308';
        else if (slot.status === 'WRONG_TYPE') color = '#ef4444';
        else if (isReady) color = '#0284c7';

        return (
          <group
            key={`m1_slot_${index}`}
            position={[posX, 1.1, 0.4]}
            onClick={() => placeCardOnMission1Slot(index)}
          >
            {/* Slot Pad */}
            <mesh>
              <boxGeometry args={[0.5, 0.03, 0.38]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isOccupied || isComplete ? 0.3 : 0.05}
                roughness={0.4}
              />
            </mesh>

            {/* Placed Card */}
            {isOccupied && (
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.42, 0.02, 0.3]} />
                <meshStandardMaterial color="#0284c7" roughness={0.2} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
