'use client';

import React, { useState } from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { calculateFovCoverage } from '../data/bulletLabData';
import { Video, Minimize2, Maximize2, X } from 'lucide-react';

export const CameraPreviewPiP: React.FC = () => {
  const pipPreviewVisible = useBulletLabStore((s) => s.pipPreviewVisible);
  const togglePipPreview = useBulletLabStore((s) => s.togglePipPreview);
  const selectedMountPointId = useBulletLabStore((s) => s.selectedMountPoint);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const rotation = useBulletLabStore((s) => s.rotation);

  const [isExpanded, setIsExpanded] = useState(false);

  if (!pipPreviewVisible) {
    return (
      <button
        onClick={togglePipPreview}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-xl backdrop-blur-md text-xs font-semibold cursor-pointer transition-all"
        title="เปิดหน้าต่าง Camera Preview"
      >
        <Video className="w-4 h-4 animate-pulse" />
        <span>เปิดภาพสดจากกล้อง (PiP)</span>
      </button>
    );
  }

  // Calculate simulated coverage based on pan/tilt alignment towards the door entry for the chosen mount point
  const coveragePercent = calculateFovCoverage(selectedMountPointId, pan, tilt, rotation);

  return (
    <div
      className={`fixed z-30 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-cyan-500/30 backdrop-blur-md bg-slate-950/95 flex flex-col ${
        isExpanded
          ? 'bottom-6 right-6 w-96 h-72'
          : 'bottom-6 right-6 w-72 h-52'
      }`}
    >
      {/* PiP Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-200">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span className="text-red-400 font-mono font-bold text-[11px]">REC</span>
          <span className="text-slate-400 text-[11px]">
            CAM-01 · จุด {selectedMountPointId}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'ย่อหน้าต่าง' : 'ขยายหน้าต่าง'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={togglePipPreview}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PiP Camera Simulated Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {/* Dynamic Target View representation */}
        <div
          className="w-full h-full relative transition-transform duration-150"
          style={{
            transform: `translate(${-pan * 1.5}px, ${-tilt * 1.5}px) rotate(${-rotation}deg)`,
          }}
        >
          {/* Simulated Scene Floor & Horizon */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950" />

          {/* Simulated Doorway & Frame */}
          <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-28 h-40 border-2 border-slate-600 bg-slate-900/80 rounded-t flex flex-col items-center justify-center">
            <div className="w-14 h-20 border border-cyan-500/30 bg-cyan-950/20 rounded-sm mb-4" />
            <span className="text-[9px] text-slate-400 font-mono">DOORWAY</span>
          </div>

          {/* Simulated Target Zone Box in camera FOV */}
          <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-36 h-10 border border-dashed border-red-500/70 bg-red-950/30 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-400 font-mono tracking-wider">
              TARGET CRITICAL ZONE
            </span>
          </div>
        </div>

        {/* Viewport HUD Reticle & Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 border border-cyan-400/50 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          </div>
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-400/60" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-400/60" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-400/60" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-400/60" />
        </div>

        {/* Real-time telemetry overlay */}
        <div className="absolute top-2 left-2.5 pointer-events-none text-[10px] font-mono text-cyan-300 drop-shadow">
          <div>PAN: {pan > 0 ? `+${pan}` : pan}°</div>
          <div>TILT: {tilt > 0 ? `+${tilt}` : tilt}°</div>
          <div>ROLL: {rotation > 0 ? `+${rotation}` : rotation}°</div>
        </div>

        <div className="absolute top-2 right-2.5 pointer-events-none text-right font-mono text-[10px] text-emerald-400 drop-shadow">
          <div>1080P @ 30FPS</div>
          <div>H.265 / ONVIF</div>
        </div>

        {/* Coverage Meter Badge */}
        <div className="absolute bottom-2 left-2.5 right-2.5 pointer-events-none flex items-center justify-between bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-[10px]">
          <span className="text-slate-400">เป้าหมายครอบคลุม:</span>
          <span
            className={`font-bold font-mono ${
              coveragePercent >= 80
                ? 'text-emerald-400'
                : coveragePercent >= 60
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {coveragePercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
