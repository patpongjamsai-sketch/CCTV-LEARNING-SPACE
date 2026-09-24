import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { resolveSiteOrigin, safeNextPath } from '../../../lib/auth/validation';

function redirectWithoutCaching(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

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
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );

      if (!error && data.session?.user) {
        // The auth.users trigger creates the least-privilege profile.
        // Enrollment and trusted student identifiers are handled separately.
        return redirectWithoutCaching(new URL(next, origin));
      }
    } catch {
      // Keep provider and server details out of the public callback response.
    }
  }

  return redirectWithoutCaching(new URL('/login?error=auth_callback_failed', origin));
}
