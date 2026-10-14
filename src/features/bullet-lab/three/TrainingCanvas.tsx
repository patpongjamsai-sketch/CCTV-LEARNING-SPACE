'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { TrainingScene } from './TrainingScene';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { MOUNT_POINTS } from '../data/bulletLabData';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MissionCameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const MissionCameraController: React.FC<MissionCameraControllerProps> = ({ controlsRef }) => {
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const selectedMountPointId = useBulletLabStore((s) => s.selectedMountPoint);
  const cameraViewMode = useBulletLabStore((s) => s.cameraViewMode);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const { camera } = useThree();

  const targetLookAt = useRef(new THREE.Vector3(0, 2, 0.5));
  const targetCamPos = useRef(new THREE.Vector3(0.5, 3.2, 5.8));
  const isTransitioning = useRef(false);

  useEffect(() => {
    const pt = MOUNT_POINTS.find((p) => p.id === selectedMountPointId) ?? MOUNT_POINTS[0]!;
    const [px, py, pz] = pt.worldPosition;

    if (currentMission === 2) {
      // Mission 2: Focus on selected mount point
      targetLookAt.current.set(px, py, pz);
      targetCamPos.current.set(px + 0.15, py + 0.05, pz + 2.3);
      isTransitioning.current = true;
    } else if (currentMission === 3) {
      if (cameraViewMode === 'pov') {
        // Mission 3 CCTV POV: Camera looks directly out from the mounted lens
        const panRad = THREE.MathUtils.degToRad(-pan);
        const tiltRad = THREE.MathUtils.degToRad(tilt);
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), -tiltRad);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), panRad);

        targetCamPos.current.set(px, py, pz + 0.22);
        targetLookAt.current.copy(targetCamPos.current).addScaledVector(forward, 3.5);
      } else {
        // Mission 3 Technician View: Wide room framing to see full FOV cone, camera, and entrance mannequin
        targetLookAt.current.set(0, 1.8, 1.2);
        targetCamPos.current.set(0.6, 3.2, 5.4);
      }
      isTransitioning.current = true;
    } else if (currentMission === 4) {
      // Mission 4: Surface & Installation workspace close-up focus on the chosen mounting point
      targetLookAt.current.set(px, py, pz);
      targetCamPos.current.set(px + 0.1, py + 0.05, pz + 1.8);
      isTransitioning.current = true;
    } else if (currentMission === 1) {
      // Mission 1: Room overview
      targetLookAt.current.set(0, 1.8, 0.5);
      targetCamPos.current.set(0.5, 3.2, 5.8);
      isTransitioning.current = true;
    }
  }, [currentMission, selectedMountPointId, cameraViewMode]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      if (cameraViewMode !== 'pov') {
        isTransitioning.current = false;
      }
    };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controlsRef, cameraViewMode]);

  useFrame((_, delta) => {
    if (controlsRef.current) {
      if (currentMission === 3 && cameraViewMode === 'pov') {
        // Continuously update POV lens angle in real-time without zooming
        const pt = MOUNT_POINTS.find((p) => p.id === selectedMountPointId) ?? MOUNT_POINTS[0]!;
        const [px, py, pz] = pt.worldPosition;
        const panRad = THREE.MathUtils.degToRad(-pan);
        const tiltRad = THREE.MathUtils.degToRad(tilt);
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), -tiltRad);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), panRad);

        targetCamPos.current.set(px, py, pz + 0.22);
        targetLookAt.current.copy(targetCamPos.current).addScaledVector(forward, 3.5);

        const step = Math.min(1, delta * 12.0);
        controlsRef.current.target.lerp(targetLookAt.current, step);
        camera.position.lerp(targetCamPos.current, step);
        controlsRef.current.update();
      } else if (isTransitioning.current) {
        const step = Math.min(1, delta * 4.5);
        controlsRef.current.target.lerp(targetLookAt.current, step);
        camera.position.lerp(targetCamPos.current, step);
        controlsRef.current.update();

        if (
          controlsRef.current.target.distanceTo(targetLookAt.current) < 0.015 &&
          camera.position.distanceTo(targetCamPos.current) < 0.015
        ) {
          isTransitioning.current = false;
        }
      }
    }
  });

  return null;
};

interface TrainingCanvasProps {
  onControlsReady?: (controls: OrbitControlsImpl | null) => void;
}

export const TrainingCanvas: React.FC<TrainingCanvasProps> = ({
  onControlsReady,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (controlsRef.current && onControlsReady) {
      onControlsReady(controlsRef.current);
    }
  }, [onControlsReady]);

  return (
    <div className="relative w-full h-full bg-slate-950">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          stencil: false,
          depth: true,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Perspective Camera */}
        <PerspectiveCamera
          makeDefault
          position={[0.5, 3.2, 5.8]}
          fov={55}
          near={0.1}
          far={100}
        />

        {/* Orbit Controls (Interactive Zoom Enabled) */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 2, 0.5]}
          enableZoom={true}
          minDistance={1.2}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 + 0.05} // don't go below floor
          enableDamping
          dampingFactor={0.06}
        />

        {/* Dynamic Camera Focus Controller for Missions 2 & 3 */}
        <MissionCameraController controlsRef={controlsRef} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <directionalLight position={[-4, 4, 3]} intensity={0.5} />
        <hemisphereLight
          args={['#38bdf8', '#0f172a', 0.5]}
          position={[0, 10, 0]}
        />

        {/* The 3D Training Scene */}
        <TrainingScene />
      </Canvas>

      {/* 3D Viewport Zoom & Reset Overlay Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <button
          onClick={() => {
            if (controlsRef.current) {
              const controls = controlsRef.current;
              const cam = controls.object;
              const dir = new THREE.Vector3().subVectors(controls.target, cam.position).normalize();
              cam.position.addScaledVector(dir, 0.8);
              controls.update();
            }
          }}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow"
          title="ซูมเข้า (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (controlsRef.current) {
              const controls = controlsRef.current;
              const cam = controls.object;
              const dir = new THREE.Vector3().subVectors(controls.target, cam.position).normalize();
              cam.position.addScaledVector(dir, -0.8);
              controls.update();
            }
          }}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow"
          title="ซูมออก (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.target.set(0, 2, 0.5);
              controlsRef.current.object.position.set(0.5, 3.2, 5.8);
              controlsRef.current.update();
            }
          }}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow"
          title="รีเซ็ตมุมมองภาพ (Reset View)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
