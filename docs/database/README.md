# Supabase Database + Security (Level A/B/C)

แพ็กเกจนี้เป็นฐานข้อมูลสำหรับโปรเจกต์ `cctv-learning-space-dev` โดยยังไม่มีหน้าเว็บ ครอบคลุม Data Model, Constraints, Indexes, RLS, Auth trigger, trusted transactions และแนวทาง Private Storage

สถานะ: ติดตั้งและตรวจบน Supabase project `sdhyjirmzjxxekezlcxl` แล้วเมื่อ 15 กันยายน 2026 รายละเอียดอยู่ใน `VALIDATION_REPORT.md`

## Migration

รันตามลำดับเท่านั้น:

1. `supabase/migrations/001_core.sql`
2. `supabase/migrations/002_assessment.sql`
3. `supabase/migrations/003_game.sql`
4. `supabase/migrations/004_security.sql`
5. `supabase/migrations/005_functions_triggers.sql`
6. `supabase/migrations/006_performance_indexes.sql`

ไฟล์ที่ 6 เป็น migration เสริมจากผล Supabase Performance Advisor หลังติดตั้ง 001–005 เพื่อปิดคำเตือน Foreign Key ที่ไม่มี covering index โดยไม่แก้ประวัติ migration ย้อนหลัง

`001_core.sql` รองรับทั้งฐานข้อมูลว่างและสถานะ Development เดิมที่ `courses`/`units` ใช้ bigint โดยจะแปลงเป็น UUID ภายใน transaction และรักษาวิชา `21909-2020` พร้อม 8 หน่วยไว้

## ตาราง 3 ระดับ

- Level A: `profiles`, `courses`, `units`, `classes`, `class_members`, `unit_progress`
- Level B: `quizzes`, `quiz_attempts`, `lab_submissions`, `evidence_files`, `audit_logs`
- Level C: `missions`, `game_rooms`, `game_sessions`, `game_checkpoints`, `game_events`, `game_attempts`, `game_mission_results`, `certificates`

ทุก Primary Key ภายในเป็น UUID ส่วนค่าที่ผู้ใช้มองเห็นใช้ `code`, `slug` หรือ `certificate_no`

## เส้นแบ่งข้อมูลที่เชื่อถือได้

Browser ที่ใช้ role `authenticated` ส่งได้เฉพาะข้อมูลดิบ:

- Quiz: `client_answers` และเวลา client
- LAB: เนื้อหาร่าง/ส่งงาน และ metadata หลักฐาน
- Game: Session, Checkpoint และ `game_events`

Browser ไม่มีสิทธิ์เขียน `approved_score`, `passed`, `game_attempts`, `game_mission_results`, `unit_progress` หรือ `certificates`

การอนุมัติให้เรียกจาก Server ผ่าน direct PostgreSQL connection ภายใน transaction ด้วยฟังก์ชันใน schema `private`:

- `private.approve_quiz_attempt(...)`
- `private.review_lab_submission(...)`
- `private.finalize_game_attempt(...)`
- `private.upsert_unit_progress(...)`
- `private.issue_certificate(...)`

ฟังก์ชันเหล่านี้ให้ `EXECUTE` เฉพาะ `service_role`, อยู่ใน schema ที่ไม่ expose ผ่าน Data API, ใช้ `SECURITY DEFINER` พร้อม `search_path = ''` และ Browser เรียกไม่ได้ อย่าใส่ Service Role Key ใน Client หรือ repository

## RLS โดยสรุป

- Student เห็นข้อมูลของตนและ Class ที่เป็นสมาชิก active
- Teacher เห็นผู้เรียน ผลงาน และหลักฐานใน Class ที่ตนสอน
- Admin อ่านข้อมูลทั้งหมดเพื่อการจัดการ/ตรวจสอบ
- `anon` ไม่มีสิทธิ์ตาราง
- `audit_logs` แก้ไขหรือลบไม่ได้แม้ใช้ `service_role`; การเปลี่ยนสิทธิ์ คะแนน ผลผ่าน และ Certificate จะมี Audit
- ตาราง `game_events` รับข้อมูล client แบบ untrusted; ผลจริงสร้างใน transaction ฝั่ง Backend เท่านั้น

## การทดสอบโดยไม่ใช้ secret

ต้องมี Docker Desktop แล้วรัน:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tests\run-tests.ps1
```

ชุดทดสอบใช้ PostgreSQL 17 แบบชั่วคราว 2 ฐาน:

1. Fresh install
2. Legacy upgrade จาก bigint พร้อมตรวจว่าวิชาและ 8 หน่วยไม่หาย

นอกจากนี้ยังสวม role `authenticated`/`service_role` เพื่อตรวจ RLS, สิทธิ์รายคอลัมน์, LAB workflow, transaction คะแนน, game result, Certificate และ append-only Audit จริง

## Environment

ใช้ migration ชุดเดียวกันกับ Development, Staging และ Production แต่ต้องเป็น Supabase Project แยกกัน ห้าม copy Auth user หรือหลักฐานผู้เรียนจริงจาก Production ลง Development และต้องทดสอบบน Staging ก่อน Production เสมอ

แนวทาง Bucket ส่วน LAB อยู่ที่ `STORAGE_LAB_EVIDENCE.md`; รอบนี้ยังไม่สร้าง Bucket หรือ Storage Policy
