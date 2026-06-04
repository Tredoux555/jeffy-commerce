import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Process a full-order return for a reseller-routed order. Cleanly unwinds the sale:
//   • restores the reseller's stock-on-hand,
//   • re-adds the wholesale debt (the returned stock is back with the reseller),
//   • reverses the margin (claws back a fallback credit; flags a real-time PayFast split),
//   • writes a ledger 'return' entry, records an RMA, and marks the order returned.
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();
    const orderId = body?.orderId as string | undefined;
    const reason = (body?.reason as string) || 'other';
    const refundMethod = (body?.refundMethod as string) || 'original_payment';
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .select('id, order_number, total_cents, status, distributor_id, jeffy_wholesale_cents, seller_margin_cents, split_to_merchant_id, customer_email')
      .eq('id', orderId)
      .single();
    if (oErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'returned') {
      return NextResponse.json({ error: 'Order already returned' }, { status: 409 });
    }

    const { data: lines } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity, unit_price_cents')
      .eq('order_id', orderId);
    const items = (lines || []) as Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price_cents: number;
    }>;

    let marginClawbackNote: string | null = null;

    if (order.distributor_id) {
      // Restore stock-on-hand for each line.
      for (const ln of items) {
        const { data: st } = await supabase
          .from('distributor_stock')
          .select('id, qty_on_hand, qty_sold_total')
          .eq('distributor_id', order.distributor_id)
          .eq('product_id', ln.product_id)
          .maybeSingle();
        if (st) {
          await supabase
            .from('distributor_stock')
            .update({
              qty_on_hand: (st.qty_on_hand || 0) + ln.quantity,
              qty_sold_total: Math.max((st.qty_sold_total || 0) - ln.quantity, 0),
              updated_at: new Date().toISOString(),
            })
            .eq('id', st.id);
        }
      }

      const wholesale = order.jeffy_wholesale_cents || 0;
      const margin = order.seller_margin_cents || 0;

      const { data: dist } = await supabase
        .from('distributors')
        .select('balance_owed_cents, margin_payable_cents')
        .eq('id', order.distributor_id)
        .single();

      const newBalance = (dist?.balance_owed_cents || 0) + wholesale;

      // Reverse margin: a fallback credit is clawed back; a real-time PayFast split has
      // already paid the seller, so flag it for manual recovery.
      let newPayable = dist?.margin_payable_cents || 0;
      if (!order.split_to_merchant_id && margin > 0) {
        newPayable = Math.max(newPayable - margin, 0);
      } else if (order.split_to_merchant_id && margin > 0) {
        marginClawbackNote = `Margin of ${(margin / 100).toFixed(2)} was paid to the seller in real time via PayFast — recover manually.`;
      }

      await supabase
        .from('distributors')
        .update({
          balance_owed_cents: newBalance,
          margin_payable_cents: newPayable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.distributor_id);

      await supabase.from('distributor_ledger').insert({
        distributor_id: order.distributor_id,
        entry_type: 'return',
        order_id: orderId,
        amount_cents: wholesale,
        balance_after_cents: newBalance,
        note: `Return — order ${order.order_number || orderId}${marginClawbackNote ? ' · ' + marginClawbackNote : ''}`,
      });
    }

    // Mark the order returned.
    await supabase.from('orders').update({ status: 'returned' }).eq('id', orderId);

    // Record the RMA (best-effort — the financial reversal above is the source of truth).
    try {
      let rma = `RMA${Date.now()}`;
      const { data: rmaData } = await supabase.rpc('generate_rma_number');
      if (typeof rmaData === 'string' && rmaData) rma = rmaData;
      await supabase.from('return_requests').insert({
        rma_number: rma,
        order_id: orderId,
        order_number: order.order_number || orderId,
        customer_email: (body?.customerEmail as string) || order.customer_email || 'unknown@jeffy.co.za',
        reason,
        status: 'approved',
        refund_amount_cents: order.total_cents || 0,
        refund_method: refundMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.product_name,
          quantity: i.quantity,
          price: i.unit_price_cents,
        })),
      });
    } catch {
      // non-fatal: the ledger reversal is what matters
    }

    return NextResponse.json({ success: true, orderId, marginClawbackNote });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
