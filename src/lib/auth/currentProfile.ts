import 'server-only';

import { getVerifiedAuthContext } from './claims';
import { createServerSupabaseClient } from '../supabase/server';

export type CurrentProfile = {
  id: string;
  display_name: string;
  role: 'student' | 'teacher' | 'admin';
  student_code: string | null;
};

export type CurrentProfileResult =
  | { status: 'unauthenticated' }
  | { status: 'inactive' }
  | { status: 'authenticated'; profile: CurrentProfile };

/** Read the signed-in user's active profile under their own RLS permissions. */
export async function getCurrentProfile(): Promise<CurrentProfileResult> {
  const authContext = await getVerifiedAuthContext();
  if (!authContext) return { status: 'unauthenticated' };

  const supabase = await createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, role, student_code, active')
    .eq('id', authContext.userId)
    .maybeSingle();

  if (error) throw new Error('Unable to read the current user profile');
  if (!profile || !profile.active) return { status: 'inactive' };

  return {
    status: 'authenticated',
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      role: profile.role,
      student_code: profile.student_code,
    },
  };
}
