'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Rj45Game, WireColor } from './game';

const wires: { color: WireColor; base: string; stripe?: string }[] = [
  { color: 'WO', base: '#f5f3ee', stripe: '#ee7628' }, { color: 'O', base: '#ef7629' },
  { color: 'WG', base: '#f5f3ee', stripe: '#26934d' }, { color: 'G', base: '#299a52' },
  { color: 'B', base: '#215eb7' }, { color: 'WB', base: '#f5f3ee', stripe: '#2863b7' },
  { color: 'WBr', base: '#f5f3ee', stripe: '#875333' }, { color: 'Br', base: '#895735' },
];

function AxialCylinder({ x1, x2, radius, color, metalness = 0 }: { x1: number; x2: number; radius: number; color: string; metalness?: number }) {
  return <mesh position={[(x1 + x2) / 2, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[radius, radius, x2 - x1, 24]} />
    <meshStandardMaterial color={color} metalness={metalness} roughness={metalness ? 0.24 : 0.54} />
  </mesh>;
}

function Wire({ spec, x1, x2, z1, z2, twisted, phase }: {
  spec: (typeof wires)[number]; x1: number; x2: number; z1: number; z2: number; twisted: boolean; phase: number;
}) {
  const curve = useMemo(() => new CatmullRomCurve3(Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const waveY = twisted ? Math.sin(t * Math.PI * 8 + phase) * 0.046 : 0;
    const waveZ = twisted ? Math.cos(t * Math.PI * 8 + phase) * 0.046 : 0;
    return new Vector3(x1 + (x2 - x1) * t, 0.12 + waveY, z1 + (z2 - z1) * t + waveZ);
  })), [x1, x2, z1, z2, twisted, phase]);
  const stripe = useMemo(() => new CatmullRomCurve3(Array.from({ length: 80 }, (_, index) => {
    const t = index / 79;
    const point = curve.getPoint(t);
    return new Vector3(point.x, point.y + 0.044 * Math.cos(t * Math.PI * 24), point.z + 0.044 * Math.sin(t * Math.PI * 24));
  })), [curve]);
  return <group>
    <mesh><tubeGeometry args={[curve, 48, 0.043, 8, false]} /><meshStandardMaterial color={spec.base} roughness={0.52} /></mesh>
    {spec.stripe && <mesh><tubeGeometry args={[stripe, 100, 0.009, 5, false]} /><meshStandardMaterial color={spec.stripe} roughness={0.52} /></mesh>}
  </group>;
}

function Cat6Cable({ game, plugBack }: { game: Rj45Game; plugBack: number }) {
  const end = game.ends[game.side];
  const stripped = game.stage >= 3;
  const inserted = game.stage > 5 || (game.stage === 5 && end.inserted);
  const jacketEnd = !stripped ? -0.4 : inserted ? plugBack + (end.jacketUnderTab ? 0.23 : -0.15) : -0.4 - Math.min(28, end.stripMm) * 0.03;
  const wireEnd = !stripped ? jacketEnd + 0.27 : inserted ? plugBack + 1.53 : game.stage === 3 ? jacketEnd + 0.27 + end.stripMm * 0.05 : 0.82;
  return <group>
    {/* เปลือกนอก CAT6 มีขนาดใหญ่กว่าแกนทั้งแปด และปลายมีหน้าตัดให้เห็นแกน */}
    <AxialCylinder x1={-4} x2={jacketEnd} radius={0.232} color="#1378b5" />
    <AxialCylinder x1={-4} x2={jacketEnd - 0.1} radius={0.239} color="#168ac6" />
    <mesh position={[jacketEnd, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.207, 0.207, 0.018, 24]} />
      <meshStandardMaterial color="#dbe2df" roughness={0.6} />
    </mesh>
    {wires.map((spec, index) => {
      const pair = Math.floor(index / 2);
      const pairZ = (pair - 1.5) * 0.21 + (index % 2 ? 0.047 : -0.047);
      const assignedPin = end.wires.indexOf(spec.color);
      const endZ = assignedPin >= 0 ? (assignedPin - 3.5) * 0.105 : pairZ;
      const missesContact = inserted && assignedPin + 1 === end.openPin;
      return <Wire key={spec.color} spec={spec} x1={jacketEnd - 0.03} x2={missesContact ? wireEnd - 0.28 : wireEnd} z1={pairZ * 0.5} z2={stripped ? endZ : pairZ} twisted={game.stage === 3} phase={index % 2 ? Math.PI : 0} />;
    })}
    {stripped && !inserted && <mesh position={[jacketEnd + 0.33, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.055, 0.47, 6]} />
      <meshStandardMaterial color="#e5e9e4" roughness={0.8} />
    </mesh>}
    {end.bootOn && <mesh position={[jacketEnd - 0.4, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.3, 0.53, 24]} />
      <meshStandardMaterial color="#1475ac" transparent opacity={0.9} roughness={0.47} />
    </mesh>}
  </group>;
}

function Rj45Plug({ center, inserted, crimped }: { center: number; inserted: boolean; crimped: boolean }) {
  const front = center + 0.84;
  return <group>
    {/* ตัวหัวเป็นพลาสติกใสทรง 8P8C มีร่องตัวนำ แผ่นทองแดง และลิ้นล็อก */}
    <mesh position={[center, 0.14, 0]} castShadow>
      <boxGeometry args={[1.68, 0.55, 1.04]} />
      <meshPhysicalMaterial color="#e6f6f3" transparent opacity={0.28} roughness={0.1} depthWrite={false} />
    </mesh>
    <mesh position={[center - 0.71, 0.13, 0]}>
      <boxGeometry args={[0.18, 0.43, 0.95]} />
      <meshStandardMaterial color="#bfcfce" transparent opacity={0.38} roughness={0.18} />
    </mesh>
    <mesh position={[front + 0.045, 0.14, 0]}>
      <boxGeometry args={[0.1, 0.44, 1.02]} />
      <meshStandardMaterial color="#d8ebe7" transparent opacity={0.55} roughness={0.11} />
    </mesh>
    {Array.from({ length: 8 }, (_, index) => {
      const z = (index - 3.5) * 0.115;
      return <group key={index}>
        {!inserted && <mesh position={[center, 0.055, z]}>
          <boxGeometry args={[1.5, 0.065, 0.068]} />
          <meshStandardMaterial color="#b8c9c8" transparent opacity={0.25} />
        </mesh>}
        <mesh position={[center + 0.46, crimped ? 0.394 : 0.42, z]}>
          <boxGeometry args={[0.62, 0.03, 0.065]} />
          <meshStandardMaterial color="#d3a45a" metalness={0.8} roughness={0.24} />
        </mesh>
        <mesh position={[front + 0.1, 0.14, z]}>
          <boxGeometry args={[0.015, 0.17, 0.068]} />
          <meshStandardMaterial color="#c5994b" metalness={0.75} roughness={0.27} />
        </mesh>
      </group>;
    })}
    <mesh position={[center - 0.08, -0.23, 0]} rotation={[0, 0, -0.2]}>
      <boxGeometry args={[1.07, 0.08, 0.31]} />
      <meshStandardMaterial color="#dde9e6" transparent opacity={0.52} roughness={0.16} />
    </mesh>
    <mesh position={[center - 0.61, -0.03, 0]}>
      <boxGeometry args={[0.19, 0.13, 0.78]} />
      <meshStandardMaterial color="#c9d6d4" transparent opacity={0.45} roughness={0.17} />
    </mesh>
  </group>;
}

function Props({ game }: { game: Rj45Game }) {
  if (game.stage >= 7) return <group position={[0.5, 0.02, -1.32]}>
    <mesh castShadow><boxGeometry args={[2.75, 0.39, 0.94]} /><meshStandardMaterial color="#202b32" roughness={0.52} /></mesh>
    <mesh position={[0, 0.21, 0]}><boxGeometry args={[2.53, 0.03, 0.75]} /><meshStandardMaterial color="#34444c" /></mesh>
    {Array.from({ length: 8 }, (_, index) => <mesh key={index} position={[-1.04 + index * 0.296, 0.25, 0]}>
      <sphereGeometry args={[0.066, 12, 8]} />
      <meshStandardMaterial color={!game.lastTest ? '#53616a' : game.lastTest.wiremap[index] === index + 1 ? '#3ee48e' : '#f36651'} emissive={!game.lastTest ? '#0b1114' : game.lastTest.wiremap[index] === index + 1 ? '#0b8250' : '#9e3326'} emissiveIntensity={game.lastTest ? 1.4 : 0} />
    </mesh>)}
  </group>;
  if (game.stage < 6 && game.stage !== 2) return null;
  return <group position={[-1.5, -0.03, -1.2]}>
    <mesh rotation={[0, 0, -0.2]} castShadow><boxGeometry args={[1.65, 0.17, 0.33]} /><meshStandardMaterial color="#263843" metalness={0.35} roughness={0.4} /></mesh>
    <mesh position={[-0.45, 0, 0.1]} rotation={[0, 0, -0.28]}><boxGeometry args={[0.8, 0.19, 0.33]} /><meshStandardMaterial color="#127db2" roughness={0.55} /></mesh>
    <mesh position={[0.55, 0.09, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.6, 0.14, 0.36]} /><meshStandardMaterial color="#88989a" metalness={0.65} roughness={0.28} /></mesh>
    {game.stage === 2 && <mesh position={[2.5, -0.04, 0]}><boxGeometry args={[2.2, 0.03, 0.22]} /><meshStandardMaterial color="#c4c3b9" metalness={0.45} roughness={0.34} /></mesh>}
  </group>;
}

function Bench({ game }: { game: Rj45Game }) {
  const inserted = game.stage > 5 || (game.stage === 5 && game.ends[game.side].inserted);
  const center = inserted ? 1.7 : 2.14;
  return <>
    <ambientLight intensity={1.6} />
    <hemisphereLight intensity={0.8} color="#dbeef2" groundColor="#213740" />
    <directionalLight position={[2, 6, 5]} intensity={2.05} castShadow />
    <pointLight position={[-2, 3, -1]} intensity={2} color="#b9e6ee" />
    <mesh position={[0, -0.7, 0]} receiveShadow><boxGeometry args={[9.3, 0.3, 4.4]} /><meshStandardMaterial color="#2e414a" roughness={0.75} /></mesh>
    <mesh position={[0, -0.535, 0]} receiveShadow><boxGeometry args={[8.8, 0.027, 4]} /><meshStandardMaterial color="#405159" metalness={0.08} roughness={0.82} /></mesh>
    <mesh position={[0, -0.515, 0]} receiveShadow><boxGeometry args={[8.2, 0.014, 3.52]} /><meshStandardMaterial color="#263b43" roughness={0.86} /></mesh>
  <Cat6Cable game={game} plugBack={center - 0.84} />
    <Rj45Plug center={center} inserted={inserted} crimped={game.ends[game.side].crimped} />
    <Props game={game} />
    <Text position={[-2.66, -0.47, -1.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#c4d9de">CAT6 UTP</Text>
    <Text position={[1.51, -0.47, 1.05]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#c4d9de">RJ45 8P8C</Text>
  </>;
}

export function Rj45Workbench3D({ game }: { game: Rj45Game }) {
  return <Canvas camera={{ position: [0.7, 3.5, 6], fov: 35 }} dpr={[1, 1.6]} shadows>
    <color attach="background" args={['#0a1824']} />
    <Suspense fallback={null}><Bench game={game} /></Suspense>
    <OrbitControls enablePan={false} minDistance={5.5} maxDistance={12} maxPolarAngle={Math.PI / 2.1} target={[0, 0, 0]} />
  </Canvas>;
}
