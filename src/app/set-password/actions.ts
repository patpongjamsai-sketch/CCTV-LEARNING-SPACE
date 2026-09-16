'use server';

import { redirect } from 'next/navigation';
import { runSetPasswordFlow, type AuthActionState, toAuthActionState } from '../../lib/auth/flows';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export async function setPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createServerSupabaseClient();

  const result = await runSetPasswordFlow(formData, {
    getClaims: async () => {
      const { data } = await supabase.auth.getClaims();
      return data?.claims ?? null;
    },
    updateUserPassword: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    },
  });

  if (result.kind === 'redirect') {
    redirect(result.next);
  }

  return toAuthActionState(result);
}
