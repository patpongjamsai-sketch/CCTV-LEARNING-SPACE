'use client';

import { useActionState, useState } from 'react';
import { googleOAuthAction, loginAction, signUpAction } from './actions';
import { INITIAL_AUTH_ACTION_STATE } from '../../lib/auth/flows';

type LoginFormProps = { nextPath?: string; errorMessage?: string };
type AuthMode = 'login' | 'first-time' | 'signup';

type StudentLookupResult = {
  found: boolean;
  studentId: string;
  fullName: string;
  email: string;
  groupTitle: string;
  groupCode: string;
  isActivated: boolean;
};

export function LoginForm({ nextPath = '/', errorMessage }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, INITIAL_AUTH_ACTION_STATE);
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState(signUpAction, INITIAL_AUTH_ACTION_STATE);

  // State for First-Time Setup
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentLookupResult | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);
  const [setupSuccessMsg, setSetupSuccessMsg] = useState<string | null>(null);
  const [setupErrorMsg, setSetupErrorMsg] = useState<string | null>(null);

  const state = mode === 'login' ? loginState : signUpState;
  const displayError = mode === 'first-time' ? setupErrorMsg : (state.error || errorMessage);

  // Handler to search student info
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) {
      setLookupError('กรุณากรอกรหัสนักศึกษา 11 หลัก เช่น 69219090001');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setStudentInfo(null);
    setSetupErrorMsg(null);

    try {
      const res = await fetch(`/api/auth/first-time-setup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่พบข้อมูลในระบบ');
      }
      setStudentInfo(data);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handler to submit first-time password setup
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo) return;

    if (!newPassword || newPassword.length < 6) {
      setSetupErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSetupErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setIsSubmittingSetup(true);
    setSetupErrorMsg(null);

    try {
      const res = await fetch('/api/auth/first-time-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: studentInfo.studentId,
          password: newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่าน');
      }

      setSetupSuccessMsg(`✓ ${data.message} กำลังนำท่านเข้าสู่ระบบ...`);
      setTimeout(() => {
        window.location.href = nextPath || '/';
      }, 1200);
    } catch (err) {
      setSetupErrorMsg(err instanceof Error ? err.message : 'ไม่สามารถตั้งรหัสผ่านได้');
    } finally {
      setIsSubmittingSetup(false);
    }
  };

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
          <button
            type="button"
            aria-pressed={mode === 'login'}
            className={mode === 'login' ? 'portal-auth-tab is-active' : 'portal-auth-tab'}
            onClick={() => setMode('login')}
          >
            เข้าสู่ระบบด้วยอีเมล
          </button>
          <button
            type="button"
            aria-pressed={mode === 'first-time'}
            className={mode === 'first-time' ? 'portal-auth-tab is-active' : 'portal-auth-tab'}
            onClick={() => {
              setMode('first-time');
              setSetupErrorMsg(null);
            }}
          >
            ตั้งรหัสผ่านครั้งแรก
          </button>
          <button
            type="button"
            aria-pressed={mode === 'signup'}
            className={mode === 'signup' ? 'portal-auth-tab is-active' : 'portal-auth-tab'}
            onClick={() => setMode('signup')}
          >
            สมัครสมาชิก
          </button>
        </div>

        {displayError && <div className="portal-alert-error" role="alert">{displayError}</div>}
        {state.message && <div className="portal-alert-success" role="status">{state.message}</div>}
        {setupSuccessMsg && <div className="portal-alert-success" role="status">{setupSuccessMsg}</div>}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <>
            <form action={loginFormAction} className="portal-auth-form">
              <input type="hidden" name="next" value={nextPath} />
              
              <div className="portal-form-group">
                <label htmlFor="login-email">อีเมล (@utc.ac.th)</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="portal-form-input"
                  placeholder="69219090001@utc.ac.th"
                />
                <p className="text-xs text-slate-500 mt-1">
                  * ใช้อีเมลวิทยาลัย เช่น <code className="text-teal-700 bg-slate-100 px-1 py-0.5 rounded">69219090001@utc.ac.th</code>
                </p>
              </div>

              <AuthPasswordField id="login-password" autoComplete="current-password" />

              <div className="portal-auth-helper-row">
                <button
                  type="button"
                  onClick={() => setMode('first-time')}
                  className="text-xs text-teal-600 hover:text-teal-700 hover:underline font-medium"
                >
                  🎓 นักเรียนเข้าใช้งานครั้งแรก? คลิกตั้งรหัสผ่าน
                </button>
                <a href="/forgot-password" className="portal-auth-link text-xs">
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <button type="submit" disabled={isLoginPending} className="portal-auth-submit">
                {isLoginPending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <div className="portal-auth-divider"><span>หรือ</span></div>

            <form action={googleOAuthAction}>
              <input type="hidden" name="next" value={nextPath} />
              <button type="submit" className="portal-google-button">
                <span className="portal-google-icon" aria-hidden="true">G</span>
                เข้าสู่ระบบด้วย Google
              </button>
            </form>
          </>
        )}

        {/* MODE: FIRST-TIME ACTIVATION */}
        {mode === 'first-time' && (
          <div className="portal-auth-form">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 mb-2">
              <strong>🎓 สำหรับนักศึกษาใหม่ 40 คน:</strong> กรอกรหัสประจำตัวนักศึกษาเพื่อตรวจสอบข้อมูล และตั้งรหัสผ่านใหม่สำหรับเข้าใช้งานได้ทันที
            </div>

            {!studentInfo ? (
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="portal-form-group">
                  <label htmlFor="lookup-student-id">รหัสประจำตัวนักศึกษา หรืออีเมล (@utc.ac.th)</label>
                  <div className="flex gap-2">
                    <input
                      id="lookup-student-id"
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      required
                      placeholder="เช่น 69219090001"
                      className="portal-form-input flex-1"
                    />
                    <button
                      type="submit"
                      disabled={isLookingUp}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                    >
                      {isLookingUp ? 'ตรวจ...' : 'ตรวจสอบ'}
                    </button>
                  </div>
                  {lookupError && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{lookupError}</p>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleSetupSubmit} className="space-y-4">
                {/* Student Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm space-y-1">
                  <div className="text-xs text-slate-500 font-medium">ข้อมูลนักศึกษาที่พบในระบบ:</div>
                  <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <span>👤</span> {studentInfo.fullName}
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between pt-1">
                    <span>รหัส: <strong className="text-slate-800">{studentInfo.studentId}</strong></span>
                    <span>ชั้นเรียน: <strong className="text-teal-700">{studentInfo.groupTitle}</strong></span>
                  </div>
                  <div className="text-xs text-slate-600 pt-0.5">
                    อีเมลสำหรับเข้าสู่ระบบ: <strong className="text-teal-800 bg-teal-100/70 px-1 rounded">{studentInfo.email}</strong>
                  </div>
                  {studentInfo.isActivated && (
                    <div className="text-xs text-amber-600 font-medium pt-1">
                      ⚠️ บัญชีนี้เคยเปิดใช้งานแล้ว หากกรอกด้านล่างจะเป็นการเปลี่ยนรหัสผ่านใหม่
                    </div>
                  )}
                </div>

                <div className="portal-form-group">
                  <label htmlFor="new-password">กำหนดรหัสผ่านใหม่</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    maxLength={128}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="portal-form-input"
                    placeholder="อย่างน้อย 6 ตัวอักษรขึ้นไป"
                  />
                </div>

                <div className="portal-form-group">
                  <label htmlFor="confirm-new-password">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="portal-form-input"
                    placeholder="กรอกรหัสผ่านเหมือนช่องแรก"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentInfo(null);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition"
                  >
                    เปลี่ยนรหัส
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSetup}
                    className="portal-auth-submit flex-1"
                  >
                    {isSubmittingSetup ? 'กำลังบันทึก…' : '✓ ยืนยันรหัสผ่านและเข้าสู่ระบบ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE: SIGNUP */}
        {mode === 'signup' && (
          <form action={signUpFormAction} className="portal-auth-form">
            <input type="hidden" name="next" value={nextPath} />
            <AuthEmailField id="signup-email" />
            <AuthPasswordField id="signup-password" autoComplete="new-password" />
            <div className="portal-form-group">
              <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
                className="portal-form-input"
                placeholder="กรอกรหัสผ่านเดิมอีกครั้ง"
              />
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
  return (
    <div className="portal-form-group">
      <label htmlFor={id}>อีเมล (@utc.ac.th)</label>
      <input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        required
        className="portal-form-input"
        placeholder="69219090001@utc.ac.th"
      />
    </div>
  );
}

function AuthPasswordField({ id, autoComplete }: { id: string; autoComplete: string }) {
  return (
    <div className="portal-form-group">
      <label htmlFor={id}>รหัสผ่าน</label>
      <input
        id={id}
        name="password"
        type="password"
        autoComplete={autoComplete}
        required
        minLength={autoComplete === 'new-password' ? 12 : undefined}
        maxLength={128}
        className="portal-form-input"
        placeholder="••••••••••••"
      />
    </div>
  );
}
