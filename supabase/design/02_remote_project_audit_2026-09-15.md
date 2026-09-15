# หลักฐานตรวจ Supabase Project ก่อนออกแบบ Schema

ตรวจเมื่อ: 15 กันยายน 2569  
วิธีตรวจ: Supabase Management/Database Connector แบบ Read-only  
Project URL: `https://sdhyjirmzjxxekezlcxl.supabase.co`  
ไม่มีการอ่านหรือบันทึก Secret Key ลงไฟล์

## Project

| รายการ | ผลตรวจ |
|---|---|
| Project Ref | `sdhyjirmzjxxekezlcxl` |
| Project Name | `cctv-learning-space-dev` |
| Region | `ap-northeast-1` |
| Status | `ACTIVE_HEALTHY` |
| PostgreSQL | `17.6.1.166` / Engine 17 |
| Migration History | 0 รายการ |

## ตารางปัจจุบัน

| ตาราง | RLS | จำนวนแถว | ผลตรวจ |
|---|---:|---:|---|
| `profiles` | เปิด | 0 | PK อ้าง `auth.users(id)` และมี Role Constraint |
| `courses` | เปิด | 1 | Course Code ไม่ซ้ำ และ Identity PK |
| `units` | เปิด | 8 | FK ไป Course, ลำดับ/Slug ไม่ซ้ำใน Course |

## รายวิชาและหน่วยที่พบ

- `21909-2020 กล้องวงจรปิดบนระบบเครือข่าย`
- 72 ชั่วโมง
- Course Status: `published`
- Unit 1 `cctv-foundations`: `published`
- Unit 2–8: `draft`
- แต่ละ Unit กำหนด 540 นาที รวม 72 ชั่วโมง

## Policy ที่พบ

| ตาราง | Policy | สิทธิ์ |
|---|---|---|
| `profiles` | `profiles_select_own` | ผู้ Login อ่าน Profile ตนเอง |
| `profiles` | `profiles_update_own` | ผู้ Login แก้แถวตนเอง แต่ GRANT จำกัดคอลัมน์ |
| `courses` | `courses_select_published` | อ่านเฉพาะ Published |
| `units` | `units_select_published` | อ่านเฉพาะ Published |

## GRANT ที่ยืนยันด้วย `has_*_privilege`

- `authenticated` อ่าน `profiles` ได้ โดย RLS จำกัดแถว
- `authenticated` แก้ `profiles.display_name` ได้
- `authenticated` อ่าน `courses` และ `units` ได้ โดย RLS จำกัด Published
- `anon` อ่าน `courses` ไม่ได้

## Index ที่พบ

- Primary/Unique Index ของ `profiles`, `courses`, `units`
- `units_published_course_idx(course_id, sequence_no) where status = 'published'`

## ข้อค้นพบและความเสี่ยง

1. ตารางปัจจุบันสร้างสำเร็จและข้อมูล Course/Units พร้อมใช้งาน
2. Migration History ยังว่าง แสดงว่าการเปลี่ยน Schema ที่ทำผ่าน SQL Editor ยังไม่ถูกบันทึกเป็น Migration
3. ห้ามใช้ `01_create_schema.sql` ซ้ำ เพราะจะเกิด `42P07 relation already exists`
4. ต้องสร้าง Baseline จาก Remote ก่อนนำ Migration LAB 2 ขึ้นใช้งาน
5. Security/Performance Advisor Connector ตอบ Internal Error ในรอบตรวจนี้ จึงยังห้ามสรุปว่า Advisor ผ่าน
6. ยังไม่มี Profile จริง จึงยังทดสอบ RLS ระหว่าง Student/Teacher แบบ End-to-End ไม่ได้

## การดำเนินงานที่ยังไม่ได้ทำ

- ไม่ได้ Apply Migration ใหม่
- ไม่ได้ลบหรือแก้ข้อมูลเดิม
- ไม่ได้สร้าง Auth User
- ไม่ได้ดึง Publishable/Secret Key
- ไม่ได้เปลี่ยน Data API Settings

## ขั้นตอนถัดไป

1. ติดตั้ง/เปิด Supabase CLI และ Login
2. Link Project Ref `sdhyjirmzjxxekezlcxl`
3. Pull Remote Schema เพื่อสร้าง Baseline Migration
4. Commit Baseline เข้า Git
5. ทดสอบ LAB 2 ใน Local/Development
6. Apply Migration LAB 2 เมื่อผล RED–GREEN และ RLS Tests ผ่าน
7. สร้าง TypeScript Types ใหม่และเชื่อม Next.js

