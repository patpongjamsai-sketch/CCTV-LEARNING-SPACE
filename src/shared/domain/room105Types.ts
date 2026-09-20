// Domain Types and Catalogs for Room 105: DVR/NVR Configuration, ONVIF, Video Compression & Recording Management
// Course 21909-2020: CCTV Systems (ปวช. 2567)
// Implementation compliant with ROOM105_PLAN.md

export type OnvifProfile = 'Profile S' | 'Profile G' | 'Profile T';

export interface OnvifDiscoveredCamera {
  deviceId: string;
  deviceNameTh: string;
  ipAddress: string;
  macAddress: string;
  httpPort: number;
  onvifPort: number;
  rtspPort: number;
  supportedProfiles: OnvifProfile[];
  defaultUsername: string;
  sensorResolution: string;
  lensType: string;
  locationTh: string;
  isOnline: boolean;
}

export const ROOM105_ONVIF_CAMERA_CATALOG: OnvifDiscoveredCamera[] = [
  {
    deviceId: 'CAM-01',
    deviceNameTh: 'Dome Camera 4K (โถงทางเข้าหลัก)',
    ipAddress: '192.168.1.101',
    macAddress: '00:1A:2B:3C:5D:01',
    httpPort: 80,
    onvifPort: 8000,
    rtspPort: 554,
    supportedProfiles: ['Profile S', 'Profile T'],
    defaultUsername: 'admin',
    sensorResolution: '3840x2160 (4K UHD)',
    lensType: '2.8mm Fixed Lens (FOV 105°)',
    locationTh: 'โถงทางเข้าอาคารอำนวยการ',
    isOnline: true,
  },
  {
    deviceId: 'CAM-02',
    deviceNameTh: 'Bullet Camera IR (คลังสินค้า / ขนถ่าย)',
    ipAddress: '192.168.1.102',
    macAddress: '00:1A:2B:3C:5D:02',
    httpPort: 80,
    onvifPort: 8000,
    rtspPort: 554,
    supportedProfiles: ['Profile S', 'Profile G'],
    defaultUsername: 'admin',
    sensorResolution: '2560x1440 (2K QHD)',
    lensType: '4mm Fixed IR 50m',
    locationTh: 'ประตูโหลดสินค้าคลังสินค้า',
    isOnline: true,
  },
  {
    deviceId: 'CAM-03',
    deviceNameTh: 'PTZ Speed Dome (ลานจอดรถส่วนกลาง)',
    ipAddress: '192.168.1.103',
    macAddress: '00:1A:2B:3C:5D:03',
    httpPort: 80,
    onvifPort: 8000,
    rtspPort: 554,
    supportedProfiles: ['Profile S', 'Profile G', 'Profile T'],
    defaultUsername: 'admin',
    sensorResolution: '1920x1080 (Full HD)',
    lensType: '4.8-120mm (25x Optical Zoom)',
    locationTh: 'เสากลางลานจอดรถยนต์',
    isOnline: true,
  },
  {
    deviceId: 'CAM-04',
    deviceNameTh: 'Corridor Dome Camera (ทางเดินชั้น 2)',
    ipAddress: '192.168.1.104',
    macAddress: '00:1A:2B:3C:5D:04',
    httpPort: 80,
    onvifPort: 8000,
    rtspPort: 554,
    supportedProfiles: ['Profile S'],
    defaultUsername: 'admin',
    sensorResolution: '1920x1080 (Full HD)',
    lensType: '2.8mm Fixed Lens',
    locationTh: 'ทางเดินหน้าห้องปฏิบัติการคอมพิวเตอร์',
    isOnline: true,
  },
];

// ==========================================
// Station 1: ONVIF Discovery & Channel Mapping
// ==========================================

export interface ChannelMappingRow {
  channelNumber: number; // 1 to 4 (or 8)
  deviceId: string;
  ipAddress: string;
  onvifProfile: OnvifProfile;
  authenticated: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UNASSIGNED';
  previewVerified: boolean;
}

export interface Station1OnvifMappingPayload {
  onvifDiscovered: boolean;
  discoveredDeviceCount: number;
  channelMappings: ChannelMappingRow[];
  hasChannelCollision: boolean;
  totalAssignedChannels: number;
  authSuccessCount: number;
  score?: number;
  isCompleted?: boolean;
}

export const INITIAL_CHANNEL_MAPPINGS: ChannelMappingRow[] = [
  {
    channelNumber: 1,
    deviceId: 'CAM-01',
    ipAddress: '192.168.1.101',
    onvifProfile: 'Profile S',
    authenticated: true,
    status: 'ONLINE',
    previewVerified: true,
  },
  {
    channelNumber: 2,
    deviceId: 'CAM-02',
    ipAddress: '192.168.1.102',
    onvifProfile: 'Profile S',
    authenticated: true,
    status: 'ONLINE',
    previewVerified: true,
  },
  {
    channelNumber: 3,
    deviceId: 'CAM-03',
    ipAddress: '192.168.1.103',
    onvifProfile: 'Profile S',
    authenticated: true,
    status: 'ONLINE',
    previewVerified: true,
  },
  {
    channelNumber: 4,
    deviceId: 'CAM-04',
    ipAddress: '192.168.1.104',
    onvifProfile: 'Profile S',
    authenticated: true,
    status: 'ONLINE',
    previewVerified: true,
  },
];

// ==========================================
// Station 2: Video Compression & Live View
// ==========================================

export type VideoCodecType = 'H.264' | 'H.265';
export type BitrateControlMode = 'CBR' | 'VBR';

export interface ChannelStreamConfig {
  channelNumber: number;
  cameraName: string;
  mainStream: {
    codec: VideoCodecType;
    resolution: string; // e.g. '3840x2160 (4K)' or '1920x1080 (1080P)'
    frameRateFps: number; // e.g. 25, 30
    bitrateKbps: number; // e.g. 4096, 2048
    bitrateMode: BitrateControlMode;
  };
  subStream: {
    codec: VideoCodecType;
    resolution: string; // e.g. '704x576 (D1)' or '1280x720 (720P)'
    frameRateFps: number; // 15
    bitrateKbps: number; // 512
    bitrateMode: BitrateControlMode;
  };
  liveViewStatus: 'OPTIMAL' | 'HIGH_BANDWIDTH' | 'STREAM_STUTTER' | 'OFFLINE';
}

export interface Station2VideoCodecPayload {
  selectedGlobalCodec: VideoCodecType;
  streamConfigs: Record<number, ChannelStreamConfig>;
  storageSavingPercent: number; // e.g. 50% for H.265
  estimatedTotalBitrateMbps: number;
  estimatedDailyStorageGb: number;
  bitrateReasoning: string;
  liveViewVerified: boolean;
  multiSplitMode: '1-SPLIT' | '4-SPLIT';
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// Station 3: Motion, Privacy, Schedule & Fault
// ==========================================

export interface MotionGridCell {
  x: number; // 0..7
  y: number; // 0..7
  active: boolean;
}

export interface PrivacyMaskRect {
  id: string;
  nameTh: string;
  channelNumber: number;
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  widthPercent: number;
  heightPercent: number;
}

export type RecordMode = 'CONTINUOUS' | 'MOTION' | 'ALARM';

export interface DayScheduleSlot {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  timeRanges: {
    startHour: number; // 0..24
    endHour: number; // 0..24
    mode: RecordMode;
  }[];
}

export interface NvrFaultScenario {
  faultId: 'FAULT_ACCOUNT_LOCKED' | 'FAULT_RTSP_PORT_BLOCKED' | 'FAULT_BITRATE_OVERFLOW';
  titleTh: string;
  symptomTh: string;
  affectedChannel: string;
  possibleCausesTh: string[];
  recommendedActionTh: string;
}

export interface NvrFaultLogEntry {
  problemDescription: string;
  possibleCause: string;
  testMethod: string;
  testResult: string;
  appliedSolution: string;
  retestVerification: string;
  retestPassed: boolean;
}

export interface Station3RecordingFaultPayload {
  motionSensitivity: number; // 1..100 (optimal 70..85)
  motionGridActiveCellsCount: number; // number of selected cells
  privacyMaskList: PrivacyMaskRect[];
  recordingSchedule: DayScheduleSlot[];
  faultScenario: NvrFaultScenario;
  faultLog: NvrFaultLogEntry;
  retestPassed: boolean;
  score?: number;
  isCompleted?: boolean;
}

// ==========================================
// Full Room 105 Submission Payload
// ==========================================

export interface Room105LabSubmissionPayload {
  roomId: 'room-105';
  unitNumber: 5;
  theme: 'DVR/NVR Configuration, ONVIF & Video Compression Management';
  station1: Station1OnvifMappingPayload;
  station2: Station2VideoCodecPayload;
  station3: Station3RecordingFaultPayload;
  clientScore?: number;
  finalScore?: number;
  passed?: boolean;
  timestamp: string;
}

export const ROOM105_FAULT_SCENARIOS: NvrFaultScenario[] = [
  {
    faultId: 'FAULT_ACCOUNT_LOCKED',
    titleTh: 'กรณีศึกษา 1: บัญชียืนยันตัวตนกล้อง CAM-02 ถูกล็อค (Account Locked)',
    symptomTh: 'กล้อง CAM-02 หลุดการเชื่อมต่อ NVR แจ้งเตือน Authentication Failed (3 Attempts Exhausted) ทำให้ภาพไม่ขึ้น',
    affectedChannel: 'CH 2 (CAM-02)',
    possibleCausesTh: [
      'ใส่รหัสผ่าน ONVIF กล้องผิดซ้ำเกิน 3 ครั้ง',
      'IP Conflict มีอุปกรณ์อื่นแย่งล็อกอินด้วยบัญชีเดียวกัน',
    ],
    recommendedActionTh: 'ปลดล็อคผ่านฟังก์ชัน Reset Lockout และซิงค์รหัสผ่าน ONVIF กับ NVR ให้ถูกต้อง',
  },
  {
    faultId: 'FAULT_RTSP_PORT_BLOCKED',
    titleTh: 'กรณีศึกษา 2: พอร์ต RTSP 554 ปิดกั้น สตรีมภาพสดไม่ขึ้น (RTSP Stream Blocked)',
    symptomTh: 'NVR ค้นพบกล้องผ่าน ONVIF สำเร็จแต่ขึ้นจอสีดำ "Connecting..." ไม่สามารถดึง Video Stream ได้',
    affectedChannel: 'CH 3 (CAM-03)',
    possibleCausesTh: [
      'RTSP Port 554 ถูก Firewall หรือ ACL บน Switch สกัดกั้น',
      'กล้องตั้งพอร์ต RTSP สลับเป็นพอร์ตอื่น (เช่น 10554)',
    ],
    recommendedActionTh: 'ตรวจสอบ Port Configuration ปรับค่า RTSP ให้ตรงกับพอร์ตมาตรฐาน 554 หรืออัปเดต NVR Channel Stream Port',
  },
  {
    faultId: 'FAULT_BITRATE_OVERFLOW',
    titleTh: 'กรณีศึกษา 3: บิตเรตสูงเกินพิกัด สตรีมกระตุกและ NVR บันทึกตกเฟรม (Bitrate Overflow)',
    symptomTh: 'ช่อง CH 1 (4K) แสดงภาพกระตุก เฟรมดรอป และดิสก์ I/O ค้าง เนื่องจากตั้งค่า H.264 ที่ Bitrate 16 Mbps สูงเกินแบนด์วิดท์',
    affectedChannel: 'CH 1 (CAM-01)',
    possibleCausesTh: [
      'เลือก Codec H.264 เก่าร่วมกับ 4K Bitrate สูงผิดปกติ',
      'ไม่ได้เปิดใช้งาน H.265 หรือเปิด Sub-stream สำหรับ Live View',
    ],
    recommendedActionTh: 'เปลี่ยน Codec เป็น H.265 / H.265+ ปรับ Bitrate Main Stream เหลือ 4096 kbps และเปิด Sub-stream',
  },
];
