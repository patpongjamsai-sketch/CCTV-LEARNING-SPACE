export const PV_CLASSES = [
  {
    code: 'PV1',
    id: '22222222-2222-4222-8222-222222222222',
    title: 'ปวช.1 ช่างอิเล็กทรอนิกส์/คอมพิวเตอร์ (กลุ่ม 1)',
    shortTitle: 'ปวช.1 กลุ่ม 1',
  },
  {
    code: 'PV2',
    id: '22222222-2222-4222-8222-222222222223',
    title: 'ปวช.1 ช่างอิเล็กทรอนิกส์/คอมพิวเตอร์ (กลุ่ม 2)',
    shortTitle: 'ปวช.1 กลุ่ม 2',
  },
  {
    code: 'PV3',
    id: '22222222-2222-4222-8222-222222222224',
    title: 'ปวช.1 ช่างอิเล็กทรอนิกส์/คอมพิวเตอร์ (กลุ่ม 3)',
    shortTitle: 'ปวช.1 กลุ่ม 3',
  },
] as const;

export type PvClassCode = (typeof PV_CLASSES)[number]['code'];

export function getPvClassByCode(code: string) {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return PV_CLASSES.find((c) => c.code === normalized) || null;
}

export function getPvClassById(id: string) {
  if (!id) return null;
  return PV_CLASSES.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
}
