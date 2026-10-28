# แผนการดำเนินงาน (Implementation Plan)
## การเชื่อมต่อระบบอนุมัติห้องปฏิบัติการ 3D กับฐานข้อมูล Supabase และปรับเงื่อนไขการปลดล็อกด้วยแบบทดสอบอัตนัย

---

### 1. วัตถุประสงค์และปัญหาที่พบ (Problem Statement & Goals)
1. **ปัญหาที่ครูอนุมัติแล้วเด็กยังไม่ปลดล็อก**:
   - ในหน้า `/teacher` (คอมโพเนนต์ `TeacherApprovalDashboard.tsx`) ฟังก์ชัน `toggleLabUnlock` บันทึกผลลงเพียง `localStorage.setItem('cctv_teacher_approvals', ...)` บนเครื่องเบราว์เซอร์ของครูเท่านั้น ไม่ได้ส่ง API ไปยัง Supabase Database
   - เมื่อนักเรียนเปิดเข้าหน้า `/labs/3d/room-101` บนเครื่องของนักเรียน ระบบฝั่ง Server Gate (`private.is_unit_unlocked`) และ Client State จึงยังคงเห็นว่าห้องแล็บถูกล็อก
2. **การนำหัวข้อเนื้อหา 10 บทออกจากหน้าอนุมัติสิทธิ์**:
   - ในแดชบอร์ดครู (`/teacher`) ทั้งในแท็บ 1 (Curriculum Matrix) และแท็บ 4 (Roster) ยังมีข้อความและขั้นตอน "เนื้อหา 10 บท" อยู่ ผู้ใช้ได้นำเนื้อหา 10 บทออกจากกระบวนการเรียนรู้แล้ว จึงต้องการนำออกจากหน้าอนุมัติสิทธิ์ทั้งหมด
3. **การปรับเงื่อนไขการปลดล็อกห้องแล็บ 3D (Room 101 - 108)**:
   - ปรับข้อความเดิม:
     *🔒 "ห้องปฏิบัติการนี้ยังไม่ปลดล็อก ผู้เรียนจำเป็นต้องทำแบบทดสอบก่อนเรียน หรือผ่านหน่วยการเรียนรู้ก่อนหน้าตามลำดับ หรือติดต่อครูผู้สอนเพื่อขอเปิดสิทธิ์"*
   - เป็นเงื่อนไขใหม่:
     *ผู้เรียนจะปลดล็อกเข้าสู่ห้องปฏิบัติการ 3D (Room 101 - 108) ได้ ต้องทำ **แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน** ของหน่วยการเรียนรู้นั้น หรือได้รับการอนุมัติสิทธิ์จากครูผู้สอน*
   - ปรับใช้เหมือนกันทุกหน่วยการเรียนรู้ (Room 101 - Room 108)

---

### 2. แผนการปรับปรุงทางเทคนิค (Proposed Architecture & Implementation)

#### ส่วนที่ 1: โครงสร้างฐานข้อมูล Supabase และ Migration
- **สร้างตาราง `public.class_approvals`**:
  เก็บสถานะการอนุมัติระดับห้องเรียน (PV1, PV2, PV3 หรือระดับวิชา) โดยครูผู้สอน
  - `id` (UUID PK)
  - `class_id` (UUID FK -> `classes.id`)
  - `unit_sequence` (INT, 1 ถึง 8)
  - `lab_unlocked` (BOOLEAN, default false)
  - `unit_unlocked` (BOOLEAN, default true)
  - `assessment_unlocked` (BOOLEAN, default false)
  - `passed` (BOOLEAN, default false)
  - `updated_by` (UUID FK -> `profiles.id`)
  - `updated_at` (TIMESTAMPTZ)
  - Unique Constraint: `(class_id, unit_sequence)`
- **สร้างตาราง `public.subjective_submissions`**:
  บันทึกประวัติการส่งแบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐานของนักเรียนลงใน Supabase
  - `id` (UUID PK)
  - `student_id` (UUID FK -> `profiles.id`)
  - `class_id` (UUID FK -> `classes.id`)
  - `unit_id` (UUID FK -> `units.id`)
  - `unit_sequence` (INT)
  - `question_id` (TEXT)
  - `answers` (JSONB)
  - `status` (TEXT: `'submitted'`, `'graded'`, etc.)
  - `submitted_at` (TIMESTAMPTZ)
- **ปรับปรุงฟังก์ชัน `private.is_unit_unlocked` ใน PostgreSQL**:
  ให้คืนค่า `true` เมื่อเข้าเงื่อนไขใดเงื่อนไขหนึ่งดังนี้:
  1. มีการบันทึก Teacher Override ใน `audit_logs` / `unit_progress`
  2. ครูทำการปลดล็อกห้องแล็บหรือหน่วยใน `public.class_approvals` สำหรับห้องเรียนของนักเรียน
  3. นักเรียนได้ทำการส่งแบบทดสอบอัตนัย (`public.subjective_submissions`) ในหน่วยนั้นแล้ว

#### ส่วนที่ 2: Backend API Routes
1. **`GET /api/teacher/approvals` & `POST /api/teacher/approvals`**:
   - `GET`: ดึงสถานะการอนุมัติ (`class_approvals`) ของห้องเรียนที่เลือก (หรือทุกห้อง PV1, PV2, PV3)
   - `POST`: รองรับ Actions:
     - `toggle_lab`: ปลดล็อก/ล็อกห้องแล็บ 3D ของหน่วยที่ระบุ
     - `toggle_unit`: ปลดล็อก/ล็อกหน่วยการเรียนรู้
     - `toggle_assessment`: ปลดล็อก/ล็อกแบบทดสอบ
     - `toggle_passed`: อนุมัติผ่านหน่วย
     - `unlock_all`: ปลดล็อกทุกหน่วยและทุกห้องแล็บ 3D ในคราวเดียว
     - `reset_strict`: รีเซ็ตกลับเกณฑ์มาตรฐาน
   - อัปเดตลง `public.class_approvals` และบันทึกลงในฐานข้อมูล Supabase แบบ Realtime
2. **`POST /api/learning/subjective`**:
   - เมื่อนักเรียนกดยืนยันส่งแบบทดสอบอัตนัยใน `FaultChallengeModal.tsx` นอกจากบันทึก LocalStorage แล้ว ให้ส่งคำตอบมาบันทึกที่ API นี้
   - ระบบจะบันทึกลง `public.subjective_submissions` และอัปเดต `unit_progress` ทำให้นักเรียนปลดล็อกห้องแล็บ 3D ทันทีทั้งฝั่ง Client และ Server

#### ส่วนที่ 3: ปรับปรุงหน้าจอครู (`TeacherApprovalDashboard.tsx`)
1. **เชื่อมต่อปุ่มอนุมัติกับ API Supabase**:
   - ฟังก์ชัน `toggleLabUnlock`, `toggleUnitUnlock`, `toggleAssessmentUnlock`, `toggleUnitPassed`, `handleUnlockAll`, `handleResetStrict` ให้เรียก `fetch('/api/teacher/approvals')` ส่งข้อมูลไปอัปเดตฐานข้อมูล Supabase ทันที พร้อมแสดง Alert ยืนยันการบันทึก
   - โหลดสถานะเริ่มต้นจาก API `GET /api/teacher/approvals` เมื่อเข้าสู่หน้าจอ
2. **นำ "เนื้อหา 10 บท" ออกจากหน้าจอ**:
   - ในแท็บ 1: นำข้อความ "เรียนเนื้อหา 10 บท" ออกจากกล่องขั้นตอน และนำกล่องขั้นตอน "1. เนื้อหา 10 บท + คำถามระหว่างเรียน" ออกจากการ์ดทั้ง 8 หน่วย
   - ปรับขั้นตอนในการ์ดเหลือ:
     - 🎮 **1. สิทธิ์ห้องปฏิบัติการ 3D (Room 101 - 108)**
     - 📝 **2. สิทธิ์แบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐาน**
     - ✓ **3. อนุมัติผลการผ่านหน่วยการเรียนรู้**
   - ในแท็บ 4 (ตาราง Roster): นำคอลัมน์ "1. เนื้อหา" ออกจากหัวตารางและเนื้อหาตาราง

#### ส่วนที่ 4: ปรับปรุงเงื่อนไขและข้อความแจ้งเตือนการล็อกห้องแล็บ 3D
1. **`src/lib/progressionState.ts` (`isLabUnlocked`)**:
   - ปลดล็อกเมื่อ:
     - สิทธิ์ผู้สอน/ผู้ดูแลระบบ (Role teacher/admin)
     - ครูอนุมัติในระบบ (`approvals.unlockedLabs[unitId]`)
     - นักเรียนทำแบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐานสำเร็จ (`isSubjectiveCompleted(unitId)`)
   - ข้อความเมื่อถูกล็อก:
     *🔒 "ห้องปฏิบัติการนี้ยังไม่ปลดล็อก ผู้เรียนจำเป็นต้องทำแบบทดสอบอัตนัย: วิเคราะห์ปัญหาด้วยหลักฐานประจำหน่วย หรือรอครูผู้สอนอนุมัติสิทธิ์"*
2. **`src/app/labs/3d/[roomId]/page.tsx`**:
   - อัปเดตข้อความแจ้งเตือนหน้า Server Gate ให้ตรงกับข้อความใหม่
3. **`src/app/labs/page.tsx` และ `src/components/portal/CourseUnitAccordion.tsx`**:
   - ปรับป้ายกำกับและ Badge จากเดิมที่ระบุ "ต้องผ่าน 10 บท" เป็น:
     *🔒 "ต้องทำแบบทดสอบอัตนัยวิเคราะห์ปัญหา หรือรอครูอนุมัติ"*

---

### 3. แผนการทดสอบและตรวจสอบ (Verification Plan)
1. **ทดสอบระบบฐานข้อมูลและการ Migration**:
   - รันสคริปต์ Migration บน Remote Supabase เพื่อสร้างตาราง `class_approvals` และ `subjective_submissions` พร้อมทั้งอัปเดตฟังก์ชัน `private.is_unit_unlocked`
   - ตรวจสอบความถูกต้องของ RLS Policies
2. **ทดสอบ API Endpoints**:
   - ยิงทดสอบ `GET` และ `POST /api/teacher/approvals` เพื่อยืนยันว่าการเปลี่ยนค่าถูกบันทึกลงใน Database จริง
   - ยิงทดสอบ `POST /api/learning/subjective` เพื่อยืนยันการบันทึกคำตอบอัตนัย
3. **ทดสอบ UI การทำงานจริง (End-to-End Workflow)**:
   - จำลองฝั่งครูที่ `/teacher`: กดปุ่ม "🎮 ปลดล็อกห้องแล็บ 3D" -> ตรวจสอบว่า API ส่งสำเร็จและ Database เปลี่ยนเป็น `true`
   - จำลองฝั่งนักเรียน: เปิด `/labs/3d/room-101` -> ตรวจสอบว่าห้องแล็บปลดล็อกเข้าได้จริง
   - เมื่อล็อกห้องแล็บ: ตรวจสอบว่าแสดงข้อความใหม่ถูกต้องครบทั้ง 8 หน่วย
   - ทดสอบส่งแบบทดสอบอัตนัย: ตรวจสอบว่าส่งแล้วห้องแล็บ 3D ปลดล็อกให้อัตโนมัติ
4. **รัน Unit Test Suite**:
   - รัน `npm test` เพื่อยืนยันว่าไม่มี Test เดิมหรือ Test ใหม่ตัวใดล้มเหลว
