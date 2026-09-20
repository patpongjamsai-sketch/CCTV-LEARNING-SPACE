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

  const currentStation = activeStation ?? activeStation101Modal;

  const handleClose = () => {
    setActiveStation101Modal(null);
    onCloseStation?.();
  };

  const handleNext = (nextStation: 1 | 2 | 3 | 4 | 5) => {
    setActiveStation101Modal(nextStation);
  };

  const isAllComplete = rubric.isPassed || rubric.totalScore >= 80;

  return (
    <>
      {/* Station 1 Modal */}
      {currentStation === 1 && (
        <Room101Mission1Modal
          onClose={handleClose}
          onNext={() => handleNext(2)}
        />
      )}

      {/* Station 2 Modal */}
      {currentStation === 2 && (
        <Room101Mission2Modal
          onClose={handleClose}
          onPrev={() => handleNext(1)}
          onNext={() => handleNext(3)}
        />
      )}

      {/* Station 3 Modal */}
      {currentStation === 3 && (
        <Room101Mission3Modal
          onClose={handleClose}
          onPrev={() => handleNext(2)}
          onNext={() => handleNext(4)}
        />
      )}

      {/* Station 4 Modal */}
      {currentStation === 4 && (
        <Room101Mission4Modal
          onClose={handleClose}
          onPrev={() => handleNext(3)}
          onNext={() => handleNext(5)}
        />
      )}

      {/* Station 5 Modal */}
      {currentStation === 5 && (
        <Room101Mission5Modal
          onClose={handleClose}
          onPrev={() => handleNext(4)}
          onCompleteAll={() => {
            handleClose();
            onCompletedMission?.(rubric);
          }}
        />
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
