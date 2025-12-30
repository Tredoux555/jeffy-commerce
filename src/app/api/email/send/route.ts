import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const TEMPLATES = {
  order_confirmation: (data: any) => ({
    subject: `Order Confirmed! #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Jeffy Commerce</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Eish, These Prices! 🛒</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px;">Order Confirmed! ✅</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thanks for your order! We've received it and are getting it ready.
              </p>
              
              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8f5; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Order Number</p>
                    <p style="margin: 0 0 20px; color: #FF6B35; font-size: 20px; font-weight: bold;">#${data.orderNumber}</p>
                    
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Delivery Address</p>
                    <p style="margin: 0 0 20px; color: #1a1a2e; font-size: 16px;">${data.address}</p>
                    
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Order Total</p>
                    <p style="margin: 0; color: #1a1a2e; font-size: 24px; font-weight: bold;">R${data.total}</p>
                  </td>
                </tr>
              </table>
              
              ${data.trackingLink ? `
              <!-- Tracking Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.trackingLink}" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Track Your Order →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="margin: 30px 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                Questions? Reply to this email or WhatsApp us at +27 XX XXX XXXX
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: #ffffff; font-size: 16px; font-weight: bold;">Jeffy Commerce</p>
              <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px;">
                Shop Smart, Save Big 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  partner_assigned: (data: any) => ({
    subject: `Your Delivery Partner for Order #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Jeffy Commerce</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px;">Your Delivery Partner 🚚</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Great news! A Zone Partner has been assigned to deliver your order.
              </p>
              
              <!-- Partner Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8f5; border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Your Delivery Partner</p>
                    <p style="margin: 0 0 20px; color: #1a1a2e; font-size: 20px; font-weight: bold;">${data.partnerName}</p>
                    
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Contact Number</p>
                    <p style="margin: 0; color: #FF6B35; font-size: 18px; font-weight: bold;">
                      <a href="tel:${data.partnerPhone}" style="color: #FF6B35; text-decoration: none;">${data.partnerPhone}</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                ${data.partnerName} will contact you to arrange delivery. You can also reach out to them directly using the number above.
              </p>
              
              <!-- Order Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      Order Reference: <strong style="color: #1a1a2e;">#${data.orderNumber}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: #ffffff; font-size: 16px; font-weight: bold;">Jeffy Commerce</p>
              <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px;">
                Shop Smart, Save Big 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  disclosure_sent: (data: any) => ({
    subject: 'Your Jeffy Zone Partner Application - Approved! 🎉',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Jeffy Commerce</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Zone Partner Program</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px;">Congratulations, ${data.name}! 🎉</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your Zone Partner application has been <strong style="color: #22c55e;">approved</strong>!
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                As required by the Consumer Protection Act, we've attached your disclosure document. Please review it carefully.
              </p>
              
              <!-- 14 Day Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: bold;">⏰ 14-Day Waiting Period</p>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                      By law, you must wait 14 days before signing the agreement. You can sign after <strong>${data.canSignAfter}</strong>.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                We'll send you a reminder when you're ready to proceed!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: #ffffff; font-size: 16px; font-weight: bold;">Jeffy Commerce</p>
              <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px;">
                Building South Africa's Future Together 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  })
};

type TemplateType = keyof typeof TEMPLATES;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !TEMPLATES[type as TemplateType]) {
      return NextResponse.json(
        { success: false, error: `Invalid template. Available: ${Object.keys(TEMPLATES).join(', ')}` },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient email required' },
        { status: 400 }
      );
    }

    const template = TEMPLATES[type as TemplateType](data);

    const { data: result, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Jeffy Commerce <noreply@jeffy.co.za>',
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result?.id
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    templates: Object.keys(TEMPLATES),
    usage: {
      method: 'POST',
      body: {
        type: 'order_confirmation | partner_assigned | disclosure_sent',
        to: 'recipient@email.com',
        data: '{ template-specific data }'
      }
    }
  });
}



