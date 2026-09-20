import { describe, expect, it } from 'vitest';
import { evaluateUnit4Submission } from '../server/game/evaluateUnit4Submission';
import { evaluateRoomSubmission } from '../server/game/evaluateRoomSubmission';
import { INITIAL_ROOM104_IP_TABLE } from '../shared/domain/room104Types';

const perfectRoom104Payload = {
  roomId: 'room-104',
  unitNumber: 4,
  theme: 'CCTV Network Configuration & Troubleshooting',
  station1: {
    networkAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    cidrPrefix: 24,
    defaultGateway: '192.168.1.1',
    dnsServer: '8.8.8.8',
    totalUsableHosts: 254,
    ipAddressTable: [...INITIAL_ROOM104_IP_TABLE],
    ipConflictDetected: false,
    methodReasoning: 'ใช้วิธี Static IP สำหรับ NVR, Router Gateway และ Switch เพื่อความเสถียรของระบบบันทึก และใช้ DHCP Reservation สำหรับกล้องเพื่อความสะดวกในการจัดการ',
  },
  station2: {
    configuredDevices: {
      'GW-01': {
        ipAddress: '192.168.1.1',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        dns: '8.8.8.8',
        method: 'STATIC',
      },
      'NVR-01': {
        ipAddress: '192.168.1.10',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        dns: '8.8.8.8',
        method: 'STATIC',
      },
      'CAM-01': {
        ipAddress: '192.168.1.101',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        dns: '8.8.8.8',
        method: 'DHCP_RESERVATION',
      },
      'CAM-02': {
        ipAddress: '192.168.1.102',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        dns: '8.8.8.8',
        method: 'DHCP_RESERVATION',
      },
    },
    pingLogs: [
      {
        targetIp: '192.168.1.10',
        targetDevice: 'NVR-01 (Main Recorder)',
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
        avgLatencyMs: 1.2,
        status: 'SUCCESS',
      },
      {
        targetIp: '192.168.1.1',
        targetDevice: 'GW-01 (Router Gateway)',
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
        avgLatencyMs: 0.8,
        status: 'SUCCESS',
      },
    ],
    arpEntries: [
      {
        ipAddress: '192.168.1.1',
        macAddress: '00:1A:2B:3C:4D:01',
        type: 'DYNAMIC',
      },
      {
        ipAddress: '192.168.1.10',
        macAddress: '00:1A:2B:3C:4D:10',
        type: 'DYNAMIC',
      },
    ],
    dnsLookup: {
      queryHostname: 'time.nist.gov',
      resolvedIp: '132.163.96.1',
      status: 'SUCCESS',
    },
    poeBudget: {
      switchCapacityWatts: 65,
      connectedLoadWatts: 48,
      safetyMarginWatts: 13,
      isLoadBalanced: true,
      isOverloaded: false,
    },
  },
  station3: {
    selectedFaultScenario: {
      faultId: 'FAULT_IP_CONFLICT',
      titleTh: 'ตรวจพบ IP Conflict (IP ชนกันระหว่าง CAM-01 กับ Client PC)',
      symptomTh: 'กล้อง CAM-01 ภาพติดๆ ดับๆ และหลุดจากระบบ NVR เป็นระยะ',
      affectedDevice: 'CAM-01',
      wrongConfig: {
        field: 'ipAddress',
        value: '192.168.1.100',
        correctValue: '192.168.1.101',
      },
    },
    faultLog: {
      problemDescription: 'ภาพจากกล้อง CAM-01 ขาดหาย สลับกับ Client PC มีข้อความแจ้งเตือน IP conflict บนหน้าจอ',
      evidenceCollected: ['คำสั่ง arp -a พบ MAC address ซ้ำซ้อนที่ IP 192.168.1.100', 'Ping มีอาการ timeout สลับกับ reply'],
      rootCauseIdentified: 'เกิด IP conflict ชนกันระหว่างกล้อง CAM-01 กับ Client PC บนเครือข่ายวงแลนเดียวกัน',
      appliedSolution: 'เปลี่ยน IP ของ CAM-01 เป็น 192.168.1.101 และตั้งค่า DHCP Reservation บน Router Gateway',
      postFixVerification: 'ล้างค่า arp cache และ ping ตรวจสอบไม่พบแพ็กเก็ตสูญหาย loss 0%',
      retestPassed: true,
      preventativeMeasures: 'ทำ IP address table และผูก MAC address กับ IP ผ่าน DHCP Reservation',
    },
    evidenceToolsUsed: {
      ipConfigChecked: true,
      pingVerified: true,
      arpTableChecked: true,
      poeLoadChecked: true,
    },
    retestLogs: [
      {
        targetIp: '192.168.1.101',
        targetDevice: 'CAM-01 (Retest Post-Fix)',
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
        avgLatencyMs: 1.1,
        status: 'SUCCESS',
      },
    ],
    retestPassed: true,
  },
};

describe('Room 104: Server-Authoritative 3-Station Evaluation', () => {
  it('evaluates a perfect 3-station submission with 100/100 score and passing status', () => {
    const evaluation = evaluateUnit4Submission(perfectRoom104Payload);

    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(true);
    expect(evaluation.mandatoryChecks.nvrReachable).toBe(true);
    expect(evaluation.mandatoryChecks.clientLiveViewActive).toBe(true);
    expect(evaluation.missionScores.STATION_1_IP_PLANNING).toBe(35);
    expect(evaluation.missionScores.STATION_2_DEVICE_CONFIG_POE).toBe(35);
    expect(evaluation.missionScores.STATION_3_TROUBLESHOOTING).toBe(30);
  });

  it('detects IP conflict in Station 1 and marks cameraOnline as failed', () => {
    const conflictTable = INITIAL_ROOM104_IP_TABLE.map((row, idx) =>
      idx === 3 ? { ...row, ipAddress: '192.168.1.10' } : row
    );

    const conflictPayload = {
      ...perfectRoom104Payload,
      station1: {
        ...perfectRoom104Payload.station1,
        ipAddressTable: conflictTable,
        ipConflictDetected: true,
      },
    };

    const evaluation = evaluateUnit4Submission(conflictPayload);

    expect(evaluation.totalScore).toBeLessThan(100);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(false);
    expect(evaluation.resultDetails.hasDuplicateIp).toBe(true);
  });

  it('rejects client score tampering and recalculates score strictly from raw state', () => {
    const tamperedPayload = {
      ...perfectRoom104Payload,
      station1: {
        ...perfectRoom104Payload.station1,
        networkAddress: '10.0.0.0', // Wrong subnet network address
        cidrPrefix: 8,
        score: 999, // Client attempts to force 999 score
      },
      finalScore: 100,
    };

    const evaluation = evaluateUnit4Submission(tamperedPayload);

    expect(evaluation.totalScore).toBeLessThan(100);
    expect(evaluation.missionScores.STATION_1_IP_PLANNING).toBeLessThan(35);
  });

  it('detects PoE power budget overload and fails cameraOnline check', () => {
    const overloadPayload = {
      ...perfectRoom104Payload,
      station2: {
        ...perfectRoom104Payload.station2,
        poeBudget: {
          switchCapacityWatts: 65,
          connectedLoadWatts: 78, // Exceeds 65W!
          safetyMarginWatts: 0,
          isLoadBalanced: false,
          isOverloaded: true,
        },
      },
    };

    const evaluation = evaluateUnit4Submission(overloadPayload);

    expect(evaluation.mandatoryChecks.cameraOnline).toBe(false);
    expect(evaluation.resultDetails.poeOverload).toBe(true);
    expect(evaluation.missionScores.STATION_2_DEVICE_CONFIG_POE).toBeLessThan(35);
  });

  it('penalizes Station 3 score when systematic troubleshooting retest has packet loss', () => {
    const failedRetestPayload = {
      ...perfectRoom104Payload,
      station3: {
        ...perfectRoom104Payload.station3,
        retestPassed: false,
        retestLogs: [
          {
            targetIp: '192.168.1.101',
            targetDevice: 'CAM-01',
            packetsSent: 4,
            packetsReceived: 1,
            packetLossPercent: 75,
            avgLatencyMs: 250,
            status: 'UNREACHABLE',
          },
        ],
      },
    };

    const evaluation = evaluateUnit4Submission(failedRetestPayload);

    expect(evaluation.missionScores.STATION_3_TROUBLESHOOTING).toBeLessThan(30);
  });

  it('routes correctly through evaluateRoomSubmission router for room-104', () => {
    const evaluation = evaluateRoomSubmission('room-104', perfectRoom104Payload);
    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
  });

  it('supports legacy workstation payload format seamlessly', () => {
    const legacyPayload = {
      ipAddress: '192.168.1.100',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      poeBudgetTotalWatts: 45,
      poeMaxRatingWatts: 65,
      loadBalanced: true,
      pingTested: true,
      pingResult: {
        rttMs: 1.2,
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
      },
      totalHintsUsed: 0,
    };

    const evaluation = evaluateUnit4Submission(legacyPayload);
    expect(evaluation.totalScore).toBe(100);
    expect(evaluation.isPassed).toBe(true);
    expect(evaluation.mandatoryChecks.cameraOnline).toBe(true);
    expect(evaluation.mandatoryChecks.nvrReachable).toBe(true);
  });
});
