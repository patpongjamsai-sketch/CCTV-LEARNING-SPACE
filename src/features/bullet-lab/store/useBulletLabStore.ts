import { create } from 'zustand';
import {
  ActionLogEntry,
  AnchorType,
  DrillBitSize,
  DrillBitType,
  DrillMode,
  LearningMode,
  MarkedPoint,
  Mission4Submission,
  MissionId,
  MountPointId,
  PPEItemId,
  ScrewTightness,
  SurfaceType,
} from '../types';
import { SURFACES_DATA } from '../data/bulletLabData';

interface BulletLabState {
  // Global & Session
  learningMode: LearningMode;
  currentMission: MissionId;
  ghostCameraVisible: boolean;
  pipPreviewVisible: boolean;
  showResultModal: boolean;
  showActionLog: boolean;
  actionLogs: ActionLogEntry[];

  // Roblox Player Character
  playerPosition: [number, number, number];
  isNearPpeTable: boolean;
  distanceToPpeTable: number;
  isPpeModalOpen: boolean;

  // Mission 1: PPE
  ppeEquipped: Record<PPEItemId, boolean>;

  // Mission 2: Site Survey & Position
  selectedMountPoint: MountPointId;
  previewingMountPoint: MountPointId | null;

  // Mission 3: Camera FOV & Angles
  pan: number; // -90 to +90 degrees
  tilt: number; // -60 to +60 degrees
  rotation: number; // -45 to +45 degrees
  fovDegrees: number;
  cameraViewMode: 'technician' | 'pov';

  // Mission 4: Surface Inspection & Dedicated Assessment Modal
  surfaceType: SurfaceType;
  selectedDrillBit: DrillBitType;
  selectedDrillBitSize: DrillBitSize;
  selectedDrillMode: DrillMode;
  selectedAnchor: AnchorType;
  isMission4ModalOpen: boolean;
  mission4Submission: Mission4Submission | null;
  submissionsBySurface: Record<SurfaceType, Mission4Submission | null>;

  // Mission 5: Measurement & Marking
  templatePlaced: boolean;
  tapeMeasureActive: boolean;
  levelChecked: boolean;
  markedPoints: MarkedPoint[];

  // Mission 6: Drilling & Anchor
  drillDepthMm: number; // 0 to 45 mm
  drillAngleDeg: number; // e.g. 90
  isDrilling: boolean;
  anchorInserted: boolean;

  // Mission 7: Base / Junction Box
  baseMounted: boolean;
  screwTightness: ScrewTightness;

  // Mission 8: Camera Mounting
  cameraMounted: boolean;
  jointLocked: boolean;

  // Mission 9: Pull Test
  pullTestForceN: number; // 0 to 40 N
  isPullTesting: boolean;

  // Actions
  setLearningMode: (mode: LearningMode) => void;
  setCurrentMission: (mission: MissionId) => void;
  toggleGhostCamera: () => void;
  togglePipPreview: () => void;
  setShowResultModal: (show: boolean) => void;
  setShowActionLog: (show: boolean) => void;
  logAction: (mission: MissionId, action: string, detail: string) => void;

  setPlayerPosition: (pos: [number, number, number]) => void;
  setIsNearPpeTable: (near: boolean) => void;
  setDistanceToPpeTable: (dist: number) => void;
  setIsPpeModalOpen: (open: boolean) => void;

  togglePPE: (item: PPEItemId) => void;
  setPpeEquipped: (ppe: Record<PPEItemId, boolean>) => void;
  setSelectedMountPoint: (id: MountPointId) => void;
  setPreviewingMountPoint: (id: MountPointId | null) => void;

  setPan: (pan: number) => void;
  setTilt: (tilt: number) => void;
  setRotation: (rotation: number) => void;
  setFovDegrees: (fov: number) => void;
  setCameraViewMode: (mode: 'technician' | 'pov') => void;

  setSurfaceType: (surface: SurfaceType) => void;
  setSelectedDrillBit: (bit: DrillBitType) => void;
  setSelectedDrillBitSize: (size: DrillBitSize) => void;
  setSelectedDrillMode: (mode: DrillMode) => void;
  setSelectedAnchor: (anchor: AnchorType) => void;

  setTemplatePlaced: (placed: boolean) => void;
  setTapeMeasureActive: (active: boolean) => void;
  setLevelChecked: (checked: boolean) => void;
  addMarkedPoint: (point: MarkedPoint) => void;
  clearMarkedPoints: () => void;

  setDrillDepthMm: (depth: number) => void;
  setDrillAngleDeg: (angle: number) => void;
  setIsDrilling: (drilling: boolean) => void;
  setAnchorInserted: (inserted: boolean) => void;

  setBaseMounted: (mounted: boolean) => void;
  setScrewTightness: (tightness: ScrewTightness) => void;

  setCameraMounted: (mounted: boolean) => void;
  setJointLocked: (locked: boolean) => void;

  setPullTestForceN: (force: number) => void;
  setIsPullTesting: (testing: boolean) => void;

  setIsMission4ModalOpen: (open: boolean) => void;
  saveMission4Submission: (submission: Mission4Submission) => void;
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

export const useBulletLabStore = create<BulletLabState>((set, get) => ({
  // Defaults
  learningMode: 'learn',
  currentMission: 1,
  ghostCameraVisible: false,
  pipPreviewVisible: true,
  showResultModal: false,
  showActionLog: false,
  actionLogs: [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString('th-TH'),
      mission: 1,
      action: 'start_session',
      detail: 'เข้าสู่ห้องปฏิบัติการ Bullet Camera 3D Interactive Lab',
    },
  ],

  // Roblox Player Character
  playerPosition: [0, 0, 3],
  isNearPpeTable: false,
  distanceToPpeTable: 5.0,
  isPpeModalOpen: false,

  // Mission 1
  ppeEquipped: initialPpeState,

  // Mission 2
  selectedMountPoint: 'A',
  previewingMountPoint: null,

  // Mission 3
  pan: 15,
  tilt: -20,
  rotation: 0,
  fovDegrees: 75,
  cameraViewMode: 'technician',

  // Mission 4
  surfaceType: 'concrete',
  selectedDrillBit: 'masonry',
  selectedDrillBitSize: '6mm',
  selectedDrillMode: 'hammer',
  selectedAnchor: 'plastic-expansion',
  isMission4ModalOpen: false,
  mission4Submission: null,
  submissionsBySurface: {
    wood: null,
    metal: null,
    concrete: null,
    smartboard: null,
  },

  // Mission 5
  templatePlaced: false,
  tapeMeasureActive: false,
  levelChecked: false,
  markedPoints: [],

  // Mission 6
  drillDepthMm: 0,
  drillAngleDeg: 90,
  isDrilling: false,
  anchorInserted: false,

  // Mission 7
  baseMounted: false,
  screwTightness: 'loose',

  // Mission 8
  cameraMounted: false,
  jointLocked: false,

  // Mission 9
  pullTestForceN: 0,
  isPullTesting: false,

  // Action methods
  setLearningMode: (mode) => {
    set({ learningMode: mode });
    get().logAction(get().currentMission, 'change_mode', `เปลี่ยนโหมดเป็น ${mode}`);
  },

  setCurrentMission: (mission) => {
    set({
      currentMission: mission,
      isMission4ModalOpen: mission === 4,
    });
    get().logAction(mission, 'switch_mission', `เข้าสู่ภารกิจที่ ${mission}`);
  },

  setIsMission4ModalOpen: (open) => set({ isMission4ModalOpen: open }),

  saveMission4Submission: (submission) => {
    set((state) => ({
      mission4Submission: submission,
      submissionsBySurface: {
        ...state.submissionsBySurface,
        [submission.surfaceType]: submission,
      },
      surfaceType: submission.surfaceType,
      selectedDrillBit: submission.drillBit,
      selectedDrillBitSize: submission.drillBitSize,
      selectedDrillMode: submission.drillMode,
      selectedAnchor: submission.anchor,
      drillDepthMm: submission.drillDepthMm,
      pullTestForceN: submission.pullTestForceN,
    }));
    get().logAction(
      4,
      'submit_worksheet',
      `บันทึกผลงานการติดตั้ง: พื้นผิว ${submission.surfaceType} ได้ ${submission.score}/100 คะแนน (${submission.isPassed ? 'ผ่าน' : 'ไม่ผ่าน'})`
    );
  },

  saveSurfaceSubmission: (surface, submission) => {
    set((state) => ({
      submissionsBySurface: {
        ...state.submissionsBySurface,
        [surface]: submission,
      },
      mission4Submission: submission,
      surfaceType: submission.surfaceType,
      selectedDrillBit: submission.drillBit,
      selectedDrillBitSize: submission.drillBitSize,
      selectedDrillMode: submission.drillMode,
      selectedAnchor: submission.anchor,
      drillDepthMm: submission.drillDepthMm,
      pullTestForceN: submission.pullTestForceN,
    }));
    get().logAction(
      4,
      'submit_worksheet',
      `บันทึกผลงานการติดตั้ง: พื้นผิว ${surface} ได้ ${submission.score}/100 คะแนน (${submission.isPassed ? 'ผ่าน' : 'ไม่ผ่าน'})`
    );
  },

  toggleGhostCamera: () => {
    const next = !get().ghostCameraVisible;
    set({ ghostCameraVisible: next });
    get().logAction(
      get().currentMission,
      'toggle_ghost_camera',
      next ? 'เปิดแสดงกล้องต้นแบบ (Ghost)' : 'ปิดแสดงกล้องต้นแบบ'
    );
  },

  togglePipPreview: () => {
    set({ pipPreviewVisible: !get().pipPreviewVisible });
  },

  setShowResultModal: (show) => set({ showResultModal: show }),
  setShowActionLog: (show) => set({ showActionLog: show }),

  logAction: (mission, action, detail) => {
    const newEntry: ActionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('th-TH'),
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

  togglePPE: (item) => {
    set((state) => {
      const current = !!state.ppeEquipped[item];
      const next = !current;
      get().logAction(
        1,
        'toggle_ppe',
        `${next ? 'สวมใส่' : 'ถอดออก'} อุปกรณ์: ${item}`
      );
      return {
        ppeEquipped: {
          ...state.ppeEquipped,
          [item]: next,
        },
      };
    });
  },

  setPpeEquipped: (ppe) => {
    set({ ppeEquipped: ppe });
    get().logAction(1, 'batch_update_ppe', 'อัปเดตการสวมใส่อุปกรณ์ PPE ทั้งหมด');
  },

  setSelectedMountPoint: (id) => {
    set({ selectedMountPoint: id });
    get().logAction(2, 'select_mount_point', `เลือกจุดติดตั้งตำแหน่ง ${id}`);
  },

  setPreviewingMountPoint: (id) => set({ previewingMountPoint: id }),

  setPan: (pan) => {
    set({ pan });
    get().logAction(3, 'adjust_pan', `ปรับมุม Pan: ${pan}°`);
  },

  setTilt: (tilt) => {
    set({ tilt });
    get().logAction(3, 'adjust_tilt', `ปรับมุม Tilt: ${tilt}°`);
  },

  setRotation: (rotation) => {
    set({ rotation });
    get().logAction(3, 'adjust_rotation', `ปรับมุม Roll: ${rotation}°`);
  },

  setFovDegrees: (fov) => set({ fovDegrees: fov }),

  setCameraViewMode: (mode) => {
    set({ cameraViewMode: mode });
    get().logAction(
      3,
      'change_camera_view',
      `เปลี่ยนมุมมองกล้องเป็น: ${mode === 'pov' ? 'มุมมองเลนส์ (CCTV POV)' : 'มุมมองช่าง (Technician)'}`
    );
  },

  setSurfaceType: (surface) => {
    const info = SURFACES_DATA[surface];
    if (info) {
      set({
        surfaceType: surface,
        selectedDrillBit: info.recommendedBitType,
        selectedDrillBitSize: info.recommendedBitSize,
        selectedDrillMode: info.recommendedMode,
        selectedAnchor: info.recommendedAnchorType,
        drillDepthMm: 0,
      });
    } else {
      set({ surfaceType: surface });
    }
    get().logAction(4, 'change_surface', `เลือกชนิดพื้นผิว: ${surface}`);
  },

  setSelectedDrillBit: (bit) => {
    set({ selectedDrillBit: bit });
    get().logAction(4, 'select_drill_bit', `เลือกชนิดดอกสว่าน: ${bit}`);
  },

  setSelectedDrillBitSize: (size) => {
    set({ selectedDrillBitSize: size });
    get().logAction(4, 'select_drill_bit_size', `เลือกขนาดดอกสว่าน: ${size}`);
  },

  setSelectedDrillMode: (mode) => {
    set({ selectedDrillMode: mode });
    get().logAction(4, 'select_drill_mode', `เลือกโหมดสว่าน: ${mode}`);
  },

  setSelectedAnchor: (anchor) => {
    set({ selectedAnchor: anchor });
    get().logAction(4, 'select_anchor', `เลือกชนิดพุก: ${anchor}`);
  },

  setTemplatePlaced: (placed) => {
    set({ templatePlaced: placed });
    get().logAction(4, 'place_template', placed ? 'วางแผ่นทาบเจาะ' : 'ยกแผ่นทาบออก');
  },

  setTapeMeasureActive: (active) => {
    set({ tapeMeasureActive: active });
    get().logAction(4, 'use_tape_measure', active ? 'ใช้ตลับเมตรวัดระยะ' : 'เก็บตลับเมตร');
  },

  setLevelChecked: (checked) => {
    set({ levelChecked: checked });
    get().logAction(4, 'check_level', checked ? 'วัดระดับน้ำระนาบตรง' : 'ยกเลิกระดับน้ำ');
  },

  addMarkedPoint: (point) => {
    set((state) => ({
      markedPoints: [...state.markedPoints, point],
    }));
    get().logAction(4, 'mark_hole', `มาร์กตำแหน่งรูเจาะ: ${point.label}`);
  },

  clearMarkedPoints: () => {
    set({ markedPoints: [] });
    get().logAction(4, 'clear_marks', 'ล้างตำแหน่งมาร์กรูเจาะ');
  },

  setDrillDepthMm: (depth) => {
    set({ drillDepthMm: depth });
    if (depth >= 35) {
      get().logAction(4, 'drill_depth_reached', `เจาะรูลึก ${depth} mm สำเร็จ`);
    }
  },

  setDrillAngleDeg: (angle) => set({ drillAngleDeg: angle }),
  setIsDrilling: (drilling) => set({ isDrilling: drilling }),

  setAnchorInserted: (inserted) => {
    set({ anchorInserted: inserted });
    get().logAction(4, 'insert_anchor', inserted ? 'ใส่พุกลงในรูเจาะ' : 'ถอดพุกออก');
  },

  setBaseMounted: (mounted) => {
    set({ baseMounted: mounted });
    get().logAction(4, 'mount_base', mounted ? 'ติดตั้งกล่อง/ฐานยึดเข้ากับผนัง' : 'ถอดฐานยึด');
  },

  setScrewTightness: (tightness) => {
    set({ screwTightness: tightness });
    get().logAction(4, 'tighten_screws', `ขันสกรูกำหนดสถานะ: ${tightness}`);
  },

  setCameraMounted: (mounted) => {
    set({ cameraMounted: mounted });
    get().logAction(4, 'mount_camera', mounted ? 'สวมตัวกล้อง Bullet เข้ากับฐาน' : 'ถอดตัวกล้อง');
  },

  setJointLocked: (locked) => {
    set({ jointLocked: locked });
    get().logAction(4, 'lock_joint', locked ? 'ล็อกข้อต่อ 3 แกนเรียบร้อย' : 'คลายล็อกข้อต่อ');
  },

  setPullTestForceN: (force) => {
    set({ pullTestForceN: force });
    get().logAction(4, 'apply_pull_force', `ทดสอบดึงแรง ${force} N`);
  },

  setIsPullTesting: (testing) => set({ isPullTesting: testing }),

  resetLab: () => {
    set({
      currentMission: 1,
      ppeEquipped: initialPpeState,
      selectedMountPoint: 'A',
      previewingMountPoint: null,
      pan: 15,
      tilt: -20,
      rotation: 0,
      fovDegrees: 75,
      cameraViewMode: 'technician',
      surfaceType: 'concrete',
      selectedDrillBit: 'masonry',
      selectedDrillBitSize: '6mm',
      selectedDrillMode: 'hammer',
      selectedAnchor: 'plastic-expansion',
      templatePlaced: false,
      tapeMeasureActive: false,
      levelChecked: false,
      markedPoints: [],
      drillDepthMm: 0,
      anchorInserted: false,
      baseMounted: false,
      screwTightness: 'loose',
      cameraMounted: false,
      jointLocked: false,
      pullTestForceN: 0,
      isPullTesting: false,
      isMission4ModalOpen: false,
      mission4Submission: null,
      submissionsBySurface: {
        wood: null,
        metal: null,
        concrete: null,
        smartboard: null,
      },
      showResultModal: false,
    });
    get().logAction(1, 'reset_lab', 'รีเซ็ตสถานะห้องแล็บทั้งหมด');
  },
}));
