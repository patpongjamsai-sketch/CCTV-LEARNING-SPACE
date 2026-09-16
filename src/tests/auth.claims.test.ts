import { describe, expect, it } from 'vitest';
import {
  getVerifiedAuthContext,
  requireVerifiedAuthContext,
  UnauthenticatedError,
} from '../lib/auth/claims';

describe('verified server claims', () => {
  it('returns an authenticated context only for a verified subject claim', async () => {
    await expect(
      getVerifiedAuthContext(async () => ({
        sub: '0e9b81d6-2a26-4f01-bc18-f61dc9904f95',
        role: 'authenticated',
      })),
    ).resolves.toEqual({
      userId: '0e9b81d6-2a26-4f01-bc18-f61dc9904f95',
      claims: {
        sub: '0e9b81d6-2a26-4f01-bc18-f61dc9904f95',
        role: 'authenticated',
      },
    });
  });

  it('rejects a missing verified subject in requireVerifiedAuthContext', async () => {
    await expect(requireVerifiedAuthContext(async () => null)).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
  });
});
