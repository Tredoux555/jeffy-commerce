import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get current user from session token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }

    // Find session - FIXED: using user_sessions table
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from('user_sessions').delete().eq('token', token);
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get user's wants
    const { data: wants } = await supabase
      .from('wants')
      .select('*')
      .eq('creator_email', user.email)
      .order('created_at', { ascending: false });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      wants: wants || []
    });

  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Logout (delete session)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await supabase.from('user_sessions').delete().eq('token', token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
