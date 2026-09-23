'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { DeviceId } from '../../../shared/domain/roleplayTypes';

export interface Mission53DCanvasProps {
  selectedPort: {
    deviceId: DeviceId;
    portId: string;
    portType: 'RJ45' | 'HDMI';
  } | null;
  onPortClick: (deviceId: DeviceId, portId: string, portType: 'RJ45' | 'HDMI') => void;
  onPowerToggle: (deviceId: DeviceId) => void;
}

// 4 Hardware Stations on Workbench for Mission 5
const M5_STATIONS = [
  {
    deviceId: 'CAMERA_BULLET' as DeviceId,
    nameTh: 'IP Bullet Camera',
    posX: -4.0,
    hasPowerSwitch: false, // Powered by PoE
  },
  {
    deviceId: 'POE_SWITCH_8P' as DeviceId,
    nameTh: '8-Port PoE Switch',
    posX: -1.35,
    hasPowerSwitch: true,
  },
  {
    deviceId: 'NVR_8CH' as DeviceId,
    nameTh: '8-CH NVR Recorder',
    posX: 1.35,
    hasPowerSwitch: true,
  },
  {
    deviceId: 'MONITOR' as DeviceId,
    nameTh: 'Client Monitor / PC',
    posX: 4.0,
    hasPowerSwitch: true,
  },
];

// Port Anchor 3D component with interactive hitbox
const PortAnchor3D: React.FC<{
  position: [number, number, number];
  portId: string;
  deviceId: DeviceId;
  portType: 'RJ45' | 'HDMI';
  labelTh: string;
  isConnected?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}> = ({ position, labelTh, isConnected, isSelected, onClick }) => {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Port Outer Collar */}
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.16, 0.1]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : isConnected ? '#10b981' : '#334155'}
          emissive={isSelected ? '#f59e0b' : isConnected ? '#10b981' : '#000000'}
          emissiveIntensity={isSelected ? 0.7 : isConnected ? 0.3 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Inner Pin Cavity */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      {/* Floating Port Badge */}
      <Html position={[0, 0.22, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider border shadow whitespace-nowrap select-none ${
            isSelected
              ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
              : isConnected
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700'
          }`}
        >
          {isConnected ? `✓ ${labelTh}` : isSelected ? `➜ [${labelTh}]` : labelTh}
        </div>
      </Html>
    </group>
  );
};

// 3D Spline Cable with Flowing Photon Pulse
const M5SplineCable: React.FC<{
  startPos: [number, number, number];
  endPos: [number, number, number];
  cableColor: string;
  glowColor: string;
  isFlowing?: boolean;
  labelTh: string;
}> = ({ startPos, endPos, cableColor, glowColor, isFlowing, labelTh }) => {
  const particleRef = useRef<THREE.Mesh>(null);

  const { curve, tubeGeometry } = useMemo(() => {
    const p0 = new THREE.Vector3(...startPos);
    const p3 = new THREE.Vector3(...endPos);
    const midX = (p0.x + p3.x) / 2;
    const midZ = (p0.z + p3.z) / 2;
    const droopY = Math.min(p0.y, p3.y) - 0.4;
    const p1 = new THREE.Vector3(p0.x + 0.25, droopY, p0.z - 0.2);
    const p2 = new THREE.Vector3(p3.x - 0.25, droopY, p3.z - 0.2);
    const c = new THREE.CatmullRomCurve3([p0, p1, new THREE.Vector3(midX, droopY - 0.08, midZ), p2, p3]);
    const geo = new THREE.TubeGeometry(c, 48, 0.04, 12, false);
    return { curve: c, tubeGeometry: geo };
  }, [startPos, endPos]);

  useFrame(({ clock }) => {
    if (particleRef.current && isFlowing) {
      const t = (clock.getElapsedTime() * 1.1) % 1;
      particleRef.current.position.copy(curve.getPointAt(t));
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeometry} castShadow>
        <meshStandardMaterial color={cableColor} roughness={0.35} metalness={0.3} />
      </mesh>
      {isFlowing && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={2.5} />
        </mesh>
      )}
      <Html
        position={[(startPos[0] + endPos[0]) / 2, Math.min(startPos[1], endPos[1]) - 0.35, (startPos[2] + endPos[2]) / 2]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider border shadow whitespace-nowrap select-none flex items-center gap-1 ${
            isFlowing
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 animate-pulse'
              : 'bg-slate-900/90 text-slate-300 border-slate-700'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: glowColor }} />
          <span>{labelTh}</span>
        </div>
      </Html>
    </group>
  );
};

// Main Scene Component for Mission 5
const Mission5Scene: React.FC<Mission53DCanvasProps> = ({ selectedPort, onPortClick, onPowerToggle }) => {
  const connections = useRoleplayStore((s) => s.connections);
  const poweredDevices = useRoleplayStore((s) => s.poweredDevices);
  const topology = useRoleplayStore((s) => s.topologyResult);

  const [timeString, setTimeString] = useState('12:00:00');

  useFrame(() => {
    if (topology.isLiveViewActive) {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0] || '12:00:00');
    }
  });

  const isNvrPowered = !!poweredDevices.NVR_8CH;
  const isMonitorPowered = !!poweredDevices.MONITOR;
  const isCameraOnline = topology.isCameraOnline;
  const isLiveActive = topology.isLiveViewActive;

  // Connection checks
  const hasCamToSwitch = connections.some(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'CAMERA_BULLET' && c.toDeviceId === 'POE_SWITCH_8P') ||
        (c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'CAMERA_BULLET'))
  );

  const hasSwitchToNvr = connections.some(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'NVR_8CH') ||
        (c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'POE_SWITCH_8P'))
  );

  const hasNvrToMonitor = connections.some(
    (c) =>
      c.cableType === 'HDMI' &&
      ((c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'MONITOR') ||
        (c.fromDeviceId === 'MONITOR' && c.toDeviceId === 'NVR_8CH'))
  );

  return (
    <>
      {/* Studio White-Gray Background */}
      <color attach="background" args={['#f1f5f9']} />

      {/* Studio Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[9, 16, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-8, 10, -6]} intensity={0.5} color="#e2e8f0" />
      <pointLight position={[-4, 4, 3]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[0, 4, 3]} intensity={0.6} color="#10b981" />
      <pointLight position={[4, 4, 3]} intensity={0.6} color="#8b5cf6" />

      {/* Workbench Base */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, -0.15, 0.4]} receiveShadow castShadow>
          <boxGeometry args={[10.8, 0.25, 4.2]} />
          <meshStandardMaterial color="#0b1120" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[0, 0, 0.4]} receiveShadow>
          <boxGeometry args={[10.5, 0.04, 3.9]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.2} opacity={0.3} transparent />
        </mesh>
        <mesh position={[0, -0.15, 2.52]}>
          <boxGeometry args={[10.8, 0.12, 0.04]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
        </mesh>

        {/* 4 Stations */}
        {M5_STATIONS.map((st) => {
          const isPowerOn =
            st.deviceId === 'CAMERA_BULLET'
              ? isCameraOnline
              : !!poweredDevices[st.deviceId];

          return (
            <group key={`m5_st_${st.deviceId}`} position={[st.posX, 0.08, 0]}>
              {/* Pad Frame */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.15, 0.08, 2.0]} />
                <meshStandardMaterial
                  color={isPowerOn ? '#10b981' : '#1e293b'}
                  emissive={isPowerOn ? '#10b981' : '#000000'}
                  emissiveIntensity={isPowerOn ? 0.3 : 0}
                  roughness={0.3}
                  metalness={0.6}
                />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[1.9, 0.06, 1.75]} />
                <meshStandardMaterial color="#020617" roughness={0.8} />
              </mesh>

              {/* Station Label & Power Toggle Button */}
              <Html position={[0, 0.12, 1.15]} center distanceFactor={10}>
                <div className="flex items-center gap-1.5 select-none whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900/90 text-white border border-slate-700 shadow">
                    {st.nameTh}
                  </span>
                  {st.hasPowerSwitch ? (
                    <button
                      type="button"
                      onClick={() => onPowerToggle(st.deviceId)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all shadow ${
                        isPowerOn
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-600/50 hover:bg-rose-900'
                      }`}
                    >
                      {isPowerOn ? '⚡ ON' : '⭕ OFF'}
                    </button>
                  ) : (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        isCameraOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCameraOnline ? 'PoE 48V [ONLINE]' : 'PoE [WAITING]'}
                    </span>
                  )}
                </div>
              </Html>

              {/* Station 3D Hardware */}
              {st.deviceId === 'CAMERA_BULLET' && (
                <group position={[0, 0.2, 0]}>
                  {/* Bullet Cam */}
                  <mesh position={[0, 0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.28, 0.3, 0.8, 24]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
                  </mesh>
                  {/* Lens */}
                  <mesh position={[0, 0.76, 0]}>
                    <cylinderGeometry args={[0.26, 0.26, 0.05, 24]} />
                    <meshStandardMaterial color="#090d16" />
                  </mesh>
                  {/* Port Anchor */}
                  <PortAnchor3D
                    position={[0, 0.2, -0.45]}
                    portId="LAN_POE"
                    deviceId="CAMERA_BULLET"
                    portType="RJ45"
                    labelTh="RJ45 (PoE)"
                    isConnected={hasCamToSwitch}
                    isSelected={
                      selectedPort?.deviceId === 'CAMERA_BULLET' && selectedPort?.portId === 'LAN_POE'
                    }
                    onClick={() => onPortClick('CAMERA_BULLET', 'LAN_POE', 'RJ45')}
                  />
                </group>
              )}

              {st.deviceId === 'POE_SWITCH_8P' && (
                <group position={[0, 0.2, 0]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.5, 0.32, 1.1]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* PoE Port 1 */}
                  <PortAnchor3D
                    position={[-0.4, 0.05, 0.58]}
                    portId="POE_PORT_1"
                    deviceId="POE_SWITCH_8P"
                    portType="RJ45"
                    labelTh="PoE Port 1"
                    isConnected={hasCamToSwitch}
                    isSelected={
                      selectedPort?.deviceId === 'POE_SWITCH_8P' &&
                      selectedPort?.portId === 'POE_PORT_1'
                    }
                    onClick={() => onPortClick('POE_SWITCH_8P', 'POE_PORT_1', 'RJ45')}
                  />
                  {/* Uplink Port 1 */}
                  <PortAnchor3D
                    position={[0.4, 0.05, 0.58]}
                    portId="UPLINK_1"
                    deviceId="POE_SWITCH_8P"
                    portType="RJ45"
                    labelTh="GbE Uplink"
                    isConnected={hasSwitchToNvr}
                    isSelected={
                      selectedPort?.deviceId === 'POE_SWITCH_8P' &&
                      selectedPort?.portId === 'UPLINK_1'
                    }
                    onClick={() => onPortClick('POE_SWITCH_8P', 'UPLINK_1', 'RJ45')}
                  />
                </group>
              )}

              {st.deviceId === 'NVR_8CH' && (
                <group position={[0, 0.2, 0]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.7, 0.32, 1.3]} />
                    <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* LAN Port */}
                  <PortAnchor3D
                    position={[-0.45, 0.05, -0.68]}
                    portId="LAN"
                    deviceId="NVR_8CH"
                    portType="RJ45"
                    labelTh="LAN (WAN)"
                    isConnected={hasSwitchToNvr}
                    isSelected={
                      selectedPort?.deviceId === 'NVR_8CH' && selectedPort?.portId === 'LAN'
                    }
                    onClick={() => onPortClick('NVR_8CH', 'LAN', 'RJ45')}
                  />
                  {/* HDMI Out Port */}
                  <PortAnchor3D
                    position={[0.45, 0.05, -0.68]}
                    portId="HDMI_OUT"
                    deviceId="NVR_8CH"
                    portType="HDMI"
                    labelTh="HDMI Out"
                    isConnected={hasNvrToMonitor}
                    isSelected={
                      selectedPort?.deviceId === 'NVR_8CH' && selectedPort?.portId === 'HDMI_OUT'
                    }
                    onClick={() => onPortClick('NVR_8CH', 'HDMI_OUT', 'HDMI')}
                  />
                </group>
              )}

              {st.deviceId === 'MONITOR' && (
                <group position={[0, 0.35, 0]}>
                  <mesh position={[0, 0.25, 0]} castShadow>
                    <boxGeometry args={[1.8, 1.15, 0.07]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
                  </mesh>
                  {/* Screen Plane */}
                  <mesh position={[0, 0.25, 0.04]}>
                    <planeGeometry args={[1.7, 1.05]} />
                    <meshStandardMaterial
                      color={isLiveActive ? '#0f291e' : '#020617'}
                      emissive={isLiveActive ? '#059669' : '#0f172a'}
                      emissiveIntensity={isLiveActive ? 0.35 : 0.1}
                    />
                  </mesh>
                  {/* Live View Simulation */}
                  <Html position={[0, 0.25, 0.045]} transform distanceFactor={1.35} className="pointer-events-none select-none">
                    <div className="w-[280px] h-[170px] rounded-lg bg-slate-950 flex flex-col justify-between p-2 font-mono text-[9px] text-white border border-slate-700 shadow-2xl overflow-hidden relative">
                      {isLiveActive ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-400">● 4K LIVE VIEW - CAM 01</span>
                            <span className="text-[8px] bg-emerald-900 px-1 rounded text-emerald-200">ONLINE · 30 FPS</span>
                          </div>
                          <div className="text-center font-bold text-emerald-200">
                            🏪 SMART MART CCTV SYSTEM READY
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-300 bg-slate-900/80 p-1 rounded">
                            <span className="text-emerald-400">STATUS: POWERED &amp; LINKED</span>
                            <span>{timeString}</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center gap-1.5">
                          <span className="text-rose-400 font-bold text-xs">NO HDMI VIDEO SIGNAL</span>
                          <span className="text-[8px] text-slate-400">
                            {!isMonitorPowered
                              ? 'โปรดกดเปิดสวิตช์ไฟจอมอนิเตอร์'
                              : !hasNvrToMonitor
                              ? 'โปรดเชื่อมต่อสาย HDMI ระหว่าง NVR กับ Monitor'
                              : 'โปรดเปิดเครื่อง NVR และกล้องให้ครบ'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Html>
                  {/* HDMI In Port Anchor at back */}
                  <PortAnchor3D
                    position={[0, -0.15, -0.2]}
                    portId="HDMI_IN"
                    deviceId="MONITOR"
                    portType="HDMI"
                    labelTh="HDMI In"
                    isConnected={hasNvrToMonitor}
                    isSelected={
                      selectedPort?.deviceId === 'MONITOR' && selectedPort?.portId === 'HDMI_IN'
                    }
                    onClick={() => onPortClick('MONITOR', 'HDMI_IN', 'HDMI')}
                  />
                </group>
              )}
            </group>
          );
        })}

        {/* 3D Physical Spline Cables */}
        {hasCamToSwitch && (
          <M5SplineCable
            startPos={[-4.0, 0.4, -0.45]}
            endPos={[-1.75, 0.35, 0.58]}
            cableColor="#0284c7"
            glowColor="#38bdf8"
            isFlowing={isCameraOnline}
            labelTh="Cat6 (PoE 48V + Video)"
          />
        )}
        {hasSwitchToNvr && (
          <M5SplineCable
            startPos={[-0.95, 0.35, 0.58]}
            endPos={[0.9, 0.35, -0.68]}
            cableColor="#f59e0b"
            glowColor="#fbbf24"
            isFlowing={isCameraOnline && isNvrPowered}
            labelTh="Cat6 (GbE IP Uplink)"
          />
        )}
        {hasNvrToMonitor && (
          <M5SplineCable
            startPos={[1.8, 0.35, -0.68]}
            endPos={[4.0, 0.2, -0.2]}
            cableColor="#1e293b"
            glowColor="#a855f7"
            isFlowing={isLiveActive}
            labelTh="HDMI 4K Cable"
          />
        )}
      </group>

      <OrbitControls
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minDistance={6}
        maxDistance={15}
      />
    </>
  );
};

export const Room101Mission5IsometricCanvas: React.FC<Mission53DCanvasProps> = (props) => {
  return (
    <div className="relative w-full h-[340px] sm:h-[400px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
      <Canvas shadows camera={{ position: [7.2, 9.5, 8.5], fov: 42 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <Mission5Scene {...props} />
      </Canvas>

      {/* Top Banner Guide in 3D Canvas */}
      <div className="absolute top-2.5 left-3 right-3 pointer-events-none flex items-center justify-between z-10 text-xs">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-300 text-slate-800 font-semibold flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>3D Cabling &amp; Commissioning Lab · คลิกพอร์ตบนอุปกรณ์ 3D เพื่อต่อสาย Cat6/HDMI และกดปุ่มเปิดไฟ</span>
        </div>
        <div className="hidden sm:block bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-300 text-[11px] text-slate-600 font-medium shadow-sm">
          หมุนมุมมอง 3D ได้อิสระ
        </div>
      </div>
    </div>
  );
};
