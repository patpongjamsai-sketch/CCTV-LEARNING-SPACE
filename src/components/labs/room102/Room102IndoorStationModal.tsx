'use client';

import React, { useState } from 'react';
import {
  INDOOR_SPOTS,
  IndoorSpotId,
  ROOM102_CAMERA_CATALOG,
  Room102CameraId,
} from '../../../shared/domain/room102Types';

interface Room102IndoorStationModalProps {
  initialPlacements?: Partial<Record<IndoorSpotId, Room102CameraId>>;
  initialPrivacyMask?: boolean;
  onSave: (
    placements: Record<IndoorSpotId, Room102CameraId>,
    privacyMask: boolean,
    score: number
  ) => void;
  onClose: () => void;
}

export const Room102IndoorStationModal: React.FC<Room102IndoorStationModalProps> = ({
  initialPlacements = {},
  initialPrivacyMask = false,
  onSave,
  onClose,
}) => {
  const [placements, setPlacements] = useState<Partial<Record<IndoorSpotId, Room102CameraId>>>(
    initialPlacements
  );
  const [privacyMaskActive, setPrivacyMaskActive] = useState<boolean>(initialPrivacyMask);
  const [selectedSpot, setSelectedSpot] = useState<IndoorSpotId>('IN_CORRIDOR_STAIRS');
  const [showSimulate, setShowSimulate] = useState(false);

  const indoorCameraList: Room102CameraId[] = [
    'DOME_IK10',
    'TURRET_INDOOR',
    'FISHEYE_360',
    'RECESSED_DOME',
    'DOME_PRIVACY',
    'BULLET_WDR',
  ];

  const handleAssignCamera = (spotId: IndoorSpotId, camId: Room102CameraId) => {
    setPlacements((prev) => ({ ...prev, [spotId]: camId }));
    // If selecting privacy dome, auto-suggest enabling mask
    if (camId === 'DOME_PRIVACY') {
      setPrivacyMaskActive(true);
    }
  };

  const handleClearSpot = (spotId: IndoorSpotId) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[spotId];
      return next;
    });
  };

  // Score calculation: 5 spots (16 pts each = 80 pts) + privacy mask (20 pts) = 100 pts
  const spotKeys = Object.keys(INDOOR_SPOTS) as IndoorSpotId[];
  let correctSpots = 0;
  spotKeys.forEach((k) => {
    if (placements[k] && placements[k] === INDOOR_SPOTS[k].correctCameraId) {
      correctSpots += 1;
    }
  });

  const spotScore = Math.round((correctSpots / spotKeys.length) * 80);
  const privacyScore = privacyMaskActive ? 20 : 0;
  const totalScore = spotScore + privacyScore;
  const isAllFilled = spotKeys.every((k) => !!placements[k]);

  const handleFinish = () => {
    if (!isAllFilled) return;
    onSave(
      placements as Record<IndoorSpotId, Room102CameraId>,
      privacyMaskActive,
      totalScore
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900/95 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl text-xl">🏢</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  STATION 2: SMART SCHOOL INDOOR
                </span>
                <span className="text-xs text-slate-400">ผังภายในอาคารเรียนและพื้นที่การศึกษา (5 จุด)</span>
              </div>
              <h2 className="text-lg font-bold text-white">การเลือกกล้องภายใน, มาตรฐาน IK10 และ PDPA</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <span className="text-xs text-slate-400 block">ความถูกต้องผังใน + PDPA</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {correctSpots}/{spotKeys.length} จุด + {privacyMaskActive ? 'PDPA✓' : 'PDPA✕'} ({totalScore}%)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: 2D Indoor Floor Plan (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-slate-950/60 flex flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                แปลนอาคารเรียน 2 ชั้น (School Building Floor Plan)
              </span>
              <button
                onClick={() => setShowSimulate(!showSimulate)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  showSimulate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showSimulate ? '👁️ ปิดจำลอง FOV' : '📡 แสดงรัศมีมุมมอง FOV'}
              </button>
            </div>

            {/* Indoor SVG Map */}
            <div className="relative flex-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden select-none">
              <svg viewBox="0 0 500 360" className="w-full h-full object-cover">
                {/* Background Building Floor */}
                <rect x="0" y="0" width="500" height="360" fill="#0f172a" />

                {/* Building Outer Walls */}
                <rect
                  x="20"
                  y="20"
                  width="460"
                  height="320"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="3"
                  rx="8"
                />

                {/* Central Corridor & Staircase */}
                <rect
                  x="140"
                  y="120"
                  width="220"
                  height="120"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="2"
                />
                <text x="175" y="175" fill="#94a3b8" fontSize="11" fontWeight="bold">
                  โถงทางเดินและบันไดชั้น 2
                </text>
                {/* Stairs Lines */}
                <line x1="220" y1="190" x2="280" y2="190" stroke="#475569" strokeWidth="2" />
                <line x1="220" y1="198" x2="280" y2="198" stroke="#475569" strokeWidth="2" />
                <line x1="220" y1="206" x2="280" y2="206" stroke="#475569" strokeWidth="2" />

                {/* Digital Library (Top Left) */}
                <rect
                  x="30"
                  y="30"
                  width="180"
                  height="80"
                  fill="#1e1e2d"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text x="60" y="75" fill="#818cf8" fontSize="11" fontWeight="bold">
                  ห้องสมุดดิจิทัล (Library)
                </text>

                {/* Server Room & Computer Lab (Top Right) */}
                <rect
                  x="290"
                  y="30"
                  width="180"
                  height="80"
                  fill="#172554"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text x="310" y="75" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  ห้องเซิร์ฟเวอร์ & คอมแล็บ
                </text>

                {/* Canteen / Cafeteria (Bottom Left) */}
                <rect
                  x="30"
                  y="250"
                  width="180"
                  height="80"
                  fill="#142e2b"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text x="50" y="295" fill="#34d399" fontSize="11" fontWeight="bold">
                  โรงอาหาร & แลกคูปอง
                </text>

                {/* Infirmary & Restroom Hallway (Bottom Right) */}
                <rect
                  x="290"
                  y="250"
                  width="180"
                  height="80"
                  fill="#311e2f"
                  stroke="#ec4899"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text x="305" y="285" fill="#f472b6" fontSize="10" fontWeight="bold">
                  ห้องพยาบาล & ทางแยกห้องน้ำ
                </text>

                {/* Privacy Mask Blackout Box over restroom entry */}
                {privacyMaskActive && (
                  <g>
                    <rect
                      x="370"
                      y="275"
                      width="90"
                      height="45"
                      fill="#000000"
                      stroke="#ec4899"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                      opacity="0.92"
                    />
                    <text x="382" y="300" fill="#f43f5e" fontSize="9" fontWeight="bold">
                      [PRIVACY MASK]
                    </text>
                    <text x="388" y="312" fill="#fda4af" fontSize="8">
                      แถบดำปิดบัง PDPA
                    </text>
                  </g>
                )}

                {/* Render FOV Simulation Cones */}
                {showSimulate &&
                  spotKeys.map((spotId) => {
                    const spot = INDOOR_SPOTS[spotId];
                    const camId = placements[spotId];
                    if (!camId) return null;
                    const isCorrect = camId === spot.correctCameraId;
                    const px = (spot.xPercent / 100) * 500;
                    const py = (spot.yPercent / 100) * 360;

                    if (camId === 'FISHEYE_360') {
                      return (
                        <circle
                          key={`fov-${spotId}`}
                          cx={px}
                          cy={py}
                          r="55"
                          fill="#38bdf8"
                          opacity="0.3"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                      );
                    }

                    return (
                      <path
                        key={`fov-${spotId}`}
                        d={`M ${px} ${py} L ${px - 40} ${py + 50} A 50 50 0 0 0 ${px + 40} ${py + 50} Z`}
                        fill={isCorrect ? '#10b981' : '#f43f5e'}
                        opacity="0.3"
                      />
                    );
                  })}
              </svg>

              {/* 5 Interactive Spot Markers */}
              {spotKeys.map((spotId, idx) => {
                const spot = INDOOR_SPOTS[spotId];
                const camId = placements[spotId];
                const isSelected = selectedSpot === spotId;
                const isCorrect = camId && camId === spot.correctCameraId;

                return (
                  <button
                    key={spotId}
                    onClick={() => setSelectedSpot(spotId)}
                    style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-10 flex flex-col items-center`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl transition-all ${
                        isSelected
                          ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-110'
                          : ''
                      } ${
                        camId
                          ? isCorrect
                            ? 'bg-emerald-600 text-white border-2 border-emerald-300'
                            : 'bg-rose-600 text-white border-2 border-rose-300'
                          : 'bg-slate-800 text-slate-300 border-2 border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {camId ? ROOM102_CAMERA_CATALOG[camId].icon : `S${idx + 1}`}
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/90 text-slate-200 border border-slate-700 whitespace-nowrap">
                      {spot.nameTh.split(':')[1] || spot.nameTh}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Privacy Mask Quick Toggle Bar */}
            <div className="mt-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-pink-500/20 text-pink-400 rounded-xl text-lg">🔒</span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    การคุ้มครองข้อมูลส่วนบุคคล (PDPA Privacy Masking)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ปิดบังพื้นที่อ่อนไหวบริเวณหน้าห้องน้ำและห้องพยาบาล
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPrivacyMaskActive(!privacyMaskActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  privacyMaskActive
                    ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {privacyMaskActive ? '✓ เปิดใช้ Privacy Mask (+20 คะแนน)' : 'เปิดใช้ Privacy Mask'}
              </button>
            </div>
          </div>

          {/* Right: Selected Spot Details & Camera Arsenal (5 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between overflow-y-auto bg-slate-900/50">
            <div>
              {/* Active Spot Inspection Card */}
              {selectedSpot && (
                <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {INDOOR_SPOTS[selectedSpot].id}
                    </span>
                    {placements[selectedSpot] && (
                      <button
                        onClick={() => handleClearSpot(selectedSpot)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                      >
                        ถอดกล้องออก
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    {INDOOR_SPOTS[selectedSpot].nameTh}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📍 {INDOOR_SPOTS[selectedSpot].locationTh}
                  </p>

                  <div className="mt-2.5 p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs text-emerald-200/90">
                    <strong className="text-emerald-400 block mb-0.5">โจทย์หน้างาน:</strong>
                    {INDOOR_SPOTS[selectedSpot].problemScenarioTh}
                  </div>

                  {/* Current Status on this spot */}
                  <div className="mt-3 pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-400">กล้องที่ติดตั้งปัจจุบัน:</span>
                    {placements[selectedSpot] ? (
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          placements[selectedSpot] === INDOOR_SPOTS[selectedSpot].correctCameraId
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        <span>{ROOM102_CAMERA_CATALOG[placements[selectedSpot]!].icon}</span>
                        <span>{ROOM102_CAMERA_CATALOG[placements[selectedSpot]!].nameTh}</span>
                        <span>
                          {placements[selectedSpot] ===
                          INDOOR_SPOTS[selectedSpot].correctCameraId
                            ? '✓'
                            : '⚠️'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">ยังไม่ได้เลือกกล้อง</span>
                    )}
                  </div>
                </div>
              )}

              {/* Indoor Camera Arsenal */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  เลือกกล้องภายในอาคารเพื่อติดตั้ง:
                </span>

                {indoorCameraList.map((camId) => {
                  const cam = ROOM102_CAMERA_CATALOG[camId];
                  const isCurrentSelected = placements[selectedSpot] === camId;

                  return (
                    <button
                      key={camId}
                      onClick={() => handleAssignCamera(selectedSpot, camId)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isCurrentSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <span className="text-2xl p-1.5 bg-slate-900 rounded-xl shrink-0">
                        {cam.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold truncate">{cam.nameTh}</strong>
                          <div className="flex items-center gap-1 shrink-0">
                            {cam.ikRating && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                {cam.ikRating}
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                              {cam.ipRating}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cam.descriptionTh}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-300/90 font-mono">
                          <span>คุณสมบัติ: {cam.specialFeature}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {isAllFilled ? (
                  <span className="text-emerald-400 font-medium">✓ ติดตั้งครบทั้ง 5 จุดแล้ว</span>
                ) : (
                  <span>ยังติดตั้งไม่ครบ 5 จุด</span>
                )}
              </div>

              <button
                onClick={handleFinish}
                disabled={!isAllFilled}
                className={`py-2.5 px-6 rounded-2xl font-bold text-xs shadow-xl transition-all ${
                  isAllFilled
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                บันทึกผล Station 2 ({totalScore}%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
