// Domain Types and Catalogs for Room 104: CCTV Network Configuration, IP Addressing & Troubleshooting
// Course 21909-2020: CCTV Systems (ปวช. 2567)
// Implementation compliant with ROOM104_NETWORK_IP_CONFIGURATION_PLAN_REVISED_2026-09-18.md

export type Room104DeviceType =
  | 'IP_CAMERA'
  | 'NVR'
  | 'POE_SWITCH'
  | 'GATEWAY'
  | 'DNS_SERVER'
  | 'CLIENT_PC';

export type Room104AddressMethod = 'STATIC' | 'DHCP' | 'DHCP_RESERVATION';

export interface IpAddressTableRow {
  deviceId: string;
  deviceNameTh: string;
  deviceType: Room104DeviceType;
  macAddress: string;
  ipAddress: string;
  method: Room104AddressMethod;
  subnetMask: string;
  gateway: string;
  dns: string;
  vlanSegment: string;
  switchPort: string;
  expectedWatts: number;
  status: 'PLANNED' | 'ONLINE' | 'OFFLINE' | 'CONFLICT';
}

export const INITIAL_ROOM104_IP_TABLE: IpAddressTableRow[] = [
  {
    deviceId: 'GW-01',
    deviceNameTh: 'Router / Default Gateway',
    deviceType: 'GATEWAY',
    macAddress: '00:1A:2B:3C:4D:01',
    ipAddress: '192.168.1.1',
    method: 'STATIC',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 24 (Uplink)',
    expectedWatts: 0,
    status: 'PLANNED',
  },
  {
    deviceId: 'SW-POE-01',
    deviceNameTh: 'Managed PoE Switch (8-Port Gigabit)',
    deviceType: 'POE_SWITCH',
    macAddress: '00:1A:2B:3C:4D:02',
    ipAddress: '192.168.1.2',
    method: 'STATIC',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Management',
    expectedWatts: 0,
    status: 'PLANNED',
  },
  {
    deviceId: 'NVR-01',
    deviceNameTh: 'Network Video Recorder (NVR 8-Ch)',
    deviceType: 'NVR',
    macAddress: '00:1A:2B:3C:4D:10',
    ipAddress: '192.168.1.10',
    method: 'STATIC',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 1 (LAN)',
    expectedWatts: 0,
    status: 'PLANNED',
  },
  {
    deviceId: 'CAM-01',
    deviceNameTh: 'IP Camera 01 (Entrance Bullet 4K)',
    deviceType: 'IP_CAMERA',
    macAddress: '00:1A:2B:3C:4D:A1',
    ipAddress: '192.168.1.101',
    method: 'DHCP_RESERVATION',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 2 (PoE)',
    expectedWatts: 12,
    status: 'PLANNED',
  },
  {
    deviceId: 'CAM-02',
    deviceNameTh: 'IP Camera 02 (Warehouse Dome IR)',
    deviceType: 'IP_CAMERA',
    macAddress: '00:1A:2B:3C:4D:A2',
    ipAddress: '192.168.1.102',
    method: 'DHCP_RESERVATION',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 3 (PoE)',
    expectedWatts: 10,
    status: 'PLANNED',
  },
  {
    deviceId: 'CAM-03',
    deviceNameTh: 'IP Camera 03 (Parking Lot PTZ)',
    deviceType: 'IP_CAMERA',
    macAddress: '00:1A:2B:3C:4D:A3',
    ipAddress: '192.168.1.103',
    method: 'STATIC',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 4 (PoE+)',
    expectedWatts: 18,
    status: 'PLANNED',
  },
  {
    deviceId: 'CAM-04',
    deviceNameTh: 'IP Camera 04 (Corridor Dome)',
    deviceType: 'IP_CAMERA',
    macAddress: '00:1A:2B:3C:4D:A4',
    ipAddress: '192.168.1.104',
    method: 'DHCP_RESERVATION',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlanSegment: 'VLAN-10 (CCTV)',
    switchPort: 'Port 5 (PoE)',
    expectedWatts: 8,
    status: 'PLANNED',
  },
];

// ==========================================
// Station 1: IP Address Planning & Table
// ==========================================
export interface Station1NetworkPlanPayload {
  networkAddress: string; // e.g. 192.168.1.0
  subnetMask: string; // e.g. 255.255.255.0
  cidrPrefix: number; // e.g. 24
  defaultGateway: string; // e.g. 192.168.1.1
  dnsServer: string; // e.g. 8.8.8.8
  totalUsableHosts: number; // 254
  ipAddressTable: IpAddressTableRow[];
  ipConflictDetected: boolean;
  methodReasoning: string;
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// Station 2: Device Config & Network Verification
// ==========================================
export interface PingTestLog {
  targetIp: string;
  targetDevice: string;
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  avgLatencyMs: number;
  status: 'SUCCESS' | 'UNREACHABLE' | 'TIMEOUT';
}

export interface ArpEntry {
  ipAddress: string;
  macAddress: string;
  type: 'DYNAMIC' | 'STATIC';
}

export interface DnsLookupLog {
  queryHostname: string;
  resolvedIp: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface Station2NetworkConfigPayload {
  configuredDevices: Record<
    string,
    {
      ipAddress: string;
      subnetMask: string;
      defaultGateway: string;
      dns: string;
      method: Room104AddressMethod;
    }
  >;
  pingLogs: PingTestLog[];
  arpEntries: ArpEntry[];
  dnsLookup: DnsLookupLog;
  poeBudget: {
    switchCapacityWatts: number; // 65W
    connectedLoadWatts: number; // e.g. 48W
    safetyMarginWatts: number; // 20%
    isLoadBalanced: boolean;
    isOverloaded: boolean;
  };
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// Station 3: Systematic Troubleshooting & Retest
// ==========================================
export interface FaultChallengeScenario {
  faultId: 'FAULT_IP_CONFLICT' | 'FAULT_WRONG_SUBNET' | 'FAULT_POE_OVERLOAD' | 'FAULT_DNS_FAIL';
  titleTh: string;
  symptomTh: string;
  affectedDevice: string;
  wrongConfig: {
    field: string;
    value: string;
    correctValue: string;
  };
}

export interface FaultLogEntry {
  problemDescription: string;
  evidenceCollected: string[];
  rootCauseIdentified: string;
  appliedSolution: string;
  postFixVerification: string;
  retestPassed: boolean;
  preventativeMeasures: string;
}

export interface Station3TroubleshootingPayload {
  selectedFaultScenario: FaultChallengeScenario;
  faultLog: FaultLogEntry;
  evidenceToolsUsed: {
    ipConfigChecked: boolean;
    pingVerified: boolean;
    arpTableChecked: boolean;
    poeLoadChecked: boolean;
  };
  retestLogs: PingTestLog[];
  retestPassed: boolean;
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// Full Room 104 Lab Submission Payload
// ==========================================
export interface Room104LabSubmissionPayload {
  roomId: 'room-104';
  unitNumber: 4;
  theme: 'CCTV Network Configuration & Troubleshooting';
  station1: Station1NetworkPlanPayload;
  station2: Station2NetworkConfigPayload;
  station3: Station3TroubleshootingPayload;
  finalScore: number;
  passed: boolean;
  timestamp: string;
}
