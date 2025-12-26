/**
 * Email Service
 * 
 * Supports: SendGrid, Resend, or raw SMTP
 * Configure via environment variables
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const DEFAULT_FROM = 'Jeffy <hello@jeffy.co.za>';

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, from = DEFAULT_FROM, replyTo } = options;

  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    return sendWithSendGrid({ to, subject, html, from, replyTo });
  }

  // Try Resend
  if (process.env.RESEND_API_KEY) {
    return sendWithResend({ to, subject, html, from, replyTo });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:', { to, subject });
    console.log('HTML Preview:', html.substring(0, 200) + '...');
    return { success: true };
  }

  return { success: false, error: 'No email provider configured' };
}

async function sendWithSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: options.from?.match(/<(.+)>/)?.[1] || options.from, name: options.from?.match(/^([^<]+)/)?.[1]?.trim() },
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function sendWithResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        reply_to: options.replyTo,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Bulk email sending
export async function sendBulkEmails(
  emails: EmailOptions[],
  options: { delayMs?: number } = {}
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { delayMs = 100 } = options;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result.success) {
      sent++;
    } else {
      failed++;
      if (result.error) errors.push(result.error);
    }
    
    // Rate limiting
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return { sent, failed, errors };
}
