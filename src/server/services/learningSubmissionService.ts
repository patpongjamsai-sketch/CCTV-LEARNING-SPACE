import 'server-only';

import { createAdminSupabaseClient } from '../../lib/supabase/admin';
import {
  evidenceMetadataSchema,
  learningSubmissionInputSchema,
} from '../http/apiSchemas';

const MAX_EVIDENCE_FILE_SIZE = 52_428_800;
const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
]);

type LearningSubmissionResult =
  | {
      kind: 'quiz';
      id: string;
      attemptNo: number;
      status: string;
      submittedAt: string;
    }
  | {
      kind: 'lab';
      id: string;
      attemptNo: number;
      status: string;
      submittedAt: string;
    };

export type EvidenceRecord = {
  id: string;
  labSubmissionId: string;
  storageBucket: string;
  storagePath: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  checksumSha256: string;
  createdAt: string;
};

function throwSupabaseError(error: { message: string } | null, fallback: string): void {
  if (error) {
    throw new Error(`${fallback}: ${error.message}`);
  }
}

async function requireActiveStudentMembership(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  actorId: string,
  classId: string,
) {
  const { data: membership, error } = await supabase
    .from('class_members')
    .select('class_id')
    .eq('class_id', classId)
    .eq('profile_id', actorId)
    .eq('member_role', 'student')
    .eq('active', true)
    .maybeSingle();

  throwSupabaseError(error, 'Failed to verify class membership');
  if (!membership) {
    throw new Error('Forbidden: student is not an active member of this class');
  }
}

async function requireActiveClass(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  classId: string,
) {
  const { data: classRow, error } = await supabase
    .from('classes')
    .select('id, course_id, status')
    .eq('id', classId)
    .maybeSingle();

  throwSupabaseError(error, 'Failed to load class');
  if (!classRow) {
    throw new Error('Not found: class not found');
  }
  if (!['planned', 'active'].includes(classRow.status)) {
    throw new Error('Forbidden: class is not accepting submissions');
  }

  return classRow;
}

export async function createLearningSubmission(
  actorId: string,
  rawInput: unknown,
): Promise<LearningSubmissionResult> {
  const input = learningSubmissionInputSchema.parse(rawInput);
  const supabase = createAdminSupabaseClient();

  await requireActiveStudentMembership(supabase, actorId, input.classId);
  const classRow = await requireActiveClass(supabase, input.classId);

  if (input.kind === 'quiz') {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, unit_id, status, available_from, available_until')
      .eq('id', input.quizId)
      .maybeSingle();

    throwSupabaseError(quizError, 'Failed to load quiz');
    if (!quiz) {
      throw new Error('Not found: quiz not found');
    }
    if (quiz.status !== 'published') {
      throw new Error('Forbidden: quiz is not published');
    }

    const now = Date.now();
    if (quiz.available_from && Date.parse(quiz.available_from) > now) {
      throw new Error('Forbidden: quiz is not available yet');
    }
    if (quiz.available_until && Date.parse(quiz.available_until) < now) {
      throw new Error('Forbidden: quiz availability has ended');
    }

    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id, course_id')
      .eq('id', quiz.unit_id)
      .maybeSingle();

    throwSupabaseError(unitError, 'Failed to load quiz unit');
    if (!unit || unit.course_id !== classRow.course_id) {
      throw new Error('Forbidden: quiz does not belong to this class course');
    }

    const { data: attempt, error: insertError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: input.quizId,
        class_id: input.classId,
        student_id: actorId,
        client_answers: input.answers,
        started_at: input.startedAt,
        submitted_at: new Date().toISOString(),
      })
      .select('id, attempt_no, status, submitted_at')
      .single();

    throwSupabaseError(insertError, 'Failed to save quiz submission');
    if (!attempt) {
      throw new Error('Failed to save quiz submission');
    }

    return {
      kind: 'quiz',
      id: attempt.id,
      attemptNo: attempt.attempt_no,
      status: attempt.status,
      submittedAt: attempt.submitted_at,
    };
  }

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('id, course_id, status')
    .eq('id', input.unitId)
    .maybeSingle();

  throwSupabaseError(unitError, 'Failed to load learning unit');
  if (!unit) {
    throw new Error('Not found: learning unit not found');
  }
  if (unit.status !== 'published' || unit.course_id !== classRow.course_id) {
    throw new Error('Forbidden: learning unit is not available for this class');
  }

  const { data: submission, error: insertError } = await supabase
    .from('lab_submissions')
    .insert({
      class_id: input.classId,
      unit_id: input.unitId,
      student_id: actorId,
      title: input.title,
      student_notes: input.studentNotes,
    })
    .select('id, attempt_no, status')
    .single();

  throwSupabaseError(insertError, 'Failed to save LAB submission');
  if (!submission) {
    throw new Error('Failed to save LAB submission');
  }

  const submittedAt = new Date().toISOString();
  const { data: submitted, error: submitError } = await supabase
    .from('lab_submissions')
    .update({ status: 'submitted', submitted_at: submittedAt })
    .eq('id', submission.id)
    .eq('student_id', actorId)
    .select('id, attempt_no, status, submitted_at')
    .single();

  throwSupabaseError(submitError, 'Failed to submit LAB answer');
  if (!submitted) {
    throw new Error('Failed to submit LAB answer');
  }

  return {
    kind: 'lab',
    id: submitted.id,
    attemptNo: submitted.attempt_no,
    status: submitted.status,
    submittedAt: submitted.submitted_at,
  };
}

export function sanitizeEvidenceFileName(fileName: string): string {
  const lastSegment = fileName.replaceAll('\\', '/').split('/').pop() || 'evidence';
  const sanitized = lastSegment
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120);

  return sanitized || 'evidence';
}

export function buildEvidenceStoragePath(
  actorId: string,
  submissionId: string,
  fileName: string,
): string {
  return `${actorId}/${submissionId}/${crypto.randomUUID()}-${sanitizeEvidenceFileName(fileName)}`;
}

async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function uploadLearningEvidence(
  actorId: string,
  submissionId: string,
  file: Blob & { name?: string; type: string; size: number },
  rawMetadata: unknown = {},
): Promise<EvidenceRecord> {
  const metadata = evidenceMetadataSchema.parse(rawMetadata);

  if (file.size < 1 || file.size > MAX_EVIDENCE_FILE_SIZE) {
    throw new Error('Evidence file must be between 1 byte and 50 MB');
  }
  if (!ALLOWED_EVIDENCE_MIME_TYPES.has(file.type)) {
    throw new Error('Evidence file type is not allowed');
  }

  const supabase = createAdminSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from('lab_submissions')
    .select('id, class_id, student_id, status')
    .eq('id', submissionId)
    .maybeSingle();

  throwSupabaseError(submissionError, 'Failed to load LAB submission');
  if (!submission) {
    throw new Error('Not found: LAB submission not found');
  }
  if (submission.student_id !== actorId) {
    throw new Error('Forbidden: cannot upload evidence for another student');
  }
  if (!['draft', 'submitted', 'revision_required'].includes(submission.status)) {
    throw new Error('Forbidden: LAB submission is not accepting evidence');
  }

  await requireActiveStudentMembership(supabase, actorId, submission.class_id);

  const storagePath = buildEvidenceStoragePath(actorId, submissionId, file.name || 'evidence');
  const checksumSha256 = await sha256(file);
  const storage = supabase.storage.from('lab-evidence');
  const { error: uploadError } = await storage.upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Failed to upload evidence file: ${uploadError.message}`);
  }

  const { data: evidence, error: insertError } = await supabase
    .from('evidence_files')
    .insert({
      lab_submission_id: submissionId,
      storage_bucket: 'lab-evidence',
      storage_path: storagePath,
      original_name: file.name || 'evidence',
      mime_type: file.type,
      file_size: file.size,
      checksum_sha256: checksumSha256,
      uploaded_by: actorId,
      metadata,
    })
    .select('id, lab_submission_id, storage_bucket, storage_path, original_name, mime_type, file_size, checksum_sha256, created_at')
    .single();

  if (insertError || !evidence) {
    await storage.remove([storagePath]);
    throwSupabaseError(insertError, 'Failed to save evidence metadata');
    throw new Error('Failed to save evidence metadata');
  }

  return {
    id: evidence.id,
    labSubmissionId: evidence.lab_submission_id,
    storageBucket: evidence.storage_bucket,
    storagePath: evidence.storage_path,
    originalName: evidence.original_name,
    mimeType: evidence.mime_type,
    fileSize: Number(evidence.file_size),
    checksumSha256: evidence.checksum_sha256,
    createdAt: evidence.created_at,
  };
}
