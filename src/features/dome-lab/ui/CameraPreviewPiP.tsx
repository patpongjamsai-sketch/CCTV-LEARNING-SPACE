'use client';

import React, { useState } from 'react';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA, DOME_IDEAL_ANGLES, calculateDomeFovCoverage } from '../data/domeLabData';
import { Video, Minimize2, Maximize2, X, Sun, Moon, AlertTriangle, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const CameraPreviewPiP: React.FC = () => {
  const pipPreviewVisible = useDomeLabStore((s) => s.pipPreviewVisible);
  const togglePipPreview = useDomeLabStore((s) => s.togglePipPreview);
  const selectedMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const pan = useDomeLabStore((s) => s.pan);
  const tilt = useDomeLabStore((s) => s.tilt);
  const rotation = useDomeLabStore((s) => s.rotation);
  const dayNightMode = useDomeLabStore((s) => s.dayNightMode);
  const setDayNightMode = useDomeLabStore((s) => s.setDayNightMode);

  const [isExpanded, setIsExpanded] = useState(false);
  const [dockSide, setDockSide] = useState<'left' | 'right'>('left');

  if (!pipPreviewVisible) {
    return (
      <button
        onClick={togglePipPreview}
        className={`fixed z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-xl backdrop-blur-md text-xs font-semibold cursor-pointer transition-all ${
          dockSide === 'left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
        }`}
        title="เปิดหน้าต่าง Camera Preview"
      >
        <Video className="w-4 h-4 animate-pulse" />
        <span>เปิดภาพสดจากกล้องโดม (PiP)</span>
      </button>
    );
  }

  const pointInfo = DOME_MOUNT_POINTS_DATA[selectedMountPointId];
  const isNight = dayNightMode === 'night_ir';
  const ideal = DOME_IDEAL_ANGLES[selectedMountPointId] || DOME_IDEAL_ANGLES.A;
  const coveragePercent = calculateDomeFovCoverage(selectedMountPointId, pan, tilt, rotation);

  // Angular deviation from ideal 3D target coordinates
  const panDiff = pan - ideal.pan;
  const tiltDiff = tilt - ideal.tilt;
  const rollDiff = rotation - ideal.rotation;

  // Target lock state:
  const isTargetLocked = Math.abs(panDiff) <= 10 && Math.abs(tiltDiff) <= 10;
  const isTargetInView = Math.abs(panDiff) <= 32 && Math.abs(tiltDiff) <= 26;

  // Check IR Glare condition:
  // 1. Point B in Night IR mode if panning back towards left wall/server nook
  // 2. Or Tilt is too shallow (< 8 deg) causing housing reflection
  const isPointBIrTrap = selectedMountPointId === 'B' && isNight && pan < 15;
  const isShallowTiltReflection = tilt < 8 && isNight;
  const hasIrGlare = isPointBIrTrap || isShallowTiltReflection;

  return (
    <div
      className={`fixed z-30 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-cyan-500/30 backdrop-blur-md bg-slate-950/95 flex flex-col max-w-[calc(100vw-3rem)] max-h-[55vh] ${
        dockSide === 'left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
      } ${
        isExpanded ? 'w-80 sm:w-96 h-60 sm:h-72' : 'w-64 sm:w-80 h-48 sm:h-56'
      }`}
    >
      {/* PiP Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-200">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span className="text-red-400 font-mono font-bold text-[11px]">LIVE</span>
          <span className="text-slate-300 text-[11px] font-semibold">
            DOME-{selectedMountPointId}
          </span>
          <span className="text-slate-500 text-[10px]">
            ({pointInfo.mountType})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Day / Night IR Switcher */}
          <button
            onClick={() => setDayNightMode(isNight ? 'day' : 'night_ir')}
            className={`px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              isNight
                ? 'bg-red-950/80 text-red-300 border border-red-500/60'
                : 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
            }`}
            title="สลับโหมด กลางวัน / กลางคืน (IR Night)"
          >
            {isNight ? <Moon className="w-3 h-3 text-red-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
            <span className="hidden sm:inline">{isNight ? 'NIGHT' : 'DAY'}</span>
          </button>

          {/* Dock Side Toggle (Left / Right) */}
          <button
            onClick={() => setDockSide(dockSide === 'left' ? 'right' : 'left')}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={dockSide === 'left' ? 'ย้ายไปมุมขวา' : 'ย้ายไปมุมซ้าย (แนะนำ)'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'ย่อหน้าต่าง' : 'ขยายหน้าต่าง'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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
      <div className={`relative flex-1 overflow-hidden flex items-center justify-center ${isNight ? 'bg-zinc-950' : 'bg-slate-950'}`}>
        {/* Animated Horizon & Dynamic 3D Scene Viewport */}
        <div
          className="w-full h-full relative transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${-panDiff * 2.2}px, ${-(tilt - ideal.tilt) * 2.2}px) rotate(${-rollDiff}deg)`,
          }}
        >
          {/* Background Gradient */}
          <div
            className={`absolute inset-0 ${
              isNight
                ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black'
                : 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900'
            }`}
          />

          {/* Perspective Grid Floor */}
          <div className="absolute inset-x-0 bottom-0 h-32 opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Simulated Office / Workshop Environment Background */}
          {pointInfo.roomId === 'room1_indoor' ? (
            /* Office Background Partition & Glass Door */
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-44 border-2 border-slate-600/70 bg-slate-900/60 rounded flex flex-col items-center justify-end pb-2 pointer-events-none">
              <span className="text-[8px] text-slate-400 font-mono tracking-wider">OFFICE GLASS DOOR</span>
            </div>
          ) : (
            /* Workshop Walkway Canopy & Trusses */
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-44 border-2 border-amber-600/50 bg-slate-900/60 rounded flex flex-col items-center justify-end pb-2 pointer-events-none">
              <span className="text-[8px] text-amber-400 font-mono tracking-wider">WORKSHOP EAVE & WALKWAY</span>
            </div>
          )}

          {/* Target Pedestrian Mannequin in FOV (Exact sync with 3D Scene!) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
            {/* Person Detection AI Box */}
            <div
              className={`relative w-16 h-28 border-2 rounded flex flex-col items-center justify-center transition-all ${
                isTargetLocked
                  ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : isTargetInView
                  ? 'border-cyan-400 bg-cyan-500/15'
                  : 'border-slate-500/60 bg-slate-800/20'
              }`}
            >
              {/* AI Status Pill */}
              <span
                className={`text-[7px] font-mono font-bold tracking-tight absolute -top-3.5 left-0 px-1 py-0.5 rounded border whitespace-nowrap ${
                  isTargetLocked
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-400 animate-pulse'
                    : isTargetInView
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isTargetLocked ? '🎯 TARGET LOCKED 98%' : isTargetInView ? 'ACQUIRING...' : 'PERSON 75%'}
              </span>

              {/* Head Reticle at 1.60m */}
              <div
                className={`w-5 h-5 rounded-full border mb-1 flex items-center justify-center ${
                  isTargetLocked
                    ? 'border-emerald-400 bg-emerald-400/40 ring-1 ring-emerald-300'
                    : 'border-cyan-400/80 bg-cyan-400/30'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              {/* Torso & Legs */}
              <div
                className={`w-8 h-12 rounded border ${
                  isTargetLocked
                    ? 'border-emerald-400/80 bg-emerald-400/25'
                    : 'border-cyan-400/60 bg-cyan-400/20'
                }`}
              />
              <div
                className={`w-6 h-6 rounded-b border mt-0.5 ${
                  isTargetLocked
                    ? 'border-emerald-400/60 bg-emerald-400/20'
                    : 'border-cyan-400/50 bg-cyan-400/15'
                }`}
              />
            </div>
          </div>
        </div>

        {/* IR GLARE / WHITE-OUT HALO SIMULATION */}
        {hasIrGlare && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            {/* Blinding white wash overlay */}
            <div className="absolute inset-0 bg-radial from-white via-white/85 to-white/40 animate-pulse" />
            <div className="relative z-20 bg-red-950/90 border border-red-400 text-red-100 p-2 rounded-lg shadow-2xl text-center max-w-[85%]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                <span>IR REFLECTION WASH-OUT!</span>
              </div>
              <p className="text-[10px] text-red-200 mt-1 leading-tight">
                แสง IR สะท้อนวัตถุใกล้เกินไป (ผนัง/ขอบเคส) หรือก้มกล้องไม่พอ ทำให้ภาพเกิดหมอกขาวโพลน!
              </p>
            </div>
          </div>
        )}

        {/* Infrared Monochrome Grain & Scanlines */}
        {isNight && (
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
        )}

        {/* CCTV Center Reticle / Target Bullseye */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-10 h-10 border border-dashed rounded-full transition-colors ${
              isTargetLocked ? 'border-emerald-400 shadow-md shadow-emerald-500/50' : 'border-cyan-400/50'
            }`}
          />
          <div className={`absolute w-5 h-[1px] ${isTargetLocked ? 'bg-emerald-400' : 'bg-cyan-400/70'}`} />
          <div className={`absolute h-5 w-[1px] ${isTargetLocked ? 'bg-emerald-400' : 'bg-cyan-400/70'}`} />
        </div>

        {/* Live OSD Telemetry Display */}
        <div className="absolute top-2 left-2 pointer-events-none text-[9px] font-mono text-cyan-300/90 leading-tight bg-slate-950/75 p-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
          <div>PAN: {pan}° | TILT: {tilt}°</div>
          <div>ROLL: {rotation}° (3-AXIS)</div>
          <div className={isTargetLocked ? 'text-emerald-400 font-bold' : isTargetInView ? 'text-cyan-300' : 'text-amber-400'}>
            TARGET: {isTargetLocked ? 'LOCKED (100% COVERAGE)' : isTargetInView ? 'IN FRAME (ACQUIRING)' : 'OFF-AXIS'}
          </div>
        </div>

        {/* Status Badge at bottom */}
        <div className="absolute bottom-1.5 left-2 right-2 pointer-events-none flex items-center justify-between text-[9px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            {isTargetLocked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            <span>COVERAGE: {coveragePercent}%</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded font-bold ${
              hasIrGlare
                ? 'bg-red-800 text-white'
                : isTargetLocked
                ? 'bg-emerald-800 text-white shadow'
                : 'bg-cyan-900/80 text-cyan-200'
            }`}
          >
            {hasIrGlare ? 'IR FOG WARNING' : isTargetLocked ? 'OPTIMAL FOV' : 'ADJUSTING'}
          </span>
        </div>
      </div>
    </div>
  );
};
