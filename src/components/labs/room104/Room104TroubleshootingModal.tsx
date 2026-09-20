'use client';

import React, { useState } from 'react';
import {
  Station3TroubleshootingPayload,
  FaultChallengeScenario,
  FaultLogEntry,
  PingTestLog,
} from '../../../shared/domain/room104Types';

interface Room104TroubleshootingModalProps {
  initialPayload?: Partial<Station3TroubleshootingPayload>;
  onSave: (payload: Station3TroubleshootingPayload) => void;
  onClose: () => void;
}

const FAULT_SCENARIOS: FaultChallengeScenario[] = [
  {
    faultId: 'FAULT_IP_CONFLICT',
    titleTh: 'กรณีศึกษา 1: กล้อง CAM-02 หลุดจากระบบและเกิด IP Conflict ชนกับ NVR',
    symptomTh: 'หน้าจอ NVR แสดงข้อความ "IP Conflict 192.168.1.10" และภาพจากกล้อง CAM-02 ดับลง ตรวจสอบพบว่ากล้องถูกตั้งค่า IP ชนกับเครื่อง NVR โดยไม่ได้ตั้งใจ',
    affectedDevice: 'CAM-02 & NVR-01',
    wrongConfig: { field: 'ipAddress', value: '192.168.1.10', correctValue: '192.168.1.102' },
  },
  {
    faultId: 'FAULT_WRONG_SUBNET',
    titleTh: 'กรณีศึกษา 2: กล้อง CAM-03 ตั้ง Subnet ผิดวง (อยู่วง 192.168.2.x)',
    symptomTh: 'ไฟพอร์ต Switch ติดปกติ แต่ NVR ค้นหากล้อง CAM-03 ไม่พบ ตรวจสอบพบ IP Address เป็น 192.168.2.103 ซึ่งอยู่คนละ Subnet กับ NVR (192.168.1.10/24)',
    affectedDevice: 'CAM-03 (Parking PTZ)',
    wrongConfig: { field: 'ipAddress', value: '192.168.2.103', correctValue: '192.168.1.103' },
  },
  {
    faultId: 'FAULT_POE_OVERLOAD',
    titleTh: 'กรณีศึกษา 3: กำลังไฟ PoE Overload จากกล้อง PTZ ที่เปิด Heater',
    symptomTh: 'กล้อง CAM-03 รีสตาร์ตตัวเองวนลูปเมื่อระบบปรับไปโหมดกลางคืน (IR+Heater กินไฟ 28W) ทำให้โหลดรวมของ Switch พุ่งเกิน 65W จนระบบตัดไฟพอร์ตอัตโนมัติ',
    affectedDevice: 'SW-POE-01 & CAM-03',
    wrongConfig: { field: 'poePowerBudget', value: '72W', correctValue: '48W (Load Balanced)' },
  },
];

const FAULT_KEYWORDS = [
  { key: 'ip_conflict', label: 'IP Conflict / IP ชนกัน', terms: ['ip conflict', 'ชนกัน', 'ซ้ำ'] },
  { key: 'subnet', label: 'Subnet Mask / วงเครือข่ายเดียวกัน', terms: ['subnet', 'วงเดียวกัน', '255.255.255.0'] },
  { key: 'arp_table', label: 'ARP Table / MAC Binding', terms: ['arp', 'mac', 'binding', 'ตาราง arp'] },
  { key: 'ping_test', label: 'Ping Test / ICMP Reachability', terms: ['ping', 'icmp', 'packet loss'] },
  { key: 'dhcp_res', label: 'DHCP Reservation / Static IP', terms: ['dhcp reservation', 'static', 'จอง ip'] },
  { key: 'retest', label: 'Retest / ทดสอบยืนยันผลซ้ำ', terms: ['retest', 'ทดสอบซ้ำ', 'ตรวจซ้ำ', 'ยืนยัน'] },
  { key: 'prevention', label: 'การจัดทำ IP Table ป้องกันเกิดซ้ำ', terms: ['ip table', 'ตาราง ip', 'เอกสาร', 'ป้องกัน'] },
];

export const Room104TroubleshootingModal: React.FC<Room104TroubleshootingModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const currentScenario = FAULT_SCENARIOS[selectedScenarioIdx]!;

  // Evidence Checklist
  const [ipConfigChecked, setIpConfigChecked] = useState(
    initialPayload?.evidenceToolsUsed?.ipConfigChecked ?? true
  );
  const [pingVerified, setPingVerified] = useState(
    initialPayload?.evidenceToolsUsed?.pingVerified ?? true
  );
  const [arpTableChecked, setArpTableChecked] = useState(
    initialPayload?.evidenceToolsUsed?.arpTableChecked ?? true
  );
  const [poeLoadChecked, setPoeLoadChecked] = useState(
    initialPayload?.evidenceToolsUsed?.poeLoadChecked ?? true
  );

  // Fault Log fields
  const [problemDescription, setProblemDescription] = useState(
    initialPayload?.faultLog?.problemDescription ||
      'กล้อง CAM-02 หลุดจากการเชื่อมต่อบน NVR ตรวจพบข้อความ IP Conflict บนเครือข่าย'
  );
  const [rootCauseIdentified, setRootCauseIdentified] = useState(
    initialPayload?.faultLog?.rootCauseIdentified ||
      'ช่างกำหนด Static IP ให้ CAM-02 เป็น 192.168.1.10 ซึ่งซ้ำกับ IP ของ NVR-01 ส่งผลให้เกิด ARP Flapping และแพ็กเก็ตข้อมูลชนกัน'
  );
  const [appliedSolution, setAppliedSolution] = useState(
    initialPayload?.faultLog?.appliedSolution ||
      'เปลี่ยนการตั้งค่า CAM-02 ให้ใช้ DHCP Reservation โดยผูก MAC 00:1A:2B:3C:4D:A2 เข้ากับ IP 192.168.1.102 ตาม IP Address Table จากนั้นสั่ง Clear ARP Cache บนสวิตช์'
  );
  const [postFixVerification, setPostFixVerification] = useState(
    initialPayload?.faultLog?.postFixVerification ||
      'ทดสอบ Ping จาก NVR ไปยัง 192.168.1.102 ได้รับแพ็กเก็ตครบ 4/4 Loss 0% และภาพสดบน NVR กลับมา Online ทันที'
  );
  const [preventativeMeasures, setPreventativeMeasures] = useState(
    initialPayload?.faultLog?.preventativeMeasures ||
      'บังคับใช้ IP Address Table อ้างอิงก่อนตั้งค่าทุกครั้ง และเปิดใช้ DHCP Snooping พร้อม Dynamic ARP Inspection (DAI) บน Managed Switch เพื่อป้องกัน IP Conflict ในอนาคต'
  );

  const [retestPassed, setRetestPassed] = useState(
    initialPayload?.retestPassed ?? true
  );

  // Text analysis
  const fullText = `${problemDescription} ${rootCauseIdentified} ${appliedSolution} ${postFixVerification} ${preventativeMeasures}`.toLowerCase();
  const matchedKeywords = FAULT_KEYWORDS.filter((k) =>
    k.terms.some((term) => fullText.includes(term.toLowerCase()))
  ).map((k) => k.label);

  // Scoring (30 pts max)
  let score = 0;
  // 1. Identify & Evidence (6 pts)
  const evidenceCount = [ipConfigChecked, pingVerified, arpTableChecked, poeLoadChecked].filter(Boolean).length;
  score += Math.round((evidenceCount / 4) * 6);

  // 2. Root Cause Analysis (8 pts)
  if (rootCauseIdentified.length >= 40) score += 8;
  else if (rootCauseIdentified.length >= 20) score += 4;

  // 3. Applied Solution (6 pts)
  if (appliedSolution.length >= 40) score += 6;
  else if (appliedSolution.length >= 20) score += 3;

  // 4. Verification & Retest (6 pts)
  if (retestPassed && postFixVerification.length >= 30) score += 6;
  else if (retestPassed) score += 3;

  // 5. Prevention & Keywords (4 pts)
  const kwRatio = Math.min(1, matchedKeywords.length / 5);
  score += Math.round(kwRatio * 4);

  const totalScore = Math.min(30, score);

  const handleSave = () => {
    const faultLog: FaultLogEntry = {
      problemDescription,
      evidenceCollected: [
        ipConfigChecked ? 'IP Config Scanned' : '',
        pingVerified ? 'Ping ICMP Tested' : '',
        arpTableChecked ? 'ARP Table Verified' : '',
        poeLoadChecked ? 'PoE Meter Checked' : '',
      ].filter(Boolean),
      rootCauseIdentified,
      appliedSolution,
      postFixVerification,
      retestPassed,
      preventativeMeasures,
    };

    const retestLogs: PingTestLog[] = [
      {
        targetIp: currentScenario.wrongConfig.correctValue,
        targetDevice: currentScenario.affectedDevice,
        packetsSent: 4,
        packetsReceived: retestPassed ? 4 : 0,
        packetLossPercent: retestPassed ? 0 : 100,
        avgLatencyMs: retestPassed ? 1.1 : 0,
        status: retestPassed ? 'SUCCESS' : 'UNREACHABLE',
      },
    ];

    const payload: Station3TroubleshootingPayload = {
      selectedFaultScenario: currentScenario,
      faultLog,
      evidenceToolsUsed: {
        ipConfigChecked,
        pingVerified,
        arpTableChecked,
        poeLoadChecked,
      },
      retestLogs,
      retestPassed,
      score: totalScore,
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
              3
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Station 3: การแก้ไขปัญหาเครือข่ายอย่างเป็นลำดับขั้น (Systematic Troubleshooting)
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  30 คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evidence Collection, Root-Cause Analysis, Fault Log & Retest Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">คะแนนสถานี 3</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{totalScore}/30</span>
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

        {/* Scenario Picker Bar */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">เลือกโจทย์ปัญหา:</span>
          {FAULT_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.faultId}
              type="button"
              onClick={() => setSelectedScenarioIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedScenarioIdx === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sc.titleTh.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Scenario Box */}
          <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                สถานการณ์ปัญหา: {currentScenario.titleTh}
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                อุปกรณ์: {currentScenario.affectedDevice}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentScenario.symptomTh}
            </p>
          </div>

          {/* Evidence Tools Checkboxes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
              1. เครื่องมือตรวจสอบและรวบรวมหลักฐานก่อนแก้ไข (Evidence Collection):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ipConfigChecked}
                  onChange={(e) => setIpConfigChecked(e.target.checked)}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <span>IP Configuration</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pingVerified}
                  onChange={(e) => setPingVerified(e.target.checked)}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <span>Ping Test ICMP</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={arpTableChecked}
                  onChange={(e) => setArpTableChecked(e.target.checked)}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <span>ARP Table Scan</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={poeLoadChecked}
                  onChange={(e) => setPoeLoadChecked(e.target.checked)}
                  className="rounded text-indigo-500 w-4 h-4"
                />
                <span>PoE Load Meter</span>
              </label>
            </div>
          </div>

          {/* Keyword Match Bar */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300 font-semibold">
                คำสำคัญทางวิศวกรรมที่ตรวจพบ ({matchedKeywords.length}/{FAULT_KEYWORDS.length}):
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                คะแนนคำสำคัญ: {Math.round(kwRatio * 4)}/4
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FAULT_KEYWORDS.map((kw) => {
                const isFound = matchedKeywords.includes(kw.label);
                return (
                  <span
                    key={kw.key}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border transition-all ${
                      isFound
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isFound ? '✓ ' : ''}
                    {kw.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Fault Log Form */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 block">
                1. รายละเอียดอาการปัญหาที่พบ (Problem Description):
              </label>
              <textarea
                rows={2}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                placeholder="อธิบายอาการที่สังเกตพบ เช่น ภาพขาดหาย ข้อความแจ้งเตือน..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 block">
                2. การระบุสาเหตุที่แท้จริง (Root-Cause Analysis):
              </label>
              <textarea
                rows={2}
                value={rootCauseIdentified}
                onChange={(e) => setRootCauseIdentified(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                placeholder="วิเคราะห์สาเหตุที่ทำให้เกิดความผิดพลาด..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 block">
                3. วิธีการแก้ไขปัญหาเชิงช่าง (Applied Solution & Configuration):
              </label>
              <textarea
                rows={2}
                value={appliedSolution}
                onChange={(e) => setAppliedSolution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                placeholder="ระบุค่าที่ปรับเปลี่ยนและขั้นตอนการแก้ไขอย่างเป็นลำดับ..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 block">
                4. การตรวจสอบยืนยันหลังแก้ไข (Post-Fix Verification):
              </label>
              <textarea
                rows={2}
                value={postFixVerification}
                onChange={(e) => setPostFixVerification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                placeholder="ผลการ Ping ตรวจสอบสถานะการเชื่อมต่อ และการแสดงภาพสด..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 block">
                5. มาตรการป้องกันไม่ให้เกิดปัญหาซ้ำ (Preventative Measures):
              </label>
              <textarea
                rows={2}
                value={preventativeMeasures}
                onChange={(e) => setPreventativeMeasures(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                placeholder="ระบุแนวทางป้องกันระยะยาวและการจัดทำตาราง IP Address..."
              />
            </div>
          </div>

          {/* Retest Passed Checkbox */}
          <div className="p-4 bg-slate-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={retestPassed}
                onChange={(e) => setRetestPassed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span>
                ทำการทดสอบซ้ำ <strong>(Retest Ping 4/4 Loss 0%)</strong> จาก NVR ไปยังอุปกรณ์ปลายทางและภาพสดกลับมา Online สมบูรณ์
              </span>
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {retestPassed ? '✓ Retest Passed' : '⚠ ยังไม่ Retest'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            สถานะ: <strong className="text-indigo-400 font-mono">Station 3 (30%)</strong> ·
            บันทึก Fault Log ครบถ้วน
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
              <span>💾 บันทึก Fault Log</span>
              <span className="font-mono">({totalScore}/30)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
