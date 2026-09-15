import { Euler, PerspectiveCamera, Vector3 } from 'three';
import { InputManager } from './InputManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class PlayerController {
  private yaw = 0;
  private pitch = 0;
  private readonly movement = new Vector3();
  private readonly euler = new Euler(0, 0, 0, 'YXZ');

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly input: InputManager,
    private readonly physics: PhysicsWorld,
  ) {}

  update(dt: number): void {
    const look = this.input.consumeLook();
    this.yaw -= look.x * 0.0022;
    this.pitch = Math.max(-1.35, Math.min(1.35, this.pitch - look.y * 0.0022));
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);

    let forward = 0;
    let strafe = 0;
    if (this.input.isDown('KeyW')) forward -= 1;
    if (this.input.isDown('KeyS')) forward += 1;
    if (this.input.isDown('KeyA')) strafe -= 1;
    if (this.input.isDown('KeyD')) strafe += 1;
    this.movement.set(strafe, -2.4 * dt, forward);
    if (strafe || forward) {
      this.movement.setLength(3.8 * dt);
      this.movement.y = -2.4 * dt;
      this.movement.applyAxisAngle(new Vector3(0, 1, 0), this.yaw);
    }
    this.physics.move(this.movement);
  }

  syncCamera(): void {
    const position = this.physics.position;
    this.camera.position.set(position.x, position.y + 0.55, position.z);
  }

  faceRoom101(): void {
    this.yaw = 0;
    this.pitch = 0;
  }
}
