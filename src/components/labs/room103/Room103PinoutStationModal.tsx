'use client';

import React, { useState } from 'react';
import {
  T568B_COLOR_SEQUENCE,
  COLOR_HEX_MAP,
  type Station1Payload,
} from '../../../shared/domain/room103Types';

interface Room103PinoutStationModalProps {
  initialPayload?: Partial<Station1Payload>;
  onSave: (payload: Station1Payload, score: number) => void;
  onClose: () => void;
}

export const Room103PinoutStationModal: React.FC<Room103PinoutStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'utp' | 'coax' | 'label_safety'>('utp');

  // UTP State
  const [wireSequence, setWireSequence] = useState<string[]>(() => {
    if (initialPayload?.wireSequence && initialPayload.wireSequence.length === 8) {
      return [...initialPayload.wireSequence];
    }
    // Default jumbled wire sequence for training
    return [
      'Orange',
      'White-Orange',
      'Blue',
      'White-Green',
      'Green',
      'White-Blue',
      'Brown',
      'White-Brown',
    ];
  });
  const [selectedWireIdx, setSelectedWireIdx] = useState<number | null>(null);
  const [strippingLengthMm, setStrippingLengthMm] = useState<number>(
    initialPayload?.strippingLengthMm ?? 14
  );
  const [jacketUnderStrainRelief, setJacketUnderStrainRelief] = useState<boolean>(
    initialPayload?.jacketUnderStrainRelief ?? true
  );
  const [rj45Crimped, setRj45Crimped] = useState<boolean>(initialPayload?.rj45Crimped ?? false);

  // Coaxial State
  const [coaxialStrippedProperly, setCoaxialStrippedProperly] = useState<boolean>(
    initialPayload?.coaxialStrippedProperly ?? true
  );
  const [bncType, setBncType] = useState<'COMPRESSION' | 'CRIMP' | 'TWIST_ON'>(
    initialPayload?.bncType ?? 'COMPRESSION'
  );
  const [centerPinShortShieldCheck, setCenterPinShortShieldCheck] = useState<boolean>(
    initialPayload?.centerPinShortShieldCheck ?? false
  );
  const [bncCrimped, setBncCrimped] = useState<boolean>(initialPayload?.bncCrimped ?? false);

  // Labeling & Safety State
  const [cableId, setCableId] = useState<string>(initialPayload?.cableId || 'CAM-01-UTP-SW01');
  const [sourceLabel, setSourceLabel] = useState<string>(
    initialPayload?.sourceLabel || 'PatchPanel-01 Port 08'
  );
  const [destLabel, setDestLabel] = useState<string>(
    initialPayload?.destLabel || 'Camera-01 North Gate'
  );
  const [cutSafetyGloves, setCutSafetyGloves] = useState<boolean>(
    initialPayload?.safetyChecklist?.cutSafetyGloves ?? true
  );
  const [eyeProtection, setEyeProtection] = useState<boolean>(
    initialPayload?.safetyChecklist?.eyeProtection ?? true
  );
  const [cleanWorkArea, setCleanWorkArea] = useState<boolean>(
    initialPayload?.safetyChecklist?.cleanWorkArea ?? true
  );

  // Handle wire click & swap
  const handleWireClick = (idx: number) => {
    if (selectedWireIdx === null) {
      setSelectedWireIdx(idx);
    } else {
      if (selectedWireIdx !== idx) {
        const next = [...wireSequence];
        const temp = next[selectedWireIdx]!;
        next[selectedWireIdx] = next[idx]!;
        next[idx] = temp;
        setWireSequence(next);
      }
      setSelectedWireIdx(null);
    }
  };

  const autoAlignT568B = () => {
    setWireSequence([...T568B_COLOR_SEQUENCE]);
  };

  // Calculate scores
  let correctPinsCount = 0;
  for (let i = 0; i < 8; i++) {
    if (wireSequence[i] === T568B_COLOR_SEQUENCE[i]) {
      correctPinsCount++;
    }
  }

  // 1. RJ45 T568B: 12 pts
  const utpSequenceScore = Math.round((correctPinsCount / 8) * 8);
  const utpPrepScore =
    (strippingLengthMm >= 12 && strippingLengthMm <= 15 ? 2 : 0) +
    (jacketUnderStrainRelief ? 1 : 0) +
    (rj45Crimped ? 1 : 0);
  const rj45TotalScore = utpSequenceScore + utpPrepScore; // Max 12

  // 2. Coaxial BNC: 10 pts
  const bncScore =
    (coaxialStrippedProperly ? 3 : 0) +
    (bncType === 'COMPRESSION' ? 3 : bncType === 'CRIMP' ? 2 : 1) +
    (!centerPinShortShieldCheck ? 2 : 0) +
    (bncCrimped ? 2 : 0); // Max 10

  // 3. Labeling: 6 pts
  const labelingScore =
    (cableId.trim().length >= 5 ? 2 : 0) +
    (sourceLabel.trim().length > 0 && destLabel.trim().length > 0 ? 2 : 0) +
    (cableId.includes('CAM') || cableId.includes('01') ? 2 : 1); // Max 6

  // 4. Safety & Tools: 7 pts
  const safetyScore =
    (cutSafetyGloves ? 2 : 0) + (eyeProtection ? 2 : 0) + (cleanWorkArea ? 3 : 0); // Max 7

  const totalScore = Math.min(35, rj45TotalScore + bncScore + labelingScore + safetyScore);

  const handleFinish = () => {
    const payload: Station1Payload = {
      wireSequence,
      strippingLengthMm,
      jacketUnderStrainRelief,
      rj45Crimped,
      coaxialStrippedProperly,
      bncType,
      centerPinShortShieldCheck,
      bncCrimped,
      cableId,
      sourceLabel,
      destLabel,
      labelMatches: true,
      safetyChecklist: {
        cutSafetyGloves,
        eyeProtection,
        cleanWorkArea,
      },
      score: totalScore,
      isCompleted: true,
    };

    onSave(payload, totalScore);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-xl text-sky-400">
              🔌
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                Station 1 of 3 · Structured Cabling Workshop
              </span>
              <h2 className="text-lg font-black text-white">
                การติดตั้งและเข้าหัวสาย UTP/RJ45 & Coaxial/BNC พร้อมติด Label
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-mono">
              คะแนนสถานี: <strong className="text-sky-400">{totalScore}</strong> / 35
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('utp')}
            className={`py-2 px-4 rounded-t-xl transition-colors ${
              activeTab === 'utp'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.1 สาย UTP & หัวต่อ RJ45 (T568B) ({rj45TotalScore}/12)
          </button>
          <button
            onClick={() => setActiveTab('coax')}
            className={`py-2 px-4 rounded-t-xl transition-colors ${
              activeTab === 'coax'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.2 สาย Coaxial RG6 & ขั้วต่อ BNC ({bncScore}/10)
          </button>
          <button
            onClick={() => setActiveTab('label_safety')}
            className={`py-2 px-4 rounded-t-xl transition-colors ${
              activeTab === 'label_safety'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.3 การติด Label & ความปลอดภัย ({labelingScore + safetyScore}/13)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: UTP & RJ45 */}
          {activeTab === 'utp' && (
            <div className="space-y-6">
              <div className="bg-sky-950/30 border border-sky-500/20 rounded-2xl p-4 text-xs text-sky-200 leading-relaxed">
                <strong>คำแนะนำมาตรฐาน TIA/EIA-568B:</strong> คลิกเลือกคู่สายเพื่อสลับตำแหน่ง (Swap)
                ให้ได้ลำดับสีมาตรฐาน T568B ที่ถูกต้อง ป้องกันปัญหาข้ามคู่สาย (NEXT Crosstalk)
                และตรวจสอบระยะปอกเปลือกนอกให้เดือยรัดหนีบสาย (Strain Relief)
              </div>

              {/* Pinout Sequencer */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200">
                    ลำดับสีพิน 1 ถึง 8 (ถูกต้อง: {correctPinsCount}/8 พิน):
                  </span>
                  <button
                    onClick={autoAlignT568B}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold underline"
                  >
                    ⚡ เรียงอัตโนมัติตามมาตรฐาน T568B
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {wireSequence.map((colorName, idx) => {
                    const isSelected = selectedWireIdx === idx;
                    const isCorrect = colorName === T568B_COLOR_SEQUENCE[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleWireClick(idx)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-sky-400 bg-sky-500/20 scale-105 shadow-lg'
                            : isCorrect
                            ? 'border-emerald-500/50 bg-emerald-950/30'
                            : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full mx-auto mb-1.5 border border-black/40 shadow-inner"
                          style={{ backgroundColor: COLOR_HEX_MAP[colorName] || '#ffffff' }}
                        />
                        <span className="text-[10px] block font-mono text-slate-400">
                          Pin {idx + 1}
                        </span>
                        <strong className="text-[11px] block font-semibold text-slate-200 truncate">
                          {colorName}
                        </strong>
                        <span
                          className={`text-[9px] block font-mono mt-1 ${
                            isCorrect ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isCorrect ? '✓ ถูกต้อง' : 'สลับสี'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cable Stripping & Crimping Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <label className="font-bold text-slate-300 block">
                    ระยะปอกเปลือกสาย UTP นอก (Stripping Length): {strippingLengthMm} mm
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="30"
                    value={strippingLengthMm}
                    onChange={(e) => setStrippingLengthMm(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    {strippingLengthMm >= 12 && strippingLengthMm <= 15
                      ? '✓ ระยะเหมาะสม (12-15mm) ช่วยรักษาเกลียวคู่สายให้ชิดหัวต่อที่สุด'
                      : strippingLengthMm < 12
                      ? '⚠️ ปอกสั้นเกินไป ทองแดงอาจไม่ชนสุดปลายขั้วต่อ'
                      : '⚠️ ปอกยาวเกินไป คลายเกลียวมากเกินไป เสี่ยงต่อสัญญาณรบกวน Crosstalk'}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={jacketUnderStrainRelief}
                      onChange={(e) => setJacketUnderStrainRelief(e.target.checked)}
                      className="rounded accent-sky-400 w-4 h-4"
                    />
                    <span>สอดเปลือกสาย (Jacket) ลึกถึงเดือยรัดป้องกันสายหลุด (Strain Relief)</span>
                  </label>

                  <button
                    onClick={() => setRj45Crimped(true)}
                    className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                      rj45Crimped
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg'
                    }`}
                  >
                    {rj45Crimped ? '✓ ย้ำหัวต่อ RJ45 ด้วยคีมเรียบร้อยแล้ว' : '🔧 กดคีมย้ำหัวต่อ RJ45 (Crimp Tool)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Coaxial & BNC */}
          {activeTab === 'coax' && (
            <div className="space-y-6">
              <div className="bg-sky-950/30 border border-sky-500/20 rounded-2xl p-4 text-xs text-sky-200 leading-relaxed">
                <strong>การเตรียมและเข้าหัว BNC สำหรับสาย Coaxial RG6:</strong> ต้องปอกเปลือกและชิลด์ถัก
                95% ให้เรียบร้อย ห้ามไม่ให้เส้นชิลด์ฝอยสัมผัสแกนทองแดงกลาง (Center Conductor)
                เด็ดขาดเพื่อป้องกันการลัดวงจรภาพมืด (No Video/Short)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <strong className="block text-slate-200 text-sm">การเลือกชนิดขั้วต่อ BNC:</strong>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'COMPRESSION',
                        name: 'BNC แบบบีบอัด (Compression Type - แนะนำสูงสุด)',
                        desc: 'แน่นหนา กันน้ำ ความต้านทานคงที่ เหมาะกับงานช่างมืออาชีพ',
                      },
                      {
                        id: 'CRIMP',
                        name: 'BNC แบบย้ำหกเหลี่ยม (Hex Crimp)',
                        desc: 'ใช้ปลอกย้ำ แน่นปานกลาง ต้องใช้คีมเฉพาะทาง',
                      },
                      {
                        id: 'TWIST_ON',
                        name: 'BNC แบบเกลียวหมุน (Twist-On)',
                        desc: 'หลุดง่าย สัญญาณสะท้อนสูง ไม่แนะนำสำหรับระยะไกล',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                          bncType === opt.id
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-slate-800 bg-slate-900/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bncType"
                          value={opt.id}
                          checked={bncType === opt.id}
                          onChange={() => setBncType(opt.id as any)}
                          className="mr-2 accent-sky-400"
                        />
                        <strong className="text-slate-200">{opt.name}</strong>
                        <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <strong className="block text-slate-200 text-sm">การตรวจสอบคุณภาพทางกายภาพ:</strong>

                  <label className="flex items-start gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={coaxialStrippedProperly}
                      onChange={(e) => setCoaxialStrippedProperly(e.target.checked)}
                      className="rounded accent-sky-400 w-4 h-4 mt-0.5"
                    />
                    <span>
                      ปอกฉนวนไดอิเล็กทริกและพับชิลด์ถัก 95% แนบสนิท ไม่ขาดกระจุย
                    </span>
                  </label>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-300 block">
                      การทดสอบการลัดวงจรแกนทองแดงกับชิลด์ (Short Check):
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                      <input
                        type="checkbox"
                        checked={centerPinShortShieldCheck}
                        onChange={(e) => setCenterPinShortShieldCheck(e.target.checked)}
                        className="rounded accent-rose-500 w-4 h-4"
                      />
                      <span className={centerPinShortShieldCheck ? 'text-rose-400 font-bold' : ''}>
                        {centerPinShortShieldCheck
                          ? '⚠️ ตรวจพบแกนกลางแตะชิลด์ (ลัดวงจร - ไม่ผ่าน)'
                          : '✓ แกนกลางแยกฉนวนจากชิลด์สมบูรณ์ (ไม่มีการลัดวงจร)'}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => setBncCrimped(true)}
                    className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                      bncCrimped
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg'
                    }`}
                  >
                    {bncCrimped ? '✓ บีบอัดขั้วต่อ BNC แน่นหนาแล้ว' : '🔧 บีบอัดขั้วต่อ BNC (Compression Tool)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Labeling & Safety */}
          {activeTab === 'label_safety' && (
            <div className="space-y-6 text-xs">
              <div className="bg-sky-950/30 border border-sky-500/20 rounded-2xl p-4 text-sky-200 leading-relaxed">
                <strong>การจัดทำ Cable Label และมาตรฐานความปลอดภัย:</strong> ช่างมืออาชีพต้องติดป้าย
                Cable ID ที่ตรงกันทั้งต้นทางและปลายทาง เพื่อง่ายต่อการซ่อมบำรุงในอนาคต พร้อมทั้งปฏิบัติตาม
                Safety Checklist ในการใช้อุปกรณ์มีคม
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cable Identification Labeling */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <strong className="block text-slate-200 text-sm">การกำหนดรหัสสาย (Cable Tag):</strong>
                  <div>
                    <label className="block text-slate-400 mb-1">รหัสสายสัญญาณ (Cable ID):</label>
                    <input
                      type="text"
                      value={cableId}
                      onChange={(e) => setCableId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      placeholder="เช่น CAM-01-UTP-SW01"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ป้ายระบุต้นทาง (Source Label):</label>
                    <input
                      type="text"
                      value={sourceLabel}
                      onChange={(e) => setSourceLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      placeholder="เช่น Patch Panel Port 08"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ป้ายระบุปลายทาง (Destination Label):</label>
                    <input
                      type="text"
                      value={destLabel}
                      onChange={(e) => setDestLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      placeholder="เช่น Camera-01 North Gate"
                    />
                  </div>
                </div>

                {/* Safety Checklist */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <strong className="block text-slate-200 text-sm">รายการตรวจสอบความปลอดภัย (Safety Checklist):</strong>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={cutSafetyGloves}
                        onChange={(e) => setCutSafetyGloves(e.target.checked)}
                        className="rounded accent-sky-400 w-4 h-4"
                      />
                      <span>สวมถุงมือป้องกันใบมีดคัตเตอร์บาดขณะปอกเปลือกสาย</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={eyeProtection}
                        onChange={(e) => setEyeProtection(e.target.checked)}
                        className="rounded accent-sky-400 w-4 h-4"
                      />
                      <span>สวมแว่นตานิรภัยป้องกันเศษลวดทองแดงและเปลือกกระเด็น</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={cleanWorkArea}
                        onChange={(e) => setCleanWorkArea(e.target.checked)}
                        className="rounded accent-sky-400 w-4 h-4"
                      />
                      <span>จัดเก็บเศษสายและรักษาความสะอาดโต๊ะปฏิบัติงานเรียบร้อย</span>
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    ✓ การปฏิบัติงานตามระเบียบความปลอดภัย 100% จะได้รับคะแนนเต็มในส่วนนี้
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {correctPinsCount === 8 && rj45Crimped && bncCrimped
              ? '✓ ภารกิจสถานีที่ 1 ผ่านเกณฑ์พร้อมส่งผลประเมิน'
              : 'กรุณาตรวจสอบการเรียงสาย T568B และกดย้ำหัวต่อให้ครบทั้ง UTP และ Coaxial'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleFinish}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลสถานีที่ 1 ({totalScore}/35)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
