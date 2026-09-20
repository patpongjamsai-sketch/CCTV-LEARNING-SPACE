// Unit Subjective (อัตนัย) Questions for Course 21909-2020
// CCTV Technician Vocational Certificate (ปวช. 2567)

export type SubjectiveQuestion = {
    id: string;
    unitId: string;
    order: number;
    titleTh: string;
    scenario: string;
    prompt: string;
    expectedConcepts: string[];
    rubricDescription: string;
    maxScore: number;
    samplePlaceholder: string;
};

export const UNIT_SUBJECTIVE_QUESTIONS: Record<string, SubjectiveQuestion[]> = {
    U01: [
        {
            id: 'U01-SUB-Q01',
            unitId: 'U01',
            order: 1,
            titleTh: 'การวิเคราะห์ระบบและเปรียบเทียบสถาปัตยกรรม IP vs Analog CCTV',
            scenario: 'ร้านค้า Smart Mart (Room 101) มีแผนติดตั้งระบบกล้องวงจรปิดจำนวน 4 จุดเพื่อเฝ้าระวังหน้าร้าน จุดคิดเงิน และสต็อกสินค้า เจ้าของร้านต้องการทราบความแตกต่างระหว่างระบบ Analog เดิมกับระบบ IP Camera',
            prompt: 'จงเปรียบเทียบข้อดี-ข้อจำกัดระหว่าง Analog HD และ IP Camera ใน 3 ด้าน: 1) คุณภาพสัญญาณและระยะทาง 2) ความซับซ้อนของสายสัญญาณและระบบไฟเลี้ยง (PoE) 3) ความสะดวกในการขยายระบบในอนาคต พร้อมระบุเหตุผลว่าทำไมร้านนี้จึงควรเลือกใช้ NVR ร่วมกับ IP Camera',
            expectedConcepts: ['IP Camera', 'NVR', 'PoE', 'สาย CAT6', 'Bandwidth', 'การเข้ารหัสข้อมูลดิจิทัล', 'การขยายระบบผ่าน Switch'],
            rubricDescription: 'อธิบายครบ 3 มิติ (มิติละ 3 คะแนน) และให้เหตุผลสนับสนุนการเลือก NVR+IP Camera ได้ถูกต้องตามหลักวิชาชีพ (1 คะแนน)',
            maxScore: 10,
            samplePlaceholder: 'ระบุการเปรียบเทียบ 3 ด้าน และเหตุผลการเลือกใช้ NVR สำหรับ Smart Mart...',
        },
        {
            id: 'U01-SUB-Q02',
            unitId: 'U01',
            order: 2,
            titleTh: 'การวินิจฉัยปัญหาภาพสดแสดงได้แต่ไม่สามารถบันทึกภาพย้อนหลังได้ (Live View vs Recording Path)',
            scenario: 'ช่างเทคนิคได้รับแจ้งเหตุจากผู้จัดการร้านว่า หน้าจอแสดงภาพสด (Live View) จากกล้องทั้ง 4 ตัวขึ้นภาพชัดเจนปกติ แต่เมื่อเกิดเหตุการณ์ของหายแล้วกดค้นหาภาพย้อนหลัง (Playback) กลับไม่พบไฟล์วิดีโอใดๆ บันทึกอยู่ในระบบเลย',
            prompt: 'จงวิเคราะห์หาสาเหตุที่เป็นไปได้ 3 ประการ และเสนอขั้นตอนการตรวจสอบแก้ไขปัญหาอย่างเป็นลำดับขั้น พร้อมระบุอุปกรณ์หรือการตั้งค่าที่ต้องตรวจสอบบนเครื่องบันทึก',
            expectedConcepts: ['Harddisk Surveillance', 'สถานะ Format / Unformatted', 'Recording Schedule', 'Motion Detection', 'Power Supply HDD / SATA Cable'],
            rubricDescription: 'ระบุสาเหตุเป็นไปได้ 3 ข้อ (3 คะแนน) เสนอขั้นตอนการตรวจเช็กและวิธีแก้ไขปัญหาได้ตรงจุด (5 คะแนน) ระบุการตั้งค่าบน NVR/DVR ได้ถูกต้อง (2 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. สาเหตุที่เป็นไปได้...\n2. ขั้นตอนการตรวจสอบและแก้ไข...',
        },
    ],
    U02: [
        {
            id: 'U02-SUB-Q01',
            unitId: 'U02',
            order: 1,
            titleTh: 'การเลือกประเภทกล้องและเกณฑ์ DORI ในสถานการณ์จริง',
            scenario: 'อาคารสำนักงานและโรงเรียน Smart School (Room 102) ต้องการติดตั้งกล้องบริเวณ: 1) โถงทางเข้าเพื่อจดจำใบหน้าผู้มาติดต่อ 2) ลานจอดรถเพื่อตรวจจับป้ายทะเบียนรถเข้า-ออก 3) ภายในห้องเรียนเพื่อสังเกตพฤติกรรมภาพรวม',
            prompt: 'จงเลือกประเภทกล้อง (Dome, Bullet, PTZ) ขนาดเลนส์ และเกณฑ์ DORI (Detect, Observe, Recognize, Identify) ที่เหมาะสมสำหรับแต่ละจุดติดตั้ง พร้อมอธิบายเหตุผลทางเทคนิคและการป้องกันมุมอับสายตา (Blind Spot)',
            expectedConcepts: ['DORI Standard', 'Identify (>= 250 px/m)', 'Recognize (125 px/m)', 'Bullet Lens แคบสำหรับป้ายทะเบียน', 'Dome ป้องกันการปรับหมุน', 'Blind Spot Elimination'],
            rubricDescription: 'จับคู่จุดติดตั้งกับประเภทกล้องและเกณฑ์ DORI ได้ถูกต้องทั้ง 3 จุด (6 คะแนน) อธิบายเหตุผลและวิธีลดมุมอับสายตาได้ชัดเจน (4 คะแนน)',
            maxScore: 10,
            samplePlaceholder: 'จุดที่ 1 โถงทางเข้า: ชนิดกล้อง... เลนส์... เกณฑ์ DORI...\nจุดที่ 2 ลานจอดรถ...\nจุดที่ 3 ห้องเรียน...',
        },
    ],
    U03: [
        {
            id: 'U03-SUB-Q01',
            unitId: 'U03',
            order: 1,
            titleTh: 'การกำหนดสเปกและมาตรฐานเปลือกสายทนไฟ (Cable Fire Rating & LSZH Standards)',
            scenario: 'โครงการติดตั้งระบบกล้องวงจรปิดในอาคารโรงพยาบาลและอาคารสูง 15 ชั้น มีการเดินสายสัญญาณผ่านช่องท่อแนวตั้ง (Riser Shaft) และช่องว่างเหนือฝ้าเพดานสำหรับระบบปรับอากาศ (Plenum Air Space)',
            prompt: 'จงเปรียบเทียบมาตรฐานความปลอดภัยของเปลือกสาย CMR (Riser), CMP (Plenum) และ LSZH (Low Smoke Zero Halogen) พร้อมอธิบายอันตรายของการใช้สาย PVC ทั่วไปกรณีเกิดเพลิงไหม้ (ก๊าซพิษและการมองเห็น) และระบุข้อกำหนดในการเลือกใช้สายให้สอดคล้องกับมาตรฐานความปลอดภัยในอาคาร',
            expectedConcepts: ['LSZH (Low Smoke Zero Halogen)', 'CMR (Riser)', 'CMP (Plenum)', 'ก๊าซพิษกรดเกลือ (HCl Gas)', 'การลามไฟแนวตั้ง (Vertical Flame Spread)', 'มาตรฐาน NFPA / UL 1666'],
            rubricDescription: 'เปรียบเทียบความแตกต่างของ CMR, CMP และ LSZH ได้ถูกต้องครบถ้วน (5 คะแนน) อธิบายอันตรายของก๊าซพิษจากสาย PVC และระบุข้อกำหนดการเลือกสายตามพื้นที่ติดตั้งได้ถูกต้อง (5 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. เปรียบเทียบ CMR vs CMP vs LSZH:\n2. อันตรายของสาย PVC ธรรมดาเมื่อเกิดไฟไหม้:\n3. การเลือกใช้สายในช่องชาร์ปและเหนือฝ้า...',
        },
        {
            id: 'U03-SUB-Q02',
            unitId: 'U03',
            order: 2,
            titleTh: 'ข้อกำหนดระยะปลอดภัยและการออกแบบท่อร้อยสาย (Conduit Spacing & Grounding Standards)',
            scenario: 'โรงงานอุตสาหกรรมจำเป็นต้องเดินท่อร้อยสายโลหะ EMT สำหรับกล้องวงจรปิดผ่านแนวเดียวกับราง Wireway สายไฟฟ้ากำลัง 380V 3 เฟสที่จ่ายไฟให้เครื่องจักรอุตสาหกรรมขนาดใหญ่',
            prompt: 'จงระบุข้อกำหนดระยะห่างขั้นต่ำ (Clearance) ระหว่างท่อสายสัญญาณ CCTV กับสายไฟฟ้ากำลังตามมาตรฐาน วสท. และ TIA-569 พร้อมอธิบายหลักการต่อลงดินแบบจุดเดียว (Single Point Grounding) เพื่อป้องกันปัญหาความต่างศักย์เหนี่ยวนำ (Ground Potential Difference) และปัญหาภาพเป็นคลื่นลาย (Hum Bars)',
            expectedConcepts: ['ระยะห่างขั้นต่ำ 30-50 cm (Conduit Clearance)', 'ท่อโลหะ EMT เป็นเกราะป้องกันสัญญาณ', 'Single Point Grounding', 'Ground Potential Difference', 'การป้องกัน Ground Loop / Hum Bars', 'มาตรฐาน วสท. / TIA-569'],
            rubricDescription: 'ระบุระยะปลอดภัยตามมาตรฐาน วสท./TIA-569 ได้ถูกต้อง (4 คะแนน) อธิบายหลักการ Single Point Grounding และการแก้ปัญหา Ground Loop ได้ชัดเจนตามหลักวิชาชีพ (6 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. ระยะห่างขั้นต่ำตามมาตรฐาน วสท. และ TIA-569:\n2. หลักการต่อลงดิน Single Point Grounding และการแก้ปัญหาภาพลาย...',
        },
    ],
    U04: [
        {
            id: 'U04-SUB-Q01',
            unitId: 'U04',
            order: 1,
            titleTh: 'การออกแบบโครงสร้าง VLAN Segmentation และการคำนวณ Subnetting CIDR สำหรับระบบ CCTV อาคารขนาดใหญ่',
            scenario: 'อาคารสำนักงานและคลังสินค้าขนาดใหญ่มีแผนติดตั้งกล้องวงจรปิด IP Camera รวม 50 ตัว, เครื่องบันทึก NVR 2 เครื่อง, ระบบสแกนใบหน้า Access Control, และมีเครื่อง Client PC ฝ่ายรักษาความปลอดภัย 6 เครื่อง วิศวกรต้องการออกแบบเครือข่ายโดยแยกวง Network ไม่ให้ Broadcast Traffic ของกล้องรบกวนระบบงานคอมพิวเตอร์ทั่วไป',
            prompt: '1) จงออกแบบการแบ่ง Segment เครือข่ายด้วยมาตรฐาน IEEE 802.1Q VLAN อย่างน้อย 3 วง (เช่น VLAN 10: กล้อง CCTV, VLAN 20: NVR/Server, VLAN 30: Client Management) 2) กำหนด CIDR Prefix, Network Address, Subnet Mask และช่วง IP Host ที่ใช้ได้สำหรับแต่ละวงจาก Network หลัก 172.16.0.0/16 3) อธิบายบทบาทของ Inter-VLAN Routing และ Default Gateway ที่ต้องกำหนดบน Layer 3 Switch เพื่อให้ NVR และ Client สามารถดึงภาพจากกล้องข้าม VLAN ได้อย่างปลอดภัย',
            expectedConcepts: ['802.1Q VLAN', 'Subnetting CIDR (/26 หรือ /27)', 'Broadcast Domain Isolation', 'Inter-VLAN Routing / Layer 3 Switch', 'Default Gateway', 'Trunk Port vs Access Port'],
            rubricDescription: 'ออกแบบโครงสร้าง 802.1Q VLAN ได้ถูกต้องครบทั้ง 3 วง (4 คะแนน) คำนวณ Subnetting, Mask และช่วง Host ได้ถูกต้องตามหลักคณิตศาสตร์เครือข่าย (4 คะแนน) อธิบาย Inter-VLAN Routing และ Gateway ได้ถูกต้องตามหลักวิศวกรรม (2 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. การแบ่ง VLAN (VLAN ID, ชื่อ, วัตถุประสงค์):\n2. การคำนวณ Subnetting (Network, Mask, Host Range):\n3. สถาปัตยกรรม Inter-VLAN Routing และ Gateway...',
        },
        {
            id: 'U04-SUB-Q02',
            unitId: 'U04',
            order: 2,
            titleTh: 'การรักษาความปลอดภัยเครือข่าย CCTV (Network Security), QoS และการป้องกัน Broadcast Storm',
            scenario: 'ในโรงงานอุตสาหกรรม เคยเกิดเหตุมีบุคคลภายนอกถอดสาย LAN ของกล้องวงจรปิดภายนอกอาคารแล้วนำโน้ตบุ๊กมาเชื่อมต่อเพื่อแอบเข้าสู่เครือข่ายภายใน และในบางช่วงเวลาพบปัญหากล้องกระตุก หลุดจากระบบ หรือภาพหน่วงจากสตรีมข้อมูลสะสมบนสวิตช์',
            prompt: '1) จงเสนอมาตรการรักษาความปลอดภัยระดับพอร์ต (Port Security / 802.1X / MAC Address Sticky Binding) เพื่อป้องกันการถอดสายกล้องไปเสียบอุปกรณ์แปลกปลอม 2) อธิบายการตั้งค่า Quality of Service (QoS / DSCP / 802.1p Priority) บน Managed PoE Switch เพื่อให้ความสำคัญสูงสุดกับ Real-time Video Stream 3) เสนอวิธีป้องกันปัญหา Broadcast Storm และ Multicast Flooding บนเครือข่ายกล้อง IP (เช่น Storm Control และ IGMP Snooping)',
            expectedConcepts: ['Port Security (MAC Binding / Sticky)', '802.1X Authentication', 'QoS (DSCP / 802.1p Priority)', 'IGMP Snooping', 'Storm Control', 'Disable Unused Ports'],
            rubricDescription: 'เสนอแนวทาง Port Security และ MAC Binding ได้รัดกุม (4 คะแนน) อธิบายหลักการ QoS จัดลำดับความสำคัญของแพ็กเก็ตวิดีโอได้ถูกต้อง (3 คะแนน) ระบุการตั้งค่า Storm Control และ IGMP Snooping ได้ชัดเจน (3 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. การกำหนด Port Security และ MAC Address Binding:\n2. การตั้งค่า QoS / DSCP จัดลำดับความสำคัญของสตรีมวิดีโอ:\n3. การป้องกัน Broadcast Storm และ IGMP Snooping...',
        },
    ],
    U05: [
        {
            id: 'U05-SUB-Q01',
            unitId: 'U05',
            order: 1,
            titleTh: 'การตั้งค่า Codec H.265, Bitrate และ Motion Detection บน NVR',
            scenario: 'ลูกค้าต้องการให้ NVR บันทึกภาพกล้องความละเอียด 4MP จำนวน 8 ตัวให้เก็บข้อมูลได้ไม่น้อยกว่า 30 วัน แต่ปัจจุบันบันทึกได้เพียง 12 วัน ฮาร์ดดิสก์ขนาด 4TB ก็เต็ม',
            prompt: 'จงอธิบายแนวทางการปรับแต่งค่าบน NVR (ได้แก่ Codec H.264 vs H.265, VBR vs CBR, Frame Rate, และ Motion Masking) เพื่อลดปริมาณข้อมูลที่ต้องบันทึกลงโดยยังคงความคมชัดและหลักฐานที่สำคัญไว้ครบถ้วน',
            expectedConcepts: ['H.265 Codec', 'VBR (Variable Bitrate)', 'ลด FPS จาก 30 เหลือ 15-20', 'Motion Detection Schedule', 'Smart Codec / H.265+'],
            rubricDescription: 'อธิบายการสลับ Codec และ Bitrate ได้ถูกต้อง (4 คะแนน) เสนอการปรับ FPS และตารางบันทึก Motion ได้ชัดเจน (4 คะแนน) สรุปผลลัพธ์การประหยัดพื้นที่จัดเก็บได้สมเหตุสมผล (2 คะแนน)',
            maxScore: 10,
            samplePlaceholder: 'แนวทางปรับแต่ง NVR เพื่อขยายเวลาบันทึกเป็น 30 วัน:\n1. Video Codec...\n2. Bitrate Type...\n3. Motion Detection...',
        },
    ],
    U06: [
        {
            id: 'U06-SUB-Q01',
            unitId: 'U06',
            order: 1,
            titleTh: 'การคำนวณขนาด Surveillance HDD และระบบความปลอดภัย Cloud P2P',
            scenario: 'โรงพยาบาลต้องการบันทึกกล้อง IP 8 ตัว แต่ละตัวใช้ Bitrate 4,096 Kbps (4 Mbps) ต้องการบันทึกต่อเนื่อง 24 ชั่วโมงต่อวัน เป็นเวลา 30 วันเต็ม และต้องการให้ผู้บริหารดูภาพผ่านสมาร์ตโฟนจากนอกโรงพยาบาลได้',
            prompt: '1) จงแสดงสูตรและวิธีคำนวณขนาดความจุ HDD รวม (หน่วยเป็น Gigabyte หรือ Terabyte) 2) จงอธิบายความปลอดภัยในการเปิดใช้ระบบ Cloud P2P ผ่าน QR Code เทียบกับการทำ Port Forwarding แบบเดิม',
            expectedConcepts: ['สูตรคำนวณ Storage: (Bitrate x 3600 x 24 x วัน x จำนวนกล้อง) / 8 / 1024 / 1024', 'Surveillance Grade HDD (24/7)', 'Cloud P2P vs Port Forwarding', 'ความเสี่ยงต่อ Brute Force & Cyber Security'],
            rubricDescription: 'คำนวณขนาด HDD ได้ถูกต้องตามสูตร (5 คะแนน) เปรียบเทียบความปลอดภัย P2P vs Port Forwarding ได้ถูกต้องตามหลัก Cyber Security (5 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. สูตรและวิธีคำนวณความจุ HDD:\n2. การเปรียบเทียบ Cloud P2P กับ Port Forwarding...',
        },
    ],
    U07: [
        {
            id: 'U07-SUB-Q01',
            unitId: 'U07',
            order: 1,
            titleTh: 'การวินิจฉัยปัญหาคลื่นลายน้ำ (Hum Bars) จาก Ground Loop และแผนบำรุงรักษา PM',
            scenario: 'กล้องบริเวณป้อมยามโรงงานแสดงภาพเป็นริ้วคลื่นลายน้ำเลื่อนขึ้นลงในแนวนอน (Hum Bars) และบางครั้งภาพกระพริบเมื่อเครื่องจักรขนาดใหญ่ในโรงงานเริ่มทำงาน',
            prompt: 'จงวิเคราะห์สาเหตุของปัญหา Ground Loop ทางไฟฟ้า และเสนอวิธีแก้ไขทางวิศวกรรม (เช่น การใช้ Ground Loop Isolator หรือการแยกแหล่งจ่ายไฟ) พร้อมร่างรายการตรวจสอบบำรุงรักษาเชิงป้องกัน (Preventive Maintenance Checklist) ประจำ 6 เดือน สำหรับระบบ CCTV',
            expectedConcepts: ['Ground Loop', 'Ground Potential Difference', 'Video Ground Loop Isolator', 'แหล่งจ่ายไฟแยกเฟส', 'PM Checklist (ความสะอาดเลนส์, อุณหภูมิตู้ Rack, ค่าสุขภาพ HDD S.M.A.R.T.)'],
            rubricDescription: 'วิเคราะห์สาเหตุ Ground Loop ทางไฟฟ้าได้ถูกต้อง (4 คะแนน) เสนอแนวทางแก้ไขทางเทคนิคได้ตรงจุด (3 คะแนน) จัดทำ PM Checklist ครอบคลุม ฮาร์ดแวร์ ซอฟต์แวร์ และความปลอดภัย (3 คะแนน)',
            maxScore: 10,
            samplePlaceholder: 'สาเหตุของริ้วคลื่น Hum Bars:\nวิธีแก้ไขปัญหา:\nรายการตรวจสอบ Preventive Maintenance (PM):...',
        },
    ],
    U08: [
        {
            id: 'U08-SUB-Q01',
            unitId: 'U08',
            order: 1,
            titleTh: 'การจัดทำผังระบบ CCTV Turnkey และรายการตรวจรับงาน (Commissioning Checklist)',
            scenario: 'ในฐานะหัวหน้าช่างเทคนิค คุณต้องส่งมอบโครงงานระบบ CCTV สำหรับอาคาร 2 ชั้น จำนวนกล้อง 12 ตัว พร้อม NVR, PoE Switch, UPS และระบบสำรองข้อมูล',
            prompt: 'จงร่างโครงสร้างเอกสารส่งมอบงาน Turnkey ประกอบด้วย: 1) Single Line Diagram (อธิบายลำดับการเชื่อมต่อจากกล้องถึงจอภาพ) 2) บัญชีรายการวัสดุและอุปกรณ์ (Bill of Materials: BOM) 3) หัวข้อในแบบฟอร์มตรวจรับมอบงาน (Site Acceptance Test Checklist) อย่างน้อย 5 ข้อที่ต้องตรวจสอบร่วมกับลูกค้า',
            expectedConcepts: ['Single Line Diagram', 'Bill of Materials (BOM)', 'Site Acceptance Test (SAT)', 'Uninterruptible Power Supply (UPS)', 'As-Built Drawing', 'การส่งมอบ Password และคู่มือ'],
            rubricDescription: 'อธิบายผัง Single Line Diagram ชัดเจนเป็นระบบ (3 คะแนน) จำแนกรายการ BOM ได้ครบถ้วน (3 คะแนน) กำหนดเกณฑ์ตรวจรับงาน SAT ครอบคลุมคุณภาพภาพ การบันทึก และความปลอดภัย (4 คะแนน)',
            maxScore: 10,
            samplePlaceholder: '1. โครงสร้าง Single Line Diagram:\n2. รายการ BOM สำคัญ:\n3. แบบฟอร์มตรวจรับงาน (SAT Checklist 5 ข้อ):...',
        },
    ],
};

export function getUnitSubjectiveQuestions(unitId: string): SubjectiveQuestion[] {
    return UNIT_SUBJECTIVE_QUESTIONS[unitId] || UNIT_SUBJECTIVE_QUESTIONS.U01 || [];
}
