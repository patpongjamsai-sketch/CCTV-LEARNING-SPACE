import type { EquipmentDefinition } from './types';

// ราคาเป็นค่าจำลองสำหรับฝึกตัดสินใจ ไม่ใช่ราคาจำหน่ายจริง
export const equipmentCatalog: EquipmentDefinition[] = [
  {
    id: 'ip_camera_4mp', name: 'IP Camera 4MP', category: 'camera', system: 'IP',
    description: 'กล้องที่ส่งภาพเป็นข้อมูลผ่านเครือข่าย และรับไฟผ่าน PoE ได้เมื่อรุ่นรองรับ',
    specifications: { resolution: '4MP', poe: true, use: 'Indoor/Outdoor' }, connectors: ['RJ45', 'DC 12V'],
    trainingPrice: 1850, inspectable: true, pickupable: true, quantity: 1, weight: 0.45, condition: 'good',
    assetKey: 'equipment.ip-camera', placeholderShape: 'camera', required: true,
  },
  {
    id: 'analog_camera_2mp', name: 'HD Analog Camera 2MP', category: 'camera', system: 'Analog',
    description: 'กล้องที่ส่งสัญญาณผ่านสาย Coaxial ไปยัง DVR หรือ XVR ที่รองรับ',
    specifications: { resolution: '2MP', signal: 'HD Analog', power: 'DC 12V' }, connectors: ['BNC', 'DC 12V'],
    trainingPrice: 950, inspectable: true, pickupable: true, quantity: 1, weight: 0.38, condition: 'good',
    assetKey: 'equipment.analog-camera', placeholderShape: 'camera', required: true,
  },
  {
    id: 'dome_camera', name: 'Dome Camera', category: 'camera', system: 'Both',
    description: 'รูปทรงโดมเหมาะกับพื้นที่ภายใน และช่วยลดการสังเกตทิศทางของเลนส์',
    specifications: { form: 'Dome', use: 'Indoor' }, connectors: ['Model dependent'], trainingPrice: 1200,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.42, condition: 'good',
    assetKey: 'equipment.dome-camera', placeholderShape: 'camera', required: false,
  },
  {
    id: 'bullet_camera', name: 'Bullet Camera', category: 'camera', system: 'Both',
    description: 'รูปทรงกระบอกมองเห็นทิศทางชัด เหมาะกับภายนอกเมื่อรุ่นนั้นมี IP Rating ที่เหมาะสม',
    specifications: { form: 'Bullet', use: 'Outdoor when rated' }, connectors: ['Model dependent'], trainingPrice: 1450,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.55, condition: 'good',
    assetKey: 'equipment.bullet-camera', placeholderShape: 'camera', required: false,
  },
  {
    id: 'ptz_camera', name: 'PTZ Camera', category: 'camera', system: 'IP',
    description: 'กล้องที่สั่งหมุน ก้ม เงย และซูมได้ เหมาะกับงานที่ต้องควบคุมมุมมอง',
    specifications: { panTiltZoom: true, power: 'PoE+/model dependent' }, connectors: ['RJ45'], trainingPrice: 6800,
    inspectable: true, pickupable: false, quantity: 1, weight: 1.8, condition: 'inspect',
    assetKey: 'equipment.ptz-camera', placeholderShape: 'camera', required: false,
  },
  {
    id: 'dvr_8ch', name: 'DVR 8 Channel', category: 'recorder', system: 'Analog',
    description: 'เครื่องบันทึกสำหรับกล้อง Analog หรือ HD Analog ตามรูปแบบสัญญาณที่รุ่นรองรับ',
    specifications: { channels: 8, network: true, storageBay: 1 }, connectors: ['BNC', 'HDMI', 'RJ45', 'SATA'],
    trainingPrice: 3200, inspectable: true, pickupable: true, quantity: 1, weight: 1.15, condition: 'good',
    assetKey: 'equipment.dvr', placeholderShape: 'box', required: true,
  },
  {
    id: 'nvr_8ch', name: 'NVR 8 Channel', category: 'recorder', system: 'IP',
    description: 'เครื่องบันทึกที่รับสตรีมจาก IP Camera ผ่านเครือข่าย',
    specifications: { channels: 8, bandwidth: '80 Mbps', storageBay: 1 }, connectors: ['RJ45', 'HDMI', 'SATA'],
    trainingPrice: 3900, inspectable: true, pickupable: true, quantity: 1, weight: 1.05, condition: 'good',
    assetKey: 'equipment.nvr', placeholderShape: 'box', required: true,
  },
  {
    id: 'surveillance_hdd_2tb', name: 'Surveillance HDD 2TB', category: 'storage', system: 'Both',
    description: 'ฮาร์ดดิสก์สำหรับงานบันทึกต่อเนื่อง ต้องติดตั้งภายใน Recorder และตรวจสุขภาพดิสก์',
    specifications: { capacity: '2TB', interface: 'SATA', workload: 'Surveillance' }, connectors: ['SATA Data', 'SATA Power'],
    trainingPrice: 2300, inspectable: true, pickupable: true, quantity: 1, weight: 0.45, condition: 'good',
    assetKey: 'equipment.hdd', placeholderShape: 'disk', required: true,
  },
  {
    id: 'poe_switch_8port', name: 'PoE Switch 8 Port', category: 'network', system: 'IP',
    description: 'รับส่งข้อมูลและจ่ายไฟให้ IP Camera ผ่านสาย Ethernet เมื่อกำลังไฟเพียงพอ',
    specifications: { ports: 8, poePorts: 8, budget: '96W' }, connectors: ['RJ45'], trainingPrice: 2800,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.85, condition: 'good',
    assetKey: 'equipment.poe-switch', placeholderShape: 'box', required: true,
  },
  {
    id: 'network_switch_8port', name: 'Network Switch 8 Port', category: 'network', system: 'IP',
    description: 'เชื่อมต่อข้อมูลในเครือข่าย รุ่นนี้ไม่จ่ายไฟ PoE จึงต้องมีแหล่งจ่ายให้กล้องแยก',
    specifications: { ports: 8, poe: false }, connectors: ['RJ45'], trainingPrice: 850,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.35, condition: 'good',
    assetKey: 'equipment.network-switch', placeholderShape: 'box', required: false,
  },
  {
    id: 'router', name: 'Router', category: 'network', system: 'Both',
    description: 'เชื่อมระบบ CCTV ไปยังเครือข่ายอื่นตามนโยบายและการตั้งค่าที่ได้รับอนุญาต',
    specifications: { wan: 1, lan: 4, wifi: true }, connectors: ['RJ45'], trainingPrice: 1450,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.42, condition: 'good',
    assetKey: 'equipment.router', placeholderShape: 'box', required: false,
  },
  {
    id: 'cat6_cable', name: 'CAT6 Cable', category: 'cable', system: 'IP',
    description: 'สายคู่บิดเกลียวสำหรับ Ethernet ใช้กับ RJ45 และรองรับ PoE ตามมาตรฐานและระยะที่เหมาะสม',
    specifications: { type: 'UTP CAT6', length: '10 m training roll' }, connectors: ['RJ45'], trainingPrice: 260,
    inspectable: true, pickupable: true, quantity: 10, weight: 0.3, condition: 'good',
    assetKey: 'equipment.cat6', placeholderShape: 'cable', required: true,
  },
  {
    id: 'coaxial_cable', name: 'Coaxial Cable', category: 'cable', system: 'Analog',
    description: 'สายสำหรับส่งสัญญาณกล้อง Analog หรือ HD Analog และใช้งานร่วมกับหัว BNC',
    specifications: { type: 'RG6 training sample', length: '10 m' }, connectors: ['BNC'], trainingPrice: 180,
    inspectable: true, pickupable: true, quantity: 10, weight: 0.4, condition: 'good',
    assetKey: 'equipment.coaxial', placeholderShape: 'cable', required: true,
  },
  {
    id: 'rj45_connector', name: 'RJ45 Connector', category: 'connector', system: 'IP',
    description: 'หัวต่อสำหรับสาย Ethernet ต้องเข้าหัวและทดสอบลำดับสายให้ถูกต้อง',
    specifications: { pins: 8, cable: 'CAT5e/CAT6 model dependent' }, connectors: ['RJ45'], trainingPrice: 12,
    inspectable: true, pickupable: true, quantity: 4, weight: 0.01, condition: 'new',
    assetKey: 'equipment.rj45', placeholderShape: 'connector', required: false,
  },
  {
    id: 'bnc_connector', name: 'BNC Connector', category: 'connector', system: 'Analog',
    description: 'หัวต่อสัญญาณภาพสำหรับสาย Coaxial และพอร์ตวิดีโอของระบบ Analog',
    specifications: { coupling: 'Bayonet', cable: 'Coaxial' }, connectors: ['BNC'], trainingPrice: 20,
    inspectable: true, pickupable: true, quantity: 4, weight: 0.02, condition: 'new',
    assetKey: 'equipment.bnc', placeholderShape: 'connector', required: false,
  },
  {
    id: 'monitor_22', name: 'Monitor 22 inch', category: 'display', system: 'Both',
    description: 'แสดง Live View เมนูตั้งค่า และ Playback จาก Recorder',
    specifications: { size: '22 inch', resolution: 'Full HD' }, connectors: ['HDMI', 'VGA'], trainingPrice: 2700,
    inspectable: true, pickupable: false, quantity: 1, weight: 2.8, condition: 'good',
    assetKey: 'equipment.monitor', placeholderShape: 'monitor', required: true,
  },
  {
    id: 'cctv_power_supply', name: 'CCTV Power Supply', category: 'power', system: 'Analog',
    description: 'จ่ายไฟให้กล้องตามแรงดัน กระแส และขั้วที่กำหนด ต้องตัดไฟก่อนต่อวงจร',
    specifications: { output: 'DC 12V training unit', channels: 4 }, connectors: ['DC Terminal'], trainingPrice: 780,
    inspectable: true, pickupable: true, quantity: 1, weight: 0.75, condition: 'inspect',
    assetKey: 'equipment.power-supply', placeholderShape: 'power', required: true,
  },
  {
    id: 'ups_650va', name: 'UPS 650VA', category: 'power', system: 'Both',
    description: 'สำรองไฟชั่วคราวและช่วยลดผลกระทบจากไฟดับ ไม่ทดแทนการออกแบบระบบไฟที่ถูกต้อง',
    specifications: { rating: '650VA', output: 'AC' }, connectors: ['AC Outlet'], trainingPrice: 1900,
    inspectable: true, pickupable: false, quantity: 1, weight: 4.2, condition: 'inspect',
    assetKey: 'equipment.ups', placeholderShape: 'power', required: false,
  },
];

export const equipmentById = new Map(equipmentCatalog.map((item) => [item.id, item]));
export const requiredEquipment = equipmentCatalog.filter((item) => item.required);

export interface Room102StationDefinition {
  id: string;
  kind: 'equipment' | 'preview';
  name: string;
  equipmentId?: string;
  position: { x: number; y: number; z: number };
}

// Layout เป็นข้อมูล Simulation/Content เพื่อให้ Renderer เปลี่ยนรูปทรงได้โดยไม่กระทบกติกาภารกิจ
export const room102Stations: Room102StationDefinition[] = [
  { id: 'r102:dome_camera', kind: 'equipment', name: 'Dome Camera Station', equipmentId: 'dome_camera', position: { x: -10.1, y: 0.75, z: -6.1 } },
  { id: 'r102:bullet_camera', kind: 'equipment', name: 'Bullet Camera Station', equipmentId: 'bullet_camera', position: { x: -7.6, y: 0.75, z: -6.1 } },
  { id: 'r102:ptz_camera', kind: 'equipment', name: 'PTZ Camera Station', equipmentId: 'ptz_camera', position: { x: -5.1, y: 0.75, z: -6.1 } },
  { id: 'r102:coverage_preview', kind: 'preview', name: 'Coverage Preview Simulator', position: { x: -7.6, y: 0.9, z: -10.8 } },
];
