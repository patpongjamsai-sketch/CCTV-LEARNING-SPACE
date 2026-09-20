'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlockStudentAvatar } from './BlockStudentAvatar';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { useRoleplayStore } from '../../store/useRoleplayStore';
import { useCctvTrainingStore } from '../../store/useCctvTrainingStore';
import { ZoneId } from '../../shared/domain/roleplayTypes';
import {
  getCameraRelativeMove,
  moveWithObstacleSliding,
  getRoomPhysicsConfig,
} from '../../shared/domain/playerMovement';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export interface PlayerControllerProps {
  roomId?: string;
  isRoom102Unlocked?: boolean;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({
  roomId = 'room-101',
  isRoom102Unlocked = false,
}) => {
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

  // Parse room number (101 - 108)
  const roomNumMatch = roomId.match(/(?:room-?|u0?)(\d+)/i);
  let roomNum = roomNumMatch && roomNumMatch[1] ? parseInt(roomNumMatch[1], 10) : 101;
  if (roomNum < 10) roomNum += 100;

  const config = getRoomPhysicsConfig(roomNum, isRoom102Unlocked);
  const positionRef = useRef(new THREE.Vector3(config.spawn.x, 0, config.spawn.z));
  const velocityRef = useRef(new THREE.Vector2(0, 0));
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

  // Reset spawn position when roomId changes
  useEffect(() => {
    const roomConfig = getRoomPhysicsConfig(roomNum, isRoom102Unlocked);
    positionRef.current.set(roomConfig.spawn.x, 0, roomConfig.spawn.z);
    rotationYRef.current = Math.PI; // Face towards tables (-Z)
    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(positionRef.current);
      playerGroupRef.current.rotation.y = rotationYRef.current;
    }
  }, [roomId, roomNum, isRoom102Unlocked]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
        handleInteract();
      }

      // Space to advance dialogue
      if (code === 'Space' && activeDialogue) {
        e.preventDefault();
        nextDialogueBubble();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

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

  const navigateToRoom = (targetRoomId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/labs/3d/${targetRoomId}${window.location.search}`;
    }
  };

  const handleInteract = () => {
    const pos = positionRef.current;

    // Advance dialogue if open
    if (activeDialogue) {
      nextDialogueBubble();
      return;
    }

    // Room 101 Interactions
    if (roomNum === 101) {
      // Exit Door to Room 102 at X = 10.7, Z = 0
      const distToPortal = Math.hypot(pos.x - 10.7, pos.z - 0);
      if (distToPortal < 3.2 && isRoom102Unlocked) {
        navigateToRoom('room-102');
        return;
      }

      // Room 101 Stations (centered at 0, 0)
      const r101Stations: { zone: ZoneId; x: number; z: number }[] = [
        { zone: 'ZONE_A', x: 0, z: -1.0 },
        { zone: 'ZONE_B', x: -6, z: -8.0 },
        { zone: 'ZONE_C', x: 6, z: -8.0 },
        { zone: 'ZONE_D', x: -6, z: 4.0 },
        { zone: 'ZONE_E', x: 6, z: 4.0 },
        { zone: 'ZONE_F', x: 0, z: 9.0 },
      ];

      for (const st of r101Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 2.8) {
          openStationDialogue(st.zone);
          return;
        }
      }
      return;
    }

    // Room 102 Interactions
    if (roomNum === 102) {
      // Portal to Room 101 at X = -10.7, Z = 0
      const distToPrev = Math.hypot(pos.x - (-10.7), pos.z - 0);
      if (distToPrev < 3.2) {
        navigateToRoom('room-101');
        return;
      }

      // Portal to Room 103 at X = 10.7, Z = 0
      const distToNext = Math.hypot(pos.x - 10.7, pos.z - 0);
      if (distToNext < 3.2) {
        navigateToRoom('room-103');
        return;
      }

      // Room 102 Stations
      const r102Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -4 },
        { id: 2, x: 6, z: -4 },
        { id: 3, x: 0, z: 5 },
      ];

      for (const st of r102Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation102Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 103 Stations
    if (roomNum === 103) {
      const r103Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r103Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation103Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 104 Stations
    if (roomNum === 104) {
      const r104Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r104Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation104Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 105 Stations
    if (roomNum === 105) {
      const r105Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r105Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation105Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 106 Stations: Storage Calculation, HDD Management, Cloud P2P
    if (roomNum === 106) {
      const r106Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r106Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation106Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 107 Stations: Troubleshooting, Ground Loop & Preventive Maintenance
    if (roomNum === 107) {
      const r107Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r107Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation107Modal(st.id);
          return;
        }
      }
      return;
    }

    // Room 108 Stations: Capstone CCTV Project (Planning, Commissioning, Handover)
    if (roomNum === 108) {
      const r108Stations: { id: 1 | 2 | 3; x: number; z: number }[] = [
        { id: 1, x: -6, z: -3 },
        { id: 2, x: 0, z: -3 },
        { id: 3, x: 6, z: -3 },
      ];

      for (const st of r108Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          useCctvTrainingStore.getState().setActiveStation108Modal(st.id);
          return;
        }
      }
      return;
    }
  };

  useFrame((_, delta) => {
    const active102Modal = useCctvTrainingStore.getState().activeStation102Modal;
    const active103Modal = useCctvTrainingStore.getState().activeStation103Modal;
    const active104Modal = useCctvTrainingStore.getState().activeStation104Modal;
    const active105Modal = useCctvTrainingStore.getState().activeStation105Modal;
    const active106Modal = useCctvTrainingStore.getState().activeStation106Modal;
    const active107Modal = useCctvTrainingStore.getState().activeStation107Modal;
    const active108Modal = useCctvTrainingStore.getState().activeStation108Modal;
    if (
      activeDialogue ||
      isNotebookOpen ||
      isSettingsOpen ||
      active102Modal !== null ||
      active103Modal !== null ||
      active104Modal !== null ||
      active105Modal !== null ||
      active106Modal !== null ||
      active107Modal !== null ||
      active108Modal !== null
    ) {
      setIsMoving(false);
      velocityRef.current.set(0, 0);
      return;
    }

    const safeDelta = Math.min(delta, 0.04);
    const camYaw = cameraYawRef.current;
    const moveDir = getCameraRelativeMove(keys.current, camYaw);
    const moveX = moveDir.x;
    const moveZ = moveDir.z;
    const moving = moveX !== 0 || moveZ !== 0;

    if (moving !== isMoving) setIsMoving(moving);
    const sprinting = keys.current.sprint && moving;
    if (sprinting !== isSprinting) setIsSprinting(sprinting);

    const speed = sprinting ? 5.8 : 3.4;
    const targetVx = moveX * speed;
    const targetVz = moveZ * speed;

    // Smooth velocity interpolation
    const accel = moving ? 18 : 16;
    velocityRef.current.x += (targetVx - velocityRef.current.x) * Math.min(1, safeDelta * accel);
    velocityRef.current.y += (targetVz - velocityRef.current.y) * Math.min(1, safeDelta * accel);

    const currentSpeedSq =
      velocityRef.current.x * velocityRef.current.x + velocityRef.current.y * velocityRef.current.y;

    if (currentSpeedSq > 0.0001) {
      const roomPhysics = getRoomPhysicsConfig(roomNum, isRoom102Unlocked);
      const resolved = moveWithObstacleSliding(
        { x: positionRef.current.x, z: positionRef.current.z },
        { x: velocityRef.current.x * safeDelta, z: velocityRef.current.y * safeDelta },
        roomPhysics.obstacles,
        0.35
      );
      positionRef.current.x = resolved.x;
      positionRef.current.z = resolved.z;

      // Clamp to room bounds
      positionRef.current.x = Math.max(
        roomPhysics.bounds.minX,
        Math.min(roomPhysics.bounds.maxX, positionRef.current.x)
      );
      positionRef.current.z = Math.max(
        roomPhysics.bounds.minZ,
        Math.min(roomPhysics.bounds.maxZ, positionRef.current.z)
      );

      // Rotate avatar towards movement direction
      if (moving) {
        const targetAngle = Math.atan2(moveX, moveZ);
        let diff = targetAngle - rotationYRef.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        rotationYRef.current += diff * Math.min(1, safeDelta * 16);
      }

      // Check current zone checkpoint in Room 101 (centered around 0, 0)
      if (roomNum === 101) {
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
      }
    } else {
      const camForwardX = -Math.sin(camYaw);
      const camForwardZ = -Math.cos(camYaw);
      const camFacingAngle = Math.atan2(camForwardX, camForwardZ);
      let diff = camFacingAngle - rotationYRef.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      rotationYRef.current += diff * Math.min(1, safeDelta * 14);
    }

    // Update mesh transform directly
    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(positionRef.current);
      playerGroupRef.current.rotation.y = rotationYRef.current;
    }

    // Check interaction prompt
    const pos = positionRef.current;
    let prompt: string | null = null;

    if (roomNum === 101) {
      const distToExit = Math.hypot(pos.x - 10.7, pos.z - 0);
      if (distToExit < 3.2) {
        if (!isRoom102Unlocked) {
          prompt = '🔒 ประตูเชื่อมต่อ Room 102 ล็อก: ต้องผ่านภารกิจ Room 101 ก่อน (คะแนน >= 80)';
        } else {
          prompt = '🚪 กด [E] เพื่อเข้าสู่ Room 102: Smart School Lab';
        }
      } else {
        const stations = [
          { x: 0, z: -1.0, name: 'เคาน์เตอร์สรุปงาน / ผู้จัดการ (รับภารกิจ)' },
          { x: -6, z: -8.0, name: 'สถานีทดสอบกล้องวงจรปิด IP (กด E คุย/หยิบกล้อง)' },
          { x: 6, z: -8.0, name: 'ห้องอุปกรณ์เครือข่าย PoE Switch (กด E คุย/หยิบ Switch)' },
          { x: -6, z: 4.0, name: 'ห้องบันทึกภาพ NVR (กด E คุย/หยิบ NVR)' },
          { x: 6, z: 4.0, name: 'โต๊ะคอมพิวเตอร์ควบคุม Client PC (กด E คุย/มอนิเตอร์)' },
          { x: 0, z: 9.0, name: 'โต๊ะเปรียบเทียบระบบ Analog vs IP (กด E สำรวจ)' },
        ];

        for (const st of stations) {
          const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
          if (dist < 2.8) {
            prompt = `กด [E] สำรวจ: ${st.name}`;
            break;
          }
        }
      }
    } else if (roomNum === 102) {
      const distToPrev = Math.hypot(pos.x - (-10.7), pos.z - 0);
      const distToNext = Math.hypot(pos.x - 10.7, pos.z - 0);

      if (distToPrev < 3.2) {
        prompt = '🚪 กด [E] กลับไปยัง Room 101: Smart Mart';
      } else if (distToNext < 3.2) {
        prompt = '🚪 กด [E] ไปยัง Room 103: Cabling Lab';
      } else {
        const r102Stations = [
          { id: 1, x: -6, z: -4, name: 'Station 1: ผังภายนอก Smart School' },
          { id: 2, x: 6, z: -4, name: 'Station 2: ผังภายใน Smart School & IK10' },
          { id: 3, x: 0, z: 5, name: 'Station 3: วิเคราะห์ปัญหาหน้างาน & พิมพ์ตอบ' },
        ];
        for (const st of r102Stations) {
          const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
          if (dist < 3.0) {
            prompt = `กด [E] สำรวจ: ${st.name}`;
            break;
          }
        }
      }
    } else if (roomNum === 103) {
      const r103Stations = [
        { id: 1, x: -6, z: -3, name: 'โต๊ะที่ 1: เข้าหัวสาย RJ45 T568B & BNC (35 คะแนน)' },
        { id: 2, x: 0, z: -3, name: 'โต๊ะที่ 2: เลือกสายสัญญาณ 5 จุดติดตั้ง (35 คะแนน)' },
        { id: 3, x: 6, z: -3, name: 'โต๊ะที่ 3: ตรวจสอบสายและคำนวณ PoE (30 คะแนน)' },
      ];
      for (const st of r103Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          prompt = `กด [E] หรือคลิก: ${st.name}`;
          break;
        }
      }
    } else if (roomNum === 104) {
      const r104Stations = [
        { id: 1, x: -6, z: -3, name: 'โต๊ะที่ 1: วางแผน IP Address Table (35 คะแนน)' },
        { id: 2, x: 0, z: -3, name: 'โต๊ะที่ 2: ตั้งค่าอุปกรณ์ & PoE Budget (35 คะแนน)' },
        { id: 3, x: 6, z: -3, name: 'โต๊ะที่ 3: วิเคราะห์ปัญหา 10 ขั้นตอน (30 คะแนน)' },
      ];
      for (const st of r104Stations) {
        const dist = Math.hypot(pos.x - st.x, pos.z - st.z);
        if (dist < 3.2) {
          prompt = `กด [E] หรือคลิก: ${st.name}`;
          break;
        }
      }
    }

    setInteractionPrompt(prompt);
  });

  return (
    <>
      <group ref={playerGroupRef} position={[config.spawn.x, 0, config.spawn.z]}>
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
