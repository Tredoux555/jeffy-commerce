import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendZonePartnerWelcome } from '@/lib/email/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// GET - Get zone stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

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
      // Calculate position overall
      const { count: ahead } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .lt('position', user.position);

      const position = (ahead || 0) + 1;
      const benefits = getPositionBenefits(position);

      return NextResponse.json({
        success: true,
        user: {
          email: user.email,
          zoneId: user.zone_id,
          position,
          referralCode: user.referral_code,
          referralCount: user.referral_count,
          benefits
        },
        totalPartners: totalPartners || 0
      });
    }
  }

  return NextResponse.json({
    success: true,
    totalPartners: totalPartners || 0
  });
}

// POST - Join Zone Partner waitlist
export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, zone_id, message, referral_code } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!zone_id || zone_id.length < 3) {
      return NextResponse.json({ error: 'Zone information required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already exists (any type - email is unique across all)
    const { data: existing } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      // If they exist but not as zone partner, update them to zone partner
      if (existing.type !== 'zone_partner') {
        const zoneWithPhone = phone ? `${zone_id} | Phone: ${phone}` : zone_id;
        const { data: updated, error: updateError } = await supabase
          .from('waitlist')
          .update({ 
            type: 'zone_partner', 
            zone_id: zoneWithPhone,
            name: name || existing.name
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (updateError) {
          return NextResponse.json({ error: 'Failed to update application', details: updateError.message }, { status: 500 });
        }

        const { count: ahead } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'zone_partner')
          .lt('position', updated.position);

        const position = (ahead || 0) + 1;

        return NextResponse.json({
          success: true,
          upgraded: true,
          user: {
            email: updated.email,
            zoneId: updated.zone_id,
            position,
            referralCode: updated.referral_code,
            referralCount: updated.referral_count,
            benefits: getPositionBenefits(position)
          }
        });
      }

      // Already a zone partner
      const { count: ahead } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .lt('position', existing.position);

      const position = (ahead || 0) + 1;

      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        user: {
          email: existing.email,
          zoneId: existing.zone_id,
          position,
          referralCode: existing.referral_code,
          referralCount: existing.referral_count,
          benefits: getPositionBenefits(position)
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

    // Insert new entry - include phone in zone_id for now since whatsapp column doesn't exist
    const zoneWithPhone = phone ? `${zone_id} | Phone: ${phone}` : zone_id;
    const { data: newEntry, error } = await supabase
      .from('waitlist')
      .insert({
        email: cleanEmail,
        name: name || null,
        type: 'zone_partner',
        zone_id: zoneWithPhone
      })
      .select()
      .single();

    if (error) {
      console.error('Zone partner insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist', details: error.message }, { status: 500 });
    }

    // Calculate position
    const { count: ahead } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'zone_partner')
      .lt('position', newEntry.position);

    const position = (ahead || 0) + 1;

    // Send welcome email (non-blocking)
    if (name) {
      sendZonePartnerWelcome({
        email: newEntry.email,
        name: name,
        zone: zone_id,
        position: position,
        referralCode: newEntry.referral_code
      }).catch(err => console.error('Zone partner email failed:', err));
    }

    return NextResponse.json({
      success: true,
      user: {
        email: newEntry.email,
        zoneId: zone_id,
        position,
        referralCode: newEntry.referral_code,
        referralCount: 0,
        benefits: getPositionBenefits(position),
        referredBy: !!referrerId
      }
    });

  } catch (error) {
    console.error('Zone partner error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
