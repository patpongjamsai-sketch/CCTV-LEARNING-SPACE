'use client';

import React from 'react';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { Award, X, RotateCcw } from 'lucide-react';
import { SurfaceType } from '../types';
import { SURFACES_DATA } from '../data/domeLabData';

export const ResultModalPreview: React.FC = () => {
  const showResultModal = useDomeLabStore((s) => s.showResultModal);
  const setShowResultModal = useDomeLabStore((s) => s.setShowResultModal);
  const submissionsBySurface = useDomeLabStore((s) => s.submissionsBySurface);
  const resetLab = useDomeLabStore((s) => s.resetLab);

  if (!showResultModal) return null;

  const surfaceKeys: SurfaceType[] = ['wood', 'metal', 'concrete', 'smartboard'];
  const completedSurfaces = surfaceKeys.filter((k) => submissionsBySurface[k] !== null);
  const totalScore = completedSurfaces.reduce((acc, k) => {
    const sub = submissionsBySurface[k];
    return acc + (sub ? sub.score : 0);
  }, 0);
  const avgScore = completedSurfaces.length > 0 ? Math.round(totalScore / completedSurfaces.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                สรุปผลการฝึกติดตั้ง Dome Camera V1
              </h2>
              <p className="text-xs text-slate-400">
                Installation Practice Summary & Technical Attributes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResultModal(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Score & Rating */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">คะแนนเฉลี่ยรวมทุกพื้นผิว:</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
              {avgScore} / 100 <span className="text-xs font-normal text-slate-400">คะแนน</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              avgScore >= 80
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                : avgScore >= 70
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                : 'bg-amber-950 text-amber-300 border-amber-500/60'
            }`}>
              {avgScore >= 80 ? 'เกรด A · ช่างชำนาญการ' : avgScore >= 70 ? 'เกรด B · ผ่านเกณฑ์มาตรฐาน' : 'ต้องฝึกฝนเพิ่มเติม'}
            </span>
          </div>
        </div>

        {/* 4 Surface Breakdown */}
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
            ผลการประเมินรายพื้นผิว (4 Surface Worksheets)
          </h3>

          <div className="space-y-1.5">
            {surfaceKeys.map((sKey) => {
              const sInfo = SURFACES_DATA[sKey];
              const sub = submissionsBySurface[sKey];
              return (
                <div
                  key={sKey}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sInfo.color }} />
                    <span className="text-slate-200">{sInfo.nameTh}</span>
                  </div>
                  {sub ? (
                    <span className={`font-mono font-bold ${sub.isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sub.score}/100 ({sub.isPassed ? 'ผ่าน' : 'ปรับปรุง'})
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">ยังไม่ทำ</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              setShowResultModal(false);
              resetLab();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>เริ่มฝึกปฏิบัติใหม่</span>
          </button>
          <button
            onClick={() => setShowResultModal(false)}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg border border-cyan-400/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>ปิดหน้าต่าง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
