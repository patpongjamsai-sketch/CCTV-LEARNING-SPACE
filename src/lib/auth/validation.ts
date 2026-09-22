export const AUTH_MESSAGES = {
  invalidEmail: 'กรุณากรอกอีเมลให้ถูกต้อง',
  passwordRequired: 'กรุณากรอกรหัสผ่าน',
  passwordTooShort: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 12 ตัวอักษร',
  passwordTooLong: 'รหัสผ่านต้องมีความยาวไม่เกิน 128 ตัวอักษร',
  passwordMismatch: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
  loginFailed: 'ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบอีเมลและรหัสผ่าน',
  signUpRequested: 'ตรวจสอบอีเมลของคุณเพื่อยืนยันการสมัครสมาชิก',
  signUpFailed: 'ไม่สามารถสมัครสมาชิกได้ในขณะนี้ โปรดลองอีกครั้ง',
  passwordResetRequested: 'หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว',
  sessionRequired: 'ลิงก์นี้หมดอายุหรือไม่ถูกต้อง โปรดขอลิงก์ใหม่',
  passwordUpdateFailed: 'ไม่สามารถตั้งรหัสผ่านใหม่ได้ในขณะนี้ โปรดลองอีกครั้ง',
  passwordUpdated: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว',
  requestUnavailable: 'ไม่สามารถดำเนินการได้ในขณะนี้ โปรดลองอีกครั้ง',
} as const;

type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ValidationFailure = {
  ok: false;
  message: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type LoginInput = {
  email: string;
  password: string;
};

export type SetPasswordInput = {
  password: string;
};

export type SignUpInput = LoginInput;

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MIN_NEW_PASSWORD_LENGTH = 12;
const INTERNAL_URL_ORIGIN = 'https://cctv-learning.local';
const ENCODED_PATH_SEPARATOR = /%2f|%5c/i;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' ? value : null;
}

function normalizeEmail(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email)) {
    return null;
  }

  return email;
}

function validateExistingPassword(password: string | null): ValidationFailure | null {
  if (!password) {
    return { ok: false, message: AUTH_MESSAGES.passwordRequired };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: AUTH_MESSAGES.passwordTooLong };
  }

  return null;
}

/**
 * Returns a local path only. Any external, protocol-relative, or encoded
 * separator destination falls back to the portal home page.
 */
export function safeNextPath(value: unknown, fallback = '/'): string {
  const candidate = typeof value === 'string' ? value.trim() : '';

  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.startsWith('/\\') ||
    candidate.includes('\\') ||
    CONTROL_CHARACTER.test(candidate) ||
    ENCODED_PATH_SEPARATOR.test(candidate)
  ) {
    return fallback;
  }

  try {
    const destination = new URL(candidate, INTERNAL_URL_ORIGIN);
    if (destination.origin !== INTERNAL_URL_ORIGIN || !destination.pathname.startsWith('/')) {
      return fallback;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

/** Uses a configured canonical URL in production and a validated request origin in development. */
export function resolveSiteOrigin(
  configuredUrl: string | undefined,
  requestOrigin: string | null,
  isProduction: boolean,
): string | null {
  const candidate = configuredUrl?.trim().replace(/\/$/, '') || (isProduction ? null : requestOrigin);
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== candidate) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function parseLoginInput(formData: FormData): ValidationResult<LoginInput> {
  const email = normalizeEmail(readText(formData, 'email'));
  if (!email) {
    return { ok: false, message: AUTH_MESSAGES.invalidEmail };
  }

  const password = readText(formData, 'password');
  const passwordError = validateExistingPassword(password);
  if (passwordError || password === null) {
    return passwordError ?? { ok: false, message: AUTH_MESSAGES.passwordRequired };
  }

  return { ok: true, data: { email, password } };
}

export function parseSignUpInput(formData: FormData): ValidationResult<SignUpInput> {
  const loginInput = parseLoginInput(formData);
  if (!loginInput.ok) {
    return loginInput;
  }

  if (loginInput.data.password.length < MIN_NEW_PASSWORD_LENGTH) {
    return { ok: false, message: AUTH_MESSAGES.passwordTooShort };
  }

  if (loginInput.data.password !== readText(formData, 'confirmPassword')) {
    return { ok: false, message: AUTH_MESSAGES.passwordMismatch };
  }

  return loginInput;
}

export function parseForgotPasswordInput(formData: FormData): ValidationResult<{ email: string }> {
  const email = normalizeEmail(readText(formData, 'email'));
  if (!email) {
    return { ok: false, message: AUTH_MESSAGES.invalidEmail };
  }

  return { ok: true, data: { email } };
}

export function parseSetPasswordInput(formData: FormData): ValidationResult<SetPasswordInput> {
  const password = readText(formData, 'password');
  const confirmPassword = readText(formData, 'confirmPassword');
  const existingPasswordError = validateExistingPassword(password);

  if (existingPasswordError || password === null) {
    return existingPasswordError ?? { ok: false, message: AUTH_MESSAGES.passwordRequired };
  }

  if (password.length < MIN_NEW_PASSWORD_LENGTH) {
    return { ok: false, message: AUTH_MESSAGES.passwordTooShort };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: AUTH_MESSAGES.passwordMismatch };
  }

  return { ok: true, data: { password } };
}
