# รายการ Asset และแบบจำลองอุปกรณ์ (Asset Manifest)

หน่วยที่ 1: IP CCTV Fundamentals — Block-Style Role-Play
รายวิชา: กล้องวงจรปิดบนระบบเครือข่าย (21909-2020) ระดับ ปวช. หลักสูตร พ.ศ. 2567

## 1. ปรัชญาการออกแบบ Asset

- **สไตล์**: Procedural Block-Style และ Low-Poly Geometry
- **ไม่มีทรัพย์สินทางการหรือเครื่องหมายการค้าของ Roblox**: ปั้นขึ้นเองทั้งหมดด้วย Three.js BufferGeometry ในสัดส่วนเมตรมาตรฐาน (Metric 1:1)
- **สิทธิ์การใช้งาน**: Custom Built (MIT / Educational Open Source) ไม่มีปัญหาเรื่องลิขสิทธิ์
- **ประสิทธิภาพ**: 0 External Binary Network Requests สำหรับ 3D Models ทำให้โหลดติดทันทีภายใน 50ms และรันได้ 60 FPS บนเครื่องสเปกห้องเรียนทั่วไป

---

## 2. ตารางรายการ Asset และแบบจำลอง

| ชื่ออุปกรณ์ / Asset | แหล่งที่มา / วิธีการสร้าง | สิทธิ์ใช้งาน (License) | Draw Calls / ขนาด | สถานะ Optimization |
|---|---|---|---|---|
| **Block Student Avatar** | Procedural Three.js Meshes (Head, Vest, Articulated Limbs) | Custom Open Source (MIT) | 12 meshes, ~0.8 KB code | Fully optimized, hierarchical parent-child transforms |
| **IP Bullet Camera** | Procedural Tube, Sunshield, Bracket, RJ45 & DC Port | Custom Open Source (MIT) | 8 meshes, 24 segments | Low-poly, Instanced material |
| **IP Dome Camera** | Sphere/Cylinder with IK10 Dome casing & Pan/Tilt base | Custom Open Source (MIT) | 5 meshes | Lightweight, reusable material |
| **8-Port PoE Switch** | 1U Rack Chassis, 8 PoE RJ45 + 2 Uplink + Power Switch | Custom Open Source (MIT) | 18 meshes (ports + chassis) | Pre-computed bounding boxes |
| **8-Channel NVR** | Desktop Case, HDD Surveillance Bay, HDMI OUT & LAN | Custom Open Source (MIT) | 6 meshes | High performance procedural box |
| **Router** | WAN & 4 LAN Ports, Antenna proxies, Status LEDs | Custom Open Source (MIT) | 4 meshes | Ultra low-poly |
| **Client PC & Monitor** | Mid-tower Workstation & 24" 16:9 Display with HDMI IN | Custom Open Source (MIT) | 7 meshes | Dynamic emissive screen texture for Live View |
| **Cat6 & HDMI Cables** | Dynamic 3D Cable Segments along floor conduits | Custom Open Source (MIT) | Dynamic box extrusions | Color-coded (Blue Cat6, Red HDMI) |
| **Smart Mart Store Interior** | Shelves, Floor Tiles, Gondolas, Neon Rings, Lights | Custom Open Source (MIT) | Modular store grid | Instanced geometries, shadow culling on Low Spec |
| **Fonts (Prompt & Kanit)** | Google Fonts CDN (Prompt, Kanit) | SIL Open Font License (OFL) | Pre-connected CDN | WebFont cached by browser |

---

## 3. ขนาดไฟล์และการส่งมอบ (Bundle Analysis)

```text
dist/index.html                     1.16 kB │ gzip:   0.65 kB
dist/assets/index-CswKtgSV.css     10.09 kB │ gzip:   3.19 kB
dist/assets/index-Bqey5iR0.js   1,199.91 kB │ gzip: 321.67 kB
Total Gzipped Transfer Size: ~325 kB
Initial Load Time on 3G/4G: < 0.8 วินาที
```
