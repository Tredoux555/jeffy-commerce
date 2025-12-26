'use server';

import { createAdminClient } from '@/lib/supabase/server';

// Milestones that trigger notifications
export const MILESTONES = [1, 3, 5, 7, 9, 10];

// Message templates for each milestone
export function getMilestoneMessage(
  milestone: number, 
  creatorName: string, 
  productTitle: string,
  currentAgrees: number
): string {
  const remaining = 10 - currentAgrees;
  
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

// Check if a milestone was just reached
export function checkMilestone(previousCount: number, newCount: number): number | null {
  for (const milestone of MILESTONES) {
    if (previousCount < milestone && newCount >= milestone) {
      return milestone;
    }
  }
  return null;
}

// Queue a notification
export async function queueNotification(
  wantId: string,
  recipientPhone: string,
  recipientName: string,
  milestone: number,
  message: string
) {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('want_notifications')
      .insert({
        want_id: wantId,
        recipient_phone: recipientPhone,
        recipient_name: recipientName,
        milestone,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, notification: data };
  } catch (err: any) {
    console.error('Failed to queue notification:', err);
    return { success: false, error: err.message };
  }
}

// Get pending notifications
export async function getPendingNotifications() {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('want_notifications')
      .select(`
        *,
        wants (title, creator_name, creator_phone)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, notifications: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, notifications: [] };
  }
}

// Mark notification as sent (manual)
export async function markNotificationSent(notificationId: string, sentVia: string = 'manual') {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('want_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_via: sentVia
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, notification: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

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

// ============================================
// FUTURE: Twilio/WATI Integration
// ============================================
// 
// When ready to add automatic sending:
// 
// 1. Add to .env:
//    TWILIO_ACCOUNT_SID=xxx
//    TWILIO_AUTH_TOKEN=xxx
//    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
//
// 2. Uncomment and use:
//
// import twilio from 'twilio';
//
// export async function sendViaTwilio(phone: string, message: string) {
//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
//   
//   const result = await client.messages.create({
//     body: message,
//     from: process.env.TWILIO_WHATSAPP_FROM,
//     to: `whatsapp:+${formatPhoneForWhatsApp(phone)}`
//   });
//   
//   return result;
// }
//
// 3. Call sendViaTwilio() instead of queueing for manual send
// ============================================
