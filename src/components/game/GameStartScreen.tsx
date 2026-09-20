import { LESSON_META } from '../../data/unit1RoleplayContent';

export type GameStartScreenProps = {
  displayName: string;
  studentCode?: string | null;
  onStart: () => void;
  isStarting?: boolean;
  errorMessage?: string | null;
};

export function GameStartScreen({
  displayName,
  studentCode,
  onStart,
  isStarting = false,
  errorMessage,
}: GameStartScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-7 shadow-2xl text-slate-100 flex flex-col gap-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 mx-auto text-3xl border border-sky-500/30">
          📹
        </div>
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
            {LESSON_META.courseCode} · ปวช. พ.ศ. 2567
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Unit 1: IP CCTV Fundamentals</h1>
          <h2 className="text-sm font-semibold text-slate-400">Block-Style Role-Play · Smart Mart</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          รับบทเป็น “ช่างฝึกหัด CCTV” สำรวจร้าน Smart Mart ติดตั้งอุปกรณ์ และต่อระบบเครือข่าย
          ให้กล้องออนไลน์ก่อนร้านเปิด
        </p>

        <div className="text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="block text-xs text-slate-400">ผู้รับการฝึกจากบัญชีที่เข้าสู่ระบบ</span>
          <strong className="block text-slate-100">{displayName}</strong>
          {studentCode ? <span className="block text-xs text-sky-300 mt-0.5">รหัสนักเรียน {studentCode}</span> : null}
        </div>

        <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">WASD</kbd> เดิน / วิ่ง (Shift)</div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">Mouse</kbd> หมุนมุมกล้อง</div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">E / F</kbd> พูดคุย / หยิบ / วาง</div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">Tab</kbd> Checklist / แผนผัง</div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={isStarting}
          className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-2xl cursor-pointer shadow-lg shadow-sky-500/25 transition-all text-sm"
        >
          {isStarting ? 'กำลังเปิด Session…' : 'เข้าสู่ Smart Mart และเริ่มภารกิจ'}
        </button>
        {errorMessage ? <p role="alert" className="text-xs text-rose-300">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
