import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Add tracking number to orders
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { orderIds, trackingNumber, carrier, notes } = await request.json();

  if (!trackingNumber) {
    return NextResponse.json({ error: 'Tracking number required' }, { status: 400 });
  }

  const updates = {
    tracking_number: trackingNumber,
    carrier: carrier || '4PX',
    shipping_notes: notes || null,
    status: 'shipped',
    shipped_at: new Date().toISOString(),
  };

  if (orderIds && Array.isArray(orderIds)) {
    // Update specific orders
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .in('id', orderIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Tracking added' });
}

// Get shipments/batches
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get all orders with tracking grouped by tracking number
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, tracking_number, carrier, status, shipped_at')
    .not('tracking_number', 'is', null)
    .order('shipped_at', { ascending: false });

  // Group by tracking number
  const shipments = new Map<string, any>();
  
  orders?.forEach(order => {
    if (!order.tracking_number) return;
    
    if (shipments.has(order.tracking_number)) {
      shipments.get(order.tracking_number).orders.push(order);
    } else {
      shipments.set(order.tracking_number, {
        trackingNumber: order.tracking_number,
        carrier: order.carrier,
        shippedAt: order.shipped_at,
        orders: [order],
      });
    }
  });

  return NextResponse.json({
    success: true,
    shipments: Array.from(shipments.values()),
  });
}
