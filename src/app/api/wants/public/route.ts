import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// GET - List public wants with vote counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'voting';
  const limit = parseInt(searchParams.get('limit') || '50');
  const sortBy = searchParams.get('sort') || 'votes';

  let query = supabase
    .from('wants')
    .select('id, product_name, description, category, vote_count, verified_count, popularity_clicks, status, creator_referral_code, created_at, first_requester_rewarded')
    .eq('is_public', true);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (sortBy === 'votes') {
    query = query.order('vote_count', { ascending: false });
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: true });
  }

  query = query.limit(limit);

  const { data: wants, error } = await query;

  if (error) {
    console.error('Wants fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wants' }, { status: 500 });
  }

  const { count: totalVoting } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'voting')
    .eq('is_public', true);

  const { count: totalSourcing } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sourcing')
    .eq('is_public', true);

  const { count: totalAvailable } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')
    .eq('is_public', true);

  return NextResponse.json({
    success: true,
    wants: wants || [],
    stats: {
      voting: totalVoting || 0,
      sourcing: totalSourcing || 0,
      available: totalAvailable || 0
    }
  });
}

// POST - Submit a new want
export async function POST(request: NextRequest) {
  try {
    const { product_name, description, category, user_email, user_name, image_url,
            price_willing_cents, buy_frequency, suburb, latitude, longitude } = await request.json();

    console.log('Creating want:', { product_name, user_email, image_url: !!image_url });

    if (!product_name || !user_email) {
      return NextResponse.json({ error: 'Product name and email required' }, { status: 400 });
    }

    const normalizedEmail = user_email.toLowerCase().trim();

    // Check if user already has a want (one per person, ever)
    const { data: existingWant } = await supabase
      .from('wants')
      .select('id, product_name')
      .eq('creator_email', normalizedEmail)
      .limit(1)
      .single();

    if (existingWant) {
      return NextResponse.json({
        success: false,
        error: `You've already created a want: "${existingWant.product_name}". One free product per person!`,
        existingWant
      }, { status: 400 });
    }

    // Check for duplicates
    const { data: existing } = await supabase
      .from('wants')
      .select('id, product_name, vote_count, verified_count, creator_referral_code')
      .ilike('product_name', `%${product_name}%`)
      .eq('is_public', true)
      .limit(5);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        similar: existing,
        message: 'Similar products already requested. Vote for them instead!'
      });
    }

    // Check if user exists and is verified
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email_verified, password_hash')
      .eq('email', normalizedEmail)
      .single();

    const isNewUser = !existingUser;
    const needsVerification = !existingUser?.email_verified || !existingUser?.password_hash;

    console.log('User status:', { isNewUser, needsVerification, existingUserId: existingUser?.id });

    // Generate verification token for new/unverified users
    const verificationToken = needsVerification ? generateToken() : null;
    const verificationExpires = needsVerification ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    // Create or update user
    let userId = existingUser?.id;
    if (isNewUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ 
          email: normalizedEmail, 
          name: user_name || null,
          verification_token: verificationToken,
          verification_expires: verificationExpires?.toISOString(),
          email_verified: false,
        })
        .select('id')
        .single();
      
      if (userError) {
        console.error('User insert error:', userError);
      }
      userId = newUser?.id;
    } else if (needsVerification) {
      // Update existing user with new token
      await supabase
        .from('users')
        .update({
          verification_token: verificationToken,
          verification_expires: verificationExpires?.toISOString(),
        })
        .eq('id', existingUser.id);
    }

    // Create want
    const { data: want, error } = await supabase
      .from('wants')
      .insert({
        product_name,
        description: description || null,
        category: category || 'General',
        user_id: userId,
        vote_count: 1,
        verified_count: 0,
        popularity_clicks: 0,
        status: 'voting',
        is_public: true,
        first_requester_rewarded: false,
        creator_email: normalizedEmail,
        image_url: image_url || null,
      })
      .select('*, creator_referral_code')
      .single();

    if (error) {
      console.error('Want insert error:', error);
      return NextResponse.json({ error: 'Failed to create want' }, { status: 500 });
    }

    console.log('Want created:', want.id);

    // Add creator's vote (ignore errors if table doesn't exist)
    try {
      await supabase.from('want_votes').insert({
        want_id: want.id,
        voter_email: normalizedEmail
      });
    } catch (e) {
      // Ignore
    }

    // Structured Wish List capture (price/frequency/location).
    // Defensive: runs only if migration 003 columns exist; never breaks want creation.
    if (price_willing_cents != null || buy_frequency || suburb || latitude != null) {
      try {
        await supabase
          .from('wants')
          .update({
            price_willing_cents: price_willing_cents ?? null,
            buy_frequency: buy_frequency ?? null,
            suburb: suburb ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
          })
          .eq('id', want.id);
      } catch (e) {
        // Columns not migrated yet — ignore, core want still created.
      }
    }

    // ALWAYS send email - different content based on user status
    const verifyUrl = verificationToken ? `${SITE_URL}/auth/verify?token=${verificationToken}` : null;
    const dashboardUrl = `${SITE_URL}/my-wants`;

    try {
      console.log('Sending email to:', normalizedEmail);
      
      const emailResult = await getResend().emails.send({
        from: 'Jeffy <hello@jeffy.co.za>',
        to: normalizedEmail,
        subject: `Your wish "${product_name}" is live! 🎉`,
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
        Your Wish is Live! 🎉
      </h2>

      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
        You wished for:
      </p>
      <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
        "${product_name}"
      </p>

      <div style="background: rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid rgba(34, 197, 94, 0.3);">
        <p style="color: #4ade80; font-size: 16px; font-weight: 600; margin: 0; text-align: center;">
          🎁 You're in this week's draw! Every week we draw winners at random and grant their wish free.
        </p>
      </div>

      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        No purchase, no catch — nothing to share. If your wish is drawn, we'll call you, source it, and deliver it free — and celebrate you on the radio, in the paper, and across social media.
      </p>

      <div style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 24px;">
        ${needsVerification ? `
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          Set up your account to keep track of your wishes:
        </p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #000000; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
            Set Up My Account →
          </a>
        </div>
        ` : `
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          See all your wishes in your dashboard:
        </p>
        <div style="text-align: center;">
          <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #000000; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
            View My Wishes →
          </a>
        </div>
        `}
      </div>

    </div>

    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        You're receiving this because you added a wish on Jeffy.
      </p>
    </div>

  </div>
</body>
</html>
        `,
      });
      
      console.log('Email sent:', emailResult);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      want,
      message: needsVerification
        ? "You're in this week's draw! Check your email to set up your account."
        : "You're in this week's draw! Check your email for confirmation.",
      emailSent: true
    });

  } catch (error) {
    console.error('Want creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
