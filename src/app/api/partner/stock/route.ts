import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get partner's stock levels
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
  }

  const { data: stock, error } = await supabase
    .from('partner_stock')
    .select(`
      id, quantity, reserved, last_restocked_at,
      product:products (id, name, primary_image_url, sku)
    `)
    .eq('partner_id', partnerId)
    .order('quantity', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate low stock items
  const lowStock = stock?.filter(s => s.quantity <= 3) || [];

  return NextResponse.json({
    success: true,
    stock: stock || [],
    lowStockCount: lowStock.length,
    lowStockItems: lowStock
  });
}

// POST: Update stock (add, deduct, receive shipment)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { partnerId, productId, action, quantity } = await request.json();

  if (!partnerId || !productId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if stock record exists
  const { data: existing } = await supabase
    .from('partner_stock')
    .select('id, quantity')
    .eq('partner_id', partnerId)
    .eq('product_id', productId)
    .single();

  let result;

  if (action === 'receive') {
    // Receiving new shipment
    if (existing) {
      result = await supabase
        .from('partner_stock')
        .update({
          quantity: existing.quantity + (quantity || 10),
          last_restocked_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('partner_stock')
        .insert({
          partner_id: partnerId,
          product_id: productId,
          quantity: quantity || 10,
          last_restocked_at: new Date().toISOString()
        });
    }
  } else if (action === 'deduct') {
    // Deduct for order
    if (!existing || existing.quantity < (quantity || 1)) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }
    result = await supabase
      .from('partner_stock')
      .update({ quantity: existing.quantity - (quantity || 1) })
      .eq('id', existing.id);
  } else if (action === 'set') {
    // Direct set quantity
    if (existing) {
      result = await supabase
        .from('partner_stock')
        .update({ quantity: quantity || 0 })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('partner_stock')
        .insert({
          partner_id: partnerId,
          product_id: productId,
          quantity: quantity || 0
        });
    }
  }

  if (result?.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action, quantity });
}
