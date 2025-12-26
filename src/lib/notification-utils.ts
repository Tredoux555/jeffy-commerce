// Client-side notification utilities (can be imported in client components)

// Format phone for WhatsApp URL
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('0')) cleaned = '27' + cleaned.slice(1);
  if (cleaned.length === 9) cleaned = '27' + cleaned;
  return cleaned;
}

// Generate WhatsApp URL for a notification
export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

// Milestones that trigger notifications
export const MILESTONES = [1, 3, 5, 7, 9, 10];

// Get milestone emoji
export function getMilestoneEmoji(milestone: number): string {
  switch (milestone) {
    case 1: return '🎉';
    case 3: return '🔥';
    case 5: return '⚡';
    case 7: return '🚀';
    case 9: return '😱';
    case 10: return '🎊';
    default: return '📱';
  }
}
