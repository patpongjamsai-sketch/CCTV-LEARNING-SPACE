'use client';

import React, { useState, useMemo } from 'react';
import {
  ROOM106_HDD_CATALOG,
  Room106HddItem,
  Station2HddManagementPayload,
} from '../../../shared/domain/room106Types';

interface Room106HddManagementModalProps {
  initialPayload?: Partial<Station2HddManagementPayload>;
  onSave: (payload: Station2HddManagementPayload) => void;
  onClose: () => void;
}

export const Room106HddManagementModal: React.FC<Room106HddManagementModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [selectedHddId, setSelectedHddId] = useState<string>(
    initialPayload?.selectedHddId || 'HDD-SURV-8TB'
  );
  const [isSataDataConnected, setIsSataDataConnected] = useState<boolean>(
    initialPayload?.isSataCableConnected ?? true
  );
  const [isSataPowerConnected, setIsSataPowerConnected] = useState<boolean>(
    initialPayload?.isSataCableConnected ?? true
  );
  const [isSmartTested, setIsSmartTested] = useState<boolean>(
    initialPayload?.isSmartCheckPassed ?? false
  );
  const [smartStatus, setSmartStatus] = useState({
    powerOnHours: initialPayload?.smartStatus?.powerOnHours ?? 120,
    badSectors: initialPayload?.smartStatus?.badSectors ?? 0,
    temperatureC: initialPayload?.smartStatus?.temperatureC ?? 34,
    healthPercent: initialPayload?.smartStatus?.healthPercent ?? 100,
  });

  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [formatProgress, setFormatProgress] = useState<number>(
    initialPayload?.hddFormatted ? 100 : 0
  );
  const [hddFormatted, setHddFormatted] = useState<boolean>(
    initialPayload?.hddFormatted ?? false
  );
  const [hddInitialized, setHddInitialized] = useState<boolean>(
    initialPayload?.hddInitialized ?? false
  );
  const [selectedRaidMode, setSelectedRaidMode] = useState<'NONE' | 'RAID0' | 'RAID1' | 'RAID5'>(
    initialPayload?.selectedRaidMode || 'NONE'
  );

  const selectedHdd: Room106HddItem = useMemo(() => {
    return (
      ROOM106_HDD_CATALOG.find((h) => h.id === selectedHddId) || ROOM106_HDD_CATALOG[4]
    );
  }, [selectedHddId]);

  // Scoring rubric (40 pts max):
  // 1. Capacity matches requirement (8TB): 10 pts
  // 2. Surveillance Grade selected (24/7 certified): 10 pts
  // 3. SATA cables connected & Format/Initialize complete: 15 pts
  // 4. SMART check performed: 5 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sCap = 0;
    let sGrade = 0;
    let sFormat = 0;
    let sSmart = 0;

    if (selectedHdd.capacityTb === 8) sCap = 10;
    else if (selectedHdd.capacityTb === 4) sCap = 5;

    if (selectedHdd.grade === 'Surveillance' && selectedHdd.is24x7Certified) sGrade = 10;
    else sGrade = 3;

    if (isSataDataConnected && isSataPowerConnected && hddFormatted && hddInitialized) {
      sFormat = 15;
    } else if (isSataDataConnected && isSataPowerConnected) {
      sFormat = 6;
    }

    if (isSmartTested) sSmart = 5;

    return {
      scoreBreakdown: {
        capacity: sCap,
        grade: sGrade,
        cablingAndFormat: sFormat,
        smartCheck: sSmart,
      },
      totalScore: sCap + sGrade + sFormat + sSmart,
    };
  }, [selectedHdd, isSataDataConnected, isSataPowerConnected, hddFormatted, hddInitialized, isSmartTested]);

  const handleRunSmartCheck = () => {
    setIsSmartTested(true);
    setSmartStatus({
      powerOnHours: selectedHdd.grade === 'Surveillance' ? 48 : 2400,
      badSectors: selectedHdd.grade === 'Surveillance' ? 0 : 8,
      temperatureC: selectedHdd.rpm > 7000 ? 46 : 33,
      healthPercent: selectedHdd.grade === 'Surveillance' ? 100 : 85,
    });
  };

  const handleFormatAndInitialize = () => {
    if (!isSataDataConnected || !isSataPowerConnected) {
      alert('กรุณาต่อสาย SATA Data และสายไฟ SATA Power ให้เรียบร้อยก่อนทำการ Format');
      return;
    }

    setIsFormatting(true);
    setFormatProgress(5);

    const interval = setInterval(() => {
      setFormatProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFormatting(false);
          setHddInitialized(true);
          setHddFormatted(true);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleSaveAndSubmit = () => {
    const payload: Station2HddManagementPayload = {
      selectedHddId: selectedHdd.id,
      selectedHddCapacity: selectedHdd.capacityLabel,
      hddGrade: selectedHdd.grade,
      isSataCableConnected: isSataDataConnected && isSataPowerConnected,
      isSmartCheckPassed: isSmartTested,
      smartStatus,
      hddFormatted,
      hddInitialized,
      selectedRaidMode,
      score: totalScore,
      isCompleted: totalScore >= 28 && hddFormatted,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-purple-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold text-xl shadow-inner">
              💾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Room 106 · Station 2
                </span>
                <span className="text-[11px] font-mono text-slate-400">Surveillance Grade 24/7 vs Desktop</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 2: จัดการ Surveillance HDD และการ Format / Initialize
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-slate-200">
          
          {/* Objective Callout */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300">ภารกิจสถานี 2:</span>
                <span className="text-[11px] font-mono text-slate-300">
                  ต้องการความจุอย่างน้อย 7.72 TB บันทึกต่อเนื่อง 24 ชม.
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                เลือกฮาร์ดดิสก์เกรด Surveillance แท้ (ทน Workload 180 TB/ปี + Firmware ควบคุม Frame Drop), ต่อสาย SATA, ตรวจสอบสุขภาพ และทำการเตรียมพื้นที่บันทึก
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-600/40 text-purple-200 font-mono text-[11px] whitespace-nowrap">
              Requirement: 8TB Surveillance 24/7
            </div>
          </div>

          {/* Step 1: HDD Catalog Selection */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>1️⃣ เลือกฮาร์ดดิสก์จากคลังอุปกรณ์ (HDD Selection)</span>
              <span className="text-[10px] text-slate-400">เปรียบเทียบสเปกทางเทคนิค</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {ROOM106_HDD_CATALOG.map((hdd) => {
                const isSelected = selectedHddId === hdd.id;
                const isSurv = hdd.grade === 'Surveillance';
                return (
                  <button
                    key={hdd.id}
                    type="button"
                    onClick={() => {
                      setSelectedHddId(hdd.id);
                      setIsSmartTested(false);
                      setHddFormatted(false);
                      setHddInitialized(false);
                      setFormatProgress(0);
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/50 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            isSurv ? 'bg-purple-900/80 text-purple-200 border border-purple-600' : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {hdd.grade}
                        </span>
                        {hdd.recommended && (
                          <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600">
                            แนะนำ
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-white text-sm">{hdd.capacityLabel}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{hdd.model}</div>

                      <div className="pt-2 space-y-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/80">
                        <div className="flex justify-between">
                          <span>Workload:</span>
                          <span className={isSurv ? 'text-purple-300 font-bold' : 'text-slate-400'}>
                            {hdd.workloadRating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>RPM:</span>
                          <span>{hdd.rpm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cache:</span>
                          <span>{hdd.cacheMb} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>24/7 Duty:</span>
                          <span className={hdd.is24x7Certified ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {hdd.is24x7Certified ? 'YES (100%)' : 'NO (Desktop)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-snug">
                      {hdd.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Warning Callout for wrong choices */}
            {selectedHdd.grade === 'Desktop' && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-2.5 flex items-center gap-2 text-amber-300 text-[11px]">
                <span>⚠️</span>
                <span>
                  <strong>คำเตือนทางเทคนิค:</strong> ฮาร์ดดิสก์เกรด Desktop ออกแบบมาสำหรับเขียน-อ่านเพียง 8 ชม./วัน (Workload ~55 TB/ปี) 
                  หากนำไปใช้ใน NVR บันทึกตลอด 24 ชั่วโมง จะทำให้หัวอ่านเสื่อมเร็ว เกิดความร้อนสะสม และอาจทำให้วิดีโอกระตุกหรือเฟรมภาพสูญหาย
                </span>
              </div>
            )}
            {selectedHdd.capacityTb < 8 && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-2.5 flex items-center gap-2 text-rose-300 text-[11px]">
                <span>⛔</span>
                <span>
                  <strong>ความจุไม่เพียงพอ:</strong> ขนาด {selectedHdd.capacityLabel} ไม่พอสำหรับความต้องการบันทึก 30 วัน (~7.72 TB) 
                  เครื่องบันทึกจะเขียนทับข้อมูลเก่าก่อนครบกำหนด
                </span>
              </div>
            )}
          </div>

          {/* Step 2 & 3: Cabling, S.M.A.R.T. and Initialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Physical Cabling & S.M.A.R.T. */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>2️⃣ เชื่อมต่อสายและตรวจ S.M.A.R.T.</span>
                <span className="text-[10px] text-slate-400">NVR Bay 1</span>
              </h3>

              {/* Cabling toggles */}
              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">สายสัญญาณและสายไฟเลี้ยง:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSataDataConnected(!isSataDataConnected)}
                    className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                      isSataDataConnected
                        ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                    }`}
                  >
                    <div className="text-[10px] opacity-75">SATA 3.0 (7-Pin)</div>
                    <div className="font-bold text-xs">
                      {isSataDataConnected ? '✓ เสียบสาย Data แล้ว' : '✗ ยังไม่ต่อสาย Data'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSataPowerConnected(!isSataPowerConnected)}
                    className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                      isSataPowerConnected
                        ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                    }`}
                  >
                    <div className="text-[10px] opacity-75">Power (15-Pin)</div>
                    <div className="font-bold text-xs">
                      {isSataPowerConnected ? '✓ เสียบไฟเลี้ยงแล้ว' : '✗ ยังไม่ต่อสายไฟ'}
                    </div>
                  </button>
                </div>
              </div>

              {/* S.M.A.R.T. Diagnostic panel */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300">ระบบตรวจสอบ S.M.A.R.T. สุขภาพดิสก์:</span>
                  <button
                    type="button"
                    onClick={handleRunSmartCheck}
                    disabled={!isSataDataConnected || !isSataPowerConnected}
                    className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-bold text-[11px] transition-all cursor-pointer"
                  >
                    🔍 สแกน S.M.A.R.T.
                  </button>
                </div>

                {isSmartTested ? (
                  <div className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Power-On Hours:</span>
                      <span className="text-slate-200">{smartStatus.powerOnHours} ชม.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reallocated Sectors:</span>
                      <span className={smartStatus.badSectors === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {smartStatus.badSectors} Bad Sectors
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Temperature:</span>
                      <span className={smartStatus.temperatureC < 40 ? 'text-emerald-400' : 'text-amber-400'}>
                        {smartStatus.temperatureC} °C
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-300 font-semibold">Health Assessment:</span>
                      <span className="text-emerald-400 font-bold">
                        {smartStatus.healthPercent}% GOOD (Passed)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-900/60 p-3 text-center text-slate-500 text-[11px] border border-slate-800">
                    ยังไม่ได้ทำการทดสอบ S.M.A.R.T. กดปุ่มด้านบนเพื่อตรวจสอบ
                  </div>
                )}
              </div>
            </div>

            {/* Right: Format, Initialize & RAID Mode */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>3️⃣ จัดเตรียมพาร์ติชันและ Format Filesystem</span>
                  <span className="text-[10px] text-slate-400">Storage Initialization</span>
                </h3>

                {/* RAID Configuration */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">โครงสร้าง RAID / Storage Mode:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['NONE', 'RAID0', 'RAID1', 'RAID5'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedRaidMode(mode)}
                        className={`p-1.5 rounded-xl border text-center font-mono text-[11px] transition-all ${
                          selectedRaidMode === mode
                            ? 'border-purple-400 bg-purple-950/60 text-purple-200 font-bold shadow-sm'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {mode === 'NONE' ? 'Single HDD' : mode}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedRaidMode === 'NONE' && '• บันทึกเดี่ยวลง 8TB เหมาะสำหรับ NVR 1-Bay ที่เน้นความจุเต็ม'}
                    {selectedRaidMode === 'RAID1' && '• Mirroring สำรองข้อมูลเหมือนกัน 2 ลูก (ต้องการ 2 Bays ขึ้นไป)'}
                    {selectedRaidMode === 'RAID5' && '• Striping with Parity ทน HDD เสียได้ 1 ลูก (ต้องการ 3 Bays ขึ้นไป)'}
                    {selectedRaidMode === 'RAID0' && '• รวมความจุโดยไม่สำรองข้อมูล (ไม่แนะนำสำหรับ CCTV ปลอดภัย)'}
                  </div>
                </div>

                {/* Format Status Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Disk Status:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        hddFormatted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : isFormatting
                          ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {hddFormatted
                        ? 'ONLINE / RECORDING (READY)'
                        : isFormatting
                        ? 'FORMATTING...'
                        : 'UNINITIALIZED'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>File System Initialization</span>
                      <span>{formatProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${formatProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFormatAndInitialize}
                  disabled={isFormatting || !isSataDataConnected || !isSataPowerConnected}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    hddFormatted
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white shadow-lg shadow-purple-600/30'
                  }`}
                >
                  {isFormatting ? (
                    <>⏳ กำลังสร้าง Partition GPT และ Format Ext4...</>
                  ) : hddFormatted ? (
                    <>🔄 ฟอร์แมตใหม่ (Format Again)</>
                  ) : (
                    <>⚡ สั่ง Initialize &amp; Format Surveillance HDD</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Score Summary Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">ขนาด 8TB พอ 30 วัน</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.capacity} / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">เกรด Surveillance 24/7</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.grade} / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">ต่อ SATA &amp; Format</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.cablingAndFormat} / 15</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">ตรวจ S.M.A.R.T.</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.smartCheck} / 5</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 2: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 40</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {totalScore >= 28 && hddFormatted ? (
              <span className="text-emerald-400 font-semibold">✓ ฮาร์ดดิสก์พร้อมใช้งานสำหรับการบันทึกภาพ</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ ต้องทำการต่อสายและ Format ให้เสร็จสมบูรณ์</span>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลการจัดการดิสก์ Station 2
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
