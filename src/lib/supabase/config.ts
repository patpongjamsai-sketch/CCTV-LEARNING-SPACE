export type SupabaseEnvironment = Record<string, string | undefined>;

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

function requiredValue(environment: SupabaseEnvironment, name: string): string {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`Missing required Supabase configuration: ${name}`);
  }

  return value;
}

/**
 * Reads only the two values that may be used by browser code. Secret-key
 * configuration intentionally lives in the server-only admin module.
 */
export function getSupabasePublicConfig(
  environment: SupabaseEnvironment = process.env,
): SupabasePublicConfig {
  const url = requiredValue(environment, 'NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = requiredValue(
    environment,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be an absolute URL');
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS');
  }

  return { url, publishableKey };
}
