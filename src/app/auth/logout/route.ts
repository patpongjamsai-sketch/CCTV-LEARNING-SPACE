import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Continue redirect even if sign out errors
  }

  return NextResponse.redirect(new URL('/login', request.nextUrl.origin), {
    status: 303,
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Continue redirect even if sign out errors
  }

  return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
}
