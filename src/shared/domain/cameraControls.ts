export const MIN_CAMERA_DISTANCE = 1.8;
export const MAX_CAMERA_DISTANCE = 6.2;
export const KEYBOARD_ZOOM_STEP = 0.4;

export function clampCameraDistance(distance: number): number {
  return Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, distance));
}

export function getKeyboardZoomDistance(currentDistance: number, code: string): number {
  if (code === 'Equal' || code === 'PageUp' || code === 'BracketLeft') {
    return clampCameraDistance(currentDistance - KEYBOARD_ZOOM_STEP);
  }
  if (code === 'Minus' || code === 'PageDown' || code === 'BracketRight') {
    return clampCameraDistance(currentDistance + KEYBOARD_ZOOM_STEP);
  }
  return currentDistance;
}
