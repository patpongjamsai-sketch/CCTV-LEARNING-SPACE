'use client';

import React, { useState, useMemo } from 'react';
import { Station3RemoteAccessPayload } from '../../../shared/domain/room106Types';

interface Room106RemoteAccessModalProps {
  initialPayload?: Partial<Station3RemoteAccessPayload>;
  onSave: (payload: Station3RemoteAccessPayload) => void;
  onClose: () => void;
}

export const Room106RemoteAccessModal: React.FC<Room106RemoteAccessModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [cloudP2pEnabled, setCloudP2pEnabled] = useState<boolean>(
    initialPayload?.cloudP2pEnabled ?? true
  );
  const [dnsServer, setDnsServer] = useState<string>(
    initialPayload?.networkDiagnostics?.dnsServer || '0.0.0.0'
  );
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticRun, setDiagnosticRun] = useState<boolean>(
    initialPayload?.networkDiagnostics?.dnsServer === '8.8.8.8'
  );
  
  // Mobile pairing state
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [mobileQrScanned, setMobileQrScanned] = useState<boolean>(
    initialPayload?.mobileQrScanned ?? false
  );
  const [deviceSerial] = useState<string>('NVR-2026-X8801');
  const [verificationCode, setVerificationCode] = useState<string>('CCTV88');
  const [liveStreamTested, setLiveStreamTested] = useState<boolean>(
    initialPayload?.liveStreamTested ?? false
  );

  // Security rationale
  const [securityComparisonReasoning, setSecurityComparisonReasoning] = useState<string>(
    'Cloud P2P ทำงานผ่าน Outbound Connection โดยยิงไปยัง Cloud Broker ทำให้ไม่ต้องเปิด Port Forwarding บนเราเตอร์ ป้องกันการถูกโจมตีด้วย Port Scan และใช้งานได้แม้ผ่าน CGNAT ขณะที่ DDNS จำเป็นต้องมี Public IP และเสี่ยงต่อการโดน Brute Force หากตั้งรหัสผ่านไม่ปลอดภัย'
  );

  // Fault Log state
  const [faultFixApplied, setFaultFixApplied] = useState<boolean>(dnsServer === '8.8.8.8');
  const [retestPassed, setRetestPassed] = useState<boolean>(
    dnsServer === '8.8.8.8' && cloudP2pEnabled
  );

  // Determine Cloud P2P status
  // If DNS is 8.8.8.8 or 1.1.1.1 and P2P is enabled -> ONLINE, otherwise OFFLINE
  const isDnsValid = dnsServer === '8.8.8.8' || dnsServer === '1.1.1.1';
  const cloudP2pStatus: 'OFFLINE' | 'ONLINE' =
    cloudP2pEnabled && isDnsValid && diagnosticRun ? 'ONLINE' : 'OFFLINE';

  const networkDiagnostics = useMemo(() => {
    return {
      gatewayOk: true,
      dnsServer,
      internetOk: isDnsValid,
    };
  }, [dnsServer, isDnsValid]);

  // Scoring rubric (40 pts max):
  // 1. Cloud P2P Enabled & ONLINE: 20 pts
  // 2. Mobile QR paired & stream tested: 10 pts
  // 3. Security rationale (P2P vs DDNS): 5 pts
  // 4. Fault Log & DNS fix resolved: 5 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sOnline = 0;
    let sPair = 0;
    let sSecurity = 0;
    let sFault = 0;

    if (cloudP2pStatus === 'ONLINE') sOnline = 20;
    else if (cloudP2pEnabled) sOnline = 8;

    if (mobileQrScanned && liveStreamTested) sPair = 10;
    else if (mobileQrScanned) sPair = 6;

    if (securityComparisonReasoning.trim().length >= 30) sSecurity = 5;
    else if (securityComparisonReasoning.trim().length >= 10) sSecurity = 2;

    if (faultFixApplied && retestPassed) sFault = 5;
    else if (faultFixApplied) sFault = 2;

    return {
      scoreBreakdown: {
        cloudOnline: sOnline,
        mobilePairing: sPair,
        securityRationale: sSecurity,
        faultTroubleshoot: sFault,
      },
      totalScore: sOnline + sPair + sSecurity + sFault,
    };
  }, [cloudP2pStatus, cloudP2pEnabled, mobileQrScanned, liveStreamTested, securityComparisonReasoning, faultFixApplied, retestPassed]);

  const handleApplyDnsFix = (dns: string) => {
    setDnsServer(dns);
    setFaultFixApplied(true);
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
      setDiagnosticRun(true);
      if (dns === '8.8.8.8' || dns === '1.1.1.1') {
        setRetestPassed(true);
      } else {
        setRetestPassed(false);
      }
    }, 600);
  };

  const handleScanQrCode = () => {
    if (cloudP2pStatus !== 'ONLINE') {
      alert('ไม่สามารถจับคู่ได้: สถานะ Cloud P2P ยังคง OFFLINE อยู่ กรุณาแก้ไขระบบเครือข่ายก่อน');
      return;
    }

    setIsScanningQr(true);
    setTimeout(() => {
      setIsScanningQr(false);
      setMobileQrScanned(true);
      setLiveStreamTested(true);
    }, 800);
  };

  const handleSaveAndSubmit = () => {
    const payload: Station3RemoteAccessPayload = {
      cloudP2pEnabled,
      cloudP2pStatus,
      networkDiagnostics,
      mobileQrScanned,
      pairedDeviceSerial: deviceSerial,
      liveStreamTested,
      resolvedFaultId: 'FLT-106-DNS-OFFLINE',
      faultScenario: {
        issue: 'Cloud P2P Service แสดงสถานะ OFFLINE ไม่สามารถออกอินเทอร์เน็ตได้',
        cause: 'DNS Server ถูกตั้งเป็น 0.0.0.0 ทำให้ NVR ไม่สามารถ Resolve โดเมนของ Cloud P2P Broker ได้',
        fixApplied: faultFixApplied,
        retestPassed,
      },
      score: totalScore,
      isCompleted: totalScore >= 28 && cloudP2pStatus === 'ONLINE' && mobileQrScanned,
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
              ☁️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Room 106 · Station 3
                </span>
                <span className="text-[11px] font-mono text-slate-400">P2P Hole Punching vs DDNS</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 3: กำหนดค่า Cloud P2P Remote Viewing &amp; QR Code Pairing
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
          
          {/* Top Row: NVR Cloud Settings & Network Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: NVR Cloud P2P Service Panel */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <span>🖥️ แผงควบคุม NVR: Cloud P2P Setting</span>
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    cloudP2pStatus === 'ONLINE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-sm shadow-emerald-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      cloudP2pStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  {cloudP2pStatus}
                </span>
              </div>

              {/* Service Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="font-bold text-slate-100">เปิดใช้บริการ Cloud P2P</div>
                  <div className="text-[10px] text-slate-400">เชื่อมต่อ CCTV Cloud Broker เพื่อดูภาพระยะไกล</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCloudP2pEnabled(!cloudP2pEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    cloudP2pEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      cloudP2pEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Device QR Code on NVR Screen */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative bg-white p-2.5 rounded-xl flex items-center justify-center shadow-inner">
                  {/* Visual QR Simulator SVG */}
                  <svg width="90" height="90" viewBox="0 0 100 100" className="text-slate-900">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner Position Boxes */}
                    <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="18" width="9" height="9" fill="#0f172a" />

                    <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="73" y="18" width="9" height="9" fill="#0f172a" />

                    <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

                    {/* Data modules */}
                    <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="20" width="6" height="6" fill="#0f172a" />
                    <rect x="40" y="40" width="20" height="20" fill="#0f172a" />
                    <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                    <rect x="68" y="48" width="8" height="8" fill="#0f172a" />
                    <rect x="78" y="65" width="10" height="10" fill="#0f172a" />
                    <rect x="45" y="75" width="8" height="8" fill="#0f172a" />
                    <rect x="25" y="45" width="8" height="8" fill="#0f172a" />
                  </svg>
                  {cloudP2pStatus !== 'ONLINE' && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-center p-1">
                      <span className="text-[9px] font-bold text-rose-300">P2P OFFLINE</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-left w-full">
                  <div className="text-[10px] text-slate-400">Device Serial Number:</div>
                  <div className="font-mono font-bold text-sky-300 text-sm">{deviceSerial}</div>
                  <div className="text-[10px] text-slate-400">Verification Code:</div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="rounded bg-slate-950 border border-slate-700 px-2 py-0.5 font-mono text-xs text-white uppercase w-24"
                  />
                  <div className="text-[9px] text-slate-500 pt-1">
                    *QR Code ใช้จับคู่เฉพาะอุปกรณ์ ไม่มีการเปิดเผยพาสเวิร์ดแอดมิน
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Network Diagnostic & Troubleshooting */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <span>🛠️ Network Diagnostic &amp; Fault Resolving</span>
                </h3>
                <span className="text-[10px] text-amber-400 font-mono">Fault Scenario 106</span>
              </div>

              {/* Status checklist */}
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Local Gateway (192.168.1.1):</span>
                  <span className="text-emerald-400 font-bold">✓ REACHABLE (0.4 ms)</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">DNS Server Config:</span>
                  <span className={isDnsValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {dnsServer} {isDnsValid ? '(OK)' : '(UNRESOLVED)'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">P2P Broker Handshake:</span>
                  <span className={cloudP2pStatus === 'ONLINE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {isDiagnosing
                      ? 'TESTING...'
                      : cloudP2pStatus === 'ONLINE'
                      ? '✓ CONNECTED (p2p.cctvcloud.net)'
                      : '✗ BROKER TIMEOUT'}
                  </span>
                </div>
              </div>

              {/* Troubleshooting Fix Action */}
              <div className="space-y-2 pt-1">
                <label className="text-slate-300 font-medium block">
                  แก้ไขปัญหา DNS Server ให้สามารถเชื่อมต่อ Cloud Broker ได้:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyDnsFix('8.8.8.8')}
                    className={`p-2 rounded-xl border font-mono text-center text-[11px] transition-all cursor-pointer ${
                      dnsServer === '8.8.8.8'
                        ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300 font-bold shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>Google DNS</div>
                    <div className="text-[10px] text-slate-400">8.8.8.8 (แนะนำ)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyDnsFix('1.1.1.1')}
                    className={`p-2 rounded-xl border font-mono text-center text-[11px] transition-all cursor-pointer ${
                      dnsServer === '1.1.1.1'
                        ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300 font-bold shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>Cloudflare</div>
                    <div className="text-[10px] text-slate-400">1.1.1.1</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyDnsFix('0.0.0.0')}
                    className={`p-2 rounded-xl border font-mono text-center text-[11px] transition-all cursor-pointer ${
                      dnsServer === '0.0.0.0'
                        ? 'border-rose-500 bg-rose-950/50 text-rose-300 font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>ค่าเริ่มต้นเดิม</div>
                    <div className="text-[10px] text-rose-400">0.0.0.0 (Error)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Smartphone Simulator & P2P vs DDNS Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Mobile App Simulator */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>📱 Mobile App Simulator (CCTV Guard View)</span>
                <span className="text-[10px] text-slate-400">iOS / Android</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                {/* Phone screen graphic */}
                <div className="w-48 h-64 rounded-2xl border-4 border-slate-700 bg-black p-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  {/* Top Notch */}
                  <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />

                  {/* Screen Content */}
                  {mobileQrScanned && liveStreamTested ? (
                    <div className="flex-1 flex flex-col justify-between py-1 text-center">
                      <div className="text-[9px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE STREAM (8 CH)
                      </div>
                      {/* 4-split preview tiles */}
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg">
                        <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">CH1 Gate</div>
                        <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">CH2 Cash</div>
                        <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">CH3 Shelf</div>
                        <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">CH4 Park</div>
                      </div>
                      <div className="text-[8px] font-mono text-slate-400">
                        {deviceSerial} · 25 FPS
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-2 space-y-2">
                      <div className="text-2xl">📷</div>
                      <div className="text-[10px] text-slate-300">ยังไม่ได้ผูกอุปกรณ์</div>
                      <div className="text-[8px] text-slate-500">กดปุ่มสแกน QR Code จากหน้าจอ NVR</div>
                    </div>
                  )}

                  {/* Bottom Home Indicator */}
                  <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />
                </div>

                {/* Pairing Action buttons */}
                <div className="space-y-2.5 flex-1">
                  <div className="text-xs text-slate-300">
                    สแกน QR Code เพื่อดึง Serial Number และทำการเชื่อมต่อช่องสัญญาณ P2P
                  </div>

                  <button
                    type="button"
                    onClick={handleScanQrCode}
                    disabled={isScanningQr || cloudP2pStatus !== 'ONLINE'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      cloudP2pStatus !== 'ONLINE'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                        : mobileQrScanned
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 hover:bg-emerald-900'
                        : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/30'
                    }`}
                  >
                    {isScanningQr ? (
                      <>📷 กำลังจับภาพและวิเคราะห์ QR Code...</>
                    ) : mobileQrScanned ? (
                      <>✓ จับคู่อุปกรณ์สำเร็จแล้ว (กดสแกนซ้ำได้)</>
                    ) : (
                      <>🔍 สแกน QR Code จับคู่อุปกรณ์</>
                    )}
                  </button>

                  <div className="text-[10px] text-slate-400 font-mono space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={mobileQrScanned ? 'text-emerald-400' : 'text-slate-400'}>
                        {mobileQrScanned ? 'PAIRED (OK)' : 'NOT PAIRED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <span className="text-sky-300">TLS 1.3 / End-to-End</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Cloud P2P vs DDNS Technical Comparison */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>🛡️ บทวิเคราะห์: Cloud P2P vs DDNS &amp; Cybersecurity</span>
                  <span className="text-[10px] text-slate-400">ประเมินความปลอดภัย</span>
                </h3>

                <textarea
                  rows={4}
                  value={securityComparisonReasoning}
                  onChange={(e) => setSecurityComparisonReasoning(e.target.value)}
                  placeholder="อธิบายเหตุผลว่าทำไม Cloud P2P จึงปลอดภัยกว่าการเปิด Port Forwarding และ DDNS..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200 focus:border-sky-500 outline-none leading-relaxed"
                />

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-sky-950/30 border border-sky-800/50 p-2 rounded-xl text-sky-200">
                    <div className="font-bold text-sky-300">Cloud P2P:</div>
                    <div>• ไม่ต้องเปิด Port บน Router</div>
                    <div>• ทะลุ Double NAT / CGNAT ได้</div>
                    <div>• ลดความเสี่ยง Port Scan 100%</div>
                  </div>
                  <div className="bg-amber-950/20 border border-amber-800/50 p-2 rounded-xl text-amber-200">
                    <div className="font-bold text-amber-300">DDNS / Port Forwarding:</div>
                    <div>• ต้องเปิด Port 80, 554, 8000</div>
                    <div>• เสี่ยงต่อ Botnet Brute Force</div>
                    <div>• ต้องมี Public IPv4 จริง</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSecurityComparisonReasoning(
                      'Cloud P2P ทำงานผ่าน Outbound Connection โดยยิงไปยัง Cloud Broker ทำให้ไม่ต้องเปิด Port Forwarding บนเราเตอร์ ป้องกันการถูกโจมตีด้วย Port Scan และใช้งานได้แม้ผ่าน CGNAT ขณะที่ DDNS จำเป็นต้องมี Public IP และเสี่ยงต่อการโดน Brute Force หากตั้งรหัสผ่านไม่ปลอดภัย'
                    )
                  }
                  className="text-sky-400 hover:underline text-[11px] cursor-pointer"
                >
                  ใช้ข้อความวิเคราะห์มาตรฐาน
                </button>
              </div>
            </div>
          </div>

          {/* Score Summary Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">P2P สถานะ Online</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.cloudOnline} / 20</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">จับคู่ QR &amp; ดูสด</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.mobilePairing} / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">วิเคราะห์ P2P/DDNS</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.securityRationale} / 5</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">แก้ปัญหา DNS Fault</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.faultTroubleshoot} / 5</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 3: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 40</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {totalScore >= 28 && cloudP2pStatus === 'ONLINE' && mobileQrScanned ? (
              <span className="text-emerald-400 font-semibold">✓ ระบบ Cloud P2P เชื่อมต่อสมบูรณ์และดูภาพสดได้แล้ว</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ กรุณาแก้ปัญหา DNS ให้ Online และทำการสแกน QR Code</span>
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
              บันทึกและส่งผลการเชื่อมต่อ Station 3
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
