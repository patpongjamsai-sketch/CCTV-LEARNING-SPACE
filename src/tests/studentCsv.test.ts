import { describe, expect, it } from 'vitest';

import { parseStudentCsv } from '../server/classes/parseStudentCsv';

describe('student invitation CSV', () => {
  it('parses the required columns and removes a UTF-8 BOM', () => {
    const rows = parseStudentCsv(
      '\uFEFFemail,student_code,display_name\r\nSomchai@example.com,67301,สมชาย ใจดี\r\n',
    );

    expect(rows).toEqual([
      {
        email: 'somchai@example.com',
        studentCode: '67301',
        displayName: 'สมชาย ใจดี',
      },
    ]);
  });

  it('supports quoted display names that contain commas', () => {
    const rows = parseStudentCsv(
      'email,student_code,display_name\nstudent@example.com,S001,"แจ่มใส, พัฒน์พงค์"',
    );

    expect(rows[0]?.displayName).toBe('แจ่มใส, พัฒน์พงค์');
  });

  it('rejects duplicate email addresses before any invitation is sent', () => {
    const csv = [
      'email,student_code,display_name',
      'same@example.com,S001,ผู้เรียนหนึ่ง',
      'SAME@example.com,S002,ผู้เรียนสอง',
    ].join('\n');

    expect(() => parseStudentCsv(csv)).toThrow(/duplicate email/i);
  });

  it('rejects a CSV whose headers do not match the contract', () => {
    expect(() => parseStudentCsv('name,email\nStudent,student@example.com')).toThrow(
      /email,student_code,display_name/,
    );
  });
});
