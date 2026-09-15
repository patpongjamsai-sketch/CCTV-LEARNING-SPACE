# Phase 1 Shared Domain Evidence

## Outcome

แยกกฎหลักของเกมออกจาก React, Zustand, Three.js และ Browser API เพื่อเตรียมให้ Next.js Server ใช้กฎชุดเดียวกับเกมสำหรับตรวจคะแนนซ้ำในขั้นถัดไป

## Shared Domain

- `src/shared/domain/roleplayTypes.ts`
- `src/shared/domain/missionRules.ts`
- `src/shared/domain/connectionRules.ts`
- `src/shared/domain/virtualEquipmentCatalog.ts`
- `src/shared/domain/playerMovement.ts`
- `src/shared/domain/cameraControls.ts`
- `src/shared/domain/index.ts`

ไฟล์ Store, Component, Data และ Test ถูกปรับ Import ให้ชี้มายัง Shared Domain ใหม่ โดยไม่มีการเปลี่ยนกฎคะแนนหรือ Gameplay

## TDD Evidence

- TDD_REQUIRED: yes
- Observable seam: `src/shared/domain/index.ts` ต้อง Import และคำนวณ Topology/Rubric จาก Serializable Input ได้
- RED: `npx vitest run src/tests/sharedDomain.test.ts` ล้มเหลว 1 Test เพราะ Shared Domain Boundary ยังไม่มี
- GREEN: คำสั่งเดียวกันผ่าน 1 Test หลังสร้าง Boundary และย้าย Domain
- REFACTOR: ย้าย Equipment Catalog เข้า Shared Domain และเปลี่ยน Type Imports เป็น `import type`

## Verification

- Focused Domain Tests: 3 Test Files, 15 Tests ผ่าน
- Full Test Suite: 11 Test Files, 47 Tests ผ่าน
- TypeScript: `tsc --noEmit` ผ่าน
- Production Build: Vite Build ผ่าน 593 Modules
- Shared Domain Browser Dependency Scan: ไม่พบ React, Zustand, Three.js, `window`, `document`, `localStorage` หรือ `sessionStorage`

## Known Limitation

Production Bundle ยังมีคำเตือน Chunk ใหญ่กว่า 500 kB โดย JavaScript มีขนาดประมาณ 1,214.34 kB ก่อนบีบอัดและ 326.39 kB แบบ gzip งาน Dynamic Import และ Code Splitting อยู่ในขั้น Next.js Integration ไม่ใช่ขอบเขต Phase 1 นี้

โฟลเดอร์งานไม่ได้เป็น Git Repository จึงยังไม่มี Branch, Commit หรือ Tag สำหรับ Baseline
