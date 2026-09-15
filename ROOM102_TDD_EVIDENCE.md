# Room 102 — TDD Evidence

`TDD_REQUIRED: yes`  
Observable seam: Mission data, mission gate, score isolation, objective action, door collider และ mission timer

## RED → GREEN records

| พฤติกรรม | RED ที่สังเกตจริง | GREEN หลังแก้ |
|---|---|---|
| ต้องมี Mission F1-M102 | `expected undefined to match object` | `data.test.ts` ผ่าน |
| ห้ามเริ่ม Room 102 ก่อนปลดล็อก | `expected undefined to be false` | `mission.test.ts` ผ่าน |
| เริ่ม Room 102 หลังปลดล็อก | `expected undefined to be true` | `mission.test.ts` ผ่าน |
| คำถาม Room 102 รวม 95 คะแนน | `expected [] to have a length of 7` | `data.test.ts` ผ่าน |
| คะแนน Room 102 เต็ม 100 และปลด Room 103 | `expected 70 to be 100` | `mission.test.ts` ผ่าน |
| Coverage Preview บันทึก Objective ที่ถูกต้อง | `expected undefined to be true` | `mission.test.ts` ผ่าน |
| Layout มี 3 กล้องและ 1 Preview | `expected undefined to deeply equal ...` | `data.test.ts` ผ่าน |
| ปลด Collider ของห้องที่ระบุ | `expected undefined to be true` | `physics.test.ts` ผ่าน |
| คะแนนสอง Mission ไม่ปะปน | `expected 75 to be 25` | `mission.test.ts` ผ่าน |
| Inspect ซ้ำไม่รีเซ็ตเวลา | `expected 40000 to be 20000` | `mission.test.ts` ผ่าน |

Focused commands ที่ใช้:

```powershell
npm test -- src/tests/data.test.ts
npm test -- src/tests/mission.test.ts
npm test -- src/tests/physics.test.ts
npm test -- src/tests/data.test.ts src/tests/mission.test.ts src/tests/physics.test.ts
```

Refactor check: รวมการคำนวณคะแนนผ่าน `calculateMissionScore`, ตรวจ Objective ผ่าน `hasCompletedMissionCoreObjectives` และจัดการประตูด้วย `unlockRoom(room)` โดย focused tests ยังเขียว
