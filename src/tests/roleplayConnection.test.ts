import { describe, it, expect } from 'vitest';
import { canConnectCableToPort, evaluateSystemTopology } from '../shared/domain/connectionRules';
import { CableConnection } from '../shared/domain/roleplayTypes';

describe('Unit 1 Roleplay Cable & Port Connection Rules', () => {
  it('allows Cat6 RJ45 into RJ45_POE or RJ45_LAN, rejects HDMI', () => {
    expect(canConnectCableToPort('CAT6', 'RJ45_POE').allowed).toBe(true);
    expect(canConnectCableToPort('CAT6', 'RJ45_LAN').allowed).toBe(true);
    expect(canConnectCableToPort('CAT6', 'HDMI_IN').allowed).toBe(false);
    expect(canConnectCableToPort('CAT6', 'DC_12V').allowed).toBe(false);
  });

  it('allows HDMI into HDMI_IN or HDMI_OUT, rejects RJ45', () => {
    expect(canConnectCableToPort('HDMI', 'HDMI_IN').allowed).toBe(true);
    expect(canConnectCableToPort('HDMI', 'HDMI_OUT').allowed).toBe(true);
    expect(canConnectCableToPort('HDMI', 'RJ45_POE').allowed).toBe(false);
    expect(canConnectCableToPort('HDMI', 'RJ45_LAN').allowed).toBe(false);
  });

  it('fails camera power when connected to non-PoE Uplink port', () => {
    const placedDevices = {
      CAMERA_BULLET: true,
      POE_SWITCH_8P: true,
    };
    const poweredDevices = {
      POE_SWITCH_8P: true,
    };
    const connections: CableConnection[] = [
      {
        id: 'C1',
        cableType: 'CAT6',
        fromDeviceId: 'CAMERA_BULLET',
        fromPortId: 'CAM_BULLET_PORT_RJ45',
        toDeviceId: 'POE_SWITCH_8P',
        toPortId: 'POE_SW_UPLINK1', // Non-PoE port
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
    ];

    const result = evaluateSystemTopology(placedDevices, poweredDevices, connections);
    expect(result.isCameraPowered).toBe(false);
    expect(result.isCameraOnline).toBe(false);
    expect(result.diagnosticEvents.some((e) => e.code === 'NON_POE_PORT')).toBe(true);
  });

  it('powers camera when connected to PoE port P1-P8 and switch is powered on', () => {
    const placedDevices = {
      CAMERA_BULLET: true,
      POE_SWITCH_8P: true,
    };
    const poweredDevices = {
      POE_SWITCH_8P: true,
    };
    const connections: CableConnection[] = [
      {
        id: 'C1',
        cableType: 'CAT6',
        fromDeviceId: 'CAMERA_BULLET',
        fromPortId: 'CAM_BULLET_PORT_RJ45',
        toDeviceId: 'POE_SWITCH_8P',
        toPortId: 'POE_SW_P1', // Valid PoE port
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
    ];

    const result = evaluateSystemTopology(placedDevices, poweredDevices, connections);
    expect(result.isCameraPowered).toBe(true);
    expect(result.isCameraOnline).toBe(true);
    expect(result.totalPoeWattsUsed).toBe(7.5);
  });

  it('activates Live View when Camera Online + NVR Reachable + Monitor HDMI Connected', () => {
    const placedDevices = {
      CAMERA_BULLET: true,
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      MONITOR: true,
    };
    const poweredDevices = {
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      MONITOR: true,
    };
    const connections: CableConnection[] = [
      {
        id: 'C1',
        cableType: 'CAT6',
        fromDeviceId: 'CAMERA_BULLET',
        fromPortId: 'CAM_BULLET_PORT_RJ45',
        toDeviceId: 'POE_SWITCH_8P',
        toPortId: 'POE_SW_P1',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'C2',
        cableType: 'CAT6',
        fromDeviceId: 'POE_SWITCH_8P',
        fromPortId: 'POE_SW_UPLINK1',
        toDeviceId: 'NVR_8CH',
        toPortId: 'NVR_PORT_LAN',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'C3',
        cableType: 'HDMI',
        fromDeviceId: 'NVR_8CH',
        fromPortId: 'NVR_PORT_HDMI_OUT',
        toDeviceId: 'MONITOR',
        toPortId: 'MONITOR_PORT_HDMI_IN',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
    ];

    const result = evaluateSystemTopology(placedDevices, poweredDevices, connections);
    expect(result.isCameraOnline).toBe(true);
    expect(result.isNvrReachable).toBe(true);
    expect(result.isMonitorConnectedToNvr).toBe(true);
    expect(result.isLiveViewActive).toBe(true);
    expect(result.diagnosticEvents.some((e) => e.code === 'LIVE_VIEW_ACTIVE')).toBe(true);
  });

  it('activates Live View with UI port aliases and reverse HDMI wiring (MONITOR HDMI_IN -> NVR HDMI_OUT)', () => {
    const placedDevices = {
      CAMERA_BULLET: true,
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      MONITOR: true,
    };
    const poweredDevices = {
      POE_SWITCH_8P: true,
      NVR_8CH: true,
      MONITOR: true,
    };
    // Reverse HDMI wiring (Monitor -> NVR) and alias ports (POE_1, LAN_UPLINK, LAN_1)
    const connections: CableConnection[] = [
      {
        id: 'C1',
        cableType: 'CAT6',
        fromDeviceId: 'CAMERA_BULLET',
        fromPortId: 'RJ45_POE',
        toDeviceId: 'POE_SWITCH_8P',
        toPortId: 'POE_1',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'C2',
        cableType: 'CAT6',
        fromDeviceId: 'POE_SWITCH_8P',
        fromPortId: 'LAN_UPLINK',
        toDeviceId: 'NVR_8CH',
        toPortId: 'LAN_1',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
      {
        id: 'C3',
        cableType: 'HDMI',
        fromDeviceId: 'MONITOR',
        fromPortId: 'HDMI_IN',
        toDeviceId: 'NVR_8CH',
        toPortId: 'HDMI_OUT',
        linkStatus: 'DOWN',
        poeSupplied: false,
      },
    ];

    const result = evaluateSystemTopology(placedDevices, poweredDevices, connections);
    expect(result.isCameraOnline).toBe(true);
    expect(result.isNvrReachable).toBe(true);
    expect(result.isMonitorConnectedToNvr).toBe(true);
    expect(result.isLiveViewActive).toBe(true);
    expect(result.diagnosticEvents.some((e) => e.code === 'LIVE_VIEW_ACTIVE')).toBe(true);
  });
});
