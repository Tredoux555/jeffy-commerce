import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { maybeGraduate } from '@/lib/distributors/graduation';
import { checkLowStock } from '@/lib/distributors/low-stock';
import { restoreStockForOrder } from '@/lib/stock/restore';
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

    // Validate source IP. Enforced in production via PAYFAST_ENFORCE_IP=true
    // (left off in sandbox so test posts aren't rejected).
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    if (process.env.PAYFAST_ENFORCE_IP === 'true' && !PAYFAST_IPS.includes(clientIp)) {
      console.error('Invalid PayFast source IP:', clientIp);
      return NextResponse.json({ error: 'Invalid source IP' }, { status: 403 });
    }

    // Validate signature.
    //
    // Fail-CLOSED on the passphrase: PayFast's signature is only meaningful when a
    // passphrase (the shared secret) is mixed into the hash. Without it the hash is
    // computed purely over attacker-known fields and is forgeable. So:
    //   - If PAYFAST_PASSPHRASE is set  → enforce it (current behaviour, now explicit).
    //   - If PAYFAST_PASSPHRASE is unset → keep accepting (so a misconfigured env
    //     doesn't silently break live payments — Tredoux sets envs in Railway) but
    //     log a LOUD warning so the gap is visible. Set the passphrase in Railway to
    //     close this hole.
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    if (!passphrase) {
      console.error(
        '[PAYFAST][SECURITY] PAYFAST_PASSPHRASE is NOT set — the ITN signature is ' +
          'FORGEABLE. Accepting this webhook anyway to avoid breaking live payments. ' +
          'Set PAYFAST_PASSPHRASE in Railway to fail-closed.'
      );
    }
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
      // Amount validation: the amount PayFast says was paid must match the order
      // total we recorded. Without this, a forged/replayed "COMPLETE" (or a real
      // payment for a tampered-down amount) would mark a full-price order as paid.
      // `amount_gross` is in rands (e.g. "149.00"); order.total_cents is in cents.
      const orderTotalCents = Number(order.total_cents);
      const paidCents = Math.round(Number(amountGross) * 100);
      if (!Number.isFinite(paidCents) || !Number.isFinite(orderTotalCents)) {
        console.error(
          `[PAYFAST][SECURITY] Non-numeric amount on order ${orderId} — gross=${amountGross}, total_cents=${order.total_cents}. Rejecting.`
        );
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      // Allow a 1-cent rounding tolerance only.
      if (Math.abs(paidCents - orderTotalCents) > 1) {
        console.error(
          `[PAYFAST][SECURITY] Amount mismatch on order ${orderId}: paid ${paidCents}c but order total is ${orderTotalCents}c. Refusing to mark paid.`
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

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

      // --- Reseller settlement (additive, idempotent, safe pre-migration) ---
      // When the order is routed to a reseller, the central collection settles the
      // wholesale they owed Jeffy, reduces their balance, and decrements their stock.
      try {
        if (order.distributor_id) {
          const { data: alreadySettled } = await supabase
            .from('distributor_ledger')
            .select('id')
            .eq('order_id', orderId)
            .eq('entry_type', 'sale')
            .limit(1);

          if (!alreadySettled || alreadySettled.length === 0) {
            const wholesale = order.jeffy_wholesale_cents || 0;

            const { data: dist } = await supabase
              .from('distributors')
              .select('balance_owed_cents')
              .eq('id', order.distributor_id)
              .single();
            const newBalance = Math.max((dist?.balance_owed_cents || 0) - wholesale, 0);

            await supabase
              .from('distributors')
              .update({ balance_owed_cents: newBalance, updated_at: new Date().toISOString() })
              .eq('id', order.distributor_id);

            await supabase.from('distributor_ledger').insert({
              distributor_id: order.distributor_id,
              entry_type: 'sale',
              order_id: orderId,
              amount_cents: -wholesale,
              balance_after_cents: newBalance,
              note: `Sale settled — order ${order.order_number || orderId}`,
            });

            // Margin handling: if no real-time PayFast split was applied to this order,
            // credit the seller's margin to their withdrawable balance (fallback path).
            const margin = order.seller_margin_cents || 0;
            if (!order.split_to_merchant_id && margin > 0) {
              const { data: dist2 } = await supabase
                .from('distributors')
                .select('margin_payable_cents')
                .eq('id', order.distributor_id)
                .single();
              const newPayable = (dist2?.margin_payable_cents || 0) + margin;
              await supabase
                .from('distributors')
                .update({ margin_payable_cents: newPayable, updated_at: new Date().toISOString() })
                .eq('id', order.distributor_id);
              await supabase.from('distributor_ledger').insert({
                distributor_id: order.distributor_id,
                entry_type: 'margin_credit',
                order_id: orderId,
                amount_cents: margin,
                note: `Margin credited (no PayFast split) — order ${order.order_number || orderId}`,
              });
            }

            // Decrement the reseller's stock-on-hand for each line.
            const { data: lines } = await supabase
              .from('order_items')
              .select('product_id, quantity')
              .eq('order_id', orderId);
            for (const ln of (lines || []) as { product_id: string; quantity: number }[]) {
              const { data: st } = await supabase
                .from('distributor_stock')
                .select('id, qty_on_hand, qty_sold_total')
                .eq('distributor_id', order.distributor_id)
                .eq('product_id', ln.product_id)
                .maybeSingle();
              if (st) {
                await supabase.from('distributor_stock').update({
                  qty_on_hand: Math.max((st.qty_on_hand || 0) - ln.quantity, 0),
                  qty_sold_total: (st.qty_sold_total || 0) + ln.quantity,
                  updated_at: new Date().toISOString(),
                }).eq('id', st.id);
              }
            }
            console.log(`Reseller settlement booked for order ${orderId}`);

            // After settling, check if this seller has earned graduation to buy_upfront,
            // and flag any product that just dropped to a low stock level (best-effort).
            await maybeGraduate(supabase, order.distributor_id);
            await checkLowStock(supabase, order.distributor_id);
          }
        }
      } catch (e) {
        console.error('Reseller settlement (non-fatal):', e instanceof Error ? e.message : String(e));
      }

      // (Old zone-partner auto-assignment removed — orders route via the distributor model only.)

    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
      // Restore the stock that was decremented at order creation BEFORE flipping the
      // status (restoreStockForOrder treats cancelled/refunded/payment_failed as
      // already-restored, so it must run while the order is still in its pre-cancel
      // state to actually put stock back — and is a no-op if called again).
      try {
        const r = await restoreStockForOrder(supabase, orderId);
        console.log(`Stock restore for order ${orderId}:`, r);
      } catch (e) {
        console.error('Stock restore (non-fatal):', e instanceof Error ? e.message : String(e));
      }

      const newStatus = paymentStatus === 'FAILED' ? 'payment_failed' : 'cancelled';
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      console.log(`Order ${orderId} ${newStatus}`);
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
