import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { restoreStockForOrder } from '@/lib/stock/restore';

// Customer-facing order cancellation.
//
// Previously the browser wrote `status: 'cancelled'` straight to Supabase via the
// anon client, keyed only on the order id and relying on RLS for authorization.
// That (a) couldn't trigger the server-side stock restore, and (b) trusted a
// guessable identifier. This route replaces that:
//   - ownership proof: order_number + the email used on the order (same model as
//     /api/returns/request) — strictly stronger than "knows the order id".
//   - server-side cancellable-state check (not already paid-out/shipped/cancelled).
//   - flips status to 'cancelled' AND restores stock via the shared, idempotent,
//     status-guarded helper, so cancelled orders don't permanently drain inventory.
//   - uses the service-role client, never the browser anon client.
export const dynamic = 'force-dynamic';

// The states from which a customer may self-cancel. Mirrors the component's
// `cancellableStatuses`. Anything else (shipped, delivered, refunded, returned,
// already cancelled, payment_failed) is refused server-side regardless of input.
const CANCELLABLE_STATUSES = new Set(['pending', 'paid', 'processing']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderNumber = (body?.orderNumber as string)?.trim();
    const email = (body?.email as string)?.trim().toLowerCase();
    const reasonRaw = (body?.reason as string)?.trim();
    const reason = reasonRaw && reasonRaw.length > 0 ? reasonRaw.slice(0, 500) : null;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required.' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_email')
      .eq('order_number', orderNumber)
      .maybeSingle();

    // Verify the email matches the order (when one was captured). Use a generic
    // message either way so we never reveal whether an order number exists.
    const matches =
      !!order &&
      (!order.customer_email || (order.customer_email || '').toLowerCase() === email);
    if (!matches) {
      return NextResponse.json(
        { error: 'We could not find an order with that number and email.' },
        { status: 404 }
      );
    }

    // Already cancelled → treat as success (idempotent) so a double-submit from the
    // UI doesn't surface a scary error, but never re-run stock restore.
    if (order.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        alreadyCancelled: true,
        message: 'This order has already been cancelled.',
      });
    }

    // Refuse to cancel anything past the cancellable window (shipped/delivered/
    // refunded/returned/payment_failed/etc.). Server-authoritative.
    if (!CANCELLABLE_STATUSES.has(order.status)) {
      return NextResponse.json(
        { error: `This order can no longer be cancelled (status: ${order.status}).` },
        { status: 409 }
      );
    }

    // Restore stock BEFORE writing the cancelled status. restoreStockForOrder reads
    // the order's current (pre-update) status as its own idempotency guard and
    // no-ops if the order is already in a restored state (cancelled/refunded/
    // payment_failed), so a repeat call can't double-restore. We mirror exactly how
    // /api/admin/orders/update-status and the PayFast webhook call it.
    try {
      const r = await restoreStockForOrder(supabase, order.id);
      console.log(`Stock restore for order ${order.id} (customer cancel):`, r);
    } catch (e) {
      // Non-fatal: failing to restock must not block the customer's cancellation.
      console.error('Stock restore (non-fatal):', e instanceof Error ? e.message : String(e));
    }

    // Write the cancellation. Guard the update on the order still being in a
    // cancellable status so two concurrent requests can't both "win" — only the
    // first transition out of {pending,paid,processing} writes.
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .in('status', Array.from(CANCELLABLE_STATUSES))
      .select('id, order_number, status')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { error: 'Could not cancel your order. Please try again.' },
        { status: 500 }
      );
    }

    // The guarded update matched no row → someone else changed the status between
    // our read and write. Re-report as not-cancellable rather than claiming success.
    if (!updated) {
      return NextResponse.json(
        { error: 'This order can no longer be cancelled.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: updated.order_number,
      message: 'Your order has been cancelled. Any refund will be processed within 3-5 business days.',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
