export type ContentId = string;

export type LessonRole = 'foundation' | 'component' | 'integration';

export type AssessmentType =
  | 'knowledge_check'
  | 'equipment_matching'
  | 'system_diagram'
  | 'pre_lab_gate';

export type EvidenceType =
  | 'knowledge_answer'
  | 'reasoning'
  | 'matching_result'
  | 'system_diagram'
  | 'safety_check'
  | 'functional_test'
  | 'fault_log'
  | 'retest_result'
  | 'reflection'
  | 'teacher_verification';

export interface ScoringRule {
  maxScore: number;
  weight: number;
  method: 'points' | 'rubric' | 'completion';
}

export interface PassingRule {
  type: 'minimum_percentage' | 'pre_lab_gate' | 'teacher_verified';
  value?: number;
}

export interface EvidenceRequirement {
  type: EvidenceType;
  required: boolean;
  teacherVerification?: boolean;
}

export interface LessonDefinition {
  id: ContentId;
  unitId: ContentId;
  order: number;
  role: LessonRole;
  titleTh: string;
  learningObjectives: string[];
  sections: Array<{ id: ContentId; type: string; content: string }>;
  previousLessonId?: ContentId;
  nextLessonId?: ContentId;
}

export interface AssessmentTask {
  id: ContentId;
  type: string;
  prompt: string;
  points: number;
  expectedConcepts?: string[];
}

export interface AssessmentDefinition {
  id: ContentId;
  unitId: ContentId;
  order: number;
  type: AssessmentType;
  titleTh: string;
  purpose: string;
  lessonMapping: ContentId[];
  tasks: AssessmentTask[];
  scoring: ScoringRule;
  passingRule: PassingRule;
  evidenceRequirements: EvidenceRequirement[];
}

export interface FunctionalTest {
  id: ContentId;
  titleTh: string;
  required: boolean;
}

export interface LabDefinition {
  id: ContentId;
  unitId: ContentId;
  titleTh: string;
  workOrder: string;
  functionalTests: FunctionalTest[];
  evidenceRequirements: EvidenceRequirement[];
  teacherVerification: EvidenceRequirement;
  scoring: ScoringRule;
}

export interface FaultChallengeDefinition {
  id: ContentId;
  unitId: ContentId;
  titleTh: string;
  requiredProcess: Array<'problem' | 'possible_cause' | 'test' | 'result' | 'solution' | 'retest'>;
  evidenceRequirements: EvidenceRequirement[];
  scoring: ScoringRule;
}

export interface ReflectionDefinition {
  id: ContentId;
  unitId: ContentId;
  titleTh: string;
  prompts: string[];
  evidenceRequirements: EvidenceRequirement[];
  scoring: ScoringRule;
}

export type UnlockCondition =
  | { contentId: ContentId; condition: 'passed' | 'completed' | 'pre_lab_passed' }
  | { evidenceType: EvidenceType; condition: 'validated' | 'verified' };

export interface UnlockRule {
  id: ContentId;
  targetId: ContentId;
  all: UnlockCondition[];
}

export interface UnitDefinition {
  id: ContentId;
  courseId: ContentId;
  number: number;
  titleTh: string;
  theoryMinutes: number;
  practicalMinutes: number;
  learningOutcome: string;
  requiredGates: ContentId[];
}

export interface UnitCompletionRule {
  requiredContent: ContentId[];
  requiredEvidence: EvidenceRequirement[];
  requiredGates: ContentId[];
  requireTeacherVerification: boolean;
}

export interface UnitContentBundle {
  unit: UnitDefinition;
  lessons: LessonDefinition[];
  assessments: AssessmentDefinition[];
  lab: LabDefinition;
  faultChallenge: FaultChallengeDefinition;
  reflection: ReflectionDefinition;
  assessmentFlow: ContentId[];
  completionRule: UnitCompletionRule;
  unlockRules: UnlockRule[];
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  domain: string;
  contentId?: ContentId;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}
