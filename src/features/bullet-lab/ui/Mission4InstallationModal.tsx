'use client';

import React, { useEffect, useState } from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { SURFACES_DATA } from '../data/bulletLabData';
import {
  AnchorType,
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
  FileCheck,
  ShieldAlert,
  Sparkles,
  Play,
  Check,
  RotateCw,
  Hammer,
  ZoomIn,
  Info,
  AlertCircle,
} from 'lucide-react';

// Visual Data for Drill Bits with 3D Renders
const DRILL_BITS_VISUAL = [
  {
    id: 'wood' as DrillBitType,
    label: 'ดอกเจาะไม้ (Brad-point)',
    desc: 'ปลายเดือยแหลมคมนำศูนย์ คมตัดข้างคู่',
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
    label: 'ดอกเจาะเหล็ก (HSS)',
    desc: 'เหล็กกล้าชุบแข็ง เกลียวเคลือบไทเทเนียม คมตัด 118°',
    image: '/images/bullet-lab/drill_bit_metal.jpg',
    tag: 'HSS METAL',
    inspectDetails: [
      'หัวตัดมุมองศา 118° Split-point เจาะกินเนื้อเหล็กทันทีโดยไม่ต้องตอกนำศูนย์ลึก',
      'ชุบผิว Titanium Nitride (สีทอง) ทนความร้อนสูง ลดแรงเสียดทาน',
      'เกลียวคู่ระบายเศษโลหะ (Chip Flutes) ป้องกันการติดขัดขณะเจาะที่รอบสูง',
    ],
  },
  {
    id: 'masonry' as DrillBitType,
    label: 'ดอกเจาะปูน (Carbide)',
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
    label: 'ดอกอเนกประสงค์ (Multi)',
    desc: 'หัวเพชรเจียรคม 4 ทิศทาง สำหรับสมาร์ทบอร์ด/กระเบื้อง',
    image: '/images/bullet-lab/drill_bit_multipurpose.jpg',
    tag: 'MULTI-MATERIAL',
    inspectDetails: [
      'หัวเจียรคมเพชร 4 ทิศทาง คมกริบ สามารถเจาะผ่านวัสดุเปราะ เช่น สมาร์ทบอร์ด กระเบื้อง',
      'เกลียวระบายฝุ่นสีน้ำเงิน รองรับการเจาะแห้งโดยไม่ทำให้วัสดุรอบรูเจาะปริแตก',
      'ห้ามใช้โหมดกระแทกเด็ดขาดเมื่อเจาะแผ่นไฟเบอร์ซีเมนต์หรือกระเบื้อง',
    ],
  },
];

// Visual Data for Anchors & Fasteners with 3D Renders
const FASTENERS_VISUAL = [
  {
    id: 'wood-screw-direct' as AnchorType,
    label: 'ยึดตรงเข้าเนื้อไม้ (Wood Screw)',
    desc: 'สกรูเกลียวปล่อยงานไม้หัวเตเปอร์ ยึดเข้าเนื้อไม้โดยตรง',
    image: '/images/bullet-lab/anchor_wood_screw.jpg',
    tag: 'WOOD SCREW',
    inspectDetails: [
      'เกลียวหยาบและลึก ช่วยเกาะยึดเส้นใยไม้ได้อย่างแน่นหนาที่สุด',
      'หัวเตเปอร์ (Countersunk Head) เมื่อขันจนสุด หัวสกรูจะจมเรียบเสมอฐานแป้นกล้อง',
      'ไม่ต้องใส่พุกพลาสติก เพียงเจาะรูนำขนาดเล็กกว่าเกลียวเล็กน้อย',
    ],
  },
  {
    id: 'self-drilling-metal' as AnchorType,
    label: 'สกรูปลายสว่าน TEK (Self-Drilling)',
    desc: 'หัวหกเหลี่ยมพร้อมปลายสว่านในตัว และแหวนยางกันซึม EPDM',
    image: '/images/bullet-lab/anchor_metal_tek.jpg',
    tag: 'TEK SCREW',
    inspectDetails: [
      'ปลายสว่านในตัว เจาะทะลุโครงเหล็กและทำเกลียวพร้อมขันแน่นในขั้นตอนเดียว',
      'หัวหกเหลี่ยมพร้อมปีกกว้าง (Hex Washer Head) รับแรงบิดสูง ไม่รูดง่าย',
      'แหวนยาง EPDM คุณภาพสูง ป้องกันน้ำฝนซึมเข้าโครงสร้างอาคาร เหมาะกับงานภายนอก',
    ],
  },
  {
    id: 'plastic-expansion' as AnchorType,
    label: 'พุกพลาสติก #7 (Plastic Wall Plug)',
    desc: 'บั้งเบ่งขยายตัวยึดผนังปูน/อิฐฉาบปูน พร้อมสกรูเกลียวปล่อย',
    image: '/images/bullet-lab/anchor_plastic_plug.jpg',
    tag: 'PLASTIC PLUG #7',
    inspectDetails: [
      'บั้งและเงี่ยงกันหมุน (Anti-rotation Ribs) ป้องกันพุกหมุนฟรีในรูเจาะ',
      'ปีกแยกขยายตัว (Expansion Wings) จะเบ่งตัวอัดแน่นกับผนังคอนกรีตเมื่อขันสกรูเข้าไป',
      'ขนาดมาตรฐานเบอร์ 7 ใช้คู่กับดอกสว่านเจาะปูน 6.0–6.5 มม. และสกรูเบอร์ 7/8',
    ],
  },
  {
    id: 'hollow-wall-toggle' as AnchorType,
    label: 'พุกผีเสื้อ / พุกร่ม (Toggle Bolt)',
    desc: 'ปีกสปริงกางออก 2 ข้างสำหรับผนังกลวง สมาร์ทบอร์ด ยิปซั่ม',
    image: '/images/bullet-lab/anchor_toggle_bolt.jpg',
    tag: 'SPRING TOGGLE',
    inspectDetails: [
      'ปีกสปริงกางออกด้านหลังผนังกลวง เพื่อกระจายแรงกดบนพื้นที่กว้าง',
      'ป้องกันไม่ให้แผ่นสมาร์ทบอร์ดหรือยิปซั่มแตกหักจากการรับน้ำหนักกล้อง',
      'แกนสกรูเกลียวมิลตัวยาว ขันดึงปีกผีเสื้อให้แนบแน่นกับหลังแผ่นผนัง',
    ],
  },
];

// Visual Data for Surface Materials with 3D Renders
const SURFACES_VISUAL: Record<
  SurfaceType,
  { image: string; tag: string; characteristics: string }
> = {
  wood: {
    image: '/images/bullet-lab/surface_wood.jpg',
    tag: 'WOOD / TIMBER',
    characteristics: 'เนื้อไม้ธรรมชาติ/ไม้อัด มีความยืดหยุ่น เสี่ยงต่อการแตกตามแนวเสี้ยน',
  },
  metal: {
    image: '/images/bullet-lab/surface_metal.jpg',
    tag: 'STEEL / GALVANIZED',
    characteristics: 'โครงเหล็กรูปพรรณ แปเหล็กกัลวาไนซ์ แข็งแกร่ง ทนทาน ต้องคุมรอบสว่าน',
  },
  concrete: {
    image: '/images/bullet-lab/surface_concrete.jpg',
    tag: 'SOLID CONCRETE',
    characteristics: 'คอนกรีตแข็งตัวสูง มีหินและทราย ต้องใช้โหมดกระแทกและดูดฝุ่นผงปูน',
  },
  smartboard: {
    image: '/images/bullet-lab/surface_smartboard.jpg',
    tag: 'FIBER CEMENT',
    characteristics: 'แผ่นไฟเบอร์ซีเมนต์บอร์ด หลังกลวง เปราะหักง่าย ห้ามใช้โหมดกระแทก',
  },
};

interface InspectModalData {
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  details: string[];
}

export const Mission4InstallationModal: React.FC = () => {
  const isMission4ModalOpen = useBulletLabStore((s) => s.isMission4ModalOpen);
  const setIsMission4ModalOpen = useBulletLabStore((s) => s.setIsMission4ModalOpen);

  const surfaceType = useBulletLabStore((s) => s.surfaceType);
  const submissionsBySurface = useBulletLabStore((s) => s.submissionsBySurface);
  const isDrilling = useBulletLabStore((s) => s.isDrilling);

  const setSurfaceType = useBulletLabStore((s) => s.setSurfaceType);
  const setDrillDepthMm = useBulletLabStore((s) => s.setDrillDepthMm);
  const setIsDrilling = useBulletLabStore((s) => s.setIsDrilling);
  const setAnchorInserted = useBulletLabStore((s) => s.setAnchorInserted);
  const setBaseMounted = useBulletLabStore((s) => s.setBaseMounted);
  const setScrewTightness = useBulletLabStore((s) => s.setScrewTightness);
  const setCameraMounted = useBulletLabStore((s) => s.setCameraMounted);
  const setJointLocked = useBulletLabStore((s) => s.setJointLocked);
  const setPullTestForceN = useBulletLabStore((s) => s.setPullTestForceN);
  const saveSurfaceSubmission = useBulletLabStore((s) => s.saveSurfaceSubmission);

  // Active surface window tab
  const [activeTab, setActiveTab] = useState<SurfaceType>(surfaceType || 'wood');

  // Draft student selections for the active surface (Starts null so student MUST click and choose themselves!)
  const [localBit, setLocalBit] = useState<DrillBitType | null>(null);
  const [localBitSize, setLocalBitSize] = useState<DrillBitSize | null>(null);
  const [localMode, setLocalMode] = useState<DrillMode | null>(null);
  const [localAnchor, setLocalAnchor] = useState<AnchorType | null>(null);
  const [localDepth, setLocalDepth] = useState<number | null>(null);
  const [localPullForce, setLocalPullForce] = useState<number | null>(null);

  // Status for active tab
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Lightbox inspect preview
  const [inspectData, setInspectData] = useState<InspectModalData | null>(null);

  // Load state when tab or modal changes
  const loadSurfaceFormState = (surface: SurfaceType) => {
    const existing = submissionsBySurface[surface];
    if (existing && !isEditing) {
      setLocalBit(existing.drillBit);
      setLocalBitSize(existing.drillBitSize);
      setLocalMode(existing.drillMode);
      setLocalAnchor(existing.anchor);
      setLocalDepth(existing.drillDepthMm);
      setLocalPullForce(existing.pullTestForceN);
      setSaveSuccess(true);
    } else {
      // Blank unselected state: student must click to choose everything!
      setLocalBit(null);
      setLocalBitSize(null);
      setLocalMode(null);
      setLocalAnchor(null);
      setLocalDepth(null);
      setLocalPullForce(null);
      setSaveSuccess(false);
    }
  };

  // Sync draft state with active surface tab when opened
  useEffect(() => {
    if (isMission4ModalOpen) {
      setActiveTab(surfaceType);
      loadSurfaceFormState(surfaceType);
      setIsEditing(false);
    }
  }, [isMission4ModalOpen]);

  // Handle Tab Switch between 4 Surfaces
  const handleSwitchTab = (surface: SurfaceType) => {
    setActiveTab(surface);
    setSurfaceType(surface); // Updates 3D Scene Wall dynamically!
    setIsEditing(false);
    loadSurfaceFormState(surface);
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectData) {
          setInspectData(null);
        } else if (isMission4ModalOpen) {
          setIsMission4ModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMission4ModalOpen, setIsMission4ModalOpen, inspectData]);

  if (!isMission4ModalOpen) return null;

  const currentInfo: SurfaceInfo = SURFACES_DATA[activeTab] ?? SURFACES_DATA.wood;
  const currentVisual = SURFACES_VISUAL[activeTab];
  const activeSubmission = submissionsBySurface[activeTab];

  // Checklist Validation (Must choose all 6 from items 2 to 7)
  const isBitSelected = localBit !== null;
  const isSizeSelected = localBitSize !== null;
  const isModeSelected = localMode !== null;
  const isAnchorSelected = localAnchor !== null;
  const isDepthSelected = localDepth !== null;
  const isPullForceSelected = localPullForce !== null;

  const missingItems: string[] = [];
  if (!isBitSelected) missingItems.push('ข้อ 2. ชนิดดอกสว่าน');
  if (!isSizeSelected) missingItems.push('ข้อ 3. ขนาดดอกสว่าน');
  if (!isModeSelected) missingItems.push('ข้อ 4. โหมดการเจาะ');
  if (!isAnchorSelected) missingItems.push('ข้อ 5. น็อตและพุกยึด');
  if (!isDepthSelected) missingItems.push('ข้อ 6. ความลึกการเจาะ');
  if (!isPullForceSelected) missingItems.push('ข้อ 7. แรงดึงทดสอบ');

  const selectedCount = 6 - missingItems.length;
  const isFormComplete = selectedCount === 6;

  // Count how many surfaces have been completed
  const completedSurfacesCount = (Object.keys(SURFACES_DATA) as SurfaceType[]).filter(
    (t) => !!submissionsBySurface[t]
  ).length;

  // Evaluation algorithm
  const evaluateSubmission = () => {
    const feedback: string[] = [];
    let score = 0;

    // 1. Bit check (25 pts)
    if (localBit === currentInfo.recommendedBitType) {
      score += 25;
      feedback.push(
        `✓ ดอกสว่านถูกต้อง: เลือก ${currentInfo.recommendedBit} เหมาะกับพื้นผิว ${currentInfo.nameTh.split(' ')[0]}`
      );
    } else {
      feedback.push(
        `⚠️ ดอกสว่านยังไม่เหมาะสม: สำหรับ ${currentInfo.nameTh.split(' ')[0]} ควรใช้ ${currentInfo.recommendedBit}`
      );
    }

    // 2. Bit size check (15 pts)
    if (localBitSize === currentInfo.recommendedBitSize) {
      score += 15;
      feedback.push(`✓ ขนาดดอกสว่านถูกต้อง (${localBitSize})`);
    } else {
      score += 5;
      feedback.push(
        `⚠️ ขนาดดอกสว่านแนะนำคือ ${currentInfo.recommendedBitSize} (ท่านเลือก ${localBitSize ?? 'ไม่ได้เลือก'})`
      );
    }

    // 3. Drill mode check (25 pts)
    if (localMode === currentInfo.recommendedMode) {
      score += 25;
      feedback.push(
        `✓ โหมดการเจาะถูกต้อง: โหมด ${localMode === 'hammer' ? 'กระแทก (Hammer)' : 'หมุนปกติ (Normal)'}`
      );
    } else {
      if (localMode === 'hammer' && (activeTab === 'wood' || activeTab === 'smartboard')) {
        feedback.push(
          `❌ คำเตือนด้านความปลอดภัย: ห้ามใช้โหมดกระแทกกับ${currentInfo.nameTh.split(' ')[0]} เพราะจะทำให้พื้นผิวแตกหักเสียหายอย่างรุนแรง!`
        );
      } else if (activeTab === 'concrete' && localMode !== 'hammer') {
        feedback.push(
          `⚠️ คำแนะนำ: สำหรับคอนกรีตแข็ง ต้องใช้โหมดกระแทก (Hammer) เพื่อให้ดอกสว่านเจาะเข้าเนื้อปูนได้`
        );
      } else {
        feedback.push(
          `⚠️ โหมดการเจาะควรเป็น ${currentInfo.recommendedMode === 'hammer' ? 'กระแทก (Hammer)' : 'หมุนปกติ (Normal)'}`
        );
      }
    }

    // 4. Anchor / fastener check (25 pts)
    if (localAnchor === currentInfo.recommendedAnchorType) {
      score += 25;
      feedback.push(`✓ การยึดเกาะถูกต้อง: ${currentInfo.recommendedAnchor}`);
    } else {
      feedback.push(
        `⚠️ ตัวยึดไม่ถูกต้อง: สำหรับ ${currentInfo.nameTh.split(' ')[0]} ควรใช้ ${currentInfo.recommendedAnchor}`
      );
    }

    // 5. Depth check (10 pts)
    const depthVal = localDepth ?? 0;
    const depthDiff = Math.abs(depthVal - currentInfo.drillDepthMm);
    if (depthDiff <= 5) {
      score += 10;
      feedback.push(
        `✓ ความลึกการเจาะถูกต้อง (${depthVal} มม. จากเกณฑ์มาตรฐาน ${currentInfo.drillDepthMm} มม.)`
      );
    } else {
      feedback.push(
        `⚠️ ความลึกการเจาะควรอยู่ที่ประมาณ ${currentInfo.drillDepthMm} มม. (ท่านเลือก ${depthVal} มม.)`
      );
    }

    const isPassed = score >= 70;
    return { score, isPassed, feedback };
  };

  // Handle Save Submission
  const handleSave = () => {
    if (!isFormComplete) return;

    const { score, isPassed, feedback } = evaluateSubmission();

    const submission: Mission4Submission = {
      surfaceType: activeTab,
      drillBit: localBit!,
      drillBitSize: localBitSize!,
      drillMode: localMode!,
      anchor: localAnchor!,
      drillDepthMm: localDepth!,
      pullTestForceN: localPullForce!,
      submittedAt: new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      score,
      isPassed,
      feedback,
    };

    saveSurfaceSubmission(activeTab, submission);
    setSaveSuccess(true);
    setIsEditing(false);
  };

  // Run 3D simulation
  const handleSimulateIn3D = () => {
    if (!localDepth) return;
    setIsDrilling(true);
    let depth = 0;
    const target = localDepth;
    const timer = setInterval(() => {
      depth += 5;
      if (depth >= target) {
        setDrillDepthMm(target);
        setIsDrilling(false);
        setAnchorInserted(true);
        setBaseMounted(true);
        setScrewTightness('correct');
        setCameraMounted(true);
        setJointLocked(true);
        setPullTestForceN(localPullForce ?? 25);
        clearInterval(timer);
      } else {
        setDrillDepthMm(depth);
      }
    }, 150);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission4-modal-title"
      className="fixed inset-0 z-[9999] isolate flex items-center justify-center p-2 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-[95vh] max-h-[890px] flex flex-col bg-slate-900 border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  MISSION 04 · WORKSHEET 4 SURFACES
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  บันทึกแล้ว {completedSurfacesCount} / 4 ชนิดพื้นผิว
                </span>
              </div>
              <h2
                id="mission4-modal-title"
                className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
              >
                ใบงานประเมินการเลือกอุปกรณ์ติดตั้งตามชนิดพื้นผิว 4 หน้าต่าง
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMission4ModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="ปิดหน้าต่าง (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. TOP 4 SURFACE WINDOW TABS (แยกเป็น 4 หน้าต่างตามวัสดุพื้นผิว) */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2.5 shrink-0">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>คลิกเลือกหน้าต่างพื้นผิวที่ต้องการทำใบงาน (สลับฉาก 3D ทันที):</span>
            </span>
            <span className="text-[10px] text-slate-400">
              * นักเรียนต้องคลิกเลือกคำตอบหัวข้อที่ 2–7 เองให้ครบในแต่ละหน้าต่าง
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(SURFACES_DATA) as SurfaceType[]).map((type, idx) => {
              const s = SURFACES_DATA[type];
              const visual = SURFACES_VISUAL[type];
              const isCurrent = activeTab === type;
              const sub = submissionsBySurface[type];

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSwitchTab(type)}
                  className={`p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden ${
                    isCurrent
                      ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-950/80'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={visual.image}
                      alt={s.nameTh}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">
                        หน้าต่างที่ {idx + 1}: {s.nameTh.split(' ')[0]}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      {sub ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                          ✓ บันทึก {sub.score} คะแนน
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300/90 font-mono border border-amber-500/20">
                          รอทำใบงาน (0/6)
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Visual selections */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Surface Overview Banner */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: currentInfo.color }}
                />
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>ใบงานติดตั้งบนพื้นผิว: {currentInfo.nameTh}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">({currentVisual.tag})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentVisual.characteristics}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                    isFormComplete
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                      : 'bg-amber-950/70 border-amber-500 text-amber-300'
                  }`}
                >
                  เลือกแล้ว {selectedCount} / 6 ข้อ
                </span>
              </div>
            </div>

            {/* Incomplete Warning if student hasn't picked all */}
            {!isFormComplete && !activeSubmission && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">โปรดเลือกให้ครบทุกข้อด้วยตนเอง:</span>
                  <span className="text-[11px] text-amber-300/90 ml-1">
                    (ยังขาด: {missingItems.join(', ')})
                  </span>
                </div>
              </div>
            )}

            {/* 2. Drill Bit Selection (Students click to choose) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span>เลือกชนิดดอกสว่าน (Drill Bit Type):</span>
                </span>
                <span className="text-[10px] font-mono">
                  {localBit ? (
                    <span className="text-emerald-400">✓ เลือกแล้ว</span>
                  ) : (
                    <span className="text-amber-400">* ยังไม่ได้เลือก</span>
                  )}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {DRILL_BITS_VISUAL.map((bit) => {
                  const isSelected = localBit === bit.id;
                  return (
                    <button
                      key={bit.id}
                      type="button"
                      onClick={() => {
                        setLocalBit(bit.id);
                        setSaveSuccess(false);
                      }}
                      className={`p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden ${
                        isSelected
                          ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-950'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {/* 3D Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black/40 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bit.image}
                          alt={bit.label}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectData({
                              title: bit.label,
                              subtitle: bit.desc,
                              image: bit.image,
                              tag: bit.tag,
                              details: bit.inspectDetails,
                            });
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="ดูภาพขยาย 3D"
                        >
                          <ZoomIn className="w-4 h-4 text-cyan-300" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-white truncate">
                            {bit.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-cyan-300 font-mono block mb-0.5">
                          {bit.tag}
                        </span>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{bit.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Drill Bit Size & 4. Drill Mode (Inline Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 3. Bit Size */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>ขนาดดอกสว่าน:</span>
                  </span>
                  <span className="font-mono text-xs">
                    {localBitSize ? (
                      <span className="text-emerald-400 font-bold">{localBitSize}</span>
                    ) : (
                      <span className="text-amber-400">* ยังไม่ได้เลือก</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {(['4mm', '6mm', '8mm', '10mm'] as DrillBitSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setLocalBitSize(sz);
                        setSaveSuccess(false);
                      }}
                      className={`py-2 rounded-xl text-center text-xs font-mono transition-all cursor-pointer border ${
                        localBitSize === sz
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold ring-2 ring-cyan-500/50'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Mode Selection */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                      4
                    </span>
                    <span>โหมดการเจาะ:</span>
                  </span>
                  <span className="font-mono text-xs">
                    {localMode ? (
                      <span className="text-emerald-400 font-bold">
                        {localMode === 'normal'
                          ? 'หมุนปกติ'
                          : localMode === 'hammer'
                          ? 'กระแทก'
                          : 'ขันสกรู'}
                      </span>
                    ) : (
                      <span className="text-amber-400">* ยังไม่ได้เลือก</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'normal', label: 'หมุนปกติ', icon: RotateCw },
                    { id: 'hammer', label: 'กระแทก', icon: Hammer },
                    { id: 'driver', label: 'ขันสกรู', icon: Wrench },
                  ].map((m) => {
                    const IconComponent = m.icon;
                    const isSelected = localMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setLocalMode(m.id as DrillMode);
                          setSaveSuccess(false);
                        }}
                        className={`py-2 px-1 rounded-xl text-center text-xs transition-all cursor-pointer border flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold ring-2 ring-cyan-500/50 shadow-sm shadow-cyan-950'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <IconComponent
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}
                        />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Anchor / Fastener Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                    5
                  </span>
                  <span>รูปแบบการยึดน็อตและพุก (Anchor / Fastener):</span>
                </span>
                <span className="text-[10px] font-mono">
                  {localAnchor ? (
                    <span className="text-emerald-400">✓ เลือกแล้ว</span>
                  ) : (
                    <span className="text-amber-400">* ยังไม่ได้เลือก</span>
                  )}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {FASTENERS_VISUAL.map((anc) => {
                  const isSelected = localAnchor === anc.id;
                  return (
                    <button
                      key={anc.id}
                      type="button"
                      onClick={() => {
                        setLocalAnchor(anc.id);
                        setSaveSuccess(false);
                      }}
                      className={`p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden ${
                        isSelected
                          ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-950'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {/* 3D Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black/40 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={anc.image}
                          alt={anc.label}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectData({
                              title: anc.label,
                              subtitle: anc.desc,
                              image: anc.image,
                              tag: anc.tag,
                              details: anc.inspectDetails,
                            });
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="ดูภาพขยาย 3D"
                        >
                          <ZoomIn className="w-4 h-4 text-cyan-300" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-white truncate">
                            {anc.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-cyan-300 font-mono block mb-0.5">
                          {anc.tag}
                        </span>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{anc.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Depth and 7. Pull Force (Explicit Selection Sliders) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800">
              {/* 6. Depth */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                      6
                    </span>
                    <span>ความลึกการเจาะ (Drill Depth):</span>
                  </span>
                  <span className="font-mono text-cyan-400">
                    {localDepth !== null ? `${localDepth} มม.` : <span className="text-amber-400">* เลื่อนปรับ</span>}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={1}
                  value={localDepth ?? 0}
                  onChange={(e) => {
                    setLocalDepth(Number(e.target.value));
                    setSaveSuccess(false);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 มม.</span>
                  <span>(เกณฑ์ช่างมาตรฐาน: 5–40 มม.)</span>
                  <span>45 มม.</span>
                </div>
              </div>

              {/* 7. Pull Test Force */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center justify-center text-[10px] font-bold">
                      7
                    </span>
                    <span>แรงดึงทดสอบ (Pull Test):</span>
                  </span>
                  <span className="font-mono text-cyan-400">
                    {localPullForce !== null ? `${localPullForce} N` : <span className="text-amber-400">* เลื่อนปรับ</span>}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={5}
                  value={localPullForce ?? 0}
                  onChange={(e) => {
                    setLocalPullForce(Number(e.target.value));
                    setSaveSuccess(false);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 N</span>
                  <span>(เกณฑ์ช่างมาตรฐาน: 20–35 N)</span>
                  <span>40 N</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Technical Notes, Assessment Feedback & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {/* Technical Specifications Summary Card */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ข้อมูลหน้างานช่าง: {currentInfo.nameTh}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentInfo.texturePattern}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <strong>💡 ข้อแนะนำหน้างาน:</strong> {currentInfo.notesTh}
                </div>
              </div>

              {/* Dynamic Warning if critical error */}
              {localMode === 'hammer' && (activeTab === 'wood' || activeTab === 'smartboard') && (
                <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">อันตรายต่อชิ้นงาน!</span>
                    <p className="text-[11px] text-red-300 mt-0.5">
                      ห้ามใช้โหมดกระแทก (Hammer Mode) กับ{currentInfo.nameTh.split(' ')[0]} เพราะแรงกระแทกจะทำให้โครงสร้างแตกหักหรือรูเจาะเสียหาย
                    </p>
                  </div>
                </div>
              )}

              {/* Saved Submission Result (if available) */}
              {(saveSuccess || activeSubmission) && !isEditing && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>บันทึกผลการประเมินสำเร็จ ({currentInfo.nameTh.split(' ')[0]})</span>
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                      {activeSubmission?.score ?? 0} / 100 คะแนน
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p className="text-slate-400 font-mono">
                      บันทึกเมื่อ: {activeSubmission?.submittedAt} · ผล:{' '}
                      {activeSubmission?.isPassed ? 'ผ่านเกณฑ์ (PASS)' : 'ยังไม่ผ่านเกณฑ์'}
                    </p>
                    <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pr-1">
                      {activeSubmission?.feedback.map((f, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded text-[11px] ${
                            f.startsWith('✓')
                              ? 'bg-emerald-900/40 text-emerald-200'
                              : f.startsWith('❌')
                              ? 'bg-red-900/40 text-red-200'
                              : 'bg-amber-900/40 text-amber-200'
                          }`}
                        >
                          {f}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 cursor-pointer"
                      >
                        แก้ไขคำตอบใหม่
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                {/* 3D Simulation Trigger */}
                <button
                  type="button"
                  onClick={handleSimulateIn3D}
                  disabled={isDrilling || !localDepth}
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isDrilling ? 'กำลังเจาะ 3D...' : 'ทดสอบเจาะใน 3D'}</span>
                </button>

                {/* Save and Submit */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isFormComplete}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                    isFormComplete
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white shadow-cyan-950/80 cursor-pointer animate-pulse'
                      : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                  title={!isFormComplete ? `กรุณาเลือกให้ครบทั้ง 6 ข้อ (ขาด: ${missingItems.join(', ')})` : 'กดบันทึกคำตอบ'}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isFormComplete
                      ? '💾 บันทึกส่งข้อมูล'
                      : `เลือกให้ครบ (${selectedCount}/6)`}
                  </span>
                </button>
              </div>

              <div className="text-[10px] text-center text-slate-400">
                {!isFormComplete ? (
                  <span className="text-amber-400">
                    * นักเรียนต้องเลือกเองให้ครบหัวข้อที่ 2–7 จึงจะสามารถบันทึกส่งข้อมูลได้
                  </span>
                ) : (
                  <span className="text-emerald-400">
                    ✓ เลือกครบ 6 ข้อแล้ว กดบันทึกส่งข้อมูลเพื่อประเมินคะแนน
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Hardware Inspect Lightbox Modal */}
        {inspectData && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setInspectData(null)}
          >
            <div
              className="relative w-full max-w-lg bg-slate-900 border border-cyan-400/60 rounded-3xl p-5 shadow-2xl shadow-cyan-950 text-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {inspectData.tag} · 3D REALISTIC RENDER
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{inspectData.title}</h3>
                  <p className="text-xs text-slate-400">{inspectData.subtitle}</p>
                </div>
                <button
                  onClick={() => setInspectData(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Image Preview */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-black relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inspectData.image}
                  alt={inspectData.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Engineering Characteristics */}
              <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>คุณลักษณะทางวิศวกรรมช่าง:</span>
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px] pl-1">
                  {inspectData.details.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setInspectData(null)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
              >
                เข้าใจแล้ว ปิดหน้าต่าง (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
