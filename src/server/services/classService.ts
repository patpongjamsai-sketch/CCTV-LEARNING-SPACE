import 'server-only';

import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import { canManageClass, type ProfileRole } from '../auth/authorizationRules';
import { parseStudentCsv } from '../classes/parseStudentCsv';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { progressOverrideInputSchema } from '../http/apiSchemas';

export async function assertCanManageClass(actorId: string, classId: string): Promise<void> {
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
  await assertCanManageClass(actorId, classId);
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
        ${classId}, ${studentProfileId}, 'student', true
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
  await assertCanManageClass(actorId, classId);

  return withTrustedTransaction(async (tx) => {
    const [result] = await tx`
      select private.override_unit_progress(
        ${studentId},
        ${classId},
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
