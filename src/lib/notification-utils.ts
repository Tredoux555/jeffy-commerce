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

Your first backer just got behind your wish "${productTitle}" on Jeffy!

Keep sharing to prove the demand. 💪

Share link: jeffy.co.za/wants`;

    case 3:
      return `🔥 ${creatorName}, you're on fire!

3 backers are behind your wish "${productTitle}"!

Keep it going — the more backers, the sooner we source it. 🚀`;

    case 5:
      return `⚡ Momentum building, ${creatorName}!

5 backers are behind "${productTitle}"! Demand is adding up fast.

Share with more friends to push it up the list. 📲`;

    case 7:
      return `🚀 Going strong ${creatorName}!

7 backers are behind "${productTitle}"!

Keep sharing — popular wishes get sourced first. 💥`;

    case 9:
      return `😱 Almost a crowd ${creatorName}!

9 backers are behind "${productTitle}"!

One more push — share now to keep the momentum going! 🎁`;

    case 10:
      return `🎊🎉 NICE ONE ${creatorName}! 🎉🎊

Your wish "${productTitle}" hit its goal with 10 backers!

You proved the demand — we're sourcing it and adding it to the catalogue. Your wish is also entered into this month's free draw, where one wish is granted free every month.

We'll WhatsApp you with updates soon.

🛒 Jeffy Commerce`;

    default:
      return `Update: ${currentAgrees} backers are behind "${productTitle}"!`;
  }
}
