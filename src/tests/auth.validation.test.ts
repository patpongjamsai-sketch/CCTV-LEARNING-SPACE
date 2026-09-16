import { describe, expect, it } from 'vitest';
import {
  AUTH_MESSAGES,
  parseLoginInput,
  parseSetPasswordInput,
  safeNextPath,
} from '../lib/auth/validation';

function form(values: Record<string, string>): FormData {
  const data = new FormData();

  for (const [name, value] of Object.entries(values)) {
    data.set(name, value);
  }

  return data;
}

describe('auth input validation', () => {
  it('keeps an internal next path with its query and fragment', () => {
    expect(safeNextPath('/labs/3d/room-101?mode=practice#mission-1')).toBe(
      '/labs/3d/room-101?mode=practice#mission-1',
    );
  });

  it.each([
    'https://attacker.example/steal',
    '//attacker.example/steal',
    '/\\attacker.example/steal',
    '/%2f%2fattacker.example/steal',
  ])('falls back for an unsafe next path: %s', (unsafePath) => {
    expect(safeNextPath(unsafePath)).toBe('/');
  });

  it('normalizes a valid login email without changing the password', () => {
    expect(
      parseLoginInput(
        form({
          email: ' Student@Example.COM ',
          password: 'correct horse battery staple',
        }),
      ),
    ).toEqual({
      ok: true,
      data: {
        email: 'student@example.com',
        password: 'correct horse battery staple',
      },
    });
  });

  it('rejects a new password that does not meet the minimum length', () => {
    expect(
      parseSetPasswordInput(
        form({ password: 'short', confirmPassword: 'short' }),
      ),
    ).toEqual({ ok: false, message: AUTH_MESSAGES.passwordTooShort });
  });

  it('rejects mismatched new password confirmation', () => {
    expect(
      parseSetPasswordInput(
        form({
          password: 'this is a strong password',
          confirmPassword: 'this is a different password',
        }),
      ),
    ).toEqual({ ok: false, message: AUTH_MESSAGES.passwordMismatch });
  });
});
