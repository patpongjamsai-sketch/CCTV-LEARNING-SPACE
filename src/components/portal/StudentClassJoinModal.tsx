'use client';

import React, { useState } from 'react';
import { PV_CLASSES, type PvClassCode } from '../../lib/classes/classGroups';

type StudentClassJoinModalProps = {
  currentDisplayName?: string;
  currentStudentCode?: string | null;
  onSuccess?: (joined: { classId: string; classCode: string; classTitle: string }) => void;
};

export function StudentClassJoinModal({
  currentDisplayName = '',
  currentStudentCode = '',
  onSuccess,
}: StudentClassJoinModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<PvClassCode>('PV1');
  const [studentCode, setStudentCode] = useState<string>(currentStudentCode || '');
  const [displayName, setDisplayName] = useState<string>(
    currentDisplayName === 'ผู้เรียน' || currentDisplayName === 'ผู้ใช้ใหม่'
      ? ''
      : currentDisplayName,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = studentCode.trim();
    const trimmedName = displayName.trim();

    if (!trimmedCode || trimmedCode.length < 5) {
      setErrorMsg('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (อย่างน้อย 5 ตัวอักษร เช่น 69219090001)');
      return;
    }
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลจริงของคุณ');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinCode: selectedGroup,
          studentCode: trimmedCode,
          displayName: trimmedName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถลงทะเบียนเข้ากลุ่มเรียนได้');
      }

      if (onSuccess) {
        onSuccess(data);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 p-6 md:p-8 text-slate-100 relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl">
            🎓
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ลงทะเบียนเข้าห้องเรียน ปวช.1
            </h2>
            <p className="text-xs text-slate-400">
              วิชากล้องวงจรปิดบนระบบเครือข่าย (21909-2020)
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          ยินดีต้อนรับสู่ระบบฝึกปฏิบัติการ 3D กรุณาเลือกรหัสกลุ่มเรียนของคุณ
          พร้อมระบุรหัสนักศึกษาและชื่อ-นามสกุล เพื่อเชื่อมโยงคะแนนและสถิติเข้าสู่ห้องเรียนจริง
        </p>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Group Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              เลือกกลุ่มเรียนของคุณ <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {PV_CLASSES.map((grp) => {
                const isSelected = selectedGroup === grp.code;
                return (
                  <button
                    key={grp.code}
                    type="button"
                    onClick={() => setSelectedGroup(grp.code)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {grp.code}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{grp.shortTitle}</div>
                        <div className="text-xs text-slate-400">{grp.title}</div>
                      </div>
                    </div>
                    <span
                      className={`text-lg ${
                        isSelected ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    >
                      {isSelected ? '●' : '○'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Code */}
          <div>
            <label
              htmlFor="student-code-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              รหัสนักศึกษา (11 หลัก) <span className="text-rose-400">*</span>
            </label>
            <input
              id="student-code-input"
              type="text"
              required
              placeholder="ตัวอย่าง 69219090001"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="student-name-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              ชื่อ - นามสกุลจริง <span className="text-rose-400">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              placeholder="เช่น นายสมชาย ใจดี"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                กำลังลงทะเบียนเข้าห้องเรียน...
              </>
            ) : (
              <>
                ยืนยันการเข้าห้องเรียนกลุ่ม {selectedGroup} →
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
