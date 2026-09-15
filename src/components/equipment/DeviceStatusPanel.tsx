import React from 'react';
import { DeviceId } from '../../shared/domain/roleplayTypes';
import { useRoleplayStore } from '../../store/useRoleplayStore';

interface DeviceStatusPanelProps {
  deviceId: DeviceId;
  position: [number, number, number];
  isPowerOn: boolean;
  isLinkUp: boolean;
  isOnline: boolean;
}

export const DeviceStatusPanel: React.FC<DeviceStatusPanelProps> = ({
  deviceId,
  position,
  isPowerOn,
  isLinkUp,
  isOnline,
}) => {
  const togglePower = useRoleplayStore((s) => s.toggleDevicePower);

  return (
    <group position={position}>
      {/* Power Toggle Button */}
      <group position={[-0.12, 0, 0]} onClick={() => togglePower(deviceId)}>
        <mesh>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial
            color={isPowerOn ? '#ef4444' : '#64748b'}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Power LED Indicator */}
      <mesh position={[0, 0, 0.01]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color={isPowerOn ? '#22c55e' : '#334155'}
          emissive={isPowerOn ? '#22c55e' : '#000000'}
          emissiveIntensity={isPowerOn ? 1.0 : 0}
        />
      </mesh>

      {/* Link Activity LED */}
      <mesh position={[0.04, 0, 0.01]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color={isLinkUp ? '#eab308' : '#334155'}
          emissive={isLinkUp ? '#eab308' : '#000000'}
          emissiveIntensity={isLinkUp ? 0.9 : 0}
        />
      </mesh>

      {/* Online / PoE Status LED */}
      <mesh position={[0.08, 0, 0.01]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color={isOnline ? '#38bdf8' : '#334155'}
          emissive={isOnline ? '#38bdf8' : '#000000'}
          emissiveIntensity={isOnline ? 0.9 : 0}
        />
      </mesh>
    </group>
  );
};
