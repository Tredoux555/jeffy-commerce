import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// PayFast server IPs for validation
const PAYFAST_IPS = [
  '197.97.145.144',
  '197.97.145.145', 
  '197.97.145.146',
  '197.97.145.147',
  '197.97.145.148',
  '41.74.179.194',
  '41.74.179.195',
  '41.74.179.196',
  '41.74.179.197',
  '41.74.179.198',
];

// Validate PayFast signature
function validateSignature(data: Record<string, string>, signature: string, passphrase?: string): boolean {
  // Build parameter string
  const params = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  const stringToSign = passphrase ? `${params}&passphrase=${encodeURIComponent(passphrase)}` : params;
  const calculatedSignature = crypto.createHash('md5').update(stringToSign).digest('hex');
  
  return calculatedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature validation
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('PayFast webhook received:', data);

    // Validate IP (optional in sandbox)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0] || 'unknown';
    
    // In production, uncomment this:
    // if (!PAYFAST_IPS.includes(clientIp)) {
    //   console.error('Invalid PayFast IP:', clientIp);
    //   return NextResponse.json({ error: 'Invalid source IP' }, { status: 403 });
    // }

    // Validate signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    if (!validateSignature(data, data.signature, passphrase)) {
      console.error('Invalid PayFast signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract order info
    const orderId = data.m_payment_id; // We send order ID as m_payment_id
    const paymentStatus = data.payment_status;
    const amountGross = data.amount_gross;
    const pfPaymentId = data.pf_payment_id;

    if (!orderId) {
      console.error('No order ID in webhook');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check payment status
    if (paymentStatus === 'COMPLETE') {
      // Update order to 'paid'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_reference: pfPaymentId,
          paid_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      console.log(`Order ${orderId} marked as paid`);

      // AUTO-ASSIGN TO ZONE PARTNER
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const assignResponse = await fetch(`${siteUrl}/api/orders/auto-assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
        const assignResult = await assignResponse.json();
        console.log(`Order ${orderId} assignment:`, assignResult);
      } catch (e) {
        console.error(`Failed to auto-assign order ${orderId}:`, e);
      }

    } else if (paymentStatus === 'CANCELLED') {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      
      console.log(`Order ${orderId} cancelled`);
    }

    // PayFast expects 200 OK response
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('PayFast webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PayFast may send GET for testing
export async function GET() {
  return NextResponse.json({ status: 'PayFast webhook endpoint active' });
}
