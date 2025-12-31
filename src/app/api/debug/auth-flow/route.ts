import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DEBUG ENDPOINT - Tests the complete auth flow
// DELETE THIS AFTER DEBUGGING
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  };

  try {
    // 1. Check if we can connect to Supabase
    results.checks.supabase_connection = 'testing...';
    const { data: pingData, error: pingError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (pingError) {
      results.checks.supabase_connection = 'FAILED';
      results.errors.push(`Supabase connection: ${pingError.message}`);
    } else {
      results.checks.supabase_connection = 'OK';
    }

    // 2. Check user_sessions table exists and is accessible
    results.checks.user_sessions_table = 'testing...';
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('count')
      .limit(1);
    
    if (sessionsError) {
      results.checks.user_sessions_table = 'FAILED';
      results.errors.push(`user_sessions table: ${sessionsError.message}`);
    } else {
      results.checks.user_sessions_table = 'OK';
    }

    // 3. Try to insert a test user
    const testEmail = `debug-test-${Date.now()}@test.jeffy.co.za`;
    results.checks.user_insert = 'testing...';
    
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        email_verified: false,
        verification_token: randomBytes(32).toString('hex'),
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id, email')
      .single();
    
    if (userError) {
      results.checks.user_insert = 'FAILED';
      results.errors.push(`User insert: ${userError.message}`);
    } else {
      results.checks.user_insert = 'OK';
      results.testUser = testUser;

      // 4. Try to insert a session for this user
      results.checks.session_insert = 'testing...';
      const testToken = createHash('sha256').update(testUser.id + Date.now().toString()).digest('hex');
      
      const { data: testSession, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: testUser.id,
          token: testToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id, user_id, token')
        .single();
      
      if (sessionError) {
        results.checks.session_insert = 'FAILED';
        results.errors.push(`Session insert: ${sessionError.message}`);
      } else {
        results.checks.session_insert = 'OK';
        results.testSession = { id: testSession.id, tokenPreview: testToken.substring(0, 10) + '...' };

        // 5. Try to read the session back
        results.checks.session_read = 'testing...';
        const { data: readSession, error: readError } = await supabase
          .from('user_sessions')
          .select('user_id, expires_at')
          .eq('token', testToken)
          .single();
        
        if (readError) {
          results.checks.session_read = 'FAILED';
          results.errors.push(`Session read: ${readError.message}`);
        } else {
          results.checks.session_read = 'OK';
          results.readBack = readSession;
        }

        // 6. Clean up test session
        await supabase.from('user_sessions').delete().eq('token', testToken);
      }

      // 7. Clean up test user
      await supabase.from('users').delete().eq('id', testUser.id);
    }

    // 8. List all current sessions (for debugging)
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('user_sessions')
      .select('id, user_id, created_at, expires_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    results.recent_sessions = allSessions || [];
    if (allSessionsError) {
      results.errors.push(`List sessions: ${allSessionsError.message}`);
    }

    // 9. List all current users (for debugging)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, email_verified, password_hash, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    results.recent_users = allUsers?.map(u => ({
      id: u.id,
      email: u.email,
      email_verified: u.email_verified,
      has_password: !!u.password_hash,
      created_at: u.created_at,
    })) || [];
    if (allUsersError) {
      results.errors.push(`List users: ${allUsersError.message}`);
    }

    // Summary
    results.summary = {
      total_checks: Object.keys(results.checks).length,
      failed: results.errors.length,
      status: results.errors.length === 0 ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED',
    };

  } catch (error: any) {
    results.fatal_error = error.message;
  }

  return NextResponse.json(results, { status: results.errors?.length > 0 ? 500 : 200 });
}
