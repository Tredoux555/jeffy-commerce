/**
 * Email Sending Service
 * Supports: Resend, SendGrid, or console logging for dev
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send email using configured provider
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const from = options.from || process.env.EMAIL_FROM || 'Jeffy <hello@jeffy.co.za>';
  
  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    return sendWithResend({ ...options, from });
  }
  
  // Try SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return sendWithSendGrid({ ...options, from });
  }
  
  // Fallback: Log to console (dev mode)
  console.log('📧 Email would be sent:');
  console.log('  To:', options.to);
  console.log('  Subject:', options.subject);
  console.log('  From:', from);
  console.log('  (Configure RESEND_API_KEY or SENDGRID_API_KEY to send real emails)');
  
  return { success: true, messageId: `dev-${Date.now()}` };
}

// Resend provider
async function sendWithResend(options: SendEmailOptions & { from: string }): Promise<EmailResult> {
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
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, messageId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// SendGrid provider
async function sendWithSendGrid(options: SendEmailOptions & { from: string }): Promise<EmailResult> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: options.from.match(/<(.+)>/)?.[1] || options.from },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.errors?.[0]?.message || 'Failed to send email' };
    }

    return { success: true, messageId: response.headers.get('x-message-id') || `sg-${Date.now()}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper functions for common emails
export async function sendOrderConfirmation(email: string, orderData: any) {
  const { orderConfirmationEmail } = await import('./templates');
  return sendEmail({
    to: email,
    subject: `Order Confirmed! #${orderData.orderNumber}`,
    html: orderConfirmationEmail(orderData),
  });
}

export async function sendShippingNotification(email: string, data: any) {
  const { shippingNotificationEmail } = await import('./templates');
  return sendEmail({
    to: email,
    subject: `Your Order Has Shipped! #${data.orderNumber}`,
    html: shippingNotificationEmail(data),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const { welcomeEmail } = await import('./templates');
  return sendEmail({
    to: email,
    subject: 'Welcome to Jeffy! 🎉 Here\'s 10% off',
    html: welcomeEmail({ name, email }),
  });
}

export async function sendAbandonedCartEmail(email: string, data: any) {
  const { abandonedCartEmail } = await import('./templates');
  return sendEmail({
    to: email,
    subject: 'You left something behind! 🛒',
    html: abandonedCartEmail(data),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const { passwordResetEmail } = await import('./templates');
  return sendEmail({
    to: email,
    subject: 'Reset your Jeffy password',
    html: passwordResetEmail({ name, resetUrl }),
  });
}
