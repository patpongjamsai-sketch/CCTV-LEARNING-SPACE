'use client';

import React, { useState } from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { ConceptId, DeviceId } from '../../../shared/domain/roleplayTypes';
import { Room101Mission3IsometricCanvas } from './Room101Mission3IsometricCanvas';

interface Room101Mission3ModalProps {
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const DEVICES_TO_MATCH: { id: DeviceId; nameTh: string; icon: string; desc: string }[] = [
  { id: 'CAMERA_BULLET', nameTh: '1. กล้องวงจรปิด IP (IP Camera)', icon: '📹', desc: 'อุปกรณ์ปลายทางด้านหน้าจุดตรวจการณ์' },
  { id: 'POE_SWITCH_8P', nameTh: '2. สวิตช์จ่ายไฟ PoE (PoE Switch)', icon: '🔀', desc: 'ชุมสายกลางประจำตู้ Rack เครือข่าย' },
  { id: 'NVR_8CH', nameTh: '3. เครื่องบันทึกเครือข่าย (NVR)', icon: '📼', desc: 'เซิร์ฟเวอร์จัดเก็บบันทึกข้อมูลวิดีโอ 24 ชม.' },
  { id: 'ROUTER', nameTh: '4. เราเตอร์เครือข่าย (Router)', icon: '🌐', desc: 'เชื่อมต่อเครือข่าย LAN ภายในกับอินเทอร์เน็ต' },
  { id: 'CLIENT_PC', nameTh: '5. คอมพิวเตอร์ลูกข่าย / จอตรวจการณ์ (Client PC)', icon: '🖥️', desc: 'เครื่องควบคุมสำหรับ รปภ. และผู้ดูแลระบบ' },
];

const FUNCTIONS_LIST: { id: ConceptId; labelTh: string; detailTh: string }[] = [
  { id: 'FUNC_CAMERA', labelTh: 'รับภาพ ประมวลผล และส่ง Video Stream', detailTh: 'รับแสงผ่านเลนส์ แปลงเป็นดิจิทัลและสตรีมผ่าน IP Packet' },
  { id: 'FUNC_POE_SWITCH', labelTh: 'เชื่อมต่ออุปกรณ์เครือข่ายและจ่ายไฟ PoE', detailTh: 'รวมสายสัญญาณ LAN และจ่ายไฟ 48V ให้กล้องโดยไม่ต้องเดินสายไฟแยก' },
  { id: 'FUNC_NVR', labelTh: 'รับและบันทึก Video Stream จากกล้อง IP', detailTh: 'ดึงสตรีม RTSP จากกล้องมาบันทึกและจัดการฮาร์ดดิสก์' },
  { id: 'FUNC_ROUTER', labelTh: 'เชื่อมต่อระหว่างเครือข่ายและกำหนดเส้นทาง', detailTh: 'จ่าย IP ผ่าน DHCP และเชื่อมต่อไปยังโครงข่ายภายนอก' },
  { id: 'FUNC_CLIENT_PC', labelTh: 'ดูภาพสด (Live View) ตั้งค่า และค้นหาย้อนหลัง', detailTh: 'แสดงผลผ่านจอภาพและเป็นอินเทอร์เฟซให้เจ้าหน้าที่ใช้งาน' },
];

export const Room101Mission3Modal: React.FC<Room101Mission3ModalProps> = ({
  onClose,
}) => {
  const mission3Matches = useRoleplayStore((s) => s.mission3Matches);
  const matchDeviceFunction = useRoleplayStore((s) => s.matchDeviceFunction);
  const missionState = useRoleplayStore((s) => s.missions.M3);

  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId | null>(null);

  // Randomized order for devices and functions dropdown so answers are not in predictable 1-to-1 order
  const [shuffledDevices] = useState(() => [...DEVICES_TO_MATCH].sort(() => Math.random() - 0.5));
  const [shuffledFunctions] = useState(() => [...FUNCTIONS_LIST].sort(() => Math.random() - 0.5));

  const handleReset = () => {
    DEVICES_TO_MATCH.forEach((dev) => {
      matchDeviceFunction(dev.id, '' as ConceptId);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              3
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ภารกิจที่ 3 · 15 คะแนน
                </span>
                {missionState.isCompleted && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ ผ่านภารกิจแล้ว
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                จับคู่อุปกรณ์กล้องวงจรปิดกับหน้าที่หลัก (3D Device Function Lab)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-300">
              คะแนน:{' '}
              <strong className="text-emerald-400 font-bold text-sm">
                {missionState.score}
              </strong>
              /15
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Concept Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              <span>🔌</span>
              <span>หน้าที่ขององค์ประกอบหลัก 5 ชนิดในระบบกล้องวงจรปิดไอพี</span>
            </div>
            <p>
              ในระบบ IP CCTV ช่างติดตั้งต้องเข้าใจหน้าที่ของอุปกรณ์แต่ละตัวอย่างชัดเจน เพื่อเลือกวางตำแหน่ง ออกแบบแผนผังเครือข่าย และแก้ไขปัญหาได้อย่างตรงจุดเมื่อสัญญาณดับ
            </p>
          </div>

          {/* 3D Isometric Workbench Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>🛰️</span>
                <span>แท่นทดสอบอุปกรณ์ 3D Isometric (คลิกที่อุปกรณ์เพื่อจับคู่หน้าที่)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {selectedDeviceId
                  ? `เลือกอุปกรณ์: [${DEVICES_TO_MATCH.find((d) => d.id === selectedDeviceId)?.nameTh}]`
                  : 'คลิกโมเดล 3D บนโต๊ะเพื่อเลือกอุปกรณ์'}
              </span>
            </div>

            <Room101Mission3IsometricCanvas
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={(id) => setSelectedDeviceId(id)}
            />
          </div>

          {/* Matching Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                รายการอุปกรณ์ 5 ชนิด (เลือกหน้าที่ที่ถูกต้องสำหรับแต่ละอุปกรณ์)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  ↺ ล้างคำตอบ
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {shuffledDevices.map((dev) => {
                const currentMatch = mission3Matches[dev.id];
                const expectedMap: Partial<Record<DeviceId, ConceptId>> = {
                  CAMERA_BULLET: 'FUNC_CAMERA',
                  POE_SWITCH_8P: 'FUNC_POE_SWITCH',
                  NVR_8CH: 'FUNC_NVR',
                  ROUTER: 'FUNC_ROUTER',
                  CLIENT_PC: 'FUNC_CLIENT_PC',
                };
                const isCorrect = currentMatch === expectedMap[dev.id];
                const isSelected = selectedDeviceId === dev.id;

                return (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(isSelected ? null : dev.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                        : isCorrect
                        ? 'border-emerald-500/60 bg-emerald-950/20'
                        : currentMatch
                        ? 'border-rose-500/50 bg-rose-950/20'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700">
                        {dev.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{dev.nameTh}</h4>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                              ✓ ถูกต้อง
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{dev.desc}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-80 shrink-0">
                      <select
                        value={currentMatch || ''}
                        onChange={(e) => matchDeviceFunction(dev.id, e.target.value as ConceptId)}
                        className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer transition-colors ${
                          isCorrect
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 font-semibold'
                            : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <option value="">-- เลือกหน้าที่ที่ตรงกัน --</option>
                        {shuffledFunctions.map((fn) => (
                          <option key={fn.id} value={fn.id}>
                            {fn.labelTh}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Notice */}
          {missionState.lastFeedbackTh && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                missionState.isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 text-amber-200'
              }`}
            >
              <span className="text-base">{missionState.isCompleted ? '🎉' : '💡'}</span>
              <span>{missionState.lastFeedbackTh}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline">
              {missionState.isCompleted
                ? '✓ ผ่านภารกิจที่ 3 แล้ว! ปิดหน้าต่างแล้วเดินไปที่ โต๊ะ 4 (เปรียบเทียบระบบ)'
                : 'จับคู่อุปกรณ์ให้ถูกต้องครบทั้ง 5 ตัว'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            {missionState.isCompleted && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <span>✓ สำเร็จภารกิจ! เดินไปโต๊ะ 4 (Analog vs IP)</span>
                <span>➜</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
