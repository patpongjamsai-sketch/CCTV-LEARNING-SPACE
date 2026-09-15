import { describe, expect, it } from 'vitest';
import { getKeyboardZoomDistance } from '../shared/domain/cameraControls';

describe('keyboard camera zoom', () => {
  it('zooms in with Equal or PageUp and zooms out with Minus or PageDown', () => {
    expect(getKeyboardZoomDistance(4, 'Equal')).toBe(3.6);
    expect(getKeyboardZoomDistance(4, 'PageUp')).toBe(3.6);
    expect(getKeyboardZoomDistance(4, 'Minus')).toBe(4.4);
    expect(getKeyboardZoomDistance(4, 'PageDown')).toBe(4.4);
  });

  it('keeps keyboard zoom inside the supported 1.8 to 6.2 metre range', () => {
    expect(getKeyboardZoomDistance(1.9, 'Equal')).toBe(1.8);
    expect(getKeyboardZoomDistance(6.1, 'Minus')).toBe(6.2);
  });

  it('does not change distance for unrelated keys', () => {
    expect(getKeyboardZoomDistance(4, 'KeyW')).toBe(4);
  });
});
