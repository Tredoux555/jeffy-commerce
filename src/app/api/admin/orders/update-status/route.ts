import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
