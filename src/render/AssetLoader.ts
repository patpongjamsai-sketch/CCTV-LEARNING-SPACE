import type { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { EquipmentDefinition } from '../data/types';

/**
 * จุดเชื่อมสำหรับแทน Placeholder ด้วย GLB ใน Iteration ถัดไป
 * V0.1 ยังไม่มีไฟล์ GLB จึงคืนวัตถุจาก factory ทุกครั้ง
 */
export class AssetLoader {
  private readonly gltf = new GLTFLoader();

  constructor(private readonly urls: Readonly<Record<string, string>> = {}) {}

  async loadEquipment(item: EquipmentDefinition, fallback: () => Object3D): Promise<Object3D> {
    const url = this.urls[item.assetKey];
    if (!url) return fallback();
    try {
      const result = await this.gltf.loadAsync(url);
      return result.scene;
    } catch (error) {
      console.warn(`ใช้ Placeholder แทน Asset ${item.assetKey}`, error);
      return fallback();
    }
  }
}
