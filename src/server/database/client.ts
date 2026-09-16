import postgres, { type Sql } from 'postgres';

import { requireServerDatabaseUrl } from './config';

declare global {
  // eslint-disable-next-line no-var
  var __cctvServerSql: Sql | undefined;
}

export function getServerDatabase(): Sql {
  if (!globalThis.__cctvServerSql) {
    globalThis.__cctvServerSql = postgres(requireServerDatabaseUrl(), {
      // Supavisor Transaction mode ไม่รองรับ prepared statements ข้าม transaction
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  return globalThis.__cctvServerSql;
}

export async function withTrustedTransaction<T>(
  operation: (transaction: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  const sql = getServerDatabase();

  return sql.begin(async (transaction) => {
    // จำกัดสิทธิ์เฉพาะ transaction นี้ และคืนค่าอัตโนมัติเมื่อ commit/rollback
    await transaction`set local role service_role`;
    return operation(transaction);
  }) as Promise<T>;
}
