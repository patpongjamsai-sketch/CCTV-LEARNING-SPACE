'use client';

import React, { useState, useMemo } from 'react';
import {
  Station1DiagnosticPayload,
  DEFAULT_DIAGNOSTIC_STEPS,
  DiagnosticStepItem,
} from '../../../shared/domain/room107Types';

interface Room107DiagnosticStationModalProps {
  initialPayload?: Station1DiagnosticPayload;
  onSave: (payload: Station1DiagnosticPayload) => void;
  onClose: () => void;
}

export const Room107DiagnosticStationModal: React.FC<Room107DiagnosticStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [steps, setSteps] = useState<DiagnosticStepItem[]>(
    initialPayload?.diagnosticSteps || DEFAULT_DIAGNOSTIC_STEPS
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [measuredPoEVoltage, setMeasuredPoEVoltage] = useState<number>(
    initialPayload?.measuredPoEVoltage ?? 42.5
  );
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurementDone, setMeasurementDone] = useState<boolean>(
    Boolean(initialPayload?.voltageDropDetected || initialPayload?.isCompleted)
  );

  const [selectedPowerAction, setSelectedPowerAction] = useState<
    'UPGRADE_EXTENDER' | 'BOOST_INJECTOR' | 'REPLACE_CAT6' | 'REPLACE_CAMERA'
  >(initialPayload?.selectedPowerAction || 'UPGRADE_EXTENDER');

  const [powerActionApplied, setPowerActionApplied] = useState<boolean>(
    Boolean(initialPayload?.powerActionApplied || initialPayload?.isCompleted)
  );

  const [retestPoEVoltage, setRetestPoEVoltage] = useState<number>(
    initialPayload?.retestPoEVoltage ?? (initialPayload?.isCompleted ? 50.2 : 42.5)
  );
  const [noVideoResolved, setNoVideoResolved] = useState<boolean>(
    Boolean(initialPayload?.noVideoResolved || initialPayload?.isCompleted)
  );

  // Measure PoE voltage button handler
  const handleMeasureVoltage = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      setMeasuredPoEVoltage(42.5);
      setMeasurementDone(true);
      setIsMeasuring(false);
    }, 600);
  };

  // Apply power action & Retest
  const handleApplyPowerFix = () => {
    setPowerActionApplied(true);
    if (selectedPowerAction === 'UPGRADE_EXTENDER' || selectedPowerAction === 'REPLACE_CAT6') {
      setRetestPoEVoltage(50.2);
      setNoVideoResolved(true);
    } else if (selectedPowerAction === 'BOOST_INJECTOR') {
      setRetestPoEVoltage(48.5);
      setNoVideoResolved(true);
    } else {
      setRetestPoEVoltage(42.5); // Camera replacement doesn't fix voltage drop
      setNoVideoResolved(false);
    }
  };

  // Scoring rubric (40 pts max):
  // 1. Diagnostic Steps review & understanding: 10 pts
  // 2. PoE Measurement performed and voltage drop identified (42.5V < 48V): 15 pts
  // 3. Appropriate power resolution applied and Retest passed (>= 48V, NO_VIDEO cleared): 15 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sSteps = 10;
    let sMeasure = 0;
    let sFix = 0;

    if (measurementDone && measuredPoEVoltage < 45) {
      sMeasure = 15;
    }

    if (powerActionApplied && noVideoResolved && retestPoEVoltage >= 48) {
      sFix = 15;
    } else if (powerActionApplied) {
      sFix = 5;
    }

    const total = sSteps + sMeasure + sFix;
    return {
      scoreBreakdown: { sSteps, sMeasure, sFix },
      totalScore: Math.min(40, total),
    };
  }, [measurementDone, measuredPoEVoltage, powerActionApplied, noVideoResolved, retestPoEVoltage]);

  const handleSaveAndSubmit = () => {
    const payload: Station1DiagnosticPayload = {
      faultDeviceId: 'CAM-03',
      diagnosticSteps: steps,
      measuredPoEVoltage,
      nominalPoEVoltage: 48.0,
      cableDistanceMeters: 110,
      voltageDropDetected: measuredPoEVoltage < 45,
      selectedPowerAction,
      powerActionApplied,
      retestPoEVoltage,
      noVideoResolved,
      score: totalScore,
      isCompleted: totalScore >= 30 && noVideoResolved,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-rose-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Room 107 · Station 1
                </span>
                <span className="text-[11px] font-mono text-slate-400">Diagnostic Tree &amp; Voltage Drop</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                การวินิจฉัยปัญหา NO VIDEO &amp; แรงดันไฟตก (Voltage Drop)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400">คะแนนสถานี: </span>
              <span className="text-lg font-bold text-emerald-400">{totalScore}</span>
              <span className="text-xs text-slate-500"> / 40</span>
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
          
          {/* Fault Incident Alert */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-rose-300 flex items-center gap-2 text-sm">
                <span>⚠️ รายงานข้อผิดพลาด: CAM-03 อาการ NO VIDEO (ภาพไม่ขึ้น / รีบูตวน)</span>
              </h3>
              <span className="text-[11px] bg-rose-900/60 px-2.5 py-0.5 rounded-full text-rose-200 border border-rose-600 font-mono font-bold">
                INCIDENT ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              กล้อง CAM-03 ติดตั้งบริเวณลานจอดรถด้านหลัง ใช้สาย Cat5e ลากยาว 110 เมตร เชื่อมต่อไปยัง PoE Switch กล้องแสดงไฟ Link ติดดับวนซ้ำ ภาพบน NVR เป็นหน้าจอสีดำสนิท
            </p>
          </div>

          {/* 6-Step Troubleshooting Diagnostic Tree */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🌳 1. ลำดับขั้นตอน Diagnostic Tree (6-Step Troubleshooting)</span>
              </h3>
              <span className="text-[10px] text-sky-400 font-mono">10 / 10 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {steps.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeStepIndex === idx
                      ? 'bg-sky-950/70 border-sky-500 text-sky-200 shadow-md'
                      : st.status === 'FAULT_FOUND'
                      ? 'bg-rose-950/40 border-rose-700/60 text-rose-300 hover:border-rose-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{st.nameTh.split('.')[0]}. {st.id}</div>
                  <div className="text-[9px] text-slate-400 mt-1 truncate">{st.nameTh.split('(')[0]}</div>
                  <span className={`inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    st.status === 'FAULT_FOUND' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {st.status === 'FAULT_FOUND' ? '● พบปัญหา' : '✓ ปกติ'}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
              <div className="font-bold text-sky-300">{steps[activeStepIndex].nameTh}</div>
              <div className="text-slate-400">{steps[activeStepIndex].description}</div>
              <div className="mt-1 text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-500/30">
                <strong>ผลการตรวจสอบ:</strong> {steps[activeStepIndex].findings}
              </div>
            </div>
          </div>

          {/* Multimeter PoE Measurement */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>📟 2. วัดแรงดันไฟฟ้าตกด้วย Digital Multimeter / PoE Tester</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono">15 / 15 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Multimeter Digital Readout Panel */}
              <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 shadow-inner">
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  TRUE RMS DIGITAL MULTIMETER (DC VOLTS)
                </div>
                <div className="w-full bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-center shadow-inner">
                  <span className="font-mono text-3xl font-extrabold text-emerald-400 tracking-wider">
                    {isMeasuring ? '---.-' : measurementDone ? `${measuredPoEVoltage.toFixed(1)} V` : '0.0 V'}
                  </span>
                  <div className="text-[9px] text-emerald-500/80 mt-1 font-mono">
                    {measurementDone && measuredPoEVoltage < 45
                      ? '⚠️ UNDERVOLTAGE: ต่ำกว่าพิกัดมาตรฐาน (48.0V - 54.0V)'
                      : measurementDone
                      ? '✓ VOLTAGE NORMAL: แรงดันปกติ'
                      : 'พร้อมวัดแรงดันที่ปลายสาย CAM-03'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMeasureVoltage}
                  disabled={isMeasuring}
                  className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isMeasuring ? 'กำลังวัดแรงดัน...' : '⚡ จิ้มสายวัดแรงดัน (Test PoE at CAM-03)'}
                </button>
              </div>

              {/* Engineering Analysis Box */}
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">สาเหตุทางเทคนิค (Physics of Cable Drop):</div>
                  <div>ความยาวสาย: <strong className="text-rose-400">110 เมตร</strong> (เกินลิมิต 100 เมตร)</div>
                  <div>ขนาดสาย Cat5e แกนทองแดง CCA (ความต้านทานสูง ~14.5 Ω/100m)</div>
                  <div>กระแสโหลด 12W @ 48V = 0.25A ทำให้เกิดแรงดันตก <strong className="text-rose-400">~5.5V</strong></div>
                  <div>แรงดันเหลือจริง: <strong className="text-rose-400 font-mono">42.5V</strong> (กล้องต้องการอย่างน้อย 44.0V เพื่อทำงาน)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Remediation & Retest */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🔧 3. เลือกแนวทางแก้ไขปัญหาและ Retest ยืนยันผล</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">15 / 15 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-sky-500/60 cursor-pointer">
                <input
                  type="radio"
                  name="powerFix"
                  value="UPGRADE_EXTENDER"
                  checked={selectedPowerAction === 'UPGRADE_EXTENDER'}
                  onChange={() => setSelectedPowerAction('UPGRADE_EXTENDER')}
                  className="mt-1"
                />
                <div>
                  <strong className="text-sky-300 block">ติดตั้ง PoE Extender / Repeater กลางทาง</strong>
                  <span className="text-[10px] text-slate-400">
                    ขยายระยะสัญญาณและทวนกำลังไฟที่ระยะ 80 เมตร ช่วยยกแรงดันปลายสายกลับขึ้นมา 50.2V (แนะนำ)
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-sky-500/60 cursor-pointer">
                <input
                  type="radio"
                  name="powerFix"
                  value="REPLACE_CAT6"
                  checked={selectedPowerAction === 'REPLACE_CAT6'}
                  onChange={() => setSelectedPowerAction('REPLACE_CAT6')}
                  className="mt-1"
                />
                <div>
                  <strong className="text-sky-300 block">เปลี่ยนเป็นสาย Cat6 Pure Copper 23AWG</strong>
                  <span className="text-[10px] text-slate-400">
                    แกนทองแดงแท้ขนาดใหญ่ขึ้น ความต้านทานต่ำ ลดแรงดันตกปลายทางได้มากกว่า 60%
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-sky-500/60 cursor-pointer">
                <input
                  type="radio"
                  name="powerFix"
                  value="BOOST_INJECTOR"
                  checked={selectedPowerAction === 'BOOST_INJECTOR'}
                  onChange={() => setSelectedPowerAction('BOOST_INJECTOR')}
                  className="mt-1"
                />
                <div>
                  <strong className="text-sky-300 block">ใช้ High-Power PoE+ Injector (54V Output)</strong>
                  <span className="text-[10px] text-slate-400">
                    จ่ายแรงดันต้นทาง 54V ชดเชยแรงดันตกปลายสาย คงเหลือ 48.5V
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-sky-500/60 cursor-pointer">
                <input
                  type="radio"
                  name="powerFix"
                  value="REPLACE_CAMERA"
                  checked={selectedPowerAction === 'REPLACE_CAMERA'}
                  onChange={() => setSelectedPowerAction('REPLACE_CAMERA')}
                  className="mt-1"
                />
                <div>
                  <strong className="text-rose-300 block">เปลี่ยนตัวกล้อง CAM-03 ทันที (ไม่ตรงจุด)</strong>
                  <span className="text-[10px] text-slate-400">
                    กล้องไม่ได้เสีย ปัญหาอยู่ที่แรงดันไฟตก หากเปลี่ยนกล้องใหม่ก็ยังไม่ติดเหมือนเดิม
                  </span>
                </div>
              </label>
            </div>

            {/* Apply & Retest Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <button
                type="button"
                onClick={handleApplyPowerFix}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                🛠️ ปฏิบัติการแก้ไข &amp; Retest วัดแรงดันซ้ำ
              </button>

              {powerActionApplied && (
                <div className={`p-2 px-3 rounded-xl text-[11px] font-bold border flex items-center gap-2 ${
                  noVideoResolved
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                }`}>
                  <span>{noVideoResolved ? '✅' : '❌'}</span>
                  <span>
                    ผล Retest: แรงดัน {retestPoEVoltage.toFixed(1)}V · {noVideoResolved ? 'Link ปกติ กล้อง Online เคลียร์ NO_VIDEO แล้ว' : 'แรงดันไม่พอ กล้องยังไม่ติด'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          <div className="text-[11px] text-slate-400">
            Mandatory Checks: ต้องวัดแรงดันไฟตก และ Retest ยืนยันผลสำเร็จ
          </div>
          <button
            type="button"
            onClick={handleSaveAndSubmit}
            disabled={!noVideoResolved}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            บันทึกผล Station 1 ({totalScore}/40 คะแนน)
          </button>
        </div>
      </div>
    </div>
  );
};
