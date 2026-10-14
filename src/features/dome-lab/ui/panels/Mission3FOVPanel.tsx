'use client';

import React from 'react';
import { useDomeLabStore } from '../../store/useDomeLabStore';
import {
  Camera,
  RotateCw,
  Sun,
  Moon,
  Eye,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { DOME_MOUNT_POINTS_DATA } from '../../data/domeLabData';

export const Mission3FOVPanel: React.FC = () => {
  const pan = useDomeLabStore((s) => s.pan);
  const setPan = useDomeLabStore((s) => s.setPan);
  const tilt = useDomeLabStore((s) => s.tilt);
  const setTilt = useDomeLabStore((s) => s.setTilt);
  const rotation = useDomeLabStore((s) => s.rotation);
  const setRotation = useDomeLabStore((s) => s.setRotation);
  const fovDegrees = useDomeLabStore((s) => s.fovDegrees);
  const setFovDegrees = useDomeLabStore((s) => s.setFovDegrees);
  const dayNightMode = useDomeLabStore((s) => s.dayNightMode);
  const setDayNightMode = useDomeLabStore((s) => s.setDayNightMode);
  const cameraViewMode = useDomeLabStore((s) => s.cameraViewMode);
  const setCameraViewMode = useDomeLabStore((s) => s.setCameraViewMode);
  const selectedMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const setCurrentMission = useDomeLabStore((s) => s.setCurrentMission);

  const isNight = dayNightMode === 'night_ir';
  const curPoint = DOME_MOUNT_POINTS_DATA[selectedMountPointId];

  // IR Glare condition check
  const isHighIrRisk = curPoint?.irReflectionRisk === 'high' && isNight;
  const isShallowTilt = tilt < 8 && isNight;
  const hasIrGlare = isHighIrRisk || isShallowTilt;

  return (
    <div className="p-4 space-y-4 text-slate-200 select-none">
      {/* Header Banner */}
      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>ภารกิจที่ 3: ปรับกิมบอล 3 แกน & ทดสอบ Day/Night IR</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          ค่าเริ่มต้นกิมบอลอยู่ที่ 0° ทุกแกน ให้ผู้เรียนสังเกตหน้าต่างภาพสด LIVE แล้วเลื่อนปรับ Pan (หมุนฐาน), Tilt (ก้มเงย) และ Rotation (ระนาบเลนส์) ด้วยตนเอง เพื่อเล็งกากบาทให้ล็อกเป้าหมายหุ่นจำลองให้ได้ Coverage 100%
        </p>
      </div>

      {/* VIEW MODE & DAY/NIGHT TOGGLES */}
      <div className="grid grid-cols-2 gap-2">
        {/* Day/Night IR Toggle */}
        <button
          onClick={() => setDayNightMode(isNight ? 'day' : 'night_ir')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            isNight
              ? 'bg-red-950/60 border-red-500/70 text-red-200 shadow-lg'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isNight ? <Moon className="w-4 h-4 text-red-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <div>
              <div className="text-xs font-bold">{isNight ? 'โหมด Night IR' : 'โหมดกลางวัน'}</div>
              <div className="text-[10px] text-slate-400">{isNight ? 'เปิดไฟ IR 850nm' : 'ภาพสีธรรมชาติ'}</div>
            </div>
          </div>
        </button>

        {/* POV vs Technician View */}
        <button
          onClick={() => setCameraViewMode(cameraViewMode === 'technician' ? 'pov' : 'technician')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            cameraViewMode === 'pov'
              ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg'
              : 'bg-slate-950/40 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold">{cameraViewMode === 'pov' ? 'มุมมอง POV กล้อง' : 'มุมมองช่าง 3D'}</div>
              <div className="text-[10px] text-slate-400">สลับมุมมองตรวจงาน</div>
            </div>
          </div>
        </button>
      </div>

      {/* 3-AXIS GIMBAL CONTROLS */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>แกนปรับกิมบอล 3 ทิศทาง (3-Axis Internal Gimbal)</span>
          </span>
          <button
            onClick={() => {
              setPan(0);
              setTilt(0);
              setRotation(0);
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className="w-3 h-3" />
            <span>รีเซ็ตศูนย์ (0°)</span>
          </button>
        </div>

        {/* Axis 1: Pan */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">1. Pan (หมุนฐานแนวนอน)</span>
            <span className="font-mono text-cyan-400 font-bold">{pan}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={pan}
            onChange={(e) => setPan(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>-180° ซ้าย</span>
            <span>0° ตรง</span>
            <span>+180° ขวา</span>
          </div>
        </div>

        {/* Axis 2: Tilt */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">2. Tilt (ก้ม-เงยหน้ากล้อง)</span>
            <span className="font-mono text-cyan-400 font-bold">{tilt}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={75}
            value={tilt}
            onChange={(e) => setTilt(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>0° ระนาบตรง</span>
            <span>35° แนะนำ</span>
            <span>75° ก้มสุด</span>
          </div>
        </div>

        {/* Axis 3: Azimuth / Optical Roll */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">3. Azimuth / Rotation (หมุนระนาบเลนส์)</span>
            <span className="font-mono text-cyan-400 font-bold">{rotation}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>-180° เอียงซ้าย</span>
            <span>0° ขนานขอบฟ้า</span>
            <span>+180° เอียงขวา</span>
          </div>
        </div>

        {/* FOV Lens Angle */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">ขนาดเลนส์ / มุมรับภาพ (FOV)</span>
            <span className="font-mono text-cyan-400 font-bold">{fovDegrees}°</span>
          </div>
          <input
            type="range"
            min={60}
            max={110}
            value={fovDegrees}
            onChange={(e) => setFovDegrees(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>60° (เลนส์ 6mm ซูม)</span>
            <span>85° (4mm)</span>
            <span>105° (2.8mm มุมกว้าง)</span>
          </div>
        </div>
      </div>

      {/* IR GLARE DIAGNOSTIC ALERT */}
      {hasIrGlare ? (
        <div className="bg-red-950/70 border border-red-500/70 p-3 rounded-2xl text-xs text-red-200 space-y-1.5 shadow-xl animate-pulse">
          <div className="flex items-center gap-2 font-bold text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>ตรวจพบแสงสะท้อน IR (IR Reflection Washout)!</span>
          </div>
          <p className="text-[11px] text-red-200/90 leading-relaxed">
            {isHighIrRisk
              ? curPoint?.irReflectionReasonTh
              : 'มุมก้ม (Tilt) น้อยเกินไป แสง IR สะท้อนเข้าขอบเคสฝาครอบโดม แนะนำให้ปรับก้มลงมากกว่า 15°'}
          </p>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>มุมกล้องเหมาะสม: ไม่มีแสง IR สะท้อนรบกวน ภาพคมชัดทั้งกลางวันและกลางคืน</span>
        </div>
      )}

      {/* Proceed to Mission 4 */}
      <button
        onClick={() => setCurrentMission(4)}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl border border-cyan-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>ไปต่อ: ใบงานติดตั้ง 4 พื้นผิว & ประกอบโดม (ภารกิจ 4)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
