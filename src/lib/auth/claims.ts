export type VerifiedClaims = {
  sub?: string;
  [claim: string]: unknown;
};

export type ClaimsReader = () => Promise<VerifiedClaims | null>;

export type VerifiedAuthContext = {
  userId: string;
  claims: VerifiedClaims & { sub: string };
};

export class UnauthenticatedError extends Error {
  constructor() {
    super('Authenticated claims are required.');
    this.name = 'UnauthenticatedError';
  }
}

async function readClaimsFromServer(): Promise<VerifiedClaims | null> {
  const { createServerSupabaseClient } = await import('../supabase/server');
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  return data.claims;
}

/**
 * Establishes identity from a verified JWT, never from a cookie session's
 * embedded user object. Authorization decisions remain the caller's concern.
 */
export async function getVerifiedAuthContext(
  readClaims: ClaimsReader = readClaimsFromServer,
): Promise<VerifiedAuthContext | null> {
  try {
    const claims = await readClaims();

    if (!claims || typeof claims.sub !== 'string' || claims.sub.length === 0) {
      return null;
    }

    return {
      userId: claims.sub,
      claims: claims as VerifiedClaims & { sub: string },
    };
  } catch {
    return null;
  }
}

export async function requireVerifiedAuthContext(
  readClaims?: ClaimsReader,
): Promise<VerifiedAuthContext> {
  const context = await getVerifiedAuthContext(readClaims);

  if (!context) {
    throw new UnauthenticatedError();
  }

  return context;
}
