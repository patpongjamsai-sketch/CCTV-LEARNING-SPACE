'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export interface Room102SmartSchoolSceneProps {
  onEnterRoom101?: () => void;
  onEnterRoom103?: () => void;
}

export const Room102SmartSchoolScene: React.FC<Room102SmartSchoolSceneProps> = ({
  onEnterRoom101,
  onEnterRoom103,
}) => {
  return (
    <group dispose={null}>
      {/* ========================================================
          1. โครงสร้างห้องเดี่ยว Room 102 (22 x 22 เมตร, ศูนย์กลางที่ 0,0)
         ======================================================== */}
      {/* เพดานห้อง */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ผนังทิศเหนือ (Z = -11) */}
      <mesh position={[0, 2.5, -11]} receiveShadow>
        <boxGeometry args={[22, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* แถบไฟวิ่งสถาปัตยกรรมทิศเหนือ */}
      <mesh position={[0, 4.3, -10.78]}>
        <boxGeometry args={[22, 0.35, 0.05]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} />
      </mesh>
      {/* ป้ายชื่อห้องหลัก Room 102 */}
      <mesh position={[0, 4.4, -10.7]}>
        <boxGeometry args={[10, 0.6, 0.1]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>
      <Html position={[0, 4.4, -10.6]} center transform distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div className="text-white font-bold text-sm tracking-wider px-3.5 py-1 bg-emerald-950/90 rounded border border-emerald-400 select-none shadow-xl">
          ROOM 102: SMART SCHOOL CCTV SIMULATION LAB
        </div>
      </Html>

      {/* จอแสดงผลเทคโนโลยีบนผนังทิศเหนือ */}
      <mesh position={[-5, 2.5, -10.75]}>
        <boxGeometry args={[4.2, 2.0, 0.08]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[5, 2.5, -10.75]}>
        <boxGeometry args={[4.2, 2.0, 0.08]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.25} />
      </mesh>

      {/* ผนังทิศใต้ (Z = +11) */}
      <mesh position={[0, 2.5, 11]} receiveShadow>
        <boxGeometry args={[22, 5, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ผนังทิศตะวันตก (X = -11, มีประตูทางกลับไป Room 101) */}
      <mesh position={[-11, 2.5, -6]} receiveShadow>
        <boxGeometry args={[0.4, 5, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[-11, 2.5, 6]} receiveShadow>
        <boxGeometry args={[0.4, 5, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ประตูกลับสู่ Room 101 (ที่ X = -10.7, Z = 0) */}
      <group position={[-10.7, 0, 0]}>
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[0.5, 1.2, 3.8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Html position={[0.35, 2.6, 0]} center transform distanceFactor={6} zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={onEnterRoom101}
            className="px-3 py-1.5 rounded-xl border border-sky-400 bg-sky-950/95 hover:bg-sky-900 text-sky-200 font-bold text-xs shadow-2xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-transform hover:scale-105 select-none"
          >
            <span>⬅️</span>
            <span>[E] กลับไป ROOM 101: SMART MART</span>
          </button>
        </Html>
      </group>

      {/* ผนังทิศตะวันออก (X = +11, มีประตูพอร์ทัลข้ามไปสู่ Room 103) */}
      <mesh position={[11, 2.5, -6]} receiveShadow>
        <boxGeometry args={[0.4, 5, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[11, 2.5, 6]} receiveShadow>
        <boxGeometry args={[0.4, 5, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ประตูพอร์ทัลทางออกไป Room 103 (ที่ X = 10.7, Z = 0) */}
      <group position={[10.7, 0, 0]}>
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[0.5, 1.2, 3.8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Html position={[-0.35, 2.6, 0]} center transform distanceFactor={6} zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={onEnterRoom103}
            className="px-3.5 py-1.5 rounded-xl border border-blue-400 bg-blue-950/95 hover:bg-blue-900 text-blue-200 font-bold text-xs shadow-2xl flex items-center gap-2 whitespace-nowrap cursor-pointer transition-transform hover:scale-105 select-none"
          >
            <span>🛠️</span>
            <span>[E] ไปยัง ROOM 103: CABLING LAB ➜</span>
          </button>
        </Html>
      </group>

      {/* พื้นกระเบื้อง Tech Lab Room 102 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.1} />
      </mesh>
      <gridHelper args={[22, 22, 0x0ea5e9, 0x1e293b]} position={[0, 0.01, 0]} />

      {/* ========================================================
          2. แท่นนวัตกรรมกลางห้อง (Central Innovation Holo-Pod)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 0.4, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.4, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#38bdf8" wireframe emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* ========================================================
          3. ระบบแสงสว่างเฉพาะ Room 102
         ======================================================== */}
      {[-6, 0, 6].map((x) =>
        [-6, 0, 6].map((z) => (
          <mesh key={`r102_light_${x}_${z}`} position={[x, 4.95, z]}>
            <boxGeometry args={[1.6, 0.08, 1.6]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
        ))
      )}

      {/* Point Lights สองจุด */}
      <pointLight position={[-4, 4.5, 0]} distance={18} intensity={1.5} color="#f0f9ff" />
      <pointLight position={[4, 4.5, 0]} distance={18} intensity={1.5} color="#f0f9ff" />

      {/* แสงสว่างทั่วไป */}
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[6, 14, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 12, -6]} intensity={0.5} color="#cffafe" />
    </group>
  );
};
