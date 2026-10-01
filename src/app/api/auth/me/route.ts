import { NextResponse } from 'next/server';
import { getCurrentProfile } from '../../../../lib/auth/currentProfile';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { getPvClassById } from '../../../../lib/classes/classGroups';

export const dynamic = 'force-dynamic';
const privateResponse = { headers: { 'Cache-Control': 'private, no-store' } };

export async function GET() {
  try {
    const current = await getCurrentProfile();
    if (current.status !== 'authenticated') {
      return NextResponse.json({ user: null, membership: null }, privateResponse);
    }
    const profile = current.profile;

    let membership: {
      classId: string;
      classCode: string | null;
      classTitle: string | null;
      memberRole: string;
    } | null = null;

    try {
      const supabase = await createServerSupabaseClient();
      const { data: member } = await supabase
        .from('class_members')
        .select('class_id, member_role, classes(id, code, title)')
        .eq('profile_id', profile.id)
        .eq('active', true)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (member) {
        const cls = Array.isArray(member.classes) ? member.classes[0] : member.classes;
        const pvFallback = getPvClassById(member.class_id);
        membership = {
          classId: member.class_id,
          classCode: cls?.code ?? pvFallback?.code ?? null,
          classTitle: cls?.title ?? pvFallback?.title ?? null,
          memberRole: member.member_role,
        };
      }
    } catch {
      // membership lookup fallback
    }

    return NextResponse.json(
      {
        user: {
          userId: profile.id,
          displayName: profile.display_name,
          role: profile.role,
          studentCode: profile.student_code,
        },
        membership,
      },
      privateResponse,
    );
  } catch {
    return NextResponse.json({ error: 'Profile unavailable' }, { ...privateResponse, status: 503 });
  }
}
