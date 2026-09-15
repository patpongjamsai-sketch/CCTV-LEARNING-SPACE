import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
  targetPosition: THREE.Vector3;
  cameraYawRef?: React.MutableRefObject<number>;
  isRightDraggingRef?: React.MutableRefObject<boolean>;
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  targetPosition,
  cameraYawRef,
  isRightDraggingRef,
}) => {
  const { camera, gl } = useThree();
  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(0.32); // Initial comfortable pitch angle
  const distanceRef = useRef<number>(4.0); // Current smoothed distance
  const targetDistanceRef = useRef<number>(4.0); // Target zoom distance
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentCamPos = useRef(new THREE.Vector3(0, 2.5, 4.8));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0.8));

  useEffect(() => {
    const dom = gl.domElement;

    // Initialize cameraYawRef
    if (cameraYawRef) {
      cameraYawRef.current = yawRef.current;
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDraggingRef.current = true;
        if (e.button === 2 && isRightDraggingRef) {
          isRightDraggingRef.current = true;
        }
        prevMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      // Rotate camera yaw (horizontal orbit) and pitch (vertical angle)
      yawRef.current -= dx * 0.0055;
      if (cameraYawRef) {
        cameraYawRef.current = yawRef.current;
      }
      pitchRef.current = Math.max(0.08, Math.min(1.22, pitchRef.current + dy * 0.0045));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      if (isRightDraggingRef) {
        isRightDraggingRef.current = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Zoom in and out with mouse wheel
      e.preventDefault();
      targetDistanceRef.current = Math.max(
        1.6,
        Math.min(6.5, targetDistanceRef.current + e.deltaY * 0.0035)
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Keyboard zoom shortcuts for laptops/trackpads (+ / -, PageUp / PageDown, [ / ])
      if (e.code === 'Equal' || e.code === 'NumpadAdd' || e.code === 'PageUp' || e.code === 'BracketRight') {
        targetDistanceRef.current = Math.max(1.6, targetDistanceRef.current - 0.4);
      }
      if (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.code === 'PageDown' || e.code === 'BracketLeft') {
        targetDistanceRef.current = Math.min(6.5, targetDistanceRef.current + 0.4);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    dom.addEventListener('contextmenu', onContextMenu);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      dom.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, cameraYawRef, isRightDraggingRef]);

  useFrame((_, delta) => {
    // Keep external yaw ref in sync
    if (cameraYawRef) {
      cameraYawRef.current = yawRef.current;
    }

    // Smooth distance zoom
    const zoomSpeed = Math.min(1, delta * 12);
    distanceRef.current += (targetDistanceRef.current - distanceRef.current) * zoomSpeed;

    const currentYaw = yawRef.current;
    const currentPitch = pitchRef.current;
    const distance = distanceRef.current;

    // Calculate desired camera position relative to target
    // At yaw = 0, camera is at target.z + radius (behind player), looking at target in -Z direction
    const height = 1.25 + Math.sin(currentPitch) * distance * 0.72;
    const radius = Math.cos(currentPitch) * distance;

    let desiredX = targetPosition.x + Math.sin(currentYaw) * radius;
    let desiredZ = targetPosition.z + Math.cos(currentYaw) * radius;
    let desiredY = targetPosition.y + height;

    // Camera wall collision avoidance (Store interior bounds)
    const minX = -10.2;
    const maxX = 10.2;
    const minZ = -12.2;
    const maxZ = 12.2;
    const maxY = 4.65;
    const minY = 0.5;

    // Clamp camera within room boundary so it never clips through store outer walls or ceiling
    if (desiredX < minX || desiredX > maxX || desiredZ < minZ || desiredZ > maxZ || desiredY > maxY || desiredY < minY) {
      desiredX = Math.max(minX, Math.min(maxX, desiredX));
      desiredZ = Math.max(minZ, Math.min(maxZ, desiredZ));
      desiredY = Math.max(minY, Math.min(maxY, desiredY));
    }

    const desiredCamPos = new THREE.Vector3(desiredX, desiredY, desiredZ);
    const desiredLookTarget = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 1.2,
      targetPosition.z
    );

    // Smooth lerp for buttery smooth camera chase
    const lerpSpeed = Math.min(1, delta * 14);
    currentCamPos.current.lerp(desiredCamPos, lerpSpeed);
    currentLookAt.current.lerp(desiredLookTarget, lerpSpeed);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
