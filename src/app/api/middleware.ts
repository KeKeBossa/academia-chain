import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { rateLimitConfig } from '../../server/security/rateLimit';

const store = new LRUCache<string, { count: number; expiresAt: number }>({ max: 10_000 });

const applyRateLimit = (request: NextRequest) => {
  const now = Date.now();
  const identifier = `${request.ip ?? 'unknown'}:${request.nextUrl.pathname}`;
  const record = store.get(identifier);
  if (record && record.expiresAt > now) {
    if (record.count + 1 > rateLimitConfig.maxRequests) {
      return NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 });
    }
    record.count += 1;
    store.set(identifier, record);
  } else {
    store.set(identifier, { count: 1, expiresAt: now + rateLimitConfig.windowMs });
  }
  return null;
};

export const config = {
  matcher: ['/api/:path*']
};

export default function middleware(request: NextRequest) {
  const rateLimitedPrefixes = ['/api/auth/did', '/api/collaboration/posts', '/api/assets'];
  if (rateLimitedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    const limited = applyRateLimit(request);
    if (limited) {
      return limited;
    }
  }
  return NextResponse.next();
}
