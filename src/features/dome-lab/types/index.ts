export type LearningMode = 'learn' | 'practice' | 'assessment';

export type MissionId = 1 | 2 | 3 | 4;

export interface MissionMeta {
  id: MissionId;
  titleTh: string;
  subtitleTh: string;
  phaseName: string;
  iconName: string;
}

export type PPEItemId =
  | 'helmet'
  | 'glasses'
  | 'mask'
  | 'gloves'
  | 'shoes'
  | 'slippers'
  | 'cap'
  | 'sunglasses';

export interface PPEItem {
  id: PPEItemId;
  numberIndex: number;
  nameTh: string;
  category: 'required' | 'optional' | 'decoy';
  icon: string;
  descriptionTh: string;
}

export type RoomId = 'room1_indoor' | 'room2_outdoor';

export interface RoomMeta {
  id: RoomId;
  nameTh: string;
  subtitleTh: string;
  badgeTh: string;
  descriptionTh: string;
  environmentFeatures: string[];
}

export type DomeMountPointId = 'A' | 'B' | 'C' | 'D';

export interface DomeMountPointInfo {
  id: DomeMountPointId;
  roomId: RoomId;
  label: string;
  worldPosition: [number, number, number];
  heightMeters: number;
  mountType: 'ceiling' | 'wall-bracket' | 'soffit' | 'steel-column' | 'wall';
  obstruction: boolean;
  irReflectionRisk: 'none' | 'low' | 'high';
  irReflectionReasonTh: string;
  coveragePotential: number; // 0 - 100%
  vandalRisk: 'low' | 'medium' | 'high';
  junctionBoxRequired: boolean;
  descriptionTh: string;
  taskGuideTh: string;
  isOptimal?: boolean;
  lensMm?: number;
  fovDegrees?: number;
  targetDescription?: string;
}

export type SurfaceType = 'wood' | 'metal' | 'concrete' | 'smartboard';

export interface SurfaceInfo {
  id: SurfaceType;
  nameTh: string;
  subtitleTh: string;
  color: string;
  texturePattern: string;
  recommendedBit: string;
  recommendedBitType: DrillBitType;
  recommendedBitSize: DrillBitSize;
  recommendedMode: DrillMode;
  recommendedAnchor: string;
  recommendedAnchorType: AnchorType;
  recommendedScrew: string;
  drillDepthMm: number;
  maxPullForceN: number;
  notesTh: string;
}

export type DrillBitType = 'masonry' | 'wood' | 'metal' | 'multipurpose';
export type DrillBitSize = '4mm' | '6mm' | '8mm' | '10mm';
export type DrillMode = 'hammer' | 'normal' | 'driver';

export type AnchorType =
  | 'plastic-expansion'
  | 'wood-screw-direct'
  | 'self-drilling-metal'
  | 'hollow-wall-toggle';

export interface MarkedPoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  mission: MissionId;
  action: string;
  detail: string;
}

export interface DomeAssemblyChecklist {
  basePlateMounted: boolean;
  cableGrommetSealed: boolean;
  antiIrRingVerified: boolean;
  domeCoverCleaned: boolean;
}

export interface Mission4Submission {
  surfaceType: SurfaceType;
  drillBit: DrillBitType;
  drillBitSize: DrillBitSize;
  drillMode: DrillMode;
  anchor: AnchorType;
  drillDepthMm: number;
  pullTestForceN: number;
  domeAssembly: DomeAssemblyChecklist;
  submittedAt: string;
  score: number;
  isPassed: boolean;
  feedback: string[];
}

export interface RoomCameraLifecycle {
  hasPickedUpCamera: boolean;
  isCameraMounted: boolean;
  mountedPointId: DomeMountPointId | null;
  pan: number;
  tilt: number;
  rotation: number;
  fovDegrees: number;
  dayNightMode: 'day' | 'night_ir';
}


