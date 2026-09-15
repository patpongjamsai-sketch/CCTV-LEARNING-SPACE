import React from 'react';
import { PortType } from '../../shared/domain/roleplayTypes';

interface InteractivePortProps {
  portId: string;
  name: string;
  portType: PortType;
  position: [number, number, number];
  isConnected: boolean;
  isPoEActive?: boolean;
  onClick?: () => void;
}

export const InteractivePort: React.FC<InteractivePortProps> = ({
  portType,
  position,
  isConnected,
  isPoEActive,
  onClick,
}) => {
  const isHdmi = portType === 'HDMI_IN' || portType === 'HDMI_OUT';

  let statusColor = '#64748b'; // Idle
  if (isConnected) {
    statusColor = isPoEActive ? '#10b981' : '#38bdf8';
  }

  return (
    <group position={position} onClick={onClick}>
      {/* Port Housing Socket */}
      <mesh>
        <boxGeometry args={isHdmi ? [0.06, 0.03, 0.04] : [0.045, 0.045, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Internal Port Connector Pins (Gold/Copper) */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={isHdmi ? [0.04, 0.015, 0.01] : [0.03, 0.03, 0.01]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={isConnected ? 0.6 : 0.1} />
      </mesh>

      {/* Port Ring Indicator */}
      <mesh position={[0, 0, 0.022]}>
        <ringGeometry args={[0.025, 0.035, 16]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>
    </group>
  );
};
