import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWaitlistWelcome } from '@/lib/email/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get waitlist stats or individual position
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  // Get total count
  const { count: totalCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  // If checking specific user
  if (email || code) {
    const query = supabase.from('waitlist').select('*');
    if (email) query.eq('email', email.toLowerCase());
    if (code) query.eq('referral_code', code);
    
    const { data: user } = await query.single();
    
    if (user) {
      // Calculate effective position (higher referrals = better position)
      const { count: aheadCount } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .or(`referral_count.gt.${user.referral_count},and(referral_count.eq.${user.referral_count},position.lt.${user.position})`);

      return NextResponse.json({
        success: true,
        user: {
          email: user.email,
          name: user.name,
          position: (aheadCount || 0) + 1,
          originalPosition: user.position,
          referralCode: user.referral_code,
          referralCount: user.referral_count,
          rewardTier: getRewardTier(user.referral_count),
          type: user.type
        },
        totalWaitlist: totalCount || 0
      });
    }
  }

  // Just return stats
  return NextResponse.json({
    success: true,
    totalWaitlist: totalCount || 0
  });
}

// POST - Join waitlist
export async function POST(request: NextRequest) {
  try {
    const { email, name, type = 'customer', zone_id, referral_code } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      // Return existing entry
      const { count: aheadCount } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .or(`referral_count.gt.${existing.referral_count},and(referral_count.eq.${existing.referral_count},position.lt.${existing.position})`);

      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        user: {
          email: existing.email,
          position: (aheadCount || 0) + 1,
          referralCode: existing.referral_code,
          referralCount: existing.referral_count,
          rewardTier: getRewardTier(existing.referral_count)
        }
      });
    }

    // Find referrer if code provided
    let referrerId = null;
    if (referral_code) {
      const { data: referrer } = await supabase
        .from('waitlist')
        .select('id')
        .eq('referral_code', referral_code)
        .single();
      referrerId = referrer?.id;
    }

    // Insert new entry
    const { data: newEntry, error } = await supabase
      .from('waitlist')
      .insert({
        email: cleanEmail,
        name: name || null,
        type,
        zone_id: zone_id || null,
        referred_by: referrerId
      })
      .select()
      .single();

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    // Get total count for position
    const { count: totalCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const rewardTier = getRewardTier(0);

    // Send welcome email (non-blocking)
    sendWaitlistWelcome({
      email: newEntry.email,
      name: name || undefined,
      position: newEntry.position,
      referralCode: newEntry.referral_code,
      referralCount: 0,
      rewardTier
    }).catch(err => console.error('Email send failed:', err));

    return NextResponse.json({
      success: true,
      user: {
        email: newEntry.email,
        position: newEntry.position,
        referralCode: newEntry.referral_code,
        referralCount: 0,
        rewardTier,
        referredBy: referrerId ? true : false
      },
      totalWaitlist: totalCount || 0
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getRewardTier(referralCount: number): { tier: number; name: string; reward: string; nextAt: number | null } {
  if (referralCount >= 50) return { tier: 5, name: 'Legend', reward: 'Founder Kit + Free Product', nextAt: null };
  if (referralCount >= 25) return { tier: 4, name: 'Champion', reward: 'R200 Store Credit', nextAt: 50 };
  if (referralCount >= 10) return { tier: 3, name: 'Star', reward: '20% Launch Discount', nextAt: 25 };
  if (referralCount >= 5) return { tier: 2, name: 'Insider', reward: 'Priority Access', nextAt: 10 };
  if (referralCount >= 3) return { tier: 1, name: 'Supporter', reward: '10% Launch Discount', nextAt: 5 };
  return { tier: 0, name: 'Member', reward: 'Early Access', nextAt: 3 };
}
