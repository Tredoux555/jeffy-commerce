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

// GET - Validate token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('[VERIFY GET] Token received:', token?.substring(0, 10) + '...');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, email_verified, verification_expires')
      .eq('verification_token', token)
      .single();

    console.log('[VERIFY GET] User lookup result:', { found: !!user, error: error?.message });

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    // Check expiration
    if (new Date(user.verification_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired. Please request a new one.' }, { status: 410 });
    }

    const response = NextResponse.json({ 
      success: true, 
      email: user.email,
      alreadyVerified: user.email_verified 
    });
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error) {
    console.error('[VERIFY GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST - Set password and complete verification
export async function POST(request: NextRequest) {
  console.log('[VERIFY POST] Starting verification...');
  
  try {
    const body = await request.json();
    const { token, password } = body;

    console.log('[VERIFY POST] Received token:', token?.substring(0, 10) + '...');

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find user by token
    console.log('[VERIFY POST] Looking up user by verification token...');
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, verification_expires')
      .eq('verification_token', token)
      .single();

    console.log('[VERIFY POST] User lookup:', { found: !!user, userId: user?.id, error: findError?.message });

    if (findError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    // Check expiration
    if (new Date(user.verification_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired' }, { status: 410 });
    }

    // Hash password and update user
    const passwordHash = hashPassword(password);
    console.log('[VERIFY POST] Updating user with password hash...');

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        email_verified: true,
        verification_token: null,
        verification_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[VERIFY POST] Update user error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to set password' }, { status: 500 });
    }

    console.log('[VERIFY POST] User updated successfully');

    // Generate session token
    const sessionToken = createHash('sha256').update(user.id + Date.now().toString() + Math.random()).digest('hex');
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    console.log('[VERIFY POST] Generated session token:', sessionToken.substring(0, 10) + '...');
    console.log('[VERIFY POST] Inserting session into user_sessions...');

    // Store session
    const { data: insertedSession, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: sessionExpires.toISOString(),
      })
      .select('id, user_id, token')
      .single();

    if (sessionError) {
      console.error('[VERIFY POST] Session creation failed:', sessionError);
      return NextResponse.json({ success: false, error: 'Failed to create session: ' + sessionError.message }, { status: 500 });
    }

    console.log('[VERIFY POST] Session created successfully:', { 
      sessionId: insertedSession?.id, 
      tokenMatch: insertedSession?.token === sessionToken 
    });

    // Verify the session was actually created by reading it back
    const { data: verifySession, error: verifyError } = await supabase
      .from('user_sessions')
      .select('id, user_id')
      .eq('token', sessionToken)
      .single();

    console.log('[VERIFY POST] Session verification:', { 
      found: !!verifySession, 
      error: verifyError?.message 
    });

    const response = NextResponse.json({ 
      success: true, 
      message: 'Account verified! You can now login.',
      sessionToken,
      email: user.email,
      debug: {
        sessionCreated: !!insertedSession,
        sessionVerified: !!verifySession,
        tokenLength: sessionToken.length,
      }
    });
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('[VERIFY POST] Fatal error:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
