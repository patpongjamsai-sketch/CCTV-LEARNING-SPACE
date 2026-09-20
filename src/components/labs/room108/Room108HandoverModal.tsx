'use client';

import React, { useState, useMemo } from 'react';
import { Station3HandoverPayload } from '../../../shared/domain/room108Types';

interface Room108HandoverModalProps {
  initialPayload?: Partial<Station3HandoverPayload>;
  onSave: (payload: Station3HandoverPayload) => void;
  onClose: () => void;
}

const DEFAULT_TRAINING_TOPICS = [
  '1. การเปิดดูภาพสด Multi-split และการจัดกลุ่มกล้องบนหน้าจอ',
  '2. การค้นหาย้อนหลัง (Playback) และการ Export ไฟล์หลักฐานลง USB',
  '3. การใช้งาน Mobile Application ดูกล้องระยะไกลผ่าน Cloud P2P',
  '4. ข้อปฏิบัติความปลอดภัยและการติดต่อฝ่ายช่างเมื่อเกิดเหตุขัดข้อง',
];

export const Room108HandoverModal: React.FC<Room108HandoverModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [asBuiltAttached, setAsBuiltAttached] = useState<boolean>(
    initialPayload?.asBuiltDocumentationAttached ?? true
  );
  const [userTrainingCompleted, setUserTrainingCompleted] = useState<boolean>(
    initialPayload?.userTrainingCompleted ?? true
  );
  const [punchListResolved, setPunchListResolved] = useState<boolean>(
    initialPayload?.punchListResolved ?? true
  );

  const [leadTechnicianName, setLeadTechnicianName] = useState<string>(
    initialPayload?.leadTechnicianName || 'นายช่างผู้รับผิดชอบโครงการ CCTV'
  );
  const [customerRepresentativeName, setCustomerRepresentativeName] = useState<string>(
    initialPayload?.customerRepresentativeName || 'คุณสมศักดิ์ ผู้จัดการสาขา Smart Mart'
  );
  const [warrantyYears, setWarrantyYears] = useState<number>(
    initialPayload?.warrantyPeriodYears ?? 2
  );

  const [handoverCertificateSigned, setHandoverCertificateSigned] = useState<boolean>(
    initialPayload?.handoverCertificateSigned ?? false
  );

  const [projectDefenseSummary, setProjectDefenseSummary] = useState<string>(
    initialPayload?.projectDefenseSummary ||
      'ระบบ CCTV Smart Mart 8 กล้อง ได้รับการติดตั้งตามมาตรฐานวิชาชีพ มีการสำรองไฟ UPS 25 นาที บันทึกย้อนหลัง 30 วันเต็มด้วย Surveillance HDD และผ่านการฝึกอบรมผู้ใช้งานครบถ้วนทุกข้อ'
  );

  // Scoring rubric (25 pts max):
  // 1. M4: Handover Certificate Signed: 15 pts
  // 2. M5: User Training, As-Built & Project Defense: 10 pts
  const { scoreBreakdown, totalScore } = useMemo(() => {
    let sM4 = 0;
    let sM5 = 0;

    if (handoverCertificateSigned) sM4 = 15;

    if (asBuiltAttached && userTrainingCompleted && punchListResolved) sM5 = 10;
    else if (userTrainingCompleted || asBuiltAttached) sM5 = 6;

    return {
      scoreBreakdown: {
        handoverCertification: sM4,
        projectGovernance: sM5,
      },
      totalScore: sM4 + sM5,
    };
  }, [handoverCertificateSigned, asBuiltAttached, userTrainingCompleted, punchListResolved]);

  const handleSaveAndSubmit = () => {
    const payload: Station3HandoverPayload = {
      asBuiltDocumentationAttached: asBuiltAttached,
      ipAddressSchemeSummary: 'Gateway: 192.168.1.1, NVR: 192.168.1.200, Switch: 192.168.1.254, Cams: .101-.108',
      userTrainingCompleted,
      trainingTopics: DEFAULT_TRAINING_TOPICS,
      punchListItemsCount: 0,
      punchListResolved,
      warrantyPeriodYears: warrantyYears,
      customerRepresentativeName,
      leadTechnicianName,
      handoverCertificateSigned,
      handoverSignedDate: new Date().toLocaleDateString('th-TH'),
      projectDefenseSummary,
      score: totalScore,
      isCompleted: totalScore >= 20 && handoverCertificateSigned,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xl shadow-inner">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Room 108 · Station 3
                </span>
                <span className="text-[11px] font-mono text-slate-400">Handover, Training &amp; Project Governance</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Station 3: การส่งมอบโครงการ, การฝึกอบรมผู้ใช้งาน และการลงนามรับรอง
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-xs text-slate-400">คะแนนสถานี: </span>
              <span className="text-lg font-bold text-emerald-400">{totalScore}</span>
              <span className="text-xs text-slate-500"> / 25</span>
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
          
          {/* Top Row: As-Built & User Training Record */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: As-Built & Documentation Package */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>📁 เอกสาร As-Built และคู่มือระบบ (Documentation Package)</span>
                <span className="text-[10px] text-slate-400">Project Dossier</span>
              </h3>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">ผังวงจรและแบบ As-Built (Wiring):</span>
                  <button
                    type="button"
                    onClick={() => setAsBuiltAttached(!asBuiltAttached)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      asBuiltAttached ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {asBuiltAttached ? '✓ แนบเอกสารแล้ว' : 'ยังไม่แนบ'}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">ตาราง IP Address &amp; พอร์ต:</span>
                  <span className="text-emerald-400 font-bold">192.168.1.101 - .108</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">การรับประกันอุปกรณ์ (Warranty):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setWarrantyYears(1)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        warrantyYears === 1 ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      1 ปี
                    </button>
                    <button
                      type="button"
                      onClick={() => setWarrantyYears(2)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        warrantyYears === 2 ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      2 ปี (มาตรฐาน)
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">รายการตรวจแก้ (Punch List):</span>
                  <button
                    type="button"
                    onClick={() => setPunchListResolved(!punchListResolved)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      punchListResolved ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {punchListResolved ? '✓ แก้ไขครบ 100% (0 Defects)' : 'มีรายการค้าง'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: User Training Curriculum */}
            <div className="space-y-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200">👥 บันทึกการฝึกอบรมผู้ใช้งาน (User Training Record)</h3>
                  <span className="text-[10px] font-mono text-sky-400">4 หัวข้อหลัก</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  {DEFAULT_TRAINING_TOPICS.map((topic, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setUserTrainingCompleted(!userTrainingCompleted)}
                  className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                    userTrainingCompleted
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {userTrainingCompleted ? '✓ ผ่านการฝึกอบรมผู้ใช้งานเรียบร้อย' : 'กดเพื่อบันทึกการฝึกอบรม'}
                </button>
              </div>
            </div>
          </div>

          {/* Formal Digital Handover Certificate */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  FORMAL SYSTEM ACCEPTANCE
                </span>
                <h3 className="text-base font-bold text-white">
                  ใบส่งมอบระบบกล้องวงจรปิดอย่างเป็นทางการ (Digital Handover Certificate)
                </h3>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                เอกสารเลขที่: <span className="text-slate-200 font-bold">CCTV-ACT-2026-088</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              ขอรับรองว่าระบบกล้องวงจรปิดจำนวน 8 จุด พร้อมระบบบันทึก 4K NVR และอุปกรณ์ระบบไฟฟ้าสำรอง UPS ตามโครงการ 
              <strong> Smart Mart Integrated CCTV System</strong> ได้รับการติดตั้ง ตรวจสอบคุณภาพ และทดสอบการทำงาน
              (Commissioning) ครบถ้วนตามมาตรฐานวิชาชีพทุกประการ
            </p>

            {/* Signature Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono">หัวหน้าช่างผู้ส่งมอบ (Lead Technician):</label>
                <input
                  type="text"
                  value={leadTechnicianName}
                  onChange={(e) => setLeadTechnicianName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono">ตัวแทนผู้ว่าจ้าง/ผู้ตรวจรับ (Client Signee):</label>
                <input
                  type="text"
                  value={customerRepresentativeName}
                  onChange={(e) => setCustomerRepresentativeName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Final Sign Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">
                สถานะลายเซ็น: {handoverCertificateSigned ? (
                  <strong className="text-emerald-400">✓ SIGNED &amp; SEALED</strong>
                ) : (
                  <strong className="text-amber-400">WAITING FOR SIGNATURE</strong>
                )}
              </div>

              <button
                type="button"
                onClick={() => setHandoverCertificateSigned(!handoverCertificateSigned)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  handoverCertificateSigned
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg'
                }`}
              >
                {handoverCertificateSigned ? '✓ ลงนามส่งมอบเรียบร้อยแล้ว' : '✍️ ลงนามในใบส่งมอบระบบ (Sign Handover)'}
              </button>
            </div>
          </div>

          {/* Capstone Project Defense Reflection */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
            <h3 className="font-bold text-slate-200 flex items-center justify-between">
              <span>🎤 สรุปการนำเสนอและป้องกันโครงงาน (Project Defense Statement)</span>
              <span className="text-[10px] text-slate-400">ส่งต่อ Teacher Dashboard</span>
            </h3>
            <textarea
              rows={2}
              value={projectDefenseSummary}
              onChange={(e) => setProjectDefenseSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Score Breakdown Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-slate-400">M4: Handover Certificate Signed</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.handoverCertification} / 15</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">M5: Project Governance &amp; Quality Record</span>
                <span className="font-bold text-slate-200">{scoreBreakdown.projectGovernance} / 10</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400">รวมคะแนน Station 3: </span>
                <strong className="text-emerald-400 text-base">{totalScore}</strong>
                <span className="text-slate-500"> / 25</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {handoverCertificateSigned && totalScore >= 20 ? (
              <span className="text-emerald-400 font-semibold">✓ เอกสารส่งมอบและหลักฐานโครงงานครบถ้วนสมบูรณ์</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠️ ต้องทำการลงนามในใบส่งมอบเพื่อเสร็จสิ้นกระบวนการ</span>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลการส่งมอบ Station 3
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
