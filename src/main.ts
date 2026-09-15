import RAPIER from '@dimforge/rapier3d-compat';
import { equipmentById, requiredEquipment } from './data/equipment';
import { learningQuestions } from './data/questions';
import type { InteractionTarget } from './data/types';
import { InputManager } from './game/InputManager';
import { InteractionSystem } from './game/InteractionSystem';
import { PlayerController } from './game/PlayerController';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { SceneManager } from './render/SceneManager';
import { GameStore, createDefaultGameState } from './simulation/GameState';
import { MissionEngine } from './simulation/MissionEngine';
import { SaveSystem } from './simulation/SaveSystem';
import { UIController } from './ui/UIController';

declare global {
  interface Window {
    __CCTV_DEBUG__?: {
      completeMission: () => void;
      completeRoom102: () => void;
      showInspector: (id?: string) => void;
      showCoverage: () => void;
      showInventory: () => void;
      showMission: () => void;
      goRoom101: () => void;
      goRoom102: () => void;
      pickupCamera: () => void;
      snapshot: () => unknown;
    };
  }
}

async function bootstrap(): Promise<void> {
  await RAPIER.init();
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const save = new SaveSystem(window.localStorage);
  const store = new GameStore(save.load());
  const mission = new MissionEngine(store);
  const scene = new SceneManager(canvas);
  const physics = new PhysicsWorld({ x: 0, y: 1, z: 9 });
  scene.staticBoxes.forEach((box) => physics.addStaticBox(box));
  store.snapshot.unlockedRooms.filter((room) => room >= 102).forEach((room) => {
    scene.unlockRoom(room);
    physics.unlockRoom(room);
  });

  const input = new InputManager(canvas);
  const player = new PlayerController(scene.camera, input, physics);
  const interactions = new InteractionSystem();
  let started = false;
  let target: InteractionTarget | null = null;
  let debugVisible = false;
  let frames = 0;
  let fps = 0;
  let fpsAt = performance.now();
  let releaseForUi = false;

  const requestLock = (): void => {
    if (!started || ui.hasOpenPanel) return;
    void canvas.requestPointerLock().catch(() => ui.toast('คลิกบนพื้นที่เกมอีกครั้งเพื่อควบคุมมุมมอง'));
  };
  const releaseLock = (): void => {
    releaseForUi = true;
    input.enabled = false;
    if (document.pointerLockElement) document.exitPointerLock();
  };
  const ui = new UIController(store, mission, {
    resume: requestLock,
    close: releaseLock,
    reset: () => {
      save.clear();
      store.replace(createDefaultGameState());
      window.location.reload();
    },
    evaluate: () => {
      const missionId = store.snapshot.currentMission;
      const result = mission.evaluate();
      if (result.passed) {
        const nextRoom = missionId === 'F1-M101' ? 102 : missionId === 'F1-M102' ? 103 : null;
        if (nextRoom) { scene.unlockRoom(nextRoom); physics.unlockRoom(nextRoom); }
        sendCompletion(missionId, store.snapshot.missionResults[missionId]);
      }
      return result;
    },
  });

  store.subscribe((state) => save.save(state));
  for (const id of Object.keys(store.snapshot.inventory)) scene.setEquipmentVisible(id, false);

  document.getElementById('startButton')?.addEventListener('click', () => {
    started = true;
    mission.start();
    ui.startHud();
    player.faceRoom101();
    requestLock();
  });
  canvas.addEventListener('click', requestLock);
  document.addEventListener('pointerlockchange', () => {
    input.enabled = document.pointerLockElement === canvas;
    if (input.enabled) {
      releaseForUi = false;
      input.clearActions();
    } else if (started && !releaseForUi && !ui.hasOpenPanel) {
      ui.openPause();
    }
  });
  window.addEventListener('resize', () => scene.resize());

  window.__CCTV_DEBUG__ = {
    completeMission: () => {
      mission.start('F1-M101');
      requiredEquipment.forEach((item) => mission.inspectEquipment(item.id));
      mission.pickupEquipment('ip_camera_4mp');
      mission.placeEquipment('ip_camera_4mp', 'inspection_pad');
      learningQuestions.filter((question) => !question.id.startsWith('q102_')).forEach((question) => mission.answerQuestion(question.id, question.answer));
      const result = mission.evaluate();
      scene.placeEquipmentOnBench('ip_camera_4mp');
      if (result.passed) { scene.unlockRoom(102); physics.unlockRoom(102); sendCompletion('F1-M101', store.snapshot.missionResults['F1-M101']); }
      ui.showResult(result);
    },
    completeRoom102: () => {
      if (!store.snapshot.unlockedRooms.includes(102)) store.update((state) => state.unlockedRooms.push(102));
      scene.unlockRoom(102);
      physics.unlockRoom(102);
      mission.start('F1-M102');
      ['dome_camera', 'bullet_camera', 'ptz_camera'].forEach((id) => mission.inspectEquipment(id));
      mission.recordAction('test:r102:coverage_preview');
      learningQuestions.filter((question) => question.id.startsWith('q102_')).forEach((question) => mission.answerQuestion(question.id, question.answer));
      const result = mission.evaluate();
      if (result.passed) { scene.unlockRoom(103); physics.unlockRoom(103); sendCompletion('F1-M102', store.snapshot.missionResults['F1-M102']); }
      ui.showResult(result);
    },
    showInspector: (id = 'ip_camera_4mp') => { mission.inspectEquipment(id); ui.openInspector(id); },
    showInventory: () => ui.openInventory(),
    showMission: () => ui.openMission(),
    showCoverage: () => { mission.start('F1-M102'); ui.openCoveragePreview(); },
    goRoom101: () => {
      ui.closePanels(false);
      physics.teleport({ x: -15.2, y: 1, z: -3.7 });
      player.faceRoom101();
      player.syncCamera();
    },
    goRoom102: () => {
      ui.closePanels(false);
      physics.teleport({ x: -7.6, y: 1, z: -4.1 });
      player.faceRoom101();
      player.syncCamera();
    },
    pickupCamera: () => {
      if (mission.pickupEquipment('ip_camera_4mp')) scene.setEquipmentVisible('ip_camera_4mp', false);
    },
    snapshot: () => structuredClone(store.snapshot),
  };

  ui.showStart();
  player.syncCamera();
  let accumulator = 0;
  let previous = performance.now();
  const fixedStep = 1 / 60;

  const loop = (now: number): void => {
    requestAnimationFrame(loop);
    const frameDt = Math.min(0.1, (now - previous) / 1000);
    previous = now;
    accumulator += frameDt;

    if (started && input.enabled && !ui.hasOpenPanel) {
      while (accumulator >= fixedStep) {
        player.update(fixedStep);
        physics.step();
        accumulator -= fixedStep;
      }
      player.syncCamera();
      target = interactions.findTarget(scene.scene, scene.camera);
      ui.setPrompt(target ? promptFor(target, store.snapshot.inventory['ip_camera_4mp'] !== undefined) : null);
      handleActions(input, target, mission, scene, ui);
      const position = physics.position;
      const room = getRoom(position.x, position.z);
      if (room === 'ROOM 102' && store.snapshot.currentMission !== 'F1-M102' && store.snapshot.unlockedRooms.includes(102)) mission.start('F1-M102');
      ui.setRoom(room);
    } else {
      accumulator = 0;
      ui.setPrompt(null);
    }

    if (input.consume('Backquote')) debugVisible = !debugVisible;
    frames += 1;
    if (now - fpsAt >= 500) {
      fps = Math.round(frames * 1000 / (now - fpsAt));
      frames = 0;
      fpsAt = now;
    }
    const p = physics.position;
    ui.setDebug(`FPS: ${fps}\nPosition: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}\nRoom: ${getRoom(p.x, p.z)}\nRaycast: ${target?.id ?? '-'}\nCollision: Rapier KCC\nObjectives: ${store.snapshot.completedObjectives.length}`, debugVisible);
    scene.render();
  };
  requestAnimationFrame(loop);
}

function handleActions(input: InputManager, target: InteractionTarget | null, mission: MissionEngine, scene: SceneManager, ui: UIController): void {
  if (input.consume('KeyI')) return ui.openInventory();
  if (input.consume('Tab')) return ui.openMission();
  if (input.consume('KeyV') && target?.kind === 'equipment') {
    if (target.id.startsWith('r102:')) mission.start('F1-M102');
    mission.inspectEquipment(target.equipmentId ?? target.id);
    return ui.openInspector(target.equipmentId ?? target.id);
  }
  if (input.consume('KeyV') && target?.kind === 'preview') return ui.openCoveragePreview();
  if (input.consume('Escape')) return ui.openPause();
  if (!target) return;
  if (input.consume('KeyE')) {
    if (target.kind === 'equipment') {
      if (target.id.startsWith('r102:')) mission.start('F1-M102');
      const equipmentId = target.equipmentId ?? target.id;
      mission.inspectEquipment(equipmentId);
      return ui.openInspector(equipmentId);
    }
    if (target.kind === 'preview') { mission.start('F1-M102'); return ui.openCoveragePreview(); }
    if (target.kind === 'terminal') return ui.openMission();
    if (target.kind === 'door') return ui.toast(Number(target.id) === 102 ? 'Room 102 ปลดล็อกเมื่อผ่าน F1-M101' : `Room ${target.id} จะเปิดใน Iteration ถัดไป`);
  }
  if (input.consume('KeyF')) {
    if (target.kind === 'equipment') {
      if (target.id.startsWith('r102:')) return ui.toast('สถานี Room 102 ใช้สำหรับ Inspect และวิเคราะห์ ไม่ต้องหยิบอุปกรณ์');
      if (mission.pickupEquipment(target.id)) {
        scene.setEquipmentVisible(target.id, false);
        ui.toast(`เก็บ ${equipmentById.get(target.id)?.name ?? target.name} เข้ากระเป๋าแล้ว`);
      } else ui.toast('อุปกรณ์นี้หยิบไม่ได้หรืออยู่ในกระเป๋าแล้ว');
    }
    if (target.kind === 'place-target') {
      if (mission.placeEquipment('ip_camera_4mp', 'inspection_pad')) {
        scene.placeEquipmentOnBench('ip_camera_4mp');
        ui.toast('วาง IP Camera บน Inspection Bench สำเร็จ');
      } else ui.toast('ต้องมี IP Camera ในกระเป๋าก่อน');
    }
  }
}

function promptFor(target: InteractionTarget, hasCamera: boolean): string {
  if (target.kind === 'equipment') return target.id.startsWith('r102:')
    ? `<kbd>[E]</kbd> Inspect ${target.name}`
    : `<kbd>[E]</kbd> Inspect ${target.name} · <kbd>[F]</kbd> Pick up`;
  if (target.kind === 'preview') return '<kbd>[E/V]</kbd> เปิด Coverage Preview';
  if (target.kind === 'place-target') return hasCamera ? '<kbd>[F]</kbd> วาง IP Camera บน Inspection Bench' : '<kbd>[E]</kbd> Inspection Bench';
  return `<kbd>[E]</kbd> ${target.name}`;
}

function getRoom(x: number, z: number): string {
  if (z > 5) return 'LOBBY';
  if (z > -3) return 'CORRIDOR';
  const centers = [-15.2, -7.6, 0, 7.6, 15.2];
  let nearest = 0;
  centers.forEach((center, index) => { if (Math.abs(x - center) < Math.abs(x - centers[nearest]!)) nearest = index; });
  return `ROOM ${101 + nearest}`;
}

function sendCompletion(missionId: string, result: { score: number; bestScore: number; attemptCount: number; completionTime: number } | undefined): void {
  if (!result) return;
  const message = { type: 'cctv-training/mission-completed', version: 1, missionId, completed: true, score: result.score, bestScore: result.bestScore, attemptCount: result.attemptCount, completionTime: result.completionTime };
  if (window.opener) window.opener.postMessage(message, '*');
  if (window.parent !== window) window.parent.postMessage(message, '*');
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  const loading = document.getElementById('loadingScreen');
  if (loading) loading.innerHTML = '<div class="start-card"><h1>ไม่สามารถเริ่มเกมได้</h1><p>กรุณาเปิด Console เพื่อตรวจรายละเอียด หรือลอง Refresh อีกครั้ง</p></div>';
});
