'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1Payload,
  Station2Payload,
  Station3Payload,
  Room103LabSubmissionPayload,
  T568B_COLOR_SEQUENCE,
  Room103LabState,
} from '../../../shared/domain/room103Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room103PinoutStationModal } from './Room103PinoutStationModal';
import { Room103CablingSelectionModal } from './Room103CablingSelectionModal';
import { Room103DiagnosticModal } from './Room103DiagnosticModal';

export type { Room103LabState };

interface Room103CablingLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room103LabSubmissionPayload) => void;
}

export const Room103CablingLab: React.FC<Room103CablingLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const setActiveStation103Store = useCctvTrainingStore((s) => s.setActiveStation103Modal);
  const setSmartCabling103Station1 = useCctvTrainingStore((s) => s.setSmartCabling103Station1);
  const setSmartCabling103Station2 = useCctvTrainingStore((s) => s.setSmartCabling103Station2);
  const setSmartCabling103Station3 = useCctvTrainingStore((s) => s.setSmartCabling103Station3);

  const [labState, setLabState] = useState<Room103LabState>({
    station1: {
      wireSequence: [...T568B_COLOR_SEQUENCE],
      strippingLengthMm: 14,
      jacketUnderStrainRelief: true,
      rj45Crimped: false,
      coaxialStrippedProperly: true,
      bncType: 'COMPRESSION',
      centerPinShortShieldCheck: false,
      bncCrimped: false,
      cableId: 'CAM-01-UTP',
      sourceLabel: 'Rack-01 / Patch Panel Port 08',
      destLabel: 'Outdoor Gate Bullet Cam 01',
      labelMatches: true,
      safetyChecklist: {
        cutSafetyGloves: true,
        eyeProtection: true,
        cleanWorkArea: true,
      },
      score: 0,
      isCompleted: false,
    },
    station2: {
      selectedOptions: {
        ZONE_OVER_AIR: 'UTP_OUTDOOR_MESSENGER',
        ZONE_MOTOR_EMI: 'STP_FTP_SHIELDED',
        ZONE_LONG_450M: 'FIBER_SINGLEMODE',
        ZONE_RAIN_EXPOSED: 'JUNCTION_BOX_IP66_GLAND',
        ZONE_ANALOG_200M: 'COAX_RG6_SOLID_COPPER',
      },
      routeSafety: {
        avoidHeatSource: true,
        respectBendRadius: true,
        separateHighVoltagePower: true,
      },
      waterproofing: {
        junctionBoxMounted: true,
        cableGlandTightened: true,
        downwardDripLoop: true,
      },
      labelingAndSafety: {
        sourceDestLabelsApplied: true,
        cableTiesOrganized: true,
        ppeSafetyChecklistPassed: true,
      },
      score: 0,
      isCompleted: false,
    },
    station3: {
      case1Testing: {
        selectedUtpTool: 'CABLE_TESTER',
        selectedCoaxTool: 'MULTIMETER_CONTINUITY',
        identifiedFaultType: 'CROSSED_AND_OPEN',
        faultExplanation: 'ตรวจพบพิน 3 และ 6 สลับคู่ (Crossed Pair) และพิน 7-8 ขาดวงจร (Open)',
        retestPassed: true,
        score: 10,
      },
      case2PoEBudget: {
        switchPoEBudgetWatts: 65,
        cameraWattage: 8,
        accessoriesWattage: 5,
        safetyMarginPercent: 20,
        cameraCount: 4,
        calculatedWattsPerCamera: 15.6,
        calculatedTotalSystemWatts: 62.4,
        isBudgetSufficient: true,
        score: 10,
      },
      case3CcaEmi: {
        ccaResistanceAnswer: '',
        emiNoiseAnswer: '',
        groundingSolutionAnswer: '',
        keywordsFound: [],
        score: 10,
      },
      totalScore: 0,
      isCompleted: false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(activeStation);

  useEffect(() => {
    if (activeStation !== undefined) {
      setCurrentStationModal(activeStation);
    }
  }, [activeStation]);

  const handleSaveStation1 = (payload: Station1Payload) => {
    setLabState((prev) => ({
      ...prev,
      station1: {
        ...payload,
        isCompleted: true,
      },
    }));
    setSmartCabling103Station1(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation103Store(null);
  };

  const handleSaveStation2 = (payload: Station2Payload) => {
    setLabState((prev) => ({
      ...prev,
      station2: {
        ...payload,
        isCompleted: true,
      },
    }));
    setSmartCabling103Station2(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation103Store(null);
  };

  const handleSaveStation3 = (payload: Station3Payload) => {
    setLabState((prev) => ({
      ...prev,
      station3: {
        ...payload,
        isCompleted: true,
      },
    }));
    setSmartCabling103Station3(payload.totalScore || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation103Store(null);
  };

  const isAllComplete =
    labState.station1.isCompleted &&
    labState.station2.isCompleted &&
    labState.station3.isCompleted;

  const totalScore =
    (labState.station1.score || 0) +
    (labState.station2.score || 0) +
    (labState.station3.totalScore || 0);

  const handleFinalizeAll = () => {
    const submissionPayload: Room103LabSubmissionPayload = {
      roomId: 'room-103',
      unitNumber: 3,
      theme: 'CCTV Cabling, Termination & RJ45 Workshop',
      station1: labState.station1,
      station2: labState.station2,
      station3: labState.station3,
      finalScore: totalScore,
      passed: totalScore >= 70,
      timestamp: new Date().toISOString(),
    };

    onCompletedMission?.(submissionPayload);
  };

  return (
    <>
      {/* Completion Floating Bar */}
      {isAllComplete && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-sky-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce">
          <div>
            <div className="text-xs font-bold text-sky-400">ครบทั้ง 3 สถานี Room 103 แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนรวม: <span className="text-emerald-400 font-bold">{totalScore}</span>/100
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ส่งผลปฏิบัติการ Room 103
          </button>
        </div>
      )}

      {/* Modal 1: Termination & RJ45/BNC */}
      {currentStationModal === 1 && (
        <Room103PinoutStationModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation103Store?.(null);
          }}
        />
      )}

      {/* Modal 2: Cable Selection & Environmental Zones */}
      {currentStationModal === 2 && (
        <Room103CablingSelectionModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation103Store?.(null);
          }}
        />
      )}

      {/* Modal 3: Diagnostics, PoE Budget & Root Cause Analysis */}
      {currentStationModal === 3 && (
        <Room103DiagnosticModal
          initialPayload={labState.station3}
          onSave={handleSaveStation3}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation103Store?.(null);
          }}
        />
      )}
    </>
  );
};
