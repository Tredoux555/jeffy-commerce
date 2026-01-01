import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'tredoux555@gmail.com';
  const firstName = 'Test';
  const zone_id = 'Debug Zone';
  
  try {
    // Test with the EXACT same template as zone-partners
    const result = await resend.emails.send({
      from: 'Tredoux from Jeffy <hello@jeffy.co.za>',
      replyTo: 'tredoux@gmail.com',
      to: email,
      subject: `You didn't just apply for a business. You applied to build a country.`,
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
            <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">${firstName}, you didn't just apply for a job.</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 18px; line-height: 1.6;">You put your hand up to help build something that hasn't existed in this country before.</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Let me tell you what you actually signed up for.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">My family once built a school for farm kids in the Eastern Cape. Children who walked 30 kilometers each way just to learn. We did it because we believed every South African deserves a shot - not based on where they're born or who they know, but purely on what's inside them.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Corruption killed that school. Took everything. I've spent years trying to figure out how to build something they can't destroy.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;"><strong style="color: #ffffff;">Jeffy is that thing.</strong></p>
            <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%); border-left: 4px solid #f97316; border-radius: 0 12px 12px 0; padding: 24px; margin: 28px 0;">
              <p style="margin: 0 0 12px; color: #f97316; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">The Mission</p>
              <p style="margin: 0; color: #ffffff; font-size: 17px; line-height: 1.7; font-weight: 500;">Every rand of profit Jeffy makes goes toward building free schools. Not charity schools - schools where students are selected purely on merit. Where graduates walk away with <strong>one hectare of land</strong>, a <strong>house they built with their own hands</strong>, and the skills to manufacture food, technology, medicine, clothing - everything they need to never depend on anyone again.</p>
            </div>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">The first school will be on my family's farm. The same land my ancestors settled generations ago. And from there, we expand - across South Africa, across Africa, and eventually around the world.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Self-sufficient communities producing everything they need. Annual gatherings where they share innovations with each other. A network of people who don't wait for government, don't wait for handouts, don't wait for anyone - they build.</p>
            <div style="text-align: center; padding: 28px 0; margin: 20px 0; border-top: 1px solid #334155; border-bottom: 1px solid #334155;">
              <p style="margin: 0; color: #fbbf24; font-size: 20px; font-style: italic; line-height: 1.5;">"We plant trees under whose shade we'll never sit."</p>
            </div>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">That's what you applied for.</p>
            <div style="background-color: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; margin: 28px 0;">
              <p style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 700;">Your role as a Zone Partner:</p>
              <p style="margin: 0 0 16px; color: #94a3b8; font-size: 15px; line-height: 1.7;">You're not a delivery driver. You're not a franchisee paying rent to head office. You're a <strong style="color: #ffffff;">founding partner</strong> in your territory. You own it. Forever. 50% of every rand of profit is yours - and the other 50% builds schools.</p>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.7;">When we need to make a big decision, you have a seat at the table. When the first school opens, your family gets priority placement. This isn't a gig. It's generational.</p>
            </div>
            <div style="background-color: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 20px; margin: 28px 0;">
              <p style="margin: 0 0 8px; color: #22c55e; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Application</p>
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px;"><strong>Zone:</strong> ${zone_id}</p>
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Status: Under Review</p>
            </div>
            <div style="background-color: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 20px; margin: 28px 0;">
              <p style="margin: 0 0 12px; color: #fbbf24; font-size: 14px; font-weight: 700;">A few things you should know:</p>
              <p style="margin: 0 0 12px; color: #e2e8f0; font-size: 15px; line-height: 1.7;"><strong>Not everyone gets accepted.</strong> We're building something that requires the right people - people who understand this is bigger than themselves. We review every application personally.</p>
              <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.7;"><strong>You'll need capital.</strong> Zone Partners buy their own stock. This isn't a job where someone pays you - it's a real business. If you need time to save, use it wisely.</p>
            </div>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">I grew up on a farm and saw inequality just one kilometer away. I've worked on every continent trying to figure out how to fix what's broken in this country. I believe South Africans are the most capable people on the planet - we just haven't been given the system to prove it.</p>
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.8;">Jeffy is that system. And you just put your hand up to help build it.</p>
            <p style="margin: 0 0 20px; color: #ffffff; font-size: 17px; line-height: 1.8; font-weight: 500;">Welcome to the beginning.</p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 600;">Tredoux Willemse</p>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">Founder, Jeffy Commerce</p>
              <p style="margin: 0; color: #64748b; font-size: 13px; font-style: italic;">P.S. - Reply to this email anytime. I read every single one.</p>
            </div>
          </div>
        </td></tr>
        <tr><td style="padding: 32px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #475569; font-size: 12px;">Jeffy Commerce (Pty) Ltd</p>
          <p style="margin: 0; color: #334155; font-size: 11px;">Building South African commerce, one zone at a time.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ 
      success: true, 
      emailId: result.data?.id,
      result
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      errorName: error.name,
      errorStack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, { status: 500 });
  }
}
