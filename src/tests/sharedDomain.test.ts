import { describe, expect, it } from 'vitest';

type DeviceId =
  | 'CAMERA_BULLET'
  | 'CAMERA_DOME'
  | 'POE_SWITCH_8P'
  | 'NVR_8CH'
  | 'ROUTER'
  | 'CLIENT_PC'
  | 'MONITOR'
  | 'ANALOG_CAMERA'
  | 'DVR';

type CableConnection = {
  id: string;
  cableType: 'CAT6' | 'HDMI' | 'COAXIAL' | 'POWER_DC';
  fromDeviceId: DeviceId;
  fromPortId: string;
  toDeviceId: DeviceId;
  toPortId: string;
  linkStatus: 'UP' | 'DOWN';
  poeSupplied: boolean;
};

type MissionState = {
  missionId: 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
  titleTh: string;
  descriptionTh: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  score: number;
  maxScore: number;
  attempts: number;
  hintsUsed: number;
};

describe('shared CCTV game domain', () => {
  it('re-scores a complete mission state from serializable inputs', () => {
    const sharedDomainUrl = new URL('../shared/domain/index.ts', import.meta.url).href;
    const placedDevices: Partial<Record<DeviceId, boolean>> = {
      CAMERA_BULLET: true,
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      CLIENT_PC: true,
      MONITOR: true,
    };
    const poweredDevices: Partial<Record<DeviceId, boolean>> = {
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      CLIENT_PC: true,
      MONITOR: true,
    };
    const connections: CableConnection[] = [
      {
        id: 'camera-to-poe',
        cableType: 'CAT6',
        fromDeviceId: 'CAMERA_BULLET',
        fromPortId: 'CAM_BULLET_PORT_RJ45',
        toDeviceId: 'POE_SWITCH_8P',
        toPortId: 'POE_SW_P1',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'poe-to-nvr',
        cableType: 'CAT6',
        fromDeviceId: 'POE_SWITCH_8P',
        fromPortId: 'POE_SW_UPLINK1',
        toDeviceId: 'NVR_8CH',
        toPortId: 'NVR_PORT_LAN',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'poe-to-client',
        cableType: 'CAT6',
        fromDeviceId: 'POE_SWITCH_8P',
        fromPortId: 'POE_SW_P2',
        toDeviceId: 'CLIENT_PC',
        toPortId: 'CLIENT_PC_PORT_LAN',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'nvr-to-monitor',
        cableType: 'HDMI',
        fromDeviceId: 'NVR_8CH',
        fromPortId: 'NVR_PORT_HDMI_OUT',
        toDeviceId: 'MONITOR',
        toPortId: 'MONITOR_PORT_HDMI_IN',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
    ];
    const mission = (
      missionId: MissionState['missionId'],
      score: number
    ): MissionState => ({
      missionId,
      titleTh: missionId,
      descriptionTh: missionId,
      isUnlocked: true,
      isCompleted: true,
      score,
      maxScore: score,
      attempts: 1,
      hintsUsed: 0,
    });
    const missions = {
      M1: mission('M1', 15),
      M2: mission('M2', 20),
      M3: mission('M3', 15),
      M4: mission('M4', 15),
      M5: mission('M5', 25),
    };

    return import(/* @vite-ignore */ sharedDomainUrl).then((sharedDomain) => {
      const topology = sharedDomain.evaluateSystemTopology(placedDevices, poweredDevices, connections);
      const rubric = sharedDomain.evaluateFullRubric(missions, topology, 0);

      expect(rubric.totalScore).toBe(100);
      expect(rubric.isPassed).toBe(true);
      expect(rubric.mandatoryChecks).toEqual({
        cameraOnline: true,
        nvrReachable: true,
        clientLiveViewActive: true,
      });
    });
  });
});
