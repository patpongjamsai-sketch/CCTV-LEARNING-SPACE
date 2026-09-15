# LAB 1 — Profiles, Courses และ Units

เวลาโดยประมาณ: 90–120 นาที

## เป้าหมาย

สร้างฐานข้อมูลส่วนแรกของ CCTV Learning Space และทดลอง:

- Primary Key
- Foreign Key
- Unique Constraint
- Check Constraint
- Index
- GRANT
- Row Level Security (RLS)

## ไฟล์ที่ใช้

1. `00_preflight.sql` — ตรวจว่ามีตารางเดิมหรือไม่ (ไม่แก้ไขข้อมูล)
2. `01_create_schema.sql` — สร้างตาราง Constraint Index สิทธิ์ และ RLS
3. `02_seed_course.sql` — เพิ่มรายวิชา 21909-2020 และ 8 หน่วย
4. `03_verify_lab.sql` — ตรวจโครงสร้าง ข้อมูล และ Security
5. `04_cleanup_lab.sql` — ล้างตารางทดลองเมื่อไม่ต้องการใช้ต่อ

> ใช้เฉพาะ Supabase Development Project ห้ามทดลอง Cleanup บน Production

## Predict

ก่อนรัน ให้คาดการณ์:

1. ถ้า Course Code ซ้ำ จะเกิดอะไรขึ้น
2. ถ้า Unit อ้าง `course_id` ที่ไม่มี จะเกิดอะไรขึ้น
3. ถ้า `sequence_no` เป็น 0 จะเกิดอะไรขึ้น
4. ผู้ใช้ที่ยังไม่ Login ควรอ่าน Course ได้หรือไม่

## ขั้นตอนทดลอง

### ขั้นที่ 1 — สร้าง Schema

1. เปิด Supabase Dashboard → SQL Editor
2. เลือก New query
3. รัน `00_preflight.sql` ก่อนทุกครั้ง
4. ถ้าผลลัพธ์ส่วนแรกเป็น 0 แถว ให้คัดลอกทั้งหมดจาก `01_create_schema.sql` แล้วกด Run
5. ถ้าพบ `profiles`, `courses` หรือ `units` ห้ามสร้างซ้ำ ให้ตรวจด้วย `03_verify_lab.sql`
6. เมื่อตารางสร้างสำเร็จ ต้องพบข้อความ `LAB 1 schema created successfully`

> `01_create_schema.sql` เป็นสคริปต์สร้างครั้งแรก ไม่ใช่สคริปต์สำหรับรันซ้ำ การเติม
> `IF NOT EXISTS` อาจซ่อนปัญหาว่าตารางเดิมมีคอลัมน์หรือ Constraint ไม่ตรงกับ LAB

### ขั้นที่ 2 — เพิ่มข้อมูลตัวอย่าง

1. เปิด Query ใหม่
2. รัน `02_seed_course.sql`
3. ต้องเห็นรายวิชา 1 รายการและหน่วย 8 รายการ

### ขั้นที่ 3 — ตรวจสอบ

1. เปิด Query ใหม่
2. รัน `03_verify_lab.sql` ทีละ Section
3. บันทึก Screenshot ผลลัพธ์ทุก Section

### ขั้นที่ 4 — ดูผ่าน Table Editor

ตรวจตาราง:

- `profiles`
- `courses`
- `units`

ลองเปิด Relation ของ `units.course_id` และตรวจว่าชี้ไปที่ `courses.id`

### ขั้นที่ 5 — สร้างผู้ใช้ทดสอบสำหรับ Profile

1. ไปที่ Authentication → Users
2. เพิ่มผู้ใช้ทดสอบด้วยอีเมลที่ไม่ใช่ข้อมูลนักเรียนจริง
3. คัดลอก UUID ของ User
4. แทนค่า `<AUTH_USER_UUID>` แล้วรัน:

```sql
insert into public.profiles (id, student_code, display_name, role)
values ('<AUTH_USER_UUID>', 'TEST-001', 'ผู้เรียนทดลอง', 'student');
```

ห้ามสร้าง UUID เอง เพราะ `profiles.id` ต้องอ้างอิง User ที่มีอยู่ใน `auth.users`

## Observe

บันทึกสิ่งที่พบ:

| การทดลอง | ผลที่คาด | ผลที่พบ | ผ่าน |
|---|---|---|---|
| Course Code ซ้ำ | Unique ปฏิเสธ | | |
| Unit Sequence ซ้ำ | Unique ปฏิเสธ | | |
| Course ID ไม่มีจริง | Foreign Key ปฏิเสธ | | |
| Sequence เป็น 0 | Check ปฏิเสธ | | |
| Authenticated อ่าน Published | อ่านได้ | | |
| Authenticated อ่าน Draft | อ่านไม่ได้ | | |
| ผู้เรียนแก้ Role | ทำไม่ได้ | | |

## Analyze

ตอบคำถาม:

1. ทำไม `profiles.id` ต้องเป็น UUID แต่ `courses.id` ใช้ Bigint Identity ได้
2. Primary Key กับ Unique Constraint ต่างกันอย่างไร
3. Foreign Key ช่วยรักษาความถูกต้องของข้อมูลอย่างไร
4. เหตุใด Index ของ Foreign Key จึงสำคัญ
5. GRANT กับ RLS ทำงานคนละหน้าที่อย่างไร
6. เพราะเหตุใดผู้เรียนแก้ `display_name` ได้ แต่แก้ `role` ไม่ได้

## Conclusion

เขียนสรุป 5–10 บรรทัดว่า Constraint ป้องกัน “ข้อมูลผิด” และ RLS ป้องกัน “การเข้าถึงผิดคน” อย่างไร

## หลักฐานที่ต้องเก็บ

```text
evidence/supabase/lab-01/
  01-schema-created.png
  02-course-and-8-units.png
  03-constraints.png
  04-indexes.png
  05-rls-and-policies.png
  06-negative-tests.png
  lab-01-summary.md
```

ก่อนถ่ายภาพ ตรวจว่าไม่มี Password, Secret Key, Token หรือ Connection String

## เกณฑ์ผ่าน

- [ ] ตาราง 3 ตารางสร้างสำเร็จ
- [ ] Course มี 1 รายการและ Unit มี 8 รายการ
- [ ] Primary Key และ Foreign Key ถูกต้อง
- [ ] Negative Tests ทั้ง 3 กรณีถูกปฏิเสธ
- [ ] RLS เปิดครบทุกตาราง
- [ ] Policy ครบตามที่ออกแบบ
- [ ] `anon` ไม่มีสิทธิ์เข้าถึงตาราง
- [ ] `authenticated` อ่านเฉพาะ Course/Unit ที่ Published
- [ ] ผู้เรียน Update ได้เฉพาะ `display_name`
- [ ] เก็บหลักฐานโดยไม่เปิดเผย Secret

## ขั้นต่อไป

เมื่อผ่าน LAB 1 แล้วจึงทำ LAB 2: `classes`, `class_members` และ `unit_progress`
