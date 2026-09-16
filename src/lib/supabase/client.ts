import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from './config';

/** Creates a browser-only client with the publishable key. */
export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createBrowserClient(url, publishableKey);
}
