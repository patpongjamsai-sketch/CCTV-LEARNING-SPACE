'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1DiagnosticPayload,
  Station2SignalQualityPayload,
  Station3MaintenancePayload,
  Room107LabSubmissionPayload,
  DEFAULT_DIAGNOSTIC_STEPS,
} from '../../../shared/domain/room107Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room107DiagnosticStationModal } from './Room107DiagnosticStationModal';
import { Room107SignalStationModal } from './Room107SignalStationModal';
import { Room107MaintenanceStationModal } from './Room107MaintenanceStationModal';

export interface Room107LabState {
  station1: Station1DiagnosticPayload;
  station2: Station2SignalQualityPayload;
  station3: Station3MaintenancePayload;
}

interface Room107TroubleshootingLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room107LabSubmissionPayload) => void;
}

const stationTitles: Record<1 | 2 | 3, string> = {
  1: 'Diagnostic Tree, แรงดันไฟตก และ NO VIDEO',
  2: 'คลื่นรบกวน Hum Bars และ Ground Loop Isolator',
  3: 'การบำรุงรักษาเชิงป้องกัน (PM) และ Service Report',
};

export const Room107TroubleshootingLab: React.FC<Room107TroubleshootingLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const smartTroubleshooting107 = useCctvTrainingStore((s) => s.smartTroubleshooting107);
  const activeStation107Store = useCctvTrainingStore((s) => s.activeStation107Modal);
  const setActiveStation107Store = useCctvTrainingStore((s) => s.setActiveStation107Modal);
  const setSmartTroubleshooting107Station1 = useCctvTrainingStore((s) => s.setSmartTroubleshooting107Station1);
  const setSmartTroubleshooting107Station2 = useCctvTrainingStore((s) => s.setSmartTroubleshooting107Station2);
  const setSmartTroubleshooting107Station3 = useCctvTrainingStore((s) => s.setSmartTroubleshooting107Station3);

  const [labState, setLabState] = useState<Room107LabState>({
    station1: smartTroubleshooting107?.station1Data || {
      faultDeviceId: 'CAM-03',
      diagnosticSteps: DEFAULT_DIAGNOSTIC_STEPS,
      measuredPoEVoltage: 42.5,
      nominalPoEVoltage: 48.0,
      cableDistanceMeters: 110,
      voltageDropDetected: true,
      selectedPowerAction: 'UPGRADE_EXTENDER',
      powerActionApplied: false,
      retestPoEVoltage: 50.2,
      noVideoResolved: false,
      score: smartTroubleshooting107?.station1Score || 0,
      isCompleted: smartTroubleshooting107?.station1Completed || false,
    },
    station2: smartTroubleshooting107?.station2Data || {
      symptomIdentified: 'ROLLING_HUM_BARS',
      rootCause: 'GROUND_LOOP_POTENTIAL_DIFF',
      groundPotentialDiffVolts: 2.4,
      groundLoopIsolatorModel: 'Passive Video Ground Loop Isolator BNC/RJ45',
      isolatorInstalled: false,
      installationPosition: 'CAMERA_END',
      waveformAnalyzed: false,
      retestVideoClean: false,
      humBarsResolved: false,
      score: smartTroubleshooting107?.station2Score || 0,
      isCompleted: smartTroubleshooting107?.station2Completed || false,
    },
    station3: smartTroubleshooting107?.station3Data || {
      lensInspection: {
        cleanDone: false,
        moistureChecked: false,
        focusCalibrated: false,
        waterproofGasketInspected: false,
      },
      pmChecklist: {
        powerMeasured: true,
        connectorSealed: true,
        cameraCleaned: false,
        nvrFirmwareChecked: true,
        recordingLogVerified: true,
      },
      faultLog: {
        problemDescription: 'CAM-03 ภาพไม่ขึ้น (NO VIDEO) และพบคลื่นลายเลื่อนในแนวนอน (Hum Bars 50Hz)',
        possibleCause: 'แรงดันตกปลายสายเหลือ 42.5V จากระยะสาย Cat5e 110ม. และความต่างศักย์กราวด์ 2.4VAC',
        testPerformed: 'ใช้ Multimeter วัดแรงดัน PoE และใช้ CCTV Tester ตรวจรูปคลื่นสัญญาณรบกวน',
        solutionApplied: 'ติดตั้ง PoE Extender ทวนกำลังไฟ และใส่ Ground Loop Isolator ตัดวงจรกราวด์',
        retestPassed: true,
        preventiveAction: 'กำหนดมาตรฐานใช้สาย Cat6 แกนทองแดงแท้ 23AWG และติดตั้ง Isolator ทุกจุดติดตั้งเสาไฟโลหะภายนอก',
      },
      pmChecklistSigned: false,
      technicianName: 'นายช่างเทคนิค CCTV',
      customerAcknowledged: true,
      score: smartTroubleshooting107?.station3Score || 0,
      isCompleted: smartTroubleshooting107?.station3Completed || false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(
    activeStation ?? activeStation107Store
  );

  useEffect(() => {
    if (activeStation !== undefined && activeStation !== currentStationModal) {
      setCurrentStationModal(activeStation);
    }
  }, [activeStation, currentStationModal]);

  useEffect(() => {
    if (activeStation107Store !== undefined && activeStation107Store !== currentStationModal) {
      setCurrentStationModal(activeStation107Store);
    }
  }, [activeStation107Store, currentStationModal]);

  const handleClose = () => {
    setCurrentStationModal(null);
    setActiveStation107Store(null);
    onCloseStation?.();
  };

  const handleSaveStation1 = (data: Station1DiagnosticPayload) => {
    setLabState((prev) => ({ ...prev, station1: data }));
    setSmartTroubleshooting107Station1(data);
  };

  const handleSaveStation2 = (data: Station2SignalQualityPayload) => {
    setLabState((prev) => ({ ...prev, station2: data }));
    setSmartTroubleshooting107Station2(data);
  };

  const handleSaveStation3 = (data: Station3MaintenancePayload) => {
    setLabState((prev) => ({ ...prev, station3: data }));
    setSmartTroubleshooting107Station3(data);
  };

  const s1Score = Math.max(labState.station1.score, smartTroubleshooting107?.station1Score || 0);
  const s2Score = Math.max(labState.station2.score, smartTroubleshooting107?.station2Score || 0);
  const s3Score = Math.max(labState.station3.score, smartTroubleshooting107?.station3Score || 0);
  const totalScore = s1Score + s2Score + s3Score;

  const isAllCompleted =
    (labState.station1.isCompleted || smartTroubleshooting107?.station1Completed) &&
    (labState.station2.isCompleted || smartTroubleshooting107?.station2Completed) &&
    (labState.station3.isCompleted || smartTroubleshooting107?.station3Completed);

  const handleFinalSubmit = () => {
    const submission: Room107LabSubmissionPayload = {
      roomId: 'room-107',
      unitNumber: 7,
      station1: labState.station1,
      station2: labState.station2,
      station3: labState.station3,
      totalScore,
      isPassed: totalScore >= 70 && isAllCompleted,
      faultDeviceId: 'CAM-03',
      step1PoEVoltageChecked: labState.station1.noVideoResolved,
      step1PoEVoltageValue: labState.station1.measuredPoEVoltage,
      step2GroundLoopIsolatorInstalled: labState.station2.isolatorInstalled,
      step3LensCleaned: labState.station3.lensInspection.cleanDone,
      step3PmChecklistSigned: labState.station3.pmChecklistSigned,
      resolvedFaults: ['NO_VIDEO', 'HUM_BARS'],
      totalHintsUsed: 0,
      submittedAt: new Date().toISOString(),
    };
    onCompletedMission?.(submission);
  };

  return (
    <div className="relative z-40">
      {/* Station Modals */}
      {currentStationModal === 1 && (
        <Room107DiagnosticStationModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 2 && (
        <Room107SignalStationModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 3 && (
        <Room107MaintenanceStationModal
          initialPayload={labState.station3}
          onSave={handleSaveStation3}
          onClose={handleClose}
        />
      )}

      {/* Quick Launch Station Bar (when no modal is active) */}
      {currentStationModal === null && (
        <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-20 flex justify-center gap-3">
          {([1, 2, 3] as const).map((station) => {
            const completed =
              station === 1
                ? labState.station1.isCompleted || smartTroubleshooting107?.station1Completed
                : station === 2
                ? labState.station2.isCompleted || smartTroubleshooting107?.station2Completed
                : labState.station3.isCompleted || smartTroubleshooting107?.station3Completed;

            const score =
              station === 1
                ? Math.max(labState.station1.score, smartTroubleshooting107?.station1Score || 0)
                : station === 2
                ? Math.max(labState.station2.score, smartTroubleshooting107?.station2Score || 0)
                : Math.max(labState.station3.score, smartTroubleshooting107?.station3Score || 0);

            const maxScore = station === 1 ? 40 : station === 2 ? 20 : 40;

            return (
              <button
                key={station}
                type="button"
                data-testid={`room107-station-${station}`}
                onClick={() => {
                  setCurrentStationModal(station);
                  setActiveStation107Store(station);
                }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                  completed
                    ? 'border-emerald-500/60 bg-slate-900/90 text-emerald-300 hover:border-emerald-400'
                    : 'border-rose-500/40 bg-slate-900/90 text-white hover:border-rose-400'
                }`}
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{completed ? '✓' : ''} Station {station}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({score}/{maxScore})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 truncate max-w-[170px]">
                    {stationTitles[station]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Completion Card when all 3 stations completed */}
      {isAllCompleted && currentStationModal === null && (
        <div className="fixed top-20 right-4 z-30 max-w-sm rounded-2xl border border-emerald-500/60 bg-slate-950/95 p-4 text-xs text-white shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
              <span>🎉</span>
              <span>ผ่านการแก้ไขปัญหา Room 107 ครบทุกข้อ!</span>
            </span>
            <span className="font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
              {totalScore}/100
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            เคลียร์ข้อผิดพลาด NO VIDEO, ติดตั้ง Ground Loop Isolator และบันทึก PM Checklist เรียบร้อย
          </p>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ✓ ยืนยันส่งผลการปฏิบัติการ Room 107
          </button>
        </div>
      )}
    </div>
  );
};
