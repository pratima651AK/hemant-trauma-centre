import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// Note: In serverless/edge environments, this map might be reset frequently.
// For production scale, use Redis (e.g., Upstash).
const rateLimitMap = new Map();

interface RateLimitData {
  count: number;
  lastReset: number;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = (request as any).ip || '127.0.0.1';

  // 1. Security Headers (Enforce Strict HTTPS & Hardening)
  const headers = response.headers;
  
  // HSTS: Tell browsers to ONLY use HTTPS for the next 1 year
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME-sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict browser features (Camera, Mic, etc. not needed)
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. Rate Limiting Strategy
  const path = request.nextUrl.pathname;

  // Configuration from Security Audit
  let limit = 100; // Default: high limit for static assets
  let windowMs = 60 * 1000; // 1 minute default

  // Specific rules
  if (path === '/api/appointments' && request.method === 'POST') {
    limit = 20; 
    windowMs = 60 * 60 * 1000; // 1 hour
  } else if (path === '/api/admin/appointments/sync') {
    limit = 15; // Set to 15 req/min (4s refresh interval) by user request 
    windowMs = 60 * 1000; // 1 minute
  } else {
    // Skip rate limiting for static files, images, etc. to avoid overhead
    if (path.match(/\.(css|js|png|jpg|jpeg|svg|ico|json)$/)) {
      return response;
    }
  }

  // Rate Limiting Logic
  const now = Date.now();
  const data = rateLimitMap.get(ip) as RateLimitData || { count: 0, lastReset: now };

  if (now - data.lastReset > windowMs) {
    data.count = 0;
    data.lastReset = now;
  }

  if (data.count >= limit) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  data.count++;
  rateLimitMap.set(ip, data);
  
  // Clean up old entries periodically (naive approach)
  if (rateLimitMap.size > 10000) rateLimitMap.clear();

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except next static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
