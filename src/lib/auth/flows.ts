import {
  AUTH_MESSAGES,
  parseForgotPasswordInput,
  parseLoginInput,
  parseSignUpInput,
  parseSetPasswordInput,
  safeNextPath,
} from './validation';

export type ClaimsLike = {
  sub?: string;
  [claim: string]: unknown;
} | null;

type ProviderResult = {
  error: unknown | null;
};

export type LoginFlowDependencies = {
  signInWithPassword: (input: { email: string; password: string }) => Promise<ProviderResult>;
  getClaims: () => Promise<ClaimsLike>;
};

export type SignUpFlowDependencies = {
  signUp: (input: {
    email: string;
    password: string;
    options: { emailRedirectTo: string };
  }) => Promise<ProviderResult>;
};

export type GoogleOAuthFlowDependencies = {
  signInWithOAuth: (input: {
    provider: 'google';
    options: { redirectTo: string };
  }) => Promise<{ data: { url: string | null; flowId?: string | null }; error: unknown | null }>;
};

export type ForgotPasswordFlowDependencies = {
  resetPasswordForEmail: (
    email: string,
    options: { redirectTo: string },
  ) => Promise<ProviderResult>;
};

export type SetPasswordFlowDependencies = {
  getClaims: () => Promise<ClaimsLike>;
  updateUserPassword: (password: string) => Promise<ProviderResult>;
};

export type AuthFlowResult =
  | { kind: 'error'; message: string }
  | { kind: 'message'; message: string }
  | { kind: 'redirect'; next: string }
  | { kind: 'external-redirect'; url: string };

export type AuthActionState = {
  error?: string;
  message?: string;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {};

export function hasVerifiedSubject(claims: ClaimsLike): claims is ClaimsLike & { sub: string } {
  return typeof claims?.sub === 'string' && claims.sub.length > 0;
}

export async function runLoginFlow(
  formData: FormData,
  dependencies: LoginFlowDependencies,
): Promise<AuthFlowResult> {
  const input = parseLoginInput(formData);
  if (!input.ok) {
    return { kind: 'error', message: input.message };
  }

  try {
    const { error } = await dependencies.signInWithPassword(input.data);
    if (error) {
      return { kind: 'error', message: AUTH_MESSAGES.loginFailed };
    }

    const claims = await dependencies.getClaims();
    if (!hasVerifiedSubject(claims)) {
      return { kind: 'error', message: AUTH_MESSAGES.loginFailed };
    }

    return { kind: 'redirect', next: safeNextPath(formData.get('next')) };
  } catch {
    return { kind: 'error', message: AUTH_MESSAGES.loginFailed };
  }
}

export async function runSignUpFlow(
  formData: FormData,
  emailRedirectTo: string | null,
  dependencies: SignUpFlowDependencies,
): Promise<AuthFlowResult> {
  const input = parseSignUpInput(formData);
  if (!input.ok) {
    return { kind: 'error', message: input.message };
  }

  if (!emailRedirectTo) {
    return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
  }

  try {
    const { error } = await dependencies.signUp({ ...input.data, options: { emailRedirectTo } });
    if (error) {
      return { kind: 'error', message: AUTH_MESSAGES.signUpFailed };
    }
  } catch {
    return { kind: 'error', message: AUTH_MESSAGES.signUpFailed };
  }

  return { kind: 'message', message: AUTH_MESSAGES.signUpRequested };
}

export async function runGoogleOAuthFlow(
  formData: FormData,
  origin: string | null,
  supabaseOrigin: string | null,
  dependencies: GoogleOAuthFlowDependencies,
): Promise<AuthFlowResult> {
  let safeOrigin: string;
  try {
    if (!origin || !supabaseOrigin) throw new Error('missing origin');
    const parsedOrigin = new URL(origin);
    if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
      throw new Error('invalid origin');
    }
    safeOrigin = parsedOrigin.origin;
  } catch {
    return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
  }

  const next = safeNextPath(formData.get('next'));
  const redirectTo = `${safeOrigin}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const { data, error } = await dependencies.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error || !data.url) {
      return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
    }
    const providerUrl = new URL(data.url);
    const expectedSupabaseOrigin = new URL(supabaseOrigin).origin;
    if (
      providerUrl.protocol !== 'https:' ||
      providerUrl.origin !== expectedSupabaseOrigin ||
      providerUrl.pathname !== '/auth/v1/authorize'
    ) {
      return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
    }
    return { kind: 'external-redirect', url: data.url };
  } catch {
    return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
  }
}

export async function runForgotPasswordFlow(
  formData: FormData,
  redirectTo: string | null,
  dependencies: ForgotPasswordFlowDependencies,
): Promise<AuthFlowResult> {
  const input = parseForgotPasswordInput(formData);
  if (!input.ok) {
    return { kind: 'error', message: input.message };
  }

  if (!redirectTo) {
    return { kind: 'error', message: AUTH_MESSAGES.requestUnavailable };
  }

  try {
    await dependencies.resetPasswordForEmail(input.data.email, { redirectTo });
  } catch {
    // This response intentionally remains indistinguishable from a valid request.
  }

  return { kind: 'message', message: AUTH_MESSAGES.passwordResetRequested };
}

export async function runSetPasswordFlow(
  formData: FormData,
  dependencies: SetPasswordFlowDependencies,
): Promise<AuthFlowResult> {
  const input = parseSetPasswordInput(formData);
  if (!input.ok) {
    return { kind: 'error', message: input.message };
  }

  try {
    const initialClaims = await dependencies.getClaims();
    if (!hasVerifiedSubject(initialClaims)) {
      return { kind: 'error', message: AUTH_MESSAGES.sessionRequired };
    }

    const { error } = await dependencies.updateUserPassword(input.data.password);
    if (error) {
      return { kind: 'error', message: AUTH_MESSAGES.passwordUpdateFailed };
    }

    const refreshedClaims = await dependencies.getClaims();
    if (!hasVerifiedSubject(refreshedClaims)) {
      return { kind: 'error', message: AUTH_MESSAGES.sessionRequired };
    }
  } catch {
    return { kind: 'error', message: AUTH_MESSAGES.passwordUpdateFailed };
  }

  return { kind: 'redirect', next: '/' };
}

export function toAuthActionState(result: AuthFlowResult): AuthActionState {
  if (result.kind === 'error') {
    return { error: result.message };
  }

  if (result.kind === 'message') {
    return { message: result.message };
  }

  return INITIAL_AUTH_ACTION_STATE;
}
