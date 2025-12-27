import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorType, errorMessage, errorDetails, pageUrl, customerEmail, customerPhone } = body;

    // Log to database
    const { error } = await supabase.from('error_logs').insert({
      error_type: errorType || 'unknown',
      error_message: errorMessage || 'No message',
      error_details: errorDetails || {},
      page_url: pageUrl || '',
      user_agent: request.headers.get('user-agent') || '',
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
    });

    if (error) {
      console.error('Failed to log error:', error);
    }

    // Queue WhatsApp notification to admin
    const adminPhone = process.env.ADMIN_WHATSAPP || '27832361';
    try {
      await supabase.from('notification_queue').insert({
        phone: adminPhone,
        message: `🚨 SITE ERROR\n\nType: ${errorType}\nPage: ${pageUrl}\nError: ${errorMessage?.substring(0, 200)}\n\nCustomer: ${customerEmail || customerPhone || 'Unknown'}\n\nCheck /admin for details.`,
        status: 'pending',
        notification_type: 'error_alert',
      });
    } catch (e) {
      console.log('Could not queue WhatsApp notification');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error logging failed:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
