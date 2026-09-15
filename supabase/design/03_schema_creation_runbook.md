# คู่มือสร้าง Supabase Schema ทีละขั้น

คู่มือนี้ใช้กับ Project Development `sdhyjirmzjxxekezlcxl` เท่านั้น

## ขั้นที่ 1 — ตรวจ Project ก่อนทำงาน

ใน Supabase Dashboard ตรวจให้เห็นชื่อ:

```text
cctv-learning-space-dev
```

ห้ามดำเนินการหากกำลังเปิด Production Project หรือ Project Ref ไม่ตรง

## ขั้นที่ 2 — เก็บ Baseline ของสิ่งที่มีอยู่

ปัจจุบัน Remote มี `profiles`, `courses`, `units` แล้ว แต่ Migration History ยังว่าง จึงต้องใช้ Supabase CLI ดึง Schema ปัจจุบันมาเป็น Baseline ก่อน

ตรวจคำสั่งจาก CLI รุ่นที่ติดตั้งจริง:

```powershell
npx supabase --help
npx supabase login
npx supabase link --project-ref sdhyjirmzjxxekezlcxl
npx supabase db pull --help
```

จากนั้นใช้คำสั่ง `db pull` ตามรูปแบบที่ `--help` แสดง ห้ามเดา Flag และห้ามใส่ Database Password ลง Git

หลัง Pull ให้ตรวจ:

```powershell
npx supabase migration list
git status
```

หลักฐานที่ต้องเก็บ:

- ชื่อไฟล์ Baseline Migration
- ผล `migration list`
- Git Commit ID
- ภาพ Table Editor ที่มี 3 ตารางเดิม

## ขั้นที่ 3 — ทดลอง LAB 2 แบบ RED

เปิด SQL Editor แล้วรัน:

```sql
select
  to_regclass('public.classrooms') as classrooms,
  to_regclass('public.classroom_members') as classroom_members,
  to_regclass('public.unit_progress') as unit_progress;
```

ก่อนสร้าง ค่าทั้งสามต้องเป็น `null` ซึ่งเป็นหลักฐาน RED

## ขั้นที่ 4 — ทดสอบ LAB 2 ก่อนนำขึ้น Remote

ใช้ไฟล์ใน `supabase/learning/lab-02` ตามลำดับ:

1. `00_red_test.sql`
2. `01_create_schema.sql`
3. `00_red_test.sql` ซ้ำเพื่อดู GREEN
4. `02_seed_template.sql` หลังสร้าง Auth User ทดลอง
5. `03_verify_lab.sql`

ถ้ารัน Local Supabase ได้ ให้ใช้ Migration และ `supabase test db` แทนการทดลองซ้ำบน Remote

## ขั้นที่ 5 — ตรวจ Security ก่อน Apply

ต้องยืนยัน:

- ตารางใหม่ทุกตารางเปิด RLS
- `anon` ไม่มีสิทธิ์สมาชิก/Progress
- `authenticated` มีเพียง SELECT สำหรับคะแนนที่ Backend ดูแล
- Student A อ่าน Student B ไม่ได้
- Teacher ห้อง A อ่านห้อง B ไม่ได้
- ไม่มี `service_role` หรือ Database Password ใน Git

## ขั้นที่ 6 — Apply Migration

เมื่อตรวจ Local/Development ผ่านแล้ว จึง Apply Migration ที่มีชื่อชัดเจน เช่น `create_classrooms_members_progress` ผ่าน Workflow ของ Supabase CLI หรือ Migration Tool เพียงครั้งเดียว

ห้ามคัดลอก `create table` เดิมไปรันซ้ำ เพราะ Migration ต้องรู้ว่า Phase ใดถูก Apply แล้ว

## ขั้นที่ 7 — ตรวจหลัง Apply

รัน `03_verify_lab.sql` และตรวจ:

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

จากนั้นตรวจ Security และ Performance Advisors ใน Dashboard พร้อมบันทึก Finding และแนวทางแก้

## ขั้นที่ 8 — เชื่อม Next.js

หลัง Schema ผ่านแล้วจึง:

1. สร้าง TypeScript Types จาก Supabase
2. เก็บ Project URL และ Publishable Key ใน `.env.local`
3. เก็บ Secret Key เฉพาะ Server Environment ของ Vercel
4. ห้าม Prefix Secret ด้วย `NEXT_PUBLIC_`
5. ให้ Route Handler ตรวจคะแนนและบันทึก Progress แบบ Transaction

## หลักฐานส่งงาน

| หลักฐาน | สิ่งที่ต้องเห็น |
|---|---|
| RED | ตาราง LAB 2 เป็น `null` หรือ Test แสดงข้อความ RED |
| GREEN | Test Schema/RLS ผ่าน |
| Structure | PK, FK, Unique, Check และ Index |
| Security | ผล Allow/Deny ของ Student, Teacher, anon |
| Migration | ชื่อไฟล์, Migration List, Commit ID |
| Advisor | ไม่มี Finding ค้าง หรือมีคำอธิบายและ Ticket แก้ไข |
| Runtime | Next.js อ่านข้อมูลจริงโดยไม่ใช้ Secret ใน Browser |

