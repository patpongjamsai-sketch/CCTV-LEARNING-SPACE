'use client';

import React, { useState, useMemo } from 'react';
import {
  ROOM108_CAPSTONE_BOM_CATALOG,
  CapstoneBomItem,
  Station1ProjectPlanningPayload,
} from '../../../shared/domain/room108Types';

interface Room108ProjectPlanningModalProps {
  initialPayload?: Partial<Station1ProjectPlanningPayload>;
  onSave: (payload: Station1ProjectPlanningPayload) => void;
  onClose: () => void;
}

const DEFAULT_ZONES = [
  { zoneId: 'Z1', zoneNameTh: 'ทางเข้าหลัก (Main Entrance)', cameraType: '4K Dome', targetResolution: '3840x2160' },
  { zoneId: 'Z2', zoneNameTh: 'เคาน์เตอร์แคชเชียร์ (Cashier)', cameraType: '4K Dome (Audio)', targetResolution: '3840x2160' },
  { zoneId: 'Z3', zoneNameTh: 'โถงทางเดินกลาง 1 (Aisle 1)', cameraType: '2K Bullet IR', targetResolution: '2560x1440' },
  { zoneId: 'Z4', zoneNameTh: 'โถงทางเดินกลาง 2 (Aisle 2)', cameraType: '2K Bullet IR', targetResolution: '2560x1440' },
  { zoneId: 'Z5', zoneNameTh: 'คลังสินค้า (Warehouse)', cameraType: '2K Bullet IR', targetResolution: '2560x1440' },
  { zoneId: 'Z6', zoneNameTh: 'ลานจอดรถ (Parking Area)', cameraType: 'PTZ Speed Dome', targetResolution: '1920x1080' },
  { zoneId: 'Z7', zoneNameTh: 'จุดโหลดสินค้า (Loading Dock)', cameraType: '2K Bullet IR', targetResolution: '2560x1440' },
  { zoneId: 'Z8', zoneNameTh: 'ทางหนีไฟ ชั้น 2 (Exit Floor 2)', cameraType: '4K Dome', targetResolution: '3840x2160' },
];

export const Room108ProjectPlanningModal: React.FC<Room108ProjectPlanningModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [projectName] = useState<string>(
    initialPayload?.projectName || 'โครงการติดตั้งระบบกล้องวงจรปิดอัจฉริยะ Smart Mart'
  );
  const [customerName] = useState<string>(
    initialPayload?.customerName || 'บริษัท สมาร์ท มาร์ท รีเทล จำกัด'
  );
  const [siteLocation] = useState<string>(
    initialPayload?.siteLocation || 'ห้างสรรพสินค้า Smart Mart สาขาใหญ่ (2 ชั้น)'
  );
  const [cameraCount] = useState<number>(initialPayload?.cameraCount ?? 8);
  const [floorPlanCoverageChecked, setFloorPlanCoverageChecked] = useState<boolean>(
    initialPayload?.floorPlanCoverageChecked ?? true
  );

  const [bomItems, setBomItems] = useState<CapstoneBomItem[]>(
    initialPayload?.bomItems || ROOM108_CAPSTONE_BOM_CATALOG
  );

  const [bomApproved, setBomApproved] = useState<boolean>(
    initialPayload?.bomApproved ?? false
  );

  const [compatibilityNotes, setCompatibilityNotes] = useState<string>(
    initialPayload?.compatibilityNotes ||
      'ระบบกล้อง 8 ตัว รวมโหลด PoE 64W รองรับได้สบายบน PoE Switch 120W, แบนด์วิดท์เข้า 32 Mbps ต่ำกว่าขีดจำกัด NVR 80 Mbps, ความจุ 8TB เพียงพอต่อ 30 วัน (~7.72 TB) และ UPS 1000VA สำรองไฟได้นาน 25 นาที'
  );

  // Total budget calculation
  const totalBudget = useMemo(() => {
    return bomItems.reduce((acc, item) => acc + item.totalPriceThb, 0);
  }, [bomItems]);

  // Scoring rubric (20 pts max):
  // 1. All 7 items verified with zero missing items: 10 pts
  // 2. Compatibility verified (Power, Bandwidth, Storage, UPS): 5 pts
  // 3. BOM approved & Reasoning: 5 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    const verifiedCount = bomItems.filter((i) => i.status === 'VERIFIED').length;
    let sBom = 0;
    let sCompat = 0;
    let sApprove = 0;

    if (verifiedCount >= 7) sBom = 10;
    else if (verifiedCount >= 5) sBom = 6;

    if (floorPlanCoverageChecked && compatibilityNotes.length >= 30) sCompat = 5;
    else if (floorPlanCoverageChecked) sCompat = 3;

    if (bomApproved) sApprove = 5;

    return {
      scoreBreakdown: {
        bomCompleteness: sBom,
        compatibilityCheck: sCompat,
        bomApproval: sApprove,
      },
      totalScore: sBom + sCompat + sApprove,
    };
  }, [bomItems, floorPlanCoverageChecked, compatibilityNotes, bomApproved]);

  const handleToggleItemStatus = (id: string) => {
    setBomItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'VERIFIED' ? 'MISSING' : 'VERIFIED';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleSaveAndSubmit = () => {
    const payload: Station1ProjectPlanningPayload = {
      projectName,
      customerName,
      siteLocation,
      customerRequirementBrief:
        'ติดตั้งระบบ CCTV แบบรวมศูนย์ 8 ช่องสัญญาณ พร้อมระบบสำรองไฟ UPS และการเข้าถึงระยะไกล 24/7',
      cameraCount,
      floorPlanCoverageChecked,
      floorPlanZones: DEFAULT_ZONES,
      bomItems,
      totalEstimatedBudgetThb: totalBudget,
      compatibilityNotes,
      bomApproved,
      score: totalScore,
      isCompleted: totalScore >= 16 && bomApproved,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xl shadow-inner">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Room 108 · Station 1
                </span>
                <span className="text-[11px] font-mono text-slate-400">Unit 8: Integrated Capstone Project</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 1: Customer Needs, Site Survey, Floor Plan &amp; BOM Review
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400">คะแนนสถานี: </span>
              <span className="text-lg font-bold text-emerald-400">{totalScore}</span>
              <span className="text-xs text-slate-500"> / 20</span>
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
          
          {/* Project Brief Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                <span>📑 ข้อมูลสรุปความต้องการโครงการ (Customer Requirement Brief)</span>
              </h3>
              <span className="text-[11px] bg-amber-900/60 px-2.5 py-0.5 rounded-full text-amber-200 border border-amber-600 font-mono font-bold">
                CAPSTONE ENTERPRISE
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">โครงการ / ลูกค้า</span>
                <strong className="text-slate-100">{projectName}</strong>
                <div className="text-[10px] text-slate-400">{customerName}</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">สถานที่ติดตั้ง</span>
                <strong className="text-slate-100">{siteLocation}</strong>
                <div className="text-[10px] text-sky-400">พื้นที่พาณิชย์ 2 ชั้น (8 โซนเสี่ยง)</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">เป้าหมายความจุ &amp; สัญญา</span>
                <strong className="text-emerald-400">8 Channels · บันทึก 30 วัน</strong>
                <div className="text-[10px] text-slate-400">UPS สำรองไฟ + Remote View</div>
              </div>
            </div>
          </div>

          {/* Floor Plan & Camera Coverage Inspection */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🗺️ ผังการวางตำแหน่งกล้องทั้ง 8 จุด (Floor Plan &amp; FOV Coverage)</span>
              </h3>
              <button
                type="button"
                onClick={() => setFloorPlanCoverageChecked(!floorPlanCoverageChecked)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                  floorPlanCoverageChecked
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}
              >
                {floorPlanCoverageChecked ? '✓ ตรวจมุมมองครอบคลุมแล้ว' : 'กดเพื่อตรวจ FOV ผังอาคาร'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_ZONES.map((zone) => (
                <div
                  key={zone.zoneId}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{zone.zoneId}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">
                      {zone.cameraType}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-200 font-sans font-medium truncate">
                    {zone.zoneNameTh}
                  </div>
                  <div className="text-[9px] text-slate-400">Res: {zone.targetResolution}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill of Materials (BOM) Table */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-slate-200">📦 บัญชีรายการวัสดุและอุปกรณ์ (Bill of Materials - BOM)</h3>
                <div className="text-[10px] text-slate-400">คลิกที่สถานะเพื่อตรวจสอบความพร้อมของอุปกรณ์ในคลัง</div>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-400 text-[10px]">ประมาณการงบรวม: </span>
                <strong className="text-amber-400 text-sm">{totalBudget.toLocaleString()} บาท</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="py-2 px-2">ลำดับ</th>
                    <th className="py-2 px-2">รายการ / อุปกรณ์</th>
                    <th className="py-2 px-2">จำนวน</th>
                    <th className="py-2 px-2">ราคา/หน่วย</th>
                    <th className="py-2 px-2">ราคารวม</th>
                    <th className="py-2 px-2 text-center">สถานะตรวจรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bomItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-sans font-medium text-slate-100">{item.item}</div>
                        <div className="text-[9px] text-slate-400">{item.specSummary}</div>
                      </td>
                      <td className="py-2 px-2 text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-2 text-slate-400">{item.unitPriceThb.toLocaleString()} ฿</td>
                      <td className="py-2 px-2 font-bold text-amber-300">{item.totalPriceThb.toLocaleString()} ฿</td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleItemStatus(item.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            item.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          }`}
                        >
                          {item.status === 'VERIFIED' ? '✓ VERIFIED' : '✗ MISSING'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Compatibility & Approval */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>⚡ การตรวจสอบความเข้ากันได้และการอนุมัติ BOM (Compatibility &amp; Sign-off)</span>
              <span className="text-[10px] text-slate-400">Power, Bandwidth, Storage &amp; UPS</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">PoE Budget</span>
                <span className="text-emerald-400 font-bold">64W / 120W (OK)</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Incoming Bitrate</span>
                <span className="text-emerald-400 font-bold">32 / 80 Mbps (OK)</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Storage 30 Days</span>
                <span className="text-emerald-400 font-bold">7.72 / 8.0 TB (OK)</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">UPS Autonomy</span>
                <span className="text-emerald-400 font-bold">~25 mins (OK)</span>
              </div>
            </div>

            <textarea
              rows={2}
              value={compatibilityNotes}
              onChange={(e) => setCompatibilityNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-amber-500 outline-none leading-relaxed"
            />

            {/* Approval Toggle */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100">อนุมัติเอกสาร BOM โครงการ (BOM Approval)</div>
                <div className="text-[10px] text-slate-400">
                  ยืนยันว่ารายการอุปกรณ์ครบถ้วน ถูกต้องตามสเปก และอยู่ในงบประมาณ
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBomApproved(!bomApproved)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  bomApproved
                    ? 'border-emerald-500 bg-emerald-950 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-amber-500 hover:text-white'
                }`}
              >
                {bomApproved ? '✓ อนุมัติ BOM แล้ว (Approved)' : 'กดเพื่ออนุมัติ BOM'}
              </button>
            </div>
          </div>

          {/* Score Breakdown Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">ตรวจรับ BOM ครบ</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.bomCompleteness} / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">ความเข้ากันได้ระบบ</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.compatibilityCheck} / 5</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">อนุมัติ BOM</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.bomApproval} / 5</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 1: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 20</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {bomApproved && totalScore >= 16 ? (
              <span className="text-emerald-400 font-semibold">✓ รายการ BOM ผ่านการอนุมัติเรียบร้อย</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ กรุณาตรวจสอบรายการให้ครบถ้วนและกดอนุมัติ BOM</span>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลการวางแผน Station 1
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
