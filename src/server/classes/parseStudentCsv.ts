import { z } from 'zod';

export type StudentImportRow = {
  email: string;
  studentCode: string;
  displayName: string;
};

const studentRowSchema = z.object({
  email: z.email().max(254),
  student_code: z.string().trim().min(1).max(50),
  display_name: z.string().trim().min(1).max(100),
});

function parseCsvRecords(source: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && character === ',') {
      record.push(field);
      field = '';
      continue;
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value.trim() !== '')) records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += character;
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field');
  record.push(field);
  if (record.some((value) => value.trim() !== '')) records.push(record);
  return records;
}

export function parseStudentCsv(csv: string): StudentImportRow[] {
  if (Buffer.byteLength(csv, 'utf8') > 1_048_576) {
    throw new Error('CSV is larger than 1 MB');
  }

  const records = parseCsvRecords(csv.replace(/^\uFEFF/, ''));
  const header = records.shift()?.map((value) => value.trim());
  const expectedHeader = ['email', 'student_code', 'display_name'];

  if (!header || header.join(',') !== expectedHeader.join(',')) {
    throw new Error('CSV header must be email,student_code,display_name');
  }

  if (records.length === 0) throw new Error('CSV must contain at least one student');
  if (records.length > 500) throw new Error('CSV supports at most 500 students per import');

  const seenEmails = new Set<string>();
  const seenStudentCodes = new Set<string>();

  return records.map((fields, index) => {
    if (fields.length !== expectedHeader.length) {
      throw new Error(`CSV row ${index + 2} must contain exactly 3 columns`);
    }

    const parsed = studentRowSchema.safeParse({
      email: fields[0]?.trim().toLowerCase(),
      student_code: fields[1]?.trim(),
      display_name: fields[2]?.trim(),
    });

    if (!parsed.success) {
      throw new Error(`CSV row ${index + 2} is invalid: ${z.prettifyError(parsed.error)}`);
    }

    if (seenEmails.has(parsed.data.email)) {
      throw new Error(`Duplicate email in CSV: ${parsed.data.email}`);
    }
    if (seenStudentCodes.has(parsed.data.student_code)) {
      throw new Error(`Duplicate student_code in CSV: ${parsed.data.student_code}`);
    }

    seenEmails.add(parsed.data.email);
    seenStudentCodes.add(parsed.data.student_code);

    return {
      email: parsed.data.email,
      studentCode: parsed.data.student_code,
      displayName: parsed.data.display_name,
    };
  });
}
