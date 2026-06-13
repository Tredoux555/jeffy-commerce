import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { restoreStockForOrder } from '@/lib/stock/restore';

// Statuses that mean the order is being cancelled/failed and the stock decremented
// at order creation should be returned to inventory.
const RESTORE_STOCK_STATUSES = new Set(['cancelled', 'refunded', 'payment_failed']);

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // If this transition cancels/fails the order, restore stock BEFORE writing the
    // new status. restoreStockForOrder is idempotent — it reads the order's current
    // (pre-update) status as its guard and no-ops if the order is already in a
    // restored state, so a double-click or repeat call won't double-restore.
    if (status && RESTORE_STOCK_STATUSES.has(status)) {
      try {
        const r = await restoreStockForOrder(supabase, orderId);
        console.log(`Stock restore for order ${orderId} (admin → ${status}):`, r);
      } catch (e) {
        console.error('Stock restore (non-fatal):', e instanceof Error ? e.message : String(e));
      }
    }

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'paid' || status === 'processing') {
        updateData.paid_at = new Date().toISOString();
      }
      if (status === 'out_for_delivery') {
        updateData.shipped_at = new Date().toISOString();
      }
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
    }
    
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
      if (paymentStatus === 'paid' && !updateData.paid_at) {
        updateData.paid_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Update failed' 
    }, { status: 500 });
  }
}
