import { create } from 'zustand';
import {
  ActionLogEntry,
  AnchorType,
  DomeAssemblyChecklist,
  DomeMountPointId,
  DrillBitSize,
  DrillBitType,
  DrillMode,
  LearningMode,
  Mission4Submission,
  MissionId,
  PPEItemId,
  RoomCameraLifecycle,
  RoomId,
  SurfaceType,
} from '../types';
import { DOME_MOUNT_POINTS_DATA } from '../data/domeLabData';

interface DomeLabState {
  // Global & Session
  learningMode: LearningMode;
  currentMission: MissionId;
  activeRoom: RoomId;
  pipPreviewVisible: boolean;
  showResultModal: boolean;
  showActionLog: boolean;
  actionLogs: ActionLogEntry[];

  // Per-room camera lifecycles (isolated per room)
  roomCameras: Record<RoomId, RoomCameraLifecycle>;

  // Roblox Player Character & Interactive Equipment
  playerPosition: [number, number, number];
  isNearPpeTable: boolean;
  distanceToPpeTable: number;
  isPpeModalOpen: boolean;

  hasPickedUpCamera: boolean;
  isCameraMounted: boolean;
  mountedPointId: DomeMountPointId | null;
  isNearCameraTable: boolean;
  distanceToCameraTable: number;
  nearMountPointId: DomeMountPointId | null;
  activeDirectorView: 'office' | 'depot' | 'workshop' | 'overview' | 'target' | 'player';

  // Mission 1: PPE
  ppeEquipped: Record<PPEItemId, boolean>;

  // Mission 2: Site Survey & Mount Points in 2 Rooms
  selectedMountPoint: DomeMountPointId;
  previewingMountPoint: DomeMountPointId | null;

  // Mission 3: 3-Axis Gimbal & IR Reflection Simulation
  pan: number; // -180 to +180 deg
  tilt: number; // 0 to 75 deg
  rotation: number; // -180 to +180 deg (Azimuth)
  fovDegrees: number; // 60 to 110 deg
  dayNightMode: 'day' | 'night_ir';
  cameraViewMode: 'technician' | 'pov';

  // Mission 4: Surface Installation & 4-Window Worksheet Modal
  surfaceType: SurfaceType;
  selectedDrillBit: DrillBitType | null;
  selectedDrillBitSize: DrillBitSize | null;
  selectedDrillMode: DrillMode | null;
  selectedAnchor: AnchorType | null;
  drillDepthMm: number;
  pullTestForceN: number;
  domeAssembly: DomeAssemblyChecklist;
  isMission4ModalOpen: boolean;
  mission4Submission: Mission4Submission | null;
  submissionsBySurface: Record<SurfaceType, Mission4Submission | null>;

  // Actions
  setLearningMode: (mode: LearningMode) => void;
  setCurrentMission: (mission: MissionId) => void;
  setActiveRoom: (room: RoomId) => void;
  togglePipPreview: () => void;
  setShowResultModal: (show: boolean) => void;
  setShowActionLog: (show: boolean) => void;
  logAction: (mission: MissionId, action: string, detail: string) => void;

  setPlayerPosition: (pos: [number, number, number]) => void;
  setIsNearPpeTable: (near: boolean) => void;
  setDistanceToPpeTable: (dist: number) => void;
  setIsPpeModalOpen: (open: boolean) => void;

  pickUpCamera: () => void;
  mountCameraAtPoint: (pointId: DomeMountPointId) => void;
  setIsNearCameraTable: (near: boolean) => void;
  setDistanceToCameraTable: (dist: number) => void;
  setNearMountPointId: (id: DomeMountPointId | null) => void;
  setActiveDirectorView: (view: 'office' | 'depot' | 'workshop' | 'overview' | 'target' | 'player') => void;

  togglePPE: (item: PPEItemId) => void;
  setPpeEquipped: (ppe: Record<PPEItemId, boolean>) => void;

  setSelectedMountPoint: (id: DomeMountPointId) => void;
  setPreviewingMountPoint: (id: DomeMountPointId | null) => void;

  setPan: (pan: number) => void;
  setTilt: (tilt: number) => void;
  setRotation: (rotation: number) => void;
  setFovDegrees: (fov: number) => void;
  setDayNightMode: (mode: 'day' | 'night_ir') => void;
  setCameraViewMode: (mode: 'technician' | 'pov') => void;

  setSurfaceType: (surface: SurfaceType) => void;
  setSelectedDrillBit: (bit: DrillBitType | null) => void;
  setSelectedDrillBitSize: (size: DrillBitSize | null) => void;
  setSelectedDrillMode: (mode: DrillMode | null) => void;
  setSelectedAnchor: (anchor: AnchorType | null) => void;
  setDrillDepthMm: (depth: number) => void;
  setPullTestForceN: (force: number) => void;
  setDomeAssembly: (assembly: Partial<DomeAssemblyChecklist>) => void;
  setIsMission4ModalOpen: (open: boolean) => void;
  saveSurfaceSubmission: (surface: SurfaceType, submission: Mission4Submission) => void;
  resetLab: () => void;
}

const initialPpeState: Record<PPEItemId, boolean> = {
  helmet: false,
  glasses: false,
  mask: false,
  gloves: false,
  shoes: false,
  slippers: false,
  cap: false,
  sunglasses: false,
};

const initialSubmissionsBySurface: Record<SurfaceType, Mission4Submission | null> = {
  wood: null,
  metal: null,
  concrete: null,
  smartboard: null,
};

const initialDomeAssembly: DomeAssemblyChecklist = {
  basePlateMounted: true,
  cableGrommetSealed: true,
  antiIrRingVerified: true,
  domeCoverCleaned: true,
};

const initialRoomCameras: Record<RoomId, RoomCameraLifecycle> = {
  room1_indoor: {
    hasPickedUpCamera: false,
    isCameraMounted: false,
    mountedPointId: null,
    pan: 0,
    tilt: 0,
    rotation: 0,
    fovDegrees: 92,
    dayNightMode: 'day',
  },
  room2_outdoor: {
    hasPickedUpCamera: false,
    isCameraMounted: false,
    mountedPointId: null,
    pan: 0,
    tilt: 0,
    rotation: 0,
    fovDegrees: 95,
    dayNightMode: 'day',
  },
};

export const useDomeLabStore = create<DomeLabState>((set, get) => ({
  // Defaults
  learningMode: 'learn',
  currentMission: 1,
  activeRoom: 'room1_indoor',
  pipPreviewVisible: true,
  showResultModal: false,
  showActionLog: false,
  actionLogs: [
    {
      id: 'init-1',
      timestamp: '00:00:00',
      mission: 1,
      action: 'เข้าสู่ห้องปฏิบัติการ',
      detail: 'เริ่มหลักสูตรฝึกอบรม Dome Camera 3D Interactive Lab V1 (2 ห้องปฏิบัติการ)',
    },
  ],

  // Isolated per-room camera lifecycles
  roomCameras: initialRoomCameras,

  // Roblox Player Position (starts in active room center)
  playerPosition: [0, 0, 3.0],
  isNearPpeTable: false,
  distanceToPpeTable: 4.5,
  isPpeModalOpen: false,

  hasPickedUpCamera: false,
  isCameraMounted: false,
  mountedPointId: null,
  isNearCameraTable: false,
  distanceToCameraTable: 5.0,
  nearMountPointId: null,
  activeDirectorView: 'player',

  // Mission 1: PPE
  ppeEquipped: initialPpeState,

  // Mission 2: Survey & Points
  selectedMountPoint: 'A',
  previewingMountPoint: null,

  // Mission 3: 3-Axis Gimbal & IR
  pan: 0,
  tilt: 0,
  rotation: 0,
  fovDegrees: 92,
  dayNightMode: 'day',
  cameraViewMode: 'technician',

  // Mission 4: Surface Worksheets
  surfaceType: 'wood',
  selectedDrillBit: null,
  selectedDrillBitSize: null,
  selectedDrillMode: null,
  selectedAnchor: null,
  drillDepthMm: 25,
  pullTestForceN: 25,
  domeAssembly: initialDomeAssembly,
  isMission4ModalOpen: false,
  mission4Submission: null,
  submissionsBySurface: initialSubmissionsBySurface,

  // Actions
  setLearningMode: (mode) => {
    set({ learningMode: mode });
    get().logAction(get().currentMission, 'เปลี่ยนโหมดการเรียนรู้', `เปลี่ยนเป็น ${mode}`);
  },

  setCurrentMission: (mission) => {
    set({ currentMission: mission });
    get().logAction(mission, 'เปลี่ยนภารกิจ', `เข้าสู่ภารกิจที่ ${mission}`);
  },

  setActiveRoom: (room) => {
    const prevRoom = get().activeRoom;
    if (prevRoom !== room) {
      const roomCam = get().roomCameras[room];
      const defaultPoint = room === 'room1_indoor' ? 'A' : 'C';
      const activePoint = roomCam.mountedPointId ?? defaultPoint;
      set({
        activeRoom: room,
        selectedMountPoint: activePoint,
        hasPickedUpCamera: roomCam.hasPickedUpCamera,
        isCameraMounted: roomCam.isCameraMounted,
        mountedPointId: roomCam.mountedPointId,
        pan: roomCam.pan,
        tilt: roomCam.tilt,
        rotation: roomCam.rotation,
        fovDegrees: roomCam.fovDegrees,
        dayNightMode: roomCam.dayNightMode,
      });
      get().logAction(
        get().currentMission,
        'สลับห้องปฏิบัติการ',
        `ย้ายไปยัง ${room === 'room1_indoor' ? 'ห้องสำนักงาน & เซิร์ฟเวอร์' : 'โรงฝึกงาน & ทางเดินชายคา'}`
      );
    }
  },

  togglePipPreview: () => set((state) => ({ pipPreviewVisible: !state.pipPreviewVisible })),
  setShowResultModal: (show) => set({ showResultModal: show }),
  setShowActionLog: (show) => set({ showActionLog: show }),

  logAction: (mission, action, detail) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEntry: ActionLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      mission,
      action,
      detail,
    };
    set((state) => ({
      actionLogs: [newEntry, ...state.actionLogs].slice(0, 50),
    }));
  },

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setIsNearPpeTable: (near) => set({ isNearPpeTable: near }),
  setDistanceToPpeTable: (dist) => set({ distanceToPpeTable: dist }),
  setIsPpeModalOpen: (open) => set({ isPpeModalOpen: open }),

  pickUpCamera: () => {
    const curRoom = get().activeRoom;
    set((state) => ({
      hasPickedUpCamera: true,
      currentMission: 2,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: {
          ...state.roomCameras[curRoom],
          hasPickedUpCamera: true,
        },
      },
    }));
    get().logAction(
      2,
      'เบิกตัวกล้องโดม',
      `หยิบตัวกล้อง Dome Camera ออกจากโต๊ะเบิกอุปกรณ์ประจำ${curRoom === 'room1_indoor' ? 'ห้องสำนักงาน' : 'โรงฝึกงาน'}`
    );
  },

  mountCameraAtPoint: (pointId) => {
    const pointInfo = DOME_MOUNT_POINTS_DATA[pointId];
    const targetRoom = pointInfo.roomId;
    set((state) => ({
      isCameraMounted: true,
      mountedPointId: pointId,
      selectedMountPoint: pointId,
      activeRoom: targetRoom,
      pan: 0,
      tilt: 0,
      rotation: 0,
      fovDegrees: pointInfo.fovDegrees,
      currentMission: 3,
      roomCameras: {
        ...state.roomCameras,
        [targetRoom]: {
          ...state.roomCameras[targetRoom],
          isCameraMounted: true,
          mountedPointId: pointId,
          pan: 0,
          tilt: 0,
          rotation: 0,
          fovDegrees: pointInfo.fovDegrees ?? 92,
        },
      },
    }));
    get().logAction(2, 'ติดตั้งกล้องวงจรปิด', `ติดตั้งตัวกล้องเสร็จสมบูรณ์ที่ ${pointInfo.label}`);
  },

  setIsNearCameraTable: (near) => set({ isNearCameraTable: near }),
  setDistanceToCameraTable: (dist) => set({ distanceToCameraTable: dist }),
  setNearMountPointId: (id) => set({ nearMountPointId: id }),
  setActiveDirectorView: (view) => set({ activeDirectorView: view }),

  togglePPE: (item) => {
    const curState = get().ppeEquipped[item];
    const newState = !curState;
    set((state) => ({
      ppeEquipped: {
        ...state.ppeEquipped,
        [item]: newState,
      },
    }));
    get().logAction(
      1,
      newState ? 'สวมใส่อุปกรณ์ PPE' : 'ถอดอุปกรณ์ PPE',
      `รายการ: ${item}`
    );
  },

  setPpeEquipped: (ppe) => set({ ppeEquipped: ppe }),

  setSelectedMountPoint: (id) => {
    const pointInfo = DOME_MOUNT_POINTS_DATA[id];
    set({
      selectedMountPoint: id,
      activeRoom: pointInfo.roomId,
      fovDegrees: pointInfo.fovDegrees,
    });
    get().logAction(2, 'เลือกจุดติดตั้งกล้องโดม', `เลือก ${pointInfo.label}`);
  },

  setPreviewingMountPoint: (id) => set({ previewingMountPoint: id }),

  setPan: (pan) => {
    const curRoom = get().activeRoom;
    set((state) => ({
      pan,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: { ...state.roomCameras[curRoom], pan },
      },
    }));
  },
  setTilt: (tilt) => {
    const curRoom = get().activeRoom;
    set((state) => ({
      tilt,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: { ...state.roomCameras[curRoom], tilt },
      },
    }));
  },
  setRotation: (rotation) => {
    const curRoom = get().activeRoom;
    set((state) => ({
      rotation,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: { ...state.roomCameras[curRoom], rotation },
      },
    }));
  },
  setFovDegrees: (fov) => {
    const curRoom = get().activeRoom;
    set((state) => ({
      fovDegrees: fov,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: { ...state.roomCameras[curRoom], fovDegrees: fov },
      },
    }));
  },
  setDayNightMode: (mode) => {
    const curRoom = get().activeRoom;
    set((state) => ({
      dayNightMode: mode,
      roomCameras: {
        ...state.roomCameras,
        [curRoom]: { ...state.roomCameras[curRoom], dayNightMode: mode },
      },
    }));
    get().logAction(3, 'สลับโหมดกล้อง', `เปลี่ยนเป็น ${mode === 'day' ? 'กลางวัน (Day)' : 'กลางคืน (Night IR)'}`);
  },
  setCameraViewMode: (mode) => set({ cameraViewMode: mode }),

  setSurfaceType: (surface) => set({ surfaceType: surface }),
  setSelectedDrillBit: (bit) => set({ selectedDrillBit: bit }),
  setSelectedDrillBitSize: (size) => set({ selectedDrillBitSize: size }),
  setSelectedDrillMode: (mode) => set({ selectedDrillMode: mode }),
  setSelectedAnchor: (anchor) => set({ selectedAnchor: anchor }),
  setDrillDepthMm: (depth) => set({ drillDepthMm: depth }),
  setPullTestForceN: (force) => set({ pullTestForceN: force }),
  setDomeAssembly: (assembly) =>
    set((state) => ({ domeAssembly: { ...state.domeAssembly, ...assembly } })),
  setIsMission4ModalOpen: (open) => set({ isMission4ModalOpen: open }),

  saveSurfaceSubmission: (surface, submission) => {
    set((state) => ({
      submissionsBySurface: {
        ...state.submissionsBySurface,
        [surface]: submission,
      },
      mission4Submission: submission,
    }));
    get().logAction(
      4,
      'บันทึกผลงานการติดตั้ง',
      `พื้นผิว ${surface}: ได้คะแนน ${submission.score}/100 (${submission.isPassed ? 'ผ่าน' : 'ปรับปรุง'})`
    );
  },

  resetLab: () => {
    set({
      currentMission: 1,
      activeRoom: 'room1_indoor',
      ppeEquipped: initialPpeState,
      hasPickedUpCamera: false,
      isCameraMounted: false,
      mountedPointId: null,
      activeDirectorView: 'player',
      selectedMountPoint: 'A',
      previewingMountPoint: null,
      pan: 0,
      tilt: 0,
      rotation: 0,
      fovDegrees: 92,
      dayNightMode: 'day',
      cameraViewMode: 'technician',
      roomCameras: initialRoomCameras,
      surfaceType: 'wood',
      selectedDrillBit: null,
      selectedDrillBitSize: null,
      selectedDrillMode: null,
      selectedAnchor: null,
      drillDepthMm: 25,
      pullTestForceN: 25,
      domeAssembly: initialDomeAssembly,
      isMission4ModalOpen: false,
      mission4Submission: null,
      submissionsBySurface: initialSubmissionsBySurface,
    });
    get().logAction(1, 'รีเซ็ตห้องปฏิบัติการ', 'เริ่มต้นกระบวนการฝึกอบรมใหม่ทั้งหมด');
  },
}));
