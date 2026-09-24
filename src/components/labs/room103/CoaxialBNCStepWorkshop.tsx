'use client';

import React, { useState } from 'react';
import type { CoaxAssemblyDetails } from '../../../shared/domain/room103Types';

interface CoaxialBNCStepWorkshopProps {
  details: CoaxAssemblyDetails;
  onChangeDetails: (details: CoaxAssemblyDetails) => void;
  onFinishCoax: () => void;
}

export const CoaxialBNCStepWorkshop: React.FC<CoaxialBNCStepWorkshopProps> = ({
  details,
  onChangeDetails,
  onFinishCoax,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(details.currentStep || 1);
  const [multimeterTested, setMultimeterTested] = useState<boolean>(details.shortCheckDone);

  const update = (partial: Partial<CoaxAssemblyDetails>) => {
    onChangeDetails({
      ...details,
      ...partial,
      currentStep,
    });
  };

  return (
    <div className="space-y-6 text-xs select-none">
      {/* Step Navigator Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { step: 1, title: '1. ปอกสาย & พับชิลด์', icon: '✂️' },
          { step: 2, title: '2. สวมหัวต่อ BNC', icon: '🔩' },
          { step: 3, title: '3. วัดเช็กช็อตชิลด์', icon: '⚡' },
          { step: 4, title: '4. บีบอัดย้ำหัว BNC', icon: '🔧' },
        ].map((item) => {
          const isDone =
            item.step === 1
              ? details.jacketStripped && details.braidFoldedBack && details.dielectricTrimmed
              : item.step === 2
              ? details.bncFitted
              : item.step === 3
              ? details.shortCheckDone && !details.hasShort
              : details.compressionCrimped;

          const isActive = currentStep === item.step;

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                setCurrentStep(item.step as 1 | 2 | 3 | 4);
                update({ currentStep: item.step as 1 | 2 | 3 | 4 });
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isActive
                  ? 'border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/20 text-white'
                  : isDone
                  ? 'border-emerald-500/40 bg-slate-900/90 text-slate-200'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] block font-mono text-slate-400">Step 0{item.step}</span>
                <strong className="text-[11px] block mt-0.5">{item.title}</strong>
              </div>
              <span className="text-base">{isDone ? '✓' : item.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Step Container */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6">
        {/* ========================================================
            STEP 1: CABLE STRIPPING & LAYER PREPARATION
           ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  Coaxial RG6 Preparation · Step 1
                </span>
                <h4 className="text-sm font-bold text-white">
                  การปอกเปลือกนอก, พับชิลด์ถัก 95% และปอกฉนวนโฟมไดอิเล็กทริก
                </h4>
              </div>
              <span className="text-2xl">✂️</span>
            </div>

            {/* 3D Coax Layer Graphic representation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-lg flex items-center h-16 relative">
                {/* 1. Black Outer Jacket */}
                <div
                  className={`h-12 rounded-l-xl bg-slate-800 border-y border-l border-slate-600 flex items-center justify-center transition-all ${
                    details.jacketStripped ? 'w-1/3' : 'w-full rounded-r-xl'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-300 font-bold px-2 truncate">
                    เปลือกนอก PE/PVC (RG6)
                  </span>
                </div>

                {/* 2. Folded Braid Shield */}
                {details.jacketStripped && (
                  <div
                    className={`h-10 border-y flex items-center justify-center transition-all ${
                      details.braidFoldedBack
                        ? 'w-1/6 bg-gradient-to-r from-slate-400 to-slate-500 border-slate-300 shadow-md'
                        : 'w-1/4 bg-slate-600 border-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-[8px] font-mono text-slate-900 font-black px-1 truncate">
                      {details.braidFoldedBack ? 'ชิลด์พับเรียบร้อย' : 'ชิลด์ถัก 95%'}
                    </span>
                  </div>
                )}

                {/* 3. Dielectric Core */}
                {details.jacketStripped && (
                  <div
                    className={`h-8 border-y flex items-center justify-center transition-all ${
                      details.dielectricTrimmed
                        ? 'w-1/6 bg-amber-100/90 border-amber-200'
                        : 'w-1/3 bg-amber-100/40 border-amber-300'
                    }`}
                  >
                    <span className="text-[8px] font-mono text-amber-900 font-bold px-1 truncate">
                      ฉนวนโฟม
                    </span>
                  </div>
                )}

                {/* 4. Bare Solid Copper Conductor */}
                {details.dielectricTrimmed && (
                  <div className="w-1/4 h-3 rounded-r-full bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 shadow-lg shadow-amber-500/50 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-black font-black px-1">
                      แกนทองแดง {details.centerConductorExposedMm}mm
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> เปลือกนอก
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> ชิลด์ถักอลูมิเนียม 95%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-200 inline-block" /> ฉนวนโฟมไดอิเล็กทริก
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> แกนทองแดงแท้ (Bare Solid Copper)
                </span>
              </div>
            </div>

            {/* Checklists for Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={details.jacketStripped}
                  onChange={(e) => update({ jacketStripped: e.target.checked })}
                  className="rounded accent-sky-400 w-4 h-4 mt-0.5"
                />
                <div>
                  <strong className="text-slate-200 block">1. ปอกเปลือกนอก 14mm</strong>
                  <span className="text-[10px] text-slate-400">
                    ใช้คีมปอกสายโคแอกเชียลหมุน 2 รอบ ไม่ให้ใบมีดบาดชิลด์ขาด
                  </span>
                </div>
              </label>

              <label className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={details.braidFoldedBack}
                  onChange={(e) => update({ braidFoldedBack: e.target.checked })}
                  className="rounded accent-sky-400 w-4 h-4 mt-0.5"
                />
                <div>
                  <strong className="text-slate-200 block">2. พับชิลด์ถัก 95% ย้อนหลัง</strong>
                  <span className="text-[10px] text-slate-400">
                    พับเส้นลวดฝอยทาบกับเปลือกนอกรอบทิศทาง ไม่มีเส้นใดโผล่ไปข้างหน้า
                  </span>
                </div>
              </label>

              <label className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 cursor-pointer hover:border-sky-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={details.dielectricTrimmed}
                  onChange={(e) => update({ dielectricTrimmed: e.target.checked })}
                  className="rounded accent-sky-400 w-4 h-4 mt-0.5"
                />
                <div>
                  <strong className="text-slate-200 block">3. ปอกโฟมให้เห็นทองแดง 6.5mm</strong>
                  <span className="text-[10px] text-slate-400">
                    แกนทองแดงสะอาด ตรง ไม่คดงอ เพื่อเสียบเข้าพินกลางหัว BNC ได้แม่นยำ
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!(details.jacketStripped && details.braidFoldedBack && details.dielectricTrimmed)}
                onClick={() => setCurrentStep(2)}
                className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                  details.jacketStripped && details.braidFoldedBack && details.dielectricTrimmed
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ไปขั้นตอนที่ 2: สวมหัวต่อ BNC ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: BNC CONNECTOR SELECTION & SEATING
           ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  BNC Connector Selection · Step 2
                </span>
                <h4 className="text-sm font-bold text-white">
                  เลือกชนิดหัวต่อ BNC และสวมเข้ากับสาย RG6 ให้แน่นหนา
                </h4>
              </div>
              <span className="text-2xl">🔩</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'COMPRESSION',
                  name: 'BNC Compression (บีบอัด)',
                  desc: 'กันน้ำ 100%, ค่าอิมพีแดนซ์ 75Ω คงที่, แนะนำสูงสุดสำหรับช่างมืออาชีพ',
                  badge: '🌟 มาตรฐานสูงสุด',
                  color: 'border-emerald-500 bg-emerald-950/20 text-emerald-300',
                },
                {
                  id: 'CRIMP',
                  name: 'BNC Hex Crimp (ย้ำปลอก)',
                  desc: 'ใช้คีมย้ำหกเหลี่ยม แน่นปานกลาง ไม่กันน้ำ ต้องใช้เทปละลายพันทับภายนอก',
                  badge: 'มาตรฐานทั่วไป',
                  color: 'border-slate-700 bg-slate-900 text-slate-300',
                },
                {
                  id: 'TWIST_ON',
                  name: 'BNC Twist-on (เกลียวหมุน)',
                  desc: 'ไม่ต้องใช้คีม แต่หลุดง่ายมาก สัญญาณสะท้อนสูง ไม่แนะนำสำหรับกล้องความคมชัดสูง',
                  badge: '⚠️ ไม่แนะนำ',
                  color: 'border-amber-700/50 bg-amber-950/20 text-amber-300',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    details.bncType === opt.id
                      ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/20'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-slate-100 text-xs">{opt.name}</strong>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="radio"
                      name="bncSelection"
                      checked={details.bncType === opt.id}
                      onChange={() => update({ bncType: opt.id as any })}
                      className="accent-sky-400"
                    />
                    <span className="text-[11px] font-semibold text-slate-300">เลือกชนิดนี้</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Fitting push toggle */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block text-xs">
                  สวมหัว BNC เข้ากับสาย RG6 ดันจนสุด:
                </strong>
                <span className="text-[11px] text-slate-400">
                  แกนทองแดงต้องโผล่ระนาบพอดีกับปลอกหน้าสัมผัสขั้ว BNC ด้านหน้า
                </span>
              </div>
              <button
                type="button"
                onClick={() => update({ bncFitted: !details.bncFitted })}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                  details.bncFitted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                }`}
              >
                {details.bncFitted ? '✓ สวมหัว BNC เข้าสายสุดแล้ว' : 'สวมหัว BNC เข้าสาย'}
              </button>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
              >
                ⮜ ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={!details.bncFitted}
                onClick={() => setCurrentStep(3)}
                className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                  details.bncFitted
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ไปขั้นตอนที่ 3: วัดตรวจเช็ก Short-Circuit ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: MULTIMETER SHORT-CIRCUIT PRE-CRIMP CHECK
           ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  Pre-Crimp Quality Assurance · Step 3
                </span>
                <h4 className="text-sm font-bold text-white">
                  การตรวจเช็กการลัดวงจร (Short-Circuit Check) ด้วยดิจิทัลมัลติมิเตอร์
                </h4>
              </div>
              <span className="text-2xl">⚡</span>
            </div>

            {/* Multimeter Virtual Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 block">DIGITAL MULTIMETER CONTINUITY</span>
                    <strong className="text-lg font-mono text-white">
                      {multimeterTested
                        ? details.hasShort
                          ? '0.0 Ω (BEEP! SHORT DETECTED)'
                          : 'O.L (∞ Ω - NO SHORT / PASS)'
                        : '--- Ω (กดเพื่อวัดค่า)'}
                    </strong>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      multimeterTested
                        ? details.hasShort
                          ? 'bg-rose-500 animate-ping'
                          : 'bg-emerald-500'
                        : 'bg-slate-700'
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>หลักการช่าง:</strong> นำสายโพรบสีแดงแตะที่ <strong>แกนทองแดงกลาง (Center Pin)</strong>{' '}
                  และสายโพรบสีดำแตะที่ <strong>ตัวถังชิลด์ภายนอก (Outer Shield)</strong> หากมีเสียง Beep ดังต่อเนื่อง
                  แสดงว่ามีเศษลวดชิลด์แตะแกนกลาง สัญญาณภาพจะมืดสนิท (No Video) ต้องแยกชิลด์ออกทันทีก่อนย้ำ
                </p>
              </div>

              {/* Short Defect Toggle & Action */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={details.hasShort}
                    onChange={(e) => {
                      update({ hasShort: e.target.checked });
                    }}
                    className="rounded accent-rose-500 w-4 h-4"
                  />
                  <span>
                    จำลองสถานการณ์: มีเศษลวดชิลด์ถักแตะแกนกลาง (Defect Simulation)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMultimeterTested(true);
                    update({ shortCheckDone: true });
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
                >
                  ⚡ นำหัววัดมัลติมิเตอร์แตะวัดความต้านทาน (Measure Continuity)
                </button>

                {multimeterTested && (
                  <div
                    className={`p-3 rounded-xl border text-[11px] font-semibold ${
                      details.hasShort
                        ? 'border-rose-500/50 bg-rose-950/30 text-rose-300'
                        : 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                    }`}
                  >
                    {details.hasShort
                      ? '⚠️ ตรวจพบการลัดวงจร! กรุณาปลดติ๊กเพื่อดึงเศษชิลด์ออกก่อนทำการย้ำหัวต่อ'
                      : '✓ ยอดเยี่ยม! ฉนวนไดอิเล็กทริกสมบูรณ์ แกนกลางไม่ช็อตกับชิลด์ (พร้อมย้ำหัว)'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
              >
                ⮜ ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={!multimeterTested || details.hasShort}
                onClick={() => setCurrentStep(4)}
                className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                  multimeterTested && !details.hasShort
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ไปขั้นตอนที่ 4: ย้ำ/บีบอัดหัว BNC ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: COMPRESSION TOOLING & CRIMPING
           ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  Compression Tooling · Step 4
                </span>
                <h4 className="text-sm font-bold text-white">
                  การใช้คีมบีบอัดล็อกหัวต่อ BNC Compression ให้แน่นหนาถาวร
                </h4>
              </div>
              <span className="text-2xl">🔧</span>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
              <div
                className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 ${
                  details.compressionCrimped
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 scale-110 shadow-emerald-500/30'
                    : 'border-sky-500/50 bg-slate-950 text-sky-400 animate-pulse'
                }`}
              >
                {details.compressionCrimped ? '✓' : '🛠️'}
              </div>

              <div>
                <strong className="text-sm text-slate-100 block">
                  {details.compressionCrimped
                    ? 'หัว BNC ถูกบีบอัดล็อกเข้ากับสาย RG6 แน่นหนาตามมาตรฐาน IP67 เรียบร้อยแล้ว'
                    : 'วางหัว BNC ลงในร่องคีมบีบอัดแนวราบ (Linear Compression Crimp Tool)'}
                </strong>
                <p className="text-[11px] text-slate-400 max-w-md mt-1">
                  แรงดันจากแกนไฮดรอลิก/คานงัดจะดันวงแหวนทองเหลืองเข้าล็อกกับเปลือกสายอย่างแน่นหนา
                  ไม่หลุดเมื่อถูกแรงดึง และป้องกันความชื้นซึมเข้าสาย 100%
                </p>
              </div>

              <button
                type="button"
                onClick={() => update({ compressionCrimped: true })}
                className={`px-8 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all ${
                  details.compressionCrimped
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 active:scale-95'
                }`}
              >
                {details.compressionCrimped ? '✓ บีบอัดหัวต่อสำเร็จแล้ว' : '🔧 กดคีมบีบอัดย้ำหัว BNC (Compress)'}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
              >
                ⮜ ย้อนกลับ
              </button>

              <button
                type="button"
                disabled={!details.compressionCrimped}
                onClick={onFinishCoax}
                className={`px-6 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                  details.compressionCrimped
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ✓ เสร็จสิ้นการเข้าหัวสาย Coaxial (RG6)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
