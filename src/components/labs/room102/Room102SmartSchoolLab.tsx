'use client';

import React, { useState } from 'react';
import {
  OutdoorSpotId,
  IndoorSpotId,
  Room102CameraId,
} from '../../../shared/domain/room102Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room102OutdoorStationModal } from './Room102OutdoorStationModal';
import { Room102IndoorStationModal } from './Room102IndoorStationModal';
import { Room102WrittenAnalysisModal } from './Room102WrittenAnalysisModal';

export interface Room102LabState {
  station1Outdoor: {
    placements: Partial<Record<OutdoorSpotId, Room102CameraId>>;
    score: number;
    isCompleted: boolean;
  };
  station2Indoor: {
    placements: Partial<Record<IndoorSpotId, Room102CameraId>>;
    privacyMask: boolean;
    score: number;
    isCompleted: boolean;
  };
  station3Written: {
    case1Answer: string;
    case2Answer: string;
    case1Score: number;
    case2Score: number;
    totalScore: number;
    keywordsFound: string[];
    isCompleted: boolean;
  };
}

interface Room102SmartSchoolLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: any) => void;
}

export const Room102SmartSchoolLab: React.FC<Room102SmartSchoolLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const setStation1Store = useCctvTrainingStore((s) => s.setSmartSchool102Station1);
  const setStation2Store = useCctvTrainingStore((s) => s.setSmartSchool102Station2);
  const setStation3Store = useCctvTrainingStore((s) => s.setSmartSchool102Station3);

  const [labState, setLabState] = useState<Room102LabState>({
    station1Outdoor: {
      placements: {},
      score: 0,
      isCompleted: false,
    },
    station2Indoor: {
      placements: {},
      privacyMask: false,
      score: 0,
      isCompleted: false,
    },
    station3Written: {
      case1Answer: '',
      case2Answer: '',
      case1Score: 0,
      case2Score: 0,
      totalScore: 0,
      keywordsFound: [],
      isCompleted: false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(activeStation);

  // Sync prop changes
  React.useEffect(() => {
    if (activeStation !== undefined) {
      setCurrentStationModal(activeStation);
    }
  }, [activeStation]);

  const handleSaveStation1 = (
    placements: Record<OutdoorSpotId, Room102CameraId>,
    score: number
  ) => {
    setLabState((prev) => ({
      ...prev,
      station1Outdoor: {
        placements,
        score,
        isCompleted: true,
      },
    }));
    setStation1Store(score);
    setCurrentStationModal(null);
    onCloseStation?.();
  };

  const handleSaveStation2 = (
    placements: Record<IndoorSpotId, Room102CameraId>,
    privacyMask: boolean,
    score: number
  ) => {
    setLabState((prev) => ({
      ...prev,
      station2Indoor: {
        placements,
        privacyMask,
        score,
        isCompleted: true,
      },
    }));
    setStation2Store(score);
    setCurrentStationModal(null);
    onCloseStation?.();
  };

  const handleSaveStation3 = (data: {
    case1Answer: string;
    case2Answer: string;
    case1Score: number;
    case2Score: number;
    totalScore: number;
    keywordsFound: string[];
  }) => {
    setLabState((prev) => ({
      ...prev,
      station3Written: {
        ...data,
        isCompleted: true,
      },
    }));
    setStation3Store({
      case1Answer: data.case1Answer,
      case2Answer: data.case2Answer,
      score: data.totalScore,
      keywordsFound: data.keywordsFound,
    });
    setCurrentStationModal(null);
    onCloseStation?.();
  };

  const isAllComplete =
    labState.station1Outdoor.isCompleted &&
    labState.station2Indoor.isCompleted &&
    labState.station3Written.isCompleted;

  // Total Unit 2 score out of 100:
  // Station 1 = 35% weight, Station 2 = 35% weight, Station 3 = 30% weight
  const finalWeightedScore = Math.round(
    (labState.station1Outdoor.score * 0.35) +
    (labState.station2Indoor.score * 0.35) +
    (labState.station3Written.totalScore / 30 * 30)
  );

  const handleFinalizeAll = () => {
    const submissionPayload = {
      roomId: 'room-102',
      unitNumber: 2,
      theme: 'Smart School CCTV System',
      station1Outdoor: labState.station1Outdoor,
      station2Indoor: labState.station2Indoor,
      station3Written: labState.station3Written,
      finalScore: finalWeightedScore,
      passed: finalWeightedScore >= 70,
      timestamp: new Date().toISOString(),
    };

    onCompletedMission?.(submissionPayload);
  };

  return (
    <>
      {isAllComplete && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-emerald-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce">
          <div>
            <div className="text-xs font-bold text-emerald-400">ครบทั้ง 3 สถานีแล้ว!</div>
            <div className="text-sm font-semibold">คะแนนรวม: {finalWeightedScore}/100</div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            ส่งผลปฏิบัติการ
          </button>
        </div>
      )}

      {/* Modal 1: Outdoor */}
      {currentStationModal === 1 && (
        <Room102OutdoorStationModal
          initialPlacements={labState.station1Outdoor.placements}
          onSave={handleSaveStation1}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
          }}
        />
      )}

      {/* Modal 2: Indoor */}
      {currentStationModal === 2 && (
        <Room102IndoorStationModal
          initialPlacements={labState.station2Indoor.placements}
          initialPrivacyMask={labState.station2Indoor.privacyMask}
          onSave={handleSaveStation2}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
          }}
        />
      )}

      {/* Modal 3: Written */}
      {currentStationModal === 3 && (
        <Room102WrittenAnalysisModal
          initialAnswers={{
            case1Answer: labState.station3Written.case1Answer,
            case2Answer: labState.station3Written.case2Answer,
          }}
          onSave={handleSaveStation3}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
          }}
        />
      )}
    </>
  );
};
