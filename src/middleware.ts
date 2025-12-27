import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'jeffy_admin_session';

// Simple token validation without crypto (Edge-compatible)
// Just checks token format and expiry - full verification happens in API routes
function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  const parts = token.split(':');
  if (parts.length < 2) return false;
  
  const timestamp = parseInt(parts[parts.length - 1]);
  if (isNaN(timestamp)) return false;
  
  // Check if token is expired (24 hours)
  return Date.now() - timestamp < 24 * 60 * 60 * 1000;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    
    if (!session || !isTokenValid(session.value)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect agent routes with API key
  if (pathname.startsWith('/api/agent') && !pathname.includes('/tracking')) {
    const apiKey = request.headers.get('x-api-key');
    const agentApiKey = process.env.AGENT_API_KEY || '';
    
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    const hasAdminSession = session && isTokenValid(session.value);
    
    if (!hasAdminSession && apiKey !== agentApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/agent/:path*',
  ],
};
