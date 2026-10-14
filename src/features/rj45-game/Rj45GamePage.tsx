'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, ArrowRight, Check, ChevronRight, CircleHelp, RotateCcw, ShieldCheck, TestTubeDiagonal } from 'lucide-react';
import {
  advanceRj45Game, createRj45Game, cutAndRetryEnd, gamePassed, gameScore,
  setRj45Wire, stageIssue, testRj45Cable, T568B, WIRE_INFO,
  type CableSide, type GameMode, type Rj45Game, type WireColor,
} from './game';
import './rj45-game.css';

const Workbench = dynamic(() => import('./Rj45Workbench3D').then((mod) => mod.Rj45Workbench3D), {
  ssr: false,
  loading: () => <div className="rj-3d-loading">กำลังเตรียมโต๊ะช่าง 3D…</div>,
});

const STEPS = [
  { title: 'ปลอดภัยและเลือกอุปกรณ์', short: 'SAFETY', help: 'ตัดแหล่งจ่าย PoE เลือกคีมและหัว CAT6 ที่เข้ากับสาย ก่อนแตะปลายสาย' },
  { title: 'วัด ตัด และติดป้าย', short: 'MEASURE', help: 'วัดสายตามเส้นทาง เผื่อซ่อมบำรุง ตัดปลายให้ฉาก และติดป้ายชั่วคราวทั้งสองฝั่ง' },
  { title: 'สวมปลอกและปอกสาย', short: 'STRIP', help: 'สวมปลอกก่อนเข้าหัว ปอกเปลือกโดยไม่บาดฉนวนเส้นเล็ก' },
  { title: 'เรียงสี T568B', short: 'PINOUT', help: 'มองหัวด้านหน้าที่เห็นหน้าสัมผัสทองแดง สลักอยู่ด้านหลัง พิน 1–8 จากซ้ายไปขวา' },
  { title: 'สอดสายเข้าหัว', short: 'INSERT', help: 'ให้เส้นเล็กทั้งแปดถึงปลายหัว และเปลือกนอกอยู่ใต้เดือยรัดสาย' },
  { title: 'ย้ำหัวและตรวจแรงยึด', short: 'CRIMP', help: 'ย้ำเต็มจังหวะ ดึงสายเบา ๆ แล้วทำขั้นตอนเดียวกันกับปลายอีกด้าน' },
  { title: 'ทดสอบ Wiremap', short: 'TEST', help: 'อ่านพิน 1→1 ถึง 8→8 และระบุ Open, Short หรือสายสลับก่อนซ่อม' },
  { title: 'ซ่อม ติดป้าย ส่งงาน', short: 'FINISH', help: 'ตัดหัวเสียเพื่อเข้าหัวใหม่ ทดสอบซ้ำ ติด Cable ID ถาวร และป้องกันความชื้น' },
] as const;

const REFERENCE = '1 ขาวส้ม  ·  2 ส้ม  ·  3 ขาวเขียว  ·  4 น้ำเงิน  ·  5 ขาวน้ำเงิน  ·  6 เขียว  ·  7 ขาวน้ำตาล  ·  8 น้ำตาล';

function WireChip({ color }: { color: WireColor }) {
  const wire = WIRE_INFO[color];
  return <span className="rj-wire-chip" style={{ background: wire.stripe ? `repeating-linear-gradient(135deg, ${wire.color} 0 7px, ${wire.stripe} 7px 10px)` : wire.color }} />;
}

export function Rj45GamePage() {
  const [game, setGame] = useState<Rj45Game>(() => createRj45Game());
  const [selectedWire, setSelectedWire] = useState<WireColor | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [retrySide, setRetrySide] = useState<CableSide>('A');
  const end = game.ends[game.side];
  const step = STEPS[Math.min(game.stage, 8) - 1]!;
  const issue = game.stage < 9 ? stageIssue(game) : null;

  const patch = (values: Partial<Rj45Game>) => setGame((current) => ({ ...current, ...values, feedback: '' }));
  const patchEnd = (values: Partial<typeof end>) => setGame((current) => ({
    ...current,
    ends: { ...current.ends, [current.side]: { ...current.ends[current.side], ...values } },
    feedback: '',
  }));
  const chooseMode = (mode: GameMode) => { setGame(createRj45Game(mode)); setSelectedWire(null); setShowReference(false); };
  const next = () => setGame((current) => advanceRj45Game(current));
  const runTest = () => setGame((current) => {
    const copy: Rj45Game = { ...current, ends: { A: { ...current.ends.A }, B: { ...current.ends.B } } };
    testRj45Cable(copy);
    return { ...copy, feedback: copy.lastTest?.passed ? 'ผ่าน! Wiremap 1→1 ถึง 8→8 ครบ' : 'พบข้อผิดพลาด อ่านผลแล้วตัดหัวปลายที่ผิดเพื่อทำใหม่' };
  });

  return (
    <main className="rj-app">
      <header className="rj-topbar">
        <div className="rj-top-left">
          <Link href="/labs" className="rj-back">← ศูนย์ปฏิบัติการ</Link>
          <div className="rj-brand-mark">RJ<span>45</span></div>
          <div><div className="rj-eyebrow">CCTV TECHNICIAN · SKILL LAB</div><strong>CAT6 TERMINATION WORKSHOP</strong></div>
        </div>
        <div className="rj-top-right">
          <span className="rj-live-dot" /> <span>ภารกิจสายตรง T568B</span>
          <span className="rj-separator" />
          <button type="button" className="rj-reset" onClick={() => chooseMode(game.mode)} title="เริ่มภารกิจใหม่"><RotateCcw size={16} /> เริ่มใหม่</button>
        </div>
      </header>

      <section className="rj-hero">
        <div><div className="rj-kicker">MISSION 01 / CABLE ASSEMBLY</div><h1>ต่อสายให้ติด<span> ด้วยมือเรา</span></h1><p>ฝึกเข้าหัว RJ45 CAT6 สองปลาย ตั้งแต่ตัด PoE จนเครื่องทดสอบขึ้นครบ 8 พิน</p></div>
        <div className="rj-mode-switch" aria-label="โหมดเกม">
          {([['learn', 'เรียนรู้'], ['practice', 'ฝึกปฏิบัติ'], ['assessment', 'ประเมินตนเอง']] as const).map(([mode, label]) => (
            <button type="button" key={mode} className={game.mode === mode ? 'active' : ''} onClick={() => chooseMode(mode)}>{label}</button>
          ))}
        </div>
      </section>

      <div className="rj-layout">
        <aside className="rj-steps" aria-label="ขั้นตอนการฝึก">
          <div className="rj-panel-caption">WORKFLOW <span>08 STEPS</span></div>
          {STEPS.map((item, index) => {
            const number = index + 1;
            const isActive = number === game.stage;
            const isDone = number < game.stage || (game.stage === 9);
            return <div key={item.short} className={`rj-step ${isActive ? 'current' : ''} ${isDone ? 'done' : ''}`}>
              <span className="rj-step-num">{isDone ? <Check size={14} /> : String(number).padStart(2, '0')}</span>
              <span><small>{item.short}</small><strong>{item.title}</strong></span>
              {isActive && <ChevronRight size={15} />}
            </div>;
          })}
          <div className="rj-side-note"><ShieldCheck size={18} /><span>ผลงานหน้านี้เป็นการฝึกอิสระ ยังไม่ส่งคะแนนรายวิชา</span></div>
        </aside>

        <section className="rj-stage-area">
          <div className="rj-scene-head"><span><span className="rj-live-dot" /> LIVE WORKBENCH</span><span>ปลายสาย <b>{game.side}</b> · {game.stage <= 6 ? 'ประกอบหัว' : 'ตรวจงาน'}</span></div>
          <div className="rj-scene"><Workbench game={game} /><div className="rj-scene-tag">หมุนดูหัวต่อได้ · ลากเมาส์บนฉาก 3D</div></div>
          <div className="rj-pinout">
            <div className="rj-pinout-head"><div><small>FRONT VIEW · CONTACTS FACING YOU</small><strong>ภาพขยายพิน 1–8 · ปลาย {game.side}</strong></div><span>สลักอยู่ด้านหลัง</span></div>
            <div className="rj-pin-grid">{end.wires.map((wire, index) => (
              <button type="button" key={index} className={`rj-pin ${wire ? 'filled' : ''} ${game.stage === 4 ? 'selectable' : ''}`} title={wire ? WIRE_INFO[wire].name : `พิน ${index + 1}`} disabled={game.stage !== 4 || end.crimped} onClick={() => { if (selectedWire) setGame((current) => setRj45Wire(current, current.side, index + 1, selectedWire)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const color = event.dataTransfer.getData('text/plain') as WireColor; if (T568B.includes(color)) setGame((current) => setRj45Wire(current, current.side, index + 1, color)); }}>
                <small>{index + 1}</small>{wire ? <WireChip color={wire} /> : <span className="rj-empty-pin">+</span>}<span>{wire ? WIRE_INFO[wire].name : 'ว่าง'}</span>
              </button>
            ))}</div>
            {game.stage === 4 && <p className="rj-pin-hint">เลือกสีด้านขวา แล้วกดช่องพิน หรือ ลากสีมาวาง · หัวที่ย้ำแล้วจัดสีใหม่ไม่ได้</p>}
          </div>
        </section>

        <aside className="rj-controls">
          {game.stage === 9 ? <div className="rj-result">
            <div className="rj-result-icon"><Check size={29} /></div>
            <div className="rj-kicker">JOB COMPLETE</div><h2>{gamePassed(game) ? 'ภารกิจสำเร็จ' : 'ฝึกครบแล้ว'}</h2>
            <p>เข้าหัวสองปลายและตรวจสายเสร็จ ผลการประเมินตนเองจากการฝึกครั้งนี้</p>
            <div className="rj-score"><strong>{gameScore(game)}</strong><span>/ 100 คะแนน</span></div>
            <div className="rj-result-stats"><span>ทดสอบ {game.testRuns} ครั้ง</span><span>คำใบ้ {game.hintCount} ครั้ง</span><span>ลองผิด {game.mistakes} ครั้ง</span></div>
            <button type="button" className="rj-primary" onClick={() => window.print()}>พิมพ์ผลการฝึก</button>
            <button type="button" className="rj-secondary" onClick={() => chooseMode(game.mode)}>เริ่มฝึกใหม่</button>
          </div> : <>
            <div className="rj-control-head"><div><small>STEP {String(game.stage).padStart(2, '0')} / 08 · {step.short}</small><h2>{step.title}</h2></div><span className="rj-control-progress">{Math.round(((game.stage - 1) / 8) * 100)}%</span></div>
            <div className="rj-principle"><CircleHelp size={18} /><p>{step.help}</p></div>
            {game.mode !== 'assessment' && <button type="button" className="rj-hint-btn" onClick={() => { setShowReference((value) => !value); setGame((current) => ({ ...current, hintCount: current.hintCount + 1 })); }}>💡 {showReference ? 'ซ่อนคำใบ้' : 'ดูคำใบ้'} <span>−2 คะแนน</span></button>}
            {showReference && <div className="rj-reference"><strong>ลำดับสี T568B</strong><p>{REFERENCE}</p><span>ตรวจมุมมองพินก่อนจัดสาย และรักษาการบิดเกลียวให้ใกล้หัวที่สุด</span></div>}

            <div className="rj-task-content">
              {game.stage === 1 && <>
                <label className="rj-check"><input type="checkbox" checked={game.powerOff} onChange={(event) => patch({ powerOff: event.target.checked })} /><span><strong>ตัด PoE / ถอดสายจากอุปกรณ์</strong><small>ยืนยันว่าปลายสายไม่มีไฟเลี้ยง</small></span></label>
                <label className="rj-check"><input type="checkbox" checked={game.ppeOn} onChange={(event) => patch({ ppeOn: event.target.checked })} /><span><strong>สวมอุปกรณ์ป้องกันคมมีด</strong><small>แว่นและอุปกรณ์ที่เหมาะกับโต๊ะช่าง</small></span></label>
                <label className="rj-field">เลือกชนิดหัวต่อ<select value={game.connectorCorrect ? 'cat6' : ''} onChange={(event) => patch({ connectorCorrect: event.target.value === 'cat6' })}><option value="">— เลือกหัวต่อ —</option><option value="cat5">RJ45 สำหรับสาย CAT5e</option><option value="cat6">RJ45 CAT6 สำหรับแกนแข็งที่ใช้ในโจทย์</option><option value="stranded">RJ45 สำหรับสายแกนฝอย</option></select></label>
              </>}
              {game.stage === 2 && <>
                <label className="rj-field">ความยาวสายที่วัดได้ <b>{game.cableLengthCm} ซม.</b><input type="range" min="50" max="180" value={game.cableLengthCm} onChange={(event) => patch({ cableLengthCm: Number(event.target.value) })} /></label>
                <p className="rj-helper">โจทย์: เส้นทาง 90 ซม. เผื่อสายซ่อมบำรุงอย่างน้อย 10 ซม.</p>
                <label className="rj-check"><input type="checkbox" checked={game.cutSquare} onChange={(event) => patch({ cutSquare: event.target.checked })} /><span><strong>ตัดปลายสายให้ฉาก</strong><small>อย่าให้หน้าตัดเอียง</small></span></label>
                <label className="rj-check"><input type="checkbox" checked={game.temporaryLabels} onChange={(event) => patch({ temporaryLabels: event.target.checked })} /><span><strong>ติดป้ายชั่วคราว A และ B</strong><small>ป้องกันสลับเส้นระหว่างทำงาน</small></span></label>
              </>}
              {game.stage === 3 && <>
                <div className="rj-end-label">กำลังทำปลายสาย {game.side}</div>
                <label className="rj-check"><input type="checkbox" checked={end.bootOn} onChange={(event) => patchEnd({ bootOn: event.target.checked })} /><span><strong>สวมปลอกหัว / กันน้ำก่อน</strong><small>สวมหลังย้ำไม่ได้</small></span></label>
                <label className="rj-field">ระยะปอกเปลือก <b>{end.stripMm} มม.</b><input type="range" min="0" max="28" value={end.stripMm} onChange={(event) => patchEnd({ stripMm: Number(event.target.value) })} /></label>
                <p className="rj-helper">ใช้ 10–20 มม. สำหรับหัวจำลองนี้; ของจริงให้ตามสเปกหัวและคีม</p>
                <label className="rj-check"><input type="checkbox" checked={end.insulationIntact} onChange={(event) => patchEnd({ insulationIntact: event.target.checked })} /><span><strong>ฉนวนเส้นเล็กไม่ถูกคมมีดบาด</strong><small>หากบาด ให้ตัดปลายใหม่</small></span></label>
              </>}
              {game.stage === 4 && <>
                <div className="rj-end-label">จัดสีปลาย {game.side} · พิน 1–8</div>
                <div className="rj-palette">{T568B.map((color) => <button type="button" draggable key={color} className={selectedWire === color ? 'selected' : ''} onClick={() => setSelectedWire(color)} onDragStart={(event) => event.dataTransfer.setData('text/plain', color)}><WireChip color={color} />{WIRE_INFO[color].name}</button>)}</div>
                <label className="rj-field">ระยะคลายเกลียว <b>{end.untwistMm} มม.</b><input type="range" min="0" max="30" value={end.untwistMm} onChange={(event) => patchEnd({ untwistMm: Number(event.target.value) })} /></label>
                <label className="rj-check"><input type="checkbox" checked={end.trimmed} onChange={(event) => patchEnd({ trimmed: event.target.checked })} /><span><strong>ตัดปลาย 8 เส้นให้เสมอ</strong><small>ตรวจสีอีกครั้งก่อนสอดหัว</small></span></label>
              </>}
              {game.stage === 5 && <>
                <label className="rj-check"><input type="checkbox" checked={end.inserted} onChange={(event) => patchEnd({ inserted: event.target.checked })} /><span><strong>สอด 8 เส้นเข้ารางจนสุด</strong><small>ดูผ่านพลาสติกว่าเส้นชนปลายหัว</small></span></label>
                <label className="rj-check"><input type="checkbox" checked={end.jacketUnderTab} onChange={(event) => patchEnd({ jacketUnderTab: event.target.checked })} /><span><strong>เปลือกนอกอยู่ใต้เดือยรัด</strong><small>หัวไม่ควรจับเฉพาะเส้นเล็ก</small></span></label>
                <label className="rj-field">ตรวจพินที่อาจสอดไม่ถึง<select value={end.openPin ?? ''} onChange={(event) => patchEnd({ openPin: event.target.value ? Number(event.target.value) : null })}><option value="">ทุกเส้นถึงปลายหัว</option>{T568B.map((_, index) => <option value={index + 1} key={index}>พิน {index + 1} ไม่ถึงปลาย</option>)}</select></label>
                {game.mode !== 'assessment' && <p className="rj-helper">ลองปล่อยให้พินหนึ่งไม่ถึงปลาย แล้วดูผล Open จากเครื่องทดสอบ</p>}
              </>}
              {game.stage === 6 && <>
                <div className="rj-end-label">ย้ำหัวปลาย {game.side}</div>
                <button type="button" className="rj-tool-action" onClick={() => patchEnd({ crimped: true })} disabled={end.crimped}>{end.crimped ? '✓ ย้ำหัวแล้ว' : '🔧 กดย้ำหัวเต็มจังหวะ'}</button>
                <label className="rj-check"><input type="checkbox" checked={end.pullChecked} onChange={(event) => patchEnd({ pullChecked: event.target.checked })} /><span><strong>ดึงเบา ๆ ตรวจการยึด</strong><small>หากหลวม ต้องตัดหัวแล้วทำใหม่</small></span></label>
                {game.side === 'A' && !game.repairing && <p className="rj-helper">เสร็จปลาย A แล้วเกมจะพาไปปอกและเข้าหัวปลาย B</p>}
              </>}
              {game.stage === 7 && <>
                <div className="rj-tester"><div><TestTubeDiagonal size={18} /> CABLE TESTER <span>{game.testRuns ? `RUN #${game.testRuns}` : 'READY'}</span></div>
                  <div className="rj-tester-grid">{Array.from({ length: 8 }, (_, index) => <div key={index} className={game.lastTest?.wiremap[index] === index + 1 ? 'pass' : game.lastTest ? 'fail' : ''}><span>{index + 1}</span><span>→</span><span>{game.lastTest ? (game.lastTest.wiremap[index] ?? 'OPEN') : '—'}</span></div>)}</div>
                </div>
                <button type="button" className="rj-tool-action" onClick={runTest}>▶ เสียบสายและเริ่มทดสอบ</button>
                {game.lastTest && <div className={`rj-test-summary ${game.lastTest.passed ? 'pass' : 'fail'}`}><strong>{game.lastTest.passed ? 'PASS · 8/8' : 'FAULT DETECTED'}</strong>{game.lastTest.faults.map((fault, index) => <span key={index}>{fault}</span>)}</div>}
                {game.lastTest && !game.lastTest.passed && <><label className="rj-field">วิเคราะห์สาเหตุด้วยตนเอง<textarea rows={2} value={game.diagnosis} onChange={(event) => patch({ diagnosis: event.target.value })} placeholder="เช่น พิน 7 เปิดวงจรเพราะเส้นไม่ถึงปลายหัว" /></label><div className="rj-retry-row"><select aria-label="เลือกปลายที่ต้องแก้" value={retrySide} onChange={(event) => setRetrySide(event.target.value as CableSide)}><option value="A">ปลาย A</option><option value="B">ปลาย B</option></select><button type="button" disabled={game.diagnosis.trim().length < 8} onClick={() => setGame((current) => cutAndRetryEnd(current, retrySide))}>✂ ตัดหัวเสียและทำใหม่</button></div></>}
              </>}
              {game.stage === 8 && <><div className="rj-test-summary pass"><strong>✓ ทดสอบผ่าน 8/8 พิน</strong><span>พร้อมติดป้ายและตรวจสภาพจุดติดตั้ง</span></div><label className="rj-field">Cable ID ถาวร<input type="text" value={game.cableId} maxLength={30} onChange={(event) => patch({ cableId: event.target.value })} placeholder="เช่น CAM-01-UTP" /></label><label className="rj-check"><input type="checkbox" checked={game.weatherProtected} onChange={(event) => patch({ weatherProtected: event.target.checked })} /><span><strong>ป้องกันความชื้นที่จุดติดตั้ง</strong><small>เก็บหัวต่อในกล่อง/ใช้อุปกรณ์ตามหน้างาน</small></span></label></>}
            </div>
            {game.feedback && <div className="rj-feedback"><AlertTriangle size={17} /> {game.feedback}</div>}
            <div className="rj-control-bottom"><span>{issue ? 'ยังมีรายการที่ต้องทำ' : 'พร้อมไปขั้นถัดไป'}</span><button type="button" className="rj-primary" onClick={next}>{game.stage === 8 ? 'ส่งงานฝึก' : game.stage === 6 && game.repairing ? 'กลับไปทดสอบ' : game.stage === 6 && game.side === 'A' ? 'ไปปลาย B' : 'ขั้นตอนถัดไป'} <ArrowRight size={17} /></button></div>
          </>}
        </aside>
      </div>
      <footer className="rj-footer"><span>RJ45 CAT6 · T568B BOTH ENDS</span><span>สื่อฝึกปฏิบัติวิชากล้องวงจรปิดบนระบบเครือข่าย</span></footer>
    </main>
  );
}
