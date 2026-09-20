# แผน Iteration ถัดไป

V0.2 เพิ่ม Room 102 แบบเล่นได้ครบแล้ว ขั้นถัดไปคือพัฒนา Room 103 และห้องที่เหลือตามลำดับ โดยยังไม่ใช้ Classroom Playtest, Browser Playtest แบบครบชุด, การวัด FPS หลายเครื่อง หรือการสร้าง Screenshot เป็น Gate ก่อนเริ่มห้องถัดไป

## แนวทางระหว่างสร้างห้องปฏิบัติการ

1. ใช้เฉพาะ Unit Test, Type Check และ Build ที่เกี่ยวข้องกับห้องที่กำลังพัฒนา
2. ตรวจ Smoke Flow เฉพาะจุดสำคัญที่มีผลต่อคะแนน การบันทึกข้อมูล และการปลดล็อก
3. ไม่สร้างชุด Screenshot หรือรายงาน Playtest ใหม่สำหรับทุกห้อง
4. เดินหน้าพัฒนา Room 103 เป็นต้นไปโดยคง Data Contract, Save Version และ Backend เป็นแหล่งข้อมูลหลัก

## หลังสร้างห้องปฏิบัติการครบ

1. ทดสอบกับผู้เรียน 5–10 คน เก็บเวลาเดินหลง จุดที่กด E/F ไม่สำเร็จ และคำถามที่เข้าใจผิด
2. ทำ Browser Playtest และ UAT แบบ End-to-End ตั้งแต่บทเรียนจนถึงห้องสุดท้าย
3. วัด FPS บนเครื่องห้องเรียนจริงอย่างน้อย 3 ระดับสเปก
4. สร้าง Screenshot หลักฐานเฉพาะชุดตรวจรับสุดท้าย
5. ปรับทุกห้องจากผลทดสอบรวม โดยคง Data Contract และ Save Version
6. ตัดสินใจวิธี Deploy เกม 3D และตั้ง Allowed Origins ให้ตรง Production

## Room 102 — Camera Selection & Placement (เสร็จใน V0.2)

- เปรียบเทียบ Dome, Bullet และ PTZ
- เลือกตำแหน่งตาม Coverage, แสง, ความสูง และสภาพแวดล้อม
- Preview Coverage แบบจำลอง พร้อมจุดบอด (Render Target จริงเป็นงานต่อยอด)
- Objective `select`, `place`, `test`

## Room 103 — Cable & Connector Lab

- CAT6/RJ45 และ Coaxial/BNC
- ลำดับสายและการทดสอบ Continuity แบบจำลอง
- Objective `connect`, `test`, `troubleshoot`

## Room 104 — Network & Recorder

- PoE Budget, IP Address, Switch, Router, NVR/DVR
- Network Diagram แบบ Interactive
- Objective `connect`, `configure`, `test`

## Room 105 — Fault Detective

- Fault Tree: Power → Physical Link → Network → Recorder → Display
- เก็บลำดับการตรวจและการเปลี่ยนตัวแปร
- Objective `troubleshoot` พร้อม Rubric ด้านเหตุผล

## งานคุณภาพร่วม

- แทน Placeholder ด้วย GLB ที่ Optimize แล้ว พร้อม Collision Proxy และ LOD
- แยก Rapier/Asset เป็น Lazy-loaded chunks ลด Initial Bundle
- เพิ่มโหมดครูสำหรับ Reset Station และส่งออกหลักฐานฝึกแบบไม่ระบุตัวตน
- เพิ่ม Accessibility สำหรับ Keyboard-only UI และ Reduced Motion
- ทดสอบ Save Migration ก่อนเพิ่ม `saveVersion: 2`
