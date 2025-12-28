/**
 * SMS Notification Service
 * 
 * Supports: Clickatell, Twilio, BulkSMS (SA providers)
 * Configure via environment variables
 */

interface SMSOptions {
  to: string;
  message: string;
}

export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('0')) cleaned = '+27' + cleaned.substring(1);
  else if (cleaned.startsWith('27')) cleaned = '+' + cleaned;
  else if (!cleaned.startsWith('+')) cleaned = '+27' + cleaned;
  return cleaned;
}

export async function sendSMS(options: SMSOptions): Promise<{ success: boolean; error?: string }> {
  const phone = normalizePhoneNumber(options.to);

  if (process.env.CLICKATELL_API_KEY) {
    return sendWithClickatell(phone, options.message);
  }
  if (process.env.TWILIO_ACCOUNT_SID) {
    return sendWithTwilio(phone, options.message);
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 SMS:', { to: phone, message: options.message });
    return { success: true };
  }
  return { success: false, error: 'No SMS provider configured' };
}

async function sendWithClickatell(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://platform.clickatell.com/messages/http/send', {
      method: 'POST',
      headers: { 'Authorization': process.env.CLICKATELL_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message, to: [to.replace('+', '')] }),
    });
    return res.ok ? { success: true } : { success: false, error: 'Send failed' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function sendWithTwilio(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER || '+15005550006';
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: from, Body: message }),
    });
    return res.ok ? { success: true } : { success: false, error: 'Send failed' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export const SMSTemplates = {
  orderConfirmation: (orderNumber: string) => `Jeffy: Order #${orderNumber} confirmed! Track at jeffy.co.za/track`,
  orderShipped: (orderNumber: string, tracking: string) => `Jeffy: Order #${orderNumber} shipped! Track: ${tracking}`,
  orderDelivered: (orderNumber: string) => `Jeffy: Order #${orderNumber} delivered! Enjoy! 🎉`,
  outForDelivery: (orderNumber: string) => `Jeffy: Order #${orderNumber} out for delivery today!`,
  welcomeBonus: (code: string) => `Welcome to Jeffy! 🎉 Use ${code} for 10% off. jeffy.co.za`,
  abandonedCart: (code: string) => `Jeffy: Complete your order with ${code} for 10% off! jeffy.co.za/cart`,
  wantSuccess: (product: string) => `Jeffy: 🎉 Your want for "${product}" hit 10 agrees! Sourcing now.`,
  otpCode: (code: string) => `Your Jeffy code: ${code}. Valid 10 min.`,
};
