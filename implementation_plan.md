# แผนการพัฒนามุมกล้องติดตามตัวละครช่าง Roblox (Roblox Third-Person Follow Camera)
## ห้องปฏิบัติการ Dome Camera 3D Interactive Lab (Room 1 & Room 2)

---

## 1. วัตถุประสงค์ (Objectives)

ตามที่ผู้ใช้ต้องการให้ **มุมกล้องปรับตามตัวของ Roblox** (Third-Person Follow Camera) เพื่อให้ขณะที่ผู้เรียนบังคับตัวละครช่างด้วยปุ่ม `W`, `A`, `S`, `D` หรือปุ่มลูกศร:
1. **มุมกล้องจะเคลื่อนที่ติดตามตัวละคร Roblox โดยอัตโนมัติ (Camera Chase / Follow):** ตัวละครจะอยู่กึ่งกลางสายตาเสมอเมื่อเดินสำรวจห้อง ไม่หลุดออกจากกรอบจอภาพ
2. **ยังคงความสามารถในการหมุนมุมมองรอบตัว (Orbit / Free Look):** ผู้เรียนสามารถคลิกเมาส์ลากหมุนมุมกล้องรอบตัวละครช่าง 360° และแหงนมองเพดาน/ผนังได้อิสระ
3. **การซูมเข้า-ออก (Zoom In / Out):** รองรับ Scroll Wheel และปุ่มซูมบนหน้าจอ
4. **ความเข้ากันได้กับโหมดอื่น (Seamless Compatibility):**
   - เมื่อเข้าโหมดส่องเลนส์ CCTV (`cameraViewMode === 'pov'`) กล้องจะสลับไปที่เลนส์กล้องวงจรปิดตามปกติ
   - เมื่อกดปุ่มมุมมองผู้กำกับ (เช่น `โต๊ะเบิกอุปกรณ์` หรือ `ภาพรวมห้อง`) มุมกล้องจะสลับไปยังตำแหน่งที่เลือก และเมื่อเริ่มเดิน ตัวกล้องจะกลับมาติดตามตัวละครทันที
   - เพิ่มปุ่มลัด `🚶 ติดตามตัวละครช่าง (Follow Player)` ในแถบมุมมองด่วน

---

## 2. รายละเอียดสถาปัตยกรรมและการปรับปรุง (Implementation Details)

### 2.1 ปรับปรุงตัวควบคุมกล้องใน Canvas ([src/features/dome-lab/three/TrainingCanvas.tsx](file:///e:/%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%9B%E0%B8%B5%202026/%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B8%AD%E0%B8%99%20%E0%B8%AB%E0%B8%99%E0%B9%88%E0%B8%A7%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B8%AD%E0%B8%99%20%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B8%AA%E0%B8%AD%E0%B8%99%20%E0%B8%84%E0%B8%B0%E0%B9%81%E0%B8%99%E0%B8%99/%E0%B8%A0%E0%B8%B2%E0%B8%84%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%992-69/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B8%87%E0%B8%88%E0%B8%A3%E0%B8%9B%E0%B8%B4%E0%B8%94/cctv-technician-3d-training-center/src/features/dome-lab/three/TrainingCanvas.tsx))
- เชื่อมต่อ `playerPosition` จาก `useDomeLabStore`
- ภายในฟังก์ชัน `useFrame` ของ `MissionCameraController`:
  - ตรวจจับการเคลื่อนที่ของตัวละคร `(deltaX, deltaZ)`
  - เมื่อตัวละครกำลังเดิน:
    - ปรับจุดโฟกัส `controlsRef.current.target` ให้เลื่อนตามพิกัดตัวละคร `[playerPosition[0], playerPosition[1] + 1.2, playerPosition[2]]` ด้วยความนุ่มนวล (Lerp Slerp Damping)
    - ปรับตำแหน่งกล้อง `camera.position` ให้เลื่อนตามด้วยระยะ Offset เดิม เพื่อรักษามุมมองและระยะห่างที่ผู้ใช้หมุนไว้
  - ป้องกันการชนผนังห้อง (Camera Collision Clamping) ไม่ให้กล้องทะลุออกนอกขอบเขตห้อง $22\text{m} \times 22\text{m}$ (จำกัด $X, Z$ ในช่วง $[-10.5, 10.5]$ และ $Y$ ในช่วง $[0.6, 4.8]$)

### 2.2 อัปเดตแถบ Director View Controls
- เพิ่มปุ่ม `🚶 ติดตามช่าง (Roblox Avatar)` ใน Director Bar
- เมื่อผู้เล่นกดปุ่มนี้ กล้องจะรีเซ็ตกลับมาอยู่ด้านหลังตัวละครช่างในระยะที่เหมาะสมทันที

---

## 3. แผนการตรวจสอบและทดสอบ (Verification & Testing)

1. **TypeScript Typecheck:** ตรวจสอบความถูกต้องด้วย `npx tsc --noEmit`
2. **Automated Tests:** รัน `npm test -- --run` ให้ผ่านครบทุกชุดทดสอบ
3. **Visual & Interaction Verification ในเบราว์เซอร์:**
   - ทดสอบกดปุ่ม `W, A, S, D` เพื่อเดินตัวละคร แล้วสังเกตว่ามุมกล้องเลื่อนติดตามตัวละครอย่างนุ่มนวล ไม่กระตุก
   - ทดสอบคลิกเมาส์หมุนมุมมองรอบตัวละครขณะเดินและขณะหยุดนิ่ง
   - ทดสอบคลิกสลับโหมด POV ของกล้องวงจรปิด และปุ่มสลับมุมมองด่วน
   - บันทึกภาพ Screenshot ตรวจสอบความสวยงาม

---

## 4. สถานะการดำเนินงาน (Execution Status) - เสร็จสมบูรณ์ (Completed)

- [x] เชื่อมต่อระบบ `playerPosition` เข้ากับ `MissionCameraController` ใน `TrainingCanvas.tsx`
- [x] พัฒนากลไกการเคลื่อนที่ของกล้องติดตามตัวละคร (Follow Chase) ร่วมกับ OrbitControls พร้อม Smooth Damping
- [x] เพิ่มระบบ Camera Boundary Clamping ไม่ให้กล้องทะลุออกนอกผนังห้อง $22\text{m} \times 22\text{m}$
- [x] เพิ่มปุ่ม `ติดตามช่าง` ในแถบควบคุมมุมมองด่วน (Director Toolbar) และตั้งเป็นมุมมองเริ่มต้น
- [x] ตรวจสอบ TypeScript ด้วย `npx tsc --noEmit` (ผ่าน 100%)
- [x] รันชุดทดสอบด้วย `npm test -- --run` (ผ่านครบ 50 test files / 228 tests)
- [x] ทดสอบการเดินและมุมกล้องติดตามจริงในเบราว์เซอร์ผ่าน Playwright Headless Subagent เรียบร้อย

