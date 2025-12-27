// WhatsApp notification service for Jeffy
// Uses wa.me links for now, can upgrade to WhatsApp Business API later

const WHATSAPP_TEMPLATES = {
  orderConfirmed: (orderNumber: string, customerName: string) => 
    `🎉 Hi ${customerName}!

Your Jeffy order *${orderNumber}* has been confirmed!

We're preparing your order and will notify you when it's on its way.

Track your order: https://jeffy.co.za/track/${orderNumber}

Thanks for shopping with Jeffy! 🛒`,

  outForDelivery: (orderNumber: string, customerName: string, partnerName?: string) =>
    `🚚 ${customerName}, your order is on the way!

Order *${orderNumber}* is out for delivery${partnerName ? ` with ${partnerName}` : ''}.

📍 *Please enable your GPS* for smooth delivery. If you're not available, delivery may be deferred to tomorrow.

Track: https://jeffy.co.za/track/${orderNumber}`,

  delivered: (orderNumber: string, customerName: string) =>
    `✅ Delivered!

Hi ${customerName}, your order *${orderNumber}* has been delivered.

Thank you for shopping with Jeffy! 

Leave us a review: https://jeffy.co.za/review/${orderNumber}`,

  wantApproved: (wantTitle: string, creatorName: string, productUrl: string) =>
    `🎁 Amazing news ${creatorName}!

Your want "${wantTitle}" reached 10 agrees!

We're sourcing your product now. You'll receive:
• 1 FREE for you
• 10 to sell and keep the profit

View your product: ${productUrl}

Thanks for being part of Jeffy Wants! 🚀`,

  wantProgress: (wantTitle: string, currentAgrees: number, creatorName: string, shareUrl: string) =>
    `📊 Update on your want, ${creatorName}!

"${wantTitle}" now has *${currentAgrees}/10* agrees!

${10 - currentAgrees} more to go! Share again to speed it up:
${shareUrl}`,
};

/**
 * Format SA phone number for WhatsApp
 * Converts 0XX XXX XXXX to 27XXXXXXXXX
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 27
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.slice(1);
  }
  
  // If doesn't have country code, add 27
  if (cleaned.length === 9) {
    cleaned = '27' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate WhatsApp wa.me URL
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Get message for order confirmed
 */
export function getOrderConfirmedMessage(orderNumber: string, customerName: string): string {
  return WHATSAPP_TEMPLATES.orderConfirmed(orderNumber, customerName);
}

/**
 * Get message for out for delivery
 */
export function getOutForDeliveryMessage(
  orderNumber: string, 
  customerName: string, 
  partnerName?: string
): string {
  return WHATSAPP_TEMPLATES.outForDelivery(orderNumber, customerName, partnerName);
}

/**
 * Get message for delivered
 */
export function getDeliveredMessage(orderNumber: string, customerName: string): string {
  return WHATSAPP_TEMPLATES.delivered(orderNumber, customerName);
}

/**
 * Get message for want approved (reached 10 agrees)
 */
export function getWantApprovedMessage(
  wantTitle: string, 
  creatorName: string, 
  productUrl: string
): string {
  return WHATSAPP_TEMPLATES.wantApproved(wantTitle, creatorName, productUrl);
}

/**
 * Get message for want progress update
 */
export function getWantProgressMessage(
  wantTitle: string,
  currentAgrees: number,
  creatorName: string,
  shareUrl: string
): string {
  return WHATSAPP_TEMPLATES.wantProgress(wantTitle, currentAgrees, creatorName, shareUrl);
}

export { WHATSAPP_TEMPLATES };
