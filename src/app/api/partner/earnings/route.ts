import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 50/50 profit sharing on profit (selling price - landed cost)
const PARTNER_SHARE = 0.5;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
  }

  // Get partner's zone
  const { data: partner } = await supabase
    .from('zone_partners')
    .select('id, zone_id, user_id, status')
    .eq('id', partnerId)
    .single();

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  // Get all delivered orders in partner's zone
  const { data: deliveries } = await supabase
    .from('orders')
    .select(`
      id, order_number, total_cents, status, delivered_at,
      zone_partner_id,
      order_items (
        quantity, unit_price_cents, total_cents,
        product:products (cost_price_cents)
      )
    `)
    .eq('zone_partner_id', partnerId)
    .eq('status', 'delivered');

  // Calculate earnings for each delivery
  const earnings = (deliveries || []).map(order => {
    let orderProfit = 0;
    
    order.order_items?.forEach((item: any) => {
      const revenue = item.total_cents;
      const cost = (item.product?.cost_price_cents || 0) * item.quantity;
      const profit = revenue - cost;
      orderProfit += profit;
    });

    const partnerEarning = Math.round(orderProfit * PARTNER_SHARE);

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      deliveredAt: order.delivered_at,
      orderTotal: order.total_cents,
      profit: orderProfit,
      partnerEarning,
    };
  });

  // Calculate totals
  const totalEarnings = earnings.reduce((sum, e) => sum + e.partnerEarning, 0);
  const totalDeliveries = earnings.length;
  const totalOrderValue = earnings.reduce((sum, e) => sum + e.orderTotal, 0);

  // Get pending deliveries (assigned but not delivered)
  const { data: pending } = await supabase
    .from('orders')
    .select('id, order_number, total_cents, delivery_address')
    .eq('zone_partner_id', partnerId)
    .eq('status', 'out_for_delivery');

  return NextResponse.json({
    success: true,
    partnerId,
    summary: {
      totalEarnings,
      totalDeliveries,
      totalOrderValue,
      pendingDeliveries: pending?.length || 0,
    },
    earnings,
    pendingOrders: pending || [],
  });
}
