'use client';

import { useState, useEffect } from 'react';
import type { ExamQuestion } from '../../data/unitExamQuestions';

interface LessonKnowledgeCheckProps {
    question?: ExamQuestion;
}

export function LessonKnowledgeCheck({ question }: LessonKnowledgeCheckProps) {
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // Persist answered state in localStorage
    useEffect(() => {
        if (!question) return;
        const saved = localStorage.getItem(`lesson_quiz_${question.lessonId}`);
        if (saved !== null) {
            try {
                const parsed = JSON.parse(saved);
                setSelectedChoice(parsed.choice);
                setIsSubmitted(true);
            } catch {
                // Ignore parse errors
            }
        }
    }, [question]);

    if (!question) {
        return null;
    }

    const isCorrect = selectedChoice === question.answer;

    const handleSubmit = () => {
        if (selectedChoice === null) return;
        setIsSubmitted(true);
        try {
            localStorage.setItem(
                `lesson_quiz_${question.lessonId}`,
                JSON.stringify({ choice: selectedChoice, isCorrect: selectedChoice === question.answer }),
            );
        } catch {
            // Ignore storage errors
        }
    };

    const handleRetry = () => {
        setIsSubmitted(false);
        setSelectedChoice(null);
        try {
            localStorage.removeItem(`lesson_quiz_${question.lessonId}`);
        } catch {
            // Ignore storage errors
        }
    };

    return (
        <section
            className="lesson-panel mt-6 border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-sky-950/20 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            aria-labelledby="lesson-knowledge-check-title"
        >
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center font-bold text-sm">
                        💡
                    </span>
                    <div>
                        <p className="portal-kicker text-sky-400 font-mono text-[11px] mb-0 tracking-wider">
                            KNOWLEDGE CHECK · {question.lessonId}
                        </p>
                        <h2 id="lesson-knowledge-check-title" className="text-lg font-bold text-white m-0">
                            ทดสอบความเข้าใจเฉพาะทางประจำบทเรียน
                        </h2>
                    </div>
                </div>

                {isSubmitted && (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                            isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                    >
                        {isCorrect ? '✓ ตอบถูกต้อง' : '✕ ยังไม่ถูกต้อง'}
                    </span>
                )}
            </div>

            {/* Question prompt */}
            <p className="text-slate-100 text-base font-medium leading-relaxed mb-5">
                {question.prompt}
            </p>

            {/* Choices list */}
            <div className="space-y-2.5 mb-5">
                {question.choices.map((choice, index) => {
                    const isSelected = selectedChoice === index;
                    const isTheCorrectChoice = index === question.answer;

                    let choiceStyle = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/70 text-slate-200';

                    if (isSubmitted) {
                        if (isTheCorrectChoice) {
                            choiceStyle = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-200 font-semibold shadow-sm shadow-emerald-500/20';
                        } else if (isSelected && !isCorrect) {
                            choiceStyle = 'border-rose-500/70 bg-rose-950/40 text-rose-200';
                        } else {
                            choiceStyle = 'border-slate-800/40 bg-slate-950/30 text-slate-500 opacity-60';
                        }
                    } else if (isSelected) {
                        choiceStyle = 'border-sky-500 bg-sky-950/50 text-white ring-1 ring-sky-500/50 shadow-md shadow-sky-500/20';
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => setSelectedChoice(index)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${choiceStyle}`}
                        >
                            <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                                    isSubmitted && isTheCorrectChoice
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                        : isSubmitted && isSelected && !isCorrect
                                          ? 'bg-rose-500 text-white border-rose-400'
                                          : isSelected
                                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                                            : 'bg-slate-900 text-slate-400 border-slate-700'
                                }`}
                            >
                                {['ก', 'ข', 'ค', 'ง'][index]}
                            </span>
                            <span className="text-sm leading-relaxed flex-1">{choice}</span>
                        </button>
                    );
                })}
            </div>

            {/* Explanation box after submit */}
            {isSubmitted && (
                <div
                    className={`p-4 rounded-xl border mb-5 transition-all ${
                        isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                            : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                        <span>{isCorrect ? '💡 คำอธิบายเชิงเทคนิค:' : '⚠️ คำอธิบายและความรู้ที่ถูกต้อง:'}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-300 m-0">
                        {question.explanation}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-400">
                    หัวข้อ: {question.lessonTitle}
                </span>

                <div className="flex items-center gap-2">
                    {isSubmitted ? (
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                        >
                            🔄 ตอบใหม่อีกครั้ง
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={selectedChoice === null}
                            onClick={handleSubmit}
                            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-sky-600/30 cursor-pointer"
                        >
                            ยืนยันคำตอบ →
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
