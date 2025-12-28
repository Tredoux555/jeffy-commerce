'use server';

import { createAdminClient } from '@/lib/supabase/server';

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

// Mark notification as sent
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
// 2. npm install twilio
//
// 3. Uncomment and use:
//
// import twilio from 'twilio';
//
// export async function sendViaTwilio(phone: string, message: string) {
//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
//   
//   const formattedPhone = phone.startsWith('27') ? phone : '27' + phone.slice(1);
//   
//   const result = await client.messages.create({
//     body: message,
//     from: process.env.TWILIO_WHATSAPP_FROM,
//     to: `whatsapp:+${formattedPhone}`
//   });
//   
//   return result;
// }
//
// 4. In wants-service, call sendViaTwilio() instead of queueNotification()
// ============================================
