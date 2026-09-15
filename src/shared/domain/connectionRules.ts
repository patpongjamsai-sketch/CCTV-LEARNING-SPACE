import type { CableType, PortType, DeviceId, CableConnection, DiagnosticEvent } from './roleplayTypes';
import { VIRTUAL_EQUIPMENT_CATALOG } from './virtualEquipmentCatalog';

export interface TopologyEvaluationResult {
  isCameraPowered: boolean;
  isCameraOnline: boolean;
  isNvrPowered: boolean;
  isNvrReachable: boolean;
  isClientPcPowered: boolean;
  isClientPcReachable: boolean;
  isMonitorPowered: boolean;
  isMonitorConnectedToNvr: boolean;
  isLiveViewActive: boolean;
  totalPoeWattsUsed: number;
  poeBudgetWatts: number;
  diagnosticEvents: DiagnosticEvent[];
}

export function canConnectCableToPort(cableType: CableType, portType: PortType): { allowed: boolean; reasonTh?: string } {
  if (cableType === 'CAT6') {
    if (portType === 'RJ45_POE' || portType === 'RJ45_LAN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reasonTh: 'สาย UTP Cat6 (หัวต่อ RJ45) เสียบได้เฉพาะพอร์ตแลน RJ45 เท่านั้น ไม่สามารถเสียบเข้าพอร์ต HDMI หรือ DC ได้',
    };
  }

  if (cableType === 'HDMI') {
    if (portType === 'HDMI_IN' || portType === 'HDMI_OUT') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reasonTh: 'สายสัญญาณภาพ HDMI เสียบได้เฉพาะพอร์ต HDMI IN หรือ HDMI OUT เท่านั้น ไม่สามารถเสียบเข้าพอร์ตแลน RJ45 ได้',
    };
  }

  return { allowed: false, reasonTh: 'ชนิดสายสัญญาณและพอร์ตไม่ตรงกัน' };
}

export function evaluateSystemTopology(
  placedDevices: Partial<Record<DeviceId, boolean>>,
  poweredDevices: Partial<Record<DeviceId, boolean>>,
  connections: CableConnection[]
): TopologyEvaluationResult {
  const events: DiagnosticEvent[] = [];
  const poeBudgetWatts = 65.0;
  let totalPoeWattsUsed = 0;

  const isSwitchPlaced = !!placedDevices.POE_SWITCH_8P;
  const isSwitchPowered = isSwitchPlaced && !!poweredDevices.POE_SWITCH_8P;

  const isCameraPlaced = !!placedDevices.CAMERA_BULLET || !!placedDevices.CAMERA_DOME;
  const isNvrPlaced = !!placedDevices.NVR_8CH;
  const isNvrPowered = isNvrPlaced && !!poweredDevices.NVR_8CH;

  const isClientPlaced = !!placedDevices.CLIENT_PC;
  const isClientPcPowered = isClientPlaced && !!poweredDevices.CLIENT_PC;

  const isMonitorPlaced = !!placedDevices.MONITOR;
  const isMonitorPowered = isMonitorPlaced && !!poweredDevices.MONITOR;

  // 1. Check Camera PoE Connection
  let isCameraPowered = false;
  let isCameraOnline = false;

  const activeCamId: DeviceId = placedDevices.CAMERA_BULLET ? 'CAMERA_BULLET' : 'CAMERA_DOME';
  const camSpec = VIRTUAL_EQUIPMENT_CATALOG[activeCamId];

  // Find cable from camera to switch
  const camConnection = connections.find(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === activeCamId && c.toDeviceId === 'POE_SWITCH_8P') ||
        (c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === activeCamId))
  );

  if (isCameraPlaced && !camConnection) {
    events.push({
      timestamp: Date.now(),
      code: 'LINK_DOWN',
      titleTh: 'สายสัญญาณกล้องไม่ได้เชื่อมต่อ',
      messageTh: 'กล้อง IP ยังไม่ได้ต่อสาย Cat6 ไปยังสวิตช์เครือข่าย',
      severity: 'WARNING',
    });
  } else if (camConnection) {
    const switchPortId =
      camConnection.fromDeviceId === 'POE_SWITCH_8P'
        ? camConnection.fromPortId
        : camConnection.toPortId;

    const switchSpec = VIRTUAL_EQUIPMENT_CATALOG.POE_SWITCH_8P;
    const portDef = switchSpec.ports.find((p) => p.id === switchPortId);

    if (portDef && !portDef.isPoECapable) {
      // Plugged into non-PoE Uplink port!
      events.push({
        timestamp: Date.now(),
        code: 'NON_POE_PORT',
        titleTh: 'เสียบพอร์ตที่ไม่จ่ายไฟ PoE',
        messageTh: 'พอร์ต Uplink ไม่รองรับการจ่ายไฟ PoE ทำให้กล้องไม่ได้รับไฟเลี้ยง กรุณาย้ายไปพอร์ต 1-8',
        severity: 'ERROR',
      });
    } else if (portDef && portDef.isPoECapable) {
      if (!isSwitchPowered) {
        events.push({
          timestamp: Date.now(),
          code: 'NO_POWER',
          titleTh: 'สวิตช์ PoE ยังไม่เปิดสวิตช์ไฟ',
          messageTh: 'PoE Switch ยังไม่ได้รับไฟ AC ทำให้ไม่สามารถส่งไฟ PoE ไปเลี้ยงกล้องได้',
          severity: 'WARNING',
        });
      } else {
        totalPoeWattsUsed += camSpec.powerWatts;
        if (totalPoeWattsUsed <= poeBudgetWatts) {
          isCameraPowered = true;
          isCameraOnline = true;
          camConnection.linkStatus = 'UP';
          camConnection.poeSupplied = true;
          events.push({
            timestamp: Date.now(),
            code: 'ONLINE',
            titleTh: 'กล้อง IP ออนไลน์สำเร็จ',
            messageTh: `กล้องได้รับไฟ PoE (${camSpec.powerWatts}W) และสถานะ Link Up พร้อมส่งสตรีมวิดีโอ`,
            severity: 'SUCCESS',
          });
        }
      }
    }
  }

  // 2. Check NVR Connection to Switch
  let isNvrReachable = false;
  const nvrConnection = connections.find(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'POE_SWITCH_8P') ||
        (c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'NVR_8CH'))
  );

  if (isNvrPlaced && isNvrPowered && nvrConnection && isSwitchPowered) {
    isNvrReachable = true;
    nvrConnection.linkStatus = 'UP';
  } else if (isNvrPlaced && isCameraOnline && (!nvrConnection || !isNvrPowered)) {
    events.push({
      timestamp: Date.now(),
      code: 'NVR_NOT_REACHABLE',
      titleTh: 'ไม่สามารถติดต่อ NVR ได้',
      messageTh: 'กล้องออนไลน์แล้วแต่ NVR ยังไม่ได้เชื่อมต่อสายแลนกับสวิตช์หรือยังไม่เปิดเครื่อง',
      severity: 'WARNING',
    });
  }

  // 3. Check Client PC Connection
  let isClientPcReachable = false;
  const clientConnection = connections.find(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'CLIENT_PC' && c.toDeviceId === 'POE_SWITCH_8P') ||
        (c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'CLIENT_PC'))
  );

  if (isClientPlaced && isClientPcPowered && clientConnection && isSwitchPowered) {
    isClientPcReachable = true;
    clientConnection.linkStatus = 'UP';
  }

  // 4. Check HDMI Connection from NVR to Monitor
  let isMonitorConnectedToNvr = false;
  const hdmiConnection = connections.find(
    (c) =>
      c.cableType === 'HDMI' &&
      ((c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'MONITOR') ||
        (c.fromDeviceId === 'MONITOR' && c.toDeviceId === 'NVR_8CH'))
  );

  if (isMonitorPlaced && isMonitorPowered && hdmiConnection && isNvrPowered) {
    isMonitorConnectedToNvr = true;
    hdmiConnection.linkStatus = 'UP';
  }

  // 5. Live View is active if Camera is Online, NVR is reachable, and either Monitor has HDMI from NVR or Client PC is reachable
  const isLiveViewActive =
    isCameraOnline &&
    isNvrReachable &&
    ((isMonitorConnectedToNvr && isMonitorPowered) || (isClientPcReachable && isClientPcPowered));

  if (isLiveViewActive) {
    events.push({
      timestamp: Date.now(),
      code: 'LIVE_VIEW_ACTIVE',
      titleTh: 'แสดงภาพสด (Live View) สำเร็จ!',
      messageTh: 'สตรีมวิดีโอดิจิทัลจากกล้อง IP ถูกส่งผ่านสวิตช์ บันทึกที่ NVR และแสดงผลบนจอเรียบร้อย',
      severity: 'SUCCESS',
    });
  }

  return {
    isCameraPowered,
    isCameraOnline,
    isNvrPowered,
    isNvrReachable,
    isClientPcPowered,
    isClientPcReachable,
    isMonitorPowered,
    isMonitorConnectedToNvr,
    isLiveViewActive,
    totalPoeWattsUsed,
    poeBudgetWatts,
    diagnosticEvents: events,
  };
}
