import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlockStudentAvatar } from './BlockStudentAvatar';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { useRoleplayStore } from '../../store/useRoleplayStore';
import { ZoneId } from '../../shared/domain/roleplayTypes';
import {
  getCameraRelativeMove,
  moveWithObstacleSliding,
  STORE_OBSTACLES,
} from '../../shared/domain/playerMovement';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

// Convenience store boundaries in meters
const STORE_BOUNDS = {
  minX: -9.5,
  maxX: 9.5,
  minZ: -11.5,
  maxZ: 11.5,
};

export const PlayerController: React.FC = () => {
  const playerGroupRef = useRef<THREE.Group>(null);
  const carriedItem = useRoleplayStore((s) => s.carriedItem);
  const setCurrentZone = useRoleplayStore((s) => s.setCurrentZone);
  const setInteractionPrompt = useRoleplayStore((s) => s.setInteractionPrompt);
  const selectSlot = useRoleplayStore((s) => s.selectSlot);
  const openStationDialogue = useRoleplayStore((s) => s.openStationDialogue);
  const useHint = useRoleplayStore((s) => s.useHint);
  const setNotebookOpen = useRoleplayStore((s) => s.setNotebookOpen);
  const isNotebookOpen = useRoleplayStore((s) => s.isNotebookOpen);
  const setSettingsOpen = useRoleplayStore((s) => s.setSettingsOpen);
  const isSettingsOpen = useRoleplayStore((s) => s.isSettingsOpen);
  const activeDialogue = useRoleplayStore((s) => s.activeDialogue);
  const nextDialogueBubble = useRoleplayStore((s) => s.nextDialogueBubble);

  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Position and rotation kept in refs to avoid 60 FPS re-renders
  const positionRef = useRef(new THREE.Vector3(0, 0, 0.5));
  const rotationYRef = useRef(Math.PI);
  const cameraYawRef = useRef(0);
  const isRightDraggingRef = useRef(false);
  const lastReportedZoneRef = useRef<ZoneId>('ZONE_A');

  // Input states
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture inputs if typing inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.current.sprint = true;

      // Hotbar 1-5
      if (code === 'Digit1') selectSlot(0);
      if (code === 'Digit2') selectSlot(1);
      if (code === 'Digit3') selectSlot(2);
      if (code === 'Digit4') selectSlot(3);
      if (code === 'Digit5') selectSlot(4);

      // Notebook Tab
      if (code === 'Tab') {
        e.preventDefault();
        setNotebookOpen(!isNotebookOpen);
      }

      // Hint H
      if (code === 'KeyH') {
        useHint();
      }

      // Esc
      if (code === 'Escape') {
        setSettingsOpen(!isSettingsOpen);
      }

      // Interact E
      if (code === 'KeyE') {
        if (activeDialogue) {
          nextDialogueBubble();
        } else {
          // Check proximity to stations
          triggerProximityInteraction();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.current.sprint = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    activeDialogue,
    isNotebookOpen,
    isSettingsOpen,
    nextDialogueBubble,
    selectSlot,
    setNotebookOpen,
    setSettingsOpen,
    useHint,
  ]);

  const triggerProximityInteraction = () => {
    const pos = positionRef.current;
    // Check which station is close
    const stations: { zone: ZoneId; x: number; z: number; label: string }[] = [
      { zone: 'ZONE_A', x: 0, z: -1.0, label: 'ผู้จัดการร้าน' },
      { zone: 'ZONE_B', x: -6, z: -8, label: 'สถานีกล้อง IP' },
      { zone: 'ZONE_C', x: 6, z: -8, label: 'ห้องตู้แร็ค PoE Switch' },
      { zone: 'ZONE_D', x: -6, z: 4, label: 'ห้องบันทึก NVR' },
      { zone: 'ZONE_E', x: 6, z: 4, label: 'โต๊ะควบคุม Client PC' },
      { zone: 'ZONE_F', x: 0, z: 9, label: 'โต๊ะเปรียบเทียบ Analog vs IP' },
    ];

    for (const st of stations) {
      const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
      if (dist < 2.6) {
        openStationDialogue(st.zone);
        return;
      }
    }
  };

  useFrame((_, delta) => {
    // If modal/dialogue is open, freeze movement
    if (activeDialogue || isNotebookOpen || isSettingsOpen) {
      setIsMoving(false);
      return;
    }

    const camYaw = cameraYawRef.current;
    const moveDir = getCameraRelativeMove(keys.current, camYaw);
    const moveX = moveDir.x;
    const moveZ = moveDir.z;
    const moving = moveX !== 0 || moveZ !== 0;

    if (moving !== isMoving) setIsMoving(moving);
    const sprinting = keys.current.sprint && moving;
    if (sprinting !== isSprinting) setIsSprinting(sprinting);

    // Camera forward angle on horizontal plane (direction camera is pointing)
    const camForwardX = -Math.sin(camYaw);
    const camForwardZ = -Math.cos(camYaw);
    const camFacingAngle = Math.atan2(camForwardX, camForwardZ);

    if (moving) {
      const speed = sprinting ? 5.8 : 3.4;
      const resolved = moveWithObstacleSliding(
        { x: positionRef.current.x, z: positionRef.current.z },
        { x: moveX * speed * delta, z: moveZ * speed * delta },
        STORE_OBSTACLES,
        0.3,
      );
      positionRef.current.x = resolved.x;
      positionRef.current.z = resolved.z;

      // Clamp store boundaries
      positionRef.current.x = Math.max(
        STORE_BOUNDS.minX,
        Math.min(STORE_BOUNDS.maxX, positionRef.current.x)
      );
      positionRef.current.z = Math.max(
        STORE_BOUNDS.minZ,
        Math.min(STORE_BOUNDS.maxZ, positionRef.current.z)
      );

      // Rotate avatar towards movement direction
      const targetAngle = Math.atan2(moveX, moveZ);
      let diff = targetAngle - rotationYRef.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      rotationYRef.current += diff * Math.min(1, delta * 16);

      // Check current zone checkpoint
      const px = positionRef.current.x;
      const pz = positionRef.current.z;
      let zone: ZoneId = 'ZONE_A';
      if (pz < -5) {
        zone = px < 0 ? 'ZONE_B' : 'ZONE_C';
      } else if (pz > 6) {
        zone = 'ZONE_F';
      } else if (pz >= 1.5 && px < 0) {
        zone = 'ZONE_D';
      } else if (pz >= 1 && px >= 0) {
        zone = 'ZONE_E';
      }

      if (zone !== lastReportedZoneRef.current) {
        lastReportedZoneRef.current = zone;
        setCurrentZone(zone);
      }
    } else {
      // When idle, smoothly rotate avatar to face where the camera is looking
      let diff = camFacingAngle - rotationYRef.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      rotationYRef.current += diff * Math.min(1, delta * 14);
    }

    // Update mesh transform directly
    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(positionRef.current);
      playerGroupRef.current.rotation.y = rotationYRef.current;
    }

    // Check interaction prompt
    const pos = positionRef.current;
    const stations = [
      { zone: 'ZONE_A', x: 0, z: -1.0, name: 'ผู้จัดการร้าน (รับภารกิจ)' },
      { zone: 'ZONE_B', x: -6, z: -8, name: 'สถานีกล้อง IP (กด E คุย/หยิบกล้อง)' },
      { zone: 'ZONE_C', x: 6, z: -8, name: 'ห้องอุปกรณ์เครือข่าย PoE (กด E คุย/หยิบ Switch)' },
      { zone: 'ZONE_D', x: -6, z: 4, name: 'ห้องบันทึกภาพ NVR (กด E คุย/หยิบ NVR)' },
      { zone: 'ZONE_E', x: 6, z: 4, name: 'โต๊ะควบคุม Client PC (กด E คุย/มอนิเตอร์)' },
      { zone: 'ZONE_F', x: 0, z: 9, name: 'โต๊ะเปรียบเทียบ Analog vs IP (กด E สำรวจ)' },
    ];

    let prompt: string | null = null;
    for (const st of stations) {
      const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
      if (dist < 2.6) {
        prompt = `กด [E] สำรวจ: ${st.name}`;
        break;
      }
    }
    setInteractionPrompt(prompt);
  });

  return (
    <>
      <group ref={playerGroupRef} position={[0, 0, 0.5]}>
        <BlockStudentAvatar
          isMoving={isMoving}
          isSprinting={isSprinting}
          carriedItem={carriedItem}
        />
      </group>

      <ThirdPersonCamera
        targetPosition={positionRef.current}
        cameraYawRef={cameraYawRef}
        isRightDraggingRef={isRightDraggingRef}
      />
    </>
  );
};
