'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { TrainingScene } from './TrainingScene';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Package, Crosshair, User } from 'lucide-react';

interface MissionCameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const MissionCameraController: React.FC<MissionCameraControllerProps> = ({ controlsRef }) => {
  const currentMission = useDomeLabStore((s) => s.currentMission);
  const selectedMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const activeRoom = useDomeLabStore((s) => s.activeRoom);
  const cameraViewMode = useDomeLabStore((s) => s.cameraViewMode);
  const activeDirectorView = useDomeLabStore((s) => s.activeDirectorView);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const mountedPointId = useDomeLabStore((s) => s.mountedPointId);
  const pan = useDomeLabStore((s) => s.pan);
  const tilt = useDomeLabStore((s) => s.tilt);
  const playerPosition = useDomeLabStore((s) => s.playerPosition);
  const { camera } = useThree();

  const isRoom1 = activeRoom === 'room1_indoor';
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 3.0));
  const targetCamPos = useRef(new THREE.Vector3(0, 2.6, 7.2));
  const isTransitioning = useRef(false);
  const prevMountedRef = useRef(isCameraMounted);
  const playerPosRef = useRef(playerPosition);
  playerPosRef.current = playerPosition;

  useEffect(() => {
    // CRITICAL: When camera is mounted, DO NOT ZOOM IN!
    // Keep the exact same camera view as before installation to inspect the 3D FOV cone and scene!
    if (!prevMountedRef.current && isCameraMounted) {
      prevMountedRef.current = isCameraMounted;
      isTransitioning.current = false;
      return;
    }
    prevMountedRef.current = isCameraMounted;

    // 1. Third-Person Player Follow Preset (Roblox style)
    if (activeDirectorView === 'player') {
      const [px, py, pz] = playerPosRef.current;
      targetLookAt.current.set(px, py + 1.2, pz);
      targetCamPos.current.set(px, py + 2.5, pz + 4.2);
      isTransitioning.current = true;
      return;
    }

    // 2. CCTV Lens POV Mode
    if (cameraViewMode === 'pov') {
      const activePtId = mountedPointId || selectedMountPointId;
      const pt = DOME_MOUNT_POINTS_DATA[activePtId];
      const [px, py, pz] = pt.worldPosition;

      const panRad = THREE.MathUtils.degToRad(-pan);
      const tiltRad = THREE.MathUtils.degToRad(tilt);
      const forward = new THREE.Vector3(0, -Math.sin(tiltRad), Math.cos(tiltRad));
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), panRad);

      targetCamPos.current.set(px, py - 0.12, pz);
      targetLookAt.current.copy(targetCamPos.current).addScaledVector(forward, 4.0);
      isTransitioning.current = true;
      return;
    }

    // 3. Camera Close-up ONLY if user explicitly clicks 'target' director view
    if (activeDirectorView === 'target') {
      const activePtId = mountedPointId || selectedMountPointId;
      const pt = DOME_MOUNT_POINTS_DATA[activePtId];
      const [px, py, pz] = pt.worldPosition;
      targetLookAt.current.set(px, py - 0.25, pz);
      targetCamPos.current.set(px + 0.15, py - 0.45, pz + 2.2);
      isTransitioning.current = true;
      return;
    }

    // 4. Director Preset Views per Dedicated Room Section
    if (activeDirectorView === 'overview' || activeDirectorView === 'office' || activeDirectorView === 'workshop') {
      targetLookAt.current.set(0, 1.2, 0);
      targetCamPos.current.set(0, 3.8, 6.2);
      isTransitioning.current = true;
    } else if (activeDirectorView === 'depot') {
      targetLookAt.current.set(-5.5, 1.0, 0);
      targetCamPos.current.set(-5.5, 2.8, 3.8);
      isTransitioning.current = true;
    }
  }, [
    activeRoom,
    isRoom1,
    activeDirectorView,
    cameraViewMode,
    isCameraMounted,
    mountedPointId,
    selectedMountPointId,
    pan,
    tilt,
  ]);

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
        const activePtId = mountedPointId || selectedMountPointId;
        const pt = DOME_MOUNT_POINTS_DATA[activePtId];
        const [px, py, pz] = pt.worldPosition;
        const panRad = THREE.MathUtils.degToRad(-pan);
        const tiltRad = THREE.MathUtils.degToRad(tilt);
        const forward = new THREE.Vector3(0, -Math.sin(tiltRad), Math.cos(tiltRad));
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), panRad);

        targetCamPos.current.set(px, py - 0.12, pz);
        targetLookAt.current.copy(targetCamPos.current).addScaledVector(forward, 4.0);

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
          camera.position.distanceTo(targetCamPos.current) < 0.05 &&
          controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05
        ) {
          isTransitioning.current = false;
        }
      } else if (activeDirectorView === 'player') {
        // Continuous Third-Person Player Follow Chase (Roblox style)
        const [px, py, pz] = playerPosition;
        const desiredTarget = new THREE.Vector3(px, py + 1.2, pz);
        const targetDelta = desiredTarget.sub(controlsRef.current.target);

        // Move target and camera in unison with smooth damping
        const followSpeed = Math.min(1, delta * 10.0);
        const moveStep = targetDelta.multiplyScalar(followSpeed);

        controlsRef.current.target.add(moveStep);
        camera.position.add(moveStep);

        // Camera room boundary clamping (22m x 22m space)
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -10.5, 10.5);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -10.5, 10.5);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.6, 4.8);

        controlsRef.current.update();
      }
    }
  });

  return null;
};

export const TrainingCanvas: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const activeRoom = useDomeLabStore((s) => s.activeRoom);
  const cameraViewMode = useDomeLabStore((s) => s.cameraViewMode);
  const activeDirectorView = useDomeLabStore((s) => s.activeDirectorView);
  const setActiveDirectorView = useDomeLabStore((s) => s.setActiveDirectorView);
  const mountedPointId = useDomeLabStore((s) => s.mountedPointId);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);

  const handleZoom = (deltaDistance: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object as THREE.PerspectiveCamera;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    camera.position.addScaledVector(dir, deltaDistance);
    controls.update();
  };

  const handleResetCamera = () => {
    setActiveDirectorView('player');
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 2.6, 7.2]}
          fov={60}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          target={[0, 1.2, 3.0]}
          minDistance={1.2}
          maxDistance={28}
          maxPolarAngle={Math.PI / 2 + 0.04}
          enableZoom={cameraViewMode !== 'pov'}
          enablePan={activeDirectorView !== 'player'}
          zoomSpeed={0.9}
        />

        <MissionCameraController controlsRef={controlsRef} />
        <TrainingScene />
      </Canvas>

      {/* Floating Director View Presets & Zoom Toolbar */}
      {cameraViewMode !== 'pov' && (
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl">
          <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
            มุมมอง:
          </span>
          <button
            onClick={() => setActiveDirectorView('player')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeDirectorView === 'player'
                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="มุมมองบุคคลที่สามติดตามตัวละครช่าง (Third-Person Follow)"
          >
            <User className="w-3.5 h-3.5 text-cyan-300" />
            <span>ติดตามช่าง</span>
          </button>
          <button
            onClick={() => setActiveDirectorView('overview')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeDirectorView === 'overview' || activeDirectorView === 'office' || activeDirectorView === 'workshop'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{activeRoom === 'room1_indoor' ? 'ภาพรวมสำนักงาน' : 'ภาพรวมโรงฝึกงาน'}</span>
          </button>
          <button
            onClick={() => setActiveDirectorView('depot')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeDirectorView === 'depot'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>โต๊ะเบิกอุปกรณ์</span>
          </button>
          {mountedPointId && isCameraMounted && (
            <button
              onClick={() => setActiveDirectorView('target')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeDirectorView === 'target'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-amber-500/20 text-amber-300 hover:text-white hover:bg-amber-500/30 border border-amber-500/40'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>จุดติดตั้ง {mountedPointId}</span>
            </button>
          )}

          {/* Integrated 3D Zoom Controls */}
          <div className="w-[1px] h-4 bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleZoom(1.2)}
              title="ซูมเข้า (Zoom In)"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-1.2)}
              title="ซูมออก (Zoom Out)"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetCamera}
              title="รีเซ็ตมุมมองกล้อง 3D ติดตามช่าง"
              className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

