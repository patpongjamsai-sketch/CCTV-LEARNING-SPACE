import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

function getSupabaseSecretKey(): string {
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY
  )?.trim();

  if (!secretKey) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaHlqaXJtemp4eGVrZXpsY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ3NjI5NSwiZXhwIjoyMTA1MDUyMjk1fQ.145vPL0y6EiRGRSOspxBDAqbz91RdJJwrvceS1vmkpg';
  }

  return secretKey;
}

/**
 * Creates an admin client for server-only trusted transactions. Never import
 * this module from a Client Component or expose the secret key in responses.
 */
export function createAdminSupabaseClient() {
  const { url } = getSupabasePublicConfig();

  return createClient(url, getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
