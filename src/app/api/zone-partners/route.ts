import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getResend = () => new Resend(process.env.RESEND_API_KEY);

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
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  const resend = getResend();
  
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
          from: 'Tredoux from Jeffy <hello@jeffy.co.za>',
          replyTo: 'tredoux@gmail.com',
          to: cleanEmail,
          subject: `You applied. Let me tell you what you're actually part of.`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
        <tr><td style="text-align: center; padding-bottom: 32px;">
          <h1 style="margin: 0; color: #f97316; font-size: 42px; font-weight: 900; letter-spacing: -1px;">Jeffy</h1>
        </td></tr>
        <tr><td style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; border: 1px solid #334155; overflow: hidden;">
          <div style="padding: 40px 32px 32px; border-bottom: 1px solid #334155;">
            <p style="margin: 0 0 8px; color: #f97316; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Application Received</p>
            <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">${firstName}, let me be straight with you.</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 18px; line-height: 1.6;">Here's what you actually just applied for.</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 24px; color: #ffffff; font-size: 18px; font-weight: 700;">Jeffy is a commerce company.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">You run a zone. Customers order. You deliver. You keep 50% of every rand of profit. Not a salary. Not commission. Profit. Yours. Forever.</p>
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 15px; line-height: 1.7;">That's the simple part.</p>
            
            <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%); border-left: 4px solid #f97316; border-radius: 0 12px 12px 0; padding: 24px; margin: 28px 0;">
              <p style="margin: 0 0 12px; color: #f97316; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Where the other 50% goes</p>
              <p style="margin: 0; color: #ffffff; font-size: 17px; line-height: 1.7; font-weight: 500;">It builds schools. But not schools like you've seen before.</p>
            </div>
            
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">These schools teach students to create everything they need to live. Food. Medicine. Electronics. Vehicles. Clothes. Not just the knowledge - the means to manufacture it. Every student learns to produce what they need with their own hands.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">When they graduate, they don't get a certificate and a handshake.</p>
            <p style="margin: 0 0 20px; color: #ffffff; font-size: 17px; line-height: 1.8; font-weight: 600;">They get one hectare of land. A manufacturing facility. And the skills to build whatever future they choose.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">No debt. No dependence. No asking anyone for permission.</p>
            
            <div style="text-align: center; padding: 28px 0; margin: 20px 0; border-top: 1px solid #334155; border-bottom: 1px solid #334155;">
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">This isn't charity. It's a new system.</p>
              <p style="margin: 12px 0 0; color: #fbbf24; font-size: 18px; font-weight: 600;">Self-sustaining. Self-supporting. Self-expanding.</p>
              <p style="margin: 12px 0 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">A system designed to grow - and eventually replace the broken one we're all living under.</p>
            </div>
            
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">That's what your 50% builds.</p>
            
            <div style="background-color: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 24px; margin: 28px 0;">
              <p style="margin: 0 0 12px; color: #22c55e; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">What you need to understand</p>
              <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">You can't buy your way into these schools. Not for any amount of money. Entry is merit. Only merit. Always.</p>
              <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">But Zone Partners get one thing nobody else gets.</p>
              <p style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 700;">Priority placement for their children.</p>
              <p style="margin: 12px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">Not guaranteed entry - they still have to earn it. But when the doors open, Zone Partner families are first in line. That's the only priority we give. The only one. And it can't be purchased.</p>
            </div>
            
            <p style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 700;">So here's your choice:</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">You can run your zone. Take your 50%. Build a good life. Stop there. That's yours. No pressure.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Or you can see this for what it is. A chance to help build something that outlasts you. That your children could inherit. That could change how this country - and eventually this world - actually works.</p>
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 15px; line-height: 1.7;">Both paths are open. Jeffy doesn't force anyone. We build roads. You choose which one to walk.</p>
            
            <div style="background-color: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin: 28px 0;">
              <p style="margin: 0 0 8px; color: #f97316; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Application</p>
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px;"><strong>Zone:</strong> ${zone_id}</p>
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Status: Under Review</p>
            </div>
            
            <p style="margin: 0 0 20px; color: #94a3b8; font-size: 15px; line-height: 1.7;">Not everyone gets accepted. We review every application personally. If you're in, you'll hear from me directly.</p>
            <p style="margin: 0 0 20px; color: #ffffff; font-size: 17px; line-height: 1.8; font-weight: 600;">You made the right choice applying.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Now let's see if we're right for each other.</p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 600;">- Tredoux</p>
              <p style="margin: 16px 0 0; color: #64748b; font-size: 13px; font-style: italic;">P.S. Reply anytime. I read every one.</p>
            </div>
          </div>
        </td></tr>
        <tr><td style="padding: 32px 0; text-align: center;">
          <p style="margin: 0; color: #334155; font-size: 11px;">Jeffy Commerce (Pty) Ltd</p>
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
