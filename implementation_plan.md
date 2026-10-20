# แผนการพัฒนาแบบบูรณาการ: ทางเลือก C (ยกระดับ Room 101 3D Lab + สร้างห้องแล็บเจาะลึก 5 องค์ประกอบ CCTV)
## CCTV Fundamentals & 5 Core Components Mastery System (Unit 01)

---

## 1. บทนำและวัตถุประสงค์ (Overview & Strategic Goal)

ตามที่ผู้ใช้เลือก **"ทางเลือก C"** เพื่อบูรณาการการเรียนรู้หน่วยการเรียนรู้ที่ 1 (U01: พื้นฐานและองค์ประกอบระบบ CCTV) ให้ครอบคลุมทั้ง:
1. **การสร้างห้องปฏิบัติการเจาะลึก 5 องค์ประกอบระบบ CCTV (CCTV Components Interactive Lab):** หน้าแล็บจำลองวิศวกรรมมัลติมีเดียเต็มรูปแบบที่เข้าถึงได้โดยตรงจาก `/labs/cctv-components`
2. **การยกระดับห้องปฏิบัติการเสมือนจริง 3D Room 101 (`/labs/3d/room-101`):** เพิ่มเครื่องมือคำนวณสด (PoE Budget, DORI Lens, WDR Slider, HDD Codec), จอตรวจการณ์ 4 ช่อง (Quad-View Monitor Wall) ในห้อง Server, และภารกิจแก้ปัญหาหน้างาน (Customer Support Tickets)

---

## 2. รายละเอียดสถาปัตยกรรมและองค์ประกอบ (Architecture & Detailed Plan)

### ส่วนที่ 1: หน้าแล็บเจาะลึก 5 องค์ประกอบระบบ CCTV (`/labs/cctv-components`)
สร้างห้องแล็บอินเทอร์แอ็กทีฟแบบ Standalone เต็มรูปแบบ 4 โหมดการเรียนรู้:
1. **Mode 1: Component X-Ray Explorer (ผ่าสเปกและโครงสร้าง 5 องค์ประกอบหลัก):**
   - **อุปกรณ์รับภาพ (Cameras):** โครงสร้าง Lens, CMOS Sensor, ISP Processor (WDR 120dB), Smart IR, เกณฑ์ DORI (Detection, Observation, Recognition, Identification)
   - **อุปกรณ์ส่งสัญญาณและจ่ายไฟ (Transmission & Power):** UTP CAT6 (T568B), Coaxial RG6, Fiber Optic, สวิตช์ PoE (802.3af 15.4W / 802.3at 30W / 802.3bt 60W), ขีดจำกัด 100 เมตร
   - **อุปกรณ์บันทึกและจัดเก็บ (Storage & NVR):** NVR vs DVR, Surveillance HDD (WD Purple / SkyHawk 24/7, AllFrame, 180TB/ปี) vs Desktop PC HDD, Video Codecs (H.264, H.265, H.265+)
   - **อุปกรณ์ควบคุมและเครือข่าย (Network & VMS):** IP Addressing, Subnetting, VMS Software, กฎหมาย PDPA และ Privacy Masking
   - **อุปกรณ์แสดงผล (Display):** Surveillance Monitor 24/7 Anti-Burn-in, HDMI/VGA Matrix View, Mobile Cloud P2P
2. **Mode 2: Signal & Power Flow Builder (ประกอบวงจรและจำลองสัญญาณสด):**
   - ลาก/คลิกประกอบอุปกรณ์จาก Scene $\rightarrow$ กล้อง $\rightarrow$ สาย UTP $\rightarrow$ PoE Switch $\rightarrow$ NVR/HDD $\rightarrow$ จอภาพ
   - Real-time Engine: คำนวณ Bandwidth (Mbps), PoE Power Budget (W), และ Storage Retention (วัน)
   - ปุ่ม **"⚡ ทดสอบเริ่มเดินระบบ (Simulate Live Flow)"** ฉายอนิเมชัน Pulse วิ่งผ่านสายและแสดงภาพสดจำลอง
3. **Mode 3: Diagnostic Troubleshooting Lab (ภารกิจวิเคราะห์แก้ปัญหาหน้างาน 5 สถานการณ์):**
   - จอดำ No Video / กล้องดับเมื่อ IR ติด / NVR ร้อง Beep / ภาพย้อนแสงขาวโพลน / สายเกิน 100 เมตร
4. **Mode 4: Mastery Quiz & Evaluation (แบบทดสอบ 10 ข้อ พร้อมออกใบประกาศนียบัตรเสมือน):**
   - สุ่มข้อสอบ 10 ข้อ ระบบตรวจคะแนนและวิเคราะห์จุดแข็ง-จุดปรับปรุง

---

### ส่วนที่ 2: ยกระดับสถานีปฏิบัติการใน 3D Room 101 (`/labs/3d/room-101`)
ปรับปรุงและเพิ่มฟังก์ชันจำลองเชิงลึกให้แก่ 5 สถานีในห้อง 3D Room 101:
1. **สถานี 1 (ภาพดิจิทัล - โต๊ะกล้อง):**
   - เพิ่มตัวทดลองปรับ **DORI Lens Simulator** (สลับเลนส์ 2.8mm, 4.0mm, 6.0mm ส่องดูคนเดินหน้าร้าน)
   - เพิ่มสไลเดอร์ทดสอบ **True WDR (120dB)** ส่องมุมกระจกหน้าร้านที่ย้อนแสง
2. **สถานี 2 (Data Flow - ตู้แร็ค PoE):**
   - เพิ่ม **PoE Power Budget Calculator** แสดงกำลังขับวัตต์สด และเตือน Overload เมื่อเสียบอุปกรณ์เกินพิกัด
3. **สถานี 3 (หน้าที่อุปกรณ์ & เครื่องบันทึก - ห้อง Server NVR):**
   - เพิ่มเครื่องมือเปรียบเทียบ **Surveillance HDD vs Desktop HDD** และตัวคำนวณ Codec H.264 vs H.265
4. **สถานี 4 (Analog vs IP & ข้อกำหนดมาตรฐาน):**
   - เพิ่มมินิเกม **PDPA Privacy Masking** ลากสี่เหลี่ยมเบลอปิดบังพื้นที่ส่วนบุคคลหน้าร้าน
5. **สถานี 5 (Wiring, Handover & Diagnostic):**
   - เพิ่มโหมดตรวจรับงาน (Commissioning Checklist) และ **Customer Ticket Challenge** ให้แก้ปัญหากล้อง 1 ตัวก่อนส่งมอบ
6. **ฉาก 3D Room 101 Scene:**
   - ติดตั้ง **จอภาพ CCTV Quad-View Monitor Wall 3D** ภายในห้อง Server Room (Zone D) ที่แสดงผลภาพกล้อง 4 มุมจำลอง

---

### ส่วนที่ 3: จุดเชื่อมโยงและการนำทาง (Cross-Navigation)
1. **หน้า `/labs`:** เพิ่มปุ่มการ์ดหลักสำหรับ **"🧩 กิจกรรม 5 องค์ประกอบพื้นฐาน CCTV (Interactive Lab) →"** ในกรอบ Unit 01 Room 101
2. **หน้า `/labs/site-survey`:** เพิ่มลิงก์ทางลัดเชื่อมต่อทั้ง Room 101 3D และ Components Lab
3. **ภายใน Room 101 3D Lab:** มีปุ่มลัดด้านบนและที่โต๊ะปฏิบัติการเพื่อเปิด "คู่มือเจาะลึก 5 องค์ประกอบ" ได้ทันที

---

## 3. ไฟล์ที่จะสร้างและแก้ไข (Files to Create & Modify)

### 3.1 ไฟล์ที่จะสร้างใหม่ (New Files):
1. `src/components/labs/cctv-components/cctvComponentsData.ts`: ข้อมูลสเปก, ชิ้นส่วน, สูตรคำนวณ, เคสปัญหา และข้อสอบ
2. `src/components/labs/cctv-components/CctvComponentsLab.tsx`: คอมโพเนนต์หลักของห้องแล็บ 5 องค์ประกอบ
3. `src/components/labs/cctv-components/ComponentSpecExplorer.tsx`: โหมดสำรวจและผ่าสเปก (Mode 1)
4. `src/components/labs/cctv-components/SignalFlowBuilder.tsx`: โหมดต่อวงจรและคำนวณสัญญาณสด (Mode 2)
5. `src/components/labs/cctv-components/ComponentDiagnosticLab.tsx`: โหมดภารกิจแก้ปัญหาหน้างาน (Mode 3)
6. `src/components/labs/cctv-components/ComponentMasteryQuiz.tsx`: โหมดแบบทดสอบและใบประกาศนียบัตร (Mode 4)
7. `src/app/labs/cctv-components/page.tsx`: หน้า App Router ของแล็บ
8. `src/tests/cctvComponentsLab.test.tsx`: ชุดทดสอบความถูกต้องของคอมโพเนนต์และการคำนวณ

### 3.2 ไฟล์ที่จะปรับปรุง (Modified Files):
1. `src/components/labs/room101/Room101Mission1Modal.tsx`: เพิ่มแท็บ DORI Lens & WDR Simulator
2. `src/components/labs/room101/Room101Mission2Modal.tsx`: เพิ่ม PoE Budget Calculator Widget
3. `src/components/labs/room101/Room101Mission3Modal.tsx`: เพิ่ม Surveillance HDD comparison & Codec estimator
4. `src/components/labs/room101/Room101Mission5Modal.tsx`: เพิ่ม Troubleshooting Diagnostic Ticket
5. `src/components/scene/Room101SmartMartScene.tsx`: ติดตั้ง Quad-View Monitor Wall 3D ในห้อง Server
6. `src/app/labs/page.tsx`: เพิ่มปุ่มเข้าสู่ห้องแล็บ 5 องค์ประกอบในการ์ด Unit 01
7. `src/components/labs/room101/SiteSurveySimulator.tsx`: เพิ่มปุ่มทางลัดข้ามไปยัง Components Lab

### 3.3 กฎเกณฑ์ที่ต้องปฏิบัติตามอย่างเคร่งครัด (Repository Rules Compliance):
- ❌ **ไม่แตะต้อง** `src/content/courses/21909-2020/unit01.ts` (ห้ามแก้ไขตาม Rule)
- ❌ **ไม่แตะต้อง** `src/data/unitSubjectiveQuestions.ts` (ห้ามแก้ไขตาม Rule)
- ❌ **ไม่สร้างไฟล์ในโฟลเดอร์** `scratch/`
- ✅ ทุกการทดสอบเดิม 228 ข้อต้องผ่าน 100%
- ✅ ต้องตรวจสอบ `npx tsc --noEmit` ไม่ให้มี Type Error

---

## 4. แผนการทดสอบและตรวจรับ (Testing & Verification Plan)

1. **TypeScript Typecheck:** ตรวจสอบความถูกต้องด้วย `npx tsc --noEmit`
2. **Automated Unit Tests:** รัน `npm test -- --run` ทุกชุดทดสอบ
3. **Interactive Browser Verification:**
   - เปิดทดสอบหน้า `/labs/cctv-components` ตรวจสอบโหมดทั้ง 4
   - เปิดทดสอบหน้า `/labs/3d/room-101` เดินตัวละครสำรวจโต๊ะ 1-5 และห้อง Server Room ตรวจสอบ Quad-View Monitor Wall
   - ทดสอบการคำนวณ PoE Budget, DORI Lens Slider, WDR Slider, และ Troubleshooting Ticket
   - บันทึกภาพ Screenshot ตรวจสอบความสวยงาม

---

## 5. การขออนุมัติจากผู้ใช้ (User Approval)

โปรดยืนยันแผนการพัฒนาแบบบูรณาการตาม **ทางเลือก C** ข้างต้น เพื่อเริ่มดำเนินการสร้างและปรับปรุงระบบทันทีครับ
