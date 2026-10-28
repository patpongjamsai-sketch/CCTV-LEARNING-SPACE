'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type DirectionKeys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export function VirtualJoystick() {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const activeKeys = useRef<DirectionKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const baseRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number | null>(null);

  // Detect touch / coarse pointer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 1024;
    setIsTouchDevice(hasTouch);
  }, []);

  const dispatchKey = useCallback((code: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        code,
        bubbles: true,
        cancelable: true,
      })
    );
  }, []);

  const updateDirectionKeys = useCallback(
    (dx: number, dy: number) => {
      const deadzone = 0.25;
      const needForward = dy < -deadzone;
      const needBackward = dy > deadzone;
      const needLeft = dx < -deadzone;
      const needRight = dx > deadzone;

      // Forward (KeyW)
      if (needForward !== activeKeys.current.forward) {
        activeKeys.current.forward = needForward;
        dispatchKey('KeyW', needForward ? 'keydown' : 'keyup');
      }
      // Backward (KeyS)
      if (needBackward !== activeKeys.current.backward) {
        activeKeys.current.backward = needBackward;
        dispatchKey('KeyS', needBackward ? 'keydown' : 'keyup');
      }
      // Left (KeyA)
      if (needLeft !== activeKeys.current.left) {
        activeKeys.current.left = needLeft;
        dispatchKey('KeyA', needLeft ? 'keydown' : 'keyup');
      }
      // Right (KeyD)
      if (needRight !== activeKeys.current.right) {
        activeKeys.current.right = needRight;
        dispatchKey('KeyD', needRight ? 'keydown' : 'keyup');
      }
    },
    [dispatchKey]
  );

  const resetAllKeys = useCallback(() => {
    if (activeKeys.current.forward) {
      activeKeys.current.forward = false;
      dispatchKey('KeyW', 'keyup');
    }
    if (activeKeys.current.backward) {
      activeKeys.current.backward = false;
      dispatchKey('KeyS', 'keyup');
    }
    if (activeKeys.current.left) {
      activeKeys.current.left = false;
      dispatchKey('KeyA', 'keyup');
    }
    if (activeKeys.current.right) {
      activeKeys.current.right = false;
      dispatchKey('KeyD', 'keyup');
    }
    setKnobPos({ x: 0, y: 0 });
    setIsDragging(false);
    touchIdRef.current = null;
  }, [dispatchKey]);

  // Touch Move / End Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch || !baseRef.current) return;

    touchIdRef.current = touch.identifier;
    setIsDragging(true);

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = touch.clientX - centerX;
    const rawDy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setKnobPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });
    updateDirectionKeys(nx, ny);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (touchIdRef.current === null || !baseRef.current) return;

    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === touchIdRef.current
    );
    if (!touch) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = touch.clientX - centerX;
    const rawDy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setKnobPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });
    updateDirectionKeys(nx, ny);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    resetAllKeys();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetAllKeys();
    };
  }, [resetAllKeys]);

  if (!isTouchDevice) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 pointer-events-none select-none flex items-end justify-between px-6">
      {/* Left: Virtual D-Pad / Joystick */}
      <div
        ref={baseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-32 h-32 rounded-full bg-slate-950/70 border-2 border-sky-500/40 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none transition-all active:border-sky-400"
        title="จอยสติกควบคุมการเดิน (Virtual Joystick)"
      >
        {/* Direction indicators */}
        <span className="absolute top-2 text-[10px] text-sky-400 font-mono font-bold">W ▲</span>
        <span className="absolute bottom-2 text-[10px] text-sky-400 font-mono font-bold">S ▼</span>
        <span className="absolute left-2 text-[10px] text-sky-400 font-mono font-bold">◀ A</span>
        <span className="absolute right-2 text-[10px] text-sky-400 font-mono font-bold">D ▶</span>

        {/* Center Crosshair / Neutral guide */}
        <div className="w-10 h-10 rounded-full border border-slate-700/60" />

        {/* Draggable Knob */}
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-white/80 shadow-lg shadow-sky-500/50 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <div className="w-5 h-5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Right: Quick Action Buttons (E: Interact, Space: Jump/Dialog) */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Interact E */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            dispatchKey('KeyE', 'keydown');
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            dispatchKey('KeyE', 'keyup');
          }}
          onClick={() => {
            dispatchKey('KeyE', 'keydown');
            setTimeout(() => dispatchKey('KeyE', 'keyup'), 100);
          }}
          className="w-14 h-14 rounded-full bg-slate-950/70 border-2 border-amber-500/60 backdrop-blur-md active:bg-amber-500 active:border-amber-300 text-amber-300 active:text-slate-950 font-bold font-mono text-sm flex flex-col items-center justify-center shadow-lg transition-all"
        >
          <span>E</span>
          <span className="text-[9px] font-sans">สำรวจ</span>
        </button>

        {/* Jump / Advance Space */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            dispatchKey('Space', 'keydown');
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            dispatchKey('Space', 'keyup');
          }}
          onClick={() => {
            dispatchKey('Space', 'keydown');
            setTimeout(() => dispatchKey('Space', 'keyup'), 100);
          }}
          className="w-16 h-16 rounded-full bg-slate-950/70 border-2 border-emerald-500/60 backdrop-blur-md active:bg-emerald-500 active:border-emerald-300 text-emerald-300 active:text-slate-950 font-bold font-mono text-xs flex flex-col items-center justify-center shadow-lg transition-all"
        >
          <span>SPACE</span>
          <span className="text-[9px] font-sans">กระโดด</span>
        </button>
      </div>
    </div>
  );
}
