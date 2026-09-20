'use client';

import React, { useState } from 'react';
import {
  IpAddressTableRow,
  INITIAL_ROOM104_IP_TABLE,
  Station1NetworkPlanPayload,
  Room104AddressMethod,
} from '../../../shared/domain/room104Types';

interface Room104IpPlanningModalProps {
  initialPayload?: Partial<Station1NetworkPlanPayload>;
  onSave: (payload: Station1NetworkPlanPayload) => void;
  onClose: () => void;
}

export const Room104IpPlanningModal: React.FC<Room104IpPlanningModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [networkAddress, setNetworkAddress] = useState(initialPayload?.networkAddress || '192.168.1.0');
  const [subnetMask, setSubnetMask] = useState(initialPayload?.subnetMask || '255.255.255.0');
  const [cidrPrefix, setCidrPrefix] = useState<number>(initialPayload?.cidrPrefix || 24);
  const [defaultGateway, setDefaultGateway] = useState(initialPayload?.defaultGateway || '192.168.1.1');
  const [dnsServer, setDnsServer] = useState(initialPayload?.dnsServer || '8.8.8.8');
  const [methodReasoning, setMethodReasoning] = useState(
    initialPayload?.methodReasoning ||
      'ใช้ Static IP สำหรับ Gateway, Switch และ NVR เพื่อความแน่นอนในการสื่อสาร ส่วนกล้อง IP ใช้ DHCP Reservation โดยผูก MAC Address เข้ากับ IP เพื่อป้องกัน IP หลุดหรือเปลี่ยนเมื่อ Reboot'
  );

  const [ipTable, setIpTable] = useState<IpAddressTableRow[]>(
    initialPayload?.ipAddressTable && initialPayload.ipAddressTable.length > 0
      ? initialPayload.ipAddressTable
      : INITIAL_ROOM104_IP_TABLE
  );

  // Check IP conflicts
  const ipCounts: Record<string, number> = {};
  ipTable.forEach((row) => {
    const ip = row.ipAddress.trim();
    if (ip) {
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    }
  });

  const conflictIps = Object.keys(ipCounts).filter((ip) => ipCounts[ip]! > 1);
  const hasIpConflict = conflictIps.length > 0;

  // Handle IP edit
  const handleUpdateRow = (idx: number, field: keyof IpAddressTableRow, value: any) => {
    setIpTable((prev) => {
      const next = [...prev];
      const target = { ...next[idx]! };
      (target as any)[field] = value;

      // Update status based on conflict
      if (field === 'ipAddress') {
        target.status = 'PLANNED';
      }
      next[idx] = target;
      return next;
    });
  };

  // Auto align standard IP plan
  const handleAutoAlignPlan = () => {
    setNetworkAddress('192.168.1.0');
    setSubnetMask('255.255.255.0');
    setCidrPrefix(24);
    setDefaultGateway('192.168.1.1');
    setDnsServer('8.8.8.8');
    setIpTable(INITIAL_ROOM104_IP_TABLE.map((r) => ({ ...r, subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8' })));
  };

  // Calculate score (35 pts max)
  let score = 0;
  // 1. IP Allocation non-duplicate (12 pts)
  if (!hasIpConflict && ipTable.length >= 7) {
    score += 12;
  } else if (!hasIpConflict) {
    score += 8;
  }

  // 2. Subnet Mask / CIDR accuracy (8 pts)
  if (subnetMask === '255.255.255.0' && cidrPrefix === 24 && networkAddress === '192.168.1.0') {
    score += 8;
  } else {
    score += 4;
  }

  // 3. Gateway & DNS (5 pts)
  if (defaultGateway === '192.168.1.1' && (dnsServer === '8.8.8.8' || dnsServer === '1.1.1.1')) {
    score += 5;
  }

  // 4. Method selection (Static for NVR/GW, DHCP Reservation for cams) (5 pts)
  const nvrIsStatic = ipTable.find((r) => r.deviceId === 'NVR-01')?.method === 'STATIC';
  const gwIsStatic = ipTable.find((r) => r.deviceId === 'GW-01')?.method === 'STATIC';
  if (nvrIsStatic && gwIsStatic) {
    score += 5;
  }

  // 5. Reasoning and completeness (5 pts)
  if (methodReasoning.length >= 40) {
    score += 5;
  } else if (methodReasoning.length >= 20) {
    score += 3;
  }

  const handleSave = () => {
    const payload: Station1NetworkPlanPayload = {
      networkAddress,
      subnetMask,
      cidrPrefix,
      defaultGateway,
      dnsServer,
      totalUsableHosts: 254,
      ipAddressTable: ipTable,
      ipConflictDetected: hasIpConflict,
      methodReasoning,
      score,
      isCompleted: true,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-base">
              1
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Station 1: การวางแผน IP Address และจัดทำ IP Address Table
                </h2>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  35 คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                CIDR Subnet Planning, Static vs DHCP Reservation & Real-time IP Conflict Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">คะแนนสถานี 1</span>
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

        {/* Conflict Warning Banner */}
        {hasIpConflict && (
          <div className="px-6 py-2.5 bg-rose-950/80 border-b border-rose-500/60 text-rose-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">⚠</span>
              <span>
                <strong>ตรวจพบ IP Address ซ้ำ (IP Conflict):</strong> พบการกำหนด IP เดียวกันให้กับหลายอุปกรณ์ ({conflictIps.join(', ')}) กรุณาแก้ไขไม่ให้ซ้ำกัน!
              </span>
            </div>
            <button
              onClick={handleAutoAlignPlan}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
            >
              แก้ไขอัตโนมัติ
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Subnet & Network Scope */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                1. ข้อมูลเครือข่ายหลักและ Subnet Scope
              </span>
              <button
                type="button"
                onClick={handleAutoAlignPlan}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                โหลดค่ามาตรฐานระบบ CCTV (Class C /24)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Network ID:</label>
                <input
                  type="text"
                  value={networkAddress}
                  onChange={(e) => setNetworkAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Subnet Mask:</label>
                <input
                  type="text"
                  value={subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">CIDR Prefix:</label>
                <input
                  type="number"
                  value={cidrPrefix}
                  onChange={(e) => setCidrPrefix(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Default Gateway:</label>
                <input
                  type="text"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">DNS Server:</label>
                <input
                  type="text"
                  value={dnsServer}
                  onChange={(e) => setDnsServer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Interactive IP Address Table */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  2. ตารางแผนกำหนดหมายเลขไอพี (IP Address Table)
                </span>
                <span className="text-[11px] text-slate-400">
                  ตรวจสอบให้ทุกอุปกรณ์มี IP ไม่ซ้ำกัน และระบุวิธีรับ IP (Static หรือ DHCP Reservation)
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {ipTable.length} อุปกรณ์
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2 px-2">Device ID</th>
                    <th className="py-2 px-2">ชื่ออุปกรณ์ / ตำแหน่ง</th>
                    <th className="py-2 px-2">MAC Address</th>
                    <th className="py-2 px-2">IP Address</th>
                    <th className="py-2 px-2">วิธีรับ IP</th>
                    <th className="py-2 px-2">Gateway</th>
                    <th className="py-2 px-2">PoE (Watts)</th>
                    <th className="py-2 px-2 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {ipTable.map((row, idx) => {
                    const isConflict = conflictIps.includes(row.ipAddress.trim());
                    return (
                      <tr
                        key={row.deviceId}
                        className={`hover:bg-slate-900/60 transition-colors ${
                          isConflict ? 'bg-rose-950/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2 font-mono font-bold text-sky-300">
                          {row.deviceId}
                        </td>
                        <td className="py-2.5 px-2 text-slate-200">
                          {row.deviceNameTh}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-400 text-[11px]">
                          {row.macAddress}
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.ipAddress}
                            onChange={(e) => handleUpdateRow(idx, 'ipAddress', e.target.value)}
                            className={`w-32 bg-slate-900 border rounded-lg px-2 py-1 font-mono text-xs ${
                              isConflict
                                ? 'border-rose-500 text-rose-300 bg-rose-950/50'
                                : 'border-slate-700 text-white'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <select
                            value={row.method}
                            onChange={(e) =>
                              handleUpdateRow(idx, 'method', e.target.value as Room104AddressMethod)
                            }
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 cursor-pointer"
                          >
                            <option value="STATIC">STATIC (กำหนดคงที่)</option>
                            <option value="DHCP_RESERVATION">DHCP Reservation (ผูก MAC)</option>
                            <option value="DHCP">DHCP (แจกอัตโนมัติ)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.gateway}
                            onChange={(e) => handleUpdateRow(idx, 'gateway', e.target.value)}
                            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-[11px] text-slate-300"
                          />
                        </td>
                        <td className="py-2.5 px-2 font-mono text-amber-400 text-center">
                          {row.expectedWatts > 0 ? `${row.expectedWatts}W` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {isConflict ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              CONFLICT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              VALID
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Engineering Reasoning */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
              3. เหตุผลทางวิศวกรรมในการเลือกใช้วิธีกำหนดไอพี (Static vs DHCP Reservation):
            </label>
            <textarea
              rows={2}
              value={methodReasoning}
              onChange={(e) => setMethodReasoning(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
              placeholder="ระบุเหตุผลว่าทำไมอุปกรณ์โครงสร้างหลักต้องใช้ Static และกล้องควรใช้ DHCP Reservation..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            สถานะ: <strong className="text-sky-400 font-mono">Station 1 (35%)</strong> ·
            {hasIpConflict ? (
              <span className="text-rose-400 font-bold ml-1">กรุณาแก้ไข IP Conflict ก่อนส่งผล!</span>
            ) : (
              <span className="text-emerald-400 ml-1">ตาราง IP พร้อมบันทึก</span>
            )}
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
              disabled={hasIpConflict}
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                hasIpConflict
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-600/30'
              }`}
            >
              <span>💾 บันทึกตาราง IP Address</span>
              <span className="font-mono">({score}/35)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
