import { Raycaster, Vector2, type Camera, type Object3D, type Scene } from 'three';
import type { InteractionTarget } from '../data/types';

export class InteractionSystem {
  private readonly raycaster = new Raycaster();
  private readonly center = new Vector2(0, 0);

  findTarget(scene: Scene, camera: Camera, maxDistance = 3): InteractionTarget | null {
    this.raycaster.setFromCamera(this.center, camera);
    this.raycaster.far = maxDistance;
    const intersections = this.raycaster.intersectObjects(scene.children, true);
    for (const hit of intersections) {
      const source = findInteractionSource(hit.object);
      if (!source) continue;
      return {
        kind: source.userData.interactionKind as InteractionTarget['kind'],
        id: String(source.userData.interactionId),
        name: String(source.userData.interactionName),
        distance: hit.distance,
        equipmentId: source.userData.equipmentId ? String(source.userData.equipmentId) : undefined,
      };
    }
    return null;
  }
}

function findInteractionSource(object: Object3D | null): Object3D | null {
  let current = object;
  while (current) {
    if (current.userData.interactionKind) return current;
    current = current.parent;
  }
  return null;
}
