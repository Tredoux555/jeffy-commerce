import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Customer-facing return request. The customer supplies their order number + the email
// used on the order; we verify the match, then log a PENDING return request for admin
// review. The financial reversal (stock + debt + margin) is done by an admin via
// /api/admin/returns/process — this endpoint only captures the request and the REAL
// customer email (no auto-approval, no money movement).
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumber = (body?.orderNumber as string)?.trim();
    const email = (body?.email as string)?.trim().toLowerCase();
    const reason = (body?.reason as string) || 'other';
    const note = (body?.note as string) || '';

    if (!orderNumber || !email) {
      return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total_cents, status, customer_email')
      .eq('order_number', orderNumber)
      .maybeSingle();

    // Verify the email matches the order (when one was captured). Generic message either
    // way so we never reveal whether an order number exists.
    const matches =
      !!order &&
      (!order.customer_email || (order.customer_email || '').toLowerCase() === email);
    if (!matches) {
      return NextResponse.json(
        { error: 'We could not find an order with that number and email.' },
        { status: 404 }
      );
    }

    if (order.status === 'returned') {
      return NextResponse.json({ error: 'This order has already been returned.' }, { status: 409 });
    }

    // Don't double-log an open request for the same order.
    const { data: existing } = await supabase
      .from('return_requests')
      .select('id, rma_number, status')
      .eq('order_id', order.id)
      .in('status', ['pending', 'approved'])
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyRequested: true,
        rmaNumber: existing[0].rma_number,
        message: 'A return for this order is already in progress.',
      });
    }

    let rma = `RMA${Date.now()}`;
    try {
      const { data: rmaData } = await supabase.rpc('generate_rma_number');
      if (typeof rmaData === 'string' && rmaData) rma = rmaData;
    } catch {
      // fall back to timestamp RMA
    }

    // Pull line items so the request carries what's being returned (items is NOT NULL).
    const { data: lines } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity, unit_price_cents')
      .eq('order_id', order.id);
    const items = (lines || []).map((i: any) => ({
      product_id: i.product_id,
      name: i.product_name,
      quantity: i.quantity,
      price: i.unit_price_cents,
    }));

    const { error: insErr } = await supabase.from('return_requests').insert({
      rma_number: rma,
      order_id: order.id,
      order_number: order.order_number,
      customer_email: email,
      reason,
      reason_details: note || null,
      status: 'pending',
      refund_amount_cents: order.total_cents || 0,
      refund_method: 'original_payment',
      items,
    });
    if (insErr) {
      return NextResponse.json({ error: 'Could not log your return. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rmaNumber: rma,
      message: 'Return request received. Our team will be in touch to arrange collection.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
