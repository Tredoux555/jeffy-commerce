import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const supabase = await createAdminClient();

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        subtotal_cents,
        discount_cents,
        shipping_cents,
        total_cents,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_province,
        shipping_postal_code,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Generate CSV
    const headers = [
      'Order Number',
      'Status',
      'Payment Status',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'Province',
      'Postal Code',
      'Subtotal',
      'Discount',
      'Shipping',
      'Total',
      'Created At',
    ];

    const rows = (orders || []).map((order) => [
      order.order_number,
      order.status,
      order.payment_status,
      order.customer_name || '',
      order.customer_email || '',
      order.customer_phone || '',
      `"${(order.shipping_address || '').replace(/"/g, '""')}"`,
      order.shipping_city || '',
      order.shipping_province || '',
      order.shipping_postal_code || '',
      (order.subtotal_cents / 100).toFixed(2),
      (order.discount_cents / 100).toFixed(2),
      (order.shipping_cents / 100).toFixed(2),
      (order.total_cents / 100).toFixed(2),
      new Date(order.created_at).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
