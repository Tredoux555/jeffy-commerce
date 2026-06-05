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

// Check if a milestone was just reached
export function checkMilestone(previousCount: number, newCount: number): number | null {
  for (const milestone of MILESTONES) {
    if (previousCount < milestone && newCount >= milestone) {
      return milestone;
    }
  }
  return null;
}

// Message templates for each milestone
export function getMilestoneMessage(
  milestone: number, 
  creatorName: string, 
  productTitle: string,
  currentAgrees: number
): string {
  switch (milestone) {
    case 1:
      return `🎉 Hey ${creatorName}!

Your wish "${productTitle}" is in this week's Jeffy draw.

Every week we draw winners at random and grant their wish free. Good luck! 🍀

jeffy.co.za/wants`;

    case 10:
      return `🏆 NICE ONE ${creatorName}!

Your wish "${productTitle}" was drawn — you won!

We're sourcing it and delivering it to your door, free — and we'll celebrate you on the radio, in the paper, and across social media.

We'll WhatsApp you with the details soon.

🛒 Jeffy Commerce`;

    default:
      return `Update on your Jeffy wish "${productTitle}" — you're in this week's draw. 🍀`;
  }
}
