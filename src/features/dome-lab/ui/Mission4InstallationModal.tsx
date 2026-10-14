'use client';

import React, { useEffect, useState } from 'react';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { SURFACES_DATA, evaluateDomeMission4Submission } from '../data/domeLabData';
import {
  AnchorType,
  DomeAssemblyChecklist,
  DrillBitSize,
  DrillBitType,
  DrillMode,
  Mission4Submission,
  SurfaceInfo,
  SurfaceType,
} from '../types';
import {
  X,
  Layers,
  Wrench,
  CheckCircle2,
  Save,
  Check,
  RotateCw,
  ZoomIn,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

// Visual Data for Drill Bits with High-Res 3D Photorealistic Renders
const DRILL_BITS_VISUAL = [
  {
    id: 'wood' as DrillBitType,
    label: 'ดอกเจาะไม้ (Brad-point Bit)',
    desc: 'ปลายเดือยแหลมคมนำศูนย์ คมตัดข้างคู่ ไม่ดิ้นไถล',
    image: '/images/bullet-lab/drill_bit_wood.jpg',
    tag: 'WOOD BIT',
    inspectDetails: [
      'ปลายเดือยแหลมตรงกลาง (Brad Point) ทำหน้าที่จิกลงบนจุดมาร์ก ป้องกันดอกสว่านไถล',
      'คมตัดขอบนอก 2 ด้าน (Spurs) ช่วยตัดเสี้ยนไม้ให้รูเจาะกลมเนียน ไม่แตกฉีก',
      'ร่องคายเศษไม้กว้างพิเศษ ช่วยระบายขี้เลื่อยออกอย่างรวดเร็ว',
    ],
  },
  {
    id: 'metal' as DrillBitType,
    label: 'ดอกเจาะเหล็ก (HSS Twist Bit)',
    desc: 'เหล็กกล้าชุบแข็ง เกลียวเคลือบไทเทเนียม คมตัด 118°',
    image: '/images/bullet-lab/drill_bit_metal.jpg',
    tag: 'HSS METAL',
    inspectDetails: [
      'หัวตัดมุมองศา 118° Split-point เจาะกินเนื้อเหล็กทันทีโดยไม่ต้องตอกนำศูนย์ลึก',
      'ชุบผิว Titanium Nitride (สีทอง) ทนความร้อนสูง ลดแรงเสียดทาน',
      'เกลียวคู่ระบายเศษโลหะ (Chip Flutes) ป้องกันการติดขัดขณะเจาะโครงเหล็ก C-Line',
    ],
  },
  {
    id: 'masonry' as DrillBitType,
    label: 'ดอกเจาะปูน (Carbide Tipped)',
    desc: 'หัวคาร์ไบด์ทรงลิ่มหนาพิเศษ ทนทานแรงกระแทก',
    image: '/images/bullet-lab/drill_bit_masonry.jpg',
    tag: 'MASONRY HAMMER',
    inspectDetails: [
      'ปลายหัวเชื่อมเกล็ดทังสเตนคาร์ไบด์ (Tungsten Carbide Tip) แข็งแกร่ง ทนแรงกระแทกจากสว่านโรตารี่',
      'ก้านเกลียวคู่ทรงลึกสำหรับระบายฝุ่นผงปูน/อิฐออกจากรูเจาะอย่างต่อเนื่อง',
      'ออกแบบมาเฉพาะสำหรับใช้งานร่วมกับโหมดกระแทก (Hammer Mode)',
    ],
  },
  {
    id: 'multipurpose' as DrillBitType,
    label: 'ดอกอเนกประสงค์ (Multi-purpose Bit)',
    desc: 'หัวเพชรเจียรคม 4 ทิศทาง สำหรับสมาร์ทบอร์ด/ยิปซั่ม',
    image: '/images/bullet-lab/drill_bit_multipurpose.jpg',
    tag: 'MULTI-MATERIAL',
    inspectDetails: [
      'หัวเจียรคมเพชร 4 ทิศทาง คมกริบ สามารถเจาะผ่านวัสดุเปราะ เช่น สมาร์ทบอร์ด กระเบื้อง ยิปซั่ม',
      'เกลียวระบายฝุ่นสีน้ำเงิน รองรับการเจาะแห้งโดยไม่ทำให้วัสดุรอบรูเจาะปริแตก',
      'ห้ามใช้โหมดกระแทกเด็ดขาดเมื่อเจาะแผ่นไฟเบอร์ซีเมนต์หรือฝ้ายิปซั่ม',
    ],
  },
];

// Visual Data for Anchors & Fasteners with High-Res 3D Renders
const FASTENERS_VISUAL = [
  {
    id: 'wood-screw-direct' as AnchorType,
    label: 'ยึดตรงเข้าเนื้อไม้ (Wood Screw Direct)',
    desc: 'สกรูเกลียวปล่อยงานไม้หัวเตเปอร์ ยึดเข้าเนื้อไม้โดยตรง',
    image: '/images/bullet-lab/anchor_wood_screw.jpg',
    tag: 'WOOD SCREW',
    inspectDetails: [
      'เกลียวหยาบและลึก ช่วยเกาะยึดเส้นใยไม้ได้อย่างแน่นหนาที่สุด',
      'หัวเตเปอร์ (Countersunk Head) เมื่อขันจนสุด หัวสกรูจะจมเรียบเสมอฐานแป้นกล้องโดม',
      'ไม่ต้องใส่พุกพลาสติก เพียงเจาะรูนำขนาดเล็กกว่าเกลียวเล็กน้อย',
    ],
  },
  {
    id: 'self-drilling-metal' as AnchorType,
    label: 'สกรูปลายสว่านยึดเหล็ก (Self-drilling TEK Screw)',
    desc: 'ปลายสว่านเจาะคว้านเกลียวในตัว สำหรับโครงเหล็ก / C-Line',
    image: '/images/bullet-lab/anchor_metal_tek.jpg',
    tag: 'TEK SCREW',
    inspectDetails: [
      'ปลายหัวเจาะรูปทรงสว่าน (Drill Point) เจาะทะลุแผ่นเหล็กและต๊าปเกลียวในขั้นตอนเดียว',
      'ไม่ต้องเจาะรูนำล่วงหน้า ประหยัดเวลาในการติดตั้งบนโครงคร่าว C-Line ฝ้าเพดาน',
      'หัวกระทะกว้างพร้อมปีกกด ยึดฐานแป้นกล้องโดมได้มั่นคง ไม่หลุดคลอน',
    ],
  },
  {
    id: 'plastic-expansion' as AnchorType,
    label: 'พุกพลาสติกขยายตัว (Plastic Wall Plug #7)',
    desc: 'พุกพลาสติกเบอร์ 7 ขยายตัวอัดแน่นในรูเจาะคอนกรีต/อิฐ',
    image: '/images/bullet-lab/anchor_plastic_plug.jpg',
    tag: 'PLASTIC PLUG',
    inspectDetails: [
      'ครีบกันหมุนรอบตัว (Anti-rotation Fins) ล็อกแน่นในเนื้อปูน ป้องกันพุกหมุนฟรีตามสกรู',
      'เมื่อขันสกรูเข้าไป ปลายพุกจะปริขยายตัว 2 ทิศทาง อัดแน่นกับผนังรูคอนกรีต',
      'มาตรฐานสำหรับยึดแป้นกล้องโดมน้ำหนัก 0.5 - 1.5 กก. บนผนังปูนหรือพื้นคอนกรีต',
    ],
  },
  {
    id: 'hollow-wall-toggle' as AnchorType,
    label: 'พุกผีเสื้อ / พุกร่ม (Hollow Wall Toggle Bolt)',
    desc: 'ปีกกางล็อกด้านหลังแผ่น สำหรับยิปซั่มฝ้าเพดาน & สมาร์ทบอร์ด',
    image: '/images/bullet-lab/anchor_toggle_bolt.jpg',
    tag: 'TOGGLE BOLT',
    inspectDetails: [
      'ปีกสปริงกางออก 180° เมื่อลอดผ่านรูเจาะไปอยู่ด้านหลังแผ่นฝ้าเพดาน',
      'กระจายแรงดึงลงบนพื้นที่ผิวหลังแผ่นกว้าง ป้องกันแผ่นยิปซั่มฉีกขาดหรือหลุดร่วง',
      'อุปกรณ์สำคัญที่สุดสำหรับงานติดตั้งกล้องโดมใต้ฝ้าเพดานกลวงทุกประเภท',
    ],
  },
];

interface InspectModalData {
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  details: string[];
}

export const Mission4InstallationModal: React.FC = () => {
  const isMission4ModalOpen = useDomeLabStore((s) => s.isMission4ModalOpen);
  const setIsMission4ModalOpen = useDomeLabStore((s) => s.setIsMission4ModalOpen);
  const surfaceType = useDomeLabStore((s) => s.surfaceType);
  const setSurfaceType = useDomeLabStore((s) => s.setSurfaceType);
  const submissionsBySurface = useDomeLabStore((s) => s.submissionsBySurface);
  const saveSurfaceSubmission = useDomeLabStore((s) => s.saveSurfaceSubmission);

  // Active surface window tab
  const [activeTab, setActiveTab] = useState<SurfaceType>(surfaceType || 'wood');

  // Student self-selection state (Starts null: student MUST choose themselves!)
  const [localBit, setLocalBit] = useState<DrillBitType | null>(null);
  const [localBitSize, setLocalBitSize] = useState<DrillBitSize | null>(null);
  const [localMode, setLocalMode] = useState<DrillMode | null>(null);
  const [localAnchor, setLocalAnchor] = useState<AnchorType | null>(null);
  const [localDepth, setLocalDepth] = useState<number | null>(null);
  const [localPullForce, setLocalPullForce] = useState<number | null>(null);

  // Dome Assembly Checklist
  const [domeAssembly, setDomeAssembly] = useState<DomeAssemblyChecklist>({
    basePlateMounted: true,
    cableGrommetSealed: true,
    antiIrRingVerified: true,
    domeCoverCleaned: true,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inspectData, setInspectData] = useState<InspectModalData | null>(null);

  const loadSurfaceFormState = (surface: SurfaceType) => {
    const existing = submissionsBySurface[surface];
    if (existing && !isEditing) {
      setLocalBit(existing.drillBit);
      setLocalBitSize(existing.drillBitSize);
      setLocalMode(existing.drillMode);
      setLocalAnchor(existing.anchor);
      setLocalDepth(existing.drillDepthMm);
      setLocalPullForce(existing.pullTestForceN);
      setDomeAssembly(existing.domeAssembly);
    } else {
      setLocalBit(null);
      setLocalBitSize(null);
      setLocalMode(null);
      setLocalAnchor(null);
      setLocalDepth(null);
      setLocalPullForce(null);
      setDomeAssembly({
        basePlateMounted: false,
        cableGrommetSealed: false,
        antiIrRingVerified: false,
        domeCoverCleaned: false,
      });
    }
  };

  useEffect(() => {
    if (isMission4ModalOpen) {
      setActiveTab(surfaceType);
      loadSurfaceFormState(surfaceType);
      setIsEditing(false);
    }
  }, [isMission4ModalOpen]);

  const handleSwitchTab = (surface: SurfaceType) => {
    setActiveTab(surface);
    setSurfaceType(surface);
    setIsEditing(false);
    loadSurfaceFormState(surface);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMission4ModalOpen) {
        if (inspectData) {
          setInspectData(null);
        } else {
          setIsMission4ModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMission4ModalOpen, inspectData, setIsMission4ModalOpen]);

  if (!isMission4ModalOpen) return null;

  const currentSurfaceData: SurfaceInfo = SURFACES_DATA[activeTab];
  const activeSubmission = submissionsBySurface[activeTab];

  // Validation: Must select all items 2-7
  const isComplete =
    localBit !== null &&
    localBitSize !== null &&
    localMode !== null &&
    localAnchor !== null &&
    localDepth !== null &&
    localPullForce !== null;

  let selectedCount = 0;
  if (localBit !== null) selectedCount++;
  if (localBitSize !== null) selectedCount++;
  if (localMode !== null) selectedCount++;
  if (localAnchor !== null) selectedCount++;
  if (localDepth !== null) selectedCount++;
  if (localPullForce !== null) selectedCount++;

  const handleSaveAndEvaluate = () => {
    if (!isComplete) return;

    const evaluation = evaluateDomeMission4Submission(
      activeTab,
      localBit,
      localBitSize,
      localMode,
      localAnchor,
      localDepth,
      localPullForce,
      domeAssembly
    );

    const submission: Mission4Submission = {
      surfaceType: activeTab,
      drillBit: localBit!,
      drillBitSize: localBitSize!,
      drillMode: localMode!,
      anchor: localAnchor!,
      drillDepthMm: localDepth!,
      pullTestForceN: localPullForce!,
      domeAssembly,
      submittedAt: new Date().toLocaleTimeString(),
      score: evaluation.score,
      isPassed: evaluation.isPassed,
      feedback: evaluation.feedback,
    };

    saveSurfaceSubmission(activeTab, submission);
    setIsEditing(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] isolate flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[900px] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  ใบงานติดตั้งกล้องโดมตามชนิดพื้นผิว (Dome Surface Worksheets)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                  นักเรียนคลิกเลือกคำตอบเองข้อ 2–7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                เลือกอุปกรณ์เจาะยึด ตรวจสอบวงแหวนกัน IR และประกอบกล้องโดมให้ตรงตามหลักวิศวกรรมช่าง
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMission4ModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 SURFACE WINDOW TABS */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {(['wood', 'metal', 'concrete', 'smartboard'] as SurfaceType[]).map((st) => {
            const sInfo = SURFACES_DATA[st];
            const isCurrentTab = activeTab === st;
            const sub = submissionsBySurface[st];
            const isDone = sub !== null;

            return (
              <button
                key={st}
                onClick={() => handleSwitchTab(st)}
                className={`flex-1 min-w-[190px] px-3.5 py-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isCurrentTab
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-inner"
                    style={{ backgroundColor: sInfo.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{sInfo.nameTh}</div>
                    <div className="text-[10px] text-slate-400 truncate">{sInfo.subtitleTh}</div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        sub.isPassed
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-500/40'
                          : 'bg-amber-900 text-amber-200 border border-amber-500/40'
                      }`}
                    >
                      {sub.score}/100
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      รอทำ
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Surface Header Banner */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-inner"
                style={{ backgroundColor: currentSurfaceData.color }}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentSurfaceData.nameTh}</span>
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    ({currentSurfaceData.subtitleTh})
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {currentSurfaceData.notesTh}
                </p>
              </div>
            </div>

            {/* Validation Checklist Indicator */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs shrink-0">
              <div className="text-slate-400">
                สถานะการเลือก: <strong className="text-cyan-400 font-mono">{selectedCount} / 6</strong> ข้อ
              </div>
              {isComplete ? (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  ครบถ้วน พร้อมส่ง
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  ยังเลือกไม่ครบ
                </span>
              )}
            </div>
          </div>

          {/* SUBMISSION RESULT BANNER IF ALREADY SUBMITTED */}
          {activeSubmission && !isEditing && (
            <div
              className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300 ${
                activeSubmission.isPassed
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold">
                    บันทึกผลงานสำเร็จ: ได้ {activeSubmission.score} / 100 คะแนน ({activeSubmission.isPassed ? 'ผ่านเกณฑ์ช่าง' : 'ต้องปรับปรุง'})
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-0.5 pt-1">
                  {activeSubmission.feedback.map((fb, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[11px] leading-tight">{fb}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditing(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>แก้ไขคำตอบ</span>
              </button>
            </div>
          )}

          {/* QUESTION 2: DRILL BIT TYPE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">2</span>
                <span>ชนิดดอกสว่านที่ต้องใช้ (Drill Bit Type)</span>
                <span className="text-red-400">*</span>
              </label>
              {localBit && <span className="text-[11px] text-cyan-400 font-medium">✓ เลือกแล้ว</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DRILL_BITS_VISUAL.map((bit) => {
                const isSelected = localBit === bit.id;
                return (
                  <div
                    key={bit.id}
                    onClick={() => setLocalBit(bit.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-lg ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Image Preview with Lightbox Zoom Button */}
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900 border border-slate-800">
                        <img src={bit.image} alt={bit.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectData({
                              title: bit.label,
                              subtitle: bit.tag,
                              image: bit.image,
                              tag: bit.tag,
                              details: bit.inspectDetails,
                            });
                          }}
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                          title="ซูมดูรายละเอียด 3D"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-white">{bit.label}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{bit.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{bit.tag}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUESTION 3: DRILL BIT SIZE & QUESTION 4: DRILL MODE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question 3: Drill Bit Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">3</span>
                  <span>ขนาดดอกสว่าน (Drill Bit Size)</span>
                  <span className="text-red-400">*</span>
                </label>
                {localBitSize && <span className="text-[11px] text-cyan-400 font-medium font-mono">✓ {localBitSize}</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['4mm', '6mm', '8mm', '10mm'] as DrillBitSize[]).map((sz) => {
                  const isSelected = localBitSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setLocalBitSize(sz)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold shadow'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-sm font-mono">{sz}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 4: Drill Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">4</span>
                  <span>โหมดการเจาะของสว่าน (Drill Mode)</span>
                  <span className="text-red-400">*</span>
                </label>
                {localMode && <span className="text-[11px] text-cyan-400 font-medium">✓ เลือกแล้ว</span>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal' as DrillMode, label: 'ธรรมดา (Rotary)', desc: 'เจาะไม้ / โลหะ' },
                  { id: 'hammer' as DrillMode, label: 'กระแทก (Hammer)', desc: 'เจาะคอนกรีต' },
                  { id: 'driver' as DrillMode, label: 'ปรับทอร์ก (Driver)', desc: 'ขันสกรู C-Line' },
                ].map((mode) => {
                  const isSelected = localMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setLocalMode(mode.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white shadow'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{mode.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUESTION 5: FASTENERS & ANCHORS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">5</span>
                <span>รูปแบบการยึดน็อตและพุก (Fasteners & Anchors)</span>
                <span className="text-red-400">*</span>
              </label>
              {localAnchor && <span className="text-[11px] text-cyan-400 font-medium">✓ เลือกแล้ว</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {FASTENERS_VISUAL.map((fastener) => {
                const isSelected = localAnchor === fastener.id;
                return (
                  <div
                    key={fastener.id}
                    onClick={() => setLocalAnchor(fastener.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-lg ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Image Preview with Lightbox Zoom Button */}
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900 border border-slate-800">
                        <img src={fastener.image} alt={fastener.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectData({
                              title: fastener.label,
                              subtitle: fastener.tag,
                              image: fastener.image,
                              tag: fastener.tag,
                              details: fastener.inspectDetails,
                            });
                          }}
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                          title="ซูมดูรายละเอียด 3D"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-white">{fastener.label}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{fastener.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{fastener.tag}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUESTION 6: DRILL DEPTH & QUESTION 7: PULL TEST FORCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question 6: Drill Depth */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">6</span>
                  <span>ความลึกการเจาะ (Drill Depth)</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {localDepth !== null ? `${localDepth} mm` : 'ยังไม่ได้ระบุ'}
                </span>
              </div>

              <input
                type="range"
                min={15}
                max={50}
                value={localDepth ?? 25}
                onChange={(e) => setLocalDepth(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>15 mm (ตื้น)</span>
                <span>25-35 mm (มาตรฐาน)</span>
                <span>50 mm (ลึกมาก)</span>
              </div>
            </div>

            {/* Question 7: Pull Test Force */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 flex items-center justify-center font-mono text-[11px]">7</span>
                  <span>แรงดึงทดสอบความแข็งแรง (Pull Test Force)</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {localPullForce !== null ? `${localPullForce} N` : 'ยังไม่ได้ระบุ'}
                </span>
              </div>

              <input
                type="range"
                min={10}
                max={60}
                value={localPullForce ?? 25}
                onChange={(e) => setLocalPullForce(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10 N (แรงเบา)</span>
                <span>25-40 N (เกณฑ์มาตรฐานช่าง)</span>
                <span>60 N (แรงดึงสูง)</span>
              </div>
            </div>
          </div>

          {/* SECTION 8: DOME ASSEMBLY & ANTI-IR FOAM RING CHECKLIST */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>การประกอบตัวกล้องโดมและป้องกันแสง IR (Dome Assembly & Anti-IR Ring)</span>
              </span>
              <span className="text-[10px] text-slate-400">หัวใจสำคัญของกล้องโดม</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'basePlateMounted' as keyof DomeAssemblyChecklist,
                  label: 'ยึดแป้นฐานรองกล้องโดม (Base Plate) แน่นหนา',
                  desc: 'แป้นฐานแนบสนิทกับพื้นผิว ขันสกรูครบ 3-4 จุด ไม่สั่นคลอน',
                },
                {
                  key: 'cableGrommetSealed' as keyof DomeAssemblyChecklist,
                  label: 'สอดสายสัญญาณผ่านซีลยางกันน้ำ (Waterproof Grommet)',
                  desc: 'ป้องกันความชื้นและแมลงเข้าไปในตัวเรือนกล้องโดม',
                },
                {
                  key: 'antiIrRingVerified' as keyof DomeAssemblyChecklist,
                  label: 'ตรวจสอบวงแหวนโฟมกัน IR (Anti-IR Foam Ring) แนบหน้าเลนส์',
                  desc: 'ป้องกันแสงอินฟราเรดจากหลอด LED รั่วเข้าเลนส์กล้องจนเกิดหมอกขาว (IR Halo)',
                },
                {
                  key: 'domeCoverCleaned' as keyof DomeAssemblyChecklist,
                  label: 'เช็ดทำความสะอาดฝาครอบโดม (Dome Cleanliness)',
                  desc: 'ใช้ผ้าไมโครไฟเบอร์เช็ดรอยนิ้วมือและฝุ่นออกจากครอบแก้วก่อนปิดฝา',
                },
              ].map((item) => {
                const isChecked = domeAssembly[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setDomeAssembly({
                        ...domeAssembly,
                        [item.key]: !isChecked,
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON SECTION */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              {isComplete ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>เลือกครบทั้ง 6 ข้อแล้ว พร้อมกดบันทึกส่งข้อมูลและประเมินผล</span>
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>กรุณาคลิกเลือกคำตอบให้ครบตั้งแต่ข้อ 2 ถึงข้อ 7 ก่อนกดบันทึก</span>
                </span>
              )}
            </div>

            <button
              onClick={handleSaveAndEvaluate}
              disabled={!isComplete}
              className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
                isComplete
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50 scale-100 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>💾 บันทึกส่งข้อมูลและประเมินผล ({currentSurfaceData.nameTh})</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX INSPECT MODAL */}
      {inspectData && (
        <div
          className="fixed inset-0 z-[120] isolate flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setInspectData(null)}
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-5 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider font-bold">
                  {inspectData.tag}
                </span>
                <h3 className="text-base font-bold text-white">{inspectData.title}</h3>
              </div>
              <button
                onClick={() => setInspectData(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4 border border-slate-800">
              <img src={inspectData.image} alt={inspectData.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              {inspectData.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
