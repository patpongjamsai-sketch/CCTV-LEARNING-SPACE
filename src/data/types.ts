export type EquipmentCategory =
  | 'camera'
  | 'recorder'
  | 'network'
  | 'storage'
  | 'cable'
  | 'connector'
  | 'display'
  | 'power'
  | 'tool';

export type CctvSystemType = 'Analog' | 'IP' | 'Both' | 'None';
export type PlaceholderShape = 'camera' | 'box' | 'disk' | 'cable' | 'connector' | 'monitor' | 'power';

export interface EquipmentDefinition {
  id: string;
  name: string;
  category: EquipmentCategory;
  system: CctvSystemType;
  description: string;
  specifications: Record<string, string | number | boolean>;
  connectors: string[];
  trainingPrice: number;
  inspectable: boolean;
  pickupable: boolean;
  quantity: number;
  weight: number;
  condition: 'new' | 'good' | 'inspect';
  assetKey: string;
  placeholderShape: PlaceholderShape;
  required: boolean;
}

export type ObjectiveType =
  | 'inspect'
  | 'pickup'
  | 'place'
  | 'answer'
  | 'connect'
  | 'select'
  | 'test'
  | 'configure'
  | 'troubleshoot';

export interface MissionObjective {
  id: string;
  type: ObjectiveType;
  label: string;
  required: boolean;
  equipmentId?: string;
  questionId?: string;
}

export interface MissionDefinition {
  id: string;
  floor: number;
  room: number;
  title: string;
  description: string;
  objectives: MissionObjective[];
  passScore: number;
  nextMission: string | null;
}

export type ScoreCategory = 'knowledge' | 'selection' | 'connection' | 'problem' | 'budget';

export interface LearningQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  hint: string;
  category: ScoreCategory;
  points: number;
  triggerEquipmentId?: string;
}

export interface AnswerRecord {
  selected: number;
  correct: boolean;
  attempts: number;
}

export interface InventoryEntry {
  equipmentId: string;
  quantity: number;
  condition: EquipmentDefinition['condition'];
}

export interface MissionResult {
  status: 'not-started' | 'active' | 'completed';
  score: number;
  bestScore: number;
  attemptCount: number;
  completionTime: number;
  completedAt: string | null;
}

export interface SerializableGameState {
  saveVersion: 1;
  currentMission: string;
  unlockedRooms: number[];
  completedObjectives: string[];
  missionResults: Record<string, MissionResult>;
  inventory: Record<string, InventoryEntry>;
  attemptCount: number;
  completionTime: number;
  answers: Record<string, AnswerRecord>;
  usedHints: string[];
  hintsUsed: number;
  wrongSelections: number;
  equipmentChanged: number;
  budgetUsed: number;
  missionStartedAt: number | null;
}

export interface ScoreBreakdown {
  knowledge: number;
  equipmentSelection: number;
  connection: number;
  problemSolving: number;
  budgetManagement: number;
  completion: number;
  total: number;
}

export interface InteractionTarget {
  kind: 'equipment' | 'terminal' | 'place-target' | 'door' | 'preview';
  id: string;
  name: string;
  distance: number;
  equipmentId?: string;
}
