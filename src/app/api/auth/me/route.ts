import { NextResponse } from 'next/server';
import { getCurrentProfile } from '../../../../lib/auth/currentProfile';

export const dynamic = 'force-dynamic';
const privateResponse = { headers: { 'Cache-Control': 'private, no-store' } };

export async function GET() {
  try {
    const current = await getCurrentProfile();
    if (current.status !== 'authenticated') {
      return NextResponse.json({ user: null }, privateResponse);
    }
    const profile = current.profile;

    return NextResponse.json({
      user: {
        userId: profile.id,
        displayName: profile.display_name,
        role: profile.role,
        studentCode: profile.student_code,
      },
    }, privateResponse);
  } catch {
    return NextResponse.json({ error: 'Profile unavailable' }, { ...privateResponse, status: 503 });
  }
}
