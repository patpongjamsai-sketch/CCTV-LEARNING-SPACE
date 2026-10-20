'use client';

import React, { useState } from 'react';
import { REALISTIC_COMPONENTS } from './cctvComponentsData';
import {
  Eye,
  Zap,
  Sliders,
  CheckCircle2,
  Info,
  HardDrive,
  Cpu,
  Monitor,
  Camera,
  Network,
  Sun,
  ShieldAlert,
} from 'lucide-react';

export const ComponentSpecExplorer: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState<string>('camera_bullet');
  const [selectedPartId, setSelectedPartId] = useState<string | null>('lens');
  const [activeTab, setActiveTab] = useState<'overview' | 'anatomy' | 'dori_wdr' | 'poe_calculator'>('overview');

  // Interactive Lens Simulator States
  const [selectedFocalLength, setSelectedFocalLength] = useState<number>(4.0); // 2.8, 4.0, 6.0, 12.0
  const [wdrStrength, setWdrStrength] = useState<number>(80); // 0 (OFF) to 100 (Max)
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // PoE Calculator States
  const [poeCameraCount, setPoeCameraCount] = useState<number>(6);
  const [poeCameraModel, setPoeCameraModel] = useState<'standard' | 'high_ir' | 'ptz'>('standard');
  const [poeSwitchBudget, setPoeSwitchBudget] = useState<number>(120); // 65W, 120W, 250W

  const currentComp = (REALISTIC_COMPONENTS.find((c) => c.id === selectedCompId) || REALISTIC_COMPONENTS[0])!;
  const activePart = (currentComp.anatomyParts.find((p) => p.id === selectedPartId) || currentComp.anatomyParts[0])!;

  // DORI calculations based on Focal Length
  const getDoriData = (f: number) => {
    switch (f) {
      case 2.8:
        return {
          fov: '103° (มุมกว้างพิเศษ)',
          detection: '43 ม.',
          observation: '17 ม.',
          recognition: '9 ม.',
          identification: '4.5 ม.',
          bestUse: 'ห้องเรียน, ลิฟต์, ร้านค้ามินิมาร์ท, โถงทางเดินแคบ',
        };
      case 6.0:
        return {
          fov: '52° (มุมแคบระยะไกล)',
          detection: '90 ม.',
          observation: '36 ม.',
          recognition: '18 ม.',
          identification: '9.0 ม.',
          bestUse: 'แนวรั้วกำแพง, ซอยยาว, จับป้ายทะเบียนรถทางเข้า',
        };
      case 12.0:
        return {
          fov: '24° (มุมเทเลโฟโต้)',
          detection: '180 ม.',
          observation: '72 ม.',
          recognition: '36 ม.',
          identification: '18.0 ม.',
          bestUse: 'ตรวจการณ์แนวกำแพงวิทยาลัยระยะไกล, ป้อมยามตรวจรถ',
        };
      case 4.0:
      default:
        return {
          fov: '84° (มุมมองมาตรฐานยอดนิยม)',
          detection: '63 ม.',
          observation: '25 ม.',
          recognition: '13 ม.',
          identification: '6.5 ม.',
          bestUse: 'ลานจอดรถ, หน้าอาคารเรียน, โรงฝึกงาน, หน้าเคาน์เตอร์',
        };
    }
  };

  const dori = getDoriData(selectedFocalLength);

  // PoE Calculation
  const camWatt = poeCameraModel === 'standard' ? 8 : poeCameraModel === 'high_ir' ? 12 : 28;
  const totalUsedWatt = poeCameraCount * camWatt;
  const isPoeOverload = totalUsedWatt > poeSwitchBudget;
  const poeUsagePercent = Math.min(100, Math.round((totalUsedWatt / poeSwitchBudget) * 100));

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur">
        {REALISTIC_COMPONENTS.map((comp) => {
          const isSelected = comp.id === selectedCompId;
          const getIcon = () => {
            switch (comp.category) {
              case 'camera':
                return <Camera className="w-4 h-4" />;
              case 'transmission':
                return <Network className="w-4 h-4" />;
              case 'storage':
                return <HardDrive className="w-4 h-4" />;
              case 'network_vms':
                return <Cpu className="w-4 h-4" />;
              case 'display':
                return <Monitor className="w-4 h-4" />;
            }
          };

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => {
                setSelectedCompId(comp.id);
                setSelectedPartId(comp.anatomyParts[0]?.id || null);
                if (comp.category === 'camera') {
                  setActiveTab('overview');
                } else if (comp.category === 'transmission') {
                  setActiveTab('overview');
                } else {
                  setActiveTab('overview');
                }
              }}
              className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20 border border-sky-400/40'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-700/60 text-slate-400'
                }`}
              >
                {getIcon()}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-75 truncate">
                  {comp.category}
                </div>
                <div className="text-xs font-semibold truncate leading-tight mt-0.5">
                  {comp.nameTh.split('(')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Component Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Hardware Mockup & Sub-navigation (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {currentComp.modelCode}
                </span>
                <span className="ml-2 text-[11px] text-slate-400 font-medium">
                  {currentComp.realisticBrandType}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{currentComp.nameTh}</h3>
                <p className="text-xs text-slate-400">{currentComp.nameEn}</p>
              </div>
            </div>

            {/* Interactive Hardware SVG Representation */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-center min-h-[220px] relative">
              {currentComp.category === 'camera' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl">
                    {/* Camera Sunshield Housing */}
                    <rect x="25" y="30" width="130" height="12" rx="4" fill="#334155" />
                    <rect x="35" y="42" width="115" height="50" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                    {/* Front Bezel & Lens */}
                    <rect x="145" y="38" width="14" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="152" cy="67" r="18" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="152" cy="67" r="9" fill={isNightMode ? '#ef4444' : '#0369a1'} />
                    {/* Smart IR LEDs (8 dots) */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180;
                      const cx = 152 + 13 * Math.cos(rad);
                      const cy = 67 + 13 * Math.sin(rad);
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r="1.8"
                          fill={isNightMode ? '#ef4444' : '#64748b'}
                          className={isNightMode ? 'animate-pulse' : ''}
                        />
                      );
                    })}
                    {/* Mounting Bracket & Joint */}
                    <path d="M 50 92 L 50 112 L 20 112" fill="none" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
                    <rect x="10" y="102" width="18" height="18" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                    {/* Cable Tail (RJ45 + 12V) */}
                    <path d="M 20 112 Q 10 125, 30 130" fill="none" stroke="#0ea5e9" strokeWidth="3" />
                  </svg>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setIsNightMode(!isNightMode)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isNightMode
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{isNightMode ? '🔴 โหมดกลางคืน (Smart IR Active)' : '☀️ โหมดกลางวัน (Color Day)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {currentComp.category === 'transmission' && (
                <div className="w-full max-w-[280px] flex flex-col items-center">
                  <svg viewBox="0 0 220 90" className="w-full h-auto drop-shadow-2xl">
                    {/* Metal Rackmount Switch Casing */}
                    <rect x="10" y="20" width="200" height="50" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                    {/* Status LEDs (Power, PoE Max) */}
                    <circle cx="25" cy="35" r="3" fill="#10b981" />
                    <text x="32" y="37" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">PWR</text>
                    <circle cx="25" cy="50" r="3" fill={isPoeOverload ? '#ef4444' : '#f59e0b'} className={isPoeOverload ? 'animate-ping' : ''} />
                    <text x="32" y="52" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">PoE MAX</text>
                    {/* 8 RJ45 PoE Ports */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <g key={i} transform={`translate(${65 + i * 14}, 32)`}>
                        <rect x="0" y="0" width="11" height="15" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <rect x="2" y="3" width="7" height="6" fill="#38bdf8" fillOpacity={i < poeCameraCount ? 0.9 : 0.1} />
                        <circle cx="5.5" cy="19" r="1.5" fill={i < poeCameraCount ? '#10b981' : '#475569'} />
                      </g>
                    ))}
                    {/* 2 Uplink Gigabit Ports */}
                    <g transform="translate(182, 32)">
                      <rect x="0" y="0" width="11" height="15" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="1" />
                      <circle cx="5.5" cy="19" r="1.5" fill="#10b981" />
                    </g>
                  </svg>
                  <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>PoE Gigabit Switch · 120W Total Power Budget</span>
                  </div>
                </div>
              )}

              {currentComp.category === 'storage' && (
                <div className="w-full max-w-[240px] flex flex-col items-center">
                  <svg viewBox="0 0 160 120" className="w-full h-auto drop-shadow-2xl">
                    {/* HDD Metal Casing */}
                    <rect x="20" y="10" width="120" height="100" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    {/* Purple / Surveillance Banner */}
                    <rect x="20" y="15" width="120" height="24" fill="#7e22ce" />
                    <text x="30" y="31" fill="#ffffff" fontWeight="bold" fontSize="10" fontFamily="sans-serif">WD PURPLE™</text>
                    <text x="110" y="31" fill="#e9d5ff" fontSize="9" fontFamily="sans-serif">4.0 TB</text>
                    {/* Magnetic Platter Ring */}
                    <circle cx="80" cy="75" r="28" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="80" cy="75" r="10" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                    <path d="M 68 85 L 50 100" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <div className="text-[11px] font-mono text-purple-400 mt-2">
                    24/7 AllFrame Surveillance Storage (180 TB/yr Workload)
                  </div>
                </div>
              )}

              {currentComp.category === 'network_vms' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <svg viewBox="0 0 200 95" className="w-full h-auto drop-shadow-2xl">
                    <rect x="15" y="15" width="170" height="65" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    <rect x="25" y="25" width="55" height="45" rx="3" fill="#1e293b" />
                    {/* LCD Status / AI Chip */}
                    <text x="32" y="42" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">NVR 4K AI</text>
                    <text x="32" y="55" fill="#10b981" fontSize="7" fontFamily="monospace">16-CH REC</text>
                    {/* HDD Activity LEDs */}
                    <circle cx="95" cy="35" r="2" fill="#10b981" />
                    <text x="102" y="37" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">HDD1</text>
                    <circle cx="95" cy="45" r="2" fill="#10b981" />
                    <text x="102" y="47" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">HDD2</text>
                    <circle cx="95" cy="55" r="2" fill="#38bdf8" />
                    <text x="102" y="57" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">NET</text>
                    {/* USB Port */}
                    <rect x="150" y="38" width="14" height="6" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
                    <text x="146" y="55" fill="#64748b" fontSize="6" fontFamily="sans-serif">USB MOUSE</text>
                  </svg>
                  <div className="text-[11px] font-mono text-sky-400 mt-2">
                    16-Channel 4K AI Video Management Server
                  </div>
                </div>
              )}

              {currentComp.category === 'display' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <svg viewBox="0 0 190 120" className="w-full h-auto drop-shadow-2xl">
                    {/* Monitor Frame */}
                    <rect x="15" y="10" width="160" height="90" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                    {/* 4-Split Screen Matrix */}
                    <rect x="20" y="15" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="97" y="15" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="20" y="57" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="97" y="57" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    {/* CAM labels */}
                    <text x="25" y="27" fill="#38bdf8" fontSize="7" fontFamily="monospace">CAM 01 · GATE</text>
                    <text x="102" y="27" fill="#10b981" fontSize="7" fontFamily="monospace">CAM 02 · PLAZA</text>
                    <text x="25" y="69" fill="#f59e0b" fontSize="7" fontFamily="monospace">CAM 03 · SHOP</text>
                    <text x="102" y="69" fill="#a855f7" fontSize="7" fontFamily="monospace">CAM 04 · SERVER</text>
                    {/* Stand Base */}
                    <path d="M 85 100 L 85 112 L 65 112 L 125 112 L 105 112 L 105 100" fill="#334155" />
                  </svg>
                  <div className="text-[11px] font-mono text-sky-400 mt-2">
                    32" Industrial 4K Surveillance Monitor (Anti-Burn-in)
                  </div>
                </div>
              )}
            </div>

            {/* Quick Component Spec Summary List */}
            <div className="mt-4 space-y-1.5 border-t border-slate-800 pt-3">
              <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>จุดเด่นทางวิศวกรรม (Engineering Highlights)</span>
              </div>
              {Object.entries(currentComp.specs).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between text-xs py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 font-medium">{key}:</span>
                  <span className="text-slate-200 font-mono text-right ml-2 font-semibold max-w-[65%] truncate">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Deep-Dive Panels (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 สเปกฉบับเต็ม & ช่างติดตั้ง
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('anatomy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'anatomy'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 ผ่าชิ้นส่วนภายใน (X-Ray Anatomy)
            </button>

            {currentComp.category === 'camera' && (
              <button
                type="button"
                onClick={() => setActiveTab('dori_wdr')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dori_wdr'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔭 ทดลองเลนส์ DORI & WDR
              </button>
            )}

            {currentComp.category === 'transmission' && (
              <button
                type="button"
                onClick={() => setActiveTab('poe_calculator')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'poe_calculator'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ คำนวณ PoE Power Budget
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW & COMPARISON */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>คำอธิบายหน้าที่และการทำงาน (Component Role & Purpose)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  {currentComp.summaryTh}
                </p>

                <h4 className="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>ตารางสเปกทางวิศวกรรมแบบละเอียด (Detailed Technical Specifications)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(currentComp.specs).map(([key, val]) => (
                    <div key={key} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400">{key}</div>
                      <div className="text-xs font-mono text-sky-300 mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analog vs IP Deep Contrast */}
              {currentComp.analogVsIpComparison && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>เปรียบเทียบระบบแอนะล็อก (Analog) กับระบบไอพี (IP CCTV)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-rose-400 block mb-1">📻 ระบบแอนะล็อกดั้งเดิม (Analog / HD-TVI)</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{currentComp.analogVsIpComparison.analogNote}</p>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-indigo-500/30">
                      <span className="text-[11px] font-bold text-emerald-400 block mb-1">🌐 ระบบไอพีบนเครือข่าย (Modern IP CCTV)</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{currentComp.analogVsIpComparison.ipNote}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-sky-300 bg-sky-950/40 p-2.5 rounded-lg border border-sky-500/20">
                    <strong>💡 ทำไมช่างมืออาชีพจึงเลือก IP:</strong> {currentComp.analogVsIpComparison.proAdvantage}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-2 text-amber-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>ข้อพึงระวังและเทคนิคติดตั้งของช่างมืออาชีพ (Technician Field Tips)</span>
                </div>
                {currentComp.proTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: X-RAY ANATOMY */}
          {activeTab === 'anatomy' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>เลือกชิ้นส่วนภายในที่ต้องการส่องตรวจ (Select Internal Part to Inspect):</span>
                  <span className="text-[11px] text-sky-400 font-mono">
                    {currentComp.anatomyParts.length} ชิ้นส่วนหลัก
                  </span>
                </div>

                {/* Sub-parts Selector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentComp.anatomyParts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedPartId === part.id
                          ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{part.icon}</div>
                      <div className="text-xs font-bold truncate leading-tight">{part.nameTh}</div>
                      <div className="text-[10px] text-slate-400 truncate">{part.nameEn}</div>
                    </button>
                  ))}
                </div>

                {/* Detailed Part X-Ray Card */}
                {activePart && (
                  <div className="mt-4 bg-slate-950 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl shrink-0">
                        {activePart.icon}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">{activePart.nameTh}</h5>
                        <p className="text-xs text-sky-400 font-mono">{activePart.nameEn}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">หน้าที่การทำงาน:</span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        {activePart.functionTh}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">สเปกและคุณสมบัติเชิงวิศวกรรม:</span>
                      <div className="space-y-1">
                        {activePart.specDetails.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-950/30 border border-indigo-500/30 p-2.5 rounded-xl text-[11px] text-indigo-200">
                      <strong>🎯 ความสำคัญต่อระบบ:</strong> {activePart.techImportance}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DORI & WDR SIMULATOR (CAMERA SPECIFIC) */}
          {activeTab === 'dori_wdr' && (
            <div className="space-y-4">
              {/* DORI Criteria Simulator */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>เครื่องมือทดลองระยะเลนส์ DORI (DORI Lens Simulator)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      เกณฑ์สากล EN 62676-4: Detection, Observation, Recognition, Identification
                    </p>
                  </div>
                </div>

                {/* Lens Selector */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {[2.8, 4.0, 6.0, 12.0].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFocalLength(f)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedFocalLength === f
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.toFixed(1)} mm
                    </button>
                  ))}
                </div>

                {/* DORI Distance Bar Representation */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">มุมมองภาพแนวนอน (FOV):</span>
                    <span className="font-mono text-amber-400 font-bold">{dori.fov}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/30">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">1. ตรวจจับ (Detection)</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">{dori.detection}</div>
                      <div className="text-[10px] text-slate-400">รู้ว่ามีคนเดิน (25 px/m)</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-sky-500/30">
                      <div className="text-[10px] text-sky-400 font-bold uppercase">2. สังเกต (Observation)</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">{dori.observation}</div>
                      <div className="text-[10px] text-slate-400">ดูลักษณะเสื้อผ้า (63 px/m)</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-amber-500/30">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">3. จดจำ (Recognition)</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">{dori.recognition}</div>
                      <div className="text-[10px] text-slate-400">ชี้ตัวคนคุ้นเคย (125 px/m)</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-rose-500/30">
                      <div className="text-[10px] text-rose-400 font-bold uppercase">4. ชี้ชัด (Identification)</div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">{dori.identification}</div>
                      <div className="text-[10px] text-slate-400">อ่านป้ายทะเบียน (250 px/m)</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <strong>📌 พื้นที่เหมาะสมในการติดตั้ง:</strong> {dori.bestUse}
                  </div>
                </div>
              </div>

              {/* True WDR Slider Simulator */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">ทดสอบระบบย้อนแสง True WDR (120dB)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {wdrStrength === 0 ? 'WDR OFF (ปิด)' : `WDR: ${wdrStrength}% (Active)`}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={wdrStrength}
                  onChange={(e) => setWdrStrength(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                {/* Simulated Image Visualizer */}
                <div className="h-32 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  {/* Background: Outdoor Sunlight */}
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      background:
                        wdrStrength === 0
                          ? 'linear-gradient(to right, #0f172a 45%, #ffffff 55%)'
                          : `linear-gradient(to right, #1e293b 45%, rgba(186, 230, 253, ${1 - wdrStrength * 0.006}) 55%)`,
                    }}
                  />
                  {/* Foreground Person Silhouette / Revealed Face */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: wdrStrength === 0 ? '#000000' : `rgba(246, 194, 155, ${0.4 + wdrStrength * 0.006})`,
                        borderColor: wdrStrength === 0 ? '#000000' : '#f6c29b',
                        color: wdrStrength === 0 ? '#ffffff' : '#0f172a',
                      }}
                    >
                      {wdrStrength === 0 ? '👤 เงา' : '😊 ชัด'}
                    </div>
                    <div
                      className="w-16 h-10 rounded-t-lg transition-all duration-300 mt-1"
                      style={{
                        backgroundColor: wdrStrength === 0 ? '#000000' : `rgba(2, 132, 199, ${0.4 + wdrStrength * 0.006})`,
                      }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                    {wdrStrength === 0
                      ? '⚠️ ปิด WDR: แสงภายนอกขาวโพลน บุคคลหน้าร้านมืดเป็นเงามัว'
                      : '✅ เปิด True WDR: ปรับเกลี่ยแสงสว่างและส่วนมืดให้เห็นรายละเอียดใบหน้า'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POE CALCULATOR (TRANSMISSION SPECIFIC) */}
          {activeTab === 'poe_calculator' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>เครื่องคำนวณงบประมาณกำลังไฟฟ้า PoE (PoE Power Budget Calculator)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Switch Selection */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">งบประมาณสวิตช์ PoE (Total Budget):</label>
                  <select
                    value={poeSwitchBudget}
                    onChange={(e) => setPoeSwitchBudget(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value={65}>สวิตช์ 8-Port (65 Watts)</option>
                    <option value={120}>สวิตช์ 8-Port PoE+ (120 Watts - แนะนำ)</option>
                    <option value={250}>สวิตช์ 16-Port PoE+ (250 Watts)</option>
                  </select>
                </div>

                {/* Camera Model Selection */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">รุ่นกล้องวงจรปิด (Camera Load):</label>
                  <select
                    value={poeCameraModel}
                    onChange={(e) => setPoeCameraModel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="standard">กล้องมาตรฐาน (8W ต่อตัว)</option>
                    <option value="high_ir">กล้อง Smart IR 50m (12W ต่อตัว)</option>
                    <option value="ptz">กล้อง Speed Dome PTZ (28W ต่อตัว)</option>
                  </select>
                </div>

                {/* Camera Quantity */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">จำนวนกล้องที่เสียบ (1-8 ตัว):</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={poeCameraCount}
                    onChange={(e) => setPoeCameraCount(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Real-time Calculation Result Bar */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isPoeOverload
                    ? 'bg-rose-950/60 border-rose-500/80 text-rose-200'
                    : 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold">การใช้กำลังไฟฟ้าสวิตช์:</span>
                  <span className="font-mono font-bold text-sm">
                    {totalUsedWatt}W / {poeSwitchBudget}W ({poeUsagePercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isPoeOverload ? 'bg-rose-500 animate-pulse' : poeUsagePercent > 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, poeUsagePercent)}%` }}
                  />
                </div>

                <div className="mt-2 text-xs leading-relaxed">
                  {isPoeOverload ? (
                    <span className="font-bold flex items-center gap-1.5 text-rose-300">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                      คำเตือน: กำลังไฟเกินพิกัดสวิตช์ ({totalUsedWatt}W &gt; {poeSwitchBudget}W)! สวิตช์จะตัดไฟกล้องตัวท้ายสุดหรือรีบูตวนซ้ำ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ปลอดภัย: กำลังไฟอยู่ในเกณฑ์มาตรฐาน มีกำลังสำรอง {poeSwitchBudget - totalUsedWatt}W
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
