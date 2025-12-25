import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STATUS_FLOW = ['pending', 'loaded', 'in_transit', 'arrived', 'delivered'];

export async function POST(request: NextRequest) {
  try {
    const { qrCode, partnerId } = await request.json();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 });
    }

    // Find delivery by QR code (tracking number)
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('*, orders(order_number, delivery_address)')
      .eq('qr_code', qrCode)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Check if partner is assigned to this delivery
    if (partnerId && delivery.franchisee_id !== partnerId) {
      return NextResponse.json({ error: 'This delivery is not assigned to you' }, { status: 403 });
    }

    // Get current status index
    const currentIndex = STATUS_FLOW.indexOf(delivery.status);
    
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
      return NextResponse.json({ 
        error: 'Delivery already completed or invalid status',
        delivery 
      }, { status: 400 });
    }

    // Advance to next status
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    const updateData: any = { 
      status: nextStatus,
      updated_at: new Date().toISOString()
    };

    // Add timestamp for delivered status
    if (nextStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', delivery.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Delivery status updated to ${nextStatus}`,
      delivery: {
        ...delivery,
        status: nextStatus
      },
      previousStatus: delivery.status,
      newStatus: nextStatus
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



