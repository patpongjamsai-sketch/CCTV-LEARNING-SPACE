# หลักฐานการดำเนินงาน: Next.js Shell

วันที่ตรวจสอบ: 15 กันยายน 2569

## ขอบเขตที่ดำเนินการ

- เปลี่ยนคำสั่งหลักของโครงการให้เปิดด้วย Next.js App Router
- สร้าง Dashboard Shell สำหรับศูนย์การเรียนรู้วิชากล้องวงจรปิดบนระบบเครือข่าย
- สร้างหน้ารายวิชา `21909-2020` พร้อมโครงสร้าง 8 หน่วยการเรียนรู้
- สร้างเส้นทางห้องปฏิบัติการ 3D แบบ Dynamic Route ที่ `/labs/3d/[roomId]`
- กำหนด `room-101` เป็นห้องตัวอย่าง และแสดงหน้า 404 สำหรับห้องที่ยังไม่เปิด
- เก็บระบบเกม Vite เดิมไว้ผ่านคำสั่ง `dev:legacy` และ `build:legacy` เพื่อไม่ให้ของเดิมสูญหาย

## หลักฐาน TDD (RED → GREEN → REFACTOR)

### RED

คำสั่ง: `npx vitest run src/tests/nextShell.test.tsx`

ผลที่สังเกต: ทดสอบไม่ผ่าน 1 รายการ เพราะยังไม่มี `DashboardShell.tsx` ตาม observable seam ที่กำหนด

### GREEN

คำสั่ง: `npx vitest run src/tests/nextShell.test.tsx`

ผลที่สังเกต: ผ่าน 1/1 รายการ หลังสร้าง Dashboard Shell ซึ่งแสดงชื่อรายวิชา เส้นทางการเรียนรู้ ข้อความห้องปฏิบัติการ 3D และลิงก์ `/labs/3d/room-101`

### REFACTOR

- แยก Dashboard เป็น `src/components/portal/DashboardShell.tsx`
- แยกสไตล์ส่วน Portal เป็น `src/app/portal.css`
- ใช้ Next.js file-system routing แยกหน้า Dashboard รายวิชา ห้อง 3D และ 404

## ผลการตรวจสอบอัตโนมัติ

| รายการ | คำสั่ง | ผล |
|---|---|---|
| ชุดทดสอบทั้งหมด | `npm test` | ผ่าน 12 ไฟล์ 48 การทดสอบ |
| ตรวจ TypeScript | `npm run lint` | ผ่าน |
| Build เกมเดิม | `npm run build:legacy` | ผ่าน |
| Build Next.js | `npm run build` | ผ่าน |

เส้นทางที่ Next.js สร้างสำเร็จ:

- `/`
- `/_not-found`
- `/courses/21909-2020`
- `/labs/3d/[roomId]`

## หลักฐานการตรวจในเบราว์เซอร์

ตรวจด้วย Chromium ที่ความกว้าง 1440 พิกเซล:

| URL | HTTP | ข้อความสำคัญ | ผล |
|---|---:|---|---|
| `/` | 200 | กล้องวงจรปิดบนระบบเครือข่าย | ผ่าน |
| `/courses/21909-2020` | 200 | เส้นทางการเรียนรู้ | ผ่าน |
| `/labs/3d/room-101` | 200 | ห้องปฏิบัติการ 3D | ผ่าน |
| `/labs/3d/unknown-room` | 404 | ไม่พบห้องปฏิบัติการ | ผ่าน |

ไฟล์ภาพหลักฐาน:

- `output/playwright/11-next-dashboard.png`
- `output/playwright/12-next-course.png`
- `output/playwright/13-next-lab-shell.png`
- `output/playwright/14-next-custom-404.png`

## ขอบเขตที่ยังไม่รวมในขั้นนี้

- ยังไม่เชื่อม Supabase Authentication และฐานข้อมูลจริง
- ห้อง 3D เป็น Integration Boundary สำหรับเตรียมฝังเกมเดิม ยังไม่ได้ย้าย React Three Fiber Canvas เข้ามาใน Next.js Route
- คะแนนและการปลดล็อกบทเรียนยังไม่ส่งให้ Backend เป็นผู้ตัดสิน
- Build เกมเดิมมีคำเตือนว่า JavaScript chunk ใหญ่กว่า 500 kB แต่ Build สำเร็จ

## สรุปสถานะ

Next.js Shell พร้อมเป็นฐานสำหรับขั้นต่อไป คือ Supabase Auth, Server-authoritative Progress และการนำเกม 3D เดิมเข้ามาเชื่อมใน `/labs/3d/room-101` โดยไม่ทำลาย Baseline เดิม
