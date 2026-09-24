'use client';

import React, { useState } from 'react';
import {
  T568B_COLOR_SEQUENCE,
  T568A_COLOR_SEQUENCE,
  COLOR_HEX_MAP,
  T568B_PIN_SPECS,
  type WiringStandardType,
} from '../../../shared/domain/room103Types';

interface RJ45PinoutInteractiveProps {
  sideASequence: string[];
  sideBSequence: string[];
  onChangeSideA: (seq: string[]) => void;
  onChangeSideB: (seq: string[]) => void;
  strippingMm: number;
  onChangeStrippingMm: (val: number) => void;
  jacketUnderStrainRelief: boolean;
  onChangeJacketStrainRelief: (val: boolean) => void;
  sideACrimped: boolean;
  sideBCrimped: boolean;
  onCrimpSideA: () => void;
  onCrimpSideB: () => void;
  wiringStandard: WiringStandardType;
  onChangeWiringStandard: (std: WiringStandardType) => void;
}

const ALL_CABLE_COLORS = [
  'White-Orange',
  'Orange',
  'White-Green',
  'Blue',
  'White-Blue',
  'Green',
  'White-Brown',
  'Brown',
];

export const RJ45PinoutInteractive: React.FC<RJ45PinoutInteractiveProps> = ({
  sideASequence,
  sideBSequence,
  onChangeSideA,
  onChangeSideB,
  strippingMm,
  onChangeStrippingMm,
  jacketUnderStrainRelief,
  onChangeJacketStrainRelief,
  sideACrimped,
  sideBCrimped,
  onCrimpSideA,
  onCrimpSideB,
  wiringStandard,
  onChangeWiringStandard,
}) => {
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [selectedWireIdx, setSelectedWireIdx] = useState<number | null>(null);
  const [draggedColor, setDraggedColor] = useState<string | null>(null);
  const [draggedFromPin, setDraggedFromPin] = useState<number | null>(null);

  const currentSequence = activeSide === 'A' ? sideASequence : sideBSequence;
  const updateCurrentSequence = activeSide === 'A' ? onChangeSideA : onChangeSideB;
  const isCurrentCrimped = activeSide === 'A' ? sideACrimped : sideBCrimped;
  const crimpCurrent = activeSide === 'A' ? onCrimpSideA : onCrimpSideB;

  // Standard target sequence for validation
  const targetStandard =
    wiringStandard === 'T568A_STRAIGHT'
      ? T568A_COLOR_SEQUENCE
      : wiringStandard === 'CROSSOVER' && activeSide === 'B'
      ? T568A_COLOR_SEQUENCE
      : T568B_COLOR_SEQUENCE;

  const countCorrectPins = (seq: string[], target: readonly string[]) => {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      if (seq[i] === target[i]) count++;
    }
    return count;
  };

  const correctPinsCount = countCorrectPins(currentSequence, targetStandard);

  // Click-to-Assign Handler (Swap or Select)
  const handlePinClick = (pinIdx: number) => {
    if (isCurrentCrimped) return;
    if (selectedWireIdx === null) {
      setSelectedWireIdx(pinIdx);
    } else {
      if (selectedWireIdx !== pinIdx) {
        const next = [...currentSequence];
        const temp = next[selectedWireIdx]!;
        next[selectedWireIdx] = next[pinIdx]!;
        next[pinIdx] = temp;
        updateCurrentSequence(next);
      }
      setSelectedWireIdx(null);
    }
  };

  // Drag & Drop Handlers
  const handleDragStartFromPalette = (e: React.DragEvent, color: string) => {
    if (isCurrentCrimped) return;
    setDraggedColor(color);
    setDraggedFromPin(null);
    e.dataTransfer.setData('text/plain', color);
  };

  const handleDragStartFromPin = (e: React.DragEvent, pinIdx: number) => {
    if (isCurrentCrimped) return;
    setDraggedFromPin(pinIdx);
    setDraggedColor(currentSequence[pinIdx]!);
    e.dataTransfer.setData('text/plain', currentSequence[pinIdx]!);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnPin = (e: React.DragEvent, targetPinIdx: number) => {
    e.preventDefault();
    if (isCurrentCrimped) return;

    const next = [...currentSequence];
    if (draggedFromPin !== null) {
      // Swapping two pins
      const temp = next[draggedFromPin]!;
      next[draggedFromPin] = next[targetPinIdx]!;
      next[targetPinIdx] = temp;
    } else if (draggedColor) {
      // Assigning from color palette
      // Check if target color already exists in sequence, if so swap it
      const existingIdx = next.indexOf(draggedColor);
      if (existingIdx !== -1) {
        next[existingIdx] = next[targetPinIdx]!;
      }
      next[targetPinIdx] = draggedColor;
    }
    updateCurrentSequence(next);
    setDraggedColor(null);
    setDraggedFromPin(null);
    setSelectedWireIdx(null);
  };

  const applyPreset = (std: WiringStandardType) => {
    onChangeWiringStandard(std);
    if (std === 'T568B_STRAIGHT') {
      onChangeSideA([...T568B_COLOR_SEQUENCE]);
      onChangeSideB([...T568B_COLOR_SEQUENCE]);
    } else if (std === 'T568A_STRAIGHT') {
      onChangeSideA([...T568A_COLOR_SEQUENCE]);
      onChangeSideB([...T568A_COLOR_SEQUENCE]);
    } else if (std === 'CROSSOVER') {
      onChangeSideA([...T568B_COLOR_SEQUENCE]);
      onChangeSideB([...T568A_COLOR_SEQUENCE]);
    }
  };

  return (
    <div className="space-y-6 text-xs select-none">
      {/* Top Banner & Standard Switcher */}
      <div className="bg-slate-950/70 border border-sky-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🔌</span>
            <strong className="text-sm text-sky-200">
              สถานีเข้าหัวสาย RJ45 Cat6 แบบ 2 ฝั่ง (Side A & Side B)
            </strong>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            มาตรฐานกล้องวงจรปิด IP Camera นิยมใช้สายแบบ Straight-Through (T568B ทั้งสองฝั่ง)
            เพื่อเชื่อมระหว่างกล้องกับ PoE Switch / NVR
          </p>
        </div>

        {/* Standard Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => applyPreset('T568B_STRAIGHT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              wiringStandard === 'T568B_STRAIGHT'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            T568B ตรง (แนะนำ)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('T568A_STRAIGHT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              wiringStandard === 'T568A_STRAIGHT'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            T568A ตรง
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CROSSOVER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              wiringStandard === 'CROSSOVER'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crossover (A-B)
          </button>
        </div>
      </div>

      {/* Dual Side Toggle (Side A vs Side B) */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSide('A');
              setSelectedWireIdx(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSide === 'A'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔵 หัวฝั่ง A (ต้นทาง - Patch Panel / Switch)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                sideACrimped ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              {sideACrimped ? '✓ ย้ำแล้ว' : 'ยังไม่ย้ำ'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSide('B');
              setSelectedWireIdx(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSide === 'B'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🟢 หัวฝั่ง B (ปลายทาง - กล้อง IP Camera)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                sideBCrimped ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              {sideBCrimped ? '✓ ย้ำแล้ว' : 'ยังไม่ย้ำ'}
            </span>
          </button>
        </div>

        <div className="text-[11px] font-mono pr-3">
          ความถูกต้องฝั่ง {activeSide}:{' '}
          <strong
            className={correctPinsCount === 8 ? 'text-emerald-400' : 'text-amber-400'}
          >
            {correctPinsCount}/8 พิน
          </strong>
        </div>
      </div>

      {/* 3D / Transparent RJ45 Pinout Visualizer */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        {/* Transparent RJ45 Plug Graphic Frame */}
        <div className="absolute inset-x-8 top-14 bottom-24 border-2 border-sky-400/20 bg-gradient-to-b from-sky-500/5 to-slate-900/40 rounded-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
              RJ45 Modular Plug · Front Pin View (พิน 1 ถึง 8 เรียงจากซ้ายไปขวา เมื่อหันเดือยล็อกลงล่าง)
            </span>
            <h4 className="text-sm font-bold text-white">
              การจัดเรียงคู่สายเข้าหัวต่อ RJ45 ฝั่ง {activeSide} ({targetStandard === T568B_COLOR_SEQUENCE ? 'มาตรฐาน T568B' : 'มาตรฐาน T568A'})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              💡 แตะคลิก 2 เส้นเพื่อสลับตำแหน่ง หรือลาก-วาง (Drag & Drop)
            </span>
          </div>
        </div>

        {/* 8 Pin Wire Slots */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 relative z-10 pt-2 pb-6">
          {currentSequence.map((colorName, idx) => {
            const isSelected = selectedWireIdx === idx;
            const isCorrect = colorName === targetStandard[idx];
            const pinSpec = T568B_PIN_SPECS[idx]!;

            return (
              <div
                key={idx}
                draggable={!isCurrentCrimped}
                onDragStart={(e) => handleDragStartFromPin(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnPin(e, idx)}
                onClick={() => handlePinClick(idx)}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/30 scale-105'
                    : isCorrect
                    ? 'border-emerald-500/50 bg-slate-900/90 hover:border-emerald-400'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
                } ${isCurrentCrimped ? 'opacity-80 cursor-default' : ''}`}
              >
                {/* Gold Contact Pin at Top */}
                <div className="w-4 h-6 rounded-t-sm bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-sm mb-2" />

                {/* Wire Color Pill & Core */}
                <div
                  className="w-full h-12 rounded-xl flex items-center justify-center shadow-inner border border-black/30 mb-2 relative overflow-hidden"
                  style={{ backgroundColor: COLOR_HEX_MAP[colorName] || '#ffffff' }}
                >
                  {/* Striped texture for White-X wires */}
                  {colorName.startsWith('White-') && (
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, ${
                          COLOR_HEX_MAP[colorName.replace('White-', '')] || '#000'
                        } 4px, ${
                          COLOR_HEX_MAP[colorName.replace('White-', '')] || '#000'
                        } 8px)`,
                      }}
                    />
                  )}
                  <span className="text-[10px] font-mono font-black text-black/70 drop-shadow-sm relative z-10">
                    P{idx + 1}
                  </span>
                </div>

                {/* Wire Name */}
                <span className="text-[10px] font-bold text-slate-200 text-center leading-tight truncate w-full">
                  {colorName}
                </span>

                {/* Signal Function */}
                <span className="text-[8px] font-mono text-slate-400 mt-1 text-center truncate w-full">
                  {pinSpec.signalFunction.split('/')[0]}
                </span>

                {/* Match Badge */}
                <div
                  className={`mt-2 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isCorrect ? '✓ ตรงพิน' : 'สลับสี'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Palette (Drag from or click to reassign) */}
        {!isCurrentCrimped && (
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-400">
              จานสีสาย UTP (ลากไปหย่อนที่ช่องพิน):
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_CABLE_COLORS.map((col) => (
                <div
                  key={col}
                  draggable
                  onDragStart={(e) => handleDragStartFromPalette(e, col)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 flex items-center gap-1.5 cursor-grab active:cursor-grabbing transition-all hover:scale-105"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/40"
                    style={{ backgroundColor: COLOR_HEX_MAP[col] }}
                  />
                  <span className="text-[10px] text-slate-300 font-medium">{col}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stripping, Strain Relief & Crimping Tool Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stripping Length Control */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-300">ระยะปอกเปลือกนอก:</span>
            <span className="font-mono text-sky-400 font-bold">{strippingMm} mm</span>
          </div>
          <input
            type="range"
            min="8"
            max="28"
            value={strippingMm}
            disabled={isCurrentCrimped}
            onChange={(e) => onChangeStrippingMm(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">
            {strippingMm >= 12 && strippingMm <= 15
              ? '✓ ระยะ 12-15mm ถูกต้อง: คู่สายชิดหัวต่อ ลดสัญญาณสะท้อน (Return Loss)'
              : strippingMm < 12
              ? '⚠️ ปอกสั้นเกินไป เสี่ยงทองแดงไม่ชนสุดปลายพิน'
              : '⚠️ ปอกยาวเกินไป คลายเกลียวมากเกิน เกิดสัญญาณรบกวน Crosstalk (NEXT)'}
          </p>
        </div>

        {/* Strain Relief Check */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={jacketUnderStrainRelief}
              disabled={isCurrentCrimped}
              onChange={(e) => onChangeJacketStrainRelief(e.target.checked)}
              className="rounded accent-sky-400 w-4 h-4 mt-0.5 cursor-pointer"
            />
            <span>
              สอดเปลือกสาย (Jacket) ลึกผ่านเดือยรัดสาย (Strain Relief Bar)
            </span>
          </label>
          <span className="text-[10px] text-slate-400 block">
            {jacketUnderStrainRelief
              ? '✓ เปลือกสายถูกเดือยพลาสติกล็อกแน่น ไม่หลุดเมื่อดึงสาย'
              : '⚠️ เปลือกสายอยู่ภายนอกหัวต่อ สายอาจขาดหลุดง่าย'}
          </span>
        </div>

        {/* Crimp Action Button */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
          <button
            type="button"
            onClick={crimpCurrent}
            className={`w-full py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isCurrentCrimped
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 active:scale-95'
            }`}
          >
            <span>{isCurrentCrimped ? '✓' : '🔧'}</span>
            <span>
              {isCurrentCrimped
                ? `ย้ำหัวต่อ RJ45 ฝั่ง ${activeSide} เรียบร้อยแล้ว`
                : `กดย้ำหัวต่อ RJ45 ฝั่ง ${activeSide} (Crimper)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
