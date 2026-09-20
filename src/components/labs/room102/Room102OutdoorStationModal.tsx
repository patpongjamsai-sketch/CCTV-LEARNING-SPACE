'use client';

import React, { useState } from 'react';
import {
  OUTDOOR_SPOTS,
  OutdoorSpotId,
  ROOM102_CAMERA_CATALOG,
  Room102CameraId,
} from '../../../shared/domain/room102Types';
import { SchoolCampus3DDiorama } from './SchoolCampus3DDiorama';

interface Room102OutdoorStationModalProps {
  initialPlacements?: Partial<Record<OutdoorSpotId, Room102CameraId>>;
  onSave: (placements: Record<OutdoorSpotId, Room102CameraId>, score: number) => void;
  onClose: () => void;
}

export const Room102OutdoorStationModal: React.FC<Room102OutdoorStationModalProps> = ({
  initialPlacements = {},
  onSave,
  onClose,
}) => {
  const [placements, setPlacements] = useState<Partial<Record<OutdoorSpotId, Room102CameraId>>>(
    initialPlacements
  );
  const [selectedSpot, setSelectedSpot] = useState<OutdoorSpotId>('OUT_MAIN_GATE');
  const [showSimulate, setShowSimulate] = useState(false);

  const outdoorCameraList: Room102CameraId[] = [
    'BULLET_WDR',
    'PTZ_SPEED_DOME',
    'BULLET_WIDE',
    'BULLET_PERIMETER_AI',
    'BULLET_FULLCOLOR',
    'DOME_IK10',
  ];

  const handleAssignCamera = (spotId: OutdoorSpotId, camId: Room102CameraId) => {
    setPlacements((prev) => ({ ...prev, [spotId]: camId }));
  };

  const handleClearSpot = (spotId: OutdoorSpotId) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[spotId];
      return next;
    });
  };

  // Calculate score
  const spotKeys = Object.keys(OUTDOOR_SPOTS) as OutdoorSpotId[];
  const correctCount = spotKeys.filter(
    (k) => placements[k] && placements[k] === OUTDOOR_SPOTS[k].correctCameraId
  ).length;
  const isAllFilled = spotKeys.every((k) => !!placements[k]);
  const scorePercent = Math.round((correctCount / spotKeys.length) * 100);

  const handleFinish = () => {
    if (!isAllFilled) return;
    onSave(placements as Record<OutdoorSpotId, Room102CameraId>, scorePercent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900/95 border border-sky-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl text-xl">🏫</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  STATION 1: SMART SCHOOL OUTDOOR
                </span>
                <span className="text-xs text-slate-400">ผังภายนอกและแนวรั้วความปลอดภัย (5 จุด)</span>
              </div>
              <h2 className="text-lg font-bold text-white">การเลือกและจัดวางกล้องวงจรปิดรอบโรงเรียน</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <span className="text-xs text-slate-400 block">ความถูกต้องผังนอก</span>
              <span className="text-sm font-bold font-mono text-sky-400">
                {correctCount} / {spotKeys.length} จุด ({scorePercent}%)
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

        {/* Content Area: Left = 2D Campus Map, Right = Inspection & Camera Arsenal */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: 3D Interactive Campus Diorama (7 cols) */}
          <div className="lg:col-span-7 p-3 sm:p-4 bg-slate-950/70 flex flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
            {/* Quick Spot Selector Bar above 3D view */}
            <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
              <span className="text-[11px] font-mono text-slate-400 shrink-0 px-1">จุดที่เลือก:</span>
              {spotKeys.map((spotId, idx) => {
                const spot = OUTDOOR_SPOTS[spotId];
                const camId = placements[spotId];
                const isSelected = selectedSpot === spotId;
                const isCorrect = camId ? camId === spot.correctCameraId : false;

                return (
                  <button
                    key={spotId}
                    onClick={() => setSelectedSpot(spotId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/25 border-sky-400 text-white font-bold shadow-md ring-1 ring-sky-400/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        camId
                          ? isCorrect
                            ? 'bg-emerald-400'
                            : 'bg-rose-500'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span>P{idx + 1}: {spot.nameTh.split(':')[1] || spot.nameTh}</span>
                    {camId && (
                      <span className="text-[10px] opacity-80">
                        ({ROOM102_CAMERA_CATALOG[camId].icon})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3D Interactive Campus Diorama Container */}
            <div className="relative flex-1 w-full min-h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80">
              <SchoolCampus3DDiorama
                placements={placements}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                showSimulate={showSimulate}
                onToggleSimulate={() => setShowSimulate(!showSimulate)}
              />
            </div>
          </div>

          {/* Right: Selected Spot Details & Camera Arsenal (5 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between overflow-y-auto bg-slate-900/50">
            <div>
              {/* Active Spot Inspection Card */}
              {selectedSpot && (
                <div className="bg-slate-800/80 border border-sky-500/30 rounded-2xl p-4 mb-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                      {OUTDOOR_SPOTS[selectedSpot].id}
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
                    {OUTDOOR_SPOTS[selectedSpot].nameTh}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📍 {OUTDOOR_SPOTS[selectedSpot].locationTh}
                  </p>

                  <div className="mt-2.5 p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs text-amber-200/90">
                    <strong className="text-amber-400 block mb-0.5">โจทย์หน้างาน:</strong>
                    {OUTDOOR_SPOTS[selectedSpot].problemScenarioTh}
                  </div>

                  {/* Current Status on this spot */}
                  <div className="mt-3 pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-400">กล้องที่ติดตั้งปัจจุบัน:</span>
                    {placements[selectedSpot] ? (
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          placements[selectedSpot] === OUTDOOR_SPOTS[selectedSpot].correctCameraId
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        <span>{ROOM102_CAMERA_CATALOG[placements[selectedSpot]!].icon}</span>
                        <span>{ROOM102_CAMERA_CATALOG[placements[selectedSpot]!].nameTh}</span>
                        <span>
                          {placements[selectedSpot] ===
                          OUTDOOR_SPOTS[selectedSpot].correctCameraId
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

              {/* Camera Arsenal Selection List */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  เลือกกล้องเพื่อติดตั้งลงในจุดที่เลือก:
                </span>

                {outdoorCameraList.map((camId) => {
                  const cam = ROOM102_CAMERA_CATALOG[camId];
                  const isCurrentSelected = placements[selectedSpot] === camId;

                  return (
                    <button
                      key={camId}
                      onClick={() => handleAssignCamera(selectedSpot, camId)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isCurrentSelected
                          ? 'bg-sky-950/60 border-sky-400 text-white shadow-lg ring-2 ring-sky-500/30'
                          : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <span className="text-xl p-1 bg-slate-900 rounded-lg shrink-0">
                        {cam.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold truncate">{cam.nameTh}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">
                            {cam.ipRating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cam.descriptionTh}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-sky-300/90 font-mono">
                          <span>เลนส์: {cam.lensFocal}</span>
                          <span>•</span>
                          <span>จุดเด่น: {cam.specialFeature}</span>
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
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                บันทึกผล Station 1 ({scorePercent}%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
