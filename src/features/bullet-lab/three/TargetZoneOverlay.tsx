import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useBulletLabStore } from '../store/useBulletLabStore';

interface TargetZoneOverlayProps {
  showLabels?: boolean;
}

export const TargetZoneOverlay: React.FC<TargetZoneOverlayProps> = ({
  showLabels = true,
}) => {
  const isPpeModalOpen = useBulletLabStore((s) => s.isPpeModalOpen);
  const isMission4ModalOpen = useBulletLabStore((s) => s.isMission4ModalOpen);
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const shouldShow = showLabels && !isPpeModalOpen && !isMission4ModalOpen;

  return (
    <group position={[0, 0, 1.6]}>
      {/* ============================================================ */}
      {/* 1. PEDESTRIAN TARGET MANNEQUIN (จุดที่ต้องการมองเห็น)         */}
      {/* ============================================================ */}
      <group position={[0, 0, 0]}>
        {/* Head Sphere (Eye/Face center at Y = 1.62m) */}
        <mesh position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={0.5}
            roughness={0.2}
            emissive="#0891b2"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* 3D Face Detection Bounding Box Frame (Green/Cyan AI Reticle) */}
        <group position={[0, 1.62, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.32, 0.26]} />
            <meshBasicMaterial
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Subtle glowing center crosshair */}
          <mesh position={[0, 0, 0.131]}>
            <ringGeometry args={[0.03, 0.04, 16]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Torso & Chest (Y = 1.15m) */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.38, 0.58, 0.22]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.4}
            roughness={0.3}
            wireframe={false}
          />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.24, 1.1, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.55, 16]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0.24, 1.1, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.55, 16]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.35} />
        </mesh>

        {/* Pelvis & Legs */}
        <mesh position={[-0.11, 0.44, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.82, 16]} />
          <meshStandardMaterial color="#0369a1" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0.11, 0.44, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.82, 16]} />
          <meshStandardMaterial color="#0369a1" transparent opacity={0.35} />
        </mesh>

        {/* Floating AI Recognition HUD Badge above target mannequin */}
        {shouldShow && currentMission === 3 && (
          <Html position={[0, 1.95, 0]} center distanceFactor={7} pointerEvents="none">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950/90 text-cyan-300 border border-cyan-400 shadow-xl shadow-cyan-950/50 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>🎯 จุดที่ต้องการมองเห็น (เป้าหมายสัญจร)</span>
              </div>
              <div className="text-[9px] font-mono text-cyan-200/90 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-800/60 shadow">
                ระดับตรวจจับใบหน้า: 1.60 ม.
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* ============================================================ */}
      {/* 2. FLOOR TARGET DECALS (Bullseye & Zones)                    */}
      {/* ============================================================ */}
      {/* Floor Bullseye Rings at target point */}
      <group position={[0, 0.012, 0]}>
        {/* Inner Bullseye Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.3, 32]} />
          <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
        </mesh>
        {/* Mid Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.58, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Outer Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.88, 0.92, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 1. Critical Zone (Red Box) - Entry doorway critical area */}
      <group position={[0, 0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 1.4]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent={true}
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Border line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.88, 0.92, 4]} />
          <meshBasicMaterial color="#f87171" wireframe={true} />
        </mesh>
        {shouldShow && currentMission !== 3 && (
          <Html position={[0, 0.05, 0]} center distanceFactor={8} pointerEvents="none">
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/50 shadow whitespace-nowrap">
              🔴 Critical Zone (ประตูทางเข้า)
            </div>
          </Html>
        )}
      </group>

      {/* 2. Important Zone (Yellow) - Walking path */}
      <group position={[0, 0.01, 1.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 1.4]} />
          <meshBasicMaterial
            color="#eab308"
            transparent={true}
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
        {shouldShow && (
          <Html position={[0, 0.05, 0]} center distanceFactor={8} pointerEvents="none">
            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow whitespace-nowrap">
              🟡 Important Zone (แนวทางเดิน)
            </div>
          </Html>
        )}
      </group>

      {/* 3. Non-critical Zone (Slate/Gray) - Peripheral Area */}
      <group position={[0, 0.01, 2.9]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 1.2]} />
          <meshBasicMaterial
            color="#64748b"
            transparent={true}
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};
