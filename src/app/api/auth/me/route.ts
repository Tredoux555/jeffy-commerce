import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get current user from session token
export async function GET(request: NextRequest) {
  console.log('[AUTH/ME] Request received');
  
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('[AUTH/ME] Token:', token ? token.substring(0, 10) + '...' : 'MISSING');

    if (!token) {
      return createResponse({ success: false, error: 'No session' }, 401);
    }

    // Find session
    console.log('[AUTH/ME] Looking up session in user_sessions...');
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    console.log('[AUTH/ME] Session lookup:', { 
      found: !!session, 
      userId: session?.user_id,
      error: sessionError?.message,
      errorCode: sessionError?.code
    });

    if (sessionError || !session) {
      // Log more details about the error
      console.log('[AUTH/ME] Session not found. Token length:', token.length);
      
      // Try to see if ANY sessions exist
      const { count } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true });
      console.log('[AUTH/ME] Total sessions in table:', count);
      
      return createResponse({ success: false, error: 'Invalid session' }, 401);
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      console.log('[AUTH/ME] Session expired');
      await supabase.from('user_sessions').delete().eq('token', token);
      return createResponse({ success: false, error: 'Session expired' }, 401);
    }

    // Get user
    console.log('[AUTH/ME] Looking up user:', session.user_id);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', session.user_id)
      .single();

    console.log('[AUTH/ME] User lookup:', { found: !!user, error: userError?.message });

    if (userError || !user) {
      return createResponse({ success: false, error: 'User not found' }, 404);
    }

    // Get user's wants
    const { data: wants } = await supabase
      .from('wants')
      .select('*')
      .eq('creator_email', user.email)
      .order('created_at', { ascending: false });

    console.log('[AUTH/ME] Success! User:', user.email, 'Wants:', wants?.length || 0);

    return createResponse({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      wants: wants || []
    }, 200);

  } catch (error: any) {
    console.error('[AUTH/ME] Fatal error:', error);
    return createResponse({ success: false, error: 'Server error' }, 500);
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

    return createResponse({ success: true }, 200);
  } catch (error) {
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
