import { describe, expect, it } from 'vitest';
import {
  runForgotPasswordFlow,
  runLoginFlow,
  runSetPasswordFlow,
} from '../lib/auth/flows';
import { AUTH_MESSAGES } from '../lib/auth/validation';

function form(values: Record<string, string>): FormData {
  const data = new FormData();

  for (const [name, value] of Object.entries(values)) {
    data.set(name, value);
  }

  return data;
}

describe('auth flow contracts', () => {
  it('does not call the login provider for invalid credentials', async () => {
    let providerCalled = false;

    const result = await runLoginFlow(
      form({ email: 'not-an-email', password: 'anything' }),
      {
        signInWithPassword: async () => {
          providerCalled = true;
          return { error: null };
        },
        getClaims: async () => ({ sub: 'user-1' }),
      },
    );

    expect(result).toEqual({
      kind: 'error',
      message: AUTH_MESSAGES.invalidEmail,
    });
    expect(providerCalled).toBe(false);
  });

  it('returns a safe redirect only after a successful sign-in with verified claims', async () => {
    const result = await runLoginFlow(
      form({
        email: 'student@example.com',
        password: 'correct horse battery staple',
        next: '/labs/3d/room-101',
      }),
      {
        signInWithPassword: async () => ({ error: null }),
        getClaims: async () => ({ sub: 'user-1' }),
      },
    );

    expect(result).toEqual({ kind: 'redirect', next: '/labs/3d/room-101' });
  });

  it('does not expose a provider login error', async () => {
    const result = await runLoginFlow(
      form({ email: 'student@example.com', password: 'correct horse battery staple' }),
      {
        signInWithPassword: async () => ({ error: new Error('user not found') }),
        getClaims: async () => ({ sub: 'user-1' }),
      },
    );

    expect(result).toEqual({
      kind: 'error',
      message: AUTH_MESSAGES.loginFailed,
    });
  });

  it('returns the same generic reset response when the provider rejects the request', async () => {
    const result = await runForgotPasswordFlow(
      form({ email: 'student@example.com' }),
      'https://training.example/auth/callback?next=%2Fset-password',
      {
        resetPasswordForEmail: async () => ({ error: new Error('user not found') }),
      },
    );

    expect(result).toEqual({
      kind: 'message',
      message: AUTH_MESSAGES.passwordResetRequested,
    });
  });

  it('does not update a password without freshly verified claims', async () => {
    let updateCalled = false;

    const result = await runSetPasswordFlow(
      form({
        password: 'this is a strong password',
        confirmPassword: 'this is a strong password',
      }),
      {
        getClaims: async () => null,
        updateUserPassword: async () => {
          updateCalled = true;
          return { error: null };
        },
      },
    );

    expect(result).toEqual({
      kind: 'error',
      message: AUTH_MESSAGES.sessionRequired,
    });
    expect(updateCalled).toBe(false);
  });
});
