import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge-runtime admin auth gate.
 *
 * Protects both the admin UI pages (`/admin/*`) and the admin mutation APIs
 * (`/api/admin/*`). Unauthenticated UI requests are redirected to `/admin/login`;
 * unauthenticated API requests get a 401.
 *
 * It re-implements the exact session check from `src/lib/auth/index.ts`
 * (`isAdminLoggedIn` / `verifySessionToken`) using Web Crypto, because that lib
 * relies on Node's `crypto` + `next/headers`, neither of which is available in
 * the Edge middleware runtime. The cookie name, token layout and secret are kept
 * identical so a session set by `/api/admin/login` is honoured here unchanged:
 *   token = sha256(`${ADMIN_PASSWORD}:${timestamp}:${SESSION_SECRET}`) + ':' + timestamp
 */

const ADMIN_COOKIE_NAME = 'jeffy_admin_session';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h, mirrors auth lib

// NOTE: middleware runs on the Edge runtime, so these env vars must be available
// there. They are inlined at build time by Next for non-`NEXT_PUBLIC_` vars used
// in middleware. Defaults mirror the auth lib so behaviour matches if envs are
// missing (the auth lib uses the same fallbacks).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const [hash, timestamp] = token.split(':');
  if (!hash || !timestamp) return false;

  const tokenTime = parseInt(timestamp, 10);
  if (!Number.isFinite(tokenTime)) return false;
  if (Date.now() - tokenTime > SESSION_MAX_AGE_MS) return false;

  const expectedHash = await sha256Hex(`${ADMIN_PASSWORD}:${timestamp}:${SESSION_SECRET}`);
  // Constant-time-ish compare: length check then char-by-char (hashes are fixed length).
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/admin/login` and the login API must stay public so a real admin can sign in.
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');
  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authed = await verifySessionToken(token);
  if (authed) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'cache-control': 'no-store' } }
    );
  }

  // Admin UI page — redirect to login, preserving where they were headed.
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Match admin pages and admin APIs. Excludes Next internals/static assets.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
