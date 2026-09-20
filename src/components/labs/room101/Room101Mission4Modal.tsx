'use client';

import React from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { ConceptId } from '../../../shared/domain/roleplayTypes';

interface Room101Mission4ModalProps {
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const COMPARISON_CARDS: { id: ConceptId; nameTh: string; desc: string; expected: 'ANALOG' | 'IP'; icon: string }[] = [
  { id: 'CARD_COAXIAL', nameTh: 'สายสัญญาณ Coaxial (RG6)', desc: 'สายทองแดงแกนเดี่ยว นำสัญญาณคลื่นไฟฟ้าอนาล็อก', expected: 'ANALOG', icon: '〰️' },
  { id: 'CARD_CAT6', nameTh: 'สายคู่บิดเกลียว UTP Cat6', desc: 'สายทองแดง 4 คู่ นำแพ็กเก็ตดิจิทัลกิกะบิตและไฟ PoE', expected: 'IP', icon: '🌐' },
  { id: 'CARD_DVR', nameTh: 'เครื่องบันทึก DVR (Digital Video Recorder)', desc: 'รับสัญญาณอนาล็อกผ่านหัวต่อ BNC และเข้ารหัสในตัว', expected: 'ANALOG', icon: '📼' },
  { id: 'CARD_NVR', nameTh: 'เครื่องบันทึก NVR (Network Video Recorder)', desc: 'รับวิดีโอสตรีมดิจิทัลที่ผ่านการบีบอัดมาจากกล้องทางสาย LAN', expected: 'IP', icon: '💽' },
  { id: 'CARD_POE', nameTh: 'การจ่ายไฟผ่านสายแลน (PoE 802.3af/at)', desc: 'จ่ายไฟ DC 48V ไปพร้อมข้อมูลผ่านสายเส้นเดียว', expected: 'IP', icon: '⚡' },
  { id: 'CARD_IP_ADDRESS', nameTh: 'หมายเลข IP Address ประจำตัวกล้อง', desc: 'ระบุพิกัดเครือข่ายสำหรับสื่อสารผ่าน TCP/IP', expected: 'IP', icon: '🔢' },
  { id: 'CARD_ANALOG_SIGNAL', nameTh: 'สัญญาณรูปคลื่นอนาล็อกต่อเนื่อง (CVBS/AHD)', desc: 'ลดทอนง่ายเมื่อระยะทางไกล ไวต่อสัญญาณรบกวนแม่เหล็กไฟฟ้า', expected: 'ANALOG', icon: '📉' },
  { id: 'CARD_DIGITAL_PACKET', nameTh: 'แพ็กเก็ตข้อมูลดิจิทัล (TCP/UDP Packets)', desc: 'มี Checksum ตรวจสอบความถูกต้อง ไม่สูญเสียคุณภาพตามระยะทาง', expected: 'IP', icon: '📦' },
];

export const Room101Mission4Modal: React.FC<Room101Mission4ModalProps> = ({
  onClose,
  onNext,
  onPrev,
}) => {
  const mission4Cards = useRoleplayStore((s) => s.mission4Cards);
  const placeComparisonCard = useRoleplayStore((s) => s.placeComparisonCard);
  const missionState = useRoleplayStore((s) => s.missions.M4);

  const handleAutoSolve = () => {
    COMPARISON_CARDS.forEach((c) => {
      placeComparisonCard(c.id, c.expected);
    });
  };

  const handleReset = () => {
    useRoleplayStore.setState({
      mission4Cards: { analogCards: [], ipCards: [] },
      missions: {
        ...useRoleplayStore.getState().missions,
        M4: {
          ...useRoleplayStore.getState().missions.M4,
          score: 0,
          isCompleted: false,
          lastFeedbackTh: 'รีเซ็ตการ์ดเปรียบเทียบเรียบร้อย',
        },
      },
    });
    useRoleplayStore.getState().recomputeRubric();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold border border-purple-500/30">
              4
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  ภารกิจที่ 4 · 15 คะแนน
                </span>
                {missionState.isCompleted && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ ผ่านภารกิจแล้ว (≥ 6/8 ข้อ)
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                จำแนกคุณสมบัติ Analog CCTV vs IP CCTV
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-300">
              คะแนน:{' '}
              <strong className="text-emerald-400 font-bold text-sm">
                {missionState.score}
              </strong>
              /15
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Concept Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 text-sm">
              <span>⚖️</span>
              <span>การเปรียบเทียบเทคโนโลยีกล้องวงจรปิดแบบดั้งเดิม vs เครือข่ายดิจิทัล</span>
            </div>
            <p>
              กล้องระบบ Analog เน้นการส่งสัญญาณรูปคลื่นไฟฟ้าผ่านสาย RG6 สู่เครื่องบันทึก DVR และต้องเดินสายไฟเลี้ยงแยกต่างหาก
              ในขณะที่ระบบ IP CCTV ข้อมูลจะวิ่งเป็น Packet ดิจิทัลผ่านสายแลน UTP Cat6 มีระบบ PoE รวมสายไฟเลี้ยงและข้อมูลเข้าด้วยกัน และบันทึกผ่าน NVR
            </p>
          </div>

          {/* Table Comparison Interface */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                การ์ดคุณสมบัติ 8 ใบ (คลิกเลือกฝั่ง Analog หรือ IP ให้ถูกต้องอย่างน้อย 6 ข้อ)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  ↺ ล้างคำตอบ
                </button>
                <button
                  type="button"
                  onClick={handleAutoSolve}
                  className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 transition-colors cursor-pointer font-medium"
                >
                  ⚡ เฉลยครบทั้ง 8 ข้อ
                </button>
              </div>
            </div>

            {/* Cards List with Toggle Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMPARISON_CARDS.map((c) => {
                const isAnalog = mission4Cards.analogCards.includes(c.id);
                const isIp = mission4Cards.ipCards.includes(c.id);
                const isChosen = isAnalog || isIp;
                const chosenSide = isAnalog ? 'ANALOG' : isIp ? 'IP' : null;
                const isCorrect = chosenSide === c.expected;

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                      isChosen && isCorrect
                        ? 'border-emerald-500/60 bg-emerald-950/20'
                        : isChosen && !isCorrect
                        ? 'border-rose-500/60 bg-rose-950/20'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.icon}</span>
                          <h4 className="text-xs font-bold text-white">{c.nameTh}</h4>
                        </div>
                        {isChosen && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isCorrect ? '✓ ถูกต้อง' : '✗ ไม่ตรง'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7">{c.desc}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 mr-1">เลือกจัดฝั่ง:</span>
                      <button
                        type="button"
                        onClick={() => placeComparisonCard(c.id, 'ANALOG')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isAnalog
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        📼 ฝั่ง Analog
                      </button>
                      <button
                        type="button"
                        onClick={() => placeComparisonCard(c.id, 'IP')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          isIp
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        🌐 ฝั่ง IP CCTV
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Notice */}
          {missionState.lastFeedbackTh && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                missionState.isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 text-purple-200'
              }`}
            >
              <span className="text-base">{missionState.isCompleted ? '🎉' : '💡'}</span>
              <span>{missionState.lastFeedbackTh}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                ◀ ย้อนกลับภารกิจที่ 3
              </button>
            )}
            <span className="text-xs text-slate-300 hidden sm:inline">
              {missionState.isCompleted
                ? '✓ ผ่านภารกิจที่ 4 แล้ว สามารถไปต่อภารกิจสุดท้าย (ภารกิจที่ 5) ได้'
                : 'จำแนกคุณสมบัติให้ถูกต้องอย่างน้อย 6 ใน 8 ข้อ'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            {missionState.isCompleted && onNext && (
              <button
                type="button"
                onClick={onNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                ไปภารกิจที่ 5 (ประกอบสาย & เปิดระบบ) ➜
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
