'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_SCENARIOS } from './cctvComponentsData';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Activity,
  Terminal,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const ComponentDiagnosticLab: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [solvedTickets, setSolvedTickets] = useState<Record<string, boolean>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const scenario = DIAGNOSTIC_SCENARIOS[selectedScenarioIndex] || DIAGNOSTIC_SCENARIOS[0]!;
  const isTicketSolved = solvedTickets[scenario.id] === true;

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    setShowExplanation(true);

    const chosen = scenario.options.find((o) => o.id === optId);
    if (chosen?.isCorrect) {
      setSolvedTickets((prev) => ({
        ...prev,
        [scenario.id]: true,
      }));
    }
  };

  const handleNextTicket = () => {
    if (selectedScenarioIndex < DIAGNOSTIC_SCENARIOS.length - 1) {
      setSelectedScenarioIndex(selectedScenarioIndex + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    }
  };

  const handleResetAll = () => {
    setSolvedTickets({});
    setSelectedOptionId(null);
    setShowExplanation(false);
  };

  const solvedCount = Object.values(solvedTickets).filter(Boolean).length;
  const totalScore = solvedCount * 20;

  return (
    <div className="space-y-6">
      {/* Header with Technician Status & Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            FIELD TECHNICIAN DISPATCH
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            ภารกิจจำลองแก้ปัญหาหน้างานจริง (Diagnostic Troubleshooting Lab)
          </h3>
          <p className="text-xs text-slate-400">
            สวมบทบาทเป็นช่างเทคนิค CCTV เพื่อตรวจหาสาเหตุและเลือกวิธีแก้ไขข้อบกพร่องตามหลักวิศวกรรม
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">คะแนนแก้ปัญหา</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {totalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">ผ่านแล้ว</div>
            <div className="text-sm font-bold text-sky-400">
              {solvedCount} / {DIAGNOSTIC_SCENARIOS.length} เคส
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="รีเซ็ตทุกเคส"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket List Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {DIAGNOSTIC_SCENARIOS.map((scen, idx) => {
          const isSelected = idx === selectedScenarioIndex;
          const isPassed = solvedTickets[scen.id];

          return (
            <button
              key={scen.id}
              type="button"
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setSelectedOptionId(null);
                setShowExplanation(false);
              }}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="font-bold text-slate-400">{scen.ticketNo}</span>
                {isPassed && <span className="text-emerald-400 font-bold">✓ สำเร็จ</span>}
              </div>
              <div className="text-xs font-semibold line-clamp-1">{scen.titleTh}</div>
            </button>
          );
        })}
      </div>

      {/* Main Ticket Investigation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ticket Detail & Evidence (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {scenario.urgency.toUpperCase()} PRIORITY
                </span>
                <h4 className="text-base font-bold text-white mt-1.5">{scenario.titleTh}</h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  📍 {scenario.location} · รายงานโดย {scenario.reporter}
                </div>
              </div>
            </div>

            {/* Symptom Description */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1.5">
                📝 อาการเสียที่ได้รับแจ้ง (Reported Symptom):
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {scenario.symptomTh}
              </p>
            </div>

            {/* Field Measurements & Multimeter Evidence */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>ผลตรวจวัดเครื่องมือช่างหน้างาน (Field Diagnostic Evidence):</span>
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">มิเตอร์วัดกำลังไฟ PoE:</span>
                    <span className="text-amber-300 font-bold">{scenario.techEvidence.multimeterPoE}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">คำสั่ง Network Ping:</span>
                    <span className="text-sky-300 font-bold">{scenario.techEvidence.pingStatus}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <Wrench className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">การตรวจสภาพเชิงกายภาพ:</span>
                    <span className="text-slate-300 font-sans text-xs">{scenario.techEvidence.physicalCheck}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Diagnosis & Solution Options (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>การวิเคราะห์สาเหตุและเลือกวิธีแก้ไขปัญหา (Root Cause & Solution):</span>
            </h4>

            {/* 3 Options */}
            <div className="space-y-3">
              {scenario.options.map((opt, i) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.isCorrect;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-950/70 border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-rose-950/70 border-rose-400 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">
                          ทางเลือกที่ {i + 1}: {opt.causeTh}
                        </div>
                        <div className="text-xs text-sky-400 mt-1">
                          🛠️ <strong>วิธีแก้ไข:</strong> {opt.actionTh}
                        </div>
                      </div>

                      <div className="shrink-0 mt-0.5">
                        {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                      </div>
                    </div>

                    {/* Inline Explanation */}
                    {showExplanation && isSelected && (
                      <div
                        className={`mt-3 pt-3 border-t text-xs leading-relaxed animate-in fade-in duration-200 ${
                          isCorrect ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {opt.explanationTh}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-400">
                {isTicketSolved ? '🎉 คุณแก้ไขปัญหานี้ถูกต้อง (+20 คะแนน)' : 'เลือกการวินิจฉัยที่คุณคิดว่าถูกต้องที่สุด'}
              </span>

              {selectedScenarioIndex < DIAGNOSTIC_SCENARIOS.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextTicket}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>เคสถัดไป</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
