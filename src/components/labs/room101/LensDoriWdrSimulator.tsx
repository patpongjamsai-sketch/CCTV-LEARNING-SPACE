'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  Sliders,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Camera,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LensSpec {
  focalLength: number; // in mm
  name: string;
  hfov: number; // horizontal FOV in degrees
  vfov: number; // vertical FOV in degrees
  bestFor: string;
  maxDistances: {
    detection: number; // 25 PPM
    observation: number; // 63 PPM
    recognition: number; // 125 PPM
    identification: number; // 250 PPM
  };
}

const LENS_SPECS: Record<number, LensSpec> = {
  2.8: {
    focalLength: 2.8,
    name: '2.8 mm (Ultra Wide Angle)',
    hfov: 103,
    vfov: 55,
    bestFor: 'ครอบคลุมมุมกว้างพิเศษ เช่น ห้องโถง, ห้องเก็บของ, ลิฟต์, ทางเดินสั้น',
    maxDistances: {
      detection: 43,
      observation: 17,
      recognition: 9,
      identification: 5,
    },
  },
  4.0: {
    focalLength: 4.0,
    name: '4.0 mm (Standard Wide)',
    hfov: 84,
    vfov: 45,
    bestFor: 'ติดตั้งทั่วไป มุมกว้างสมดุล เช่น ประตูทางเข้าอาคาร, ซูเปอร์มาร์เก็ต, ล็อบบี้',
    maxDistances: {
      detection: 63,
      observation: 25,
      recognition: 13,
      identification: 7,
    },
  },
  6.0: {
    focalLength: 6.0,
    name: '6.0 mm (Medium Telephoto)',
    hfov: 54,
    vfov: 29,
    bestFor: 'ส่องทางเดินยาว (Corridor), ลานจอดรถระยะกลาง, ทางเข้า-ออกซอย',
    maxDistances: {
      detection: 90,
      observation: 36,
      recognition: 18,
      identification: 11,
    },
  },
  12.0: {
    focalLength: 12.0,
    name: '12.0 mm (Long Telephoto)',
    hfov: 25,
    vfov: 14,
    bestFor: 'ส่องระยะไกลเฉพาะจุด, ช่องตรวจบัตร, อ่านป้ายทะเบียนรถ (LPR) หน้าป้อม รปภ.',
    maxDistances: {
      detection: 180,
      observation: 72,
      recognition: 36,
      identification: 22,
    },
  },
};

// Quiz questions on DORI & WDR
interface QuizQuestion {
  id: number;
  scenario: string;
  question: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanationTh: string;
}

const TECHNICIAN_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    scenario: '🚗 ซุ้มตรวจยานพาหนะขาเข้า (Vehicle Checkpoint)',
    question:
      'ต้องการบันทึกภาพรถยนต์ที่ขับผ่านซุ้มประตูระยะห่างจากกล้อง 15 เมตร เพื่ออ่านป้ายทะเบียนได้อย่างชัดเจนตามเกณฑ์ Identification (≥ 250 PPM) ช่างเทคนิคต้องเลือกเลนส์ขนาดใด?',
    options: [
      { label: 'A', text: 'เลนส์ 2.8 mm (ระยะชี้ชัดครอบคลุมไม่เกิน 5 เมตร)', isCorrect: false },
      { label: 'B', text: 'เลนส์ 4.0 mm (ระยะชี้ชัดครอบคลุมไม่เกิน 7 เมตร)', isCorrect: false },
      { label: 'C', text: 'เลนส์ 6.0 mm (ระยะชี้ชัดครอบคลุมไม่เกิน 11 เมตร)', isCorrect: false },
      { label: 'D', text: 'เลนส์ 12.0 mm (มีระยะชี้ชัดครอบคลุมไกลถึง 18 - 22 เมตร)', isCorrect: true },
    ],
    explanationTh:
      'ถูกต้อง! ตามมาตรฐานสากล EN 62676-4 การอ่านป้ายทะเบียนรถยนต์ต้องมีความหนาแน่นพิกเซล ≥ 250 PPM (Identification) ที่ระยะ 15 เมตร เลนส์ 12.0 mm ให้ความหนาแน่นพิกเซลสูงถึง ~380 PPM จึงอ่านเลขและตัวอักษรได้ชัดเจน ในขณะที่เลนส์มุมกว้าง 2.8-6.0 mm พิกเซลจะเจือจางต่ำกว่าเกณฑ์',
  },
  {
    id: 2,
    scenario: '🏢 โดมตรวจการณ์ภายในลิฟต์หรือห้องขนาดเล็ก (Confined Space)',
    question:
      'ต้องการติดตั้งกล้องในห้องเก็บสินค้าขนาดกะทัดรัด 3 × 3 เมตร เพื่อให้สามารถมองเห็นบุคคลได้ครอบคลุมกว้างที่สุดโดยไม่ให้มีมุมอับสายตา (Blind Spot) ควรเลือกเลนส์ขนาดใด?',
    options: [
      { label: 'A', text: 'เลนส์ 2.8 mm (มุมมองภาพกว้างแนวนอน 103°)', isCorrect: true },
      { label: 'B', text: 'เลนส์ 6.0 mm (มุมมองภาพกว้างแนวนอน 54°)', isCorrect: false },
      { label: 'C', text: 'เลนส์ 12.0 mm (มุมมองภาพแคบ 25°)', isCorrect: false },
      { label: 'D', text: 'เลนส์ 50.0 mm Telephoto', isCorrect: false },
    ],
    explanationTh:
      'ถูกต้อง! เลนส์ 2.8 mm มีมุมมองภาพแนวนอน (HFOV) กว้างถึง 103° ช่วยให้กล้อง 1 ตัวสามารถครอบคลุมมุมมองของห้องขนาดเล็กหรือลิฟต์ได้ทั่วถึงตั้งแต่ผนังซ้ายถึงผนังขวา โดยไม่ต้องใช้กล้องหลายตัว',
  },
  {
    id: 3,
    scenario: '☀️ ประตูกระจกใสหน้าร้านหันไปทางทิศตะวันตก (Backlight Problem)',
    question:
      'กล้องส่องประตูกระจกทางเข้าอาคาร ในช่วงบ่ายแสงแดดภายนอกส่องเข้ามาจ้ามาก ทำให้ผู้คนที่เดินเข้ามากลายเป็นภาพเงามืดดำสนิท (Silhouette) ช่างเทคนิคควรแก้ปัญหาด้วยเทคโนโลยีใด?',
    options: [
      { label: 'A', text: 'ปรับลดระดับความสว่าง (Brightness) ลง 50%', isCorrect: false },
      { label: 'B', text: 'เปิดใช้ฟังก์ชัน True WDR 120dB (Multi-Shutter)', isCorrect: true },
      { label: 'C', text: 'ปิดการทำงานของหลอดอินฟราเรด (IR Cut)', isCorrect: false },
      { label: 'D', text: 'ปรับเปลี่ยนความละเอียดภาพลดลงเป็น 720p', isCorrect: false },
    ],
    explanationTh:
      'ถูกต้อง! True WDR 120dB ทำงานโดยใช้ฮาร์ดแวร์เซนเซอร์บันทึกภาพพร้อมกัน 2 ชัตเตอร์ (ชัตเตอร์สั้นเก็บภาพแดดจ้าภายนอก + ชัตเตอร์ยาวเก็บแสงในเงามืดของใบหน้า) แล้วชิป ISP ประมวลผลรวมภาพแบบ Real-time จึงเห็นทั้งวิวภายนอกและใบหน้าคนชัดเจนสมบูรณ์',
  },
];

export const LensDoriWdrSimulator: React.FC = () => {
  // Simulator State
  const [selectedFocal, setSelectedFocal] = useState<number>(12.0);
  const [targetDistance, setTargetDistance] = useState<number>(15); // meters
  const [wdrLevel, setWdrLevel] = useState<number>(85); // 0 to 100
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const currentLens: LensSpec = LENS_SPECS[selectedFocal] ?? LENS_SPECS[4.0]!;

  // Calculate Pixels Per Meter (PPM) based on 4MP sensor (2560 horizontal pixels, 1/2.8" width ~5.37mm)
  // PPM = (2560 * f) / (Distance * 5.37)
  const currentPPM = useMemo(() => {
    if (targetDistance <= 0) return 9999;
    const horizontalPixels = 2560;
    const sensorWidthMm = 5.37;
    return (horizontalPixels * selectedFocal) / (targetDistance * sensorWidthMm);
  }, [selectedFocal, targetDistance]);

  // Determine current DORI level
  const doriCategory = useMemo(() => {
    if (currentPPM >= 250) {
      return {
        level: 4,
        key: 'identification',
        nameTh: 'ชี้ชัด (Identification)',
        color: 'text-rose-400',
        bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        barColor: 'bg-rose-500',
        badge: '🟢 คมชัดระดับชี้ชัด (≥ 250 PPM)',
        desc: 'อ่านป้ายทะเบียนรถยนต์และจดจำใบหน้าคนแปลกหน้าได้อย่างสมบูรณ์ ใช้เป็นหลักฐานดำเนินคดีได้ 100%',
        blurPx: 0,
        licenseReadable: true,
      };
    }
    if (currentPPM >= 125) {
      return {
        level: 3,
        key: 'recognition',
        nameTh: 'จดจำ (Recognition)',
        color: 'text-amber-400',
        bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barColor: 'bg-amber-500',
        badge: '🟡 ระดับจดจำใบหน้า (≥ 125 PPM)',
        desc: 'สามารถชี้ตัวบุคคลที่คุ้นเคยได้ ชัดเจนทั้งทรงผมและเสื้อผ้า แต่ป้ายทะเบียนตัวเลขเริ่มเบลอเล็กน้อย',
        blurPx: 1.0,
        licenseReadable: false,
      };
    }
    if (currentPPM >= 63) {
      return {
        level: 2,
        key: 'observation',
        nameTh: 'สังเกตการณ์ (Observation)',
        color: 'text-sky-400',
        bgBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        barColor: 'bg-sky-500',
        badge: '🔵 ระดับสังเกตพฤติกรรม (≥ 63 PPM)',
        desc: 'เห็นลักษณะการแต่งกาย สีเสื้อผ้า และพฤติกรรมท่าทาง แต่ไม่สามารถระบุอัตลักษณ์ใบหน้าได้ชัดเจน',
        blurPx: 2.8,
        licenseReadable: false,
      };
    }
    if (currentPPM >= 25) {
      return {
        level: 1,
        key: 'detection',
        nameTh: 'ตรวจจับ (Detection)',
        color: 'text-emerald-400',
        bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        barColor: 'bg-emerald-500',
        badge: '🟣 ระดับตรวจจับความเคลื่อนไหว (≥ 25 PPM)',
        desc: 'รู้ว่ามีบุคคลหรือยานพาหนะปรากฏตัวในมุมมองภาพ แต่ภาพไม่คมชัดพอที่จะระบุรายละเอียดใดๆ',
        blurPx: 5.5,
        licenseReadable: false,
      };
    }
    return {
      level: 0,
      key: 'none',
      nameTh: 'ต่ำกว่าเกณฑ์มาตรฐาน (Below DORI)',
      color: 'text-slate-400',
      bgBadge: 'bg-slate-800 text-slate-400 border-slate-700',
      barColor: 'bg-slate-600',
      badge: '🔴 ความละเอียดไม่เพียงพอ (< 25 PPM)',
      desc: 'ความหนาแน่นพิกเซลน้อยเกินไป ภาพแตกละเอียดเป็นเม็ดพิกเซล ไม่สามารถจำแนกอะไรได้',
      blurPx: 9.0,
      licenseReadable: false,
    };
  }, [currentPPM]);

  // Optical zoom scale of target on CCTV viewport: proportional to focal / distance
  const targetScale = useMemo(() => {
    // Reference: 4mm lens at 8m distance = scale 1.0
    const raw = (selectedFocal / 4.0) * (11 / Math.max(2, targetDistance));
    return Math.min(2.8, Math.max(0.35, raw));
  }, [selectedFocal, targetDistance]);

  const handleSelectQuizAnswer = (qId: number, optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const quizScore = useMemo(() => {
    let score = 0;
    TECHNICIAN_QUIZ.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected !== undefined && q.options[selected]?.isCorrect) {
        score += 1;
      }
    });
    return score;
  }, [quizAnswers]);

  const isAllAnswered = Object.keys(quizAnswers).length === TECHNICIAN_QUIZ.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* SECTION 1: DORI LENS SIMULATOR & 4 STANDARD THRESHOLD CARDS */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
        {/* Header: Title and Current Lens Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔭</span>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                เกณฑ์ระยะจำแนก DORI ตามทางยาวโฟกัส (EN 62676-4 Standard)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกขนาดเลนส์เพื่อดูภาพจำลองมุมมองจริง (FOV) และการซูมของกล้องบนหน้าจอด้านล่าง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-slate-400">เลนส์ที่เลือก:</span>
            <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/40 shadow">
              {selectedFocal.toFixed(1)} mm ({currentLens.hfov}°)
            </span>
          </div>
        </div>

        {/* 4 Lens Selector Buttons (2.8, 4.0, 6.0, 12.0 mm) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          {[2.8, 4.0, 6.0, 12.0].map((f) => {
            const isSelected = selectedFocal === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFocal(f)}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02] font-black ring-2 ring-amber-400/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-bold">{f.toFixed(1)} mm</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                  {f === 2.8
                    ? 'มุมกว้าง 103°'
                    : f === 4.0
                    ? 'มุมมาตรฐาน 84°'
                    : f === 6.0
                    ? 'ซูมกลาง 54°'
                    : 'ซูมไกล LPR 25°'}
                </div>
              </button>
            );
          })}
        </div>

        {/* 4 DORI Distance Cards (Detection, Observation, Recognition, Identification) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          {/* 1. Detection */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              doriCategory.level === 1
                ? 'bg-emerald-950/60 border-emerald-400 shadow-lg ring-1 ring-emerald-400'
                : 'bg-slate-900/90 border-emerald-500/30'
            }`}
          >
            <span className="text-[10px] text-emerald-400 font-bold block">1. ตรวจจับ (Detection)</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">
              {currentLens.maxDistances.detection} ม.
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">รู้ว่ามีสิ่งเคลื่อนไหว</span>
            <span className="text-[9px] text-emerald-400/80 font-mono block mt-1">เกณฑ์: ≥ 25 PPM</span>
          </div>

          {/* 2. Observation */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              doriCategory.level === 2
                ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400'
                : 'bg-slate-900/90 border-sky-500/30'
            }`}
          >
            <span className="text-[10px] text-sky-400 font-bold block">2. สังเกต (Observation)</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">
              {currentLens.maxDistances.observation} ม.
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">เห็นลักษณะเสื้อผ้า</span>
            <span className="text-[9px] text-sky-400/80 font-mono block mt-1">เกณฑ์: ≥ 63 PPM</span>
          </div>

          {/* 3. Recognition */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              doriCategory.level === 3
                ? 'bg-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400'
                : 'bg-slate-900/90 border-amber-500/30'
            }`}
          >
            <span className="text-[10px] text-amber-400 font-bold block">3. จดจำ (Recognition)</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">
              {currentLens.maxDistances.recognition} ม.
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ชี้ตัวคนคุ้นเคย</span>
            <span className="text-[9px] text-amber-400/80 font-mono block mt-1">เกณฑ์: ≥ 125 PPM</span>
          </div>

          {/* 4. Identification */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              doriCategory.level >= 4
                ? 'bg-rose-950/60 border-rose-400 shadow-lg ring-1 ring-rose-400'
                : 'bg-slate-900/90 border-rose-500/30'
            }`}
          >
            <span className="text-[10px] text-rose-400 font-bold block">4. ชี้ชัด (Identification)</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">
              {currentLens.maxDistances.identification} ม.
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">อ่านป้ายทะเบียนรถ</span>
            <span className="text-[9px] text-rose-400/80 font-mono block mt-1">เกณฑ์: ≥ 250 PPM</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DIRECT REAL-TIME CCTV CAMERA DISPLAY SCREEN (หน้าจอแสดงผลด้านล่าง) */}
        {/* ============================================================ */}
        <div className="pt-2 space-y-3">
          {/* Viewport Subheader with Live Optical Zoom info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">
                หน้าจอแสดงผลมุมมองกล้องวงจรปิด (Live Optical Viewport):
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                เลนส์ {selectedFocal.toFixed(1)} mm
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">สถานะ:</span>
              <span className={`font-bold text-[11px] px-2 py-0.5 rounded border ${doriCategory.bgBadge}`}>
                {doriCategory.badge}
              </span>
            </div>
          </div>

          {/* Distance Slider Controls */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>เลื่อนปรับระยะห่างวัตถุเป้าหมาย (Target Distance):</span>
              </span>
              <span className="font-mono text-sm font-bold text-sky-400">
                {targetDistance.toFixed(1)} เมตร
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={targetDistance}
              onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
            />

            {/* Quick Distance Buttons */}
            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <span className="text-slate-400">ทางลัดทดสอบระยะ:</span>
              <div className="flex items-center gap-1.5">
                {[4, 8, 15, 25, 35].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setTargetDistance(dist)}
                    className={`px-2.5 py-0.5 rounded border font-mono transition-colors cursor-pointer ${
                      targetDistance === dist
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {dist} ม.
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIMULATED CCTV HARDWARE MONITOR */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl">
            {/* Monitor OSD Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-300 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-white font-bold">● REC</span>
                <span className="text-slate-400">CH-01 · GATE_INSPECTION_4MP</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span>2560×1440 @ 30FPS</span>
                <span className="text-emerald-400 font-bold">H.265+ 4.0Mbps</span>
                <span className="text-amber-400 font-bold">f={selectedFocal.toFixed(1)}mm ({currentLens.hfov}°)</span>
              </div>
            </div>

            {/* Camera Visual Field (16:9 Aspect Ratio Container) */}
            <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Background Perspective Scene */}
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{
                  transform: `scale(${1 + (selectedFocal - 2.8) * 0.08})`,
                }}
              >
                {/* Sky & Distant buildings */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-950 via-slate-900 to-slate-850">
                  <div className="absolute bottom-0 inset-x-0 h-16 opacity-30 flex items-end justify-around">
                    <div className="w-12 h-14 bg-slate-700 rounded-t-sm" />
                    <div className="w-20 h-10 bg-slate-800 rounded-t-sm" />
                    <div className="w-16 h-16 bg-slate-700 rounded-t-sm" />
                    <div className="w-24 h-12 bg-slate-800 rounded-t-sm" />
                  </div>
                </div>

                {/* Ground / Road with perspective lines */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-slate-800 to-slate-950">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        'repeating-linear-gradient(90deg, transparent, transparent 15%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 16%)',
                    }}
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-1 flex flex-col justify-between py-2 opacity-50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-4 bg-amber-400 rounded-full" />
                    ))}
                  </div>

                  {/* Distance Markers on Road */}
                  <div className="absolute inset-x-0 bottom-2 flex justify-between px-6 text-[9px] font-mono text-slate-500 opacity-60">
                    <span>ระยะใกล้ (2m)</span>
                    <span>10m</span>
                    <span>20m</span>
                    <span>ระยะไกล (40m)</span>
                  </div>
                </div>
              </div>

              {/* TARGET OBJECT: PERSON & CAR (Dynamically Scaled & Blurred by PPM) */}
              <div
                className="relative z-10 flex items-end justify-center transition-all duration-300"
                style={{
                  transform: `scale(${targetScale}) translateY(${Math.min(25, (targetDistance - 2) * 1.2)}px)`,
                  filter: `blur(${doriCategory.blurPx}px)`,
                }}
              >
                {/* Car Vector Representation */}
                <div className="relative mr-4 mb-1">
                  <div className="w-32 h-14 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 rounded-2xl relative shadow-2xl border border-slate-400/40">
                    {/* Roof & Windshield */}
                    <div className="absolute -top-6 left-5 right-7 h-7 bg-slate-800 rounded-t-xl border-t border-slate-400/50 flex overflow-hidden">
                      <div className="w-1/2 bg-sky-950/60 border-r border-slate-700" />
                      <div className="w-1/2 bg-sky-900/60" />
                    </div>
                    {/* Headlights */}
                    <div className="absolute left-1.5 top-3 w-4 h-3 bg-amber-300 rounded-sm shadow-md shadow-amber-300/50" />
                    <div className="absolute right-1.5 top-3 w-3 h-4 bg-rose-600 rounded-sm" />
                    {/* Wheels */}
                    <div className="absolute -bottom-2 left-4 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                    <div className="absolute -bottom-2 right-5 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>

                    {/* THAI LICENSE PLATE (Key Target for Identification) */}
                    <div className="absolute bottom-1 left-7 right-7 bg-white text-slate-950 px-1 py-0.5 rounded border border-slate-400 shadow flex flex-col items-center justify-center select-none">
                      <span className="text-[10px] font-black tracking-wider leading-none">
                        1กข 9999
                      </span>
                      <span className="text-[6px] font-bold text-slate-700 leading-none">
                        กรุงเทพมหานคร
                      </span>
                    </div>
                  </div>
                </div>

                {/* Person Vector Representation */}
                <div className="relative flex flex-col items-center">
                  {/* Head & Face */}
                  <div className="w-8 h-8 rounded-full bg-[#f6c29b] border border-amber-800/40 relative shadow flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2.5 bg-slate-900 rounded-t-full" />
                    <div className="relative z-10 flex flex-col items-center gap-0.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-slate-900" />
                        <div className="w-1 h-1 rounded-full bg-slate-900" />
                      </div>
                      <div className="w-2 h-0.5 bg-rose-700 rounded-full" />
                    </div>
                  </div>

                  {/* Body & Shirt */}
                  <div className="w-10 h-14 bg-sky-700 rounded-t-lg relative flex flex-col items-center border border-sky-500/40 shadow mt-0.5">
                    <div className="mt-2 w-4 h-5 bg-white rounded-sm border border-slate-400 flex flex-col items-center p-0.5">
                      <div className="w-2 h-2 rounded-full bg-sky-600" />
                      <div className="w-3 h-0.5 bg-slate-800 mt-0.5" />
                    </div>
                  </div>

                  {/* Legs */}
                  <div className="flex items-center gap-1 -mt-0.5">
                    <div className="w-3.5 h-12 bg-slate-800 rounded-b-sm border-r border-slate-900" />
                    <div className="w-3.5 h-12 bg-slate-800 rounded-b-sm" />
                  </div>
                </div>
              </div>

              {/* AI ANALYTICS BOUNDING BOX OVERLAY */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-300 border-2 rounded-lg flex flex-col justify-between"
                style={{
                  width: `${Math.min(320, Math.max(90, 180 * targetScale))}px`,
                  height: `${Math.min(220, Math.max(70, 130 * targetScale))}px`,
                  borderColor:
                    doriCategory.level >= 4
                      ? '#f43f5e'
                      : doriCategory.level >= 3
                      ? '#f59e0b'
                      : doriCategory.level >= 2
                      ? '#38bdf8'
                      : doriCategory.level >= 1
                      ? '#10b981'
                      : '#64748b',
                }}
              >
                <div className="flex items-center justify-between p-1">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow text-slate-950"
                    style={{
                      backgroundColor:
                        doriCategory.level >= 4
                          ? '#f43f5e'
                          : doriCategory.level >= 3
                          ? '#f59e0b'
                          : doriCategory.level >= 2
                          ? '#38bdf8'
                          : doriCategory.level >= 1
                          ? '#10b981'
                          : '#64748b',
                    }}
                  >
                    TARGET · {targetDistance.toFixed(1)}m · {currentPPM.toFixed(0)} PPM
                  </span>
                </div>

                <div className="flex items-center justify-between p-1 text-[8px] font-mono text-white bg-slate-950/70 rounded-b">
                  <span>{doriCategory.nameTh}</span>
                  <span>{doriCategory.licenseReadable ? '✓ ป้ายทะเบียนอ่านได้ชัดเจน' : '✗ ป้ายทะเบียนเบลอ'}</span>
                </div>
              </div>

              {/* Viewport Live Reticle Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                <div className="w-8 h-8 border border-white/60 rounded-full" />
                <div className="w-16 h-0.5 bg-white/40 absolute" />
                <div className="h-16 w-0.5 bg-white/40 absolute" />
              </div>

              {/* Bottom Monitor OSD */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">PPM ที่ระยะ {targetDistance}m:</span>
                  <span className="text-white font-mono font-extrabold text-xs">
                    {currentPPM.toFixed(1)} Pixels/Meter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">เกณฑ์มาตรฐาน:</span>
                  <span className={`font-bold ${doriCategory.color}`}>
                    {doriCategory.nameTh}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Evaluation Box */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${doriCategory.bgBadge}`}>
            <Eye className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                ผลการประเมินภาพกล้องที่ระยะ {targetDistance} เมตร (เลนส์ {selectedFocal.toFixed(1)} mm):
              </div>
              <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">
                {doriCategory.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: TRUE WDR 120dB SIMULATOR (PHOTOREALISTIC SCENE) */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                ทดสอบการเกลี่ยแสงย้อนหน้าร้าน True WDR (120dB Multi-Shutter)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                จำลองสถานการณ์กล้องส่องประตูกระจกหน้าร้าน แดดจ้าภายนอก vs โถงในอาคาร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSplitMode
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {isSplitMode ? '✓ โหมดผ่าครึ่งจอ Split View' : '↔ โหมดเปรียบเทียบ Before/After'}
            </button>
            <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {wdrLevel === 0 ? 'WDR OFF (ปิด)' : `WDR: ${wdrLevel}%`}
            </span>
          </div>
        </div>

        {/* WDR Range Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={wdrLevel}
            onChange={(e) => setWdrLevel(parseInt(e.target.value, 10))}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (ปิด - หน้าคนมืดเป็นเงา แดดจ้าขาวโพลน)</span>
            <span>50% (Digital WDR)</span>
            <span className="text-emerald-400 font-bold">100% (True WDR 120dB ชัตเตอร์คู่สมบูรณ์)</span>
          </div>
        </div>

        {/* Photorealistic Entrance Viewport */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
          {/* OSD Bar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 backdrop-blur border-b border-slate-800 text-[10px] font-mono text-slate-300">
            <span className="text-amber-400 font-bold">CAM 02 · STORE_FRONT_ENTRANCE</span>
            <div className="flex items-center gap-3">
              <span>SENSOR: 1/2.8" STARVIS CMOS</span>
              <span className={wdrLevel >= 50 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                {wdrLevel === 0 ? 'DR: 60 dB (STANDARD)' : 'DR: 120 dB (TRUE WDR)'}
              </span>
            </div>
          </div>

          <div className="relative w-full h-full flex">
            {/* Left Side: Outdoor High-Contrast Glass Door View */}
            <div className="relative w-1/2 h-full overflow-hidden border-r border-slate-700/80 flex items-center justify-center">
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    wdrLevel === 0 && !isSplitMode
                      ? '#ffffff'
                      : 'linear-gradient(to bottom, #38bdf8 0%, #bae6fd 60%, #cbd5e1 100%)',
                }}
              >
                <div
                  className="absolute inset-0 bg-white transition-opacity duration-300 pointer-events-none"
                  style={{
                    opacity: isSplitMode ? 0.95 : Math.max(0, 1 - wdrLevel * 0.012),
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-600 flex items-end justify-center pb-6">
                  <div className="w-24 h-10 bg-slate-400 rounded-lg shadow flex items-center justify-center text-[9px] font-bold text-slate-800 border border-slate-300">
                    🚗 รถภายนอก
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 border-4 border-slate-700/40 pointer-events-none" />
              <div className="absolute top-9 left-3 z-10 text-[9px] font-mono font-bold bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                {isSplitMode ? '⚠️ ก่อนเปิด WDR (แสงจ้ากลบ)' : 'บรรยากาศนอกร้าน (Outdoor 100,000 Lux)'}
              </div>
            </div>

            {/* Right Side: Indoor Entrance with Person Entering */}
            <div className="relative w-1/2 h-full bg-slate-900 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950">
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 opacity-30"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px)',
                  }}
                />
              </div>

              <div className="absolute top-9 right-3 z-10 text-[9px] font-mono font-bold bg-slate-950/80 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
                {isSplitMode ? '✅ เปิด True WDR 120dB (เกลี่ยแสง)' : 'ภายในร้าน (Indoor 150 Lux)'}
              </div>
            </div>

            {/* VISITOR PERSON IN DOORWAY */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-20 flex flex-col items-center transition-all duration-300">
              <div
                className="w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden shadow-2xl"
                style={{
                  backgroundColor:
                    wdrLevel === 0 && !isSplitMode
                      ? '#050811'
                      : `rgba(246, 194, 155, ${Math.min(1, 0.2 + wdrLevel * 0.009)})`,
                  borderColor:
                    wdrLevel === 0 && !isSplitMode
                      ? '#020617'
                      : `rgba(180, 83, 9, ${Math.min(1, 0.4 + wdrLevel * 0.008)})`,
                }}
              >
                <div
                  className="flex flex-col items-center gap-1 transition-opacity duration-300"
                  style={{
                    opacity: isSplitMode ? 0.95 : Math.max(0, (wdrLevel - 20) / 80),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                  <div className="w-3 h-1 bg-rose-700 rounded-full" />
                </div>

                {wdrLevel === 0 && !isSplitMode && (
                  <span className="text-[10px] font-mono text-slate-500 font-bold">เงามืด</span>
                )}
              </div>

              <div
                className="w-20 h-20 rounded-t-2xl transition-all duration-300 mt-1 border-t flex flex-col items-center justify-center shadow-lg"
                style={{
                  backgroundColor:
                    wdrLevel === 0 && !isSplitMode
                      ? '#02040a'
                      : `rgba(2, 132, 199, ${Math.min(1, 0.2 + wdrLevel * 0.009)})`,
                  borderColor:
                    wdrLevel === 0 && !isSplitMode
                      ? '#000000'
                      : `rgba(56, 189, 248, ${Math.min(1, 0.4 + wdrLevel * 0.007)})`,
                }}
              >
                <div
                  className="w-6 h-7 bg-white rounded border border-slate-400 flex flex-col items-center justify-center p-0.5 transition-opacity duration-300"
                  style={{
                    opacity: isSplitMode ? 1 : Math.max(0, (wdrLevel - 30) / 70),
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-rose-600" />
                  <div className="w-4 h-0.5 bg-slate-800 mt-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-2 inset-x-3 z-30 flex items-center justify-between text-[10px] font-mono bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">ผลการประมวลผล:</span>
                <span className={wdrLevel >= 50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {wdrLevel === 0
                    ? '⚠️ ปิด WDR: แสงภายนอกขาวโพลน บุคคลหน้าร้านมืดเป็นเงามัว'
                    : wdrLevel < 60
                    ? '🟡 Digital WDR: ดึงรายละเอียดเงาได้บางส่วน แต่ยังมี Noise'
                    : '✅ True WDR 120dB: ปรับเกลี่ยแสงสว่างและเงาเห็นหน้าชัดเจน'}
                </span>
              </div>
              <span className="text-slate-400 hidden sm:inline">Multi-Shutter DSP Exposure</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: FIELD TECHNICIAN QUIZ CHALLENGE (ACCORDION/EXPANDABLE) */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setShowQuiz(!showQuiz)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <span>3. แบบทดสอบช่างเทคนิค: ประเมินการเลือกเลนส์ &amp; ระบบย้อนแสง (3 ข้อ)</span>
                {isAllAnswered && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    ได้คะแนน {quizScore}/3
                  </span>
                )}
              </h5>
              <p className="text-xs text-slate-400 mt-0.5">
                ทดสอบความรู้การเลือกใช้เลนส์ DORI และการแก้ปัญหาย้อนแสงหน้างานจริง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs">{showQuiz ? 'ซ่อนแบบทดสอบ' : 'เปิดทำแบบทดสอบ'}</span>
            {showQuiz ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showQuiz && (
          <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            {TECHNICIAN_QUIZ.map((q, qIndex) => {
              const selectedOptIdx = quizAnswers[q.id];
              const isAnswered = selectedOptIdx !== undefined;
              const isCorrect = isAnswered && q.options[selectedOptIdx]?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !isAnswered
                      ? 'bg-slate-900/80 border-slate-800'
                      : isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[11px] font-mono font-bold text-sky-300">
                        {qIndex + 1}
                      </span>
                      <span>{q.scenario}</span>
                    </span>

                    {isAnswered && (
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ถูกต้อง (+1 คะแนน)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ยังไม่ถูกต้อง</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white font-medium mb-3 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOptIdx === optIdx;
                      let optStyle =
                        'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300';

                      if (isAnswered) {
                        if (opt.isCorrect) {
                          optStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                        } else if (isSelected && !opt.isCorrect) {
                          optStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 line-through opacity-80';
                        } else {
                          optStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${optStyle}`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 text-slate-200">
                            {opt.label}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      <strong>💡 คำอธิบายเชิงวิศวกรรม:</strong> {q.explanationTh}
                    </div>
                  )}
                </div>
              );
            })}

            {isAllAnswered && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      ทำแบบทดสอบครบทั้ง 3 ข้อแล้ว! ได้คะแนน {quizScore} / {TECHNICIAN_QUIZ.length} คะแนน
                    </h5>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {quizScore === 3
                        ? 'ยอดเยี่ยมมาก! ท่านมีความเข้าใจเกณฑ์ DORI และระบบ True WDR ในระดับช่างเทคนิคมืออาชีพ'
                        : 'ท่านสามารถกดปุ่ม "ทำแบบทดสอบใหม่" เพื่อทบทวนข้อที่ผิดได้'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuizAnswers({})}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ทำแบบทดสอบใหม่</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
