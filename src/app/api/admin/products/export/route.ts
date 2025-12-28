import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // CSV headers
    const headers = [
      'ID', 'SKU', 'Name', 'Slug', 'Description', 'Category ID',
      'Cost Price (R)', 'Selling Price (R)', 'Compare Price (R)',
      'Stock', 'Status', 'Primary Image', '1688 URL', 'Created At'
    ];

    // Convert to CSV rows
    const rows = (products || []).map(p => [
      p.id,
      p.sku || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.slug || '',
      `"${(p.short_description || '').replace(/"/g, '""')}"`,
      p.category_id || '',
      ((p.cost_price_cents || 0) / 100).toFixed(2),
      ((p.selling_price_cents || 0) / 100).toFixed(2),
      ((p.compare_at_price_cents || 0) / 100).toFixed(2),
      p.quantity || 0,
      p.status || 'draft',
      p.primary_image_url || '',
      p.source_1688_url || '',
      p.created_at || ''
    ]);

    // Build CSV string
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
