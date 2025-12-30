import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// WhatsApp message templates
const TEMPLATES = {
  new_order: {
    emoji: '📦',
    format: (data: any) => 
      `📦 New Jeffy Order! #${data.orderNumber}. Deliver to: ${data.address}. Earn R${data.earnings}.`
  },
  disclosure_sent: {
    emoji: '📄',
    format: (data: any) => 
      `📄 Hi ${data.name}! Application approved. Disclosure doc sent by email. 14 day wait starts now.`
  },
  low_stock: {
    emoji: '⚠️',
    format: (data: any) => 
      `⚠️ Low stock: ${data.product} (${data.remaining} left)`
  },
  payout_sent: {
    emoji: '💰',
    format: (data: any) => 
      `💰 R${data.amount} sent for ${data.count} deliveries!`
  },
  order_assigned: {
    emoji: '🎯',
    format: (data: any) => 
      `🎯 Order #${data.orderNumber} assigned to you! Customer: ${data.customerName}, ${data.address}`
  },
  agreement_ready: {
    emoji: '✍️',
    format: (data: any) => 
      `✍️ Hi ${data.name}! Your 14-day wait is complete. You can now sign your Zone Partner agreement.`
  },
  training_reminder: {
    emoji: '📚',
    format: (data: any) => 
      `📚 Hi ${data.name}! Don't forget to complete your training to start receiving orders.`
  },
  activation_complete: {
    emoji: '🎉',
    format: (data: any) => 
      `🎉 Congratulations ${data.name}! You're now LIVE as a Zone Partner. Orders in your zone will be sent to you!`
  }
};

type TemplateType = keyof typeof TEMPLATES;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, phone, data, partnerId } = body;

    // Validate template type
    if (!type || !TEMPLATES[type as TemplateType]) {
      return NextResponse.json(
        { success: false, error: `Invalid template type. Available: ${Object.keys(TEMPLATES).join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get phone number - either provided or fetch from partner
    let recipientPhone = phone;
    
    if (!recipientPhone && partnerId) {
      const { data: partner, error } = await supabase
        .from('zone_partners')
        .select('phone, full_name')
        .eq('id', partnerId)
        .single();
      
      if (error || !partner) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }
      
      recipientPhone = partner.phone;
      // Add partner name to data if not provided
      if (!data.name) {
        data.name = partner.full_name;
      }
    }

    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number required (provide phone or partnerId)' },
        { status: 400 }
      );
    }

    // Format the message
    const template = TEMPLATES[type as TemplateType];
    const message = template.format(data);

    // Clean phone number (remove spaces, ensure country code)
    let cleanPhone = recipientPhone.replace(/\s+/g, '').replace(/^0/, '27');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    // Send via WhatsApp Business API
    // Option 1: Using Meta's WhatsApp Business API
    // Option 2: Using a service like Twilio, MessageBird, or WATI
    
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappApiUrl && whatsappToken) {
      // Meta WhatsApp Business API format
      const response = await fetch(
        `${whatsappApiUrl}/${whatsappPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone.replace('+', ''),
            type: 'text',
            text: { body: message }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        
        // Log failed notification for retry
        await logNotification(supabase, type, cleanPhone, message, 'failed', errorData);
        
        return NextResponse.json(
          { success: false, error: 'Failed to send WhatsApp message', details: errorData },
          { status: 500 }
        );
      }

      const result = await response.json();
      
      // Log successful notification
      await logNotification(supabase, type, cleanPhone, message, 'sent', result);

      return NextResponse.json({
        success: true,
        message: message,
        messageId: result.messages?.[0]?.id
      });
    } else {
      // No WhatsApp API configured - log for manual sending or dev mode
      console.log('WhatsApp notification (API not configured):');
      console.log(`To: ${cleanPhone}`);
      console.log(`Message: ${message}`);
      
      // Log the notification anyway
      await logNotification(supabase, type, cleanPhone, message, 'pending_manual');

      return NextResponse.json({
        success: true,
        message: message,
        note: 'WhatsApp API not configured - logged for manual sending',
        phone: cleanPhone
      });
    }

  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Log notifications to database for tracking/retry
async function logNotification(
  supabase: any,
  type: string, 
  phone: string, 
  message: string, 
  status: string,
  response?: any
) {
  try {
    await supabase
      .from('notifications')
      .insert({
        type,
        channel: 'whatsapp',
        recipient: phone,
        message,
        status,
        response_data: response,
        created_at: new Date().toISOString()
      });
  } catch (err) {
    // Don't fail the main request if logging fails
    console.error('Failed to log notification:', err);
  }
}

// GET endpoint to list available templates
export async function GET() {
  const templateList = Object.entries(TEMPLATES).map(([key, value]) => ({
    type: key,
    emoji: value.emoji,
    example: value.format({
      orderNumber: 'JC-001',
      address: '123 Main St, Cape Town',
      earnings: '45.00',
      name: 'John',
      product: 'Sample Product',
      remaining: '5',
      amount: '500.00',
      count: '12',
      customerName: 'Jane Doe'
    })
  }));

  return NextResponse.json({
    templates: templateList,
    usage: {
      method: 'POST',
      body: {
        type: 'template_name',
        phone: '+27123456789 (or provide partnerId)',
        partnerId: 'uuid (optional, will fetch phone from partner)',
        data: '{ template-specific data }'
      }
    }
  });
}
