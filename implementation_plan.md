# แผนงานปรับปรุงระบบ (Implementation Plan)
## การแก้ไขจุดบกพร่อง 7 จุดในมุมมองนักเรียนและครูผู้สอน

### 1. เป้าหมาย
แก้ไขปัญหาทั้ง 7 ประเด็นอย่างเป็นรูปธรรม เพื่อให้ทั้งนักเรียนและครูสามารถใช้งานระบบได้อย่างราบรื่น ปลอดภัย และสอดคล้องกับพฤติกรรมการใช้งานจริงทั้งบนคอมพิวเตอร์และสมาร์ตโฟน

---

### 2. รายละเอียดการดำเนินงานแยกตาม 7 ประเด็น

#### ฝั่งผู้เรียน (Student Side)
1. **ประเด็น 1.1: รูปภาพหลักฐานหลุดหาย & ระบบบีบอัดรูปภาพอัตโนมัติ**
   - **ไฟล์:** `src/components/portal/FaultChallengeModal.tsx`
   - **การแก้ไข:**
     - เพิ่มฟังก์ชัน `compressImage(file, maxWidth=1280, quality=0.72)` โดยใช้ HTML Canvas ย่อรูปก่อนอ่าน Base64
     - ผนวกรูปภาพและชื่อไฟล์หลักฐาน (`evidenceFilePreview`, `evidenceFileName`) เข้าใน Payload ของ API `/api/learning/subjective` แม้จะเป็นแบบมีข้อย่อย (`hasSubQuestions = true`)

2. **ประเด็น 1.2: ปรับเปลี่ยน Action การส่งงานเพื่อลดความสับสนบนมือถือ**
   - **ไฟล์:** `src/components/portal/FaultChallengeModal.tsx`
   - **การแก้ไข:**
     - ปรับปุ่มหลักเป็น **"🚀 ส่งแบบทดสอบให้อาจารย์ตรวจ (บันทึกเข้าระบบทันที)"**
     - แสดงแถบแจ้งเตือนเมื่อส่งสำเร็จ: *"✓ บันทึกผลงานขึ้นฐานข้อมูลเรียบร้อยแล้ว ครูผู้สอนได้รับข้อมูลและรูปภาพหลักฐานแล้ว สามารถเข้าห้องปฏิบัติการ 3D ได้ทันที"*
     - ปรับปุ่มดาวน์โหลด JSON เป็นปุ่มสำรองเล็กๆ: *"📁 บันทึกสำเนาลงเครื่อง (JSON Backup)"* โดยไม่บังคับดาวน์โหลด

3. **ประเด็น 1.3: กล่องแสดงผลคะแนนและ Feedback จากครูผู้สอน**
   - **ไฟล์:** `src/components/portal/FaultChallengeModal.tsx`, `AssessmentsHubClient.tsx`, `/api/learning/subjective/route.ts`
   - **การแก้ไข:**
     - ปรับ API `/api/learning/subjective` ให้รองรับ `GET` เพื่อดึงผลตรวจล่าสุดของนักเรียน
     - หากสถานะเป็น `revision_required` ให้แสดงการ์ดสีส้ม-แดงเตือนชัดเจน: *"⚠️ ครูผู้สอนส่งข้อคิดเห็นให้ปรับปรุง: [ข้อความจากครู] คะแนน: [X/20]"* พร้อมปุ่ม `[✏️ ปรับปรุงคำตอบและส่งตรวจใหม่]`
     - หากสถานะเป็น `graded`/`approved` แสดงการ์ดสีเขียวแจ้งคะแนนและข้อคิดเห็นของครู

4. **ประเด็น 1.4: ปุ่มควบคุมเสมือน (Virtual Joystick) สำหรับสมาร์ตโฟน/แท็บเล็ตในห้อง 3D**
   - **ไฟล์:** `src/components/3d/VirtualJoystick.tsx` (สร้างใหม่) และ `src/app/labs/3d/[roomId]/LabClientContainer.tsx`
   - **การแก้ไข:**
     - ตรวจจับว่าผู้ใช้อยู่บนอุปกรณ์ Touch / Mobile หรือไม่
     - แสดง Virtual Joystick แบบสัมผัสที่มุมซ้ายล่าง เพื่อจำลองคีย์บอร์ด `W, A, S, D` ให้เดินสำรวจในห้อง 3D ได้อย่างคล่องตัวบนมือถือ

---

#### ฝั่งครูผู้สอน (Teacher Side)
5. **ประเด็น 2.2: ปรับสเกลคะแนนให้ตรงตามเกณฑ์รูบริก (Rubric Alignment)**
   - **ไฟล์:** `src/components/portal/PendingReviewInbox.tsx`, `src/server/services/teacherReviewService.ts`
   - **การแก้ไข:**
     - เมื่อตรวจข้อสอบอัตนัย (Subjective Exam) ปรับคะแนนเต็มเป็น **20 คะแนน** (เกณฑ์ผ่าน 12 คะแนน หรือ 60%) และแสดง Rubric เกณฑ์การให้คะแนนอย่างชัดเจน
     - เมื่อตรวจปฏิบัติการแล็บ (Lab Submission) คะแนนเต็ม **100 คะแนน** (เกณฑ์ผ่าน 60 คะแนน)

6. **ประเด็น 2.3: ฟังก์ชันตรวจด่วนและอนุมัติยกห้อง (Batch Approve & Quick Pass)**
   - **ไฟล์:** `src/components/portal/PendingReviewInbox.tsx`, `src/app/api/classes/[classId]/reviews/batch/route.ts` (API ใหม่), `src/server/services/teacherReviewService.ts`
   - **การแก้ไข:**
     - เพิ่มปุ่ม `[⚡ อนุมัติผ่านทั้งหมดในคิวนี้ (Batch Approve All)]` พร้อมป๊อปอัปยืนยัน
     - เพิ่มปุ่มลัด `[⚡ ผ่านทันที (Quick Pass)]` ที่การ์ดแต่ละใบ เพื่อให้ครูกดให้ผ่านได้ในคลิกเดียวโดยไม่ต้องเปิดโมดอล
     - สร้าง Server API `/api/classes/[classId]/reviews/batch` บันทึกผลตรวจพร้อมกันใน Transaction

7. **ประเด็น 2.4: ซิงก์สิทธิ์เข้าห้อง 3D ฝั่ง Server Database ให้เชื่อมกับ `class_approvals` และ `subjective_submissions`**
   - **ไฟล์:** `src/app/labs/3d/[roomId]/page.tsx`, `src/server/services/progressionService.ts`
   - **การแก้ไข:**
     - ปรับ `LabPage` ให้ตรวจสอบสิทธิ์จากทั้ง 3 ช่องทาง:
       1. มีการส่งงานใน `public.subjective_submissions` ประจำหน่วยนั้นแล้ว
       2. ครูเปิดสิทธิ์ผ่าน `public.class_approvals` (`lab_unlocked = true` หรือ `unit_unlocked = true`)
       3. ผ่านเกณฑ์เดิมใน PostgreSQL (`progression.unlocked`)
     - รับประกันว่านักเรียนที่ส่งข้อสอบแล้ว หรือครูอนุมัติผ่านเว็บ จะเข้าห้อง 3D ได้ 100% ทันที

---

### 3. แผนการตรวจสอบและทดสอบ (Verification Plan)
1. รัน Unit & Integration Tests: `npm test` เพื่อให้มั่นใจว่าเทสต์เดิมทั้ง 257 ตัวยังผ่านครบ
2. ตรวจสอบ TypeScript Type Safety: `npx tsc --noEmit`
3. ทดสอบจำลองการส่งรูปภาพบนมือถือ (Base64 ขนาดเล็ก ไม่เกิน 250KB)
4. ทดสอบปุ่ม Quick Pass และ Batch Approve ใน PendingReviewInbox
