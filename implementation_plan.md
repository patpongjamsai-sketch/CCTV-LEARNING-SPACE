# แผนการดำเนินงาน (Implementation Plan)
## การปรับปรุงแก้ไขจุดติดขัด 3 รายการตามที่ตรวจพบ

---

### 1. รายการที่ต้องดำเนินการแก้ไข
1. **ปลดล็อก Deadlock ข้อสอบอัตนัย (Fix Chicken-and-Egg Conflict)**:
   - ปรับฟังก์ชัน `isAssessmentUnlocked` ใน `src/lib/progressionState.ts`:
     - ไม่ล็อกแบบทดสอบอัตนัยด้วยเงื่อนไข `isLabPassed` อีกต่อไป
     - หากหน่วยการเรียนรู้นั้นเปิดอยู่ (`isUnitUnlocked`) ให้นักเรียนเข้าทำแบบทดสอบอัตนัย (Diagnostic) ได้ทันที เพื่อใช้เป็นเงื่อนไขปลดล็อกห้อง 3D
2. **เชื่อม Inbox ตรวจข้อสอบครูเข้ากับตาราง `public.subjective_submissions`**:
   - ใน `src/server/services/teacherReviewService.ts`:
     - ปรับฟังก์ชัน `getPendingReviewsService` ให้ดึงคำตอบจากตาราง `public.subjective_submissions` เพิ่มเติมจาก `lab_submissions` และ `quiz_attempts`
     - ปรับฟังก์ชัน `reviewQuizAttemptService` ให้รองรับการตรวจให้คะแนนและคอมเมนต์ข้อสอบอัตนัยในตาราง `public.subjective_submissions`
3. **เพิ่มปุ่มลัด (Shortcut CTA) ไปทำแบบทดสอบอัตนัยทันทีเมื่อเจอห้องล็อก**:
   - ใน `src/app/labs/3d/[roomId]/page.tsx`:
     - เพิ่มปุ่มสีทอง `📝 ทำแบบทดสอบอัตนัยเพื่อปลดล็อกห้อง 3D ทันที →` ลิงก์ตรงไปที่ `/assessments#${unitId}`
   - ใน `src/app/labs/page.tsx`:
     - สำหรับห้องที่ยังล็อกอยู่ เพิ่มปุ่ม `📝 ทำแบบทดสอบเพื่อปลดล็อก →` คู่กับป้ายแจ้งเตือน

---

### 2. แผนการทดสอบและตรวจสอบ (Verification Plan)
1. **ทดสอบแบบทดสอบอัตนัยไม่ติดล็อก**:
   - รัน Test และเปิดหน้า `/assessments#U01` ตรวจสอบว่าไม่มีแถบสีเหลืองเตือนว่าต้องผ่านห้องแล็บ 3D ก่อน
2. **ทดสอบ Inbox ตรวจข้อสอบครู**:
   - จำลองการดึงรายการรอตรวจใน `teacherReviewService` และทดสอบว่ามี `subjective` รวมอยู่ด้วย
   - ทดสอบการตรวจให้คะแนนและอัปเดตสถานะเป็น `graded`
3. **ทดสอบปุ่มลัดนำทาง (Navigation)**:
   - ตรวจสอบหน้า `/labs/3d/room-101` และหน้า `/labs` ว่ามีปุ่มคลิกไปทำข้อสอบอัตนัยได้ในคลิกเดียว
4. **รัน Test Suite & Typecheck**:
   - `npm test` ครบ 56 Test Files
   - `npx tsc --noEmit` ผ่าน 100%
