'use client';

import React, { useState } from 'react';
import { WRITTEN_CASES } from '../../../shared/domain/room102Types';

interface Room102WrittenAnalysisModalProps {
  initialAnswers?: {
    case1Answer?: string;
    case2Answer?: string;
  };
  onSave: (data: {
    case1Answer: string;
    case2Answer: string;
    case1Score: number;
    case2Score: number;
    totalScore: number;
    keywordsFound: string[];
  }) => void;
  onClose: () => void;
}

export const Room102WrittenAnalysisModal: React.FC<Room102WrittenAnalysisModalProps> = ({
  initialAnswers = {},
  onSave,
  onClose,
}) => {
  const [case1Text, setCase1Text] = useState(initialAnswers.case1Answer || '');
  const [case2Text, setCase2Text] = useState(initialAnswers.case2Answer || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Evaluate Case 1
  const case1 = WRITTEN_CASES[0]!;
  const case1Lower = case1Text.toLowerCase();
  const case1MatchedKeywords = case1.expectedKeywords.filter((k) =>
    case1Lower.includes(k.toLowerCase())
  );
  // Scoring: 5 pts for having at least 30 chars, +5 pts each for up to 2 key concept hits (max 15)
  let case1Score = 0;
  if (case1Text.trim().length >= 25) {
    case1Score = 5 + Math.min(10, case1MatchedKeywords.length * 5);
  }

  // Evaluate Case 2
  const case2 = WRITTEN_CASES[1]!;
  const case2Lower = case2Text.toLowerCase();
  const case2MatchedKeywords = case2.expectedKeywords.filter((k) =>
    case2Lower.includes(k.toLowerCase())
  );
  let case2Score = 0;
  if (case2Text.trim().length >= 25) {
    case2Score = 5 + Math.min(10, case2MatchedKeywords.length * 5);
  }

  const totalScore = case1Score + case2Score; // max 30 points
  const allKeywordsFound = [...case1MatchedKeywords, ...case2MatchedKeywords];
  const isFormValid = case1Text.trim().length >= 20 && case2Text.trim().length >= 20;

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsSubmitted(true);
    onSave({
      case1Answer: case1Text,
      case2Answer: case2Text,
      case1Score,
      case2Score,
      totalScore,
      keywordsFound: allKeywordsFound,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl text-xl">✍️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  STATION 3: WRITTEN CASE STUDY
                </span>
                <span className="text-xs text-slate-400">แท่นวิเคราะห์ปัญหาหน้างาน & พิมพ์ตอบ</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                การวิเคราะห์สาเหตุและเสนอทางแก้ปัญหาตามหลักวิศวกรรม CCTV
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/30">
                คะแนน: {totalScore} / 30 คะแนน
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions banner */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
            <span className="text-lg shrink-0">📝</span>
            <div className="space-y-1">
              <strong className="text-amber-300 block">คำชี้แจงสำหรับช่างผู้ปฏิบัติการ:</strong>
              <p>
                ให้อ่านสถานการณ์ปัญหาจริงที่เกิดขึ้นในโรงเรียนอัจฉริยะทั้ง 2 ข้อ
                แล้วพิมพ์วิเคราะห์สาเหตุเชิงลึกพร้อมระบุเทคโนโลยี/สเปกกล้องที่ใช้แก้ปัญหาลงในช่องว่าง
                ระบบจะตรวจวิเคราะห์คำศัพท์สำคัญ (Keyword Analysis) และบันทึกคำตอบส่งไปยังระบบฐานข้อมูล
              </p>
            </div>
          </div>

          {/* Case 1: Backlight / WDR */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                {case1.id}
              </span>
              <span className="text-xs font-mono text-slate-400">คะแนนเต็ม {case1.maxScore} คะแนน</span>
            </div>

            <h3 className="font-bold text-sm text-white">{case1.titleTh}</h3>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <strong className="text-amber-400 block">📌 รายงานอาการจากโรงเรียน:</strong>
              <p>{case1.scenarioTh}</p>
            </div>

            <div className="text-xs text-sky-200 font-medium pt-1">
              ❓ <strong className="text-sky-300">คำถาม:</strong> {case1.questionTh}
            </div>

            {/* Input Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={case1Text}
                onChange={(e) => setCase1Text(e.target.value)}
                disabled={isSubmitted}
                rows={4}
                placeholder="พิมพ์คำตอบของคุณที่นี่... (เช่น วิเคราะห์สาเหตุเรื่องแสงย้อน, เสนอเทคโนโลยี WDR และหลักการทำงาน)"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  คำสำคัญที่ตรวจพบ:{' '}
                  {case1MatchedKeywords.length > 0 ? (
                    <span className="text-emerald-400 font-mono font-bold">
                      {case1MatchedKeywords.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">ยังไม่พบคำสำคัญ (เช่น WDR, ย้อนแสง)</span>
                  )}
                </span>
                <span className="font-mono">{case1Text.length} ตัวอักษร</span>
              </div>
            </div>

            {/* Model answer revealed after submission */}
            {isSubmitted && (
              <div className="mt-3 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 font-bold">✓ แนวคำตอบมาตรฐานระดับช่างมืออาชีพ:</strong>
                  <span className="text-emerald-400 font-mono font-bold">
                    คะแนนที่ได้: {case1Score} / {case1.maxScore}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {case1.sampleExpertAnswerTh}
                </p>
              </div>
            )}
          </div>

          {/* Case 2: Vandalism / IK10 */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {case2.id}
              </span>
              <span className="text-xs font-mono text-slate-400">คะแนนเต็ม {case2.maxScore} คะแนน</span>
            </div>

            <h3 className="font-bold text-sm text-white">{case2.titleTh}</h3>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <strong className="text-amber-400 block">📌 รายงานอาการจากโรงเรียน:</strong>
              <p>{case2.scenarioTh}</p>
            </div>

            <div className="text-xs text-sky-200 font-medium pt-1">
              ❓ <strong className="text-sky-300">คำถาม:</strong> {case2.questionTh}
            </div>

            {/* Input Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={case2Text}
                onChange={(e) => setCase2Text(e.target.value)}
                disabled={isSubmitted}
                rows={4}
                placeholder="พิมพ์คำตอบของคุณที่นี่... (เช่น ระบุกล้องทรงโดม Vandal-Proof, มาตรฐาน IK10 และโครงสร้างฝาครอบ)"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  คำสำคัญที่ตรวจพบ:{' '}
                  {case2MatchedKeywords.length > 0 ? (
                    <span className="text-emerald-400 font-mono font-bold">
                      {case2MatchedKeywords.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">ยังไม่พบคำสำคัญ (เช่น IK10, โดม, กันกระแทก)</span>
                  )}
                </span>
                <span className="font-mono">{case2Text.length} ตัวอักษร</span>
              </div>
            </div>

            {/* Model answer revealed after submission */}
            {isSubmitted && (
              <div className="mt-3 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 font-bold">✓ แนวคำตอบมาตรฐานระดับช่างมืออาชีพ:</strong>
                  <span className="text-emerald-400 font-mono font-bold">
                    คะแนนที่ได้: {case2Score} / {case2.maxScore}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {case2.sampleExpertAnswerTh}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {!isFormValid ? (
              <span className="text-amber-400/90">⚠️ กรุณาพิมพ์คำตอบทั้ง 2 ข้อ (อย่างน้อยข้อละ 20 ตัวอักษร)</span>
            ) : isSubmitted ? (
              <span className="text-emerald-400 font-medium">✓ บันทึกผลและตรวจสอบคำตอบแล้ว</span>
            ) : (
              <span className="text-sky-400">พร้อมส่งคำตอบวิเคราะห์ปัญหา</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition-all cursor-pointer"
              >
                ปิดหน้าต่างและกลับสู่ห้องแล็บ 3D
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`py-2.5 px-6 rounded-2xl font-bold text-xs shadow-xl transition-all ${
                  isFormValid
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                ส่งคำตอบและตรวจประเมินผล
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
