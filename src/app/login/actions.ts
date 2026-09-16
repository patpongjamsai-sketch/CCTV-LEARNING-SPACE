'use server';

import { redirect } from 'next/navigation';
import { runLoginFlow, type AuthActionState, toAuthActionState } from '../../lib/auth/flows';
import { createServerSupabaseClient } from '../../lib/supabase/server';

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
