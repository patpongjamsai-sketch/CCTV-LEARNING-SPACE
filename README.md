 # CCTV Technician 3D Training Center — Unit 1: IP CCTV Fundamentals (Block-Style Role-Play)

> **รายวิชา:** กล้องวงจรปิดบนระบบเครือข่าย (**21909-2020**)  
> **ระดับชั้น:** ประกาศนียบัตรวิชาชีพ (ปวช.) หลักสูตร พ.ศ. 2567  
> **หน่วยการเรียนรู้ที่ 1:** IP CCTV Fundamentals (พื้นฐานระบบกล้องวงจรปิดบนเครือข่าย)  
> **รูปแบบ:** 3D Block-Style Role-Play ภายในร้านสะดวกซื้อ Smart Mart

---

## ตั้งค่า Login และ Google OAuth

หน้า `/login` รองรับอีเมล/รหัสผ่าน การสมัครสมาชิก และ Google OAuth ผ่าน Supabase Auth

1. ใน Supabase ไปที่ **Authentication > Providers > Google** แล้วเปิดใช้งาน Google provider
2. นำ Client ID และ Client Secret จาก Google Cloud มาใส่ใน Supabase (ห้ามใส่ Secret ในโค้ดหรือค่าที่ขึ้นต้นด้วย `NEXT_PUBLIC_`)
3. ใน Google Cloud ตั้ง Authorized redirect URI เป็น URL callback ที่ Supabase แสดง เช่น `https://<project-ref>.supabase.co/auth/v1/callback`
4. ใน Supabase ไปที่ **Authentication > URL Configuration** แล้วเพิ่ม Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<โดเมน-vercel>/auth/callback`
5. ตั้ง `NEXT_PUBLIC_SITE_URL` เป็น `http://localhost:3000` สำหรับเครื่องพัฒนา และเป็น URL จริงของ Vercel สำหรับ Production
6. เพิ่มตัวแปรทั้งหมดจาก `.env.example` ใน Vercel Project Settings โดยเก็บ `SUPABASE_SECRET_KEY` และ `SUPABASE_DB_URL` เป็น server-only เสมอ

เมื่อยืนยันตัวตนสำเร็จ ผู้ใช้จะกลับผ่าน `/auth/callback` และเข้าสู่ Dashboard ของระบบ

---

## 1. จุดเด่นของระบบการเรียนรู้

- **Block-Style Role-Play**: ผู้เรียนรับบทเป็น "ช่างฝึกหัด CCTV" เดินสำรวจร้าน Smart Mart พบ NPC และสถานีความรู้ Zone A ถึง F
- **Semantic Answer Verification**: ตรวจความถูกต้องจากชนิดข้อมูลและความหมายของแนวคิด ไม่ตรวจเพียงตำแหน่งทางกายภาพ
- **Virtual CCTV Lab**: อุปกรณ์เสมือนจริงที่มีพอร์ตจริง (RJ45 PoE 1–8, Uplink Non-PoE, HDMI OUT/IN), ไฟ LED สถานะ, คำนวณ PoE Budget 65W, และแสดงภาพสด (Live View) เมื่อเชื่อมต่อ topology ครบวงจร
- **100-Point Rubric & Verifiable Certificate**: คำนวณคะแนนตามรูบริก 6 ด้าน (เกณฑ์ผ่าน >= 80 คะแนน พร้อมข้อกำหนดบังคับ: กล้อง Online, NVR ติดต่อได้, มีภาพ Live View) พร้อมออกใบประกาศนียบัตรที่มี Verification Code

---

## 2. ปุ่มควบคุม (Controls)

| ปุ่ม | การทำงาน |
|---|---|
| **W, A, S, D** หรือ ลูกศร | เดินสำรวจภายในร้านสะดวกซื้อ |
| **Shift** | วิ่งเร็ว (Sprint) |
| **Mouse Drag** | หมุนมุมกล้องอิสระรอบตัวละคร (Third-Person Chase Camera) |
| **E** | พูดคุยกับ NPC / ตรวจสอบอุปกรณ์ / เก็บการ์ดความรู้ |
| **F** | วางการ์ดลงช่องคำตอบ หรือ ติดตั้งอุปกรณ์ลงแท่น |
| **1 – 5** | สลับช่องกระเป๋าช่าง (Inventory Hotbar 5 ช่อง) |
| **Tab** | เปิด/ปิด สมุดบันทึกปฏิบัติการ (Checklist, แผนผังร้าน, โต๊ะปฏิบัติการ, Diagnostic, ใบรับรอง) |
| **H** | ขอคำใบ้แบบไล่ระดับ (Level 1 แนวคิด → Level 2 ชี้สถานี → Level 3 ชี้คำตอบ) |
| **Esc** | เปิดเมนูตั้งค่า (Settings: ปรับคุณภาพกราฟิก, ลดการเคลื่อนไหว, รีเซ็ตอุปกรณ์) |

---

## 3. สถาปัตยกรรมระบบ (Architecture)

```text
src/
  data/
    unit1RoleplayContent.ts        # ข้อมูลบทเรียนภาษาไทย บทสนทนา NPC และการ์ดความรู้
    virtualEquipmentCatalog.ts     # แคตตาล็อกอุปกรณ์ กำลังไฟ พอร์ต และสเปก
  domain/
    roleplayTypes.ts               # Data Types & Interfaces
    missionRules.ts                # กฎการตรวจคำตอบ M1-M5 และการคำนวณ Rubric 100 คะแนน
    connectionRules.ts             # กฎการเสียบสาย Cat6/HDMI, งบไฟ PoE 65W, Topology Reachability
  store/
    useRoleplayStore.ts            # Zustand State Store (Inventory, Dialogues, Missions, Topology)
  utils/
    learningEvidence.ts            # Audit Trail บันทึกผล และสร้าง Certificate Verification Code
  components/
    player/
      BlockStudentAvatar.tsx       # ตัวละคร 3D สไตล์บล็อกช่างเทคนิค ขยับแขนขา ถืออุปกรณ์ในมือ
      PlayerController.tsx         # คอนโทรลเลอร์เดิน/วิ่ง ตรวจสอบขอบเขต และแจ้งเตือน Proximity
      ThirdPersonCamera.tsx        # กล้อง Third-Person ตามหลังตัวละครแบบสมูท
    learning/
      KnowledgeStation.tsx         # บีคอนโฮโลแกรมลอยเหนือสถานีความรู้ทั้ง 6 โซน
      NpcDialogue.tsx              # กล่องข้อความบทสนทนาภาษาไทยกระชับ (ไม่เกิน 140 ตัวอักษร)
      DataFlowBoard.tsx            # บอร์ดเส้นทางข้อมูล Mission 2 พร้อมลูกบอลแสงแพ็กเก็ตวิ่งตามสาย
      AnswerDropZone.tsx           # แท่นวางการ์ด 4 สี (ฟ้า, เขียว, เหลือง, แดง) สำหรับ Mission 1
      AnalogVsIpTable.tsx          # โต๊ะเปรียบเทียบคุณสมบัติ Analog vs IP สำหรับ Mission 4
    equipment/
      VirtualCctvDevice.tsx        # โมเดล 3D เสมือนจริงของ Camera, Switch PoE, NVR, PC, Monitor
      InteractivePort.tsx          # พอร์ตต่อสาย RJ45 และ HDMI พร้อมไฟวงแหวนแสดงสถานะ
      DeviceStatusPanel.tsx        # สวิตช์เปิด/ปิดเครื่อง และไฟ LED Power, Link, PoE, Online
      Mission5WiringLab.tsx        # แท่นติดตั้งอุปกรณ์และสายเชื่อมต่อเสมือนจริงของ Mission 5
    hud/
      ObjectiveHud.tsx             # แถบแสดงภารกิจ คะแนนสะสม และโซนปัจจุบัน
      InventoryBar.tsx             # ช่องเก็บของด้านล่าง 5 ช่อง พร้อมปุ่มคืนของ
      InteractionPrompt.tsx        # ป้ายข้อความเตือนเมื่อเข้าใกล้วัตถุหรือ NPC
      FieldNotebook.tsx            # สมุดบันทึกช่าง Checklist, Minimap, Workbenches, Diagnostics, Certificate
      SettingsModal.tsx            # หน้าต่างตั้งค่ากราฟิกและระบบ
```

---

## 4. วิธีรันและทดสอบ (Getting Started)

### ติดตั้ง Dependencies
```powershell
npm install
```

### เริ่มเซิร์ฟเวอร์สำหรับพัฒนา (Dev Server)
```powershell
npm run dev
```
เปิดบราวเซอร์ที่: `http://127.0.0.1:5173/`

### รัน Unit Tests (38 การทดสอบครอบคลุมทุกภารกิจและสายสัญญาณ)
```powershell
npm test
```

### ตรวจสอบความถูกต้องของ TypeScript
```powershell
npm run lint
```

### บิลด์สำหรับ Production
```powershell
npm run build
```

### รัน Browser Playtest อัตโนมัติ (Playwright)
```powershell
node playtest.js
node playtest_full.js
```
ภาพหน้าจอและผล Playtest จะถูกบันทึกไว้ในโฟลเดอร์ `output/playtest/`

---

## 5. วิธีเพิ่มสถานีความรู้หรืออุปกรณ์ใหม่ (Extensibility)

### เพิ่มอุปกรณ์ใหม่ลง Catalog
1. เปิด `src/data/virtualEquipmentCatalog.ts`
2. เพิ่ม Device ID และสเปกใน `VIRTUAL_EQUIPMENT_CATALOG`:
   ```ts
   NEW_DEVICE: {
     id: 'NEW_DEVICE',
     nameTh: 'ชื่ออุปกรณ์ภาษาไทย',
     nameEn: 'English Name',
     category: 'NETWORK',
     powerType: 'POE',
     powerWatts: 8.0,
     dimensions: [0.2, 0.1, 0.15],
     leds: ['POWER', 'LINK'],
     descriptionTh: 'คำอธิบายสั้นกระชับ',
     ports: [
       { id: 'PORT_1', name: 'LAN', portType: 'RJ45_POE', powerRequiredWatts: 8.0 }
     ]
   }
   ```

### เพิ่มสถานีความรู้ใหม่
1. เปิด `src/data/unit1RoleplayContent.ts`
2. เพิ่มตำแหน่ง พิกัด และบทสนทนาใน `KNOWLEDGE_STATIONS`
3. กฎและคำตอบจะถูกตรวจโดยอัตโนมัติผ่าน `missionRules.ts` โดยไม่ต้องแก้ Component
