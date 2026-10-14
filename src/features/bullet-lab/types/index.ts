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

export type MountPointId = 'A' | 'B' | 'C' | 'D' | 'E';

export interface MountPointInfo {
  id: MountPointId;
  label: string;
  worldPosition: [number, number, number];
  heightMeters: number;
  obstruction: boolean;
  collisionRisk: 'low' | 'medium' | 'high';
  coveragePotential: number; // 0 - 100%
  descriptionTh: string;
}

export type SurfaceType = 'wood' | 'metal' | 'concrete' | 'smartboard';

export interface SurfaceInfo {
  id: SurfaceType;
  nameTh: string;
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

export type ScrewTightness = 'loose' | 'correct' | 'overtight';

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

export interface Mission4Submission {
  surfaceType: SurfaceType;
  drillBit: DrillBitType;
  drillBitSize: DrillBitSize;
  drillMode: DrillMode;
  anchor: AnchorType;
  drillDepthMm: number;
  pullTestForceN: number;
  submittedAt: string;
  score: number;
  isPassed: boolean;
  feedback: string[];
}
