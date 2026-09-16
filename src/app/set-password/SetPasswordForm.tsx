'use client';

import { useActionState } from 'react';
import { setPasswordAction } from './actions';
import { INITIAL_AUTH_ACTION_STATE } from '../../lib/auth/flows';

export function SetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    setPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <div className="portal-auth-page">
      <div className="portal-auth-card">
        <div className="portal-auth-header">
          <span className="portal-brand-mark">CCTV</span>
          <h1>ตั้งรหัสผ่านใหม่</h1>
          <p>กำหนดรหัสผ่านสำหรับเข้าใช้งานระบบ (อย่างน้อย 12 ตัวอักษร)</p>
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
            <label htmlFor="password">รหัสผ่านใหม่</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className="portal-form-input"
              placeholder="ความยาวอย่างน้อย 12 ตัวอักษร"
            />
          </div>

          <div className="portal-form-group">
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              className="portal-form-input"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            />
          </div>

          <button type="submit" disabled={isPending} className="portal-auth-submit">
            {isPending ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่านใหม่'}
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
