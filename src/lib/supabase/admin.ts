import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

function getSupabaseSecretKey(): string {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error('Missing required Supabase configuration: SUPABASE_SECRET_KEY');
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
