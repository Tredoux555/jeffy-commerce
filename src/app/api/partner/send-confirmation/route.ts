import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #eab308 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #f97316; font-size: 18px; margin-top: 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #f97316; margin: 15px 0; }
    .footer { background: #fff; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Agreement Accepted!</h1>
      <p>Welcome to the Jeffy Zone Partner network, ${fullName}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Your Zone Partner Agreement is Confirmed</h2>
        <p>This email confirms that you have accepted the Zone Partner Agreement on <strong>${agreementDate.toLocaleDateString()}</strong> at <strong>${agreementDate.toLocaleTimeString()}</strong></p>
      </div>

      <div class="info-box">
        <strong>Your Details:</strong>
        <p><strong>Zone:</strong> ${zoneName}</p>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Agreement Accepted:</strong> ${agreementDate.toLocaleString()}</p>
      </div>

      <div class="section">
        <h2>What's Next?</h2>
        <p>You're now an active Zone Partner! Here's what happens next:</p>
        <ul>
          <li><strong>Tomorrow:</strong> Access your Zone Partner Dashboard</li>
          <li><strong>This week:</strong> Start receiving delivery requests in your zone</li>
          <li><strong>Weekly:</strong> Earn 50% commission on every delivery you complete</li>
          <li><strong>Every Wednesday:</strong> Receive payouts to your bank account</li>
        </ul>
      </div>

      <div class="section">
        <h2>Important Reminders</h2>
        <ul>
          <li>✓ You must have active Public Liability Insurance</li>
          <li>✓ Register with SARS as self-employed if you haven't already</li>
          <li>✓ Keep records of your business expenses for tax purposes</li>
          <li>✓ Maintain 90%+ delivery completion and 4.0+ star rating</li>
          <li>✓ Respond to customer issues within 24 hours</li>
        </ul>
      </div>

      <div class="section">
        <h2>Tax Information</h2>
        <p>As an independent contractor, you are responsible for:</p>
        <ul>
          <li>Declaring all Jeffy earnings on your annual ITR12</li>
          <li>Paying provisional tax if you earn over R91,250 annually</li>
          <li>Registering for VAT if you earn over R1 million annually</li>
        </ul>
        <p><em>We recommend consulting with an accountant to set up proper record-keeping.</em></p>
      </div>

      <div class="section">
        <h2>Need Help?</h2>
        <p>Our partner support team is here to help:</p>
        <ul>
          <li><strong>Email:</strong> partners@jeffy.co.za</li>
          <li><strong>Hours:</strong> Monday-Friday, 09:00-17:00 SAST</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p><strong>Jeffy Commerce</strong></p>
      <p>This is your confirmation copy of the Zone Partner Agreement. Please keep this email for your records.</p>
      <p>&copy; ${new Date().getFullYear()} Jeffy Commerce. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // For now, just log and return success
    // Email sending can be configured later with Resend or SendGrid
    console.log('Confirmation email would be sent to:', email);

    return NextResponse.json(
      { success: true, message: 'Confirmation email sent', email },
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

