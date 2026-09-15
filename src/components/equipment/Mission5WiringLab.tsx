import React, { useState } from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';
import { VirtualCctvDevice } from './VirtualCctvDevice';
import { canConnectCableToPort } from '../../shared/domain/connectionRules';
import { DeviceId } from '../../shared/domain/roleplayTypes';

export const Mission5WiringLab: React.FC = () => {
  const placedDevices = useRoleplayStore((s) => s.placedDevices);
  const placeDevice = useRoleplayStore((s) => s.placeDeviceOnRackOrDesk);
  const carriedItem = useRoleplayStore((s) => s.carriedItem);
  const connections = useRoleplayStore((s) => s.connections);
  const connectCable = useRoleplayStore((s) => s.connectCable);
  const notify = useRoleplayStore((s) => s.notify);

  // Quick wiring state when trainee selects source port and target port
  const [selectedSource, setSelectedSource] = useState<{
    deviceId: DeviceId;
    portId: string;
    portType: 'RJ45_POE' | 'RJ45_LAN' | 'HDMI_OUT' | 'HDMI_IN';
  } | null>(null);

  const handlePortClick = (deviceId: DeviceId, portId: string, portType: any) => {
    if (!selectedSource) {
      setSelectedSource({ deviceId, portId, portType });
      notify(`เลือกพอร์ตต้นทาง: ${portId} กรุณาคลิกพอร์ตปลายทางที่ต้องการเชื่อมต่อ`, 'info');
      return;
    }

    if (selectedSource.deviceId === deviceId && selectedSource.portId === portId) {
      setSelectedSource(null);
      notify('ยกเลิกการเลือกพอร์ต', 'info');
      return;
    }

    // Determine cable type: HDMI or Cat6
    const isHdmi =
      (selectedSource.portType === 'HDMI_OUT' || selectedSource.portType === 'HDMI_IN') &&
      (portType === 'HDMI_OUT' || portType === 'HDMI_IN');

    const cableType = isHdmi ? 'HDMI' : 'CAT6';

    // Validate port compatibility
    const validationFrom = canConnectCableToPort(cableType, selectedSource.portType);
    const validationTo = canConnectCableToPort(cableType, portType);

    if (!validationFrom.allowed || !validationTo.allowed) {
      notify(validationFrom.reasonTh || validationTo.reasonTh || 'ชนิดสายและพอร์ตไม่ตรงกัน', 'error');
      setSelectedSource(null);
      return;
    }

    // Connect cable
    connectCable(cableType, selectedSource.deviceId, selectedSource.portId, deviceId, portId);
    notify(`เชื่อมต่อสาย ${cableType}: ${selectedSource.portId} -> ${portId} สำเร็จ!`, 'success');
    setSelectedSource(null);
  };

  return (
    <group>
      {/* 1. Camera Mount Zone (North-East Wall) */}
      <group position={[4, 3.2, -12.7]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshStandardMaterial
            color={placedDevices.CAMERA_BULLET ? '#10b981' : '#38bdf8'}
            roughness={0.4}
          />
        </mesh>
        {placedDevices.CAMERA_BULLET ? (
          <VirtualCctvDevice
            deviceId="CAMERA_BULLET"
            position={[0, -0.1, 0.1]}
            rotation={[0.3, 0, 0]}
            onPortClick={(portId) => handlePortClick('CAMERA_BULLET', portId, 'RJ45_POE')}
          />
        ) : (
          <group
            position={[0, 0, 0.1]}
            onClick={() => {
              if (carriedItem?.deviceId === 'CAMERA_BULLET') {
                placeDevice('CAMERA_BULLET');
              } else {
                notify('คุณต้องถือกล้อง IP ในมือก่อน (ไปรับที่ Zone B)', 'warning');
              }
            }}
          >
            {/* Silhouette outline */}
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          </group>
        )}
      </group>

      {/* 2. Network Rack Zone C (PoE Switch) */}
      <group position={[6, 1.4, -8]}>
        {placedDevices.POE_SWITCH_8P ? (
          <VirtualCctvDevice
            deviceId="POE_SWITCH_8P"
            position={[0, 0, 0]}
            onPortClick={(portId) => {
              const portType = portId.includes('UPLINK') ? 'RJ45_LAN' : 'RJ45_POE';
              handlePortClick('POE_SWITCH_8P', portId, portType);
            }}
          />
        ) : (
          <group
            onClick={() => {
              if (carriedItem?.deviceId === 'POE_SWITCH_8P') {
                placeDevice('POE_SWITCH_8P');
              } else {
                notify('คุณต้องถือ PoE Switch ในมือ (ไปรับที่ Zone C)', 'warning');
              }
            }}
          >
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.35, 0.08, 0.2]} />
              <meshBasicMaterial color="#0ea5e9" wireframe />
            </mesh>
          </group>
        )}
      </group>

      {/* 3. Recorder Server Zone D (NVR) */}
      <group position={[-6, 1.0, 4]}>
        {placedDevices.NVR_8CH ? (
          <VirtualCctvDevice
            deviceId="NVR_8CH"
            position={[0, 0, 0]}
            onPortClick={(portId) => {
              const portType = portId === 'NVR_PORT_HDMI_OUT' ? 'HDMI_OUT' : 'RJ45_LAN';
              handlePortClick('NVR_8CH', portId, portType);
            }}
          />
        ) : (
          <group
            onClick={() => {
              if (carriedItem?.deviceId === 'NVR_8CH') {
                placeDevice('NVR_8CH');
              } else {
                notify('คุณต้องถือ NVR ในมือ (ไปรับที่ Zone D)', 'warning');
              }
            }}
          >
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.38, 0.08, 0.3]} />
              <meshBasicMaterial color="#f59e0b" wireframe />
            </mesh>
          </group>
        )}
      </group>

      {/* 4. Control Desk Zone E (Client PC & Monitor) */}
      <group position={[6, 0.95, 4]}>
        {/* Monitor */}
        <VirtualCctvDevice
          deviceId="MONITOR"
          position={[0, 0.22, -0.1]}
          onPortClick={(portId) => handlePortClick('MONITOR', portId, 'HDMI_IN')}
        />

        {/* Client PC */}
        {placedDevices.CLIENT_PC ? (
          <VirtualCctvDevice
            deviceId="CLIENT_PC"
            position={[-0.8, -0.1, -0.1]}
            onPortClick={(portId) => handlePortClick('CLIENT_PC', portId, 'RJ45_LAN')}
          />
        ) : (
          <group
            position={[-0.8, -0.1, -0.1]}
            onClick={() => {
              if (carriedItem?.deviceId === 'CLIENT_PC') {
                placeDevice('CLIENT_PC');
              } else {
                notify('คุณต้องถือ Client PC ในมือ (ไปรับที่ Zone E)', 'warning');
              }
            }}
          >
            <mesh>
              <boxGeometry args={[0.18, 0.4, 0.42]} />
              <meshBasicMaterial color="#8b5cf6" wireframe />
            </mesh>
          </group>
        )}
      </group>

      {/* 5. 3D Rendered Cable Lines */}
      {connections.map((conn) => {
        // Visual line between devices
        let fromPos: [number, number, number] = [0, 0, 0];
        let toPos: [number, number, number] = [0, 0, 0];

        if (conn.fromDeviceId === 'CAMERA_BULLET' || conn.toDeviceId === 'CAMERA_BULLET') {
          fromPos = [4, 3.2, -12.7];
        }
        if (conn.fromDeviceId === 'POE_SWITCH_8P' || conn.toDeviceId === 'POE_SWITCH_8P') {
          toPos = [6, 1.4, -8];
        }
        if (conn.fromDeviceId === 'NVR_8CH' || conn.toDeviceId === 'NVR_8CH') {
          if (fromPos[0] === 0) fromPos = [-6, 1.0, 4];
          else toPos = [-6, 1.0, 4];
        }
        if (conn.fromDeviceId === 'MONITOR' || conn.toDeviceId === 'MONITOR') {
          toPos = [6, 0.95, 4];
        }
        if (conn.fromDeviceId === 'CLIENT_PC' || conn.toDeviceId === 'CLIENT_PC') {
          toPos = [5.2, 0.85, 4];
        }

        const midX = (fromPos[0] + toPos[0]) / 2;
        const midY = 0.05; // cables run along floor
        const midZ = (fromPos[2] + toPos[2]) / 2;

        const isHdmi = conn.cableType === 'HDMI';

        return (
          <group key={conn.id}>
            {/* Cable Floor Segment */}
            <mesh position={[midX, midY, midZ]}>
              <boxGeometry
                args={[
                  Math.abs(fromPos[0] - toPos[0]) || 0.04,
                  0.02,
                  Math.abs(fromPos[2] - toPos[2]) || 0.04,
                ]}
              />
              <meshStandardMaterial
                color={isHdmi ? '#e11d48' : '#0284c7'}
                roughness={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
