import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Restore product stock that was decremented at order creation.
 *
 * Stock is decremented per line in `/api/checkout` *before* payment. If an order
 * is later cancelled or its payment fails, that stock must be put back, otherwise
 * abandoned/cancelled orders permanently drain inventory.
 *
 * Idempotency: the *caller* must only invoke this on a genuine transition INTO a
 * cancelled/failed state — i.e. when the order's current (pre-update) status is
 * NOT already a restored/terminal one. We additionally re-check here and skip if
 * the order is already in a restored state, so repeated webhook deliveries or a
 * double admin click can't double-restore. We use the order's status as the guard
 * (no schema change / no extra column needed).
 *
 * @param supabase  service-role client
 * @param orderId   order whose lines should be restocked
 * @returns         { restored, reason }
 */

// Statuses that mean "stock has been (or should be treated as) given back".
// If an order is already in one of these, we must NOT restore again.
const ALREADY_RESTORED_STATUSES = new Set(['cancelled', 'refunded', 'payment_failed']);

export async function restoreStockForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ restored: boolean; reason?: string }> {
  if (!orderId) return { restored: false, reason: 'no-order-id' };

  // Read the order's current status as the idempotency guard.
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return { restored: false, reason: 'order-not-found' };
  }

  if (ALREADY_RESTORED_STATUSES.has(order.status)) {
    // Already cancelled/refunded/failed → stock was (or will be treated as) restored.
    return { restored: false, reason: 'already-restored' };
  }

  const { data: lines, error: linesErr } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (linesErr || !lines || lines.length === 0) {
    return { restored: false, reason: 'no-lines' };
  }

  // Put stock back per line. Read-then-write is racy in the abstract, but cancel/
  // fail are low-frequency, single-actor events (admin click or one webhook), so a
  // read-modify-write is acceptable and avoids needing a new DB function/migration.
  for (const ln of lines as { product_id: string; quantity: number }[]) {
    if (!ln.product_id || !ln.quantity) continue;
    const { data: prod } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', ln.product_id)
      .single();
    if (!prod) continue;
    await supabase
      .from('products')
      .update({ quantity: (prod.quantity || 0) + ln.quantity })
      .eq('id', ln.product_id);
  }

  return { restored: true };
}
