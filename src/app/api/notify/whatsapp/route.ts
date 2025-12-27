import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  formatPhoneForWhatsApp,
  generateWhatsAppUrl,
  getOrderConfirmedMessage,
  getOutForDeliveryMessage,
  getDeliveredMessage,
  getWantApprovedMessage,
} from '@/lib/whatsapp';

type NotificationType = 'order_confirmed' | 'out_for_delivery' | 'delivered' | 'want_approved';

export async function POST(request: NextRequest) {
  try {
    const { type, orderId, wantId, phone, data } = await request.json();

    if (!type || !phone) {
      return NextResponse.json({ error: 'Type and phone required' }, { status: 400 });
    }

    const supabase = await createClient();
    let message = '';
    let recipientName = data?.customerName || 'Customer';

    switch (type as NotificationType) {
      case 'order_confirmed':
        message = getOrderConfirmedMessage(data.orderNumber, recipientName);
        break;
      
      case 'out_for_delivery':
        message = getOutForDeliveryMessage(data.orderNumber, recipientName, data.partnerName);
        break;
      
      case 'delivered':
        message = getDeliveredMessage(data.orderNumber, recipientName);
        break;
      
      case 'want_approved':
        message = getWantApprovedMessage(data.wantTitle, recipientName, data.productUrl);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    const whatsappUrl = generateWhatsAppUrl(phone, message);

    // Log notification (optional - for tracking)
    await supabase.from('notifications').insert({
      type,
      order_id: orderId || null,
      want_id: wantId || null,
      phone: formatPhoneForWhatsApp(phone),
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
    }).catch(() => {}); // Ignore if table doesn't exist

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message,
      phone: formatPhoneForWhatsApp(phone),
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
