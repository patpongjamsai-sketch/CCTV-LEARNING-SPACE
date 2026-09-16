export function parseServerDatabaseUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('SUPABASE_DB_URL must be a valid PostgreSQL URL');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('SUPABASE_DB_URL must use the postgresql protocol');
  }
  if (url.port !== '6543') {
    throw new Error('SUPABASE_DB_URL must use Supavisor Transaction Pooler port 6543');
  }
  if (url.searchParams.get('sslmode') !== 'require') {
    throw new Error('SUPABASE_DB_URL must include sslmode=require');
  }

  return url;
}

export function requireServerDatabaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  const value = environment.SUPABASE_DB_URL;
  if (!value) throw new Error('Missing server-only environment variable SUPABASE_DB_URL');
  parseServerDatabaseUrl(value);
  return value;
}
