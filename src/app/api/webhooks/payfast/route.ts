import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    
    params.forEach((value, key) => {
      data[key] = value;
    });

    // Verify signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const signature = data.signature;
    delete data.signature;

    let signatureString = Object.entries(data)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`)
      .join('&');

    if (passphrase) {
      signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    if (calculatedSignature !== signature) {
      console.error('PayFast signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const orderId = data.m_payment_id;
    const paymentStatus = data.payment_status;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    if (paymentStatus === 'COMPLETE') {
      // Update order status
      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_reference: data.pf_payment_id,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      console.log(`Order ${orderId} payment completed`);
    } else if (paymentStatus === 'CANCELLED') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'cancelled',
          status: 'cancelled',
        })
        .eq('id', orderId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayFast webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
