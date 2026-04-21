import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const BLOCK_DURATION_MS = 5 * 60 * 1000;

const BLOCKED_IPS = new Set([
  '192.168.1.100',
]);

const SUSPICIOUS_PATTERNS = [
  /(\.\.)/,
  /(\/etc\/passwd)/,
  /(\/wp-admin)/,
  /(\/wp-content)/,
  /(\/phpMyAdmin)/,
  /(\/admin\/)/,
  /(\.env)/,
  /(\.git)/,
  /select\s+.*\s+from/i,
  /union\s+select/i,
  /<script/i,
  /javascript:/i,
  /onerror=/i,
  /onload=/i,
];

const USER_AGENTS = [
  /curl/i,
  /wget/i,
  /python/i,
  /scrapy/i,
  /bot/i,
  /spider/i,
  /crawler/i,
];

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  return realIP || 'unknown';
}

function isRateLimited(ip: string): { limited: boolean; remaining?: number; reset?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { limited: true, remaining: 0, reset: entry.blockedUntil };
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    rateLimitMap.delete(ip);
  }

  const current = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

  if (now - current.firstRequest > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { limited: false, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
  }

  current.count++;

  if (current.count > MAX_REQUESTS) {
    current.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimitMap.set(ip, current);
    return { limited: true, remaining: 0, reset: current.blockedUntil };
  }

  rateLimitMap.set(ip, current);
  return { limited: false, remaining: MAX_REQUESTS - current.count, reset: current.firstRequest + WINDOW_MS };
}

function isSuspiciousPath(path: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(path));
}

function isBot(userAgent: string): boolean {
  return USER_AGENTS.some(pattern => pattern.test(userAgent));
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>\"\'%;()&+]/g, '');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';

  if (BLOCKED_IPS.has(clientIP)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (pathname.startsWith('/api/')) {
    const rateLimit = isRateLimited(clientIP);
    
    if (rateLimit.limited) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.reset! - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.reset!.toString(),
        },
      });
    }

    request.headers.set('x-rate-limit-remaining', rateLimit.remaining?.toString() || '0');
    request.headers.set('x-rate-limit-reset', rateLimit.reset?.toString() || '0');
  }

  if (isSuspiciousPath(pathname)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  if (pathname.startsWith('/api/') && isBot(userAgent) && !pathname.startsWith('/api/logbook')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
