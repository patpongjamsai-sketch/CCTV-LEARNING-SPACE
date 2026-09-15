import RAPIER from '@dimforge/rapier3d-compat';
import type { Vector3 } from 'three';

export interface StaticBox {
  x: number; y: number; z: number;
  width: number; height: number; depth: number;
  tag?: string;
}

export class PhysicsWorld {
  readonly world: RAPIER.World;
  private readonly body: RAPIER.RigidBody;
  private readonly collider: RAPIER.Collider;
  private readonly controller: RAPIER.KinematicCharacterController;
  private readonly roomDoors = new Map<number, RAPIER.Collider>();

  constructor(spawn: { x: number; y: number; z: number }) {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
    );
    this.collider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.62, 0.34).setFriction(0), this.body,
    );
    this.controller = this.world.createCharacterController(0.02);
    this.controller.enableSnapToGround(0.25);
    this.controller.setMaxSlopeClimbAngle(45 * Math.PI / 180);
    this.controller.setMinSlopeSlideAngle(55 * Math.PI / 180);
  }

  addStaticBox(box: StaticBox): void {
    const rigidBody = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(box.x, box.y, box.z),
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(box.width / 2, box.height / 2, box.depth / 2), rigidBody,
    );
    const room = box.tag === 'door102' ? 102 : Number(box.tag?.match(/^door:(\d+)$/)?.[1]);
    if (Number.isInteger(room)) this.roomDoors.set(room, collider);
  }

  unlockRoom102(): void {
    this.unlockRoom(102);
  }

  unlockRoom(room: number): boolean {
    const collider = this.roomDoors.get(room);
    if (!collider) return false;
    this.world.removeCollider(collider, true);
    this.roomDoors.delete(room);
    return true;
  }

  move(desired: Vector3): void {
    this.controller.computeColliderMovement(this.collider, desired);
    const movement = this.controller.computedMovement();
    const current = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: current.x + movement.x,
      y: current.y + movement.y,
      z: current.z + movement.z,
    });
  }

  teleport(position: { x: number; y: number; z: number }): void {
    this.body.setTranslation(position, true);
    this.body.setNextKinematicTranslation(position);
  }

  step(): void {
    this.world.step();
  }

  get position(): { x: number; y: number; z: number } {
    return this.body.translation();
  }
}
