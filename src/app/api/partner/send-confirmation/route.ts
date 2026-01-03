import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const resend = getResend();
  
  try {
    const body = await request.json();
    const { partnerId, email, fullName, zoneName, acceptedAt } = body;

    if (!partnerId || !email || !fullName || !zoneName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agreementDate = new Date(acceptedAt);
    const firstName = fullName.split(' ')[0];

    // Send confirmation email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Jeffy <hello@jeffy.co.za>',
      to: email,
      subject: `✓ Zone Partner Agreement Confirmed - ${zoneName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #eab308 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">✓ Agreement Accepted!</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Welcome to the Jeffy Zone Partner network</p>
    </div>
    
    <!-- Content -->
    <div style="background: #f9fafb; padding: 30px;">
      
      <p style="font-size: 18px;">Hey ${firstName}! 🎉</p>
      
      <p>This email confirms that you have accepted the Zone Partner Agreement on <strong>${agreementDate.toLocaleDateString()}</strong> at <strong>${agreementDate.toLocaleTimeString()}</strong></p>

      <!-- Details Box -->
      <div style="background: white; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Zone:</strong> ${zoneName}</p>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Agreement Accepted:</strong> ${agreementDate.toLocaleString()}</p>
      </div>

      <h2 style="color: #f97316; font-size: 18px; margin-top: 30px;">What's Next?</h2>
      <p>You're now an active Zone Partner! Here's what happens next:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Tomorrow:</strong> Access your Zone Partner Dashboard</li>
        <li><strong>This week:</strong> Start receiving delivery requests in your zone</li>
        <li><strong>Weekly:</strong> Earn 50% commission on every delivery</li>
        <li><strong>Every Wednesday:</strong> Receive payouts to your bank account</li>
      </ul>

      <h2 style="color: #f97316; font-size: 18px; margin-top: 30px;">Important Reminders</h2>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✓ Maintain active Public Liability Insurance</li>
        <li>✓ Register with SARS as self-employed if you haven't</li>
        <li>✓ Keep records of business expenses for tax purposes</li>
        <li>✓ Maintain 90%+ delivery completion and 4.0+ star rating</li>
        <li>✓ Respond to customer issues within 24 hours</li>
      </ul>

      <h2 style="color: #f97316; font-size: 18px; margin-top: 30px;">Tax Information</h2>
      <p>As an independent contractor, you are responsible for:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Declaring all Jeffy earnings on your annual ITR12</li>
        <li>Paying provisional tax if you earn over R91,250 annually</li>
        <li>Registering for VAT if you earn over R1 million annually</li>
      </ul>
      <p style="font-style: italic; color: #666;">We recommend consulting with an accountant for proper record-keeping.</p>

      <h2 style="color: #f97316; font-size: 18px; margin-top: 30px;">Need Help?</h2>
      <p>Our partner support team is here:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Email:</strong> partners@jeffy.co.za</li>
        <li><strong>Hours:</strong> Monday-Friday, 09:00-17:00 SAST</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="background: #fff; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;"><strong>Jeffy Commerce</strong></p>
      <p style="margin: 5px 0 0;">This is your confirmation copy of the Zone Partner Agreement. Please keep this email for your records.</p>
      <p style="margin: 10px 0 0;">© ${new Date().getFullYear()} Jeffy Commerce. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    console.log('Partner confirmation email sent:', data?.id);

    return NextResponse.json(
      { success: true, message: 'Confirmation email sent', email, messageId: data?.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in send-confirmation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

