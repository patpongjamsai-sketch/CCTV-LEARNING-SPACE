'use client';

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export interface FlowSlotSelection {
  cameraId: string;
  cableDistanceMeters: number;
  poeSwitchBudget: number;
  hddType: 'surveillance' | 'desktop';
  hddCapacityTb: number;
  videoCodec: 'H264' | 'H265' | 'H265_PLUS';
  monitorType: 'surveillance_cctv' | 'home_tv';
}

export const SignalFlowBuilder: React.FC = () => {
  // Current Builder Configuration
  const [config, setConfig] = useState<FlowSlotSelection>({
    cameraId: 'ipc_4mp_bullet',
    cableDistanceMeters: 65,
    poeSwitchBudget: 120,
    hddType: 'surveillance',
    hddCapacityTb: 4,
    videoCodec: 'H265_PLUS',
    monitorType: 'surveillance_cctv',
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);

  // Bandwidth calculation based on Codec (for 4 Cameras)
  const getCameraBitrateMbps = (codec: string) => {
    switch (codec) {
      case 'H264':
        return 8.0;
      case 'H265':
        return 4.0;
      case 'H265_PLUS':
      default:
        return 2.5;
    }
  };

  const perCameraBitrate = getCameraBitrateMbps(config.videoCodec);
  const totalBitrateMbps = perCameraBitrate * 4;

  // Storage calculation: (Bitrate in Mbps * 3600 * 24 / 8) / 1,000,000 = GB per day
  const dailyGbPerCam = (perCameraBitrate * 3600 * 24) / 8 / 1000;
  const totalDailyGb = dailyGbPerCam * 4;
  const totalStorageGb = config.hddCapacityTb * 1000 * 0.9; // 90% usable
  const estimatedDays = Math.floor(totalStorageGb / totalDailyGb);

  // Engineering Checks
  const isDistanceValid = config.cableDistanceMeters <= 100;
  const isHddCorrect = config.hddType === 'surveillance';
  const isMonitorCorrect = config.monitorType === 'surveillance_cctv';
  const isPoeOk = 4 * 12 <= config.poeSwitchBudget;

  const isSystemOptimal = isDistanceValid && isHddCorrect && isMonitorCorrect && isPoeOk;

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    const t1 = setTimeout(() => setSimStep(2), 800);
    const t2 = setTimeout(() => setSimStep(3), 1600);
    const t3 = setTimeout(() => setSimStep(4), 2400);
    const t4 = setTimeout(() => setSimStep(5), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Header & Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            ENGINEERING WORKBENCH
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            เครื่องมือจำลองการประกอบวงจรและทดสอบสัญญาณ (Signal & Power Flow Builder)
          </h3>
          <p className="text-xs text-slate-400">
            ปรับแต่งสเปกชิ้นส่วนในระบบเพื่อตรวจสอบความเข้ากันได้, แบนด์วิดท์เครือข่าย, และจำนวนวันจัดเก็บบันทึก
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>

          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'กำลังเดินสัญญาณสด...' : '⚡ เริ่มเดินระบบ (Simulate Flow)'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Engineering Meter Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Meter 1: Bandwidth */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Bandwidth</div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-1">
            {totalBitrateMbps.toFixed(1)} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {config.videoCodec === 'H265_PLUS' ? '⚡ บีบอัดสูงสุด H.265+' : 'มาตรฐาน H.264/H.265'}
          </div>
        </div>

        {/* Meter 2: PoE Power */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">PoE Power Load</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            48.0 <span className="text-xs font-normal text-slate-400">/ {config.poeSwitchBudget}W</span>
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-1">
            ✓ ภาระโหลด 40% (ปลอดภัย)
          </div>
        </div>

        {/* Meter 3: Retention Days */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Recording Retention</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">
            {estimatedDays} <span className="text-xs font-normal text-slate-400">วัน (24/7)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            ฮาร์ดดิสก์ {config.hddCapacityTb}TB (กล้อง 4 ตัว)
          </div>
        </div>

        {/* Meter 4: Cable Distance */}
        <div className={`p-3.5 rounded-2xl shadow border ${isDistanceValid ? 'bg-slate-900/90 border-slate-800' : 'bg-rose-950/40 border-rose-500/60'}`}>
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Cable Link Distance</div>
          <div className={`text-xl font-bold font-mono mt-1 ${isDistanceValid ? 'text-white' : 'text-rose-400'}`}>
            {config.cableDistanceMeters} <span className="text-xs font-normal text-slate-400">/ 100 เมตร</span>
          </div>
          <div className={`text-[10px] mt-1 ${isDistanceValid ? 'text-emerald-400' : 'text-rose-300 font-bold'}`}>
            {isDistanceValid ? '✓ อยู่ในเกณฑ์ TIA-568' : '⚠️ เกินมาตรฐาน 100 ม.!'}
          </div>
        </div>
      </div>

      {/* Visual Signal Flow Path Diagram */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="text-xs font-bold text-slate-400 mb-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>ผังกระบวนการส่งสัญญาณและกำลังไฟฟ้าแบบเรียลไทม์ (Signal & Power Flow Circuit)</span>
          </div>
          {isSimulating && (
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>LIVE TRANSMITTING... (ขั้นตอนที่ {simStep}/5)</span>
            </span>
          )}
        </div>

        {/* 5 Sequence Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {/* Node 1: Camera */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simStep >= 1
                ? 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-500/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-bold">CAPTURE</span>
            </div>
            <div className="text-sm font-bold text-white">4MP Bullet IP Camera</div>
            <p className="text-[11px] text-slate-400 mt-1">แปลงแสง $\rightarrow$ RTSP Digital Packet</p>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>ความละเอียด:</span>
                <span className="font-mono text-sky-300 font-bold">2560×1440</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>การกินไฟ PoE:</span>
                <span className="font-mono text-amber-300">12W Max (IR ON)</span>
              </div>
            </div>
          </div>

          {/* Node 2: Transmission UTP */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simStep >= 2
                ? 'bg-indigo-950/80 border-indigo-400 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">TRANSMISSION</span>
            </div>
            <div className="text-sm font-bold text-white">UTP CAT6 (T568B)</div>
            <p className="text-[11px] text-slate-400 mt-1">ส่ง Data + จ่ายไฟ PoE 48V DC</p>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>ความยาวสาย:</span>
                <span className={`font-mono font-bold ${isDistanceValid ? 'text-indigo-300' : 'text-rose-400'}`}>
                  {config.cableDistanceMeters} ม.
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ความเร็วพอร์ต:</span>
                <span className="font-mono text-emerald-400">1000 Mbps Gigabit</span>
              </div>
            </div>
          </div>

          {/* Node 3: PoE Switch */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simStep >= 3
                ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">POWER & SWITCH</span>
            </div>
            <div className="text-sm font-bold text-white">PoE+ Switch 8-Port</div>
            <p className="text-[11px] text-slate-400 mt-1">ชุมสายกระจายข้อมูลและจ่ายไฟ</p>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>Power Budget:</span>
                <span className="font-mono text-emerald-300 font-bold">{config.poeSwitchBudget}W</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>สถานะไฟ PoE:</span>
                <span className="font-mono text-amber-300">Active (48V)</span>
              </div>
            </div>
          </div>

          {/* Node 4: NVR & HDD */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simStep >= 4
                ? 'bg-purple-950/80 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="w-6 h-6 rounded-full bg-purple-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                4
              </span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">RECORDING</span>
            </div>
            <div className="text-sm font-bold text-white">16-CH NVR + HDD</div>
            <p className="text-[11px] text-slate-400 mt-1">ประมวลผล AI & บันทึกลงจานแม่เหล็ก</p>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>ประเภท HDD:</span>
                <span className={`font-mono font-bold ${isHddCorrect ? 'text-purple-300' : 'text-rose-400'}`}>
                  {config.hddType === 'surveillance' ? 'WD Purple (24/7)' : 'Desktop (8 ชม.)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Video Codec:</span>
                <span className="font-mono text-sky-300 font-bold">{config.videoCodec}</span>
              </div>
            </div>
          </div>

          {/* Node 5: Monitor Display */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              simStep >= 5
                ? 'bg-amber-950/80 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                5
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">DISPLAY</span>
            </div>
            <div className="text-sm font-bold text-white">32" 4K Monitor (HDMI)</div>
            <p className="text-[11px] text-slate-400 mt-1">แสดงผลภาพสด Quad View 4 ช่อง</p>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>เกรดจอภาพ:</span>
                <span className={`font-mono font-bold ${isMonitorCorrect ? 'text-emerald-300' : 'text-amber-400'}`}>
                  {config.monitorType === 'surveillance_cctv' ? 'CCTV 24/7' : 'ทีวีบ้านทั่วไป'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>เอาต์พุต:</span>
                <span className="font-mono text-white">HDMI 2.0 (4K 60Hz)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulated Live View Monitor Box (Shown when simStep === 5) */}
        {simStep >= 5 && (
          <div className="mt-6 bg-slate-900 border border-sky-400/40 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-white">
                  📺 ภาพสดบนจอมอนิเตอร์ตรวจการณ์ (Surveillance Live View · 4-Split Screen)
                </span>
              </div>
              <span className="text-[11px] font-mono text-sky-400">
                REC 🔴 {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 aspect-video flex flex-col justify-between relative overflow-hidden">
                <div className="text-[10px] font-mono text-sky-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded w-fit">
                  CAM 01: ซุ้มประตูทางเข้าหลัก
                </div>
                <div className="text-center text-xs text-slate-400">
                  {isDistanceValid ? '🟢 สตรีมคมชัด 4MP (True WDR Active)' : '🔴 ภาพกระตุก สัญญาณขาดหาย (สายเกิน 100m)'}
                </div>
                <div className="text-[9px] font-mono text-slate-500">2560x1440 @ 25fps · 2.5 Mbps</div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 aspect-video flex flex-col justify-between relative overflow-hidden">
                <div className="text-[10px] font-mono text-emerald-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded w-fit">
                  CAM 02: ลานหน้าเสาธง
                </div>
                <div className="text-center text-xs text-slate-400">
                  🟢 สตรีมคมชัด 4MP (Smart IR Standby)
                </div>
                <div className="text-[9px] font-mono text-slate-500">2560x1440 @ 25fps · 2.5 Mbps</div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 aspect-video flex flex-col justify-between relative overflow-hidden">
                <div className="text-[10px] font-mono text-amber-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded w-fit">
                  CAM 03: โรงฝึกงานแผนกช่าง
                </div>
                <div className="text-center text-xs text-slate-400">
                  🟢 สตรีมคมชัด 4MP (AI Tripwire Active)
                </div>
                <div className="text-[9px] font-mono text-slate-500">2560x1440 @ 25fps · 2.5 Mbps</div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 aspect-video flex flex-col justify-between relative overflow-hidden">
                <div className="text-[10px] font-mono text-purple-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded w-fit">
                  CAM 04: ห้อง Server Room
                </div>
                <div className="text-center text-xs text-slate-400">
                  🟢 สตรีมคมชัด 4MP (Privacy Mask Active)
                </div>
                <div className="text-[9px] font-mono text-slate-500">2560x1440 @ 25fps · 2.5 Mbps</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Sliders & Selectors Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🛠️ ปรับแต่งอุปกรณ์ในระบบเพื่อทดลองสถานการณ์ (Interactive Parameter Controls)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Control 1: Cable Distance */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">ระยะสาย LAN (ม.):</span>
              <span className={`font-mono font-bold ${isDistanceValid ? 'text-sky-400' : 'text-rose-400'}`}>
                {config.cableDistanceMeters} ม.
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={config.cableDistanceMeters}
              onChange={(e) => setConfig({ ...config, cableDistanceMeters: parseInt(e.target.value, 10) })}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">
              {config.cableDistanceMeters > 100
                ? '⚠️ เกิน 100 เมตร! สัญญาณจะลดทอนและไฟตก'
                : '✓ ปลอดภัย อยู่ในระยะมาตรฐาน 100 เมตร'}
            </div>
          </div>

          {/* Control 2: HDD Type */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block">ประเภทฮาร์ดดิสก์:</span>
            <select
              value={config.hddType}
              onChange={(e) => setConfig({ ...config, hddType: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
            >
              <option value="surveillance">WD Purple (Surveillance 24/7 - ถูกต้อง)</option>
              <option value="desktop">WD Blue (Desktop PC 8 ชม. - ไม่แนะนำ)</option>
            </select>
            <div className="text-[10px] text-slate-400">
              {config.hddType === 'surveillance'
                ? '✓ ออกแบบมารับงานเขียนต่อเนื่อง 24/7'
                : '⚠️ เสี่ยงเกิด Bad Sector ภายใน 3-6 เดือน'}
            </div>
          </div>

          {/* Control 3: Video Codec */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block">เทคโนโลยีการบีบอัด (Codec):</span>
            <select
              value={config.videoCodec}
              onChange={(e) => setConfig({ ...config, videoCodec: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
            >
              <option value="H265_PLUS">H.265+ (Smart Codec ประหยัด 75%)</option>
              <option value="H265">H.265 (High Efficiency ประหยัด 50%)</option>
              <option value="H264">H.264 (Standard Legacy)</option>
            </select>
            <div className="text-[10px] text-slate-400">
              บิตเรตต่อกล้อง: {perCameraBitrate} Mbps
            </div>
          </div>

          {/* Control 4: Monitor Type */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block">ประเภทจอมอนิเตอร์:</span>
            <select
              value={config.monitorType}
              onChange={(e) => setConfig({ ...config, monitorType: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
            >
              <option value="surveillance_cctv">Surveillance CCTV Monitor (Anti-Burn-in)</option>
              <option value="home_tv">Home TV ทั่วไป (เสี่ยงจอไหม้ Burn-in)</option>
            </select>
            <div className="text-[10px] text-slate-400">
              {config.monitorType === 'surveillance_cctv'
                ? '✓ มีระบบ Pixel Shift ถนอมหน้าจอ'
                : '⚠️ อาจเกิดรอยไหม้ค้างของตารางกล้อง'}
            </div>
          </div>
        </div>

        {/* System Evaluation Message */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
            isSystemOptimal
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          {isSystemOptimal ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>ยอดเยี่ยม! สเปกระบบ CCTV มีความเข้ากันได้สมบูรณ์แบบ 100%:</strong>{' '}
                ระยะสายถูกต้อง, ฮาร์ดดิสก์ทนทาน 24/7, และเปิดใช้งานการบีบอัด H.265+ ทำให้ประหยัดแบนด์วิดท์สูงสุด
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>พบจุดที่ควรปรับปรุงเพื่อความปลอดภัยตามมาตรฐานวิศวกรรม:</strong>{' '}
                {!isDistanceValid && '• ระยะสายเกิน 100 เมตร '}
                {!isHddCorrect && '• ไม่ควรใช้ Desktop HDD ในเครื่องบันทึก NVR '}
                {!isMonitorCorrect && '• หน้าจอทีวีทั่วไปเสี่ยงจอไหม้ Burn-in '}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
