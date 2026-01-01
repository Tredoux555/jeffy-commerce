import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';

// Zone data (could move to database later)
const ZONES = [
  { id: 'sandton', name: 'Sandton', city: 'Johannesburg', province: 'Gauteng', maxPartners: 5, currentCount: 0, spotsLeft: 5, status: 'open' as const },
  { id: 'rosebank', name: 'Rosebank', city: 'Johannesburg', province: 'Gauteng', maxPartners: 3, currentCount: 0, spotsLeft: 3, status: 'open' as const },
  { id: 'fourways', name: 'Fourways', city: 'Johannesburg', province: 'Gauteng', maxPartners: 4, currentCount: 0, spotsLeft: 4, status: 'open' as const },
  { id: 'midrand', name: 'Midrand', city: 'Johannesburg', province: 'Gauteng', maxPartners: 3, currentCount: 0, spotsLeft: 3, status: 'open' as const },
  { id: 'pretoria-east', name: 'Pretoria East', city: 'Pretoria', province: 'Gauteng', maxPartners: 4, currentCount: 0, spotsLeft: 4, status: 'open' as const },
  { id: 'centurion', name: 'Centurion', city: 'Pretoria', province: 'Gauteng', maxPartners: 3, currentCount: 0, spotsLeft: 3, status: 'open' as const },
  { id: 'cape-town-cbd', name: 'Cape Town CBD', city: 'Cape Town', province: 'Western Cape', maxPartners: 5, currentCount: 0, spotsLeft: 5, status: 'open' as const },
  { id: 'sea-point', name: 'Sea Point', city: 'Cape Town', province: 'Western Cape', maxPartners: 3, currentCount: 0, spotsLeft: 3, status: 'open' as const },
  { id: 'stellenbosch', name: 'Stellenbosch', city: 'Stellenbosch', province: 'Western Cape', maxPartners: 2, currentCount: 0, spotsLeft: 2, status: 'limited' as const },
  { id: 'umhlanga', name: 'Umhlanga', city: 'Durban', province: 'KwaZulu-Natal', maxPartners: 4, currentCount: 0, spotsLeft: 4, status: 'open' as const },
  { id: 'durban-north', name: 'Durban North', city: 'Durban', province: 'KwaZulu-Natal', maxPartners: 3, currentCount: 0, spotsLeft: 3, status: 'open' as const },
];

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

// GET - Get zones and partner stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // Get partner counts per zone from waitlist
  const { data: zoneCounts } = await supabase
    .from('waitlist')
    .select('zone_id')
    .eq('type', 'zone_partner');

  // Calculate counts per zone
  const countByZone: Record<string, number> = {};
  zoneCounts?.forEach(item => {
    if (item.zone_id) {
      const zoneId = item.zone_id.split(' > ')[0]?.toLowerCase().replace(/\s+/g, '-') || item.zone_id;
      countByZone[zoneId] = (countByZone[zoneId] || 0) + 1;
    }
  });

  // Update zone data with current counts
  const zonesWithCounts = ZONES.map(zone => {
    const count = countByZone[zone.id] || 0;
    const spotsLeft = Math.max(0, zone.maxPartners - count);
    let status: 'open' | 'limited' | 'waitlist' = 'open';
    if (spotsLeft === 0) status = 'waitlist';
    else if (spotsLeft <= 2) status = 'limited';
    return { ...zone, currentCount: count, spotsLeft, status };
  });

  // Get total partner count
  const { count: totalPartners } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'zone_partner');

  // If checking specific user
  if (email) {
    const { data: partner } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('type', 'zone_partner')
      .single();

    if (partner) {
      // Calculate position
      const { count: ahead } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .lt('position', partner.position);

      const position = (ahead || 0) + 1;
      const zoneName = ZONES.find(z => z.id === partner.zone_id)?.name || partner.zone_id;

      return NextResponse.json({
        success: true,
        zones: zonesWithCounts,
        totalPartners: totalPartners || 0,
        user: {
          email: partner.email,
          zoneId: partner.zone_id,
          zoneName,
          position,
          referralCode: partner.referral_code,
          referralCount: partner.referral_count || 0,
          benefits: getPositionBenefits(position)
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    zones: zonesWithCounts,
    totalPartners: totalPartners || 0
  });
}

// POST - Handle both waitlist signup and full application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, zone_id, message, whatsapp, referral_code } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hasFullApplication = name && name.length >= 2;

    // FULL APPLICATION (from /partner/apply) - goes to zone_partners table
    if (hasFullApplication) {
      if (!zone_id || zone_id.length < 3) {
        return NextResponse.json({ error: 'Zone information required' }, { status: 400 });
      }

      // Check if already applied to zone_partners
      const { data: existing } = await supabase
        .from('zone_partners')
        .select('id, status, email')
        .eq('email', cleanEmail)
        .single();

      if (existing) {
        return NextResponse.json({
          success: true,
          alreadyApplied: true,
          status: existing.status,
          message: existing.status === 'pending' 
            ? 'Your application is being reviewed'
            : existing.status === 'approved'
            ? 'Your application has been approved! Check your email for next steps.'
            : 'You have already applied'
        });
      }

      // Insert full application
      const { data: newPartner, error: insertError } = await supabase
        .from('zone_partners')
        .insert({
          full_name: name,
          full_legal_name: name,
          email: cleanEmail,
          phone: phone || whatsapp || null,
          zone_id: zone_id,
          zone_name: zone_id,
          notes: message || null,
          status: 'pending',
          is_active: false,
          agreed_to_terms: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Zone partner insert error:', insertError);
        return NextResponse.json({ 
          error: 'Failed to submit application', 
          details: insertError.message 
        }, { status: 500 });
      }

      // Send confirmation email for full application
      const firstName = name.split(' ')[0];
      try {
        await resend.emails.send({
          from: 'Jeffy <hello@jeffy.co.za>',
          to: cleanEmail,
          subject: `Zone Partner Application Received 🎯`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
        <tr><td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Application Received! 🎯</h1>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9);">Jeffy Zone Partner Program</p>
        </td></tr>
        <tr><td style="padding: 40px 30px;">
          <p style="margin: 0 0 20px; color: #374151; font-size: 18px;">Hey ${firstName}! 👋</p>
          <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
            We've received your application for <strong>${zone_id}</strong>.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px; color: #166534; font-size: 14px; font-weight: 600;">WHAT HAPPENS NEXT</p>
            <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
              <li>We review your application (1-3 business days)</li>
              <li>If approved, you'll receive disclosure documents</li>
              <li>14-day consideration period (legally required)</li>
              <li>Sign agreement & complete training</li>
              <li>Start earning in your zone! 🚀</li>
            </ol>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Questions? Just reply to this email.</p>
        </td></tr>
        <tr><td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">Jeffy Commerce • Building SA's community delivery network</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });

        // Admin notification
        await resend.emails.send({
          from: 'Jeffy <hello@jeffy.co.za>',
          to: 'tredoux@gmail.com',
          subject: `🆕 New Zone Partner Application: ${name}`,
          html: `
            <h2>New Zone Partner Application</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${cleanEmail}</p>
            <p><strong>Phone:</strong> ${phone || whatsapp || 'Not provided'}</p>
            <p><strong>Zone:</strong> ${zone_id}</p>
            <p><strong>Why:</strong> ${message || 'Not provided'}</p>
            <br><p><a href="${SITE_URL}/admin/partners">Review in Admin Panel →</a></p>
          `,
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }

      return NextResponse.json({
        success: true,
        partner: {
          id: newPartner.id,
          name: newPartner.full_name,
          email: newPartner.email,
          status: 'pending'
        },
        message: 'Application submitted successfully!'
      });
    }

    // QUICK WAITLIST SIGNUP (from /zone-partners page) - goes to waitlist table
    if (!zone_id) {
      return NextResponse.json({ error: 'Zone selection required' }, { status: 400 });
    }

    // Check if already in waitlist
    const { data: existingWaitlist } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', cleanEmail)
      .eq('type', 'zone_partner')
      .single();

    if (existingWaitlist) {
      const { count: ahead } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'zone_partner')
        .lt('position', existingWaitlist.position);

      const position = (ahead || 0) + 1;
      const zoneName = ZONES.find(z => z.id === existingWaitlist.zone_id)?.name || existingWaitlist.zone_id;

      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        user: {
          email: existingWaitlist.email,
          zoneId: existingWaitlist.zone_id,
          zoneName,
          position,
          referralCode: existingWaitlist.referral_code,
          referralCount: existingWaitlist.referral_count || 0,
          benefits: getPositionBenefits(position)
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

    // Insert into waitlist
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: cleanEmail,
        type: 'zone_partner',
        zone_id: zone_id,
        referred_by: referrerId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    const zoneName = ZONES.find(z => z.id === zone_id)?.name || zone_id;

    // Send waitlist confirmation email
    try {
      await resend.emails.send({
        from: 'Jeffy <hello@jeffy.co.za>',
        to: cleanEmail,
        subject: `You're on the Zone Partner Waitlist! 🚀`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #f97316; font-size: 36px; font-weight: 900; margin: 0;">Jeffy</h1>
    </div>
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; padding: 32px; border: 1px solid #334155;">
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">
        You're In! 🎯
      </h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        You're on the waitlist for <strong style="color: #fbbf24;">${zoneName}</strong>
      </p>
      <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="color: #fbbf24; font-size: 14px; margin: 0 0 8px 0;">YOUR POSITION</p>
        <p style="color: #ffffff; font-size: 48px; font-weight: 900; margin: 0;">#${newEntry.position}</p>
      </div>
      <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
        When you're ready, complete the full application to secure your spot.
      </p>
      <div style="text-align: center;">
        <a href="${SITE_URL}/partner/apply" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #000000; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
          Complete Application →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error('Waitlist email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        email: newEntry.email,
        zoneId: zone_id,
        zoneName,
        position: newEntry.position,
        referralCode: newEntry.referral_code,
        referralCount: 0,
        benefits: getPositionBenefits(newEntry.position),
        referredBy: !!referrerId
      }
    });

  } catch (error) {
    console.error('Zone partner error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
