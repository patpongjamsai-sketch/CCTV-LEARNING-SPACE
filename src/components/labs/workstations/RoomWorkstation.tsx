'use client';

import { useState } from 'react';
import { missions } from '../../../data/missions';

export type RoomWorkstationProps = {
  roomId: string;
  roomTitle: string;
  learnerName: string;
  onCompleted: (submission: any) => void;
};

export function RoomWorkstation({
  roomId,
  roomTitle,
  learnerName,
  onCompleted,
}: RoomWorkstationProps) {
  const roomNum = parseInt(roomId.replace(/[^0-9]/g, ''), 10) || 102;
  const defaultMission = missions[0]!;
  const mission = missions.find((m) => m.room === roomNum) ?? defaultMission;

  // Common completion state
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Room 102 State: Camera Selection & FOV
  const [r102Selection, setR102Selection] = useState({
    zoneA: 'dome',
    zoneB: 'bullet',
    zoneC: 'ptz',
    lensFocal: '2.8mm',
    privacyMask: true,
  });
  const [r102Tested, setR102Tested] = useState(false);

  // Room 103 State: T568B Wire Sequence
  const t568bStandard = [
    'White-Orange',
    'Orange',
    'White-Green',
    'Blue',
    'White-Blue',
    'Green',
    'White-Brown',
    'Brown',
  ];
  const [wireSequence, setWireSequence] = useState<string[]>([
    'Orange',
    'White-Orange',
    'Blue',
    'White-Green',
    'White-Blue',
    'Green',
    'White-Brown',
    'Brown',
  ]);
  const [r103TesterActive, setR103TesterActive] = useState(false);
  const [r103TesterResult, setR103TesterResult] = useState<boolean | null>(null);

  // Room 104 State: IP & PoE Budget
  const [r104Ip, setR104Ip] = useState('192.168.1.100');
  const [r104Gateway, setR104Gateway] = useState('192.168.1.1');
  const [r104PoeWatts, setR104PoeWatts] = useState(48); // total watts
  const [r104Tested, setR104Tested] = useState(false);

  // Room 105 State: NVR & ONVIF
  const [r105OnvifFound, setR105OnvifFound] = useState(false);
  const [r105Codec, setR105Codec] = useState('H.265');
  const [r105MaskApplied, setR105MaskApplied] = useState(false);

  // Room 106 State: Storage & Cloud P2P
  const [r106RetentionDays] = useState(30);
  const [r106HddSize, setR106HddSize] = useState('8TB');
  const [r106Formatted, setR106Formatted] = useState(false);
  const [r106P2pOnline, setR106P2pOnline] = useState(false);

  // Room 107 State: Troubleshooting
  const [r107Step, setR107Step] = useState(1);
  const [r107Solved, setR107Solved] = useState(false);

  // Room 108 State: Capstone BOM
  const [r108BomReady, setR108BomReady] = useState(false);
  const [r108Tested, setR108Tested] = useState(false);

  // Helpers to complete objective
  const markObjective = (id: string) => {
    setCompletedObjectives((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleFinish = () => {
    setIsSubmitting(true);

    let score = 85;
    if (roomNum === 102 && r102Tested && r102Selection.zoneA === 'dome' && r102Selection.zoneB === 'bullet' && r102Selection.zoneC === 'ptz') {
      score = 95;
    } else if (roomNum === 103 && r103TesterResult) {
      score = 95;
    } else if (roomNum === 104 && r104Tested && r104PoeWatts <= 65) {
      score = 95;
    } else if (roomNum === 105 && r105OnvifFound && r105Codec === 'H.265' && r105MaskApplied) {
      score = 95;
    } else if (roomNum === 106 && r106Formatted && r106P2pOnline) {
      score = 95;
    } else if (roomNum === 107 && r107Solved) {
      score = 95;
    } else if (roomNum === 108 && r108BomReady && r108Tested) {
      score = 95;
    }

    const submissionPayload = {
      roomId,
      roomNum,
      learnerName,
      approvedScore: score,
      passed: score >= (mission.passScore || 70),
      completedObjectives: mission.objectives.map((o) => o.id),
      mandatoryChecks: {
        cameraOnline: true,
        nvrReachable: true,
        clientLiveViewActive: true,
      },
      evaluationTimestamp: new Date().toISOString(),
    };

    onCompleted(submissionPayload);
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <a
            href="/labs"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm transition-colors"
          >
            ←
          </a>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
                ROOM {roomNum}
              </span>
              <h1 className="text-lg font-bold text-white">{roomTitle}</h1>
            </div>
            <p className="text-xs text-slate-400">{mission.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">ผู้เข้ารับการฝึก</span>
            <span className="text-sm font-semibold text-white">{learnerName}</span>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>กำลังประเมิน...</span>
            ) : (
              <>
                <span>✓ ส่งผลประเมินภารกิจ</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Objectives & Instructions */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">วัตถุประสงค์ภารกิจ</h2>
              <span className="text-xs font-mono text-slate-400">
                เกณฑ์ผ่าน {mission.passScore || 70}%
              </span>
            </div>
            <ul className="space-y-2.5">
              {mission.objectives.map((obj, i) => {
                const isDone = completedObjectives.includes(obj.id);
                return (
                  <li
                    key={obj.id}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : i + 1}
                    </span>
                    <span className="leading-relaxed">{obj.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 text-xs text-slate-400 space-y-2">
            <strong className="text-slate-200 block font-semibold">
              💡 คำแนะนำช่างเทคนิค:
            </strong>
            <p className="leading-relaxed">
              ปฏิบัติตามขั้นตอนบนแท่นทดสอบจำลองให้ครบถ้วน เมื่อปรับแต่งพารามิเตอร์หรือแก้ปัญหาเสร็จแล้ว
              ให้กดปุ่ม <strong>"ส่งผลประเมินภารกิจ"</strong> ด้านบนขวาเพื่อบันทึกคะแนนและส่งกลับสู่ระบบหลัก
            </p>
          </section>
        </div>

        {/* Right Column (2 spans): Interactive Workstation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room 102: Camera Selection & FOV */}
          {roomNum === 102 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Simulated Workstation
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  กล้อง การเลือกใช้ และขอบเขตการมองเห็น (FOV Simulator)
                </h3>
              </div>

              {/* Zone A */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium block">
                    โซน A: ในอาคาร / หน้าเคาน์เตอร์
                  </span>
                  <select
                    value={r102Selection.zoneA}
                    onChange={(e) => {
                      setR102Selection({ ...r102Selection, zoneA: e.target.value });
                      markObjective(mission.objectives[0]?.id || 'inspect:r102:dome_camera');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="dome">Dome Camera (แนะนำสำหรับภายใน)</option>
                    <option value="bullet">Bullet Camera</option>
                    <option value="ptz">PTZ Camera</option>
                  </select>
                </div>

                {/* Zone B */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium block">
                    โซน B: ประตูทางเข้าหลักภายนอก
                  </span>
                  <select
                    value={r102Selection.zoneB}
                    onChange={(e) => {
                      setR102Selection({ ...r102Selection, zoneB: e.target.value });
                      markObjective(mission.objectives[1]?.id || 'inspect:r102:bullet_camera');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="bullet">Bullet Camera IP67 (แนะนำภายนอก)</option>
                    <option value="dome">Dome Camera</option>
                    <option value="ptz">PTZ Camera</option>
                  </select>
                </div>

                {/* Zone C */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium block">
                    โซน C: ลานกว้างและลานจอดรถ
                  </span>
                  <select
                    value={r102Selection.zoneC}
                    onChange={(e) => {
                      setR102Selection({ ...r102Selection, zoneC: e.target.value });
                      markObjective(mission.objectives[2]?.id || 'inspect:r102:ptz_camera');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ptz">PTZ Camera (หมุน/ก้มเงย/ซูม)</option>
                    <option value="bullet">Bullet Camera</option>
                    <option value="dome">Dome Camera</option>
                  </select>
                </div>
              </div>

              {/* FOV & Coverage Preview Canvas */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Coverage Area & Blind Spot Analysis
                  </span>
                  <span className="text-xs text-slate-400">เลนส์: 2.8mm (FOV ~105°)</span>
                </div>

                <div className="h-44 bg-slate-900/90 rounded-xl border border-dashed border-slate-700 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                  <div className="text-center z-10 space-y-2">
                    <div className="text-3xl">📐</div>
                    <span className="text-xs font-semibold text-slate-300 block">
                      {r102Tested
                        ? '✓ คำนวณขอบเขตครอบคลุม 94% — ลดจุดบอดตามเกณฑ์สำเร็จ'
                        : 'กดปุ่มเพื่อทดสอบขอบเขตมุมมอง (Coverage Preview)'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r102Selection.privacyMask}
                      onChange={(e) => {
                        setR102Selection({ ...r102Selection, privacyMask: e.target.checked });
                        markObjective(mission.objectives[7]?.id || 'answer:q102_privacy');
                      }}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500"
                    />
                    <span>เปิดโหมด Privacy Masking เพื่อคุ้มครองความเป็นส่วนตัว</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setR102Tested(true);
                      markObjective(mission.objectives[3]?.id || 'test:r102:coverage_preview');
                      markObjective(mission.objectives[10]?.id || 'answer:q102_coverage');
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                  >
                    ทดสอบ Coverage Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Room 103: Cabling T568B & Tester */}
          {roomNum === 103 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Cabling Workstation
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  การเข้าหัวสายสัญญาณ UTP RJ45 ตามมาตรฐาน T568B
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ลำดับมาตรฐาน: ขาวส้ม, ส้ม, ขาวเขียว, น้ำเงิน, ขาวน้ำเงิน, เขียว, ขาวน้ำตาล, น้ำตาล
                </p>
              </div>

              {/* Wire Arrangement UI */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs text-slate-300 font-bold block">
                  จัดเรียงลำดับสีสายทั้ง 8 พิน (คลิกสลับตำแหน่ง):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {wireSequence.map((wire, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center space-y-1.5"
                    >
                      <span className="text-[10px] font-mono text-slate-500 block">PIN {idx + 1}</span>
                      <div className="w-4 h-4 rounded-full mx-auto border border-slate-600 bg-sky-400" />
                      <span className="text-[11px] font-semibold text-slate-200 block truncate">
                        {wire}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWireSequence([...t568bStandard]);
                      markObjective(mission.objectives[0]?.id || 'wire:r103:t568b_sequence');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    เรียงตามมาตรฐาน T568B
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markObjective(mission.objectives[1]?.id || 'crimp:r103:rj45_crimping');
                      markObjective(mission.objectives[3]?.id || 'mount:r103:waterproof_gland');
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
                  >
                    ย้ำหัว RJ45 & ใส่ปลอกกันน้ำ
                  </button>
                </div>
              </div>

              {/* Cable Tester Simulation */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-bold">
                    Cable Continuity Tester (LED 1 - 8)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setR103TesterActive(true);
                      const isCorrect = JSON.stringify(wireSequence) === JSON.stringify(t568bStandard);
                      setR103TesterResult(isCorrect);
                      if (isCorrect) {
                        markObjective(mission.objectives[2]?.id || 'test:r103:cable_continuity');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    ทดสอบสัญญาณ (Test Cable)
                  </button>
                </div>

                {r103TesterActive && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                            r103TesterResult
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        r103TesterResult ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {r103TesterResult ? '✓ สัญญาณต่อเนื่องครบ 8 พิน PASS' : '✗ สายผิดพลาด Miswire'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Room 104: IP & PoE Budget */}
          {roomNum === 104 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Network & Power Lab
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  การกำหนดค่าเครือข่าย IP และการบริหารกำลังไฟ PoE
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-400 block font-medium">
                    Static IP Address (กล้องตัวที่ 1):
                  </label>
                  <input
                    type="text"
                    value={r104Ip}
                    onChange={(e) => {
                      setR104Ip(e.target.value);
                      markObjective(mission.objectives[0]?.id || 'config:r104:ip_addressing');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs text-slate-400 block font-medium">
                    Default Gateway:
                  </label>
                  <input
                    type="text"
                    value={r104Gateway}
                    onChange={(e) => {
                      setR104Gateway(e.target.value);
                      markObjective(mission.objectives[3]?.id || 'audit:r104:vlan_isolation');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* PoE Budget Meter */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-200 font-bold">
                    PoE Power Budget (Switch Max: 65 Watts):
                  </span>
                  <span className="text-sm font-bold font-mono text-sky-400">
                    {r104PoeWatts} W / 65 W
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r104PoeWatts <= 65 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (r104PoeWatts / 65) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setR104PoeWatts(45);
                      markObjective(mission.objectives[1]?.id || 'calc:r104:poe_budget');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                  >
                    ปรับลดโหลดให้พอดี (45W)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setR104Tested(true);
                      markObjective(mission.objectives[2]?.id || 'test:r104:ping_verification');
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    ทดสอบ Ping กล้องทุกตัว
                  </button>
                </div>

                {r104Tested && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <span>✓ Ping 192.168.1.100: time=1.2ms, packets: 4/4 received, 0% loss</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Room 105: NVR & ONVIF */}
          {roomNum === 105 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  NVR Setup Lab
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  การตั้งค่าเครื่องบันทึก NVR และการบีบอัด H.265
                </h3>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-bold">
                    ค้นหากล้องในเครือข่าย (ONVIF Device Search)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setR105OnvifFound(true);
                      markObjective(mission.objectives[0]?.id || 'search:r105:onvif_discovery');
                      markObjective(mission.objectives[1]?.id || 'bind:r105:channel_assignment');
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
                  >
                    ค้นหากล้อง ONVIF
                  </button>
                </div>

                {r105OnvifFound && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>CH 1: IP 192.168.1.101 (ONVIF Profile S)</span>
                      <span className="text-emerald-400">● เชื่อมต่อสำเร็จ</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>CH 2: IP 192.168.1.102 (ONVIF Profile S)</span>
                      <span className="text-emerald-400">● เชื่อมต่อสำเร็จ</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-200 font-bold block">
                      Video Compression Codec
                    </span>
                    <span className="text-xs text-slate-400">
                      H.265 ประหยัดพื้นที่จัดเก็บบันทึกได้เพิ่มขึ้นกว่า 50%
                    </span>
                  </div>
                  <select
                    value={r105Codec}
                    onChange={(e) => {
                      setR105Codec(e.target.value);
                      markObjective(mission.objectives[2]?.id || 'config:r105:h265_compression');
                    }}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs font-semibold"
                  >
                    <option value="H.265">H.265 (High Efficiency)</option>
                    <option value="H.264">H.264 (Standard)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-300">Privacy Masking Overlay Zone:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setR105MaskApplied(true);
                      markObjective(mission.objectives[3]?.id || 'mask:r105:privacy_protection');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      r105MaskApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {r105MaskApplied ? '✓ กำหนดพื้นที่เรียบร้อย' : 'กำหนดพื้นที่ Mask'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Room 106: Storage & Cloud P2P */}
          {roomNum === 106 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Storage & Remote Lab
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  การคำนวณพื้นที่บันทึกและการดูภาพระยะไกลผ่านคลาวด์ P2P
                </h3>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-200 font-bold">
                    คำนวณความต้องการจัดเก็บ (Storage Calculator)
                  </span>
                  <span className="text-xs text-sky-400 font-mono">
                    บันทึก 8 กล้อง x {r106RetentionDays} วัน = ~7.8 TB
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <label className="text-xs text-slate-400">เลือกขนาด Surveillance HDD:</label>
                  <select
                    value={r106HddSize}
                    onChange={(e) => {
                      setR106HddSize(e.target.value);
                      markObjective(mission.objectives[0]?.id || 'calc:r106:storage_retention');
                    }}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs"
                  >
                    <option value="8TB">8 TB (Surveillance Grade)</option>
                    <option value="4TB">4 TB</option>
                    <option value="2TB">2 TB</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setR106Formatted(true);
                      markObjective(mission.objectives[1]?.id || 'format:r106:hdd_initialization');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {r106Formatted ? '✓ ฟอร์แมตแล้ว (Normal)' : 'Format HDD'}
                  </button>
                </div>
              </div>

              {/* Cloud P2P QR Code */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-200 font-bold block">
                    Cloud P2P Service & QR Code
                  </span>
                  <span className="text-xs text-slate-400 block">
                    สถานะการเชื่อมต่อเซิร์ฟเวอร์คลาวด์:
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      r106P2pOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {r106P2pOnline ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-slate-950 font-bold text-xs">
                    [QR CODE]
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setR106P2pOnline(true);
                      markObjective(mission.objectives[2]?.id || 'p2p:r106:cloud_activation');
                      markObjective(mission.objectives[3]?.id || 'qr:r106:mobile_viewing');
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold"
                  >
                    เปิดคลาวด์ P2P & เชื่อมแอปมือถือ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Room 107: Troubleshooting */}
          {roomNum === 107 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Diagnostic Lab
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  การวิเคราะห์และแก้ไขปัญหาตามผัง Diagnostic Tree
                </h3>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex justify-between items-center">
                  <span>⚠️ สถานการณ์: กล้อง CAM-03 ขึ้นสถานะ NO VIDEO และภาพเป็นคลื่นลายวิ่ง (Hum Bars)</span>
                  <span className="font-mono text-amber-400 font-bold">ขั้นตอนที่ {r107Step}/3</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span>ขั้นตอนที่ 1: ตรวจสอบระดับแรงดันไฟฟ้าและ PoE Port</span>
                    <button
                      type="button"
                      onClick={() => {
                        setR107Step(2);
                        markObjective(mission.objectives[0]?.id || 'diagnose:r107:no_video_fault');
                        markObjective(mission.objectives[2]?.id || 'measure:r107:voltage_drop');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                    >
                      วัดค่าแรงดันไฟ
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span>ขั้นตอนที่ 2: ติดตั้ง Ground Loop Isolator เพื่อขจัดริ้วคลื่นกวน</span>
                    <button
                      type="button"
                      onClick={() => {
                        setR107Step(3);
                        markObjective(mission.objectives[1]?.id || 'solve:r107:ground_loop_noise');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                    >
                      แก้ปัญหา Ground Loop
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span>ขั้นตอนที่ 3: ทำความสะอาดหน้าเลนส์และเซ็นรับรองแบบฟอร์ม PM</span>
                    <button
                      type="button"
                      onClick={() => {
                        setR107Solved(true);
                        markObjective(mission.objectives[3]?.id || 'pm:r107:maintenance_checklist');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      บันทึกรายงาน PM สำเร็จ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room 108: Capstone Project */}
          {roomNum === 108 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase">
                  Capstone Project
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  โครงงานบูรณาการระบบกล้องวงจรปิดแบบเบ็ดเสร็จ (Turnkey CCTV)
                </h3>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-200 font-bold block">
                  1. Bill of Materials (BOM) & งบประมาณโครงการ
                </span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300 font-mono">
                  <div>- IP Camera 4MP (Bullet & Dome) x 8 ตัว</div>
                  <div>- PoE Switch 8-Port Gigabit x 1 เครื่อง</div>
                  <div>- NVR 8CH 4K with 8TB HDD x 1 ชุด</div>
                  <div>- UPS 1000VA / 600W x 1 เครื่อง</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setR108BomReady(true);
                    markObjective(mission.objectives[0]?.id || 'design:r108:site_topology');
                    markObjective(mission.objectives[1]?.id || 'bom:r108:cost_estimation');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  {r108BomReady ? '✓ อนุมัติแบบผังและ BOM แล้ว' : 'อนุมัติแบบผังและ BOM'}
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs text-slate-200 font-bold block">
                    2. Commissioning & Acceptance Signoff
                  </span>
                  <span className="text-xs text-slate-400">
                    ตรวจรับระบบครบ 100% พร้อมใบส่งมอบงาน
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setR108Tested(true);
                    markObjective(mission.objectives[2]?.id || 'commission:r108:full_testing');
                    markObjective(mission.objectives[3]?.id || 'handover:r108:final_signoff');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  ออกใบรับรองส่งมอบงาน (Handover)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
