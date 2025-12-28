/**
 * Email Template System for Jeffy Commerce
 * 
 * To activate: Add these env vars:
 * - RESEND_API_KEY (recommended) or
 * - SENDGRID_API_KEY
 * - EMAIL_FROM (e.g., "Jeffy <hello@jeffy.co.za>")
 */

import { formatCurrency } from '@/lib/utils';

// Base wrapper for all emails
export function baseEmailTemplate(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jeffy Commerce</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b35,#f7931e);padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">Jeffy</h1>
              <p style="margin:5px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Eish, These Prices! 🔥</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 10px;color:#6b7280;font-size:14px;">Questions? Reply to this email or contact us at hello@jeffy.co.za</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Jeffy Commerce (Pty) Ltd. All rights reserved.</p>
              <p style="margin:10px 0 0;color:#9ca3af;font-size:12px;">
                <a href="https://jeffy.co.za/privacy" style="color:#9ca3af;">Privacy Policy</a> • 
                <a href="https://jeffy.co.za/wants/terms" style="color:#9ca3af;">Terms & Conditions</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Button component
function emailButton(text: string, url: string, color: string = '#ff6b35'): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:25px 0;">
      <tr>
        <td style="background-color:${color};border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Order item row
function orderItemRow(item: { name: string; quantity: number; price: number; image?: string }): string {
  return `
    <tr>
      <td style="padding:15px 0;border-bottom:1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="60" style="vertical-align:top;">
              <div style="width:50px;height:50px;background-color:#f3f4f6;border-radius:8px;text-align:center;line-height:50px;">📦</div>
            </td>
            <td style="vertical-align:top;padding-left:15px;">
              <p style="margin:0;font-weight:600;color:#1f2937;">${item.name}</p>
              <p style="margin:5px 0 0;color:#6b7280;font-size:14px;">Qty: ${item.quantity}</p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <p style="margin:0;font-weight:600;color:#1f2937;">${formatCurrency(item.price)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// ============ EMAIL TEMPLATES ============

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  shippingAddress: string;
  trackingUrl?: string;
}

// Order Confirmation Email
export function orderConfirmationEmail(data: OrderEmailData): string {
  const itemsHTML = data.items.map(orderItemRow).join('');
  
  const content = `
    <h2 style="margin:0 0 10px;color:#1f2937;font-size:24px;">Order Confirmed! 🎉</h2>
    <p style="margin:0 0 25px;color:#6b7280;font-size:16px;">Thanks for your order, ${data.customerName}!</p>
    
    <div style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:15px;margin-bottom:25px;">
      <p style="margin:0;color:#166534;font-size:14px;">
        <strong>Order #${data.orderNumber}</strong> has been received and is being processed.
      </p>
    </div>
    
    <h3 style="margin:0 0 15px;color:#1f2937;font-size:18px;">Order Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsHTML}
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Subtotal</td>
        <td style="padding:8px 0;text-align:right;color:#1f2937;">${formatCurrency(data.subtotal)}</td>
      </tr>
      ${data.discount ? `
      <tr>
        <td style="padding:8px 0;color:#16a34a;">Discount</td>
        <td style="padding:8px 0;text-align:right;color:#16a34a;">-${formatCurrency(data.discount)}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Shipping</td>
        <td style="padding:8px 0;text-align:right;color:#1f2937;">${data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping)}</td>
      </tr>
      <tr>
        <td style="padding:15px 0;border-top:2px solid #1f2937;font-weight:bold;font-size:18px;color:#1f2937;">Total</td>
        <td style="padding:15px 0;border-top:2px solid #1f2937;text-align:right;font-weight:bold;font-size:18px;color:#1f2937;">${formatCurrency(data.total)}</td>
      </tr>
    </table>
    
    <h3 style="margin:30px 0 10px;color:#1f2937;font-size:18px;">Shipping Address</h3>
    <p style="margin:0;color:#6b7280;line-height:1.6;">${data.shippingAddress.replace(/\n/g, '<br>')}</p>
    
    ${emailButton('Track Your Order', data.trackingUrl || 'https://jeffy.co.za/track')}
    
    <p style="margin:25px 0 0;color:#6b7280;font-size:14px;">We'll send you another email when your order ships.</p>
  `;
  
  return baseEmailTemplate(content, `Order #${data.orderNumber} confirmed!`);
}

// Shipping Notification Email
export function shippingNotificationEmail(data: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  estimatedDelivery?: string;
}): string {
  const content = `
    <h2 style="margin:0 0 10px;color:#1f2937;font-size:24px;">Your Order is On Its Way! 🚚</h2>
    <p style="margin:0 0 25px;color:#6b7280;font-size:16px;">Great news, ${data.customerName}! Your order has shipped.</p>
    
    <div style="background-color:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:20px;margin-bottom:25px;">
      <p style="margin:0 0 10px;color:#1e40af;font-size:14px;"><strong>Order #${data.orderNumber}</strong></p>
      <p style="margin:0 0 5px;color:#1e40af;font-size:14px;">Carrier: ${data.carrier}</p>
      <p style="margin:0;color:#1e40af;font-size:14px;">Tracking: <strong>${data.trackingNumber}</strong></p>
      ${data.estimatedDelivery ? `<p style="margin:10px 0 0;color:#1e40af;font-size:14px;">Expected delivery: <strong>${data.estimatedDelivery}</strong></p>` : ''}
    </div>
    
    ${emailButton('Track Your Package', data.trackingUrl)}
    
    <p style="margin:25px 0 0;color:#6b7280;font-size:14px;">Click the button above to see real-time updates on your delivery.</p>
  `;
  
  return baseEmailTemplate(content, `Your order #${data.orderNumber} has shipped!`);
}

// Welcome Email
export function welcomeEmail(data: { name: string; email: string }): string {
  const content = `
    <h2 style="margin:0 0 10px;color:#1f2937;font-size:24px;">Welcome to Jeffy! 🎉</h2>
    <p style="margin:0 0 25px;color:#6b7280;font-size:16px;">Hey ${data.name}, welcome to the family!</p>
    
    <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">
      You've just joined thousands of smart shoppers who get quality products from China at unbeatable prices. No middlemen, just savings!
    </p>
    
    <h3 style="margin:25px 0 15px;color:#1f2937;font-size:18px;">Here's what you can do:</h3>
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;color:#1f2937;"><strong>🛍️ Shop Amazing Deals</strong></p>
          <p style="margin:5px 0 0;color:#6b7280;font-size:14px;">Browse our catalog of quality products at wholesale prices.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;color:#1f2937;"><strong>🎁 Get FREE Products</strong></p>
          <p style="margin:5px 0 0;color:#6b7280;font-size:14px;">Create a "Want" and get it FREE when 10 friends agree!</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;color:#1f2937;"><strong>💰 Earn Rewards</strong></p>
          <p style="margin:5px 0 0;color:#6b7280;font-size:14px;">Collect points on every purchase and level up for bigger discounts.</p>
        </td>
      </tr>
    </table>
    
    ${emailButton('Start Shopping', 'https://jeffy.co.za/products')}
    
    <p style="margin:25px 0 0;color:#6b7280;font-size:14px;">Use code <strong style="color:#ff6b35;">WELCOME10</strong> for 10% off your first order!</p>
  `;
  
  return baseEmailTemplate(content, `Welcome to Jeffy, ${data.name}! Here's 10% off your first order.`);
}

// Abandoned Cart Email
export function abandonedCartEmail(data: {
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  cartTotal: number;
  recoveryUrl: string;
  discountCode?: string;
  discountPercent?: number;
}): string {
  const itemsHTML = data.items.slice(0, 3).map(orderItemRow).join('');
  
  const content = `
    <h2 style="margin:0 0 10px;color:#1f2937;font-size:24px;">You Left Something Behind! 🛒</h2>
    <p style="margin:0 0 25px;color:#6b7280;font-size:16px;">Hey ${data.customerName}, your cart is waiting for you.</p>
    
    ${data.discountCode ? `
    <div style="background-color:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:15px;margin-bottom:25px;text-align:center;">
      <p style="margin:0;color:#92400e;font-size:16px;">
        Use code <strong style="font-size:20px;">${data.discountCode}</strong> for ${data.discountPercent}% off!
      </p>
    </div>
    ` : ''}
    
    <h3 style="margin:0 0 15px;color:#1f2937;font-size:18px;">Your Cart</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsHTML}
    </table>
    ${data.items.length > 3 ? `<p style="color:#6b7280;font-size:14px;">...and ${data.items.length - 3} more item(s)</p>` : ''}
    
    <p style="margin:20px 0;font-size:18px;"><strong>Cart Total: ${formatCurrency(data.cartTotal)}</strong></p>
    
    ${emailButton('Complete Your Order', data.recoveryUrl)}
    
    <p style="margin:25px 0 0;color:#6b7280;font-size:14px;">Your cart items won't be reserved forever. Complete your order before they're gone!</p>
  `;
  
  return baseEmailTemplate(content, `You left ${data.items.length} item(s) in your cart!`);
}

// Password Reset Email
export function passwordResetEmail(data: { name: string; resetUrl: string }): string {
  const content = `
    <h2 style="margin:0 0 10px;color:#1f2937;font-size:24px;">Reset Your Password</h2>
    <p style="margin:0 0 25px;color:#6b7280;font-size:16px;">Hey ${data.name}, we received a request to reset your password.</p>
    
    ${emailButton('Reset Password', data.resetUrl)}
    
    <p style="margin:25px 0 0;color:#6b7280;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `;
  
  return baseEmailTemplate(content, 'Reset your Jeffy password');
}
