import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'jeffy_admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

// Simple hash verification (same logic as in auth/index.ts)
function verifySessionToken(token: string): boolean {
  if (!token) return false;
  
  const [hash, timestamp] = token.split(':');
  if (!hash || !timestamp) return false;
  
  // Check if token is expired (24 hours)
  const tokenTime = parseInt(timestamp);
  if (Date.now() - tokenTime > 24 * 60 * 60 * 1000) return false;
  
  // Verify hash using crypto
  const crypto = require('crypto');
  const data = `${ADMIN_PASSWORD}:${timestamp}:${SESSION_SECRET}`;
  const expectedHash = crypto.createHash('sha256').update(data).digest('hex');
  
  return hash === expectedHash;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    
    if (!session || !verifySessionToken(session.value)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect agent routes with API key (for API calls)
  if (pathname.startsWith('/api/agent') && !pathname.includes('/tracking')) {
    const apiKey = request.headers.get('x-api-key');
    const agentApiKey = process.env.AGENT_API_KEY || 'change-this-api-key';
    
    // Allow if admin session exists OR valid API key
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    const hasAdminSession = session && verifySessionToken(session.value);
    
    if (!hasAdminSession && apiKey !== agentApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    
    if (!session || !verifySessionToken(session.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/agent/:path*',
  ],
};
