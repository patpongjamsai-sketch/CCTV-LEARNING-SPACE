'use client';

import React, { useState } from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { KNOWLEDGE_CARDS } from '../../../data/unit1RoleplayContent';
import { Room101Mission2IsometricCanvas } from './Room101Mission2IsometricCanvas';

interface Room101Mission2ModalProps {
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const AVAILABLE_CARDS = [
  { id: 'M2_CAM', card: KNOWLEDGE_CARDS.M2_CAM },
  { id: 'M2_POE_SW', card: KNOWLEDGE_CARDS.M2_POE_SW },
  { id: 'M2_NVR', card: KNOWLEDGE_CARDS.M2_NVR },
  { id: 'M2_CLIENT', card: KNOWLEDGE_CARDS.M2_CLIENT },
];

export const Room101Mission2Modal: React.FC<Room101Mission2ModalProps> = ({
  onClose,
  onNext,
  onPrev,
}) => {
  const mission2Slots = useRoleplayStore((s) => s.mission2Slots);
  const setMission2SlotCardDirect = useRoleplayStore((s) => s.setMission2SlotCardDirect);
  const resetMission2Slots = useRoleplayStore((s) => s.resetMission2Slots);
  const missionState = useRoleplayStore((s) => s.missions.M2);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isTestingFlow, setIsTestingFlow] = useState<boolean>(false);

  const handleSlotClick = (index: number) => {
    if (!selectedCardId) {
      if (mission2Slots[index]?.currentPlacedItem) {
        setMission2SlotCardDirect(index, null);
      }
      return;
    }

    setMission2SlotCardDirect(index, selectedCardId);
    setSelectedCardId(null);
  };

  const handleAutoSolve = () => {
    setMission2SlotCardDirect(0, 'M2_CAM');
    setMission2SlotCardDirect(1, 'M2_POE_SW');
    setMission2SlotCardDirect(2, 'M2_NVR');
    setMission2SlotCardDirect(3, 'M2_CLIENT');
    setIsTestingFlow(true);
  };

  const handleTriggerTest = () => {
    setIsTestingFlow(true);
    // Timeout to simulate continuous loop
    setTimeout(() => {
      // Keep active if completed
    }, 4000);
  };

  const placedCardIds = mission2Slots
    .map((s) => s.currentPlacedItem?.id)
    .filter(Boolean) as string[];

  // Connection calculations
  const isCamCorrect = mission2Slots[0]?.status === 'CORRECT';
  const isPoeCorrect = mission2Slots[1]?.status === 'CORRECT';
  const isNvrCorrect = mission2Slots[2]?.status === 'CORRECT';
  const isClientCorrect = mission2Slots[3]?.status === 'CORRECT';

  const correctLinksCount =
    (isCamCorrect && isPoeCorrect ? 1 : 0) +
    (isPoeCorrect && isNvrCorrect ? 1 : 0) +
    (isNvrCorrect && isClientCorrect ? 1 : 0);

  const isFullSystemReady = isCamCorrect && isPoeCorrect && isNvrCorrect && isClientCorrect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
              2
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  ภารกิจที่ 2 · 20 คะแนน
                </span>
                {missionState.isCompleted && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ ผ่านภารกิจแล้ว
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                เส้นทางข้อมูล Data Flow ในระบบ IP CCTV (3D Isometric Lab)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-300">
              คะแนน:{' '}
              <strong className="text-emerald-400 font-bold text-sm">
                {missionState.score}
              </strong>
              /20
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
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
              <span>📡</span>
              <span>สถาปัตยกรรมการส่งข้อมูลดิจิทัล (Network Topology Data Flow)</span>
            </div>
            <p>
              ข้อมูลภาพวิดีโอจากกล้อง IP จะไหลตามลำดับ: เริ่มจาก <strong>IP Camera</strong> แปลงภาพเป็น RTSP Stream ➡️ ส่งต่อผ่านสาย Cat6 เข้าสู่ <strong>PoE Switch</strong> เพื่อสวิตชิ่งแพ็กเก็ต ➡️ เข้าสู่เครื่องบันทึก <strong>NVR</strong> เพื่อเขียนลงฮาร์ดดิสก์ ➡️ และส่งสัญญาณภาพผ่านพอร์ต HDMI ไปยัง <strong>Client PC / Monitor</strong> เพื่อแสดงผลภาพสด (Live View)
            </p>
          </div>

          {/* 3D Isometric Interactive Lab Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>🖥️</span>
                <span>โต๊ะทดลอง 3D Isometric Lab (Port-to-Port Auto Connection &amp; Live View)</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                  สายสัญญาณ: {correctLinksCount}/3 เส้น
                </span>
                <button
                  type="button"
                  onClick={handleTriggerTest}
                  disabled={!isFullSystemReady}
                  className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shadow-md ${
                    isFullSystemReady
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  ⚡ ทดสอบระบบ (Test Data Flow)
                </button>
              </div>
            </div>

            <Room101Mission2IsometricCanvas
              selectedCardId={selectedCardId}
              onSelectCard={(id) => setSelectedCardId(id)}
              onSlotClick={handleSlotClick}
              isTestingFlow={isTestingFlow}
              onTriggerTest={handleTriggerTest}
            />
          </div>

          {/* Data Flow Diagram Flow Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ผังจัดเรียงลำดับอุปกรณ์บนแท่นทดลอง (คลิกการ์ดด้านล่าง หรือคลิกที่ช่อง 3D ด้านบน)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetMission2Slots();
                    setIsTestingFlow(false);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  ↺ รีเซ็ตช่อง
                </button>
                <button
                  type="button"
                  onClick={handleAutoSolve}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-colors cursor-pointer font-medium"
                >
                  ⚡ วางเรียงเฉลย
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
              {mission2Slots.map((slot, index) => {
                const item = slot.currentPlacedItem;
                const isSelected = selectedCardId !== null;

                let borderStyle = 'border-dashed border-slate-700 hover:border-emerald-400';
                let bgStyle = 'bg-slate-950/50';

                if (slot.status === 'CORRECT') {
                  borderStyle = 'border-emerald-500/80 bg-emerald-950/30';
                } else if (slot.status === 'WRONG_ORDER') {
                  borderStyle = 'border-amber-500/80 bg-amber-950/30';
                } else if (slot.status === 'WRONG_TYPE') {
                  borderStyle = 'border-rose-500/80 bg-rose-950/30';
                } else if (isSelected) {
                  borderStyle = 'border-emerald-400/80 bg-emerald-950/20';
                }

                return (
                  <div
                    key={`m2_slot_${index}`}
                    onClick={() => handleSlotClick(index)}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[140px] cursor-pointer group ${borderStyle} ${bgStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-400">
                          ลำดับที่ {index + 1}
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
                          <span>{isSelected ? 'คลิกเพื่อวางอุปกรณ์' : 'ช่องว่าง (คลิกเลือกด้านล่าง)'}</span>
                        </div>
                      )}
                    </div>

                    {item && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMission2SlotCardDirect(index, null);
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
              อุปกรณ์ในระบบ Data Flow (คลิกเลือกอุปกรณ์ที่ต้องการนำไปติดตั้ง)
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
                        ? 'border-emerald-400 bg-emerald-950/80 shadow-lg shadow-emerald-500/20 scale-[1.01]'
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
                            ติดตั้งแล้ว
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 animate-pulse">
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
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                ◀ ย้อนกลับภารกิจที่ 1
              </button>
            )}
            <span className="text-xs text-slate-300 hidden sm:inline">
              {missionState.isCompleted
                ? '✓ ผ่านภารกิจที่ 2 แล้ว สามารถไปต่อภารกิจที่ 3 ได้'
                : 'จัดเรียงอุปกรณ์และเชื่อมต่อสายข้อมูลให้ครบทั้ง 4 ลำดับ'}
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                ไปภารกิจที่ 3 (หน้าที่อุปกรณ์) ➜
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
