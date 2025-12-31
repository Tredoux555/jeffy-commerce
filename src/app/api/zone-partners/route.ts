import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// SA Zones with capacity limits
const ZONE_CONFIG: Record<string, { name: string; city: string; maxPartners: number; province: string }> = {
  'sandton': { name: 'Sandton', city: 'Johannesburg', province: 'Gauteng', maxPartners: 15 },
  'rosebank': { name: 'Rosebank', city: 'Johannesburg', province: 'Gauteng', maxPartners: 10 },
  'fourways': { name: 'Fourways', city: 'Johannesburg', province: 'Gauteng', maxPartners: 12 },
  'midrand': { name: 'Midrand', city: 'Johannesburg', province: 'Gauteng', maxPartners: 10 },
  'centurion': { name: 'Centurion', city: 'Pretoria', province: 'Gauteng', maxPartners: 10 },
  'pretoria-east': { name: 'Pretoria East', city: 'Pretoria', province: 'Gauteng', maxPartners: 12 },
  'pretoria-north': { name: 'Pretoria North', city: 'Pretoria', province: 'Gauteng', maxPartners: 8 },
  'cape-town-cbd': { name: 'Cape Town CBD', city: 'Cape Town', province: 'Western Cape', maxPartners: 15 },
  'sea-point': { name: 'Sea Point', city: 'Cape Town', province: 'Western Cape', maxPartners: 8 },
  'claremont': { name: 'Claremont', city: 'Cape Town', province: 'Western Cape', maxPartners: 10 },
  'stellenbosch': { name: 'Stellenbosch', city: 'Stellenbosch', province: 'Western Cape', maxPartners: 6 },
  'durban-north': { name: 'Durban North', city: 'Durban', province: 'KwaZulu-Natal', maxPartners: 10 },
  'umhlanga': { name: 'Umhlanga', city: 'Durban', province: 'KwaZulu-Natal', maxPartners: 12 },
  'ballito': { name: 'Ballito', city: 'Durban', province: 'KwaZulu-Natal', maxPartners: 6 },
  'port-elizabeth': { name: 'Port Elizabeth', city: 'Gqeberha', province: 'Eastern Cape', maxPartners: 8 },
  'bloemfontein': { name: 'Bloemfontein', city: 'Bloemfontein', province: 'Free State', maxPartners: 6 },
};

function getZoneStatus(currentCount: number, maxPartners: number): 'open' | 'limited' | 'waitlist' {
  const percentage = (currentCount / maxPartners) * 100;
  if (percentage >= 100) return 'waitlist';
  if (percentage >= 70) return 'limited';
  return 'open';
}

function getPositionBenefits(position: number): { tier: string; benefits: string[]; profitSplit: string } {
  if (position <= 10) {
    return {
      tier: 'Founding Partner',
      benefits: ['55/45 profit split (locked 6 months)', 'Founding Partner badge', 'Priority training cohort', 'Direct WhatsApp to founders'],
      profitSplit: '55/45'
    };
  }
  if (position <= 25) {
    return {
      tier: 'Early Partner',
      benefits: ['Founding Partner badge', 'Priority training cohort', 'Early launch access'],
      profitSplit: '50/50'
    };
  }
  if (position <= 50) {
    return {
      tier: 'Launch Partner',
      benefits: ['Early launch access', 'Priority onboarding'],
      profitSplit: '50/50'
    };
  }
  return {
    tier: 'Partner',
    benefits: ['Standard launch timeline'],
    profitSplit: '50/50'
  };
}

// GET - Get zone stats and individual position
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const zoneId = searchParams.get('zone');

  // Get counts per zone
  const { data: zoneCounts } = await supabase
    .from('waitlist')
    .select('zone_id')
    .eq('type', 'zone_partner')
    .not('zone_id', 'is', null);

  // Calculate zone stats
  const zoneStats = Object.entries(ZONE_CONFIG).map(([id, config]) => {
    const count = zoneCounts?.filter(w => w.zone_id === id).length || 0;
    return {
      id,
      ...config,
      currentCount: count,
      spotsLeft: Math.max(0, config.maxPartners - count),
      status: getZoneStatus(count, config.maxPartners)
    };
  });

  // Get total partner waitlist count
  const { count: totalPartners } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'zone_partner');

  // If checking specific user
  if (email) {
    const { data: user } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('type', 'zone_partner')
      .single();

    if (user) {
      // Calculate position in their zone
      const { count: aheadInZone } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .eq('zone_id', user.zone_id)
        .or(`referral_count.gt.${user.referral_count},and(referral_count.eq.${user.referral_count},position.lt.${user.position})`);

      const zonePosition = (aheadInZone || 0) + 1;
      const benefits = getPositionBenefits(zonePosition);

      return NextResponse.json({
        success: true,
        user: {
          email: user.email,
          zoneId: user.zone_id,
          zoneName: ZONE_CONFIG[user.zone_id]?.name || user.zone_id,
          position: zonePosition,
          referralCode: user.referral_code,
          referralCount: user.referral_count,
          benefits
        },
        zones: zoneStats,
        totalPartners: totalPartners || 0
      });
    }
  }

  // If checking specific zone
  if (zoneId && ZONE_CONFIG[zoneId]) {
    const zone = zoneStats.find(z => z.id === zoneId);
    return NextResponse.json({
      success: true,
      zone,
      zones: zoneStats,
      totalPartners: totalPartners || 0
    });
  }

  return NextResponse.json({
    success: true,
    zones: zoneStats,
    totalPartners: totalPartners || 0
  });
}

// POST - Join Zone Partner waitlist
export async function POST(request: NextRequest) {
  try {
    const { email, name, zone_id, whatsapp, referral_code } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!zone_id || !ZONE_CONFIG[zone_id]) {
      return NextResponse.json({ error: 'Valid zone required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', cleanEmail)
      .eq('type', 'zone_partner')
      .single();

    if (existing) {
      // Calculate position
      const { count: aheadInZone } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .eq('zone_id', existing.zone_id)
        .or(`referral_count.gt.${existing.referral_count},and(referral_count.eq.${existing.referral_count},position.lt.${existing.position})`);

      const zonePosition = (aheadInZone || 0) + 1;

      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        user: {
          email: existing.email,
          zoneId: existing.zone_id,
          zoneName: ZONE_CONFIG[existing.zone_id]?.name,
          position: zonePosition,
          referralCode: existing.referral_code,
          referralCount: existing.referral_count,
          benefits: getPositionBenefits(zonePosition)
        }
      });
    }

    // Find referrer
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
        type: 'zone_partner',
        zone_id,
        referred_by: referrerId
      })
      .select()
      .single();

    if (error) {
      console.error('Zone partner insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    // Calculate position
    const { count: aheadInZone } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'zone_partner')
      .eq('zone_id', zone_id)
      .lt('position', newEntry.position);

    const zonePosition = (aheadInZone || 0) + 1;

    return NextResponse.json({
      success: true,
      user: {
        email: newEntry.email,
        zoneId: zone_id,
        zoneName: ZONE_CONFIG[zone_id]?.name,
        position: zonePosition,
        referralCode: newEntry.referral_code,
        referralCount: 0,
        benefits: getPositionBenefits(zonePosition),
        referredBy: !!referrerId
      }
    });

  } catch (error) {
    console.error('Zone partner error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
