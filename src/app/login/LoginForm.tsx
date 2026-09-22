'use client';

import { useActionState, useState } from 'react';
import { googleOAuthAction, loginAction, signUpAction } from './actions';
import { INITIAL_AUTH_ACTION_STATE } from '../../lib/auth/flows';

type LoginFormProps = { nextPath?: string; errorMessage?: string };
type AuthMode = 'login' | 'signup';

export function LoginForm({ nextPath = '/', errorMessage }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, INITIAL_AUTH_ACTION_STATE);
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState(signUpAction, INITIAL_AUTH_ACTION_STATE);
  const state = mode === 'login' ? loginState : signUpState;
  const displayError = state.error || errorMessage;

  return (
    <main className="portal-auth-page">
      <div className="portal-auth-backdrop" aria-hidden="true">
        <span className="portal-auth-scanline" />
        <span className="portal-auth-camera portal-auth-camera-left" />
        <span className="portal-auth-camera portal-auth-camera-right" />
      </div>

      <section className="portal-auth-card" aria-labelledby="auth-title">
        <div className="portal-auth-header">
          <span className="portal-auth-brand">CCTV LEARNING CENTER</span>
          <h1 id="auth-title">เข้าสู่ระบบศูนย์การเรียนรู้</h1>
          <p>วิชากล้องวงจรปิดบนระบบเครือข่าย 21909-2020</p>
        </div>

        <div className="portal-auth-tabs" aria-label="เลือกรูปแบบการเข้าใช้งาน">
          <button type="button" aria-pressed={mode === 'login'}
            className={mode === 'login' ? 'portal-auth-tab is-active' : 'portal-auth-tab'}
            onClick={() => setMode('login')}>เข้าสู่ระบบ</button>
          <button type="button" aria-pressed={mode === 'signup'}
            className={mode === 'signup' ? 'portal-auth-tab is-active' : 'portal-auth-tab'}
            onClick={() => setMode('signup')}>สมัครสมาชิก</button>
        </div>

        {displayError && <div className="portal-alert-error" role="alert">{displayError}</div>}
        {state.message && <div className="portal-alert-success" role="status">{state.message}</div>}

        <form action={googleOAuthAction}>
          <input type="hidden" name="next" value={nextPath} />
          <button type="submit" className="portal-google-button">
            <span className="portal-google-icon" aria-hidden="true">G</span>
            เข้าสู่ระบบด้วย Google
          </button>
        </form>

        <div className="portal-auth-divider"><span>หรือใช้อีเมล</span></div>

        {mode === 'login' ? (
          <form action={loginFormAction} className="portal-auth-form">
            <input type="hidden" name="next" value={nextPath} />
            <AuthEmailField id="login-email" />
            <AuthPasswordField id="login-password" autoComplete="current-password" />
            <div className="portal-auth-helper-row portal-auth-helper-row-end">
              <a href="/forgot-password" className="portal-auth-link">ลืมรหัสผ่าน?</a>
            </div>
            <button type="submit" disabled={isLoginPending} className="portal-auth-submit">
              {isLoginPending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        ) : (
          <form action={signUpFormAction} className="portal-auth-form">
            <input type="hidden" name="next" value={nextPath} />
            <AuthEmailField id="signup-email" />
            <AuthPasswordField id="signup-password" autoComplete="new-password" />
            <div className="portal-form-group">
              <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
              <input id="confirm-password" name="confirmPassword" type="password" minLength={12}
                maxLength={128} autoComplete="new-password" required className="portal-form-input"
                placeholder="กรอกรหัสผ่านเดิมอีกครั้ง" />
            </div>
            <p className="portal-password-hint">ใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร</p>
            <button type="submit" disabled={isSignUpPending} className="portal-auth-submit">
              {isSignUpPending ? 'กำลังสมัครสมาชิก…' : 'สร้างบัญชีผู้เรียน'}
            </button>
          </form>
        )}

        <p className="portal-auth-footer">การเข้าใช้งานถือว่าคุณยอมรับเงื่อนไขของศูนย์การเรียนรู้</p>
      </section>
    </main>
  );
}

function AuthEmailField({ id }: { id: string }) {
  return <div className="portal-form-group">
    <label htmlFor={id}>อีเมล</label>
    <input id={id} name="email" type="email" autoComplete="email" required
      className="portal-form-input" placeholder="student@example.com" />
  </div>;
}

function AuthPasswordField({ id, autoComplete }: { id: string; autoComplete: string }) {
  return <div className="portal-form-group">
    <label htmlFor={id}>รหัสผ่าน</label>
    <input id={id} name="password" type="password" autoComplete={autoComplete} required
      minLength={autoComplete === 'new-password' ? 12 : undefined} maxLength={128}
      className="portal-form-input" placeholder="••••••••••••" />
  </div>;
}
