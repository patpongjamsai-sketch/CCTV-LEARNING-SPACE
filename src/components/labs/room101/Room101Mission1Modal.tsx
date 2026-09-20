'use client';

import React, { useState } from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { KNOWLEDGE_CARDS } from '../../../data/unit1RoleplayContent';

interface Room101Mission1ModalProps {
  onClose: () => void;
  onNext?: () => void;
}

const AVAILABLE_CARDS = [
  { id: 'M1_LENS', card: KNOWLEDGE_CARDS.M1_LENS },
  { id: 'M1_SENSOR', card: KNOWLEDGE_CARDS.M1_SENSOR },
  { id: 'M1_PROCESSOR', card: KNOWLEDGE_CARDS.M1_PROCESSOR },
  { id: 'M1_LAN', card: KNOWLEDGE_CARDS.M1_LAN },
];

export const Room101Mission1Modal: React.FC<Room101Mission1ModalProps> = ({
  onClose,
  onNext,
}) => {
  const mission1Slots = useRoleplayStore((s) => s.mission1Slots);
  const setMission1SlotCardDirect = useRoleplayStore((s) => s.setMission1SlotCardDirect);
  const resetMission1Slots = useRoleplayStore((s) => s.resetMission1Slots);
  const missionState = useRoleplayStore((s) => s.missions.M1);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSlotClick = (index: number) => {
    if (!selectedCardId) {
      // If clicking occupied slot without selection, remove item
      if (mission1Slots[index]?.currentPlacedItem) {
        setMission1SlotCardDirect(index, null);
      }
      return;
    }

    // Place card into slot
    setMission1SlotCardDirect(index, selectedCardId);
    setSelectedCardId(null);
  };

  const handleAutoSolve = () => {
    setMission1SlotCardDirect(0, 'M1_LENS');
    setMission1SlotCardDirect(1, 'M1_SENSOR');
    setMission1SlotCardDirect(2, 'M1_PROCESSOR');
    setMission1SlotCardDirect(3, 'M1_LAN');
  };

  // Find cards that have already been placed
  const placedCardIds = mission1Slots
    .map((s) => s.currentPlacedItem?.id)
    .filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold border border-sky-500/30">
              1
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  ภารกิจที่ 1 · 15 คะแนน
                </span>
                {missionState.isCompleted && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ ผ่านภารกิจแล้ว
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                เรียงกระบวนการสร้างภาพดิจิทัล (Digital Image Pipeline: Lens to LAN)
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
          {/* Scientific Concept Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-bold text-sky-300 flex items-center gap-1.5 text-sm">
              <span>🔬</span>
              <span>หลักการทำงานของกล้อง IP Camera (Lens ➡️ Sensor ➡️ Processor ➡️ Network)</span>
            </div>
            <p>
              กล้องโทรทัศน์วงจรปิดแบบ IP แตกต่างจากกล้องอนาล็อกยุคเดิม คือ ภายในตัวกล้องมีวงจรประมวลผลและบีบอัดวิดีโอดิจิทัล (SoC) ในตัว
              แสงจากภายนอกจะผ่านเลนส์ไปยังตัวรับภาพ CMOS จากนั้นชิป ISP จะแปลงเป็นสัญญาณดิจิทัล บีบอัดเป็นสตรีม H.264/H.265 แล้วส่งออกผ่านพอร์ต LAN ในรูป TCP/IP Packets
            </p>
          </div>

          {/* Pipeline Drop Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                แท่นจัดลำดับขั้นตอนการทำงาน (คลิกการ์ดด้านล่าง แล้วคลิกที่ช่องเพื่อวาง)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetMission1Slots}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  ↺ รีเซ็ตช่อง
                </button>
                <button
                  type="button"
                  onClick={handleAutoSolve}
                  className="text-xs px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 transition-colors cursor-pointer font-medium"
                >
                  ⚡ วางเรียงเฉลย
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {mission1Slots.map((slot, index) => {
                const item = slot.currentPlacedItem;
                const isSelected = selectedCardId !== null;

                let borderStyle = 'border-dashed border-slate-700 hover:border-sky-400';
                let bgStyle = 'bg-slate-950/50';

                if (slot.status === 'CORRECT') {
                  borderStyle = 'border-emerald-500/80 bg-emerald-950/30';
                } else if (slot.status === 'WRONG_ORDER') {
                  borderStyle = 'border-amber-500/80 bg-amber-950/30';
                } else if (slot.status === 'WRONG_TYPE') {
                  borderStyle = 'border-rose-500/80 bg-rose-950/30';
                } else if (isSelected) {
                  borderStyle = 'border-sky-400/80 bg-sky-950/20';
                }

                return (
                  <div
                    key={`slot_${index}`}
                    onClick={() => handleSlotClick(index)}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[140px] cursor-pointer group ${borderStyle} ${bgStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-sky-400">
                          ขั้นตอนที่ {index + 1}
                        </span>
                        {slot.status === 'CORRECT' && (
                          <span className="text-xs text-emerald-400 font-bold">✓ ถูกต้อง</span>
                        )}
                        {slot.status === 'WRONG_ORDER' && (
                          <span className="text-[10px] text-amber-400 font-bold">สลับลำดับ</span>
                        )}
                      </div>

                      {item ? (
                        <div className="space-y-1">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="text-xs font-bold text-white">{item.nameTh}</div>
                          <div className="text-[10px] text-slate-300 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 flex flex-col items-center justify-center text-center text-slate-400 text-xs gap-1">
                          <span className="text-lg opacity-40">📥</span>
                          <span>{isSelected ? 'คลิกเพื่อวางการ์ด' : 'ช่องว่าง (คลิกการ์ดด้านล่าง)'}</span>
                        </div>
                      )}
                    </div>

                    {item && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMission1SlotCardDirect(index, null);
                        }}
                        className="mt-2 text-[10px] text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-800 px-2 py-0.5 rounded-md self-end transition-colors cursor-pointer"
                      >
                        นำออก
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Cards Selection Area */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              การ์ดชิ้นส่วนและขั้นตอนการทำงาน (คลิกเลือกการ์ดที่ต้องการ)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_CARDS.map(({ id, card }) => {
                if (!card) return null;
                const isPlaced = placedCardIds.includes(card.id);
                const isSelected = selectedCardId === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (isSelected) setSelectedCardId(null);
                      else setSelectedCardId(id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-sky-400 bg-sky-950/80 shadow-lg shadow-sky-500/20 scale-[1.01]'
                        : isPlaced
                        ? 'border-slate-800/80 bg-slate-950/40 opacity-50'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                      {card.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{card.nameTh}</h4>
                        {isPlaced ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            วางแล้ว
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 animate-pulse">
                            เลือกอยู่
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </button>
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
                  : 'bg-slate-950/60 border-slate-800 text-sky-200'
              }`}
            >
              <span className="text-base">{missionState.isCompleted ? '🎉' : '💡'}</span>
              <span>{missionState.lastFeedbackTh}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-slate-300">
            {missionState.isCompleted
              ? '✓ ผ่านภารกิจที่ 1 แล้ว สามารถไปต่อภารกิจที่ 2 ได้'
              : 'กรุณาวางการ์ดให้ครบและถูกลำดับทั้ง 4 ขั้นตอน'}
          </span>

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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                ไปภารกิจที่ 2 (Data Flow) ➜
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
