'use client';

import React, { useState } from 'react';
import {
  ROOM103_ZONES,
  ROOM103_CABLE_CATALOG,
  Room103ZoneId,
  Room103CableOptionId,
  type Station2Payload,
} from '../../../shared/domain/room103Types';
import {
  WarehouseCabling3DDiorama,
  type CablingTabId,
} from './WarehouseCabling3DDiorama';

interface Room103CablingSelectionModalProps {
  initialPayload?: Partial<Station2Payload>;
  onSave: (payload: Station2Payload, score: number) => void;
  onClose: () => void;
}

export const Room103CablingSelectionModal: React.FC<Room103CablingSelectionModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Partial<Record<Room103ZoneId, Room103CableOptionId>>
  >(initialPayload?.selectedOptions || {});
  const [activeZoneId, setActiveZoneId] = useState<Room103ZoneId>('ZONE_OVER_AIR');
  const [active3DTab, setActive3DTab] = useState<CablingTabId>('ZONE_OVER_AIR');
  const [stressTestActive, setStressTestActive] = useState<boolean>(false);

  // Route Safety
  const [avoidHeatSource, setAvoidHeatSource] = useState(
    initialPayload?.routeSafety?.avoidHeatSource ?? true
  );
  const [respectBendRadius, setRespectBendRadius] = useState(
    initialPayload?.routeSafety?.respectBendRadius ?? true
  );
  const [separateHighVoltagePower, setSeparateHighVoltagePower] = useState(
    initialPayload?.routeSafety?.separateHighVoltagePower ?? true
  );

  // Waterproofing
  const [junctionBoxMounted, setJunctionBoxMounted] = useState(
    initialPayload?.waterproofing?.junctionBoxMounted ?? true
  );
  const [cableGlandTightened, setCableGlandTightened] = useState(
    initialPayload?.waterproofing?.cableGlandTightened ?? true
  );
  const [downwardDripLoop, setDownwardDripLoop] = useState(
    initialPayload?.waterproofing?.downwardDripLoop ?? true
  );

  // Labeling & PPE Safety
  const [sourceDestLabelsApplied, setSourceDestLabelsApplied] = useState(
    initialPayload?.labelingAndSafety?.sourceDestLabelsApplied ?? true
  );
  const [cableTiesOrganized, setCableTiesOrganized] = useState(
    initialPayload?.labelingAndSafety?.cableTiesOrganized ?? true
  );
  const [ppeSafetyChecklistPassed, setPpeSafetyChecklistPassed] = useState(
    initialPayload?.labelingAndSafety?.ppeSafetyChecklistPassed ?? true
  );

  const zoneKeys = Object.keys(ROOM103_ZONES) as Room103ZoneId[];
  const activeZone = ROOM103_ZONES[activeZoneId];

  const handleSelectCable = (cableId: Room103CableOptionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [activeZoneId]: cableId,
    }));
  };

  // Calculate score
  let correctZonesCount = 0;
  for (const zk of zoneKeys) {
    if (selectedOptions[zk] === ROOM103_ZONES[zk].correctOptionId) {
      correctZonesCount++;
    }
  }

  // 1. Zone selections: 15 pts (3 pts per zone)
  const zoneScore = correctZonesCount * 3;

  // 2. Route safety: 8 pts
  const routeScore =
    (avoidHeatSource ? 3 : 0) + (respectBendRadius ? 2 : 0) + (separateHighVoltagePower ? 3 : 0);

  // 3. Waterproofing: 7 pts
  const waterScore =
    (junctionBoxMounted ? 3 : 0) + (cableGlandTightened ? 2 : 0) + (downwardDripLoop ? 2 : 0);

  // 4. Labeling & Safety: 5 pts
  const safetyScore =
    (sourceDestLabelsApplied ? 2 : 0) + (cableTiesOrganized ? 1 : 0) + (ppeSafetyChecklistPassed ? 2 : 0);

  const totalScore = Math.min(35, zoneScore + routeScore + waterScore + safetyScore);

  const handleFinish = () => {
    const payload: Station2Payload = {
      selectedOptions,
      routeSafety: {
        avoidHeatSource,
        respectBendRadius,
        separateHighVoltagePower,
      },
      waterproofing: {
        junctionBoxMounted,
        cableGlandTightened,
        downwardDripLoop,
      },
      labelingAndSafety: {
        sourceDestLabelsApplied,
        cableTiesOrganized,
        ppeSafetyChecklistPassed,
      },
      score: totalScore,
      isCompleted: true,
    };

    onSave(payload, totalScore);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-6xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl text-purple-400">
              🏗️
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400">
                Station 2 of 3 · 3D Interactive Warehouse & Site Cabling
              </span>
              <h2 className="text-lg font-black text-white">
                การเลือกชนิดสายสัญญาณ & อุปกรณ์ป้องกันทางกายภาพ 5 จุดงาน
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-mono">
              คะแนนสถานี: <strong className="text-purple-400">{totalScore}</strong> / 35
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top 3D Interactive Diorama */}
          <WarehouseCabling3DDiorama
            selectedOptions={selectedOptions}
            activeZoneId={activeZoneId}
            onSelectZone={(zid) => {
              setActiveZoneId(zid);
              setActive3DTab(zid);
            }}
            activeTab={active3DTab}
            onSetTab={(tab) => {
              setActive3DTab(tab);
              if (tab !== 'OVERVIEW') {
                setActiveZoneId(tab);
              }
            }}
            stressTestActive={stressTestActive}
            onToggleStressTest={() => setStressTestActive((prev) => !prev)}
          />

          {/* Bottom Grid: Controls & Catalog */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 5 Site Zones Selector & Physical Protection */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  จุดงานจำลองในคลังสินค้า (5 จุด):
                </span>
                <span className="text-xs text-purple-400 font-mono font-bold">
                  เลือกถูกต้อง {correctZonesCount} / 5 จุด
                </span>
              </div>

              <div className="space-y-2">
                {zoneKeys.map((zk, idx) => {
                  const zone = ROOM103_ZONES[zk];
                  const selected = selectedOptions[zk];
                  const isSelected = activeZoneId === zk;
                  const isCorrect = selected === zone.correctOptionId;

                  return (
                    <div
                      key={zk}
                      onClick={() => {
                        setActiveZoneId(zk);
                        setActive3DTab(zk);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-400 bg-purple-500/10 shadow-lg'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <strong className="text-xs text-slate-200 block">
                          {idx + 1}. {zone.nameTh}
                        </strong>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{zone.locationTh}</p>
                      </div>

                      {selected ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isCorrect ? '✓ ตรงสเปก' : 'ยังไม่ตรง'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">รอเลือก</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Physical Route Protection Checklist */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <strong className="block text-slate-200">แนวทางเดินสาย & การป้องกันน้ำ:</strong>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={avoidHeatSource}
                      onChange={(e) => setAvoidHeatSource(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>หลีกเลี่ยงแหล่งความร้อนและท่อไอเสีย</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={respectBendRadius}
                      onChange={(e) => setRespectBendRadius(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>รักษารัศมีดัดโค้ง (Bend Radius $\ge$ 4 เท่าของขนาดสาย)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={separateHighVoltagePower}
                      onChange={(e) => setSeparateHighVoltagePower(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>แยกแนวเดินสายจากสายไฟฟ้ากำลัง 380V (ป้องกัน EMI)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={downwardDripLoop}
                      onChange={(e) => setDownwardDripLoop(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>ทำโค้งหยดน้ำ (Drip Loop) ป้องกันน้ำไหลย้อนเข้าจุดต่อ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={junctionBoxMounted}
                      onChange={(e) => setJunctionBoxMounted(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>ติดตั้งกล่องพักสายกันน้ำ (IP66 Junction Box)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={cableGlandTightened}
                      onChange={(e) => setCableGlandTightened(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>ขันเคเบิลแกลนด์กันน้ำแน่นหนา (Cable Gland Sealed)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={sourceDestLabelsApplied}
                      onChange={(e) => setSourceDestLabelsApplied(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>ติด Label ระบุ Cable ID ต้นทาง/ปลายทางตรงตามแบบ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={cableTiesOrganized}
                      onChange={(e) => setCableTiesOrganized(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>รัดสายด้วยเคเบิลไทร์เป็นระเบียบ ไม่รัดแน่นจนบีบสาย</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={ppeSafetyChecklistPassed}
                      onChange={(e) => setPpeSafetyChecklistPassed(e.target.checked)}
                      className="rounded accent-purple-400 w-4 h-4 cursor-pointer"
                    />
                    <span>สวมอุปกรณ์ PPE ความปลอดภัย (ถุงมือกันบาด/แว่นตานิรภัย)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Zone Detail & Cable Catalog Selection */}
            <div className="lg:col-span-7 space-y-4">
              {/* Active Zone Detail Header */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                    ACTIVE ZONE
                  </span>
                  <h3 className="font-bold text-white text-sm">{activeZone.nameTh}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-purple-400">สภาพแวดล้อม: </strong>
                  {activeZone.environmentTh}
                </p>
                {selectedOptions[activeZoneId] && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                    <span className="text-slate-400 block mb-1">สาย/อุปกรณ์ที่เลือกไว้:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {ROOM103_CABLE_CATALOG[selectedOptions[activeZoneId]!]?.icon}
                      </span>
                      <strong className="text-sky-300">
                        {ROOM103_CABLE_CATALOG[selectedOptions[activeZoneId]!]?.nameTh}
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {activeZone.explanationTh}
                    </p>
                  </div>
                )}
              </div>

              {/* Catalog Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  เลือกสายสัญญาณหรืออุปกรณ์ป้องกันที่เหมาะสมกับจุดนี้ (แสดงผล 3D ทันที):
                </span>
                <div className="space-y-2">
                  {(Object.keys(ROOM103_CABLE_CATALOG) as Room103CableOptionId[]).map((cid) => {
                    const spec = ROOM103_CABLE_CATALOG[cid];
                    const isPicked = selectedOptions[activeZoneId] === cid;
                    return (
                      <div
                        key={cid}
                        onClick={() => handleSelectCable(cid)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                          isPicked
                            ? 'border-purple-500 bg-purple-500/10 shadow-md'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl pt-1">{spec.icon}</div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-200">{spec.nameTh}</strong>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-400">
                              {spec.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {spec.descriptionTh}
                          </p>
                          <span className="text-[10px] text-emerald-400/90 font-medium block mt-1">
                            💡 เหมาะสำหรับ: {spec.idealApplicationTh}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {correctZonesCount === 5
              ? '✓ เลือกสายและอุปกรณ์ครบถ้วนถูกต้องทั้ง 5 จุดงานตามมาตรฐาน 3D'
              : `เลือกถูกแล้ว ${correctZonesCount}/5 จุดงาน (ต้องการให้ถูกต้องครบถ้วน)`}
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              บันทึกและส่งผลสถานีที่ 2 ({totalScore}/35)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

