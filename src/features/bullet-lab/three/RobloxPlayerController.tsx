'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { RobloxTechnicianAvatar } from './RobloxTechnicianAvatar';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export const RobloxPlayerController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const setPlayerPosition = useBulletLabStore((s) => s.setPlayerPosition);
  const setIsNearPpeTable = useBulletLabStore((s) => s.setIsNearPpeTable);
  const setDistanceToPpeTable = useBulletLabStore((s) => s.setDistanceToPpeTable);
  const setIsPpeModalOpen = useBulletLabStore((s) => s.setIsPpeModalOpen);

  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Proximity visit tracking
  const wasNearRef = useRef(false);

  // Character physical transform
  const posRef = useRef(new THREE.Vector3(0, 0, 3.2));
  const rotationYRef = useRef(0);
  const targetRotationYRef = useRef(0);

  // Key input state
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  // PPE Table position in world space
  const PPE_TABLE_POS = new THREE.Vector3(-2.4, 0, 2.0);

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
  }, []);

  useFrame((_, delta) => {
    const { forward, backward, left, right, sprint } = keys.current;

    // Movement vector in screen-space
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
      // Normalize direction
      const len = Math.hypot(moveX, moveZ);
      const dirX = moveX / len;
      const dirZ = moveZ / len;

      const speed = sprint ? 4.5 : 2.6; // meters per second
      const step = speed * delta;

      // Update position
      posRef.current.x += dirX * step;
      posRef.current.z += dirZ * step;

      // Room boundary clamps (room is ~8m x 6m)
      posRef.current.x = Math.max(-4.2, Math.min(4.2, posRef.current.x));
      posRef.current.z = Math.max(0.2, Math.min(5.2, posRef.current.z));

      // Calculate facing angle in radians
      targetRotationYRef.current = Math.atan2(dirX, dirZ);

      // Smoothly rotate character to face direction
      const diff = THREE.MathUtils.euclideanModulo(
        targetRotationYRef.current - rotationYRef.current + Math.PI,
        Math.PI * 2
      ) - Math.PI;
      rotationYRef.current += diff * Math.min(1, delta * 15);
    }

    // Apply position & rotation to Three.js Group
    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.y = rotationYRef.current;
    }

    // Update player position in global store
    setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z]);

    // Calculate proximity distance to PPE Table
    const distToPpe = posRef.current.distanceTo(PPE_TABLE_POS);
    setDistanceToPpeTable(distToPpe);
    const isNowNear = distToPpe <= 2.2;
    setIsNearPpeTable(isNowNear);

    // Auto-open PPE modal when player walks up to the table
    if (distToPpe <= 2.0 && !wasNearRef.current) {
      setIsPpeModalOpen(true);
      wasNearRef.current = true;
    } else if (distToPpe > 2.8) {
      // Reset trigger when player walks away
      wasNearRef.current = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 3.2]}>
      {/* 3D Roblox Technician Humanoid Avatar */}
      <RobloxTechnicianAvatar isMoving={isMoving} isSprinting={isSprinting} />

      {/* Floating Player Name Tag above head */}
      <group position={[0, 1.85, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
};
