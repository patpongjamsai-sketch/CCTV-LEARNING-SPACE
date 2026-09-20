'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1StorageCalculationPayload,
  Station2HddManagementPayload,
  Station3RemoteAccessPayload,
  Room106LabSubmissionPayload,
} from '../../../shared/domain/room106Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room106StorageCalculationModal } from './Room106StorageCalculationModal';
import { Room106HddManagementModal } from './Room106HddManagementModal';
import { Room106RemoteAccessModal } from './Room106RemoteAccessModal';

export interface Room106LabState {
  station1: Station1StorageCalculationPayload;
  station2: Station2HddManagementPayload;
  station3: Station3RemoteAccessPayload;
}

interface Room106StorageLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room106LabSubmissionPayload) => void;
}

const stationTitles: Record<1 | 2 | 3, string> = {
  1: 'คำนวณพื้นที่จัดเก็บและ Retention Days',
  2: 'จัดการ Surveillance HDD และการ Format / Initialize',
  3: 'กำหนดค่า Cloud P2P Remote Viewing & QR Code Pairing',
};

export const Room106StorageLab: React.FC<Room106StorageLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const smartStorage106 = useCctvTrainingStore((s) => s.smartStorage106);
  const activeStation106Store = useCctvTrainingStore((s) => s.activeStation106Modal);
  const setActiveStation106Store = useCctvTrainingStore((s) => s.setActiveStation106Modal);
  const setSmartStorage106Station1 = useCctvTrainingStore((s) => s.setSmartStorage106Station1);
  const setSmartStorage106Station2 = useCctvTrainingStore((s) => s.setSmartStorage106Station2);
  const setSmartStorage106Station3 = useCctvTrainingStore((s) => s.setSmartStorage106Station3);

  const [labState, setLabState] = useState<Room106LabState>({
    station1: smartStorage106?.station1Data || {
      cameraCount: 8,
      resolution: '1080p (1920x1080)',
      codec: 'H.264',
      bitrateMbps: 4.0,
      recordingHoursPerDay: 24,
      retentionDays: 30,
      calculatedDailyGb: 337.5,
      calculatedTotalTb: 7.72,
      recommendedCapacityTb: 8,
      capacityReasoning:
        'ระบบกล้อง 8 ตัว บันทึก 24/7 ที่ 4 Mbps นาน 30 วัน ต้องการพื้นที่ ~7.72 TB จึงจำเป็นต้องใช้ฮาร์ดดิสก์ขนาด 8TB เพื่อรองรับ File System Overhead',
      score: smartStorage106?.station1Score || 0,
      isCompleted: smartStorage106?.station1Completed || false,
    },
    station2: smartStorage106?.station2Data || {
      selectedHddId: 'HDD-SURV-8TB',
      selectedHddCapacity: '8TB',
      hddGrade: 'Surveillance',
      isSataCableConnected: true,
      isSmartCheckPassed: true,
      smartStatus: {
        powerOnHours: 120,
        badSectors: 0,
        temperatureC: 34,
        healthPercent: 100,
      },
      hddFormatted: false,
      hddInitialized: false,
      selectedRaidMode: 'NONE',
      score: smartStorage106?.station2Score || 0,
      isCompleted: smartStorage106?.station2Completed || false,
    },
    station3: smartStorage106?.station3Data || {
      cloudP2pEnabled: true,
      cloudP2pStatus: 'OFFLINE',
      networkDiagnostics: {
        gatewayOk: true,
        dnsServer: '0.0.0.0',
        internetOk: false,
      },
      mobileQrScanned: false,
      pairedDeviceSerial: 'NVR-2026-X8801',
      liveStreamTested: false,
      resolvedFaultId: 'FLT-106-DNS-OFFLINE',
      score: smartStorage106?.station3Score || 0,
      isCompleted: smartStorage106?.station3Completed || false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(
    activeStation || activeStation106Store || null
  );

  useEffect(() => {
    if (activeStation !== null && activeStation !== undefined) {
      setCurrentStationModal(activeStation);
    } else if (activeStation106Store !== null && activeStation106Store !== undefined) {
      setCurrentStationModal(activeStation106Store);
    }
  }, [activeStation, activeStation106Store]);

  const handleClose = () => {
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation106Store(null);
  };

  const handleSaveStation1 = (payload: Station1StorageCalculationPayload) => {
    setLabState((prev) => ({
      ...prev,
      station1: { ...payload, isCompleted: true },
    }));
    setSmartStorage106Station1(payload);
    handleClose();
  };

  const handleSaveStation2 = (payload: Station2HddManagementPayload) => {
    setLabState((prev) => ({
      ...prev,
      station2: { ...payload, isCompleted: true },
    }));
    setSmartStorage106Station2(payload);
    handleClose();
  };

  const handleSaveStation3 = (payload: Station3RemoteAccessPayload) => {
    setLabState((prev) => ({
      ...prev,
      station3: { ...payload, isCompleted: true },
    }));
    setSmartStorage106Station3(payload);
    handleClose();
  };

  const isAllComplete =
    (labState.station1.isCompleted || smartStorage106?.station1Completed) &&
    (labState.station2.isCompleted || smartStorage106?.station2Completed) &&
    (labState.station3.isCompleted || smartStorage106?.station3Completed);

  const totalScore =
    Math.max(labState.station1.score, smartStorage106?.station1Score || 0) +
    Math.max(labState.station2.score, smartStorage106?.station2Score || 0) +
    Math.max(labState.station3.score, smartStorage106?.station3Score || 0);

  const handleFinalizeAll = () => {
    const submissionPayload: Room106LabSubmissionPayload = {
      roomId: 'room-106',
      unitNumber: 6,
      station1: labState.station1,
      station2: labState.station2,
      station3: labState.station3,
      totalScore,
      totalHintsUsed: 0,
      timestamp: new Date().toISOString(),
    };

    onCompletedMission?.(submissionPayload);
  };

  return (
    <>
      {/* Floating Completion Banner */}
      {isAllComplete && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-sky-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce">
          <div>
            <div className="text-xs font-bold text-sky-400">ครบทั้ง 3 สถานี Room 106 แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนรวม: <span className="text-emerald-400 font-bold">{totalScore}</span>/100
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ส่งผลปฏิบัติการ Room 106
          </button>
        </div>
      )}

      {/* Station Modals */}
      {currentStationModal === 1 && (
        <Room106StorageCalculationModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 2 && (
        <Room106HddManagementModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 3 && (
        <Room106RemoteAccessModal
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
                ? labState.station1.isCompleted || smartStorage106?.station1Completed
                : station === 2
                ? labState.station2.isCompleted || smartStorage106?.station2Completed
                : labState.station3.isCompleted || smartStorage106?.station3Completed;

            const score =
              station === 1
                ? Math.max(labState.station1.score, smartStorage106?.station1Score || 0)
                : station === 2
                ? Math.max(labState.station2.score, smartStorage106?.station2Score || 0)
                : Math.max(labState.station3.score, smartStorage106?.station3Score || 0);

            const maxScore = station === 1 ? 20 : 40;

            return (
              <button
                key={station}
                type="button"
                data-testid={`room106-station-${station}`}
                onClick={() => {
                  setCurrentStationModal(station);
                  setActiveStation106Store(station);
                }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                  completed
                    ? 'border-emerald-500/60 bg-slate-900/90 text-emerald-300 hover:border-emerald-400'
                    : 'border-sky-500/40 bg-slate-900/90 text-white hover:border-sky-400'
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
    </>
  );
};
