'use client';

import React, { useState, useEffect } from 'react';
import { REALISTIC_COMPONENTS } from './cctvComponentsData';
import {
  Zap,
  Sliders,
  CheckCircle2,
  Info,
  HardDrive,
  Cpu,
  Monitor,
  Camera,
  Network,
  ShieldAlert,
  Download,
  RotateCcw,
  User,
} from 'lucide-react';
import { LensDoriWdrSimulator } from '../room101/LensDoriWdrSimulator';

interface ComponentResearchItem {
  roleAndPurpose: string;
  specs: Record<string, string>;
}

type ResearchStore = Record<string, ComponentResearchItem>;

interface AnatomyPartResearchItem {
  functionTh?: string;
  specDetails?: string;
  techImportance?: string;
}

type AnatomyResearchStore = Record<string, Record<string, AnatomyPartResearchItem>>;

export const ComponentSpecExplorer: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState<string>('camera_bullet');
  const [selectedPartId, setSelectedPartId] = useState<string | null>('lens');
  const [activeTab, setActiveTab] = useState<'overview' | 'anatomy' | 'dori_wdr' | 'poe_calculator'>('overview');

  // Student Identity & Research Data State
  const [studentName, setStudentName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [researchStore, setResearchStore] = useState<ResearchStore>({});
  const [anatomyStore, setAnatomyStore] = useState<AnatomyResearchStore>({});
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Interactive States
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // PoE Calculator States
  const [poeCameraCount, setPoeCameraCount] = useState<number>(6);
  const [poeCameraModel, setPoeCameraModel] = useState<'standard' | 'high_ir' | 'ptz'>('standard');
  const [poeSwitchBudget, setPoeSwitchBudget] = useState<number>(120); // 65W, 120W, 250W

  const currentComp = (REALISTIC_COMPONENTS.find((c) => c.id === selectedCompId) || REALISTIC_COMPONENTS[0])!;
  const activePart = (currentComp.anatomyParts.find((p) => p.id === selectedPartId) || currentComp.anatomyParts[0])!;

  // Load Saved Research Drafts & Profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cctv_components_student_research');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.researchStore) {
            setResearchStore(parsed.researchStore);
          }
          if (parsed.studentName) {
            setStudentName(parsed.studentName);
          }
          if (parsed.studentCode) {
            setStudentCode(parsed.studentCode);
          }
        } catch {
          // ignore
        }
      }

      const savedAnatomy = localStorage.getItem('cctv_components_anatomy_research');
      if (savedAnatomy) {
        try {
          const parsedAnatomy = JSON.parse(savedAnatomy);
          if (parsedAnatomy && typeof parsedAnatomy === 'object') {
            setAnatomyStore(parsedAnatomy);
          }
        } catch {
          // ignore
        }
      }

      // Fetch logged-in user profile if empty
      fetch('/api/auth/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setStudentName((prev) => prev || data.user.displayName || '');
            setStudentCode((prev) => prev || data.user.studentCode || '');
          }
        })
        .catch(() => {
          // ignore
        });
    }
  }, []);

  // Save to LocalStorage whenever researchStore or student info changes
  const saveToLocalStorage = (newStore: ResearchStore, name = studentName, code = studentCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'cctv_components_student_research',
        JSON.stringify({
          studentName: name,
          studentCode: code,
          researchStore: newStore,
          lastUpdated: new Date().toISOString(),
        })
      );
    }
  };

  const saveAnatomyToLocalStorage = (newAnatomyStore: AnatomyResearchStore) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cctv_components_anatomy_research', JSON.stringify(newAnatomyStore));
    }
  };

  const handleUpdateRole = (compId: string, roleText: string) => {
    setResearchStore((prev) => {
      const item = prev[compId] || { roleAndPurpose: '', specs: {} };
      const nextStore = {
        ...prev,
        [compId]: {
          ...item,
          roleAndPurpose: roleText,
        },
      };
      saveToLocalStorage(nextStore);
      return nextStore;
    });
  };

  const handleUpdateSpec = (compId: string, specKey: string, specVal: string) => {
    setResearchStore((prev) => {
      const item = prev[compId] || { roleAndPurpose: '', specs: {} };
      const nextStore = {
        ...prev,
        [compId]: {
          ...item,
          specs: {
            ...item.specs,
            [specKey]: specVal,
          },
        },
      };
      saveToLocalStorage(nextStore);
      return nextStore;
    });
  };

  const handleResetComponent = (compId: string) => {
    setResearchStore((prev) => {
      const nextStore = {
        ...prev,
        [compId]: {
          roleAndPurpose: '',
          specs: {},
        },
      };
      saveToLocalStorage(nextStore);
      return nextStore;
    });
  };

  const handleUpdateAnatomyPart = (
    compId: string,
    partId: string,
    field: 'functionTh' | 'specDetails' | 'techImportance',
    val: string
  ) => {
    setAnatomyStore((prev) => {
      const compParts = prev[compId] || {};
      const partItem = compParts[partId] || { functionTh: '', specDetails: '', techImportance: '' };
      const nextStore: AnatomyResearchStore = {
        ...prev,
        [compId]: {
          ...compParts,
          [partId]: {
            ...partItem,
            [field]: val,
          },
        },
      };
      saveAnatomyToLocalStorage(nextStore);
      return nextStore;
    });
  };

  const handleResetAnatomyPart = (compId: string, partId: string) => {
    setAnatomyStore((prev) => {
      const compParts = { ...(prev[compId] || {}) };
      delete compParts[partId];
      const nextStore: AnatomyResearchStore = {
        ...prev,
        [compId]: compParts,
      };
      saveAnatomyToLocalStorage(nextStore);
      return nextStore;
    });
  };

  // Export research results as a JSON file
  const handleExportJson = () => {
    if (!studentName.trim() || !studentCode.trim()) {
      setExportNotice('⚠️ กรุณาระบุชื่อ-นามสกุล และรหัสนักศึกษา ก่อนส่งออกไฟล์ JSON');
      setTimeout(() => setExportNotice(null), 5000);
      return;
    }

    const totalComponents = REALISTIC_COMPONENTS.length;
    let filledCount = 0;

    const componentsPayload = REALISTIC_COMPONENTS.map((comp) => {
      const research = researchStore[comp.id] || { roleAndPurpose: '', specs: {} };
      const specKeys = Object.keys(comp.specs);
      const isRoleFilled = Boolean(research.roleAndPurpose?.trim());
      const filledSpecsCount = specKeys.filter((k) => Boolean(research.specs[k]?.trim())).length;

      const anatomyForComp = comp.anatomyParts.map((part) => {
        const rPart = anatomyStore[comp.id]?.[part.id] || { functionTh: '', specDetails: '', techImportance: '' };
        return {
          partId: part.id,
          nameTh: part.nameTh,
          nameEn: part.nameEn,
          studentResearch: {
            functionTh: rPart.functionTh || '',
            specDetails: rPart.specDetails || '',
            techImportance: rPart.techImportance || '',
            isCompleted: Boolean(rPart.functionTh?.trim() || rPart.specDetails?.trim() || rPart.techImportance?.trim()),
          },
        };
      });

      const filledAnatomyCount = anatomyForComp.filter((p) => p.studentResearch.isCompleted).length;

      if (isRoleFilled || filledSpecsCount > 0 || filledAnatomyCount > 0) {
        filledCount++;
      }

      return {
        componentId: comp.id,
        category: comp.category,
        modelCode: comp.modelCode,
        componentNameTh: comp.nameTh,
        componentNameEn: comp.nameEn,
        studentResearch: {
          roleAndPurpose: research.roleAndPurpose || '',
          technicalSpecifications: specKeys.reduce<Record<string, string>>((acc, key) => {
            acc[key] = research.specs[key] || '';
            return acc;
          }, {}),
          xrayAnatomyResearch: anatomyForComp,
          completeness: {
            isRoleCompleted: isRoleFilled,
            specsCompletedCount: filledSpecsCount,
            specsTotalCount: specKeys.length,
            anatomyCompletedCount: filledAnatomyCount,
            anatomyTotalCount: comp.anatomyParts.length,
          },
        },
      };
    });

    if (filledCount === 0) {
      setExportNotice('⚠️ กรุณาสืบค้นข้อมูลหน้าที่ สเปก หรือชิ้นส่วน X-Ray อย่างน้อย 1 องค์ประกอบก่อนส่งออกไฟล์ JSON');
      setTimeout(() => setExportNotice(null), 5000);
      return;
    }

    const exportPayload = {
      reportTitle: 'รายงานการสืบค้นหน้าที่ สเปก และชิ้นส่วนผ่า X-Ray 5 องค์ประกอบระบบกล้องวงจรปิด',
      courseCode: '21909-2020',
      courseName: 'การติดตั้งและบำรุงรักษาระบบโทรทัศน์วงจรปิด (CCTV System)',
      institution: 'วิทยาลัยเทคนิคอุบลราชธานี',
      exportedAt: new Date().toISOString(),
      student: {
        displayName: studentName.trim() || 'ไม่ระบุชื่อ',
        studentCode: studentCode.trim() || 'ไม่ระบุรหัส',
      },
      summary: {
        totalComponents,
        researchedComponentsCount: filledCount,
      },
      components: componentsPayload,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeCode = (studentCode.trim() || 'student').replace(/[^a-zA-Z0-9_-]/g, '');
    a.href = url;
    a.download = `cctv_components_research_${safeCode}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('✓ ดาวน์โหลดไฟล์ JSON สำเร็จ: ไฟล์บันทึกข้อมูลสเปกและชิ้นส่วน X-Ray ครบถ้วนพร้อมส่งอาจารย์');
    setTimeout(() => setExportNotice(null), 6000);
  };

  // PoE Calculation
  const camWatt = poeCameraModel === 'standard' ? 8 : poeCameraModel === 'high_ir' ? 12 : 28;
  const totalUsedWatt = poeCameraCount * camWatt;
  const isPoeOverload = totalUsedWatt > poeSwitchBudget;
  const poeUsagePercent = Math.min(100, Math.round((totalUsedWatt / poeSwitchBudget) * 100));

  // Progress stats
  const currentResearch = researchStore[selectedCompId] || { roleAndPurpose: '', specs: {} };
  const currentTotalSpecKeys = Object.keys(currentComp.specs);
  const currentFilledSpecsCount = currentTotalSpecKeys.filter((k) => Boolean(currentResearch.specs[k]?.trim())).length;
  const totalResearchedComps = REALISTIC_COMPONENTS.filter((comp) => {
    const item = researchStore[comp.id];
    return item && (Boolean(item.roleAndPurpose?.trim()) || Object.keys(item.specs).some((k) => Boolean(item.specs[k]?.trim())));
  }).length;

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur">
        {REALISTIC_COMPONENTS.map((comp) => {
          const isSelected = comp.id === selectedCompId;
          const rItem = researchStore[comp.id];
          const isCompResearched = rItem && (Boolean(rItem.roleAndPurpose?.trim()) || Object.keys(rItem.specs).length > 0);

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
                setActiveTab('overview');
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider opacity-75">
                  <span className="truncate">{comp.category}</span>
                  {isCompResearched && <span className="text-emerald-400 font-bold ml-1">✓</span>}
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
        {/* Left Column: Visual Hardware Mockup & Status (5 Cols) */}
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
                    <rect x="25" y="30" width="130" height="12" rx="4" fill="#334155" />
                    <rect x="35" y="42" width="115" height="50" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                    <rect x="145" y="38" width="14" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="152" cy="67" r="18" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="152" cy="67" r="9" fill={isNightMode ? '#ef4444' : '#0369a1'} />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180;
                      const cx = 152 + 13 * Math.cos(rad);
                      const cy = 67 + 13 * Math.sin(rad);
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r={1.8}
                          fill={isNightMode ? '#ef4444' : '#64748b'}
                          opacity={isNightMode ? 0.9 : 0.4}
                        />
                      );
                    })}
                    <path d="M 35 67 L 5 67 L 5 95 L 20 95" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="20" cy="95" r="8" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setIsNightMode(!isNightMode)}
                    className="mt-3 px-3 py-1 rounded-full text-[10px] font-mono border transition flex items-center gap-1.5 cursor-pointer bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                  >
                    <span>{isNightMode ? '☀️ สลับเป็น Day Mode' : '🌙 สลับเป็น Night Mode (IR)'}</span>
                  </button>
                </div>
              )}

              {currentComp.category === 'transmission' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <svg viewBox="0 0 200 90" className="w-full h-auto drop-shadow-2xl">
                    <rect x="10" y="20" width="180" height="50" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => {
                      const x = 22 + p * 16;
                      const isPlugged = p < poeCameraCount;
                      return (
                        <g key={p}>
                          <rect x={x} y="38" width="12" height="14" rx="2" fill={isPlugged ? '#0284c7' : '#1e293b'} stroke="#64748b" strokeWidth="1" />
                          <circle cx={x + 6} cy="30" r="2" fill={isPlugged ? (isPoeOverload ? '#ef4444' : '#10b981') : '#475569'} />
                        </g>
                      );
                    })}
                    <rect x="156" y="36" width="14" height="16" rx="2" fill="#065f46" stroke="#10b981" strokeWidth="1.2" />
                    <text x="157" y="60" fill="#10b981" fontSize="5" fontFamily="monospace">UPLINK</text>
                  </svg>
                  <div className="text-[11px] font-mono text-sky-400 mt-2">
                    Managed 8-Port Gigabit PoE+ Switch
                  </div>
                </div>
              )}

              {currentComp.category === 'storage' && (
                <div className="w-full max-w-[240px] flex flex-col items-center">
                  <svg viewBox="0 0 180 110" className="w-full h-auto drop-shadow-2xl">
                    <rect x="25" y="15" width="130" height="80" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <rect x="35" y="25" width="110" height="60" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <circle cx="85" cy="55" r="24" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="85" cy="55" r="8" fill="#0f172a" />
                    <path d="M 85 55 L 125 45" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="125" cy="45" r="3" fill="#38bdf8" />
                  </svg>
                  <div className="text-[11px] font-mono text-purple-400 mt-2">
                    3.5" Surveillance Grade SATA-III (24/7 Heavy Write)
                  </div>
                </div>
              )}

              {currentComp.category === 'network_vms' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <svg viewBox="0 0 200 90" className="w-full h-auto drop-shadow-2xl">
                    <rect x="10" y="22" width="180" height="46" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="26" cy="45" r="5" fill="#10b981" />
                    <circle cx="38" cy="45" r="3" fill="#f59e0b" />
                    <rect x="60" y="38" width="22" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <text x="63" y="57" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">HDMI</text>
                    <rect x="98" y="38" width="18" height="14" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <text x="102" y="57" fill="#94a3b8" fontSize="6" fontFamily="sans-serif">NET</text>
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
                    <rect x="15" y="10" width="160" height="90" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                    <rect x="20" y="15" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="97" y="15" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="20" y="57" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <rect x="97" y="57" width="73" height="38" fill="#1e293b" stroke="#334155" />
                    <text x="25" y="27" fill="#38bdf8" fontSize="7" fontFamily="monospace">CAM 01 · GATE</text>
                    <text x="102" y="27" fill="#10b981" fontSize="7" fontFamily="monospace">CAM 02 · PLAZA</text>
                    <text x="25" y="69" fill="#f59e0b" fontSize="7" fontFamily="monospace">CAM 03 · SHOP</text>
                    <text x="102" y="69" fill="#a855f7" fontSize="7" fontFamily="monospace">CAM 04 · SERVER</text>
                    <path d="M 85 100 L 85 112 L 65 112 L 125 112 L 105 112 L 105 100" fill="#334155" />
                  </svg>
                  <div className="text-[11px] font-mono text-sky-400 mt-2">
                    32&quot; Industrial 4K Surveillance Monitor (Anti-Burn-in)
                  </div>
                </div>
              )}
            </div>

            {/* Student Research Progress on this component */}
            <div className="mt-4 p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">ความคืบหน้าการสืบค้นอุปกรณ์นี้:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {currentFilledSpecsCount}/{currentTotalSpecKeys.length} สเปก
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.round((currentFilledSpecsCount / currentTotalSpecKeys.length) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                <span>หน้าที่และการทำงาน: {currentResearch.roleAndPurpose?.trim() ? '✓ บันทึกแล้ว' : 'รอสืบค้น'}</span>
                <span>รวมทั้งระบบ: {totalResearchedComps}/5 อุปกรณ์</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Deep-Dive Panels (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 ฟอร์มสืบค้นสเปก & ส่งงาน JSON
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

          {/* TAB 1: STUDENT INVESTIGATION & RESEARCH FORM */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Student Header Bar & Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">ข้อมูลผู้สืบค้นและทำรายงาน:</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ส่งออกไฟล์ JSON (Download JSON)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ชื่อ-นามสกุล นักเรียน/นักศึกษา:</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        saveToLocalStorage(researchStore, e.target.value, studentCode);
                      }}
                      placeholder="เช่น นายช่างเทคนิค ดีเด่น"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">รหัสนักศึกษา (Student Code):</label>
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => {
                        setStudentCode(e.target.value);
                        saveToLocalStorage(researchStore, studentName, e.target.value);
                      }}
                      placeholder="เช่น 6630123456"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-1.5 text-xs font-mono text-sky-400 placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {exportNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                    <span>{exportNotice}</span>
                    <button type="button" onClick={() => setExportNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
                  </div>
                )}
              </div>

              {/* Research Form Inputs */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
                {/* Section 1: Role & Purpose */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-sky-400" />
                      <span>คำอธิบายหน้าที่และการทำงาน (Component Role & Purpose)</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {currentResearch.roleAndPurpose?.length || 0} ตัวอักษร
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 m-0">
                    ให้นักเรียนสืบค้นและพิมพ์อธิบายว่าอุปกรณ์นี้มีหน้าที่อะไรในระบบ CCTV ทำงานอย่างไร และมีความสำคัญอย่างไร:
                  </p>
                  <textarea
                    rows={3}
                    value={currentResearch.roleAndPurpose || ''}
                    onChange={(e) => handleUpdateRole(selectedCompId, e.target.value)}
                    placeholder={`ค้นคว้าและพิมพ์อธิบายหน้าที่หลักของ ${currentComp.nameTh} ในระบบกล้องวงจรปิด เช่น การแปลงสัญญาณแสง, การบีบอัด, การเชื่อมต่อ...`}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition leading-relaxed"
                  />
                </div>

                {/* Section 2: Detailed Technical Specifications */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>ตารางสเปกทางวิศวกรรมแบบละเอียด (Detailed Technical Specifications)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleResetComponent(selectedCompId)}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition"
                      title="ล้างข้อมูลที่กรอกในอุปกรณ์นี้"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ล้างข้อมูลอุปกรณ์นี้</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 m-0">
                    ให้นักเรียนค้นคว้าข้อมูลสเปกวิศวกรรมจริงจาก Datasheet / Specification Sheet แล้วพิมพ์ระบุค่าในแต่ละหัวข้อ:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {currentTotalSpecKeys.map((key) => {
                      const val = currentResearch.specs[key] || '';
                      return (
                        <div key={key} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5 focus-within:border-sky-500/60 transition">
                          <label className="text-[11px] font-semibold text-slate-300 block truncate">
                            {key}:
                          </label>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleUpdateSpec(selectedCompId, key, e.target.value)}
                            placeholder="ระบุสเปกที่ค้นคว้าได้..."
                            className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs text-sky-200 placeholder-slate-600 focus:outline-none transition font-mono"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Analog vs IP Deep Contrast (Learning Reference) */}
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

          {/* TAB 2: X-RAY ANATOMY - STUDENT RESEARCH */}
          {activeTab === 'anatomy' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      🔬 เลือกชิ้นส่วนภายในที่ต้องการส่องตรวจและสืบค้น (Select Internal Part to Investigate):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ให้นักเรียนคลิกเลือกชิ้นส่วน แล้วสืบค้นข้อมูลหน้าที่ สเปก และความสำคัญทางวิศวกรรมด้วยตนเอง
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ส่งออกไฟล์ JSON</span>
                    </button>
                  </div>
                </div>

                {/* Sub-parts Selector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentComp.anatomyParts.map((part) => {
                    const isPartSelected = selectedPartId === part.id;
                    const rPart = anatomyStore[currentComp.id]?.[part.id];
                    const isDone = Boolean(
                      rPart?.functionTh?.trim() || rPart?.specDetails?.trim() || rPart?.techImportance?.trim()
                    );

                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => setSelectedPartId(part.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isPartSelected
                            ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-md ring-1 ring-sky-400/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl mb-1">{part.icon}</span>
                          {isDone && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              ✓ มีข้อมูล
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold truncate leading-tight">{part.nameTh}</div>
                        <div className="text-[10px] text-slate-400 truncate">{part.nameEn}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Part X-Ray Investigation Form */}
                {activePart && (() => {
                  const currentAnatomyPart = anatomyStore[currentComp.id]?.[activePart.id] || {
                    functionTh: '',
                    specDetails: '',
                    techImportance: '',
                  };

                  return (
                    <div className="mt-4 bg-slate-950 border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{activePart.icon}</span>
                          <div>
                            <h5 className="text-sm font-bold text-white m-0">{activePart.nameTh}</h5>
                            <p className="text-[11px] text-sky-400 font-mono m-0">{activePart.nameEn}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResetAnatomyPart(currentComp.id, activePart.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition px-2.5 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
                          title="ล้างข้อมูลการสืบค้นชิ้นส่วนนี้"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>ล้างข้อมูลชิ้นส่วนนี้</span>
                        </button>
                      </div>

                      {/* Section 1: Function & Role */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="text-sky-400">1.</span>
                            <span>หน้าที่การทำงาน (Part Function & Role):</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {currentAnatomyPart.functionTh?.length || 0} ตัวอักษร
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={currentAnatomyPart.functionTh || ''}
                          onChange={(e) =>
                            handleUpdateAnatomyPart(currentComp.id, activePart.id, 'functionTh', e.target.value)
                          }
                          placeholder={`สืบค้นและพิมพ์อธิบายหน้าที่การทำงานของ ${activePart.nameTh} เช่น การรับแสง, การประมวลผลสัญญาณภาพ, การระบายความร้อน...`}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition leading-relaxed"
                        />
                      </div>

                      {/* Section 2: Key Part Specs & Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="text-sky-400">2.</span>
                            <span>รายละเอียดสเปกชิ้นส่วน (Key Part Specifications & Attributes):</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {currentAnatomyPart.specDetails?.length || 0} ตัวอักษร
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={currentAnatomyPart.specDetails || ''}
                          onChange={(e) =>
                            handleUpdateAnatomyPart(currentComp.id, activePart.id, 'specDetails', e.target.value)
                          }
                          placeholder="สืบค้นและระบุรายละเอียดสเปกชิ้นส่วน เช่น ขนาดเซนเซอร์ 1/2.8 นิ้ว, เลนส์ F1.0, ชิป SoC ARM Cortex, มาตรฐานกันน้ำ IP67..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition leading-relaxed"
                        />
                      </div>

                      {/* Section 3: Engineering Importance */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="text-sky-400">3.</span>
                            <span>ความสำคัญทางวิศวกรรม (Engineering Importance & Practical Impact):</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {currentAnatomyPart.techImportance?.length || 0} ตัวอักษร
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={currentAnatomyPart.techImportance || ''}
                          onChange={(e) =>
                            handleUpdateAnatomyPart(currentComp.id, activePart.id, 'techImportance', e.target.value)
                          }
                          placeholder={`สืบค้นและระบุความสำคัญเชิงวิศวกรรมของ ${activePart.nameTh} เช่น หากชิ้นส่วนนี้เสียหายหรือไม่ได้มาตรฐาน จะส่งผลต่อคุณภาพอย่างไร...`}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: DORI & WDR SIMULATOR */}
          {activeTab === 'dori_wdr' && currentComp.category === 'camera' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <LensDoriWdrSimulator />
            </div>
          )}

          {/* TAB 4: POE CALCULATOR */}
          {activeTab === 'poe_calculator' && currentComp.category === 'transmission' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>โปรแกรมจำลองคำนวณกำลังไฟฟ้า PoE Power Budget สวิตช์</span>
                </h4>
                <p className="text-xs text-slate-300">
                  ทดสอบเลือกงบประมาณกำลังไฟของสวิตช์และจำนวนกล้อง เพื่อประเมินความเสี่ยงไฟตก/กล้องรีบูต
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
