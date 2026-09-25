'use client';

import React from 'react';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { Room101Mission1Modal } from './Room101Mission1Modal';
import { Room101Mission2Modal } from './Room101Mission2Modal';
import { Room101Mission3Modal } from './Room101Mission3Modal';
import { Room101Mission4Modal } from './Room101Mission4Modal';
import { Room101Mission5Modal } from './Room101Mission5Modal';

interface Room101SmartMartLabProps {
  activeStation?: 1 | 2 | 3 | 4 | 5 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: any) => void;
}

export const Room101SmartMartLab: React.FC<Room101SmartMartLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const activeStation101Modal = useCctvTrainingStore((s) => s.activeStation101Modal);
  const setActiveStation101Modal = useCctvTrainingStore((s) => s.setActiveStation101Modal);
  const rubric = useRoleplayStore((s) => s.rubric);
  const missions = useRoleplayStore((s) => s.missions);

  const currentStation = activeStation ?? activeStation101Modal;

  const handleClose = () => {
    setActiveStation101Modal(null);
    onCloseStation?.();
  };

  const isAllComplete = rubric.isPassed || rubric.totalScore >= 80;

  // Determine current active mission objective for walking guidance
  let nextObjectiveText = 'เดินไปที่ โต๊ะ 1 (ภาพดิจิทัล) เพื่อสำรวจและประกอบชิ้นส่วนกล้อง IP';
  if (!missions.M1.isCompleted) {
    nextObjectiveText = '🎯 ภารกิจที่ 1: เดินไปที่ โต๊ะ 1 (ภาพดิจิทัล) เพื่อผ่าตัดประกอบชิ้นส่วนกล้อง IP';
  } else if (!missions.M2.isCompleted) {
    nextObjectiveText = '🎯 ภารกิจที่ 2: เดินไปที่ โต๊ะ 2 (Data Flow) เพื่อจัดเรียงการเชื่อมต่อเครือข่าย';
  } else if (!missions.M3.isCompleted) {
    nextObjectiveText = '🎯 ภารกิจที่ 3: เดินไปที่ โต๊ะ 3 (หน้าที่อุปกรณ์) เพื่อจับคู่หน้าที่อุปกรณ์ NVR & PoE';
  } else if (!missions.M4.isCompleted) {
    nextObjectiveText = '🎯 ภารกิจที่ 4: เดินไปที่ โต๊ะ 4 (Analog vs IP) เพื่อจำแนกระบบและฟังก์ชัน';
  } else if (!missions.M5.isCompleted) {
    nextObjectiveText = '🎯 ภารกิจที่ 5: เดินไปที่ โต๊ะ 5 (ส่งมอบงาน) เพื่อเชื่อมต่อและตรวจรับมอบระบบ';
  }

  return (
    <>
      {/* Station 1 Modal */}
      {currentStation === 1 && (
        <Room101Mission1Modal
          onClose={handleClose}
        />
      )}

      {/* Station 2 Modal */}
      {currentStation === 2 && (
        <Room101Mission2Modal
          onClose={handleClose}
        />
      )}

      {/* Station 3 Modal */}
      {currentStation === 3 && (
        <Room101Mission3Modal
          onClose={handleClose}
        />
      )}

      {/* Station 4 Modal */}
      {currentStation === 4 && (
        <Room101Mission4Modal
          onClose={handleClose}
        />
      )}

      {/* Station 5 Modal */}
      {currentStation === 5 && (
        <Room101Mission5Modal
          onClose={handleClose}
          onCompleteAll={() => {
            handleClose();
            onCompletedMission?.(rubric);
          }}
        />
      )}

      {/* Objective Walking Waypoint HUD (When outside modals) */}
      {currentStation === null && !isAllComplete && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-sky-400/60 rounded-full px-5 py-2 shadow-2xl backdrop-blur text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-sky-100">
            {nextObjectiveText}
          </span>
        </div>
      )}

      {/* Completion Toast Notification */}
      {isAllComplete && currentStation === null && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-emerald-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce select-none">
          <div>
            <div className="text-xs font-bold text-emerald-400">🎉 ผ่านภารกิจ Room 101 แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนรวม: {rubric.totalScore}/100 (ประตูสู่ Room 102 ปลดล็อกแล้ว)
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/labs/3d/room-102${window.location.search}`;
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            เข้าสู่ Room 102 ➜
          </button>
        </div>
      )}
    </>
  );
};
