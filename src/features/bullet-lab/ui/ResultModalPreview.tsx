'use client';

import React from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { Award, X, Shield, MapPin, Ruler, Wrench, Eye } from 'lucide-react';

export const ResultModalPreview: React.FC = () => {
  const showResultModal = useBulletLabStore((s) => s.showResultModal);
  const setShowResultModal = useBulletLabStore((s) => s.setShowResultModal);
  const selectedMountPoint = useBulletLabStore((s) => s.selectedMountPoint);
  const surfaceType = useBulletLabStore((s) => s.surfaceType);
  const pan = useBulletLabStore((s) => s.pan);
  const tilt = useBulletLabStore((s) => s.tilt);
  const rotation = useBulletLabStore((s) => s.rotation);
  const pullTestForceN = useBulletLabStore((s) => s.pullTestForceN);
  const mission4Submission = useBulletLabStore((s) => s.mission4Submission);
  const submissionsBySurface = useBulletLabStore((s) => s.submissionsBySurface);
  const resetLab = useBulletLabStore((s) => s.resetLab);

  if (!showResultModal) return null;

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
                สรุปผลการฝึกติดตั้ง Bullet Camera V1
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

        {/* Dimension Competency Overview */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            มิติสมรรถนะงานช่าง (Skill Dimensions Preview)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                ความปลอดภัย & PPE
              </span>
              <span className="font-mono font-semibold text-emerald-400">
                ★★★★★ (พร้อมปฏิบัติงาน)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                สำรวจหน้างาน (จุด {selectedMountPoint})
              </span>
              <span className="font-mono font-semibold text-cyan-400">
                ★★★★☆ (เหมาะสม)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Ruler className="w-3.5 h-3.5 text-indigo-400" />
                วัดระยะ & มาร์กตำแหน่ง
              </span>
              <span className="font-mono font-semibold text-indigo-400">
                ★★★★★ (แม่นยำ)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
                การเจาะ ยึดฐาน & ล็อกกล้อง
              </span>
              <span className="font-mono font-semibold text-purple-400">
                ★★★★☆ (ยึดแน่นหนา)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                มุมมอง & ทดสอบแรงดึง ({pullTestForceN}N)
              </span>
              <span className="font-mono font-semibold text-emerald-400">
                ★★★★★ (ผ่านการตรวจ)
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                ใบงานประเมิน 4 หน้าต่าง (M4)
              </span>
              <span className="font-mono font-semibold text-cyan-400">
                {Object.values(submissionsBySurface).filter(Boolean).length > 0
                  ? `สำเร็จ ${Object.values(submissionsBySurface).filter(Boolean).length}/4 ผนัง (${mission4Submission?.score ?? 0}p)`
                  : 'ยังไม่ได้บันทึก'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Lab Configuration Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-slate-500">ชนิดผนัง:</span>{' '}
            <span className="font-medium text-slate-200 capitalize">
              {surfaceType}
            </span>
          </div>
          <div>
            <span className="text-slate-500">จุดติดตั้ง:</span>{' '}
            <span className="font-medium text-slate-200">
              ตำแหน่ง {selectedMountPoint}
            </span>
          </div>
          <div>
            <span className="text-slate-500">มุมปรับกล้อง:</span>{' '}
            <span className="font-medium text-slate-200 font-mono">
              P:{pan}° T:{tilt}° R:{rotation}°
            </span>
          </div>
          <div>
            <span className="text-slate-500">แรงดึงทดสอบ:</span>{' '}
            <span className="font-medium text-slate-200 font-mono">
              {pullTestForceN} N
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              resetLab();
              setShowResultModal(false);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            เริ่มฝึกใหม่ (Reset)
          </button>
          <button
            onClick={() => setShowResultModal(false)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            กลับสู่การจำลอง (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
