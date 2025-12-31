import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { randomBytes, createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// POST - Send verification email to new user
export async function POST(request: NextRequest) {
  try {
    const { email, wantId, wantName } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists and is verified
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email_verified, password_hash')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser?.email_verified && existingUser?.password_hash) {
      // User already has account - they can just login
      return NextResponse.json({ 
        success: true, 
        alreadyRegistered: true,
        message: 'You already have an account. Login to see your wants.' 
      });
    }

    // Generate verification token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Upsert user with verification token
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        email: normalizedEmail,
        verification_token: token,
        verification_expires: expiresAt.toISOString(),
        email_verified: false,
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('User upsert error:', upsertError);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    // Send verification email
    const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;

    const { error: emailError } = await resend.emails.send({
      from: 'Jeffy <hello@jeffy.co.za>',
      to: normalizedEmail,
      subject: wantName ? `Verify your email to track "${wantName}"` : 'Verify your Jeffy account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #f97316; font-size: 36px; font-weight: 900; margin: 0;">Jeffy</h1>
    </div>

    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; padding: 32px; border: 1px solid #334155;">
      
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">
        ${wantName ? `Your Want is Created! 🎉` : 'Verify Your Email'}
      </h2>

      ${wantName ? `
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
        You requested:
      </p>
      <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
        "${wantName}"
      </p>
      ` : ''}

      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        Click below to verify your email and set up your password. Then you can track your verifications and get your free product!
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #000000; font-size: 18px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px;">
          Verify & Set Password →
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
        This link expires in 24 hours.
      </p>

    </div>

    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        You're receiving this because you created a Want on Jeffy.
      </p>
    </div>

  </div>
</body>
</html>
      `,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Check your email to verify and set your password!' 
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
