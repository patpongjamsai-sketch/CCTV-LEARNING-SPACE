'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  INDOOR_SPOTS,
  IndoorSpotId,
  ROOM102_CAMERA_CATALOG,
  Room102CameraId,
} from '../../../shared/domain/room102Types';

export type IndoorTabId = 'OVERVIEW' | IndoorSpotId;

// 3D Anchor positions and mounting metadata for the 5 indoor zones
export const INDOOR_SPOT_3D_CONFIG: Record<
  IndoorSpotId,
  {
    mountPosition: [number, number, number];
    lookDirection: [number, number, number]; // Vector camera points toward
    mountTypeTh: string;
    mountHintTh: string;
    roomTitleTh: string;
    cameraTargetPos: [number, number, number];
    cameraViewPos: [number, number, number];
  }
> = {
  IN_DIGITAL_LIBRARY: {
    mountPosition: [-4.8, 2.65, -3.8],
    lookDirection: [0, -1, 0.4],
    mountTypeTh: 'เจาะฝังฝ้าเพดาน (In-Ceiling Flush Mount)',
    mountHintTh: 'กลางแผ่นฝ้าเพดานห้องสมุด ฝังเรียบเนียน ไม่บดบังทัศนียภาพ สวยงาม ไม่ดูน่ากลัว',
    roomTitleTh: 'ห้องสมุดดิจิทัล (Digital Library)',
    cameraTargetPos: [-4.8, 1.0, -3.8],
    cameraViewPos: [-4.8, 5.8, 0.8],
  },
  IN_CORRIDOR_STAIRS: {
    mountPosition: [0, 2.05, 0],
    lookDirection: [0, -0.6, 0.8],
    mountTypeTh: 'ใต้คานเพดานต่ำหน้าบันได (Low-Ceiling Mount)',
    mountHintTh: 'ใต้คานเตี้ยหน้าทางขึ้นบันได จุดเสี่ยงเด็กเตะบอลชน ต้องการมาตรฐาน IK10 ทุบไม่แตก',
    roomTitleTh: 'โถงทางเดินและบันไดชั้น 2 (Corridor & Stairs)',
    cameraTargetPos: [0, 0.9, 0],
    cameraViewPos: [0, 5.0, 4.8],
  },
  IN_CANTEEN: {
    mountPosition: [-4.8, 2.6, 2.4],
    lookDirection: [0, -0.6, 0.8],
    mountTypeTh: 'เหนือเคาน์เตอร์แคชเชียร์ (Counter Mount)',
    mountHintTh: 'ส่องเคาน์เตอร์แลกคูปองและแถวร้านค้า ปรับก้มเงยง่าย ไร้แสง IR สะท้อนฝาครอบ',
    roomTitleTh: 'โรงอาหารและจุดชำระเงิน (Canteen & Cashier)',
    cameraTargetPos: [-4.8, 0.9, 3.8],
    cameraViewPos: [-4.8, 5.8, 8.5],
  },
  IN_SERVER_COMPUTER_LAB: {
    mountPosition: [4.8, 2.7, -3.8],
    lookDirection: [0, -1, 0],
    mountTypeTh: 'กึ่งกลางเพดานศูนย์ข้อมูล (Center Ceiling Mount)',
    mountHintTh: 'จุดกึ่งกลางเพดาน มองเห็นตู้แร็คเซิร์ฟเวอร์และโต๊ะคอมพิวเตอร์ครบ 360° ไร้จุดบอด',
    roomTitleTh: 'ห้องเซิร์ฟเวอร์ & คอมแล็บ (Server Room & Lab)',
    cameraTargetPos: [4.8, 1.0, -3.8],
    cameraViewPos: [4.8, 5.8, 0.8],
  },
  IN_INFIRMARY_RESTROOM: {
    mountPosition: [4.8, 2.6, 2.2],
    lookDirection: [0, -0.5, 0.86],
    mountTypeTh: 'ผนังมุมทางเข้าโถงสุขอนามัย (Corner Bracket Mount)',
    mountHintTh: 'ส่องทางเดินหน้าห้องพยาบาล ต้องเปิดใช้แถบดำ PDPA ปิดบังประตูห้องน้ำและเตียงผู้ป่วย',
    roomTitleTh: 'หน้าห้องพยาบาล & ทางแยกห้องน้ำ (Infirmary & Restroom)',
    cameraTargetPos: [4.8, 0.9, 3.8],
    cameraViewPos: [4.8, 5.8, 8.5],
  },
};

// Smooth Camera Controller for animating viewpoint per Tab
const DioramaCameraController: React.FC<{
  activeTab: IndoorTabId;
}> = ({ activeTab }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isTransitioning = useRef<boolean>(true);

  const targetConfig = useMemo(() => {
    if (activeTab === 'OVERVIEW') {
      return {
        camPos: new THREE.Vector3(0, 15.5, 16.5),
        targetPos: new THREE.Vector3(0, 0, 0),
      };
    }
    const cfg = INDOOR_SPOT_3D_CONFIG[activeTab];
    return {
      camPos: new THREE.Vector3(...cfg.cameraViewPos),
      targetPos: new THREE.Vector3(...cfg.cameraTargetPos),
    };
  }, [activeTab]);

  // Trigger smooth transition whenever activeTab changes
  React.useEffect(() => {
    isTransitioning.current = true;
  }, [activeTab]);

  useFrame(() => {
    if (!controlsRef.current) return;
    if (isTransitioning.current) {
      camera.position.lerp(targetConfig.camPos, 0.08);
      controlsRef.current.target.lerp(targetConfig.targetPos, 0.08);
      controlsRef.current.update();

      const distCam = camera.position.distanceTo(targetConfig.camPos);
      const distTarget = controlsRef.current.target.distanceTo(targetConfig.targetPos);
      if (distCam < 0.05 && distTarget < 0.05) {
        camera.position.copy(targetConfig.camPos);
        controlsRef.current.target.copy(targetConfig.targetPos);
        controlsRef.current.update();
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.05}
      minPolarAngle={Math.PI / 12}
      minDistance={2.5}
      maxDistance={35}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
};

// 3D Procedural Camera Model
const CameraObject3D: React.FC<{
  cameraId: Room102CameraId;
  isCorrect: boolean;
}> = ({ cameraId, isCorrect }) => {
  const accentColor = isCorrect ? '#10b981' : '#f59e0b';

  if (cameraId === 'RECESSED_DOME') {
    // In-Ceiling Dome (Flush mount trim ring + small glass bubble)
    return (
      <group>
        {/* Flush mounting trim bezel */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.04, 28]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Recessed black cavity */}
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        {/* Low-profile clear glass dome */}
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.15, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        {/* Mini lens ball inside */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    );
  }

  if (cameraId === 'FISHEYE_360') {
    // 360 Panoramic pancake camera
    return (
      <group>
        {/* Pancake chassis */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.3, 0.32, 0.08, 32]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.01, 0]}>
          <ringGeometry args={[0.18, 0.24, 32]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
        </mesh>
        {/* Fisheye bulbous glass lens */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>
    );
  }

  if (cameraId === 'TURRET_INDOOR') {
    // Turret eyeball camera
    return (
      <group rotation={[Math.PI / 6, 0, 0]}>
        {/* Outer collar */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.24, 0.26, 0.1, 28]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
        {/* Turret spherical ball */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* Flat black face with isolated lens & IR */}
        <mesh position={[0, -0.18, 0.08]} rotation={[-Math.PI / 3, 0, 0]}>
          <circleGeometry args={[0.11, 24]} />
          <meshStandardMaterial color="#020617" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.19, 0.085]} rotation={[-Math.PI / 3, 0, 0]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  if (cameraId === 'DOME_IK10' || cameraId === 'DOME_PRIVACY') {
    // Vandal-proof / Privacy Dome with heavy metal base ring
    return (
      <group>
        {/* Rugged cast base ring */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.09, 28]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Polycarbonate outer dome cover */}
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.19, 28, 18, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial
            color="#94a3b8"
            transparent
            opacity={0.65}
            roughness={0.15}
            metalness={0.7}
          />
        </mesh>
        {/* Inner black camera gimbal */}
        <mesh position={[0, -0.04, 0.02]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.1, 16]} />
          <meshStandardMaterial color="#090d16" />
        </mesh>
      </group>
    );
  }

  // Fallback / Bullet Camera
  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.45, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.23, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.03, 20]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
};

// Dynamic 3D FOV Vision Cone
const VisionFovCone3D: React.FC<{
  position: [number, number, number];
  cameraId: Room102CameraId;
  isCorrect: boolean;
}> = ({ position, cameraId, isCorrect }) => {
  const color = isCorrect ? '#10b981' : '#f43f5e';

  if (cameraId === 'FISHEYE_360') {
    // 360 Surround dome hemisphere
    return (
      <group position={position}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[3.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.5, 36]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  // Directional cone (90 - 100 degrees)
  return (
    <group position={position}>
      <mesh position={[0, -1.3, 0.8]} rotation={[Math.PI / 2.5, 0, 0]}>
        <coneGeometry args={[2.2, 3.0, 24, 1, true]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.24}
          roughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Ground illuminated footprint */}
      <mesh position={[0, -2.5, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
};

// 3D PDPA Privacy Mask Box
const PdpaPrivacyMask3D: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Solid Blackout Barrier Shroud */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.2, 2.1, 1.4]} />
        <meshStandardMaterial
          color="#020617"
          transparent
          opacity={0.92}
          roughness={0.8}
        />
      </mesh>
      {/* Neon Privacy Border Outline */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.24, 2.14, 1.44]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.85} />
      </mesh>
      <Html position={[0, 2.4, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="bg-pink-950/95 text-pink-300 border border-pink-500/80 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wider shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-pulse">
          <span>🔒</span>
          <span>PDPA PRIVACY MASK ACTIVE (ปิดบังข้อมูลส่วนบุคคล)</span>
        </div>
      </Html>
    </group>
  );
};

// Architectural 3D School Interior Scenery
const SchoolBuildingInterior3D: React.FC = () => {
  return (
    <group>
      {/* 1. Base Diorama Foundation Slab */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[21.5, 0.6, 17.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[21.0, 0.04, 17.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Outer Building Border Rim */}
      <mesh position={[0, -0.58, 0]}>
        <boxGeometry args={[21.8, 0.1, 17.8]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>

      {/* Grid Floor Line Guide */}
      <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0.03, 0]} />

      {/* ============================================================== */}
      {/* ROOM 1: DIGITAL LIBRARY (Top-Left, X ≈ -4.8, Z ≈ -3.8)         */}
      {/* ============================================================== */}
      <group position={[-5.2, 0, -4.2]}>
        {/* Parquet/Carpet Floor */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[8.8, 0.02, 6.8]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
        </mesh>
        {/* Wall Frame with Warm Wood Accent */}
        <mesh position={[0, 1.35, -3.3]}>
          <boxGeometry args={[8.8, 2.6, 0.25]} />
          <meshStandardMaterial color="#312e81" roughness={0.7} />
        </mesh>
        <mesh position={[-4.3, 1.35, 0]}>
          <boxGeometry args={[0.25, 2.6, 6.8]} />
          <meshStandardMaterial color="#312e81" roughness={0.7} />
        </mesh>
        {/* Bookshelf 1 (Left Wall) */}
        <group position={[-3.9, 1.0, -1.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 2.0, 3.6]} />
            <meshStandardMaterial color="#854d0e" roughness={0.6} />
          </mesh>
          {/* Books in Shelf */}
          {[-1.3, -0.6, 0.1, 0.8, 1.4].map((z, i) => (
            <mesh key={`lib-book-1-${i}`} position={[0.1, 0.15, z]}>
              <boxGeometry args={[0.3, 0.35, 0.5]} />
              <meshStandardMaterial color={['#38bdf8', '#f43f5e', '#10b981', '#fbbf24', '#c084fc'][i]} />
            </mesh>
          ))}
        </group>
        {/* Bookshelf 2 (Back Wall) */}
        <group position={[-0.5, 1.0, -3.0]}>
          <mesh castShadow>
            <boxGeometry args={[5.2, 2.0, 0.4]} />
            <meshStandardMaterial color="#854d0e" roughness={0.6} />
          </mesh>
          {[-1.8, -0.8, 0.2, 1.2, 2.0].map((x, i) => (
            <mesh key={`lib-book-2-${i}`} position={[x, 0.2, 0.1]}>
              <boxGeometry args={[0.7, 0.38, 0.25]} />
              <meshStandardMaterial color={['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#6366f1'][i]} />
            </mesh>
          ))}
        </group>
        {/* Study Table and Chairs */}
        <group position={[0.4, 0.45, 0.5]}>
          {/* Table Top */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.1, 1.6]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Table Legs */}
          {[-1.4, 1.4].map((x) =>
            [-0.6, 0.6].map((z) => (
              <mesh key={`lib-leg-${x}-${z}`} position={[x, -0.22, z]}>
                <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            ))
          )}
          {/* Study Laptops */}
          <mesh position={[-0.7, 0.08, 0]}>
            <boxGeometry args={[0.45, 0.02, 0.35]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0.7, 0.08, 0]}>
            <boxGeometry args={[0.45, 0.02, 0.35]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
        {/* Acoustic Ceiling Tile Grid with Recessed Hole */}
        <group position={[0.4, 2.65, 0.4]}>
          <mesh>
            <boxGeometry args={[4.2, 0.06, 3.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
          </mesh>
          {/* Cutaway Ceiling Mounting Ring indicator */}
          <mesh position={[0, -0.04, 0]}>
            <ringGeometry args={[0.28, 0.36, 24]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* ROOM 2: SERVER ROOM & COMPUTER LAB (Top-Right, X ≈ 5.2, Z ≈ -4.2) */}
      {/* ============================================================== */}
      <group position={[5.2, 0, -4.2]}>
        {/* High-Tech Raised Floor Tiles */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[8.8, 0.02, 6.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Back and Right Walls */}
        <mesh position={[0, 1.35, -3.3]}>
          <boxGeometry args={[8.8, 2.6, 0.25]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <mesh position={[4.3, 1.35, 0]}>
          <boxGeometry args={[0.25, 2.6, 6.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* 19-inch Server Rack Cabinets */}
        {[-2.2, -0.8].map((x, idx) => (
          <group key={`srv-rack-${idx}`} position={[x, 1.25, -2.6]}>
            <mesh castShadow>
              <boxGeometry args={[1.0, 2.4, 1.0]} />
              <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Glass Front Panel */}
            <mesh position={[0, 0, 0.52]}>
              <boxGeometry args={[0.88, 2.2, 0.04]} />
              <meshStandardMaterial color="#0ea5e9" transparent opacity={0.35} roughness={0.1} />
            </mesh>
            {/* Blinking Status LEDs */}
            {[-0.6, -0.2, 0.2, 0.6, 0.8].map((y, li) => (
              <mesh key={`led-${li}`} position={[0.3, y, 0.54]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Computer Lab Student Workstations */}
        <group position={[1.5, 0.45, 0.5]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 0.1, 1.4]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {[-1.0, 0, 1.0].map((x, mi) => (
            <group key={`pc-monitor-${mi}`} position={[x, 0.28, 0]}>
              {/* LCD Monitor */}
              <mesh castShadow>
                <boxGeometry args={[0.55, 0.38, 0.04]} />
                <meshStandardMaterial color="#090d16" />
              </mesh>
              <mesh position={[0, 0, 0.025]}>
                <planeGeometry args={[0.5, 0.34]} />
                <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
              </mesh>
              {/* Stand */}
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ============================================================== */}
      {/* ROOM 3: CENTRAL CORRIDOR & STAIRS (Center, X ≈ 0, Z ≈ 0)        */}
      {/* ============================================================== */}
      <group position={[0, 0, 0]}>
        {/* Hallway Floor Tile */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[8.4, 0.02, 8.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Floor 2 Staircase Landing Structure */}
        <group position={[0, 0.5, -0.6]}>
          {/* Steps */}
          {[0, 1, 2, 3, 4].map((step) => (
            <mesh key={`stair-step-${step}`} position={[0, step * 0.18, step * 0.38]}>
              <boxGeometry args={[2.4, 0.18, 0.4]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          ))}
          {/* Metal Railings */}
          {[-1.25, 1.25].map((x) => (
            <group key={`stair-rail-${x}`} position={[x, 0.6, 0.8]}>
              <mesh rotation={[Math.PI / 6, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
        {/* Low Ceiling Cross-Beam (Where balls strike) */}
        <group position={[0, 2.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[7.2, 0.3, 0.5]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[1.2, 0.02, 0.4]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
        </group>
        {/* Soccer Ball Hazard Cue */}
        <mesh position={[1.4, 0.22, 1.8]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* ROOM 4: CANTEEN & CASHIER (Bottom-Left, X ≈ -5.2, Z ≈ 4.2)       */}
      {/* ============================================================== */}
      <group position={[-5.2, 0, 4.2]}>
        {/* Canteen Terracotta Floor */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[8.8, 0.02, 6.8]} />
          <meshStandardMaterial color="#064e3b" roughness={0.5} />
        </mesh>
        {/* Left and Front Walls */}
        <mesh position={[-4.3, 1.35, 0]}>
          <boxGeometry args={[0.25, 2.6, 6.8]} />
          <meshStandardMaterial color="#0f766e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.35, 3.3]}>
          <boxGeometry args={[8.8, 2.6, 0.25]} />
          <meshStandardMaterial color="#0f766e" roughness={0.7} />
        </mesh>
        {/* Food Coupon Cashier Service Counter */}
        <group position={[-0.5, 0.55, -0.6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.8, 1.1, 0.8]} />
            <meshStandardMaterial color="#d97706" roughness={0.4} />
          </mesh>
          {/* Cash Register / Countertop POS */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Menu Overhead Board */}
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[3.8, 0.45, 0.1]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
        {/* Dining Bench Tables */}
        <group position={[-0.5, 0.4, 2.0]}>
          <mesh castShadow>
            <boxGeometry args={[3.8, 0.08, 1.1]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          {[-1.6, 1.6].map((x) => (
            <mesh key={`din-leg-${x}`} position={[x, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.9]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ============================================================== */}
      {/* ROOM 5: INFIRMARY & RESTROOM (Bottom-Right, X ≈ 5.2, Z ≈ 4.2)    */}
      {/* ============================================================== */}
      <group position={[5.2, 0, 4.2]}>
        {/* Clean Clinic Floor */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[8.8, 0.02, 6.8]} />
          <meshStandardMaterial color="#4a044e" roughness={0.4} />
        </mesh>
        {/* Right and Front Walls */}
        <mesh position={[4.3, 1.35, 0]}>
          <boxGeometry args={[0.25, 2.6, 6.8]} />
          <meshStandardMaterial color="#701a75" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.35, 3.3]}>
          <boxGeometry args={[8.8, 2.6, 0.25]} />
          <meshStandardMaterial color="#701a75" roughness={0.7} />
        </mesh>
        {/* Clinic Bed with Pillow */}
        <group position={[-1.2, 0.45, -0.8]}>
          <mesh castShadow>
            <boxGeometry args={[2.0, 0.35, 1.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.7, 0.22, 0]}>
            <boxGeometry args={[0.4, 0.1, 0.8]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          {/* Medical Privacy Curtain Railing */}
          <mesh position={[0, 1.6, 0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 2.2, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
        </group>
        {/* Restroom Entrance Doorway with Sign */}
        <group position={[2.4, 1.1, 1.8]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 2.2, 1.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Doorway Hollow Cut */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.2, 2.0, 1.1]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* Signboard */}
          <mesh position={[-0.1, 1.1, 0]}>
            <boxGeometry args={[0.05, 0.25, 0.5]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export interface SchoolIndoor3DDioramaProps {
  activeTab: IndoorTabId;
  selectedSpot: IndoorSpotId;
  placements: Partial<Record<IndoorSpotId, Room102CameraId>>;
  privacyMaskActive: boolean;
  onSelectSpot: (spotId: IndoorSpotId) => void;
}

export const SchoolIndoor3DDiorama: React.FC<SchoolIndoor3DDioramaProps> = ({
  activeTab,
  selectedSpot,
  placements,
  privacyMaskActive,
  onSelectSpot,
}) => {
  const spotKeys = Object.keys(INDOOR_SPOTS) as IndoorSpotId[];

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner select-none">
      <Canvas
        shadows
        camera={{ position: [0, 15.5, 16.5], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Ambient & Studio Directional Lighting */}
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-10, 12, -8]} intensity={0.6} color="#e0f2fe" />
        <pointLight position={[0, 6, 0]} intensity={0.7} color="#38bdf8" />
        <pointLight position={[-4.8, 4, -3.8]} intensity={0.5} color="#818cf8" />
        <pointLight position={[4.8, 4, -3.8]} intensity={0.6} color="#06b6d4" />
        <pointLight position={[-4.8, 4, 3.8]} intensity={0.5} color="#10b981" />
        <pointLight position={[4.8, 4, 3.8]} intensity={0.6} color="#ec4899" />

        {/* Camera Lerp Controller */}
        <DioramaCameraController activeTab={activeTab} />

        {/* 3D Indoor Architecture */}
        <SchoolBuildingInterior3D />

        {/* 5 Indoor Spots: Anchors, Cameras, FOV Cones */}
        {spotKeys.map((spotId) => {
          const cfg = INDOOR_SPOT_3D_CONFIG[spotId];
          const spot = INDOOR_SPOTS[spotId];
          const camId = placements[spotId];
          const isSelected = selectedSpot === spotId;
          const isCorrect = camId ? camId === spot.correctCameraId : false;

          return (
            <group key={spotId} position={cfg.mountPosition}>
              {/* Interactive Ceiling Mounting Anchor / Beacon */}
              <group onClick={(e) => { e.stopPropagation(); onSelectSpot(spotId); }}>
                {/* Outer Pulsing Beacon Collar */}
                <mesh>
                  <cylinderGeometry args={[0.34, 0.36, 0.06, 24]} />
                  <meshStandardMaterial
                    color={
                      isSelected
                        ? '#f59e0b'
                        : camId
                        ? isCorrect
                          ? '#10b981'
                          : '#f43f5e'
                        : '#38bdf8'
                    }
                    emissive={isSelected ? '#f59e0b' : '#000000'}
                    emissiveIntensity={isSelected ? 0.8 : 0}
                    roughness={0.2}
                    metalness={0.7}
                  />
                </mesh>

                {/* Laser Guide Beam pointing down */}
                <mesh position={[0, -0.6, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
                  <meshBasicMaterial
                    color={isSelected ? '#fbbf24' : '#38bdf8'}
                    transparent
                    opacity={isSelected ? 0.7 : 0.25}
                  />
                </mesh>

                {/* 3D Camera Model if Installed */}
                {camId && (
                  <CameraObject3D cameraId={camId} isCorrect={isCorrect} />
                )}

                {/* Floating 3D Badge on Spot */}
                <Html position={[0, 0.45, 0]} center distanceFactor={5.5} style={{ pointerEvents: 'none' }}>
                  <div
                    className={`px-1.5 py-0.5 rounded-lg text-[8px] font-mono font-bold tracking-wider border shadow-md flex items-center gap-1 whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-1 ring-amber-400 scale-105'
                        : camId
                        ? isCorrect
                          ? 'bg-emerald-950/95 text-emerald-300 border-emerald-400'
                          : 'bg-rose-950/95 text-rose-300 border-rose-400'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>{camId ? ROOM102_CAMERA_CATALOG[camId].icon : '📍'}</span>
                    <span>{spot.nameTh.split(':')[0]}</span>
                    {camId && <span>{isCorrect ? '✓' : '⚠️'}</span>}
                  </div>
                </Html>
              </group>

              {/* FOV Vision Cone when Camera is selected */}
              {camId && (
                <VisionFovCone3D
                  position={[0, -0.1, 0]}
                  cameraId={camId}
                  isCorrect={isCorrect}
                />
              )}
            </group>
          );
        })}

        {/* 3D Privacy Mask Shroud in Restroom/Infirmary when enabled */}
        {privacyMaskActive && (
          <PdpaPrivacyMask3D position={[6.0, 0.05, 3.8]} />
        )}
      </Canvas>

      {/* Floating 3D HUD Guide for Active Room Angle */}
      <div className="absolute top-2.5 left-3 right-3 pointer-events-none flex items-center justify-between z-10 text-xs">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white font-semibold flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {activeTab === 'OVERVIEW'
              ? '🏢 มุมมอง 3D ภาพรวมอาคารเรียน (คลิกเลือกห้องหรือใช้ Tab ด้านบน)'
              : `🎯 จุดตรวจ: ${INDOOR_SPOT_3D_CONFIG[activeTab].roomTitleTh}`}
          </span>
        </div>
        <div className="hidden sm:block bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 shadow-lg">
          หมุนมุมมอง 3D ได้อิสระ (คลิกแล้วลาก)
        </div>
      </div>

      {/* Specific Mounting Location Advice Banner at Bottom of 3D Scene */}
      {activeTab !== 'OVERVIEW' && (
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none z-10">
          <div className="bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-500/40 text-xs shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-base shrink-0">
                📌
              </span>
              <div className="min-w-0">
                <strong className="text-emerald-300 block text-[11px] truncate">
                  คำแนะนำตำแหน่งติดตั้ง: {INDOOR_SPOT_3D_CONFIG[activeTab].mountTypeTh}
                </strong>
                <p className="text-[11px] text-slate-300 truncate">
                  {INDOOR_SPOT_3D_CONFIG[activeTab].mountHintTh}
                </p>
              </div>
            </div>
            <div className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
              3D MOUNTING READY
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
