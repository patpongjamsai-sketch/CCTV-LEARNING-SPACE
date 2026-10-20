'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Activity,
  Wrench,
  Award,
  Box,
  ArrowLeft,
} from 'lucide-react';
import { ComponentSpecExplorer } from './ComponentSpecExplorer';
import { SignalFlowBuilder } from './SignalFlowBuilder';
import { ComponentDiagnosticLab } from './ComponentDiagnosticLab';
import { ComponentMasteryQuiz } from './ComponentMasteryQuiz';

export type ActiveLabMode = 'explorer' | 'builder' | 'troubleshoot' | 'quiz';

export const CctvComponentsLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ActiveLabMode>('explorer');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Bar with Navigation */}
      <nav className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าศูนย์ปฏิบัติการ</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-white">U01 ภารกิจฝึกปฏิบัติ:</span>
            <span className="text-xs text-sky-400 font-mono">5 Core CCTV Components Engineering Lab</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/labs/site-survey"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl transition-all hidden md:inline-block"
          >
            🗺️ แผนผังสำรวจพื้นที่ (2D Pre-Lab)
          </Link>

          <Link
            href="/labs/3d/room-101"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Box className="w-3.5 h-3.5" />
            <span>เข้าสู่ห้อง 3D Room 101</span>
          </Link>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                UNIT 01 INTERACTIVE SIMULATOR
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                มาตรฐานอาชีวศึกษา ปวช. 21909-2020
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ห้องปฏิบัติการเจาะลึก 5 องค์ประกอบระบบ CCTV (CCTV Components Mastery)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              สำรวจและผ่าสเปก 5 ชิ้นส่วนหลัก (รับภาพ, ส่งสัญญาณ, บันทึก, จัดการ, แสดงผล) พร้อมตัวจำลองคำนวณ Bandwidth, PoE Power Budget และภารกิจแก้ปัญหาหน้างานจริง
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('explorer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'explorer'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. ผ่าสเปก 5 องค์ประกอบ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('builder')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'builder'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. ประกอบวงจรสด</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('troubleshoot')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'troubleshoot'
                  ? 'bg-rose-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>3. แก้ปัญหาหน้างาน</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'quiz'
                  ? 'bg-purple-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>4. แบบทดสอบสัมฤทธิ์ผล</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Mode Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeMode === 'explorer' && <ComponentSpecExplorer />}
        {activeMode === 'builder' && <SignalFlowBuilder />}
        {activeMode === 'troubleshoot' && <ComponentDiagnosticLab />}
        {activeMode === 'quiz' && <ComponentMasteryQuiz />}
      </main>
    </div>
  );
};
