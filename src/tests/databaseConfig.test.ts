import { describe, expect, it } from 'vitest';

import { parseServerDatabaseUrl } from '../server/database/config';

describe('Supavisor server database configuration', () => {
  it('accepts the transaction pooler with SSL on port 6543', () => {
    const value = parseServerDatabaseUrl(
      'postgresql://postgres.project:secret@pooler.supabase.com:6543/postgres?sslmode=require',
    );

    expect(value.port).toBe('6543');
    expect(value.searchParams.get('sslmode')).toBe('require');
  });

  it('rejects a session/direct port for the Vercel serverless path', () => {
    expect(() =>
      parseServerDatabaseUrl(
        'postgresql://postgres.project:secret@pooler.supabase.com:5432/postgres?sslmode=require',
      ),
    ).toThrow(/6543/);
  });

  it('rejects a connection that does not require TLS', () => {
    expect(() =>
      parseServerDatabaseUrl('postgresql://postgres.project:secret@pooler.supabase.com:6543/postgres'),
    ).toThrow(/sslmode=require/);
  });
});
