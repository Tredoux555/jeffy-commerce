import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getResend = () => new Resend(process.env.RESEND_API_KEY);

// Generate a magic link token
function generateMagicToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// POST - Request magic link (send email)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const resend = getResend();
  
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    // Check if user has any wants
    const { data: wants, error: wantsError } = await supabase
      .from('wants')
      .select('id, product_name')
      .eq('creator_email', email.toLowerCase());

    if (wantsError) {
      console.error('Error checking wants:', wantsError);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    if (!wants || wants.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No wants found for this email. Create a want first!' 
      }, { status: 404 });
    }

    // Generate magic token
    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store magic token
    const { error: insertError } = await supabase
      .from('magic_links')
      .insert({
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing magic link:', insertError);
      return NextResponse.json({ success: false, error: 'Could not create magic link' }, { status: 500 });
    }

    // Send email with magic link
    const magicUrl = `https://jeffy.co.za/my-wants?token=${token}`;

    await resend.emails.send({
      from: 'Jeffy <hello@jeffy.co.za>',
      to: email,
      subject: 'Your Jeffy Dashboard Link 🎁',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #f97316; font-size: 36px; font-weight: 900; margin: 0;">Jeffy</h1>
            </div>

            <!-- Main Card -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; padding: 32px; border: 1px solid #334155;">
              
              <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">
                Your Dashboard Awaits 🚀
              </h2>

              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Click below to see your wants and track your verification progress.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${magicUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #000000; font-size: 18px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px;">
                  Open My Dashboard →
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
                This link expires in 24 hours.
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                You're receiving this because you requested access to your Jeffy dashboard.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent! Check your email.' 
    });

  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// GET - Verify magic link token
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    // Find and validate token
    const { data: magicLink, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !magicLink) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    // Check expiration
    if (new Date(magicLink.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired' }, { status: 410 });
    }

    // Get user's wants with verification counts
    const { data: wants, error: wantsError } = await supabase
      .from('wants')
      .select('*')
      .eq('creator_email', magicLink.email)
      .order('created_at', { ascending: false });

    if (wantsError) {
      console.error('Error fetching wants:', wantsError);
      return NextResponse.json({ success: false, error: 'Could not fetch wants' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      email: magicLink.email,
      wants: wants || []
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
