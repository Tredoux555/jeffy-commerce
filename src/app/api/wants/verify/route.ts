import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationConfirmation } from '@/lib/email/verification';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Verify via token (email) or OTP (SMS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, want_id, phone, otp } = body;

    // Email verification (via token)
    if (token) {
      return verifyByToken(token);
    }

    // SMS verification (via OTP)
    if (want_id && phone && otp) {
      return verifyByOTP(want_id, phone, otp);
    }

    return NextResponse.json({ 
      error: 'Provide either token (email) or want_id+phone+otp (SMS)' 
    }, { status: 400 });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function verifyByToken(token: string) {
  // Find the verification record
  const { data: verification, error } = await supabase
    .from('want_verifications')
    .select(`
      id,
      want_id,
      email,
      expires_at,
      verified_at,
      wants (
        id,
        product_name,
        verified_count,
        status
      )
    `)
    .eq('verification_token', token)
    .single();

  if (error || !verification) {
    return NextResponse.json({ 
      error: 'Invalid or expired verification link',
      invalid: true 
    }, { status: 400 });
  }

  // Check if already verified
  if (verification.verified_at) {
    const want = verification.wants as any;
    return NextResponse.json({
      success: true,
      alreadyVerified: true,
      message: 'You have already verified this product request!',
      verified_count: want?.verified_count || 0,
      remaining: Math.max(0, 10 - (want?.verified_count || 0)),
      product_name: want?.product_name,
    });
  }

  // Check if expired
  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.json({ 
      error: 'This verification link has expired. Please request a new one.',
      expired: true 
    }, { status: 400 });
  }

  // Mark as verified
  const { error: updateError } = await supabase
    .from('want_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', verification.id);

  if (updateError) {
    console.error('Update verification error:', updateError);
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
  }

  // Get updated want data (trigger should have updated verified_count)
  const { data: updatedWant } = await supabase
    .from('wants')
    .select('verified_count, status, product_name')
    .eq('id', verification.want_id)
    .single();

  const verifiedCount = updatedWant?.verified_count || 1;
  const remaining = Math.max(0, 10 - verifiedCount);

  // Send confirmation email
  if (verification.email) {
    await sendVerificationConfirmation({
      to: verification.email,
      productName: updatedWant?.product_name || 'Product',
      verifiedCount,
      remaining,
    });
  }

  return NextResponse.json({
    success: true,
    message: remaining > 0 
      ? `Verified! ${remaining} more people needed.`
      : '🎉 Threshold reached! This product is being sourced!',
    verified_count: verifiedCount,
    remaining,
    product_name: updatedWant?.product_name,
    status: updatedWant?.status,
    thresholdReached: remaining === 0,
  });
}

async function verifyByOTP(wantId: string, phone: string, otp: string) {
  // Normalize phone
  let normalizedPhone = phone.replace(/[\s-]/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = '+27' + normalizedPhone.substring(1);
  else if (normalizedPhone.startsWith('27')) normalizedPhone = '+' + normalizedPhone;
  else if (!normalizedPhone.startsWith('+')) normalizedPhone = '+27' + normalizedPhone;

  // Find the verification record
  const { data: verification, error } = await supabase
    .from('want_verifications')
    .select(`
      id,
      want_id,
      phone,
      otp_code,
      expires_at,
      verified_at,
      wants (
        id,
        product_name,
        verified_count,
        status
      )
    `)
    .eq('want_id', wantId)
    .eq('phone', normalizedPhone)
    .single();

  if (error || !verification) {
    return NextResponse.json({ 
      error: 'No verification found for this phone number',
      notFound: true 
    }, { status: 400 });
  }

  // Check if already verified
  if (verification.verified_at) {
    const want = verification.wants as any;
    return NextResponse.json({
      success: true,
      alreadyVerified: true,
      message: 'You have already verified this product request!',
      verified_count: want?.verified_count || 0,
      remaining: Math.max(0, 10 - (want?.verified_count || 0)),
    });
  }

  // Check if expired
  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.json({ 
      error: 'This code has expired. Please request a new one.',
      expired: true 
    }, { status: 400 });
  }

  // Check OTP
  if (verification.otp_code !== otp) {
    return NextResponse.json({ 
      error: 'Invalid code. Please check and try again.',
      invalidOtp: true 
    }, { status: 400 });
  }

  // Mark as verified
  const { error: updateError } = await supabase
    .from('want_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', verification.id);

  if (updateError) {
    console.error('Update verification error:', updateError);
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
  }

  // Get updated want data
  const { data: updatedWant } = await supabase
    .from('wants')
    .select('verified_count, status, product_name')
    .eq('id', wantId)
    .single();

  const verifiedCount = updatedWant?.verified_count || 1;
  const remaining = Math.max(0, 10 - verifiedCount);

  return NextResponse.json({
    success: true,
    message: remaining > 0 
      ? `Verified! ${remaining} more people needed.`
      : '🎉 Threshold reached! This product is being sourced!',
    verified_count: verifiedCount,
    remaining,
    product_name: updatedWant?.product_name,
    status: updatedWant?.status,
    thresholdReached: remaining === 0,
  });
}

// GET - Check verification status by token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const { data: verification, error } = await supabase
    .from('want_verifications')
    .select(`
      id,
      verified_at,
      expires_at,
      wants (
        id,
        product_name,
        description,
        verified_count,
        status
      )
    `)
    .eq('verification_token', token)
    .single();

  if (error || !verification) {
    return NextResponse.json({ 
      error: 'Invalid verification link',
      invalid: true 
    }, { status: 404 });
  }

  const want = verification.wants as any;

  return NextResponse.json({
    success: true,
    verified: !!verification.verified_at,
    expired: new Date(verification.expires_at) < new Date(),
    want: {
      id: want?.id,
      product_name: want?.product_name,
      description: want?.description,
      verified_count: want?.verified_count,
      status: want?.status,
      remaining: Math.max(0, 10 - (want?.verified_count || 0)),
    },
  });
}
