import 'server-only';

import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import { canManageClass, type ProfileRole } from '../auth/authorizationRules';
import { parseStudentCsv } from '../classes/parseStudentCsv';
import { getServerDatabase, withTrustedTransaction } from '../database/client';
import { joinClassInputSchema, progressOverrideInputSchema } from '../http/apiSchemas';
import { getPvClassByCode } from '../../lib/classes/classGroups';

export async function assertCanManageClass(actorId: string, classId: string): Promise<string> {
  if (classId === 'ALL') {
    try {
      const sql = getServerDatabase();
      const [actor] = await sql`
        select p.role, p.active
        from public.profiles as p
        where p.id = ${actorId} and p.active = true
      `;
      if (!actor || (actor.role !== 'teacher' && actor.role !== 'admin')) {
        throw new Error('Forbidden: only an active class teacher or admin can manage this class');
      }
      return 'ALL';
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Forbidden:')) throw err;
      const supabase = await createServerSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, active')
        .eq('id', actorId)
        .eq('active', true)
        .maybeSingle();
      if (profile && (profile.role === 'teacher' || profile.role === 'admin')) {
        return 'ALL';
      }
      throw new Error('Forbidden: only an active class teacher or admin can manage this class');
    }
  }

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
    // Fallback: verify user and class membership through admin client,
    // so authentication succeeds even if the direct PostgreSQL pooler is temporarily unavailable.
    try {
      const adminClient = createAdminSupabaseClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role, active')
        .eq('id', actorId)
        .eq('active', true)
        .maybeSingle();

      if (profile?.role === 'admin') return classId;

      const { data: member } = await adminClient
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
      throw new Error('Forbidden: only an active class teacher or admin can manage this class');
    }
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
  classCode?: string;
  classTitle?: string;
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
    latestMission?: {
      missionId: string;
      code: string;
      title: string;
      maxScore: number;
      bestScore: number;
      attemptCount: number;
      hintsUsed: number;
      passed: boolean;
      firstPassedAt: string | null;
      latestAttemptId: string;
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
    const isAll = classId === 'ALL';

    if (isAll) {
      rows = await sql`
        select
          p.id as student_id,
          p.student_code,
          p.display_name,
          c.id as class_id,
          c.code as class_code,
          c.title as class_title,
          u.id as unit_id,
          u.sequence_no,
          coalesce(up.progress_percent, 0) as progress_percent,
          coalesce(up.passed, false) as passed,
          coalesce(private.is_unit_unlocked(p.id, cm.class_id, u.id), false) as unlocked,
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
          latest_lab.submitted_at as latest_lab_submitted_at,
          latest_mission.mission_id as latest_mission_id,
          latest_mission.code as latest_mission_code,
          latest_mission.title as latest_mission_title,
          latest_mission.max_score as latest_mission_max_score,
          latest_mission.best_score as latest_mission_best_score,
          latest_mission.attempt_count as latest_mission_attempt_count,
          latest_mission.hints_used as latest_mission_hints_used,
          latest_mission.passed as latest_mission_passed,
          latest_mission.first_passed_at as latest_mission_first_passed_at,
          latest_mission.latest_attempt_id as latest_mission_latest_attempt_id
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
        left join lateral (
          select
            m.id as mission_id,
            m.code,
            m.title,
            m.max_score,
            gmr.best_score,
            gmr.attempt_count,
            gmr.hints_used,
            gmr.passed,
            gmr.first_passed_at,
            gmr.latest_attempt_id
          from public.game_mission_results as gmr
          join public.missions as m on m.id = gmr.mission_id
          where gmr.class_id = cm.class_id
            and gmr.student_id = p.id
            and m.unit_id = u.id
          order by gmr.updated_at desc
          limit 1
        ) as latest_mission on true
        where cm.member_role = 'student' and cm.active = true
        order by c.code asc, p.student_code asc, u.sequence_no asc
      `;
    } else {
      rows = await sql`
        select
          p.id as student_id,
          p.student_code,
          p.display_name,
          c.id as class_id,
          c.code as class_code,
          c.title as class_title,
          u.id as unit_id,
          u.sequence_no,
          coalesce(up.progress_percent, 0) as progress_percent,
          coalesce(up.passed, false) as passed,
          coalesce(private.is_unit_unlocked(p.id, cm.class_id, u.id), false) as unlocked,
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
          latest_lab.submitted_at as latest_lab_submitted_at,
          latest_mission.mission_id as latest_mission_id,
          latest_mission.code as latest_mission_code,
          latest_mission.title as latest_mission_title,
          latest_mission.max_score as latest_mission_max_score,
          latest_mission.best_score as latest_mission_best_score,
          latest_mission.attempt_count as latest_mission_attempt_count,
          latest_mission.hints_used as latest_mission_hints_used,
          latest_mission.passed as latest_mission_passed,
          latest_mission.first_passed_at as latest_mission_first_passed_at,
          latest_mission.latest_attempt_id as latest_mission_latest_attempt_id
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
        left join lateral (
          select
            m.id as mission_id,
            m.code,
            m.title,
            m.max_score,
            gmr.best_score,
            gmr.attempt_count,
            gmr.hints_used,
            gmr.passed,
            gmr.first_passed_at,
            gmr.latest_attempt_id
          from public.game_mission_results as gmr
          join public.missions as m on m.id = gmr.mission_id
          where gmr.class_id = cm.class_id
            and gmr.student_id = p.id
            and m.unit_id = u.id
          order by gmr.updated_at desc
          limit 1
        ) as latest_mission on true
        where cm.class_id = ${classId} and cm.member_role = 'student' and cm.active = true
        order by c.code asc, p.student_code asc, u.sequence_no asc
      `;
    }
  } catch (dbErr) {
    try {
      const admin = createAdminSupabaseClient();
      const isAll = classId === 'ALL';

      let membersQuery = admin
        .from('class_members')
        .select('profile_id, class_id, classes(id, code, title), profiles(id, student_code, display_name, active)')
        .eq('member_role', 'student')
        .eq('active', true);
      if (!isAll) {
        membersQuery = membersQuery.eq('class_id', classId);
      }
      const { data: members, error: membersError } = await membersQuery;
      if (membersError) throw dbErr;

      if (!members || members.length === 0) {
        return [];
      }

      const unitsPromise = admin
        .from('units')
        .select('id, sequence_no, title')
        .order('sequence_no', { ascending: true });

      let upQuery = admin.from('unit_progress').select('*');
      if (!isAll) upQuery = upQuery.eq('class_id', classId);

      let qaQuery = admin
        .from('quiz_attempts')
        .select('id, student_id, quiz_id, attempt_no, approved_score, passed, status, submitted_at, quizzes(unit_id)')
        .order('attempt_no', { ascending: false });
      if (!isAll) qaQuery = qaQuery.eq('class_id', classId);

      let lsQuery = admin
        .from('lab_submissions')
        .select('id, student_id, unit_id, attempt_no, status, passed, approved_score, reviewed_at, submitted_at')
        .order('attempt_no', { ascending: false });
      if (!isAll) lsQuery = lsQuery.eq('class_id', classId);

      let gmrQuery = admin
        .from('game_mission_results')
        .select('student_id, mission_id, best_score, attempt_count, hints_used, passed, first_passed_at, latest_attempt_id, missions(unit_id, code, title, max_score)')
        .order('updated_at', { ascending: false });
      if (!isAll) gmrQuery = gmrQuery.eq('class_id', classId);

      const [
        { data: units },
        { data: upRows },
        { data: qaRows },
        { data: lsRows },
        { data: gmrRows },
      ] = await Promise.all([unitsPromise, upQuery, qaQuery, lsQuery, gmrQuery]);

      const studentRecords: ClassStudentRecord[] = [];

      for (const member of members) {
        const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
        const cls = Array.isArray(member.classes) ? member.classes[0] : member.classes;
        if (!profile || profile.active !== true) continue;

        const studentId = profile.id || member.profile_id;
        const unitProgress: ClassStudentRecord['unitProgress'] = {};

        for (const u of units || []) {
          const unitKey = `U${String(u.sequence_no).padStart(2, '0')}`;
          const up = (upRows || []).find((r: any) => r.student_id === studentId && r.unit_id === u.id);
          const q = (qaRows || []).find((r: any) => r.student_id === studentId && r.quizzes?.unit_id === u.id);
          const l = (lsRows || []).find((r: any) => r.student_id === studentId && r.unit_id === u.id);
          const m = (gmrRows || []).find((r: any) => r.student_id === studentId && r.missions?.unit_id === u.id);

          unitProgress[unitKey] = {
            unitId: u.id,
            sequenceNo: Number(u.sequence_no),
            progressPercent: up?.progress_percent !== undefined ? Number(up.progress_percent) : 0,
            passed: Boolean(up?.passed),
            unlocked: u.sequence_no === 1 || Boolean(up?.passed),
            approvedScore: up?.approved_score !== null && up?.approved_score !== undefined ? Number(up.approved_score) : null,
            latestQuiz: q
              ? {
                  id: q.id,
                  score: q.approved_score !== null ? Number(q.approved_score) : null,
                  passed: q.passed !== null ? Boolean(q.passed) : null,
                  status: q.status,
                  submittedAt: q.submitted_at,
                }
              : null,
            latestLab: l
              ? {
                  id: l.id,
                  status: l.status,
                  passed: l.passed !== null ? Boolean(l.passed) : null,
                  approvedScore: l.approved_score !== null ? Number(l.approved_score) : null,
                  reviewedAt: l.reviewed_at,
                  submittedAt: l.submitted_at,
                }
              : null,
            latestMission: m
              ? (() => {
                  const mObj: any = Array.isArray(m.missions) ? m.missions[0] : m.missions;
                  return {
                    missionId: m.mission_id,
                    code: mObj?.code || '',
                    title: mObj?.title || '',
                    maxScore: Number(mObj?.max_score) || 100,
                    bestScore: Number(m.best_score) || 0,
                    attemptCount: Number(m.attempt_count) || 1,
                    hintsUsed: Number(m.hints_used) || 0,
                    passed: Boolean(m.passed),
                    firstPassedAt: m.first_passed_at,
                    latestAttemptId: m.latest_attempt_id,
                  };
                })()
              : null,
          };
        }

        studentRecords.push({
          studentId,
          studentCode: profile.student_code || '',
          displayName: profile.display_name || 'ผู้เรียน',
          classCode: cls?.code || '',
          classTitle: cls?.title || '',
          unitProgress,
        });
      }

      return studentRecords;
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
        classCode: row.class_code || '',
        classTitle: row.class_title || '',
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
        latestMission: row.latest_mission_id
          ? {
              missionId: row.latest_mission_id,
              code: row.latest_mission_code,
              title: row.latest_mission_title,
              maxScore: Number(row.latest_mission_max_score),
              bestScore: Number(row.latest_mission_best_score),
              attemptCount: Number(row.latest_mission_attempt_count),
              hintsUsed: Number(row.latest_mission_hints_used),
              passed: Boolean(row.latest_mission_passed),
              firstPassedAt: row.latest_mission_first_passed_at,
              latestAttemptId: row.latest_mission_latest_attempt_id,
            }
          : null,
      };
    }
  }

  return Array.from(map.values());
}

/**
 * Enrolls a student into PV1, PV2, or PV3 class, updates their student code and display name.
 */
export async function joinClassService(
  actorId: string,
  rawInput: unknown,
): Promise<{ success: true; classId: string; classCode: string; classTitle: string }> {
  const input = joinClassInputSchema.parse(rawInput);
  const targetClass = getPvClassByCode(input.joinCode);
  if (!targetClass) {
    throw new Error(`รหัสกลุ่มเรียนไม่ถูกต้อง: ${input.joinCode}`);
  }

  const safeStudentCode = input.studentCode.trim().slice(0, 30);
  const safeDisplayName = input.displayName.trim().slice(0, 100);

  try {
    const sql = getServerDatabase();

    // 1. Check if the user is already in a class
    const existing = await sql`
      select cm.class_id, cm.active, c.code as class_code
      from public.class_members as cm
      left join public.classes as c on c.id = cm.class_id
      where cm.profile_id = ${actorId} and cm.active = true
      limit 1
    `;

    if (existing.length > 0 && existing[0]) {
      const current = existing[0];
      if (current.class_id !== targetClass.id) {
        throw new Error(
          `คุณได้ลงทะเบียนอยู่ในกลุ่ม ${current.class_code || 'อื่น'} แล้ว ไม่สามารถย้ายกลุ่มได้ หากต้องการย้ายกลุ่มกรุณาติดต่อครูผู้สอน`
        );
      }
    }

    // 2. Ensure class exists in public.classes
    await sql`
      insert into public.classes (
        id, course_id, code, title, academic_year, semester, status
      ) values (
        ${targetClass.id},
        coalesce(
          (select id from public.courses where code = '21909-2020' limit 1),
          (select id from public.courses limit 1)
        ),
        ${targetClass.code},
        ${targetClass.title},
        2569,
        2,
        'active'
      )
      on conflict (id) do update
      set code = ${targetClass.code},
          title = ${targetClass.title},
          status = 'active'
    `;

    // 3. Update student profile
    await sql`
      update public.profiles
      set student_code = ${safeStudentCode},
          display_name = ${safeDisplayName}
      where id = ${actorId}
    `;

    // 4. Enroll into class_members
    await sql`
      insert into public.class_members (
        class_id, profile_id, member_role, active
      ) values (
        ${targetClass.id}, ${actorId}, 'student', true
      )
      on conflict (class_id, profile_id) do update
      set active = true, member_role = 'student'
    `;

    return {
      success: true,
      classId: targetClass.id,
      classCode: targetClass.code,
      classTitle: targetClass.title,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('คุณได้ลงทะเบียนอยู่ในกลุ่ม')) {
      throw err;
    }
    // Fallback using Supabase Admin Client (Service Role bypasses RLS)
    try {
      const adminSupabase = createAdminSupabaseClient();
      const { data: member } = await adminSupabase
        .from('class_members')
        .select('class_id, active')
        .eq('profile_id', actorId)
        .eq('active', true)
        .maybeSingle();

      if (member && member.class_id !== targetClass.id) {
        throw new Error('คุณได้ลงทะเบียนอยู่ในกลุ่มอื่นแล้ว ไม่สามารถย้ายกลุ่มได้ หากต้องการย้ายกลุ่มกรุณาติดต่อครูผู้สอน');
      }

      // Ensure class exists in public.classes
      const { data: courseData } = await adminSupabase
        .from('courses')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (courseData?.id) {
        await adminSupabase.from('classes').upsert(
          {
            id: targetClass.id,
            course_id: courseData.id,
            code: targetClass.code,
            title: targetClass.title,
            academic_year: 2569,
            semester: 2,
            status: 'active',
          },
          { onConflict: 'id' },
        );
      }

      await adminSupabase
        .from('profiles')
        .update({ student_code: safeStudentCode, display_name: safeDisplayName })
        .eq('id', actorId);

      const { error: upsertErr } = await adminSupabase
        .from('class_members')
        .upsert(
          {
            class_id: targetClass.id,
            profile_id: actorId,
            member_role: 'student',
            active: true,
          },
          { onConflict: 'class_id,profile_id' },
        );

      if (upsertErr) throw upsertErr;

      return {
        success: true,
        classId: targetClass.id,
        classCode: targetClass.code,
        classTitle: targetClass.title,
      };
    } catch (fallbackErr) {
      if (fallbackErr instanceof Error && fallbackErr.message.includes('คุณได้ลงทะเบียนอยู่ในกลุ่ม')) {
        throw fallbackErr;
      }
      console.error('joinClassService admin fallback error:', fallbackErr);
    }
    throw err;
  }
}


