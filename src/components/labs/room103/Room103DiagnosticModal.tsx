'use client';

import React, { useState } from 'react';
import { Station3Payload } from '../../../shared/domain/room103Types';

interface Room103DiagnosticModalProps {
  initialPayload?: Partial<Station3Payload>;
  onSave: (payload: Station3Payload) => void;
  onClose: () => void;
}

const CASE3_KEYWORDS = [
  { key: 'cca', label: 'CCA / Copper Clad Aluminum', terms: ['cca', 'อลูมิเนียม'] },
  { key: 'resistance', label: 'ความต้านทานสูง (Higher Resistance)', terms: ['ความต้านทาน', 'resistance', 'โอห์ม', 'ohm'] },
  { key: 'voltage_drop', label: 'แรงดันตก (Voltage Drop)', terms: ['แรงดันตก', 'voltage drop', 'โวลต์ตก', 'drop'] },
  { key: 'bare_copper', label: 'ทองแดงแท้ (Bare Pure Copper)', terms: ['ทองแดงแท้', 'pure copper', 'bare copper', 'แกนทองแดง'] },
  { key: 'emi_rfi', label: 'สัญญาณรบกวน EMI/RFI', terms: ['emi', 'rfi', 'คลื่นแม่เหล็ก', 'สัญญาณกวน', 'noise'] },
  { key: 'stp_ftp', label: 'สาย STP/FTP มีฟอยล์ชิลด์', terms: ['stp', 'ftp', 'shield', 'ฟอยล์', 'ชีลด์'] },
  { key: 'drain_wire', label: 'Drain Wire สายกราวด์ชิลด์', terms: ['drain wire', 'เดรน', 'สายระบาย'] },
  { key: 'grounding', label: 'การลงกราวด์ตู้ Rack (Shield Grounding)', terms: ['กราวด์', 'ground', 'ลงดิน', 'ตู้ rack'] },
  { key: 'retest', label: 'การทดสอบซ้ำ (Retest)', terms: ['retest', 'ทดสอบซ้ำ', 'ตรวจซ้ำ', 'วัดซ้ำ'] },
];

export const Room103DiagnosticModal: React.FC<Room103DiagnosticModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'case1' | 'case2' | 'case3'>('case1');

  // Case 1 State
  const [case1UtpTool, setCase1UtpTool] = useState<'CABLE_TESTER' | 'MULTIMETER' | 'VISUAL_ONLY'>(
    initialPayload?.case1Testing?.selectedUtpTool || 'CABLE_TESTER'
  );
  const [case1CoaxTool, setCase1CoaxTool] = useState<'MULTIMETER_CONTINUITY' | 'CABLE_TESTER' | 'NONE'>(
    initialPayload?.case1Testing?.selectedCoaxTool || 'MULTIMETER_CONTINUITY'
  );
  const [case1FaultType, setCase1FaultType] = useState<'CROSSED_AND_OPEN' | 'PERFECT' | 'TOTAL_SHORT'>(
    initialPayload?.case1Testing?.identifiedFaultType || 'CROSSED_AND_OPEN'
  );
  const [case1Explanation, setCase1Explanation] = useState(
    initialPayload?.case1Testing?.faultExplanation ||
      'ตรวจพบพิน 3 และ 6 สลับคู่ (Crossed Pair) และพิน 7-8 ขาดวงจร (Open) ต้องตัดเข้าหัว RJ45 ใหม่ตาม T568B และตรวจไม่ให้แกนกลาง Coax แตะ Shield'
  );
  const [case1RetestPassed, setCase1RetestPassed] = useState(
    initialPayload?.case1Testing?.retestPassed ?? true
  );

  // Case 2 State (PoE Calculator)
  const [switchBudget, setSwitchBudget] = useState<number>(
    initialPayload?.case2PoEBudget?.switchPoEBudgetWatts ?? 65
  );
  const [cameraWattage, setCameraWattage] = useState<number>(
    initialPayload?.case2PoEBudget?.cameraWattage ?? 8
  );
  const [accessoriesWattage, setAccessoriesWattage] = useState<number>(
    initialPayload?.case2PoEBudget?.accessoriesWattage ?? 5
  );
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<number>(
    initialPayload?.case2PoEBudget?.safetyMarginPercent ?? 20
  );
  const [cameraCount, setCameraCount] = useState<number>(
    initialPayload?.case2PoEBudget?.cameraCount ?? 4
  );

  // Calculations for Case 2
  const wattsPerCamera = (cameraWattage + accessoriesWattage) * (1 + safetyMarginPercent / 100);
  const totalSystemWatts = parseFloat((wattsPerCamera * cameraCount).toFixed(1));
  const isBudgetSufficient = totalSystemWatts <= switchBudget;

  // Case 3 State (Written Diagnostic)
  const [ccaResistanceAnswer, setCcaResistanceAnswer] = useState(
    initialPayload?.case3CcaEmi?.ccaResistanceAnswer ||
      'สาย CCA (Copper Clad Aluminum) เป็นแกนอลูมิเนียมเคลือบผิวทองแดง มีความต้านทานไฟฟ้าสูงกว่าทองแดงแท้มาก เมื่อเดินสายระยะทางไกลและจ่ายไฟ PoE 48V จะเกิด Voltage Drop ทำให้แรงดันตกเหลือเพียง 36V ที่ปลายทาง กล้องจึงดับหรือรีบูตตัวเองเมื่อดึงกระแสสูง'
  );
  const [emiNoiseAnswer, setEmiNoiseAnswer] = useState(
    initialPayload?.case3CcaEmi?.emiNoiseAnswer ||
      'มอเตอร์สายพานและตู้ควบคุมอินเวอร์เตอร์สร้างสัญญาณรบกวนคลื่นแม่เหล็กไฟฟ้า (EMI/RFI) เหนี่ยวนำเข้าสู่สายสัญญาณ UTP ธรรมดา ทำให้แพ็กเก็ตข้อมูลสูญหาย ภาพกระตุก ลาย หรือขาดการเชื่อมต่อ'
  );
  const [groundingSolutionAnswer, setGroundingSolutionAnswer] = useState(
    initialPayload?.case3CcaEmi?.groundingSolutionAnswer ||
      'แก้ไขโดยเปลี่ยนมาใช้สาย STP/FTP Cat6 เกรดทองแดงแท้ (Pure Bare Copper) แยกแนวท่อร้อยสายห่างจากสายไฟกำลังอย่างน้อย 30 ซม. ต่อสายระบาย (Drain Wire) ลงกราวด์ที่ตู้ Rack ปลายทางเพียงจุดเดียว (Single-point Grounding) เพื่อป้องกัน Ground Loop จากนั้นทำ Retest วัดแรงดันปลายทางและ Ping Test ต่อเนื่อง'
  );

  // Calculate matched keywords in Case 3
  const allCase3Text = `${ccaResistanceAnswer} ${emiNoiseAnswer} ${groundingSolutionAnswer}`.toLowerCase();
  const matchedKeywords = CASE3_KEYWORDS.filter((item) =>
    item.terms.some((term) => allCase3Text.includes(term.toLowerCase()))
  ).map((item) => item.label);

  // Scoring Logic
  // Case 1: 10 pts
  let scoreCase1 = 0;
  if (case1UtpTool === 'CABLE_TESTER') scoreCase1 += 3;
  if (case1CoaxTool === 'MULTIMETER_CONTINUITY') scoreCase1 += 3;
  if (case1FaultType === 'CROSSED_AND_OPEN') scoreCase1 += 2;
  if (case1RetestPassed) scoreCase1 += 2;

  // Case 2: 10 pts
  let scoreCase2 = 0;
  if (switchBudget >= 60) scoreCase2 += 2;
  if (Math.abs(wattsPerCamera - 15.6) < 0.1) scoreCase2 += 3;
  if (Math.abs(totalSystemWatts - 62.4) < 0.2) scoreCase2 += 3;
  if (isBudgetSufficient) scoreCase2 += 2;

  // Case 3: 10 pts (pro-rated by keywords and content length)
  const keywordRatio = Math.min(1, matchedKeywords.length / 7);
  const lengthOk =
    ccaResistanceAnswer.length >= 30 &&
    emiNoiseAnswer.length >= 30 &&
    groundingSolutionAnswer.length >= 40;
  const scoreCase3 = Math.round(keywordRatio * 8 + (lengthOk ? 2 : 0));

  const totalStation3Score = scoreCase1 + scoreCase2 + scoreCase3;

  const handleSaveAndSubmit = () => {
    const payload: Station3Payload = {
      case1Testing: {
        selectedUtpTool: case1UtpTool,
        selectedCoaxTool: case1CoaxTool,
        identifiedFaultType: case1FaultType,
        faultExplanation: case1Explanation,
        retestPassed: case1RetestPassed,
        score: scoreCase1,
      },
      case2PoEBudget: {
        switchPoEBudgetWatts: switchBudget,
        cameraWattage,
        accessoriesWattage,
        safetyMarginPercent,
        cameraCount,
        calculatedWattsPerCamera: parseFloat(wattsPerCamera.toFixed(1)),
        calculatedTotalSystemWatts: totalSystemWatts,
        isBudgetSufficient,
        score: scoreCase2,
      },
      case3CcaEmi: {
        ccaResistanceAnswer,
        emiNoiseAnswer,
        groundingSolutionAnswer,
        keywordsFound: matchedKeywords,
        score: scoreCase3,
      },
      totalScore: totalStation3Score,
      isCompleted: true,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base">
              3
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Station 3: การทดสอบสาย คำนวณ PoE และวินิจฉัยปัญหาเชิงช่าง
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  30 คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cable Diagnostics, Interactive PoE Power Budget Calculator & CCA/EMI Root-Cause Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">คะแนนสะสมสถานี</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalStation3Score}/30
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('case1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'case1'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔌 กรณีที่ 1: Wiremap & Continuity Test</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/30 font-mono">
              {scoreCase1}/10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('case2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'case2'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚡ กรณีที่ 2: PoE Power Budget Calculator</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/30 font-mono">
              {scoreCase2}/10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('case3')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'case3'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>📝 กรณีที่ 3: วินิจฉัย CCA & EMI มอเตอร์</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/30 font-mono">
              {scoreCase3}/10
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Wiremap & Continuity Test */}
          {activeTab === 'case1' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>เครื่องมือทดสอบสายสัญญาณและการอ่านค่าความผิดปกติ (Wiremap Tester)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      เลือกเครื่องมือทดสอบให้ถูกต้องตามชนิดสาย (UTP และ Coaxial) และวินิจฉัยความผิดปกติจากสถานะ LED
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono">
                    10 คะแนนเต็ม
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* UTP Tool Choice */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      1. เลือกเครื่องมือสำหรับทดสอบสาย UTP Cat6 8 พิน:
                    </label>
                    <select
                      value={case1UtpTool}
                      onChange={(e) => setCase1UtpTool(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="CABLE_TESTER">Cable Continuity Tester (LED 8-Pin Wiremap) [ถูกต้อง]</option>
                      <option value="MULTIMETER">Multimeter (วัดความต้านทานทีละเส้น - ช้า)</option>
                      <option value="VISUAL_ONLY">มองด้วยสายตาเปล่า (ไม่สามารถตรวจพบพินขาดใน)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      เครื่อง Cable Tester สามารถตรวจจับ Miswire, Open, Short, Crossed Pair ได้ครบถ้วน
                    </p>
                  </div>

                  {/* Coaxial Tool Choice */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      2. เลือกเครื่องมือสำหรับทดสอบสาย Coaxial RG6 / BNC:
                    </label>
                    <select
                      value={case1CoaxTool}
                      onChange={(e) => setCase1CoaxTool(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="MULTIMETER_CONTINUITY">Multimeter โหมด Beep Continuity ตรวจช็อตแกนกลาง-ชิลด์ [ถูกต้อง]</option>
                      <option value="CABLE_TESTER">Cable Continuity Tester แบบ RJ45 ธรรมดา (ไม่เสียบหัว BNC)</option>
                      <option value="NONE">ไม่จำเป็นต้องทดสอบสาย Coaxial</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      ตรวจความต่อเนื่องของแกนทองแดงแท้ และยืนยันว่าแกนกลางต้องไม่ลัดวงจรกับ Shield (ห้ามมีเสียง Beep ระหว่าง Core กับ Shield)
                    </p>
                  </div>
                </div>

                {/* Simulated Wiremap Display */}
                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">
                      ผลการสแกนพินจากเครื่อง Cable Continuity Tester จำลอง (Master vs Remote):
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                      ⚠ พบความผิดปกติ (FAIL)
                    </span>
                  </div>

                  {/* 8 Pin Wiremap Table */}
                  <div className="grid grid-cols-8 gap-1.5 text-center font-mono text-xs">
                    {[
                      { pin: 1, remote: 1, ok: true },
                      { pin: 2, remote: 2, ok: true },
                      { pin: 3, remote: 6, ok: false, note: 'Crossed 3↔6' },
                      { pin: 4, remote: 4, ok: true },
                      { pin: 5, remote: 5, ok: true },
                      { pin: 6, remote: 3, ok: false, note: 'Crossed 6↔3' },
                      { pin: 7, remote: 0, ok: false, note: 'OPEN' },
                      { pin: 8, remote: 0, ok: false, note: 'OPEN' },
                    ].map((item) => (
                      <div
                        key={item.pin}
                        className={`p-2 rounded-lg border ${
                          item.ok
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/50 border-rose-500/60 text-rose-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400">พิน {item.pin}</div>
                        <div className="font-bold text-sm my-0.5">
                          {item.remote === 0 ? '✕' : `→ ${item.remote}`}
                        </div>
                        <div className="text-[9px] font-sans truncate">
                          {item.ok ? '✓ PASS' : item.note}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fault Identification Selection */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      วินิจฉัยประเภทความผิดพลาด (Fault Diagnosis):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: 'CROSSED_AND_OPEN',
                          label: 'Crossed Pair (พิน 3-6 สลับ) และ Open Circuit (พิน 7-8 ขาด)',
                          correct: true,
                        },
                        {
                          id: 'PERFECT',
                          label: 'สายปกติสมบูรณ์ทุกพิน (Straight Through)',
                          correct: false,
                        },
                        {
                          id: 'TOTAL_SHORT',
                          label: 'ช็อตรวมทุกพิน (Complete Short Circuit)',
                          correct: false,
                        },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setCase1FaultType(f.id as any)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            case1FaultType === f.id
                              ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            <span>{f.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explanation Input */}
                  <div className="pt-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">
                      บันทึกข้อสังเกตและแนวทางแก้ไข (Technician Log):
                    </label>
                    <textarea
                      rows={2}
                      value={case1Explanation}
                      onChange={(e) => setCase1Explanation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                      placeholder="บันทึกข้อผิดพลาดที่พบและขั้นตอนการแก้ไข..."
                    />
                  </div>

                  {/* Retest Passed Checkbox */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={case1RetestPassed}
                        onChange={(e) => setCase1RetestPassed(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        ดำเนินการตัดหัวเข้าใหม่ตามมาตรฐาน T568B และทำ <strong>Retest ผลผ่าน 8/8 พิน</strong>
                      </span>
                    </label>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      {case1RetestPassed ? '✓ Retest Passed' : '⚠ ยังไม่ Retest'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PoE Power Budget Calculator */}
          {activeTab === 'case2' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>คำนวณ PoE Power Budget และความเพียงพอของการจ่ายไฟกล้อง</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      อ้างอิงสูตร: กำลังไฟต่อจุด = (กำลังไฟกล้อง + อุปกรณ์เสริม) × (1 + Safety Margin)
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono">
                    10 คะแนนเต็ม
                  </span>
                </div>

                {/* Interactive Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Switch PoE Budget */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      กำลังไฟรวมของ PoE Switch (Watts):
                    </label>
                    <input
                      type="number"
                      value={switchBudget}
                      onChange={(e) => setSwitchBudget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">แนะนำ: 65W (Switch 4-Port PoE+)</span>
                  </div>

                  {/* Camera Base Wattage */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      กำลังไฟกล้องตัวหลัก (Camera Wattage):
                    </label>
                    <input
                      type="number"
                      value={cameraWattage}
                      onChange={(e) => setCameraWattage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">มาตรฐาน: 8W (IP Camera 4K Day mode)</span>
                  </div>

                  {/* Accessories (IR / Heater) */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      อุปกรณ์เสริม (IR Night / Heater):
                    </label>
                    <input
                      type="number"
                      value={accessoriesWattage}
                      onChange={(e) => setAccessoriesWattage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">มาตรฐาน: 5W (Smart IR Matrix)</span>
                  </div>

                  {/* Safety Margin */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      Safety Margin สำรองความปลอดภัย (%):
                    </label>
                    <input
                      type="number"
                      value={safetyMarginPercent}
                      onChange={(e) => setSafetyMarginPercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">มาตรฐาน: 20% (คูณ 1.20)</span>
                  </div>

                  {/* Camera Count */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      จำนวนกล้องทั้งหมด (จุด):
                    </label>
                    <input
                      type="number"
                      value={cameraCount}
                      onChange={(e) => setCameraCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">ตัวอย่างในโจทย์: 4 กล้อง</span>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      ผลการคำนวณตามสูตรทางวิศวกรรม
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold font-mono ${
                        isBudgetSufficient
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isBudgetSufficient
                        ? '✓ PoE Budget เพียงพอต่อระบบ (SUFFICIENT)'
                        : '⚠ PoE Budget ไม่เพียงพอ (OVERLOAD RISK)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-sans">กำลังไฟต่อจุด (รวม Safety Margin)</span>
                      <span className="text-lg font-bold text-sky-400">
                        ({cameraWattage} + {accessoriesWattage}) × {1 + safetyMarginPercent / 100} = {wattsPerCamera.toFixed(1)}W
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-sans">กำลังไฟรวมทั้งระบบ ({cameraCount} กล้อง)</span>
                      <span className="text-lg font-bold text-amber-400">
                        {wattsPerCamera.toFixed(1)}W × {cameraCount} = {totalSystemWatts}W
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block font-sans">ความจุ PoE Switch</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {switchBudget}W ({totalSystemWatts}W ≤ {switchBudget}W)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    💡 <strong>หลักการช่าง:</strong> เมื่อใช้งานจริง หากกำลังไฟรวม ({totalSystemWatts}W) เกินพิกัดสวิตช์ ({switchBudget}W) ช่างต้องอัปเกรดเป็น Switch PoE ที่มี Power Budget สูงขึ้น (เช่น 120W) หรือติดตั้ง PoE Injector แยกจ่ายเฉพาะจุดกล้องที่มี Heater
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CCA & Motor EMI Diagnosis */}
          {activeTab === 'case3' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>กรณีศึกษา: วิเคราะห์ปัญหากล้องดับจากสาย CCA และคลื่นรบกวนมอเตอร์</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      สถานการณ์: กล้องดับเมื่อมอเตอร์ทำงาน วัดไฟ 48V ต้นทางแต่ปลายทางเหลือ 36V และพบแกนสายเป็น CCA
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono">
                    10 คะแนนเต็ม
                  </span>
                </div>

                {/* Keyword Match Badges */}
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">
                      คำสำคัญทางวิศวกรรมที่ตรวจพบ ({matchedKeywords.length}/{CASE3_KEYWORDS.length}):
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      คะแนนการวินิจฉัย: {scoreCase3}/10
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CASE3_KEYWORDS.map((kw) => {
                      const isFound = matchedKeywords.includes(kw.label);
                      return (
                        <span
                          key={kw.key}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono border transition-all ${
                            isFound
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {isFound ? '✓ ' : ''}
                          {kw.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Field 1: CCA & Resistance */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      1. อธิบายความสัมพันธ์ระหว่างสาย CCA, ความต้านทาน และอาการ PoE Voltage Drop:
                    </label>
                    <textarea
                      rows={3}
                      value={ccaResistanceAnswer}
                      onChange={(e) => setCcaResistanceAnswer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                      placeholder="อธิบายเหตุผลเรื่องแกนอลูมิเนียมเคลือบทองแดง ความต้านทานโอห์มสูง และแรงดันตก..."
                    />
                  </div>

                  {/* Field 2: Motor EMI */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      2. อธิบายสาเหตุที่มอเตอร์สายพานเหนี่ยวนำคลื่นรบกวน (EMI/RFI) เข้าสู่สายสัญญาณ:
                    </label>
                    <textarea
                      rows={3}
                      value={emiNoiseAnswer}
                      onChange={(e) => setEmiNoiseAnswer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                      placeholder="อธิบายเรื่องสนามแม่เหล็กไฟฟ้าเหนี่ยวนำ สัญญาณกวนความถี่สูง และผลต่อแพ็กเก็ตข้อมูล..."
                    />
                  </div>

                  {/* Field 3: Solution & Retest */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      3. เสนอแนวทางแก้ไขเชิงช่าง (ชนิดสาย, การเดินท่อ, การต่อ Drain Wire/Ground) และวิธี Retest:
                    </label>
                    <textarea
                      rows={3}
                      value={groundingSolutionAnswer}
                      onChange={(e) => setGroundingSolutionAnswer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                      placeholder="เสนอการเปลี่ยนเป็นสาย STP/FTP ทองแดงแท้, ต่อสายเดรนลงกราวด์ตู้แร็ค, รักษาระยะห่างสายไฟ และ Retest..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            สถานะ: <strong className="text-indigo-400 font-mono">Station 3 (30%)</strong> ·
            ต้องบันทึกและรวบรวมเพื่อส่งประเมินร่วมกับ Station 1 และ 2
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก / ปิด
            </button>

            <button
              onClick={handleSaveAndSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>💾 บันทึกผล Station 3</span>
              <span className="font-mono">({totalStation3Score}/30)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
