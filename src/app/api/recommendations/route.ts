import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const excludeProduct = params.get('excludeProduct');
    const recentlyViewed = params.get('recentlyViewed')?.split(',').filter(Boolean) || [];
    const cartItems = params.get('cartItems')?.split(',').filter(Boolean) || [];
    const limit = parseInt(params.get('limit') || '4');

    const supabase = await createClient();

    // Simple recommendation logic:
    // 1. If user has recently viewed products, get products from same categories
    // 2. Otherwise, get popular/trending products

    let query = supabase
      .from('products')
      .select('id, name, slug, selling_price_cents, primary_image_url, category_id')
      .eq('status', 'active');

    // Exclude current product and cart items
    if (excludeProduct) {
      query = query.neq('id', excludeProduct);
    }
    if (cartItems.length > 0) {
      query = query.not('id', 'in', `(${cartItems.join(',')})`);
    }

    // Get top selling or newest products
    query = query
      .order('total_sold', { ascending: false })
      .limit(limit);

    const { data: products, error } = await query;

    if (error) throw error;

    const formattedProducts = (products || []).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.selling_price_cents,
      image: p.primary_image_url,
    }));

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (err: any) {
    console.error('Recommendations error:', err);
    return NextResponse.json({ success: false, products: [] });
  }
}
