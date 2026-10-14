'use client';
import React from 'react';
import { useBulletLabStore } from '../../store/useBulletLabStore';
import { SURFACES_DATA } from '../../data/bulletLabData';
import {
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Box,
  Camera,
  Gauge,
  FileCheck,
} from 'lucide-react';
import {
  AnchorType,
  DrillBitType,
  DrillMode,
  SurfaceInfo,
  SurfaceType,
} from '../../types';

export const Mission4SurfacePanel: React.FC = () => {
  const setIsMission4ModalOpen = useBulletLabStore((s) => s.setIsMission4ModalOpen);
  const submissionsBySurface = useBulletLabStore((s) => s.submissionsBySurface);

  const surfaceType = useBulletLabStore((s) => s.surfaceType);
  const selectedDrillBit = useBulletLabStore((s) => s.selectedDrillBit);
  const selectedDrillMode = useBulletLabStore((s) => s.selectedDrillMode);
  const selectedAnchor = useBulletLabStore((s) => s.selectedAnchor);
  const drillDepthMm = useBulletLabStore((s) => s.drillDepthMm);
  const isDrilling = useBulletLabStore((s) => s.isDrilling);
  const baseMounted = useBulletLabStore((s) => s.baseMounted);
  const jointLocked = useBulletLabStore((s) => s.jointLocked);
  const pullTestForceN = useBulletLabStore((s) => s.pullTestForceN);

  const setSurfaceType = useBulletLabStore((s) => s.setSurfaceType);
  const setSelectedDrillBit = useBulletLabStore((s) => s.setSelectedDrillBit);
  const setSelectedDrillBitSize = useBulletLabStore((s) => s.setSelectedDrillBitSize);
  const setSelectedDrillMode = useBulletLabStore((s) => s.setSelectedDrillMode);
  const setSelectedAnchor = useBulletLabStore((s) => s.setSelectedAnchor);
  const setDrillDepthMm = useBulletLabStore((s) => s.setDrillDepthMm);
  const setIsDrilling = useBulletLabStore((s) => s.setIsDrilling);
  const setAnchorInserted = useBulletLabStore((s) => s.setAnchorInserted);
  const setBaseMounted = useBulletLabStore((s) => s.setBaseMounted);
  const setScrewTightness = useBulletLabStore((s) => s.setScrewTightness);
  const setCameraMounted = useBulletLabStore((s) => s.setCameraMounted);
  const setJointLocked = useBulletLabStore((s) => s.setJointLocked);
  const setPullTestForceN = useBulletLabStore((s) => s.setPullTestForceN);

  const activeSurfaceInfo: SurfaceInfo = SURFACES_DATA[surfaceType] ?? SURFACES_DATA.concrete!;

  const completedCount = (Object.keys(SURFACES_DATA) as SurfaceType[]).filter(
    (t) => !!submissionsBySurface[t]
  ).length;

  // Validation checks for technical accuracy
  const isBitCorrect = selectedDrillBit === activeSurfaceInfo.recommendedBitType;
  const isModeCorrect = selectedDrillMode === activeSurfaceInfo.recommendedMode;
  const isAnchorCorrect = selectedAnchor === activeSurfaceInfo.recommendedAnchorType;
  const isDepthCorrect = Math.abs(drillDepthMm - activeSurfaceInfo.drillDepthMm) <= 5;
  const isAllSpecsCorrect = isBitCorrect && isModeCorrect && isAnchorCorrect && isDepthCorrect;

  // Handle Drilling Simulation
  const handleSimulateDrill = () => {
    setIsDrilling(true);
    let currentDepth = 0;
    const target = activeSurfaceInfo.drillDepthMm;
    const timer = setInterval(() => {
      currentDepth += 5;
      if (currentDepth >= target) {
        setDrillDepthMm(target);
        setIsDrilling(false);
        setAnchorInserted(true);
        clearInterval(timer);
      } else {
        setDrillDepthMm(currentDepth);
      }
    }, 150);
  };

  // Apply Standard Preset for Selected Surface
  const applySurfacePresets = () => {
    setSelectedDrillBit(activeSurfaceInfo.recommendedBitType);
    setSelectedDrillBitSize(activeSurfaceInfo.recommendedBitSize);
    setSelectedDrillMode(activeSurfaceInfo.recommendedMode);
    setSelectedAnchor(activeSurfaceInfo.recommendedAnchorType);
    setDrillDepthMm(activeSurfaceInfo.drillDepthMm);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Overview & Modal Trigger */}
      <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 leading-relaxed">
        <strong>ภารกิจติดตั้ง & ทดสอบ:</strong> ปฏิบัติการติดตั้งกล้องวงจรปิดตามคุณสมบัติของพื้นผิว 4 หน้าต่าง (ไม้, เหล็ก, ปูน, สมาร์ทบอร์ด) นักเรียนต้องคลิกเลือกสเปกด้วยตนเองให้ครบตั้งแต่ข้อ 2–7 แล้วกดบันทึก
      </div>

      {/* Button to Open Dedicated Worksheet Modal */}
      <button
        type="button"
        onClick={() => setIsMission4ModalOpen(true)}
        className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-200 shrink-0" />
          <span>เปิดใบงานประเมิน 4 หน้าต่าง (Modal)</span>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono shrink-0">
          สำเร็จ {completedCount}/4 ผนัง
        </span>
      </button>

      {/* Submission Status Summary Badge if already saved */}
      {submissionsBySurface[surfaceType] && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs space-y-1 text-emerald-200">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>บันทึกผล ({activeSurfaceInfo.nameTh.split(' ')[0]})</span>
            </span>
            <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
              {submissionsBySurface[surfaceType]?.score} / 100 คะแนน
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            เวลาที่บันทึก: {submissionsBySurface[surfaceType]?.submittedAt} · ผล: {submissionsBySurface[surfaceType]?.isPassed ? 'ผ่านเกณฑ์มาตรฐาน' : 'ต้องปรับปรุง'}
          </div>
        </div>
      )}

      {/* 2. Surface Material Selector (4 Types) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>เลือกชนิดพื้นผิววัสดุ (ผนัง 3D เปลี่ยนทันที):</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">4 วัสดุ</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(SURFACES_DATA).map((s) => {
            const isSelected = s.id === surfaceType;
            const sub = submissionsBySurface[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setSurfaceType(s.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md overflow-hidden border border-slate-600 shrink-0 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/bullet-lab/surface_${s.id}.jpg`}
                        alt={s.nameTh}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-bold text-xs truncate">
                      {s.nameTh.split(' ')[0]}
                    </div>
                  </div>
                  {sub && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {sub.score}p
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {s.texturePattern}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Surface Technical Specification Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs shadow-md">
        <div className="flex items-center justify-between">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>มาตรฐานงานช่าง: {activeSurfaceInfo.nameTh}</span>
          </div>
          <button
            onClick={applySurfacePresets}
            className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>จับคู่อัตโนมัติ</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-slate-400 block text-[10px]">ดอกสว่านที่ต้องใช้:</span>
            <span className="font-medium text-white">{activeSurfaceInfo.recommendedBit}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">การปรับโหมดสว่าน:</span>
            <span className="font-medium text-amber-300">
              {activeSurfaceInfo.recommendedMode === 'hammer'
                ? '🔨 โหมดกระแทก (Hammer)'
                : activeSurfaceInfo.recommendedMode === 'driver'
                ? '🪛 โหมดไดรฟ์/รอบต่ำ'
                : '⚙️ โหมดเจาะธรรมดา (Normal)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ชนิดพุกที่ใช้:</span>
            <span className="font-medium text-cyan-200">{activeSurfaceInfo.recommendedAnchor}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">รูปแบบน็อต/สกรู:</span>
            <span className="font-medium text-emerald-300">{activeSurfaceInfo.recommendedScrew}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">ความลึกเจาะมาตรฐาน:</span>
            <span className="font-mono font-bold text-cyan-400">{activeSurfaceInfo.drillDepthMm} มม.</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[10px] text-amber-200/90 leading-relaxed flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{activeSurfaceInfo.notesTh}</span>
        </div>
      </div>

      {/* 4. Interactive Tool Matcher & Adjuster */}
      <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <span>ปรับตั้งค่าอุปกรณ์สำหรับเจาะ & ยึด</span>
        </div>

        {/* Drill Bit Type */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300 font-medium">1. ชนิดดอกสว่าน</span>
            <span className={isBitCorrect ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isBitCorrect ? '✓ ถูกต้อง' : '⚠️ ไม่ตรงกับวัสดุ'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'wood', name: '🪵 ดอกเจาะไม้ (Brad-Point)' },
              { id: 'metal', name: '🔩 ดอกเจาะเหล็ก (HSS)' },
              { id: 'masonry', name: '🧱 ดอกเจาะปูน (Carbide)' },
              { id: 'multipurpose', name: '⬜ ดอกอเนกประสงค์' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedDrillBit(b.id as DrillBitType)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left cursor-pointer transition-colors ${
                  selectedDrillBit === b.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Drill Mode */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300 font-medium">2. โหมดการทำงานของสว่าน</span>
            <span className={isModeCorrect ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isModeCorrect ? '✓ ถูกต้อง' : '⚠️ โหมดผิด'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'normal', name: '⚙️ เจาะธรรมดา' },
              { id: 'hammer', name: '🔨 กระแทก' },
              { id: 'driver', name: '🪛 ขันสกรู' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedDrillMode(m.id as DrillMode)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-colors ${
                  selectedDrillMode === m.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Anchor & Fastener Type */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300 font-medium">3. ชนิดพุกและรูปแบบสกรู</span>
            <span className={isAnchorCorrect ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isAnchorCorrect ? '✓ ถูกต้อง' : '⚠️ ไม่ตรง'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'wood-screw-direct', name: '🪵 สกรูเกลียวไม้ (ไม่ใช้พุก)' },
              { id: 'self-drilling-metal', name: '🔩 สกรูปลายสว่านยึดเหล็ก' },
              { id: 'plastic-expansion', name: '🧱 พุกพลาสติกมาตรฐาน #7' },
              { id: 'hollow-wall-toggle', name: '⬜ พุกผีเสื้อผนังกลวง' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnchor(a.id as AnchorType)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left cursor-pointer transition-colors ${
                  selectedAnchor === a.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* Drilling Depth Slider */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">ความลึกในการเจาะ (Drill Depth)</span>
            <span className="font-mono text-cyan-400 font-bold">{drillDepthMm} มม.</span>
          </div>
          <input
            type="range"
            min={0}
            max={45}
            step={1}
            value={drillDepthMm}
            onChange={(e) => setDrillDepthMm(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 มม.</span>
            <span>แนะนำ: {activeSurfaceInfo.drillDepthMm} มม.</span>
            <span>45 มม.</span>
          </div>
        </div>
      </div>

      {/* 5. Interactive 3D Installation Actions */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ขั้นตอนปฏิบัติการติดตั้ง (Simulation Workflow)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Step 1: Drill Simulation */}
          <button
            onClick={handleSimulateDrill}
            disabled={isDrilling}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow ${
              drillDepthMm >= activeSurfaceInfo.drillDepthMm
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-cyan-950/70 border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-200'
            }`}
          >
            <Wrench className={`w-3.5 h-3.5 ${isDrilling ? 'animate-spin' : ''}`} />
            <span>
              {isDrilling
                ? 'กำลังเจาะ...'
                : drillDepthMm >= activeSurfaceInfo.drillDepthMm
                ? '✓ เจาะรู & สวมพุกแล้ว'
                : '1. จำลองเจาะผนัง'}
            </span>
          </button>

          {/* Step 2: Base Mount & Screws */}
          <button
            onClick={() => {
              setBaseMounted(!baseMounted);
              setScrewTightness('correct');
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow ${
              baseMounted
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{baseMounted ? '✓ ยึดฐานแน่นหนา' : '2. ยึดฐาน & ขันสกรู'}</span>
          </button>

          {/* Step 3: Camera Mount & Lock */}
          <button
            onClick={() => {
              setCameraMounted(true);
              setJointLocked(!jointLocked);
            }}
            className={`col-span-2 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow ${
              jointLocked
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{jointLocked ? '✓ สวมตัวกล้อง & ล็อกข้อต่อ 3 แกนแน่นหนา' : '3. สวมตัวกล้อง & ล็อกข้อต่อ'}</span>
          </button>
        </div>
      </div>

      {/* 6. Pull Test & Assessment Section */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>ทดสอบแรงดึงตามมาตรฐาน (Pull Test 10N–40N):</span>
          </span>
          <span
            className={`font-mono font-bold text-sm ${
              pullTestForceN >= 20 ? 'text-emerald-400' : 'text-cyan-400'
            }`}
          >
            {pullTestForceN} N
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={40}
          step={5}
          value={pullTestForceN}
          onChange={(e) => setPullTestForceN(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 N (ปกติ)</span>
          <span>มาตรฐาน: 20–30 N</span>
          <span>40 N (สูงสุด)</span>
        </div>

        {/* Verification Status Banner */}
        {pullTestForceN > 0 && (
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              isAllSpecsCorrect
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            }`}
          >
            {isAllSpecsCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ✓ ผ่านการทดสอบ! ยึดติดกับพื้นผิว {activeSurfaceInfo.nameTh.split(' ')[0]} แน่นหนา ไม่มีการคลายตัว
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  ⚠️ สเปกไม่สมบูรณ์: ตรวจสอบดอกสว่าน/โหมดเจาะ/พุก ให้ตรงกับ {activeSurfaceInfo.nameTh.split(' ')[0]}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
