'use client';

import React, { useState, useMemo } from 'react';
import { Station3MaintenancePayload } from '../../../shared/domain/room107Types';

interface Room107MaintenanceStationModalProps {
  initialPayload?: Station3MaintenancePayload;
  onSave: (payload: Station3MaintenancePayload) => void;
  onClose: () => void;
}

export const Room107MaintenanceStationModal: React.FC<Room107MaintenanceStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  // Lens Inspection & Cleaning State
  const [lensCleanDone, setLensCleanDone] = useState<boolean>(
    Boolean(initialPayload?.lensInspection?.cleanDone || initialPayload?.isCompleted)
  );
  const [moistureChecked, setMoistureChecked] = useState<boolean>(
    Boolean(initialPayload?.lensInspection?.moistureChecked || initialPayload?.isCompleted)
  );
  const [focusCalibrated, setFocusCalibrated] = useState<boolean>(
    Boolean(initialPayload?.lensInspection?.focusCalibrated || initialPayload?.isCompleted)
  );
  const [waterproofGasketInspected, setWaterproofGasketInspected] = useState<boolean>(
    Boolean(initialPayload?.lensInspection?.waterproofGasketInspected || initialPayload?.isCompleted)
  );

  // PM Checklist State (5 items)
  const [pmChecklist, setPmChecklist] = useState({
    powerMeasured: Boolean(initialPayload?.pmChecklist?.powerMeasured ?? true),
    connectorSealed: Boolean(initialPayload?.pmChecklist?.connectorSealed ?? true),
    cameraCleaned: Boolean(initialPayload?.pmChecklist?.cameraCleaned ?? lensCleanDone),
    nvrFirmwareChecked: Boolean(initialPayload?.pmChecklist?.nvrFirmwareChecked ?? true),
    recordingLogVerified: Boolean(initialPayload?.pmChecklist?.recordingLogVerified ?? true),
  });

  // Fault Log & Service Report
  const [faultLog, setFaultLog] = useState({
    problemDescription:
      initialPayload?.faultLog?.problemDescription ||
      'CAM-03 ภาพไม่ขึ้น (NO VIDEO) และพบคลื่นลายเลื่อนในแนวนอน (Hum Bars 50Hz)',
    possibleCause:
      initialPayload?.faultLog?.possibleCause ||
      'แรงดันตกปลายสายเหลือ 42.5V จากระยะสาย Cat5e 110ม. และความต่างศักย์กราวด์ 2.4VAC',
    testPerformed:
      initialPayload?.faultLog?.testPerformed ||
      'ใช้ Multimeter วัดแรงดัน PoE และใช้ CCTV Tester ตรวจรูปคลื่นสัญญาณรบกวน',
    solutionApplied:
      initialPayload?.faultLog?.solutionApplied ||
      'ติดตั้ง PoE Extender ทวนกำลังไฟ และใส่ Ground Loop Isolator ตัดวงจรกราวด์',
    retestPassed:
      initialPayload?.faultLog?.retestPassed ?? true,
    preventiveAction:
      initialPayload?.faultLog?.preventiveAction ||
      'กำหนดมาตรฐานใช้สาย Cat6 แกนทองแดงแท้ 23AWG และติดตั้ง Isolator ทุกจุดติดตั้งเสาไฟโลหะภายนอก',
  });

  const [technicianName, setTechnicianName] = useState<string>(
    initialPayload?.technicianName || 'นายช่างเทคนิค CCTV'
  );
  const [pmChecklistSigned, setPmChecklistSigned] = useState<boolean>(
    Boolean(initialPayload?.pmChecklistSigned || initialPayload?.isCompleted)
  );
  const [customerAcknowledged] = useState<boolean>(
    Boolean(initialPayload?.customerAcknowledged ?? true)
  );

  // Toggle checklist helper
  const togglePmItem = (key: keyof typeof pmChecklist) => {
    setPmChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Scoring rubric (40 pts max):
  // 1. Lens inspection & cleaning procedure: 20 pts
  // 2. 5-point PM Checklist & Service Report sign-off: 20 pts
  const { totalScore } = useMemo(() => {
    let sLens = 0;
    if (lensCleanDone && moistureChecked && focusCalibrated && waterproofGasketInspected) {
      sLens = 20;
    } else {
      sLens = [lensCleanDone, moistureChecked, focusCalibrated, waterproofGasketInspected].filter(Boolean).length * 5;
    }

    let sPm = 0;
    const pmCount = Object.values(pmChecklist).filter(Boolean).length;
    if (pmCount === 5 && pmChecklistSigned) {
      sPm = 20;
    } else if (pmCount >= 3 && pmChecklistSigned) {
      sPm = 15;
    } else {
      sPm = pmCount * 2;
    }

    return {
      scoreBreakdown: { sLens, sPm },
      totalScore: Math.min(40, sLens + sPm),
    };
  }, [lensCleanDone, moistureChecked, focusCalibrated, waterproofGasketInspected, pmChecklist, pmChecklistSigned]);

  const handleSaveAndSubmit = () => {
    const payload: Station3MaintenancePayload = {
      lensInspection: {
        cleanDone: lensCleanDone,
        moistureChecked,
        focusCalibrated,
        waterproofGasketInspected,
      },
      pmChecklist,
      faultLog,
      pmChecklistSigned,
      technicianName,
      customerAcknowledged,
      score: totalScore,
      isCompleted: totalScore >= 30 && lensCleanDone && pmChecklistSigned,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xl shadow-inner">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Room 107 · Station 3
                </span>
                <span className="text-[11px] font-mono text-slate-400">Preventive Maintenance &amp; Service Report</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                การบำรุงรักษาเชิงป้องกัน (PM) และรายงานการซ่อมบำรุง
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-slate-200">
          
          {/* 1. Lens & Housing Inspection */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🔍 1. การตรวจสภาพเลนส์ ไอน้ำ และซีลยางกันน้ำ (Lens Inspection)</span>
              </h3>
              <span className="text-[10px] text-sky-400 font-mono">20 / 20 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lensCleanDone}
                  onChange={(e) => {
                    setLensCleanDone(e.target.checked);
                    setPmChecklist((p) => ({ ...p, cameraCleaned: e.target.checked }));
                  }}
                  className="mt-1"
                />
                <div>
                  <strong className="text-emerald-300 block">ทำความสะอาดหน้าเลนส์และกระจกโดม</strong>
                  <span className="text-[10px] text-slate-400">
                    ใช้ผ้าไมโครไฟเบอร์ร่วมกับน้ำยาเช็ดเลนส์ออปติก ขจัดคราบฝุ่น คราบน้ำมัน และละอองเกสร
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moistureChecked}
                  onChange={(e) => setMoistureChecked(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <strong className="text-emerald-300 block">ตรวจคราบไอน้ำ &amp; เปลี่ยนซองซิลิกาเจล</strong>
                  <span className="text-[10px] text-slate-400">
                    ตรวจภายในกระเปาะกล้องว่าไม่มีละอองไอน้ำเกาะ และเปลี่ยนซองดูดความชื้น (Silica Gel) ชุดใหม่
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={focusCalibrated}
                  onChange={(e) => setFocusCalibrated(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <strong className="text-emerald-300 block">ตรวจระยะโฟกัสและมุมมองภาพ (Focus / FOV)</strong>
                  <span className="text-[10px] text-slate-400">
                    ตรวจสอบภาพคมชัดทั้งเวลากลางวันและกลางคืน (IR Cut Filter ทำงานสมบูรณ์)
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterproofGasketInspected}
                  onChange={(e) => setWaterproofGasketInspected(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <strong className="text-emerald-300 block">ตรวจซีลยางกันน้ำและเคเบิลแกลนด์ (IP67 Gasket)</strong>
                  <span className="text-[10px] text-slate-400">
                    ซีลยางขอบตัวเรือนไม่เปื่อยฉีกขาด และขันเกลียว Waterproof Cable Gland แน่นสนิท
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. 5-Point Preventive Maintenance Checklist */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>📋 2. แบบตรวจสอบบำรุงรักษาเชิงป้องกัน 5 รายการ (PM Checklist)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">10 / 10 คะแนน</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'powerMeasured' as const,
                  title: '1. ตรวจวัดแรงดันไฟฟ้าและ PoE Output ทุกตัวกล้อง',
                  desc: 'วัดแรงดันปลายสายได้ 48.0V - 54.0V ตามพิกัดมาตรฐาน',
                },
                {
                  key: 'connectorSealed' as const,
                  title: '2. ตรวจสอบขั้วต่อสาย RJ45 / BNC และกล่องพักสายกันน้ำ',
                  desc: 'ไม่มีสนิมเขียว ไม่มีมด/แมลงเข้าไปทำรัง และซีลยางกันน้ำสมบูรณ์',
                },
                {
                  key: 'cameraCleaned' as const,
                  title: '3. ทำความสะอาดเลนส์ Housing และปรับมุมมองกล้องให้ครอบคลุม',
                  desc: 'ภาพคมชัด ไม่มีคราบฝุ่นหรือไอน้ำบดบังจุดสำคัญ',
                },
                {
                  key: 'nvrFirmwareChecked' as const,
                  title: '4. ตรวจสุขภาพฮาร์ดดิสก์ NVR S.M.A.R.T. และอุณหภูมิตู้แร็ค',
                  desc: 'HDD Health Status: Good 100%, อุณหภูมิตู้ไม่เกิน 35°C',
                },
                {
                  key: 'recordingLogVerified' as const,
                  title: '5. ตรวจสอบประวัติการบันทึกย้อนหลัง (Recording Integrity)',
                  desc: 'ไฟล์บันทึกต่อเนื่อง 24/7 ไม่มีการขาดช่วง ไทม์สแตมป์ตรงกับเวลาจริง',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => togglePmItem(item.key)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    pmChecklist[item.key]
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{pmChecklist[item.key] ? '☑' : '☐'}</span>
                    <div>
                      <strong className="text-xs block">{item.title}</strong>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold">
                    {pmChecklist[item.key] ? 'PASS' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Fault Log & Service Report */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span>📄 3. ใบรายงานผลการซ่อมบำรุงและประวัติปัญหา (Service Report)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">10 / 10 คะแนน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="space-y-1">
                <label className="text-slate-400 block">อาการที่พบ (Problem Description):</label>
                <input
                  type="text"
                  value={faultLog.problemDescription}
                  onChange={(e) => setFaultLog({ ...faultLog, problemDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">สาเหตุหลัก (Root Cause Analysis):</label>
                <input
                  type="text"
                  value={faultLog.possibleCause}
                  onChange={(e) => setFaultLog({ ...faultLog, possibleCause: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">การแก้ไข (Action Taken):</label>
                <input
                  type="text"
                  value={faultLog.solutionApplied}
                  onChange={(e) => setFaultLog({ ...faultLog, solutionApplied: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">มาตรการป้องกันซ้ำ (Preventive Action):</label>
                <input
                  type="text"
                  value={faultLog.preventiveAction}
                  onChange={(e) => setFaultLog({ ...faultLog, preventiveAction: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            {/* Digital Sign-off Section */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="ชื่อช่างเทคนิคผู้ตรวจ"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 w-48 font-semibold"
                />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pmChecklistSigned}
                    onChange={(e) => setPmChecklistSigned(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span className="font-bold text-emerald-400 text-xs">
                    ✍️ เซ็นชื่อรับรองรายงาน PM Checklist
                  </span>
                </label>
              </div>

              <span className="text-[10px] text-slate-400">
                สถานะผล Retest: <strong className="text-emerald-400">PASS (100%)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          <div className="text-[11px] text-slate-400">
            Mandatory Checks: ต้องตรวจเลนส์ และเซ็นชื่อรับรอง PM Checklist
          </div>
          <button
            type="button"
            onClick={handleSaveAndSubmit}
            disabled={!lensCleanDone || !pmChecklistSigned}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            บันทึกผล Station 3 ({totalScore}/40 คะแนน)
          </button>
        </div>
      </div>
    </div>
  );
};
