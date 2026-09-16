'use server';

import { headers } from 'next/headers';
import { runForgotPasswordFlow, type AuthActionState, toAuthActionState } from '../../lib/auth/flows';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const redirectTo = `${origin}/auth/callback?next=/set-password`;

  const supabase = await createServerSupabaseClient();

  const result = await runForgotPasswordFlow(formData, redirectTo, {
    resetPasswordForEmail: async (email, options) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, options);
      return { error };
    },
  });

  return toAuthActionState(result);
}
