import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { randomBytes } from 'crypto';

// Reseller dashboard login: emails a one-tap magic link.
// Reuses the existing `magic_links` table and the sendEmail helper
// (which logs to console in dev when RESEND_API_KEY is not set).
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const addr = String(email).toLowerCase().trim();

    const supabase = await createAdminClient();
    const { data: dist } = await supabase
      .from('distributors')
      .select('id, owner_name, status')
      .eq('email', addr)
      .maybeSingle();

    // Only send if a reseller exists, but always return the same message
    // so the endpoint can't be used to discover which emails are registered.
    if (dist) {
      const token = randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('magic_links').insert({ email: addr, token, expires_at: expiresAt });

      const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';
      const url = `${base}/distributors/dashboard?token=${token}`;
      await sendEmail({
        to: addr,
        subject: 'Your Jeffy reseller dashboard link',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2933;">
            <h2 style="color:#0E2A47;margin:0 0 8px;">Jeffy — Reseller Dashboard</h2>
            <p>Hi ${dist.owner_name || 'there'}, tap the button to open your dashboard. The link expires in 24 hours.</p>
            <p style="text-align:center;margin:28px 0;">
              <a href="${url}" style="background:#1F6FB2;color:#fff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:8px;display:inline-block;">Open my dashboard</a>
            </p>
            <p style="font-size:12px;color:#6b7480;">If you didn't request this, you can ignore this email.</p>
          </div>`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If that email is registered, a login link is on its way.',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
