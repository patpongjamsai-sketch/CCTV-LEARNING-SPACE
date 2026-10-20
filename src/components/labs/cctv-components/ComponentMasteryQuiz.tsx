'use client';

import React, { useState } from 'react';
import { MASTERY_QUIZ_QUESTIONS } from './cctvComponentsData';
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ComponentMasteryQuiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const question = MASTERY_QUIZ_QUESTIONS[currentIndex] || MASTERY_QUIZ_QUESTIONS[0]!;
  const userChoice = selectedAnswers[question.id];

  const handleSelectChoice = (index: number) => {
    if (isAnswerRevealed) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: index,
    }));
    setIsAnswerRevealed(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < MASTERY_QUIZ_QUESTIONS.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = MASTERY_QUIZ_QUESTIONS[nextIndex];
      setCurrentIndex(nextIndex);
      setIsAnswerRevealed(nextQuestion ? selectedAnswers[nextQuestion.id] !== undefined : false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsAnswerRevealed(false);
    setIsCompleted(false);
  };

  // Calculate score
  const correctCount = MASTERY_QUIZ_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const scorePercent = Math.round((correctCount / MASTERY_QUIZ_QUESTIONS.length) * 100);
  const isPassed = scorePercent >= 70;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
            MASTERY ASSESSMENT · 10 QUESTIONS
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            แบบทดสอบประเมินสัมฤทธิ์ผล: 5 องค์ประกอบระบบ CCTV
          </h3>
          <p className="text-xs text-slate-400">
            ทดสอบความรู้เชิงทฤษฎีและมาตรฐานวิศวกรรมช่าง เพื่อรับใบประกาศนียบัตรเสมือน (เกณฑ์ผ่าน 70%)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">ความคืบหน้า</div>
            <div className="text-sm font-bold font-mono text-purple-400">
              ข้อที่ {currentIndex + 1} / {MASTERY_QUIZ_QUESTIONS.length}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="เริ่มทำแบบทดสอบใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCompleted ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-sky-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / MASTERY_QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-sky-400 font-bold tracking-wider">
              หมวด: {question.category.toUpperCase()}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentIndex + 1}. {question.questionTh}
            </h4>
          </div>

          {/* 4 Choices */}
          <div className="space-y-3">
            {question.optionsTh.map((opt, i) => {
              const isSelected = userChoice === i;
              const isCorrect = i === question.correctIndex;

              let btnStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';
              if (isAnswerRevealed) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/70 border-rose-400 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectChoice(i)}
                  disabled={isAnswerRevealed}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-300 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </div>

                  {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Box */}
          {isAnswerRevealed && (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 text-xs leading-relaxed text-indigo-200 space-y-1 animate-in fade-in duration-200">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>คำอธิบายหลักการทางวิศวกรรม:</span>
              </div>
              <p className="text-slate-300">{question.explanationTh}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswerRevealed && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{currentIndex < MASTERY_QUIZ_QUESTIONS.length - 1 ? 'ข้อถัดไป' : 'ดูผลการประเมิน'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Result & Certificate Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-3xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl mx-auto border border-purple-500/30">
            {isPassed ? '🏆' : '📚'}
          </div>

          <div>
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              ASSESSMENT COMPLETED
            </span>
            <h3 className="text-2xl font-bold text-white mt-2">
              {isPassed ? '🎉 ยินดีด้วย! คุณผ่านการประเมิน 5 องค์ประกอบ CCTV' : 'ยังไม่ผ่านเกณฑ์ 70% (แนะนำให้ทบทวน)'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              คะแนนของคุณ: <strong className="text-emerald-400 font-bold text-lg">{correctCount}</strong> / 10 ข้อ ({scorePercent}%)
            </p>
          </div>

          {/* Virtual Certificate Card */}
          {isPassed && (
            <div className="bg-gradient-to-b from-slate-950 to-indigo-950/60 border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
              <div className="flex items-start justify-between border-b border-amber-500/30 pb-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-widest">
                    CERTIFICATE OF ENGINEERING MASTERY
                  </div>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    CCTV System Specialist: Level 1 (Fundamentals & Components)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    หลักสูตรวิชาชีพช่างกล้องวงจรปิดบนระบบเครือข่าย (หลักสูตร ปวช. 21909-2020)
                  </p>
                </div>
                <Award className="w-10 h-10 text-amber-400 shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">สถานะการประเมิน:</span>
                  <span className="text-emerald-400 font-bold">✓ PASSED ({scorePercent}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ระดับมาตรฐาน:</span>
                  <span className="text-amber-300 font-bold">COMMISSIONING GRADE A</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ทำแบบทดสอบอีกครั้ง</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
