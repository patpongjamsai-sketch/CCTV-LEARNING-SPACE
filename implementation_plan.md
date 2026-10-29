# แผนการแก้ไขปัญหา: ปลดล็อกห้องปฏิบัติการ U02 (Room 102) ไม่ผ่าน แม้ทำแบบทดสอบอัตนัยหรือครูกดปลดล็อกแล้ว

## 1. การวิเคราะห์สาเหตุของปัญหา (Root Cause Analysis)

จากข้อความของผู้ใช้:
> *ต้องทำแบบทดสอบอัตนัย หรือรอครูอนุมัติ ของ U02 ครบแล้ว ครูก็สั่งปลดล็อคแล้ว แต่ยังไม่สามารถเข้าได้*

เมื่อตรวจสอบพบสาเหตุที่ทำให้ห้องปฏิบัติการ U02 (Room 102) และหน้ารวมแล็บ `/labs` ยังคงแสดงข้อความ:
`🔒 ต้องทำแบบทดสอบอัตนัย หรือรอครูอนุมัติ` และหน้าต่าง 3D Lab แสดง `🔒 ห้องปฏิบัติการ 3D ยังไม่เปิดให้เข้าใช้งาน` มีสาเหตุหลักดังนี้:

### สาเหตุที่ 1: ลำดับการตรวจสอบสิทธิ์ (Precedence Check Order) ใน `progressionState.ts` บล็อกการปลดล็อก
* ในฟังก์ชัน `isLabUnlocked(unitId)` ใน `src/lib/progressionState.ts`:
  ```ts
  // โค้ดเดิม: ตรวจสอบว่า Unit ปลดล็อกตามลำดับ 1->2 หรือไม่ ก่อนที่จะตรวจสิทธิ์จากครูหรือแบบทดสอบอัตนัย
  if (!isUnitUnlocked(unitId, role)) {
      return { unlocked: false, reason: 'หน่วยการเรียนรู้นี้ยังไม่เปิด...' };
  }
  // สิทธิ์จากครู (unlockedLabs) และแบบทดสอบอัตนัย (isSubjectiveCompleted) อยู่ด้านล่างบรรทัดนี้!
  if (approvals.unlockedLabs[unitId]) return { unlocked: true };
  if (isSubjectiveCompleted(unitId)) return { unlocked: true };
  ```
* เมื่อตรวจสอบ `isUnitUnlocked('U02')`: ระบบจะเช็กว่าหน่วยก่อนหน้า (U01) ผ่านสมบูรณ์ทุกขั้นตอนในเครื่องหรือไม่ หาก U01 ยังไม่ถูกบันทึกว่า Passed ใน LocalStorage ฟังก์ชัน `isUnitUnlocked('U02')` จะส่งกลับ `false` ทันที
* ส่งผลให้เงื่อนไข `!isUnitUnlocked` ตัดการทำงานทันที และ **ไม่เคยลงไปอ่านค่าที่ครูกดปลดล็อก (`approvals.unlockedLabs`) หรือผลสอบอัตนัย (`isSubjectiveCompleted`) เลย**

### สาเหตุที่ 2: สิทธิ์การปลดล็อกของครูและนักเรียนไม่ถูกซิงค์ข้ามเบราว์เซอร์ (Client LocalStorage Isolation)
* เมื่อครูกดปลดล็อกในหน้า `/teacher` สิทธิ์จะถูกบันทึกลงฐานข้อมูล Supabase (`public.class_approvals`) และ LocalStorage ของเครื่องครู
* แต่เบราว์เซอร์ของนักเรียน (หรือผู้ใช้ทั่วไปที่เปิดหน้า `/labs` หรือ `/labs/3d/room-102`) อ่านสิทธิ์จาก `localStorage` ในเครื่องตนเองเท่านั้น และ **ไม่เคยมีฟังก์ชันดึงค่าสิทธิ์ล่าสุดจาก `/api/teacher/approvals`** มารวมในเครื่องนักเรียน
* ทำให้นักเรียนเห็นว่ายังคงล็อกอยู่เสมอ

### สาเหตุที่ 3: `LabClientContainer` ล็อกซ้ำซ้อน ทั้งที่ฝั่ง Server อนุญาตแล้ว
* ใน Server Component (`src/app/labs/3d/[roomId]/page.tsx`) มีการเช็กสิทธิ์ผ่านฐานข้อมูลเรียบร้อยแล้ว
* แต่เมื่อส่งต่อไปยัง Client Component (`LabClientContainer.tsx`): ตัว Container กลับนำค่า `isLabUnlocked` มาเช็กซ้ำอีกรอบใน Client LocalStorage และแสดงหน้าจอทับ (Overlay Gate) บล็อกผู้เรียนไว้

---

## 2. แนวทางการแก้ไข (Proposed Fixes)

### ส่วนที่ 1: ปรับปรุง `src/lib/progressionState.ts`
1. **สลับลำดับการตรวจสอบ (Priority Order):**
   - ให้สิทธิ์ที่ครูสั่งปลดล็อก (`unlockedLabs[unitId]` หรือ `unlockedUnits[unitId]`) มีผลสูงสุดทันที
   - ให้ผลการส่งแบบทดสอบอัตนัย (`isSubjectiveCompleted[unitId]`) ปลดล็อกห้องแล็บทันทีโดยไม่ต้องรอเกณฑ์อื่น
   - ปรับให้ `isUnitUnlocked` คืนค่า `true` หากครูกดปลดล็อกแล็บหรือส่งแบบทดสอบอัตนัยแล้ว
2. **เพิ่มฟังก์ชันซิงค์สิทธิ์อัตโนมัติจากเซิร์ฟเวอร์:**
   - เพิ่มฟังก์ชัน `syncTeacherApprovalsFromApi(classId)` และ `syncSubjectiveSubmissionsFromApi(unitId)` เพื่อดึงสิทธิ์ที่ครูปลดล็อกไว้จาก Supabase มาอัปเดตลงเครื่องนักเรียนอัตโนมัติ

### ส่วนที่ 2: ปรับปรุง `src/app/labs/page.tsx`
* เพิ่มการเรียก `syncTeacherApprovalsFromApi()` ใน `useEffect` เพื่อให้หน้ารวมแล็บ 8 หน่วย อัปเดตสถานะปุ่มปลดล็อกให้ตรงกับฐานข้อมูลจริงของครูผู้สอนทันที

### ส่วนที่ 3: ปรับปรุง `src/app/labs/3d/[roomId]/page.tsx` & `LabClientContainer.tsx`
* ใน `page.tsx`: ปรับการตรวจสอบสิทธิ์ให้ครอบคลุมทั้งสิทธิ์ระดับ Class และระดับ System-wide พร้อมส่ง prop `isServerUnlocked={isGateUnlocked}` ไปยัง Container
* ใน `LabClientContainer.tsx`: หาก `isServerUnlocked === true` ให้ถือว่าปลดล็อกสมบูรณ์และเปิดให้เข้าใช้งาน 3D Lab ทันที ไม่ถูกล็อกซ้ำซ้อน

---

## 3. แผนการทดสอบและยืนยันผล (Verification Plan)
1. เขียน Unit Test ตรวจสอบว่า `isLabUnlocked('U02')` ส่งกลับ `unlocked: true` เมื่อ:
   - ครูกดปลดล็อกแล็บ U02
   - ครูกดปลดล็อกหน่วย U02
   - นักเรียนส่งแบบทดสอบอัตนัย U02
2. รัน `npm test` เพื่อให้แน่ใจว่าชุดทดสอบทั้งหมดผ่านครบถ้วน
