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
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lookupNotice, setLookupNotice] = useState<string | null>(null);

  // Auto-lookup student details when typing 11-digit student ID
  const handleStudentCodeChange = async (val: string) => {
    setStudentCode(val);
    const trimmed = val.trim();
    if (trimmed.length === 11 && /^\d+$/.test(trimmed)) {
      try {
        const res = await fetch(`/api/auth/first-time-setup?query=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.fullName) {
            setDisplayName(data.fullName);
            if (data.groupCode && (data.groupCode === 'PV1' || data.groupCode === 'PV2' || data.groupCode === 'PV3')) {
              setSelectedGroup(data.groupCode);
            }
            setLookupNotice(`พบข้อมูล: ${data.fullName} (${data.groupTitle || data.groupCode})`);
            return;
          }
        }
      } catch {
        // Ignore background lookup errors (user can enter manually)
      }
    }
    setLookupNotice(null);
  };

  const handleSelectGroup = (code: PvClassCode) => {
    setSelectedGroup(code);
    setErrorMsg(null);
    // Auto-focus next field if code is empty
    if (!studentCode.trim()) {
      const codeInput = document.getElementById('student-code-input') as HTMLInputElement | null;
      codeInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = studentCode.trim();
    const trimmedName = displayName.trim();

    if (!trimmedCode || trimmedCode.length < 5) {
      setErrorMsg('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (อย่างน้อย 5 ตัวอักษร เช่น 69219090001 หรือ TEST001)');
      return;
    }
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลจริงของคุณ หรือชื่อบัญชีทดสอบ');
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          joinCode: selectedGroup,
          studentCode: trimmedCode,
          displayName: trimmedName,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถลงทะเบียนเข้ากลุ่มเรียนได้');
      }

      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        } else {
          window.location.href = '/';
        }
      }, 700);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setErrorMsg('การเชื่อมต่อใช้เวลานานเกินไป กรุณากดลองใหม่อีกครั้ง');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/50 p-8 text-center text-slate-100 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4 text-emerald-400">
            ✓
          </div>
          <h3 className="text-xl font-bold text-white mb-2">ลงทะเบียนเข้าห้องเรียนสำเร็จ!</h3>
          <p className="text-sm text-emerald-300 mb-2 font-medium">
            เข้าสู่ห้องเรียนกลุ่ม {selectedGroup} เรียบร้อยแล้ว
          </p>
          <p className="text-xs text-slate-400">กำลังนำคุณเข้าสู่แดชบอร์ดบทเรียน 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 p-5 sm:p-7 text-slate-100 relative max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl shrink-0">
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

        <p className="text-xs sm:text-sm text-slate-300 mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 shrink-0">
          ยินดีต้อนรับสู่ระบบฝึกปฏิบัติการ 3D กรุณาเลือกรหัสกลุ่มเรียนของคุณ
          พร้อมระบุรหัสนักศึกษาและชื่อ-นามสกุล เพื่อเชื่อมโยงคะแนนและสถิติเข้าสู่ห้องเรียนจริง
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 shrink-0">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {/* Group Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. เลือกกลุ่มเรียนของคุณ <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                เลือกกลุ่ม: {selectedGroup}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PV_CLASSES.map((grp) => {
                const isSelected = selectedGroup === grp.code;
                return (
                  <button
                    key={grp.code}
                    type="button"
                    onClick={() => handleSelectGroup(grp.code)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {grp.code}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold">{grp.shortTitle}</div>
                        <div className="text-[11px] text-slate-400">{grp.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold hidden sm:inline-block">
                          เลือกแล้ว
                        </span>
                      )}
                      <span
                        className={`text-base ${
                          isSelected ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      >
                        {isSelected ? '●' : '○'}
                      </span>
                    </div>
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
              2. รหัสนักศึกษา (11 หลัก หรือรหัสทดสอบ) <span className="text-rose-400">*</span>
            </label>
            <input
              id="student-code-input"
              type="text"
              required
              placeholder="ตัวอย่าง 69219090001 หรือ TEST001"
              value={studentCode}
              onChange={(e) => handleStudentCodeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            {lookupNotice && (
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span>✓</span> {lookupNotice}
              </p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="student-name-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              3. ชื่อ - นามสกุลจริง (หรือชื่อผู้ทดสอบ) <span className="text-rose-400">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              placeholder="เช่น นายสมชาย ใจดี หรือ นักศึกษาทดสอบ"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Bottom error if present */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Helper Hint */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
            <span>💡</span>
            <span>เลือกกลุ่มเรียนและตรวจสอบข้อมูลแล้ว กดปุ่มยืนยันด้านล่างเพื่อเริ่มเรียน</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
