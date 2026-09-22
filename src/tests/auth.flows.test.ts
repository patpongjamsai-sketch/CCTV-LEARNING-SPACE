import { describe, expect, it } from 'vitest';
import {
  runGoogleOAuthFlow,
  runForgotPasswordFlow,
  runLoginFlow,
  runSignUpFlow,
  runSetPasswordFlow,
} from '../lib/auth/flows';
import { AUTH_MESSAGES } from '../lib/auth/validation';
import { resolveSiteOrigin } from '../lib/auth/validation';

function form(values: Record<string, string>): FormData {
  const data = new FormData();

  for (const [name, value] of Object.entries(values)) {
    data.set(name, value);
  }

  return data;
}

describe('auth flow contracts', () => {
  it('starts Google OAuth with a safe callback and requested local destination', async () => {
    const result = await runGoogleOAuthFlow(
      form({ next: '/courses/21909-2020' }),
      'https://cctv.example',
      'https://project-ref.supabase.co',
      {
        signInWithOAuth: async (options) => ({
          data: { url: `https://project-ref.supabase.co/auth/v1/authorize?redirect=${encodeURIComponent(options.options.redirectTo)}`, flowId: 'abc123' },
          error: null,
        }),
      },
    );

    expect(result).toEqual({
      kind: 'external-redirect',
      url: 'https://project-ref.supabase.co/auth/v1/authorize?redirect=https%3A%2F%2Fcctv.example%2Fauth%2Fcallback%3Fnext%3D%252Fcourses%252F21909-2020',
    });
  });

  it('rejects an unsafe origin before starting Google OAuth', async () => {
    let providerCalled = false;
    const result = await runGoogleOAuthFlow(form({ next: '/' }), 'javascript:alert(1)', 'https://project-ref.supabase.co', {
      signInWithOAuth: async () => {
        providerCalled = true;
        return { data: { url: null, flowId: null }, error: null };
      },
    });

    expect(result).toEqual({ kind: 'error', message: AUTH_MESSAGES.requestUnavailable });
    expect(providerCalled).toBe(false);
  });

  it('rejects a non-HTTP OAuth provider redirect', async () => {
    const result = await runGoogleOAuthFlow(form({ next: '/' }), 'https://cctv.example', 'https://project-ref.supabase.co', {
      signInWithOAuth: async () => ({
        data: { url: 'https://evil.example/auth/v1/authorize', flowId: 'abc123' },
        error: null,
      }),
    });

    expect(result).toEqual({ kind: 'error', message: AUTH_MESSAGES.requestUnavailable });
  });

  it('requires the configured site URL in production', () => {
    expect(resolveSiteOrigin(undefined, 'https://host-header.example', true)).toBeNull();
    expect(resolveSiteOrigin('https://cctv.example/', 'https://host-header.example', true)).toBe('https://cctv.example');
  });

  it('creates an account and returns a non-enumerating confirmation message', async () => {
    const result = await runSignUpFlow(
      form({
        email: 'new.student@example.com',
        password: 'correct horse battery staple',
        confirmPassword: 'correct horse battery staple',
      }),
      'https://cctv.example/auth/callback?next=%2F',
      {
        signUp: async () => ({ error: null }),
      },
    );

    expect(result).toEqual({ kind: 'message', message: AUTH_MESSAGES.signUpRequested });
  });

  it('reports a generic signup failure when the provider cannot create the account', async () => {
    const result = await runSignUpFlow(
      form({
        email: 'new.student@example.com',
        password: 'correct horse battery staple',
        confirmPassword: 'correct horse battery staple',
      }),
      'https://cctv.example/auth/callback?next=%2F',
      { signUp: async () => ({ error: new Error('SMTP unavailable') }) },
    );

    expect(result).toEqual({ kind: 'error', message: AUTH_MESSAGES.signUpFailed });
  });

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
