import {
  AUTH_MESSAGES,
  parseForgotPasswordInput,
  parseLoginInput,
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
  | { kind: 'redirect'; next: string };

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
