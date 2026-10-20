// cctvComponentsData.ts - ข้อมูลจำลองสเปกอุปกรณ์จริงและสถานการณ์วิศวกรรมระบบ CCTV
export interface ComponentAnatomyPart {
  id: string;
  nameTh: string;
  nameEn: string;
  functionTh: string;
  specDetails: string[];
  techImportance: string;
  icon: string;
}

export interface RealisticComponent {
  id: string;
  category: 'camera' | 'transmission' | 'storage' | 'network_vms' | 'display';
  nameTh: string;
  nameEn: string;
  modelCode: string;
  realisticBrandType: string;
  summaryTh: string;
  specs: Record<string, string>;
  anatomyParts: ComponentAnatomyPart[];
  analogVsIpComparison?: {
    analogNote: string;
    ipNote: string;
    proAdvantage: string;
  };
  proTips: string[];
}

export const REALISTIC_COMPONENTS: RealisticComponent[] = [
  // 1. อุปกรณ์รับภาพ (Cameras)
  {
    id: 'camera_bullet',
    category: 'camera',
    nameTh: 'กล้องกระบอกไอพีอัจฉริยะ (Smart 4MP Bullet IP Camera)',
    nameEn: 'Ultra-Low Light Bullet IP Camera with True WDR',
    modelCode: 'IPC-B440-WDR-PRO',
    realisticBrandType: 'Surveillance Industrial Grade',
    summaryTh: 'อุปกรณ์แปลงโฟตอนแสงผ่านเลนส์เป็นประจุไฟฟ้า แล้วแปลงเป็นแพ็กเก็ตสตรีมวิดีโอดิจิทัลความคมชัดสูงสำหรับส่งผ่านสาย LAN',
    specs: {
      'เซนเซอร์รับภาพ': '1/2.8" Progressive Scan CMOS (4.0 Megapixel 2560×1440 @ 30fps)',
      'ขนาดรูรับแสงและเลนส์': 'เลนส์ฟิกซ์ 4.0mm F1.6 (มุมมองแนวนอน 84° / DORI Identification: 10m)',
      'ความไวแสงต่ำสุด (Min. Lux)': 'Color: 0.005 Lux @ (F1.6, AGC ON), 0 Lux เมื่อเปิด Smart IR',
      'ระบบย้อนแสง': 'True WDR 120dB (Wide Dynamic Range ชัตเตอร์คู่เก็บไฮไลท์และเงาพร้อมกัน)',
      'ระบบมองกลางคืน': 'Smart IR EXIR 2.0 ระยะ 50 เมตร + หลอด Warm Light เสริม',
      'การบีบอัดข้อมูล': 'H.265+ / H.265 / H.264+ / H.264 (Triple Streams)',
      'มาตรฐานการป้องกัน': 'IP67 (กันน้ำและฝุ่น 100%) + IK10 (ป้องกันการทุบทำลาย โครงสร้างอะลูมิเนียมหล่อ)',
      'การกินพลังงาน': 'PoE (IEEE 802.3af Class 3) สูงสุด 7.5W (เปิด IR เต็มกำลัง 11.5W)',
    },
    anatomyParts: [
      {
        id: 'lens',
        nameTh: 'ชุดเลนส์ออปติคอล (Optical Glass Lens)',
        nameEn: 'Multi-coated Optical Lens 4.0mm',
        functionTh: 'รวบรวมแสงจากภายนอกและหักเหโฟกัสลงบนระนาบของเซนเซอร์ CMOS',
        specDetails: ['ทางยาวโฟกัส 4.0mm F1.6', 'เลนส์แก้วเคลือบสารลดแสงสะท้อน Multi-coating', 'มุมมอง 84°'],
        techImportance: 'เลนส์เป็นตัวกำหนดองศาการมองเห็นและระยะ DORI ถ้าเลือกผิดเบอร์ จะมองไม่เห็นป้ายทะเบียนหรือใบหน้า',
        icon: '🔍',
      },
      {
        id: 'sensor',
        nameTh: 'เซนเซอร์รับภาพ CMOS (Image Sensor)',
        nameEn: '1/2.8" Back-Illuminated CMOS Sensor',
        functionTh: 'แปลงอนุภาคแสง (Photons) เป็นประจุไฟฟ้าแอนะล็อกในแต่ละพิกเซล (Photodiode Array)',
        specDetails: ['ความละเอียด 4.0 ล้านพิกเซล', 'ขนาดพิกเซล 2.0 ไมครอน', 'เทคโนโลยี Back-Illuminated BSI'],
        techImportance: 'เซนเซอร์ขนาดใหญ่เก็บแสงในที่มืดได้ดีกว่า ลดสัญญาณรบกวน (Noise) และภาพไม่แตกเป็นเม็ดเกลือ',
        icon: '📷',
      },
      {
        id: 'isp',
        nameTh: 'หน่วยประมวลผลสัญญาณภาพ (ISP & AI SoC)',
        nameEn: 'Image Signal Processor with True WDR Engine',
        functionTh: 'แปลงสัญญาณประจุไฟฟ้าเป็นภาพสีดิจิทัล, เกลี่ยแสง WDR 120dB, ลดสัญญาณรบกวน 3D DNR และบีบอัด H.265',
        specDetails: ['ชิปประมวลผล Dual-Core AI NPU', 'True WDR Multi-Exposure 120dB', '3D Digital Noise Reduction'],
        techImportance: 'หัวใจสมองกลของกล้อง IP ถ้า ISP ช้าจะทำให้ภาพหน่วง Latency สูง หรือภาพย้อนแสงมืดดำ',
        icon: '⚡',
      },
      {
        id: 'ir_led',
        nameTh: 'ชุดหลอดอินฟราเรดอัจฉริยะ (Smart IR LED Array)',
        nameEn: '850nm EXIR Matrix IR LEDs',
        functionTh: 'เปล่งคลื่นแสงอินฟราเรดความยาวคลื่น 850nm ในความมืดสนิท เพื่อให้เซนเซอร์มองเห็นภาพในเวลากลางคืน',
        specDetails: ['ระยะส่องสว่าง 50 เมตร', 'ระบบ Smart IR ปรับความเข้มแสงอัตโนมัติป้องกันภาพหน้าคนขาวโพลน'],
        techImportance: 'เมื่อ IR ทำงานจะกินกระแสไฟเพิ่มขึ้นเกือบเท่าตัว หากคำนวณ PoE Budget ไม่พอ กล้องจะรีบูตตัวเองวนซ้ำ',
        icon: '💡',
      },
      {
        id: 'rj45_poe',
        nameTh: 'พอร์ตเครือข่ายพร้อมวงจรแยกไฟ (RJ45 PoE Interface & Transformer)',
        nameEn: '10/100M Fast Ethernet with IEEE 802.3af PoE Splitter',
        functionTh: 'รับไฟเลี้ยงกระแสตรง DC 48V จากสาย LAN แปลงเป็นไฟ DC 12V ภายใน พร้อมส่งข้อมูลแพ็กเก็ต RTSP',
        specDetails: ['พอร์ต RJ45 มาตรฐาน T568B', 'วงจร Surge Protection ป้องกันฟ้าผ่า 4kV', 'หม้อแปลง PoE Isolation'],
        techImportance: 'ลดการเดินสายไฟ 220V ไปที่ตัวกล้อง ปลอดภัยจากไฟฟ้ารั่ว และมีวงจรกันกระชากป้องกันกล้องพังจากฟ้าผ่า',
        icon: '🌐',
      },
    ],
    analogVsIpComparison: {
      analogNote: 'กล้อง Analog HD (AHD/TVI/CVI) ส่งสัญญาณไฟฟ้าความถี่สูงผ่านสาย Coaxial BNC ต้องเดินสายไฟ 12V แยกต่างหาก',
      ipNote: 'กล้อง IP มีมินิคอมพิวเตอร์ในตัว แปลงภาพเป็น TCP/IP Packets และรับไฟ PoE ผ่านสาย LAN เส้นเดียวจบ',
      proAdvantage: 'กล้อง IP รองรับการเข้ารหัสความปลอดภัย AES, แยกวิเคราะห์ AI ภายในตัวกล้อง และส่งสัญญาณได้ไกลโดยภาพไม่ดรอปความคมชัด',
    },
    proTips: [
      'อย่าส่องมุมกล้องเข้าหาหลอดไฟหรือโคมไฟหน้าร้านโดยตรง เพราะจะทำให้ม่านแสงหรี่ลงและบริเวณรอบข้างมืดมิด',
      'สำหรับภายนอกอาคาร ควรใช้กล้องทรง Bullet โครงสร้างโลหะ และติดตั้งคู่กับกล่องพักสายกันน้ำ IP66 พร้อม Cable Gland เสมอ',
    ],
  },

  // 2. อุปกรณ์ส่งสัญญาณและจ่ายไฟ (Transmission & PoE)
  {
    id: 'poe_switch',
    category: 'transmission',
    nameTh: 'สวิตช์จ่ายไฟเครือข่ายอัจฉริยะ (8-Port Gigabit PoE+ Managed Switch)',
    nameEn: '8-Port Gigabit PoE+ Switch with 120W Power Budget',
    modelCode: 'GS-108P-120W-L2',
    realisticBrandType: 'Enterprise Network Switch',
    summaryTh: 'ชุมสายกลางที่ทำหน้าที่กระจายการส่งแพ็กเก็ตข้อมูลวิดีโอระหว่างกล้องทุกตัวกับ NVR พร้อมส่งกำลังไฟฟ้า DC 48V-54V ไปเลี้ยงกล้องผ่านคู่สาย UTP',
    specs: {
      'จำนวนพอร์ต (Ports)': '8 พอร์ต 10/100/1000 Mbps PoE+ (RJ45) + 2 พอร์ต Gigabit Uplink (RJ45/SFP)',
      'มาตรฐาน PoE': 'IEEE 802.3af (PoE 15.4W) / IEEE 802.3at (PoE+ 30W ต่อพอร์ต)',
      'งบประมาณกำลังไฟรวม (Total PoE Budget)': '120 Watts (รองรับกล้อง 4MP ได้ 8 ตัวเต็มที่)',
      'แบนด์วิดท์สวิตชิ่ง (Switching Capacity)': '20 Gbps Non-blocking (Forwarding Rate: 14.88 Mpps)',
      'ฟังก์ชันโหมดสายยาว (Extend Mode)': 'รองรับการจ่ายไฟและส่งข้อมูลไกลสูงสุด 250 เมตร (ลดสปีดเป็น 10 Mbps)',
      'ระบบป้องกัน (Surge Protection)': 'ป้องกันไฟกระชากทางพอร์ตแลน 6kV ป้องกันไฟฟ้าสถิต ESD 8kV',
    },
    anatomyParts: [
      {
        id: 'poe_ports',
        nameTh: 'พอร์ต PoE RJ45 (PoE Power Injection Ports)',
        nameEn: '8x 10/100/1000 Mbps PoE+ RJ45 Ports',
        functionTh: 'ส่งข้อมูลแลนและส่งไฟเลี้ยงกระแสตรง DC 48V บนสายทองแดงคู่ที่ 1,2,3,6 หรือ 4,5,7,8',
        specDetails: ['กำลังไฟสูงสุด 30W/พอร์ต', 'LED แสดงสถานะ 2 สี (สีเขียว: ข้อมูล Link/Act, สีส้ม: จ่ายไฟ PoE Active)'],
        techImportance: 'ไฟส้มบอกว่ากล้องได้รับไฟ ถ้าไฟส้มไม่ติด แสดงว่าสายขาด ขั้วต่อหลุด หรือกล้องกินไฟเกินพิกัด',
        icon: '🔀',
      },
      {
        id: 'power_supply',
        nameTh: 'ภาคจ่ายไฟสวิตชิ่งอุตสาหกรรม (Internal Power Supply Unit)',
        nameEn: 'Heavy-Duty 130W AC-to-DC Switching Power Module',
        functionTh: 'แปลงไฟบ้าน 220V AC เป็นแรงดันคงที่ DC 52V สำหรับจ่ายเข้าวงจร PoE และ DC 3.3V เลี้ยงเมนบอร์ด',
        specDetails: ['ประสิทธิภาพการแปลง 90%', 'มีวงจรตัดไฟอัตโนมัติเมื่ออุณหภูมิสูงเกิน (Overheat Protection)'],
        techImportance: 'หัวใจความเสถียรของทั้งระบบ หากใช้สวิตช์ราคาถูกภาคจ่ายไฟจะระเบิดหรือจ่ายไฟกระเพื่อมจนกล้องดับยกแผง',
        icon: '⚡',
      },
      {
        id: 'uplink_ports',
        nameTh: 'พอร์ตอัปลิงก์ความเร็วสูง (Gigabit Uplink Ports)',
        nameEn: '2x Gigabit Uplink Ethernet & SFP Fiber Slot',
        functionTh: 'ส่งผ่านข้อมูลวิดีโอรวมจากกล้องทุกตัวไปยังเครื่องบันทึก NVR และ Core Switch ของอาคาร',
        specDetails: ['แบนด์วิดท์ 1000 Mbps Full Duplex', 'ไม่จ่ายไฟ PoE ป้องกันการส่งไฟย้อนเข้า NVR'],
        techImportance: 'ต้องใช้สาย CAT6 ทองแดงแท้ต่อเข้า NVR เสมอเพื่อป้องกันคอขวด (Bottleneck)',
        icon: '🔗',
      },
      {
        id: 'poe_controller',
        nameTh: 'ชิปควบคุมการจ่ายไฟอัจฉริยะ (PoE Power Management IC)',
        nameEn: 'Intelligent PoE Power Budget Controller',
        functionTh: 'เจรจากับกล้อง (PoE Handshake) เพื่อส่งแรงดันตรวจสอบก่อนจ่ายไฟจริง และตัดไฟเมื่อกินวัตต์เกิน',
        specDetails: ['ป้องกันการจ่ายไฟใส่อุปกรณ์ที่ไม่ใช่ PoE', 'การจัดลำดับความสำคัญของพอร์ต (Port Priority)'],
        techImportance: 'ป้องกันไฟช็อตแล็ปท็อปของช่างหากเสียบสายผิดพอร์ต เพราะมีระบบตรวจจับ IEEE Handshake ก่อนปล่อยไฟจริง',
        icon: '🧠',
      },
    ],
    analogVsIpComparison: {
      analogNote: 'ระบบ Analog ใช้ตู้ Power Supply Box 12V 10A/20A แปลงไฟแล้วเดินสายคู่กับสาย RG6 มีปัญหาไฟตกเมื่อสายยาวเกิน 40 เมตร',
      ipNote: 'ระบบ IP จ่ายไฟ DC 48V ผ่านสาย UTP CAT6 เส้นเดียว แรงดัน 48V ทำให้สูญเสียกำลังในสายน้อยมาก ส่งได้ไกลถึง 100 เมตร',
      proAdvantage: 'ประหยัดค่าแรงเดินสาย 50%, ลดความเสี่ยงไฟฟ้ารั่วลงโครงเหล็กอาคาร และสามารถสั่งรีบูตกล้องผ่านซอฟต์แวร์สวิตช์ได้ทันที',
    },
    proTips: [
      'คำนวณ PoE Power Budget เผื่อไว้ 20-30% เสมอ เช่น สวิตช์ 120W ควรใช้อุปกรณ์รวมไม่เกิน 95W เพื่อยืดอายุการใช้งาน',
      'ระยะสาย UTP CAT6 ต้องไม่เกิน 100 เมตร หากจำเป็นต้องเดินไกลกว่านั้นให้เปิดโหมด Extend (ลดความเร็วเหลือ 10Mbps) หรือใช้ Fiber Optic',
    ],
  },

  // 3. อุปกรณ์จัดเก็บข้อมูล (Storage & Harddisk)
  {
    id: 'surveillance_hdd',
    category: 'storage',
    nameTh: 'ฮาร์ดดิสก์เกรดกล้องวงจรปิด (Surveillance-Grade Hard Drive)',
    nameEn: 'Surveillance 4TB SATA HDD (24/7 AllFrame Technology)',
    modelCode: 'WD43PURZ / ST4000VX016',
    realisticBrandType: 'Specialized 24/7 Video Storage',
    summaryTh: 'สื่อบันทึกข้อมูลแบบจานแม่เหล็กที่ออกแบบโครงสร้างเชิงกลและเฟิร์มแวร์เป็นพิเศษสำหรับเขียนข้อมูลสตรีมวิดีโอต่อเนื่องตลอด 24 ชั่วโมง 365 วัน โดยไม่หยุดพัก',
    specs: {
      'ความจุ (Capacity)': '4.0 Terabytes (4,000 GB)',
      'อินเทอร์เฟซ (Interface)': 'SATA 6.0 Gb/s (NCQ Native Command Queuing)',
      'อัตราส่วนการทำงาน (Workload Profile)': 'เขียน 90% (Write) / อ่าน 10% (Read) รองรับ 180 TB/ปี',
      'รอบการหมุน (RPM & Cache)': '5,400 RPM ประหยัดไฟและเกิดความร้อนต่ำ / บัฟเฟอร์แคช 256 MB',
      'เทคโนโลยีลดเฟรมตกหล่น': 'AllFrame / ImagePerfect Firmware (ป้องกันภาพกระตุกและเฟรมหาย)',
      'อายุการใช้งาน (MTBF)': '1,000,000 ชั่วโมง (ทนความร้อนในเครื่องบันทึกได้ถึง 65°C)',
    },
    anatomyParts: [
      {
        id: 'magnetic_platters',
        nameTh: 'จานแม่เหล็กบันทึกข้อมูล (Magnetic Platters & Spindle)',
        nameEn: 'High-Density Magnetic Recording Platters',
        functionTh: 'หมุนด้วยความเร็วแม่นยำ 5,400 รอบ/นาที เก็บข้อมูลไบนารีในรูปแบบขั้วแม่เหล็กระดับจุลภาค',
        specDetails: ['ทนทานต่อการหมุนต่อเนื่อง 8,760 ชั่วโมงต่อปี', 'มอเตอร์ลดการสั่นสะเทือน (Rotational Vibration Damping)'],
        techImportance: 'จานแม่เหล็กเกรด Surveillance ถูกออกแบบให้ทนความร้อนสูงกว่าจานหมุนของคอมพิวเตอร์ทั่วไปมาก',
        icon: '💽',
      },
      {
        id: 'read_write_heads',
        nameTh: 'หัวอ่าน-เขียนแม่เหล็ก (GMR Read/Write Heads)',
        nameEn: 'Giant Magnetoresistive Heads & Voice Coil Actuator',
        functionTh: 'ลอยอยู่เหนือผิวจานแม่เหล็กในระดับนาโนเมตร ทำหน้าที่เหนี่ยวนำแม่เหล็กเพื่อบันทึกสตรีมวิดีโอ 16-32 ช่องพร้อมกัน',
        specDetails: ['รองรับสตรีมภาพความคมชัดสูงพร้อมกัน 64 ช่อง', 'กลไกโหลดหัวอ่านลดการสึกหรอเมื่อเปิด-ปิดเครื่อง'],
        techImportance: 'หากใช้ Desktop HDD ทั่วไป หัวอ่านจะสึกหรอพังภายใน 3-6 เดือนเพราะไม่ได้ออกแบบมารับการเขียนตลอด 24 ชม.',
        icon: '🎯',
      },
      {
        id: 'surveillance_firmware',
        nameTh: 'เฟิร์มแวร์เฉพาะทางด้านสตรีมวิดีโอ (Surveillance ATA Streaming Firmware)',
        nameEn: 'AllFrame AI / ImagePerfect ATA Streaming Engine',
        functionTh: 'จัดลำดับคำสั่งแบบ ATA Streaming ไม่หยุดรอการแก้ไขข้อผิดพลาดแบบเดิม (Skip Error Retry) เพื่อป้องกันเฟรมภาพหลุด',
        specDetails: ['ลดการสูญเสียเฟรมภาพ (Zero Frame Loss)', 'จัดสมดุลการเขียนสตรีมกล้องหลายตัวพร้อมกัน'],
        techImportance: 'ในงาน CCTV ภาพสดต้องไหลลื่นต่อเนื่อง หากเกิดข้อผิดพลาดเล็กน้อย เฟิร์มแวร์จะเขียนต่อทันทีไม่หยุดชะงัก',
        icon: '🧠',
      },
    ],
    analogVsIpComparison: {
      analogNote: 'เครื่อง DVR ในระบบแอนะล็อกก็ต้องใช้ฮาร์ดดิสก์เกรด Surveillance เช่นเดียวกัน เพื่อความทนทาน 24/7',
      ipNote: 'ระบบ NVR รับสตรีมที่ผ่านการบีบอัด H.265 มาแล้ว ทำให้ฮาร์ดดิสก์ 4TB บันทึกกล้อง 4MP 4 ตัวได้นานกว่า 30 วัน',
      proAdvantage: 'การเลือกฮาร์ดดิสก์เฉพาะทางช่วยป้องกันหลักฐานสำคัญสูญหายในวันที่เกิดเหตุการณ์อาชญากรรม',
    },
    proTips: [
      'ห้ามนำ Desktop PC HDD (เช่น WD Blue หรือ Seagate Barracuda) มาใส่ใน NVR เด็ดขาด เพราะออกแบบมาทำงานแค่วันละ 8 ชม. จะพังเร็วมาก',
      'คำนวณขนาดความจุ HDD: กล้อง 4MP บีบอัด H.265 ใช้บิตเรต ~4 Mbps/กล้อง บันทึก 24 ชม. 4 ตัว ใช้พื้นที่ประมาณ 170 GB ต่อวัน',
    ],
  },

  // 4. อุปกรณ์ควบคุมและบันทึกภาพ (NVR & VMS Management)
  {
    id: 'nvr_recorder',
    category: 'network_vms',
    nameTh: 'เครื่องบันทึกวิดีโอเครือข่ายอัจฉริยะ (16-Channel 4K NVR with AI Analytics)',
    nameEn: '16-Ch Embedded 4K Network Video Recorder',
    modelCode: 'NVR-8816-4K-AI',
    realisticBrandType: 'Enterprise Security Recorder',
    summaryTh: 'ศูนย์กลางการจัดการระบบเครือข่ายกล้องวงจรปิด ทำหน้าที่ดึงสตรีม RTSP จากกล้อง IP มาประมวลผล AI แยกประเภทบุคคล/ยานพาหนะ บันทึกลง HDD และส่งสัญญาณภาพออกจอภาพ',
    specs: {
      'จำนวนช่องสัญญาณ (Channels)': '16 ช่องกล้อง IP (รองรับความละเอียดสูงสุด 12MP ต่อช่อง)',
      'แบนด์วิดท์ขาเข้า (Incoming Bandwidth)': '160 Mbps (ขาออก Outgoing: 160 Mbps)',
      'ช่องเชื่อมต่อฮาร์ดดิสก์ (SATA Bays)': '2 SATA Interfaces (รองรับความจุสูงสุด 10TB ต่อลูก รวม 20TB)',
      'พอร์ตแสดงผล (Video Output)': '1x HDMI (4K 3840×2160 @ 30Hz), 1x VGA (1080p Full HD)',
      'การถอดรหัสภาพ (Decoding Capacity)': '2 ช่อง @ 12MP (30fps) หรือ 8 ช่อง @ 4MP (30fps) หรือ 16 ช่อง @ 1080p',
      'ฟังก์ชันอัจฉริยะ (AI Analytics)': 'ตรวจจับใบหน้า, จำแนกคน/รถยนต์ (AcuSense), วาดเส้นข้ามเขต (Tripwire), ค้นหาป้ายทะเบียน',
    },
    anatomyParts: [
      {
        id: 'nvr_cpu_npu',
        nameTh: 'ชิปเซ็ตประมวลผลหลักและปัญญาประดิษฐ์ (Quad-Core SoC + AI NPU)',
        nameEn: 'High-Performance Surveillance Processor with Neural Engine',
        functionTh: 'ประมวลผลระบบปฏิบัติการ Linux Embedded, ถอดรหัสวิดีโอ H.265+, และรันโมเดล Deep Learning แยกแยะคนและยานพาหนะ',
        specDetails: ['ชิปเซ็ต ARM Cortex-A55 Quad-Core', 'AI Processing Unit 2.0 TOPS', 'ระบบปฏิบัติการ RTOS Linux นิรภัย'],
        techImportance: 'NVR มีระบบความปลอดภัยสูงกว่าคอมพิวเตอร์ทั่วไป ไม่ติดไวรัส และบูตระบบขึ้นมาทำงานอัตโนมัติเมื่อไฟดับแล้วติดใหม่',
        icon: '🖥️',
      },
      {
        id: 'sata_controller',
        nameTh: 'ช่องเชื่อมต่อและควบคุมฮาร์ดดิสก์ (Dual SATA Controllers & Power)',
        nameEn: 'Direct SATA III Storage Controller Bus',
        functionTh: 'รับ-ส่งข้อมูลระหว่างชิปประมวลผลกับฮาร์ดดิสก์ Surveillance ความเร็วสูง 6 Gbps',
        specDetails: ['รองรับระบบ RAID 0/1 (ในรุ่น Enterprise)', 'มีวงจรตัดไฟป้องกันไฟกระชาก HDD'],
        techImportance: 'ต้องขันน็อตยึดฮาร์ดดิสก์ให้แน่นกับฐานเคสทั้ง 4 ตัวเพื่อลดแรงสั่นสะเทือน ไม่ให้เกิด Bad Sector',
        icon: '💾',
      },
      {
        id: 'hdmi_display_chip',
        nameTh: 'ชิปประมวลผลส่งสัญญาณภาพ 4K (4K Ultra HD Display Output Chip)',
        nameEn: 'HDMI 2.0 4K Hardware Display Controller',
        functionTh: 'แปลงสตรีมวิดีโอดิจิทัลจากแรม เป็นสัญญาณภาพ HDMI 4K ส่งตรงไปยังจอมอนิเตอร์ตรวจการณ์',
        specDetails: ['ความละเอียด 3840×2160 @ 30Hz', 'รองรับการแบ่งหน้าจอ 1/4/8/9/16 ช่องพร้อมกัน'],
        techImportance: 'ให้ภาพสด Live View คมชัดระดับ 4K โดยไม่มีอาการภาพกระตุกหรือดีเลย์',
        icon: '📺',
      },
    ],
    analogVsIpComparison: {
      analogNote: 'เครื่องบันทึก DVR (Digital Video Recorder) ต้องมีชิป ADC แปลงสัญญาณแอนะล็อกคลื่นไฟฟ้าจากสาย RG6 มาเป็นดิจิทัลในเครื่อง',
      ipNote: 'เครื่อง NVR ไม่ต้องแปลงสัญญาณใดๆ เพราะกล้อง IP แปลงและบีบอัดมาแล้ว NVR เพียงแค่จัดเก็บและจัดเส้นทางข้อมูล (Packet Router)',
      proAdvantage: 'NVR ไม่จำเป็นต้องตั้งอยู่ใกล้กล้อง สามารถติดตั้งไว้ในตู้ Rack ศูนย์ Data Center หรืออีกตึกหนึ่งได้ผ่านระบบเครือข่ายแลน',
    },
    proTips: [
      'ตั้งรหัสผ่าน NVR ให้มีความปลอดภัยสูง (ตัวพิมพ์ใหญ่ เล็ก ตัวเลข อักขระพิเศษ) และเปลี่ยนรหัสผ่านทันทีหลังติดตั้งเสร็จ',
      'เปิดฟังก์ชัน Privacy Masking ในเมนู NVR ทันทีเพื่อปิดบังพื้นที่ส่วนบุคคลตามข้อกำหนดกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
    ],
  },

  // 5. อุปกรณ์แสดงผลและซอฟต์แวร์จัดการ (Display & Monitoring)
  {
    id: 'display_monitor',
    category: 'display',
    nameTh: 'จอมอนิเตอร์สำหรับศูนย์รักษาความปลอดภัย 24/7 (32" Surveillance CCTV Monitor)',
    nameEn: '32-inch 4K Industrial 24/7 Surveillance Monitor',
    modelCode: 'MON-324K-CCTV-PRO',
    realisticBrandType: 'Professional Commercial Grade',
    summaryTh: 'จอภาพแสดงผลที่ออกแบบแผงพาเนล (Panel) และวงจรอิเล็กทรอนิกส์สำหรับเปิดแสดงภาพนิ่งและภาพสดต่อเนื่องตลอด 24 ชั่วโมง โดยไม่มีปัญหาภาพเบิร์น (Anti-Burn-in) และสีไม่เพี้ยน',
    specs: {
      'ขนาดหน้าจอและความละเอียด': '32 นิ้ว 4K Ultra HD (3840×2160 พิกเซล, อัตราส่วน 16:9)',
      'ประเภทพาเนลหน้าจอ': 'IPS Commercial Panel (มุมมองกว้าง 178°/178° ทั้งแนวตั้งและแนวนอน)',
      'ความสว่างและคอนทราสต์': 'ความสว่าง 350 cd/m², คอนทราสต์เรโช 1000:1 (เห็นรายละเอียดในที่มืดชัดเจน)',
      'การทำงานต่อเนื่อง': 'รับประกันการเปิดทำงานต่อเนื่อง 24/7 (50,000 ชั่วโมง)',
      'เทคโนโลยีถนอมพาเนล': 'Anti-Image Retention / Pixel Shift ป้องกันอาการหน้าจอไหม้ค้าง (Burn-in)',
      'พอร์ตเชื่อมต่อ': '2x HDMI 2.0, 1x DisplayPort, 1x VGA, ช่องต่อเสียง Audio In/Out',
    },
    anatomyParts: [
      {
        id: 'commercial_panel',
        nameTh: 'พาเนลหน้าจอเกรดคอมเมอร์เชียล (Commercial Grade IPS Panel)',
        nameEn: 'Anti-Burn-in Commercial LCD Panel',
        functionTh: 'แสดงผลเม็ดสีพิกเซล 8.3 ล้านพิกเซลอย่างคมชัด ทนต่อความร้อนจากการเปิดทั้งวันทั้งคืน',
        specDetails: ['เทคโนโลยี Pixel Shift ขยับพิกเซลเล็กน้อยอัตโนมัติ', 'มุมมองกว้าง 178 องศา รปภ. มองจากด้านข้างภาพไม่มืด'],
        techImportance: 'หากใช้ทีวีบ้านธรรมดามาเปิดภาพ CCTV หน้าจอจะเกิดรอยไหม้ค้าง (Burn-in) บริเวณตัวเลขเวลาและตารางช่องกล้องภายใน 6 เดือน',
        icon: '🖥️',
      },
      {
        id: 'hdmi_input_board',
        nameTh: 'บอร์ดประมวลผลอินพุตและตัวกรองสัญญาณ (Surveillance Display Controller Board)',
        nameEn: '4K 60Hz Low-Latency Video Controller',
        functionTh: 'รับสัญญาณ HDMI จาก NVR แสดงผลภาพสดแบบเรียลไทม์ ดีเลย์ต่ำกว่า 5 มิลลิวินาที',
        specDetails: ['วงจรระบายความร้อนโลหะ', 'ระบบ Auto Power Recovery เปิดเครื่องอัตโนมัติเมื่อไฟดับแล้วติดใหม่'],
        techImportance: 'ทำให้ระบบกลับมาแสดงผลภาพสดได้ทันทีเมื่อระบบไฟฟ้าสำรอง UPS ทำงาน',
        icon: '📺',
      },
    ],
    analogVsIpComparison: {
      analogNote: 'เชื่อมต่อตรงกับพอร์ต HDMI หรือ BNC Out ของเครื่อง DVR',
      ipNote: 'สามารถต่อตรงจาก HDMI ของ NVR หรือติดตั้งโปรแกรม VMS (เช่น iVMS-4200) บนคอมพิวเตอร์เพื่อดูภาพผ่านแลนได้ทุกที่',
      proAdvantage: 'ระบบ IP ให้ความยืดหยุ่นสูง เจ้าหน้าที่ รปภ. ดูภาพสดจากจอหลัก ส่วนผู้บริหารสามารถดูภาพผ่านแท็บเล็ตหรือมือถือพร้อมกันได้',
    },
    proTips: [
      'อย่าตั้งจอมอนิเตอร์ในมุมที่คนภายนอกหรือผู้มาติดต่อสามารถมองเห็นภาพได้ชัดเจน เพื่อปฏิบัติตามมาตรฐาน PDPA',
      'ควรตั้งเวลาในเครื่อง NVR ให้ตรงกับ NTP Server (เช่น time.navy.mi.th) เพื่อให้เวลาบนจอแสดงผลตรงตามเวลามาตรฐานสากล ใช้เป็นหลักฐานทางกฎหมายได้',
    ],
  },
];

// ชุดสถานการณ์แก้ปัญหาหน้างานจริง (Diagnostic Troubleshooting Tickets)
export interface DiagnosticScenario {
  id: string;
  ticketNo: string;
  titleTh: string;
  urgency: 'critical' | 'high' | 'medium';
  reporter: string;
  location: string;
  symptomTh: string;
  techEvidence: {
    multimeterPoE: string;
    pingStatus: string;
    nvrStatus: string;
    physicalCheck: string;
  };
  options: {
    id: string;
    causeTh: string;
    actionTh: string;
    isCorrect: boolean;
    explanationTh: string;
  }[];
}

export const DIAGNOSTIC_SCENARIOS: DiagnosticScenario[] = [
  {
    id: 'case_poe_overload',
    ticketNo: 'TICK-101-01',
    titleTh: 'กล้องดับและรีบูตตัวเองวนซ้ำทุกคืนเมื่อฟ้าเริ่มมืด',
    urgency: 'critical',
    reporter: 'หัวหน้าเวร รปภ. ประจำป้อมยาม',
    location: 'ลานจอดรถและแนวรั้วด้านนอกวิทยาลัย',
    symptomTh: 'ช่วงเวลากลางวันกล้อง 8 ตัวใช้งานได้คมชัดปกติ แต่พอเวลา 18:30 น. ท้องฟ้ามืด กล้องตัวที่ 7 และ 8 จะภาพดับ ไฟพอร์ตสวิตช์กระพริบสีส้มสลับดับ และกล้องติดๆ ดับๆ ตลอดทั้งคืน',
    techEvidence: {
      multimeterPoE: 'กำลังไฟรวมสวิตช์พุ่งสูงแตะ 63W / 65W Max Budget',
      pingStatus: 'Ping 192.168.1.107 Request Timed Out เป็นช่วงๆ',
      nvrStatus: 'NVR Log แจ้งเตือน: Video Loss on Ch 07, Ch 08',
      physicalCheck: 'สวิตช์ PoE 8-Port มีพิกัดกำลังรวม 65W กล้องแต่ละตัวมี Smart IR LED 50m',
    },
    options: [
      {
        id: 'opt_1',
        causeTh: 'เกิดจากสาย LAN โดนหนูกัดขาดช่วงเวลากลางคืน',
        actionTh: 'เดินสาย UTP CAT6 ใหม่ทั้ง 8 เส้น',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง หากสายขาดภาพจะดับตลอดเวลา ไม่ใช่ดับเฉพาะตอนกลางคืนเมื่อฟ้ามืด',
      },
      {
        id: 'opt_2',
        causeTh: 'PoE Power Budget ของสวิตช์ไม่เพียงพอเมื่อหลอดอินฟราเรด (IR) เปิดทำงาน',
        actionTh: 'เปลี่ยนสวิตช์ PoE เป็นรุ่น 120W หรือติด PoE Injector จ่ายไฟเสริมให้กล้องตัวที่ 7-8',
        isCorrect: true,
        explanationTh: 'ถูกต้องที่สุด! กลางวันกล้องกินไฟตัวละ 4W (รวม 32W) แต่เมื่อกลางคืน IR LED เปิดทำงาน กล้องจะกินไฟเพิ่มเป็นตัวละ 10W (รวม 80W) ทำให้เกินพิกัดสวิตช์ 65W วงจร Overload จึงตัดไฟกล้องตัวท้ายสุด',
      },
      {
        id: 'opt_3',
        causeTh: 'เซนเซอร์รับภาพ CMOS เสื่อมสภาพเมื่อสัมผัสอากาศเย็น',
        actionTh: 'ถอดกล้องมาเป่าลมร้อนและทาซิลิโคนระบายความร้อน',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง อุณหภูมิกลางคืนในไทยไม่ได้ทำให้ CMOS เสียหาย อาการตัดไฟชัดเจนว่าเป็นปัญหาด้านพลังงาน PoE',
      },
    ],
  },
  {
    id: 'case_backlight_wdr',
    ticketNo: 'TICK-101-02',
    titleTh: 'ภาพย้อนแสงขาวโพลน มองไม่เห็นใบหน้าและป้ายทะเบียนรถที่ซุ้มประตู',
    urgency: 'high',
    reporter: 'อาจารย์ฝ่ายปกครอง / งานความปลอดภัย',
    location: 'ซุ้มประตูทางเข้าหลัก วิทยาลัยเทคนิคอุบลราชธานี',
    symptomTh: 'ช่วงเช้า 07:30 - 09:30 น. แสงแดดส่องย้อนเข้าหากล้องตรงๆ ภาพรถยนต์และนักเรียนที่เดินผ่านประตูเป็นเงามืดทึบ (Silhouette) ส่วนฉากหลังถนนขาวโพลน มองไม่เห็นป้ายทะเบียน',
    techEvidence: {
      multimeterPoE: 'PoE 48V ปกติ / สวิตช์ทำงานสมบูรณ์',
      pingStatus: 'Ping 192.168.1.101 < 1ms ปกติ',
      nvrStatus: 'แสดงภาพสดได้ต่อเนื่อง แต่ Dynamic Range ในภาพต่างกันมากเกิน 80dB',
      physicalCheck: 'กล้องรองรับ True WDR 120dB แต่ในการตั้งค่ากล้องเมนู WDR ยังถูกตั้งค่าเป็น "OFF"',
    },
    options: [
      {
        id: 'opt_1',
        causeTh: 'ยังไม่ได้เปิดใช้งานฟังก์ชัน True WDR (Wide Dynamic Range 120dB) ในระบบกล้อง',
        actionTh: 'ล็อกอินเข้าสู่ Web GUI ของกล้อง เปิดโหมด True WDR และปรับระดับเป็น 60-80 เพื่อเกลี่ยแสงส่วนสว่างและมืด',
        isCorrect: true,
        explanationTh: 'ถูกต้องที่สุด! True WDR จะใช้ชัตเตอร์คู่จับภาพ 2 เฟรม (เฟรมสว่างสำหรับส่วนมืด + เฟรมมืดสำหรับส่วนสว่างจ้า) แล้วผสานเข้าด้วยกัน ทำให้มองเห็นใบหน้าคนและป้ายทะเบียนได้ชัดเจนแม้แดดย้อนแรง',
      },
      {
        id: 'opt_2',
        causeTh: 'เลนส์กล้องมัว มีฝุ่นเกาะหนาแน่น',
        actionTh: 'ใช้กระดาษทรายขัดกระจกหน้าเลนส์ให้ใสขึ้น',
        isCorrect: false,
        explanationTh: 'ห้ามใช้กระดาษทรายขัดหน้าเลนส์เด็ดขาด เพราะจะทำให้ฟิล์มเคลือบหน้าเลนส์เป็นรอยเสียหายถาวร',
      },
      {
        id: 'opt_3',
        causeTh: 'ต้องเปลี่ยนกล้องเป็นเลนส์ 2.8mm เพื่อรับแสงมุมกว้างขึ้น',
        actionTh: 'เปลี่ยนกล้องเป็นเลนส์มุมกว้างกว่าเดิม',
        isCorrect: false,
        explanationTh: 'การเปลี่ยนเลนส์มุมกว้างขึ้นไม่ได้แก้ปัญหาความเปรียบต่างแสงย้อน และจะยิ่งทำให้ภาพป้ายทะเบียนเล็กลงจนมองไม่ออก',
      },
    ],
  },
  {
    id: 'case_wrong_hdd',
    ticketNo: 'TICK-101-03',
    titleTh: 'เครื่องบันทึก NVR ส่งเสียง Beep ร้องเตือน และบันทึกย้อนหลังได้เพียง 3 วัน',
    urgency: 'critical',
    reporter: 'เจ้าหน้าที่ศูนย์คอมพิวเตอร์และเครือข่าย',
    location: 'ห้องแม่ข่าย Server Room อาคารวิทยบริการ',
    symptomTh: 'มีสัญญาณเสียงเตือนบี๊บดังเป็นจังหวะจากตู้ Rack เมื่อเข้าดูภาพย้อนหลัง (Playback) พบว่ามีข้อมูลบันทึกย้อนหลังได้เพียง 3 วัน ทั้งที่ติดตั้งฮาร์ดดิสก์ขนาด 4TB',
    techEvidence: {
      multimeterPoE: 'ระบบไฟฟ้าและสำรองไฟ UPS ปกติ',
      pingStatus: 'เชื่อมต่อเครือข่ายได้ปกติ',
      nvrStatus: 'HDD S.M.A.R.T. แจ้งเตือน: Bad Sector Count High / Status: Error',
      physicalCheck: 'เปิดฝาเครื่อง NVR ตรวจพบว่าเป็นฮาร์ดดิสก์ Desktop PC (WD Blue 5400RPM) และตั้งค่า Codec เป็น H.264',
    },
    options: [
      {
        id: 'opt_1',
        causeTh: 'นำ Desktop PC HDD มาใช้แทน Surveillance HDD และไม่ได้เปิดใช้ Codec H.265+',
        actionTh: 'เปลี่ยนฮาร์ดดิสก์เป็นรุ่น Surveillance 24/7 (WD Purple / Seagate SkyHawk) พร้อมเปิดการบีบอัด H.265+',
        isCorrect: true,
        explanationTh: 'ถูกต้องที่สุด! Desktop HDD ออกแบบมาสำหรับการทำงานวันละ 8 ชม. เมื่อถูก NVR เขียนข้อมูลตลอด 24 ชม. จึงเกิด Bad Sector พังภายในไม่กี่เดือน และการเปิด H.265+ จะช่วยลดการใช้พื้นที่ลงได้ถึง 70% ทำให้บันทึกได้ยาวนานกว่า 30 วัน',
      },
      {
        id: 'opt_2',
        causeTh: 'สายไฟ AC เสียบไม่แน่น ทำให้ไฟตก',
        actionTh: 'ใช้เทปพันสายไฟรัดปลั๊กไฟให้แน่นขึ้น',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง อาการเสียงบี๊บและ Bad Sector เป็นสัญญาณเตือนความเสียหายของตัวไดรฟ์ฮาร์ดดิสก์โดยตรง',
      },
      {
        id: 'opt_3',
        causeTh: 'พัดลมระบายความร้อนหมุนช้าเกินไป',
        actionTh: 'ถอดฝาครอบ NVR ออกแล้วเอาพัดลมตั้งโต๊ะมาเป่า',
        isCorrect: false,
        explanationTh: 'ไม่ใช่วิธีแก้ปัญหามาตรฐานทางวิศวกรรม ฝาครอบเครื่องบันทึกช่วยนำทิศทางลมระบายความร้อน การเปิดฝาจะทำให้ฝุ่นเข้าไปเกาะแผงวงจร',
      },
    ],
  },
  {
    id: 'case_distance_limit',
    ticketNo: 'TICK-101-04',
    titleTh: 'กล้องโรงฝึกงานช่างยนต์ระยะ 125 เมตร ภาพกระตุก สตรีมหลุดบ่อย',
    urgency: 'high',
    reporter: 'อาจารย์หัวหน้าแผนกช่างยนต์',
    location: 'โรงฝึกงานอาคาร 5 แผนกช่างยนต์',
    symptomTh: 'กล้องที่ติดบนเสาไฟท้ายโรงฝึกงานมีอาการภาพค้าง (Freeze) สตรีมหลุดทุก 2-3 นาที บิตเรตตกเหลือไม่ถึง 500 Kbps เมื่อวัดความยาวสายตามแนวท่อพบว่ามีความยาว 125 เมตร',
    techEvidence: {
      multimeterPoE: 'วัดแรงดันปลายสาย UTP ได้เพียง 38V DC (ไฟตกจากต้นทาง 48V)',
      pingStatus: 'Ping 192.168.1.105 Packet Loss สูงถึง 35%',
      nvrStatus: 'Bitrate Fluctuating / RTSP Timeout',
      physicalCheck: 'สาย UTP CAT6 เดินเส้นเดียวยาว 125 เมตร โดยไม่มีอุปกรณ์ทวนสัญญาณ',
    },
    options: [
      {
        id: 'opt_1',
        causeTh: 'ระยะสายสัญญาณ UTP CAT6 เกินมาตรฐาน 100 เมตร ทำให้สัญญาณลดทอนและไฟตก',
        actionTh: 'ติดตั้ง PoE Extender ทวนสัญญาณที่ระยะ 80 เมตร หรือแปลงเป็นคู่สาย Fiber Optic + Media Converter',
        isCorrect: true,
        explanationTh: 'ถูกต้องที่สุด! มาตรฐาน TIA/EIA-568 กำหนดระยะสาย UTP สูงสุดไม่เกิน 100 เมตร (Channel Link) หากเกิน สัญญาณดิจิทัลจะสูญเสีย (Attenuation) และเกิดแรงดันไฟตก (Voltage Drop) ทำให้กล้องรันไม่เสถียร',
      },
      {
        id: 'opt_2',
        causeTh: 'เครื่องจักรในโรงงานปล่อยรังสีแม่เหล็กดูดสายแลน',
        actionTh: 'เอาแผ่นอะลูมิเนียมฟอยล์มาห่อสายแลนตลอดแนว',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง ถึงแม้จะมีสัญญาณรบกวน แต่สาเหตุหลักคือระยะทาง 125 เมตร ซึ่งขัดกับมาตรฐานทางฟิสิกส์ของสาย UTP',
      },
      {
        id: 'opt_3',
        causeTh: 'หัวต่อ RJ45 ฝุ่นเกาะ',
        actionTh: 'เป่าลมหัว RJ45 แล้วเสียบใหม่',
        isCorrect: false,
        explanationTh: 'ไม่สามารถแก้ปัญหาได้ เนื่องจากระยะสายเกินขีดจำกัด 100 เมตร',
      },
    ],
  },
  {
    id: 'case_ip_conflict',
    ticketNo: 'TICK-101-05',
    titleTh: 'จอมอนิเตอร์ขึ้น "No Video" หน้าจอดำ แต่ไฟ LED สวิตช์ PoE สีส้มและเขียวติดปกติ',
    urgency: 'high',
    reporter: 'เจ้าหน้าที่งานอาคารสถานที่',
    location: 'ห้องประชุมชั้น 3 อาคารอำนวยการ',
    symptomTh: 'ติดตั้งกล้องใหม่ 2 ตัว เสียบสายเข้ากับ PoE Switch พบว่าไฟเขียว (Link) และไฟส้ม (PoE) ติดสว่างสมบูรณ์ แต่ที่หน้าจอ NVR ทั้งสองช่องขึ้นว่า "IP Conflict" หรือ "Device Offline"',
    techEvidence: {
      multimeterPoE: 'ไฟเลี้ยง PoE 48V ปกติ',
      pingStatus: 'Ping 192.168.1.64 มีการตอบกลับแบบสลับไปมา (Duplicate IP Reply)',
      nvrStatus: 'กล้องแสดงภาพสลับกันกระพริบ',
      physicalCheck: 'ช่างนำกล้องใหม่แกะกล่อง 2 ตัวมาเสียบโดยไม่ได้เปลี่ยนหมายเลข IP Address เริ่มต้น (Default IP: 192.168.1.64 ทั้งคู่)',
    },
    options: [
      {
        id: 'opt_1',
        causeTh: 'หมายเลข IP Address ชนกัน (IP Conflict: 192.168.1.64) เนื่องจากเป็น Default IP จากโรงงาน',
        actionTh: 'ใช้แล็ปท็อปเปิดโปรแกรม SADP Tool หรือ Config Tool เปลี่ยน IP กล้องแต่ละตัวให้ไม่ซ้ำกัน (เช่น .65 และ .66)',
        isCorrect: true,
        explanationTh: 'ถูกต้องที่สุด! กล้อง IP แกะกล่องจะมีหมายเลข IP เริ่มต้นตรงกันจากโรงงาน หากเสียบพร้อมกันจะชนกันบนระบบเครือข่าย ช่างต้องตั้งค่า IP แยกทีละตัวก่อนเชื่อมต่อเข้า NVR',
      },
      {
        id: 'opt_2',
        causeTh: 'จอมอนิเตอร์เสียบพอร์ต HDMI ผิดช่อง',
        actionTh: 'ย้ายสาย HDMI ไปเสียบช่อง HDMI 2',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง ถ้าจอมีปัญหาจะมองไม่เห็นภาพทุกกล้อง แต่นี่จอแสดงผลได้และฟ้องข้อความ IP Conflict',
      },
      {
        id: 'opt_3',
        causeTh: 'เซนเซอร์รับภาพกลับด้าน',
        actionTh: 'หมุนกล้องกลับหัว 180 องศา',
        isCorrect: false,
        explanationTh: 'ไม่ถูกต้อง ไม่เกี่ยวข้องกับอาการไอพีชนกันบนเครือข่าย',
      },
    ],
  },
];

// ชุดข้อสอบประเมินผล 10 ข้อ (Mastery Assessment Quiz)
export interface QuizQuestion {
  id: string;
  questionTh: string;
  optionsTh: string[];
  correctIndex: number;
  explanationTh: string;
  category: 'camera' | 'transmission' | 'storage' | 'recorder' | 'display';
}

export const MASTERY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'camera',
    questionTh: 'ระบบ True WDR (120dB) ในตัวกล้องวงจรปิดมีประโยชน์หลักในการแก้ปัญหาภาพลักษณะใด?',
    optionsTh: [
      'แก้ปัญหาภาพมืดสนิทในเวลากลางคืนโดยไม่ต้องใช้หลอดไฟ',
      'แก้ปัญหาสภาพแวดล้อมที่ภาพย้อนแสงจ้า ให้มองเห็นรายละเอียดทั้งในส่วนสว่างและส่วนเงามืดพร้อมกัน',
      'เพิ่มความเร็วรอบการหมุนส่ายของกล้อง Speed Dome PTZ',
      'ช่วยให้กล้องซูมภาพได้ไกลขึ้น 10 เท่าโดยภาพไม่แตก',
    ],
    correctIndex: 1,
    explanationTh: 'True WDR 120dB ใช้ชัตเตอร์เก็บภาพหลายระดับความสว่างในเวลาเดียวกัน แล้วผสานเป็นภาพเดียว ทำให้บริเวณย้อนแสงไม่ขาวโพลน และบริเวณใต้ร่มเงาไม่มืดดำ',
  },
  {
    id: 'q2',
    category: 'transmission',
    questionTh: 'มาตรฐานการจ่ายไฟผ่านสายแลน IEEE 802.3at (PoE+) สามารถจ่ายกำลังไฟฟ้าสูงสุดที่พอร์ตต้นทางได้กี่วัตต์?',
    optionsTh: [
      '15.4 วัตต์',
      '30.0 วัตต์',
      '60.0 วัตต์',
      '100.0 วัตต์',
    ],
    correctIndex: 1,
    explanationTh: 'IEEE 802.3af (PoE) จ่ายได้สูงสุด 15.4W ส่วน IEEE 802.3at (PoE+) จ่ายได้สูงสุด 30.0W เหมาะสำหรับกล้อง PTZ หรือกล้องที่มีหลอด IR กำลังสูง',
  },
  {
    id: 'q3',
    category: 'storage',
    questionTh: 'เพราะเหตุใดจึง "ห้าม" นำฮาร์ดดิสก์สำหรับเครื่องคอมพิวเตอร์ทั่วไป (Desktop PC HDD) มาใส่ในเครื่องบันทึก NVR?',
    optionsTh: [
      'เพราะสาย SATA ของ NVR เสียบกับ Desktop HDD ไม่ได้',
      'เพราะ Desktop HDD บันทึกไฟล์วิดีโอไม่ได้ บันทึกได้เฉพาะไฟล์ Word/Excel',
      'เพราะ Desktop HDD ออกแบบมารับงานเพียง 8 ชม./วัน ไม่ทนทานต่อการเขียนข้อมูลตลอด 24/7 ทำให้เกิด Bad Sector และพังเร็ว',
      'เพราะ Desktop HDD ใช้แรงดันไฟฟ้า 220V สภาพเครื่อง NVR จ่ายไฟไม่พอ',
    ],
    correctIndex: 2,
    explanationTh: 'Surveillance HDD (เช่น WD Purple / Seagate SkyHawk) มีเฟิร์มแวร์ AllFrame และโครงสร้างตลับลูกปืนที่ทนทานต่อการเขียนข้อมูล 24/7/365 ตลอดอายุการใช้งาน',
  },
  {
    id: 'q4',
    category: 'transmission',
    questionTh: 'ตามมาตรฐานสากล ANSI/TIA-568 ระยะทางสูงสุดของสายสัญญาณ UTP CAT6 จากสวิตช์ PoE ไปยังตัวกล้อง IP โดยไม่ใช้อุปกรณ์ทวนสัญญาณต้องไม่เกินเท่าใด?',
    optionsTh: [
      '50 เมตร',
      '80 เมตร',
      '100 เมตร',
      '150 เมตร',
    ],
    correctIndex: 2,
    explanationTh: 'ระยะทางมาตรฐานสูงสุดของช่องสัญญาณ UTP (Channel Link) คือ 100 เมตร หากเกินกว่านี้สัญญาณข้อมูลจะลดทอนและเกิดแรงดันไฟตก',
  },
  {
    id: 'q5',
    category: 'camera',
    questionTh: 'เลนส์ขนาดทางยาวโฟกัสใด ให้มุมมองภาพที่กว้างที่สุด เหมาะสำหรับติดตั้งภายในลิฟต์หรือห้องขนาดเล็ก?',
    optionsTh: [
      'เลนส์ 2.8 มิลลิเมตร (มุมมอง ~103°)',
      'เลนส์ 4.0 มิลลิเมตร (มุมมอง ~84°)',
      'เลนส์ 6.0 มิลลิเมตร (มุมมอง ~52°)',
      'เลนส์ 12.0 มิลลิเมตร (มุมมอง ~24°)',
    ],
    correctIndex: 0,
    explanationTh: 'ตัวเลขทางยาวโฟกัส (mm) ยิ่งน้อย มุมมองภาพยิ่งกว้าง (Wide Angle) เลนส์ 2.8mm ให้มุมมองกว้างถึง 103° เหมาะกับพื้นที่แคบที่ต้องการครอบคลุมทั้งห้อง',
  },
  {
    id: 'q6',
    category: 'recorder',
    questionTh: 'เทคโนโลยีการบีบอัดวิดีโอ H.265+ (Smart Codec) มีจุดเด่นเหนือกว่า H.264 แบบเดิมอย่างไร?',
    optionsTh: [
      'ช่วยให้ภาพเปลี่ยนเป็นภาพ 3 มิติเสมือนจริง',
      'ประหยัดพื้นที่จัดเก็บบนฮาร์ดดิสก์และลดการใช้แบนด์วิดท์เครือข่ายได้มากถึง 70-80%',
      'ทำให้กล้องสามารถมองทะลุกำแพงได้',
      'ทำให้ไม่ต้องใช้สายแลนในการเชื่อมต่อ',
    ],
    correctIndex: 1,
    explanationTh: 'H.265+ วิเคราะห์และส่งเฉพาะพิกเซลที่มีการเคลื่อนไหว (Moving Objects) ส่วนฉากหลังคงที่ (Background) จะไม่ส่งซ้ำซ้อน ทำให้ประหยัดพื้นที่จัดเก็บและแบนด์วิดท์อย่างมหาศาล',
  },
  {
    id: 'q7',
    category: 'display',
    questionTh: 'อาการ "หน้าจอไหม้ค้าง (Burn-in / Image Retention)" มักเกิดขึ้นจากสาเหตุใดในระบบ CCTV?',
    optionsTh: [
      'สาย HDMI มีความยาวเกิน 2 เมตร',
      'นำทีวีบ้านทั่วไปมาเปิดภาพนิ่งตารางกล้องเดิมตลอด 24 ชั่วโมงต่อเนื่อง ทำให้สารเรืองแสงในพาเนลเสื่อมสภาพไม่เท่ากัน',
      'เกิดจากความชื้นในห้องควบคุมสูงเกินไป',
      'สวิตช์ PoE จ่ายไฟเกินขนาดเข้าสู่จอภาพ',
    ],
    correctIndex: 1,
    explanationTh: 'หน้าจอสำหรับ CCTV ควรเป็นเกรด Commercial Surveillance Monitor ที่มีระบบ Pixel Shift หรือ Anti-Burn-in เพื่อป้องกันรอยไหม้ค้างของตารางกล้องและตัวเลขเวลา',
  },
  {
    id: 'q8',
    category: 'transmission',
    questionTh: 'หากช่างต้องการคำนวณ PoE Power Budget ของสวิตช์ที่มีกำลังรวม 120W เพื่อต่อกล้อง 8 ตัว (กินไฟตัวละ 12W ขณะเปิด IR) สวิตช์นี้สามารถรองรับได้หรือไม่?',
    optionsTh: [
      'รองรับไม่ได้ เพราะวัตต์รวมเกินพิกัด',
      'รองรับได้ เพราะ 8 × 12W = 96W ซึ่งน้อยกว่า 120W (มีกำลังสำรองเหลือ 24W หรือ 20%)',
      'ต้องต่อกล้องได้เพียง 4 ตัวเท่านั้น',
      'สวิตช์ PoE ไม่จำเป็นต้องคำนวณวัตต์ เสียบกี่ตัวก็ได้',
    ],
    correctIndex: 1,
    explanationTh: 'กำลังไฟรวม 8 ตัว × 12W = 96W ซึ่งอยู่ภายใต้ขีดจำกัด 120W และมี Safety Margin เหลือ 20% ถือเป็นสเปกที่ถูกต้องตามหลักวิศวกรรม',
  },
  {
    id: 'q9',
    category: 'recorder',
    questionTh: 'ข้อใดคือความแตกต่างหลักระหว่างเครื่องบันทึก DVR กับ NVR?',
    optionsTh: [
      'DVR ใช้กับกล้อง IP ส่วน NVR ใช้กับกล้องแอนะล็อก',
      'DVR ต้องมีชิปแปลงสัญญาณไฟฟ้าเป็นดิจิทัลในตัวเครื่อง ส่วน NVR รับสตรีมดิจิทัลที่ผ่านการบีบอัดมาจากกล้อง IP แล้วโดยตรง',
      'DVR ต่ออินเทอร์เน็ตไม่ได้ แต่ NVR ต่อได้',
      'DVR ไม่ต้องใช้ฮาร์ดดิสก์ แต่ NVR ต้องใช้',
    ],
    correctIndex: 1,
    explanationTh: 'DVR (Digital Video Recorder) ทำหน้าที่แปลงสัญญาณแอนะล็อกเป็นดิจิทัล ส่วน NVR (Network Video Recorder) รับแพ็กเก็ต IP Stream ที่ถูกประมวลผลมาเรียบร้อยแล้วจากตัวกล้อง',
  },
  {
    id: 'q10',
    category: 'display',
    questionTh: 'การตั้งค่า "Privacy Masking (แถบปิดบังส่วนบุคคล)" ในระบบ CCTV มีวัตถุประสงค์เพื่อสิ่งใด?',
    optionsTh: [
      'เพื่อประหยัดพื้นที่จัดเก็บข้อมูลของฮาร์ดดิสก์',
      'เพื่อปิดบังพื้นที่ส่วนบุคคล (เช่น หน้าต่างบ้านข้างเคียง, จอกดรหัส ATM) ให้เป็นไปตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
      'เพื่อป้องกันไม่ให้ผู้บุกรุกมองเห็นตำแหน่งของกล้องวงจรปิด',
      'เพื่อเพิ่มความสว่างให้กับภาพในเวลากลางคืน',
    ],
    correctIndex: 1,
    explanationTh: 'Privacy Masking เป็นการวาดกรอบสีทึบหรือโมเสกทับพื้นที่ส่วนบุคคลที่ไม่เกี่ยวข้องกับการรักษาความปลอดภัย เพื่อปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
  },
];
