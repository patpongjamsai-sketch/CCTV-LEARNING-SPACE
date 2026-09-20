'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1ProjectPlanningPayload,
  Station2CommissioningPayload,
  Station3HandoverPayload,
  Room108LabSubmissionPayload,
  ROOM108_CAPSTONE_BOM_CATALOG,
} from '../../../shared/domain/room108Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room108ProjectPlanningModal } from './Room108ProjectPlanningModal';
import { Room108CommissioningModal } from './Room108CommissioningModal';
import { Room108HandoverModal } from './Room108HandoverModal';

export interface Room108LabState {
  station1: Station1ProjectPlanningPayload;
  station2: Station2CommissioningPayload;
  station3: Station3HandoverPayload;
}

interface Room108CapstoneLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room108LabSubmissionPayload) => void;
}

const stationTitles: Record<1 | 2 | 3, string> = {
  1: 'ความต้องการลูกค้า, ผังอาคาร และบัญชีวัสดุ (BOM)',
  2: 'ทดสอบระบบรวมศูนย์, Live View & ไฟสำรอง UPS',
  3: 'ส่งมอบโครงการ, อบรมผู้ใช้ และลงนาม Handover',
};

export const Room108CapstoneLab: React.FC<Room108CapstoneLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const smartCapstone108 = useCctvTrainingStore((s) => s.smartCapstone108);
  const activeStation108Store = useCctvTrainingStore((s) => s.activeStation108Modal);
  const setActiveStation108Store = useCctvTrainingStore((s) => s.setActiveStation108Modal);
  const setSmartCapstone108Station1 = useCctvTrainingStore((s) => s.setSmartCapstone108Station1);
  const setSmartCapstone108Station2 = useCctvTrainingStore((s) => s.setSmartCapstone108Station2);
  const setSmartCapstone108Station3 = useCctvTrainingStore((s) => s.setSmartCapstone108Station3);

  const [labState, setLabState] = useState<Room108LabState>({
    station1: smartCapstone108?.station1Data || {
      projectName: 'โครงการติดตั้งระบบกล้องวงจรปิดอัจฉริยะ Smart Mart',
      customerName: 'บริษัท สมาร์ท มาร์ท รีเทล จำกัด',
      siteLocation: 'ห้างสรรพสินค้า Smart Mart สาขาใหญ่ (2 ชั้น)',
      customerRequirementBrief: 'ระบบ CCTV 8 กล้อง, PoE Switch, 4K NVR, 8TB HDD และ UPS',
      cameraCount: 8,
      floorPlanCoverageChecked: true,
      floorPlanZones: [],
      bomItems: ROOM108_CAPSTONE_BOM_CATALOG,
      totalEstimatedBudgetThb: 58500,
      compatibilityNotes: 'ตรวจ PoE 64W/120W, Bandwidth 32/80Mbps, Storage 8TB ผ่านการประเมิน',
      bomApproved: false,
      score: smartCapstone108?.station1Score || 0,
      isCompleted: smartCapstone108?.station1Completed || false,
    },
    station2: smartCapstone108?.station2Data || {
      hardwareRackMounted: true,
      poeSwitchPowerBudgetChecked: true,
      cameraOnline: true,
      nvrReachable: true,
      liveViewActive: true,
      recordingActive: true,
      remoteAccessOnline: true,
      upsFailoverTested: false,
      cyberHardeningVerified: true,
      commissioningChecks: {
        cameraOnline: true,
        nvrReachable: true,
        liveViewActive: true,
        recordingActive: true,
        remoteAccessOnline: true,
        upsBackupOk: false,
        passwordsHardened: true,
      },
      commissioningNotes: 'กล้องและ NVR ออนไลน์พร้อมใช้งาน รอการทดสอบสลับไฟ UPS',
      score: smartCapstone108?.station2Score || 0,
      isCompleted: smartCapstone108?.station2Completed || false,
    },
    station3: smartCapstone108?.station3Data || {
      asBuiltDocumentationAttached: true,
      ipAddressSchemeSummary: '192.168.1.101 - .108',
      userTrainingCompleted: true,
      trainingTopics: [],
      punchListItemsCount: 0,
      punchListResolved: true,
      warrantyPeriodYears: 2,
      customerRepresentativeName: 'คุณสมศักดิ์ ผู้จัดการสาขา Smart Mart',
      leadTechnicianName: 'นายช่างผู้รับผิดชอบโครงการ CCTV',
      handoverCertificateSigned: false,
      handoverSignedDate: new Date().toLocaleDateString('th-TH'),
      projectDefenseSummary: 'ระบบติดตั้งครบถ้วนตาม Acceptance Criteria',
      score: smartCapstone108?.station3Score || 0,
      isCompleted: smartCapstone108?.station3Completed || false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(
    activeStation || activeStation108Store || null
  );

  useEffect(() => {
    if (activeStation !== null && activeStation !== undefined) {
      setCurrentStationModal(activeStation);
    } else if (activeStation108Store !== null && activeStation108Store !== undefined) {
      setCurrentStationModal(activeStation108Store);
    }
  }, [activeStation, activeStation108Store]);

  const handleClose = () => {
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation108Store(null);
  };

  const handleSaveStation1 = (payload: Station1ProjectPlanningPayload) => {
    setLabState((prev) => ({
      ...prev,
      station1: { ...payload, isCompleted: true },
    }));
    setSmartCapstone108Station1(payload);
    handleClose();
  };

  const handleSaveStation2 = (payload: Station2CommissioningPayload) => {
    setLabState((prev) => ({
      ...prev,
      station2: { ...payload, isCompleted: true },
    }));
    setSmartCapstone108Station2(payload);
    handleClose();
  };

  const handleSaveStation3 = (payload: Station3HandoverPayload) => {
    setLabState((prev) => ({
      ...prev,
      station3: { ...payload, isCompleted: true },
    }));
    setSmartCapstone108Station3(payload);
    handleClose();
  };

  const isAllComplete =
    (labState.station1.isCompleted || smartCapstone108?.station1Completed) &&
    (labState.station2.isCompleted || smartCapstone108?.station2Completed) &&
    (labState.station3.isCompleted || smartCapstone108?.station3Completed);

  const totalScore =
    Math.max(labState.station1.score, smartCapstone108?.station1Score || 0) +
    Math.max(labState.station2.score, smartCapstone108?.station2Score || 0) +
    Math.max(labState.station3.score, smartCapstone108?.station3Score || 0);

  const handleFinalizeAll = () => {
    const submissionPayload: Room108LabSubmissionPayload = {
      roomId: 'room-108',
      unitNumber: 8,
      theme: 'Integrated CCTV Capstone, Commissioning & Handover',
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
      {/* Floating Capstone Completion Banner */}
      {isAllComplete && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce">
          <div>
            <div className="text-xs font-bold text-amber-400">ครบทั้ง 3 ส่วนของ Capstone แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนโครงการ: <span className="text-emerald-400 font-bold">{totalScore}</span>/85
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ส่งมอบโครงการ Capstone Room 108
          </button>
        </div>
      )}

      {/* Station Modals */}
      {currentStationModal === 1 && (
        <Room108ProjectPlanningModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 2 && (
        <Room108CommissioningModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={handleClose}
        />
      )}

      {currentStationModal === 3 && (
        <Room108HandoverModal
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
                ? labState.station1.isCompleted || smartCapstone108?.station1Completed
                : station === 2
                ? labState.station2.isCompleted || smartCapstone108?.station2Completed
                : labState.station3.isCompleted || smartCapstone108?.station3Completed;

            const score =
              station === 1
                ? Math.max(labState.station1.score, smartCapstone108?.station1Score || 0)
                : station === 2
                ? Math.max(labState.station2.score, smartCapstone108?.station2Score || 0)
                : Math.max(labState.station3.score, smartCapstone108?.station3Score || 0);

            const maxScore = station === 1 ? 20 : station === 2 ? 40 : 25;

            return (
              <button
                key={station}
                type="button"
                data-testid={`room108-station-${station}`}
                onClick={() => {
                  setCurrentStationModal(station);
                  setActiveStation108Store(station);
                }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                  completed
                    ? 'border-emerald-500/60 bg-slate-900/90 text-emerald-300 hover:border-emerald-400'
                    : 'border-amber-500/40 bg-slate-900/90 text-white hover:border-amber-400'
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
