import * as THREE from 'three';
import { equipmentCatalog, equipmentById, room102Stations } from '../data/equipment';
import type { EquipmentDefinition } from '../data/types';
import type { StaticBox } from '../physics/PhysicsWorld';

const ROOM_CENTERS = [-15.2, -7.6, 0, 7.6, 15.2];

export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(72, 1, 0.05, 120);
  readonly renderer: THREE.WebGLRenderer;
  readonly staticBoxes: StaticBox[] = [];
  private readonly equipmentObjects = new Map<string, THREE.Group>();
  private readonly roomDoors = new Map<number, THREE.Mesh>();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.background = new THREE.Color(0x07141c);
    this.scene.fog = new THREE.Fog(0x07141c, 22, 55);
    this.buildEnvironment();
    this.buildEquipment();
    this.buildRoom102();
    this.resize();
  }

  private buildEnvironment(): void {
    const hemi = new THREE.HemisphereLight(0xbcecff, 0x18303a, 1.8);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 15, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    this.scene.add(sun);

    this.addStatic(new THREE.Vector3(0, -0.25, 1), new THREE.Vector3(40, 0.5, 29), 0x183542);
    this.addStatic(new THREE.Vector3(-20, 1.5, 1), new THREE.Vector3(0.4, 3.5, 29), 0x315a68);
    this.addStatic(new THREE.Vector3(20, 1.5, 1), new THREE.Vector3(0.4, 3.5, 29), 0x315a68);
    this.addStatic(new THREE.Vector3(0, 1.5, -13), new THREE.Vector3(40, 3.5, 0.4), 0x315a68);
    this.addStatic(new THREE.Vector3(0, 1.5, 15), new THREE.Vector3(40, 3.5, 0.4), 0x315a68);

    // ผนังหน้าห้องแบ่งเป็นช่วง เพื่อเหลือช่องประตูแต่ละห้อง
    for (let index = 0; index <= 5; index += 1) {
      const x = -19 + index * 7.6;
      this.addStatic(new THREE.Vector3(x, 1.5, -3), new THREE.Vector3(5.2, 3.5, 0.35), 0x2a5360);
    }
    for (let index = 0; index < 4; index += 1) {
      const x = -11.4 + index * 7.6;
      this.addStatic(new THREE.Vector3(x, 1.5, -8), new THREE.Vector3(0.3, 3.5, 10), 0x2a5360);
    }

    ROOM_CENTERS.forEach((x, index) => {
      const room = 101 + index;
      const color = room === 101 ? 0x28d6a2 : room === 102 ? 0xf4b942 : 0xe5534b;
      this.addRoomSign(x, -2.72, `ROOM ${room}`, color);
      if (room >= 102) this.addDoor(x, room, room === 102 ? 0xf4b942 : 0xe5534b, true);
    });

    const desk = this.addStatic(new THREE.Vector3(0, 0.55, 10.8), new THREE.Vector3(5, 1.1, 1.3), 0x204c5a);
    desk.userData = { interactionKind: 'terminal', interactionId: 'reception', interactionName: 'Reception Terminal' };
    this.addLabel('RECEPTION · รับภารกิจ', new THREE.Vector3(0, 1.65, 10.7), 0x59e6bd, 2.5);

    const bench = this.addStatic(new THREE.Vector3(-15.2, 0.48, -11.2), new THREE.Vector3(3.5, 0.95, 1.1), 0x5d4a35);
    bench.userData = { interactionKind: 'place-target', interactionId: 'inspection_pad', interactionName: 'Inspection Bench' };
    this.addLabel('INSPECTION BENCH · วางด้วย F', new THREE.Vector3(-15.2, 1.35, -11.1), 0xf4b942, 2.4);

    for (const z of [5, 0]) {
      const line = this.makeBlock(new THREE.Vector3(0, 0.012, z), new THREE.Vector3(38, 0.02, 0.05), 0x2f6574);
      this.scene.add(line);
    }
  }

  private buildEquipment(): void {
    equipmentCatalog.forEach((item, index) => {
      const col = index % 6;
      const row = Math.floor(index / 6);
      const x = -18.2 + col * 1.22;
      const z = -5.2 - row * 2.25;
      const group = this.createEquipmentPlaceholder(item);
      group.position.set(x, 0.75, z);
      group.userData = { interactionKind: 'equipment', interactionId: item.id, interactionName: item.name };
      this.scene.add(group);
      this.equipmentObjects.set(item.id, group);
      this.addLabel(item.name, new THREE.Vector3(x, 1.48, z), item.required ? 0x59e6bd : 0xb7c7cf, 0.9);
      const pedestal = this.addStatic(new THREE.Vector3(x, 0.34, z), new THREE.Vector3(1.05, 0.68, 0.9), item.required ? 0x1b5260 : 0x273f48);
      pedestal.name = `pedestal:${item.id}`;
    });
  }

  private buildRoom102(): void {
    this.addLabel('CAMERA SELECTION LAB', new THREE.Vector3(-7.6, 2.75, -12.6), 0xf4b942, 2.8);
    room102Stations.forEach((station) => {
      const position = new THREE.Vector3(station.position.x, station.position.y, station.position.z);
      if (station.kind === 'equipment' && station.equipmentId) {
        const equipment = equipmentById.get(station.equipmentId);
        if (!equipment) return;
        const group = this.createEquipmentPlaceholder(equipment);
        group.position.copy(position);
        group.userData = {
          interactionKind: 'equipment', interactionId: station.id,
          interactionName: station.name, equipmentId: station.equipmentId,
        };
        this.scene.add(group);
        this.addLabel(equipment.name, position.clone().add(new THREE.Vector3(0, 0.85, 0)), 0xf4b942, 1.35);
        this.addStatic(new THREE.Vector3(position.x, 0.34, position.z), new THREE.Vector3(1.55, 0.68, 1.2), 0x604d28);
        return;
      }
      const console = this.addStatic(position, new THREE.Vector3(3.8, 1.6, 0.55), 0x173f55);
      console.userData = { interactionKind: 'preview', interactionId: station.id, interactionName: station.name };
      const screen = this.makeBlock(position.clone().add(new THREE.Vector3(0, 0.2, 0.3)), new THREE.Vector3(3.2, 1.05, 0.05), 0x35c9b7);
      screen.userData = console.userData;
      this.scene.add(screen);
      this.addLabel('V · COVERAGE PREVIEW', position.clone().add(new THREE.Vector3(0, 1.15, 0)), 0x59e6bd, 2.5);
    });
  }

  private createEquipmentPlaceholder(item: EquipmentDefinition): THREE.Group {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: item.system === 'IP' ? 0x5ce1c3 : item.system === 'Analog' ? 0xffb54d : 0xc6d4da, roughness: 0.46 });
    let geometry: THREE.BufferGeometry;
    switch (item.placeholderShape) {
      case 'camera': geometry = new THREE.CylinderGeometry(0.28, 0.34, 0.42, 16); break;
      case 'disk': geometry = new THREE.BoxGeometry(0.55, 0.12, 0.42); break;
      case 'cable': geometry = new THREE.TorusGeometry(0.28, 0.08, 10, 24); break;
      case 'connector': geometry = new THREE.BoxGeometry(0.22, 0.16, 0.32); break;
      case 'monitor': geometry = new THREE.BoxGeometry(0.72, 0.48, 0.08); break;
      case 'power': geometry = new THREE.BoxGeometry(0.55, 0.45, 0.48); break;
      default: geometry = new THREE.BoxGeometry(0.65, 0.24, 0.48);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.25;
    mesh.castShadow = true;
    group.add(mesh);
    const marker = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.42, 24), new THREE.MeshBasicMaterial({ color: item.required ? 0x59e6bd : 0x627985, side: THREE.DoubleSide }));
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = -0.39;
    group.add(marker);
    return group;
  }

  setEquipmentVisible(id: string, visible: boolean): void {
    const object = this.equipmentObjects.get(id);
    if (object) object.visible = visible;
  }

  placeEquipmentOnBench(id: string): void {
    const object = this.equipmentObjects.get(id);
    if (!object) return;
    object.visible = true;
    object.position.set(-15.2, 1.05, -11.15);
  }

  unlockRoom102(): void {
    this.unlockRoom(102);
  }

  unlockRoom(room: number): boolean {
    const door = this.roomDoors.get(room);
    if (!door) return false;
    door.visible = false;
    this.roomDoors.delete(room);
    return true;
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private addDoor(x: number, room: number, color: number, locked: boolean): void {
    const door = this.makeBlock(new THREE.Vector3(x, 1.5, -3), new THREE.Vector3(2.4, 3, 0.22), color);
    door.userData = { interactionKind: 'door', interactionId: String(room), interactionName: `Room ${room}` };
    this.scene.add(door);
    this.roomDoors.set(room, door);
    if (locked) this.staticBoxes.push({ x, y: 1.5, z: -3, width: 2.4, height: 3, depth: 0.22, tag: `door:${room}` });
  }

  private addStatic(position: THREE.Vector3, size: THREE.Vector3, color: number): THREE.Mesh {
    const mesh = this.makeBlock(position, size, color);
    this.scene.add(mesh);
    this.staticBoxes.push({ x: position.x, y: position.y, z: position.z, width: size.x, height: size.y, depth: size.z });
    return mesh;
  }

  private makeBlock(position: THREE.Vector3, size: THREE.Vector3, color: number): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshStandardMaterial({ color, roughness: 0.75 }));
    mesh.position.copy(position);
    mesh.receiveShadow = true;
    mesh.castShadow = size.y > 0.6;
    return mesh;
  }

  private addRoomSign(x: number, z: number, text: string, color: number): void {
    this.addLabel(text, new THREE.Vector3(x, 3.15, z), color, 2.1);
  }

  private addLabel(text: string, position: THREE.Vector3, color: number, width: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(5,18,25,.88)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.lineWidth = 8;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = '#f4fbff';
    context.font = '600 34px Kanit, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
    sprite.position.copy(position);
    sprite.scale.set(width, width / 6, 1);
    this.scene.add(sprite);
  }
}
