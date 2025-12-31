import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email/verification';
import { sendSMS, normalizePhoneNumber, SMSTemplates } from '@/lib/sms/service';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { want_id, ref_code, method, contact } = await request.json();

    // Validate inputs
    if (!want_id || !method || !contact) {
      return NextResponse.json({ 
        error: 'Missing required fields: want_id, method, contact' 
      }, { status: 400 });
    }

    if (!['email', 'sms'].includes(method)) {
      return NextResponse.json({ 
        error: 'Method must be "email" or "sms"' 
      }, { status: 400 });
    }

    // Get the want details
    const { data: want, error: wantError } = await supabase
      .from('wants')
      .select('id, product_name, description, creator_referral_code, creator_email, status, verified_count')
      .eq('id', want_id)
      .single();

    if (wantError || !want) {
      return NextResponse.json({ error: 'Product request not found' }, { status: 404 });
    }

    if (want.status !== 'voting') {
      return NextResponse.json({ 
        error: 'This product is no longer accepting verifications',
        status: want.status 
      }, { status: 400 });
    }

    // Validate ref_code matches (optional - for tracking)
    const referralCode = ref_code || want.creator_referral_code;

    // Normalize contact
    const normalizedContact = method === 'email' 
      ? contact.toLowerCase().trim()
      : normalizePhoneNumber(contact);

    // Check if this contact already verified this want
    const existingQuery = method === 'email'
      ? supabase.from('want_verifications').select('id, verified_at').eq('want_id', want_id).eq('email', normalizedContact)
      : supabase.from('want_verifications').select('id, verified_at').eq('want_id', want_id).eq('phone', normalizedContact);

    const { data: existing } = await existingQuery.single();

    if (existing?.verified_at) {
      return NextResponse.json({ 
        error: 'You have already verified this product request!',
        alreadyVerified: true 
      }, { status: 400 });
    }

    // Check if creator is trying to verify their own want
    if (method === 'email' && normalizedContact === want.creator_email?.toLowerCase()) {
      return NextResponse.json({ 
        error: 'You cannot verify your own product request' 
      }, { status: 400 });
    }

    // Generate verification token/OTP
    const verificationToken = method === 'email' ? generateToken() : null;
    const otpCode = method === 'sms' ? generateOTP() : null;
    const expiresAt = new Date(Date.now() + (method === 'email' ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000)); // 24h for email, 10min for SMS

    // Get IP and user agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Upsert verification record
    const verificationData = {
      want_id,
      [method === 'email' ? 'email' : 'phone']: normalizedContact,
      verification_type: method,
      verification_token: verificationToken,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
      referred_by_code: referralCode,
      ip_address: ip,
      user_agent: userAgent,
      verified_at: null, // Reset if resending
    };

    if (existing) {
      // Update existing unverified record
      const { error: updateError } = await supabase
        .from('want_verifications')
        .update({
          verification_token: verificationToken,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update verification error:', updateError);
        return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 });
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('want_verifications')
        .insert(verificationData);

      if (insertError) {
        console.error('Insert verification error:', insertError);
        // Check for unique constraint violation
        if (insertError.code === '23505') {
          return NextResponse.json({ error: 'Verification already pending' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 });
      }
    }

    // Send verification
    if (method === 'email') {
      // Get creator name
      const { data: creator } = await supabase
        .from('users')
        .select('name, email')
        .eq('email', want.creator_email)
        .single();

      const result = await sendVerificationEmail({
        to: normalizedContact,
        creatorName: creator?.name || 'Someone',
        productName: want.product_name,
        productDescription: want.description || undefined,
        verificationToken: verificationToken!,
        wantId: want_id,
      });

      if (!result.success) {
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Verification email sent! Check your inbox.',
        method: 'email',
      });

    } else {
      // SMS verification
      const result = await sendSMS({
        to: normalizedContact,
        message: SMSTemplates.otpCode(otpCode!),
      });

      if (!result.success) {
        return NextResponse.json({ 
          error: result.error || 'Failed to send SMS',
          fallbackToEmail: true 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent! Check your phone.',
        method: 'sms',
        // Don't return the OTP obviously
      });
    }

  } catch (error) {
    console.error('Request verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
