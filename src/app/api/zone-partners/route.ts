import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';

// GET - Get zone partner stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // Get total partner count
  const { count: totalPartners } = await supabase
    .from('zone_partners')
    .select('*', { count: 'exact', head: true });

  // If checking specific user
  if (email) {
    const { data: partner } = await supabase
      .from('zone_partners')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (partner) {
      return NextResponse.json({
        success: true,
        partner: {
          id: partner.id,
          name: partner.full_name,
          email: partner.email,
          status: partner.status,
          zone: partner.zone_id,
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

// POST - Submit Zone Partner application
export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, zone_id, message } = await request.json();

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Full name required' }, { status: 400 });
    }

    if (!zone_id || zone_id.length < 3) {
      return NextResponse.json({ error: 'Zone information required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already applied
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

    // Insert new application into zone_partners with status='pending'
    const { data: newPartner, error: insertError } = await supabase
      .from('zone_partners')
      .insert({
        full_name: name,
        full_legal_name: name, // Some pages use this field
        email: cleanEmail,
        phone: phone || null,
        zone_id: zone_id,
        zone_name: zone_id, // Display name for the zone
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

    // Send confirmation email
    let emailSent = false;
    try {
      const firstName = name.split(' ')[0];
      
      const { error: emailError } = await resend.emails.send({
        from: 'Jeffy <hello@jeffy.co.za>',
        to: cleanEmail,
        subject: `Zone Partner Application Received 🎯`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Application Received! 🎯</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Jeffy Zone Partner Program</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 18px;">
                Hey ${firstName}! 👋
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We've received your application to become a Zone Partner for <strong>${zone_id}</strong>.
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
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Zone Partners aren't just registered — they're <strong>chosen</strong>. We're looking for people who genuinely want to serve their community.
              </p>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Questions? Just reply to this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">
                Jeffy Commerce
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Building South Africa's community delivery network
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });

      if (emailError) {
        console.error('Resend email error:', emailError);
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    // Also send admin notification
    try {
      await resend.emails.send({
        from: 'Jeffy <hello@jeffy.co.za>',
        to: 'tredoux@gmail.com', // Admin email
        subject: `🆕 New Zone Partner Application: ${name}`,
        html: `
          <h2>New Zone Partner Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Zone:</strong> ${zone_id}</p>
          <p><strong>Why they want to join:</strong></p>
          <p>${message || 'Not provided'}</p>
          <br>
          <p><a href="${SITE_URL}/admin/partners">Review in Admin Panel →</a></p>
        `,
      });
    } catch (adminEmailErr) {
      console.error('Admin notification failed:', adminEmailErr);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      partner: {
        id: newPartner.id,
        name: newPartner.full_name,
        email: newPartner.email,
        status: 'pending'
      },
      message: 'Application submitted successfully!'
    });

  } catch (error) {
    console.error('Zone partner error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
