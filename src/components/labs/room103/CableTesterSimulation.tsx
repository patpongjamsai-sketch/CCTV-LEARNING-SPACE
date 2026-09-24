'use client';

import React, { useState, useEffect } from 'react';
import {
  T568B_COLOR_SEQUENCE,
  COLOR_HEX_MAP,
  type CoaxAssemblyDetails,
  type WiringStandardType,
} from '../../../shared/domain/room103Types';

interface CableTesterSimulationProps {
  sideASequence: string[];
  sideBSequence: string[];
  sideACrimped: boolean;
  sideBCrimped: boolean;
  sideAStrippingMm: number;
  jacketUnderStrainRelief: boolean;
  coaxDetails: CoaxAssemblyDetails;
  wiringStandard: WiringStandardType;
  onTestComplete: (utpPassed: boolean, coaxPassed: boolean) => void;
}

export const CableTesterSimulation: React.FC<CableTesterSimulationProps> = ({
  sideASequence,
  sideBSequence,
  sideACrimped,
  sideBCrimped,
  sideAStrippingMm,
  coaxDetails,
  onTestComplete,
}) => {
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activePinIndex, setActivePinIndex] = useState<number>(0);
  const [activeTestMode, setActiveTestMode] = useState<'utp' | 'coax'>('utp');
  const [testRunCount, setTestRunCount] = useState<number>(0);

  // UTP Analysis
  const isBothCrimped = sideACrimped && sideBCrimped;
  const isStrippingGood = sideAStrippingMm >= 12 && sideAStrippingMm <= 15;

  // Determine wiremap mapping between Side A and Side B
  const pinMapping: number[] = []; // for pin i (0..7) in Side A, which pin (0..7) in Side B has same color?
  for (let i = 0; i < 8; i++) {
    const colorA = sideASequence[i];
    const matchIdx = sideBSequence.indexOf(colorA!);
    pinMapping.push(matchIdx);
  }

  const isStraightMatched = pinMapping.every((targetIdx, srcIdx) => targetIdx === srcIdx);
  const isUtpPassed = isBothCrimped && isStraightMatched && sideASequence[0] === T568B_COLOR_SEQUENCE[0];

  // Coax Analysis
  const isCoaxPassed =
    coaxDetails.jacketStripped &&
    coaxDetails.braidFoldedBack &&
    coaxDetails.dielectricTrimmed &&
    coaxDetails.bncFitted &&
    coaxDetails.compressionCrimped &&
    !coaxDetails.hasShort;

  // LED cycling timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTesting && activeTestMode === 'utp') {
      interval = setInterval(() => {
        setActivePinIndex((prev) => {
          const next = (prev + 1) % 8;
          if (next === 0) {
            setTestRunCount((c) => c + 1);
          }
          return next;
        });
      }, 400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTesting, activeTestMode]);

  useEffect(() => {
    if (testRunCount >= 1) {
      onTestComplete(isUtpPassed, isCoaxPassed);
    }
  }, [testRunCount, isUtpPassed, isCoaxPassed, onTestComplete]);

  const startTest = () => {
    setIsTesting(true);
    setActivePinIndex(0);
    setTestRunCount(0);
  };

  const remoteActivePin = isBothCrimped ? pinMapping[activePinIndex] : -1;

  return (
    <div className="space-y-6 text-xs select-none">
      {/* Test Mode Selector */}
      <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-2xl p-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTestMode('utp')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTestMode === 'utp'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔌 เครื่องวัดสายแลน RJ45 Wiremap Tester</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                isUtpPassed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              {isUtpPassed ? 'PASS' : 'TEST NEEDED'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTestMode('coax')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTestMode === 'coax'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📹 มอนิเตอร์สัญญาณกล้อง Coaxial BNC Live</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                isCoaxPassed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              {isCoaxPassed ? 'SIGNAL ONLINE' : 'NO SIGNAL'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={startTest}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer transition-all flex items-center gap-1.5"
        >
          <span>▶</span>
          <span>{isTesting ? 'รีสตาร์ทการทดสอบ (Retest)' : 'เริ่มทดสอบสัญญาณ (Start Test)'}</span>
        </button>
      </div>

      {/* ========================================================
          MODE 1: UTP DUAL-UNIT RJ45 TESTER SIMULATION
         ======================================================== */}
      {activeTestMode === 'utp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MASTER UNIT (Side A) */}
            <div className="bg-slate-950/90 border border-sky-500/40 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 block uppercase">MASTER UNIT</span>
                  <strong className="text-sm text-white">หัวต่อ RJ45 ฝั่ง A (ต้นทาง)</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isTesting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-slate-400">
                    {isTesting ? 'TX ACTIVE' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Master 8-Pin LED Array */}
              <div className="grid grid-cols-8 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const isCurrentLit = isTesting && activePinIndex === idx;
                  const wireColor = sideASequence[idx];

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-2xl border text-center transition-all ${
                        isCurrentLit
                          ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/40 scale-105'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 block">Pin {idx + 1}</span>
                      <div
                        className={`w-4 h-4 rounded-full mx-auto my-1.5 border transition-all ${
                          isCurrentLit
                            ? 'bg-emerald-400 border-emerald-200 shadow-lg shadow-emerald-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full mx-auto border border-black/50"
                        style={{ backgroundColor: COLOR_HEX_MAP[wireColor!] || '#fff' }}
                        title={wireColor}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between pt-1 font-mono">
                <span>สถานะการย้ำ: {sideACrimped ? '✓ Crimped' : '⚠️ Not Crimped'}</span>
                <span>ระยะปอก: {sideAStrippingMm}mm</span>
              </div>
            </div>

            {/* REMOTE UNIT (Side B) */}
            <div className="bg-slate-950/90 border border-purple-500/40 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 block uppercase">REMOTE UNIT</span>
                  <strong className="text-sm text-white">หัวต่อ RJ45 ฝั่ง B (ปลายทาง)</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isTesting ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-slate-400">
                    {isTesting ? 'RX SYNC' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Remote 8-Pin LED Array */}
              <div className="grid grid-cols-8 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const isCurrentLit = isTesting && remoteActivePin === idx;
                  const wireColor = sideBSequence[idx];
                  const isMappedCorrectly = isCurrentLit && remoteActivePin === activePinIndex;

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-2xl border text-center transition-all ${
                        isCurrentLit
                          ? isMappedCorrectly
                            ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/40 scale-105'
                            : 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/40 scale-105'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 block">Pin {idx + 1}</span>
                      <div
                        className={`w-4 h-4 rounded-full mx-auto my-1.5 border transition-all ${
                          isCurrentLit
                            ? isMappedCorrectly
                              ? 'bg-emerald-400 border-emerald-200 shadow-lg shadow-emerald-400'
                              : 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full mx-auto border border-black/50"
                        style={{ backgroundColor: COLOR_HEX_MAP[wireColor!] || '#fff' }}
                        title={wireColor}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between pt-1 font-mono">
                <span>สถานะการย้ำ: {sideBCrimped ? '✓ Crimped' : '⚠️ Not Crimped'}</span>
                <span>
                  {typeof remoteActivePin === 'number' && remoteActivePin !== -1 && remoteActivePin !== activePinIndex && isTesting
                    ? `⚠️ Crossed: P${activePinIndex + 1} ➔ P${remoteActivePin + 1}`
                    : 'Sync: Straight Wiremap'}
                </span>
              </div>
            </div>
          </div>

          {/* Tester Diagnostic Status Bar */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              !isBothCrimped
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                : isUtpPassed
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {!isBothCrimped ? '⚠️' : isUtpPassed ? '🎉' : '❌'}
              </span>
              <div>
                <strong className="text-sm block">
                  {!isBothCrimped
                    ? 'กรุณาย้ำหัวต่อ RJ45 ให้ครบทั้งสองฝั่ง (Side A & Side B) ก่อนวัดสัญญาณ'
                    : isUtpPassed
                    ? 'ผลการทดสอบ: ผ่านมาตรฐานสมบูรณ์แบบ (1000BASE-T Gigabit Compliant) ไฟวิ่งตรงกัน 1 ถึง 8'
                    : 'ผลการทดสอบ: พบข้อผิดพลาดของคู่สาย (Miswired / Crossed / Non-standard)'}
                </strong>
                <span className="text-[11px] opacity-80 block mt-0.5">
                  {!isStrippingGood
                    ? '⚠️ ข้อควรระวัง: ระยะปอกสายไม่ได้อยู่ในช่วงมาตรฐาน 12-15mm'
                    : 'สัญญาณข้อมูล TX+/TX-, RX+/RX- และ PoE Power ส่งผ่านได้เต็มประสิทธิภาพโดยไม่มี Packet Loss'}
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs uppercase font-bold px-3 py-1 bg-black/40 rounded-xl">
                {isUtpPassed ? 'PASSED 100%' : 'FAULT DETECTED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: COAXIAL BNC CCTV LIVE VIDEO SIGNAL OUTPUT
         ======================================================== */}
      {activeTestMode === 'coax' && (
        <div className="space-y-4">
          {/* Simulated CCTV Screen Container */}
          <div className="bg-black rounded-3xl border-4 border-slate-800 p-3 shadow-2xl relative overflow-hidden aspect-video max-h-[380px] flex items-center justify-center">
            {/* Screen Content */}
            {isCoaxPassed ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex flex-col justify-between p-4">
                {/* Simulated CCTV Camera Feed Visual Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-sky-950/60 to-emerald-950/40 flex items-center justify-center">
                  <div className="w-full h-full opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                {/* CCTV OSD Overlay (Top) */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>REC · CAM-01 [NORTH_GATE]</span>
                  </div>
                  <div>
                    <span>2026-09-24 10:45:00 · 30 FPS · 3840x2160 (4K UHD)</span>
                  </div>
                </div>

                {/* CCTV Center Reticle */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 border border-emerald-400/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 mt-2 bg-black/70 px-2 py-0.5 rounded">
                    75Ω IMPEDANCE MATCHED · NO SIGNAL LOSS
                  </span>
                </div>

                {/* CCTV OSD Overlay (Bottom) */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <span>SIGNAL: 1.0 Vp-p Analog HD (AHD/TVI)</span>
                  <span>BNC TYPE: {coaxDetails.bncType} COMPRESSION</span>
                  <span className="text-emerald-400">STATUS: LIVE FEED PASS</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="text-5xl text-rose-500 animate-pulse">📡 ✕</div>
                <div>
                  <strong className="text-base text-rose-400 font-mono block">
                    {coaxDetails.hasShort
                      ? 'VIDEO SIGNAL ERROR: SHORT-CIRCUIT DETECTED (0.0 Ω)'
                      : !coaxDetails.compressionCrimped
                      ? 'NO CARRIER / BNC NOT CRIMPER-LOCKED'
                      : 'NO VIDEO SIGNAL DETECTED'}
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                    {coaxDetails.hasShort
                      ? 'เกิดการลัดวงจรระหว่างแกนทองแดงกลางกับชิลด์ถัก ทำให้สัญญาณภาพ 1.0 Vp-p ดับสนิท กรุณากลับไปขั้นตอนที่ 3 เพื่อแก้ไข'
                      : 'กรุณาดำเนินการเข้าหัวสาย Coaxial RG6 ให้ครบ 4 ขั้นตอนและกดย้ำหัว BNC ให้แน่นหนา'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic Info */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>
                <strong>การตรวจเช็กทางไฟฟ้า:</strong>{' '}
                {coaxDetails.hasShort ? (
                  <span className="text-rose-400 font-bold">ชิลด์ช็อตแกนกลาง (Short)</span>
                ) : (
                  <span className="text-emerald-400 font-bold">แยกฉนวนสมบูรณ์ (∞ Ω)</span>
                )}
              </div>
              <div>
                <strong>การย้ำล็อกหัวต่อ:</strong>{' '}
                {coaxDetails.compressionCrimped ? (
                  <span className="text-emerald-400 font-bold">บีบอัดล็อกแน่นหนา (Pass)</span>
                ) : (
                  <span className="text-amber-400 font-bold">ยังไม่บีบอัด</span>
                )}
              </div>
            </div>

            <div className="font-mono text-xs">
              {isCoaxPassed ? (
                <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold">
                  ✓ ภาพคมชัดระดับ 4K ส่งสัญญาณสำเร็จ
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl font-bold">
                  ⚠️ สัญญาณขัดข้อง
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
