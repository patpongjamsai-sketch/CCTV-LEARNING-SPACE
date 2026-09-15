/**
 * Unit 1 IP CCTV Fundamentals - Role-Play Domain Types
 * Course: 21909-2020 (กล้องวงจรปิดบนระบบเครือข่าย)
 */

export type ItemType = 'KNOWLEDGE_CARD' | 'DEVICE' | 'CABLE' | 'TOOL';

export type PortType = 'RJ45_POE' | 'RJ45_LAN' | 'HDMI_OUT' | 'HDMI_IN' | 'DC_12V' | 'BNC';

export type CableType = 'CAT6' | 'HDMI' | 'COAXIAL' | 'POWER_DC';

export type ZoneId = 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D' | 'ZONE_E' | 'ZONE_F';

export type DropZoneStatus = 'IDLE' | 'READY' | 'CORRECT' | 'WRONG_ORDER' | 'WRONG_TYPE';

export type DeviceId =
  | 'CAMERA_BULLET'
  | 'CAMERA_DOME'
  | 'POE_SWITCH_8P'
  | 'NVR_8CH'
  | 'ROUTER'
  | 'CLIENT_PC'
  | 'MONITOR'
  | 'ANALOG_CAMERA'
  | 'DVR';

export type ConceptId =
  // Mission 1: Video Pipeline
  | 'LENS_GATHER_LIGHT'
  | 'SENSOR_CONVERT_SIGNAL'
  | 'PROCESSOR_COMPRESS_VIDEO'
  | 'LAN_SEND_PACKET'
  // Mission 2: Data Flow Path
  | 'FLOW_CAMERA'
  | 'FLOW_POE_SWITCH'
  | 'FLOW_NVR'
  | 'FLOW_CLIENT_PC'
  // Mission 3: Device Functions
  | 'FUNC_CAMERA'
  | 'FUNC_POE_SWITCH'
  | 'FUNC_NVR'
  | 'FUNC_ROUTER'
  | 'FUNC_CLIENT_PC'
  // Mission 4: Analog vs IP CCTV Cards
  | 'CARD_COAXIAL'
  | 'CARD_CAT6'
  | 'CARD_DVR'
  | 'CARD_NVR'
  | 'CARD_POE'
  | 'CARD_IP_ADDRESS'
  | 'CARD_ANALOG_SIGNAL'
  | 'CARD_DIGITAL_PACKET';

export interface InventoryItem {
  id: string;
  type: ItemType;
  conceptId?: ConceptId;
  deviceId?: DeviceId;
  cableType?: CableType;
  nameTh: string;
  nameEn: string;
  description: string;
  icon: string;
  quantity: number;
  weight: 'LIGHT' | 'HEAVY';
  sourceZone: ZoneId;
}

export interface PortDefinition {
  id: string;
  name: string;
  portType: PortType;
  isPoECapable?: boolean;
  poePowerProvidedWatts?: number;
  powerRequiredWatts?: number;
  connectedCableId?: string;
  connectedTargetPortId?: string;
}

export interface DeviceSpec {
  id: DeviceId;
  nameTh: string;
  nameEn: string;
  category: 'CAMERA' | 'NETWORK' | 'RECORDER' | 'CONTROL' | 'ANALOG';
  powerType: 'POE' | 'AC' | 'DC12V' | 'NONE';
  powerWatts: number;
  ports: PortDefinition[];
  leds: string[];
  dimensions: [number, number, number]; // w, h, d in meters
  descriptionTh: string;
}

export interface CableConnection {
  id: string;
  cableType: CableType;
  fromDeviceId: DeviceId;
  fromPortId: string;
  toDeviceId: DeviceId;
  toPortId: string;
  linkStatus: 'UP' | 'DOWN';
  poeSupplied: boolean;
}

export interface PlacedCardSlot {
  slotIndex: number;
  labelTh: string;
  acceptedConceptId: ConceptId;
  currentPlacedItem?: InventoryItem;
  status: DropZoneStatus;
}

export interface MissionState {
  missionId: 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
  titleTh: string;
  descriptionTh: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  score: number;
  maxScore: number;
  attempts: number;
  hintsUsed: number;
  lastFeedbackTh?: string;
}

export interface RubricEvaluation {
  m1VideoPipelineScore: number;     // max 15
  m2DataFlowScore: number;          // max 20
  m3DeviceFunctionScore: number;    // max 15
  m4AnalogVsIpScore: number;        // max 15
  m5WiringAssemblyScore: number;    // max 25
  troubleshootingScore: number;     // max 10
  totalScore: number;               // max 100
  isPassed: boolean;                // >= 80 and mandatory checks satisfied
  mandatoryChecks: {
    cameraOnline: boolean;
    nvrReachable: boolean;
    clientLiveViewActive: boolean;
  };
}

export interface DiagnosticEvent {
  timestamp: number;
  code: 'NO_POWER' | 'LINK_DOWN' | 'NON_POE_PORT' | 'IP_CONFLICT' | 'NVR_NOT_REACHABLE' | 'ONLINE' | 'LIVE_VIEW_ACTIVE';
  titleTh: string;
  messageTh: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface KnowledgeStationData {
  zoneId: ZoneId;
  titleTh: string;
  subtitleTh: string;
  position: [number, number, number];
  npcNameTh?: string;
  npcRoleTh?: string;
  dialogueBubbles: string[];
  bulletPoints: string[];
  rewardCard?: InventoryItem;
  rewardDevice?: InventoryItem;
  quizQuestion?: {
    questionTh: string;
    options: string[];
    correctIndex: number;
    explanationTh: string;
  };
}
