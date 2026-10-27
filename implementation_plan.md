# แผนการดำเนินงาน: Deploy Web Application (อัปเดตระบบรายชื่อนักศึกษา 40 คน และระบบล็อกอิน @utc.ac.th)

## 1. วัตถุประสงค์ (Objective)
ทำการส่งมอบและ Deploy โค้ดส่วนที่มีการปรับปรุงล่าสุดขึ้นสู่ระบบ Production ผ่าน Git Remote Repository (`origin/main`) บน GitHub (`patpongjamsai-sketch/CCTV-LEARNING-SPACE`) เพื่อให้ระบบ Hosting (Vercel/CI/CD) ทำการ Build และเผยแพร่เวอร์ชันใหม่ของ Web Application สู่สาธารณะ

---

## 2. รายการไฟล์และฟังก์ชันที่ส่งมอบ (Changes to Deploy)

1. **ระบบฐานข้อมูลและทะเบียนนักศึกษา 40 คน:**
   - [`supabase/seed_students_40.sql`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/supabase/seed_students_40.sql): อัปเดตโครงสร้างตาราง `public.students` รองรับคอลัมน์ `email VARCHAR(100)` โดเมน `@utc.ac.th` พร้อม RLS Policy
2. **ระบบเปิดใช้งานและตั้งรหัสผ่านครั้งแรก (First-Time Activation):**
   - [`src/app/api/auth/first-time-setup/route.ts`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/app/api/auth/first-time-setup/route.ts): Endpoint ตรวจสอบข้อมูลนักศึกษา, สร้างบัญชีผู้ใช้ใน Supabase Auth แบบ Auto-confirm, บันทึกโปรไฟล์ และลงทะเบียนเข้าห้องเรียน (PV1, PV2, PV3)
   - [`src/lib/classes/classGroups.ts`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/lib/classes/classGroups.ts): แมปปิ้งกลุ่มเรียน 692190901, 692190902, 692190903 เข้ากับคลาส PV1, PV2, PV3
3. **หน้าจอเข้าสู่ระบบใหม่ (Login UI):**
   - [`src/app/login/LoginForm.tsx`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/app/login/LoginForm.tsx): เพิ่มแท็บ "ตั้งรหัสผ่านครั้งแรก" แสดงชื่อผู้เรียนอัตโนมัติ และปรับฟิลด์ล็อกอินให้ระบุอีเมล `@utc.ac.th` อย่างชัดเจน
   - [`src/lib/auth/validation.ts`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/lib/auth/validation.ts): ตรวจสอบความถูกต้องและแปลงรหัสนักศึกษาเป็นอีเมลอัตโนมัติ
4. **ชุดการทดสอบ (Automated Tests):**
   - [`src/tests/firstTimeSetupApi.test.ts`](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/tests/firstTimeSetupApi.test.ts): ทดสอบความถูกต้องของ API การตั้งรหัสผ่านครั้งแรกและการเข้าสู่ระบบอัตโนมัติ

---

## 3. ขั้นตอนการดำเนินการ Deploy (Execution Steps)

1. **ตรวจสอบความสมบูรณ์ของโค้ด (Pre-deployment Verification):**
   - รัน Typecheck: `npm run lint` (`tsc --noEmit`)
   - รัน Automated Tests: `npm test` (56 files, 257 tests)
2. **บันทึกการเปลี่ยนแปลง (Git Commit):**
   - เพิ่มไฟล์ที่แก้ไขและไฟล์ใหม่ทั้งหมดเข้า Git Staging
   - ทำการ Commit ด้วยข้อความมาตรฐาน:  
     `feat(auth): enable student first-time password setup, enforce @utc.ac.th email, and seed 40-student roster`
3. **ส่งขึ้นระบบ Production (Git Push):**
   - รันคำสั่ง `git push origin main`
   - ระบบ CI/CD และ Vercel จะเริ่มกระบวนการ Build และ Deploy ขึ้น Production โดยอัตโนมัติ
4. **ตรวจสอบสถานะหลัง Deploy (Post-deployment Check):**
   - ตรวจสอบสถานะการ Push บน GitHub Repository
