import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';
import { useCctvTrainingStore } from '../../store/useCctvTrainingStore';

export const ObjectiveHud: React.FC = () => {
  const activeRoomId = useCctvTrainingStore((s) => s.activeRoomId);
  const setActive101Modal = useCctvTrainingStore((s) => s.setActiveStation101Modal);
  const setActive102Modal = useCctvTrainingStore((s) => s.setActiveStation102Modal);
  const smartSchool102 = useCctvTrainingStore((s) => s.smartSchool102);

  const setActive103Modal = useCctvTrainingStore((s) => s.setActiveStation103Modal);
  const smartCabling103 = useCctvTrainingStore((s) => s.smartCabling103);

  const setActive104Modal = useCctvTrainingStore((s) => s.setActiveStation104Modal);
  const smartNetwork104 = useCctvTrainingStore((s) => s.smartNetwork104);

  const setActive105Modal = useCctvTrainingStore((s: any) => s.setActiveStation105Modal);
  const smartNvr105 = useCctvTrainingStore((s: any) => s.smartNvr105);

  const setActive106Modal = useCctvTrainingStore((s) => s.setActiveStation106Modal);
  const smartStorage106 = useCctvTrainingStore((s) => s.smartStorage106);

  const setActive107Modal = useCctvTrainingStore((s) => s.setActiveStation107Modal);
  const smartTroubleshooting107 = useCctvTrainingStore((s) => s.smartTroubleshooting107);

  const setActive108Modal = useCctvTrainingStore((s) => s.setActiveStation108Modal);
  const smartCapstone108 = useCctvTrainingStore((s) => s.smartCapstone108);

  const activeMissionId = useRoleplayStore((s) => s.activeMissionId);
  const missions = useRoleplayStore((s) => s.missions);
  const rubric = useRoleplayStore((s) => s.rubric);
  const currentZone = useRoleplayStore((s) => s.currentZone);
  const setNotebookOpen = useRoleplayStore((s) => s.setNotebookOpen);
  const isNotebookOpen = useRoleplayStore((s) => s.isNotebookOpen);

  const isRoom102 = activeRoomId === 'room-102' || activeRoomId.includes('102');
  const isRoom103 = activeRoomId === 'room-103' || activeRoomId.includes('103');
  const isRoom104 = activeRoomId === 'room-104' || activeRoomId.includes('104');
  const isRoom105 = activeRoomId === 'room-105' || activeRoomId.includes('105');
  const isRoom106 = activeRoomId === 'room-106' || activeRoomId.includes('106');
  const isRoom107 = activeRoomId === 'room-107' || activeRoomId.includes('107');
  const isRoom108 = activeRoomId === 'room-108' || activeRoomId.includes('108');

  if (isRoom108) {
    const s1 = smartCapstone108?.station1Completed;
    const s2 = smartCapstone108?.station2Completed;
    const s3 = smartCapstone108?.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      (smartCapstone108?.station1Score || 0) +
      (smartCapstone108?.station2Score || 0) +
      (smartCapstone108?.station3Score || 0);

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ROOM 108 · CAPSTONE CCTV PROJECT
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-amber-400 font-bold text-sm">{totalScore}</strong>/85 (เกณฑ์ผ่าน ≥ 70)
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>🎓</span>
              <span>บูรณาการระบบกล้องวงจรปิด, ทดสอบ &amp; ส่งมอบงาน</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: วางแผนผัง FOV &amp; งบ BOM, Commissioning กล้อง 8 ตัว + UPS, และจัดทำเอกสารส่งมอบโครงการ
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActive108Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ แผนผัง & BOM' : '1. แผน & BOM'}</span>
              <span className="text-[10px] opacity-75">{smartCapstone108?.station1Score || 0}/20</span>
            </button>
            <button
              type="button"
              onClick={() => setActive108Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ Commissioning' : '2. ทดสอบระบบ'}</span>
              <span className="text-[10px] opacity-75">{smartCapstone108?.station2Score || 0}/40</span>
            </button>
            <button
              type="button"
              onClick={() => setActive108Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ Handover' : '3. ส่งมอบงาน'}</span>
              <span className="text-[10px] opacity-75">{smartCapstone108?.station3Score || 0}/25</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom106) {
    const s1 = smartStorage106?.station1Completed;
    const s2 = smartStorage106?.station2Completed;
    const s3 = smartStorage106?.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      (smartStorage106?.station1Score || 0) +
      (smartStorage106?.station2Score || 0) +
      (smartStorage106?.station3Score || 0);

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              ROOM 106 · STORAGE &amp; CLOUD P2P
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-emerald-400 font-bold text-sm">{totalScore}</strong>/100
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100">
              การบันทึก พื้นที่จัดเก็บ และการดูระยะไกล
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: คำนวณพื้นที่จัดเก็บ 8TB (30 วัน), ติดตั้ง Surveillance HDD &amp; Format, เปิด Cloud P2P &amp; จับคู่ QR มือถือ
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActive106Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ คำนวณพื้นที่' : '1. คำนวณพื้นที่'}</span>
              <span className="text-[10px] opacity-75">{smartStorage106?.station1Score || 0}/20</span>
            </button>

            <button
              type="button"
              onClick={() => setActive106Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ HDD & Format' : '2. HDD & Format'}</span>
              <span className="text-[10px] opacity-75">{smartStorage106?.station2Score || 0}/40</span>
            </button>

            <button
              type="button"
              onClick={() => setActive106Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ Cloud P2P' : '3. Cloud P2P'}</span>
              <span className="text-[10px] opacity-75">{smartStorage106?.station3Score || 0}/40</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom107) {
    const s1 = smartTroubleshooting107?.station1Completed;
    const s2 = smartTroubleshooting107?.station2Completed;
    const s3 = smartTroubleshooting107?.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      (smartTroubleshooting107?.station1Score || 0) +
      (smartTroubleshooting107?.station2Score || 0) +
      (smartTroubleshooting107?.station3Score || 0);

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-rose-500/50 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              ROOM 107 · CCTV TROUBLESHOOTING &amp; PM
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-rose-400 font-bold text-sm">{totalScore}</strong>/100 (เกณฑ์ผ่าน ≥ 70)
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>🔧</span>
              <span>การตรวจสอบ แก้ไขปัญหา และบำรุงรักษาเชิงป้องกัน</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: Diagnostic Tree &amp; วัดแรงดันไฟตก, วิเคราะห์ Hum Bars &amp; Isolator, ตรวจเลนส์ &amp; บันทึก PM Checklist
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActive107Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ ไฟตก & NO VIDEO' : '1. วินิจฉัยไฟตก'}</span>
              <span className="text-[10px] opacity-75">{smartTroubleshooting107?.station1Score || 0}/40</span>
            </button>
            <button
              type="button"
              onClick={() => setActive107Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ Ground Loop' : '2. คลื่น Hum Bars'}</span>
              <span className="text-[10px] opacity-75">{smartTroubleshooting107?.station2Score || 0}/20</span>
            </button>
            <button
              type="button"
              onClick={() => setActive107Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ PM & รายงาน' : '3. บำรุงรักษา PM'}</span>
              <span className="text-[10px] opacity-75">{smartTroubleshooting107?.station3Score || 0}/40</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom105) {
    const s1 = smartNvr105?.station1Completed;
    const s2 = smartNvr105?.station2Completed;
    const s3 = smartNvr105?.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      (smartNvr105?.station1Score || 0) +
      (smartNvr105?.station2Score || 0) +
      (smartNvr105?.station3Score || 0);

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ROOM 105 · NVR &amp; ONVIF CONFIG
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-emerald-400 font-bold text-sm">{totalScore}</strong>/100
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100">
              การตั้งค่า DVR/NVR, ONVIF &amp; การบีบอัดวิดีโอ
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: ค้นหากล้อง ONVIF &amp; Channel Mapping, บีบอัด H.265/Bitrate &amp; 4-Split, Motion Grid &amp; Retest ปัญหา
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActive105Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-purple-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ ONVIF & CH' : '1. ONVIF & CH'}</span>
              <span className="text-[10px] opacity-75">{smartNvr105?.station1Score || 0}/35</span>
            </button>

            <button
              type="button"
              onClick={() => setActive105Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-purple-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ Codec & Live' : '2. Codec & Live'}</span>
              <span className="text-[10px] opacity-75">{smartNvr105?.station2Score || 0}/35</span>
            </button>

            <button
              type="button"
              onClick={() => setActive105Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-purple-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ Motion & Fault' : '3. Motion & Fault'}</span>
              <span className="text-[10px] opacity-75">{smartNvr105?.station3Score || 0}/30</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom104) {
    const s1 = smartNetwork104.station1Completed;
    const s2 = smartNetwork104.station2Completed;
    const s3 = smartNetwork104.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      smartNetwork104.station1Score +
      smartNetwork104.station2Score +
      smartNetwork104.station3Score;

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ROOM 104 · IP & TROUBLESHOOTING
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-emerald-400 font-bold text-sm">{totalScore}</strong>/100
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100">
              ระบบเครือข่ายกล้องวงจรปิด & การแก้ปัญหา
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: วางแผน IP Address Table, กำหนดค่าอุปกรณ์ & PoE, วิเคราะห์แก้ปัญหา 10 ขั้นตอน
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActive104Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-cyan-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ IP Planning' : '1. IP Planning'}</span>
              <span className="text-[10px] opacity-75">{smartNetwork104.station1Score}/35</span>
            </button>

            <button
              type="button"
              onClick={() => setActive104Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-cyan-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ Config & PoE' : '2. Config & PoE'}</span>
              <span className="text-[10px] opacity-75">{smartNetwork104.station2Score}/35</span>
            </button>

            <button
              type="button"
              onClick={() => setActive104Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-cyan-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ แก้ปัญหา 10 ขั้น' : '3. แก้ปัญหา 10 ขั้น'}</span>
              <span className="text-[10px] opacity-75">{smartNetwork104.station3Score}/30</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom103) {
    const s1 = smartCabling103.station1Completed;
    const s2 = smartCabling103.station2Completed;
    const s3 = smartCabling103.station3Completed;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const totalScore =
      smartCabling103.station1Score +
      smartCabling103.station2Score +
      smartCabling103.station3Score;

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ROOM 103 · CABLING & TERMINATION
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-emerald-400 font-bold text-sm">{totalScore}</strong>/100
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100">
              ระบบสายสัญญาณ การเข้าหัว RJ45 & BNC
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              ฝึกปฏิบัติ 3 สถานี: เข้าหัว T568B/BNC, เดินสาย 5 จุดติดตั้ง, ตรวจสายและคำนวณ PoE
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={() => setActive103Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ เข้าหัวสาย' : '1. เข้าหัวสาย'}</span>
              <span className="text-[10px] opacity-75">{smartCabling103.station1Score}/35</span>
            </button>

            <button
              onClick={() => setActive103Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ เลือกสาย 5 จุด' : '2. เลือกสาย 5 จุด'}</span>
              <span className="text-[10px] opacity-75">{smartCabling103.station2Score}/35</span>
            </button>

            <button
              onClick={() => setActive103Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border cursor-pointer ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ ตรวจสอบ & PoE' : '3. ตรวจสอบ & PoE'}</span>
              <span className="text-[10px] opacity-75">{smartCabling103.station3Score}/30</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRoom102) {
    const s1 = smartSchool102.station1OutdoorCompleted;
    const s2 = smartSchool102.station2IndoorCompleted;
    const s3 = smartSchool102.station3WrittenCompleted;
    const completedCount = [s1, s2, s3].filter(Boolean).length;
    const weightedScore = Math.round(
      (smartSchool102.station1Score * 0.35) +
      (smartSchool102.station2Score * 0.35) +
      (smartSchool102.station3Score)
    );

    return (
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-2 max-w-md pointer-events-none select-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              ROOM 102 · SMART SCHOOL
            </span>
            <span className="text-xs text-slate-300 font-mono">
              คะแนน: <strong className="text-emerald-400 font-bold text-sm">{weightedScore}</strong>/100
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-100">
              การเลือกใช้และจัดวางกล้องโรงเรียนอัจฉริยะ
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              สำรวจและทำภารกิจให้ครบทั้ง 3 สเตชั่น (ภายนอก, ภายใน & IK10, วิเคราะห์ปัญหา)
            </p>
          </div>

          {/* Station Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={() => setActive102Modal(1)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border ${
                s1
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
              }`}
            >
              <span className="block font-bold">{s1 ? '✓ ผังภายนอก' : '1. ผังภายนอก'}</span>
              <span className="text-[10px] opacity-75">{smartSchool102.station1Score}%</span>
            </button>

            <button
              onClick={() => setActive102Modal(2)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border ${
                s2
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-400'
              }`}
            >
              <span className="block font-bold">{s2 ? '✓ ผังภายใน' : '2. ผังภายใน'}</span>
              <span className="text-[10px] opacity-75">{smartSchool102.station2Score}%</span>
            </button>

            <button
              onClick={() => setActive102Modal(3)}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all text-center border ${
                s3
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400'
              }`}
            >
              <span className="block font-bold">{s3 ? '✓ วิเคราะห์ปัญหา' : '3. วิเคราะห์ปัญหา'}</span>
              <span className="text-[10px] opacity-75">{smartSchool102.station3Score}/30</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const activeMission = missions[activeMissionId];

  const zoneNames: Record<string, string> = {
    ZONE_A: 'จุดรับภารกิจและสรุปงาน (Briefing Counter)',
    ZONE_B: 'สถานีทดสอบกล้อง IP (Camera Workstation)',
    ZONE_C: 'ห้องอุปกรณ์เครือข่าย PoE Switch (Network Room)',
    ZONE_D: 'ห้องบันทึกภาพ NVR (CCTV Server Room)',
    ZONE_E: 'โต๊ะคอมพิวเตอร์ควบคุม Client PC (Control Desk)',
    ZONE_F: 'มุมเปรียบเทียบระบบ Analog vs IP (Comparison Table)',
  };

  const isUnlocked102 = rubric.totalScore >= 80 || rubric.isPassed;

  return (
    <div className="fixed top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {/* Objective Card */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-white pointer-events-auto">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            ROOM 101 · {activeMission.missionId}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            คะแนนสะสม: <strong className="text-emerald-400 font-bold text-sm">{rubric.totalScore}</strong>/100
          </span>
        </div>

        <h2 className="text-sm font-bold text-slate-100 line-clamp-1">
          {activeMission.titleTh}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
          {activeMission.descriptionTh}
        </p>

        {/* 5 Station Action Buttons for Room 101 */}
        <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActive101Modal(1)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all text-center border cursor-pointer ${
              missions.M1.isCompleted
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
            }`}
          >
            <span className="block font-bold truncate">{missions.M1.isCompleted ? '✓ M1' : '1. Pipeline'}</span>
            <span className="text-[9px] opacity-75">{missions.M1.score}/15</span>
          </button>

          <button
            type="button"
            onClick={() => setActive101Modal(2)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all text-center border cursor-pointer ${
              missions.M2.isCompleted
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-400'
            }`}
          >
            <span className="block font-bold truncate">{missions.M2.isCompleted ? '✓ M2' : '2. Flow'}</span>
            <span className="text-[9px] opacity-75">{missions.M2.score}/20</span>
          </button>

          <button
            type="button"
            onClick={() => setActive101Modal(3)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all text-center border cursor-pointer ${
              missions.M3.isCompleted
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400'
            }`}
          >
            <span className="block font-bold truncate">{missions.M3.isCompleted ? '✓ M3' : '3. Match'}</span>
            <span className="text-[9px] opacity-75">{missions.M3.score}/15</span>
          </button>

          <button
            type="button"
            onClick={() => setActive101Modal(4)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all text-center border cursor-pointer ${
              missions.M4.isCompleted
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-purple-400'
            }`}
          >
            <span className="block font-bold truncate">{missions.M4.isCompleted ? '✓ M4' : '4. Compare'}</span>
            <span className="text-[9px] opacity-75">{missions.M4.score}/15</span>
          </button>

          <button
            type="button"
            onClick={() => setActive101Modal(5)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all text-center border cursor-pointer ${
              missions.M5.isCompleted
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-sky-400'
            }`}
          >
            <span className="block font-bold truncate">{missions.M5.isCompleted ? '✓ M5' : '5. Wiring'}</span>
            <span className="text-[9px] opacity-75">{missions.M5.score}/25</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden border border-slate-700">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${Math.min(100, (rubric.totalScore / 80) * 100)}%` }}
          />
        </div>

        {/* Door Progression Status Indicator */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">ประตูเชื่อมต่อ Room 102:</span>
          {isUnlocked102 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>🔓</span>
              <span>ปลดล็อกแล้ว (เดินผ่านได้)</span>
            </span>
          ) : (
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <span>🔒</span>
              <span>ล็อก (ต้องได้ &gt;= 80 คะแนน)</span>
            </span>
          )}
        </div>

        {/* Current Location & Notebook trigger */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span className="truncate">{zoneNames[currentZone] || currentZone}</span>
          <button
            type="button"
            onClick={() => setNotebookOpen(!isNotebookOpen)}
            className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-slate-200 border border-slate-600 cursor-pointer font-medium transition-colors"
          >
            Tab Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
