# Validation Report

วันที่ตรวจ: 15 กันยายน 2026 (Asia/Bangkok)

## เป้าหมายที่ตรวจ

- Supabase project: `cctv-learning-space-dev`
- Project ref: `sdhyjirmzjxxekezlcxl`
- Region: `ap-northeast-1`
- PostgreSQL: 17.6
- สถานะก่อนเริ่ม: มี `profiles`, `courses`, `units`; ไม่มี migration history; `courses/units` ใช้ bigint; มีข้อมูล 1 วิชาและ 8 หน่วย

## Migration ที่ติดตั้งจริง

| Version | Name | ผล |
|---|---|---|
| `20260915154506` | `001_core` | ผ่าน |
| `20260915154535` | `002_assessment` | ผ่าน |
| `20260915154541` | `003_game` | ผ่าน |
| `20260915154556` | `004_security` | ผ่าน |
| `20260915154559` | `005_functions_triggers` | ผ่าน |
| `20260915154841` | `006_performance_indexes` | ผ่าน |

`006_performance_indexes` เพิ่มหลัง Supabase Performance Advisor พบ Foreign Key 13 จุดที่ยังไม่มี covering index ใน 001–005 การแก้ทำเป็น migration ใหม่เพื่อไม่เปลี่ยนประวัติที่ติดตั้งแล้ว

## ผลตรวจบน Supabase จริง

- Public tables: 19/19 ตาม Level A/B/C
- Primary Key ภายในที่ไม่ใช่ UUID: 0
- ตารางที่ไม่ได้เปิดและ Force RLS: 0
- ตารางที่ไม่มี authenticated SELECT policy: 0
- ตารางที่ `anon` มีสิทธิ์: 0
- SECURITY DEFINER ใน schema `public`: 0
- SECURITY DEFINER ใน `private` ที่ไม่ได้ล็อก `search_path = ''`: 0
- Auth → Profile trigger: พบและ active
- Audit append-only trigger: พบและ active
- Browser grant สำหรับข้อมูลดิบ Quiz/LAB/Game: พบครบ
- Browser grant ที่รั่วไปยังคะแนน, `passed`, trusted game results, Certificate, Audit หรือ server timestamp: 0
- Trusted functions: `service_role` เรียกได้ และ `authenticated` เรียกไม่ได้ครบทั้ง 5 ฟังก์ชัน
- วิชา `21909-2020`: ยังอยู่ครบ
- หน่วยเรียน: 8
- Unit ที่ไม่มี Course หลังแปลง UUID: 0

การตรวจ runtime โดยแทรกข้อมูลจำลองชั่วคราวใน transaction บน Remote ไม่ได้รัน เพราะช่องทาง `execute_sql` ของ connector ปฏิเสธ `INSERT` ใน read-only transaction (`25006`) จึงไม่มีข้อมูลทดสอบถูกสร้างบน Supabase การทดสอบสวม role แบบมีข้อมูลจริงจึงรันบน PostgreSQL 17 local integration แทน ส่วน Remote ตรวจจาก catalog, grants, policies, triggers และ Advisor โดยตรง

## Advisor

- Security Advisor: 0 findings
- Performance Advisor หลัง migration 006: ไม่มี `unindexed_foreign_keys`
- คงเหลือเฉพาะ `unused_index` ระดับ INFO ซึ่งเป็นผลปกติของ schema ที่เพิ่งสร้างและยังไม่มี workload; ควรประเมินอีกครั้งหลังมีข้อมูล/การใช้งานจริง ไม่ควรลบ index จาก snapshot แรก

## TDD และ Local Integration

`TDD_REQUIRED: yes`

Observable seam คือ PostgreSQL 17 จริง โดยตรวจ catalog, constraints, privileges, RLS และ transaction behavior ไม่ได้ตรวจเพียงข้อความใน SQL

RED ที่สังเกตก่อน implementation:

- ไม่มี `profiles`/Level A
- Legacy `courses.id` ยังเป็น bigint
- ไม่มี Level B
- ไม่มี Level C
- Public tables ยังไม่เปิด RLS
- Auth insert ยังไม่สร้าง profile
- นักเรียนแก้ `lab_submissions.submitted_at` หลังส่งได้
- Foreign Key 13 จุดยังไม่มี covering index

GREEN ที่สังเกตหลัง implementation:

- Fresh install บน PostgreSQL 17: ผ่าน
- Legacy bigint → UUID และรักษา 1 วิชา/8 หน่วย: ผ่าน
- RLS Student/Teacher/Admin: ผ่าน
- Client เขียน raw Quiz/LAB/Game ได้ตาม scope: ผ่าน
- Client เขียน `approved_score`, `passed`, trusted game results, Certificate และ Audit ไม่ได้: ผ่าน
- Backend transaction คำนวณ Quiz/Game pass status, สรุป mission, progress และออก Certificate: ผ่าน
- LAB workflow และ server-owned submission timestamp: ผ่าน
- Security catalog และ Foreign Key index coverage: ผ่าน

คำสั่งทดสอบซ้ำ:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tests\run-tests.ps1
```

## สิ่งที่ยังไม่ทำตาม Scope

- ยังไม่สร้างหน้าเว็บ/Next.js
- ยังไม่สร้าง Storage bucket `lab-evidence`
- ยังไม่ติดตั้ง Storage policies บน `storage.objects`
- ยังไม่ใช้ข้อมูลผู้เรียนจริงทดสอบ

แนวทาง Storage รอบถัดไปอยู่ใน `STORAGE_LAB_EVIDENCE.md`
