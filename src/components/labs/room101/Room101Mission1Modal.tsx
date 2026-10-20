'use client';

import React, { useState } from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { KNOWLEDGE_CARDS } from '../../../data/unit1RoleplayContent';
import { Room101Mission1IsometricCanvas } from './Room101Mission1IsometricCanvas';

interface Room101Mission1ModalProps {
  onClose: () => void;
  onNext?: () => void;
}

const INITIAL_CARDS = [
  { id: 'M1_LENS', card: KNOWLEDGE_CARDS.M1_LENS },
  { id: 'M1_SENSOR', card: KNOWLEDGE_CARDS.M1_SENSOR },
  { id: 'M1_PROCESSOR', card: KNOWLEDGE_CARDS.M1_PROCESSOR },
  { id: 'M1_LAN', card: KNOWLEDGE_CARDS.M1_LAN },
];

export const Room101Mission1Modal: React.FC<Room101Mission1ModalProps> = ({
  onClose,
}) => {
  const mission1Slots = useRoleplayStore((s) => s.mission1Slots);
  const setMission1SlotCardDirect = useRoleplayStore((s) => s.setMission1SlotCardDirect);
  const resetMission1Slots = useRoleplayStore((s) => s.resetMission1Slots);
  const missionState = useRoleplayStore((s) => s.missions.M1);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // Randomized shuffled card order so answers aren't in 1-2-3-4 order
  const [shuffledCards] = useState(() => [...INITIAL_CARDS].sort(() => Math.random() - 0.5));
  const [activeSubTab, setActiveSubTab] = useState<'assembly' | 'lens_wdr'>('assembly');
  const [selectedFocal, setSelectedFocal] = useState<number>(4.0);
  const [wdrLevel, setWdrLevel] = useState<number>(80);

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

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-2 bg-slate-950/40 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('assembly')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'assembly'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🛠️ ประกอบชิ้นส่วน 3D (Pipeline Assembly)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('lens_wdr')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'lens_wdr'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🔬 ทดลองเลนส์ DORI & ระบบย้อนแสง True WDR 120dB
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeSubTab === 'lens_wdr' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* DORI Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🔭</span>
                    <span>เกณฑ์ระยะจำแนก DORI ตามทางยาวโฟกัส (EN 62676-4 Standard)</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    เลนส์: {selectedFocal.toFixed(1)} mm
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  {[2.8, 4.0, 6.0, 12.0].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFocal(f)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedFocal === f
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.toFixed(1)} mm
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-bold block">1. ตรวจจับ (Detection)</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {selectedFocal === 2.8 ? '43 ม.' : selectedFocal === 4.0 ? '63 ม.' : selectedFocal === 6.0 ? '90 ม.' : '180 ม.'}
                    </span>
                    <span className="text-[10px] text-slate-400">รู้ว่ามีสิ่งเคลื่อนไหว</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-sky-500/30">
                    <span className="text-[10px] text-sky-400 font-bold block">2. สังเกต (Observation)</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {selectedFocal === 2.8 ? '17 ม.' : selectedFocal === 4.0 ? '25 ม.' : selectedFocal === 6.0 ? '36 ม.' : '72 ม.'}
                    </span>
                    <span className="text-[10px] text-slate-400">เห็นลักษณะเสื้อผ้า</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 font-bold block">3. จดจำ (Recognition)</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {selectedFocal === 2.8 ? '9 ม.' : selectedFocal === 4.0 ? '13 ม.' : selectedFocal === 6.0 ? '18 ม.' : '36 ม.'}
                    </span>
                    <span className="text-[10px] text-slate-400">ชี้ตัวคนคุ้นเคย</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/30">
                    <span className="text-[10px] text-rose-400 font-bold block">4. ชี้ชัด (Identification)</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {selectedFocal === 2.8 ? '4.5 ม.' : selectedFocal === 4.0 ? '6.5 ม.' : selectedFocal === 6.0 ? '9 ม.' : '18 ม.'}
                    </span>
                    <span className="text-[10px] text-slate-400">อ่านป้ายทะเบียนรถ</span>
                  </div>
                </div>
              </div>

              {/* WDR Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>☀️</span>
                    <span>ทดสอบการเกลี่ยแสงย้อนหน้าร้าน True WDR (120dB Multi-Shutter)</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {wdrLevel === 0 ? 'WDR OFF (ปิด)' : `WDR Level: ${wdrLevel}%`}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={wdrLevel}
                  onChange={(e) => setWdrLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-400 cursor-pointer"
                />

                <div className="h-28 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div
                    className="absolute inset-0 transition-all duration-200"
                    style={{
                      background:
                        wdrLevel === 0
                          ? 'linear-gradient(to right, #090d16 45%, #ffffff 55%)'
                          : `linear-gradient(to right, #1e293b 45%, rgba(186, 230, 253, ${1 - wdrLevel * 0.006}) 55%)`,
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full border transition-all flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: wdrLevel === 0 ? '#000000' : `rgba(246, 194, 155, ${0.4 + wdrLevel * 0.006})`,
                        color: wdrLevel === 0 ? '#ffffff' : '#0f172a',
                      }}
                    >
                      {wdrLevel === 0 ? '👤 เงา' : '😊 ชัด'}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                    {wdrLevel === 0 ? '⚠️ แสงย้อนจ้า บุคคลกลายเป็นเงามืด' : '✅ True WDR ปรับเกลี่ยแสงสว่างและเงาเห็นหน้าชัดเจน'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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

              {/* 3D Isometric-Style Interactive Workbench Canvas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <span>🛰️</span>
                    <span>เวิร์กเบนช์ผ่าตัดโครงสร้างกล้อง 3D (Isometric View &amp; Real-time Flow)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    คลิกชิ้นส่วน 3D ในถาดด้านล่าง ➔ คลิกช่อง Socket เพื่อประกอบ
                  </span>
                </div>

                <Room101Mission1IsometricCanvas
                  selectedCardId={selectedCardId}
                  onSelectCard={(id) => setSelectedCardId(id)}
                  onSlotClick={handleSlotClick}
                />
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
              {shuffledCards.map(({ id, card }) => {
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-slate-300">
            {missionState.isCompleted
              ? '✓ ผ่านภารกิจที่ 1 แล้ว! ปิดหน้าต่างแล้วเดินไปที่ โต๊ะ 2 (Data Flow)'
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
            {missionState.isCompleted && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <span>✓ สำเร็จภารกิจ! เดินไปโต๊ะ 2 (Data Flow)</span>
                <span>➜</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
