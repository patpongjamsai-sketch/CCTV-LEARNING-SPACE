'use client';

import React, { useState, useMemo } from 'react';
import { Station2CommissioningPayload } from '../../../shared/domain/room108Types';

interface Room108CommissioningModalProps {
  initialPayload?: Partial<Station2CommissioningPayload>;
  onSave: (payload: Station2CommissioningPayload) => void;
  onClose: () => void;
}

const CHANNELS = [
  { id: 1, name: 'CH1: ทางเข้าหลัก (Dome 4K)', ip: '192.168.1.101', fps: 25, bitrate: '4.0 Mbps' },
  { id: 2, name: 'CH2: แคชเชียร์ (Dome 4K Audio)', ip: '192.168.1.102', fps: 25, bitrate: '4.0 Mbps' },
  { id: 3, name: 'CH3: ทางเดินกลาง 1 (Bullet 2K)', ip: '192.168.1.103', fps: 25, bitrate: '3.0 Mbps' },
  { id: 4, name: 'CH4: ทางเดินกลาง 2 (Bullet 2K)', ip: '192.168.1.104', fps: 25, bitrate: '3.0 Mbps' },
  { id: 5, name: 'CH5: คลังสินค้า (Bullet 2K)', ip: '192.168.1.105', fps: 25, bitrate: '3.0 Mbps' },
  { id: 6, name: 'CH6: ลานจอดรถ (PTZ)', ip: '192.168.1.106', fps: 30, bitrate: '3.5 Mbps' },
  { id: 7, name: 'CH7: จุดโหลดสินค้า (Bullet 2K)', ip: '192.168.1.107', fps: 25, bitrate: '3.0 Mbps' },
  { id: 8, name: 'CH8: ทางหนีไฟ ชั้น 2 (Dome 4K)', ip: '192.168.1.108', fps: 25, bitrate: '4.0 Mbps' },
];

export const Room108CommissioningModal: React.FC<Room108CommissioningModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [hardwareRackMounted] = useState<boolean>(
    initialPayload?.hardwareRackMounted ?? true
  );
  const [poePowerBudgetChecked] = useState<boolean>(
    initialPayload?.poeSwitchPowerBudgetChecked ?? true
  );

  const [cameraOnline, setCameraOnline] = useState<boolean>(
    initialPayload?.cameraOnline ?? true
  );
  const [nvrReachable, setNvrReachable] = useState<boolean>(
    initialPayload?.nvrReachable ?? true
  );
  const [liveViewActive, setLiveViewActive] = useState<boolean>(
    initialPayload?.liveViewActive ?? true
  );
  const [recordingActive, setRecordingActive] = useState<boolean>(
    initialPayload?.recordingActive ?? true
  );
  const [remoteAccessOnline, setRemoteAccessOnline] = useState<boolean>(
    initialPayload?.remoteAccessOnline ?? true
  );

  // UPS Simulation
  const [isPowerOutageSimulated, setIsPowerOutageSimulated] = useState<boolean>(false);
  const [upsFailoverTested, setUpsFailoverTested] = useState<boolean>(
    initialPayload?.upsFailoverTested ?? false
  );

  // Cyber Hardening Checklist
  const [passwordChanged, setPasswordChanged] = useState<boolean>(true);
  const [httpsEnforced, setHttpsEnforced] = useState<boolean>(true);
  const [unusedPortsClosed, setUnusedPortsClosed] = useState<boolean>(true);

  // Commissioning notes
  const [commissioningNotes, setCommissioningNotes] = useState<string>(
    initialPayload?.commissioningNotes ||
      'กล้องทั้ง 8 ตัวออนไลน์ครบถ้วน NVR ทำงานบันทึกแบบ Real-time ตลอด 24 ชม., ทดสอบตัดไฟ AC เมนหลัก ระบบ UPS สลับจ่ายไฟสำรองทันทีโดยไม่มีการรีบูตหรือสูญเสียภาพ, และทำ Cyber Hardening ปิดพอร์ตที่ไม่จำเป็นเรียบร้อย'
  );

  // Scoring rubric (40 pts max):
  // 1. M2: Camera Online & NVR Reachable: 20 pts
  // 2. M3: Live View, Recording & UPS Failover: 20 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sM2 = 0;
    let sM3 = 0;

    if (cameraOnline && nvrReachable) sM2 = 20;
    else if (cameraOnline || nvrReachable) sM2 = 10;

    if (liveViewActive && recordingActive && upsFailoverTested) sM3 = 20;
    else if (liveViewActive && recordingActive) sM3 = 14;
    else if (liveViewActive) sM3 = 8;

    return {
      scoreBreakdown: {
        networkAndHardware: sM2,
        liveViewAndRecording: sM3,
      },
      totalScore: sM2 + sM3,
    };
  }, [cameraOnline, nvrReachable, liveViewActive, recordingActive, upsFailoverTested]);

  const handleSimulatePowerOutage = () => {
    setIsPowerOutageSimulated(true);
    setTimeout(() => {
      setUpsFailoverTested(true);
    }, 600);
  };

  const handleSaveAndSubmit = () => {
    const payload: Station2CommissioningPayload = {
      hardwareRackMounted,
      poeSwitchPowerBudgetChecked: poePowerBudgetChecked,
      cameraOnline,
      nvrReachable,
      liveViewActive,
      recordingActive,
      remoteAccessOnline,
      upsFailoverTested,
      cyberHardeningVerified: passwordChanged && httpsEnforced && unusedPortsClosed,
      commissioningChecks: {
        cameraOnline,
        nvrReachable,
        liveViewActive,
        recordingActive,
        remoteAccessOnline,
        upsBackupOk: upsFailoverTested,
        passwordsHardened: passwordChanged && httpsEnforced,
      },
      commissioningNotes,
      score: totalScore,
      isCompleted: totalScore >= 34 && cameraOnline && nvrReachable && liveViewActive && recordingActive,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xl shadow-inner">
              🖥️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Room 108 · Station 2
                </span>
                <span className="text-[11px] font-mono text-slate-400">System Commissioning &amp; Acceptance Tests</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 2: System Commissioning, Acceptance Tests &amp; Failover
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400">คะแนนสถานี: </span>
              <span className="text-lg font-bold text-emerald-400">{totalScore}</span>
              <span className="text-xs text-slate-500"> / 40</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-slate-200">
          
          {/* Top Row: System Status Overview & Acceptance Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Acceptance Criteria Checklist */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>✅ เกณฑ์การตรวจรับระบบ (Acceptance Criteria)</span>
                <span className="text-[10px] text-slate-400">Enterprise Standard</span>
              </h3>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">1. Camera Online (8/8 Ch):</span>
                  <button
                    type="button"
                    onClick={() => setCameraOnline(!cameraOnline)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      cameraOnline ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {cameraOnline ? '✓ PASS (8 CH)' : '✗ FAIL'}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">2. NVR Reachable (192.168.1.200):</span>
                  <button
                    type="button"
                    onClick={() => setNvrReachable(!nvrReachable)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      nvrReachable ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {nvrReachable ? '✓ PASS (ONLINE)' : '✗ FAIL'}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">3. Multi-split Live View:</span>
                  <button
                    type="button"
                    onClick={() => setLiveViewActive(!liveViewActive)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      liveViewActive ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {liveViewActive ? '✓ 8-SPLIT ACTIVE' : '✗ NO FEED'}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">4. Continuous 24/7 Recording:</span>
                  <button
                    type="button"
                    onClick={() => setRecordingActive(!recordingActive)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      recordingActive ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {recordingActive ? '✓ RECORDING (8TB)' : '✗ STOPPED'}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">5. Cloud P2P Remote Access:</span>
                  <button
                    type="button"
                    onClick={() => setRemoteAccessOnline(!remoteAccessOnline)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      remoteAccessOnline ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {remoteAccessOnline ? '✓ CLOUD ONLINE' : '✗ OFFLINE'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: UPS Power Failover Simulation */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200">🔋 การทดสอบระบบไฟสำรอง (UPS 1000VA Failover)</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      upsFailoverTested ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {upsFailoverTested ? '✓ PASSED' : 'NOT TESTED'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">สถานะไฟฟ้าเมน (Mains AC):</span>
                    <span className={isPowerOutageSimulated ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isPowerOutageSimulated ? '⚡ POWER OUTAGE (ไฟดับ)' : 'NORMAL (220V AC)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">โหมดการทำงานของ UPS:</span>
                    <span className={isPowerOutageSimulated ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                      {isPowerOutageSimulated ? 'BATTERY BACKUP (Inverter On)' : 'LINE NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">เวลาสลับไฟ (Transfer Time):</span>
                    <span className="text-emerald-300 font-bold">4 ms (ไร้การสะดุด)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ระยะเวลาสำรองไฟโดยประมาณ:</span>
                    <span className="text-sky-300 font-bold">25 นาที (ที่โหลด 64W)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulatePowerOutage}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    upsFailoverTested
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg'
                  }`}
                >
                  {upsFailoverTested ? '✓ ทดสอบ UPS สำเร็จ (คลิกเพื่อทดสอบซ้ำ)' : '⚡ จำลองเหตุการณ์ไฟดับเพื่อตรวจ UPS'}
                </button>
              </div>
            </div>
          </div>

          {/* 8-Channel Live Monitoring Grid */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>📹 ภาพสดผ่านระบบรวมศูนย์ NVR (8-Channel Surveillance Matrix)</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">● LIVE STREAMING (25 FPS)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-xl border border-slate-800 bg-black/80 overflow-hidden relative group"
                >
                  <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        REC
                      </span>
                      <span className="text-slate-400">{ch.bitrate}</span>
                    </div>

                    <div className="text-center text-slate-500 text-[10px] py-1">
                      [ Simulated Video Feed ]
                    </div>

                    <div className="text-[9px] font-mono text-slate-300 truncate">
                      {ch.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cybersecurity Hardening Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>🛡️ การปรับปรุงความปลอดภัยทางไซเบอร์ (Cybersecurity Hardening)</span>
              <span className="text-[10px] text-slate-400">Zero Default Passwords</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setPasswordChanged(!passwordChanged)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  passwordChanged
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                }`}
              >
                <div className="text-[10px] opacity-75">รหัสผ่านแอดมิน</div>
                <div className="font-bold">{passwordChanged ? '✓ เปลี่ยนรหัสใหม่แล้ว' : '✗ ใช้ค่าเริ่มต้น (เสี่ยง)'}</div>
              </button>

              <button
                type="button"
                onClick={() => setHttpsEnforced(!httpsEnforced)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  httpsEnforced
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                }`}
              >
                <div className="text-[10px] opacity-75">การเข้ารหัส Web/App</div>
                <div className="font-bold">{httpsEnforced ? '✓ บังคับใช้ HTTPS/TLS' : '✗ ใช้ HTTP ปกติ'}</div>
              </button>

              <button
                type="button"
                onClick={() => setUnusedPortsClosed(!unusedPortsClosed)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  unusedPortsClosed
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-300'
                }`}
              >
                <div className="text-[10px] opacity-75">การปิดพอร์ตเสี่ยง</div>
                <div className="font-bold">{unusedPortsClosed ? '✓ ปิด Telnet/UPnP แล้ว' : '✗ พอร์ตเสี่ยงเปิดอยู่'}</div>
              </button>
            </div>

            <textarea
              rows={2}
              value={commissioningNotes}
              onChange={(e) => setCommissioningNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-sky-500 outline-none leading-relaxed"
            />
          </div>

          {/* Score Breakdown Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">M2: Camera Online &amp; NVR Reachable</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.networkAndHardware} / 20</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">M3: Live View, Recording &amp; Failover</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.liveViewAndRecording} / 20</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 2: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 40</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {totalScore >= 34 ? (
              <span className="text-emerald-400 font-semibold">✓ ผ่านเกณฑ์การทดสอบระบบก่อนส่งมอบ (Commissioning Passed)</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ ต้องการการทดสอบ Live View และ UPS ให้สมบูรณ์</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveAndSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลการทดสอบ Station 2
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
