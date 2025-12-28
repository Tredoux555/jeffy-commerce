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

Your first friend just agreed to help you get "${productTitle}" FREE on Jeffy!

9 more to go - keep sharing! 💪

Share link: jeffy.co.za/wants`;

    case 3:
      return `🔥 ${creatorName}, you're on fire!

3 friends have agreed to help you get "${productTitle}" FREE!

Only 7 more needed. You've got this! 🚀`;

    case 5:
      return `⚡ HALFWAY THERE ${creatorName}!

5 friends have agreed! "${productTitle}" is getting closer to being FREE!

Just 5 more people needed. Share with more friends! 📲`;

    case 7:
      return `🚀 Almost there ${creatorName}!

7 friends have agreed! "${productTitle}" is SO close to being FREE!

Only 3 more people needed! Final push! 💥`;

    case 9:
      return `😱 ONE MORE ${creatorName}!!!

9 friends have agreed to "${productTitle}"!

Just ONE more person and you get it FREE! 🎁

Share now - you're about to win!`;

    case 10:
      return `🎊🎉 CONGRATULATIONS ${creatorName}! 🎉🎊

You did it! 10 friends agreed!

"${productTitle}" is now being sourced and will be shipped to you FREE!

Thank you for using Jeffy Wants! We'll WhatsApp you with shipping updates soon.

🛒 Jeffy Commerce`;

    default:
      return `Update: ${currentAgrees} people have agreed to "${productTitle}"!`;
  }
}
