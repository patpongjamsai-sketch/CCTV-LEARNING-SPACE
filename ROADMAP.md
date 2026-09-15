# แผน Iteration ถัดไป

V0.2 เพิ่ม Room 102 แบบเล่นได้ครบแล้ว ขั้นถัดไปคือ Playtest กับผู้เรียนจริงก่อนเริ่ม Room 103

## ก่อนเริ่ม Room 103

1. ทดลองกับผู้เรียน 5–10 คน เก็บเวลาเดินหลง จุดที่กด E/F ไม่สำเร็จ และคำถามที่เข้าใจผิด
2. วัด FPS บนเครื่องห้องเรียนจริงอย่างน้อย 3 ระดับสเปก
3. ปรับ Room 101 จากข้อมูลจริง โดยคง Data Contract และ Save Version
4. ตัดสินใจวิธี Deploy เกม 3D และตั้ง Allowed Origins ให้ตรง Production

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
