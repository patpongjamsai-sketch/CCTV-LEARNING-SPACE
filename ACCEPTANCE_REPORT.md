# Acceptance Report — V0.2

วันที่ทดสอบ: 10 กันยายน 2026  
สภาพแวดล้อม: Windows, Local Vite Server, Google Chrome และ Microsoft Edge, 1440×900 / 1280×720

## สรุปผล

- TypeScript/Lint: ผ่าน
- Unit Test: ผ่าน 20/20 จาก 5 Test Files
- Production Build: ผ่าน
- Chrome Smoke Test: ผ่าน, Canvas แสดงผล, Pointer Lock = `gameCanvas`, Console 0 Error/0 Warning
- Edge Smoke Test: ผ่าน, Canvas แสดงผล, Pointer Lock = `gameCanvas`, Console 0 Error/0 Warning
- Mission Complete Flow: ผ่าน 100/100, Room 102 อยู่ใน `unlockedRooms`
- Save/Reload: ผ่าน, Best Score 100 และ Room 102 คงอยู่
- UI/Pointer Lock: ก่อนเปิด UI = `gameCanvas`, ระหว่างเปิด UI = `null`
- Resize: Crosshair อยู่ (640, 360) ที่ Viewport 1280×720
- เชื่อมเว็บเดิม: ผ่าน, Unit 1 แสดง `Practice Complete · คะแนนสูงสุด 100/100`
- Room 102 Complete Flow: ผ่าน 100/100, Room 103 อยู่ใน `unlockedRooms`
- Mission Isolation: ผ่าน, คำตอบ Room 102 ไม่เพิ่มคะแนน Room 101

## ผล Acceptance สำคัญ

| รายการ | ผล | หลักฐาน |
|---|---|---|
| เปิด Lobby และ HUD | ผ่าน | `output/playwright/01-lobby.png` |
| Room 101 และอุปกรณ์ Placeholder | ผ่าน | `output/playwright/02-room-101.png` |
| Inspector และคำถามตามอุปกรณ์ | ผ่าน | `output/playwright/03-inspect-mode.png` |
| Inventory เก็บ IP Camera | ผ่าน | `output/playwright/04-inventory.png` |
| Mission 100/100 และ Room 102 ปลดล็อก | ผ่าน | `output/playwright/05-mission-complete.png` |
| ห้องฝึก Camera Selection Room 102 | ผ่าน | `output/playwright/06-room-102.png` |
| Coverage Preview และจุดบอด | ผ่าน | `output/playwright/07-coverage-preview.png` |
| Inspector ของ Dome Camera | ผ่าน | `output/playwright/08-room102-inspector.png` |
| Mission Panel ของ Room 102 | ผ่าน | `output/playwright/09-room102-mission.png` |
| Mission 102 เต็ม 100 และปลด Room 103 | ผ่าน | `output/playwright/10-room102-complete.png` |
| Refresh เก็บ Progress/Best Score/Unlock | ผ่าน | ตรวจ LocalStorage หลัง Reload |
| Pointer Lock ปล่อยเมื่อเปิด UI | ผ่าน | ตรวจ DOM: `gameCanvas` → `null` |
| Resize ไม่ทำให้ Crosshair เคลื่อน | ผ่าน | ตรวจ DOM ที่ 1280×720 |
| ไม่มี Critical Console Error | ผ่าน | Chrome และ Edge = 0 Error/0 Warning |

## ข้อจำกัดการรับรอง

การตรวจ Collision ใช้ Rapier KCC และ Static Collider ครบตาม Blockout พร้อม Unit/Browser smoke test แต่ยังควรให้ผู้เรียนหรือครู 2–3 คนเดินสำรวจด้วยเมาส์จริงเพื่อหาจุดติดมุมที่การทดสอบอัตโนมัติอาจไม่พบ

เป้าหมาย FPS ยังไม่ลงชื่อรับรองบนเครื่องผู้เรียนจริง เนื่องจากผลขึ้นกับ GPU/Driver/นโยบาย Browser ของห้องเรียน ควรวัดอย่างน้อยเครื่องสเปกต่ำ กลาง และเครื่องครูก่อนใช้พร้อมกันทั้งห้อง

## ภาพหลักฐาน

- [Lobby](./output/playwright/01-lobby.png)
- [Room 101](./output/playwright/02-room-101.png)
- [Inspect Mode](./output/playwright/03-inspect-mode.png)
- [Inventory](./output/playwright/04-inventory.png)
- [Mission Complete](./output/playwright/05-mission-complete.png)
- [Room 102](./output/playwright/06-room-102.png)
- [Coverage Preview](./output/playwright/07-coverage-preview.png)
- [Room 102 Inspector](./output/playwright/08-room102-inspector.png)
- [Room 102 Mission Panel](./output/playwright/09-room102-mission.png)
- [Room 102 Mission Complete](./output/playwright/10-room102-complete.png)
