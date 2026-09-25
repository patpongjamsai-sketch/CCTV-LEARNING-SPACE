# Supabase Database + Security (Level A/B/C)

แพ็กเกจนี้เป็นฐานข้อมูลสำหรับโปรเจกต์ `cctv-learning-space-dev` โดยยังไม่มีหน้าเว็บ ครอบคลุม Data Model, Constraints, Indexes, RLS, Auth trigger, trusted transactions และแนวทาง Private Storage

สถานะ: ติดตั้งและตรวจบน Supabase project `sdhyjirmzjxxekezlcxl` แล้วเมื่อ 15 กันยายน 2026 รายละเอียดอยู่ใน `VALIDATION_REPORT.md`

## Migration

รันตามลำดับเท่านั้น:

1. `supabase/migrations/20260915154506_001_core.sql`
2. `supabase/migrations/20260915154535_002_assessment.sql`
3. `supabase/migrations/20260915154541_003_game.sql`
4. `supabase/migrations/20260915154556_004_security.sql`
5. `supabase/migrations/20260915154559_005_functions_triggers.sql`
6. `supabase/migrations/20260915154841_006_performance_indexes.sql`
7. `supabase/migrations/20260924094700_enable_class_members_realtime.sql`
8. `supabase/migrations/20260925043723_learning_progression_rules.sql`
9. `supabase/migrations/20260925043738_lab_evidence_storage.sql`
10. `supabase/migrations/20260925043742_connect_lab_unit1_progress.sql`
11. `supabase/migrations/20260925043746_fix_progression_audit_timestamp.sql`
12. `supabase/migrations/20260925043749_lab_pass_unlocks_unit.sql`

Production ใช้ version ตามรายการนี้แล้ว migration ของระบบความก้าวหน้าไม่กำหนดจำนวนครูต่อชั้นเรียน เพื่อคงสิทธิ์ครูที่ใช้งานอยู่

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

เมื่อครูตรวจ LAB เป็น `passed` trigger ฝั่งฐานข้อมูลจะสร้าง/ปรับปรุง `unit_progress`
ของผู้เรียนใน Unit เดียวกันแบบ transaction เดียวกัน พร้อมบันทึก Audit Log
`unit_progress.lab_verified` โดยต้องมี Evidence อย่างน้อยหนึ่งไฟล์ก่อนอนุมัติ

สำหรับ Unit 1 หาก LAB ที่มี Evidence ถูกครูตรวจผ่าน ฟังก์ชัน progression จะใช้
`unit_progress.lab_verified` เป็น completion source ล่าสุดและปลดล็อก Unit ถัดไป
โดยไม่บังคับ game score ซ้ำ กรณีที่มีการบันทึก game progress ภายหลัง ระบบจะกลับไป
ใช้ summative completion rule ตาม source ล่าสุดนั้น

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

Bucket ส่วน LAB ใช้ `lab-evidence` แบบ Private ตาม migration `20260925043738_lab_evidence_storage.sql`; การอัปโหลดผ่าน Server API เท่านั้น ส่วน Storage Policy สำหรับ direct browser upload ยังไม่เปิดใช้งาน
