import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashPassword(password: string): string {
  return createHash('sha256').update(password + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
}

// POST - Login with email and password
export async function POST(request: NextRequest) {
  console.log('[LOGIN] Request received');
  
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return createResponse({ success: false, error: 'Email and password required' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[LOGIN] Attempting login for:', normalizedEmail);

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, password_hash, email_verified, name')
      .eq('email', normalizedEmail)
      .single();

    console.log('[LOGIN] User lookup:', { 
      found: !!user, 
      verified: user?.email_verified,
      hasPassword: !!user?.password_hash,
      error: findError?.message 
    });

    if (findError || !user) {
      return createResponse({ success: false, error: 'Invalid email or password' }, 401);
    }

    if (!user.email_verified) {
      return createResponse({ 
        success: false, 
        error: 'Please verify your email first. Check your inbox.',
        needsVerification: true 
      }, 401);
    }

    if (!user.password_hash) {
      return createResponse({ 
        success: false, 
        error: 'Please set your password first. Check your email for the verification link.',
        needsPassword: true 
      }, 401);
    }

    // Check password
    const passwordHash = hashPassword(password);
    if (passwordHash !== user.password_hash) {
      console.log('[LOGIN] Password mismatch');
      return createResponse({ success: false, error: 'Invalid email or password' }, 401);
    }

    console.log('[LOGIN] Password correct, creating session...');

    // Generate session token
    const sessionToken = createHash('sha256').update(user.id + Date.now().toString() + Math.random()).digest('hex');
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session
    const { data: insertedSession, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: sessionExpires.toISOString(),
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('[LOGIN] Session creation failed:', sessionError);
      return createResponse({ success: false, error: 'Failed to create session' }, 500);
    }

    console.log('[LOGIN] Session created:', insertedSession?.id);

    return createResponse({ 
      success: true, 
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, 200);

  } catch (error: any) {
    console.error('[LOGIN] Fatal error:', error);
    return createResponse({ success: false, error: 'Server error' }, 500);
  }
}

// Helper to create response with no-cache headers
function createResponse(data: any, status: number) {
  const response = NextResponse.json(data, { status });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
