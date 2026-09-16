import { describe, expect, it } from 'vitest';

import { evaluateUnit1Submission } from '../server/game/evaluateUnit1Submission';

const correctSubmission = {
  mission1Answers: [
    'LENS_GATHER_LIGHT',
    'SENSOR_CONVERT_SIGNAL',
    'PROCESSOR_COMPRESS_VIDEO',
    'LAN_SEND_PACKET',
  ],
  mission2Answers: ['FLOW_CAMERA', 'FLOW_POE_SWITCH', 'FLOW_NVR', 'FLOW_CLIENT_PC'],
  mission3Matches: {
    CAMERA_BULLET: 'FUNC_CAMERA',
    POE_SWITCH_8P: 'FUNC_POE_SWITCH',
    NVR_8CH: 'FUNC_NVR',
    ROUTER: 'FUNC_ROUTER',
    CLIENT_PC: 'FUNC_CLIENT_PC',
  },
  mission4Cards: {
    analogCards: ['CARD_COAXIAL', 'CARD_DVR', 'CARD_ANALOG_SIGNAL'],
    ipCards: ['CARD_CAT6', 'CARD_NVR', 'CARD_POE', 'CARD_IP_ADDRESS', 'CARD_DIGITAL_PACKET'],
  },
  placedDevices: {
    CAMERA_BULLET: true,
    POE_SWITCH_8P: true,
    NVR_8CH: true,
    CLIENT_PC: true,
    MONITOR: true,
  },
  poweredDevices: {
    POE_SWITCH_8P: true,
    NVR_8CH: true,
    CLIENT_PC: true,
    MONITOR: true,
  },
  connections: [
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
  ],
  totalHintsUsed: 0,
} as const;

describe('server-authoritative Unit 1 evaluation', () => {
  it('recalculates a perfect score from raw answers and topology', () => {
    const result = evaluateUnit1Submission(correctSubmission);

    expect(result.totalScore).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.missionScores).toEqual({ M1: 15, M2: 20, M3: 15, M4: 15, M5: 25 });
  });

  it('does not trust a client-supplied score field', () => {
    const tampered = {
      ...correctSubmission,
      mission1Answers: [null, null, null, null],
      approvedScore: 100,
    } as const;

    const result = evaluateUnit1Submission(tampered);

    expect(result.totalScore).toBe(85);
    expect(result.missionScores.M1).toBe(0);
  });

  it('rejects duplicate comparison cards instead of counting them twice', () => {
    const invalid = {
      ...correctSubmission,
      mission4Cards: {
        analogCards: ['CARD_COAXIAL', 'CARD_COAXIAL'],
        ipCards: correctSubmission.mission4Cards.ipCards,
      },
    } as const;

    expect(() => evaluateUnit1Submission(invalid)).toThrow(/duplicate/i);
  });
});
