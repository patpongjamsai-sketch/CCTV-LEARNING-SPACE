import { describe, expect, it } from 'vitest';
import { getSupabasePublicConfig } from '../lib/supabase/config';

describe('Supabase public configuration', () => {
  it('requires both public values and does not depend on a secret key', () => {
    expect(() => getSupabasePublicConfig({})).toThrow(
      'NEXT_PUBLIC_SUPABASE_URL',
    );

    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
        SUPABASE_SECRET_KEY: 'must-not-be-read-here',
      }),
    ).toEqual({
      url: 'https://project.supabase.co',
      publishableKey: 'sb_publishable_example',
    });
  });
});
