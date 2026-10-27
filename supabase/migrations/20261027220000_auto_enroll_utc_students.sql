-- Migration: 20261027220000_auto_enroll_utc_students.sql
-- Automatically link Google OAuth / Email users with public.students and enroll into PV1, PV2, PV3

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  safe_display_name text;
  v_student record;
  v_class_id uuid;
begin
  -- Check if user matches public.students by email or student_code
  select * into v_student
  from public.students
  where lower(email) = lower(new.email)
     or student_id = (new.raw_user_meta_data ->> 'student_code')
  limit 1;

  if v_student.student_id is not null then
    safe_display_name := v_student.full_name;
    
    insert into public.profiles (id, student_code, display_name, role, active)
    values (new.id, v_student.student_id, safe_display_name, 'student', true)
    on conflict (id) do update
    set student_code = v_student.student_id,
        display_name = safe_display_name,
        role = 'student',
        active = true;

    -- Determine class ID based on group_id
    if v_student.group_id = '692190901' then
      v_class_id := '22222222-2222-4222-8222-222222222222'::uuid;
    elsif v_student.group_id = '692190902' then
      v_class_id := '22222222-2222-4222-8222-222222222223'::uuid;
    elsif v_student.group_id = '692190903' then
      v_class_id := '22222222-2222-4222-8222-222222222224'::uuid;
    end if;

    if v_class_id is not null then
      insert into public.class_members (class_id, profile_id, member_role, active)
      values (v_class_id, new.id, 'student', true)
      on conflict (class_id, profile_id) do update
      set active = true, member_role = 'student';
    end if;

  else
    safe_display_name := left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        'ผู้ใช้ใหม่'
      ),
      100
    );

    insert into public.profiles (id, display_name, role, active)
    values (new.id, safe_display_name, 'student', true)
    on conflict (id) do nothing;
  end if;

  return new;
end
$function$;

-- Ensure trigger is active
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();
