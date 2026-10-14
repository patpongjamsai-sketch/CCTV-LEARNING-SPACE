'use client';

import React from 'react';
import * as THREE from 'three';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { MOUNT_POINTS } from '../data/bulletLabData';

const TABLE_LEGS: [number, number, number][] = [
  [-0.6, 0.42, -0.3],
  [0.6, 0.42, -0.3],
  [-0.6, 0.42, 0.3],
  [0.6, 0.42, 0.3],
];

const HOLE_OFFSETS: [number, number][] = [
  [0.045, 0.045],
  [-0.045, 0.045],
  [0.045, -0.045],
  [-0.045, -0.045],
];

export const InteractiveTools3D: React.FC = () => {
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const selectedMountPointId = useBulletLabStore((s) => s.selectedMountPoint);
  const templatePlaced = useBulletLabStore((s) => s.templatePlaced);
  const tapeMeasureActive = useBulletLabStore((s) => s.tapeMeasureActive);
  const levelChecked = useBulletLabStore((s) => s.levelChecked);
  const markedPoints = useBulletLabStore((s) => s.markedPoints);
  const drillDepthMm = useBulletLabStore((s) => s.drillDepthMm);
  const isDrilling = useBulletLabStore((s) => s.isDrilling);
  const anchorInserted = useBulletLabStore((s) => s.anchorInserted);
  const baseMounted = useBulletLabStore((s) => s.baseMounted);
  const screwTightness = useBulletLabStore((s) => s.screwTightness);

  const mountPoint =
    MOUNT_POINTS.find((p) => p.id === selectedMountPointId) ?? MOUNT_POINTS[0]!;
  const [targetX, targetY, targetZ] = mountPoint.worldPosition;

  return (
    <group>
      {/* ============================================================ */}
      {/* 1. WORKBENCH / TOOL TABLE (Positioned at right: X=2.4, Z=1.5) */}
      {/* ============================================================ */}
      <group position={[2.4, 0, 1.2]} rotation={[0, -0.3, 0]}>
        {/* Table Top */}
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[1.4, 0.08, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Table Legs */}
        {TABLE_LEGS.map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]}>
            <cylinderGeometry args={[0.03, 0.03, 0.84, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.7} />
          </mesh>
        ))}

        {/* --- Tools on the Table --- */}

        {/* Rotary Hammer Drill */}
        <group position={[-0.3, 0.96, 0]} rotation={[0, 0.4, Math.PI / 2]}>
          {/* Drill Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.22, 0.14]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} />
          </mesh>
          {/* Motor rear housing */}
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Chuck and bit */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.14, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Torpedo Spirit Level */}
        <mesh position={[0.2, 0.91, -0.1]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.26, 0.04, 0.03]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* Tape Measure */}
        <mesh position={[0.1, 0.92, 0.15]}>
          <boxGeometry args={[0.08, 0.06, 0.07]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>

        {/* Box of Anchors & Screws */}
        <group position={[0.45, 0.91, 0.05]}>
          <mesh>
            <boxGeometry args={[0.18, 0.04, 0.14]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.8} />
          </mesh>
          {/* Colorful plastic anchors inside */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.14, 0.02, 0.1]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
        </group>

        {/* Spare Junction Box */}
        <mesh position={[-0.45, 0.93, -0.15]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. WALL-MOUNTED INTERACTIVE TOOLS (At active Mount Point)   */}
      {/* ============================================================ */}
      <group position={[targetX, targetY, targetZ]}>
        {/* --- Mission 5: Mounting Template, Level & Marks --- */}
        {templatePlaced && (
          <group position={[0, 0, 0.005]}>
            {/* Paper Template Sheet */}
            <mesh>
              <planeGeometry args={[0.2, 0.2]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Template crosshairs */}
            <mesh position={[0, 0, 0.001]}>
              <ringGeometry args={[0.068, 0.072, 32]} />
              <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Spirit Level tool attached to template */}
        {levelChecked && (
          <group position={[0, 0.12, 0.015]}>
            <mesh>
              <boxGeometry args={[0.28, 0.035, 0.025]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} />
            </mesh>
            {/* Center green level vial bubble */}
            <mesh position={[0, 0, 0.013]}>
              <cylinderGeometry args={[0.008, 0.008, 0.04, 16]} />
              <meshBasicMaterial color="#86efac" />
            </mesh>
          </group>
        )}

        {/* Tape Measure extending down to floor */}
        {tapeMeasureActive && (
          <group position={[0.14, 0, 0.01]}>
            {/* Measuring tape blade */}
            <mesh position={[0, -targetY / 2, 0]}>
              <planeGeometry args={[0.025, targetY]} />
              <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
            </mesh>
            {/* Tape casing */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.07, 0.06, 0.05]} />
              <meshStandardMaterial color="#ca8a04" />
            </mesh>
          </group>
        )}

        {/* Marked Drill Points (Pencil Crosses) */}
        {markedPoints.map((pt, i) => (
          <group key={pt.id || i} position={[pt.x, pt.y, 0.008]}>
            {/* Cross mark */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[0.02, 0.004]} />
              <meshBasicMaterial color="#0f172a" side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <planeGeometry args={[0.02, 0.004]} />
              <meshBasicMaterial color="#0f172a" side={THREE.DoubleSide} />
            </mesh>
            {/* Small red target center */}
            <mesh>
              <circleGeometry args={[0.003, 16]} />
              <meshBasicMaterial color="#dc2626" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* --- Drilling in Action --- */}
        {(isDrilling || (currentMission === 4 && drillDepthMm > 0)) && (
          <group
            position={[0, 0, 0.02 + Math.max(0, 0.25 - drillDepthMm / 150)]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            {/* Drill Tool Body actively drilling */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.08, 0.22, 0.12]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </mesh>
            {/* Chuck */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            {/* Bit extending into wall */}
            <mesh position={[0, -0.06, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.12, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* Drilled Holes & Wall Plugs/Anchors */}
        {(drillDepthMm > 20 || anchorInserted) &&
          HOLE_OFFSETS.map(([hx, hy], idx) => (
            <group key={idx} position={[hx, hy, 0.003]}>
              {/* Drilled Hole Void */}
              <mesh>
                <circleGeometry args={[0.006, 16]} />
                <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} />
              </mesh>
              {/* Inserted Anchor Collar */}
              {anchorInserted && (
                <mesh position={[0, 0, 0.002]}>
                  <ringGeometry args={[0.003, 0.0065, 16]} />
                  <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
                </mesh>
              )}
            </group>
          ))}

        {/* --- Mission 7: Base / Junction Box Mounted --- */}
        {baseMounted && (
          <group position={[0, 0, 0.025]}>
            {/* Square Junction Box */}
            <mesh>
              <boxGeometry args={[0.13, 0.13, 0.045]} />
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.25}
                metalness={0.1}
              />
            </mesh>
            {/* Rubber gasket seals on sides */}
            <mesh position={[0.066, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[-0.066, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Screws Condition Indicator (Green=correct, Amber=loose, Red=overtight) */}
            <mesh position={[0, 0.05, 0.024]}>
              <circleGeometry args={[0.008, 16]} />
              <meshBasicMaterial
                color={
                  screwTightness === 'correct'
                    ? '#22c55e'
                    : screwTightness === 'loose'
                    ? '#f59e0b'
                    : '#ef4444'
                }
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
