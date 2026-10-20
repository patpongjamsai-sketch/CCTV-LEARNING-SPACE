# แผนงาน: จัดโครงสร้างศูนย์ปฏิบัติการเสมือนจริงเป็น 8 Units และผสาน Interactive Pre-Labs

---

## 1. วัตถุประสงค์และขอบเขตงาน (Objectives & Scope)

ปรับปรุงโครงสร้างศูนย์ปฏิบัติการกล้องวงจรปิดเสมือนจริง (`/labs` ที่ [src/app/labs/page.tsx](file:///e:/งานปี%202026/แผนการสอน%20หน่วยการสอน%20วิชาสอน%20คะแนน/ภาคเรียน2-69/กล้องวงจรปิด/cctv-technician-3d-training-center/src/app/labs/page.tsx)) ให้จัดระเบียบตาม **8 หน่วยการเรียนรู้หลัก (8 Units: U01 – U08)** อย่างชัดเจน ไม่แยกการ์ดลอยไว้ด้านบน:

1. **จัดหมวดหมู่ U02 (Room 102: Camera Selection & Placement)**:
   - ย้ายการ์ด **Bullet Camera 3D Interactive Lab V1** และ **Dome Camera 3D Interactive Lab V1 (สำนักงาน & โรงฝึกงาน)** เข้ามาเป็นชุดแล็บปฏิบัติการเฉพาะทางภายใต้หัวข้อ **U02** โดยตรง
   - มีปุ่มเข้าปฏิบัติการย่อยทั้ง 3 ห้อง: `เข้าสู่ห้อง Bullet Camera`, `🏢 กล้องโดม: ห้องสำนักงาน`, และ `🏭 กล้องโดม: โรงฝึกงาน`
2. **จัดหมวดหมู่ U03 (Room 103: Cabling, Conduit & Termination)**:
   - ย้ายการ์ด **คู่มือ 3D Interactive การดัดท่อ uPVC (ดัดสามเข่า 90° & หลบคาน 45°)** และ **เกมฝึกเข้าหัวสาย RJ45 CAT6** เข้ามาอยู่ภายใต้หัวข้อ **U03**
3. **จัดหมวดหมู่ U04 (Room 104: IP Camera Networking & PoE Budget)**:
   - ผสานระบบ **Interactive 2D Network Pre-Lab (Network Simulator)** และ **Room 104 3D Workstation** ภายใต้หัวข้อ **U04**
4. **จัดแสดงโครงสร้างทั้ง 8 Units (U01 ถึง U08) ให้เป็นระบบเอกภาพ**:
   - แต่ละ Unit จะแสดงหมายเลข Unit, Room Number, ชื่อสมรรถนะ, ระยะเวลา, สถานะสิทธิ์ (Gate Unlock), และโมดูลแล็บย่อยทั้งหมดอย่างครบถ้วน สวยงาม ทันสมัย สไตล์ Cyberpunk / Dark Glassmorphism
5. **พัฒนา 2D Network Simulator Pre-Lab สำหรับ U04**:
   - พัฒนา Component `src/components/labs/room104/NetworkSimulator.tsx` (5 แท็บการเรียนรู้)
   - สร้างหน้าเปิดใช้งาน `src/app/labs/network-simulator/page.tsx`


---

## 2. โมดูลระบบจำลองทั้ง 5 แท็บที่จะถูกพอร์ต (Core Interactive Modules)

### แท็บที่ 1: แผนผังการสร้างเนื้อหา (Content Plan & Storyboard)
- สรุป 4 เสาหลักการเรียนรู้ (Physical & PoE, IP Addressing, CLI VLAN, Subnet Planning)
- ตาราง Storyboard & Mission Flow สำหรับผู้เรียนและครูผู้สอน

### แท็บที่ 2: จำลองเสียบสาย PoE Switch เสมือนจริง (Realistic 1U Rackmount Chassis)
- ตัวถังแร็คโลหะ 1U พร้อม Rack Ears ซ้าย-ขวา
- 8 พอร์ต PoE+ (1000Mbps, 30W/Port) + 2 พอร์ต Uplink Gigabit (สำหรับ NVR และ Router)
- ไฟ LED สถานะ 2 ดวงต่อพอร์ต (Link/Act กะพริบสีเขียว, PoE Status สีส้ม)
- เกจวัดกำลังไฟดิจิทัล (PoE Load Meter 0–65W) พร้อมไฟเตือน **PoE-MAX LED** เมื่อโหลดเกิน 80%
- สวิตช์ฮาร์ดแวร์ **DIP Switch 3 โหมด**: Standard (100m/1Gbps), VLAN (Port Isolation), Extend (250m/10Mbps)
- ปุ่มจำลองกลางวัน/กลางคืน (**Day/Night IR Toggle**) ดึงโหลดไฟหลอดอินฟราเรดเพิ่ม 2 เท่า
- ระบบคลิกเลือกสายสัญญาณจากอุปกรณ์และคลิกเสียบเข้าพอร์ต RJ45 หรือถอดสาย
- ตารางสถานะพอร์ตและกำลังไฟแบบเรียลไทม์ พร้อมปุ่มเสียบสายอัตโนมัติ (Demo)

### แท็บที่ 3: หน้าจอตั้งค่า IP กล้อง & NVR 4.0 Web GUI
- กรอบจำลองเฟิร์มแวร์ NVR 4.0 (DS-7604NI) พร้อมนาฬิกา OSD แบบสด, เกจวัด Bandwidth ขาเข้า (BW: Mbps)
- จอภาพมอนิเตอร์กล้อง 4 ช่อง (2x2 Split Screen) แสดงสตรีมสดจำลองพร้อม OSD REC, หรือหน้าจอเตือน Error (NO LINK / IP CONFLICT)
- ตารางสแกนหาอุปกรณ์ **SADP / ONVIF Online Device Scanner** แสดงสถานะ:
  - `ONLINE` (เชื่อมต่อสำเร็จ)
  - `CONFLICT` (IP ซ้ำ เช่น .101 ซ้ำ 2 ตัว)
  - `SUBNET_ERR` (IP คนละวง เช่น .0.64)
- ฟอร์มปรับแต่งพารามิเตอร์เครือข่าย (SADP Modify Network Parameters) สำหรับแก้ไข IP, Subnet Mask, Gateway, DHCP
- เครื่องมือทดสอบเครือข่าย **ICMP Ping & RTSP Port 554 Diagnostic Console** แสดง Latency และผลการเชื่อมต่อ

### แท็บที่ 4: หน้าเขียนคำสั่งสวิตช์ Managed Switch (Cisco IOS CLI Emulator)
- หน้าจอ Terminal สไตล์ PuTTY SSH พร้อมโหมดคำสั่ง: `Switch>`, `Switch#`, `Switch(config)#`, `Switch(config-if)#`
- รองรับคำสั่ง:
  - `enable`, `conf t`, `exit`
  - `show power inline` (ตารางแจกแจงวัตต์ PoE แต่ละพอร์ต)
  - `show vlan brief` (ตาราง VLAN 10 และพอร์ต)
  - `vlan 10` & `name CCTV_NET` (สร้าง VLAN แยกวงกล้อง)
  - `interface fa0/1` และ `power inline never / auto` (สั่งตัด/ต่อไฟพอร์ตเพื่อรีบูตกล้องค้างจากระยะไกล)
- ปุ่มคำสั่งลัด (Quick Macro) สำหรับการสาธิตและเรียนรู้อย่างรวดเร็ว

### แท็บที่ 5: การแบ่งวงแลนและการจัดสรรช่วง IP (IP Subnetting & CCTV Allocation)
- สไลเดอร์ปรับค่า CIDR Prefix (/22 ถึง /28) และสไลเดอร์จำนวนกล้องที่ต้องการติดตั้ง (4 ถึง 450 ตัว)
- คำนวณค่าอัตโนมัติ: Subnet Mask, Network Address, ช่วง Usable IP, Broadcast Address, และจำนวน Host สูงสุด
- แถบแผนผังภาพจัดสรร IP (Visual IP Proportion Bar) แยกสัดส่วน Gateway, NVR, กล้อง และ IP สำรอง
- ตารางโควตาช่วง IP แนะนำตาม Best Practice งานติดตั้งกล้อง
- ตารางจำลองบล็อกวงย่อย (Subnet Blocks) เมื่อเลือก /25, /26, /27 สำหรับแยกตามอาคาร/ชั้น
- ปุ่มลัดโจทย์สถานการณ์จริง 3 ระดับ (ร้านค้าขนาดเล็ก /26, สำนักงาน /24, โรงงาน 350 กล้อง /23)

---

## 3. ขั้นตอนการดำเนินการ (Execution Steps)

1. **ปรับปรุงโครงสร้างหน้าสารบัญศูนย์ปฏิบัติการ (`src/app/labs/page.tsx`)**:
   - จัดหมวดหมู่เป็น **8 Units (U01 – U08)** ชัดเจน
   - ย้าย **Bullet Camera 3D Lab** และ **Dome Camera 3D Lab** (ห้องสำนักงาน & ห้องโรงฝึกงาน) เข้าเป็นชุดปฏิบัติการของ **Unit 02 (Room 102)**
   - ย้าย **3D Conduit Bending Lab** และ **RJ45 Game** เข้าเป็นชุดปฏิบัติการของ **Unit 03 (Room 103)**
   - เพิ่มปุ่มเข้าถึง **Interactive 2D Network Pre-Lab** ใน **Unit 04 (Room 104)**
   - นำกล่อง Featured ลอยด้านบนออก แล้วจัดเรียงการ์ด 8 Units ให้เป็นเอกภาพ สวยงาม และเข้าถึงแล็บย่อยทั้งหมดได้ทันที
2. **สร้าง Component ระบบจำลองเครือข่าย 2D Pre-Lab**:
   - `src/components/labs/room104/NetworkSimulator.tsx` รวบรวม state management และ UI interaction ทั้ง 5 แท็บ
3. **สร้างหน้า Page Route สำหรับ Network Simulator**:
   - `src/app/labs/network-simulator/page.tsx`
4. **ทดสอบและตรวจสอบความถูกต้อง**:
   - ตรวจสอบ TypeScript Type Safety (`npx tsc --noEmit`)
   - รัน Next.js Turbopack Build (`npm run build`)
   - ตรวจสอบผ่าน Browser ให้แน่ใจว่าหน้า `/labs` แสดง 8 Units อย่างสวยงาม และ U02 มี Bullet/Dome ครบถ้วน


---

## 4. ผลการตรวจสอบและทดสอบ (Verification Results)

- [x] **Type Check**: ตรวจสอบ TypeScript ไม่มี Error ด้วย `npx tsc --noEmit` (0 errors)
- [x] **8 Units Restructuring in /labs**:
  - จัดระเบียบหน้า `/labs` เป็น **8 Units (U01 ถึง U08)** สมบูรณ์
  - **U02 (Room 102)** บรรจุ **Bullet Camera 3D Interactive Lab V1** และ **Dome Camera 3D Interactive Lab V1 (สำนักงาน & โรงฝึกงาน)**
  - **U03 (Room 103)** บรรจุ **3D Conduit Bending Lab** และ **เกมฝึกเข้าหัวสาย RJ45 CAT6**
  - **U04 (Room 104)** บรรจุ **Interactive 2D Network Pre-Lab (Network Simulator)**
- [x] **Functional Tests**:
  - ทดสอบเปิดหน้า `/labs` ใน Browser เรนเดอร์ถูกต้อง ครบทั้ง 8 Units ไม่มีกล่องลอย
  - ปุ่มเข้าสู่ห้องปฏิบัติการ Bullet Camera และ Dome Camera เชื่อมโยงและเรนเดอร์ WebGL ได้อย่างสมบูรณ์
- [x] **Production Deployment**:
  - พร้อมบันทึก Commit & Push ขึ้น GitHub (`origin/main`)

