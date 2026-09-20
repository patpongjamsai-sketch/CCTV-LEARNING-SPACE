'use client';

import React, { useState } from 'react';
import {
  Station3RecordingFaultPayload,
  ROOM105_FAULT_SCENARIOS,
  NvrFaultScenario,
  NvrFaultLogEntry,
  PrivacyMaskRect,
  DayScheduleSlot,
  RecordMode,
} from '../../../shared/domain/room105Types';

interface Room105RecordingFaultModalProps {
  initialPayload?: Partial<Station3RecordingFaultPayload>;
  onSave: (payload: Station3RecordingFaultPayload) => void;
  onClose: () => void;
}

export const Room105RecordingFaultModal: React.FC<Room105RecordingFaultModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'MOTION_PRIVACY' | 'SCHEDULE' | 'FAULT_RETEST'>('MOTION_PRIVACY');

  // Motion Detection Grid (8x8 = 64 cells)
  const [gridCells, setGridCells] = useState<boolean[]>(() => {
    const initial = new Array(64).fill(false);
    // Default active cells in center (entrance corridor)
    [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37].forEach((i) => {
      initial[i] = true;
    });
    return initial;
  });
  const [motionSensitivity, setMotionSensitivity] = useState<number>(
    initialPayload?.motionSensitivity || 75
  );

  // Privacy Masking List
  const [privacyMasks, setPrivacyMasks] = useState<PrivacyMaskRect[]>(
    initialPayload?.privacyMaskList || [
      {
        id: 'MASK-01',
        nameTh: 'บดบังหน้าต่างบ้านพักข้างเคียง',
        channelNumber: 1,
        xPercent: 10,
        yPercent: 10,
        widthPercent: 25,
        heightPercent: 20,
      },
    ]
  );
  const [isAddingMask, setIsAddingMask] = useState(false);

  // Recording Schedule
  const [scheduleMode, setScheduleMode] = useState<RecordMode>('MOTION');
  const [recordingSchedule, setRecordingSchedule] = useState<DayScheduleSlot[]>(
    initialPayload?.recordingSchedule || [
      {
        day: 'MON',
        timeRanges: [
          { startHour: 0, endHour: 8, mode: 'MOTION' },
          { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
          { startHour: 18, endHour: 24, mode: 'MOTION' },
        ],
      },
      {
        day: 'TUE',
        timeRanges: [
          { startHour: 0, endHour: 8, mode: 'MOTION' },
          { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
          { startHour: 18, endHour: 24, mode: 'MOTION' },
        ],
      },
      {
        day: 'WED',
        timeRanges: [
          { startHour: 0, endHour: 8, mode: 'MOTION' },
          { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
          { startHour: 18, endHour: 24, mode: 'MOTION' },
        ],
      },
      {
        day: 'THU',
        timeRanges: [
          { startHour: 0, endHour: 8, mode: 'MOTION' },
          { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
          { startHour: 18, endHour: 24, mode: 'MOTION' },
        ],
      },
      {
        day: 'FRI',
        timeRanges: [
          { startHour: 0, endHour: 8, mode: 'MOTION' },
          { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
          { startHour: 18, endHour: 24, mode: 'MOTION' },
        ],
      },
      {
        day: 'SAT',
        timeRanges: [{ startHour: 0, endHour: 24, mode: 'MOTION' }],
      },
      {
        day: 'SUN',
        timeRanges: [{ startHour: 0, endHour: 24, mode: 'MOTION' }],
      },
    ]
  );

  // Fault Retest Scenario & Log
  const [selectedFault, setSelectedFault] = useState<NvrFaultScenario>(
    initialPayload?.faultScenario || ROOM105_FAULT_SCENARIOS[0]
  );
  const [faultLog, setFaultLog] = useState<NvrFaultLogEntry>(
    initialPayload?.faultLog || {
      problemDescription: 'กล้อง CAM-02 หลุดการเชื่อมต่อ NVR แจ้งเตือน Account Locked หลังพยายามยืนยันตัวตนด้วยรหัสผิด',
      possibleCause: 'รหัสผ่าน ONVIF กล้องไม่ตรงกับที่บันทึกไว้ใน NVR ทำให้เกิด Brute-force Lockout',
      testMethod: 'ใช้ NVR Security Tool ตรวจสอบสถานะการเชื่อมต่อ และทดสอบ Ping IP 192.168.1.102',
      testResult: 'Ping ตอบสนองปกติ Latency 1.1ms แต่ Port 8000 ปฏิเสธการ Authentication',
      appliedSolution: 'ปลดล็อคผ่าน Account Security Menu และซิงค์ Master Password ของ NVR ไปยังกล้อง CAM-02',
      retestVerification: 'Retest สำเร็จ: กล้อง CAM-02 กลับมา Online ภาพสตรีมสดขึ้นปกติบน CH 2 ไม่พบ Packet Loss',
      retestPassed: true,
    }
  );
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestPassed, setRetestPassed] = useState(initialPayload?.retestPassed ?? true);

  // Cell toggle in 8x8 Grid
  const handleToggleCell = (idx: number) => {
    setGridCells((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  // Select all or clear grid
  const handleSelectAllGrid = () => setGridCells(new Array(64).fill(true));
  const handleClearGrid = () => setGridCells(new Array(64).fill(false));

  // Toggle Privacy Mask
  const handleAddPrivacyMask = () => {
    const newMask: PrivacyMaskRect = {
      id: `MASK-0${privacyMasks.length + 1}`,
      nameTh: `พื้นที่ปิดบังส่วนบุคคล ${privacyMasks.length + 1}`,
      channelNumber: 1,
      xPercent: 50,
      yPercent: 40,
      widthPercent: 20,
      heightPercent: 20,
    };
    setPrivacyMasks((prev) => [...prev, newMask]);
    setIsAddingMask(false);
  };

  const handleRemoveMask = (id: string) => {
    setPrivacyMasks((prev) => prev.filter((m) => m.id !== id));
  };

  // Perform Retest
  const handleRunRetest = () => {
    setIsRetesting(true);
    setTimeout(() => {
      setIsRetesting(false);
      setRetestPassed(true);
      setFaultLog((prev) => ({
        ...prev,
        retestPassed: true,
        retestVerification: 'ผลการ Retest ผ่าน 100%: สตรีม RTSP ฟื้นตัวปกติ ตรวจสอบภาพสดสำเร็จ',
      }));
    }, 1000);
  };

  // Score calculation (30 pts max)
  const activeCellsCount = gridCells.filter(Boolean).length;
  let score = 0;

  // 1. Motion Grid & Sensitivity (8 pts)
  if (activeCellsCount >= 10 && motionSensitivity >= 60 && motionSensitivity <= 90) {
    score += 8;
  } else if (activeCellsCount > 0) {
    score += 5;
  }

  // 2. Privacy Mask Boundary (7 pts)
  if (privacyMasks.length >= 1) score += 7;

  // 3. Recording Schedule Config (7 pts)
  const hasContinuousAndMotion = recordingSchedule.some((d) =>
    d.timeRanges.some((r) => r.mode === 'CONTINUOUS') &&
    d.timeRanges.some((r) => r.mode === 'MOTION')
  );
  if (hasContinuousAndMotion) score += 7;
  else score += 4;

  // 4. Fault Log & Retest (8 pts)
  const hasCompleteLog =
    faultLog.problemDescription.trim().length >= 15 &&
    faultLog.appliedSolution.trim().length >= 15;
  if (retestPassed && hasCompleteLog) score += 8;
  else if (retestPassed) score += 5;

  const handleSave = () => {
    const payload: Station3RecordingFaultPayload = {
      motionSensitivity,
      motionGridActiveCellsCount: activeCellsCount,
      privacyMaskList: privacyMasks,
      recordingSchedule,
      faultScenario: selectedFault,
      faultLog,
      retestPassed,
      score,
      isCompleted: true,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  STATION 3 (30 คะแนน)
                </span>
                <span className="text-[10px] text-slate-400">
                  Motion, Privacy Mask, 24/7 Schedule & Fault Retest
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                การตั้ง Motion Grid, Privacy Mask, ตารางบันทึก และวิเคราะห์แก้ปัญหา NVR
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">คะแนนสถานี 3</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {score} <span className="text-xs text-slate-400 font-normal">/ 30</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('MOTION_PRIVACY')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MOTION_PRIVACY'
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯</span> Motion Detection &amp; Privacy Mask (15 คะแนน)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE'
                ? 'bg-slate-900 text-purple-400 border-t-2 border-purple-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📅</span> ตารางเวลาบันทึก 24/7 Schedule (7 คะแนน)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FAULT_RETEST')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FAULT_RETEST'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔧</span> NVR Fault Log &amp; Retest (8 คะแนน)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: Motion Detection Grid & Privacy Masking */}
          {activeTab === 'MOTION_PRIVACY' && (
            <div className="space-y-5">
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  คลิกเลือกพื้นที่ในตาราง <strong>8x8 Grid</strong> เพื่อกำหนดโซนที่ต้องการให้ระบบตรวจจับความเคลื่อนไหว (เช่น ทางเดินเข้า-ออก),
                  ปรับแถบ <strong>Sensitivity (ความไว)</strong> เพื่อลดการแจ้งเตือนผิดพลาด (False Alarm จากเงาหรือแสงไฟ),
                  และสร้าง <strong>Privacy Mask</strong> บล็อกพื้นที่ส่วนบุคคลที่ไม่ต้องการให้บันทึกภาพ
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 8x8 Interactive Grid (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                      <span>🟩</span> ตารางกำหนดพื้นที่ตรวจจับการเคลื่อนไหว (Motion Grid)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllGrid}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 cursor-pointer"
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        type="button"
                        onClick={handleClearGrid}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 cursor-pointer"
                      >
                        ล้างค่า
                      </button>
                    </div>
                  </div>

                  {/* Motion Grid Frame Overlay on Top of Simulated Scene */}
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-1 w-full h-full">
                      {gridCells.map((isActive, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleCell(idx)}
                          className={`rounded transition-all cursor-pointer flex items-center justify-center border ${
                            isActive
                              ? 'bg-red-500/50 border-red-400/80 hover:bg-red-500/70'
                              : 'bg-slate-950/40 border-slate-800/60 hover:bg-sky-500/20'
                          }`}
                        >
                          <span className="text-[8px] font-mono text-slate-400 select-none opacity-40">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Privacy Mask Rects Rendering */}
                    {privacyMasks.map((mask) => (
                      <div
                        key={mask.id}
                        style={{
                          left: `${mask.xPercent}%`,
                          top: `${mask.yPercent}%`,
                          width: `${mask.widthPercent}%`,
                          height: `${mask.heightPercent}%`,
                        }}
                        className="absolute bg-black border-2 border-indigo-400/80 rounded flex items-center justify-center text-[9px] font-bold text-indigo-300 select-none pointer-events-none shadow-xl"
                      >
                        ⬛ PRIVACY MASK
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>
                      ช่องที่เลือกตรวจจับ: <strong className="text-red-400 font-bold font-mono">{activeCellsCount} / 64 ช่อง</strong>
                    </span>
                    <span className="text-slate-400">สีแดง = โซน Motion Alarm Active</span>
                  </div>
                </div>

                {/* Motion Sensitivity & Privacy Mask Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Sensitivity Slider */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sky-400 text-xs">ระดับความไว (Sensitivity)</h4>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {motionSensitivity} / 100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={motionSensitivity}
                      onChange={(e) => setMotionSensitivity(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>ต่ำ (ลด False Alarm)</span>
                      <span className="text-emerald-300 font-bold">ช่วงแนะนำ (70-85)</span>
                      <span>สูง (ตรวจละเอียดยิบ)</span>
                    </div>
                  </div>

                  {/* Privacy Mask List */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-indigo-300 text-xs">โซนปิดบังส่วนบุคคล (Privacy Mask)</h4>
                      <button
                        type="button"
                        onClick={handleAddPrivacyMask}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                      >
                        + เพิ่มพื้นที่ Mask
                      </button>
                    </div>

                    <div className="space-y-2">
                      {privacyMasks.length === 0 ? (
                        <div className="text-[10px] text-slate-400 text-center py-3">
                          ยังไม่มีการกำหนด Privacy Mask
                        </div>
                      ) : (
                        privacyMasks.map((mask) => (
                          <div
                            key={mask.id}
                            className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]"
                          >
                            <div>
                              <div className="font-bold text-slate-200">{mask.nameTh}</div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                CH {mask.channelNumber} · พิกัด [{mask.xPercent}%, {mask.yPercent}%]
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMask(mask.id)}
                              className="text-rose-400 hover:text-rose-300 font-bold text-xs p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 24/7 Recording Schedule */}
          {activeTab === 'SCHEDULE' && (
            <div className="space-y-5">
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="text-xl">📅</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  กำหนดตารางการบันทึกภาพลงเครื่อง NVR ตลอด 7 วัน (24 ชั่วโมง):
                  ใช้โหมด <strong>Continuous (บันทึกต่อเนื่อง)</strong> ในช่วงเวลาทำการที่มีผู้คนพลุกพล่าน,
                  และใช้โหมด <strong>Motion Detection (บันทึกเมื่อมีความเคลื่อนไหว)</strong> ในเวลากลางคืนหรือวันหยุด เพื่อประหยัดพื้นที่จัดเก็บบน Hard Disk
                </p>
              </div>

              {/* Schedule Mode Legend & Tools */}
              <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">เลือกโหมดบันทึก:</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Continuous (บันทึกต่อเนื่อง)
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Motion (บันทึกเมื่อตรวจพบ)
                  </span>
                  <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Alarm (บันทึกเมื่อมีสัญญาณเตือน)
                  </span>
                </div>
              </div>

              {/* Weekly Time Matrix Table */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 overflow-x-auto space-y-3">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3 w-20">วัน</th>
                      <th className="py-2 px-3">ผังเวลาการบันทึก (00:00 - 24:00 น.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {recordingSchedule.map((dayRow) => (
                      <tr key={dayRow.day}>
                        <td className="py-3 px-3 font-bold font-mono text-sky-400">{dayRow.day}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1 h-6 w-full rounded-lg overflow-hidden border border-slate-800">
                            {dayRow.timeRanges.map((range, idx) => {
                              const widthPercent = ((range.endHour - range.startHour) / 24) * 100;
                              const colorClass =
                                range.mode === 'CONTINUOUS'
                                  ? 'bg-emerald-600'
                                  : range.mode === 'MOTION'
                                  ? 'bg-amber-600'
                                  : 'bg-rose-600';
                              return (
                                <div
                                  key={idx}
                                  style={{ width: `${widthPercent}%` }}
                                  className={`${colorClass} flex items-center justify-center text-[8px] font-bold text-white shadow-inner`}
                                >
                                  {range.startHour}:00 - {range.endHour}:00 ({range.mode})
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Fault Log Analysis & Systematic Retest */}
          {activeTab === 'FAULT_RETEST' && (
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="text-xl">🔧</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  ฝึกทักษะการแก้ปัญหาเครื่องบันทึก NVR อย่างเป็นระบบตามกระบวนการ 5 ขั้นตอน:
                  <strong> อาการปัญหา (Problem)</strong>, <strong>สาเหตุที่เป็นไปได้ (Cause)</strong>, <strong>ขั้นตอนตรวจวัด (Test)</strong>, <strong>ผลลัพธ์ (Result)</strong> และ <strong>แนวทางแก้ไข (Solution)</strong>
                  พร้อมทำการกด <strong>Retest Verification</strong> เพื่อยืนยันว่าปัญหากล้องหลุดหรือกระตุกได้รับการแก้ไขอย่างสมบูรณ์
                </p>
              </div>

              {/* Scenario Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">เลือกกรณีศึกษาปัญหา NVR:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ROOM105_FAULT_SCENARIOS.map((sc) => (
                    <div
                      key={sc.faultId}
                      onClick={() => {
                        setSelectedFault(sc);
                        setFaultLog((prev) => ({
                          ...prev,
                          problemDescription: sc.symptomTh,
                          possibleCause: sc.possibleCausesTh.join(' หรือ '),
                          appliedSolution: sc.recommendedActionTh,
                        }));
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedFault.faultId === sc.faultId
                          ? 'bg-sky-950/60 border-sky-400 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-slate-200 text-[11px] mb-1">{sc.titleTh}</div>
                      <div className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                        {sc.symptomTh}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Systematic Fault Log Form */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-sky-400 text-xs border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <span>📝</span> ใบบันทึกการวิเคราะห์และแก้ไขปัญหา (Systematic NVR Fault Log)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">1. อาการปัญหาที่พบ (Problem Description):</label>
                    <textarea
                      value={faultLog.problemDescription}
                      onChange={(e) => setFaultLog({ ...faultLog, problemDescription: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">2. สาเหตุที่เป็นไปได้ (Root Cause):</label>
                    <textarea
                      value={faultLog.possibleCause}
                      onChange={(e) => setFaultLog({ ...faultLog, possibleCause: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">3. เครื่องมือและวิธีทดสอบ (Test Method):</label>
                    <input
                      type="text"
                      value={faultLog.testMethod}
                      onChange={(e) => setFaultLog({ ...faultLog, testMethod: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">4. ผลการตรวจวัด (Test Result):</label>
                    <input
                      type="text"
                      value={faultLog.testResult}
                      onChange={(e) => setFaultLog({ ...faultLog, testResult: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">5. วิธีการแก้ไขและมาตรการป้องกัน (Solution &amp; Prevention):</label>
                  <textarea
                    value={faultLog.appliedSolution}
                    onChange={(e) => setFaultLog({ ...faultLog, appliedSolution: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-[10px] text-slate-200"
                  />
                </div>

                {/* Retest Trigger Bar */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">สถานะ Retest:</span>
                    {retestPassed ? (
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] flex items-center gap-1">
                        <span>✓</span> ทดสอบซ้ำผ่านเรียบร้อย (Retest Verified)
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 text-[10px]">
                        รอการกดทดสอบซ้ำ (Pending Retest)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRunRetest}
                    disabled={isRetesting}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isRetesting ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        <span>กำลังทดสอบซ้ำ...</span>
                      </>
                    ) : (
                      <>
                        <span>🔬</span>
                        <span>เริ่มทดสอบซ้ำ (Run Retest)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>เกณฑ์ผ่านสถานี 3:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              มี Motion Grid · มี Privacy Mask · Schedule สมบูรณ์ · Retest ผ่าน
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer text-xs"
            >
              ยกเลิก / ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all cursor-pointer text-xs flex items-center gap-2"
            >
              <span>💾</span>
              <span>บันทึกผล Station 3 ({score} คะแนน)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
