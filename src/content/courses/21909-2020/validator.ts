import type {
  ContentId,
  UnitContentBundle,
  ValidationIssue,
  ValidationResult,
} from './types';

function issue(code: string, domain: string, message: string, contentId?: ContentId): ValidationIssue {
  return { code, severity: 'error', domain, message, contentId };
}

function collectIds(bundle: UnitContentBundle): Array<{ id: string; source: string }> {
  const records: Array<{ id: string; source: string }> = [
    { id: bundle.unit.id, source: 'unit' },
    ...bundle.lessons.map((lesson) => ({ id: lesson.id, source: 'lesson' })),
    ...bundle.lessons.flatMap((lesson) => lesson.sections.map((section) => ({ id: section.id, source: 'section' }))),
    ...bundle.assessments.map((assessment) => ({ id: assessment.id, source: 'assessment' })),
    ...bundle.assessments.flatMap((assessment) => assessment.tasks.map((task) => ({ id: task.id, source: 'assessment-task' }))),
    { id: bundle.lab.id, source: 'lab' },
    ...bundle.lab.functionalTests.map((test) => ({ id: test.id, source: 'functional-test' })),
    { id: bundle.faultChallenge.id, source: 'fault-challenge' },
    { id: bundle.reflection.id, source: 'reflection' },
    ...bundle.unlockRules.map((rule) => ({ id: rule.id, source: 'unlock-rule' })),
  ];

  return records;
}

function validateUniqueIds(bundle: UnitContentBundle): ValidationIssue[] {
  const seen = new Map<string, string>();
  const issues: ValidationIssue[] = [];

  for (const record of collectIds(bundle)) {
    const previousSource = seen.get(record.id);
    if (previousSource) {
      issues.push(issue('VAL-ID-001', 'id', `Duplicate content ID: ${record.id} (${previousSource}, ${record.source})`, record.id));
    } else {
      seen.set(record.id, record.source);
    }
  }

  return issues;
}

function validateLessonSequence(bundle: UnitContentBundle): ValidationIssue[] {
  const expectedIds = Array.from({ length: 10 }, (_, index) => `${bundle.unit.id}-L${String(index + 1).padStart(2, '0')}`);
  const actualIds = bundle.lessons.map((lesson) => lesson.id);
  const issues: ValidationIssue[] = [];

  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    issues.push(issue('VAL-LESSON-001', 'lesson', `Lessons must follow the frozen ${bundle.unit.id}-L01 through ${bundle.unit.id}-L10 sequence.`));
  }

  for (const lesson of bundle.lessons) {
    if (!lesson.titleTh.trim()) {
      issues.push(issue('VAL-LESSON-002', 'lesson', 'Lesson title is required.', lesson.id));
    }
    if (lesson.order >= 1 && lesson.order <= 10 && lesson.id !== `${bundle.unit.id}-L${String(lesson.order).padStart(2, '0')}`) {
      issues.push(issue('VAL-LESSON-003', 'lesson', 'Lesson order does not match its canonical ID.', lesson.id));
    }
  }

  return issues;
}

function validateReferences(bundle: UnitContentBundle): ValidationIssue[] {
  const knownIds = new Set(collectIds(bundle).map((record) => record.id));
  const issues: ValidationIssue[] = [];

  for (const lesson of bundle.lessons) {
    for (const reference of [lesson.previousLessonId, lesson.nextLessonId]) {
      if (reference && !knownIds.has(reference)) {
        issues.push(issue('VAL-REF-001', 'reference', `Unknown lesson reference: ${reference}`, lesson.id));
      }
    }
  }

  for (const assessment of bundle.assessments) {
    for (const lessonId of assessment.lessonMapping) {
      if (!knownIds.has(lessonId)) {
        issues.push(issue('VAL-REF-002', 'reference', `Assessment references unknown content: ${lessonId}`, assessment.id));
      }
    }
  }

  return issues;
}

function validateAssessmentWeights(bundle: UnitContentBundle): ValidationIssue[] {
  const weightedItems = [...bundle.assessments, bundle.lab, bundle.faultChallenge, bundle.reflection];
  const total = weightedItems.reduce((sum, item) => sum + (item.scoring?.weight ?? 0), 0);
  return total === 100
    ? []
    : [issue('VAL-ASSESS-WEIGHT-001', 'assessment', `Expected total weight 100, actual total is ${total}.`)];
}

function validateSafetyGate(bundle: UnitContentBundle): ValidationIssue[] {
  const labRule = bundle.unlockRules.find((rule) => rule.targetId === bundle.lab.id);
  const hasSafety = labRule?.all.some(
    (condition) => 'evidenceType' in condition && condition.evidenceType === 'safety_check' && condition.condition === 'validated',
  );
  const hasTeacherVerification = labRule?.all.some(
    (condition) => 'evidenceType' in condition && condition.evidenceType === 'teacher_verification' && condition.condition === 'verified',
  );

  return hasSafety && hasTeacherVerification
    ? []
    : [issue('VAL-SAFETY-001', 'rule', 'LAB unlock must require validated safety evidence and teacher verification.')];
}

export function validateUnitContract(bundle: UnitContentBundle): ValidationResult {
  const issues = [
    ...validateUniqueIds(bundle),
    ...validateLessonSequence(bundle),
    ...validateReferences(bundle),
    ...validateAssessmentWeights(bundle),
    ...validateSafetyGate(bundle),
  ];
  const errors = issues.filter((item) => item.severity === 'error');
  const warnings = issues.filter((item) => item.severity === 'warning');
  const info = issues.filter((item) => item.severity === 'info');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: info.length,
    },
  };
}
