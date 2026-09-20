'use client';

import React, { useState, useEffect } from 'react';
import {
  Station1NetworkPlanPayload,
  Station2NetworkConfigPayload,
  Station3TroubleshootingPayload,
  Room104LabSubmissionPayload,
  INITIAL_ROOM104_IP_TABLE,
} from '../../../shared/domain/room104Types';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room104IpPlanningModal } from './Room104IpPlanningModal';
import { Room104NetworkConfigModal } from './Room104NetworkConfigModal';
import { Room104TroubleshootingModal } from './Room104TroubleshootingModal';

export interface Room104LabState {
  station1: Station1NetworkPlanPayload;
  station2: Station2NetworkConfigPayload;
  station3: Station3TroubleshootingPayload;
}

interface Room104NetworkingLabProps {
  activeStation?: 1 | 2 | 3 | null;
  onCloseStation?: () => void;
  onCompletedMission?: (submission: Room104LabSubmissionPayload) => void;
}

export const Room104NetworkingLab: React.FC<Room104NetworkingLabProps> = ({
  activeStation = null,
  onCloseStation,
  onCompletedMission,
}) => {
  const setActiveStation104Store = useCctvTrainingStore((s: any) => s.setActiveStation104Modal);
  const setSmartNetwork104Station1 = useCctvTrainingStore((s: any) => s.setSmartNetwork104Station1);
  const setSmartNetwork104Station2 = useCctvTrainingStore((s: any) => s.setSmartNetwork104Station2);
  const setSmartNetwork104Station3 = useCctvTrainingStore((s: any) => s.setSmartNetwork104Station3);

  const [labState, setLabState] = useState<Room104LabState>({
    station1: {
      networkAddress: '192.168.1.0',
      subnetMask: '255.255.255.0',
      cidrPrefix: 24,
      defaultGateway: '192.168.1.1',
      dnsServer: '8.8.8.8',
      totalUsableHosts: 254,
      ipAddressTable: INITIAL_ROOM104_IP_TABLE,
      ipConflictDetected: false,
      methodReasoning:
        'ใช้ Static IP สำหรับ Gateway, Switch และ NVR เพื่อความแน่นอนในการสื่อสาร ส่วนกล้อง IP ใช้ DHCP Reservation โดยผูก MAC Address เข้ากับ IP เพื่อป้องกัน IP หลุดหรือเปลี่ยนเมื่อ Reboot',
      score: 0,
      isCompleted: false,
    },
    station2: {
      configuredDevices: {
        'NVR-01': { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'STATIC' },
        'CAM-01': { ipAddress: '192.168.1.101', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' },
        'CAM-02': { ipAddress: '192.168.1.102', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' },
        'CAM-03': { ipAddress: '192.168.1.103', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'STATIC' },
        'CAM-04': { ipAddress: '192.168.1.104', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1', dns: '8.8.8.8', method: 'DHCP_RESERVATION' },
      },
      pingLogs: [
        { targetIp: '192.168.1.101', targetDevice: 'CAM-01', packetsSent: 4, packetsReceived: 4, packetLossPercent: 0, avgLatencyMs: 1.2, status: 'SUCCESS' },
        { targetIp: '192.168.1.1', targetDevice: 'Gateway', packetsSent: 4, packetsReceived: 4, packetLossPercent: 0, avgLatencyMs: 0.8, status: 'SUCCESS' },
      ],
      arpEntries: [
        { ipAddress: '192.168.1.1', macAddress: '00:1A:2B:3C:4D:01', type: 'STATIC' },
        { ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:10', type: 'STATIC' },
        { ipAddress: '192.168.1.101', macAddress: '00:1A:2B:3C:4D:A1', type: 'DYNAMIC' },
      ],
      dnsLookup: { queryHostname: 'cctv-nvr.campus.local', resolvedIp: '192.168.1.10', status: 'SUCCESS' },
      poeBudget: { switchCapacityWatts: 65, connectedLoadWatts: 48, safetyMarginWatts: 10, isLoadBalanced: true, isOverloaded: false },
      score: 0,
      isCompleted: false,
    },
    station3: {
      selectedFaultScenario: {
        faultId: 'FAULT_IP_CONFLICT',
        titleTh: 'กรณีศึกษา 1: กล้อง CAM-02 เกิด IP Conflict ชนกับ NVR',
        symptomTh: 'หน้าจอ NVR แสดงข้อความ IP Conflict 192.168.1.10 และกล้อง CAM-02 หลุด',
        affectedDevice: 'CAM-02',
        wrongConfig: { field: 'ipAddress', value: '192.168.1.10', correctValue: '192.168.1.102' },
      },
      faultLog: {
        problemDescription: 'ตรวจพบ IP Conflict บนเครือข่าย',
        evidenceCollected: ['IP Config', 'Ping Test'],
        rootCauseIdentified: 'ตั้ง IP ชนกับ NVR',
        appliedSolution: 'เปลี่ยนเป็น 192.168.1.102',
        postFixVerification: 'Ping สำเร็จ Loss 0%',
        retestPassed: true,
        preventativeMeasures: 'ทำตาราง IP Address Table อ้างอิง',
      },
      evidenceToolsUsed: { ipConfigChecked: true, pingVerified: true, arpTableChecked: true, poeLoadChecked: true },
      retestLogs: [{ targetIp: '192.168.1.102', targetDevice: 'CAM-02', packetsSent: 4, packetsReceived: 4, packetLossPercent: 0, avgLatencyMs: 1.1, status: 'SUCCESS' }],
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

  const handleSaveStation1 = (payload: Station1NetworkPlanPayload) => {
    setLabState((prev) => ({
      ...prev,
      station1: { ...payload, isCompleted: true },
    }));
    setSmartNetwork104Station1?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation104Store?.(null);
  };

  const handleSaveStation2 = (payload: Station2NetworkConfigPayload) => {
    setLabState((prev) => ({
      ...prev,
      station2: { ...payload, isCompleted: true },
    }));
    setSmartNetwork104Station2?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation104Store?.(null);
  };

  const handleSaveStation3 = (payload: Station3TroubleshootingPayload) => {
    setLabState((prev) => ({
      ...prev,
      station3: { ...payload, isCompleted: true },
    }));
    setSmartNetwork104Station3?.(payload.score || 0);
    setCurrentStationModal(null);
    onCloseStation?.();
    setActiveStation104Store?.(null);
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
    const submissionPayload: Room104LabSubmissionPayload = {
      roomId: 'room-104',
      unitNumber: 4,
      theme: 'CCTV Network Configuration & Troubleshooting',
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
            <div className="text-xs font-bold text-sky-400">ครบทั้ง 3 สถานี Room 104 แล้ว!</div>
            <div className="text-sm font-semibold">
              คะแนนรวม: <span className="text-emerald-400 font-bold">{totalScore}</span>/100
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalizeAll}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            ส่งผลปฏิบัติการ Room 104
          </button>
        </div>
      )}

      {/* Modal 1: IP Planning & Table */}
      {currentStationModal === 1 && (
        <Room104IpPlanningModal
          initialPayload={labState.station1}
          onSave={handleSaveStation1}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation104Store?.(null);
          }}
        />
      )}

      {/* Modal 2: Device Configuration & Network Verification */}
      {currentStationModal === 2 && (
        <Room104NetworkConfigModal
          initialPayload={labState.station2}
          onSave={handleSaveStation2}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation104Store?.(null);
          }}
        />
      )}

      {/* Modal 3: Systematic Troubleshooting & Retest */}
      {currentStationModal === 3 && (
        <Room104TroubleshootingModal
          initialPayload={labState.station3}
          onSave={handleSaveStation3}
          onClose={() => {
            setCurrentStationModal(null);
            onCloseStation?.();
            setActiveStation104Store?.(null);
          }}
        />
      )}
    </>
  );
};
