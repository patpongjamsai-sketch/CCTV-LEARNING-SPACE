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
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
