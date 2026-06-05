import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a simple fingerprint from request headers
function generateFingerprint(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a hash of IP + user agent for fingerprinting
  const data = `${ip}|${userAgent}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { want_id, ref_code } = body;
    
    if (!want_id) {
      return NextResponse.json({ error: 'Missing want_id' }, { status: 400 });
    }

    // Generate fingerprint for this visitor
    const fingerprint = generateFingerprint(request);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    console.log('Quick verify:', { want_id, fingerprint: fingerprint.substring(0, 8) + '...', ip });

    // Get the want details
    const { data: want, error: wantError } = await supabase
      .from('wants')
      .select('id, product_name, verified_count, status, creator_referral_code')
      .eq('id', want_id)
      .single();

    if (wantError || !want) {
      return NextResponse.json({ error: 'Want not found' }, { status: 404 });
    }

    // Check if this fingerprint already verified this want
    const { data: existing } = await supabase
      .from('want_verifications')
      .select('id')
      .eq('want_id', want_id)
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (existing) {
      // Already verified - return current count
      return NextResponse.json({ 
        success: false,
        alreadyVerified: true,
        verified_count: want.verified_count,
        message: 'You already helped with this want!'
      });
    }

    // Record the verification
    const { error: insertError } = await supabase
      .from('want_verifications')
      .insert({
        want_id,
        fingerprint,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
        referred_by_code: ref_code || want.creator_referral_code,
        verification_type: 'quick',
        verified_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      // If unique constraint, they already verified
      if (insertError.code === '23505') {
        return NextResponse.json({ 
          success: false,
          alreadyVerified: true,
          verified_count: want.verified_count,
        });
      }
      return NextResponse.json({ error: 'Failed to record verification' }, { status: 500 });
    }

    // Increment the verified count
    const newCount = want.verified_count + 1;
    const thresholdReached = newCount >= 10;

    const { error: updateError } = await supabase
      .from('wants')
      .update({ 
        verified_count: newCount,
        status: thresholdReached ? 'sourcing' : want.status,
      })
      .eq('id', want_id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      verified_count: newCount,
      remaining: Math.max(0, 10 - newCount),
      thresholdReached,
      message: "You're in this week's draw! Winners are drawn at random every week and get their wish free."
    });

  } catch (error) {
    console.error('Quick verify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}