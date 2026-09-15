import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const AnalogVsIpTable: React.FC = () => {
  const mission4Cards = useRoleplayStore((s) => s.mission4Cards);

  return (
    <group position={[0, 0, 9]}>
      {/* 3D Representation on Bench */}
      {/* Left Table Equipment (Analog Camera + DVR) */}
      <mesh position={[-2.4, 0.95, -0.2]}>
        <boxGeometry args={[0.4, 0.12, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Right Table Equipment (IP Camera + NVR + Switch) */}
      <mesh position={[2.4, 0.95, -0.2]}>
        <boxGeometry args={[0.45, 0.14, 0.35]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>

      {/* Cards on Analog Side */}
      {mission4Cards.analogCards.map((cId, idx) => (
        <mesh key={`analog_${cId}`} position={[-3.0 + (idx % 4) * 0.4, 0.95, 0.2 + Math.floor(idx / 4) * 0.3]}>
          <boxGeometry args={[0.3, 0.02, 0.2]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Cards on IP Side */}
      {mission4Cards.ipCards.map((cId, idx) => (
        <mesh key={`ip_${cId}`} position={[1.8 + (idx % 4) * 0.4, 0.95, 0.2 + Math.floor(idx / 4) * 0.3]}>
          <boxGeometry args={[0.3, 0.02, 0.2]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      ))}
    </group>
  );
};
