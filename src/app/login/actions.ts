'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  runGoogleOAuthFlow,
  runLoginFlow,
  runSignUpFlow,
  type AuthActionState,
  toAuthActionState,
} from '../../lib/auth/flows';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import { getSupabasePublicConfig } from '../../lib/supabase/config';
import { resolveSiteOrigin } from '../../lib/auth/validation';

async function getRequestOrigin(): Promise<string | null> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') || 'http';
  const requestOrigin = host ? `${proto}://${host}` : null;
  return resolveSiteOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
    requestOrigin,
    process.env.NODE_ENV === 'production',
  );
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();

  const result = await runLoginFlow(formData, {
    signInWithPassword: async ({ email, password }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    getClaims: async () => {
      const { data } = await supabase.auth.getClaims();
      return data?.claims ?? null;
    },
  });

  if (result.kind === 'redirect') {
    redirect(result.next);
  }

  return toAuthActionState(result);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const origin = await getRequestOrigin();
  const next = encodeURIComponent('/');
  const supabase = await createServerSupabaseClient();
  const result = await runSignUpFlow(
    formData,
    origin ? `${origin}/auth/callback?next=${next}` : null,
    {
      signUp: async (input) => {
        const { error } = await supabase.auth.signUp(input);
        return { error };
      },
    },
  );

  return toAuthActionState(result);
}

export async function googleOAuthAction(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { url: supabaseUrl } = getSupabasePublicConfig();
  const result = await runGoogleOAuthFlow(formData, await getRequestOrigin(), new URL(supabaseUrl).origin, {
    signInWithOAuth: async (input) => supabase.auth.signInWithOAuth(input),
  });

  if (result.kind === 'external-redirect') {
    redirect(result.url);
  }

  redirect('/login?error=oauth_start_failed');
}
