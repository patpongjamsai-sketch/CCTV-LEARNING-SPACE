import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mockStudents = [
  {
    student_id: '69219090001',
    prefix: 'นางสาว',
    first_name: 'บัณฑิตา',
    last_name: 'เพ็งกลาง',
    full_name: 'นางสาวบัณฑิตา เพ็งกลาง',
    gender: 'หญิง',
    group_id: '692190901',
    order_num: 1,
    email: '69219090001@utc.ac.th',
  },
];

const mockSql = vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
  const queryStr = strings.join('?');
  if (queryStr.includes('from public.students')) {
    const param = values[0];
    if (param === '69219090001' || param === '69219090001@utc.ac.th') {
      return Promise.resolve(mockStudents);
    }
    return Promise.resolve([]);
  }
  if (queryStr.includes('from public.profiles')) {
    return Promise.resolve([]);
  }
  return Promise.resolve([]);
});

vi.mock('../server/database/client', () => ({
  getServerDatabase: () => mockSql,
}));

vi.mock('../lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: vi.fn(async () => ({ error: null })),
    },
  })),
}));

vi.mock('../lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: vi.fn(async () => ({ data: { users: [] } })),
        createUser: vi.fn(async () => ({
          data: { user: { id: 'test-user-uuid-1234' } },
          error: null,
        })),
        updateUserById: vi.fn(async () => ({
          data: { user: { id: 'test-user-uuid-1234' } },
          error: null,
        })),
      },
    },
  })),
}));

import { GET, POST } from '../app/api/auth/first-time-setup/route';

describe('First-time Setup API Route (/api/auth/first-time-setup)', () => {
  it('GET returns 400 when query is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/first-time-setup');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/กรุณาระบุรหัสนักศึกษา/);
  });

  it('GET returns 404 when student is not found', async () => {
    const request = new Request('http://localhost:3000/api/auth/first-time-setup?query=99999999999');
    const response = await GET(request);
    expect(response.status).toBe(404);
  });

  it('GET finds student by student ID and returns student details with PV1 class', async () => {
    const request = new Request('http://localhost:3000/api/auth/first-time-setup?query=69219090001');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.found).toBe(true);
    expect(json.studentId).toBe('69219090001');
    expect(json.fullName).toBe('นางสาวบัณฑิตา เพ็งกลาง');
    expect(json.email).toBe('69219090001@utc.ac.th');
    expect(json.groupCode).toBe('PV1');
  });

  it('POST rejects passwords shorter than 6 characters', async () => {
    const request = new Request('http://localhost:3000/api/auth/first-time-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '69219090001',
        password: '123',
        confirmPassword: '123',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/6 ตัวอักษร/);
  });

  it('POST successfully provisions user and auto-signs in', async () => {
    const request = new Request('http://localhost:3000/api/auth/first-time-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '69219090001',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.email).toBe('69219090001@utc.ac.th');
    expect(json.autoSignedIn).toBe(true);
  });
});
