'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { RobloxTechnicianAvatar } from './RobloxTechnicianAvatar';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';
import { DomeMountPointId } from '../types';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export const RobloxPlayerController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const setPlayerPosition = useDomeLabStore((s) => s.setPlayerPosition);
  const setIsNearPpeTable = useDomeLabStore((s) => s.setIsNearPpeTable);
  const setDistanceToPpeTable = useDomeLabStore((s) => s.setDistanceToPpeTable);
  const setIsPpeModalOpen = useDomeLabStore((s) => s.setIsPpeModalOpen);
  const hasPickedUpCamera = useDomeLabStore((s) => s.hasPickedUpCamera);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const pickUpCamera = useDomeLabStore((s) => s.pickUpCamera);
  const mountCameraAtPoint = useDomeLabStore((s) => s.mountCameraAtPoint);
  const setIsNearCameraTable = useDomeLabStore((s) => s.setIsNearCameraTable);
  const setDistanceToCameraTable = useDomeLabStore((s) => s.setDistanceToCameraTable);
  const setNearMountPointId = useDomeLabStore((s) => s.setNearMountPointId);
  const activeRoom = useDomeLabStore((s) => s.activeRoom);

  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  const posRef = useRef(new THREE.Vector3(0, 0, 2.0));
  const rotationYRef = useRef(0);
  const targetRotationYRef = useRef(0);

  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  // Tables position per active room
  const isRoom1 = activeRoom === 'room1_indoor';
  const PPE_TABLE_POS = useMemo(
    () => (isRoom1 ? new THREE.Vector3(-5.5, 0, 4.5) : new THREE.Vector3(3.5, 0, 4.5)),
    [isRoom1]
  );
  const CAMERA_TABLE_POS = useMemo(
    () => (isRoom1 ? new THREE.Vector3(-5.5, 0, -4.5) : new THREE.Vector3(3.5, 0, -4.5)),
    [isRoom1]
  );

  // Sync player position when activeRoom changes via URL/tab
  useEffect(() => {
    if (activeRoom === 'room1_indoor') {
      posRef.current.set(-9.5, 0, 2.0);
    } else {
      posRef.current.set(9.5, 0, 2.0);
    }
    rotationYRef.current = 0;
    targetRotationYRef.current = 0;
    setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z]);
  }, [activeRoom, setPlayerPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        keys.current.sprint = true;
        setIsSprinting(true);
      }
      if (code === 'KeyE') {
        const curPos = posRef.current;

        // 1. Check PPE Table
        if (curPos.distanceTo(PPE_TABLE_POS) <= 2.5) {
          setIsPpeModalOpen(true);
          return;
        }

        // 2. Check Camera Dispatch Table
        if (curPos.distanceTo(CAMERA_TABLE_POS) <= 2.5 && !hasPickedUpCamera) {
          pickUpCamera();
          return;
        }

        // 3. Check Mount Points A–I
        if (hasPickedUpCamera && !isCameraMounted) {
          for (const [ptId, pt] of Object.entries(DOME_MOUNT_POINTS_DATA)) {
            const [px, , pz] = pt.worldPosition;
            const distHorizontal = Math.hypot(curPos.x - px, curPos.z - pz);
            if (distHorizontal <= 2.2) {
              mountCameraAtPoint(ptId as DomeMountPointId);
              return;
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        keys.current.sprint = false;
        setIsSprinting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    setIsPpeModalOpen,
    pickUpCamera,
    mountCameraAtPoint,
    hasPickedUpCamera,
    isCameraMounted,
    PPE_TABLE_POS,
    CAMERA_TABLE_POS,
  ]);

  useFrame((_, delta) => {
    const { forward, backward, left, right, sprint } = keys.current;

    let moveX = 0;
    let moveZ = 0;

    if (forward) moveZ -= 1;
    if (backward) moveZ += 1;
    if (left) moveX -= 1;
    if (right) moveX += 1;

    const moving = moveX !== 0 || moveZ !== 0;
    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    if (moving) {
      const moveDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
      targetRotationYRef.current = Math.atan2(moveDir.x, moveDir.z);

      const moveSpeed = (sprint ? 6.2 : 3.5) * delta;
      posRef.current.x += moveDir.x * moveSpeed;
      posRef.current.z += moveDir.z * moveSpeed;

      // Bound checking per expanded room section (18m x 18m)
      if (isRoom1) {
        posRef.current.x = THREE.MathUtils.clamp(posRef.current.x, -17.5, -1.2);
      } else {
        posRef.current.x = THREE.MathUtils.clamp(posRef.current.x, 1.2, 17.5);
      }
      posRef.current.z = THREE.MathUtils.clamp(posRef.current.z, -8.0, 8.0);

      // Smooth turn rotation
      const diff = targetRotationYRef.current - rotationYRef.current;
      const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
      rotationYRef.current += shortestDiff * Math.min(1, delta * 12);

      setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z]);
    }

    // Distance to PPE table
    const distToPpe = posRef.current.distanceTo(PPE_TABLE_POS);
    setDistanceToPpeTable(distToPpe);
    setIsNearPpeTable(distToPpe <= 2.5);

    // Distance to Camera Dispatch table
    const distToCamTable = posRef.current.distanceTo(CAMERA_TABLE_POS);
    setDistanceToCameraTable(distToCamTable);
    setIsNearCameraTable(distToCamTable <= 2.5);

    // Distance to Mount Points in Active Room
    let closestPtId: DomeMountPointId | null = null;
    let closestDist = 999;
    for (const [ptId, pt] of Object.entries(DOME_MOUNT_POINTS_DATA)) {
      if (pt.roomId !== activeRoom) continue;
      const [px, , pz] = pt.worldPosition;
      const distHorizontal = Math.hypot(posRef.current.x - px, posRef.current.z - pz);
      if (distHorizontal <= 2.2 && distHorizontal < closestDist) {
        closestDist = distHorizontal;
        closestPtId = ptId as DomeMountPointId;
      }
    }
    setNearMountPointId(closestPtId);

    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.y = rotationYRef.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 2.8]}>
      <RobloxTechnicianAvatar isMoving={isMoving} isSprinting={isSprinting} />
    </group>
  );
};
