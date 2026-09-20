'use client';

import React, { useState, useMemo } from 'react';
import { Station2SignalQualityPayload } from '../../../shared/domain/room107Types';

interface Room107SignalStationModalProps {
  initialPayload?: Station2SignalQualityPayload;
  onSave: (payload: Station2SignalQualityPayload) => void;
  onClose: () => void;
}

export const Room107SignalStationModal: React.FC<Room107SignalStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [symptomIdentified, setSymptomIdentified] = useState<
    'ROLLING_HUM_BARS' | 'GHOSTING' | 'INTERMITTENT_LINK'
  >(initialPayload?.symptomIdentified || 'ROLLING_HUM_BARS');

  const [rootCause, setRootCause] = useState<
    'GROUND_LOOP_POTENTIAL_DIFF' | 'UNSHIELDED_POWER_PROXIMITY'
  >(initialPayload?.rootCause || 'GROUND_LOOP_POTENTIAL_DIFF');

  const [groundPotentialDiffVolts] = useState<number>(
    initialPayload?.groundPotentialDiffVolts ?? 2.4
  );

  const [waveformAnalyzed, setWaveformAnalyzed] = useState<boolean>(
    Boolean(initialPayload?.waveformAnalyzed || initialPayload?.isCompleted)
  );

  const [isolatorInstalled, setIsolatorInstalled] = useState<boolean>(
    Boolean(initialPayload?.isolatorInstalled || initialPayload?.isCompleted)
  );

  const [installationPosition, setInstallationPosition] = useState<'CAMERA_END' | 'NVR_END'>(
    initialPayload?.installationPosition || 'CAMERA_END'
  );

  const [humBarsResolved, setHumBarsResolved] = useState<boolean>(
    Boolean(initialPayload?.humBarsResolved || initialPayload?.isCompleted)
  );

  // Install Isolator & Retest
  const handleInstallIsolator = () => {
    setIsolatorInstalled(true);
    setHumBarsResolved(true);
  };

  // Scoring rubric (20 pts max):
  // 1. Correct Symptom & Waveform Analysis: 8 pts
  // 2. Ground Loop Isolator installed properly and retested clean: 12 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sAnalysis = 0;
    let sIsolator = 0;

    if (symptomIdentified === 'ROLLING_HUM_BARS' && waveformAnalyzed) {
      sAnalysis = 8;
    } else if (waveformAnalyzed) {
      sAnalysis = 4;
    }

    if (isolatorInstalled && humBarsResolved) {
      sIsolator = 12;
    } else if (isolatorInstalled) {
      sIsolator = 6;
    }

    return {
      scoreBreakdown: { sAnalysis, sIsolator },
      totalScore: Math.min(20, sAnalysis + sIsolator),
    };
  }, [symptomIdentified, waveformAnalyzed, isolatorInstalled, humBarsResolved]);

  const handleSaveAndSubmit = () => {
    const payload: Station2SignalQualityPayload = {
      symptomIdentified,
      rootCause,
      groundPotentialDiffVolts,
      groundLoopIsolatorModel: 'Passive Video Ground Loop Isolator BNC/RJ45',
      isolatorInstalled,
      installationPosition,
      waveformAnalyzed,
      retestVideoClean: humBarsResolved,
      humBarsResolved,
      score: totalScore,
      isCompleted: totalScore >= 16 && humBarsResolved,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xl shadow-inner">
              〰️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Room 107 · Station 2
                </span>
                <span className="text-[11px] font-mono text-slate-400">Signal Quality &amp; Ground Loop</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                การแก้ไขคลื่นรบกวน Hum Bars ด้วย Ground Loop Isolator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400">คะแนนสถานี: </span>
              <span className="text-lg font-bold text-emerald-400">{totalScore}</span>
              <span className="text-xs text-slate-500"> / 20</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-slate-200">
          
          {/* Signal Fault Simulation Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            {/* Monitor Screen Simulator */}
            <div className="relative rounded-2xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl flex flex-col items-center justify-center aspect-video p-2">
              {!humBarsResolved ? (
                // Rolling Hum Bars effect (CSS scanline overlay)
                <div className="w-full h-full relative flex items-center justify-center bg-slate-800 overflow-hidden rounded-xl">
                  {/* Background camera image mockup */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                  {/* Animated rolling hum bars */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-transparent animate-pulse h-1/3 w-full top-1/4 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-bounce h-1/4 w-full top-2/3 pointer-events-none" />
                  
                  <div className="z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-rose-500/50 text-center">
                    <span className="text-rose-400 font-bold block text-xs">⚠️ อาการ: Rolling Hum Bars (50Hz)</span>
                    <span className="text-[10px] text-slate-300 font-mono">สัญญาณรบกวนระลอกคลื่นเลื่อนผ่านจอ</span>
                  </div>
                </div>
              ) : (
                // Clean Video Stream
                <div className="w-full h-full relative flex items-center justify-center bg-slate-900 overflow-hidden rounded-xl border border-emerald-500/50">
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="z-10 bg-slate-950/85 px-3 py-1.5 rounded-lg border border-emerald-500/50 text-center">
                    <span className="text-emerald-400 font-bold block text-xs">✓ CLEAN VIDEO SIGNAL</span>
                    <span className="text-[10px] text-emerald-300 font-mono">ภาพคมชัด ปราศจากคลื่นรบกวน 100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Signal & Ground Diagnostic Info */}
            <div className="space-y-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>⚡ การวิเคราะห์ความต่างศักย์กราวด์ (Ground Potential)</span>
                </div>
                <div className="text-slate-300">
                  จุดต่อลงดินเสาไฟกล้อง และ ตู้แร็ค NVR มีความต่างศักย์: <strong className="text-amber-400 font-mono">2.4 VAC</strong>
                </div>
                <div className="text-slate-400 text-[10px] leading-relaxed">
                  กระแสไฟเหนี่ยวนำ 50Hz ไหลวนผ่านชีลด์สายสัญญาณ (Ground Loop Current) รบกวนสัญญาณภาพจนเกิดแถบมืดเลื่อนในแนวนอน
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWaveformAnalyzed(true)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  waveformAnalyzed
                    ? 'bg-sky-950/70 border-sky-500 text-sky-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {waveformAnalyzed ? '✓ วิเคราะห์รูปคลื่นสัญญาณ CCTV Tester เรียบร้อย (8/8 คะแนน)' : '🔍 ใช้ CCTV Tester ตรวจสอบรูปคลื่น Hum Bars'}
              </button>
            </div>
          </div>

          {/* Hardware Insertion: Ground Loop Isolator */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🛡️ การติดตั้ง Ground Loop Isolator เพื่อตัดวงจรกราวด์</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">12 / 12 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  เลือกตำแหน่งเชื่อมต่อหม้อแปลงแยกกราวด์ (Isolator Transformer)
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="isoPos"
                      checked={installationPosition === 'CAMERA_END'}
                      onChange={() => setInstallationPosition('CAMERA_END')}
                    />
                    <span>ติดตั้งที่ต้นทางใกล้ตัวกล้อง (Camera End)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="isoPos"
                      checked={installationPosition === 'NVR_END'}
                      onChange={() => setInstallationPosition('NVR_END')}
                    />
                    <span>ติดตั้งที่ปลายทางก่อนเข้าตู้แร็ค NVR (NVR End)</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  หลักการทางวิศวกรรม (Engineering Principle)
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Ground Loop Isolator ใช้หลักการเหนี่ยวนำแม่เหล็กผ่านแกน Toroidal Transformer โดยไม่มีการสัมผัสทางไฟฟ้าระหว่างกราวด์สองฝั่ง ช่วยตัดกระแสลูปที่ไหลในสายสัญญาณได้อย่างเด็ดขาดโดยไม่สูญเสียความถี่วิดีโอ
                </p>
              </div>
            </div>

            {/* Installation Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <button
                type="button"
                onClick={handleInstallIsolator}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                🔌 ติดตั้ง Ground Loop Isolator &amp; Retest ยืนยันผล
              </button>

              {isolatorInstalled && (
                <div className="p-2 px-3 rounded-xl text-[11px] font-bold border border-emerald-500/50 bg-emerald-950/70 text-emerald-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>ติดตั้งหม้อแปลง Isolator สำเร็จ · คลื่น Hum Bars หายไป 100% (เคลียร์ HUM_BARS)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          <div className="text-[11px] text-slate-400">
            Mandatory Checks: ต้องวิเคราะห์รูปคลื่น และติดตั้ง Ground Loop Isolator
          </div>
          <button
            type="button"
            onClick={handleSaveAndSubmit}
            disabled={!humBarsResolved || !waveformAnalyzed}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            บันทึกผล Station 2 ({totalScore}/20 คะแนน)
          </button>
        </div>
      </div>
    </div>
  );
};
