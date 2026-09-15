import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export const SmartMartStore: React.FC = () => {
  return (
    <group dispose={null}>
      {/* Floor with Store Tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 26]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Decorative Floor Grid Lines */}
      <gridHelper args={[22, 22, 0x008080, 0xcfd8dc]} position={[0, 0.01, 0]} />

      {/* Walls */}
      {/* Back Wall (North) */}
      <mesh position={[0, 2.5, -13]} receiveShadow>
        <boxGeometry args={[22, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Wall Branding Header Stripe (North) */}
      <mesh position={[0, 4.3, -12.78]}>
        <boxGeometry args={[22, 0.4, 0.05]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
      </mesh>

      {/* Front Wall (South) with Entrance Opening */}
      <mesh position={[-6, 2.5, 13]} receiveShadow>
        <boxGeometry args={[10, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[6, 2.5, 13]} receiveShadow>
        <boxGeometry args={[10, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Glass Doors (South center entrance) */}
      <mesh position={[0, 2, 13]}>
        <boxGeometry args={[2, 4, 0.1]} />
        <meshPhysicalMaterial color="#38bdf8" transmission={0.7} opacity={0.6} transparent roughness={0.1} />
      </mesh>

      {/* Left Wall (West) */}
      <mesh position={[-11, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Right Wall (East) */}
      <mesh position={[11, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Store Ceiling */}
      <mesh position={[0, 5, 0]}>
        <planeGeometry args={[22, 26]} />
        <meshStandardMaterial color="#334155" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Zone C: ห้องอุปกรณ์เครือข่าย มีผนังกั้นและช่องประตูกว้าง 1.4 เมตร */}
      <group>
        {/* West Partition Wall */}
        <mesh position={[3.8, 1.4, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Front Partition Wall (Left of door) */}
        <mesh position={[4.55, 1.4, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Front Partition Wall (Right of door) */}
        <mesh position={[8.6, 1.4, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Door Header Lintel */}
        <mesh position={[6, 2.5, -4.5]}>
          <boxGeometry args={[1.4, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Glass Inspection Window */}
        <mesh position={[8.55, 1.4, -4.32]}>
          <boxGeometry args={[2.6, 1.6, 0.04]} />
          <meshPhysicalMaterial color="#7dd3fc" transmission={0.75} opacity={0.4} transparent roughness={0.08} />
        </mesh>
        {/* Illuminated Acrylic Room Sign */}
        <mesh position={[6, 2.6, -4.33]}>
          <boxGeometry args={[1.5, 0.32, 0.06]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <Html position={[6, 2.6, -4.28]} center transform distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="room-sign">ZONE C: ห้องอุปกรณ์เครือข่าย<br /><small>NETWORK ROOM</small></div>
        </Html>
      </group>

      {/* Zone D: ห้องบันทึกภาพ มีผนังควบคุม กระจก และช่องประตูกว้าง 1.4 เมตร */}
      <group>
        {/* East Partition Wall */}
        <mesh position={[-3.8, 1.4, 4]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.8, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Front Partition Wall (Left of door) */}
        <mesh position={[-8.6, 1.4, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Front Partition Wall (Right of door) */}
        <mesh position={[-4.55, 1.4, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.8, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Door Header Lintel */}
        <mesh position={[-6, 2.5, 1.5]}>
          <boxGeometry args={[1.4, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Security Observation Glass Window */}
        <mesh position={[-8.55, 1.4, 1.68]}>
          <boxGeometry args={[2.6, 1.6, 0.04]} />
          <meshPhysicalMaterial color="#fde68a" transmission={0.72} opacity={0.4} transparent roughness={0.1} />
        </mesh>
        {/* Illuminated Acrylic Room Sign */}
        <mesh position={[-6, 2.6, 1.67]}>
          <boxGeometry args={[1.5, 0.32, 0.06]} />
          <meshStandardMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.5} />
        </mesh>
        <Html position={[-6, 2.6, 1.72]} center transform distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="room-sign room-sign--amber">ZONE D: ห้องบันทึกภาพ NVR<br /><small>CCTV SERVER ROOM</small></div>
        </Html>
      </group>

      {/* Convenience Store Aisles & Shelves (Gondolas) */}
      {/* Central Aisle 1 */}
      <group position={[-2.2, 0, -5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.2, 4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        {/* Colorful Store Products */}
        <mesh position={[0.72, 1.4, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        <mesh position={[-0.72, 1.4, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#10b981" roughness={0.5} />
        </mesh>
        <mesh position={[0.72, 0.8, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        <mesh position={[-0.72, 0.8, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.5} />
        </mesh>
      </group>

      {/* Central Aisle 2 */}
      <group position={[2.2, 0, -5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.2, 4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0.72, 1.4, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
        </mesh>
        <mesh position={[-0.72, 1.4, 0]}>
          <boxGeometry args={[0.08, 0.3, 3.6]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.5} />
        </mesh>
      </group>

      {/* Zone A: Manager Cashier / Briefing Counter */}
      <group position={[0, 0, -1]}>
        <mesh position={[0, 0.55, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.1, 0.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Cash Register & POS Terminal */}
        <mesh position={[0.6, 1.25, -0.6]}>
          <boxGeometry args={[0.4, 0.3, 0.4]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Manager Avatar NPC */}
        <group position={[0, 0, -1.3]}>
          {/* Head */}
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f5d0b5" />
          </mesh>
          {/* Hair / Tie */}
          <mesh position={[0, 1.56, 0]}>
            <boxGeometry args={[0.32, 0.08, 0.32]} />
            <meshStandardMaterial color="#27272a" />
          </mesh>
          {/* Shirt */}
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Tie */}
          <mesh position={[0, 0.95, 0.13]}>
            <boxGeometry args={[0.08, 0.3, 0.01]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
        {/* Zone A Floor Badge */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Zone B: IP Camera Station Bench */}
      <group position={[-6, 0, -8]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 1.6]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Holographic Glowing Ring on Floor */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Specialist NPC */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        </group>
      </group>

      {/* Zone C: Network Rack & Switch Station */}
      <group position={[6, 0, -8]}>
        {/* 19" Server/Network Rack Cabinet */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 2.6, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Glass Front Door */}
        <mesh position={[0, 1.3, 0.72]}>
          <boxGeometry args={[1.4, 2.4, 0.05]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.7} opacity={0.5} transparent />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
        {/* Network Engineer NPC */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* Zone D: Recorder Server Shelf */}
      <group position={[-6, 0, 4]}>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.8, 1.4]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Security Chief NPC */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        </group>
      </group>

      {/* Zone E: Control Desk & Monitor */}
      <group position={[6, 0, 4]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.9, 1.4]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        {/* Operator NPC */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>
        </group>
      </group>

      {/* Zone F: Analog vs IP Comparison Bench */}
      <group position={[0, 0, 9]}>
        {/* Left Bench: Analog */}
        <mesh position={[-2.4, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshStandardMaterial color="#78716c" roughness={0.6} />
        </mesh>
        {/* Right Bench: IP */}
        <mesh position={[2.4, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.9, 1.4]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.4, 32]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        {/* Instructor NPC */}
        <group position={[0, 0, -1.2]}>
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f6c29b" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial color="#0f766e" />
          </mesh>
        </group>
      </group>

      {/* Store Lighting Fixtures */}
      {/* Ceiling lights */}
      {[-7, 0, 7].map((x) =>
        [-8, 0, 8].map((z) => (
          <group key={`light_${x}_${z}`} position={[x, 4.95, z]}>
            <mesh>
              <boxGeometry args={[1.6, 0.08, 1.6]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.0} />
            </mesh>
            <pointLight distance={14} intensity={1.2} color="#fffcf5" />
          </group>
        ))
      )}

      {/* Ambient & Directional Lighting */}
      <ambientLight intensity={0.95} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-8, 10, -8]}
        intensity={0.55}
        color="#e0f2fe"
      />
    </group>
  );
};
