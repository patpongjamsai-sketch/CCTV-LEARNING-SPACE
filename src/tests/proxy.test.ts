import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, config } from '../proxy';

describe('Next.js 16 Auth Proxy', () => {
  it('has a matcher that excludes static files and images', () => {
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher[0]).toContain('_next/static');
    expect(config.matcher[0]).toContain('_next/image');
    expect(config.matcher[0]).toContain('favicon.ico');
  });

  it('runs proxy on incoming requests and returns a valid NextResponse', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        'x-forwarded-host': 'localhost:3000',
      },
    });

    const response = await proxy(request);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});
