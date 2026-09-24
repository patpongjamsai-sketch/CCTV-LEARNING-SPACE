'use client';

import React, { useState } from 'react';
import {
  T568B_COLOR_SEQUENCE,
  type Station1Payload,
  type CoaxAssemblyDetails,
  type WiringStandardType,
} from '../../../shared/domain/room103Types';
import { RJ45PinoutInteractive } from './RJ45PinoutInteractive';
import { CoaxialBNCStepWorkshop } from './CoaxialBNCStepWorkshop';
import { CableTesterSimulation } from './CableTesterSimulation';

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
  const [activeTab, setActiveTab] = useState<'utp' | 'coax' | 'tester' | 'label_safety'>('utp');

  // UTP Dual-End State
  const [wiringStandard, setWiringStandard] = useState<WiringStandardType>(
    initialPayload?.wiringStandard ?? 'T568B_STRAIGHT'
  );

  const [sideASequence, setSideASequence] = useState<string[]>(() => {
    if (initialPayload?.sideAWireSequence && initialPayload.sideAWireSequence.length === 8) {
      return [...initialPayload.sideAWireSequence];
    }
    if (initialPayload?.wireSequence && initialPayload.wireSequence.length === 8) {
      return [...initialPayload.wireSequence];
    }
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

  const [sideBSequence, setSideBSequence] = useState<string[]>(() => {
    if (initialPayload?.sideBWireSequence && initialPayload.sideBWireSequence.length === 8) {
      return [...initialPayload.sideBWireSequence];
    }
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

  const [sideAStrippingMm, setSideAStrippingMm] = useState<number>(
    initialPayload?.sideAStrippingMm ?? initialPayload?.strippingLengthMm ?? 14
  );
  const [jacketUnderStrainRelief, setJacketUnderStrainRelief] = useState<boolean>(
    initialPayload?.jacketUnderStrainRelief ?? true
  );
  const [sideACrimped, setSideACrimped] = useState<boolean>(
    initialPayload?.sideACrimped ?? initialPayload?.rj45Crimped ?? false
  );
  const [sideBCrimped, setSideBCrimped] = useState<boolean>(
    initialPayload?.sideBCrimped ?? initialPayload?.rj45Crimped ?? false
  );

  // Coaxial 4-Step State
  const [coaxDetails, setCoaxDetails] = useState<CoaxAssemblyDetails>(() => {
    if (initialPayload?.coaxDetails) {
      return { ...initialPayload.coaxDetails };
    }
    return {
      currentStep: 1,
      jacketStripped: initialPayload?.coaxialStrippedProperly ?? true,
      braidFoldedBack: true,
      dielectricTrimmed: true,
      centerConductorExposedMm: 6.5,
      bncFitted: true,
      bncType: initialPayload?.bncType ?? 'COMPRESSION',
      shortCheckDone: true,
      hasShort: initialPayload?.centerPinShortShieldCheck ?? false,
      compressionCrimped: initialPayload?.bncCrimped ?? false,
    };
  });

  // Tester Simulation Results
  const [cableTesterPassed, setCableTesterPassed] = useState<boolean>(
    initialPayload?.cableTesterPassed ?? false
  );
  const [videoSignalPassed, setVideoSignalPassed] = useState<boolean>(
    initialPayload?.videoSignalOutputPassed ?? false
  );

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

  // Score Calculation
  let correctPinsA = 0;
  let correctPinsB = 0;
  for (let i = 0; i < 8; i++) {
    if (sideASequence[i] === T568B_COLOR_SEQUENCE[i]) correctPinsA++;
    if (sideBSequence[i] === T568B_COLOR_SEQUENCE[i]) correctPinsB++;
  }

  // 1. RJ45 T568B Dual-End Score (12 pts)
  const utpPinScore = Math.round(((correctPinsA + correctPinsB) / 16) * 8);
  const utpPrepScore =
    (sideAStrippingMm >= 12 && sideAStrippingMm <= 15 ? 1 : 0) +
    (jacketUnderStrainRelief ? 1 : 0) +
    (sideACrimped && sideBCrimped ? 2 : sideACrimped || sideBCrimped ? 1 : 0);
  const rj45TotalScore = Math.min(12, utpPinScore + utpPrepScore);

  // 2. Coaxial 4-Step Score (10 pts)
  const isCoaxFullyPrepared =
    coaxDetails.jacketStripped && coaxDetails.braidFoldedBack && coaxDetails.dielectricTrimmed;
  const bncScore =
    (isCoaxFullyPrepared ? 3 : 0) +
    (coaxDetails.bncType === 'COMPRESSION' ? 3 : coaxDetails.bncType === 'CRIMP' ? 2 : 1) +
    (!coaxDetails.hasShort ? 2 : 0) +
    (coaxDetails.compressionCrimped ? 2 : 0);

  // 3. Labeling Score (6 pts)
  const labelingScore =
    (cableId.trim().length >= 5 ? 2 : 0) +
    (sourceLabel.trim().length > 0 && destLabel.trim().length > 0 ? 2 : 0) +
    (cableId.includes('CAM') || cableId.includes('01') ? 2 : 1);

  // 4. Safety Checklist (7 pts)
  const safetyScore =
    (cutSafetyGloves ? 2 : 0) + (eyeProtection ? 2 : 0) + (cleanWorkArea ? 3 : 0);

  const totalScore = Math.min(35, rj45TotalScore + bncScore + labelingScore + safetyScore);

  const handleFinish = () => {
    const payload: Station1Payload = {
      wiringStandard,
      wireSequence: sideASequence,
      sideAWireSequence: sideASequence,
      sideBWireSequence: sideBSequence,
      sideAStrippingMm,
      sideBStrippingMm: sideAStrippingMm,
      strippingLengthMm: sideAStrippingMm,
      jacketUnderStrainRelief,
      sideACrimped,
      sideBCrimped,
      rj45Crimped: sideACrimped && sideBCrimped,

      coaxialStrippedProperly: isCoaxFullyPrepared,
      bncType: coaxDetails.bncType,
      centerPinShortShieldCheck: coaxDetails.hasShort,
      bncCrimped: coaxDetails.compressionCrimped,
      coaxDetails,

      cableTesterPassed,
      videoSignalOutputPassed: videoSignalPassed,

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
      <div className="w-full max-w-5xl bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-xl text-sky-400">
              🔌
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                Station 1 of 3 · 3D Structured Cabling Workshop
              </span>
              <h2 className="text-lg font-black text-white">
                การเข้าหัวสาย RJ45 Cat6 (2 ฝั่ง), Coaxial RG6 4 ขั้นตอน & ทดสอบสัญญาณ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-mono">
              คะแนนสถานี: <strong className="text-sky-400">{totalScore}</strong> / 35
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('utp')}
            className={`py-2 px-4 rounded-t-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'utp'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.1 RJ45 Dual-End (A-B) ({rj45TotalScore}/12)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coax')}
            className={`py-2 px-4 rounded-t-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'coax'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.2 Coaxial RG6 & BNC 4 สเต็ป ({bncScore}/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tester')}
            className={`py-2 px-4 rounded-t-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tester'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.3 Simulation วัดสาย & สัญญาณ CCTV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('label_safety')}
            className={`py-2 px-4 rounded-t-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'label_safety'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1.4 Cable Tag & ความปลอดภัย ({labelingScore + safetyScore}/13)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: UTP & RJ45 DUAL END */}
          {activeTab === 'utp' && (
            <RJ45PinoutInteractive
              sideASequence={sideASequence}
              sideBSequence={sideBSequence}
              onChangeSideA={setSideASequence}
              onChangeSideB={setSideBSequence}
              strippingMm={sideAStrippingMm}
              onChangeStrippingMm={setSideAStrippingMm}
              jacketUnderStrainRelief={jacketUnderStrainRelief}
              onChangeJacketStrainRelief={setJacketUnderStrainRelief}
              sideACrimped={sideACrimped}
              sideBCrimped={sideBCrimped}
              onCrimpSideA={() => setSideACrimped(true)}
              onCrimpSideB={() => setSideBCrimped(true)}
              wiringStandard={wiringStandard}
              onChangeWiringStandard={setWiringStandard}
            />
          )}

          {/* TAB 2: COAXIAL RG6 & BNC 4-STEP */}
          {activeTab === 'coax' && (
            <CoaxialBNCStepWorkshop
              details={coaxDetails}
              onChangeDetails={setCoaxDetails}
              onFinishCoax={() => setActiveTab('tester')}
            />
          )}

          {/* TAB 3: TESTER SIMULATION */}
          {activeTab === 'tester' && (
            <CableTesterSimulation
              sideASequence={sideASequence}
              sideBSequence={sideBSequence}
              sideACrimped={sideACrimped}
              sideBCrimped={sideBCrimped}
              sideAStrippingMm={sideAStrippingMm}
              jacketUnderStrainRelief={jacketUnderStrainRelief}
              coaxDetails={coaxDetails}
              wiringStandard={wiringStandard}
              onTestComplete={(utpPass, coaxPass) => {
                setCableTesterPassed(utpPass);
                setVideoSignalPassed(coaxPass);
              }}
            />
          )}

          {/* TAB 4: LABELING & SAFETY */}
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
                        className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                      />
                      <span>สวมถุงมือป้องกันใบมีดคัตเตอร์บาดขณะปอกเปลือกสาย</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={eyeProtection}
                        onChange={(e) => setEyeProtection(e.target.checked)}
                        className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                      />
                      <span>สวมแว่นตานิรภัยป้องกันเศษลวดทองแดงและเปลือกกระเด็น</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={cleanWorkArea}
                        onChange={(e) => setCleanWorkArea(e.target.checked)}
                        className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
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
            {correctPinsA === 8 &&
            correctPinsB === 8 &&
            sideACrimped &&
            sideBCrimped &&
            coaxDetails.compressionCrimped &&
            !coaxDetails.hasShort
              ? '✓ ภารกิจสถานีที่ 1 ผ่านเกณฑ์มาตรฐานสูงสุด พร้อมส่งผลประเมิน'
              : 'กรุณาตรวจสอบการเรียงสาย T568B ทั้ง 2 ฝั่ง และกดย้ำหัวต่อให้ครบทั้ง RJ45 และ BNC'}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
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

