import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';
import { useCctvTrainingStore } from '../../store/useCctvTrainingStore';
import { ConceptId, DeviceId } from '../../shared/domain/roleplayTypes';
import { LESSON_META } from '../../data/unit1RoleplayContent';

export const FieldNotebook: React.FC = () => {
  const isNotebookOpen = useRoleplayStore((s) => s.isNotebookOpen);
  const setNotebookOpen = useRoleplayStore((s) => s.setNotebookOpen);
  const missions = useRoleplayStore((s) => s.missions);
  const rubric = useRoleplayStore((s) => s.rubric);
  const currentZone = useRoleplayStore((s) => s.currentZone);
  const topology = useRoleplayStore((s) => s.topologyResult);
  const mission3Matches = useRoleplayStore((s) => s.mission3Matches);
  const matchDeviceFunction = useRoleplayStore((s) => s.matchDeviceFunction);
  const mission4Cards = useRoleplayStore((s) => s.mission4Cards);
  const placeComparisonCard = useRoleplayStore((s) => s.placeComparisonCard);
  const learningEvidence = useRoleplayStore((s) => s.learningEvidence);
  const traineeName = useRoleplayStore((s) => s.traineeName);
  const setActiveStation101Modal = useCctvTrainingStore((s) => s.setActiveStation101Modal);
  const activeTab = useRoleplayStore((s) => s.notebookActiveTab);
  const setActiveTab = useRoleplayStore((s) => s.setNotebookActiveTab);

  if (!isNotebookOpen) return null;

  const comparisonCardsList: { id: ConceptId; nameTh: string }[] = [
    { id: 'CARD_COAXIAL', nameTh: 'สาย Coaxial (RG6)' },
    { id: 'CARD_CAT6', nameTh: 'สาย UTP Cat6' },
    { id: 'CARD_DVR', nameTh: 'เครื่องบันทึก DVR' },
    { id: 'CARD_NVR', nameTh: 'เครื่องบันทึก NVR' },
    { id: 'CARD_POE', nameTh: 'ไฟเลี้ยง PoE (802.3af)' },
    { id: 'CARD_IP_ADDRESS', nameTh: 'หมายเลข IP Address' },
    { id: 'CARD_ANALOG_SIGNAL', nameTh: 'สัญญาณรูปคลื่นอนาล็อก' },
    { id: 'CARD_DIGITAL_PACKET', nameTh: 'แพ็กเก็ตข้อมูลดิจิทัล' },
  ];

  const m3Functions: { id: ConceptId; labelTh: string }[] = [
    { id: 'FUNC_CAMERA', labelTh: 'รับภาพ ประมวลผล และส่ง Video Stream' },
    { id: 'FUNC_POE_SWITCH', labelTh: 'เชื่อมอุปกรณ์เครือข่ายและจ่ายไฟ PoE' },
    { id: 'FUNC_NVR', labelTh: 'รับและบันทึก Video Stream จากกล้อง IP' },
    { id: 'FUNC_ROUTER', labelTh: 'เชื่อมต่อระหว่างเครือข่ายและกำหนดเส้นทาง' },
    { id: 'FUNC_CLIENT_PC', labelTh: 'ดูภาพ ตั้งค่า และจัดการระบบ' },
  ];

  const devicesToMatch: { id: DeviceId; nameTh: string }[] = [
    { id: 'CAMERA_BULLET', nameTh: '1. กล้องวงจรปิด IP (IP Camera)' },
    { id: 'POE_SWITCH_8P', nameTh: '2. สวิตช์จ่ายไฟ PoE (PoE Switch)' },
    { id: 'NVR_8CH', nameTh: '3. เครื่องบันทึกเครือข่าย (NVR)' },
    { id: 'ROUTER', nameTh: '4. เราเตอร์เครือข่าย (Router)' },
    { id: 'CLIENT_PC', nameTh: '5. เครื่องคอมพิวเตอร์ลูกข่าย (Client PC)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <span className="text-xs text-sky-400 font-mono font-semibold">
              {LESSON_META.courseCode} · {LESSON_META.courseNameTh}
            </span>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>กระเป๋าช่าง & สมุดบันทึกปฏิบัติการ</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                คะแนนรวม {rubric.totalScore}/100
              </span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setNotebookOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 cursor-pointer transition-all ${
              activeTab === 'checklist'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ภารกิจ 5 ขั้น (Checklist)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('minimap')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 cursor-pointer transition-all ${
              activeTab === 'minimap'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            แผนผังร้าน (Smart Mart)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workbenches')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 cursor-pointer transition-all ${
              activeTab === 'workbenches'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            โต๊ะปฏิบัติการ (M3/M4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 cursor-pointer transition-all ${
              activeTab === 'diagnostics'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            วิเคราะห์ระบบ (Diagnostic)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 cursor-pointer transition-all ${
              activeTab === 'certificate'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ใบรับรองการฝึก {rubric.isPassed ? '🎓' : '🔒'}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.values(missions) as any[]).map((m) => (
                  <div
                    key={m.missionId}
                    className={`p-4 rounded-xl border ${
                      m.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                        : m.isUnlocked
                        ? 'bg-slate-800/40 border-slate-700 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{m.titleTh}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800">
                        {m.score}/{m.maxScore} คะแนน
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">{m.descriptionTh}</p>
                    {m.lastFeedbackTh && (
                      <div className="text-[11px] p-2 rounded bg-slate-950/60 border border-slate-800 text-sky-300">
                        💬 {m.lastFeedbackTh}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">
                        {m.isCompleted ? '✓ ปฏิบัติสำเร็จแล้ว' : 'ยังไม่ผ่านเกณฑ์'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const numMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
                            M1: 1,
                            M2: 2,
                            M3: 3,
                            M4: 4,
                            M5: 5,
                          };
                          const stNum = numMap[m.missionId] || 1;
                          setNotebookOpen(false);
                          setActiveStation101Modal(stNum);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <span>ทำภารกิจนี้ ➜</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rubric Summary Card */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <h3 className="font-bold text-slate-300 text-sm">เกณฑ์การประเมินรูบริก 100 คะแนน</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                  <div>1. วงจรภาพดิจิทัล: {rubric.m1VideoPipelineScore}/15</div>
                  <div>2. เส้นทาง Data Flow: {rubric.m2DataFlowScore}/20</div>
                  <div>3. หน้าที่อุปกรณ์: {rubric.m3DeviceFunctionScore}/15</div>
                  <div>4. เปรียบเทียบ Analog/IP: {rubric.m4AnalogVsIpScore}/15</div>
                  <div>5. ต่อระบบและสาย: {rubric.m5WiringAssemblyScore}/25</div>
                  <div>6. การแก้ปัญหา/Hint: {rubric.troubleshootingScore}/10</div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-medium">
                  <span>เกณฑ์ผ่าน: 80 คะแนน + กล้อง Online + มีภาพ Live View</span>
                  <span className={rubric.isPassed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {rubric.isPassed ? 'ผ่านเกณฑ์แล้ว (Passed)' : 'ยังไม่ผ่านเกณฑ์'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MINIMAP */}
          {activeTab === 'minimap' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-slate-400">
                ผังห้องปฏิบัติการศูนย์ฝึกอบรม Smart Mart &gt; ทางเชื่อมต่อ Room 102
              </p>
              <div className="grid grid-cols-3 gap-3 w-full max-w-2xl bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center text-xs">
                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_B' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">📹</div>
                  <div className="text-sky-300 font-semibold mt-1">สถานีกล้องวงจรปิด IP</div>
                  <div className="text-slate-400 text-[10px]">ทดสอบและกำหนดค่ากล้อง</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/20 text-slate-600 flex flex-col justify-center">
                  <div className="text-xs">ทางเดินกลางร้าน</div>
                </div>
                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_C' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">🔀</div>
                  <div className="text-sky-300 font-semibold mt-1">ห้องอุปกรณ์เครือข่าย</div>
                  <div className="text-slate-400 text-[10px]">ตู้แร็ค & PoE Switch</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/20 text-slate-600 flex flex-col justify-center">
                  <div className="text-xs">ชั้นวางสินค้า</div>
                </div>
                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_A' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">🏬</div>
                  <div className="text-sky-300 font-semibold mt-1">จุดรับภารกิจ / สรุปงาน</div>
                  <div className="text-slate-400 text-[10px]">เคาน์เตอร์ผู้จัดการ</div>
                </div>
                <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 flex flex-col justify-center font-medium">
                  <div className="text-xs font-bold">🚪 ประตูเชื่อมต่อ</div>
                  <div className="text-[10px] opacity-80">สู่ Room 102</div>
                </div>

                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_D' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">📼</div>
                  <div className="text-sky-300 font-semibold mt-1">ห้องบันทึกภาพ NVR</div>
                  <div className="text-slate-400 text-[10px]">เครื่องบันทึก & เซิร์ฟเวอร์</div>
                </div>
                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_F' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">⚖️</div>
                  <div className="text-sky-300 font-semibold mt-1">เปรียบเทียบ Analog vs IP</div>
                  <div className="text-slate-400 text-[10px]">โต๊ะทดลองเปรียบเทียบระบบ</div>
                </div>
                <div className={`p-4 rounded-xl border ${currentZone === 'ZONE_E' ? 'border-sky-400 bg-sky-950/30 font-bold' : 'border-slate-800 bg-slate-900/40'}`}>
                  <div className="text-lg">🖥️</div>
                  <div className="text-sky-300 font-semibold mt-1">โต๊ะควบคุม Client PC</div>
                  <div className="text-slate-400 text-[10px]">หน้าจอมอนิเตอร์ตรวจการ</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKBENCHES (MISSION 3 & MISSION 4) */}
          {activeTab === 'workbenches' && (
            <div className="space-y-6">
              {/* Mission 3: Matching */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sky-400 text-sm">ภารกิจที่ 3: จับคู่อุปกรณ์กับหน้าที่ (15 คะแนน)</h3>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    คะแนน: {missions.M3.score}/15
                  </span>
                </div>
                <div className="space-y-2">
                  {devicesToMatch.map((dev) => (
                    <div key={dev.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <span className="font-semibold text-slate-200">{dev.nameTh}</span>
                      <select
                        value={mission3Matches[dev.id] || ''}
                        onChange={(e) => matchDeviceFunction(dev.id, e.target.value as ConceptId)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none cursor-pointer w-full sm:w-80"
                      >
                        <option value="">-- เลือกหน้าที่ที่ถูกต้อง --</option>
                        {m3Functions.map((fn) => (
                          <option key={fn.id} value={fn.id}>
                            {fn.labelTh}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission 4: Analog vs IP */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sky-400 text-sm">ภารกิจที่ 4: จำแนกคุณสมบัติ Analog vs IP (15 คะแนน)</h3>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    คะแนน: {missions.M4.score}/15
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  คลิกเลือกเพื่อย้ายการ์ดแต่ละใบไปไว้ที่ฝั่ง Analog หรือฝั่ง IP (เกณฑ์ผ่าน: ถูกต้องอย่างน้อย 6 จาก 8 ใบ)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {comparisonCardsList.map((c) => {
                    const isAnalog = mission4Cards.analogCards.includes(c.id);
                    const isIp = mission4Cards.ipCards.includes(c.id);

                    return (
                      <div key={c.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{c.nameTh}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => placeComparisonCard(c.id, 'ANALOG')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer border transition-colors ${
                              isAnalog
                                ? 'bg-amber-600 text-white border-amber-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            Analog
                          </button>
                          <button
                            type="button"
                            onClick={() => placeComparisonCard(c.id, 'IP')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer border transition-colors ${
                              isIp
                                ? 'bg-sky-600 text-white border-sky-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            IP CCTV
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSTIC CONSOLE */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">System Hardware Status & Diagnostic Logs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div>PoE Budget: <span className="text-emerald-400">{topology.totalPoeWattsUsed}/{topology.poeBudgetWatts}W</span></div>
                  <div>Camera Power: <span className={topology.isCameraPowered ? 'text-emerald-400' : 'text-rose-400'}>{topology.isCameraPowered ? 'OK' : 'OFF'}</span></div>
                  <div>NVR LAN Link: <span className={topology.isNvrReachable ? 'text-emerald-400' : 'text-rose-400'}>{topology.isNvrReachable ? 'UP' : 'DOWN'}</span></div>
                  <div>Live View: <span className={topology.isLiveViewActive ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{topology.isLiveViewActive ? 'ACTIVE' : 'DOWN'}</span></div>
                </div>
              </div>

              {/* Event Logs */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-300 text-xs">Diagnostic Event Logs:</h4>
                {topology.diagnosticEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">ยังไม่มีเหตุการณ์วินิจฉัย</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs">
                    {topology.diagnosticEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs ${
                          evt.severity === 'SUCCESS'
                            ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
                            : evt.severity === 'ERROR'
                            ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
                            : 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                        }`}
                      >
                        <span className="font-bold">[{evt.code}]</span> {evt.titleTh} — {evt.messageTh}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="flex flex-col items-center">
              {rubric.isPassed && learningEvidence ? (
                <div className="w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-amber-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
                  <div className="text-4xl">🎓</div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-300 uppercase tracking-widest">
                      ใบประกาศนียบัตรการฝึกปฏิบัติการ
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.) พ.ศ. 2567
                    </p>
                  </div>

                  <div className="text-sm font-medium text-slate-200 py-2 border-y border-slate-800">
                    ขอมอบให้ไว้เพื่อแสดงว่า <strong className="text-sky-300 text-base">{traineeName}</strong><br />
                    ได้ผ่านการฝึกปฏิบัติ <strong>{LESSON_META.unitTitleTh}</strong><br />
                    วิชา {LESSON_META.courseCode} {LESSON_META.courseNameTh}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div>คะแนนประเมิน: <strong className="text-emerald-400">{rubric.totalScore}/100</strong></div>
                    <div>เวลาที่ใช้: <strong>{learningEvidence.durationSeconds} วินาที</strong></div>
                    <div>จำนวนครั้งที่ลอง: <strong>{learningEvidence.attemptsCount}</strong></div>
                    <div>คำใบ้ที่ใช้: <strong>{learningEvidence.hintsUsedCount}</strong></div>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-800">
                    Verification Code: <strong className="text-slate-300">{learningEvidence.verificationHash}</strong>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <div className="text-4xl">🔒</div>
                  <h3 className="text-sm font-bold text-slate-300">ยังไม่ปลดล็อกใบรับรอง</h3>
                  <p className="text-xs max-w-md mx-auto text-slate-400">
                    ผู้เรียนต้องทำคะแนนรวมอย่างน้อย 80 คะแนน และต้องทำเงื่อนไขบังคับครบ:
                    กล้อง IP Online, NVR ติดต่อได้ และมีภาพสด Live View บนหน้าจอ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
