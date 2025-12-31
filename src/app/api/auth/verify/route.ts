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

// GET - Validate token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, email_verified, verification_expires')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    // Check expiration
    if (new Date(user.verification_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired. Please request a new one.' }, { status: 410 });
    }

    return NextResponse.json({ 
      success: true, 
      email: user.email,
      alreadyVerified: user.email_verified 
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST - Set password and complete verification
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find user by token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, verification_expires')
      .eq('verification_token', token)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    // Check expiration
    if (new Date(user.verification_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired' }, { status: 410 });
    }

    // Hash password and update user
    const passwordHash = hashPassword(password);

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
      console.error('Update user error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to set password' }, { status: 500 });
    }

    // Generate session token
    const sessionToken = createHash('sha256').update(user.id + Date.now().toString() + Math.random()).digest('hex');
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session
    await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: sessionExpires.toISOString(),
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Account verified! You can now login.',
      sessionToken,
      email: user.email
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
