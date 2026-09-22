import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../app/login/actions', () => ({
  loginAction: vi.fn(),
  signUpAction: vi.fn(),
  googleOAuthAction: vi.fn(),
}));

vi.mock('../app/forgot-password/actions', () => ({
  forgotPasswordAction: vi.fn(),
}));

vi.mock('../app/set-password/actions', () => ({
  setPasswordAction: vi.fn(),
}));

import { LoginForm } from '../app/login/LoginForm';
import { ForgotPasswordForm } from '../app/forgot-password/ForgotPasswordForm';
import { SetPasswordForm } from '../app/set-password/SetPasswordForm';

describe('Auth UI Components', () => {
  it('renders login and sign-up choices with Google OAuth', () => {
    const html = renderToStaticMarkup(<LoginForm nextPath="/labs/3d/room-101" />);

    expect(html).toContain('เข้าสู่ระบบศูนย์การเรียนรู้');
    expect(html).toContain('เข้าสู่ระบบด้วย Google');
    expect(html).toContain('สมัครสมาชิก');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('จดจำฉันไว้');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expect(html).toContain('value="/labs/3d/room-101"');
    expect(html).toContain('href="/forgot-password"');
    expect(html).toContain('type="submit"');
  });

  it('renders login error message when supplied', () => {
    const html = renderToStaticMarkup(
      <LoginForm errorMessage="อีเมลหรือรหัสผ่านไม่ถูกต้อง" />,
    );

    expect(html).toContain('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('renders the forgot-password form', () => {
    const html = renderToStaticMarkup(<ForgotPasswordForm />);

    expect(html).toContain('ลืมรหัสผ่าน');
    expect(html).toContain('name="email"');
    expect(html).toContain('ส่งลิงก์ตั้งรหัสผ่านใหม่');
    expect(html).toContain('href="/login"');
  });

  it('renders the set-password form with confirmation field', () => {
    const html = renderToStaticMarkup(<SetPasswordForm />);

    expect(html).toContain('ตั้งรหัสผ่านใหม่');
    expect(html).toContain('name="password"');
    expect(html).toContain('name="confirmPassword"');
    expect(html).toContain('บันทึกรหัสผ่านใหม่');
    expect(html).toContain('href="/login"');
  });
});
