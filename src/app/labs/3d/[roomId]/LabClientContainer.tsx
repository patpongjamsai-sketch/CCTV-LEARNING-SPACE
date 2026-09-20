'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toFinalizeResponse, type FinalizeResponse } from './finalizeResult';
import { isLabUnlocked } from '../../../../lib/progressionState';

const Cctv3DLabApp = dynamic(
  () => import('../../../../components/labs/3d/Cctv3DLabApp').then((mod) => mod.Cctv3DLabApp),
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
  returnUrl?: string | null;
};

export function LabClientContainer({
  learner,
  roomId,
  classId,
  unitId,
  missionId,
  roomTitle,
  returnUrl,
}: LabClientContainerProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<FinalizeResponse | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [unlockedState, setUnlockedState] = useState(() =>
    isLabUnlocked(unitId, undefined, learner.studentCode || learner.id),
  );

  useEffect(() => {
    const handleUpdate = () => {
      setUnlockedState(isLabUnlocked(unitId, undefined, learner.studentCode || learner.id));
    };
    window.addEventListener('cctv_approvals_updated', handleUpdate);
    return () => window.removeEventListener('cctv_approvals_updated', handleUpdate);
  }, [unitId, learner.studentCode, learner.id]);

  const handleSessionStart = async () => {
    const clientSessionId = crypto.randomUUID();
    try {
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
        setActiveSessionId(`preview-session-${clientSessionId}`);
        return;
      }

      setActiveSessionId(data.id);
    } catch {
      setActiveSessionId(`preview-session-${clientSessionId}`);
    }
  };

  const syncExternalScore = async (score: number, passed: boolean) => {
    try {
      await fetch('/api/external/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_code: learner.studentCode || learner.id,
          student_name: learner.displayName,
          room_id: roomId,
          unit_id: unitId,
          score,
          max_score: 100,
          passed,
          return_url: returnUrl || null,
        }),
      });
    } catch (err) {
      console.warn('External score sync deferred:', err);
    }
  };

  const markLabPassed = (score: number) => {
    try {
      const roomNum = parseInt(roomId.replace(/[^0-9]/g, ''), 10) || 101;
      localStorage.setItem(
        `cctv_lab_submission_${unitId}`,
        JSON.stringify({
          passed: true,
          score,
          timestamp: new Date().toISOString(),
        }),
      );
      localStorage.setItem(`cctv_lab_room_${roomNum}_completed`, 'true');
      window.dispatchEvent(new CustomEvent('cctv_approvals_updated'));
    } catch {
      // ignore
    }
  };

  const handleCompleted = async (submission: any) => {
    const sessionId = activeSessionId || `preview-session-${crypto.randomUUID()}`;

    if (sessionId.startsWith('preview-session-')) {
      const { evaluateRoomSubmission } = await import('../../../../server/game/evaluateRoomSubmission');
      const evalResult = evaluateRoomSubmission(roomId, submission);
      const finalizeRes = toFinalizeResponse(sessionId, evalResult as any);
      setResult(finalizeRes);
      void syncExternalScore(finalizeRes.approvedScore, finalizeRes.passed);
      if (finalizeRes.passed) {
        markLabPassed(finalizeRes.approvedScore);
      }
      return;
    }

    try {
      const res = await fetch(`/api/game/sessions/${encodeURIComponent(sessionId)}/finalize`, {
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
      void syncExternalScore(data.approvedScore, data.passed);
      if (data.passed) {
        markLabPassed(data.approvedScore);
      }
    } catch (err) {
      setFinalizeError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งผลประเมิน');
    }
  };

  const returnLinkWithParams = returnUrl
    ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}student_code=${encodeURIComponent(
        learner.studentCode || learner.id,
      )}&student_name=${encodeURIComponent(learner.displayName)}&room_id=${encodeURIComponent(
        roomId,
      )}&unit_id=${encodeURIComponent(unitId)}&score=${result?.approvedScore ?? 0}&passed=${
        result?.passed ? 'true' : 'false'
      }`
    : null;

  if (!unlockedState.unlocked) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl text-slate-100 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wide uppercase inline-block mb-2">
            3D Lab Prerequisite Gate
          </span>

          <h1 className="text-2xl font-black text-white">
            ห้องปฏิบัติการ 3D ยังไม่เปิดให้เข้าใช้งาน
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            {roomTitle}
          </p>

          <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3 text-xs">
            <div className="text-slate-400 font-medium leading-relaxed">
              <strong className="text-amber-300 block mb-1">เหตุผลที่ยังเข้าไม่ได้:</strong>
              {unlockedState.reason}
            </div>

            <div className="border-t border-slate-800 pt-3">
              <p className="font-bold text-slate-300 mb-2">ขั้นตอนการปลดล็อกตามแผนการเรียนรู้:</p>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>เรียนเนื้อหาครบ 10 บท + ตอบคำถามท้ายบทในหน่วยนี้</span>
                </li>
                <li className="flex items-center gap-2 text-amber-300 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>ปฏิบัติการจำลองห้อง 3D (ขั้นตอนนี้)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>แบบทดสอบ ปรนัย + อัตนัย (ปลดล็อกหลังผ่านปฏิบัติการ)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/courses/21909-2020"
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors text-center shadow-lg shadow-sky-600/20"
            >
              📖 ไปยังบทเรียนเพื่อศึกษาเนื้อหา
            </a>
            <a
              href="/teacher"
              className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-colors text-center"
            >
              👨‍🏫 แดชบอร์ดครู (ขออนุมัติสิทธิ์)
            </a>
          </div>

          <div className="mt-3">
            <a
              href="/labs"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← กลับหน้ารายการห้องปฏิบัติการทั้งหมด
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Virtual Simulation for ALL Rooms (101 - 108) */}
      <Cctv3DLabApp
        roomId={roomId}
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
                {result.passed ? 'เกณฑ์ผ่าน: ผ่านแล้ว (>= 70%)' : 'เกณฑ์ผ่าน: ยังไม่ผ่าน (ต้องการ >= 70%)'}
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

            {result.passed && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <span>🔓</span>
                  <span>ปลดล็อกขั้นตอนที่ 3 สำเร็จ!</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  คุณผ่านการทดสอบ 3D Lab แล้ว ระบบได้ปลดล็อก "แบบทดสอบ ปรนัย + อัตนัย" ประจำหน่วยนี้ให้เรียบร้อยแล้ว
                </p>
                <a
                  href="/courses/21909-2020"
                  className="inline-block mt-1 text-xs font-bold text-emerald-300 hover:text-emerald-200 underline"
                >
                  📝 ไปยังหน้าหลักเพื่อทำแบบทดสอบประจำหน่วย (Step 3) →
                </a>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {returnLinkWithParams && (
                <a
                  href={returnLinkWithParams}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>บันทึกและกลับสู่หน้าเว็บหลัก</span>
                  <span>→</span>
                </a>
              )}
              <div className="flex gap-2">
                <a
                  href="/labs"
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors text-center"
                >
                  ห้องปฏิบัติการทั้งหมด
                </a>
                <a
                  href="/"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition-colors text-center"
                >
                  กลับแดชบอร์ด
                </a>
              </div>
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
