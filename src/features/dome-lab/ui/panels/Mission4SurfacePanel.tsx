'use client';

import React from 'react';
import { useDomeLabStore } from '../../store/useDomeLabStore';
import { SURFACES_DATA } from '../../data/domeLabData';
import { SurfaceType } from '../../types';
import {
  Wrench,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

export const Mission4SurfacePanel: React.FC = () => {
  const submissionsBySurface = useDomeLabStore((s) => s.submissionsBySurface);
  const setIsMission4ModalOpen = useDomeLabStore((s) => s.setIsMission4ModalOpen);
  const setSurfaceType = useDomeLabStore((s) => s.setSurfaceType);
  const setShowResultModal = useDomeLabStore((s) => s.setShowResultModal);

  const surfaceKeys: SurfaceType[] = ['wood', 'metal', 'concrete', 'smartboard'];
  const completedCount = surfaceKeys.filter((k) => submissionsBySurface[k] !== null).length;
  const isAllCompleted = completedCount === 4;

  const totalScore = surfaceKeys.reduce((acc, k) => {
    const sub = submissionsBySurface[k];
    return acc + (sub ? sub.score : 0);
  }, 0);
  const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

  return (
    <div className="p-4 space-y-4 text-slate-200 select-none">
      {/* Header Banner */}
      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Wrench className="w-4 h-4" />
          <span>ภารกิจที่ 4: ใบงานติดตั้ง 4 พื้นผิว & ประกอบโดม</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          รวมขั้นตอนการเจาะ ยึดพุก ประกอบกล้องโดม (ยางกันน้ำ, วงแหวนกัน IR) และทดสอบแรงดึง แยก 4 หน้าต่างตามวัสดุพื้นผิว โดยนักเรียนต้องเลือกคำตอบเองข้อ 2–7
        </p>
      </div>

      {/* OVERALL PROGRESS CARD */}
      <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">ความคืบหน้ารวม 4 พื้นผิว</span>
          <span className="font-mono text-cyan-400 font-bold">
            {completedCount} / 4 ชนิดพื้นผิว
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${(completedCount / 4) * 100}%` }}
          />
        </div>

        {completedCount > 0 && (
          <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-800/80">
            <span className="text-slate-400">คะแนนเฉลี่ยปัจจุบัน:</span>
            <span
              className={`font-mono font-bold ${
                averageScore >= 80
                  ? 'text-emerald-400'
                  : averageScore >= 70
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
            >
              {averageScore} / 100 คะแนน
            </span>
          </div>
        )}
      </div>

      {/* 4 SURFACE STATUS CARDS */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          สถานะใบงานแยกตามวัสดุพื้นผิว
        </span>

        <div className="space-y-1.5">
          {surfaceKeys.map((sKey) => {
            const surfaceInfo = SURFACES_DATA[sKey];
            const sub = submissionsBySurface[sKey];
            const isDone = sub !== null;

            return (
              <button
                key={sKey}
                onClick={() => {
                  setSurfaceType(sKey);
                  setIsMission4ModalOpen(true);
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isDone
                    ? sub.isPassed
                      ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-950/50'
                      : 'bg-amber-950/30 border-amber-500/50 hover:bg-amber-950/50'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                    style={{ backgroundColor: surfaceInfo.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {surfaceInfo.nameTh}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {surfaceInfo.subtitleTh}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isDone ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        sub.isPassed
                          ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/40'
                          : 'bg-amber-900/80 text-amber-200 border border-amber-600/40'
                      }`}
                    >
                      {sub.score}/100 คะแนน
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      รอทำใบงาน
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PROMINENT BUTTON: OPEN 4-WINDOW WORKSHEET MODAL */}
      <div className="pt-2">
        <button
          onClick={() => setIsMission4ModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl border border-cyan-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-98"
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-200" />
          <span>เปิดหน้าต่างใบงาน 4 พื้นผิว (เลือกข้อ 2–7)</span>
        </button>
      </div>

      {/* SUMMARY MODAL TRIGGER WHEN ALL 4 DONE */}
      {isAllCompleted && (
        <div className="pt-2 animate-in fade-in duration-300">
          <button
            onClick={() => setShowResultModal(true)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl border border-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>ดูสรุปผลการประเมินและเกียรติบัตร ➜</span>
          </button>
        </div>
      )}
    </div>
  );
};
