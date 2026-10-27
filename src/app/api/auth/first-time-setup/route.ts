import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '../../../../lib/supabase/admin';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { getServerDatabase } from '../../../../server/database/client';
import { GROUP_ID_TO_PV_CLASS } from '../../../../lib/classes/classGroups';

export const dynamic = 'force-dynamic';

// GET: Look up student information by student_id or email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';

    if (!query) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสนักศึกษาหรืออีเมล' }, { status: 400 });
    }

    // Strip @utc.ac.th if present, to extract 11-digit student ID
    const studentId = query.replace(/@utc\.ac\.th$/i, '').trim();
    const emailCandidate = query.includes('@') ? query.toLowerCase() : `${studentId}@utc.ac.th`;

    const sql = getServerDatabase();
    const students = await sql`
      select
        student_id,
        prefix,
        first_name,
        last_name,
        full_name,
        gender,
        group_id,
        order_num,
        email
      from public.students
      where student_id = ${studentId} or lower(email) = ${emailCandidate}
      limit 1
    `;

    const student = students[0];
    if (!student) {
      return NextResponse.json(
        {
          error: `ไม่พบข้อมูลนักเรียนสำหรับ "${query}" ในระบบ กรุณาตรวจสอบรหัสประจำตัวหรือติดต่อครูผู้สอน`,
        },
        { status: 404 },
      );
    }

    const groupInfo = GROUP_ID_TO_PV_CLASS[student.group_id] || {
      code: 'PV1',
      id: '22222222-2222-4222-8222-222222222222',
      title: `กลุ่ม ${student.group_id}`,
    };

    // Check if account already exists in public.profiles
    const profiles = await sql`
      select id, student_code, display_name, active
      from public.profiles
      where student_code = ${student.student_id}
      limit 1
    `;

    const isActivated = profiles.length > 0;

    return NextResponse.json({
      found: true,
      studentId: student.student_id,
      prefix: student.prefix,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: student.full_name,
      email: student.email,
      groupId: student.group_id,
      groupCode: groupInfo.code,
      groupTitle: groupInfo.title,
      isActivated,
    });
  } catch (error) {
    console.error('Error in GET /api/auth/first-time-setup:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลนักเรียน' },
      { status: 500 },
    );
  }
}

// POST: Activate account and set initial password
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, password, confirmPassword } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'กรุณาระบุรหัสนักศึกษาหรืออีเมล' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านใหม่' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป' },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' }, { status: 400 });
    }

    const studentId = identifier.replace(/@utc\.ac\.th$/i, '').trim();
    const emailCandidate = identifier.includes('@')
      ? identifier.toLowerCase()
      : `${studentId}@utc.ac.th`;

    const sql = getServerDatabase();
    const students = await sql`
      select
        student_id,
        prefix,
        first_name,
        last_name,
        full_name,
        gender,
        group_id,
        order_num,
        email
      from public.students
      where student_id = ${studentId} or lower(email) = ${emailCandidate}
      limit 1
    `;

    const student = students[0];
    if (!student) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลนักเรียนในทะเบียนระบบ กรุณาตรวจสอบรหัสหรือติดต่อครูผู้สอน' },
        { status: 404 },
      );
    }

    const targetEmail = `${student.student_id}@utc.ac.th`;
    const classInfo = GROUP_ID_TO_PV_CLASS[student.group_id] || {
      code: 'PV1',
      id: '22222222-2222-4222-8222-222222222222',
      title: 'ปวช.1 ช่างเทคนิคคอมพิวเตอร์ - กลุ่ม 1',
    };

    const adminClient = createAdminSupabaseClient();
    let authUserId: string | null = null;

    // 1. Check if user already exists in auth.users by email
    const { data: userList } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const existingAuthUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
    );

    if (existingAuthUser) {
      // Update password and ensure email is confirmed
      const { data: updated, error: updateErr } = await adminClient.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            display_name: student.full_name,
            student_code: student.student_id,
          },
        },
      );
      if (updateErr) {
        throw new Error(`ไม่สามารถอัปเดตรหัสผ่านได้: ${updateErr.message}`);
      }
      authUserId = updated.user.id;
    } else {
      // Create user directly
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email: targetEmail,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: student.full_name,
          student_code: student.student_id,
        },
      });
      if (createErr || !created?.user) {
        throw new Error(`ไม่สามารถสร้างบัญชีผู้ใช้ได้: ${createErr?.message || 'Unknown error'}`);
      }
      authUserId = created.user.id;
    }

    // 2. Ensure public.profiles is synced with student_code and display_name
    await sql`
      insert into public.profiles (id, student_code, display_name, role, active)
      values (
        ${authUserId},
        ${student.student_id},
        ${student.full_name},
        'student',
        true
      )
      on conflict (id) do update
      set student_code = ${student.student_id},
          display_name = ${student.full_name},
          role = 'student',
          active = true
    `;

    // 3. Ensure public.classes exists for targetClass
    await sql`
      insert into public.classes (
        id, course_id, code, title, academic_year, semester, status
      ) values (
        ${classInfo.id},
        (select id from public.courses where code = '21909-2020' limit 1),
        ${classInfo.code},
        ${classInfo.title},
        2569,
        2,
        'active'
      )
      on conflict (id) do update
      set code = ${classInfo.code},
          title = ${classInfo.title},
          status = 'active'
    `;

    // 4. Enroll student into class_members
    await sql`
      insert into public.class_members (
        class_id, profile_id, member_role, active
      ) values (
        ${classInfo.id},
        ${authUserId},
        'student',
        true
      )
      on conflict (class_id, profile_id) do update
      set active = true, member_role = 'student'
    `;

    // 5. Automatically log the student in via createServerSupabaseClient
    let autoSignedIn = false;
    try {
      const serverSupabase = await createServerSupabaseClient();
      const { error: signInErr } = await serverSupabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });
      if (!signInErr) {
        autoSignedIn = true;
      }
    } catch (e) {
      console.warn('Auto sign-in notice:', e);
    }

    return NextResponse.json({
      success: true,
      email: targetEmail,
      studentId: student.student_id,
      fullName: student.full_name,
      className: classInfo.title,
      autoSignedIn,
      message: 'ตั้งรหัสผ่านและเปิดใช้งานบัญชีสำเร็จเรียบร้อยแล้ว!',
    });
  } catch (error) {
    console.error('Error in POST /api/auth/first-time-setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตั้งรหัสผ่าน' },
      { status: 500 },
    );
  }
}
