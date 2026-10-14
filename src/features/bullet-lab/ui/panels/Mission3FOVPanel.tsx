'use client';

import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import {
  MOUNT_POINTS,
  MOUNT_POINT_IDEAL_ANGLES,
  calculateFovCoverage,
} from '../../data/bulletLabData';
import { Sparkles, Target, RotateCcw, Video, Eye } from 'lucide-react';

export const Mission3FOVPanel: React.FC = () => {
  const selectedMountPoint = useBulletLabStore((s) => s.selectedMountPoint);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const rotation = useBulletLabStore((s) => s.rotation);
  const fovDegrees = useBulletLabStore((s) => s.fovDegrees);
  const cameraViewMode = useBulletLabStore((s) => s.cameraViewMode);

  const setPan = useBulletLabStore((s) => s.setPan);
  const setTilt = useBulletLabStore((s) => s.setTilt);
  const setRotation = useBulletLabStore((s) => s.setRotation);
  const setFovDegrees = useBulletLabStore((s) => s.setFovDegrees);
  const setCameraViewMode = useBulletLabStore((s) => s.setCameraViewMode);

  const activePoint =
    MOUNT_POINTS.find((p) => p.id === selectedMountPoint) ?? MOUNT_POINTS[0]!;

  const idealAngleConfig =
    MOUNT_POINT_IDEAL_ANGLES[selectedMountPoint] ?? MOUNT_POINT_IDEAL_ANGLES.A;

  const coverage = calculateFovCoverage(selectedMountPoint, pan, tilt, rotation);

  const applyPreset = (p: number, t: number, r: number, fov?: number) => {
    setPan(p);
    setTilt(t);
    setRotation(r);
    if (fov) setFovDegrees(fov);
  };

  return (
    <div className="space-y-4">
      {/* 3D Viewport Mode Switcher */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setCameraViewMode('technician')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            cameraViewMode === 'technician'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>มุมมองช่างติดตั้ง</span>
        </button>
        <button
          onClick={() => setCameraViewMode('pov')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            cameraViewMode === 'pov'
              ? 'bg-indigo-500 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>มุมมองหน้าเลนส์ (POV)</span>
        </button>
      </div>

      {cameraViewMode === 'pov' && (
        <div className="px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-[11px] text-indigo-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
          <span>กล้อง 3D อยู่ที่หน้าเลนส์ หมุนตามองศา Pan/Tilt มองตรงไปยังเป้าหมาย</span>
        </div>
      )}

      {/* Reference Card from Mission 2 */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-1.5 shadow-lg shadow-cyan-950/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>📍</span>
            <span>จุดติดตั้งที่เลือกจาก Mission 2:</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-xs font-mono">
            จุด [{selectedMountPoint}]
          </span>
        </div>
        <div className="font-semibold text-xs text-white">
          {activePoint.label}
        </div>
        <div className="text-[11px] text-cyan-300 bg-cyan-950/50 p-2 rounded-xl border border-cyan-800/40 leading-snug">
          {idealAngleConfig.targetDescription}
        </div>
      </div>

      {/* Target Coverage Meter */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-200 font-semibold flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>ความครอบคลุมโซนเป้าหมาย (Target Coverage):</span>
          </span>
          <span
            className={`font-mono font-bold text-sm ${
              coverage >= 85
                ? 'text-emerald-400'
                : coverage >= 65
                ? 'text-cyan-400'
                : 'text-amber-400'
            }`}
          >
            {coverage}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              coverage >= 85
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-cyan-400'
            }`}
            style={{ width: `${coverage}%` }}
          />
        </div>
        {coverage >= 85 ? (
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            ✓ ลำกล้องและกรวยภาพส่องครอบคลุมหุ่นเป้าหมายและทางเข้าประตูอย่างแม่นยำ
          </div>
        ) : (
          <div className="text-[10px] text-slate-400">
            ปรับสไลเดอร์ Pan / Tilt / Roll เพื่อให้กรวยภาพส่องคลุมหุ่นเป้าหมายหน้าประตู
          </div>
        )}
      </div>

      {/* Angle Presets for this specific point */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>ปุ่มลัดมุมมองสำหรับจุด [{selectedMountPoint}]</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              applyPreset(
                idealAngleConfig.pan,
                idealAngleConfig.tilt,
                idealAngleConfig.roll,
                idealAngleConfig.recommendedFov
              )
            }
            className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/60 hover:bg-cyan-900/60 text-xs font-semibold text-cyan-200 text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>🎯 เล็งเป้าหมาย ({idealAngleConfig.pan}°, {idealAngleConfig.tilt}°)</span>
          </button>
          <button
            onClick={() => applyPreset(0, 0, 0, 75)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตตั้งตรง (0°, 0°)</span>
          </button>
        </div>
      </div>

      {/* Sliders: Pan, Tilt, Roll, FOV */}
      <div className="space-y-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Pan Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Pan (หันซ้าย-ขวา แนวนอน)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{pan}°</span>
          </div>
          <input
            type="range"
            min={-90}
            max={90}
            step={1}
            value={pan}
            onChange={(e) => setPan(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-90° (ซ้าย)</span>
            <span>เป้าหมายจุด {selectedMountPoint}: {idealAngleConfig.pan}°</span>
            <span>+90° (ขวา)</span>
          </div>
        </div>

        {/* Tilt Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Tilt (ก้ม-เงย แนวตั้ง)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{tilt}°</span>
          </div>
          <input
            type="range"
            min={-60}
            max={60}
            step={1}
            value={tilt}
            onChange={(e) => setTilt(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-60° (ก้มต่ำ)</span>
            <span>เป้าหมายจุด {selectedMountPoint}: {idealAngleConfig.tilt}°</span>
            <span>+60° (เงย)</span>
          </div>
        </div>

        {/* Rotation / Roll Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Roll / Rotation (หมุนระนาบขอบฟ้า)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{rotation}°</span>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-45° (เอียงซ้าย)</span>
            <span>0° (ระนาบระดับน้ำ)</span>
            <span>+45° (เอียงขวา)</span>
          </div>
        </div>

        {/* FOV Degree Slider */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Lens FOV (องศาเลนส์รับภาพ)
            </span>
            <span className="font-mono text-indigo-400 font-bold">
              {fovDegrees}°
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={1}
            value={fovDegrees}
            onChange={(e) => setFovDegrees(Number(e.target.value))}
            className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>50° (Telephoto แคบ/ไกล)</span>
            <span>แนะนำ: {idealAngleConfig.recommendedFov}°</span>
            <span>95° (Wide กว้าง)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
