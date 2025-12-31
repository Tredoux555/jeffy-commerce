import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';
const FROM_EMAIL = 'Jeffy <hello@jeffy.co.za>';

interface WaitlistWelcomeData {
  email: string;
  name?: string;
  position: number;
  referralCode: string;
  referralCount: number;
  rewardTier: {
    tier: number;
    name: string;
    reward: string;
    nextAt: number | null;
  };
}

export async function sendWaitlistWelcome(data: WaitlistWelcomeData) {
  const { email, name, position, referralCode, rewardTier } = data;
  
  const referralLink = `${SITE_URL}/coming-soon?ref=${referralCode}`;
  const whatsappText = encodeURIComponent(
    `🛒 I just joined the Jeffy waitlist! Get early access to SA's new community commerce platform. Join free: ${referralLink}`
  );
  const whatsappLink = `https://wa.me/?text=${whatsappText}`;
  
  const firstName = name?.split(' ')[0] || 'there';
  const nextMilestone = rewardTier.nextAt ? rewardTier.nextAt - data.referralCount : null;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're #${position} on the Jeffy Waitlist! 🎉`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Jeffy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Jeffy! 🛒</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">South Africa's Community Commerce Platform</p>
            </td>
          </tr>
          
          <!-- Position Badge -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 50px; padding: 15px 30px;">
                <span style="color: #047857; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Position</span>
                <div style="color: #047857; font-size: 48px; font-weight: 700; line-height: 1;">#${position}</div>
              </div>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hey ${firstName}! 👋
              </p>
              <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
                You're officially on the list. When we launch, you'll get first access to products at prices that actually make sense for South Africans.
              </p>
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>But here's the thing:</strong> Every friend you refer moves you UP the list and unlocks rewards.
              </p>
            </td>
          </tr>
          
          <!-- Referral CTA -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; text-align: center;">
                <p style="margin: 0 0 15px; color: #92400e; font-size: 18px; font-weight: 600;">
                  🔥 Share & Move Up the List
                </p>
                <p style="margin: 0 0 20px; color: #78350f; font-size: 14px;">
                  ${nextMilestone ? `Refer ${nextMilestone} more friend${nextMilestone > 1 ? 's' : ''} to unlock: <strong>${rewardTier.nextAt === 3 ? '10% Launch Discount' : rewardTier.nextAt === 5 ? 'Priority Access' : rewardTier.nextAt === 10 ? '20% Launch Discount' : rewardTier.nextAt === 25 ? 'R200 Store Credit' : 'Founder Kit'}</strong>` : 'You\'ve reached Legend status! 🏆'}
                </p>
                <a href="${whatsappLink}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  📱 Share on WhatsApp
                </a>
                <p style="margin: 15px 0 0; color: #92400e; font-size: 12px;">
                  Or copy your link: <span style="color: #047857; word-break: break-all;">${referralLink}</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Reward Tiers -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Referral Rewards
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">3 referrals</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #059669; font-size: 14px; font-weight: 500;">10% Launch Discount</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">5 referrals</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #059669; font-size: 14px; font-weight: 500;">Priority Access</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">10 referrals</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #059669; font-size: 14px; font-weight: 500;">20% Launch Discount</td>
                </tr>
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">25 referrals</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; color: #059669; font-size: 14px; font-weight: 500;">R200 Store Credit</td>
                </tr>
                <tr style="background-color: #fef3c7;">
                  <td style="padding: 10px 15px; color: #92400e; font-size: 14px; font-weight: 600;">50 referrals</td>
                  <td style="padding: 10px 15px; color: #92400e; font-size: 14px; font-weight: 600;">🏆 Founder Kit + Free Product</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email - we read everything.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Jeffy Commerce • Cape Town, South Africa
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

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Zone Partner welcome email
export async function sendZonePartnerWelcome(data: {
  email: string;
  name: string;
  zone: string;
  position: number;
  referralCode: string;
}) {
  const { email, name, zone, position, referralCode } = data;
  
  const referralLink = `${SITE_URL}/zone-partners?ref=${referralCode}`;
  const firstName = name?.split(' ')[0] || 'there';
  
  // Position-based benefits
  let benefits = '';
  if (position <= 10) {
    benefits = '55/45 profit split (6 months) • Founding Partner badge • Direct WhatsApp to founders';
  } else if (position <= 25) {
    benefits = 'Founding Partner badge • Priority training access';
  } else if (position <= 50) {
    benefits = 'Early launch access • Standard 50/50 split';
  } else {
    benefits = 'Standard timeline • 50/50 profit split';
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're Zone Partner #${position} for ${zone}! 🎯`,
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Zone Partner Application Received! 🎯</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Hey ${firstName}!</p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Big news - you're <strong>#${position}</strong> in line for the <strong>${zone}</strong> zone.
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Your Benefits at Position #${position}</p>
                <p style="margin: 0; color: #374151; font-size: 14px;">${benefits}</p>
              </div>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                <strong>Move up faster:</strong> Each referral moves you +3 positions.
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${referralLink}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                  Share Your Referral Link
                </a>
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Your link: ${referralLink}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Jeffy Commerce • Building SA's delivery network
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

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
