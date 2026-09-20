'use client';

import React, { useState } from 'react';
import {
  Station2NetworkConfigPayload,
  PingTestLog,
  ArpEntry,
  DnsLookupLog,
} from '../../../shared/domain/room104Types';

interface Room104NetworkConfigModalProps {
  initialPayload?: Partial<Station2NetworkConfigPayload>;
  onSave: (payload: Station2NetworkConfigPayload) => void;
  onClose: () => void;
}

const DEFAULT_DEVICES = {
  'NVR-01': { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'STATIC' as const },
  'CAM-01': { ipAddress: '192.168.1.101', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' as const },
  'CAM-02': { ipAddress: '192.168.1.102', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' as const },
  'CAM-03': { ipAddress: '192.168.1.103', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'STATIC' as const },
  'CAM-04': { ipAddress: '192.168.1.104', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' as const },
};

export const Room104NetworkConfigModal: React.FC<Room104NetworkConfigModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'tools' | 'poe'>('devices');

  // Device Config state
  const [configuredDevices, setConfiguredDevices] = useState(
    initialPayload?.configuredDevices || DEFAULT_DEVICES
  );

  // Network Tools state
  const [pingTarget, setPingTarget] = useState<string>('192.168.1.101');
  const [pingLogs, setPingLogs] = useState<PingTestLog[]>(
    initialPayload?.pingLogs && initialPayload.pingLogs.length > 0
      ? initialPayload.pingLogs
      : [
          {
            targetIp: '192.168.1.101',
            targetDevice: 'CAM-01 (Entrance Bullet)',
            packetsSent: 4,
            packetsReceived: 4,
            packetLossPercent: 0,
            avgLatencyMs: 1.2,
            status: 'SUCCESS',
          },
          {
            targetIp: '192.168.1.1',
            targetDevice: 'Gateway Router',
            packetsSent: 4,
            packetsReceived: 4,
            packetLossPercent: 0,
            avgLatencyMs: 0.8,
            status: 'SUCCESS',
          },
        ]
  );

  const [arpEntries] = useState<ArpEntry[]>(
    initialPayload?.arpEntries && initialPayload.arpEntries.length > 0
      ? initialPayload.arpEntries
      : [
          { ipAddress: '192.168.1.1', macAddress: '00:1A:2B:3C:4D:01', type: 'STATIC' },
          { ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:10', type: 'STATIC' },
          { ipAddress: '192.168.1.101', macAddress: '00:1A:2B:3C:4D:A1', type: 'DYNAMIC' },
          { ipAddress: '192.168.1.102', macAddress: '00:1A:2B:3C:4D:A2', type: 'DYNAMIC' },
          { ipAddress: '192.168.1.103', macAddress: '00:1A:2B:3C:4D:A3', type: 'STATIC' },
        ]
  );

  const [dnsHostname, setDnsHostname] = useState('cctv-nvr.campus.local');
  const [dnsLog, setDnsLog] = useState<DnsLookupLog>(
    initialPayload?.dnsLookup || {
      queryHostname: 'cctv-nvr.campus.local',
      resolvedIp: '192.168.1.10',
      status: 'SUCCESS',
    }
  );

  // PoE Power Budget state
  const [isLoadBalanced, setIsLoadBalanced] = useState<boolean>(
    initialPayload?.poeBudget?.isLoadBalanced ?? true
  );
  const switchCapacity = 65; // Watts
  const connectedLoad = isLoadBalanced ? 48 : 58; // Watts
  const isOverloaded = connectedLoad > switchCapacity;

  // Run new Ping
  const handleRunPing = () => {
    const isLocalSubnet = pingTarget.startsWith('192.168.1.');
    const newLog: PingTestLog = {
      targetIp: pingTarget,
      targetDevice: pingTarget === '192.168.1.1' ? 'Default Gateway' : `Device @ ${pingTarget}`,
      packetsSent: 4,
      packetsReceived: isLocalSubnet ? 4 : 0,
      packetLossPercent: isLocalSubnet ? 0 : 100,
      avgLatencyMs: isLocalSubnet ? 1.4 : 0,
      status: isLocalSubnet ? 'SUCCESS' : 'UNREACHABLE',
    };
    setPingLogs((prev) => [newLog, ...prev.slice(0, 4)]);
  };

  // Run DNS Lookup
  const handleDnsLookup = () => {
    setDnsLog({
      queryHostname: dnsHostname,
      resolvedIp: dnsHostname.includes('nvr') ? '192.168.1.10' : '192.168.1.1',
      status: 'SUCCESS',
    });
  };

  // Scoring (35 pts max)
  let score = 0;
  // 1. Device configs accurate (10 pts)
  const allSubnetsValid = Object.values(configuredDevices).every(
    (d) => d.subnetMask === '255.255.255.0' && d.defaultGateway === '192.168.1.1'
  );
  if (allSubnetsValid) score += 10;
  else score += 5;

  // 2. DHCP / Static allocation (7 pts)
  if (configuredDevices['NVR-01']?.method === 'STATIC') score += 7;
  else score += 3;

  // 3. Tools run (Ping & DNS) (8 pts)
  if (pingLogs.some((l) => l.status === 'SUCCESS') && dnsLog.status === 'SUCCESS') score += 8;
  else score += 4;

  // 4. PoE Budget within rating (5 pts)
  if (!isOverloaded && connectedLoad <= 50) score += 5;
  else if (!isOverloaded) score += 3;

  // 5. Documentation & verification (5 pts)
  if (arpEntries.length >= 4) score += 5;
  else score += 2;

  const handleSave = () => {
    const payload: Station2NetworkConfigPayload = {
      configuredDevices,
      pingLogs,
      arpEntries,
      dnsLookup: dnsLog,
      poeBudget: {
        switchCapacityWatts: switchCapacity,
        connectedLoadWatts: connectedLoad,
        safetyMarginWatts: Math.round(connectedLoad * 0.2),
        isLoadBalanced,
        isOverloaded,
      },
      score,
      isCompleted: true,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base">
              2
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Station 2: การตั้งค่าอุปกรณ์และตรวจสอบการเชื่อมต่อเครือข่าย
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  35 คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Device Configuration, Network Verification (Ping, ARP, DNS) & PoE Power Budget Meter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">คะแนนสถานี 2</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{score}/35</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🖥️ การตั้งค่าอุปกรณ์ (IP Config)</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚡ Network Tools (Ping, ARP, DNS)</span>
          </button>

          <button
            onClick={() => setActiveTab('poe')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'poe'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔋 PoE Power Budget Meter</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono ${
                isOverloaded ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {connectedLoad}W / {switchCapacity}W
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Device Configuration */}
          {activeTab === 'devices' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      การกำหนดค่าไอพีของอุปกรณ์ปลายทาง (Device Configuration Console)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ตรวจสอบว่า IP, Subnet Mask, Gateway และ DNS สอดคล้องกับ IP Address Table ใน Station 1
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full font-mono">
                    {Object.keys(configuredDevices).length} อุปกรณ์ทำงานปกติ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(configuredDevices).map(([devId, config]) => (
                    <div
                      key={devId}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sky-300 text-xs font-mono">{devId}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                          {config.method}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">IP Address:</span>
                          <input
                            type="text"
                            value={config.ipAddress}
                            onChange={(e) =>
                              setConfiguredDevices((prev) => ({
                                ...prev,
                                [devId]: { ...prev[devId as keyof typeof prev]!, ipAddress: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Subnet Mask:</span>
                          <input
                            type="text"
                            value={config.subnetMask}
                            onChange={(e) =>
                              setConfiguredDevices((prev) => ({
                                ...prev,
                                [devId]: { ...prev[devId as keyof typeof prev]!, subnetMask: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Default Gateway:</span>
                          <input
                            type="text"
                            value={config.defaultGateway}
                            onChange={(e) =>
                              setConfiguredDevices((prev) => ({
                                ...prev,
                                [devId]: { ...prev[devId as keyof typeof prev]!, defaultGateway: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">DNS Server:</span>
                          <input
                            type="text"
                            value={config.dns}
                            onChange={(e) =>
                              setConfiguredDevices((prev) => ({
                                ...prev,
                                [devId]: { ...prev[devId as keyof typeof prev]!, dns: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Network Tools */}
          {activeTab === 'tools' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ping Tool */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      1. Network Ping Tool
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">ICMP Echo</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pingTarget}
                      onChange={(e) => setPingTarget(e.target.value)}
                      placeholder="IP Address (e.g. 192.168.1.101)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={handleRunPing}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Ping
                    </button>
                  </div>

                  {/* Ping Result List */}
                  <div className="space-y-1.5">
                    {pingLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-sky-300">{log.targetIp}</span>
                          <span className="text-slate-400 ml-2">({log.targetDevice})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">Loss: {log.packetLossPercent}%</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ARP Table & DNS */}
                <div className="space-y-4">
                  {/* ARP Table */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      2. ARP Table (IP to MAC Binding)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-1">IP Address</th>
                            <th className="py-1">MAC Address</th>
                            <th className="py-1 text-right">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {arpEntries.map((arp, idx) => (
                            <tr key={idx}>
                              <td className="py-1 text-sky-300">{arp.ipAddress}</td>
                              <td className="py-1 text-slate-300">{arp.macAddress}</td>
                              <td className="py-1 text-right text-slate-400">{arp.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* DNS Lookup */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      3. DNS Lookup Service
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dnsHostname}
                        onChange={(e) => setDnsHostname(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={handleDnsLookup}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                    <div className="text-[11px] font-mono bg-slate-900 p-2 rounded-xl border border-slate-800 text-emerald-400">
                      Resolved: {dnsLog.queryHostname} &rarr; {dnsLog.resolvedIp} (Status: {dnsLog.status})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PoE Power Budget */}
          {activeTab === 'poe' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      การตรวจวัดโหลดกำลังไฟรวมของ PoE Switch (Power Budget Meter)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      พิกัดสูงสุดของสวิตช์: 65W · กล้อง 4 ตัว (12W + 10W + 18W + 8W)
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                      isOverloaded
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isOverloaded ? '⚠ OVERLOAD' : '✓ SAFE POWER BUDGET'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">PoE Load: {connectedLoad}W</span>
                    <span className="text-slate-400">พิกัดสูงสุด: {switchCapacity}W</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : connectedLoad > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (connectedLoad / switchCapacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <strong className="text-slate-200 block">เปิดใช้งาน PoE Load Balancing / Dynamic Power:</strong>
                    <span className="text-slate-400 text-[11px]">
                      ปรับเกณฑ์การจ่ายไฟอัจฉริยะ ลดการสูญเสียสาย ส่งผลให้โหลดลดเหลือ 48W
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLoadBalanced(!isLoadBalanced)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isLoadBalanced
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isLoadBalanced ? '✓ เปิดโหมดประหยัดโหลด (48W)' : 'ปิดโหมดประหยัดโหลด (58W)'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            สถานะ: <strong className="text-indigo-400 font-mono">Station 2 (35%)</strong> ·
            ผลการตรวจสอบพร้อมส่ง
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก / ปิด
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>💾 บันทึกผล Station 2</span>
              <span className="font-mono">({score}/35)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
