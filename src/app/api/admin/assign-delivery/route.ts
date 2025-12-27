import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { orderId, zonePartnerId } = await request.json();

  if (!orderId || !zonePartnerId) {
    return NextResponse.json(
      { error: 'Order ID and Zone Partner ID required' },
      { status: 400 }
    );
  }

  // Verify zone partner exists and is active
  const { data: partner } = await supabase
    .from('zone_partners')
    .select('id, status, zone_id')
    .eq('id', zonePartnerId)
    .eq('status', 'active')
    .single();

  if (!partner) {
    return NextResponse.json(
      { error: 'Zone partner not found or not active' },
      { status: 404 }
    );
  }

  // Assign delivery to partner
  const { error } = await supabase
    .from('orders')
    .update({
      zone_partner_id: zonePartnerId,
      status: 'out_for_delivery',
      assigned_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Delivery assigned successfully',
  });
}

// Get available zone partners for an order
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  // Get all active zone partners
  const { data: partners } = await supabase
    .from('zone_partners')
    .select(`
      id, zone_id, status,
      zone:zones (name, suburbs)
    `)
    .eq('status', 'active');

  return NextResponse.json({
    success: true,
    partners: partners || [],
  });
}
