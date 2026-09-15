import React from 'react';
import { useRoleplayStore } from '../../store/useRoleplayStore';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useRoleplayStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useRoleplayStore((s) => s.setSettingsOpen);
  const reducedMotion = useRoleplayStore((s) => s.reducedMotion);
  const setReducedMotion = useRoleplayStore((s) => s.setReducedMotion);
  const graphicsQuality = useRoleplayStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useRoleplayStore((s) => s.setGraphicsQuality);
  const returnAll = useRoleplayStore((s) => s.returnAllItemsToStations);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚙️ ตั้งค่าระบบและการแสดงผล (Settings)</span>
          </h2>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Graphics Quality */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">คุณภาพกราฟิก (Graphics)</span>
              <p className="text-[11px] text-slate-400">เลือกโหมดประหยัดทรัพยากรสำหรับเครื่องห้องเรียน</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGraphicsQuality('HIGH')}
                className={`px-2.5 py-1 rounded cursor-pointer border ${
                  graphicsQuality === 'HIGH'
                    ? 'bg-sky-600 text-white border-sky-500 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                High (60 FPS)
              </button>
              <button
                type="button"
                onClick={() => setGraphicsQuality('LOW')}
                className={`px-2.5 py-1 rounded cursor-pointer border ${
                  graphicsQuality === 'LOW'
                    ? 'bg-sky-600 text-white border-sky-500 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Low Spec
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">ลดการเคลื่อนไหว (Reduced Motion)</span>
              <p className="text-[11px] text-slate-400">ลดการแกว่งของกล้องและเอฟเฟกต์สำหรับผู้เวียนหัวง่าย</p>
            </div>
            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-3 py-1 rounded cursor-pointer border font-semibold ${
                reducedMotion
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {reducedMotion ? 'เปิดใช้งาน' : 'ปิด'}
            </button>
          </div>

          {/* Return all objects to stations */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">รีเซ็ตตำแหน่งอุปกรณ์</span>
              <p className="text-[11px] text-slate-400">นำการ์ดและอุปกรณ์ทั้งหมดกลับสู่สถานีตั้งต้น</p>
            </div>
            <button
              type="button"
              onClick={returnAll}
              className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-200 rounded cursor-pointer transition-colors"
            >
              คืนของทั้งหมด
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setSettingsOpen(false)}
          className="w-full py-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl cursor-pointer text-xs mt-2"
        >
          กลับเข้าสู่เกม (Resume)
        </button>
      </div>
    </div>
  );
};
