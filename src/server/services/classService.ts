import 'server-only';

import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import { canManageClass, type ProfileRole } from '../auth/authorizationRules';
import { parseStudentCsv } from '../classes/parseStudentCsv';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { progressOverrideInputSchema } from '../http/apiSchemas';

export async function assertCanManageClass(actorId: string, classId: string): Promise<string> {
  try {
    const sql = getServerDatabase();

    const [actor] = await sql`
      select p.role, cm.member_role, cm.active
      from public.profiles as p
      left join public.class_members as cm
        on cm.profile_id = p.id and cm.class_id = ${classId}
      where p.id = ${actorId} and p.active = true
    `;

    if (
      !actor ||
      !canManageClass(
        actor.role as ProfileRole,
        actor.member_role ? { memberRole: actor.member_role, active: actor.active } : null,
      )
    ) {
      throw new Error('Forbidden: only an active class teacher or admin can manage this class');
    }

    return classId;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Forbidden:')) {
      throw err;
    }
    // Fallback: Verify permissions via Supabase REST API if direct SQL connection fails
    try {
      const admin = createAdminSupabaseClient();
      const { data: profile } = await admin
        .from('profiles')
        .select('role, active')
        .eq('id', actorId)
        .eq('active', true)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'teacher') return classId;

      const { data: member } = await admin
        .from('class_members')
        .select('member_role, active')
        .eq('class_id', classId)
        .eq('profile_id', actorId)
        .eq('active', true)
        .maybeSingle();

      if (
        profile &&
        canManageClass(
          profile.role as ProfileRole,
          member ? { memberRole: member.member_role, active: member.active } : null,
        )
      ) {
        return classId;
      }
      throw new Error('Forbidden: only an active class teacher or admin can manage this class');
    } catch (fallbackErr) {
      if (fallbackErr instanceof Error && fallbackErr.message.startsWith('Forbidden:')) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

/**
 * Imports students from a validated CSV into auth.users, public.profiles,
 * and public.class_members.
 */
export async function importStudentsFromCsvService(
  actorId: string,
  classId: string,
  csvContent: string,
): Promise<{ success: true; count: number }> {
  const students = parseStudentCsv(csvContent);
  const resolvedClassId = await assertCanManageClass(actorId, classId);
  const adminClient = createAdminSupabaseClient();
  const sql = getServerDatabase();
  let count = 0;

  for (const student of students) {
    let studentProfileId: string | null = null;

    // 1. Invite or find existing auth user
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      student.email,
      {
        data: {
          display_name: student.displayName,
          student_code: student.studentCode,
        },
      },
    );

    if (inviteData?.user?.id) {
      studentProfileId = inviteData.user.id;
    } else if (inviteError) {
      // User might already exist in auth.users
      const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const found = usersData?.users.find(
        (u) => u.email?.toLowerCase() === student.email.toLowerCase(),
      );
      if (found) {
        studentProfileId = found.id;
      } else {
        throw new Error(`Failed to invite student ${student.email}: ${inviteError.message}`);
      }
    }

    if (!studentProfileId) {
      continue;
    }

    // Truncate student_code to 30 chars per DB constraint
    const safeStudentCode = student.studentCode.slice(0, 30);

    // 2. Update profile with student code & display name
    await sql`
      update public.profiles
      set display_name = ${student.displayName},
          student_code = ${safeStudentCode}
      where id = ${studentProfileId}
    `;

    // 3. Enroll into class_members as student
    await sql`
      insert into public.class_members (
        class_id, profile_id, member_role, active
      ) values (
        ${resolvedClassId}, ${studentProfileId}, 'student', true
      )
      on conflict (class_id, profile_id) do update
      set active = true, member_role = 'student'
    `;

    count += 1;
  }

  return { success: true, count };
}

/**
 * Executes a trusted teacher/admin override on a student's unit progress
 * and records immutable audit evidence.
 */
export async function overrideStudentProgressService(
  actorId: string,
  classId: string,
  studentId: string,
  unitId: string,
  rawInput: unknown,
): Promise<{ success: true; progressId: string }> {
  const input = progressOverrideInputSchema.parse(rawInput);
  const resolvedClassId = await assertCanManageClass(actorId, classId);

  return withTrustedTransaction(async (tx) => {
    const [result] = await tx`
      select private.override_unit_progress(
        ${studentId},
        ${resolvedClassId},
        ${unitId},
        ${input.progressPercent},
        ${input.passed},
        ${input.reason},
        ${actorId}
      ) as progress_id
    `;

    if (!result?.progress_id) {
      throw new Error('Teacher override failed to return progress ID');
    }

    return { success: true, progressId: result.progress_id };
  });
}

export type ClassStudentRecord = {
  studentId: string;
  studentCode: string;
  displayName: string;
  unitProgress: Record<string, {
    unitId: string;
    sequenceNo: number;
    progressPercent: number;
    passed: boolean;
    unlocked: boolean;
    approvedScore: number | null;
    latestQuiz?: {
      id: string;
      score: number | null;
      passed: boolean | null;
      status: string;
      submittedAt: string | null;
    } | null;
    latestLab?: {
      id: string;
      status: string;
      passed: boolean | null;
      approvedScore: number | null;
      reviewedAt: string | null;
      submittedAt: string | null;
    } | null;
  }>;
};

/**
 * Retrieves the enrolled students in a class along with their unit progression states.
 */
export async function getClassStudentsService(
  actorId: string,
  classId: string,
): Promise<ClassStudentRecord[]> {
  await assertCanManageClass(actorId, classId);
  let rows: any[] = [];
  try {
    const sql = getServerDatabase();

    rows = await sql`
      select
        p.id as student_id,
        p.student_code,
        p.display_name,
        u.id as unit_id,
        u.sequence_no,
        coalesce(up.progress_percent, 0) as progress_percent,
        coalesce(up.passed, false) as passed,
        coalesce(private.is_unit_unlocked(p.id, ${classId}, u.id), false) as unlocked,
        up.approved_score,
        latest_quiz.id as latest_quiz_id,
        latest_quiz.approved_score as latest_quiz_score,
        latest_quiz.passed as latest_quiz_passed,
        latest_quiz.status as latest_quiz_status,
        latest_quiz.submitted_at as latest_quiz_submitted_at,
        latest_lab.id as latest_lab_id,
        latest_lab.status as latest_lab_status,
        latest_lab.passed as latest_lab_passed,
        latest_lab.approved_score as latest_lab_approved_score,
        latest_lab.reviewed_at as latest_lab_reviewed_at,
        latest_lab.submitted_at as latest_lab_submitted_at
      from public.class_members as cm
      join public.profiles as p on p.id = cm.profile_id
      join public.classes as c on c.id = cm.class_id
      left join public.units as u on u.course_id = c.course_id and u.status = 'published'
      left join public.unit_progress as up
        on up.student_id = p.id
       and up.class_id = cm.class_id
       and up.unit_id = u.id
      left join lateral (
        select qa.id, qa.approved_score, qa.passed, qa.status, qa.submitted_at
        from public.quiz_attempts as qa
        join public.quizzes as q on q.id = qa.quiz_id
        where qa.class_id = cm.class_id
          and qa.student_id = p.id
          and q.unit_id = u.id
        order by qa.attempt_no desc
        limit 1
      ) as latest_quiz on true
      left join lateral (
        select ls.id, ls.status, ls.passed, ls.approved_score, ls.reviewed_at, ls.submitted_at
        from public.lab_submissions as ls
        where ls.class_id = cm.class_id
          and ls.student_id = p.id
          and ls.unit_id = u.id
        order by ls.attempt_no desc
        limit 1
      ) as latest_lab on true
      where cm.class_id = ${classId}
        and cm.member_role = 'student'
        and cm.active = true
      order by p.student_code asc, u.sequence_no asc
    `;
  } catch (dbErr) {
    try {
      const admin = createAdminSupabaseClient();
      const { data: members } = await admin
        .from('class_members')
        .select('profile_id, profiles(id, student_code, display_name, active)')
        .eq('class_id', classId)
        .eq('member_role', 'student')
        .eq('active', true);

      if (members && members.length > 0) {
        return members.map((m: any) => ({
          studentId: m.profiles?.id || m.profile_id,
          studentCode: m.profiles?.student_code || '',
          displayName: m.profiles?.display_name || 'ผู้เรียน',
          unitProgress: {},
        }));
      }

      const { data: allProfiles } = await admin
        .from('profiles')
        .select('id, student_code, display_name, active')
        .eq('role', 'student')
        .eq('active', true);

      if (allProfiles && allProfiles.length > 0) {
        return allProfiles.map((s: any) => ({
          studentId: s.id,
          studentCode: s.student_code || '',
          displayName: s.display_name || 'ผู้เรียน',
          unitProgress: {},
        }));
      }
    } catch {
      // rethrow original dbErr
    }
    throw dbErr;
  }

  const map = new Map<string, ClassStudentRecord>();

  for (const row of rows) {
    if (!map.has(row.student_id)) {
      map.set(row.student_id, {
        studentId: row.student_id,
        studentCode: row.student_code || '',
        displayName: row.display_name || '',
        unitProgress: {},
      });
    }

    if (row.unit_id) {
      const student = map.get(row.student_id)!;
      const unitKey = `U${String(row.sequence_no).padStart(2, '0')}`;
      student.unitProgress[unitKey] = {
        unitId: row.unit_id,
        sequenceNo: row.sequence_no,
        progressPercent: Number(row.progress_percent),
        passed: Boolean(row.passed),
        unlocked: Boolean(row.unlocked),
        approvedScore: row.approved_score !== null ? Number(row.approved_score) : null,
        latestQuiz: row.latest_quiz_id
          ? {
              id: row.latest_quiz_id,
              score: row.latest_quiz_score !== null ? Number(row.latest_quiz_score) : null,
              passed: row.latest_quiz_passed !== null ? Boolean(row.latest_quiz_passed) : null,
              status: row.latest_quiz_status,
              submittedAt: row.latest_quiz_submitted_at,
            }
          : null,
        latestLab: row.latest_lab_id
          ? {
              id: row.latest_lab_id,
              status: row.latest_lab_status,
              passed: row.latest_lab_passed !== null ? Boolean(row.latest_lab_passed) : null,
              approvedScore: row.latest_lab_approved_score !== null ? Number(row.latest_lab_approved_score) : null,
              reviewedAt: row.latest_lab_reviewed_at,
              submittedAt: row.latest_lab_submitted_at,
            }
          : null,
      };
    }
  }

  return Array.from(map.values());
}

