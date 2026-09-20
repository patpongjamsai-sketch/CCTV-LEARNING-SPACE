'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1OnvifMappingPayload,
  Station2VideoCodecPayload,
  Station3RecordingFaultPayload,
  Room105LabSubmissionPayload,
  INITIAL_CHANNEL_MAPPINGS,
  ROOM105_ONVIF_CAMERA_CATALOG,
  ROOM105_FAULT_SCENARIOS,
} from '../../../shared/domain/room105Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room105OnvifStationModal } from './Room105OnvifStationModal';
import { Room105CodecStationModal } from './Room105CodecStationModal';
import { Room105RecordingFaultModal } from './Room105RecordingFaultModal';

export interface Room105LabState {
  station1: Station1OnvifMappingPayload;
  station2: Station2VideoCodecPayload;
  station3: Station3RecordingFaultPayload;
}

interface Room105NvrLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room105LabSubmissionPayload) => void;
}

export const Room105NvrLab: React.FC<Room105NvrLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const setActiveStation105Store = useCctvTrainingStore((s: any) => s.setActiveStation105Modal);
  const setSmartNvr105Station1 = useCctvTrainingStore((s: any) => s.setSmartNvr105Station1);
  const setSmartNvr105Station2 = useCctvTrainingStore((s: any) => s.setSmartNvr105Station2);
  const setSmartNvr105Station3 = useCctvTrainingStore((s: any) => s.setSmartNvr105Station3);
const defaultFaultScenario = ROOM105_FAULT_SCENARIOS[0];

if (!defaultFaultScenario) {
  throw new Error('ROOM105_FAULT_SCENARIOS must contain at least one scenario');
}
  const [labState, setLabState] = useState<Room105LabState>({
    station1: {
      onvifDiscovered: true,
      discoveredDeviceCount: ROOM105_ONVIF_CAMERA_CATALOG.length,
      channelMappings: INITIAL_CHANNEL_MAPPINGS,
      hasChannelCollision: false,
      totalAssignedChannels: 4,
      authSuccessCount: 4,
      score: 0,
      isCompleted: false,
    },
    station2: {
      selectedGlobalCodec: 'H.265',
      streamConfigs: {
        1: {
          channelNumber: 1,
          cameraName: 'CH 1: Dome 4K (Main Entrance)',
          mainStream: { codec: 'H.265', resolution: '3840x2160 (4K UHD)', frameRateFps: 25, bitrateKbps: 4096, bitrateMode: 'CBR' },
          subStream: { codec: 'H.265', resolution: '704x576 (D1)', frameRateFps: 15, bitrateKbps: 512, bitrateMode: 'VBR' },
          liveViewStatus: 'OPTIMAL',
        },
        2: {
          channelNumber: 2,
          cameraName: 'CH 2: Bullet IR (Warehouse)',
          mainStream: { codec: 'H.265', resolution: '2560x1440 (2K QHD)', frameRateFps: 25, bitrateKbps: 3072, bitrateMode: 'CBR' },
          subStream: { codec: 'H.265', resolution: '704x576 (D1)', frameRateFps: 15, bitrateKbps: 512, bitrateMode: 'VBR' },
          liveViewStatus: 'OPTIMAL',
        },
        3: {
          channelNumber: 3,
          cameraName: 'CH 3: PTZ Speed Dome (Parking)',
          mainStream: { codec: 'H.265', resolution: '1920x1080 (Full HD)', frameRateFps: 30, bitrateKbps: 2048, bitrateMode: 'VBR' },
          subStream: { codec: 'H.265', resolution: '704x576 (D1)', frameRateFps: 15, bitrateKbps: 512, bitrateMode: 'VBR' },
          liveViewStatus: 'OPTIMAL',
        },
        4: {
          channelNumber: 4,
          cameraName: 'CH 4: Corridor Dome (Floor 2)',
          mainStream: { codec: 'H.265', resolution: '1920x1080 (Full HD)', frameRateFps: 25, bitrateKbps: 2048, bitrateMode: 'CBR' },
          subStream: { codec: 'H.265', resolution: '704x576 (D1)', frameRateFps: 15, bitrateKbps: 512, bitrateMode: 'VBR' },
          liveViewStatus: 'OPTIMAL',
        },
      },
      storageSavingPercent: 52,
      estimatedTotalBitrateMbps: 13.26,
      estimatedDailyStorageGb: 139.8,
      bitrateReasoning: 'เลือกใช้ H.265 ร่วมกับ CBR เพื่อประหยัดแบนด์วิดท์มากกว่า 50% และรักษาความเสถียรบนเครือข่าย',
      liveViewVerified: true,
      multiSplitMode: '4-SPLIT',
      score: 0,
      isCompleted: false,
    },
    station3: {
      motionSensitivity: 75,
      motionGridActiveCellsCount: 12,
      privacyMaskList: [
        { id: 'MASK-01', nameTh: 'บดบังหน้าต่างบ้านพักข้างเคียง', channelNumber: 1, xPercent: 10, yPercent: 10, widthPercent: 25, heightPercent: 20 },
      ],
      recordingSchedule: [
        {
          day: 'MON',
          timeRanges: [
            { startHour: 0, endHour: 8, mode: 'MOTION' },
            { startHour: 8, endHour: 18, mode: 'CONTINUOUS' },
            { startHour: 18, endHour: 24, mode: 'MOTION' },
          ],
        },
      ],
      faultScenario: defaultFaultScenario,
      faultLog: {
        problemDescription: 'กล้อง CAM-02 หลุดการเชื่อมต่อ NVR แจ้งเตือน Account Locked หลังพยายามยืนยันตัวตนด้วยรหัสผิด',
        possibleCause: 'รหัสผ่าน ONVIF กล้องไม่ตรงกับที่บันทึกไว้ใน NVR ทำให้เกิด Brute-force Lockout',
        testMethod: 'ใช้ NVR Security Tool ตรวจสอบสถานะการเชื่อมต่อ และทดสอบ Ping IP 192.168.1.102',
        testResult: 'Ping ตอบสนองปกติ Latency 1.1ms แต่ Port 8000 ปฏิเสธการ Authentication',
        appliedSolution: 'ปลดล็อคผ่าน Account Security Menu และซิงค์ Master Password ของ NVR ไปยังกล้อง CAM-02',
        retestVerification: 'Retest สำเร็จ: กล้อง CAM-02 กลับมา Online ภาพสตรีมสดขึ้นปกติบน CH 2 ไม่พบ Packet Loss',
        retestPassed: true,
      },
      retestPassed: true,
      score: 0,
      isCompleted: false,
    },
  });

  const [currentStationModal, setCurrentStationModal] = useState<1 | 2 | 3 | null>(activeStation);

  useEffect(() => {
    if (activeStation !== undefined) {
      setCurrentStationModal(activeStation);
    }
  }, [activeStation]);

  const handleSaveStation1 = (payload: Station1OnvifMappingPayload) => {
    setLabState((prev) => ({
      ...prev,
      station1: { ...payload, isCompleted: true },
    }));
    setSmartNvr105Station1?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation105Store?.(null);
  };

  const handleSaveStation2 = (payload: Station2VideoCodecPayload) => {
    setLabState((prev) => ({
      ...prev,
      station2: { ...payload, isCompleted: true },
    }));
    setSmartNvr105Station2?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation105Store?.(null);
  };

  const handleSaveStation3 = (payload: Station3RecordingFaultPayload) => {
    setLabState((prev) => ({
      ...prev,
      station3: { ...payload, isCompleted: true },
    }));
    setSmartNvr105Station3?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation105Store?.(null);
  };

  const isAllComplete =
    labState.station1.isCompleted &&
    labState.station2.isCompleted &&
    labState.station3.isCompleted;

  const totalScore =
    (labState.station1.score || 0) +
    (labState.station2.score || 0) +
    (labState.station3.score || 0);

  const handleFinalizeAll = () => {
    const submissionPayload: Room105LabSubmissionPayload = {
      roomId: 'room-105',
      unitNumber: 5,
      theme: 'DVR/NVR Configuration, ONVIF & Video Compression Management',
      station1: labState.station1,
      station2: labState.station2,
      station3: labState.station3,
      clientScore: totalScore,
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
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 border border-purple-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur text-white flex items-center gap-4 animate-bounce">
          <div>
            <div className="text-xs font-bold text-purple-400">ครบทั้ง 3 สถานี Room 105 แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนรวม: <span className="text-emerald-400 font-bold">{totalScore}</span>/100
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ส่งผลปฏิบัติการ Room 105
          </button>
        </div>
      )}

      {/* Modal 1: ONVIF Discovery & Channel Mapping */}
      {currentStationModal === 1 && (
        <Room105OnvifStationModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation105Store?.(null);
          }}
        />
      )}

      {/* Modal 2: Video Compression, Bitrate & Live View */}
      {currentStationModal === 2 && (
        <Room105CodecStationModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation105Store?.(null);
          }}
        />
      )}

      {/* Modal 3: Motion Grid, Privacy Mask, Schedule & Fault Retest */}
      {currentStationModal === 3 && (
        <Room105RecordingFaultModal
          initialPayload={labState.station3}
          onSave={handleSaveStation3}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation105Store?.(null);
          }}
        />
      )}
    </>
  );
};
