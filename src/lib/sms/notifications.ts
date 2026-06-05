/**
 * SMS Notifications
 * Ready for Clickatell, Twilio, or BulkSMS
 * 
 * To activate: Add env vars:
 * - SMS_PROVIDER=clickatell|twilio|bulksms
 * - CLICKATELL_API_KEY or TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
 */

interface SMSData {
  to: string; // Phone number
  message: string;
}

// Normalize SA phone numbers
export function formatSAPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('27')) {
    cleaned = '27' + cleaned;
  }
  return '+' + cleaned;
}

// SMS Templates
export const smsTemplates = {
  orderConfirmed: (orderNumber: string) => 
    `Jeffy: Your order #${orderNumber} is confirmed! We'll notify you when it ships. Track: jeffy.co.za/track`,
  
  orderShipped: (orderNumber: string, trackingNumber: string) => 
    `Jeffy: Order #${orderNumber} shipped! Tracking: ${trackingNumber}. Track: jeffy.co.za/track`,
  
  outForDelivery: (orderNumber: string) => 
    `Jeffy: Order #${orderNumber} is out for delivery today! 🚚`,
  
  delivered: (orderNumber: string) => 
    `Jeffy: Order #${orderNumber} delivered! Enjoy your purchase. Leave a review: jeffy.co.za/review`,
  
  wantSuccess: (productName: string) =>
    `Jeffy: 🏆 You won this week's draw! Your wish "${productName}" is being sourced and delivered to you free. We'll be in touch!`,
  
  otp: (code: string) => 
    `Your Jeffy verification code is: ${code}. Valid for 5 minutes.`,
  
  abandonedCart: (discountCode?: string) => 
    discountCode 
      ? `Jeffy: You left items in your cart! Use code ${discountCode} for 10% off. Shop: jeffy.co.za`
      : `Jeffy: You left items in your cart! Complete your order: jeffy.co.za`,
};

// Send SMS (framework - plug in your provider)
export async function sendSMS(data: SMSData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const provider = process.env.SMS_PROVIDER;
  const formattedPhone = formatSAPhone(data.to);
  
  console.log(`[SMS] Sending to ${formattedPhone}: ${data.message}`);
  
  if (!provider) {
    console.log('[SMS] No provider configured, skipping');
    return { success: true, messageId: 'mock_' + Date.now() };
  }

  try {
    switch (provider) {
      case 'clickatell':
        return await sendClickatell(formattedPhone, data.message);
      case 'twilio':
        return await sendTwilio(formattedPhone, data.message);
      case 'bulksms':
        return await sendBulkSMS(formattedPhone, data.message);
      default:
        return { success: false, error: 'Unknown SMS provider' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function sendClickatell(to: string, message: string) {
  const apiKey = process.env.CLICKATELL_API_KEY;
  const response = await fetch('https://platform.clickatell.com/messages', {
    method: 'POST',
    headers: {
      'Authorization': apiKey!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: message, to: [to] }),
  });
  const data = await response.json();
  return { success: response.ok, messageId: data.messages?.[0]?.apiMessageId };
}

async function sendTwilio(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from!, Body: message }),
  });
  const data = await response.json();
  return { success: response.ok, messageId: data.sid };
}

async function sendBulkSMS(to: string, message: string) {
  const username = process.env.BULKSMS_USERNAME;
  const password = process.env.BULKSMS_PASSWORD;
  
  const response = await fetch('https://api.bulksms.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, body: message }),
  });
  const data = await response.json();
  return { success: response.ok, messageId: data.id };
}
