'use client';

import React, { useState } from 'react';

export type TeacherManagementPanelProps = {
  classId?: string;
};

export function TeacherManagementPanel({ classId = 'default-class' }: TeacherManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<'csv' | 'override'>('csv');

  // CSV Import State
  const [csvText, setCsvText] = useState(
    'email,student_code,display_name\nstudent1@cctv.local,67301,สมชาย ใจดี\nstudent2@cctv.local,67302,สมหญิง มั่นคง',
  );
  const [targetClassId, setTargetClassId] = useState(classId);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Override State
  const [overrideStudentId, setOverrideStudentId] = useState('');
  const [overrideUnitId, setOverrideUnitId] = useState('');
  const [overridePercent, setOverridePercent] = useState('100');
  const [overridePassed, setOverridePassed] = useState(true);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideResult, setOverrideResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(targetClassId)}/students/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การนำเข้านักเรียนล้มเหลว');
      }

      setImportResult({
        success: true,
        message: `นำเข้านักเรียนสำเร็จ ${data.count} คน`,
      });
    } catch (err) {
      setImportResult({
        success: false,
        message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOverriding(true);
    setOverrideResult(null);

    try {
      const res = await fetch(
        `/api/classes/${encodeURIComponent(targetClassId)}/students/${encodeURIComponent(overrideStudentId)}/progress/${encodeURIComponent(overrideUnitId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progressPercent: Number(overridePercent),
            passed: overridePassed,
            reason: overrideReason,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การบันทึกผลล้มเหลว');
      }

      setOverrideResult({
        success: true,
        message: `บันทึกผลการเรียนเรียบร้อย (Progress ID: ${data.progressId})`,
      });
      setOverrideReason('');
    } catch (err) {
      setOverrideResult({
        success: false,
        message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก',
      });
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <section className="portal-teacher-panel bg-slate-900/90 border border-sky-500/30 rounded-2xl p-6 shadow-xl my-8 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-sky-400">Teacher & Admin Center</span>
          <h2 className="text-xl font-bold text-white mt-0.5">การจัดการชั้นเรียนและผลการเรียน</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'csv'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            นำเข้านักเรียน (CSV)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('override')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'override'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ปรับปรุงผลการเรียน (Override)
          </button>
        </div>
      </div>

      {activeTab === 'csv' && (
        <form onSubmit={handleCsvImport} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">รหัสชั้นเรียน (Class ID)</label>
            <input
              type="text"
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              ข้อมูลนักเรียนรูปแบบ CSV (email,student_code,display_name)
            </label>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">ระบบจะส่งคำเชิญและลงทะเบียนนักเรียนในชั้นเรียนนี้อัตโนมัติ</span>
            <button
              type="submit"
              disabled={isImporting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {isImporting ? 'กำลังนำเข้า...' : 'นำเข้าบัญชีนักเรียน'}
            </button>
          </div>

          {importResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border ${
                importResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {importResult.message}
            </div>
          )}
        </form>
      )}

      {activeTab === 'override' && (
        <form onSubmit={handleOverride} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">รหัสนักเรียน / Profile ID</label>
              <input
                type="text"
                placeholder="UUID ของนักเรียน"
                value={overrideStudentId}
                onChange={(e) => setOverrideStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">รหัสหน่วยการเรียนรู้ (Unit ID)</label>
              <input
                type="text"
                placeholder="UUID ของ Unit"
                value={overrideUnitId}
                onChange={(e) => setOverrideUnitId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ร้อยละความก้าวหน้า (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={overridePercent}
                onChange={(e) => setOverridePercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="overridePassed"
                checked={overridePassed}
                onChange={(e) => setOverridePassed(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="overridePassed" className="text-sm font-medium text-slate-200 cursor-pointer">
                อนุมัติให้ผ่านหน่วยการเรียนรู้นี้ (Passed)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              เหตุผลประกอบการแก้ไข (จำเป็น - เพื่อบันทึกลง Audit Log)
            </label>
            <textarea
              rows={2}
              placeholder="ระบุเหตุผล เช่น สอบแก้มือปฏิบัติในห้องเรียนผ่านตามเกณฑ์เรียบร้อย"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              ทุกรายการ Override จะถูกประทับเวลาและบันทึกผู้กระทำใน Audit Log ที่ไม่สามารถลบได้
            </span>
            <button
              type="submit"
              disabled={isOverriding}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {isOverriding ? 'กำลังบันทึก...' : 'บันทึก Teacher Override'}
            </button>
          </div>

          {overrideResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border ${
                overrideResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {overrideResult.message}
            </div>
          )}
        </form>
      )}
    </section>
  );
}
