import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { safeNextPath } from '../../../lib/auth/validation';
import { resolveSiteOrigin } from '../../../lib/auth/validation';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = resolveSiteOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
    request.nextUrl.origin,
    process.env.NODE_ENV === 'production',
  );
  if (!origin) {
    return NextResponse.json({ error: 'Invalid site configuration' }, { status: 500 });
  }
  const code = searchParams.get('code');
  const flowId = searchParams.get('sb_flow_id');
  const next = safeNextPath(searchParams.get('next'), '/');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error) {
      if (data?.session?.user) {
        const user = data.session.user;
        const meta = user.user_metadata || {};
        const rawName = (meta.full_name || meta.name || meta.display_name || '').trim();
        const codeMatch = rawName.match(/^(\d{4,11})/);
        const studentCode = codeMatch ? codeMatch[1] : null;

        try {
          const { createAdminSupabaseClient } = await import('../../../lib/supabase/admin');
          const admin = createAdminSupabaseClient();

          const profileUpdates: Record<string, unknown> = { active: true };
          if (rawName) profileUpdates.display_name = rawName;
          if (studentCode) profileUpdates.student_code = studentCode;

          await admin
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);

          await admin
            .from('class_members')
            .upsert(
              {
                class_id: '22222222-2222-4222-8222-222222222222',
                profile_id: user.id,
                member_role: 'student',
                active: true,
              },
              { onConflict: 'class_id,profile_id' },
            );
        } catch {
          // Graceful fallback if admin client is not configured
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
