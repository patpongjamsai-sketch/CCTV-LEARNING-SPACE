'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { createUnit1Submission } from '../../../../client/game/createUnit1Submission';

const App = dynamic(
  () => import('../../../../App').then((mod) => mod.App),
  {
    ssr: false,
    loading: () => (
      <div className="portal-lab-loading flex items-center justify-center min-h-[600px] text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>กำลังเตรียมห้องปฏิบัติการ 3D WebGL...</span>
        </div>
      </div>
    ),
  },
);

export type LabClientContainerProps = {
  learner: {
    id: string;
    displayName: string;
    studentCode?: string | null;
  };
  roomId: string;
  classId: string;
  unitId: string;
  missionId: string;
  roomTitle: string;
};

type FinalizeResponse = {
  attemptId: string;
  approvedScore: number;
  passed: boolean;
  missionScores: Record<'M1' | 'M2' | 'M3' | 'M4' | 'M5', number>;
  mandatoryChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    clientLiveViewActive: boolean;
  };
};

export function LabClientContainer({
  learner,
  roomId,
  classId,
  unitId: _unitId,
  missionId,
  roomTitle,
}: LabClientContainerProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<FinalizeResponse | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const handleSessionStart = async () => {
    const clientSessionId = crypto.randomUUID();
    const res = await fetch('/api/game/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        classId,
        clientSessionId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'ไม่สามารถเปิดเซสชันเกมได้');
    }

    setActiveSessionId(data.id);
  };

  const handleCompleted = async (submission: ReturnType<typeof createUnit1Submission>) => {
    if (!activeSessionId) {
      setFinalizeError('ไม่พบ Active Session ID สำหรับบันทึกคะแนน');
      return;
    }

    try {
      const res = await fetch(`/api/game/sessions/${encodeURIComponent(activeSessionId)}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId,
          firstEventSequence: 1,
          lastEventSequence: 10,
          answerState: submission,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การประเมินคะแนนล้มเหลว');
      }

      setResult(data);
    } catch (err) {
      setFinalizeError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งผลประเมิน');
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950">
      {/* 3D Simulation Game */}
      <App
        learner={learner}
        onSessionStart={handleSessionStart}
        onCompleted={handleCompleted}
      />

      {/* Final Assessment Result Modal */}
      {result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 text-center flex flex-col gap-4">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto text-3xl border ${
                result.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {result.passed ? '🎉' : '📝'}
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase text-sky-400">
                Server-Authoritative Evaluation
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">
                {result.passed ? 'ผ่านการประเมินภารกิจ!' : 'สรุปผลการทดสอบ'}
              </h2>
              <p className="text-xs text-slate-400">{roomTitle}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">คะแนนที่ได้รับอนุมัติจากระบบ</span>
              <div className="text-4xl font-extrabold text-white my-1 font-mono">
                <span className={result.passed ? 'text-emerald-400' : 'text-amber-400'}>
                  {result.approvedScore}
                </span>
                <span className="text-lg text-slate-500 font-normal"> / 100</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  result.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {result.passed ? 'เกณฑ์ผ่าน: ผ่านแล้ว (>= 80%)' : 'เกณฑ์ผ่าน: ยังไม่ผ่าน (ต้องการ >= 80%)'}
              </span>
            </div>

            {/* Mandatory checks */}
            <div className="text-left bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
              <strong className="block text-slate-300 font-semibold mb-1">การตรวจสอบระบบสำคัญ:</strong>
              <div className="flex items-center justify-between">
                <span>กล้องวงจรปิดออนไลน์ (Camera Online):</span>
                <span className={result.mandatoryChecks.cameraOnline ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.mandatoryChecks.cameraOnline ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>เชื่อมต่อ NVR สำเร็จ (NVR Reachable):</span>
                <span className={result.mandatoryChecks.nvrReachable ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.mandatoryChecks.nvrReachable ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>แสดงภาพสดที่ Client PC (Live View):</span>
                <span className={result.mandatoryChecks.clientLiveViewActive ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.mandatoryChecks.clientLiveViewActive ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="/"
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all text-center shadow-lg shadow-sky-500/20"
              >
                กลับสู่แดชบอร์ด
              </a>
            </div>
          </div>
        </div>
      )}

      {finalizeError && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-950/90 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-xs shadow-2xl flex items-center gap-3">
          <span>{finalizeError}</span>
          <button
            type="button"
            onClick={() => setFinalizeError(null)}
            className="text-rose-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
