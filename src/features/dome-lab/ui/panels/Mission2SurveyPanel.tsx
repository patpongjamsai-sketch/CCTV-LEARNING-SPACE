'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDomeLabStore } from '../../store/useDomeLabStore';
import { DOME_MOUNT_POINTS_DATA, ROOMS_DATA } from '../../data/domeLabData';
import { DomeMountPointId } from '../../types';
import {
  MapPin,
  Building2,
  Warehouse,
  ArrowRight,
  Info,
  Camera,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export const Mission2SurveyPanel: React.FC = () => {
  const router = useRouter();
  const activeRoom = useDomeLabStore((s) => s.activeRoom);
  const setActiveRoom = useDomeLabStore((s) => s.setActiveRoom);
  const selectedMountPointId = useDomeLabStore((s) => s.selectedMountPoint);
  const setSelectedMountPoint = useDomeLabStore((s) => s.setSelectedMountPoint);
  const setCurrentMission = useDomeLabStore((s) => s.setCurrentMission);
  const setActiveDirectorView = useDomeLabStore((s) => s.setActiveDirectorView);
  const hasPickedUpCamera = useDomeLabStore((s) => s.hasPickedUpCamera);
  const isCameraMounted = useDomeLabStore((s) => s.isCameraMounted);
  const mountedPointId = useDomeLabStore((s) => s.mountedPointId);
  const mountCameraAtPoint = useDomeLabStore((s) => s.mountCameraAtPoint);

  const selectedPoint = DOME_MOUNT_POINTS_DATA[selectedMountPointId];
  const roomMeta = ROOMS_DATA[activeRoom];

  // 2 Zones: 2 points indoors (A–B) and 2 points in workshop (C–D)
  const room1Points: DomeMountPointId[] = ['A', 'B'];
  const room2Points: DomeMountPointId[] = ['C', 'D'];

  const handleSelectPoint = (pointId: DomeMountPointId) => {
    setSelectedMountPoint(pointId);
  };

  return (
    <div className="p-4 space-y-4 text-slate-200 select-none">
      {/* Header Banner */}
      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>ภารกิจที่ 2: สำรวจจุดติดตั้ง & นำกล้องไปติดตั้งจริง</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          เดินสำรวจจุดติดตั้งในสภาพแวดล้อม 2 โซน เลือกตำแหน่งที่เหมาะสม นำตัวกล้องไปติดตั้งจริง และวิเคราะห์มุมมอง FOV
        </p>
      </div>

      {/* Workflow Step Guide Card */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 p-3 rounded-2xl space-y-2 text-xs">
        <div className="font-bold text-cyan-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
          <span>ขั้นตอนการปฏิบัติงาน</span>
          {isCameraMounted ? (
            <span className="text-emerald-400 font-bold">ติดตั้งเรียบร้อย</span>
          ) : hasPickedUpCamera ? (
            <span className="text-amber-400 font-bold">กำลังถือกล้อง</span>
          ) : (
            <span className="text-slate-400 font-normal">ยังไม่ได้เบิกกล้อง</span>
          )}
        </div>

        {!hasPickedUpCamera && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-amber-200 text-xs flex items-center gap-2.5">
            <span className="text-base">🚶</span>
            <div>
              <strong>Step 2:</strong> เดินไปที่ <span className="text-amber-300 font-bold">[ โต๊ะเบิกกล้อง ]</span> ที่โซนกลาง แล้วกด <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-white border border-amber-500/30">E</kbd> เพื่อหยิบกล้องโดม
            </div>
          </div>
        )}

        {hasPickedUpCamera && !isCameraMounted && (
          <div className="bg-cyan-950/50 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-200 text-xs flex items-center gap-2.5 animate-pulse">
            <span className="text-base">📹</span>
            <div>
              <strong>Step 3–4:</strong> เดินไปยังจุดติดตั้งเป้าหมาย (ระยะ &lt;= 2 ม.) แล้วกด <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/40">E</kbd> เพื่อติดตั้งกล้อง
            </div>
          </div>
        )}

        {isCameraMounted && mountedPointId && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 p-2.5 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong>ติดตั้งสำเร็จ:</strong> จุด {mountedPointId} ({DOME_MOUNT_POINTS_DATA[mountedPointId].label})
              </div>
            </div>
            <button
              onClick={() => setActiveDirectorView('target')}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>ซูมดู</span>
            </button>
          </div>
        )}
      </div>

      {/* 2 ROOMS SELECTOR TABS */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          เลือกโซนสำรวจ (2 ห้องปฏิบัติการ)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setActiveRoom('room1_indoor');
              setActiveDirectorView('office');
              router.push('/labs/dome-camera/room-1');
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeRoom === 'room1_indoor'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-white shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">ห้องที่ 1: Indoor</div>
              <div className="text-[10px] text-slate-400 truncate">สำนักงาน (2 จุด A–B)</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveRoom('room2_outdoor');
              setActiveDirectorView('workshop');
              router.push('/labs/dome-camera/room-2');
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeRoom === 'room2_outdoor'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-white shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Warehouse className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">ห้องที่ 2: Outdoor</div>
              <div className="text-[10px] text-slate-400 truncate">โรงฝึกงาน (2 จุด C–D)</div>
            </div>
          </button>
        </div>
      </div>

      {/* MOUNT POINTS IN CURRENT ZONE (Neutral styling, no right/wrong spoiler tags) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>จุดติดตั้งใน {roomMeta.nameTh}</span>
          <span className="text-[11px] font-mono text-cyan-400">
            {activeRoom === 'room1_indoor' ? '2 จุด (A–B)' : '2 จุด (C–D)'}
          </span>
        </div>

        <div className="space-y-1.5">
          {(activeRoom === 'room1_indoor' ? room1Points : room2Points).map((pointId) => {
            const pt = DOME_MOUNT_POINTS_DATA[pointId];
            const isSelected = selectedMountPointId === pointId;
            const isMountedHere = mountedPointId === pointId;

            return (
              <button
                key={pointId}
                onClick={() => handleSelectPoint(pointId)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isMountedHere
                        ? 'bg-emerald-500 text-slate-950'
                        : isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {pointId}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                      <span>{pt.label}</span>
                      {isMountedHere && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-mono">
                          ติดตั้งแล้ว
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      สูง {pt.heightMeters}ม. · เลนส์ {pt.lensMm}มม. (FOV {pt.fovDegrees}°)
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 shrink-0 capitalize">
                  {pt.mountType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED MOUNT POINT SPECIFICATIONS CARD */}
      <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold text-white">รายละเอียดทางเทคนิค: {selectedPoint.label}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {selectedPoint.mountType.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">ความสูงติดตั้ง</span>
            <span className="font-bold text-white font-mono">{selectedPoint.heightMeters} เมตร</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">ขนาดเลนส์ / FOV</span>
            <span className="font-bold text-cyan-400 font-mono">
              {selectedPoint.lensMm} มม. (FOV {selectedPoint.fovDegrees}°)
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">กล่องพักสาย (Junction Box)</span>
            <span className={`font-semibold ${selectedPoint.junctionBoxRequired ? 'text-amber-400' : 'text-slate-400'}`}>
              {selectedPoint.junctionBoxRequired ? 'จำเป็น (กันน้ำ/ภายนอก)' : 'ไม่จำเป็น (ซ่อนบนฝ้า)'}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">เป้าหมายมุมมอง</span>
            <span className="font-semibold text-slate-200 truncate">
              {selectedPoint.targetDescription}
            </span>
          </div>
        </div>

        {/* Observation Guide (Guides student what to observe without spoiling right/wrong score) */}
        <div className="bg-sky-950/40 border border-sky-500/30 p-2.5 rounded-xl text-xs text-sky-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>คำแนะนำการสำรวจ:</strong> {selectedPoint.taskGuideTh}
          </div>
        </div>

        {/* Quick Action: Mount camera directly if holding camera */}
        {hasPickedUpCamera && !isCameraMounted && (
          <button
            onClick={() => mountCameraAtPoint(selectedMountPointId)}
            className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>🎯 ติดตั้งกล้องที่จุด {selectedMountPointId}</span>
          </button>
        )}
      </div>

      {/* Button to proceed to Mission 3 */}
      <button
        onClick={() => setCurrentMission(3)}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl border border-cyan-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>ไปต่อ: ปรับกิมบอล 3 แกน & ตรวจสอบภาพ CCTV IR (ภารกิจ 3)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
