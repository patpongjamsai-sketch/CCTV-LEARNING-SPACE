import { NextResponse } from 'next/server';
import { getVerifiedAuthContext } from '../../../../lib/auth/claims';
import { createAdminSupabaseClient } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authContext = await getVerifiedAuthContext();
    if (!authContext) {
      return NextResponse.json({ user: null });
    }

    const supabase = createAdminSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, role, student_code')
      .eq('id', authContext.userId)
      .maybeSingle();

    const email = typeof authContext.claims?.email === 'string' ? authContext.claims.email : null;

    return NextResponse.json({
      user: {
        userId: authContext.userId,
        displayName: profile?.display_name || (email ? email.split('@')[0] : 'ผู้เรียน'),
        role: profile?.role || 'student',
        studentCode: profile?.student_code || null,
        email,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
