export const T568B = ['WO', 'O', 'WG', 'B', 'WB', 'G', 'WBr', 'Br'] as const;
export type WireColor = (typeof T568B)[number];
export type CableSide = 'A' | 'B';
export type GameMode = 'learn' | 'practice' | 'assessment';
export type GameStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const WIRE_INFO: Record<WireColor, { name: string; color: string; stripe?: string }> = {
  WO: { name: 'ขาวส้ม', color: '#fff6e7', stripe: '#f97316' },
  O: { name: 'ส้ม', color: '#f97316' },
  WG: { name: 'ขาวเขียว', color: '#f4fff1', stripe: '#22c55e' },
  B: { name: 'น้ำเงิน', color: '#2563eb' },
  WB: { name: 'ขาวน้ำเงิน', color: '#f1f7ff', stripe: '#2563eb' },
  G: { name: 'เขียว', color: '#16a34a' },
  WBr: { name: 'ขาวน้ำตาล', color: '#fff8ef', stripe: '#92400e' },
  Br: { name: 'น้ำตาล', color: '#92400e' },
};

export interface CableEnd {
  bootOn: boolean;
  stripMm: number;
  insulationIntact: boolean;
  untwistMm: number;
  wires: (WireColor | null)[];
  trimmed: boolean;
  inserted: boolean;
  jacketUnderTab: boolean;
  crimped: boolean;
  pullChecked: boolean;
  openPin: number | null;
  shortPair: boolean;
}

export interface Rj45Game {
  mode: GameMode;
  stage: GameStage;
  side: CableSide;
  powerOff: boolean;
  connectorCorrect: boolean;
  ppeOn: boolean;
  cableLengthCm: number;
  cutSquare: boolean;
  temporaryLabels: boolean;
  ends: Record<CableSide, CableEnd>;
  testRuns: number;
  lastTest: CableTest | null;
  diagnosis: string;
  cableId: string;
  weatherProtected: boolean;
  repairing: boolean;
  hintCount: number;
  mistakes: number;
  feedback: string;
  startedAt: number;
}

export interface CableTest {
  wiremap: (number | null)[];
  faults: string[];
  passed: boolean;
}

function freshEnd(): CableEnd {
  return {
    bootOn: false, stripMm: 0, insulationIntact: true, untwistMm: 0,
    wires: Array<WireColor | null>(8).fill(null), trimmed: false,
    inserted: false, jacketUnderTab: false, crimped: false, pullChecked: false,
    openPin: null, shortPair: false,
  };
}

export function createRj45Game(mode: GameMode = 'learn'): Rj45Game {
  return {
    mode, stage: 1, side: 'A', powerOff: false, connectorCorrect: false, ppeOn: false,
    cableLengthCm: 50, cutSquare: false, temporaryLabels: false,
    ends: { A: freshEnd(), B: freshEnd() }, testRuns: 0, lastTest: null,
    diagnosis: '', cableId: '', weatherProtected: false, repairing: false, hintCount: 0, mistakes: 0,
    feedback: '', startedAt: Date.now(),
  };
}

export function setRj45Wire(state: Rj45Game, side: CableSide, pin: number, color: WireColor): Rj45Game {
  if (state.ends[side].crimped || pin < 1 || pin > 8) return state;
  const wires = [...state.ends[side].wires];
  const previous = wires.indexOf(color);
  if (previous >= 0) wires[previous] = null;
  wires[pin - 1] = color;
  return { ...state, ends: { ...state.ends, [side]: { ...state.ends[side], wires } } };
}

export function stageIssue(state: Rj45Game): string | null {
  const end = state.ends[state.side];
  switch (state.stage) {
    case 1:
      if (!state.powerOff) return 'ต้องถอดสายจากอุปกรณ์ PoE และยืนยันว่าไม่มีไฟก่อน';
      if (!state.ppeOn) return 'เลือกอุปกรณ์ป้องกันคมมีดก่อนเริ่มงาน';
      if (!state.connectorCorrect) return 'เลือกหัว CAT6 ให้ตรงกับชนิดแกนสาย';
      return null;
    case 2:
      if (state.cableLengthCm < 100) return 'วัดสายให้ถึงระยะงานและเผื่อซ่อมบำรุงอย่างน้อย 100 ซม. ในโจทย์นี้';
      if (!state.cutSquare) return 'ตัดปลายสายให้ฉาก';
      if (!state.temporaryLabels) return 'ติดป้ายชั่วคราวที่ปลายทั้งสองด้าน';
      return null;
    case 3:
      if (!end.bootOn) return `สวมปลอก/ชิ้นส่วนกันน้ำที่ปลาย ${state.side} ก่อนปอกสาย`;
      if (end.stripMm < 10 || end.stripMm > 20) return 'กำหนดระยะปอกให้เหมาะกับหัวที่ใช้ (โจทย์นี้ 10–20 มม.)';
      return null;
    case 4:
      if (end.wires.some((wire) => wire === null)) return 'จัดสายให้ครบ 8 เส้นก่อน';
      if (!end.trimmed) return 'ตัดปลายเส้นเล็กให้เสมอกัน';
      return null;
    case 5:
      if (!end.inserted) return 'สอดสายเข้าหัวจนสุด';
      if (!end.jacketUnderTab) return 'ให้เปลือกนอกอยู่ใต้เดือยรัดสาย';
      return null;
    case 6:
      if (!end.inserted || !end.jacketUnderTab) return 'ตรวจการสอดและเดือยรัดก่อนย้ำ';
      if (!end.crimped) return `ย้ำหัว RJ45 ปลาย ${state.side} ให้เต็มจังหวะ`;
      if (!end.pullChecked) return 'ตรวจแรงยึดด้วยการดึงเบา ๆ';
      return null;
    case 7:
      if (!state.lastTest) return 'เสียบสองปลายกับ Cable Tester แล้วกดทดสอบ';
      if (!state.lastTest.passed) return 'อ่านผล Wiremap ระบุพินที่ผิด แล้วตัดหัวเสียเพื่อเข้าหัวใหม่';
      return null;
    case 8:
      if (!state.cableId.trim()) return 'ติด Cable ID ถาวรที่สาย';
      if (!state.weatherProtected) return 'ตรวจการป้องกันความชื้นที่จุดติดตั้ง';
      return null;
    default: return null;
  }
}

export function advanceRj45Game(state: Rj45Game): Rj45Game {
  const issue = stageIssue(state);
  if (issue) return { ...state, mistakes: state.mistakes + 1, feedback: issue };
  if (state.stage === 6 && state.repairing) return { ...state, stage: 7, repairing: false, feedback: 'ย้ำหัวที่ซ่อมแล้ว ทดสอบ Wiremap ซ้ำอีกครั้ง' };
  if (state.stage === 6 && state.side === 'A') return { ...state, side: 'B', stage: 3, feedback: 'ปลาย A เสร็จแล้ว ต่อไปทำปลาย B ด้วยมาตรฐานเดียวกัน' };
  if (state.stage >= 9) return state;
  return { ...state, stage: (state.stage + 1) as GameStage, feedback: '' };
}

export function testRj45Cable(state: Rj45Game): CableTest {
  const a = state.ends.A;
  const b = state.ends.B;
  const faults: string[] = [];
  const wiremap = a.wires.map((wire, index) => {
    if (!a.crimped || !b.crimped || a.openPin === index + 1 || b.openPin === index + 1 || !wire) return null;
    const destination = b.wires.indexOf(wire);
    return destination < 0 ? null : destination + 1;
  });
  wiremap.forEach((target, index) => {
    if (target === null) faults.push(`พิน ${index + 1} ขาดวงจร (Open)`);
    else if (target !== index + 1) faults.push(`พิน ${index + 1} ไปพิน ${target} (Miswire)`);
  });
  if (a.shortPair || b.shortPair || !a.insulationIntact || !b.insulationIntact) faults.push('พบความเสี่ยงลัดวงจร/ฉนวนเสีย (Short)');
  if (a.wires.some((wire, i) => wire !== T568B[i]) || b.wires.some((wire, i) => wire !== T568B[i])) faults.push('ลำดับสีไม่ตรง T568B ทั้งสองปลาย');
  if (!a.jacketUnderTab || !b.jacketUnderTab || !a.pullChecked || !b.pullChecked) faults.push('แรงยึดหัวต่อไม่ผ่านการตรวจ');
  const result = { wiremap, faults, passed: faults.length === 0 };
  state.testRuns += 1;
  state.lastTest = result;
  return result;
}

export function cutAndRetryEnd(state: Rj45Game, side: CableSide): Rj45Game {
  return {
    ...state, stage: 3, side, lastTest: null, repairing: true,
    ends: { ...state.ends, [side]: freshEnd() },
    feedback: `ตัดหัวปลาย ${side} ทิ้งแล้ว เริ่มเตรียมปลายสายใหม่`,
  };
}

export function gameScore(state: Rj45Game): number {
  const a = state.ends.A;
  const b = state.ends.B;
  let score = 0;
  if (state.powerOff && state.ppeOn && state.connectorCorrect) score += 15;
  if (state.cableLengthCm >= 100 && state.cutSquare && state.temporaryLabels) score += 10;
  if ([a, b].every((end) => end.bootOn && end.stripMm >= 10 && end.stripMm <= 20 && end.insulationIntact)) score += 10;
  if ([a, b].every((end) => end.wires.every((wire, i) => wire === T568B[i]) && end.untwistMm <= 13 && end.trimmed)) score += 20;
  if ([a, b].every((end) => end.inserted && end.jacketUnderTab && end.crimped && end.pullChecked)) score += 20;
  if (state.testRuns > 0 && state.lastTest?.passed) score += 15;
  if (state.cableId.trim() && state.weatherProtected) score += 10;
  return Math.max(0, score - state.hintCount * 2 - Math.min(10, state.mistakes));
}

export function gamePassed(state: Rj45Game): boolean {
  return state.stage === 9 && gameScore(state) >= 70 && state.powerOff && state.connectorCorrect && Boolean(state.lastTest?.passed);
}
