'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { INITIAL_AUTH_ACTION_STATE } from '../../lib/auth/flows';

type LoginFormProps = {
  nextPath?: string;
  errorMessage?: string;
};

export function LoginForm({ nextPath = '/', errorMessage }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_AUTH_ACTION_STATE);

  const displayError = state.error || errorMessage;

  return (
    <div className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-brand-mark">CCTV</span>
          <h1>เข้าสู่ระบบศูนย์การเรียนรู้</h1>
          <p>กล้องวงจรปิดบนระบบเครือข่าย · CCTV Ecosystem</p>
        </div>

        {displayError && (
          <div className="portal-alert-error" role="alert">
            {displayError}
          </div>
        )}

        <form action={formAction} className="portal-auth-form">
          <input type="hidden" name="next" value={nextPath} />

          <div className="portal-form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="portal-form-input"
              placeholder="student@example.com"
            />
          </div>

          <div className="portal-form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="portal-form-input"
              placeholder="••••••••••••"
            />
          </div>

          <button type="submit" disabled={isPending} className="portal-auth-submit">
            {isPending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="portal-auth-links">
          <a href="/forgot-password" className="portal-auth-link">
            ลืมรหัสผ่าน?
          </a>
          <a href="/" className="portal-auth-link">
            ← หน้าหลัก
          </a>
        </div>

        {/* Quick Demo Access for 3D Labs */}
        <div className="pt-4 mt-2 border-t border-slate-800 text-center">
          <a
            href={
              nextPath.startsWith('/labs/3d')
                ? `${nextPath}${nextPath.includes('?') ? '&' : '?'}student_code=DEMO-TRAINEE&student_name=${encodeURIComponent('ผู้ทดลองเรียน (Trainee)')}`
                : '/labs/3d/room-101?student_code=DEMO-TRAINEE&student_name=' + encodeURIComponent('ผู้ทดลองเรียน (Trainee)')
            }
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>🎮 เข้าสู่ห้องปฏิบัติการ 3D (โหมดทดลองเรียน / Guest Access)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
