# Playtest Checklist V0.2

ใช้รายการนี้กับเครื่อง Windows PC ของห้องเรียนก่อนนำไปใช้จริง

## เริ่มเกมและควบคุม

- [x] หน้าเริ่มเกมแสดงชื่อ Mission และ Controls
- [x] Chrome เปิดเกมและเข้า Pointer Lock ได้
- [x] Edge เปิดเกมและเข้า Pointer Lock ได้
- [x] WASD เคลื่อนผู้เล่น และ Mouse หมุนมุมมอง
- [x] ไม่มี Jump เมื่อกด Space
- [x] เปิด Overlay แล้วหยุดการเดินและปล่อย Pointer Lock
- [x] กด Resume แล้วเข้า Pointer Lock ใหม่

## สภาพแวดล้อมและ Interaction

- [x] มี Lobby, Corridor และ Room 101–105
- [x] Room 101 เข้าได้
- [x] Room 102 มี Collider ขณะยังไม่ผ่าน
- [x] Room 103 ปลดเมื่อผ่าน Room 102 ส่วน Room 104–105 ยังล็อก
- [x] Raycast ใช้ Crosshair และมีระยะไม่เกิน 3 เมตร
- [x] หันออกหรืออยู่ไกลแล้ว Prompt หาย
- [x] กด E เปิด Inspector/Terminal/ข้อความประตู
- [x] กด F หยิบ IP Camera และวางบน Inspection Bench
- [x] ผนัง โต๊ะ แท่นวาง และประตูมี Static Collider

## ภารกิจและการเรียนรู้

- [x] อุปกรณ์ Placeholder 18 รายการ
- [x] Objective บังคับ Inspect 10 รายการ
- [x] Knowledge Check 5 ข้อแทรกระหว่าง Inspect
- [x] มีโจทย์จำแนก, Connection, No Video และ Budget
- [x] แสดงคำว่า “ราคาเพื่อการฝึก”
- [x] แก้คำตอบและประเมินใหม่ได้
- [x] Hint/คำตอบผิด/Attempt/เวลาได้รับการบันทึก
- [x] คะแนนเต็มรวม 100 และผ่านที่ 70
- [x] ผ่านแล้ว Room 102 ปลด Collider และบันทึก Best Score
- [x] Room 102 มีสถานี Dome, Bullet และ PTZ แยกกัน
- [x] Coverage Preview บันทึก Objective `test` และปล่อย Pointer Lock
- [x] คะแนน Room 101 และ Room 102 ไม่ปะปนกัน
- [x] Room 102 เต็ม 100 คะแนนและผ่านที่ 70
- [x] ผ่าน Room 102 แล้ว Room 103 ปลด Collider

## Save และการเชื่อมเว็บเดิม

- [x] Refresh แล้ว Best Score และ Room 102 ยังอยู่
- [x] Refresh แล้ว Best Score ของ Room 102 และ Room 103 ที่ปลดล็อกยังอยู่
- [x] Save ที่เสียหายกลับค่าเริ่มต้น
- [x] Save ไม่มี Three.js Object หรือ Rapier Handle
- [x] ส่ง `cctv-training/mission-completed` เมื่อผ่าน
- [x] เว็บเดิมตรวจ Origin/Type/Version/Mission ID
- [x] เว็บเดิมแสดง Practice Complete และเก็บเฉพาะสถานะฝึก
- [x] ผลเกมไม่เปลี่ยนเงื่อนไข Post-test/Evidence อย่างเป็นทางการ

## ภาพและเสถียรภาพ

- [x] Resize 1280×720 แล้ว Crosshair อยู่กึ่งกลาง (640, 360)
- [x] HUD ไม่บังแนวเล็งหลัก
- [x] ไม่มี Critical Console Error หรือ Unhandled Promise ใน Chrome/Edge
- [x] บันทึก Screenshot Lobby, Room 101, Inspector, Inventory และ Mission Complete
- [ ] วัด 60/30 FPS บนเครื่องผู้เรียนจริงหลายระดับสเปกก่อนใช้ทั้งห้อง
- [ ] ทดสอบ Fullscreen ด้วยจอและนโยบาย Browser ของห้องเรียนจริง
