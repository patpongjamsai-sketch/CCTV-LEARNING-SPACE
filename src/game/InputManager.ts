export class InputManager {
  private readonly keys = new Set<string>();
  private readonly pressed = new Set<string>();
  private mouseX = 0;
  private mouseY = 0;
  enabled = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Tab') event.preventDefault();
      if (!event.repeat) this.pressed.add(event.code);
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== this.canvas) return;
      this.mouseX += event.movementX;
      this.mouseY += event.movementY;
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  isDown(code: string): boolean {
    return this.enabled && this.keys.has(code);
  }

  consume(code: string): boolean {
    if (!this.pressed.has(code)) return false;
    this.pressed.delete(code);
    return true;
  }

  consumeLook(): { x: number; y: number } {
    const delta = { x: this.mouseX, y: this.mouseY };
    this.mouseX = 0;
    this.mouseY = 0;
    return delta;
  }

  clearActions(): void {
    this.pressed.clear();
  }
}
