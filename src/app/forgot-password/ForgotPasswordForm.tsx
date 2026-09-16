'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from './actions';
import { INITIAL_AUTH_ACTION_STATE } from '../../lib/auth/flows';

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <div className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-brand-mark">CCTV</span>
          <h1>ลืมรหัสผ่าน</h1>
          <p>กรอกอีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
        </div>

        {state.error && (
          <div className="portal-alert-error" role="alert">
            {state.error}
          </div>
        )}

        {state.message && (
          <div className="portal-alert-success" role="status">
            {state.message}
          </div>
        )}

        <form action={formAction} className="portal-auth-form">
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

          <button type="submit" disabled={isPending} className="portal-auth-submit">
            {isPending ? 'กำลังส่งข้อมูล…' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
          </button>
        </form>

        <div className="portal-auth-links">
          <a href="/login" className="portal-auth-link">
            ← กลับไปหน้าเข้าสู่ระบบ
          </a>
          <a href="/" className="portal-auth-link">
            หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}
