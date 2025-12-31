import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashPassword(password: string): string {
  return createHash('sha256').update(password + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
}

// POST - Login with email and password
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, password_hash, email_verified, name')
      .eq('email', normalizedEmail)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please verify your email first. Check your inbox.',
        needsVerification: true 
      }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please set your password first. Check your email for the verification link.',
        needsPassword: true 
      }, { status: 401 });
    }

    // Check password
    const passwordHash = hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = createHash('sha256').update(user.id + Date.now().toString() + Math.random()).digest('hex');
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session - FIXED: using user_sessions table
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: sessionExpires.toISOString(),
      });

    if (sessionError) {
      console.error('Session creation failed:', sessionError);
      return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
