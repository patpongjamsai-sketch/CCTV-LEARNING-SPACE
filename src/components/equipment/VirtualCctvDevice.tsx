import React from 'react';
import { DeviceId } from '../../shared/domain/roleplayTypes';
import { VIRTUAL_EQUIPMENT_CATALOG } from '../../shared/domain/virtualEquipmentCatalog';
import { InteractivePort } from './InteractivePort';
import { DeviceStatusPanel } from './DeviceStatusPanel';
import { useRoleplayStore } from '../../store/useRoleplayStore';

interface VirtualCctvDeviceProps {
  deviceId: DeviceId;
  position: [number, number, number];
  rotation?: [number, number, number];
  onPortClick?: (portId: string) => void;
}

export const VirtualCctvDevice: React.FC<VirtualCctvDeviceProps> = ({
  deviceId,
  position,
  rotation = [0, 0, 0],
  onPortClick,
}) => {
  const spec = VIRTUAL_EQUIPMENT_CATALOG[deviceId];
  const poweredDevices = useRoleplayStore((s) => s.poweredDevices);
  const connections = useRoleplayStore((s) => s.connections);
  const topology = useRoleplayStore((s) => s.topologyResult);

  const isPowerOn = !!poweredDevices[deviceId];

  // Helper to check if a specific port is connected
  const isPortConnected = (portId: string) => {
    return connections.some(
      (c) =>
        (c.fromDeviceId === deviceId && c.fromPortId === portId) ||
        (c.toDeviceId === deviceId && c.toPortId === portId)
    );
  };

  if (deviceId === 'CAMERA_BULLET') {
    return (
      <group position={position} rotation={rotation}>
        {/* Wall/Mounting Bracket Base */}
        <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Articulated Arm */}
        <mesh position={[0, 0, -0.08]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Bullet Main Cylinder Body */}
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.22, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Sunshield Visor */}
        <mesh position={[0, 0.05, 0.06]}>
          <boxGeometry args={[0.13, 0.02, 0.24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Front Lens & IR Ring */}
        <mesh position={[0, 0, 0.17]}>
          <cylinderGeometry args={[0.055, 0.055, 0.01, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        {/* Optical Glass Center */}
        <mesh position={[0, 0, 0.176]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive={topology.isCameraOnline ? '#38bdf8' : '#000000'}
            emissiveIntensity={topology.isCameraOnline ? 0.6 : 0}
          />
        </mesh>

        {/* RJ45 Port on Rear/Pigtail */}
        <InteractivePort
          portId="CAM_BULLET_PORT_RJ45"
          name="LAN / PoE"
          portType="RJ45_POE"
          position={[0, -0.04, -0.06]}
          isConnected={isPortConnected('CAM_BULLET_PORT_RJ45')}
          isPoEActive={topology.isCameraPowered}
          onClick={() => onPortClick?.('CAM_BULLET_PORT_RJ45')}
        />

        {/* LED Status Indicator */}
        <DeviceStatusPanel
          deviceId="CAMERA_BULLET"
          position={[0, 0.07, 0.08]}
          isPowerOn={topology.isCameraPowered}
          isLinkUp={topology.isCameraOnline}
          isOnline={topology.isCameraOnline}
        />
      </group>
    );
  }

  if (deviceId === 'POE_SWITCH_8P') {
    return (
      <group position={position} rotation={rotation}>
        {/* 1U Rackmount Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[spec.dimensions[0], spec.dimensions[1], spec.dimensions[2]]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Front Metal Bezel Panel */}
        <mesh position={[0, 0, spec.dimensions[2] / 2 + 0.005]}>
          <boxGeometry args={[spec.dimensions[0] * 0.96, spec.dimensions[1] * 0.9, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>

        {/* 8 PoE RJ45 Ports (Front Left to Center) */}
        {spec.ports.slice(0, 8).map((port, idx) => {
          const posX = -0.11 + idx * 0.024;
          return (
            <InteractivePort
              key={port.id}
              portId={port.id}
              name={port.name}
              portType={port.portType}
              position={[posX, 0, spec.dimensions[2] / 2 + 0.01]}
              isConnected={isPortConnected(port.id)}
              isPoEActive={isPowerOn}
              onClick={() => onPortClick?.(port.id)}
            />
          );
        })}

        {/* 2 Uplink Ports (Front Right) */}
        {spec.ports.slice(8, 10).map((port, idx) => {
          const posX = 0.09 + idx * 0.026;
          return (
            <InteractivePort
              key={port.id}
              portId={port.id}
              name={port.name}
              portType={port.portType}
              position={[posX, 0, spec.dimensions[2] / 2 + 0.01]}
              isConnected={isPortConnected(port.id)}
              isPoEActive={false}
              onClick={() => onPortClick?.(port.id)}
            />
          );
        })}

        {/* Power switch and LED panel */}
        <DeviceStatusPanel
          deviceId="POE_SWITCH_8P"
          position={[-0.1, 0.015, spec.dimensions[2] / 2 + 0.012]}
          isPowerOn={isPowerOn}
          isLinkUp={isPowerOn}
          isOnline={isPowerOn}
        />
      </group>
    );
  }

  if (deviceId === 'NVR_8CH') {
    return (
      <group position={position} rotation={rotation}>
        {/* NVR Black Metal Enclosure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[spec.dimensions[0], spec.dimensions[1], spec.dimensions[2]]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Front Panel with Brand & LED Strip */}
        <mesh position={[0, 0, spec.dimensions[2] / 2 + 0.005]}>
          <boxGeometry args={[spec.dimensions[0] * 0.98, spec.dimensions[1] * 0.9, 0.005]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>

        {/* Rear Ports */}
        <InteractivePort
          portId="NVR_PORT_LAN"
          name="LAN RJ45"
          portType="RJ45_LAN"
          position={[-0.08, 0, -spec.dimensions[2] / 2 - 0.005]}
          isConnected={isPortConnected('NVR_PORT_LAN')}
          onClick={() => onPortClick?.('NVR_PORT_LAN')}
        />
        <InteractivePort
          portId="NVR_PORT_HDMI_OUT"
          name="HDMI OUT"
          portType="HDMI_OUT"
          position={[0.08, 0, -spec.dimensions[2] / 2 - 0.005]}
          isConnected={isPortConnected('NVR_PORT_HDMI_OUT')}
          onClick={() => onPortClick?.('NVR_PORT_HDMI_OUT')}
        />

        {/* Front Status Panel & Power Button */}
        <DeviceStatusPanel
          deviceId="NVR_8CH"
          position={[0.12, 0, spec.dimensions[2] / 2 + 0.01]}
          isPowerOn={isPowerOn}
          isLinkUp={topology.isNvrReachable}
          isOnline={topology.isCameraOnline}
        />
      </group>
    );
  }

  if (deviceId === 'CLIENT_PC') {
    return (
      <group position={position} rotation={rotation}>
        {/* Tower Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[spec.dimensions[0], spec.dimensions[1], spec.dimensions[2]]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Rear LAN Port */}
        <InteractivePort
          portId="CLIENT_PC_PORT_LAN"
          name="Client LAN"
          portType="RJ45_LAN"
          position={[0, 0.05, -spec.dimensions[2] / 2 - 0.005]}
          isConnected={isPortConnected('CLIENT_PC_PORT_LAN')}
          onClick={() => onPortClick?.('CLIENT_PC_PORT_LAN')}
        />

        {/* Front Power Switch */}
        <DeviceStatusPanel
          deviceId="CLIENT_PC"
          position={[0, 0.15, spec.dimensions[2] / 2 + 0.005]}
          isPowerOn={isPowerOn}
          isLinkUp={topology.isClientPcReachable}
          isOnline={topology.isLiveViewActive}
        />
      </group>
    );
  }

  if (deviceId === 'MONITOR') {
    return (
      <group position={position} rotation={rotation}>
        {/* Monitor Stand Base & Neck */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.22, 0.015, 0.18]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.08, -0.04]}>
          <boxGeometry args={[0.04, 0.16, 0.04]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Bezel */}
        <mesh castShadow>
          <boxGeometry args={[spec.dimensions[0], spec.dimensions[1], spec.dimensions[2]]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>

        {/* Screen Glass */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[spec.dimensions[0] * 0.94, spec.dimensions[1] * 0.9]} />
          <meshStandardMaterial
            color={
              topology.isLiveViewActive
                ? '#10b981'
                : isPowerOn
                ? '#1e293b'
                : '#020617'
            }
            emissive={
              topology.isLiveViewActive
                ? '#10b981'
                : isPowerOn
                ? '#0ea5e9'
                : '#000000'
            }
            emissiveIntensity={topology.isLiveViewActive ? 0.7 : isPowerOn ? 0.15 : 0}
            roughness={0.2}
          />
        </mesh>

        {/* Rear HDMI IN Port */}
        <InteractivePort
          portId="MONITOR_PORT_HDMI_IN"
          name="HDMI IN"
          portType="HDMI_IN"
          position={[0, -0.05, -spec.dimensions[2] / 2 - 0.005]}
          isConnected={isPortConnected('MONITOR_PORT_HDMI_IN')}
          onClick={() => onPortClick?.('MONITOR_PORT_HDMI_IN')}
        />

        {/* Monitor Power Button */}
        <DeviceStatusPanel
          deviceId="MONITOR"
          position={[0.2, -0.15, spec.dimensions[2] / 2 + 0.005]}
          isPowerOn={isPowerOn}
          isLinkUp={topology.isMonitorConnectedToNvr}
          isOnline={topology.isLiveViewActive}
        />
      </group>
    );
  }

  return null;
};
