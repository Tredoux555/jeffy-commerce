import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';
const FROM_EMAIL = 'Jeffy <hello@jeffy.co.za>';

interface VerificationEmailData {
  to: string;
  creatorName: string;
  productName: string;
  productDescription?: string;
  verificationToken: string;
  wantId: string;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  const { to, creatorName, productName, productDescription, verificationToken } = data;
  
  const verificationLink = `${SITE_URL}/wants/verify/${verificationToken}`;
  const firstName = creatorName?.split(' ')[0] || 'Someone';

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${firstName} wants your opinion on something`,
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Jeffy</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Community Commerce</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 18px;">Hey!</p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>${firstName}</strong> requested a product on Jeffy and wants to know if you'd buy it too:
              </p>
              
              <!-- Product Card -->
              <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 10px; color: #111827; font-size: 22px; font-weight: 700;">${productName}</h2>
                ${productDescription ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${productDescription}</p>` : ''}
              </div>
              
              <!-- Value Prop -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; text-align: center;">
                  🎁 The more people back this wish, the sooner Jeffy sources it — and every month one wish is granted <strong>FREE!</strong>
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                  ✓ Yes, I'd Buy This Too!
                </a>
              </div>
              
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                Click the button to verify. Takes 2 seconds.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">
                Don't want this product? Just ignore this email.
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
      console.error('Verification email error:', error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Verification success email to the verifier
export async function sendVerificationConfirmation(data: {
  to: string;
  productName: string;
  verifiedCount: number;
  remaining: number;
}) {
  const { to, productName, verifiedCount, remaining } = data;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Thanks for verifying! ${remaining > 0 ? `${remaining} more needed` : '🎉 Product being sourced!'}`,
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          
          <tr>
            <td style="background-color: #10b981; padding: 25px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px;">✓ Verification Complete!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">
                You verified interest in <strong>"${productName}"</strong>
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">Progress</p>
                <p style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">${verifiedCount}/10</p>
                ${remaining > 0 
                  ? `<p style="margin: 10px 0 0; color: #f97316; font-size: 14px;">${remaining} more people needed!</p>`
                  : `<p style="margin: 10px 0 0; color: #10b981; font-size: 14px; font-weight: 600;">🎉 Threshold reached! Being sourced now!</p>`
                }
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                We'll let you know when it's available.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Jeffy Commerce</p>
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
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
