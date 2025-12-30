import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // 1. Get order by ID, verify status === 'paid'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: `Order status is '${order.status}', must be 'paid'` },
        { status: 400 }
      );
    }

    // 2. Extract postal code from delivery address
    const deliveryAddress = order.delivery_address || '';
    const postalCodeMatch = deliveryAddress.match(/\b(\d{4})\b/);
    const cleanPostalCode = postalCodeMatch ? postalCodeMatch[1] : null;
    
    if (!cleanPostalCode) {
      // No postal code - mark as pending assignment
      await supabase
        .from('orders')
        .update({ 
          status: 'pending_assignment',
          notes: 'No postal code in delivery address'
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: false,
        reason: 'No postal code in delivery address'
      });
    }

    // 3. Query zones WHERE postal_codes contains this postal code
    // Using PostgreSQL array contains operator: @>
    const { data: zones, error: zoneError } = await supabase
      .from('zones')
      .select('*')
      .contains('postal_codes', [cleanPostalCode]);

    if (zoneError) {
      console.error('Zone query error:', zoneError);
      return NextResponse.json(
        { success: false, error: 'Failed to query zones' },
        { status: 500 }
      );
    }

    if (!zones || zones.length === 0) {
      // No zone covers this postal code
      await supabase
        .from('orders')
        .update({ 
          status: 'pending_assignment',
          notes: `No zone found for postal code: ${cleanPostalCode}`
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: false,
        reason: `No zone found for postal code: ${cleanPostalCode}`
      });
    }

    const zone = zones[0];

    // 4. Get active zone_partner for this zone
    const { data: partners, error: partnerError } = await supabase
      .from('zone_partners')
      .select('*')
      .eq('zone_id', zone.id)
      .eq('application_status', 'approved')
      .eq('is_active', true)
      .limit(1);

    if (partnerError) {
      console.error('Partner query error:', partnerError);
      return NextResponse.json(
        { success: false, error: 'Failed to query zone partners' },
        { status: 500 }
      );
    }

    if (!partners || partners.length === 0) {
      // Zone exists but no active partner
      await supabase
        .from('orders')
        .update({ 
          status: 'pending_assignment',
          notes: `No active partner in zone: ${zone.name}`
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: false,
        reason: `No active partner in zone: ${zone.name}`
      });
    }

    const partner = partners[0];

    // 5. Assign order to partner
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        zone_partner_id: partner.id,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to assign order' },
        { status: 500 }
      );
    }

    // 6. TODO: Send WhatsApp notification to partner
    // await fetch('/api/notify/whatsapp', {
    //   method: 'POST',
    //   body: JSON.stringify({ partnerId: partner.id, orderId })
    // });

    return NextResponse.json({
      success: true,
      partnerId: partner.id,
      partnerName: partner.full_legal_name || partner.business_name || 'Unknown',
      zoneName: zone.name,
      postalCode: cleanPostalCode
    });

  } catch (error) {
    console.error('Auto-assign error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



