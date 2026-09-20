'use client';

import React, { useState, useMemo } from 'react';
import { Station1StorageCalculationPayload } from '../../../shared/domain/room106Types';

interface Room106StorageCalculationModalProps {
  initialPayload?: Partial<Station1StorageCalculationPayload>;
  onSave: (payload: Station1StorageCalculationPayload) => void;
  onClose: () => void;
}

interface PresetOption {
  label: string;
  resolution: string;
  codec: 'H.264' | 'H.265';
  defaultBitrateMbps: number;
}

const PRESETS: PresetOption[] = [
  { label: '1080p Full HD (H.264 - 4 Mbps)', resolution: '1080p (1920x1080)', codec: 'H.264', defaultBitrateMbps: 4.0 },
  { label: '1080p Full HD (H.265 - 2 Mbps)', resolution: '1080p (1920x1080)', codec: 'H.265', defaultBitrateMbps: 2.0 },
  { label: '4MP 2K Quad HD (H.265 - 3 Mbps)', resolution: '4MP (2560x1440)', codec: 'H.265', defaultBitrateMbps: 3.0 },
  { label: '8MP 4K Ultra HD (H.265 - 6 Mbps)', resolution: '4K (3840x2160)', codec: 'H.265', defaultBitrateMbps: 6.0 },
];

export const Room106StorageCalculationModal: React.FC<Room106StorageCalculationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [cameraCount, setCameraCount] = useState<number>(initialPayload?.cameraCount ?? 8);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [codec, setCodec] = useState<'H.264' | 'H.265'>(initialPayload?.codec ?? 'H.264');
  const [resolution, setResolution] = useState<string>(initialPayload?.resolution ?? '1080p (1920x1080)');
  const [bitrateMbps, setBitrateMbps] = useState<number>(initialPayload?.bitrateMbps ?? 4.0);
  const [recordingHoursPerDay, setRecordingHoursPerDay] = useState<number>(
    initialPayload?.recordingHoursPerDay ?? 24
  );
  const [retentionDays, setRetentionDays] = useState<number>(initialPayload?.retentionDays ?? 30);
  const [recommendedCapacityTb, setRecommendedCapacityTb] = useState<number>(
    initialPayload?.recommendedCapacityTb ?? 8
  );
  const [capacityReasoning, setCapacityReasoning] = useState<string>(
    initialPayload?.capacityReasoning ??
      'ระบบกล้อง 8 ตัว บันทึก 24/7 ที่ 4 Mbps นาน 30 วัน ต้องการพื้นที่ทางทฤษฎี ~7.72 TB จึงจำเป็นต้องใช้ฮาร์ดดิสก์ขนาด 8TB เพื่อให้ครอบคลุมการเขียนข้อมูลเต็มเดือนและรองรับ File System Overhead'
  );
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(true);

  // Math Calculations:
  // Standard CCTV storage calculation formula:
  // Daily GB per camera = (Bitrate_Mbps * 3600 * Hours) / (8 * 1024)
  // Total Daily GB = Daily_GB_per_cam * cameraCount
  // Total TB = (Total_Daily_GB * retentionDays) / 1024
  const { calculatedDailyGb, calculatedTotalTb } = useMemo(() => {
    const dailyPerCamGb = (bitrateMbps * 3600 * recordingHoursPerDay) / (8 * 1024);
    const totalDailyGb = dailyPerCamGb * cameraCount;
    const totalTb = (totalDailyGb * retentionDays) / 1024;
    return {
      calculatedDailyGb: Math.round(totalDailyGb * 100) / 100,
      calculatedTotalTb: Math.round(totalTb * 100) / 100,
    };
  }, [cameraCount, bitrateMbps, recordingHoursPerDay, retentionDays]);

  // Scoring rubric (20 points max):
  // 1. Camera count & retention identified correctly (8 cams, 30 days): 5 pts
  // 2. Formula & unit precision (~7.7 - 7.8 TB): 8 pts
  // 3. Rounding & recommended commercial capacity (8TB selected): 5 pts
  // 4. Codec & Bitrate explanation (> 20 chars): 2 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let s4 = 0;

    if (cameraCount === 8 && retentionDays === 30) s1 = 5;
    else if (cameraCount > 0 && retentionDays > 0) s1 = 3;

    if (Math.abs(calculatedTotalTb - 7.72) <= 0.35) s2 = 8;
    else if (calculatedTotalTb > 0) s2 = 4;

    if (recommendedCapacityTb === 8) s3 = 5;
    else if (recommendedCapacityTb >= 6 && recommendedCapacityTb <= 10) s3 = 3;

    if (capacityReasoning.trim().length >= 25) s4 = 2;
    else if (capacityReasoning.trim().length >= 10) s4 = 1;

    return {
      scoreBreakdown: {
        cameraAndRetention: s1,
        formulaAndUnit: s2,
        recommendedCapacity: s3,
        reasoning: s4,
      },
      totalScore: s1 + s2 + s3 + s4,
    };
  }, [cameraCount, retentionDays, calculatedTotalTb, recommendedCapacityTb, capacityReasoning]);

  const handleApplyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = PRESETS[index];
if (!preset) {
  return;
}

setResolution(preset.resolution);
setCodec(preset.codec);
setBitrateMbps(preset.defaultBitrateMbps);
  };

  const handleSaveAndSubmit = () => {
    const payload: Station1StorageCalculationPayload = {
      cameraCount,
      resolution,
      codec,
      bitrateMbps,
      recordingHoursPerDay,
      retentionDays,
      calculatedDailyGb,
      calculatedTotalTb,
      recommendedCapacityTb,
      capacityReasoning,
      score: totalScore,
      isCompleted: totalScore >= 14,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xl shadow-inner">
              🧮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Room 106 · Station 1
                </span>
                <span className="text-[11px] font-mono text-slate-400">Unit 6: Storage &amp; Cloud P2P</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 1: คำนวณพื้นที่จัดเก็บและ Retention Days
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-slate-200">
          
          {/* Mission Scenario Brief */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sky-300 flex items-center gap-2 text-sm">
                <span>📋 สถานการณ์ที่ได้รับมอบหมาย (Scenario Brief)</span>
              </h3>
              <span className="text-[11px] bg-sky-900/60 px-2 py-0.5 rounded text-sky-200 border border-sky-700">
                มาตรฐานอุตสาหกรรม
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px]">
              ห้างสรรพสินค้า Smart Mart ต้องการติดตั้งระบบกล้องวงจรปิดจำนวน <strong>8 ตัว</strong> บันทึกความละเอียด 
              <strong> 1080p Full HD ที่ Bitrate 4 Mbps ต่อตัว</strong> (H.264) โดยบันทึกแบบต่อเนื่องตลอด <strong>24 ชั่วโมง/วัน</strong> 
              และมีระเบียบข้อบังคับต้องเก็บข้อมูลย้อนหลังไม่น้อยกว่า <strong>30 วัน (Retention Period)</strong>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">จำนวนกล้อง</span>
                <strong className="text-sky-300 text-sm">8 Channels</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Bitrate / Cam</span>
                <strong className="text-amber-300 text-sm">4.0 Mbps (CBR)</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">ชั่วโมงบันทึก</span>
                <strong className="text-emerald-300 text-sm">24 ชม. / วัน</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Retention Goal</span>
                <strong className="text-purple-300 text-sm">30 วันเต็ม</strong>
              </div>
            </div>
          </div>

          {/* Interactive Parameters Formulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column: Parameter Inputs */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>⚙️ พารามิเตอร์ระบบบันทึก</span>
                <span className="text-[10px] text-slate-400 font-normal">ปรับตั้งค่าตามโจทย์</span>
              </h3>

              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">โปรไฟล์ความละเอียดและ Codec:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(idx)}
                      className={`text-left p-2 rounded-xl border text-[11px] transition-all ${
                        selectedPresetIndex === idx
                          ? 'border-sky-400 bg-sky-950/60 text-sky-200 font-semibold shadow-sm'
                          : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Count Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-300">จำนวนกล้อง (Camera Count):</label>
                  <span className="font-mono font-bold text-sky-400">{cameraCount} ตัว</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={cameraCount}
                  onChange={(e) => setCameraCount(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 ตัว</span>
                  <span>8 ตัว (โจทย์)</span>
                  <span>16 ตัว</span>
                  <span>32 ตัว</span>
                </div>
              </div>

              {/* Bitrate and Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300">Bitrate (Mbps / ตัว):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={bitrateMbps}
                    onChange={(e) => setBitrateMbps(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">ชั่วโมงบันทึก / วัน:</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={recordingHoursPerDay}
                    onChange={(e) => setRecordingHoursPerDay(parseInt(e.target.value, 10) || 24)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Retention Days */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-300">ระยะเวลาจัดเก็บย้อนหลัง (Retention Days):</label>
                  <span className="font-mono font-bold text-emerald-400">{retentionDays} วัน</span>
                </div>
                <input
                  type="range"
                  min={7}
                  max={90}
                  step={1}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>7 วัน</span>
                  <span>15 วัน</span>
                  <span>30 วัน (เป้าหมาย)</span>
                  <span>60 วัน</span>
                  <span>90 วัน</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Math & Formula Breakdown */}
            <div className="space-y-3.5 rounded-2xl border border-sky-500/30 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sky-300">📐 การคำนวณและผลลัพธ์ (Live Formula)</h3>
                  <button
                    type="button"
                    onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                    className="text-[11px] text-sky-400 underline hover:text-sky-300"
                  >
                    {showFormulaDetails ? 'ซ่อนรายละเอียดสูตร' : 'แสดงสูตรคำนวณ'}
                  </button>
                </div>

                {showFormulaDetails && (
                  <div className="rounded-xl bg-slate-900/90 p-3 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1.5">
                    <div className="text-amber-400 font-semibold">สูตรมาตรฐาน Storage Formula:</div>
                    <div className="text-sky-200">
                      พื้นที่ (GB/วัน) = [Bitrate (Mbps) × 3600 วิ × ชม./วัน] ÷ (8 × 1024)
                    </div>
                    <div className="text-emerald-300">
                      พื้นที่รวม (TB) = [พื้นที่รวมต่อวัน (GB) × Retention Days] ÷ 1024
                    </div>
                  </div>
                )}

                {/* Step-by-step numbers */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">1 กล้อง บันทึก 1 วัน:</span>
                    <span className="text-slate-200 font-bold">
                      {Math.round(((bitrateMbps * 3600 * recordingHoursPerDay) / (8 * 1024)) * 100) / 100} GB
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">รวม {cameraCount} กล้องต่อวัน:</span>
                    <span className="text-sky-300 font-bold">{calculatedDailyGb} GB / วัน</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-sky-950/40 border border-sky-600/50">
                    <span className="text-sky-200 font-semibold">พื้นที่สุทธิตลอด {retentionDays} วัน:</span>
                    <span className="text-lg font-bold text-sky-300">{calculatedTotalTb} TB</span>
                  </div>
                </div>

                {/* Match indicator */}
                <div className="flex items-center gap-2 text-[11px] p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  {Math.abs(calculatedTotalTb - 7.72) <= 0.35 ? (
                    <>
                      <span className="text-emerald-400 font-bold">✓ สอดคล้องกับโจทย์อย่างสมบูรณ์:</span>
                      <span className="text-slate-300">~7.72 TB (ต้องเลือกขนาด 8TB เพื่อรองรับ)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-amber-400 font-bold">ℹ️ หมายเหตุ:</span>
                      <span className="text-slate-400">
                        สำหรับโจทย์หลัก Smart Mart ให้ใช้ 8 ตัว × 4 Mbps × 30 วัน = ~7.72 TB
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Recommended Capacity Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-slate-300 font-medium block">
                  ขนาดฮาร์ดดิสก์เชิงพาณิชย์ที่แนะนำ (Commercial HDD Sizing):
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[4, 6, 8, 10, 16].map((tb) => (
                    <button
                      key={tb}
                      type="button"
                      onClick={() => setRecommendedCapacityTb(tb)}
                      className={`p-2 rounded-xl border text-center font-mono font-bold transition-all ${
                        recommendedCapacityTb === tb
                          ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tb} TB
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sizing & Codec Analysis Reflection */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
            <h3 className="font-bold text-slate-200 flex items-center justify-between">
              <span>📝 คำอธิบายทางเทคนิคและการเผื่อพื้นที่ (Headroom &amp; Codec Rationale)</span>
              <span className="text-[11px] text-slate-400">ตรวจสอบโดย Teacher &amp; Evaluator</span>
            </h3>
            <textarea
              rows={3}
              value={capacityReasoning}
              onChange={(e) => setCapacityReasoning(e.target.value)}
              placeholder="ระบุเหตุผลการเลือกขนาดความจุ 8TB การคิดเผื่อ File System Overhead และความแตกต่างระหว่าง H.264 กับ H.265..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200 focus:border-sky-500 outline-none leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>
                💡 <em>ความรู้: H.265 ลด Bitrate ได้ราว 40-50% เทียบกับ H.264 ทำให้ประหยัด HDD ลงครึ่งหนึ่งในคุณภาพที่เท่ากัน</em>
              </span>
              <button
                type="button"
                onClick={() =>
                  setCapacityReasoning(
                    'ระบบกล้อง 8 ตัว บันทึก 24/7 ที่ 4 Mbps นาน 30 วัน ต้องการพื้นที่ทางทฤษฎี ~7.72 TB จึงจำเป็นต้องใช้ฮาร์ดดิสก์ขนาด 8TB เพื่อให้ครอบคลุมการเขียนข้อมูลเต็มเดือนและรองรับ File System Overhead'
                  )
                }
                className="text-sky-400 hover:underline cursor-pointer"
              >
                ใช้ข้อความมาตรฐาน
              </button>
            </div>
          </div>

          {/* Score Summary Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">โจทย์กล้อง+วัน</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.cameraAndRetention} / 5</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">สูตรคำนวณสุทธิ</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.formulaAndUnit} / 8</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">เลือกขนาด 8TB</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.recommendedCapacity} / 5</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">เหตุผลประกอบ</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.reasoning} / 2</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 1: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 20</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {totalScore >= 14 ? (
              <span className="text-emerald-400 font-semibold">✓ เกณฑ์ผ่านขั้นต่ำ 14 คะแนน (พร้อมบันทึกส่ง)</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ ต้องการคะแนนอย่างน้อย 14/20 เพื่อผ่านเกณฑ์</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveAndSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลการคำนวณ Station 1
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
